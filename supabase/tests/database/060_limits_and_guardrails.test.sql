begin;
select plan(9);

select tests.create_student('asha@example.com') as asha_id \gset
select tests.create_student('ravi@example.com') as ravi_id \gset

insert into public.user_restrictions (user_id, strike_count) values (:'asha_id', 1), (:'ravi_id', 3);

select tests.sign_in_as(:'asha_id');

select throws_ok(
  $$ select * from public.consume_usage('user:' || gen_random_uuid(), 'chat_message', 60, 1, 5) $$,
  '42501',
  null,
  'a student cannot touch their own usage limits'
);

select throws_ok(
  $$ select * from public.guardrail_events $$,
  '42501',
  null,
  'a student cannot read guardrail events'
);

select results_eq(
  $$ select strike_count from public.user_restrictions $$,
  array[1],
  'a student sees only their own restrictions'
);

select throws_ok(
  $$ update public.user_restrictions set strike_count = 0 $$,
  '42501',
  null,
  'a student cannot clear their own strikes'
);

reset role;
select tests.sign_in_as_server();

select results_eq(
  format($$ select is_allowed, used_count from public.consume_usage('user:%s', 'chat_message', 60, 2, 3) $$, :'asha_id'),
  $$ values (true, 2) $$,
  'usage under the limit is allowed'
);

select results_eq(
  format($$ select is_allowed, used_count from public.consume_usage('user:%s', 'chat_message', 60, 2, 3) $$, :'asha_id'),
  $$ values (false, 2) $$,
  'usage over the limit is refused and does not use up quota'
);

select results_eq(
  format($$ select is_allowed, used_count from public.consume_usage('user:%s', 'chat_message', 60, 1, 3) $$, :'asha_id'),
  $$ values (true, 3) $$,
  'a smaller request that still fits is allowed after a refusal'
);

select throws_ok(
  format($$ select * from public.consume_usage('user:%s', 'chat_message', 60, 0, 3) $$, :'asha_id'),
  '22023',
  null,
  'a zero or negative cost is rejected'
);

select throws_ok(
  $$ select * from public.consume_usage('ip:203.0.113.5', 'chat_message', 60, 1, 3) $$,
  '23514',
  null,
  'raw IP addresses are never stored; the server must hash them first'
);

select * from finish();
rollback;
