-- While the tutor is answering, the server records the current step so a
-- student who leaves and comes back sees that the answer is still on its way.
alter table public.conversations
  add column answering_step text check (char_length(answering_step) <= 40),
  add column answering_since timestamptz;
