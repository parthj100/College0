import { createClient } from 'npm:@supabase/supabase-js@2.46.1';

// Spec §2: "Accepted new students will receive a unique student id and password
// that should be changed in the first login." decide_application records the
// decision; this function actually mints the auth.users row + the role-specific
// row + stamps the issued credentials on the application. Registrar-only.

const CORS = {
  'access-control-allow-origin': '*',
  'access-control-allow-headers': 'authorization, content-type, apikey, x-client-info',
  'access-control-allow-methods': 'POST, OPTIONS',
};

function tempPassword(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(6));
  const b64 = btoa(String.fromCharCode(...bytes)).replace(/[+/=]/g, '').slice(0, 8);
  return 'c0-' + b64.toLowerCase();
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });
  if (req.method !== 'POST') return json({ error: 'POST required' }, 405);

  const auth = req.headers.get('authorization');
  if (!auth?.startsWith('Bearer ')) return json({ error: 'unauthenticated' }, 401);

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    { auth: { persistSession: false } },
  );

  const { data: u, error: uErr } = await supabase.auth.getUser(auth.slice(7));
  if (uErr || !u?.user) return json({ error: 'invalid token' }, 401);
  const { data: prof } = await supabase.from('profiles').select('role').eq('id', u.user.id).single();
  if (prof?.role !== 'registrar') return json({ error: 'registrar only' }, 403);

  let body: { application_id?: number } = {};
  try { body = await req.json(); } catch { /* fine */ }
  if (!body.application_id) return json({ error: 'application_id required' }, 400);

  const { data: app, error: aErr } = await supabase
    .from('applications').select('*').eq('id', body.application_id).single();
  if (aErr || !app) return json({ error: 'application not found' }, 404);
  if (app.status !== 'accept') return json({ error: 'application is not accepted yet' }, 409);
  if (app.issued_user_id) return json({ error: 'already provisioned', issued_user_id: app.issued_user_id }, 409);

  let display_id: string;
  if (app.type === 'student') {
    const { count } = await supabase
      .from('profiles').select('id', { count: 'exact', head: true }).like('display_id', 's-%');
    display_id = 's-' + String((count ?? 0) + 1).padStart(5, '0');
  } else {
    const last = (app.name as string).trim().split(/\s+/).pop()!.replace(/[^A-Za-z0-9]/g, '');
    display_id = 'i-' + last;
    let suffix = 1;
    while (true) {
      const { count } = await supabase
        .from('profiles').select('id', { count: 'exact', head: true }).eq('display_id', display_id);
      if ((count ?? 0) === 0) break;
      display_id = 'i-' + last + suffix++;
    }
  }

  const password = tempPassword();
  const { data: created, error: createErr } = await supabase.auth.admin.createUser({
    email: app.email,
    password,
    email_confirm: true,
    user_metadata: { display_id, full_name: app.name, role: app.type, must_change_password: true },
  });
  if (createErr) return json({ error: createErr.message }, 500);
  const newUserId = created.user!.id;

  if (app.type === 'student') {
    const { error } = await supabase.from('students').insert({ user_id: newUserId, major: app.department });
    if (error) return json({ error: 'student row: ' + error.message }, 500);
    const { data: q } = await supabase.from('program_quotas').select('enrolled').eq('department', app.department).single();
    if (q) await supabase.from('program_quotas').update({ enrolled: q.enrolled + 1 }).eq('department', app.department);
  } else {
    const { error } = await supabase.from('instructors').insert({ user_id: newUserId, department: app.department });
    if (error) return json({ error: 'instructor row: ' + error.message }, 500);
  }

  await supabase.from('applications').update({ issued_user_id: newUserId, temp_password: password }).eq('id', app.id);

  return json({
    application_id: app.id, display_id, user_id: newUserId,
    email: app.email, temp_password: password, must_change_password: true,
  });
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS, 'content-type': 'application/json' },
  });
}
