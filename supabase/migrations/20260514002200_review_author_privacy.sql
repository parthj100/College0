-- §5: "no one else except the registrars knows who rated which class."
-- The reviews RLS hides hidden rows from non-registrars but did NOT hide the
-- author_id column. Use a column-level revoke (table-level grant must go too,
-- otherwise it covers all columns implicitly).
revoke select on public.reviews from anon, authenticated;
grant select (id, course_id, rating, body, taboo_count, hidden, created_at)
  on public.reviews to anon, authenticated;

-- Registrars need author_id. Expose it via a security-definer view that gates
-- by is_registrar() so non-registrars get an empty result set even if they
-- query the view.
drop view if exists reviews_with_authors;
create view reviews_with_authors with (security_invoker = false) as
  select id, course_id, author_id, rating, body, taboo_count, hidden, created_at
  from reviews
  where is_registrar();
grant select on reviews_with_authors to authenticated;
