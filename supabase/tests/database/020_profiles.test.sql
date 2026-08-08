begin;
select plan(7);

select tests.create_student('asha@example.com') as asha_id \gset
select tests.create_student('ravi@example.com') as ravi_id \gset

select is(
  (select display_name from public.profiles where id = :'asha_id'),
  'Test Student',
  'a profile is created when a student signs up'
);

select tests.sign_in_as(:'asha_id');

select results_eq(
  $$ select count(*)::int from public.profiles $$,
  array[1],
  'a student sees only their own profile'
);

select lives_ok(
  format($$ update public.profiles set display_name = 'Asha' where id = %L $$, :'asha_id'),
  'a student can rename themselves'
);

select is_empty(
  format($$ update public.profiles set display_name = 'Hacked' where id = %L returning id $$, :'ravi_id'),
  'a student cannot change another student''s profile'
);

select throws_ok(
  format($$ update public.profiles set id = gen_random_uuid() where id = %L $$, :'asha_id'),
  '42501',
  null,
  'a student cannot change their profile id'
);

select throws_ok(
  $$ insert into public.profiles (id) values (gen_random_uuid()) $$,
  '42501',
  null,
  'a student cannot create profiles directly'
);

reset role;
select tests.sign_in_as_anonymous();

select throws_ok(
  $$ select * from public.profiles $$,
  '42501',
  null,
  'anonymous visitors cannot read profiles'
);

select * from finish();
rollback;
