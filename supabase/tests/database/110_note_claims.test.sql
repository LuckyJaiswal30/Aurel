begin;
select plan(5);

select tests.create_student('asha@example.com') as asha_id \gset
select tests.create_student('ravi@example.com') as ravi_id \gset
select tests.create_subject(:'asha_id', 'Machine Learning') as asha_subject_id \gset

insert into public.documents (user_id, subject_id, file_name, storage_path, mime_type, size_bytes, content_hash, status)
values (:'asha_id', :'asha_subject_id', 'ml.pdf', :'asha_id' || '/ml.pdf', 'application/pdf', 10, repeat('a', 64), 'held_for_confirmation')
returning id as note_id \gset

select tests.sign_in_as(:'asha_id');

select throws_ok(
  format($$ select public.claim_note_job(%L, %L, array['held_for_confirmation']::public.document_status[], 'reading', array[]::public.document_status[], now()) $$, :'note_id', :'asha_id'),
  '42501', null,
  'a student cannot claim jobs directly'
);

reset role;
select tests.sign_in_as_server();

select is(
  public.claim_note_job(:'note_id', :'ravi_id', array['held_for_confirmation']::public.document_status[], 'reading', array[]::public.document_status[], now()),
  false,
  'a job cannot be claimed for another student''s note'
);

select is(
  public.claim_note_job(:'note_id', :'asha_id', array['held_for_confirmation']::public.document_status[], 'reading', array[]::public.document_status[], now()),
  true,
  'the first confirm claims the job'
);

select is(
  public.claim_note_job(:'note_id', :'asha_id', array['held_for_confirmation']::public.document_status[], 'reading', array[]::public.document_status[], now()),
  false,
  'a second confirm at the same time does not start a second job'
);

select is(
  public.claim_note_job(:'note_id', :'asha_id', array['failed']::public.document_status[], 'checking', array['reading']::public.document_status[], now() + interval '1 minute'),
  true,
  'a stuck job can be claimed again for a retry'
);

select * from finish();
rollback;
