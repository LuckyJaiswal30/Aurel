-- Chats started from the home screen are not tied to a subject: they answer
-- from general knowledge and Wikipedia instead of the student's notes.
alter table public.conversations alter column subject_id drop not null;

create index conversations_user_id_updated_at_idx
  on public.conversations (user_id, updated_at desc);
