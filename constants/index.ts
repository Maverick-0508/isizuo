import { Language } from '@/types';

export const COLORS = {
  primary: '#DC3545',
  primaryDark: '#B02A37',
  primaryLight: '#EA868F',
  secondary: '#198754',
  secondaryDark: '#146C43',
  accent: '#FFC107',
  accentDark: '#FFAB00',
  background: '#FAFAFA',
  surface: '#FFFFFF',
  surfaceDark: '#F1F3F5',
  text: '#212529',
  textLight: '#6C757D',
  textInverse: '#FFFFFF',
  border: '#E9ECEF',
  error: '#DC3545',
  warning: '#FFC107',
  success: '#198754',
  info: '#0DCAF0',
  card: '#FFFFFF',
  shadow: '#000000',
  verified: '#0DCAF0',
  premium: '#FFC107',
  danger: '#DC3545',
  safe: '#198754',
  gradient: ['#DC3545', '#FF6B6B'],
  gradientDark: ['#B02A37', '#DC3545'],
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
  sm: 6,
  md: 10,
  lg: 14,
  xl: 20,
  full: 9999,
};

export const SHADOWS = {
  sm: {
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  md: {
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  lg: {
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
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
