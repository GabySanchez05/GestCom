
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

if (!SUPABASE_URL || !SERVICE_KEY || !ADMIN_EMAIL || !ADMIN_PASSWORD) {
  console.error('[seed-admin] Missing required environment variables.');
  process.exit(1);
}

const headers = {
  'Content-Type': 'application/json',
  'apikey': SERVICE_KEY,
  'Authorization': `Bearer ${SERVICE_KEY}`,
};

async function request(method, path, body) {
  const res = await fetch(`${SUPABASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(`[${res.status}] ${JSON.stringify(json)}`);
  return json;
}

(async () => {

  console.log('[seed-admin] Checking for existing admin user…');
  const list = await request('GET', `/auth/v1/admin/users?page=1&per_page=1000`);

  const users = list.users ?? [];
  let adminUser = users.find(u => u.email === ADMIN_EMAIL);


  if (!adminUser) {
    console.log('[seed-admin] User not found — creating…');
    adminUser = await request('POST', '/auth/v1/admin/users', {
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      email_confirm: true,
    });
    console.log('[seed-admin] Admin auth user created:', adminUser.id);
  } else {
    console.log('[seed-admin] Auth user exists:', adminUser.id);
  }

  const userId = adminUser.id;

  // ── 3. Upsert profile with role = 'admin' ─────────────────────────────────
  console.log('[seed-admin] Upserting profile with role=admin…');
  const upsertRes = await fetch(
    `${SUPABASE_URL}/rest/v1/profiles?id=eq.${userId}`,
    {
      method: 'PATCH',
      headers: { ...headers, 'Prefer': 'return=minimal' },
      body: JSON.stringify({ role: 'admin' }),
    }
  );


  const rowsAffected = upsertRes.headers.get('content-range') ?? '';
  if (upsertRes.status === 200 && rowsAffected === '*/0') {
    // No existing row — insert
    const insertRes = await fetch(`${SUPABASE_URL}/rest/v1/profiles`, {
      method: 'POST',
      headers: { ...headers, 'Prefer': 'return=minimal' },
      body: JSON.stringify({ id: userId, role: 'admin' }),
    });
    if (!insertRes.ok) {
      const err = await insertRes.text();
      throw new Error(`Profile insert failed: ${err}`);
    }
    console.log('[seed-admin] Profile inserted with role=admin.');
  } else if (!upsertRes.ok) {
    const err = await upsertRes.text();
    throw new Error(`Profile upsert failed [${upsertRes.status}]: ${err}`);
  } else {
    console.log('[seed-admin] Profile updated with role=admin.');
  }

  console.log('[seed-admin] ✅ Admin user ready.');
  process.exit(0);
})().catch(err => {
  console.error('[seed-admin] ❌ Fatal error:', err.message ?? err);
  process.exit(1);
});
