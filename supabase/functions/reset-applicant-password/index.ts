import { createClient } from 'npm:@supabase/supabase-js@2.46.1';

// Registrar-only: reset an applicant's password back to the demo temp
// password (default "123456") and clear the must_change_password flag.
// Used when an applicant lost their initial credentials, when provisioning
// half-failed and we need to recover, or when the registrar simply wants
// to reissue a working password.

const CORS = {
  'access-control-allow-origin': '*',
  'access-control-allow-headers': 'authorization, content-type, apikey, x-client-info',
  'access-control-allow-methods': 'POST, OPTIONS',
};
const DEMO_TEMP_PASSWORD = Deno.env.get('DEMO_TEMP_PASSWORD') ?? '123456';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });
  if (req.method !== 'POST') return j({ error: 'POST required' }, 405);
  const auth = req.headers.get('authorization');
  if (!auth?.startsWith('Bearer ')) return j({ error: 'unauthenticated' }, 401);

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    { auth: { persistSession: false } },
  );
  const { data: u, error: uErr } = await supabase.auth.getUser(auth.slice(7));
  if (uErr || !u?.user) return j({ error: 'invalid token' }, 401);
  const { data: p } = await supabase.from('profiles').select('role').eq('id', u.user.id).single();
  if (p?.role !== 'registrar') return j({ error: 'registrar only' }, 403);

  let body: { user_id?: string; email?: string } = {};
  try { body = await req.json(); } catch {}
  let userId = body.user_id;
  if (!userId && body.email) {
    const { data: list } = await supabase.auth.admin.listUsers({ perPage: 200 });
    userId = list?.users?.find(x => x.email?.toLowerCase() === body.email!.toLowerCase())?.id;
  }
  if (!userId) return j({ error: 'user not found' }, 404);

  const { error } = await supabase.auth.admin.updateUserById(userId, {
    password: DEMO_TEMP_PASSWORD,
    user_metadata: { must_change_password: false },
  });
  if (error) return j({ error: error.message }, 500);
  await supabase.from('profiles').update({ must_change_password: false }).eq('id', userId);
  return j({ user_id: userId, password: DEMO_TEMP_PASSWORD, must_change_password: false });
});

function j(b: unknown, s = 200) {
  return new Response(JSON.stringify(b), { status: s, headers: { ...CORS, 'content-type': 'application/json' } });
}
