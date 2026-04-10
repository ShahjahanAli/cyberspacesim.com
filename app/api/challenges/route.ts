import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';

/** GET /api/challenges?scenarioSlug=xxx  — list challenges with user progress */
export async function GET(req: Request) {
  const { userId: clerkId } = await auth();
  if (!clerkId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const scenarioSlug = searchParams.get('scenarioSlug');

  const { rows: [user] } = await pool.query<{ id: string }>(
    'SELECT id FROM users WHERE clerk_id = $1',
    [clerkId],
  );
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  let queryText = `
    SELECT
      c.id,
      c.slug,
      c.title,
      c.description,
      c.type,
      c.difficulty,
      c.points,
      c.hints,
      c.hint_cost,
      c.max_attempts,
      c.time_limit_s,
      c.order_index,
      c.is_required,
      -- user progress (may be null if not started)
      ucp.status,
      ucp.attempts,
      ucp.hints_used,
      ucp.score          AS earned_score,
      ucp.started_at,
      ucp.completed_at
    FROM challenges c
    JOIN scenarios s ON s.id = c.scenario_id
    LEFT JOIN user_challenge_progress ucp
      ON ucp.challenge_id = c.id AND ucp.user_id = $1
  `;
  const params: unknown[] = [user.id];

  if (scenarioSlug) {
    params.push(scenarioSlug);
    queryText += ` WHERE s.slug = $${params.length}`;
  }
  queryText += ' ORDER BY c.order_index ASC';

  const { rows } = await pool.query(queryText, params);
  return NextResponse.json({ challenges: rows });
}
