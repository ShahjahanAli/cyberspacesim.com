import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';

interface EventBody {
  eventType: string;
  pointsAwarded?: number;
  roundNumber?: number;
  payload?: Record<string, unknown>;
}

/**
 * POST /api/wars/[slug]/events
 * Submit an event in an active war (flag capture, exploit success, etc.)
 * Automatically advances rounds when the current round ends.
 */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { userId: clerkId } = await auth();
  if (!clerkId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { slug } = await params;

  let body: EventBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { eventType, pointsAwarded = 0, payload = {} } = body;
  if (!eventType) return NextResponse.json({ error: 'eventType is required' }, { status: 400 });

  const { rows: [user] } = await pool.query<{ id: string }>(
    'SELECT id FROM users WHERE clerk_id = $1',
    [clerkId],
  );
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  const { rows: [war] } = await pool.query<{
    id: string;
    status: string;
    max_rounds: number;
  }>(
    'SELECT id, status, max_rounds FROM wars WHERE slug = $1',
    [slug],
  );
  if (!war) return NextResponse.json({ error: 'War not found' }, { status: 404 });
  if (war.status !== 'active') {
    return NextResponse.json({ error: 'War is not active' }, { status: 409 });
  }

  // Find caller's participant entry (individual or via team)
  const { rows: [myTeam] } = await pool.query<{ team_id: string }>(
    `SELECT team_id FROM team_members WHERE user_id = $1 ORDER BY joined_at LIMIT 1`,
    [user.id],
  );

  const { rows: [participant] } = await pool.query<{ id: string; side: string }>(
    `SELECT id, side FROM war_participants
     WHERE war_id = $1 AND status = 'accepted'
       AND (user_id = $2 OR team_id = $3)`,
    [war.id, user.id, myTeam?.team_id ?? null],
  );
  if (!participant) {
    return NextResponse.json({ error: 'You are not a participant in this war' }, { status: 403 });
  }

  // Get active round
  const { rows: [round] } = await pool.query<{ id: string; round_number: number }>(
    `SELECT id, round_number FROM war_rounds
     WHERE war_id = $1 AND status = 'active'
     ORDER BY round_number DESC LIMIT 1`,
    [war.id],
  );

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Insert event
    const { rows: [event] } = await client.query(
      `INSERT INTO war_events (war_id, round_id, participant_id, event_type, points_awarded, payload)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [war.id, round?.id ?? null, participant.id, eventType, pointsAwarded, payload],
    );

    // Update participant score
    if (pointsAwarded !== 0) {
      await client.query(
        'UPDATE war_participants SET score = score + $2 WHERE id = $1',
        [participant.id, pointsAwarded],
      );
    }

    // Check if current round is complete (flag_captured ends the round)
    let roundAdvanced = false;
    if (eventType === 'flag_captured' && round) {
      await client.query(
        `UPDATE war_rounds
         SET status = 'completed', ended_at = now(), winner_participant_id = $2
         WHERE id = $1`,
        [round.id, participant.id],
      );

      const nextRoundNumber = round.round_number + 1;
      if (nextRoundNumber <= war.max_rounds) {
        await client.query(
          `INSERT INTO war_rounds (war_id, round_number, status, started_at)
           VALUES ($1, $2, 'active', now())`,
          [war.id, nextRoundNumber],
        );
        roundAdvanced = true;
      } else {
        // War over — determine winner by score
        await client.query(
          `UPDATE wars SET status = 'completed', ends_at = now() WHERE id = $1`,
          [war.id],
        );
      }
    }

    await client.query('COMMIT');
    return NextResponse.json({ event, roundAdvanced }, { status: 201 });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('[wars events]', err);
    return NextResponse.json({ error: 'Failed to record event' }, { status: 500 });
  } finally {
    client.release();
  }
}
