import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { query } from "@/lib/db";

/**
 * POST /api/users/sync
 * Upserts the currently authenticated Clerk user into our PostgreSQL users table.
 * Call this once after sign-in / sign-up (e.g. from a server action or useEffect).
 */
export async function POST() {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }

  const clerkUser = await currentUser();
  if (!clerkUser) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const email =
    clerkUser.emailAddresses[0]?.emailAddress ?? null;
  const username =
    clerkUser.username ??
    clerkUser.firstName ??
    null;
  const avatarUrl = clerkUser.imageUrl ?? null;

  const { rows } = await query<{ id: string }>(
    `INSERT INTO users (clerk_id, username, email, avatar_url)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (clerk_id) DO UPDATE
       SET username   = EXCLUDED.username,
           email      = EXCLUDED.email,
           avatar_url = EXCLUDED.avatar_url,
           updated_at = now()
     RETURNING id`,
    [userId, username, email, avatarUrl]
  );

  return NextResponse.json({ id: rows[0]?.id }, { status: 200 });
}
