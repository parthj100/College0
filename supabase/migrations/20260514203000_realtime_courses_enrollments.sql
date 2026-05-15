-- Course adds/edits and new enrollments need to push to subscribed clients
-- so the registration page reflects them in real time.
do $$ begin
  execute 'alter publication supabase_realtime add table courses';
exception when duplicate_object then null; end $$;
do $$ begin
  execute 'alter publication supabase_realtime add table enrollments';
exception when duplicate_object then null; end $$;
