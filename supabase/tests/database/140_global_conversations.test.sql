begin;
select plan(3);

select tests.create_student('asha@example.com') as asha_id \gset
select tests.create_student('ravi@example.com') as ravi_id \gset
select tests.create_subject(:'ravi_id', 'Physics') as ravi_subject_id \gset

select tests.sign_in_as(:'asha_id');

select lives_ok(
  $$ insert into public.conversations (title) values ('What is entropy?') $$,
  'a student can start a general chat without a subject'
);

select throws_ok(
  format($$ insert into public.conversations (subject_id, title) values (%L, 'Taken') $$, :'ravi_subject_id'),
  '23503', null,
  'a subject chat still has to be in the student''s own subject'
);

reset role;
select tests.sign_in_as(:'ravi_id');

select is_empty(
  $$ select id from public.conversations where subject_id is null $$,
  'another student cannot see a general chat'
);

select * from finish();
rollback;
