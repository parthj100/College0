import { createClient } from 'npm:@supabase/supabase-js@2.46.1';

// Spec §2: Accepted applicants get a unique id + temp password. demo edition:
// fixed temp password "123456" (override via DEMO_TEMP_PASSWORD secret), and
// we don't force a password-change on first login — the user can change it
// from their profile later if they want.
//
// If the email already exists in auth (re-applies, leftover tests, etc.) we
// adopt that user and reset the password instead of failing.

const CORS = {
  'access-control-allow-origin': '*',
  'access-control-allow-headers': 'authorization, content-type, apikey, x-client-info',
  'access-control-allow-methods': 'POST, OPTIONS',
};
const DEMO_TEMP_PASSWORD = Deno.env.get('DEMO_TEMP_PASSWORD') ?? '123456';

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
  try { body = await req.json(); } catch {}
  if (!body.application_id) return json({ error: 'application_id required' }, 400);

  const { data: app, error: aErr } = await supabase
    .from('applications').select('*').eq('id', body.application_id).single();
  if (aErr || !app) return json({ error: 'application not found' }, 404);
  if (app.status !== 'accept') return json({ error: 'application is not accepted yet' }, 409);

  // Pick the display_id first so we can use it to construct the canonical
  // auth email (`<display_id>@college0.demo`). This matches the existing
  // seeded users and lets the SB_EMAIL_FOR helper resolve a typed display_id
  // to a real auth email at sign-in time. The applicant's original email is
  // preserved in user_metadata for reference.
  const password = DEMO_TEMP_PASSWORD;

  // Adopt by either application email OR canonical email if either already
  // exists in auth (covers re-runs / leftover test users).
  const { data: list } = await supabase.auth.admin.listUsers({ perPage: 1000 });
  const lowerAppEmail = app.email.toLowerCase();

  let display_id: string;
  let existing = list?.users?.find(x => x.email?.toLowerCase() === lowerAppEmail);
  if (existing) {
    display_id = (existing.user_metadata?.display_id as string) || await pickDisplayId(supabase, app);
  } else {
    display_id = await pickDisplayId(supabase, app);
    const canonicalEmail = display_id + '@college0.demo';
    existing = list?.users?.find(x => x.email?.toLowerCase() === canonicalEmail);
  }

  const canonicalEmail = display_id + '@college0.demo';
  let newUserId: string;

  if (existing) {
    newUserId = existing.id;
    const { error: upErr } = await supabase.auth.admin.updateUserById(newUserId, {
      email: canonicalEmail,
      password,
      user_metadata: {
        ...(existing.user_metadata || {}),
        display_id,
        applicant_email: app.email,
        full_name: app.name,
        role: app.type,
        must_change_password: false,
      },
    });
    if (upErr) return json({ error: 'reset failed: ' + upErr.message }, 500);
    await supabase.from('profiles').upsert({
      id: newUserId,
      display_id,
      full_name: app.name,
      role: app.type,
      must_change_password: false,
    });
  } else {
    const { data: created, error: createErr } = await supabase.auth.admin.createUser({
      email: canonicalEmail,
      password,
      email_confirm: true,
      user_metadata: {
        display_id,
        applicant_email: app.email,
        full_name: app.name,
        role: app.type,
        must_change_password: false,
      },
    });
    if (createErr) return json({ error: createErr.message }, 500);
    newUserId = created.user!.id;
  }

  if (app.type === 'student') {
    await supabase.from('students').upsert({ user_id: newUserId, major: app.department });
    const { data: q } = await supabase.from('program_quotas').select('enrolled').eq('department', app.department).single();
    if (q) await supabase.from('program_quotas').update({ enrolled: q.enrolled + 1 }).eq('department', app.department);
  } else {
    await supabase.from('instructors').upsert({ user_id: newUserId, department: app.department });
  }

  await supabase.from('applications').update({ issued_user_id: newUserId, temp_password: password }).eq('id', app.id);

  return json({
    application_id: app.id, display_id, user_id: newUserId,
    email: canonicalEmail, applicant_email: app.email,
    temp_password: password, must_change_password: false,
    reused_existing: !!existing,
  });
});

async function pickDisplayId(supabase: any, app: any): Promise<string> {
  if (app.type === 'student') {
    const { count } = await supabase
      .from('profiles').select('id', { count: 'exact', head: true }).like('display_id', 's-%');
    return 's-' + String((count ?? 0) + 1).padStart(5, '0');
  }
  const last = (app.name as string).trim().split(/\s+/).pop()!.replace(/[^A-Za-z0-9]/g, '');
  let display = 'i-' + last;
  let suffix = 1;
  while (true) {
    const { count } = await supabase
      .from('profiles').select('id', { count: 'exact', head: true }).eq('display_id', display);
    if ((count ?? 0) === 0) return display;
    display = 'i-' + last + suffix++;
  }
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS, 'content-type': 'application/json' },
  });
}
