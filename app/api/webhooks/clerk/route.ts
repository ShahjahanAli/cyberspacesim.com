import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';

interface ClerkEmailAddress {
  email_address: string;
  id: string;
}

interface ClerkUserEventData {
  id: string;
  username: string | null;
  email_addresses: ClerkEmailAddress[];
  primary_email_address_id: string;
  image_url: string | null;
  first_name: string | null;
  last_name: string | null;
}

export async function POST(req: Request) {
  const secret = process.env.CLERK_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 });
  }

  // Verify signature using svix
  const headersList = await headers();
  const svixId        = headersList.get('svix-id');
  const svixTimestamp = headersList.get('svix-timestamp');
  const svixSignature = headersList.get('svix-signature');

  if (!svixId || !svixTimestamp || !svixSignature) {
    return NextResponse.json({ error: 'Missing svix headers' }, { status: 400 });
  }

  const body = await req.text();

  let event: { type: string; data: ClerkUserEventData };
  try {
    const wh = new Webhook(secret);
    event = wh.verify(body, {
      'svix-id': svixId,
      'svix-timestamp': svixTimestamp,
      'svix-signature': svixSignature,
    }) as typeof event;
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  const { type, data } = event;

  // Helper: find primary email
  const getPrimaryEmail = (d: ClerkUserEventData) => {
    const primary = d.email_addresses.find(
      (e) => e.id === d.primary_email_address_id,
    );
    return primary?.email_address ?? d.email_addresses[0]?.email_address ?? null;
  };

  try {
    if (type === 'user.created') {
      const displayName =
        [data.first_name, data.last_name].filter(Boolean).join(' ') ||
        data.username ||
        null;

      await pool.query(
        `INSERT INTO users (clerk_id, username, email, avatar_url)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (clerk_id) DO NOTHING`,
        [data.id, displayName, getPrimaryEmail(data), data.image_url],
      );
    }

    if (type === 'user.updated') {
      const displayName =
        [data.first_name, data.last_name].filter(Boolean).join(' ') ||
        data.username ||
        null;

      await pool.query(
        `UPDATE users
         SET username = $2, email = $3, avatar_url = $4, updated_at = now()
         WHERE clerk_id = $1`,
        [data.id, displayName, getPrimaryEmail(data), data.image_url],
      );
    }

    if (type === 'user.deleted') {
      await pool.query('DELETE FROM users WHERE clerk_id = $1', [data.id]);
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[clerk-webhook]', err);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}
