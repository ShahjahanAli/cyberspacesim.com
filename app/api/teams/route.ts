import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';

interface CreateTeamBody {
  name: string;
  description?: string;
}

function slugify(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

/** GET /api/teams?page=1  — list public teams with member count */
export async function GET(req: Request) {
  const { userId: clerkId } = await auth();
  if (!clerkId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const page  = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10));
  const limit = 20;
  const offset = (page - 1) * limit;

  const { rows } = await pool.query(
    `SELECT
       t.id,
       t.slug,
       t.name,
       t.description,
       t.logo_url,
       t.total_xp,
       t.is_public,
       t.max_members,
       t.created_at,
       COUNT(tm.id)::INT AS member_count
     FROM teams t
     LEFT JOIN team_members tm ON tm.team_id = t.id
     WHERE t.is_public = true
     GROUP BY t.id
     ORDER BY t.total_xp DESC, t.created_at DESC
     LIMIT $1 OFFSET $2`,
    [limit, offset],
  );

  return NextResponse.json({ teams: rows, page });
}

/** POST /api/teams  — { name, description? } create a new team */
export async function POST(req: Request) {
  const { userId: clerkId } = await auth();
  if (!clerkId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  let body: CreateTeamBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const name = body.name?.trim();
  if (!name) return NextResponse.json({ error: 'name is required' }, { status: 400 });

  const { rows: [user] } = await pool.query<{ id: string }>(
    'SELECT id FROM users WHERE clerk_id = $1',
    [clerkId],
  );
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  const baseSlug = slugify(name);
  if (!baseSlug) return NextResponse.json({ error: 'Invalid team name' }, { status: 400 });

  // Ensure slug uniqueness
  const { rows: existing } = await pool.query<{ slug: string }>(
    "SELECT slug FROM teams WHERE slug LIKE $1 || '%'",
    [baseSlug],
  );
  const slug = existing.length === 0 ? baseSlug : `${baseSlug}-${Date.now()}`;

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const { rows: [team] } = await client.query(
      `INSERT INTO teams (slug, name, description, owner_id)
       VALUES ($1, $2, $3, $4)
       RETURNING id, slug, name, description, total_xp, created_at`,
      [slug, name, body.description?.trim() ?? null, user.id],
    );

    await client.query(
      `INSERT INTO team_members (team_id, user_id, role)
       VALUES ($1, $2, 'owner')`,
      [team.id, user.id],
    );

    await client.query('COMMIT');
    return NextResponse.json({ team }, { status: 201 });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('[teams POST]', err);
    return NextResponse.json({ error: 'Failed to create team' }, { status: 500 });
  } finally {
    client.release();
  }
}
