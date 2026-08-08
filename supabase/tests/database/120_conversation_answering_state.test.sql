begin;
select plan(4);

select tests.create_student('asha@example.com') as asha_id \gset
select tests.create_student('ravi@example.com') as ravi_id \gset
select tests.create_subject(:'asha_id', 'Machine Learning') as asha_subject_id \gset

insert into public.conversations (user_id, subject_id, title, answering_step, answering_since)
values (:'asha_id', :'asha_subject_id', 'Overfitting', 'search', now())
returning id as conversation_id \gset

select tests.sign_in_as(:'asha_id');

select is(
  (select answering_step from public.conversations where id = :'conversation_id'),
  'search',
  'a student can see that their answer is still being written'
);

select throws_ok(
  format($$ update public.conversations set answering_step = null where id = %L $$, :'conversation_id'),
  '42501', null,
  'a student cannot change the answering state; only the server does'
);

reset role;
select tests.sign_in_as(:'ravi_id');

select is_empty(
  format($$ select answering_step from public.conversations where id = %L $$, :'conversation_id'),
  'another student cannot see the answering state'
);

reset role;
select throws_ok(
  format($$ update public.conversations set answering_step = repeat('x', 41) where id = %L $$, :'conversation_id'),
  '23514', null,
  'the step name stays short'
);

select * from finish();
rollback;
