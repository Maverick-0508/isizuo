import { Language } from '@/types';

export const COLORS = {
  primary: '#B32464',
  primaryDark: '#8E1D50',
  primaryHero: '#9A1B52',
  primaryLight: '#F0A0C8',
  primaryGlow: 'rgba(179, 36, 100, 0.15)',
  secondary: '#5B4BD5',
  secondaryDark: '#4A3CB8',
  secondaryLight: '#8B7FF5',
  accent: '#E8A820',
  accentDark: '#D09418',
  accentLight: '#FEF3D6',
  coral: '#FF6B6B',
  peach: '#FD79A8',
  violet: '#A29BFE',
  teal: '#00B894',
  background: '#F2F0F7',
  surface: '#FFFFFF',
  surfaceDark: '#E8E6F0',
  text: '#1A1A2E',
  textSecondary: '#4A4A5E',
  textMuted: '#6B6B80',
  textLight: '#8E8EA0',
  textInverse: '#FFFFFF',
  border: '#E8E6F0',
  borderLight: '#F0EEF5',
  error: '#DC3545',
  warning: '#E8A820',
  success: '#00B894',
  info: '#4A90D9',
  card: '#FFFFFF',
  shadow: '#1A1A2E',
  verified: '#4A90D9',
  premium: '#E8A820',
  danger: '#DC3545',
  safe: '#00B894',
  gradient: ['#5B4BD5', '#B32464'],
  gradientWarm: ['#B32464', '#FF6B6B'],
  gradientCool: ['#5B4BD5', '#A29BFE'],
  gradientSunset: ['#FF6B6B', '#E8A820'],
  gradientOcean: ['#00B894', '#4A90D9'],
  gradientPurple: ['#5B4BD5', '#A29BFE'],
  glassBg: 'rgba(255, 255, 255, 0.72)',
  glassBorder: 'rgba(255, 255, 255, 0.3)',
  glassBgDark: 'rgba(26, 26, 46, 0.75)',
  glassBorderDark: 'rgba(255, 255, 255, 0.1)',
  overlay: 'rgba(0, 0, 0, 0.4)',
  overlayLight: 'rgba(0, 0, 0, 0.15)',
  neumorphism: '#F0EEF5',
  neumorphismLight: '#FFFFFF',
  neumorphismDark: '#D1CFDA',
};

export const GRADIENTS = {
  primary: ['#5B4BD5', '#B32464'],
  warm: ['#B32464', '#FF6B6B'],
  cool: ['#5B4BD5', '#A29BFE'],
  sunset: ['#FF6B6B', '#E8A820'],
  ocean: ['#00B894', '#4A90D9'],
  purple: ['#6C5CE7', '#A29BFE'],
  hero: ['#9A1B52', '#5B4BD5'],
  cardOverlay: ['transparent', 'rgba(0,0,0,0.7)'],
  cardOverlayTop: ['rgba(0,0,0,0.5)', 'transparent'],
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
  xs: 13,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 22,
  xxl: 28,
  title: 36,
  hero: 48,
  display: 56,
};

export const FONTS = {
  regular: 'PlusJakartaSans_400Regular',
  medium: 'PlusJakartaSans_500Medium',
  semiBold: 'PlusJakartaSans_600SemiBold',
  bold: 'PlusJakartaSans_700Bold',
  extraBold: 'PlusJakartaSans_800ExtraBold',
  black: 'PlusJakartaSans_800ExtraBold',
};

export const BORDER_RADIUS = {
  sm: 12,
  md: 16,
  lg: 20,
  xl: 28,
  xxl: 36,
  full: 9999,
};

export const SHADOWS = {
  sm: {
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  md: {
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 5,
  },
  lg: {
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 24,
    elevation: 10,
  },
  card: {
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 6,
  },
  glow: {
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 8,
  },
  neumorphism: {
    shadowColor: COLORS.neumorphismDark,
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 3,
  },
  neumorphismInset: {
    shadowColor: COLORS.neumorphismLight,
    shadowOffset: { width: -4, height: -4 },
    shadowOpacity: 0.7,
    shadowRadius: 8,
    elevation: 2,
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
