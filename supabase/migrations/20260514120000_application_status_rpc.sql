-- Public lookup: applicant enters their email, gets back their status (+
-- temp credentials if accepted). No auth needed — locked to single-row
-- exact-email lookup so it can't be used to enumerate.
create or replace function get_application_status(p_email text)
returns table(
  status text,
  filed_at timestamptz,
  decided_at timestamptz,
  justification text,
  display_id text,
  temp_password text,
  must_change_password boolean
)
language plpgsql stable security definer set search_path = public, auth as $$
declare
  v_app applications%rowtype;
  v_display text;
  v_must boolean;
begin
  select * into v_app from applications where lower(email) = lower(p_email) order by filed_at desc limit 1;
  if v_app.id is null then return; end if;

  if v_app.issued_user_id is not null then
    select p.display_id, p.must_change_password into v_display, v_must
      from profiles p where p.id = v_app.issued_user_id;
  end if;

  return query select
    v_app.status::text,
    v_app.filed_at,
    v_app.decided_at,
    v_app.justification,
    coalesce(v_display, ''),
    coalesce(v_app.temp_password, ''),
    coalesce(v_must, false);
end $$;

revoke all on function get_application_status(text) from public;
grant execute on function get_application_status(text) to anon, authenticated;
