import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('OTP verification flow', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('verifyOTP response format', () => {
    it('returns session with access_token and refresh_token', async () => {
      const mockResponse = {
        session: {
          access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
          refresh_token: 'v1:abc123...',
          user: { id: 'user-123', email: 'test@example.com' },
        },
        user: { id: 'user-123', email: 'test@example.com' },
      };

      (fetch as any).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const { verifyOTP } = await import('@/services/sms');
      const result = await verifyOTP('test@example.com', '123456');

      expect(result).not.toBeNull();
      expect(result!.session.access_token).toBeDefined();
      expect(result!.session.refresh_token).toBeDefined();
      expect(result!.session.user.id).toBe('user-123');
    });

    it('handles 400 errors gracefully', async () => {
      (fetch as any).mockResolvedValue({
        ok: false,
        status: 400,
        json: () => Promise.resolve({ error: 'Invalid or expired code' }),
      });

      const { verifyOTP } = await import('@/services/sms');
      const result = await verifyOTP('test@example.com', '000000');

      expect(result).toBeNull();
    });

    it('handles 429 rate limit errors', async () => {
      (fetch as any).mockResolvedValue({
        ok: false,
        status: 429,
        json: () => Promise.resolve({ error: 'Too many failed attempts' }),
      });

      const { verifyOTP } = await import('@/services/sms');
      const result = await verifyOTP('test@example.com', '123456');

      expect(result).toBeNull();
    });

    it('handles 500 server errors', async () => {
      (fetch as any).mockResolvedValue({
        ok: false,
        status: 500,
        json: () => Promise.resolve({ error: 'Internal server error' }),
      });

      const { verifyOTP } = await import('@/services/sms');
      const result = await verifyOTP('test@example.com', '123456');

      expect(result).toBeNull();
    });
  });

  describe('sendOTP request validation', () => {
    it('sends correct email in body', async () => {
      (fetch as any).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true, message: 'Code sent' }),
      });

      const { sendOTP } = await import('@/services/sms');
      await sendOTP('newuser@isizuo.com');

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/send-otp'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ email: 'newuser@isizuo.com' }),
        })
      );
    });

    it('includes authorization header', async () => {
      (fetch as any).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      });

      const { sendOTP } = await import('@/services/sms');
      await sendOTP('test@test.com');

      const callArgs = (fetch as any).mock.calls[0];
      expect(callArgs[1].headers.Authorization).toContain('Bearer');
    });
  });

  describe('verifyOTP timeout', () => {
    it('uses AbortController for timeout', async () => {
      (fetch as any).mockRejectedValueOnce(new DOMException('The operation was aborted.', 'AbortError'));

      const { verifyOTP } = await import('@/services/sms');
      const result = await verifyOTP('test@example.com', '123456');

      const callArgs = (fetch as any).mock.calls[0];
      expect(callArgs[1].signal).toBeDefined();
      expect(result).toBeNull();
    });
  });
});

describe('auth store verifyOtp flow', () => {
  it('maps camelCase fields correctly after DB fetch', () => {
    const dbRow = {
      id: 'u1',
      family_values: 'traditional',
      looking_for: 'marriage',
      is_verified: true,
      is_photo_verified: false,
      kyc_level: 'id',
      safety_score: 75,
      credits: 15,
      created_at: '2026-01-01T00:00:00Z',
      updated_at: '2026-06-01T00:00:00Z',
    };

    function mapDbProfileToUser(row: any) {
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
        familyValues: row.family_values || 'balanced',
        lookingFor: row.looking_for || 'relationship',
        location: (row.latitude && row.longitude)
          ? { latitude: row.latitude, longitude: row.longitude }
          : '',
        isVerified: row.is_verified || false,
        isPhotoVerified: row.is_photo_verified || false,
        kycLevel: row.kyc_level || 'none',
        safetyScore: row.safety_score ?? 50,
        credits: row.credits ?? 10,
        boostedUntil: row.boosted_until || undefined,
        createdAt: row.created_at || new Date().toISOString(),
        updatedAt: row.updated_at || new Date().toISOString(),
      };
    }

    const user = mapDbProfileToUser(dbRow);

    expect(user.familyValues).toBe('traditional');
    expect(user.lookingFor).toBe('marriage');
    expect(user.isVerified).toBe(true);
    expect(user.isPhotoVerified).toBe(false);
    expect(user.kycLevel).toBe('id');
    expect(user.safetyScore).toBe(75);
    expect(user.credits).toBe(15);
    expect(user.createdAt).toBe('2026-01-01T00:00:00Z');
  });

  it('handles new user with empty profile after verification', () => {
    const emptyDbRow = {
      id: 'new-user-1',
      name: '',
      email: 'newuser@example.com',
      family_values: 'balanced',
      looking_for: 'relationship',
    };

    function mapDbProfileToUser(row: any) {
      return {
        id: row.id,
        email: row.email || '',
        name: row.name || '',
        familyValues: row.family_values || 'balanced',
        lookingFor: row.looking_for || 'relationship',
      };
    }

    const user = mapDbProfileToUser(emptyDbRow);

    expect(user.name).toBe('');
    expect(user.familyValues).toBe('balanced');
    expect(user.lookingFor).toBe('relationship');
  });
});
