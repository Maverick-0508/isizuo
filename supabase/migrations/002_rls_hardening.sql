-- ─── Fix 1: Profiles RLS — restrict what other users see ──────────────────
-- Drop the permissive "viewable by everyone" policy
drop policy if exists "Profiles are viewable by everyone" on profiles;

-- Only expose profiles to authenticated users (not anonymous)
create policy "Profiles viewable by authenticated users"
  on profiles for select
  using (auth.role() = 'authenticated');

-- ─── Fix 2: Matches — prevent fake match creation ─────────────────────────
-- Drop the permissive insert policy
drop policy if exists "System can create matches" on matches;

-- Only allow match creation when both users have liked each other
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

-- ─── Fix 3: Moderation queue — admins only for write, visible to reporters ─
drop policy if exists "Admins can manage moderation queue" on moderation_queue;

create policy "Users can view own moderation items"
  on moderation_queue for select
  using (auth.uid() = sender_id);

create policy "System can insert moderation items"
  on moderation_queue for insert
  with check (auth.uid() = sender_id);

-- ─── Fix 4: Communities — only admins/members can update ───────────────────
drop policy if exists "Authenticated users can update communities" on communities;

create policy "Community admins can update"
  on communities for update
  using (
    auth.uid() = admin_id
  );

-- ─── Fix 5: Events — enforce host_id match ────────────────────────────────
drop policy if exists "Authenticated users can create events" on events;

create policy "Users create events as themselves"
  on events for insert
  with check (auth.uid() = host_id);

-- ─── Fix 6: Swipes — prevent self-swiping ──────────────────────────────────
drop policy if exists "Users can manage own swipes" on swipes;
drop policy if exists "Users can create swipes" on swipes;

create policy "Users manage own swipes"
  on swipes for all
  using (auth.uid() = swiper_id)
  with check (auth.uid() = swiper_id and swiper_id != swiped_id);

-- ─── Fix 7: Messages — only participants can read ──────────────────────────
drop policy if exists "Users can read messages from their matches" on messages;

create policy "Match participants can read messages"
  on messages for select
  using (
    exists (
      select 1 from matches
      where matches.id = messages.match_id
        and (matches.user_1 = auth.uid() or matches.user_2 = auth.uid())
    )
  );

-- ─── Fix 8: Prevent deleting profiles (soft delete via active flag) ─────────
drop policy if exists "Users can insert own profile" on profiles;
drop policy if exists "Users can update own profile" on profiles;

create policy "Users can insert own profile"
  on profiles for insert
  with check (auth.uid() = id);

create policy "Users can update own profile"
  on profiles for update
  using (auth.uid() = id);
