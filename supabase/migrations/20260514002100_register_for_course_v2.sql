-- Spec §3: "no time conflict among chosen classes" + "A student can retake the
-- same class if s/he got an F before."
-- Add both checks to register_for_course; existing behaviour preserved.
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
  v_conflict int;
  v_passed_before int;
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

  -- Spec §3: retake-after-F check. You can re-enroll only if you previously failed
  -- this exact code (any semester) — passing once locks you out.
  select count(*) into v_passed_before from enrollments e
    join courses c on c.id = e.course_id
    where e.student_id = v_user
      and c.code = v_course.code
      and e.grade <> '' and e.grade <> 'F';
  if v_passed_before > 0 then raise exception 'already passed this course'; end if;

  -- 4-course cap
  select count(*) into v_existing from enrollments
    where student_id = v_user and status = 'enrolled';
  if v_existing >= 4 then raise exception '4-course cap reached'; end if;

  -- Time conflict against current term's enrolled courses
  select count(*) into v_conflict from enrollments e
    join courses c on c.id = e.course_id
    where e.student_id = v_user
      and e.status = 'enrolled'
      and c.semester = v_course.semester
      and c.day_mask && v_course.day_mask          -- any overlapping day
      and not (v_course.end_hour <= c.start_hour or v_course.start_hour >= c.end_hour);
  if v_conflict > 0 then raise exception 'time conflict with another enrolled course'; end if;

  -- Cap → enrolled or waitlist
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


-- Spec §3: "if the limit is reached, the student is put on the wait-list that
-- only the course instructor can let in." Add admit_from_waitlist RPC.
create or replace function admit_from_waitlist(p_enrollment_id bigint)
returns enrollments
language plpgsql security definer set search_path = public, auth as $$
declare
  v_caller uuid := auth.uid();
  v_caller_role role;
  v_e enrollments%rowtype;
  v_course courses%rowtype;
  v_seats int;
begin
  if v_caller is null then raise exception 'unauthenticated'; end if;
  select role into v_caller_role from profiles where id = v_caller;
  select * into v_e from enrollments where id = p_enrollment_id;
  if v_e.id is null then raise exception 'enrollment not found'; end if;
  if v_e.status <> 'waitlist' then raise exception 'not on waitlist'; end if;
  select * into v_course from courses where id = v_e.course_id;
  if v_course.instructor_id <> v_caller and v_caller_role <> 'registrar' then
    raise exception 'only the course instructor can admit from waitlist';
  end if;
  -- Make sure there's a seat — auto-fail if cap is full
  select v_course.cap - count(*) into v_seats from enrollments
    where course_id = v_course.id and status = 'enrolled';
  if v_seats <= 0 then raise exception 'no seats available'; end if;
  update enrollments set status = 'enrolled' where id = p_enrollment_id
    returning * into v_e;
  return v_e;
end $$;
revoke all on function admit_from_waitlist(bigint) from public;
grant execute on function admit_from_waitlist(bigint) to authenticated;
