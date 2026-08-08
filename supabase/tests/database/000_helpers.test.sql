create extension if not exists pgtap with schema extensions;

create schema if not exists tests;
grant usage on schema tests to anon, authenticated, service_role;

create or replace function tests.create_student(email text)
returns uuid
language sql
security definer
set search_path = ''
as $$
  insert into auth.users (id, email, raw_user_meta_data)
  values (gen_random_uuid(), create_student.email, '{"display_name": "Test Student"}')
  returning id;
$$;

create or replace function tests.create_subject(student_id uuid, name text)
returns uuid
language sql
security definer
set search_path = ''
as $$
  insert into public.subjects (user_id, name)
  values (create_subject.student_id, create_subject.name)
  returning id;
$$;

create or replace function tests.sign_in_as(student_id uuid)
returns void
language sql
set search_path = ''
as $$
  select set_config('role', 'authenticated', true);
  select set_config(
    'request.jwt.claims',
    json_build_object('sub', sign_in_as.student_id, 'role', 'authenticated')::text,
    true
  );
$$;

create or replace function tests.sign_in_as_anonymous()
returns void
language sql
set search_path = ''
as $$
  select set_config('role', 'anon', true);
  select set_config('request.jwt.claims', '{"role": "anon"}', true);
$$;

create or replace function tests.sign_in_as_server()
returns void
language sql
set search_path = ''
as $$
  select set_config('role', 'service_role', true);
  select set_config('request.jwt.claims', '{"role": "service_role"}', true);
$$;

grant execute on all functions in schema tests to anon, authenticated, service_role;

begin;
select plan(1);
select has_function('tests', 'create_student', array['text']);
select * from finish();
rollback;
