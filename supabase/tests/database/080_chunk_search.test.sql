begin;
select plan(5);

select tests.create_student('asha@example.com') as asha_id \gset
select tests.create_student('ravi@example.com') as ravi_id \gset
select tests.create_subject(:'asha_id', 'Machine Learning') as asha_subject_id \gset
select tests.create_subject(:'ravi_id', 'Machine Learning') as ravi_subject_id \gset

create function pg_temp.add_chunk(student uuid, subject uuid, content text, direction integer)
returns void
language plpgsql
as $$
declare
  new_document_id uuid;
  new_section_id uuid;
  embedding_values real[] := array_fill(0::real, array[1024]);
begin
  embedding_values[direction] := 1;
  insert into public.documents (user_id, subject_id, file_name, storage_path, mime_type, size_bytes, content_hash)
  values (student, subject, 'notes.md', student || '/' || gen_random_uuid() || '.md', 'text/markdown', 10,
    encode(sha256(convert_to(content, 'UTF8')), 'hex'))
  returning id into new_document_id;
  insert into public.document_sections (user_id, document_id, position, content, page_start, page_end)
  values (student, new_document_id, 0, content, 1, 1)
  returning id into new_section_id;
  insert into public.document_chunks (user_id, subject_id, document_id, section_id, position, content, page_number, embedding)
  values (student, subject, new_document_id, new_section_id, 0, content, 1, embedding_values::extensions.vector);
end;
$$;

select pg_temp.add_chunk(:'asha_id', :'asha_subject_id', 'Gradient descent lowers the loss step by step.', 1);
select pg_temp.add_chunk(:'asha_id', :'asha_subject_id', 'Overfitting means the model memorises training data.', 2);
select pg_temp.add_chunk(:'ravi_id', :'ravi_subject_id', 'Gradient descent in Ravi''s notes.', 1);

select ('[0,1' || repeat(',0', 1022) || ']') as query_vector \gset

select tests.sign_in_as_server();

select results_eq(
  format(
    $$ select chunk.content from public.search_chunks(%L, %L, %L::extensions.vector, 'zzz', 1) as result
       join public.document_chunks as chunk on chunk.id = result.chunk_id $$,
    :'asha_id', :'asha_subject_id', :'query_vector'
  ),
  array['Overfitting means the model memorises training data.'],
  'vector search finds the nearest chunk even with no matching words'
);

select results_eq(
  format(
    $$ select chunk.content from public.search_chunks(%L, %L, %L::extensions.vector, 'gradient descent', 5) as result
       join public.document_chunks as chunk on chunk.id = result.chunk_id order by result.score desc, chunk.content $$,
    :'asha_id', :'asha_subject_id', :'query_vector'
  ),
  array['Gradient descent lowers the loss step by step.', 'Overfitting means the model memorises training data.'],
  'a chunk found by both keywords and vectors ranks first'
);

select is_empty(
  format(
    $$ select chunk.user_id from public.search_chunks(%L, %L, %L::extensions.vector, 'gradient', 50) as result
       join public.document_chunks as chunk on chunk.id = result.chunk_id where chunk.user_id <> %L $$,
    :'asha_id', :'asha_subject_id', :'query_vector', :'asha_id'
  ),
  'search never returns another student''s chunks'
);

reset role;
select tests.sign_in_as(:'asha_id');

select throws_ok(
  format(
    $$ select * from public.search_chunks(%L, %L, %L::extensions.vector, 'gradient', 5) $$,
    :'ravi_id', :'ravi_subject_id', :'query_vector'
  ),
  '42501',
  null,
  'a student cannot call search directly to read someone else''s notes'
);

select tests.sign_in_as_anonymous();

select throws_ok(
  format(
    $$ select * from public.search_chunks(%L, %L, %L::extensions.vector, 'gradient', 5) $$,
    :'asha_id', :'asha_subject_id', :'query_vector'
  ),
  '42501',
  null,
  'visitors cannot call search'
);

select * from finish();
rollback;
