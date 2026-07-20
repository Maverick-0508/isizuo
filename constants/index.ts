import { Language } from '@/types';

export const COLORS = {
  primary: '#E84393',
  primaryDark: '#C2185B',
  primaryHero: '#B71C5C',
  primaryLight: '#F8A5C2',
  secondary: '#6C5CE7',
  secondaryDark: '#5A4BD1',
  accent: '#FDCB6E',
  accentDark: '#F0B429',
  background: '#F8F9FE',
  surface: '#FFFFFF',
  surfaceDark: '#EDEEF5',
  text: '#1A1A2E',
  textLight: '#555566',
  textInverse: '#FFFFFF',
  border: '#E8E8F0',
  error: '#FF6B6B',
  warning: '#FDCB6E',
  success: '#00B894',
  info: '#74B9FF',
  card: '#FFFFFF',
  shadow: '#1A1A2E',
  verified: '#74B9FF',
  premium: '#FDCB6E',
  danger: '#FF6B6B',
  safe: '#00B894',
  gradient: ['#6C5CE7', '#E84393'],
  gradientWarm: ['#E84393', '#FD79A8'],
  gradientCool: ['#6C5CE7', '#A29BFE'],
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
  xs: 12,
  sm: 13,
  md: 15,
  lg: 17,
  xl: 20,
  xxl: 26,
  title: 34,
  hero: 44,
};

export const FONTS = {
  regular: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  semiBold: 'Inter_600SemiBold',
  bold: 'Inter_700Bold',
  extraBold: 'Inter_800ExtraBold',
  black: 'Inter_900Black',
};

export const BORDER_RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

export const SHADOWS = {
  sm: {
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  lg: {
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 10,
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
