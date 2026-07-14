import { supabase } from '@/lib/supabase';

export interface SDKConfig {
  apiKey: string;
  appName: string;
  baseUrl: string;
  version: string;
}

export interface EmbeddableFeature {
  type: 'matching' | 'chat' | 'events' | 'community' | 'safety';
  enabled: boolean;
  config?: Record<string, any>;
}

const defaultConfig: SDKConfig = {
  apiKey: '',
  appName: 'Isizuo',
  baseUrl: 'https://api.isizuo.app',
  version: '1.0.0',
};

export class IsizuoSDK {
  private config: SDKConfig;

  constructor(config: Partial<SDKConfig> = {}) {
    this.config = { ...defaultConfig, ...config };
  }

  async init(): Promise<boolean> {
    try {
      console.log(`[Isizuo SDK] Initializing v${this.config.version} for ${this.config.appName}`);
      return true;
    } catch (error) {
      console.error('[Isizuo SDK] Init failed:', error);
      return false;
    }
  }

  async embedChat(containerId: string, userId: string): Promise<void> {
    console.log(`[Isizuo SDK] Embedding chat for user ${userId} in container ${containerId}`);
  }

  async embedMatching(containerId: string, userId: string): Promise<void> {
    console.log(`[Isizuo SDK] Embedding matching for user ${userId} in container ${containerId}`);
  }

  async embedEvents(containerId: string, location?: { latitude: number; longitude: number }): Promise<void> {
    console.log(`[Isizuo SDK] Embedding events in container ${containerId}`);
  }

  async getMatchRecommendations(userId: string, limit = 10): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .neq('id', userId)
        .limit(limit);
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('[Isizuo SDK] Get recommendations error:', error);
      return [];
    }
  }

  async sendSafeMessage(fromId: string, toId: string, content: string): Promise<boolean> {
    const moderationResult = this.moderateContent(content);
    if (moderationResult.flagged) {
      console.warn(`[Isizuo SDK] Message flagged: ${moderationResult.reason}`);
      return false;
    }
    return true;
  }

  async createSafetyCheckIn(userId: string, matchId: string): Promise<string | null> {
    const checkInId = `sdk_checkin_${Date.now()}`;
    console.log(`[Isizuo SDK] Safety check-in created: ${checkInId}`);
    return checkInId;
  }

  async getEventsByLocation(lat: number, lng: number, radius = 50): Promise<any[]> {
    return [];
  }

  private moderateContent(content: string): { flagged: boolean; reason?: string } {
    const scamPatterns = [/send\s*money/i, /bank\s*account/i, /western\s*union/i];
    const harassmentPatterns = [/kill\s*yourself/i, /i'll\s*find\s*you/i];

    for (const pattern of scamPatterns) {
      if (pattern.test(content)) return { flagged: true, reason: 'scam' };
    }
    for (const pattern of harassmentPatterns) {
      if (pattern.test(content)) return { flagged: true, reason: 'harassment' };
    }
    return { flagged: false };
  }

  on(event: string, callback: (...args: any[]) => void): void {
    console.log(`[Isizuo SDK] Registered listener for: ${event}`);
  }

  off(event: string, callback: (...args: any[]) => void): void {
    console.log(`[Isizuo SDK] Removed listener for: ${event}`);
  }

  destroy(): void {
    console.log('[Isizuo SDK] Destroyed');
  }
}

export function createIsizuoSDK(config?: Partial<SDKConfig>): IsizuoSDK {
  return new IsizuoSDK(config);
}
