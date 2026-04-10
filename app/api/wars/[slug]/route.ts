import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';

type Params = { params: Promise<{ slug: string }> };

/** GET /api/wars/[slug]  — war detail with participants, rounds, and recent events */
export async function GET(_req: Request, { params }: Params) {
  const { userId: clerkId } = await auth();
  if (!clerkId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { slug } = await params;

  const { rows: [war] } = await pool.query(
    `SELECT w.*, s.slug AS scenario_slug, s.title AS scenario_title
     FROM wars w
     LEFT JOIN scenarios s ON s.id = w.scenario_id
     WHERE w.slug = $1`,
    [slug],
  );
  if (!war) return NextResponse.json({ error: 'War not found' }, { status: 404 });

  const { rows: participants } = await pool.query(
    `SELECT
       wp.id,
       wp.side,
       wp.status,
       wp.score,
       wp.joined_at,
       t.name   AS team_name,
       t.slug   AS team_slug,
       u.id     AS user_id,
       COALESCE(u.username, split_part(u.email,'@',1)) AS user_display_name,
       u.avatar_url AS user_avatar
     FROM war_participants wp
     LEFT JOIN teams t ON t.id = wp.team_id
     LEFT JOIN users u ON u.id = wp.user_id
     WHERE wp.war_id = $1
     ORDER BY wp.score DESC`,
    [war.id],
  );

  const { rows: rounds } = await pool.query(
    `SELECT id, round_number, status, objective, started_at, ended_at,
            winner_participant_id
     FROM war_rounds
     WHERE war_id = $1
     ORDER BY round_number ASC`,
    [war.id],
  );

  const { rows: events } = await pool.query(
    `SELECT we.id, we.event_type, we.points_awarded, we.payload, we.created_at,
            wp.side
     FROM war_events we
     JOIN war_participants wp ON wp.id = we.participant_id
     WHERE we.war_id = $1
     ORDER BY we.created_at DESC
     LIMIT 50`,
    [war.id],
  );

  return NextResponse.json({ war, participants, rounds, events });
}
