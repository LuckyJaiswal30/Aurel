create table public.subjects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name text not null check (char_length(trim(name)) between 1 and 80),
  description text check (char_length(description) <= 500),
  exam_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, user_id)
);

create unique index subjects_user_id_name_key on public.subjects (user_id, lower(trim(name)));

alter table public.subjects enable row level security;

grant select, delete on public.subjects to authenticated;
grant insert (name, description, exam_date) on public.subjects to authenticated;
grant update (name, description, exam_date) on public.subjects to authenticated;

create policy "students read their own subjects"
  on public.subjects for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "students create their own subjects"
  on public.subjects for insert to authenticated
  with check ((select auth.uid()) = user_id);

create policy "students update their own subjects"
  on public.subjects for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "students delete their own subjects"
  on public.subjects for delete to authenticated
  using ((select auth.uid()) = user_id);

create trigger subjects_set_updated_at
  before update on public.subjects
  for each row execute function private.set_updated_at();

create function private.enforce_subject_limit()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  perform pg_advisory_xact_lock(hashtextextended(new.user_id::text, 0));
  if (select count(*) from public.subjects where user_id = new.user_id) >= 50 then
    raise exception 'subject limit reached' using errcode = 'P0001';
  end if;
  return new;
end;
$$;

create trigger subjects_enforce_limit
  before insert on public.subjects
  for each row execute function private.enforce_subject_limit();
