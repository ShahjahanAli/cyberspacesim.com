import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';

interface InviteBody {
  targetClerkId: string;
}

/** POST /api/teams/[slug]/invite  — invite a user by their Clerk ID (must be team admin/owner) */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { userId: clerkId } = await auth();
  if (!clerkId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { slug } = await params;

  let body: InviteBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  if (!body.targetClerkId) {
    return NextResponse.json({ error: 'targetClerkId is required' }, { status: 400 });
  }

  const { rows: [inviter] } = await pool.query<{ id: string }>(
    'SELECT id FROM users WHERE clerk_id = $1',
    [clerkId],
  );
  if (!inviter) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  // Verify inviter is admin/owner of the team
  const { rows: [membership] } = await pool.query<{ role: string; team_id: string }>(
    `SELECT tm.role, tm.team_id
     FROM team_members tm
     JOIN teams t ON t.id = tm.team_id
     WHERE t.slug = $1 AND tm.user_id = $2`,
    [slug, inviter.id],
  );
  if (!membership) return NextResponse.json({ error: 'Not a team member' }, { status: 403 });
  if (!['owner', 'admin'].includes(membership.role)) {
    return NextResponse.json({ error: 'Only admins can invite' }, { status: 403 });
  }

  // Find target user
  const { rows: [target] } = await pool.query<{ id: string }>(
    'SELECT id FROM users WHERE clerk_id = $1',
    [body.targetClerkId],
  );
  if (!target) return NextResponse.json({ error: 'Target user not found' }, { status: 404 });

  try {
    const { rows: [invite] } = await pool.query(
      `INSERT INTO team_invites (team_id, invited_user_id, invited_by)
       VALUES ($1, $2, $3)
       ON CONFLICT (team_id, invited_user_id) DO UPDATE
         SET status = 'pending', expires_at = now() + INTERVAL '7 days'
       RETURNING id, status, expires_at`,
      [membership.team_id, target.id, inviter.id],
    );
    return NextResponse.json({ invite }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Failed to create invite' }, { status: 500 });
  }
}
