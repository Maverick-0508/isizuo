-- ─── Rate limiting table ────────────────────────────────────────────────────
create table if not exists rate_limits (
  id        uuid primary key default uuid_generate_v4(),
  user_id   uuid not null references profiles(id) on delete cascade,
  action    text not null,
  created_at timestamptz default now()
);

create index if not exists idx_rate_limits_lookup
  on rate_limits(user_id, action, created_at);

alter table rate_limits enable row level security;

create policy "System can manage rate limits"
  on rate_limits for all
  using (true);

-- ─── Helper: check rate limit (returns true if allowed) ────────────────────
create or replace function check_rate_limit(
  p_user_id uuid,
  p_action text,
  p_max_count int,
  p_window_seconds int
) returns boolean language plpgsql security definer as $$
declare
  v_count int;
begin
  delete from rate_limits
  where user_id = p_user_id
    and action = p_action
    and created_at < now() - (p_window_seconds || ' seconds')::interval;

  select count(*) into v_count
  from rate_limits
  where user_id = p_user_id
    and action = p_action
    and created_at > now() - (p_window_seconds || ' seconds')::interval;

  if v_count >= p_max_count then
    return false;
  end if;

  insert into rate_limits (user_id, action) values (p_user_id, p_action);
  return true;
end;
$$;
