-- Isizuo Database Schema
-- Run this in your Supabase SQL Editor (Dashboard → SQL Editor → New Query)

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ─── 1. profiles ─────────────────────────────────────────────────────────────
-- Stores user profile data. Supabase auth handles id, email, phone automatically.

create table if not exists profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  email         text unique not null,
  phone         text default '',
  name          text not null default '',
  age           integer default 0,
  gender        text default 'other' check (gender in ('male', 'female', 'other')),
  bio           text default '',
  photos        text[] default '{}',
  languages     text[] default '{}',
  community     text default '',
  religion      text default '',
  values        text[] default '{}',
  interests     text[] default '{}',
  family_values text default 'balanced' check (family_values in ('traditional', 'modern', 'balanced')),
  looking_for   text default 'relationship' check (looking_for in ('relationship', 'friendship', 'marriage', 'networking')),
  latitude      double precision default 0,
  longitude     double precision default 0,
  is_verified   boolean default false,
  is_photo_verified boolean default false,
  kyc_level     text default 'none' check (kyc_level in ('none', 'phone', 'id', 'full')),
  safety_score  integer default 50 check (safety_score >= 0 and safety_score <= 100),
  credits       integer default 10 check (credits >= 0),
  boosted_until timestamptz,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, phone)
  values (
    new.id,
    new.email,
    coalesce(new.phone, '')
  );
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- RLS: users can read all profiles, but only update their own
alter table profiles enable row level security;

create policy "Profiles are viewable by everyone"
  on profiles for select
  using (true);

create policy "Users can update own profile"
  on profiles for update
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on profiles for insert
  with check (auth.uid() = id);

-- ─── 2. swipes ───────────────────────────────────────────────────────────────
-- Records like/pass/superlike actions between users.

create table if not exists swipes (
  id          uuid primary key default uuid_generate_v4(),
  swiper_id   uuid not null references profiles(id) on delete cascade,
  swiped_id   uuid not null references profiles(id) on delete cascade,
  action      text not null check (action in ('like', 'pass', 'super_like')),
  created_at  timestamptz default now(),
  unique(swiper_id, swiped_id)
);

alter table swipes enable row level security;

create policy "Users can view own swipes"
  on swipes for select
  using (auth.uid() = swiper_id);

create policy "Users can insert own swipes"
  on swipes for insert
  with check (auth.uid() = swiper_id);

-- Index for fast reverse-swipe lookups
create index if not exists idx_swipes_swiped on swipes(swiped_id, swiper_id);

-- ─── 3. matches ──────────────────────────────────────────────────────────────
-- Created when two users mutually like each other.

create table if not exists matches (
  id                  uuid primary key default uuid_generate_v4(),
  user_1              uuid not null references profiles(id) on delete cascade,
  user_2              uuid not null references profiles(id) on delete cascade,
  compatibility_score integer default 0 check (compatibility_score >= 0 and compatibility_score <= 100),
  status              text default 'active' check (status in ('active', 'unmatched', 'blocked')),
  created_at          timestamptz default now(),
  unique(user_1, user_2)
);

alter table matches enable row level security;

create policy "Users can view own matches"
  on matches for select
  using (auth.uid() = user_1 or auth.uid() = user_2);

create policy "System can create matches"
  on matches for insert
  with check (true);

-- ─── 4. messages ─────────────────────────────────────────────────────────────
-- Chat messages between matched users.

create table if not exists messages (
  id          uuid primary key default uuid_generate_v4(),
  match_id    uuid not null references matches(id) on delete cascade,
  sender_id   uuid not null references profiles(id) on delete cascade,
  content     text not null,
  type        text default 'text' check (type in ('text', 'image', 'icebreaker', 'safety-alert', 'system')),
  is_flagged  boolean default false,
  flag_reason text,
  created_at  timestamptz default now()
);

alter table messages enable row level security;

create policy "Match participants can view messages"
  on messages for select
  using (
    exists (
      select 1 from matches
      where matches.id = messages.match_id
        and (matches.user_1 = auth.uid() or matches.user_2 = auth.uid())
    )
  );

create policy "Match participants can send messages"
  on messages for insert
  with check (
    auth.uid() = sender_id
    and exists (
      select 1 from matches
      where matches.id = messages.match_id
        and (matches.user_1 = auth.uid() or matches.user_2 = auth.uid())
    )
  );

create index if not exists idx_messages_match on messages(match_id, created_at);

-- ─── 5. moderation_queue ─────────────────────────────────────────────────────
-- Flagged messages held for review.

create table if not exists moderation_queue (
  id               uuid primary key default uuid_generate_v4(),
  message_id       uuid references messages(id) on delete set null,
  message_content  text,
  sender_id        uuid references profiles(id) on delete set null,
  reason           text not null check (reason in ('scam', 'harassment', 'explicit_content', 'fake_profile', 'other')),
  status           text default 'pending' check (status in ('pending', 'reviewed', 'resolved', 'escalated')),
  reviewed_by      uuid references profiles(id),
  created_at       timestamptz default now()
);

alter table moderation_queue enable row level security;

create policy "Admins can manage moderation queue"
  on moderation_queue for all
  using (true);

create policy "Users can flag content"
  on moderation_queue for insert
  with check (auth.uid() = sender_id or sender_id is null);

-- ─── 6. events ───────────────────────────────────────────────────────────────
-- Social events and meetups.

create table if not exists events (
  id                uuid primary key default uuid_generate_v4(),
  title             text not null,
  description       text default '',
  category          text default 'social' check (category in ('social', 'professional', 'cultural', 'religious', 'hobby')),
  location_name     text default '',
  latitude          double precision default 0,
  longitude         double precision default 0,
  date              date not null,
  time              text default '',
  max_attendees     integer default 100,
  current_attendees integer default 0,
  host_id           uuid references profiles(id) on delete set null,
  is_public         boolean default true,
  languages         text[] default '{}',
  rsvp_deadline     timestamptz,
  created_at        timestamptz default now()
);

alter table events enable row level security;

create policy "Events are viewable by everyone"
  on events for select
  using (true);

create policy "Authenticated users can create events"
  on events for insert
  with check (auth.uid() is not null);

-- ─── 7. communities ──────────────────────────────────────────────────────────
-- Interest-based community groups.

create table if not exists communities (
  id          uuid primary key default uuid_generate_v4(),
  name        text not null,
  description text default '',
  category    text default 'hobby' check (category in ('alumni', 'professional', 'hobby', 'cultural', 'cause')),
  members     uuid[] default '{}',
  admins      uuid[] default '{}',
  is_public   boolean default true,
  languages   text[] default '{}',
  rules       text[] default '{}',
  created_at  timestamptz default now()
);

alter table communities enable row level security;

create policy "Communities are viewable by everyone"
  on communities for select
  using (true);

create policy "Authenticated users can create communities"
  on communities for insert
  with check (auth.uid() is not null);

create policy "Authenticated users can update communities"
  on communities for update
  using (auth.uid() is not null);

-- ─── 8. event_rsvps ─────────────────────────────────────────────────────────
-- Tracks which users RSVPed to which events.

create table if not exists event_rsvps (
  id         uuid primary key default uuid_generate_v4(),
  event_id   uuid not null references events(id) on delete cascade,
  user_id    uuid not null references profiles(id) on delete cascade,
  created_at timestamptz default now(),
  unique(event_id, user_id)
);

alter table event_rsvps enable row level security;

create policy "Users can view own RSVPs"
  on event_rsvps for select
  using (auth.uid() = user_id);

create policy "Users can RSVP to events"
  on event_rsvps for insert
  with check (auth.uid() = user_id);

-- ─── 9. family_endorsements ──────────────────────────────────────────────────
-- Family/community endorsements for trust building.

create table if not exists family_endorsements (
  id            uuid primary key default uuid_generate_v4(),
  user_id       uuid not null references profiles(id) on delete cascade,
  endorser_name text not null,
  endorser_phone text default '',
  relationship  text not null,
  message       text default '',
  status        text default 'pending' check (status in ('pending', 'approved', 'declined')),
  created_at    timestamptz default now()
);

alter table family_endorsements enable row level security;

create policy "Users can view endorsements for own profile"
  on family_endorsements for select
  using (auth.uid() = user_id);

create policy "Users can request endorsements"
  on family_endorsements for insert
  with check (auth.uid() = user_id);

-- ─── 10. safety_check_ins ────────────────────────────────────────────────────
-- Safety check-in sessions.

create table if not exists safety_check_ins (
  id                 uuid primary key default uuid_generate_v4(),
  user_id            uuid not null references profiles(id) on delete cascade,
  match_id           uuid references matches(id) on delete set null,
  latitude           double precision default 0,
  longitude          double precision default 0,
  status             text default 'active' check (status in ('active', 'completed', 'emergency', 'expired')),
  emergency_contacts text[] default '{}',
  check_in_interval  integer default 30,
  last_check_in      timestamptz default now(),
  created_at         timestamptz default now()
);

alter table safety_check_ins enable row level security;

create policy "Users can manage own check-ins"
  on safety_check_ins for all
  using (auth.uid() = user_id);

-- ─── 11. reports ─────────────────────────────────────────────────────────────
-- User reports against other users.

create table if not exists reports (
  id               uuid primary key default uuid_generate_v4(),
  reporter_id      uuid not null references profiles(id) on delete cascade,
  reported_user_id uuid not null references profiles(id) on delete cascade,
  reason           text not null check (reason in ('harassment', 'scam', 'fake_profile', 'explicit_content', 'inappropriate_behavior', 'other')),
  description      text default '',
  evidence         text[] default '{}',
  status           text default 'pending' check (status in ('pending', 'reviewed', 'resolved', 'escalated')),
  created_at       timestamptz default now()
);

alter table reports enable row level security;

create policy "Users can view own reports"
  on reports for select
  using (auth.uid() = reporter_id);

create policy "Users can submit reports"
  on reports for insert
  with check (auth.uid() = reporter_id);

-- ─── 12. trusted_contacts ────────────────────────────────────────────────────
-- Emergency contacts for safety features.

create table if not exists trusted_contacts (
  id         uuid primary key default uuid_generate_v4(),
  user_id    uuid not null references profiles(id) on delete cascade,
  phone      text not null,
  name       text default '',
  created_at timestamptz default now()
);

alter table trusted_contacts enable row level security;

create policy "Users can manage own trusted contacts"
  on trusted_contacts for all
  using (auth.uid() = user_id);

-- ─── Indexes for performance ─────────────────────────────────────────────────

create index if not exists idx_profiles_community on profiles(community);
create index if not exists idx_profiles_languages on profiles using gin(languages);
create index if not exists idx_profiles_location on profiles(latitude, longitude);
create index if not exists idx_events_date on events(date);
create index if not exists idx_events_category on events(category);
create index if not exists idx_communities_category on communities(category);
