import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';

type Params = { params: Promise<{ slug: string }> };

/** GET /api/teams/[slug]  — team detail with member list */
export async function GET(_req: Request, { params }: Params) {
  const { userId: clerkId } = await auth();
  if (!clerkId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { slug } = await params;

  const { rows: [team] } = await pool.query(
    `SELECT
       t.*,
       u.username   AS owner_username,
       u.avatar_url AS owner_avatar
     FROM teams t
     JOIN users u ON u.id = t.owner_id
     WHERE t.slug = $1`,
    [slug],
  );
  if (!team) return NextResponse.json({ error: 'Team not found' }, { status: 404 });

  const { rows: members } = await pool.query(
    `SELECT
       u.id,
       COALESCE(u.username, split_part(u.email,'@',1)) AS display_name,
       u.avatar_url,
       u.total_xp,
       tm.role,
       tm.joined_at
     FROM team_members tm
     JOIN users u ON u.id = tm.user_id
     WHERE tm.team_id = $1
     ORDER BY tm.role = 'owner' DESC, tm.role = 'admin' DESC, u.total_xp DESC`,
    [team.id],
  );

  return NextResponse.json({ team, members });
}
