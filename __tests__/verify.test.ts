import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const mockAuth = {
  signInWithOtp: vi.fn(),
  verifyOtp: vi.fn(),
  setSession: vi.fn(),
};

vi.mock('@/lib/supabase', () => ({
  supabase: {
    auth: mockAuth,
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({ data: null, error: null })),
        })),
      })),
      insert: vi.fn(() => Promise.resolve({ error: null })),
    })),
  },
}));

describe('Supabase native OTP auth flow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('signIn', () => {
    it('calls supabase.auth.signInWithOtp with email', async () => {
      mockAuth.signInWithOtp.mockResolvedValue({ error: null });

      const { useAuthStore } = await import('@/stores');
      await useAuthStore.getState().signIn('test@example.com');

      expect(mockAuth.signInWithOtp).toHaveBeenCalledWith({
        email: 'test@example.com',
        options: { shouldCreateUser: true },
      });
    });

    it('throws on error', async () => {
      mockAuth.signInWithOtp.mockResolvedValue({ error: new Error('Rate limited') });

      const { useAuthStore } = await import('@/stores');
      await expect(useAuthStore.getState().signIn('test@example.com')).rejects.toThrow('Rate limited');
    });
  });

  describe('verifySignIn', () => {
    it('calls supabase.auth.verifyOtp and sets session', async () => {
      const mockSession = {
        access_token: 'abc',
        refresh_token: 'def',
        user: { id: 'user-1' },
      };
      mockAuth.verifyOtp.mockResolvedValue({
        data: { session: mockSession },
        error: null,
      });
      mockAuth.setSession.mockResolvedValue({ error: null });

      const { useAuthStore } = await import('@/stores');
      await useAuthStore.getState().verifySignIn('test@example.com', '123456');

      expect(mockAuth.verifyOtp).toHaveBeenCalledWith({
        email: 'test@example.com',
        token: '123456',
        type: 'email',
      });
      expect(mockAuth.setSession).toHaveBeenCalledWith({
        access_token: 'abc',
        refresh_token: 'def',
      });
    });

    it('throws on invalid code', async () => {
      mockAuth.verifyOtp.mockResolvedValue({
        data: { session: null },
        error: new Error('Invalid or expired code'),
      });

      const { useAuthStore } = await import('@/stores');
      await expect(
        useAuthStore.getState().verifySignIn('test@example.com', '000000')
      ).rejects.toThrow('Invalid or expired code');
    });

    it('throws when no session returned', async () => {
      mockAuth.verifyOtp.mockResolvedValue({
        data: { session: null },
        error: null,
      });

      const { useAuthStore } = await import('@/stores');
      await expect(
        useAuthStore.getState().verifySignIn('test@example.com', '123456')
      ).rejects.toThrow('Invalid or expired code');
    });
  });
});
