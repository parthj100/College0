-- Helper: lookup current user's role from JWT (auth.uid())
create or replace function current_role_value() returns role
language sql stable security definer set search_path = public, auth as $$
  select role from profiles where id = auth.uid()
$$;

create or replace function is_registrar() returns boolean
language sql stable security definer set search_path = public, auth as $$
  select coalesce((select role = 'registrar' from profiles where id = auth.uid()), false)
$$;

create or replace function is_instructor_of(course bigint) returns boolean
language sql stable security definer set search_path = public, auth as $$
  select exists(
    select 1 from courses c
    where c.id = course and c.instructor_id = auth.uid()
  )
$$;

create or replace function is_enrolled_in(course bigint) returns boolean
language sql stable security definer set search_path = public, auth as $$
  select exists(
    select 1 from enrollments e
    where e.course_id = course and e.student_id = auth.uid()
      and e.status in ('enrolled','completed')
  )
$$;

-- Enable RLS on every table
alter table profiles                enable row level security;
alter table students                enable row level security;
alter table instructors             enable row level security;
alter table courses                 enable row level security;
alter table enrollments             enable row level security;
alter table reviews                 enable row level security;
alter table warnings                enable row level security;
alter table honors                  enable row level security;
alter table complaints              enable row level security;
alter table graduation_applications enable row level security;
alter table fines                   enable row level security;
alter table taboo_words             enable row level security;
alter table required_courses        enable row level security;
alter table program_quotas          enable row level security;
alter table applications            enable row level security;
alter table system_state            enable row level security;
alter table kb_docs                 enable row level security;

-- ===== profiles: anyone authed can see basic info; only registrar writes =====
create policy "profiles read all" on profiles for select to authenticated using (true);
create policy "profiles registrar write" on profiles for all to authenticated using (is_registrar()) with check (is_registrar());

-- ===== students: own row + registrar; instructors see students in their courses =====
create policy "students self read" on students for select to authenticated
  using (user_id = auth.uid() or is_registrar()
         or exists (select 1 from enrollments e join courses c on c.id = e.course_id
                    where e.student_id = students.user_id and c.instructor_id = auth.uid()));
create policy "students registrar write" on students for all to authenticated using (is_registrar()) with check (is_registrar());

-- ===== instructors: anyone authed can read; only registrar writes =====
create policy "instructors read all" on instructors for select to authenticated using (true);
create policy "instructors registrar write" on instructors for all to authenticated using (is_registrar()) with check (is_registrar());

-- ===== courses: PUBLIC read (visitor catalog), registrar write =====
create policy "courses public read" on courses for select to anon, authenticated using (true);
create policy "courses registrar write" on courses for all to authenticated using (is_registrar()) with check (is_registrar());

-- ===== enrollments: student sees own; instructor sees their courses'; registrar all =====
create policy "enrollments scoped read" on enrollments for select to authenticated using (
  student_id = auth.uid()
  or is_registrar()
  or exists (select 1 from courses c where c.id = enrollments.course_id and c.instructor_id = auth.uid())
);
-- Inserts go through RPC; deny direct writes for non-registrar.
create policy "enrollments registrar write" on enrollments for insert to authenticated with check (is_registrar());
create policy "enrollments registrar update" on enrollments for update to authenticated using (is_registrar()) with check (is_registrar());

-- ===== reviews: visible (non-hidden) to PUBLIC; registrar sees hidden too =====
create policy "reviews public read" on reviews for select to anon, authenticated using (
  hidden = false or is_registrar()
);
-- Inserts only via submit_review RPC (security definer); block direct insert.
create policy "reviews no direct insert" on reviews for insert to authenticated with check (false);

-- ===== warnings/honors: target sees own + registrar; registrar writes =====
create policy "warnings self read" on warnings for select to authenticated using (target_id = auth.uid() or is_registrar());
create policy "warnings registrar write" on warnings for all to authenticated using (is_registrar()) with check (is_registrar());
create policy "honors self read" on honors for select to authenticated using (target_id = auth.uid() or is_registrar());
create policy "honors registrar write" on honors for all to authenticated using (is_registrar()) with check (is_registrar());

-- ===== complaints: complainant + registrar see; anyone authed can file =====
create policy "complaints scoped read" on complaints for select to authenticated using (
  from_user_id = auth.uid() or is_registrar()
);
create policy "complaints file own" on complaints for insert to authenticated with check (from_user_id = auth.uid());
create policy "complaints registrar update" on complaints for update to authenticated using (is_registrar()) with check (is_registrar());

-- ===== graduation_applications: student sees own; registrar all =====
create policy "grad self read" on graduation_applications for select to authenticated using (
  student_id = auth.uid() or is_registrar()
);
create policy "grad self file" on graduation_applications for insert to authenticated with check (student_id = auth.uid());
create policy "grad registrar decide" on graduation_applications for update to authenticated using (is_registrar()) with check (is_registrar());

-- ===== fines: student sees own; registrar all =====
create policy "fines self read" on fines for select to authenticated using (student_id = auth.uid() or is_registrar());
create policy "fines self pay" on fines for update to authenticated using (student_id = auth.uid()) with check (student_id = auth.uid());
create policy "fines registrar all" on fines for all to authenticated using (is_registrar()) with check (is_registrar());

-- ===== taboo_words: PUBLIC read; registrar writes =====
create policy "taboo public read" on taboo_words for select to anon, authenticated using (true);
create policy "taboo registrar write" on taboo_words for all to authenticated using (is_registrar()) with check (is_registrar());

-- ===== required_courses, program_quotas: PUBLIC read; registrar writes =====
create policy "required public read" on required_courses for select to anon, authenticated using (true);
create policy "required registrar write" on required_courses for all to authenticated using (is_registrar()) with check (is_registrar());
create policy "quotas public read" on program_quotas for select to anon, authenticated using (true);
create policy "quotas registrar write" on program_quotas for all to authenticated using (is_registrar()) with check (is_registrar());

-- ===== applications: anyone (incl. anon) can submit; registrar reads + decides =====
create policy "applications anon submit" on applications for insert to anon, authenticated with check (true);
create policy "applications registrar read" on applications for select to authenticated using (is_registrar());
create policy "applications registrar update" on applications for update to authenticated using (is_registrar()) with check (is_registrar());

-- ===== system_state: PUBLIC read (current phase is shown on landing); registrar writes =====
create policy "state public read" on system_state for select to anon, authenticated using (true);
create policy "state registrar write" on system_state for all to authenticated using (is_registrar()) with check (is_registrar());

-- ===== kb_docs: read scoped by role array; registrar writes =====
create policy "kb scoped read" on kb_docs for select to anon, authenticated using (
  current_role_value() = any(role_scope)
  or (auth.uid() is null and 'visitor'::role = any(role_scope))
);
create policy "kb registrar write" on kb_docs for all to authenticated using (is_registrar()) with check (is_registrar());
