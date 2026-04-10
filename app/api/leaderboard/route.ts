import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { query } from "@/lib/db";

interface LeaderboardRow {
  id: string;
  clerk_id: string;
  display_name: string;
  avatar_url: string | null;
  scenarios_completed: number;
  total_score: number;
  avg_score: number;
  total_xp: number;
  last_active: string | null;
}

/**
 * GET /api/leaderboard?limit=50
 * Returns the top N users from the leaderboard view.
 */
export async function GET(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const limit = Math.min(parseInt(searchParams.get("limit") ?? "50", 10), 200);

  const { rows } = await query<LeaderboardRow>(
    `SELECT * FROM leaderboard LIMIT $1`,
    [limit]
  );

  return NextResponse.json({ data: rows }, { status: 200 });
}
