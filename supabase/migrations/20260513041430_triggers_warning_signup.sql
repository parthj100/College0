-- Spec §7: 3 active warnings on a student → suspend + assess fine.
-- Spec §5: 3 warnings on an instructor → suspend.
create or replace function on_warning_inserted()
returns trigger
language plpgsql security definer set search_path = public as $$
declare
  v_count int;
  v_role role;
begin
  if not new.active then return new; end if;
  select count(*) into v_count from warnings where target_id = new.target_id and active = true;
  if v_count < 3 then return new; end if;

  select role into v_role from profiles where id = new.target_id;
  if v_role = 'student' then
    update students set status = 'suspended'
     where user_id = new.target_id and status not in ('terminated','graduated');
    insert into fines(student_id, amount, paid, reason)
    values (new.target_id, 250.00, false, 'Suspension reinstatement fee')
    on conflict (student_id) do nothing;
  elsif v_role = 'instructor' then
    update instructors set status = 'suspended'
     where user_id = new.target_id and status <> 'fired';
  end if;
  return new;
end $$;

create trigger trg_warning_inserted
after insert on warnings
for each row execute function on_warning_inserted();


-- When Supabase Auth creates a new user (via the Auth API), auto-create a profile row.
-- The frontend should set raw_user_meta_data with display_id/full_name/role on signup.
create or replace function handle_new_auth_user()
returns trigger
language plpgsql security definer set search_path = public, auth as $$
declare
  v_display_id text := new.raw_user_meta_data ->> 'display_id';
  v_full_name  text := coalesce(new.raw_user_meta_data ->> 'full_name', '');
  v_role_text  text := coalesce(new.raw_user_meta_data ->> 'role', 'visitor');
  v_must_chg   boolean := coalesce((new.raw_user_meta_data ->> 'must_change_password')::boolean, false);
begin
  if v_display_id is null then
    -- fall back to deterministic id so we never block signup
    v_display_id := 'u-' || substr(new.id::text, 1, 8);
  end if;
  insert into profiles(id, display_id, full_name, role, must_change_password)
  values (new.id, v_display_id, v_full_name, v_role_text::role, v_must_chg)
  on conflict (id) do nothing;
  return new;
end $$;

create trigger trg_auth_user_created
after insert on auth.users
for each row execute function handle_new_auth_user();
