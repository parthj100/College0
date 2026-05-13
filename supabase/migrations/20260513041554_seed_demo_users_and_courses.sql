-- Demo users without auth.users — these are PROFILE-ONLY rows used to wire course
-- assignments and the warning ledger. Real auth users would be created via Supabase
-- Auth Admin API on signup. For demo purposes we mint deterministic UUIDs and skip
-- the FK to auth.users by using a placeholder approach: defer to admin signup later.
-- For now we drop the FK temporarily, seed, and re-add it as DEFERRABLE.
--
-- IMPORTANT: After applying migrations, run the `bootstrap-demo-users` Edge Function
-- to wipe these orphan profiles and create real auth.users for each demo persona.
-- That's the only way sign-in actually works.

alter table profiles drop constraint profiles_id_fkey;

-- Instructors
insert into profiles(id, display_id, full_name, role) values
  ('00000000-0000-4000-8000-000000000101', 'i-Arkwright', 'Miriam Arkwright', 'instructor'),
  ('00000000-0000-4000-8000-000000000102', 'i-Okonkwo',   'C. Okonkwo',       'instructor'),
  ('00000000-0000-4000-8000-000000000103', 'i-Sato',      'H. Sato',          'instructor'),
  ('00000000-0000-4000-8000-000000000104', 'i-Lambert',   'P. Lambert',       'instructor'),
  ('00000000-0000-4000-8000-000000000105', 'i-Moreau',    'T. Moreau',        'instructor'),
  ('00000000-0000-4000-8000-000000000106', 'i-Lindqvist', 'B. Lindqvist',     'instructor'),
  ('00000000-0000-4000-8000-000000000107', 'i-Duval',     'R. Duval',         'instructor'),
  ('00000000-0000-4000-8000-000000000108', 'i-Devi',      'N. Devi',          'instructor'),
  ('00000000-0000-4000-8000-000000000109', 'i-Abiola',    'E. Abiola',        'instructor');

insert into instructors(user_id, department) values
  ('00000000-0000-4000-8000-000000000101', 'Philosophy'),
  ('00000000-0000-4000-8000-000000000102', 'Literature'),
  ('00000000-0000-4000-8000-000000000103', 'CompSci'),
  ('00000000-0000-4000-8000-000000000104', 'Economics'),
  ('00000000-0000-4000-8000-000000000105', 'Sociology'),
  ('00000000-0000-4000-8000-000000000106', 'History'),
  ('00000000-0000-4000-8000-000000000107', 'Math'),
  ('00000000-0000-4000-8000-000000000108', 'Art'),
  ('00000000-0000-4000-8000-000000000109', 'Linguistics');

-- Students
insert into profiles(id, display_id, full_name, role, must_change_password) values
  ('00000000-0000-4000-8000-000000000201', 's-00029', 'Wren Atsumi',      'student', true),
  ('00000000-0000-4000-8000-000000000202', 's-00042', 'Imogen Halvorsen', 'student', false),
  ('00000000-0000-4000-8000-000000000203', 's-00018', 'Dara Okafor',      'student', false),
  ('00000000-0000-4000-8000-000000000204', 's-00051', 'Milo Vukovic',     'student', false),
  ('00000000-0000-4000-8000-000000000205', 's-00007', 'Aisha El-Hashimi', 'student', false),
  ('00000000-0000-4000-8000-000000000206', 's-00066', 'Temir Baikov',     'student', false),
  ('00000000-0000-4000-8000-000000000207', 's-00070', 'Priya Kandasamy',  'student', false),
  ('00000000-0000-4000-8000-000000000208', 's-00081', 'Noor Haddad',      'student', false),
  ('00000000-0000-4000-8000-000000000209', 's-00093', 'Jonas Brautigan',  'student', false),
  ('00000000-0000-4000-8000-000000000210', 's-00104', 'Kiri Wynter',      'student', false),
  ('00000000-0000-4000-8000-000000000211', 's-00115', 'Hanan Aziz',       'student', false),
  ('00000000-0000-4000-8000-000000000212', 's-00121', 'Rowan Castile',    'student', false);

insert into students(user_id, major, year, cached_cum_gpa, cached_sem_gpa) values
  ('00000000-0000-4000-8000-000000000201', 'Literature',  'Y2', 3.88, 3.92),
  ('00000000-0000-4000-8000-000000000202', 'Philosophy',  'Y2', 3.97, 4.00),
  ('00000000-0000-4000-8000-000000000203', 'Mathematics', 'Y3', 3.93, 3.94),
  ('00000000-0000-4000-8000-000000000204', 'CompSci',     'Y1', 3.84, 3.82),
  ('00000000-0000-4000-8000-000000000205', 'History',     'Y3', 3.81, 3.75),
  ('00000000-0000-4000-8000-000000000206', 'Literature',  'Y2', 3.22, 3.05),
  ('00000000-0000-4000-8000-000000000207', 'CompSci',     'Y1', 2.95, 2.40),
  ('00000000-0000-4000-8000-000000000208', 'History',     'Y2', 3.55, 3.50),
  ('00000000-0000-4000-8000-000000000209', 'Philosophy',  'Y2', 2.10, 1.85),
  ('00000000-0000-4000-8000-000000000210', 'Mathematics', 'Y3', 3.40, 3.40),
  ('00000000-0000-4000-8000-000000000211', 'Literature',  'Y2', 3.62, 3.62),
  ('00000000-0000-4000-8000-000000000212', 'CompSci',     'Y2', 2.15, 2.20);

-- Registrar (no auth user yet — bind on signup)
insert into profiles(id, display_id, full_name, role) values
  ('00000000-0000-4000-8000-000000000001', 'registrar-001', 'The Registrar', 'registrar');

-- Re-attach FK (NOT VALID so existing rows aren't checked; new rows must satisfy)
alter table profiles
  add constraint profiles_id_fkey foreign key (id)
  references auth.users(id) on delete cascade not valid;

-- Courses (Spring 2026)
insert into courses(code, title, instructor_id, department, semester, time_label, day_mask, start_hour, end_hour, cap, required) values
  ('PHIL-612', 'Ethics of Machine Reasoning', '00000000-0000-4000-8000-000000000101', 'Philosophy', 'Spring 2026', 'MW 10:00—11:30', array[1,3], 10, 11.5, 14, true),
  ('LIT-540',  'The Long Form Essay',         '00000000-0000-4000-8000-000000000102', 'Literature', 'Spring 2026', 'TR 13:00—14:30', array[2,4], 13, 14.5, 12, true),
  ('CS-710',   'Distributed Systems Theory',  '00000000-0000-4000-8000-000000000103', 'CompSci',    'Spring 2026', 'MW 13:00—14:30', array[1,3], 13, 14.5, 14, true),
  ('HIST-605', 'Cold War Archives',           '00000000-0000-4000-8000-000000000106', 'History',    'Spring 2026', 'F 09:00—12:00',  array[5],    9, 12,   12, true),
  ('MATH-701', 'Measure Theory',              '00000000-0000-4000-8000-000000000107', 'Math',       'Spring 2026', 'TR 10:00—11:30', array[2,4], 10, 11.5, 10, true),
  ('ECON-599', 'Behavioral Microfoundations', '00000000-0000-4000-8000-000000000104', 'Economics',  'Spring 2026', 'MW 15:00—16:30', array[1,3], 15, 16.5, 14, false),
  ('SOC-508',  'Urban Field Methods',         '00000000-0000-4000-8000-000000000105', 'Sociology',  'Spring 2026', 'T 09:00—12:00',  array[2],    9, 12,   12, false),
  ('ART-621',  'Curatorial Practice',         '00000000-0000-4000-8000-000000000108', 'Art',        'Spring 2026', 'W 13:00—16:00',  array[3],   13, 16,   12, false),
  ('CS-702',   'Probabilistic Programming',   '00000000-0000-4000-8000-000000000103', 'CompSci',    'Spring 2026', 'TR 15:00—16:30', array[2,4], 15, 16.5, 12, false),
  ('LING-611', 'Computational Semantics',     '00000000-0000-4000-8000-000000000109', 'Linguistics','Spring 2026', 'F 13:00—16:00',  array[5],   13, 16,   10, false),
  ('LIT-488',  'Modernist Prose Workshop',    '00000000-0000-4000-8000-000000000102', 'Literature', 'Spring 2026', 'MW 09:00—10:30', array[1,3],  9, 10.5, 12, false);

-- Pre-seed avg ratings (matches data.js' top + bottom)
update courses set avg_rating = 4.9 where code = 'PHIL-612' and semester = 'Spring 2026';
update courses set avg_rating = 4.8 where code = 'LIT-540'  and semester = 'Spring 2026';
update courses set avg_rating = 4.7 where code = 'CS-710'   and semester = 'Spring 2026';
update courses set avg_rating = 4.6 where code = 'HIST-605' and semester = 'Spring 2026';
update courses set avg_rating = 4.5 where code = 'MATH-701' and semester = 'Spring 2026';
update courses set avg_rating = 1.8 where code = 'ECON-599' and semester = 'Spring 2026';
update courses set avg_rating = 2.1 where code = 'SOC-508'  and semester = 'Spring 2026';
update courses set avg_rating = 2.4 where code = 'ART-621'  and semester = 'Spring 2026';
update courses set avg_rating = 4.4 where code = 'LIT-488'  and semester = 'Spring 2026';

-- Enrollments
insert into enrollments(student_id, course_id, status, term)
select s.user_id, c.id, 'enrolled'::enrollment_status, 'Spring 2026'
from (values
  ('s-00029','PHIL-612'),('s-00029','LIT-540'),('s-00029','HIST-605'),
  ('s-00042','PHIL-612'),('s-00042','LIT-540'),('s-00042','SOC-508'),
  ('s-00018','MATH-701'),('s-00018','CS-710'),('s-00018','LIT-540'),
  ('s-00051','CS-710'),('s-00051','CS-702'),('s-00051','HIST-605'),
  ('s-00007','HIST-605'),('s-00007','SOC-508'),('s-00007','ART-621'),
  ('s-00066','LIT-540'),('s-00066','ECON-599'),
  ('s-00070','CS-710'),
  ('s-00081','HIST-605'),('s-00081','LIT-540'),
  ('s-00093','LIT-540'),('s-00093','ECON-599'),
  ('s-00104','MATH-701'),('s-00104','CS-702'),('s-00104','ART-621'),
  ('s-00115','LIT-540'),('s-00115','SOC-508'),
  ('s-00121','CS-702'),('s-00121','SOC-508'),('s-00121','ART-621')
) e(sid, ccode)
join profiles p on p.display_id = e.sid
join students s on s.user_id = p.id
join courses c on c.code = e.ccode and c.semester = 'Spring 2026';

-- Seed warnings (insert directly, bypassing the suspension trigger via session_replication_role)
set session_replication_role = replica;
insert into warnings(target_id, target_type, reason)
select p.id, 'student', 'Review of ECON-599 contained a taboo word' from profiles p where p.display_id = 's-00029'
union all select p.id, 'student', 'Fewer than 2 active courses' from profiles p where p.display_id = 's-00093'
union all select p.id, 'student', 'Missed 5 of 8 sessions in LIT-540' from profiles p where p.display_id = 's-00093'
union all select p.id, 'instructor', 'Class avg rating below 2.0 (ECON-599)' from profiles p where p.display_id = 'i-Lambert'
union all select p.id, 'instructor', 'Grade distribution outside 2.5–3.5 band' from profiles p where p.display_id = 'i-Lambert'
union all select p.id, 'instructor', 'Course underenrolled — issued at phase 2 → 3' from profiles p where p.display_id = 'i-Moreau';
set session_replication_role = origin;

-- Seed honors
insert into honors(target_id, reason)
select p.id, 'Sem GPA 3.92 (Fall 25)' from profiles p where p.display_id = 's-00029'
union all select p.id, 'Cum GPA 3.88'             from profiles p where p.display_id = 's-00029'
union all select p.id, 'Sem GPA 4.00 (Fall 25)'   from profiles p where p.display_id = 's-00042'
union all select p.id, 'Sem GPA 3.94 (Spr 25)'    from profiles p where p.display_id = 's-00042'
union all select p.id, 'Cum GPA 3.97'             from profiles p where p.display_id = 's-00042';
