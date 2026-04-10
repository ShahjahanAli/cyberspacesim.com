import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';

type Params = { params: Promise<{ id: string }> };

/** GET /api/environments/[id]  — full environment with topology */
export async function GET(_req: Request, { params }: Params) {
  const { userId: clerkId } = await auth();
  if (!clerkId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;

  const { rows: [user] } = await pool.query<{ id: string }>(
    'SELECT id FROM users WHERE clerk_id = $1',
    [clerkId],
  );
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  const { rows: [env] } = await pool.query(
    `SELECT
       ue.*,
       et.slug AS template_slug,
       et.name AS template_name
     FROM user_environments ue
     LEFT JOIN environment_templates et ON et.id = ue.template_id
     WHERE ue.id = $1 AND ue.user_id = $2`,
    [id, user.id],
  );
  if (!env) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  // Recent events
  const { rows: events } = await pool.query(
    `SELECT id, event_type, target_node_key, success, points_delta, payload, created_at
     FROM environment_events
     WHERE environment_id = $1
     ORDER BY created_at DESC
     LIMIT 50`,
    [id],
  );

  return NextResponse.json({ environment: env, events });
}

/** DELETE /api/environments/[id]  — stop environment */
export async function DELETE(_req: Request, { params }: Params) {
  const { userId: clerkId } = await auth();
  if (!clerkId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;

  const { rows: [user] } = await pool.query<{ id: string }>(
    'SELECT id FROM users WHERE clerk_id = $1',
    [clerkId],
  );
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  const { rowCount } = await pool.query(
    `UPDATE user_environments
     SET status = 'stopped', stopped_at = now()
     WHERE id = $1 AND user_id = $2 AND status != 'stopped'`,
    [id, user.id],
  );

  if (!rowCount) return NextResponse.json({ error: 'Not found or already stopped' }, { status: 404 });

  return NextResponse.json({ ok: true });
}
