-- ===== decide_application: registrar accepts/rejects; on accept, mints credentials.
-- Note: actual auth.users creation happens via Supabase Auth Admin API from the frontend
-- (we record the chosen display_id + temp_password and reference it on confirm_signup).
-- This RPC just decides the application + (optionally) links an existing auth user.
create or replace function decide_application(p_app_id bigint, p_decision application_status, p_justification text default '', p_issued_user_id uuid default null, p_temp_password text default '')
returns applications
language plpgsql security definer set search_path = public, auth as $$
declare
  v_app applications%rowtype;
begin
  if not is_registrar() then raise exception 'registrar only'; end if;
  update applications
     set status = p_decision,
         justification = coalesce(p_justification, ''),
         decided_at = now(),
         issued_user_id = p_issued_user_id,
         temp_password = coalesce(p_temp_password, '')
   where id = p_app_id
   returning * into v_app;
  if v_app.id is null then raise exception 'application not found'; end if;

  if p_decision = 'accept' and v_app.type = 'student' then
    update program_quotas set enrolled = enrolled + 1 where department = v_app.department;
  end if;

  return v_app;
end $$;
revoke all on function decide_application(bigint, application_status, text, uuid, text) from public;
grant execute on function decide_application(bigint, application_status, text, uuid, text) to authenticated;


-- ===== register_for_course: student-initiated; gates phase + cap + suspension =====
create or replace function register_for_course(p_course_id bigint)
returns enrollments
language plpgsql security definer set search_path = public, auth as $$
declare
  v_user uuid := auth.uid();
  v_state record;
  v_student record;
  v_course record;
  v_existing int;
  v_seats int;
  v_status enrollment_status;
  v_enrollment enrollments%rowtype;
begin
  if v_user is null then raise exception 'unauthenticated'; end if;
  select * into v_student from students where user_id = v_user;
  if v_student is null then raise exception 'students only'; end if;
  if v_student.status <> 'active' then raise exception 'suspended/terminated cannot register'; end if;

  select * into v_state from system_state where id = 1;
  if v_state.phase <> 2 and not v_state.special_registration_open then
    raise exception 'registration is not open in current phase';
  end if;

  select * into v_course from courses where id = p_course_id;
  if v_course is null or v_course.status <> 'active' then raise exception 'course not available'; end if;

  select count(*) into v_existing from enrollments
   where student_id = v_user and status = 'enrolled';
  if v_existing >= 4 then raise exception '4-course cap reached'; end if;

  select v_course.cap - count(*) into v_seats from enrollments
   where course_id = p_course_id and status = 'enrolled';
  v_status := case when v_seats > 0 then 'enrolled'::enrollment_status else 'waitlist'::enrollment_status end;

  insert into enrollments(student_id, course_id, status, term)
  values (v_user, p_course_id, v_status, v_course.semester)
  returning * into v_enrollment;
  return v_enrollment;
end $$;
revoke all on function register_for_course(bigint) from public;
grant execute on function register_for_course(bigint) to authenticated;


-- ===== advance_phase: registrar moves the semester forward; fires side effects =====
create or replace function advance_phase()
returns jsonb
language plpgsql security definer set search_path = public, auth as $$
declare
  v_state record;
  v_from int;
  v_summary jsonb := '{}'::jsonb;
  v_cancelled int := 0;
  v_underloaded int := 0;
  v_warned int := 0;
  v_suspended int := 0;
  r record;
  cancelled_codes text[];
begin
  if not is_registrar() then raise exception 'registrar only'; end if;
  select * into v_state from system_state where id = 1;
  v_from := v_state.phase;
  if v_from >= 4 then raise exception 'already at final phase'; end if;

  if v_from = 2 then
    -- find courses with <3 enrollments → cancel + drop enrollments
    cancelled_codes := array(
      select c.code from courses c
       where c.semester = v_state.current_semester and c.status = 'active'
         and (select count(*) from enrollments e where e.course_id = c.id and e.status = 'enrolled') < 3
    );

    update courses set status = 'cancelled'
     where semester = v_state.current_semester
       and code = any(cancelled_codes);

    update enrollments set status = 'cancelled'
     where course_id in (select id from courses where code = any(cancelled_codes))
       and status = 'enrolled';

    v_cancelled := array_length(cancelled_codes, 1);

    -- per instructor: warn (some cancelled) or suspend (all cancelled)
    for r in
      select c.instructor_id,
             count(*) filter (where c.code = any(cancelled_codes)) as cancelled_n,
             count(*) as total_n
        from courses c
       where c.semester = v_state.current_semester
       group by c.instructor_id
    loop
      if r.cancelled_n = 0 then continue; end if;
      if r.cancelled_n = r.total_n then
        update instructors set status = 'suspended' where user_id = r.instructor_id;
        insert into warnings(target_id, target_type, reason)
        select r.instructor_id, 'instructor', 'All assigned courses cancelled — suspended; cannot teach next semester' from generate_series(1,3);
        v_suspended := v_suspended + 1;
      else
        insert into warnings(target_id, target_type, reason)
        values (r.instructor_id, 'instructor',
                format('%s of your course%s cancelled — fewer than 3 students enrolled',
                       r.cancelled_n, case when r.cancelled_n>1 then 's' else '' end));
        v_warned := v_warned + 1;
      end if;
    end loop;

    -- underloaded + displaced students
    for r in
      select s.user_id, p.full_name,
             (select count(*) from enrollments e where e.student_id = s.user_id and e.status = 'enrolled') as remaining
        from students s join profiles p on p.id = s.user_id
       where s.status = 'active'
    loop
      if r.remaining < 2 then
        insert into warnings(target_id, target_type, reason)
        values (r.user_id, 'student', format('Active courseload below 2 (%s)', r.remaining));
        v_underloaded := v_underloaded + 1;
      end if;
    end loop;

    if v_cancelled > 0 then
      update system_state set special_registration_open = true where id = 1;
    end if;
  end if;

  update system_state set phase = v_from + 1 where id = 1;
  v_summary := jsonb_build_object(
    'from', v_from, 'to', v_from + 1,
    'cancelled', coalesce(v_cancelled,0),
    'instructors_warned', v_warned,
    'instructors_suspended', v_suspended,
    'students_underloaded', v_underloaded,
    'cancelled_codes', coalesce(to_jsonb(cancelled_codes), '[]'::jsonb)
  );
  return v_summary;
end $$;
revoke all on function advance_phase() from public;
grant execute on function advance_phase() to authenticated;


-- ===== resolve_complaint: registrar action triggers warning issuance =====
create or replace function resolve_complaint(p_id bigint, p_action complaint_status, p_note text default '')
returns complaints
language plpgsql security definer set search_path = public, auth as $$
declare
  v_c complaints%rowtype;
  v_target_role role;
  v_from_role role;
begin
  if not is_registrar() then raise exception 'registrar only'; end if;
  update complaints
     set status = p_action, resolved_at = now(), resolution_note = coalesce(p_note,'')
   where id = p_id
   returning * into v_c;
  if v_c.id is null then raise exception 'complaint not found'; end if;

  if p_action = 'warn-target' then
    select role into v_target_role from profiles where id = v_c.target_id;
    insert into warnings(target_id, target_type, reason)
    values (v_c.target_id, v_target_role::text, format('Complaint upheld: %s', left(v_c.body, 60) || '…'));
  elsif p_action = 'warn-complainant' then
    select role into v_from_role from profiles where id = v_c.from_user_id;
    insert into warnings(target_id, target_type, reason)
    values (v_c.from_user_id, v_from_role::text, format('Frivolous complaint against %s', v_c.target_id));
  end if;

  return v_c;
end $$;
revoke all on function resolve_complaint(bigint, complaint_status, text) from public;
grant execute on function resolve_complaint(bigint, complaint_status, text) to authenticated;


-- ===== redeem_honor: trade an honor credit for retiring an active warning =====
create or replace function redeem_honor(p_honor_id bigint, p_warning_id bigint)
returns honors
language plpgsql security definer set search_path = public, auth as $$
declare
  v_h honors%rowtype;
  v_w warnings%rowtype;
begin
  select * into v_h from honors where id = p_honor_id;
  select * into v_w from warnings where id = p_warning_id;
  if v_h is null or v_w is null then raise exception 'not found'; end if;
  if v_h.target_id <> v_w.target_id then raise exception 'mismatched target'; end if;
  if not (v_h.target_id = auth.uid() or is_registrar()) then raise exception 'not yours'; end if;
  if v_h.redeemed then raise exception 'honor already redeemed'; end if;
  if not v_w.active then raise exception 'warning already retired'; end if;

  update warnings set active = false where id = p_warning_id;
  update honors set redeemed = true, redeemed_warning_id = p_warning_id
   where id = p_honor_id returning * into v_h;
  return v_h;
end $$;
revoke all on function redeem_honor(bigint, bigint) from public;
grant execute on function redeem_honor(bigint, bigint) to authenticated;
