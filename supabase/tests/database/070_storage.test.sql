begin;
select plan(5);

select tests.create_student('asha@example.com') as asha_id \gset
select tests.create_student('ravi@example.com') as ravi_id \gset

select results_eq(
  $$ select id, public, file_size_limit from storage.buckets order by id $$,
  $$ values ('avatars'::text, false, 1048576::bigint), ('page-images'::text, false, 5242880::bigint),
       ('study-files'::text, false, 26214400::bigint) $$,
  'every bucket is private with a size cap'
);

insert into storage.objects (bucket_id, name, owner_id)
values ('study-files', :'asha_id' || '/ml-notes.pdf', :'asha_id'),
       ('study-files', :'ravi_id' || '/physics.pdf', :'ravi_id');

select tests.sign_in_as(:'asha_id');

select results_eq(
  $$ select name from storage.objects $$,
  array[:'asha_id' || '/ml-notes.pdf'],
  'a student can only see files in their own folder'
);

select throws_ok(
  format(
    $$ insert into storage.objects (bucket_id, name, owner_id) values ('study-files', %L, %L) $$,
    :'asha_id' || '/direct.pdf', :'asha_id'
  ),
  '42501',
  null,
  'a student cannot upload directly; uploads go through the server'
);

select is_empty(
  $$ update storage.objects set name = name || '.moved' returning id $$,
  'a student cannot move stored files'
);

select throws_like(
  $$ delete from storage.objects $$,
  '%Direct deletion from storage tables is not allowed%',
  'a student cannot delete stored files directly'
);

select * from finish();
rollback;
