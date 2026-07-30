import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const mockInvoke = vi.fn();

vi.mock('@/lib/supabase', () => ({
  supabase: {
    functions: {
      invoke: mockInvoke,
    },
  },
}));

describe('sendSMS', () => {
  beforeEach(() => {
    mockInvoke.mockReset();
  });

  it('returns true on success', async () => {
    mockInvoke.mockResolvedValue({ error: null });

    const { sendSMS } = await import('@/services/sms');
    const result = await sendSMS('+254700000000', 'Hello');

    expect(result).toBe(true);
  });

  it('returns false on failure', async () => {
    mockInvoke.mockRejectedValue(new Error('Failed'));

    const { sendSMS } = await import('@/services/sms');
    const result = await sendSMS('+254700000000', 'Hello');

    expect(result).toBe(false);
  });
});

describe('handleUSSDRequest', () => {
  it('shows main menu on empty input', async () => {
    const { handleUSSDRequest } = await import('@/services/sms');
    const result = await handleUSSDRequest('+254700000000', 'session-1', '');

    expect(result).toContain('CON Welcome to Isizuo');
    expect(result).toContain('1. View Matches');
    expect(result).toContain('5. My Credits');
  });

  it('shows match menu on input 1', async () => {
    const { handleUSSDRequest } = await import('@/services/sms');
    const result = await handleUSSDRequest('+254700000000', 'session-1', '1');

    expect(result).toContain('CON Matches Menu');
    expect(result).toContain('2. Like Current Match');
  });

  it('shows safety menu on input 3', async () => {
    const { handleUSSDRequest } = await import('@/services/sms');
    const result = await handleUSSDRequest('+254700000000', 'session-1', '3');

    expect(result).toContain('CON Safety Check-In');
    expect(result).toContain('3. Emergency SOS');
  });

  it('exits on input 0', async () => {
    const { handleUSSDRequest } = await import('@/services/sms');
    const result = await handleUSSDRequest('+254700000000', 'session-1', '0');

    expect(result).toContain('END Thank you');
  });

  it('shows invalid for unknown input', async () => {
    const { handleUSSDRequest } = await import('@/services/sms');
    const result = await handleUSSDRequest('+254700000000', 'session-1', '99');

    expect(result).toContain('END Invalid option');
  });
});
