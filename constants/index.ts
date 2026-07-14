import { Language } from '@/types';

export const COLORS = {
  primary: '#E84C3D',
  primaryDark: '#C0392B',
  primaryLight: '#F1948A',
  secondary: '#2ECC71',
  secondaryDark: '#27AE60',
  accent: '#F39C12',
  accentDark: '#E67E22',
  background: '#FFFFFF',
  surface: '#F8F9FA',
  surfaceDark: '#E9ECEF',
  text: '#2C3E50',
  textLight: '#7F8C8D',
  textInverse: '#FFFFFF',
  border: '#DEE2E6',
  error: '#E74C3C',
  warning: '#F39C12',
  success: '#2ECC71',
  info: '#3498DB',
  card: '#FFFFFF',
  shadow: '#000000',
  verified: '#3498DB',
  premium: '#F1C40F',
  danger: '#E74C3C',
  safe: '#2ECC71',
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const FONT_SIZES = {
  xs: 10,
  sm: 12,
  md: 14,
  lg: 16,
  xl: 18,
  xxl: 24,
  title: 32,
  hero: 40,
};

export const BORDER_RADIUS = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
};

export const SHADOWS = {
  sm: {
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  lg: {
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
};

export const COMMUNITIES = [
  'Yoruba', 'Igbo', 'Hausa', 'Swahili', 'Amhara', 'Oromo', 'Zulu',
  'Xhosa', 'Shona', 'Wolof', 'Twi', 'Fula', 'Somali', 'Arabic',
  'Berber', 'Kanuri', 'Tiv', 'Ijaw', 'Efik', 'Other',
];

export const INTERESTS = [
  'Technology', 'Music', 'Sports', 'Cooking', 'Travel', 'Reading',
  'Fashion', 'Art', 'Film', 'Fitness', 'Dance', 'Photography',
  'Gaming', 'Agriculture', 'Entrepreneurship', 'Volunteering',
  'Religion', 'Education', 'Health', 'Environment', 'Politics',
];

export const VALUES_LIST = [
  'Family-oriented', 'Ambitious', 'Spiritual', 'Adventurous',
  'Traditional', 'Modern', 'Community-focused', 'Educated',
  'Financially stable', 'Respectful', 'Honest', 'Loyal',
  'Fun-loving', 'Intellectual', 'Creative', 'Grounded',
];

export const LOOKING_FOR_OPTIONS = [
  { key: 'relationship', labelKey: 'looking_relationship' },
  { key: 'friendship', labelKey: 'looking_friendship' },
  { key: 'marriage', labelKey: 'looking_marriage' },
  { key: 'networking', labelKey: 'looking_networking' },
];

export const SAFETY_CHECK_INTERVALS = [15, 30, 60, 120];

export const EVENT_CATEGORIES = [
  { key: 'social', icon: 'people' },
  { key: 'professional', icon: 'briefcase' },
  { key: 'cultural', icon: 'globe' },
  { key: 'religious', icon: 'book' },
  { key: 'hobby', icon: 'heart' },
];

export const SUBSCRIPTION_PLANS = {
  free: {
    maxSwipes: 10,
    maxBoosts: 0,
    maxMessages: 20,
    features: ['basic_matching', 'profile_creation', 'safety_check_in'],
  },
  silver: {
    price: 500,
    currency: 'KES',
    maxSwipes: 50,
    maxBoosts: 1,
    maxMessages: 100,
    features: ['basic_matching', 'profile_creation', 'safety_check_in', 'see_who_liked', 'advanced_filters'],
  },
  gold: {
    price: 1500,
    currency: 'KES',
    maxSwipes: -1,
    maxBoosts: 5,
    maxMessages: -1,
    features: ['basic_matching', 'profile_creation', 'safety_check_in', 'see_who_liked', 'advanced_filters', 'priority_support', 'family_endorsement', 'ai_icebreakers'],
  },
  diamond: {
    price: 3000,
    currency: 'KES',
    maxSwipes: -1,
    maxBoosts: -1,
    maxMessages: -1,
    features: ['basic_matching', 'profile_creation', 'safety_check_in', 'see_who_liked', 'advanced_filters', 'priority_support', 'family_endorsement', 'ai_icebreakers', 'kyc_badge', 'event_access', 'concierge'],
  },
};

export const REPORT_REASONS = [
  'harassment', 'scam', 'fake_profile', 'explicit_content',
  'inappropriate_behavior', 'other',
];
