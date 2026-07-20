import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS, SHADOWS, FONTS } from '@/constants';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'success' | 'gradient';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  disabled?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
  fullWidth?: boolean;
}

export function Button({
  title, onPress, variant = 'primary', size = 'md', isLoading, disabled, icon, fullWidth,
}: ButtonProps) {
  return (
    <TouchableOpacity
      style={[styles.button, styles[variant], styles[`size_${size}`], fullWidth && styles.fullWidth, disabled && styles.disabled]}
      onPress={onPress} disabled={disabled || isLoading} activeOpacity={0.8}
    >
      {isLoading ? (
        <ActivityIndicator color={variant === 'outline' ? COLORS.primary : COLORS.textInverse} size="small" />
      ) : (
        <View style={styles.content}>
          {icon && <Ionicons name={icon} size={size === 'sm' ? 14 : 18} color={variant === 'outline' ? COLORS.primary : COLORS.textInverse} />}
          <Text style={[styles.text, styles[`${variant}_text`], styles[`text_${size}`]]}>{title}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

interface CardProps {
  children: React.ReactNode;
  onPress?: () => void;
  style?: any;
}

export function Card({ children, onPress, style }: CardProps) {
  const Component = onPress ? TouchableOpacity : View;
  return (
    <Component style={[styles.card, style]} onPress={onPress} activeOpacity={onPress ? 0.85 : 1}>
      {children}
    </Component>
  );
}

interface BadgeProps {
  label: string;
  variant?: 'success' | 'warning' | 'error' | 'info' | 'verified' | 'premium';
  size?: 'sm' | 'md';
  icon?: keyof typeof Ionicons.glyphMap;
}

export function Badge({ label, variant = 'info', size = 'sm', icon }: BadgeProps) {
  return (
    <View style={[styles.badge, styles[`badge_${variant}`], styles[`badge_${size}`]]}>
      {icon && <Ionicons name={icon} size={size === 'sm' ? 10 : 12} color={COLORS[`verified`] || COLORS.info} style={{ marginRight: 3 }} />}
      <Text style={[styles[`badgeText_${size}`]]}>{label}</Text>
    </View>
  );
}

interface AvatarProps {
  uri?: string;
  size?: number;
  isVerified?: boolean;
  isOnline?: boolean;
  name?: string;
  colorIndex?: number;
}

const AVATAR_COLORS = ['#E84393', '#6C5CE7', '#00B894', '#FDCB6E', '#FF6B6B', '#74B9FF', '#A29BFE', '#55EFC4'];

function getContrastColor(bg: string): string {
  const hex = bg.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;
  const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
  return luminance > 0.55 ? '#1A1A2E' : '#FFFFFF';
}

export function Avatar({ uri, size = 48, isVerified = false, isOnline, name, colorIndex = 0 }: AvatarProps) {
  const bgColor = AVATAR_COLORS[colorIndex % AVATAR_COLORS.length];
  const textColor = getContrastColor(bgColor);
  const initials = name ? name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : '';
  return (
    <View style={[styles.avatar, { width: size, height: size, borderRadius: size / 2, backgroundColor: bgColor }]}>
      <Text style={[styles.avatarText, { fontSize: size / 2.8, color: textColor }]}>{initials || '?'}</Text>
      {isVerified && (
        <View style={[styles.verifiedBadge, { bottom: -2, right: -2, width: size > 40 ? 20 : 14, height: size > 40 ? 20 : 14, borderRadius: size > 40 ? 10 : 7 }]}>
          <Ionicons name="checkmark" size={size > 40 ? 11 : 8} color={COLORS.textInverse} />
        </View>
      )}
      {isOnline !== undefined && (
        <View style={[styles.onlineIndicator, { backgroundColor: isOnline ? COLORS.success : COLORS.textLight, bottom: size > 40 ? 1 : 0, right: size > 40 ? 1 : 0, width: size > 40 ? 12 : 8, height: size > 40 ? 12 : 8, borderRadius: size > 40 ? 6 : 4 }]} />
      )}
    </View>
  );
}

interface EmptyStateProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ icon, title, message, actionLabel, onAction }: EmptyStateProps) {
  return (
    <View style={styles.emptyState}>
      <View style={styles.emptyIconContainer}>
        <Ionicons name={icon} size={44} color={COLORS.primaryLight} />
      </View>
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptyMessage}>{message}</Text>
      {actionLabel && onAction && (
        <Button title={actionLabel} onPress={onAction} variant="primary" size="sm" icon="refresh" />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: BORDER_RADIUS.xl,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  primary: { backgroundColor: COLORS.primary },
  secondary: { backgroundColor: COLORS.secondary },
  outline: { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: COLORS.primary },
  danger: { backgroundColor: COLORS.danger },
  success: { backgroundColor: COLORS.safe },
  gradient: { backgroundColor: COLORS.primary },
  size_sm: { paddingVertical: 10, paddingHorizontal: SPACING.md },
  size_md: { paddingVertical: 14, paddingHorizontal: SPACING.lg },
  size_lg: { paddingVertical: 16, paddingHorizontal: SPACING.xl },
  fullWidth: { width: '100%' },
  disabled: { opacity: 0.5 },
  content: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  text: { fontFamily: FONTS.bold },
  primary_text: { color: COLORS.textInverse },
  secondary_text: { color: COLORS.textInverse },
  outline_text: { color: COLORS.primary },
  danger_text: { color: COLORS.textInverse },
  success_text: { color: COLORS.textInverse },
  gradient_text: { color: COLORS.textInverse },
  text_sm: { fontSize: FONT_SIZES.sm },
  text_md: { fontSize: FONT_SIZES.md },
  text_lg: { fontSize: FONT_SIZES.lg },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    ...SHADOWS.sm,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BORDER_RADIUS.full,
    alignSelf: 'flex-start',
  },
  badge_success: { backgroundColor: '#D4F5ED' },
  badge_warning: { backgroundColor: '#FEF3D6' },
  badge_error: { backgroundColor: '#FFE0E0' },
  badge_info: { backgroundColor: '#E0EDFF' },
  badge_verified: { backgroundColor: '#E0EDFF' },
  badge_premium: { backgroundColor: '#FEF3D6' },
  badge_sm: { paddingVertical: 3, paddingHorizontal: 10 },
  badge_md: { paddingVertical: 5, paddingHorizontal: 12 },
  badgeText_sm: { fontSize: FONT_SIZES.xs, fontFamily: FONTS.semiBold, color: COLORS.text },
  badgeText_md: { fontSize: FONT_SIZES.sm, fontFamily: FONTS.semiBold, color: COLORS.text },
  avatar: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarText: { color: COLORS.textInverse, fontFamily: FONTS.bold },
  verifiedBadge: {
    position: 'absolute',
    backgroundColor: COLORS.info,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.card,
  },
  onlineIndicator: {
    position: 'absolute',
    borderWidth: 2,
    borderColor: COLORS.card,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xl,
  },
  emptyIconContainer: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: COLORS.primary + '12',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.lg,
  },
  emptyTitle: {
    fontSize: FONT_SIZES.lg,
    fontFamily: FONTS.bold,
    color: COLORS.text,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  emptyMessage: {
    fontSize: FONT_SIZES.md, fontFamily: FONTS.regular,
    color: COLORS.textLight,
    textAlign: 'center',
    marginBottom: SPACING.lg,
    lineHeight: 20,
  },
});
