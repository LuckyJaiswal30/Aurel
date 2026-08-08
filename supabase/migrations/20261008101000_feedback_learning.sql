-- Feedback teaches the tutor: each answer remembers its format, and feedback
-- records why the student liked or disliked it.
alter table public.messages
  add column answer_format text check (char_length(answer_format) <= 20);

alter table public.message_feedback
  add column reasons text[] not null default '{}' check (
    cardinality(reasons) <= 6
    and reasons <@ array[
      'wrong', 'too_long', 'too_short', 'unclear', 'not_from_notes',
      'clear', 'right_length', 'good_examples', 'used_my_notes'
    ]::text[]
  );

grant insert (reasons), update (reasons) on public.message_feedback to authenticated;
