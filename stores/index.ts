import { create } from 'zustand';
import { User, Match, Message, Event, Community, SafetyCheckIn, Report, Language } from '@/types';
import { supabase } from '@/lib/supabase';
import { sendOTP, verifyOTP } from '@/services/sms';

interface AuthState {
  user: User | null;
  session: any;
  isLoading: boolean;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  setSession: (session: any) => void;
  signIn: (email: string) => Promise<void>;
  verifyOtp: (email: string, token: string) => Promise<boolean>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  session: null,
  isLoading: true,
  isAuthenticated: false,

  setUser: (user) => set({ user, isAuthenticated: !!user }),
  setSession: (session) => set({ session }),

  signIn: async (email: string) => {
    try {
      const result = await sendOTP(email);
      if (!result?.session) throw new Error('Failed to send OTP');
      await supabase.auth.setSession({
        access_token: result.session.access_token,
        refresh_token: result.session.refresh_token,
      });
      set({
        session: result.session,
        user: result.session.user as unknown as User,
        isAuthenticated: true,
      });
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    }
  },

  verifyOtp: async (email: string, token: string) => {
    try {
      const result = await verifyOTP(email, token);
      if (result?.session) {
        await supabase.auth.setSession({
          access_token: result.session.access_token,
          refresh_token: result.session.refresh_token,
        });
        set({
          session: result.session,
          user: result.session.user as unknown as User,
          isAuthenticated: true,
        });
        return true;
      }
      return false;
    } catch (error) {
      console.error('Verify OTP error:', error);
      return false;
    }
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
    if (!user) return;
    try {
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);
      if (error) throw error;
      set({ user: { ...user, ...updates } });
    } catch (error) {
      console.error('Update profile error:', error);
    }
  },
}));

interface MatchingState {
  matches: Match[];
  potentialMatches: User[];
  currentMatchIndex: number;
  isLoading: boolean;
  setMatches: (matches: Match[]) => void;
  setPotentialMatches: (matches: User[]) => void;
  likeUser: (userId: string) => Promise<void>;
  passUser: (userId: string) => void;
  superLikeUser: (userId: string) => Promise<void>;
  fetchPotentialMatches: () => Promise<void>;
}

export const useMatchingStore = create<MatchingState>((set, get) => ({
  matches: [],
  potentialMatches: [],
  currentMatchIndex: 0,
  isLoading: false,

  setMatches: (matches) => set({ matches }),
  setPotentialMatches: (matches) => set({ potentialMatches: matches }),

  likeUser: async (userId: string) => {
    const { user } = useAuthStore.getState();
    if (!user) return;
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
        .single();

      if (reverseSwipe) {
        await supabase.from('matches').insert({
          user_1: user.id,
          user_2: userId,
          compatibility_score: Math.floor(Math.random() * 40) + 60,
        });
      }

      set((state) => ({
        currentMatchIndex: state.currentMatchIndex + 1,
      }));
    } catch (error) {
      console.error('Like error:', error);
    }
  },

  passUser: (userId: string) => {
    set((state) => ({
      currentMatchIndex: state.currentMatchIndex + 1,
    }));
  },

  superLikeUser: async (userId: string) => {
    const { user } = useAuthStore.getState();
    if (!user) return;
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
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .neq('id', user.id)
        .limit(50);
      if (error) throw error;

      const scored = (data || []).map((profile: any) => ({
        ...profile,
        _compatibilityScore: calculateCompatibility(user, profile),
      }));

      scored.sort((a: any, b: any) => b._compatibilityScore - a._compatibilityScore);

      set({ potentialMatches: scored, isLoading: false });
    } catch (error) {
      console.error('Fetch matches error:', error);
      set({ isLoading: false });
    }
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

    const moderationCheck = moderateContent(content);
    if (moderationCheck.flagged) {
      await supabase.from('moderation_queue').insert({
        message_content: content,
        sender_id: user.id,
        reason: moderationCheck.reason,
      });
      return;
    }

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
  ];

  const harassmentPatterns = [
    /kill\s*yourself/i,
    /you're\s*(ugly|stupid|worthless)/i,
    /i'll\s*find\s*you/i,
    /send\s*(me\s*)?(nudes|pics)/i,
  ];

  const explicitPatterns = [
    /explicit\s*content/i,
    /sex\s*tape/i,
  ];

  for (const pattern of scamPatterns) {
    if (pattern.test(content)) return { flagged: true, reason: 'scam' };
  }
  for (const pattern of harassmentPatterns) {
    if (pattern.test(content)) return { flagged: true, reason: 'harassment' };
  }
  for (const pattern of explicitPatterns) {
    if (pattern.test(content)) return { flagged: true, reason: 'explicit_content' };
  }

  return { flagged: false };
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
}

export const useSafetyStore = create<SafetyState>((set, get) => ({
  activeCheckIn: null,
  reports: [],
  trustedContacts: [],

  startCheckIn: async (matchId: string) => {
    const { user } = useAuthStore.getState();
    if (!user) return;

    const checkIn: SafetyCheckIn = {
      id: Date.now().toString(),
      userId: user.id,
      matchId,
      location: user.location || { latitude: 0, longitude: 0 },
      status: 'active',
      emergencyContacts: get().trustedContacts,
      checkInInterval: 30,
      lastCheckIn: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };

    set({ activeCheckIn: checkIn });
  },

  endCheckIn: async () => {
    set((state) => ({
      activeCheckIn: state.activeCheckIn
        ? { ...state.activeCheckIn, status: 'completed' }
        : null,
    }));
  },

  triggerEmergency: async () => {
    const { activeCheckIn, trustedContacts } = get();
    if (!activeCheckIn) return;

    set({
      activeCheckIn: { ...activeCheckIn, status: 'emergency' },
    });

    console.log('Emergency triggered!', {
      location: activeCheckIn.location,
      contacts: trustedContacts,
    });
  },

  reportUser: async (reportedUserId: string, reason: Report['reason'], description: string) => {
    const { user } = useAuthStore.getState();
    if (!user) return;

    const report: Report = {
      id: Date.now().toString(),
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
  },

  addTrustedContact: (phone: string) => {
    set((state) => ({
      trustedContacts: [...state.trustedContacts, phone],
    }));
  },
}));

interface EventState {
  events: Event[];
  userEvents: string[];
  isLoading: boolean;
  fetchEvents: () => Promise<void>;
  rsvpEvent: (eventId: string) => void;
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

  rsvpEvent: (eventId: string) => {
    set((state) => ({
      userEvents: [...state.userEvents, eventId],
    }));
  },

  createEvent: async (eventData) => {
    try {
      const { error } = await supabase.from('events').insert(eventData);
      if (error) throw error;
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
      userCommunities: [...state.userCommunities, communityId],
    }));
  },
}));

interface AppState {
  language: Language;
  isLowDataMode: boolean;
  setLanguage: (lang: Language) => void;
  toggleLowDataMode: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  language: 'en',
  isLowDataMode: false,
  setLanguage: (lang) => set({ language: lang }),
  toggleLowDataMode: () => set((state) => ({ isLowDataMode: !state.isLowDataMode })),
}));
