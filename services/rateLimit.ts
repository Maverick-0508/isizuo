import { supabase } from '@/lib/supabase';

const THROTTLE_MS = 800;

const lastActionTime: Record<string, number> = {};

export function clientThrottle(action: string): boolean {
  const now = Date.now();
  const last = lastActionTime[action] || 0;
  if (now - last < THROTTLE_MS) return false;
  lastActionTime[action] = now;
  return true;
}

export async function checkRateLimit(
  userId: string,
  action: string,
  maxCount: number = 10,
  windowSeconds: number = 60
): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .rpc('check_rate_limit', {
        p_user_id: userId,
        p_action: action,
        p_max_count: maxCount,
        p_window_seconds: windowSeconds,
      });

    if (error) {
      console.warn('Rate limit RPC failed, allowing action:', error.message);
      return true;
    }
    return data !== false;
  } catch (e) {
    console.warn('Rate limit check error, allowing action:', e);
    return true;
  }
}
