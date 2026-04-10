import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { createHash } from 'crypto';
import { pool } from '@/lib/db';

interface SubmitBody {
  flag: string;
}

/** POST /api/challenges/[id]/submit  — { flag: string } */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { userId: clerkId } = await auth();
  if (!clerkId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id: challengeId } = await params;

  let body: SubmitBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const flag = body.flag?.trim();
  if (!flag) return NextResponse.json({ error: 'flag is required' }, { status: 400 });

  // Fetch challenge
  const { rows: [challenge] } = await pool.query<{
    id: string;
    points: number;
    flag_hash: string | null;
    max_attempts: number | null;
    hint_cost: number;
  }>(
    'SELECT id, points, flag_hash, max_attempts, hint_cost FROM challenges WHERE id = $1',
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
    status: string;
    attempts: number;
    hints_used: number;
  }>(
    `INSERT INTO user_challenge_progress (user_id, challenge_id, status, started_at)
     VALUES ($1, $2, 'in_progress', now())
     ON CONFLICT (user_id, challenge_id) DO UPDATE
       SET updated_at = now()
     RETURNING *`,
    [user.id, challengeId],
  );

  // Already completed?
  if (progress.status === 'completed') {
    return NextResponse.json({ correct: true, alreadyCompleted: true });
  }

  // Max attempts exceeded?
  if (challenge.max_attempts !== null && progress.attempts >= challenge.max_attempts) {
    return NextResponse.json({ correct: false, error: 'Maximum attempts reached' }, { status: 400 });
  }

  // Verify flag — compute SHA-256 of submitted flag and compare
  const submittedHash = createHash('sha256').update(flag).digest('hex');
  const isCorrect = challenge.flag_hash !== null && submittedHash === challenge.flag_hash;

  if (isCorrect) {
    // Deduct hint cost from earned score
    const earned = Math.max(
      0,
      challenge.points - progress.hints_used * challenge.hint_cost,
    );

    await pool.query(
      `UPDATE user_challenge_progress
       SET status       = 'completed',
           attempts     = attempts + 1,
           score        = $3,
           completed_at = now(),
           flag_submitted = $4
       WHERE id = $1 AND user_id = $2`,
      [progress.id, user.id, earned, flag],
    );

    // Add XP to user
    await pool.query(
      'UPDATE users SET total_xp = total_xp + $2, last_active = now() WHERE id = $1',
      [user.id, earned],
    );

    return NextResponse.json({ correct: true, score: earned });
  }

  // Wrong — increment attempts, possibly mark failed
  const newAttempts = progress.attempts + 1;
  const newStatus =
    challenge.max_attempts !== null && newAttempts >= challenge.max_attempts
      ? 'failed'
      : 'in_progress';

  await pool.query(
    `UPDATE user_challenge_progress
     SET attempts       = $3,
         status         = $4,
         flag_submitted = $5
     WHERE id = $1 AND user_id = $2`,
    [progress.id, user.id, newAttempts, newStatus, flag],
  );

  return NextResponse.json({
    correct: false,
    attemptsUsed: newAttempts,
    maxAttempts: challenge.max_attempts,
    status: newStatus,
  });
}
