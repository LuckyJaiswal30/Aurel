create function public.search_chunks(
  student_id uuid,
  subject_id uuid,
  query_embedding extensions.vector(1024),
  query_text text,
  match_count integer default 20
)
returns table (chunk_id uuid, score double precision)
language sql
stable
set search_path = ''
as $$
  with vector_matches as (
    select chunk.id,
      row_number() over (order by chunk.embedding operator(extensions.<=>) search_chunks.query_embedding) as rank
    from public.document_chunks as chunk
    where chunk.user_id = search_chunks.student_id
      and chunk.subject_id = search_chunks.subject_id
      and chunk.embedding is not null
    order by chunk.embedding operator(extensions.<=>) search_chunks.query_embedding
    limit least(search_chunks.match_count, 50) * 2
  ),
  keyword_matches as (
    select chunk.id,
      row_number() over (order by ts_rank_cd(chunk.search_text, query.terms) desc) as rank
    from public.document_chunks as chunk,
      lateral (
        select websearch_to_tsquery('english'::regconfig, search_chunks.query_text)
          || websearch_to_tsquery('simple'::regconfig, search_chunks.query_text) as terms
      ) as query
    where chunk.user_id = search_chunks.student_id
      and chunk.subject_id = search_chunks.subject_id
      and chunk.search_text @@ query.terms
    order by ts_rank_cd(chunk.search_text, query.terms) desc
    limit least(search_chunks.match_count, 50) * 2
  )
  select coalesce(vector_matches.id, keyword_matches.id) as chunk_id,
    coalesce(1.0 / (60 + vector_matches.rank), 0.0)
      + coalesce(1.0 / (60 + keyword_matches.rank), 0.0) as score
  from vector_matches
  full outer join keyword_matches on keyword_matches.id = vector_matches.id
  order by score desc
  limit least(search_chunks.match_count, 50);
$$;

revoke execute on function public.search_chunks from public, anon, authenticated;
grant execute on function public.search_chunks to service_role;
