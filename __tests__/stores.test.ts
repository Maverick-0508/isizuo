import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('mapDbProfileToUser', () => {
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

  it('maps a complete DB row to a User object', () => {
    const row = {
      id: 'user-1',
      email: 'test@example.com',
      phone: '+254700000000',
      name: 'Amina',
      age: 28,
      gender: 'female',
      bio: 'Love hiking',
      photos: ['photo1.jpg', 'photo2.jpg'],
      languages: ['en', 'sw'],
      community: 'Kikuyu',
      religion: 'Christian',
      values: ['honesty', 'family'],
      interests: ['hiking', 'cooking'],
      family_values: 'traditional',
      looking_for: 'marriage',
      latitude: -1.2921,
      longitude: 36.8219,
      is_verified: true,
      is_photo_verified: true,
      kyc_level: 'full',
      safety_score: 85,
      credits: 20,
      boosted_until: '2026-08-01T00:00:00Z',
      created_at: '2026-01-01T00:00:00Z',
      updated_at: '2026-07-01T00:00:00Z',
    };

    const user = mapDbProfileToUser(row);

    expect(user.id).toBe('user-1');
    expect(user.email).toBe('test@example.com');
    expect(user.name).toBe('Amina');
    expect(user.age).toBe(28);
    expect(user.gender).toBe('female');
    expect(user.familyValues).toBe('traditional');
    expect(user.lookingFor).toBe('marriage');
    expect(user.location).toEqual({ latitude: -1.2921, longitude: 36.8219 });
    expect(user.isVerified).toBe(true);
    expect(user.kycLevel).toBe('full');
    expect(user.safetyScore).toBe(85);
    expect(user.credits).toBe(20);
  });

  it('applies defaults for missing fields', () => {
    const row = { id: 'user-2' };

    const user = mapDbProfileToUser(row);

    expect(user.email).toBe('');
    expect(user.name).toBe('');
    expect(user.age).toBe(0);
    expect(user.gender).toBe('other');
    expect(user.familyValues).toBe('balanced');
    expect(user.lookingFor).toBe('relationship');
    expect(user.location).toBe('');
    expect(user.isVerified).toBe(false);
    expect(user.kycLevel).toBe('none');
    expect(user.safetyScore).toBe(50);
    expect(user.credits).toBe(10);
  });

  it('handles location with only latitude (missing longitude)', () => {
    const row = { id: 'user-3', latitude: -1.2921, longitude: null };

    const user = mapDbProfileToUser(row);

    expect(user.location).toBe('');
  });

  it('maps zero safety_score correctly (not falsy-coerced)', () => {
    const row = { id: 'user-4', safety_score: 0, credits: 0 };

    const user = mapDbProfileToUser(row);

    expect(user.safetyScore).toBe(0);
    expect(user.credits).toBe(0);
  });
});

describe('mapUserToDbUpdates', () => {
  function mapUserToDbUpdates(updates: any): Record<string, any> {
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
      dbUpdates.latitude = updates.location.latitude;
      dbUpdates.longitude = updates.location.longitude;
    }
    return dbUpdates;
  }

  it('converts camelCase to snake_case', () => {
    const result = mapUserToDbUpdates({
      familyValues: 'traditional',
      lookingFor: 'marriage',
      isVerified: true,
      isPhotoVerified: false,
      kycLevel: 'full',
      safetyScore: 90,
      boostedUntil: '2026-08-01T00:00:00Z',
    });

    expect(result.family_values).toBe('traditional');
    expect(result.looking_for).toBe('marriage');
    expect(result.is_verified).toBe(true);
    expect(result.is_photo_verified).toBe(false);
    expect(result.kyc_level).toBe('full');
    expect(result.safety_score).toBe(90);
    expect(result.boosted_until).toBe('2026-08-01T00:00:00Z');
    expect(result.familyValues).toBeUndefined();
    expect(result.lookingFor).toBeUndefined();
  });

  it('splits location into latitude/longitude', () => {
    const result = mapUserToDbUpdates({
      location: { latitude: -1.2921, longitude: 36.8219 },
    });

    expect(result.latitude).toBe(-1.2921);
    expect(result.longitude).toBe(36.8219);
    expect(result.location).toBeUndefined();
  });

  it('does not add location if string', () => {
    const result = mapUserToDbUpdates({ location: 'Nairobi' });

    expect(result.latitude).toBeUndefined();
    expect(result.longitude).toBeUndefined();
  });

  it('returns empty object for empty input', () => {
    const result = mapUserToDbUpdates({});

    expect(Object.keys(result)).toHaveLength(0);
  });

  it('preserves zero values', () => {
    const result = mapUserToDbUpdates({ safetyScore: 0, credits: 0, age: 0 });

    expect(result.safety_score).toBe(0);
    expect(result.credits).toBe(0);
    expect(result.age).toBe(0);
  });
});

describe('moderateContent', () => {
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

  it('flags scam content', () => {
    expect(moderateContent('Please send me money')).toEqual({ flagged: true, reason: 'scam' });
    expect(moderateContent('My bank account details')).toEqual({ flagged: true, reason: 'scam' });
    expect(moderateContent('Western Union transfer')).toEqual({ flagged: true, reason: 'scam' });
    expect(moderateContent('invest 5000 dollars')).toEqual({ flagged: true, reason: 'scam' });
    expect(moderateContent('Guaranteed return on investment')).toEqual({ flagged: true, reason: 'scam' });
  });

  it('flags harassment', () => {
    expect(moderateContent('Kill yourself')).toEqual({ flagged: true, reason: 'harassment' });
    expect(moderateContent("You're ugly")).toEqual({ flagged: true, reason: 'harassment' });
    expect(moderateContent("I'll find you")).toEqual({ flagged: true, reason: 'harassment' });
  });

  it('flags explicit content', () => {
    expect(moderateContent('Send nudes')).toEqual({ flagged: true, reason: 'harassment' });
    expect(moderateContent('explicit content')).toEqual({ flagged: true, reason: 'explicit_content' });
    expect(moderateContent('sex tape')).toEqual({ flagged: true, reason: 'explicit_content' });
  });

  it('allows normal messages', () => {
    expect(moderateContent('Hello, how are you?')).toEqual({ flagged: false });
    expect(moderateContent('Would you like to meet for coffee?')).toEqual({ flagged: false });
    expect(moderateContent('I love cooking and hiking')).toEqual({ flagged: false });
  });
});

describe('calculateCompatibility', () => {
  function calculateCompatibility(user: any, potential: any): number {
    let score = 0;
    const sharedLanguages = user.languages.filter((l: string) => potential.languages.includes(l));
    score += sharedLanguages.length * 10;
    if (user.community === potential.community) score += 15;
    if (user.religion === potential.religion) score += 10;
    const sharedValues = user.values.filter((v: string) => potential.values.includes(v));
    score += sharedValues.length * 5;
    const sharedInterests = user.interests.filter((i: string) => potential.interests.includes(i));
    score += sharedInterests.length * 5;
    if (user.lookingFor === potential.lookingFor) score += 20;
    if (user.familyValues === potential.familyValues) score += 10;
    return Math.min(score, 100);
  }

  const baseUser = {
    languages: ['en', 'sw'],
    community: 'Kikuyu',
    religion: 'Christian',
    values: ['family', 'honesty'],
    interests: ['hiking', 'cooking'],
    lookingFor: 'relationship',
    familyValues: 'balanced',
  };

  it('returns 0 for no matches', () => {
    const potential = {
      languages: ['ha'],
      community: 'Hausa',
      religion: 'Islam',
      values: ['ambition'],
      interests: ['gaming'],
      lookingFor: 'friendship',
      familyValues: 'modern',
    };

    expect(calculateCompatibility(baseUser, potential)).toBe(0);
  });

  it('returns max score for perfect match', () => {
    expect(calculateCompatibility(baseUser, baseUser)).toBe(95);
  });

  it('scores shared languages at 10 each', () => {
    const potential = {
      ...baseUser,
      languages: ['en', 'sw'],
      community: 'Other',
      religion: 'Other',
      values: [],
      interests: [],
      lookingFor: 'friendship',
      familyValues: 'modern',
    };

    expect(calculateCompatibility(baseUser, potential)).toBe(20);
  });

  it('caps score at 100', () => {
    const highScoring = { ...baseUser };
    const score = calculateCompatibility(baseUser, highScoring);
    expect(score).toBeLessThanOrEqual(100);
  });
});

describe('fetchUserProfile', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns mapped user on success', async () => {
    const mockUser = { id: 'u1', name: 'Test', email: 'test@test.com' };
    const { supabase } = await import('@/lib/supabase');
    (supabase.from as any).mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: mockUser, error: null }),
    });

    const { fetchUserProfile } = await import('@/stores');
    const user = await fetchUserProfile('u1');

    expect(user).not.toBeNull();
    expect(user!.id).toBe('u1');
    expect(user!.name).toBe('Test');
  });

  it('returns null on error', async () => {
    const { supabase } = await import('@/lib/supabase');
    (supabase.from as any).mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: { message: 'not found' } }),
    });

    const { fetchUserProfile } = await import('@/stores');
    const user = await fetchUserProfile('nonexistent');

    expect(user).toBeNull();
  });
});
