begin;
select plan(11);

select tests.create_student('asha@example.com') as asha_id \gset

select tests.sign_in_as(:'asha_id');

select throws_ok(
  format($$ select * from public.record_guardrail_event(%L, 3::smallint, 'blocked', 'jailbreak', false) $$, :'asha_id'),
  '42501', null,
  'a student cannot write guardrail events or clear strikes'
);

select throws_ok(
  format($$ select * from public.consume_usage_batch(array['user:%s'], 'chat_message', array[60], 1, array[100]) $$, :'asha_id'),
  '42501', null,
  'a student cannot touch their own limits'
);

reset role;
select tests.sign_in_as_server();

select results_eq(
  format($$ select strikes_today, cooldown_until is null, is_suspended
     from public.record_guardrail_event(%L, 4::smallint, 'redirected', 'off_topic', false) $$, :'asha_id'),
  $$ values (0, true, false) $$,
  'a first off-topic redirect is not a strike'
);

select results_eq(
  format($$ select strikes_today, cooldown_until is null
     from public.record_guardrail_event(%L, 3::smallint, 'blocked', 'jailbreak', true) $$, :'asha_id'),
  $$ values (1, true) $$,
  'one blocked attack is a strike without a cooldown'
);

select * from public.record_guardrail_event(:'asha_id', 3::smallint, 'blocked', 'jailbreak', true);

select results_eq(
  format($$ select strikes_today, cooldown_until > now() + interval '14 minutes'
     from public.record_guardrail_event(%L, 3::smallint, 'blocked', 'jailbreak', true) $$, :'asha_id'),
  $$ values (3, true) $$,
  'three strikes in a day start a 15 minute cooldown'
);

update public.user_restrictions set cooldown_until = null where user_id = :'asha_id';

select results_eq(
  format($$ select cooldown_until is null
     from public.record_guardrail_event(%L, 3::smallint, 'care', 'distress', false) $$, :'asha_id'),
  $$ values (true) $$,
  'a distress message never starts a cooldown'
);

select results_eq(
  format($$ select daily_limit is null, is_suspended from public.read_guardrail_state(%L) $$, :'asha_id'),
  $$ values (true, false) $$,
  'three strikes do not lower the daily limit'
);

select * from public.record_guardrail_event(:'asha_id', 3::smallint, 'blocked', 'jailbreak', true);
select * from public.record_guardrail_event(:'asha_id', 3::smallint, 'blocked', 'jailbreak', true);

select results_eq(
  format($$ select daily_limit from public.read_guardrail_state(%L) $$, :'asha_id'),
  $$ values (30) $$,
  'five strikes in a day lower the daily limit to 30, worked out from recent strikes'
);

select results_eq(
  format($$ select is_allowed, denied_index from public.consume_usage_batch(
     array['user:%s', 'user:%s'], 'chat_message', array[60, 86400], 1, array[5, 1]) $$, :'asha_id', :'asha_id'),
  $$ values (true, null::integer) $$,
  'a batch within every limit is allowed'
);

select results_eq(
  format($$ select is_allowed, denied_index from public.consume_usage_batch(
     array['user:%s', 'user:%s'], 'chat_message', array[60, 86400], 1, array[5, 1]) $$, :'asha_id', :'asha_id'),
  $$ values (false, 2) $$,
  'a batch over one limit is refused and names that limit'
);

select is(
  (select used_count from public.usage_counters
   where limit_key = 'user:' || :'asha_id' and window_seconds = 60),
  1,
  'a refused batch charges none of the other counters'
);

select * from finish();
rollback;
