begin;
select plan(10);

select tests.create_student('asha@example.com') as asha_id \gset
select tests.create_student('ravi@example.com') as ravi_id \gset

select tests.create_subject(:'asha_id', 'Machine Learning') as asha_subject_id \gset
select tests.create_subject(:'ravi_id', 'Physics') as ravi_subject_id \gset

insert into public.documents (user_id, subject_id, file_name, storage_path, mime_type, size_bytes, content_hash)
values (:'asha_id', :'asha_subject_id', 'ml-notes.pdf', :'asha_id' || '/ml-notes.pdf',
  'application/pdf', 1024, repeat('a', 64))
returning id as asha_document_id \gset

insert into public.document_sections (user_id, document_id, position, content, page_start, page_end)
values (:'asha_id', :'asha_document_id', 0, 'Unit 3: Linear Regression', 4, 6)
returning id as asha_section_id \gset

insert into public.document_chunks (user_id, subject_id, document_id, section_id, position, content, page_number)
values (:'asha_id', :'asha_subject_id', :'asha_document_id', :'asha_section_id', 0,
  'Gradient descent updates weights against the gradient.', 5);

select throws_ok(
  format(
    $$ insert into public.document_chunks (user_id, subject_id, document_id, section_id, position, content, page_number)
       values (%L, %L, %L, %L, 1, 'Mismatched subject', 5) $$,
    :'asha_id', :'ravi_subject_id', :'asha_document_id', :'asha_section_id'
  ),
  '23503',
  null,
  'a chunk cannot point at a subject other than its document''s'
);

select throws_ok(
  format(
    $$ insert into public.documents (user_id, subject_id, file_name, storage_path, mime_type, size_bytes, content_hash)
       values (%L, %L, 'x.pdf', 'x/x.pdf', 'application/pdf', 10, %L) $$,
    :'ravi_id', :'asha_subject_id', repeat('b', 64)
  ),
  '23503',
  null,
  'a document cannot be filed under another student''s subject'
);

select throws_ok(
  format(
    $$ insert into public.documents (user_id, subject_id, file_name, storage_path, mime_type, size_bytes, content_hash)
       values (%L, %L, 'tool.zip', 'z/tool.zip', 'application/zip', 10, %L) $$,
    :'asha_id', :'asha_subject_id', repeat('c', 64)
  ),
  '23514',
  null,
  'zip files are not accepted as documents'
);

select ok(
  (select search_text @@ websearch_to_tsquery('english', 'gradient descent') from public.document_chunks
   where document_id = :'asha_document_id'),
  'chunks are searchable by keyword'
);

select tests.sign_in_as(:'asha_id');

select results_eq(
  $$ select count(*)::int from public.document_chunks $$,
  array[1],
  'a student can read their own chunks'
);

select throws_ok(
  format(
    $$ insert into public.documents (user_id, subject_id, file_name, storage_path, mime_type, size_bytes, content_hash)
       values (%L, %L, 'a.pdf', 'a/a.pdf', 'application/pdf', 10, %L) $$,
    :'asha_id', :'asha_subject_id', repeat('d', 64)
  ),
  '42501',
  null,
  'a student cannot register documents directly; uploads go through the server'
);

select throws_ok(
  format($$ update public.documents set status = 'ready' where id = %L $$, :'asha_document_id'),
  '42501',
  null,
  'a student cannot change a document''s status'
);

reset role;
select tests.sign_in_as(:'ravi_id');

select is_empty(
  $$ select id from public.documents union all select id from public.document_chunks $$,
  'a student cannot see another student''s documents or chunks'
);

select throws_ok(
  format($$ delete from public.documents where id = %L $$, :'asha_document_id'),
  '42501',
  null,
  'students delete notes only through the server, which also removes their files'
);

reset role;
delete from public.documents where id = :'asha_document_id';

select is_empty(
  format($$ select id from public.document_chunks where document_id = %L $$, :'asha_document_id'),
  'deleting a document also deletes its sections and chunks'
);

select * from finish();
rollback;
