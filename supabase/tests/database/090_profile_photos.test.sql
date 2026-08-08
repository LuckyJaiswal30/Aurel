begin;
select plan(5);

select tests.create_student('asha@example.com') as asha_id \gset

select tests.sign_in_as(:'asha_id');

select throws_ok(
  format($$ update public.profiles set avatar_path = %L where id = %L $$,
    :'asha_id' || '/' || gen_random_uuid() || '.webp', :'asha_id'),
  '42501',
  null,
  'a student cannot point their profile at any file; photos go through the server'
);

select is_empty(
  $$ select id from storage.objects where bucket_id = 'avatars' $$,
  'a student cannot list profile photos directly'
);

select throws_ok(
  format($$ insert into storage.objects (bucket_id, name, owner_id)
     values ('avatars', %L, %L) $$, :'asha_id' || '/photo.webp', :'asha_id'),
  '42501',
  null,
  'a student cannot upload a profile photo directly'
);

reset role;
select tests.sign_in_as_server();

select lives_ok(
  format($$ update public.profiles set avatar_path = %L where id = %L $$,
    :'asha_id' || '/' || gen_random_uuid() || '.webp', :'asha_id'),
  'the server can set a profile photo'
);

select throws_ok(
  format($$ update public.profiles set avatar_path = '../other/photo.png' where id = %L $$, :'asha_id'),
  '23514',
  null,
  'photo paths must be a student folder and a webp or jpg file'
);

select * from finish();
rollback;
