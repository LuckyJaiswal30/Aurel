create type public.message_role as enum ('student', 'tutor');
create type public.answer_source as enum (
  'notes',
  'reference_library',
  'general_knowledge',
  'redirect'
);

create table public.conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  subject_id uuid not null,
  title text not null default 'New chat' check (char_length(title) between 1 and 120),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, user_id),
  foreign key (subject_id, user_id) references public.subjects (id, user_id) on delete cascade
);

create index conversations_user_id_subject_id_idx on public.conversations (user_id, subject_id);

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  conversation_id uuid not null,
  role public.message_role not null,
  content text not null check (char_length(content) between 1 and 20000),
  answer_source public.answer_source,
  citations jsonb not null default '[]' check (jsonb_typeof(citations) = 'array'),
  understood_question text check (char_length(understood_question) <= 2000),
  created_at timestamptz not null default now(),
  check ((role = 'tutor') = (answer_source is not null)),
  unique (id, user_id),
  foreign key (conversation_id, user_id)
    references public.conversations (id, user_id) on delete cascade
);

create index messages_conversation_id_created_at_idx on public.messages (conversation_id, created_at);

create table public.message_feedback (
  message_id uuid primary key,
  user_id uuid not null default auth.uid(),
  rating smallint check (rating in (-1, 1)),
  is_wrong boolean not null default false,
  comment text check (char_length(comment) <= 1000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (message_id, user_id) references public.messages (id, user_id) on delete cascade
);

create index message_feedback_user_id_idx on public.message_feedback (user_id);

alter table public.conversations enable row level security;
alter table public.messages enable row level security;
alter table public.message_feedback enable row level security;

grant select, delete on public.conversations to authenticated;
grant insert (subject_id, title) on public.conversations to authenticated;
grant update (title) on public.conversations to authenticated;
grant select on public.messages to authenticated;
grant select, delete on public.message_feedback to authenticated;
grant insert (message_id, rating, is_wrong, comment) on public.message_feedback to authenticated;
grant update (rating, is_wrong, comment) on public.message_feedback to authenticated;

create policy "students read their own conversations"
  on public.conversations for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "students start their own conversations"
  on public.conversations for insert to authenticated
  with check ((select auth.uid()) = user_id);

create policy "students rename their own conversations"
  on public.conversations for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "students delete their own conversations"
  on public.conversations for delete to authenticated
  using ((select auth.uid()) = user_id);

create policy "students read their own messages"
  on public.messages for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "students read their own feedback"
  on public.message_feedback for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "students rate tutor answers they received"
  on public.message_feedback for insert to authenticated
  with check (
    (select auth.uid()) = user_id
    and exists (
      select 1 from public.messages
      where messages.id = message_feedback.message_id
        and messages.role = 'tutor'
    )
  );

create policy "students change their own feedback"
  on public.message_feedback for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "students delete their own feedback"
  on public.message_feedback for delete to authenticated
  using ((select auth.uid()) = user_id);

create trigger conversations_set_updated_at
  before update on public.conversations
  for each row execute function private.set_updated_at();

create trigger message_feedback_set_updated_at
  before update on public.message_feedback
  for each row execute function private.set_updated_at();
