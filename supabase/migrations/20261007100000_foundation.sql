create extension if not exists vector with schema extensions;

create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

alter default privileges revoke execute on functions from public;
alter default privileges in schema public revoke execute on functions from anon, authenticated;
alter default privileges in schema public revoke truncate, references, trigger on tables from anon, authenticated;
alter default privileges in schema public grant all on tables to service_role;
alter default privileges in schema public grant execute on functions to service_role;

create type public.answer_language as enum ('english', 'hindi', 'hinglish');
create type public.explanation_level as enum ('simpler', 'standard', 'deeper');

create function public.study_file_mime_types()
returns text[]
language sql
immutable
set search_path = ''
as $$
  select array[
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
    'text/markdown',
    'image/png',
    'image/jpeg',
    'image/webp'
  ]
$$;

create function public.study_file_size_limit()
returns bigint
language sql
immutable
set search_path = ''
as $$
  select 26214400::bigint
$$;

grant execute on function public.study_file_mime_types(), public.study_file_size_limit()
  to authenticated;

create function private.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;
