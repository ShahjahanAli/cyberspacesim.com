import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';

/** POST /api/challenges/[id]/hint  — returns next unused hint, charges hint_cost */
export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { userId: clerkId } = await auth();
  if (!clerkId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id: challengeId } = await params;

  const { rows: [challenge] } = await pool.query<{
    hints: string[];
    hint_cost: number;
  }>(
    'SELECT hints, hint_cost FROM challenges WHERE id = $1',
    [challengeId],
  );
  if (!challenge) return NextResponse.json({ error: 'Challenge not found' }, { status: 404 });

  const { rows: [user] } = await pool.query<{ id: string }>(
    'SELECT id FROM users WHERE clerk_id = $1',
    [clerkId],
  );
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  // Fetch or create progress
  const { rows: [progress] } = await pool.query<{
    id: string;
    hints_used: number;
    status: string;
  }>(
    `INSERT INTO user_challenge_progress (user_id, challenge_id, status, started_at)
     VALUES ($1, $2, 'in_progress', now())
     ON CONFLICT (user_id, challenge_id) DO UPDATE SET updated_at = now()
     RETURNING *`,
    [user.id, challengeId],
  );

  if (progress.status === 'completed') {
    return NextResponse.json({ error: 'Challenge already completed' }, { status: 400 });
  }

  if (progress.hints_used >= challenge.hints.length) {
    return NextResponse.json({ error: 'No more hints available' }, { status: 400 });
  }

  const hint = challenge.hints[progress.hints_used];

  await pool.query(
    `UPDATE user_challenge_progress
     SET hints_used = hints_used + 1
     WHERE id = $1`,
    [progress.id],
  );

  return NextResponse.json({
    hint,
    hintsUsed: progress.hints_used + 1,
    totalHints: challenge.hints.length,
    costPerHint: challenge.hint_cost,
  });
}
