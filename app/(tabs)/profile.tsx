import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTranslation } from '@/hooks';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS, SHADOWS, FONTS } from '@/constants';
import { Badge, Avatar, Button } from '@/components/ui';
import { useAuthStore, useAppStore } from '@/stores';
import { Logo } from '@/components/Logo';

export default function ProfileScreen() {
  const { t, locale } = useTranslation();
  const { setLanguage } = useAppStore();
  const router = useRouter();
  const { user, signOut } = useAuthStore();

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: async () => { await signOut(); router.replace('/(auth)'); } },
    ]);
  };

  const menuItems = [
    { icon: 'person-outline', label: t('edit_profile'), color: COLORS.primary },
    { icon: 'shield-outline', label: t('safety_settings'), color: COLORS.safe },
    { icon: 'notifications-outline', label: t('notifications'), color: COLORS.info },
    { icon: 'diamond-outline', label: t('subscription'), color: COLORS.premium },
    { icon: 'language-outline', label: t('language'), color: COLORS.secondary },
    { icon: 'help-circle-outline', label: t('help'), color: COLORS.accent },
    { icon: 'document-text-outline', label: t('legal'), color: COLORS.textLight },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Logo size="sm" showText={false} />
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle} accessibilityRole="header">{t('settings')}</Text>
        </View>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.profileCard} accessibilityRole="region" accessibilityLabel="User profile">
          <View style={styles.avatarWrap}>
            <Avatar name={user?.name || 'User'} size={96} isVerified={true} colorIndex={0} />
          </View>
          <Text style={styles.userName} accessibilityRole="header">{user?.name || 'User'}</Text>
          <Text style={styles.userEmail}>{user?.email || 'user@email.com'}</Text>
          <View style={styles.badgeRow}>
            <Badge label="Verified" variant="info" icon="checkmark-circle" />
            <Badge label="Gold Member" variant="premium" icon="diamond" />
          </View>
          <Button title={t('edit_profile')} variant="outline" size="sm" icon="create-outline" onPress={() => {}} fullWidth />
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>12</Text>
            <Text style={styles.statLabel}>{t('matches')}</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>48</Text>
            <Text style={styles.statLabel}>{t('likes')}</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>23</Text>
            <Text style={styles.statLabel}>{t('profile_views')}</Text>
          </View>
        </View>

        <View style={styles.menuSection} accessibilityRole="menu">
          {menuItems.map((item) => (
            <TouchableOpacity key={item.label} style={styles.menuItem} activeOpacity={0.8} accessibilityRole="menuitem" accessibilityLabel={item.label}>
              <View style={[styles.menuIcon, { backgroundColor: item.color + '12' }]}>
                <Ionicons name={item.icon as any} size={20} color={item.color} />
              </View>
              <Text style={styles.menuLabel}>{item.label}</Text>
              <Ionicons name="chevron-forward" size={18} color={COLORS.textLight} />
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.languageSection}>
          <Text style={styles.languageTitle} accessibilityRole="header">{t('language')}</Text>
          <View style={styles.languageGrid}>
            {[
              { key: 'en', label: 'English' }, { key: 'sw', label: 'Swahili' },
              { key: 'am', label: 'Amharic' }, { key: 'yo', label: 'Yoruba' },
              { key: 'ig', label: 'Igbo' }, { key: 'ha', label: 'Hausa' },
              { key: 'zu', label: 'Zulu' }, { key: 'fr', label: 'French' },
            ].map((lang) => (
              <TouchableOpacity
                key={lang.key}
                style={[styles.langPill, locale === lang.key && styles.langPillActive]}
                onPress={() => setLanguage(lang.key as any)}
                accessibilityRole="button"
                accessibilityLabel={`${lang.label}${locale === lang.key ? ' (selected)' : ''}`}
                accessibilityState={{ selected: locale === lang.key }}
              >
                <Text style={[styles.langPillText, locale === lang.key && styles.langPillTextActive]}>
                  {lang.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <TouchableOpacity style={styles.signOutBtn} onPress={handleSignOut} accessibilityRole="button" accessibilityLabel="Sign out of your account">
          <Ionicons name="log-out-outline" size={20} color={COLORS.danger} />
          <Text style={styles.signOutText}>{t('sign_out')}</Text>
        </TouchableOpacity>

        <Text style={styles.version}>Isizuo v1.0.0</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: SPACING.lg, paddingTop: 56, paddingBottom: SPACING.md,
  },
  headerCenter: { flex: 1, alignItems: 'center' },
  headerTitle: { fontSize: FONT_SIZES.xl, fontFamily: FONTS.extraBold, color: COLORS.text, letterSpacing: -0.6 },
  content: { flex: 1, paddingHorizontal: SPACING.lg, paddingTop: SPACING.md },
  profileCard: {
    backgroundColor: COLORS.surface, borderRadius: BORDER_RADIUS.xl, padding: SPACING.xl,
    alignItems: 'center', marginBottom: SPACING.md, ...SHADOWS.md,
  },
  avatarWrap: { marginBottom: SPACING.lg },
  userName: { fontSize: FONT_SIZES.xxl, fontFamily: FONTS.bold, color: COLORS.text, marginBottom: 4, letterSpacing: -0.5 },
  userEmail: { fontSize: FONT_SIZES.md, fontFamily: FONTS.regular, color: COLORS.textLight, marginBottom: SPACING.md },
  badgeRow: { flexDirection: 'row', gap: SPACING.sm, marginBottom: SPACING.lg },
  statsRow: {
    flexDirection: 'row', backgroundColor: COLORS.surface, borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg, marginBottom: SPACING.md, ...SHADOWS.md,
  },
  statItem: { flex: 1, alignItems: 'center' },
  statDivider: { width: 1, height: '100%', backgroundColor: COLORS.border },
  statValue: { fontSize: 28, fontFamily: FONTS.extraBold, color: COLORS.primary, letterSpacing: -0.5 },
  statLabel: { fontSize: FONT_SIZES.xs, fontFamily: FONTS.medium, color: COLORS.textLight, marginTop: 4 },
  menuSection: {
    backgroundColor: COLORS.surface, borderRadius: BORDER_RADIUS.xl, marginBottom: SPACING.md,
    overflow: 'hidden', ...SHADOWS.sm,
  },
  menuItem: {
    flexDirection: 'row', alignItems: 'center', paddingVertical: 16, paddingHorizontal: SPACING.lg,
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  menuIcon: { width: 36, height: 36, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  menuLabel: { flex: 1, fontSize: FONT_SIZES.md, fontFamily: FONTS.semiBold, color: COLORS.text, marginLeft: SPACING.md },
  languageSection: { marginBottom: SPACING.md },
  languageTitle: { fontSize: FONT_SIZES.lg, fontFamily: FONTS.bold, color: COLORS.text, marginBottom: SPACING.md, letterSpacing: -0.3 },
  languageGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm },
  langPill: {
    paddingHorizontal: 18, paddingVertical: 10, borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.surface, ...SHADOWS.sm,
  },
  langPillActive: { backgroundColor: COLORS.primary },
  langPillText: { fontSize: FONT_SIZES.sm, fontFamily: FONTS.semiBold, color: COLORS.textLight },
  langPillTextActive: { color: COLORS.textInverse },
  signOutBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: SPACING.sm,
    paddingVertical: 16, backgroundColor: COLORS.surface, borderRadius: BORDER_RADIUS.xl,
    marginBottom: SPACING.md, ...SHADOWS.sm,
  },
  signOutText: { fontSize: FONT_SIZES.md, fontFamily: FONTS.semiBold, color: COLORS.danger },
  version: { fontSize: FONT_SIZES.xs, fontFamily: FONTS.regular, color: COLORS.textLight, textAlign: 'center', marginBottom: SPACING.xl },
});
