import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';

/** POST /api/challenges/[id]/start */
export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { userId: clerkId } = await auth();
  if (!clerkId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id: challengeId } = await params;

  const { rows: [user] } = await pool.query<{ id: string }>(
    'SELECT id FROM users WHERE clerk_id = $1',
    [clerkId],
  );
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  // Upsert progress — do not overwrite a completed challenge
  const { rows: [progress] } = await pool.query(
    `INSERT INTO user_challenge_progress
       (user_id, challenge_id, status, started_at)
     VALUES ($1, $2, 'in_progress', now())
     ON CONFLICT (user_id, challenge_id) DO UPDATE SET
       status     = CASE WHEN user_challenge_progress.status = 'completed'
                         THEN 'completed'
                         ELSE 'in_progress' END,
       started_at = COALESCE(user_challenge_progress.started_at, now())
     RETURNING *`,
    [user.id, challengeId],
  );

  return NextResponse.json({ progress });
}
