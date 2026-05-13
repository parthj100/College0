-- Helper RPC the ai-query edge function can call once embeddings exist.
-- Cosine similarity match, role-scoped, top-k.
create or replace function match_kb_docs(query_embedding vector(1536), p_role role, p_k int default 3)
returns table(id bigint, title text, body text, source text, distance float)
language sql stable security definer set search_path = public as $$
  select d.id, d.title, d.body, d.source,
         (d.embedding <=> query_embedding) as distance
    from kb_docs d
   where d.embedding is not null
     and p_role = any(d.role_scope)
   order by d.embedding <=> query_embedding
   limit p_k
$$;
grant execute on function match_kb_docs(vector, role, int) to anon, authenticated;
