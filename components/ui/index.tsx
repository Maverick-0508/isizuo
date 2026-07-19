import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS, SHADOWS } from '@/constants';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  disabled?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  icon,
}: ButtonProps) {
  return (
    <TouchableOpacity
      style={[styles.button, styles[variant], styles[`size_${size}`], disabled && styles.disabled]}
      onPress={onPress}
      disabled={disabled || isLoading}
      activeOpacity={0.7}
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
    <Component style={[styles.card, style]} onPress={onPress} activeOpacity={onPress ? 0.7 : 1}>
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
      {icon && <Ionicons name={icon} size={size === 'sm' ? 10 : 12} color={COLORS[`verified`] || COLORS.info} style={{ marginRight: 4 }} />}
      <Text style={[styles.badgeText, styles[`badgeText_${size}`]]}>{label}</Text>
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

const AVATAR_COLORS = ['#DC3545', '#0D6EFD', '#198754', '#FFC107', '#6F42C1', '#FD7E14', '#20C997', '#D63384'];

export function Avatar({ uri, size = 48, isVerified = false, isOnline, name, colorIndex = 0 }: AvatarProps) {
  const bgColor = AVATAR_COLORS[colorIndex % AVATAR_COLORS.length];
  const initials = name ? name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : '';
  return (
    <View style={[styles.avatar, { width: size, height: size, borderRadius: size / 2, backgroundColor: bgColor }]}>
      <Text style={[styles.avatarText, { fontSize: size / 3 }]}>{initials || '?'}</Text>
      {isVerified && (
        <View style={[styles.verifiedBadge, { bottom: -1, right: -1, width: size > 40 ? 18 : 14, height: size > 40 ? 18 : 14, borderRadius: size > 40 ? 9 : 7 }]}>
          <Ionicons name="checkmark" size={size > 40 ? 10 : 8} color={COLORS.textInverse} />
        </View>
      )}
      {isOnline !== undefined && (
        <View
          style={[
            styles.onlineIndicator,
            {
              backgroundColor: isOnline ? COLORS.success : COLORS.textLight,
              bottom: size > 40 ? 2 : 0,
              right: size > 40 ? 2 : 0,
              width: size > 40 ? 12 : 8,
              height: size > 40 ? 12 : 8,
              borderRadius: size > 40 ? 6 : 4,
            },
          ]}
        />
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
        <Ionicons name={icon} size={48} color={COLORS.textLight} />
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
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  primary: { backgroundColor: COLORS.primary },
  secondary: { backgroundColor: COLORS.secondary },
  outline: { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: COLORS.primary },
  danger: { backgroundColor: COLORS.danger },
  success: { backgroundColor: COLORS.safe },
  size_sm: { paddingVertical: 10, paddingHorizontal: SPACING.md },
  size_md: { paddingVertical: 14, paddingHorizontal: SPACING.lg },
  size_lg: { paddingVertical: SPACING.lg, paddingHorizontal: SPACING.xl },
  disabled: { opacity: 0.5 },
  content: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  text: { fontWeight: '600' },
  primary_text: { color: COLORS.textInverse },
  secondary_text: { color: COLORS.textInverse },
  outline_text: { color: COLORS.primary },
  danger_text: { color: COLORS.textInverse },
  success_text: { color: COLORS.textInverse },
  text_sm: { fontSize: FONT_SIZES.sm },
  text_md: { fontSize: FONT_SIZES.md },
  text_lg: { fontSize: FONT_SIZES.lg },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.sm,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BORDER_RADIUS.full,
    alignSelf: 'flex-start',
  },
  badge_success: { backgroundColor: '#D1E7DD' },
  badge_warning: { backgroundColor: '#FFF3CD' },
  badge_error: { backgroundColor: '#F8D7DA' },
  badge_info: { backgroundColor: '#CFF4FC' },
  badge_verified: { backgroundColor: '#CFF4FC' },
  badge_premium: { backgroundColor: '#FFF3CD' },
  badge_sm: { paddingVertical: 3, paddingHorizontal: 10 },
  badge_md: { paddingVertical: 5, paddingHorizontal: 12 },
  badgeText_sm: { fontSize: FONT_SIZES.xs, fontWeight: '500', color: COLORS.text },
  badgeText_md: { fontSize: FONT_SIZES.sm, fontWeight: '500', color: COLORS.text },
  avatar: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarText: { color: COLORS.textInverse, fontWeight: '700' },
  verifiedBadge: {
    position: 'absolute',
    backgroundColor: COLORS.verified,
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
    backgroundColor: COLORS.surfaceDark,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.lg,
  },
  emptyTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  emptyMessage: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textLight,
    textAlign: 'center',
    marginBottom: SPACING.lg,
    lineHeight: 20,
  },
});
