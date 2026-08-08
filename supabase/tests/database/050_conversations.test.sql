begin;
select plan(9);

select tests.create_student('asha@example.com') as asha_id \gset
select tests.create_student('ravi@example.com') as ravi_id \gset

select tests.create_subject(:'asha_id', 'Machine Learning') as asha_subject_id \gset
select tests.create_subject(:'ravi_id', 'Physics') as ravi_subject_id \gset

select tests.sign_in_as(:'asha_id');

select lives_ok(
  format($$ insert into public.conversations (subject_id, title) values (%L, 'Overfitting') $$, :'asha_subject_id'),
  'a student can start a conversation in their own subject'
);

select throws_ok(
  format($$ insert into public.conversations (subject_id) values (%L) $$, :'ravi_subject_id'),
  '23503',
  null,
  'a student cannot start a conversation in another student''s subject'
);

select throws_ok(
  $$ insert into public.messages (user_id, conversation_id, role, content)
     select user_id, id, 'student', 'hello' from public.conversations limit 1 $$,
  '42501',
  null,
  'a student cannot write messages directly; chat goes through the server'
);

select id as conversation_id from public.conversations limit 1 \gset

reset role;
insert into public.messages (user_id, conversation_id, role, content)
values (:'asha_id', :'conversation_id', 'student', 'What is overfitting?')
returning id as student_message_id \gset
insert into public.messages (user_id, conversation_id, role, content, answer_source, citations)
values (:'asha_id', :'conversation_id', 'tutor', 'Overfitting is high variance.', 'notes',
  '[{"chunkId": "x", "page": 12}]')
returning id as tutor_message_id \gset

select throws_ok(
  format(
    $$ insert into public.messages (user_id, conversation_id, role, content)
       values (%L, %L, 'tutor', 'No source') $$,
    :'asha_id', :'conversation_id'
  ),
  '23514',
  null,
  'every tutor answer must record where it came from'
);

select tests.sign_in_as(:'asha_id');

select lives_ok(
  format($$ insert into public.message_feedback (message_id, rating) values (%L, 1) $$, :'tutor_message_id'),
  'a student can rate a tutor answer'
);

select throws_ok(
  format($$ insert into public.message_feedback (message_id, rating) values (%L, 1) $$, :'student_message_id'),
  '42501',
  null,
  'a student can only rate tutor answers'
);

reset role;
select tests.sign_in_as(:'ravi_id');

select is_empty(
  $$ select id from public.conversations
     union all select id from public.messages
     union all select message_id from public.message_feedback $$,
  'a student cannot see another student''s chats or feedback'
);

select is_empty(
  format($$ update public.conversations set title = 'Taken' where id = %L returning id $$, :'conversation_id'),
  'a student cannot rename another student''s conversation'
);

reset role;
delete from public.subjects where id = :'asha_subject_id';

select is_empty(
  format($$ select id from public.messages where conversation_id = %L $$, :'conversation_id'),
  'deleting a subject deletes its conversations and messages'
);

select * from finish();
rollback;
