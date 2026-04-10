import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';

interface DeployBody {
  templateSlug: string;
  name: string;
}

/** GET /api/environments  — list the authenticated user's environments */
export async function GET() {
  const { userId: clerkId } = await auth();
  if (!clerkId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { rows: [user] } = await pool.query<{ id: string }>(
    'SELECT id FROM users WHERE clerk_id = $1',
    [clerkId],
  );
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  const { rows } = await pool.query(
    `SELECT
       ue.id,
       ue.name,
       ue.status,
       ue.score,
       ue.deployed_at,
       ue.stopped_at,
       ue.created_at,
       et.slug   AS template_slug,
       et.name   AS template_name,
       jsonb_array_length(ue.topology->'nodes') AS node_count
     FROM user_environments ue
     LEFT JOIN environment_templates et ON et.id = ue.template_id
     WHERE ue.user_id = $1
     ORDER BY ue.created_at DESC`,
    [user.id],
  );

  return NextResponse.json({ environments: rows });
}

/** POST /api/environments  — deploy a new environment from a template */
export async function POST(req: Request) {
  const { userId: clerkId } = await auth();
  if (!clerkId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  let body: DeployBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { templateSlug, name } = body;
  if (!templateSlug || !name?.trim()) {
    return NextResponse.json({ error: 'templateSlug and name are required' }, { status: 400 });
  }

  const { rows: [user] } = await pool.query<{ id: string }>(
    'SELECT id FROM users WHERE clerk_id = $1',
    [clerkId],
  );
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  const { rows: [template] } = await pool.query<{
    id: string;
    topology: object;
  }>(
    'SELECT id, topology FROM environment_templates WHERE slug = $1',
    [templateSlug],
  );
  if (!template) return NextResponse.json({ error: 'Template not found' }, { status: 404 });

  // Clone topology and set all node statuses to 'online'
  const topology = JSON.parse(JSON.stringify(template.topology));

  const { rows: [env] } = await pool.query(
    `INSERT INTO user_environments
       (user_id, template_id, name, status, topology, deployed_at)
     VALUES ($1, $2, $3, 'running', $4, now())
     RETURNING id, name, status, deployed_at, created_at`,
    [user.id, template.id, name.trim(), topology],
  );

  return NextResponse.json({ environment: env }, { status: 201 });
}
