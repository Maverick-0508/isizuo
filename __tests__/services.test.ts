import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const EDGE_FUNCTION_BASE = 'https://test.supabase.co/functions/v1';

describe('sendOTP', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns success on 200 response', async () => {
    (fetch as any).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true, message: 'Code sent' }),
    });

    const { sendOTP } = await import('@/services/sms');
    const result = await sendOTP('test@example.com');

    expect(result).toEqual({ success: true, message: 'Code sent' });
    expect(fetch).toHaveBeenCalledWith(
      `${EDGE_FUNCTION_BASE}/send-otp`,
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ email: 'test@example.com' }),
      })
    );
  });

  it('returns null on non-ok response', async () => {
    (fetch as any).mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({ error: 'Rate limited' }),
    });

    const { sendOTP } = await import('@/services/sms');
    const result = await sendOTP('test@example.com');

    expect(result).toBeNull();
  });

  it('returns null on network error', async () => {
    (fetch as any).mockRejectedValue(new Error('Network failure'));

    const { sendOTP } = await import('@/services/sms');
    const result = await sendOTP('test@example.com');

    expect(result).toBeNull();
  });
});

describe('verifyOTP', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('returns session on successful verification', async () => {
    const mockSession = { access_token: 'abc', refresh_token: 'def', user: { id: 'u1' } };
    (fetch as any).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ session: mockSession, user: { id: 'u1' } }),
    });

    const { verifyOTP } = await import('@/services/sms');
    const promise = verifyOTP('test@example.com', '123456');

    vi.runAllTimers();
    const result = await promise;

    expect(result).toEqual({ session: mockSession, user: { id: 'u1' } });
  });

  it('returns null on invalid code', async () => {
    (fetch as any).mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({ error: 'Invalid or expired code' }),
    });

    const { verifyOTP } = await import('@/services/sms');
    const promise = verifyOTP('test@example.com', '000000');

    vi.runAllTimers();
    const result = await promise;

    expect(result).toBeNull();
  });

  it('returns null on network error', async () => {
    (fetch as any).mockRejectedValue(new Error('Connection refused'));

    const { verifyOTP } = await import('@/services/sms');
    const promise = verifyOTP('test@example.com', '123456');

    vi.runAllTimers();
    const result = await promise;

    expect(result).toBeNull();
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
