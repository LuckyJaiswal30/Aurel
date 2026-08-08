begin;
select plan(9);

select tests.create_student('asha@example.com') as asha_id \gset
select tests.create_student('ravi@example.com') as ravi_id \gset

select tests.sign_in_as(:'asha_id');

select lives_ok(
  $$ insert into public.subjects (name) values ('Machine Learning') $$,
  'a student can create a subject'
);

select is(
  (select user_id from public.subjects where name = 'Machine Learning'),
  :'asha_id'::uuid,
  'a new subject belongs to the student who created it'
);

select throws_ok(
  format($$ insert into public.subjects (name, user_id) values ('Physics', %L) $$, :'ravi_id'),
  '42501',
  null,
  'a student cannot create a subject for someone else'
);

select throws_ok(
  $$ insert into public.subjects (name) values ('  machine learning ') $$,
  '23505',
  null,
  'subject names are unique per student, ignoring case and spaces'
);

select throws_ok(
  $$ insert into public.subjects (name) values ('   ') $$,
  '23514',
  null,
  'a subject needs a real name'
);

select id as asha_subject_id from public.subjects where name = 'Machine Learning' \gset

reset role;
select tests.sign_in_as(:'ravi_id');

select is_empty(
  $$ select id from public.subjects $$,
  'a student cannot see another student''s subjects'
);

select is_empty(
  format($$ update public.subjects set name = 'Taken' where id = %L returning id $$, :'asha_subject_id'),
  'a student cannot rename another student''s subject'
);

select throws_ok(
  format($$ delete from public.subjects where id = %L $$, :'asha_subject_id'),
  '42501',
  null,
  'students delete subjects only through the server, which also removes their files'
);

reset role;
insert into public.subjects (user_id, name)
select :'ravi_id', 'Subject ' || number from generate_series(1, 50) as number;
select tests.sign_in_as(:'ravi_id');

select throws_ok(
  $$ insert into public.subjects (name) values ('One too many') $$,
  'P0001',
  'subject limit reached',
  'a student cannot create more than 50 subjects'
);

select * from finish();
rollback;
