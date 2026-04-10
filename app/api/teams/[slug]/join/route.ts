import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';

/** POST /api/teams/[slug]/join  — join a public team */
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

  const { rows: [team] } = await pool.query<{
    id: string;
    is_public: boolean;
    max_members: number;
    member_count: number;
  }>(
    `SELECT t.id, t.is_public, t.max_members,
            COUNT(tm.id)::INT AS member_count
     FROM teams t
     LEFT JOIN team_members tm ON tm.team_id = t.id
     WHERE t.slug = $1
     GROUP BY t.id`,
    [slug],
  );
  if (!team) return NextResponse.json({ error: 'Team not found' }, { status: 404 });
  if (!team.is_public) return NextResponse.json({ error: 'Team is private' }, { status: 403 });
  if (team.member_count >= team.max_members) {
    return NextResponse.json({ error: 'Team is full' }, { status: 409 });
  }

  try {
    await pool.query(
      `INSERT INTO team_members (team_id, user_id, role)
       VALUES ($1, $2, 'member')
       ON CONFLICT DO NOTHING`,
      [team.id, user.id],
    );
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Already a member' }, { status: 409 });
  }
}
