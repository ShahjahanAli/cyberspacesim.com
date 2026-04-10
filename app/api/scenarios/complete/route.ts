import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { query } from "@/lib/db";

interface CompleteBody {
  scenarioSlug: string;
  score: number;       // 0–100
  timeTakenS?: number; // optional elapsed seconds
}

/**
 * POST /api/scenarios/complete
 * Records (or updates) a user's scenario completion.
 * Body: { scenarioSlug: string, score: number, timeTakenS?: number }
 */
export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }

  let body: CompleteBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { scenarioSlug, score, timeTakenS } = body;

  if (
    typeof scenarioSlug !== "string" ||
    scenarioSlug.trim() === "" ||
    typeof score !== "number" ||
    score < 0 ||
    score > 100
  ) {
    return NextResponse.json(
      { error: "scenarioSlug (string) and score (0–100) are required" },
      { status: 422 }
    );
  }

  // Resolve user row
  const userRes = await query<{ id: string }>(
    `SELECT id FROM users WHERE clerk_id = $1`,
    [userId]
  );
  if (!userRes.rows[0]) {
    return NextResponse.json(
      { error: "User not found — call /api/users/sync first" },
      { status: 404 }
    );
  }
  const dbUserId = userRes.rows[0].id;

  // Resolve scenario row
  const scenarioRes = await query<{ id: string }>(
    `SELECT id FROM scenarios WHERE slug = $1`,
    [scenarioSlug.trim()]
  );
  if (!scenarioRes.rows[0]) {
    return NextResponse.json(
      { error: `Scenario '${scenarioSlug}' not found` },
      { status: 404 }
    );
  }
  const scenarioId = scenarioRes.rows[0].id;

  // Upsert completion (keep highest score)
  const { rows } = await query<{ id: string; score: number }>(
    `INSERT INTO scenario_completions (user_id, scenario_id, score, time_taken_s)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (user_id, scenario_id) DO UPDATE
       SET score        = GREATEST(scenario_completions.score, EXCLUDED.score),
           time_taken_s = CASE
             WHEN EXCLUDED.score >= scenario_completions.score THEN EXCLUDED.time_taken_s
             ELSE scenario_completions.time_taken_s
           END,
           completed_at = now()
     RETURNING id, score`,
    [dbUserId, scenarioId, score, timeTakenS ?? null]
  );

  return NextResponse.json({ completion: rows[0] }, { status: 200 });
}
