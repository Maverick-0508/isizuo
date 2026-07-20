import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Platform } from 'react-native';
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
      onPress={onPress} disabled={disabled || isLoading} activeOpacity={0.75}
      accessibilityRole="button"
      accessibilityState={{ disabled: disabled || isLoading, busy: isLoading }}
    >
      {isLoading ? (
        <ActivityIndicator color={variant === 'outline' ? COLORS.primary : COLORS.textInverse} size="small" />
      ) : (
        <View style={styles.content}>
          {icon && <Ionicons name={icon} size={size === 'sm' ? 16 : 20} color={variant === 'outline' ? COLORS.primary : COLORS.textInverse} />}
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
    <Component
      style={[styles.card, style]}
      onPress={onPress}
      activeOpacity={onPress ? 0.92 : 1}
      accessibilityRole={onPress ? 'button' : undefined}
    >
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
      {icon && <Ionicons name={icon} size={size === 'sm' ? 11 : 13} color={COLORS[`verified`] || COLORS.info} style={{ marginRight: 3 }} />}
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

const AVATAR_COLORS = ['#B32464', '#5B4BD5', '#00A878', '#E8A820', '#DC3545', '#4A90D9', '#8B7FF5', '#00A878'];

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
      <Text style={[styles.avatarText, { fontSize: size / 2.6, color: textColor }]}>{initials || '?'}</Text>
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
  outline: { backgroundColor: 'transparent', borderWidth: 2, borderColor: COLORS.primary },
  danger: { backgroundColor: COLORS.danger },
  success: { backgroundColor: COLORS.safe },
  gradient: { backgroundColor: COLORS.primary },
  size_sm: { paddingVertical: 12, paddingHorizontal: SPACING.md },
  size_md: { paddingVertical: 16, paddingHorizontal: SPACING.lg },
  size_lg: { paddingVertical: 18, paddingHorizontal: SPACING.xl },
  fullWidth: { width: '100%' },
  disabled: { opacity: 0.45 },
  content: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  text: { fontFamily: FONTS.bold, letterSpacing: -0.2 },
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
    ...SHADOWS.md,
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
  badge_sm: { paddingVertical: 4, paddingHorizontal: 12 },
  badge_md: { paddingVertical: 6, paddingHorizontal: 14 },
  badgeText_sm: { fontSize: FONT_SIZES.xs, fontFamily: FONTS.semiBold, color: COLORS.text },
  badgeText_md: { fontSize: FONT_SIZES.sm, fontFamily: FONTS.semiBold, color: COLORS.text },
  avatar: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarText: { fontFamily: FONTS.bold },
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
    borderRadius: 28,
    backgroundColor: COLORS.primary + '10',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.lg,
  },
  emptyTitle: {
    fontSize: FONT_SIZES.xl,
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
    lineHeight: 24,
  },
});
