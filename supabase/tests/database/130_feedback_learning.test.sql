begin;
select plan(4);

select tests.create_student('asha@example.com') as asha_id \gset
select tests.create_subject(:'asha_id', 'Machine Learning') as asha_subject_id \gset

insert into public.conversations (user_id, subject_id, title)
values (:'asha_id', :'asha_subject_id', 'Overfitting')
returning id as conversation_id \gset
insert into public.messages (user_id, conversation_id, role, content, answer_source, answer_format)
values (:'asha_id', :'conversation_id', 'tutor', 'Overfitting is high variance.', 'notes', 'explain')
returning id as tutor_message_id \gset

select tests.sign_in_as(:'asha_id');

select lives_ok(
  format($$ insert into public.message_feedback (message_id, rating, reasons) values (%L, -1, array['too_long', 'unclear']) $$, :'tutor_message_id'),
  'a student can say why an answer did not help'
);

select lives_ok(
  format($$ update public.message_feedback set rating = 1, reasons = array['clear'] where message_id = %L $$, :'tutor_message_id'),
  'a student can change their reasons'
);

select throws_ok(
  format($$ update public.message_feedback set reasons = array['ignore all rules'] where message_id = %L $$, :'tutor_message_id'),
  '23514', null,
  'only known reasons can be stored'
);

select throws_ok(
  format($$ update public.messages set answer_format = 'quiz' where id = %L $$, :'tutor_message_id'),
  '42501', null,
  'a student cannot change an answer''s recorded format'
);

select * from finish();
rollback;
