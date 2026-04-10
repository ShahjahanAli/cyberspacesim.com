import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';

interface CreateWarBody {
  title: string;
  description?: string;
  type: 'team_vs_team' | 'individual_vs_individual' | 'team_vs_individual';
  mode?: 'ctf' | 'attack_defense' | 'king_of_the_hill';
  scenarioSlug?: string;
  maxRounds?: number;
  // For team wars:
  opponentTeamSlug?: string;
  // For individual wars:
  opponentClerkId?: string;
}

function slugify(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

/** GET /api/wars?status=pending  — list wars */
export async function GET(req: Request) {
  const { userId: clerkId } = await auth();
  if (!clerkId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status');

  let sql = `
    SELECT
      w.id, w.slug, w.title, w.type, w.mode, w.status,
      w.max_rounds, w.starts_at, w.ends_at, w.created_at,
      s.slug AS scenario_slug,
      s.title AS scenario_title,
      COUNT(DISTINCT wp.id)::INT AS participant_count
    FROM wars w
    LEFT JOIN scenarios s ON s.id = w.scenario_id
    LEFT JOIN war_participants wp ON wp.war_id = w.id
  `;
  const params: string[] = [];

  if (status) {
    params.push(status);
    sql += ` WHERE w.status = $1`;
  }

  sql += ' GROUP BY w.id, s.slug, s.title ORDER BY w.created_at DESC LIMIT 50';

  const { rows } = await pool.query(sql, params);
  return NextResponse.json({ wars: rows });
}

/** POST /api/wars  — create a war and add both participants */
export async function POST(req: Request) {
  const { userId: clerkId } = await auth();
  if (!clerkId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  let body: CreateWarBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { title, type, mode = 'ctf', scenarioSlug, maxRounds = 5 } = body;
  if (!title?.trim() || !type) {
    return NextResponse.json({ error: 'title and type are required' }, { status: 400 });
  }

  const { rows: [creator] } = await pool.query<{ id: string }>(
    'SELECT id FROM users WHERE clerk_id = $1',
    [clerkId],
  );
  if (!creator) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  // Resolve scenario
  let scenarioId: string | null = null;
  if (scenarioSlug) {
    const { rows: [s] } = await pool.query<{ id: string }>(
      'SELECT id FROM scenarios WHERE slug = $1',
      [scenarioSlug],
    );
    scenarioId = s?.id ?? null;
  }

  const baseSlug = `${slugify(title)}-${Date.now()}`;

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Create war
    const { rows: [war] } = await client.query(
      `INSERT INTO wars (slug, title, description, type, mode, scenario_id, max_rounds, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [baseSlug, title.trim(), body.description?.trim() ?? null, type, mode, scenarioId, maxRounds, creator.id],
    );

    // Add challenger (creator)
    let challengerTeamId: string | null = null;
    let challengerUserId: string | null = null;

    if (type === 'team_vs_team' || type === 'team_vs_individual') {
      // Creator must belong to a team — use their first team
      const { rows: [tm] } = await client.query<{ team_id: string }>(
        `SELECT team_id FROM team_members WHERE user_id = $1 ORDER BY joined_at LIMIT 1`,
        [creator.id],
      );
      if (!tm) throw new Error('Creator has no team');
      challengerTeamId = tm.team_id;
    } else {
      challengerUserId = creator.id;
    }

    await client.query(
      `INSERT INTO war_participants (war_id, team_id, user_id, side, status)
       VALUES ($1, $2, $3, 'challenger', 'accepted')`,
      [war.id, challengerTeamId, challengerUserId],
    );

    // Add opponent (starts as 'pending')
    if (body.opponentTeamSlug) {
      const { rows: [oppTeam] } = await client.query<{ id: string }>(
        'SELECT id FROM teams WHERE slug = $1',
        [body.opponentTeamSlug],
      );
      if (!oppTeam) throw new Error(`Team '${body.opponentTeamSlug}' not found`);
      await client.query(
        `INSERT INTO war_participants (war_id, team_id, side, status)
         VALUES ($1, $2, 'defender', 'pending')`,
        [war.id, oppTeam.id],
      );
    } else if (body.opponentClerkId) {
      const { rows: [oppUser] } = await client.query<{ id: string }>(
        'SELECT id FROM users WHERE clerk_id = $1',
        [body.opponentClerkId],
      );
      if (!oppUser) throw new Error(`User '${body.opponentClerkId}' not found`);
      await client.query(
        `INSERT INTO war_participants (war_id, user_id, side, status)
         VALUES ($1, $2, 'defender', 'pending')`,
        [war.id, oppUser.id],
      );
    }

    await client.query('COMMIT');
    return NextResponse.json({ war }, { status: 201 });
  } catch (err) {
    await client.query('ROLLBACK');
    const message = err instanceof Error ? err.message : 'Failed to create war';
    return NextResponse.json({ error: message }, { status: 500 });
  } finally {
    client.release();
  }
}
