create table if not exists blocked_users (
  id          uuid primary key default uuid_generate_v4(),
  blocker_id  uuid not null references profiles(id) on delete cascade,
  blocked_id  uuid not null references profiles(id) on delete cascade,
  created_at  timestamptz default now(),
  unique(blocker_id, blocked_id)
);

alter table blocked_users enable row level security;

do $$ begin
  create policy "Users can manage own blocks" on blocked_users for all using (auth.uid() = blocker_id);
exception when sqlstate '42710' then null;
end $$;

create table if not exists kyc_submissions (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references profiles(id) on delete cascade,
  selfie_url  text,
  id_url      text,
  status      text default 'pending' check (status in ('pending', 'approved', 'rejected')),
  reviewed_by uuid references profiles(id),
  notes       text default '',
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

alter table kyc_submissions enable row level security;

do $$ begin
  create policy "Users can view own KYC submissions" on kyc_submissions for select using (auth.uid() = user_id);
exception when sqlstate '42710' then null;
end $$;

do $$ begin
  create policy "Users can create KYC submissions" on kyc_submissions for insert with check (auth.uid() = user_id);
exception when sqlstate '42710' then null;
end $$;

create index if not exists idx_blocked_users_lookup on blocked_users(blocker_id, blocked_id);
create index if not exists idx_kyc_submissions_user on kyc_submissions(user_id);
