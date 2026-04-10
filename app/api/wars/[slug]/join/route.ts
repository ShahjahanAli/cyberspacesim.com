import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';

/**
 * POST /api/wars/[slug]/join
 * The defending participant accepts the war challenge.
 * If all participants are 'accepted', the war transitions to 'active' and round 1 is created.
 */
export async function POST(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { userId: clerkId } = await auth();
  if (!clerkId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { slug } = await params;

  const { rows: [user] } = await pool.query<{ id: string }>(
    'SELECT id FROM users WHERE clerk_id = $1',
    [clerkId],
  );
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  const { rows: [war] } = await pool.query<{ id: string; status: string; max_rounds: number }>(
    'SELECT id, status, max_rounds FROM wars WHERE slug = $1',
    [slug],
  );
  if (!war) return NextResponse.json({ error: 'War not found' }, { status: 404 });
  if (war.status !== 'pending') {
    return NextResponse.json({ error: 'War is not pending' }, { status: 409 });
  }

  // Find a pending participant entry for this user (individual) or their team
  const { rows: [myTeam] } = await pool.query<{ team_id: string }>(
    `SELECT team_id FROM team_members WHERE user_id = $1 ORDER BY joined_at LIMIT 1`,
    [user.id],
  );

  const { rows: [participant] } = await pool.query<{ id: string }>(
    `SELECT id FROM war_participants
     WHERE war_id = $1
       AND status = 'pending'
       AND (user_id = $2 OR team_id = $3)`,
    [war.id, user.id, myTeam?.team_id ?? null],
  );
  if (!participant) {
    return NextResponse.json({ error: 'No pending invitation found for you' }, { status: 404 });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Accept the invitation
    await client.query(
      `UPDATE war_participants
       SET status = 'accepted', joined_at = now()
       WHERE id = $1`,
      [participant.id],
    );

    // Check if all participants have now accepted
    const { rows: [{ pending }] } = await client.query<{ pending: string }>(
      `SELECT COUNT(*) AS pending FROM war_participants
       WHERE war_id = $1 AND status = 'pending'`,
      [war.id],
    );

    if (Number(pending) === 0) {
      // Start the war
      await client.query(
        `UPDATE wars
         SET status = 'active', starts_at = now()
         WHERE id = $1`,
        [war.id],
      );

      // Create round 1
      await client.query(
        `INSERT INTO war_rounds (war_id, round_number, status, started_at)
         VALUES ($1, 1, 'active', now())`,
        [war.id],
      );
    }

    await client.query('COMMIT');
    return NextResponse.json({ ok: true, warStarted: Number(pending) === 0 });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('[wars join]', err);
    return NextResponse.json({ error: 'Failed to join war' }, { status: 500 });
  } finally {
    client.release();
  }
}
