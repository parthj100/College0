-- ===== submit_review: scan taboo, mask/hide, issue author warnings, recompute avg =====
create or replace function submit_review(p_course_id bigint, p_rating int, p_body text)
returns reviews
language plpgsql security definer set search_path = public, auth as $$
declare
  v_user uuid := auth.uid();
  v_taboo text[];
  v_hits int := 0;
  v_masked text := p_body;
  v_hidden boolean := false;
  v_word text;
  v_state record;
  v_review reviews%rowtype;
  v_already_graded boolean;
begin
  if v_user is null then raise exception 'unauthenticated'; end if;
  if (select role from profiles where id = v_user) != 'student' then
    raise exception 'only students may post reviews';
  end if;
  if not is_enrolled_in(p_course_id) then
    raise exception 'must be enrolled to review';
  end if;

  -- spec §3-§4: reviews open during phase 3+ (class running / grading), unless graded
  select * into v_state from system_state where id = 1;
  if v_state.phase < 3 then raise exception 'reviews open during class-running period'; end if;

  select exists (select 1 from enrollments where course_id = p_course_id and grade <> '') into v_already_graded;
  if v_already_graded then raise exception 'reviews are closed: grades posted'; end if;

  -- count + mask taboo
  select array_agg(word) into v_taboo from taboo_words;
  if v_taboo is not null then
    foreach v_word in array v_taboo loop
      if p_body ~* ('\m' || regexp_replace(v_word, '([\.\^\$\*\+\?\(\)\[\]\{\}\\\|])', '\\\1', 'g') || '\M') then
        v_hits := v_hits + 1;
        v_masked := regexp_replace(v_masked,
          '\m' || regexp_replace(v_word, '([\.\^\$\*\+\?\(\)\[\]\{\}\\\|])', '\\\1', 'g') || '\M',
          '[' || repeat('*', greatest(length(v_word), 3)) || ']',
          'gi');
      end if;
    end loop;
  end if;
  v_hidden := v_hits >= 3;

  insert into reviews(course_id, author_id, rating, body, taboo_count, hidden)
  values (p_course_id, v_user, p_rating, v_masked, v_hits, v_hidden)
  returning * into v_review;

  if v_hits >= 1 then
    insert into warnings(target_id, target_type, reason)
    values (v_user, 'student', format('Review of course %s contained %s taboo word(s)', p_course_id, v_hits));
  end if;
  if v_hidden then
    insert into warnings(target_id, target_type, reason)
    values (v_user, 'student', format('Second warning — review of course %s hidden', p_course_id));
  end if;

  -- recompute avg + auto-flag instructor if avg < 2.0
  with avg_calc as (
    select avg(rating)::numeric(3,2) as a from reviews where course_id = p_course_id and hidden = false
  )
  update courses set avg_rating = (select a from avg_calc) where id = p_course_id;
  perform 1 from courses c
   where c.id = p_course_id and c.avg_rating < 2.0
     and not exists (
       select 1 from warnings w
       where w.target_id = c.instructor_id and w.active
         and w.reason ilike format('%%rating below 2.0 (course %s)%%', p_course_id)
     );
  if found then
    insert into warnings(target_id, target_type, reason)
    select c.instructor_id, 'instructor', format('Class avg rating below 2.0 (course %s) — auto-flagged', p_course_id)
    from courses c where c.id = p_course_id;
  end if;

  return v_review;
end $$;

revoke all on function submit_review(bigint,int,text) from public;
grant execute on function submit_review(bigint,int,text) to authenticated;


-- ===== record_grades: write each grade, recompute GPA, fire honors/terminations/outliers =====
create or replace function record_grades(p_course_id bigint, p_grades jsonb)
returns jsonb
language plpgsql security definer set search_path = public, auth as $$
declare
  v_state record;
  v_course record;
  v_caller uuid := auth.uid();
  v_caller_role role;
  k text;
  v text;
  v_points numeric(4,2);
  v_grade_map jsonb := '{"A":4.0,"A-":3.67,"B+":3.33,"B":3.0,"B-":2.67,"C+":2.33,"C":2.0,"F":0.0}'::jsonb;
  v_count int := 0;
  v_total int;
  v_avg numeric;
  r record;
  v_cum numeric; v_sem numeric; v_repeated_F boolean; v_multi_sem boolean;
begin
  if v_caller is null then raise exception 'unauthenticated'; end if;
  select role into v_caller_role from profiles where id = v_caller;
  select * into v_course from courses where id = p_course_id;
  if v_course is null then raise exception 'course not found'; end if;
  if v_course.instructor_id <> v_caller and v_caller_role <> 'registrar' then
    raise exception 'not your course';
  end if;
  select * into v_state from system_state where id = 1;
  if v_state.phase <> 4 then raise exception 'grading opens in phase 4'; end if;

  for k, v in select * from jsonb_each_text(p_grades) loop
    if not v_grade_map ? v then continue; end if;
    v_points := (v_grade_map ->> v)::numeric;
    update enrollments
       set grade = v, grade_points = v_points, status = 'completed'
     where course_id = p_course_id
       and student_id = (select id from profiles where display_id = k);
    if found then v_count := v_count + 1; end if;
  end loop;

  -- did instructor grade everyone?
  select count(*) into v_total from enrollments
   where course_id = p_course_id and status in ('enrolled','completed');
  if v_count < v_total then
    insert into warnings(target_id, target_type, reason)
    values (v_course.instructor_id, 'instructor',
            format('Did not grade all students in %s (%s/%s)', v_course.code, v_count, v_total));
  end if;

  -- class GPA outlier
  select avg(grade_points) into v_avg from enrollments
   where course_id = p_course_id and grade_points is not null;
  if v_avg is not null and v_avg < 2.5 then
    insert into warnings(target_id, target_type, reason)
    values (v_course.instructor_id, 'instructor',
            format('Class GPA %s below 2.5 in %s — registrar review required', round(v_avg,2), v_course.code));
  elsif v_avg is not null and v_avg > 3.5 then
    insert into warnings(target_id, target_type, reason)
    values (v_course.instructor_id, 'instructor',
            format('Class GPA %s above 3.5 in %s — registrar review required', round(v_avg,2), v_course.code));
  end if;

  -- recompute each student's standing
  for r in
    select distinct e.student_id, p.full_name, s.major, s.status as st_status
      from enrollments e
      join profiles p on p.id = e.student_id
      join students s on s.user_id = e.student_id
     where e.course_id = p_course_id
  loop
    select avg(grade_points) into v_cum from enrollments where student_id = r.student_id and grade_points is not null;
    select avg(grade_points) into v_sem from enrollments where student_id = r.student_id and term = v_course.semester and grade_points is not null;
    if v_sem is null then v_sem := v_cum; end if;

    update students
       set cached_cum_gpa = round(coalesce(v_cum,0),2),
           cached_sem_gpa = round(coalesce(v_sem,0),2),
           completed_classes = (select count(*) from enrollments where student_id = r.student_id and status = 'completed')
     where user_id = r.student_id;

    -- two F's same course → terminate
    select exists(
      select 1 from enrollments
       where student_id = r.student_id and grade = 'F'
       group by course_id having count(*) >= 2
    ) into v_repeated_F;

    if v_cum is not null and (v_cum < 2.0 or v_repeated_F) then
      update students set status = 'terminated' where user_id = r.student_id;
      insert into warnings(target_id, target_type, reason) values
        (r.student_id, 'student', format('Auto-terminated — %s',
          case when v_repeated_F then 'failed same course twice' else format('cum GPA %s < 2.0', round(v_cum,2)) end)),
        (r.student_id, 'student', 'Termination marker (auto)'),
        (r.student_id, 'student', 'Termination marker (auto)');
    elsif v_cum is not null and v_cum >= 2.0 and v_cum <= 2.25 then
      insert into warnings(target_id, target_type, reason)
      values (r.student_id, 'student', format('Cum GPA %s — registrar interview required', round(v_cum,2)));
    end if;

    select count(distinct term) > 1 into v_multi_sem from enrollments where student_id = r.student_id and grade_points is not null;
    if v_sem is not null and (v_sem >= 3.75 or (v_multi_sem and v_cum >= 3.50)) then
      insert into honors(target_id, reason) values
        (r.student_id,
         case when v_sem >= 3.75 then format('Sem GPA %s', round(v_sem,2))
              else format('Cum GPA %s', round(v_cum,2)) end);
    end if;
  end loop;

  return jsonb_build_object('graded', v_count, 'total', v_total, 'class_gpa', round(coalesce(v_avg,0),2));
end $$;

revoke all on function record_grades(bigint,jsonb) from public;
grant execute on function record_grades(bigint,jsonb) to authenticated;
