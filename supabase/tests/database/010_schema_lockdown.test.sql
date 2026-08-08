begin;
select plan(7);

select is_empty(
  $$ select tablename from pg_tables where schemaname = 'public' and not rowsecurity $$,
  'every public table has row-level security enabled'
);

select is_empty(
  $$ select table_name, privilege_type from information_schema.role_table_grants
     where grantee = 'anon' and table_schema = 'public' $$,
  'anonymous visitors have no table privileges in public'
);

select is_empty(
  $$ select routine_name from information_schema.role_routine_grants
     where grantee in ('anon', 'PUBLIC') and routine_schema = 'public' $$,
  'anonymous visitors cannot execute public functions'
);

select is_empty(
  $$ select table_name, privilege_type from information_schema.role_table_grants
     where grantee = 'authenticated' and table_schema = 'public'
       and (privilege_type in ('TRUNCATE', 'REFERENCES', 'TRIGGER')
         or table_name in ('usage_counters', 'guardrail_events')) $$,
  'students cannot truncate tables or touch usage counters and guardrail events'
);

select is_empty(
  $$ select table_name, column_name, privilege_type from information_schema.column_privileges
     where grantee = 'authenticated' and table_schema = 'public'
       and privilege_type in ('INSERT', 'UPDATE')
       and column_name in ('id', 'user_id', 'status', 'created_at', 'updated_at') $$,
  'students cannot write ids, owners, statuses or timestamps'
);

select is_empty(
  $$ select c.relname from pg_class c join pg_namespace n on n.oid = c.relnamespace
     where n.nspname = 'public' and c.relkind = 'r'
       and not has_table_privilege('service_role', c.oid, 'select, insert, update, delete') $$,
  'the server role can manage every public table'
);

select is_empty(
  $$ select nspname from pg_namespace n
     where nspname = 'private'
       and (has_schema_privilege('authenticated', n.oid, 'usage')
         or has_schema_privilege('anon', n.oid, 'usage')) $$,
  'the private schema is closed to students and visitors'
);

select * from finish();
rollback;
