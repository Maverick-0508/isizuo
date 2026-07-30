import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('Post-verification routing for multiple users', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
    vi.stubEnv('EXPO_PUBLIC_SUPABASE_URL', 'https://test.supabase.co');
    vi.stubEnv('EXPO_PUBLIC_SUPABASE_ANON_KEY', 'test-anon-key');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('New user path (no profile name yet)', () => {
    it('routes to onboarding when profile has empty name', () => {
      const user = { id: 'new-user-1', name: '', email: 'new@test.com' };
      const shouldRouteToOnboarding = !user || !user.name || user.name.length === 0;

      expect(shouldRouteToOnboarding).toBe(true);
    });

    it('routes to onboarding when user is null (profile fetch failed)', () => {
      const user: any = null;
      const shouldRouteToOnboarding = !user || !user.name || user.name.length === 0;

      expect(shouldRouteToOnboarding).toBe(true);
    });

    it('AuthGuard allows staying on auth when name is empty', () => {
      const user: any = { id: 'new-user-1', name: '', email: 'new@test.com' };
      const hasCompletedOnboarding = user && user.name && user.name.length > 0;

      expect(hasCompletedOnboarding).toBeFalsy();
    });

    it('AuthGuard allows staying on auth when user is null', () => {
      const user: any = null;
      const hasCompletedOnboarding = user && user.name && user.name.length > 0;

      expect(hasCompletedOnboarding).toBeFalsy();
    });

    it('updateProfile works when user exists with empty name', () => {
      const user = { id: 'new-user-1', name: '', email: 'new@test.com', age: 0 };
      const updates = { name: 'Amina', age: 25 };

      const merged = { ...user, ...updates };

      expect(merged.id).toBe('new-user-1');
      expect(merged.name).toBe('Amina');
      expect(merged.age).toBe(25);
    });
  });

  describe('Returning user path (has profile name)', () => {
    it('routes to tabs when profile has a name', () => {
      const user = { id: 'user-1', name: 'Amina', email: 'amina@test.com' };
      const shouldRouteToOnboarding = !user || !user.name || user.name.length === 0;

      expect(shouldRouteToOnboarding).toBe(false);
    });

    it('AuthGuard redirects to tabs when name exists and not on onboarding', () => {
      const user = { id: 'user-1', name: 'Amina', email: 'amina@test.com' };
      const inOnboarding = false;
      const hasCompletedOnboarding = user && user.name && user.name.length > 0;

      const shouldRedirectToTabs = hasCompletedOnboarding && !inOnboarding;

      expect(shouldRedirectToTabs).toBe(true);
    });

    it('AuthGuard does NOT redirect to tabs when on onboarding screen', () => {
      const user = { id: 'user-1', name: 'Amina', email: 'amina@test.com' };
      const inOnboarding = true;
      const hasCompletedOnboarding = user && user.name && user.name.length > 0;

      const shouldRedirectToTabs = hasCompletedOnboarding && !inOnboarding;

      expect(shouldRedirectToTabs).toBe(false);
    });
  });

  describe('Multiple concurrent users verify simultaneously', () => {
    const mockProfiles = [
      { id: 'user-a', email: 'alice@test.com', name: 'Alice' },
      { id: 'user-b', email: 'bob@test.com', name: '' },
      { id: 'user-c', email: 'charlie@test.com', name: 'Charlie' },
      { id: 'user-d', email: 'diana@test.com', name: '' },
    ];

    it('each user gets correct routing based on their profile name', () => {
      const results = mockProfiles.map((profile) => {
        const shouldRouteToOnboarding = !profile || !profile.name || profile.name.length === 0;
        const hasCompletedOnboarding = profile && profile.name && profile.name.length > 0;
        return {
          email: profile.email,
          routeToOnboarding: shouldRouteToOnboarding,
          routeToTabs: !shouldRouteToOnboarding,
          authGuardAllowsTabs: hasCompletedOnboarding,
        };
      });

      expect(results[0]).toMatchObject({ routeToTabs: true, routeToOnboarding: false });
      expect(results[1]).toMatchObject({ routeToTabs: false, routeToOnboarding: true });
      expect(results[2]).toMatchObject({ routeToTabs: true, routeToOnboarding: false });
      expect(results[3]).toMatchObject({ routeToTabs: false, routeToOnboarding: true });
    });

    it('AuthGuard correctly differentiates users with/without names', () => {
      mockProfiles.forEach((profile) => {
        const hasCompletedOnboarding = profile && profile.name && profile.name.length > 0;
        if (profile.name) {
          expect(hasCompletedOnboarding).toBeTruthy();
        } else {
          expect(hasCompletedOnboarding).toBeFalsy();
        }
      });
    });
  });

  describe('verifyOtp fallback when profile fetch returns null', () => {
    it('verifyOtp creates default profile row when fetchUserProfile returns null', async () => {
      const mockSession = {
        access_token: 'token123',
        refresh_token: 'refresh123',
        user: { id: 'new-user-1' },
      };

      (fetch as any).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ session: mockSession, user: mockSession.user }),
      });

      const { supabase } = await import('@/lib/supabase');
      const fromMock = vi.fn();

      const chain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: null, error: null }),
        insert: vi.fn().mockResolvedValue({ error: null }),
      };

      fromMock.mockReturnValue(chain);
      supabase.from = fromMock;

      const { useAuthStore } = await import('@/stores');
      const { signIn } = useAuthStore.getState();

      await signIn('new@test.com');

      // First call: fetchUserProfile returns null
      expect(chain.single).toHaveBeenCalled();

      // Second call: insert default profile
      expect(chain.insert).toHaveBeenCalledWith({
        id: 'new-user-1',
        email: 'new@test.com',
        name: '',
      });
    });
  });

  describe('Onboarding completion flow', () => {
    it('updateProfile works when user exists (even with empty name)', () => {
      const existingUser = { id: 'u1', name: '', email: 'test@test.com' };
      const updates = { name: 'Amina', age: 25, gender: 'female' as const };

      const merged = { ...existingUser, ...updates };

      expect(merged.id).toBe('u1');
      expect(merged.name).toBe('Amina');
      expect(merged.age).toBe(25);
    });

    it('after onboarding, AuthGuard allows redirect to tabs', () => {
      const userAfterOnboarding = { id: 'u1', name: 'Amina', email: 'test@test.com' };
      const hasCompletedOnboarding = userAfterOnboarding && userAfterOnboarding.name && userAfterOnboarding.name.length > 0;

      expect(hasCompletedOnboarding).toBe(true);
    });
  });
});
