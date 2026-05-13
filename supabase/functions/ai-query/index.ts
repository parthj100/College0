import { createClient } from 'npm:@supabase/supabase-js@2.46.1';

// Spec §9: AI Q&A with role-gated local KB + LLM fallback (hallucination warning).
// Pipeline: role gate → user-context fast paths → vector search (if embeddings exist)
//   → lexical KB fallback → LLM fallback (if ANTHROPIC_API_KEY set).

const CORS = {
  'access-control-allow-origin': '*',
  'access-control-allow-headers': 'authorization, content-type, apikey, x-client-info',
  'access-control-allow-methods': 'POST, OPTIONS',
};

type Answer = { body: string; source: string; kind: 'local' | 'llm' | 'denied' };

function roleGateDenial(role: string, q: string): Answer | null {
  if (role === 'visitor') {
    if (/\b(my|our|i)\b/i.test(q) || /s-\d{5}/.test(q) || /\b(at risk|roster|cancel|enrollment|grade|warn)/i.test(q)) {
      return {
        body: 'I can only help visitors with general, public information about College0 — admissions policy, the handbook, top/lowest-rated classes, top GPA students. Please sign in for anything personal.',
        source: 'Role gate · visitor',
        kind: 'denied',
      };
    }
  }
  if (role === 'student' && /\b(roster|class.gpa|every student|all students)/i.test(q)) {
    return {
      body: 'Students may ask about their own classes, grades, and the handbook. Roster-wide queries are restricted.',
      source: 'Role gate · student',
      kind: 'denied',
    };
  }
  return null;
}

async function answerUserContext(supabase: any, role: string, userId: string | null, q: string): Promise<Answer | null> {
  if (!userId) return null;
  const lower = q.toLowerCase();

  if (role === 'student' && /(my gpa|my standing|on track|am i)/.test(lower)) {
    const { data: s } = await supabase.from('students').select('cached_cum_gpa, cached_sem_gpa, completed_classes, status').eq('user_id', userId).single();
    const { count: warns } = await supabase.from('warnings').select('id', { count: 'exact', head: true }).eq('target_id', userId).eq('active', true);
    const { count: hons } = await supabase.from('honors').select('id', { count: 'exact', head: true }).eq('target_id', userId).eq('redeemed', false);
    if (s) {
      return {
        body: `Cumulative GPA ${s.cached_cum_gpa} (semester ${s.cached_sem_gpa}). ${s.completed_classes}/8 classes toward graduation, ${warns ?? 0} active warning(s), ${hons ?? 0} honor credit(s). Status: ${s.status}.`,
        source: 'Local · your record',
        kind: 'local',
      };
    }
  }

  if (role === 'student' && /(my class|enrolled|registered)/.test(lower)) {
    const { data } = await supabase
      .from('enrollments')
      .select('term, courses(code,title)')
      .eq('student_id', userId)
      .eq('status', 'enrolled');
    const codes = (data ?? []).map((e: any) => e.courses?.code).filter(Boolean).join(', ');
    return {
      body: codes ? `You're enrolled in ${data!.length} class${data!.length === 1 ? '' : 'es'}: ${codes}.` : 'No active enrollments.',
      source: 'Local · your registration',
      kind: 'local',
    };
  }

  if (role === 'instructor' && /(at risk|failing|worry)/.test(lower)) {
    const { data: courses } = await supabase.from('courses').select('id, code').eq('instructor_id', userId);
    if (!courses || courses.length === 0) return null;
    const ids = courses.map((c: any) => c.id);
    const { data: enrolls } = await supabase
      .from('enrollments')
      .select('students(cached_cum_gpa, profiles!inner(full_name))')
      .in('course_id', ids)
      .eq('status', 'enrolled');
    const atRisk = (enrolls ?? [])
      .map((e: any) => ({ name: e.students?.profiles?.full_name, gpa: e.students?.cached_cum_gpa }))
      .filter((s: any) => s.gpa !== null && Number(s.gpa) < 3.0);
    return {
      body: atRisk.length ? `${atRisk.length} student(s) at risk: ${atRisk.map((s: any) => `${s.name} (${s.gpa})`).join(', ')}.` : 'No at-risk students under 3.0 GPA in your classes.',
      source: 'Local · gradebook',
      kind: 'local',
    };
  }

  return null;
}

async function embedQuestion(question: string): Promise<number[] | null> {
  const key = Deno.env.get('OPENAI_API_KEY');
  if (!key) return null;
  try {
    const res = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: { authorization: `Bearer ${key}`, 'content-type': 'application/json' },
      body: JSON.stringify({ model: 'text-embedding-3-small', input: question }),
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data?.[0]?.embedding ?? null;
  } catch { return null; }
}

async function answerFromVector(supabase: any, role: string, q: string): Promise<Answer | null> {
  const vec = await embedQuestion(q);
  if (!vec) return null;
  const { data, error } = await supabase.rpc('match_kb_docs', { query_embedding: vec, p_role: role, p_k: 1 });
  if (error || !data || data.length === 0) return null;
  const best = data[0];
  if (best.distance > 0.45) return null; // weak match — fall through to lexical/LLM
  return { body: best.body, source: `${best.source} (vector)`, kind: 'local' };
}

async function answerFromKB(supabase: any, role: string, q: string): Promise<Answer | null> {
  const { data: docs } = await supabase
    .from('kb_docs')
    .select('title, body, source, role_scope')
    .contains('role_scope', `{${role}}`);
  if (!docs || docs.length === 0) return null;

  const tokens = q.toLowerCase().match(/[a-z]+/g) ?? [];
  if (tokens.length === 0) return null;

  let best: { doc: any; score: number } | null = null;
  for (const doc of docs) {
    const hay = (doc.title + ' ' + doc.body).toLowerCase();
    let score = 0;
    for (const t of tokens) if (hay.includes(t)) score += 1;
    if (score > 0 && (!best || score > best.score)) best = { doc, score };
  }
  if (!best || best.score < 2) return null;
  return { body: best.doc.body, source: best.doc.source, kind: 'local' };
}

async function answerFromLLM(question: string): Promise<Answer> {
  const apiKey = Deno.env.get('ANTHROPIC_API_KEY');
  if (!apiKey) {
    return {
      body: "I don't have this in the College0 knowledge base, and no external model is configured. Try asking a registrar.",
      source: 'No source',
      kind: 'llm',
    };
  }
  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5',
        max_tokens: 400,
        system: 'You answer questions about College0, a small fictional graduate program. Be concise. If the answer is not part of widely-known knowledge, say so plainly and remind the user to verify with the registrar.',
        messages: [{ role: 'user', content: question }],
      }),
    });
    const json = await res.json();
    const text = json?.content?.[0]?.text ?? "I couldn't get a useful answer from the external model.";
    return { body: text, source: 'External LLM · Claude Haiku 4.5', kind: 'llm' };
  } catch (e) {
    return {
      body: `LLM call failed: ${e instanceof Error ? e.message : String(e)}`,
      source: 'External LLM · error',
      kind: 'llm',
    };
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'POST required' }), {
      status: 405,
      headers: { ...CORS, 'content-type': 'application/json' },
    });
  }

  let payload: { question?: string } = {};
  try { payload = await req.json(); } catch { /* fine */ }
  const question = (payload.question ?? '').trim();
  if (!question) {
    return new Response(JSON.stringify({ error: 'question is required' }), {
      status: 400,
      headers: { ...CORS, 'content-type': 'application/json' },
    });
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    { auth: { persistSession: false } },
  );
  let role = 'visitor';
  let userId: string | null = null;
  const auth = req.headers.get('authorization');
  if (auth?.startsWith('Bearer ')) {
    const { data } = await supabase.auth.getUser(auth.slice(7));
    if (data?.user) {
      userId = data.user.id;
      const { data: p } = await supabase.from('profiles').select('role').eq('id', userId).single();
      if (p?.role) role = p.role;
    }
  }

  const denied = roleGateDenial(role, question);
  if (denied) return ok(denied);

  const userCtx = await answerUserContext(supabase, role, userId, question);
  if (userCtx) return ok(userCtx);

  const vec = await answerFromVector(supabase, role, question);
  if (vec) return ok(vec);

  const kb = await answerFromKB(supabase, role, question);
  if (kb) return ok(kb);

  const llm = await answerFromLLM(question);
  return ok(llm);
});

function ok(ans: Answer) {
  return new Response(JSON.stringify(ans), {
    headers: { ...CORS, 'content-type': 'application/json' },
  });
}
