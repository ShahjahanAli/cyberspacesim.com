import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';

interface EventBody {
  eventType: string;
  nodeKey?: string;
  payload?: Record<string, unknown>;
}

/**
 * POST /api/environments/[id]/events
 * Emit an event in a running environment (scan, exploit, patch, etc.)
 * Optionally mutates the target node's status inside topology JSONB.
 */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { userId: clerkId } = await auth();
  if (!clerkId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id: envId } = await params;

  let body: EventBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { eventType, nodeKey, payload = {} } = body;
  if (!eventType) return NextResponse.json({ error: 'eventType is required' }, { status: 400 });

  const { rows: [user] } = await pool.query<{ id: string }>(
    'SELECT id FROM users WHERE clerk_id = $1',
    [clerkId],
  );
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  // Verify environment belongs to user and is running
  const { rows: [env] } = await pool.query<{ id: string; topology: { nodes: Array<{ key: string; status: string }> } }>(
    'SELECT id, topology FROM user_environments WHERE id = $1 AND user_id = $2',
    [envId, user.id],
  );
  if (!env) return NextResponse.json({ error: 'Environment not found' }, { status: 404 });

  // Determine if the action succeeded (simplified simulation logic)
  const success = eventType !== 'exploit' || Math.random() > 0.25; // 75% exploit success rate
  const pointsDelta = success ? getPointsDelta(eventType) : 0;

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Insert event
    const { rows: [event] } = await client.query(
      `INSERT INTO environment_events
         (environment_id, user_id, event_type, target_node_key, success, points_delta, payload)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [envId, user.id, eventType, nodeKey ?? null, success, pointsDelta, payload],
    );

    // If node targeted, mutate its status in topology JSONB
    if (nodeKey && success) {
      const newNodeStatus = getNodeStatus(eventType);
      if (newNodeStatus) {
        await client.query(
          `UPDATE user_environments
           SET topology = jsonb_set(
             topology,
             ARRAY['nodes', (
               SELECT ordinality::int - 1
               FROM jsonb_array_elements(topology->'nodes') WITH ORDINALITY AS elems(elem, ordinality)
               WHERE elem->>'key' = $2
               LIMIT 1
             )::text, 'status'],
             $3::jsonb
           )
           WHERE id = $1`,
          [envId, nodeKey, JSON.stringify(newNodeStatus)],
        );
      }
    }

    // Update environment score
    if (pointsDelta !== 0) {
      await client.query(
        'UPDATE user_environments SET score = score + $2 WHERE id = $1',
        [envId, pointsDelta],
      );
    }

    await client.query('COMMIT');
    return NextResponse.json({ event, success, pointsDelta }, { status: 201 });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('[env-events]', err);
    return NextResponse.json({ error: 'Failed to record event' }, { status: 500 });
  } finally {
    client.release();
  }
}

function getPointsDelta(eventType: string): number {
  const map: Record<string, number> = {
    scan: 5,
    exploit: 50,
    patch: 30,
    defend: 20,
    alert: 0,
    flag_captured: 100,
    node_compromised: 40,
    node_restored: 25,
  };
  return map[eventType] ?? 0;
}

function getNodeStatus(eventType: string): string | null {
  const map: Record<string, string> = {
    exploit: 'compromised',
    patch: 'patched',
    defend: 'hardened',
    node_restored: 'online',
  };
  return map[eventType] ?? null;
}
