import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTranslation } from '@/hooks';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS, SHADOWS, FONTS, GRADIENTS } from '@/constants';
import { Button, Badge, Avatar, ActiveNowBadge } from '@/components/ui';
import { Logo } from '@/components/Logo';

const { width } = Dimensions.get('window');

const AVATAR_GRADIENTS: readonly (readonly string[])[] = [
  ['#B32464', '#FF6B6B'],
  ['#5B4BD5', '#A29BFE'],
  ['#00B894', '#55EFC4'],
  ['#E8A820', '#FDCB6E'],
  ['#DC3545', '#FF6B6B'],
  ['#4A90D9', '#74B9FF'],
];

const SAMPLE_MATCHES = [
  { id: '1', name: 'Amara O.', age: 26, bio: 'Software Engineer', location: 'Lagos', isVerified: true, isPremium: true, interests: ['Tech', 'Travel', 'Cooking'], isActive: true, compatibility: 92 },
  { id: '2', name: 'Zainab K.', age: 24, bio: 'Medical Student', location: 'Nairobi', isVerified: true, isPremium: false, interests: ['Reading', 'Fitness'], isActive: true, compatibility: 87 },
  { id: '3', name: 'Fatima A.', age: 28, bio: 'Architect', location: 'Addis Ababa', isVerified: false, isPremium: true, interests: ['Art', 'Photography'], isActive: false, lastActive: '2h ago', compatibility: 84 },
  { id: '4', name: 'Ngozi C.', age: 25, bio: 'Lawyer & Dancer', location: 'Abuja', isVerified: true, isPremium: true, interests: ['Law', 'Dance'], isActive: false, lastActive: '30m ago', compatibility: 91 },
  { id: '5', name: 'Aisha M.', age: 27, bio: 'Entrepreneur', location: 'Johannesburg', isVerified: true, isPremium: false, interests: ['Business', 'Travel'], isActive: true, compatibility: 88 },
  { id: '6', name: 'Chidera N.', age: 23, bio: 'Content Creator', location: 'Port Harcourt', isVerified: false, isPremium: false, interests: ['Photography', 'Film'], isActive: false, lastActive: '12h ago', compatibility: 79 },
];

export default function MatchesScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'matches' | 'likes' | 'visits'>('matches');

  const tabs = [
    { key: 'matches' as const, label: t('matches'), icon: 'heart' as const },
    { key: 'likes' as const, label: t('likes'), icon: 'star' as const },
    { key: 'visits' as const, label: t('profile_views'), icon: 'eye' as const },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Logo size="sm" showText={false} />
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Isizuo</Text>
        </View>
        <TouchableOpacity style={styles.notifBtn} accessibilityRole="button" accessibilityLabel={t('notifications')}>
          <Ionicons name="notifications-outline" size={22} color={COLORS.text} />
          <View style={styles.notifDot} />
        </TouchableOpacity>
      </View>

      <View style={styles.tabRow} accessibilityRole="tablist">
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tabBtn, activeTab === tab.key && styles.tabBtnActive]}
            onPress={() => setActiveTab(tab.key)}
            accessibilityRole="tab"
            accessibilityState={{ selected: activeTab === tab.key }}
            accessibilityLabel={tab.label}
          >
            <Text style={[styles.tabBtnText, activeTab === tab.key && styles.tabBtnTextActive]}>{tab.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {activeTab === 'matches' && (
          <>
            {/* New Matches - Large Horizontal Scroll */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle} accessibilityRole="header">{t('new_matches')}</Text>
              <Badge label={`${SAMPLE_MATCHES.length} ${t('new_count')}`} variant="success" icon="sparkles" />
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.newMatchesScroll} contentContainerStyle={styles.newMatchesContent}>
              {SAMPLE_MATCHES.slice(0, 4).map((m, i) => (
                <TouchableOpacity key={m.id} style={styles.newMatchCard} activeOpacity={0.92} accessibilityRole="button" accessibilityLabel={`${m.name}`}>
                  <LinearGradient
                    colors={AVATAR_GRADIENTS[i % AVATAR_GRADIENTS.length] as readonly [string, string]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.newMatchImage}
                  >
                    <Text style={styles.newMatchInitial}>{m.name.charAt(0)}</Text>
                    <View style={styles.newMatchBadge}>
                      <Text style={styles.newMatchBadgeText}>{m.compatibility}%</Text>
                    </View>
                  </LinearGradient>
                  <Text style={styles.newMatchName} numberOfLines={1}>{m.name.split(' ')[0]}</Text>
                  <ActiveNowBadge isActive={m.isActive} lastActive={m.lastActive} />
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Conversations - Large Cards */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle} accessibilityRole="header">{t('messages')}</Text>
              <TouchableOpacity accessibilityRole="button" accessibilityLabel={t('see_all')}>
                <Text style={styles.seeAll}>{t('see_all')}</Text>
              </TouchableOpacity>
            </View>
            {SAMPLE_MATCHES.map((match, i) => (
              <TouchableOpacity key={match.id} style={styles.chatCard} activeOpacity={0.92} accessibilityRole="button" accessibilityLabel={`${match.name}`}>
                <View style={styles.chatCardLeft}>
                  <LinearGradient
                    colors={AVATAR_GRADIENTS[i % AVATAR_GRADIENTS.length] as readonly [string, string]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.chatAvatar}
                  >
                    <Text style={styles.chatAvatarText}>{match.name.charAt(0)}</Text>
                  </LinearGradient>
                  <View style={styles.chatOnlineDot}>
                    <View style={[styles.chatOnlineInner, { backgroundColor: match.isActive ? COLORS.success : COLORS.textLight }]} />
                  </View>
                </View>
                <View style={styles.chatInfo}>
                  <View style={styles.chatNameRow}>
                    <Text style={styles.chatName}>{match.name}</Text>
                    {match.isVerified && <Ionicons name="checkmark-circle" size={14} color={COLORS.info} />}
                    {match.isPremium && <Ionicons name="diamond" size={12} color={COLORS.premium} />}
                  </View>
                  <Text style={styles.chatBio}>{match.bio} \u2022 {match.location}</Text>
                  <View style={styles.chatTags}>
                    {match.interests.slice(0, 2).map((interest) => (
                      <View key={interest} style={styles.chatTag}>
                        <Text style={styles.chatTagText}>{interest}</Text>
                      </View>
                    ))}
                  </View>
                </View>
                <View style={styles.chatRight}>
                  <ActiveNowBadge isActive={match.isActive} lastActive={match.lastActive} />
                  <View style={styles.chatCompat}>
                    <Text style={styles.chatCompatText}>{match.compatibility}%</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </>
        )}

        {activeTab === 'likes' && (
          <View style={styles.premiumPrompt}>
            <LinearGradient
              colors={GRADIENTS.sunset as readonly [string, string]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.premiumIconWrap}
            >
              <Ionicons name="star" size={40} color={COLORS.textInverse} />
            </LinearGradient>
            <Text style={styles.premiumTitle} accessibilityRole="header">{t('likes_received')}</Text>
            <Text style={styles.premiumDesc}>
              {t('upgrade_to_see_likes')}
            </Text>
            <Button title={t('upgrade')} variant="gradient" onPress={() => {}} icon="diamond" fullWidth gradient={GRADIENTS.sunset as readonly [string, string]} />
          </View>
        )}

        {activeTab === 'visits' && (
          <View style={styles.premiumPrompt}>
            <LinearGradient
              colors={GRADIENTS.ocean as readonly [string, string]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.premiumIconWrap}
            >
              <Ionicons name="eye" size={40} color={COLORS.textInverse} />
            </LinearGradient>
            <Text style={styles.premiumTitle} accessibilityRole="header">{t('profile_views')}</Text>
            <Text style={styles.premiumDesc}>
              {t('see_profile_views')}
            </Text>
            <Button title={t('upgrade')} variant="gradient" onPress={() => {}} icon="diamond" fullWidth gradient={GRADIENTS.ocean as readonly [string, string]} />
          </View>
        )}
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
  notifBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: COLORS.surface, alignItems: 'center', justifyContent: 'center', ...SHADOWS.sm },
  notifDot: { position: 'absolute', top: 10, right: 10, width: 9, height: 9, borderRadius: 4.5, backgroundColor: COLORS.primary, borderWidth: 2.5, borderColor: COLORS.surface },
  tabRow: {
    flexDirection: 'row', backgroundColor: COLORS.surface, marginHorizontal: SPACING.lg, marginTop: SPACING.sm,
    borderRadius: BORDER_RADIUS.xl, padding: 4, ...SHADOWS.sm,
  },
  tabBtn: { flex: 1, alignItems: 'center', paddingVertical: 12, borderRadius: BORDER_RADIUS.xl },
  tabBtnActive: { backgroundColor: COLORS.primaryGlow },
  tabBtnText: { fontSize: FONT_SIZES.sm, fontFamily: FONTS.semiBold, color: COLORS.textMuted },
  tabBtnTextActive: { color: COLORS.primary, fontFamily: FONTS.bold },
  content: { flex: 1, paddingTop: SPACING.md },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: SPACING.lg, marginBottom: SPACING.md, marginTop: SPACING.sm },
  sectionTitle: { fontSize: FONT_SIZES.lg, fontFamily: FONTS.bold, color: COLORS.text, letterSpacing: -0.3 },
  seeAll: { fontSize: FONT_SIZES.sm, fontFamily: FONTS.semiBold, color: COLORS.primary },
  newMatchesScroll: { marginBottom: SPACING.xl },
  newMatchesContent: { paddingHorizontal: SPACING.lg, gap: SPACING.md },
  newMatchCard: { alignItems: 'center', width: 96 },
  newMatchImage: {
    width: 84, height: 84, borderRadius: 42, alignItems: 'center', justifyContent: 'center',
    ...SHADOWS.md,
  },
  newMatchInitial: { fontSize: 32, fontFamily: FONTS.extraBold, color: 'rgba(255,255,255,0.85)', letterSpacing: -1 },
  newMatchBadge: {
    position: 'absolute', bottom: -2, right: -2,
    backgroundColor: COLORS.surface, borderRadius: 12, paddingHorizontal: 6, paddingVertical: 2,
    ...SHADOWS.sm,
  },
  newMatchBadgeText: { fontSize: 10, fontFamily: FONTS.bold, color: COLORS.primary },
  newMatchName: { fontSize: FONT_SIZES.sm, fontFamily: FONTS.semiBold, color: COLORS.text, textAlign: 'center', marginTop: 8 },
  chatCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surface, marginHorizontal: SPACING.lg,
    borderRadius: BORDER_RADIUS.xl, padding: SPACING.lg, marginBottom: SPACING.sm, ...SHADOWS.md,
  },
  chatCardLeft: { position: 'relative' },
  chatAvatar: {
    width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center',
  },
  chatAvatarText: { fontSize: 22, fontFamily: FONTS.bold, color: 'rgba(255,255,255,0.85)' },
  chatOnlineDot: {
    position: 'absolute', bottom: 0, right: 0,
    width: 16, height: 16, borderRadius: 8, backgroundColor: COLORS.surface,
    alignItems: 'center', justifyContent: 'center',
  },
  chatOnlineInner: { width: 10, height: 10, borderRadius: 5 },
  chatInfo: { flex: 1, marginLeft: SPACING.md },
  chatNameRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 3 },
  chatName: { fontSize: FONT_SIZES.md, fontFamily: FONTS.bold, color: COLORS.text },
  chatBio: { fontSize: FONT_SIZES.xs, fontFamily: FONTS.regular, color: COLORS.textMuted, marginBottom: 8 },
  chatTags: { flexDirection: 'row', gap: 6 },
  chatTag: { backgroundColor: COLORS.primaryGlow, paddingHorizontal: 10, paddingVertical: 4, borderRadius: BORDER_RADIUS.full },
  chatTagText: { fontSize: 12, fontFamily: FONTS.semiBold, color: COLORS.primary },
  chatRight: { alignItems: 'flex-end', gap: 8 },
  chatCompat: {
    backgroundColor: COLORS.primary + '12', borderRadius: 10, paddingHorizontal: 8, paddingVertical: 3,
  },
  chatCompatText: { fontSize: 12, fontFamily: FONTS.bold, color: COLORS.primary },
  premiumPrompt: {
    alignItems: 'center', padding: SPACING.xl, backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.xl, marginHorizontal: SPACING.lg, marginTop: SPACING.md, ...SHADOWS.md,
  },
  premiumIconWrap: {
    width: 80, height: 80, borderRadius: 24,
    alignItems: 'center', justifyContent: 'center', marginBottom: SPACING.lg,
  },
  premiumTitle: { fontSize: FONT_SIZES.xxl, fontFamily: FONTS.bold, color: COLORS.text, marginBottom: SPACING.sm, letterSpacing: -0.5 },
  premiumDesc: { fontSize: FONT_SIZES.md, fontFamily: FONTS.regular, color: COLORS.textMuted, textAlign: 'center', marginBottom: SPACING.lg, lineHeight: 24 },
});
