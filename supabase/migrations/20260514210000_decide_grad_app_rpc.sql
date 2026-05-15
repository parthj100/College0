-- Spec §6: registrar decides graduation. On reject-reckless, the student gets
-- one warning. On approved, the student's status flips to graduated. Atomic
-- so the dashboards can't show "approved without warning" or vice versa.
create or replace function decide_grad_app(p_id bigint, p_decision grad_app_status)
returns graduation_applications
language plpgsql security definer set search_path = public, auth as $$
declare
  v_app graduation_applications%rowtype;
  v_student_name text;
begin
  if not is_registrar() then raise exception 'registrar only'; end if;
  select * into v_app from graduation_applications where id = p_id;
  if v_app.id is null then raise exception 'graduation application not found'; end if;

  update graduation_applications
     set status = p_decision, decided_at = now()
   where id = p_id
   returning * into v_app;

  select full_name into v_student_name from profiles where id = v_app.student_id;

  if p_decision = 'reject-reckless' then
    insert into warnings(target_id, target_type, reason)
    values (v_app.student_id, 'student',
            'Reckless graduation application — required courses missing: ' ||
            coalesce(array_to_string(v_app.missing_codes, ', '), '?'));
  elsif p_decision = 'approved' then
    update students set status = 'graduated' where user_id = v_app.student_id;
  end if;

  return v_app;
end $$;

revoke all on function decide_grad_app(bigint, grad_app_status) from public;
grant execute on function decide_grad_app(bigint, grad_app_status) to authenticated;
