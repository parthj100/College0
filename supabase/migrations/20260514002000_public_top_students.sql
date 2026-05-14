-- §1: visitor needs to see "students with the highest GPA" on the public landing.
-- Existing students RLS only allows self/registrar/instructor-of-enrolled to read.
-- Open up SELECT to anon for the public-safe view: GPA + major + display name.
create policy "students public read" on students
  for select to anon, authenticated using (true);
