import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTranslation } from '@/hooks';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS, SHADOWS } from '@/constants';
import { Badge, Avatar, Button } from '@/components/ui';
import { useAuthStore, useAppStore } from '@/stores';

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
    { icon: 'person-outline', label: t('edit_profile'), route: '/(auth)/onboarding' },
    { icon: 'shield-outline', label: t('safety_settings'), route: '/(auth)/safety' },
    { icon: 'notifications-outline', label: t('notifications'), route: '' },
    { icon: 'language-outline', label: t('language'), route: '' },
    { icon: 'help-circle-outline', label: t('help'), route: '/(auth)/help' },
    { icon: 'document-text-outline', label: t('legal'), route: '/(auth)/legal' },
    { icon: 'diamond-outline', label: t('subscription'), route: '/(auth)/subscription' },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t('settings')}</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            <Avatar name={user?.name || 'User'} size={80} isVerified={true} colorIndex={0} />
          </View>
          <Text style={styles.userName}>{user?.name || 'User'}</Text>
          <Text style={styles.userEmail}>{user?.email || 'user@email.com'}</Text>
          <View style={styles.badgeRow}>
            <Badge label="Verified" variant="info" icon="checkmark-circle" />
            <Badge label="Gold" variant="premium" icon="diamond" />
          </View>
          <Button title={t('edit_profile')} variant="outline" size="sm" icon="create-outline" onPress={() => {}} fullWidth />
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>12</Text>
            <Text style={styles.statLabel}>{t('matches')}</Text>
          </View>
          <View style={[styles.statItem, styles.statBorder]}>
            <Text style={styles.statValue}>48</Text>
            <Text style={styles.statLabel}>{t('likes')}</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>23</Text>
            <Text style={styles.statLabel}>{t('profile_views')}</Text>
          </View>
        </View>

        <View style={styles.menuSection}>
          {menuItems.map((item, index) => (
            <TouchableOpacity key={item.label} style={styles.menuItem} activeOpacity={0.7}>
              <View style={styles.menuIcon}>
                <Ionicons name={item.icon as any} size={20} color={COLORS.primary} />
              </View>
              <Text style={styles.menuLabel}>{item.label}</Text>
              <Ionicons name="chevron-forward" size={16} color={COLORS.textLight} />
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.languageSection}>
          <Text style={styles.languageTitle}>{t('language')}</Text>
          <View style={styles.languageGrid}>
            {['en', 'sw', 'am', 'yo', 'ig', 'ha', 'zu', 'fr'].map((lang) => (
              <TouchableOpacity
                key={lang}
                style={[styles.langPill, locale === lang && styles.langPillActive]}
                onPress={() => setLanguage(lang as any)}
              >
                <Text style={[styles.langPillText, locale === lang && styles.langPillTextActive]}>
                  {lang.toUpperCase()}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <TouchableOpacity style={styles.signOutBtn} onPress={handleSignOut}>
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
    paddingHorizontal: SPACING.lg, paddingTop: 60, paddingBottom: SPACING.sm,
    backgroundColor: COLORS.card, borderBottomLeftRadius: BORDER_RADIUS.xl, borderBottomRightRadius: BORDER_RADIUS.xl,
    ...SHADOWS.sm,
  },
  headerTitle: { fontSize: FONT_SIZES.title, fontWeight: '900', color: COLORS.primary, letterSpacing: -1 },
  content: { flex: 1, paddingHorizontal: SPACING.lg, paddingTop: SPACING.md },
  profileCard: {
    backgroundColor: COLORS.card, borderRadius: BORDER_RADIUS.lg, padding: SPACING.lg,
    alignItems: 'center', marginBottom: SPACING.md, borderWidth: 1, borderColor: COLORS.border,
  },
  avatarContainer: { marginBottom: SPACING.md },
  userName: { fontSize: FONT_SIZES.xl, fontWeight: '800', color: COLORS.text, marginBottom: 2 },
  userEmail: { fontSize: FONT_SIZES.sm, color: COLORS.textLight, marginBottom: SPACING.md },
  badgeRow: { flexDirection: 'row', gap: SPACING.sm, marginBottom: SPACING.md },
  statsRow: {
    flexDirection: 'row', backgroundColor: COLORS.card, borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md, marginBottom: SPACING.md, borderWidth: 1, borderColor: COLORS.border,
  },
  statItem: { flex: 1, alignItems: 'center' },
  statBorder: { borderLeftWidth: 1, borderRightWidth: 1, borderColor: COLORS.border },
  statValue: { fontSize: FONT_SIZES.xxl, fontWeight: '800', color: COLORS.primary },
  statLabel: { fontSize: FONT_SIZES.xs, color: COLORS.textLight, marginTop: 2 },
  menuSection: {
    backgroundColor: COLORS.card, borderRadius: BORDER_RADIUS.lg, marginBottom: SPACING.md,
    borderWidth: 1, borderColor: COLORS.border, overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: SPACING.md,
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  menuIcon: { width: 32, height: 32, borderRadius: 16, backgroundColor: COLORS.primary + '12', alignItems: 'center', justifyContent: 'center' },
  menuLabel: { flex: 1, fontSize: FONT_SIZES.md, fontWeight: '600', color: COLORS.text, marginLeft: SPACING.sm },
  languageSection: { marginBottom: SPACING.md },
  languageTitle: { fontSize: FONT_SIZES.lg, fontWeight: '700', color: COLORS.text, marginBottom: SPACING.sm },
  languageGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm },
  langPill: {
    paddingHorizontal: 16, paddingVertical: 8, borderRadius: BORDER_RADIUS.xl,
    backgroundColor: COLORS.card, borderWidth: 1, borderColor: COLORS.border,
  },
  langPillActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  langPillText: { fontSize: FONT_SIZES.sm, fontWeight: '600', color: COLORS.textLight },
  langPillTextActive: { color: COLORS.textInverse },
  signOutBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: SPACING.sm,
    paddingVertical: 14, backgroundColor: COLORS.card, borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.md, borderWidth: 1, borderColor: COLORS.border,
  },
  signOutText: { fontSize: FONT_SIZES.md, fontWeight: '600', color: COLORS.danger },
  version: { fontSize: FONT_SIZES.xs, color: COLORS.textLight, textAlign: 'center', marginBottom: SPACING.xl },
});
