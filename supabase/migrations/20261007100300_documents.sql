create type public.document_status as enum (
  'uploaded',
  'checking',
  'held_for_confirmation',
  'rejected',
  'reading',
  'indexing',
  'ready',
  'failed'
);

create table public.documents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  subject_id uuid not null,
  file_name text not null check (char_length(file_name) between 1 and 255),
  storage_path text not null unique check (char_length(storage_path) between 1 and 512),
  mime_type text not null check (mime_type = any (public.study_file_mime_types())),
  size_bytes bigint not null check (size_bytes between 1 and public.study_file_size_limit()),
  content_hash text not null check (content_hash ~ '^[a-f0-9]{64}$'),
  page_count integer check (page_count between 0 and 5000),
  status public.document_status not null default 'uploaded',
  status_detail text check (char_length(status_detail) <= 500),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, user_id),
  unique (id, user_id, subject_id),
  unique (user_id, subject_id, content_hash),
  foreign key (subject_id, user_id) references public.subjects (id, user_id) on delete cascade
);

create table public.document_sections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  document_id uuid not null,
  position integer not null check (position >= 0),
  heading_path text[] not null default '{}',
  content text not null check (char_length(content) between 1 and 60000),
  page_start integer not null check (page_start >= 1),
  page_end integer not null,
  created_at timestamptz not null default now(),
  check (page_end >= page_start),
  unique (id, document_id),
  unique (document_id, position),
  foreign key (document_id, user_id) references public.documents (id, user_id) on delete cascade
);

create table public.document_chunks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  subject_id uuid not null,
  document_id uuid not null,
  section_id uuid not null,
  position integer not null check (position >= 0),
  heading text check (char_length(heading) <= 300),
  content text not null check (char_length(content) between 1 and 8000),
  context_note text check (char_length(context_note) <= 1500),
  page_number integer not null check (page_number >= 1),
  token_count integer check (token_count > 0),
  embedding extensions.vector(1024),
  search_text tsvector generated always as (
    setweight(to_tsvector('english'::regconfig, coalesce(heading, '')), 'A')
    || setweight(to_tsvector('english'::regconfig, content), 'B')
    || setweight(to_tsvector('english'::regconfig, coalesce(context_note, '')), 'C')
    || to_tsvector('simple'::regconfig, content)
  ) stored,
  created_at timestamptz not null default now(),
  unique (document_id, position),
  foreign key (document_id, user_id, subject_id)
    references public.documents (id, user_id, subject_id) on delete cascade,
  foreign key (section_id, document_id)
    references public.document_sections (id, document_id) on delete cascade
);

create index document_chunks_user_id_subject_id_idx on public.document_chunks (user_id, subject_id);
create index document_chunks_section_id_idx on public.document_chunks (section_id);
create index document_chunks_search_text_idx on public.document_chunks using gin (search_text);
create index document_chunks_embedding_idx
  on public.document_chunks using hnsw (embedding extensions.vector_cosine_ops);

alter table public.documents enable row level security;
alter table public.document_sections enable row level security;
alter table public.document_chunks enable row level security;

grant select, delete on public.documents to authenticated;
grant select on public.document_sections to authenticated;
grant select on public.document_chunks to authenticated;

create policy "students read their own documents"
  on public.documents for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "students delete their own documents"
  on public.documents for delete to authenticated
  using ((select auth.uid()) = user_id);

create policy "students read their own document sections"
  on public.document_sections for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "students read their own document chunks"
  on public.document_chunks for select to authenticated
  using ((select auth.uid()) = user_id);

create trigger documents_set_updated_at
  before update on public.documents
  for each row execute function private.set_updated_at();
