import { createClient } from 'npm:@supabase/supabase-js@2.46.1';

// Demo profiles, courses, enrollments, warnings, honors — mirrors data.js.
// Idempotent: wipes & rebuilds. Run once after migrations are applied.

const INSTRUCTORS: Array<[string, string, string]> = [
  ['i-Arkwright', 'Miriam Arkwright', 'Philosophy'],
  ['i-Okonkwo',   'C. Okonkwo',       'Literature'],
  ['i-Sato',      'H. Sato',          'CompSci'],
  ['i-Lambert',   'P. Lambert',       'Economics'],
  ['i-Moreau',    'T. Moreau',        'Sociology'],
  ['i-Lindqvist', 'B. Lindqvist',     'History'],
  ['i-Duval',     'R. Duval',         'Math'],
  ['i-Devi',      'N. Devi',          'Art'],
  ['i-Abiola',    'E. Abiola',        'Linguistics'],
];

const STUDENTS: Array<[string, string, string, string, number, number, boolean]> = [
  ['s-00029', 'Wren Atsumi',      'Literature',  'Y2', 3.88, 3.92, true],
  ['s-00042', 'Imogen Halvorsen', 'Philosophy',  'Y2', 3.97, 4.00, false],
  ['s-00018', 'Dara Okafor',      'Mathematics', 'Y3', 3.93, 3.94, false],
  ['s-00051', 'Milo Vukovic',     'CompSci',     'Y1', 3.84, 3.82, false],
  ['s-00007', 'Aisha El-Hashimi', 'History',     'Y3', 3.81, 3.75, false],
  ['s-00066', 'Temir Baikov',     'Literature',  'Y2', 3.22, 3.05, false],
  ['s-00070', 'Priya Kandasamy',  'CompSci',     'Y1', 2.95, 2.40, false],
  ['s-00081', 'Noor Haddad',      'History',     'Y2', 3.55, 3.50, false],
  ['s-00093', 'Jonas Brautigan',  'Philosophy',  'Y2', 2.10, 1.85, false],
  ['s-00104', 'Kiri Wynter',      'Mathematics', 'Y3', 3.40, 3.40, false],
  ['s-00115', 'Hanan Aziz',       'Literature',  'Y2', 3.62, 3.62, false],
  ['s-00121', 'Rowan Castile',    'CompSci',     'Y2', 2.15, 2.20, false],
];

const COURSES: Array<[string, string, string, string, string, number[], number, number, number, boolean]> = [
  ['PHIL-612', 'Ethics of Machine Reasoning', 'i-Arkwright', 'Philosophy',  'MW 10:00—11:30', [1,3], 10,   11.5, 14, true],
  ['LIT-540',  'The Long Form Essay',         'i-Okonkwo',   'Literature',  'TR 13:00—14:30', [2,4], 13,   14.5, 12, true],
  ['CS-710',   'Distributed Systems Theory',  'i-Sato',      'CompSci',     'MW 13:00—14:30', [1,3], 13,   14.5, 14, true],
  ['HIST-605', 'Cold War Archives',           'i-Lindqvist', 'History',     'F 09:00—12:00',  [5],    9,   12,   12, true],
  ['MATH-701', 'Measure Theory',              'i-Duval',     'Math',        'TR 10:00—11:30', [2,4], 10,   11.5, 10, true],
  ['ECON-599', 'Behavioral Microfoundations', 'i-Lambert',   'Economics',   'MW 15:00—16:30', [1,3], 15,   16.5, 14, false],
  ['SOC-508',  'Urban Field Methods',         'i-Moreau',    'Sociology',   'T 09:00—12:00',  [2],    9,   12,   12, false],
  ['ART-621',  'Curatorial Practice',         'i-Devi',      'Art',         'W 13:00—16:00',  [3],   13,   16,   12, false],
  ['CS-702',   'Probabilistic Programming',   'i-Sato',      'CompSci',     'TR 15:00—16:30', [2,4], 15,   16.5, 12, false],
  ['LING-611', 'Computational Semantics',     'i-Abiola',    'Linguistics', 'F 13:00—16:00',  [5],   13,   16,   10, false],
  ['LIT-488',  'Modernist Prose Workshop',    'i-Okonkwo',   'Literature',  'MW 09:00—10:30', [1,3],  9,   10.5, 12, false],
];

const ENROLLMENTS: Array<[string, string]> = [
  ['s-00029','PHIL-612'],['s-00029','LIT-540'],['s-00029','HIST-605'],
  ['s-00042','PHIL-612'],['s-00042','LIT-540'],['s-00042','SOC-508'],
  ['s-00018','MATH-701'],['s-00018','CS-710'],['s-00018','LIT-540'],
  ['s-00051','CS-710'],['s-00051','CS-702'],['s-00051','HIST-605'],
  ['s-00007','HIST-605'],['s-00007','SOC-508'],['s-00007','ART-621'],
  ['s-00066','LIT-540'],['s-00066','ECON-599'],
  ['s-00070','CS-710'],
  ['s-00081','HIST-605'],['s-00081','LIT-540'],
  ['s-00093','LIT-540'],['s-00093','ECON-599'],
  ['s-00104','MATH-701'],['s-00104','CS-702'],['s-00104','ART-621'],
  ['s-00115','LIT-540'],['s-00115','SOC-508'],
  ['s-00121','CS-702'],['s-00121','SOC-508'],['s-00121','ART-621'],
];

const AVG_RATINGS: Record<string, number> = {
  'PHIL-612': 4.9, 'LIT-540': 4.8, 'CS-710': 4.7, 'HIST-605': 4.6, 'MATH-701': 4.5,
  'ECON-599': 1.8, 'SOC-508': 2.1, 'ART-621': 2.4, 'LIT-488': 4.4,
};

const WARNINGS_SEED: Array<[string, string, string]> = [
  ['s-00029', 'student',    'Review of ECON-599 contained a taboo word'],
  ['s-00093', 'student',    'Fewer than 2 active courses'],
  ['s-00093', 'student',    'Missed 5 of 8 sessions in LIT-540'],
  ['i-Lambert', 'instructor', 'Class avg rating below 2.0 (ECON-599)'],
  ['i-Lambert', 'instructor', 'Grade distribution outside 2.5–3.5 band'],
  ['i-Moreau',  'instructor', 'Course underenrolled — issued at phase 2 → 3'],
];

const HONORS_SEED: Array<[string, string]> = [
  ['s-00029', 'Sem GPA 3.92 (Fall 25)'],
  ['s-00029', 'Cum GPA 3.88'],
  ['s-00042', 'Sem GPA 4.00 (Fall 25)'],
  ['s-00042', 'Sem GPA 3.94 (Spr 25)'],
  ['s-00042', 'Cum GPA 3.97'],
];

// Configurable via Supabase secrets (`supabase secrets set DEMO_PASSWORD=...`).
// Defaults are documented in the README's setup section.
const PASSWORD = Deno.env.get('DEMO_PASSWORD') ?? 'college0demo!!';
const REGISTRAR_PASSWORD = Deno.env.get('DEMO_REGISTRAR_PASSWORD') ?? 'college0registrar!!';

async function bootstrap() {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    { auth: { persistSession: false } },
  );

  // 1) Wipe demo data (CASCADE removes students/instructors/enrollments/warnings/honors/etc.)
  // Keep applications, taboo_words, required_courses, program_quotas, system_state.
  await supabase.from('reviews').delete().neq('id', 0);
  await supabase.from('enrollments').delete().neq('id', 0);
  await supabase.from('courses').delete().neq('id', 0);
  await supabase.from('honors').delete().neq('id', 0);
  await supabase.from('warnings').delete().neq('id', 0);
  await supabase.from('fines').delete().neq('student_id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('students').delete().neq('user_id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('instructors').delete().neq('user_id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('profiles').delete().neq('id', '00000000-0000-0000-0000-000000000000');

  // Also wipe matching auth users by email pattern
  const { data: existing } = await supabase.auth.admin.listUsers({ perPage: 200 });
  for (const u of existing?.users ?? []) {
    if (u.email?.endsWith('@college0.demo')) {
      await supabase.auth.admin.deleteUser(u.id);
    }
  }

  const idMap = new Map<string, string>();   // display_id → uuid
  const failures: string[] = [];

  // 2) Create registrar
  {
    const { data, error } = await supabase.auth.admin.createUser({
      email: 'registrar@college0.demo',
      password: REGISTRAR_PASSWORD,
      email_confirm: true,
      user_metadata: { display_id: 'registrar-001', full_name: 'The Registrar', role: 'registrar' },
    });
    if (error) failures.push(`registrar: ${error.message}`);
    else idMap.set('registrar-001', data.user!.id);
  }

  // 3) Instructors
  for (const [display, name, dept] of INSTRUCTORS) {
    const { data, error } = await supabase.auth.admin.createUser({
      email: `${display.toLowerCase()}@college0.demo`,
      password: PASSWORD,
      email_confirm: true,
      user_metadata: { display_id: display, full_name: name, role: 'instructor' },
    });
    if (error) { failures.push(`${display}: ${error.message}`); continue; }
    const uid = data.user!.id;
    idMap.set(display, uid);
    await supabase.from('instructors').insert({ user_id: uid, department: dept });
  }

  // 4) Students
  for (const [display, name, major, year, cum, sem, mustChange] of STUDENTS) {
    const { data, error } = await supabase.auth.admin.createUser({
      email: `${display}@college0.demo`,
      password: PASSWORD,
      email_confirm: true,
      user_metadata: { display_id: display, full_name: name, role: 'student', must_change_password: mustChange },
    });
    if (error) { failures.push(`${display}: ${error.message}`); continue; }
    const uid = data.user!.id;
    idMap.set(display, uid);
    await supabase.from('students').insert({
      user_id: uid, major, year, cached_cum_gpa: cum, cached_sem_gpa: sem,
    });
  }

  // 5) Courses
  const courseIdByCode = new Map<string, number>();
  for (const [code, title, instDisplay, dept, time, days, start, end, cap, required] of COURSES) {
    const inst_id = idMap.get(instDisplay);
    if (!inst_id) { failures.push(`course ${code}: instructor ${instDisplay} missing`); continue; }
    const { data, error } = await supabase.from('courses').insert({
      code, title, instructor_id: inst_id, department: dept, semester: 'Spring 2026',
      time_label: time, day_mask: days, start_hour: start, end_hour: end, cap, required,
      avg_rating: AVG_RATINGS[code] ?? null,
    }).select('id').single();
    if (error) { failures.push(`course ${code}: ${error.message}`); continue; }
    courseIdByCode.set(code, data.id);
  }

  // 6) Enrollments
  for (const [sid, code] of ENROLLMENTS) {
    const student_id = idMap.get(sid);
    const course_id = courseIdByCode.get(code);
    if (!student_id || !course_id) continue;
    await supabase.from('enrollments').insert({
      student_id, course_id, status: 'enrolled', term: 'Spring 2026',
    });
  }

  // 7) Seeded warnings (bypass trigger via raw SQL would be nicer; we accept the trigger
  //    might suspend Jonas (will get 2 warnings) but that mirrors prototype state anyway)
  for (const [sid, ttype, reason] of WARNINGS_SEED) {
    const target_id = idMap.get(sid);
    if (!target_id) continue;
    await supabase.from('warnings').insert({ target_id, target_type: ttype, reason });
  }

  // 8) Seeded honors
  for (const [sid, reason] of HONORS_SEED) {
    const target_id = idMap.get(sid);
    if (!target_id) continue;
    await supabase.from('honors').insert({ target_id, reason });
  }

  return {
    instructors: INSTRUCTORS.length,
    students: STUDENTS.length,
    courses: COURSES.length,
    enrollments: ENROLLMENTS.length,
    warnings: WARNINGS_SEED.length,
    honors: HONORS_SEED.length,
    failures,
    users: Object.fromEntries(idMap),
  };
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ message: 'POST to bootstrap demo users (idempotent).' }),
      { headers: { 'content-type': 'application/json' } },
    );
  }
  try {
    const result = await bootstrap();
    return new Response(JSON.stringify(result, null, 2), {
      headers: { 'content-type': 'application/json' },
    });
  } catch (e) {
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : String(e) }),
      { status: 500, headers: { 'content-type': 'application/json' } },
    );
  }
});
