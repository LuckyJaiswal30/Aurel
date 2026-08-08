create function public.record_guardrail_event(
  student_id uuid,
  event_layer smallint,
  event_outcome text,
  event_category text,
  counts_as_strike boolean
)
returns table (strikes_today integer, cooldown_until timestamptz, is_suspended boolean)
language plpgsql
set search_path = ''
as $$
declare
  day_strikes integer;
  month_strikes integer;
  hour_redirects integer;
begin
  insert into public.guardrail_events (user_id, layer, outcome, category, is_strike)
  values (record_guardrail_event.student_id, record_guardrail_event.event_layer,
    record_guardrail_event.event_outcome, record_guardrail_event.event_category,
    record_guardrail_event.counts_as_strike);

  insert into public.user_restrictions (user_id)
  values (record_guardrail_event.student_id)
  on conflict (user_id) do nothing;

  select
    count(*) filter (where event.is_strike and event.created_at > now() - interval '1 day'),
    count(*) filter (where event.is_strike),
    count(*) filter (where event.outcome = 'redirected' and event.created_at > now() - interval '1 hour')
  into day_strikes, month_strikes, hour_redirects
  from public.guardrail_events as event
  where event.user_id = record_guardrail_event.student_id
    and event.created_at > now() - interval '30 days';

  if record_guardrail_event.counts_as_strike then
    update public.user_restrictions as restriction
    set strike_count = restriction.strike_count + 1,
        cooldown_until = case when day_strikes >= 3
          then greatest(coalesce(restriction.cooldown_until, now()), now() + interval '15 minutes')
          else restriction.cooldown_until end,
        suspended_at = case when month_strikes >= 10
          then coalesce(restriction.suspended_at, now())
          else restriction.suspended_at end
    where restriction.user_id = record_guardrail_event.student_id;
  elsif record_guardrail_event.event_outcome = 'redirected' and hour_redirects >= 5 then
    update public.user_restrictions as restriction
    set cooldown_until = greatest(coalesce(restriction.cooldown_until, now()), now() + interval '15 minutes')
    where restriction.user_id = record_guardrail_event.student_id;
  end if;

  return query
  select day_strikes, restriction.cooldown_until, restriction.suspended_at is not null
  from public.user_restrictions as restriction
  where restriction.user_id = record_guardrail_event.student_id;
end;
$$;

create function public.read_guardrail_state(student_id uuid)
returns table (cooldown_until timestamptz, is_suspended boolean, daily_limit integer)
language sql
stable
set search_path = ''
as $$
  select restriction.cooldown_until,
    restriction.suspended_at is not null,
    coalesce(
      restriction.daily_limit_override,
      case when (
        select count(*) from public.guardrail_events as event
        where event.user_id = read_guardrail_state.student_id
          and event.is_strike and event.created_at > now() - interval '1 day'
      ) >= 5 then 30 end
    )
  from (select read_guardrail_state.student_id as user_id) as student
  left join public.user_restrictions as restriction on restriction.user_id = student.user_id;
$$;

create function public.consume_usage_batch(
  usage_keys text[],
  usage_action text,
  window_lengths integer[],
  cost integer,
  max_counts integer[]
)
returns table (is_allowed boolean, denied_index integer)
language plpgsql
set search_path = ''
as $$
declare
  india_offset constant integer := 19800;
  starts timestamptz[] := array[]::timestamptz[];
  current_count integer;
  position integer;
begin
  if consume_usage_batch.cost not between 1 and 100
    or cardinality(consume_usage_batch.usage_keys) not between 1 and 8
    or cardinality(consume_usage_batch.usage_keys) <> cardinality(consume_usage_batch.window_lengths)
    or cardinality(consume_usage_batch.usage_keys) <> cardinality(consume_usage_batch.max_counts) then
    raise exception 'invalid usage batch' using errcode = '22023';
  end if;

  for position in 1 .. cardinality(consume_usage_batch.usage_keys) loop
    perform pg_advisory_xact_lock(hashtext(consume_usage_batch.usage_keys[position] || consume_usage_batch.usage_action));
    starts := starts || case when consume_usage_batch.window_lengths[position] = 86400
      then to_timestamp(floor((extract(epoch from now()) + india_offset) / 86400) * 86400 - india_offset)
      else to_timestamp(floor(extract(epoch from now()) / consume_usage_batch.window_lengths[position])
        * consume_usage_batch.window_lengths[position]) end;
    select counter.used_count into current_count
    from public.usage_counters as counter
    where counter.limit_key = consume_usage_batch.usage_keys[position]
      and counter.action = consume_usage_batch.usage_action
      and counter.window_seconds = consume_usage_batch.window_lengths[position]
      and counter.window_start = starts[position];
    if coalesce(current_count, 0) + consume_usage_batch.cost > consume_usage_batch.max_counts[position] then
      return query select false, position;
      return;
    end if;
  end loop;

  for position in 1 .. cardinality(consume_usage_batch.usage_keys) loop
    insert into public.usage_counters as counter
      (limit_key, action, window_seconds, window_start, used_count)
    values (consume_usage_batch.usage_keys[position], consume_usage_batch.usage_action,
      consume_usage_batch.window_lengths[position], starts[position], consume_usage_batch.cost)
    on conflict on constraint usage_counters_pkey
    do update set used_count = counter.used_count + excluded.used_count;
  end loop;

  return query select true, null::integer;
end;
$$;

revoke execute on function public.record_guardrail_event from public, anon, authenticated;
revoke execute on function public.read_guardrail_state from public, anon, authenticated;
revoke execute on function public.consume_usage_batch from public, anon, authenticated;
grant execute on function public.record_guardrail_event to service_role;
grant execute on function public.read_guardrail_state to service_role;
grant execute on function public.consume_usage_batch to service_role;
