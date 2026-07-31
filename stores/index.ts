import { create } from 'zustand';
import { User, Match, Message, Event, Community, SafetyCheckIn, Report, Language } from '@/types';
import { supabase } from '@/lib/supabase';
import { uploadProfilePhotos } from '@/services/upload';
import { clientThrottle, checkRateLimit } from '@/services/rateLimit';

const PUBLIC_PROFILE_COLUMNS = 'id, name, age, gender, bio, photos, languages, community, religion, values, interests, prompts, family_values, looking_for, is_verified, is_photo_verified, kyc_level, safety_score, credits, referral_code, boosted_until, created_at, updated_at';

const PUBLIC_PROFILE_COLUMNS_WITH_LOCATION = PUBLIC_PROFILE_COLUMNS + ', latitude, longitude';

function roundCoordinates(lat: number, lon: number, precision = 1) {
  return {
    latitude: parseFloat(lat.toFixed(precision)),
    longitude: parseFloat(lon.toFixed(precision)),
  };
}

function mapDbProfileToUser(row: any): User {
  return {
    id: row.id,
    email: row.email || '',
    phone: row.phone || '',
    name: row.name || '',
    age: row.age || 0,
    gender: row.gender || 'other',
    bio: row.bio || '',
    photos: row.photos || [],
    languages: row.languages || [],
    community: row.community || '',
    religion: row.religion || '',
    values: row.values || [],
    interests: row.interests || [],
    prompts: row.prompts || [],
    familyValues: row.family_values || 'balanced',
    lookingFor: row.looking_for || 'relationship',
    location: (row.latitude && row.longitude)
      ? roundCoordinates(row.latitude, row.longitude, 1)
      : '',
    isVerified: row.is_verified || false,
    isPhotoVerified: row.is_photo_verified || false,
    kycLevel: row.kyc_level || 'none',
    safetyScore: row.safety_score ?? 50,
    credits: row.credits ?? 10,
    referralCode: row.referral_code || '',
    boostedUntil: row.boosted_until || undefined,
    createdAt: row.created_at || new Date().toISOString(),
    updatedAt: row.updated_at || new Date().toISOString(),
  };
}

function mapUserToDbUpdates(updates: Partial<User>): Record<string, any> {
  const dbUpdates: Record<string, any> = {};
  if (updates.name !== undefined) dbUpdates.name = updates.name;
  if (updates.age !== undefined) dbUpdates.age = updates.age;
  if (updates.gender !== undefined) dbUpdates.gender = updates.gender;
  if (updates.bio !== undefined) dbUpdates.bio = updates.bio;
  if (updates.photos !== undefined) dbUpdates.photos = updates.photos;
  if (updates.languages !== undefined) dbUpdates.languages = updates.languages;
  if (updates.community !== undefined) dbUpdates.community = updates.community;
  if (updates.religion !== undefined) dbUpdates.religion = updates.religion;
  if (updates.values !== undefined) dbUpdates.values = updates.values;
  if (updates.interests !== undefined) dbUpdates.interests = updates.interests;
  if (updates.prompts !== undefined) dbUpdates.prompts = updates.prompts;
  if (updates.referralCode !== undefined) dbUpdates.referral_code = updates.referralCode;
  if (updates.familyValues !== undefined) dbUpdates.family_values = updates.familyValues;
  if (updates.lookingFor !== undefined) dbUpdates.looking_for = updates.lookingFor;
  if (updates.phone !== undefined) dbUpdates.phone = updates.phone;
  if (updates.isVerified !== undefined) dbUpdates.is_verified = updates.isVerified;
  if (updates.isPhotoVerified !== undefined) dbUpdates.is_photo_verified = updates.isPhotoVerified;
  if (updates.kycLevel !== undefined) dbUpdates.kyc_level = updates.kycLevel;
  if (updates.safetyScore !== undefined) dbUpdates.safety_score = updates.safetyScore;
  if (updates.credits !== undefined) dbUpdates.credits = updates.credits;
  if (updates.boostedUntil !== undefined) dbUpdates.boosted_until = updates.boostedUntil;
  if (updates.location !== undefined && typeof updates.location === 'object' && updates.location !== null) {
    dbUpdates.latitude = (updates.location as any).latitude;
    dbUpdates.longitude = (updates.location as any).longitude;
  }
  return dbUpdates;
}

export async function fetchUserProfile(userId: string): Promise<User | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  if (error || !data) return null;
  return mapDbProfileToUser(data);
}

interface AuthState {
  user: User | null;
  session: any;
  isLoading: boolean;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  setSession: (session: any) => void;
  signIn: (email: string) => Promise<void>;
  verifySignIn: (email: string, code: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  session: null,
  isLoading: true,
  isAuthenticated: false,

  setUser: (user) => set({ user, isAuthenticated: !!user, isLoading: false }),
  setSession: (session) => set({ session }),

  signIn: async (email: string) => {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: true },
    });
    if (error) throw error;
  },

  verifySignIn: async (email: string, code: string) => {
    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token: code,
      type: 'email',
    });
    if (error || !data.session) throw new Error('Invalid or expired code');

    await supabase.auth.setSession({
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
    });

    let profile = await fetchUserProfile(data.session.user.id);
    if (!profile) {
      const referralCode = email.split('@')[0].slice(0, 6).toUpperCase() + Math.random().toString(36).slice(2, 5).toUpperCase();
      const { error: insertError } = await supabase
        .from('profiles')
        .insert({
          id: data.session.user.id,
          email,
          name: '',
          referral_code: referralCode,
        });
      if (!insertError) {
        profile = await fetchUserProfile(data.session.user.id);
      }
    }

    set({
      session: data.session,
      user: profile,
      isAuthenticated: true,
    });
  },

  signOut: async () => {
    try {
      await supabase.auth.signOut();
      set({ user: null, session: null, isAuthenticated: false });
    } catch (error) {
      console.error('Sign out error:', error);
    }
  },

  updateProfile: async (updates: Partial<User>) => {
    const { user } = get();
    if (!user) throw new Error('No authenticated user');
    try {
      const finalUpdates = { ...updates };

      if (updates.photos && updates.photos.length > 0) {
        const uploaded = await uploadProfilePhotos(updates.photos, user.id);
        if (uploaded.length > 0) {
          finalUpdates.photos = uploaded;
        }
      }

      const dbUpdates = mapUserToDbUpdates(finalUpdates);
      if (Object.keys(dbUpdates).length === 0) return;
      const { error } = await supabase
        .from('profiles')
        .update(dbUpdates)
        .eq('id', user.id);
      if (error) throw error;
      set({ user: { ...user, ...finalUpdates } });
    } catch (error) {
      console.error('Update profile error:', error);
    }
  },
}));

interface MatchingState {
  matches: Match[];
  potentialMatches: User[];
  likesReceived: User[];
  blockedUsers: string[];
  currentMatchIndex: number;
  isLoading: boolean;
  setMatches: (matches: Match[]) => void;
  setPotentialMatches: (matches: User[]) => void;
  likeUser: (userId: string) => Promise<void>;
  passUser: (userId: string) => Promise<void>;
  superLikeUser: (userId: string) => Promise<void>;
  fetchPotentialMatches: () => Promise<void>;
  fetchMatches: () => Promise<void>;
  fetchLikesReceived: () => Promise<void>;
  blockUser: (userId: string) => Promise<void>;
  unblockUser: (userId: string) => Promise<void>;
  fetchBlockedUsers: () => Promise<void>;
  isBlockedBy: (otherUserId: string) => Promise<boolean>;
}

export const useMatchingStore = create<MatchingState>((set, get) => ({
  matches: [],
  potentialMatches: [],
  likesReceived: [],
  blockedUsers: [],
  currentMatchIndex: 0,
  isLoading: false,

  setMatches: (matches) => set({ matches }),
  setPotentialMatches: (matches) => set({ potentialMatches: matches }),

  likeUser: async (userId: string) => {
    const { user } = useAuthStore.getState();
    if (!user) return;
    if (!clientThrottle('like')) return;
    const allowed = await checkRateLimit(user.id, 'like', 30, 60);
    if (!allowed) return;
    if (await isBlocked(user.id, userId)) return;
    try {
      const { error } = await supabase.from('swipes').insert({
        swiper_id: user.id,
        swiped_id: userId,
        action: 'like',
      });
      if (error) throw error;

      const { data: reverseSwipe } = await supabase
        .from('swipes')
        .select('*')
        .eq('swiper_id', userId)
        .eq('swiped_id', user.id)
        .eq('action', 'like')
        .maybeSingle();

      if (reverseSwipe) {
        const otherProfile = await fetchUserProfile(userId);
        const score = otherProfile ? calculateCompatibility(user, otherProfile) : 50;
        const { error: matchError } = await supabase.from('matches').insert({
          user_1: user.id,
          user_2: userId,
          compatibility_score: score,
        });
        if (matchError && matchError.code !== '23505') throw matchError;
      }

      set((state) => ({
        currentMatchIndex: state.currentMatchIndex + 1,
      }));
    } catch (error) {
      console.error('Like error:', error);
    }
  },

  passUser: async (userId: string) => {
    const { user } = useAuthStore.getState();
    if (!user) return;
    if (!clientThrottle('pass')) return;
    const allowed = await checkRateLimit(user.id, 'pass', 50, 60);
    if (!allowed) return;
    if (await isBlocked(user.id, userId)) return;
    try {
      await supabase.from('swipes').insert({
        swiper_id: user.id,
        swiped_id: userId,
        action: 'pass',
      });
    } catch (error) {
      console.error('Pass error:', error);
    }
    set((state) => ({
      currentMatchIndex: state.currentMatchIndex + 1,
    }));
  },

  superLikeUser: async (userId: string) => {
    const { user } = useAuthStore.getState();
    if (!user) return;
    if (!clientThrottle('super_like')) return;
    try {
      await supabase.from('swipes').insert({
        swiper_id: user.id,
        swiped_id: userId,
        action: 'super_like',
      });
      set((state) => ({
        currentMatchIndex: state.currentMatchIndex + 1,
      }));
    } catch (error) {
      console.error('Super like error:', error);
    }
  },

  fetchPotentialMatches: async () => {
    const { user } = useAuthStore.getState();
    if (!user) return;
    set({ isLoading: true });
    try {
      const { data: swipeIds } = await supabase
        .from('swipes')
        .select('swiped_id')
        .eq('swiper_id', user.id);
      const { data: blockedByIds } = await supabase
        .from('blocked_users')
        .select('blocker_id')
        .eq('blocked_id', user.id);
      const { data: myBlockedIds } = await supabase
        .from('blocked_users')
        .select('blocked_id')
        .eq('blocker_id', user.id);

      const excludeIds = new Set<string>();
      (swipeIds || []).forEach((s: any) => excludeIds.add(s.swiped_id));
      (blockedByIds || []).forEach((b: any) => excludeIds.add(b.blocker_id));
      (myBlockedIds || []).forEach((b: any) => excludeIds.add(b.blocked_id));
      excludeIds.add(user.id);

      const excludeIdList = Array.from(excludeIds);
      let query = supabase
        .from('profiles')
        .select(PUBLIC_PROFILE_COLUMNS_WITH_LOCATION)
        .limit(50);
      if (excludeIdList.length > 0) {
        query = query.not('id', 'in', `(${excludeIdList.join(',')})`);
      }
      const { data, error } = await query;
      if (error) throw error;

      const scored = (data || []).map((profile: any) => {
        const mapped = mapDbProfileToUser(profile);
        return {
          ...mapped,
          _compatibilityScore: calculateCompatibility(user, mapped),
        };
      });

      scored.sort((a: any, b: any) => b._compatibilityScore - a._compatibilityScore);

      set({ potentialMatches: scored, isLoading: false });
    } catch (error) {
      console.error('Fetch matches error:', error);
      set({ isLoading: false });
    }
  },

  fetchMatches: async () => {
    const { user } = useAuthStore.getState();
    if (!user) return;
    set({ isLoading: true });
    try {
      const { data, error } = await supabase
        .from('matches')
        .select(`*, user_1_profile:profiles!matches_user_1_fkey(${PUBLIC_PROFILE_COLUMNS_WITH_LOCATION}), user_2_profile:profiles!matches_user_2_fkey(${PUBLIC_PROFILE_COLUMNS_WITH_LOCATION})`)
        .or(`user_1.eq.${user.id},user_2.eq.${user.id}`)
        .order('created_at', { ascending: false });
      if (error) throw error;

      const matches = (data || []).map((m: any) => {
        const isUser1 = m.user_1 === user.id;
        const otherProfile = isUser1 ? m.user_2_profile : m.user_1_profile;
        return {
          id: m.id,
          userId: user.id,
          matchedUserId: isUser1 ? m.user_2 : m.user_1,
          compatibilityScore: m.compatibility_score ?? 0,
          culturalScore: 0,
          interestsScore: 0,
          status: 'matched' as const,
          initiatedBy: m.user_1,
          createdAt: m.created_at,
          otherUser: otherProfile ? mapDbProfileToUser(otherProfile) : undefined,
        } as Match;
      });

      set({ matches, isLoading: false });
    } catch (error) {
      console.error('Fetch matches error:', error);
      set({ isLoading: false });
    }
  },

  fetchLikesReceived: async () => {
    const { user } = useAuthStore.getState();
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('swipes')
        .select(`swiper_id, profiles!swipes_swiper_id_fkey(${PUBLIC_PROFILE_COLUMNS_WITH_LOCATION})`)
        .eq('swiped_id', user.id)
        .in('action', ['like', 'super_like'])
        .order('created_at', { ascending: false });
      if (error) throw error;

      const likedBy = (data || []).map((s: any) => mapDbProfileToUser(s.profiles));
      set({ likesReceived: likedBy });
    } catch (error) {
      console.error('Fetch likes error:', error);
    }
  },

  blockUser: async (userId: string) => {
    const { user } = useAuthStore.getState();
    if (!user) return;
    try {
      const { error } = await supabase.from('blocked_users').insert({
        blocker_id: user.id,
        blocked_id: userId,
      });
      if (error && error.code !== '23505') throw error;
      set((state) => ({
        blockedUsers: state.blockedUsers.includes(userId) ? state.blockedUsers : [...state.blockedUsers, userId],
        potentialMatches: state.potentialMatches.filter((p) => p.id !== userId),
        matches: state.matches.filter((m) => m.matchedUserId !== userId && m.userId !== userId),
      }));
    } catch (error) {
      console.error('Block error:', error);
    }
  },

  unblockUser: async (userId: string) => {
    const { user } = useAuthStore.getState();
    if (!user) return;
    try {
      await supabase.from('blocked_users')
        .delete()
        .eq('blocker_id', user.id)
        .eq('blocked_id', userId);
      set((state) => ({
        blockedUsers: state.blockedUsers.filter((id) => id !== userId),
      }));
    } catch (error) {
      console.error('Unblock error:', error);
    }
  },

  fetchBlockedUsers: async () => {
    const { user } = useAuthStore.getState();
    if (!user) return;
    try {
      const { data } = await supabase
        .from('blocked_users')
        .select('blocked_id')
        .eq('blocker_id', user.id);
      set({ blockedUsers: (data || []).map((b: any) => b.blocked_id) });
    } catch {}
  },

  isBlockedBy: async (otherUserId: string) => {
    return isBlocked(useAuthStore.getState().user?.id || '', otherUserId);
  },
}));

function calculateCompatibility(user: User, potential: User): number {
  let score = 0;

  const sharedLanguages = user.languages.filter((l) => potential.languages.includes(l));
  score += sharedLanguages.length * 10;

  if (user.community === potential.community) score += 15;
  if (user.religion === potential.religion) score += 10;

  const sharedValues = user.values.filter((v) => potential.values.includes(v));
  score += sharedValues.length * 5;

  const sharedInterests = user.interests.filter((i) => potential.interests.includes(i));
  score += sharedInterests.length * 5;

  if (user.lookingFor === potential.lookingFor) score += 20;

  if (user.familyValues === potential.familyValues) score += 10;

  return Math.min(score, 100);
}

interface ChatState {
  conversations: Record<string, Message[]>;
  isLoading: boolean;
  sendMessage: (matchId: string, content: string, type?: Message['type']) => Promise<void>;
  fetchMessages: (matchId: string) => Promise<void>;
  flagMessage: (messageId: string, reason: string) => Promise<void>;
}

export const useChatStore = create<ChatState>((set, get) => ({
  conversations: {},
  isLoading: false,

  sendMessage: async (matchId: string, content: string, type = 'text' as const) => {
    const { user } = useAuthStore.getState();
    if (!user) return;
    if (!clientThrottle('message')) return;

    const moderationCheck = moderateContent(content);
    if (moderationCheck.flagged) {
      await supabase.from('moderation_queue').insert({
        message_content: content,
        sender_id: user.id,
        reason: moderationCheck.reason,
      });
      return;
    }

    const { data: match } = await supabase
      .from('matches')
      .select('user_1, user_2')
      .eq('id', matchId)
      .maybeSingle();
    const otherUserId = match ? (match.user_1 === user.id ? match.user_2 : match.user_1) : null;
    if (otherUserId && await isBlocked(user.id, otherUserId)) return;

    try {
      const { error } = await supabase.from('messages').insert({
        match_id: matchId,
        sender_id: user.id,
        content,
        type,
      });
      if (error) throw error;

      set((state) => ({
        conversations: {
          ...state.conversations,
          [matchId]: [
            ...(state.conversations[matchId] || []),
            {
              id: Date.now().toString(),
              matchId,
              senderId: user.id,
              content,
              type,
              isFlagged: false,
              createdAt: new Date().toISOString(),
            },
          ],
        },
      }));
    } catch (error) {
      console.error('Send message error:', error);
    }
  },

  fetchMessages: async (matchId: string) => {
    set({ isLoading: true });
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('match_id', matchId)
        .order('created_at', { ascending: true });
      if (error) throw error;

      set((state) => ({
        conversations: {
          ...state.conversations,
          [matchId]: data || [],
        },
        isLoading: false,
      }));
    } catch (error) {
      console.error('Fetch messages error:', error);
      set({ isLoading: false });
    }
  },

  flagMessage: async (messageId: string, reason: string) => {
    try {
      await supabase.from('moderation_queue').insert({
        message_id: messageId,
        reason,
      });
    } catch (error) {
      console.error('Flag message error:', error);
    }
  },
}));

function moderateContent(content: string): { flagged: boolean; reason?: string } {
  const scamPatterns = [
    /send\s*(me\s*)?money/i,
    /bank\s*account/i,
    /western\s*union/i,
    /visa\s*fee/i,
    /processing\s*fee/i,
    /invest\s*\d+/i,
    /guaranteed\s*return/i,
    /credit\s*card/i,
    /wire\s*(me\s*)?\$/i,
    /paypal\s*me/i,
    /cash\s*app/i,
    /money\s*gram/i,
    / bitcoin\b/i,
    /crypto\b.*send/i,
  ];

  const harassmentPatterns = [
    /kill\s*yourself/i,
    /you'?re\s*(ugly|stupid|worthless|fat|disgusting)/i,
    /i'?ll\s*find\s*you/i,
    /send\s*(me\s*)?(nudes?|pics?|photos?)/i,
    /\bdie\b/i,
    /\bharm\b.*\byou\b/i,
    /\brape\b/i,
    /\bslut\b/i,
    /\bwhore\b/i,
    /\bnigga?\b/i,
    /\bfag\b/i,
  ];

  const explicitPatterns = [
    /\bonlyfans\b/i,
    /\bsex\b.*\b(tape|video|chat)\b/i,
    /\bnsfw\b/i,
  ];

  const phonePattern = /\b(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/;

  for (const pattern of scamPatterns) {
    if (pattern.test(content)) return { flagged: true, reason: 'scam' };
  }
  for (const pattern of harassmentPatterns) {
    if (pattern.test(content)) return { flagged: true, reason: 'harassment' };
  }
  for (const pattern of explicitPatterns) {
    if (pattern.test(content)) return { flagged: true, reason: 'explicit_content' };
  }
  if (phonePattern.test(content)) return { flagged: true, reason: 'scam' };

  return { flagged: false };
}

async function isBlocked(userId: string, otherUserId: string): Promise<boolean> {
  try {
    const { data } = await supabase
      .from('blocked_users')
      .select('id')
      .eq('blocker_id', otherUserId)
      .eq('blocked_id', userId)
      .maybeSingle();
    return !!data;
  } catch {
    return false;
  }
}

interface SafetyState {
  activeCheckIn: SafetyCheckIn | null;
  reports: Report[];
  trustedContacts: string[];
  startCheckIn: (matchId: string) => Promise<void>;
  endCheckIn: () => Promise<void>;
  triggerEmergency: () => Promise<void>;
  reportUser: (reportedUserId: string, reason: Report['reason'], description: string) => Promise<void>;
  addTrustedContact: (phone: string) => void;
  fetchTrustedContacts: () => Promise<void>;
}

export const useSafetyStore = create<SafetyState>((set, get) => ({
  activeCheckIn: null,
  reports: [],
  trustedContacts: [],

  startCheckIn: async (matchId: string) => {
    const { user } = useAuthStore.getState();
    if (!user) return;

    const location = typeof user.location === 'object' && user.location !== null ? user.location : { latitude: 0, longitude: 0 };

    try {
      const { data, error } = await supabase
        .from('safety_check_ins')
        .insert({
          user_id: user.id,
          match_id: matchId,
          latitude: location.latitude,
          longitude: location.longitude,
          status: 'active',
          emergency_contacts: get().trustedContacts,
        })
        .select('id')
        .single();

      if (!error && data) {
        const checkIn: SafetyCheckIn = {
          id: data.id,
          userId: user.id,
          matchId,
          location,
          status: 'active',
          emergencyContacts: get().trustedContacts,
          checkInInterval: 30,
          lastCheckIn: new Date().toISOString(),
          createdAt: new Date().toISOString(),
        };
        set({ activeCheckIn: checkIn });
      }
    } catch (e) {
      console.error('Start check-in error:', e);
    }
  },

  endCheckIn: async () => {
    const { activeCheckIn } = get();
    if (!activeCheckIn) return;
    try {
      await supabase
        .from('safety_check_ins')
        .update({ status: 'completed' })
        .eq('id', activeCheckIn.id);
      set({ activeCheckIn: null });
    } catch (e) {
      console.error('End check-in error:', e);
    }
  },

  triggerEmergency: async () => {
    const { activeCheckIn, trustedContacts } = get();
    if (!activeCheckIn) return;

    try {
      await supabase
        .from('safety_check_ins')
        .update({ status: 'emergency' })
        .eq('id', activeCheckIn.id);

      await supabase.from('moderation_queue').insert({
        message_content: '[EMERGENCY ALERT] User triggered safety alert',
        sender_id: activeCheckIn.userId,
        reason: 'safety_emergency',
      });
    } catch (e) {
      console.error('Emergency trigger error:', e);
    }

    set({
      activeCheckIn: { ...activeCheckIn, status: 'emergency' },
    });
  },

  reportUser: async (reportedUserId: string, reason: Report['reason'], description: string) => {
    const { user } = useAuthStore.getState();
    if (!user) return;
    if (!reportedUserId || reportedUserId === user.id) return;
    if (!reason) return;
    const trimmedDesc = (description || '').trim().slice(0, 1000);

    try {
      const { error } = await supabase
        .from('reports')
        .insert({
          reporter_id: user.id,
          reported_user_id: reportedUserId,
          reason,
          description: trimmedDesc,
        });

      if (!error) {
        const report: Report = {
          id: '',
          reporterId: user.id,
          reportedUserId,
          reason,
          description,
          evidence: [],
          status: 'pending',
          createdAt: new Date().toISOString(),
        };
        set((state) => ({
          reports: [...state.reports, report],
        }));
      }
    } catch (e) {
      console.error('Report user error:', e);
    }
  },

  addTrustedContact: async (phone: string) => {
    const { user } = useAuthStore.getState();
    if (!user) return;

    try {
      const { error } = await supabase
        .from('trusted_contacts')
        .insert({ user_id: user.id, phone });

      if (!error) {
        set((state) => ({
          trustedContacts: [...state.trustedContacts, phone],
        }));
      }
    } catch (e) {
      console.error('Add trusted contact error:', e);
    }
  },

  fetchTrustedContacts: async () => {
    const { user } = useAuthStore.getState();
    if (!user) return;
    try {
      const { data } = await supabase
        .from('trusted_contacts')
        .select('phone')
        .eq('user_id', user.id);
      if (data) {
        set({ trustedContacts: data.map((c: any) => c.phone) });
      }
    } catch {}
  },
}));

interface EventState {
  events: Event[];
  userEvents: string[];
  isLoading: boolean;
  fetchEvents: () => Promise<void>;
  rsvpEvent: (eventId: string) => Promise<void>;
  unrsvpEvent: (eventId: string) => Promise<void>;
  createEvent: (event: Omit<Event, 'id' | 'currentAttendees' | 'createdAt'>) => Promise<void>;
}

export const useEventStore = create<EventState>((set, get) => ({
  events: [],
  userEvents: [],
  isLoading: false,

  fetchEvents: async () => {
    set({ isLoading: true });
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('date', { ascending: true });
      if (error) throw error;
      set({ events: data || [], isLoading: false });
    } catch (error) {
      console.error('Fetch events error:', error);
      set({ isLoading: false });
    }
  },

  rsvpEvent: async (eventId: string) => {
    const { user } = useAuthStore.getState();
    if (!user) return;
    try {
      const { error } = await supabase.from('event_rsvps').insert({
        event_id: eventId,
        user_id: user.id,
      });
      if (error && error.code !== '23505') throw error;
      set((state) => ({
        userEvents: [...state.userEvents, eventId],
        events: state.events.map((e) =>
          e.id === eventId ? { ...e, currentAttendees: (e.currentAttendees || 0) + 1 } : e
        ),
      }));
    } catch (error) {
      console.error('RSVP error:', error);
    }
  },

  unrsvpEvent: async (eventId: string) => {
    const { user } = useAuthStore.getState();
    if (!user) return;
    try {
      await supabase.from('event_rsvps')
        .delete()
        .eq('event_id', eventId)
        .eq('user_id', user.id);
      set((state) => ({
        userEvents: state.userEvents.filter((id) => id !== eventId),
        events: state.events.map((e) =>
          e.id === eventId ? { ...e, currentAttendees: Math.max(0, (e.currentAttendees || 1) - 1) } : e
        ),
      }));
    } catch (error) {
      console.error('UnRSVP error:', error);
    }
  },

  createEvent: async (eventData) => {
    try {
      const { data, error } = await supabase.from('events').insert(eventData).select('id').single();
      if (error) throw error;
      const newEvent: Event = {
        id: data.id,
        currentAttendees: 1,
        createdAt: new Date().toISOString(),
        ...eventData,
      };
      set((state) => ({ events: [newEvent, ...state.events], userEvents: [newEvent.id, ...state.userEvents] }));
    } catch (error) {
      console.error('Create event error:', error);
    }
  },
}));

interface CommunityState {
  communities: Community[];
  userCommunities: string[];
  isLoading: boolean;
  fetchCommunities: () => Promise<void>;
  joinCommunity: (communityId: string) => void;
  leaveCommunity: (communityId: string) => void;
  createCommunity: (community: Omit<Community, 'id' | 'memberCount' | 'createdAt'>) => Promise<void>;
}

export const useCommunityStore = create<CommunityState>((set) => ({
  communities: [],
  userCommunities: [],
  isLoading: false,

  fetchCommunities: async () => {
    set({ isLoading: true });
    try {
      const { data, error } = await supabase
        .from('communities')
        .select('*');
      if (error) throw error;
      set({ communities: data || [], isLoading: false });
    } catch (error) {
      console.error('Fetch communities error:', error);
      set({ isLoading: false });
    }
  },

  joinCommunity: (communityId: string) => {
    set((state) => ({
      userCommunities: state.userCommunities.includes(communityId)
        ? state.userCommunities
        : [...state.userCommunities, communityId],
    }));
  },

  leaveCommunity: (communityId: string) => {
    set((state) => ({
      userCommunities: state.userCommunities.filter((id) => id !== communityId),
    }));
  },

  createCommunity: async (communityData) => {
    try {
      const { data, error } = await supabase.from('communities').insert(communityData).select('id').single();
      if (error) throw error;
      const newComm: Community = {
        id: data.id,
        memberCount: 1,
        createdAt: new Date().toISOString(),
        ...communityData,
      };
      set((state) => ({ communities: [newComm, ...state.communities], userCommunities: [newComm.id, ...state.userCommunities] }));
    } catch (error) {
      console.error('Create community error:', error);
    }
  },
}));

interface NotificationState {
  pushToken: string | null;
  pushEnabled: boolean;
  smsEnabled: boolean;
  matchAlerts: boolean;
  messageAlerts: boolean;
  eventAlerts: boolean;
  setPushToken: (token: string | null) => void;
  setPushEnabled: (enabled: boolean) => void;
  setSmsEnabled: (enabled: boolean) => void;
  setMatchAlerts: (enabled: boolean) => void;
  setMessageAlerts: (enabled: boolean) => void;
  setEventAlerts: (enabled: boolean) => void;
  requestPermission: () => Promise<boolean>;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  pushToken: null,
  pushEnabled: true,
  smsEnabled: true,
  matchAlerts: true,
  messageAlerts: true,
  eventAlerts: true,
  setPushToken: (token) => set({ pushToken: token }),
  setPushEnabled: (enabled) => set({ pushEnabled: enabled }),
  setSmsEnabled: (enabled) => set({ smsEnabled: enabled }),
  setMatchAlerts: (enabled) => set({ matchAlerts: enabled }),
  setMessageAlerts: (enabled) => set({ messageAlerts: enabled }),
  setEventAlerts: (enabled) => set({ eventAlerts: enabled }),
  requestPermission: async () => {
    if (typeof Notification === 'undefined') return false;
    if (Notification.permission === 'granted') return true;
    if (Notification.permission === 'denied') return false;
    const result = await Notification.requestPermission();
    return result === 'granted';
  },
}));

interface StreakState {
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string | null;
  checkIn: () => void;
  initStreak: () => void;
}

export const useStreakStore = create<StreakState>((set, get) => ({
  currentStreak: 0,
  longestStreak: 0,
  lastActiveDate: null,

  initStreak: () => {
    try {
      const stored = localStorage.getItem('isizuo_streak');
      if (stored) {
        const data = JSON.parse(stored);
        const lastDate = data.lastActiveDate ? new Date(data.lastActiveDate) : null;
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (lastDate) {
          const diffDays = Math.floor((today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
          if (diffDays === 0) {
            set({ currentStreak: data.currentStreak || 0, longestStreak: data.longestStreak || 0, lastActiveDate: data.lastActiveDate });
            return;
          }
          if (diffDays === 1) {
            const newStreak = (data.currentStreak || 0) + 1;
            const newLongest = Math.max(newStreak, data.longestStreak || 0);
            set({ currentStreak: newStreak, longestStreak: newLongest, lastActiveDate: today.toISOString() });
            localStorage.setItem('isizuo_streak', JSON.stringify({ currentStreak: newStreak, longestStreak: newLongest, lastActiveDate: today.toISOString() }));
            return;
          }
        }
        set({ currentStreak: 0, lastActiveDate: null });
        localStorage.removeItem('isizuo_streak');
      }
    } catch {}
  },

  checkIn: () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = today.toISOString();
    const { lastActiveDate, currentStreak, longestStreak } = get();

    if (lastActiveDate === todayStr) return;

    const lastDate = lastActiveDate ? new Date(lastActiveDate) : null;
    let newStreak = 1;

    if (lastDate) {
      const diffDays = Math.floor((today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays === 1) {
        newStreak = currentStreak + 1;
      }
    }

    const newLongest = Math.max(newStreak, longestStreak);
    set({ currentStreak: newStreak, longestStreak: newLongest, lastActiveDate: todayStr });
    try {
      localStorage.setItem('isizuo_streak', JSON.stringify({ currentStreak: newStreak, longestStreak: newLongest, lastActiveDate: todayStr }));
    } catch {}
  },
}));

interface AppState {
  language: Language;
  isLowDataMode: boolean;
  setLanguage: (lang: Language) => void;
  toggleLowDataMode: () => void;
}

function readStoredLanguage(): Language {
  try {
    const stored = typeof localStorage !== 'undefined' ? localStorage.getItem('isizuo_language') : null;
    if (stored && ['en', 'yo', 'sw', 'ha', 'am'].includes(stored)) return stored as Language;
  } catch {}
  return 'en';
}

export const useAppStore = create<AppState>((set) => ({
  language: readStoredLanguage(),
  isLowDataMode: false,
  setLanguage: (lang) => {
    set({ language: lang });
    try {
      localStorage.setItem('isizuo_language', lang);
    } catch {}
  },
  toggleLowDataMode: () => set((state) => ({ isLowDataMode: !state.isLowDataMode })),
}));
