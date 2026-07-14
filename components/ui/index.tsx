import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '@/constants';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
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
  const buttonStyles = [
    styles.button,
    styles[variant],
    styles[`size_${size}`],
    disabled && styles.disabled,
  ];

  const textStyles = [
    styles.text,
    styles[`${variant}_text`],
    styles[`text_${size}`],
  ];

  return (
    <TouchableOpacity
      style={buttonStyles}
      onPress={onPress}
      disabled={disabled || isLoading}
      activeOpacity={0.7}
    >
      {isLoading ? (
        <ActivityIndicator color={variant === 'outline' ? COLORS.primary : COLORS.textInverse} size="small" />
      ) : (
        <View style={styles.content}>
          {icon}
          <Text style={textStyles}>{title}</Text>
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
}

export function Badge({ label, variant = 'info', size = 'sm' }: BadgeProps) {
  return (
    <View style={[styles.badge, styles[`badge_${variant}`], styles[`badge_${size}`]]}>
      <Text style={[styles.badgeText, styles[`badgeText_${size}`]]}>{label}</Text>
    </View>
  );
}

interface InputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  label?: string;
  multiline?: boolean;
  keyboardType?: 'default' | 'phone-pad' | 'email-address' | 'numeric';
  secureTextEntry?: boolean;
  error?: string;
}

export function Input({
  value,
  onChangeText,
  placeholder,
  label,
  multiline = false,
  keyboardType = 'default',
  secureTextEntry = false,
  error,
}: InputProps) {
  return (
    <View style={styles.inputContainer}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={[styles.inputWrapper, error && styles.inputError]}>
        <Text
          style={[styles.input, multiline && styles.inputMultiline]}
          placeholder={placeholder}
        >
          {value}
        </Text>
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

interface AvatarProps {
  uri?: string;
  size?: number;
  isVerified?: boolean;
  isOnline?: boolean;
}

export function Avatar({ uri, size = 48, isVerified = false, isOnline }: AvatarProps) {
  return (
    <View style={[styles.avatar, { width: size, height: size, borderRadius: size / 2 }]}>
      <Text style={[styles.avatarText, { fontSize: size / 3 }]}>
        {uri ? '?' : '?'}
      </Text>
      {isVerified && (
        <View style={[styles.verifiedBadge, { bottom: 0, right: 0 }]}>
          <Text style={styles.verifiedIcon}>✓</Text>
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
            },
          ]}
        />
      )}
    </View>
  );
}

interface EmptyStateProps {
  icon: string;
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ icon, title, message, actionLabel, onAction }: EmptyStateProps) {
  return (
    <View style={styles.emptyState}>
      <Text style={styles.emptyIcon}>{icon}</Text>
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptyMessage}>{message}</Text>
      {actionLabel && onAction && (
        <Button title={actionLabel} onPress={onAction} variant="primary" size="sm" />
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
  outline: { backgroundColor: 'transparent', borderWidth: 1, borderColor: COLORS.primary },
  danger: { backgroundColor: COLORS.danger },
  success: { backgroundColor: COLORS.safe },
  size_sm: { paddingVertical: SPACING.sm, paddingHorizontal: SPACING.md },
  size_md: { paddingVertical: SPACING.md, paddingHorizontal: SPACING.lg },
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
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    ...SHADOWS.sm,
  },
  badge: {
    borderRadius: BORDER_RADIUS.full,
    alignSelf: 'flex-start',
  },
  badge_success: { backgroundColor: '#D4EDDA' },
  badge_warning: { backgroundColor: '#FFF3CD' },
  badge_error: { backgroundColor: '#F8D7DA' },
  badge_info: { backgroundColor: '#D1ECF1' },
  badge_verified: { backgroundColor: '#D1ECF1' },
  badge_premium: { backgroundColor: '#FFF3CD' },
  badge_sm: { paddingVertical: 2, paddingHorizontal: SPACING.sm },
  badge_md: { paddingVertical: 4, paddingHorizontal: SPACING.md },
  badgeText_sm: { fontSize: FONT_SIZES.xs, color: COLORS.text },
  badgeText_md: { fontSize: FONT_SIZES.sm, color: COLORS.text },
  inputContainer: { marginBottom: SPACING.md },
  label: { fontSize: FONT_SIZES.sm, color: COLORS.text, marginBottom: SPACING.xs, fontWeight: '500' },
  inputWrapper: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.surface,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  inputError: { borderColor: COLORS.error },
  input: { fontSize: FONT_SIZES.md, color: COLORS.text, minHeight: 20 },
  inputMultiline: { minHeight: 80, textAlignVertical: 'top' },
  errorText: { fontSize: FONT_SIZES.xs, color: COLORS.error, marginTop: SPACING.xs },
  avatar: {
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarText: { color: COLORS.primary, fontWeight: '700' },
  verifiedBadge: {
    position: 'absolute',
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: COLORS.verified,
    alignItems: 'center',
    justifyContent: 'center',
  },
  verifiedIcon: { color: COLORS.textInverse, fontSize: 10, fontWeight: '700' },
  onlineIndicator: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: COLORS.card,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xl,
  },
  emptyIcon: { fontSize: 48, marginBottom: SPACING.md },
  emptyTitle: { fontSize: FONT_SIZES.lg, fontWeight: '600', color: COLORS.text, marginBottom: SPACING.sm },
  emptyMessage: { fontSize: FONT_SIZES.md, color: COLORS.textLight, textAlign: 'center', marginBottom: SPACING.lg },
});

import { SHADOWS } from '@/constants';
