create table public.usage_counters (
  limit_key text not null check (limit_key ~ '^(user:[0-9a-f-]{36}|ip:[0-9a-f]{64})$'),
  action text not null check (action ~ '^[a-z_]{1,40}$'),
  window_seconds integer not null check (window_seconds in (60, 3600, 86400)),
  window_start timestamptz not null,
  used_count integer not null default 0 check (used_count >= 0),
  primary key (limit_key, action, window_seconds, window_start)
);

create index usage_counters_window_start_idx on public.usage_counters (window_start);

create table public.guardrail_events (
  id bigint generated always as identity primary key,
  user_id uuid references auth.users (id) on delete set null,
  layer smallint not null check (layer between 1 and 7),
  outcome text not null check (outcome in ('redirected', 'hinted', 'blocked', 'care')),
  category text not null check (category ~ '^[a-z_]{1,40}$'),
  is_strike boolean not null default false,
  created_at timestamptz not null default now()
);

create index guardrail_events_user_id_created_at_idx on public.guardrail_events (user_id, created_at);

create table public.user_restrictions (
  user_id uuid primary key references auth.users (id) on delete cascade,
  strike_count integer not null default 0 check (strike_count >= 0),
  cooldown_until timestamptz,
  daily_limit_override integer check (daily_limit_override >= 0),
  suspended_at timestamptz,
  updated_at timestamptz not null default now()
);

alter table public.usage_counters enable row level security;
alter table public.guardrail_events enable row level security;
alter table public.user_restrictions enable row level security;

grant select on public.user_restrictions to authenticated;

create policy "students read their own restrictions"
  on public.user_restrictions for select to authenticated
  using ((select auth.uid()) = user_id);

create trigger user_restrictions_set_updated_at
  before update on public.user_restrictions
  for each row execute function private.set_updated_at();

create function public.consume_usage(
  usage_key text,
  usage_action text,
  window_seconds integer,
  cost integer,
  max_count integer
)
returns table (is_allowed boolean, used_count integer, resets_at timestamptz)
language plpgsql
set search_path = ''
as $$
declare
  started_at timestamptz;
  new_count integer;
begin
  if consume_usage.cost not between 1 and 100 or consume_usage.max_count < 1 then
    raise exception 'invalid usage cost or limit' using errcode = '22023';
  end if;

  started_at := to_timestamp(
    floor(extract(epoch from now()) / consume_usage.window_seconds) * consume_usage.window_seconds
  );

  if consume_usage.cost <= consume_usage.max_count then
    insert into public.usage_counters as counter
      (limit_key, action, window_seconds, window_start, used_count)
    values (consume_usage.usage_key, consume_usage.usage_action, consume_usage.window_seconds,
      started_at, consume_usage.cost)
    on conflict on constraint usage_counters_pkey
    do update set used_count = counter.used_count + excluded.used_count
      where counter.used_count + excluded.used_count <= consume_usage.max_count
    returning counter.used_count into new_count;
  end if;

  if new_count is null then
    select counter.used_count into new_count
    from public.usage_counters as counter
    where counter.limit_key = consume_usage.usage_key
      and counter.action = consume_usage.usage_action
      and counter.window_seconds = consume_usage.window_seconds
      and counter.window_start = started_at;
    is_allowed := false;
  else
    is_allowed := true;
  end if;

  return query select is_allowed, coalesce(new_count, 0),
    started_at + make_interval(secs => consume_usage.window_seconds);
end;
$$;
