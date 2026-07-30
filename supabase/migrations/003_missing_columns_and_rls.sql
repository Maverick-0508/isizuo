-- ─── 1. Add missing columns to profiles ─────────────────────────────────────
alter table profiles add column if not exists referral_code text default '';
alter table profiles add column if not exists prompts jsonb default '[]'::jsonb;

-- ─── 2. Fix: Profiles RLS — restrict what other users see ──────────────────
drop policy if exists "Profiles are viewable by everyone" on profiles;

create policy "Profiles viewable by authenticated users"
  on profiles for select
  using (auth.role() = 'authenticated');

-- ─── 3. Fix: Matches — prevent fake match creation ─────────────────────────
drop policy if exists "System can create matches" on matches;

create policy "Matches require mutual like"
  on matches for insert
  with check (
    auth.uid() = user_1
    and exists (
      select 1 from swipes
      where swiper_id = user_2
        and swiped_id = user_1
        and action in ('like', 'super_like')
    )
  );

-- ─── 4. Fix: Moderation queue — restrict all access ────────────────────────
drop policy if exists "Admins can manage moderation queue" on moderation_queue;

create policy "Users can view own moderation items"
  on moderation_queue for select
  using (auth.uid() = sender_id);

create policy "System can insert moderation items"
  on moderation_queue for insert
  with check (auth.uid() = sender_id);

-- ─── 5. Fix: Communities — only admins can update ──────────────────────────
drop policy if exists "Authenticated users can update communities" on communities;

create policy "Community admins can update"
  on communities for update
  using (auth.uid() = ANY (admins));

-- ─── 6. Fix: Events — enforce host_id match ────────────────────────────────
drop policy if exists "Authenticated users can create events" on events;

create policy "Users create events as themselves"
  on events for insert
  with check (auth.uid() = host_id);

-- ─── 7. Fix: Swipes — prevent self-swiping ─────────────────────────────────
drop policy if exists "Users can insert own swipes" on swipes;

create policy "Users manage own swipes"
  on swipes for insert
  with check (auth.uid() = swiper_id and swiper_id != swiped_id);

-- ─── 8. Fix: already correct, but reassert for safety ─────────────────────
-- profiles insert/update: already have good policies
-- messages: already have good policies
-- reports: already have good policies
-- safety_check_ins: already have good policies
-- trusted_contacts: already have good policies
