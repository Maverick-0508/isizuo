import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, Modal, Share, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTranslation } from '@/hooks';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS, SHADOWS, FONTS, GRADIENTS } from '@/constants';
import { Button, Badge, Avatar, ActiveNowBadge } from '@/components/ui';
import { Logo } from '@/components/Logo';
import { useMatchingStore, useAuthStore, useStreakStore } from '@/stores';

const { width } = Dimensions.get('window');

const AVATAR_GRADIENTS: readonly (readonly [string, string])[] = [
  ['#B32464', '#FF6B6B'],
  ['#5B4BD5', '#A29BFE'],
  ['#00B894', '#55EFC4'],
  ['#E8A820', '#FDCB6E'],
  ['#DC3545', '#FF6B6B'],
  ['#4A90D9', '#74B9FF'],
];



export default function MatchesScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { matches, likesReceived, isLoading, fetchMatches, fetchLikesReceived, likeUser } = useMatchingStore();
  const { user } = useAuthStore();
  const { currentStreak } = useStreakStore();
  const [activeTab, setActiveTab] = useState<'matches' | 'likes' | 'visits'>('matches');

  // Referral state
  const [showReferralModal, setShowReferralModal] = useState(false);

  useEffect(() => {
    fetchMatches();
    fetchLikesReceived();
  }, []);

  const displayMatches = matches.length > 0 ? matches : [];

  const tabs = [
    { key: 'matches' as const, label: t('matches'), icon: 'heart' as const },
    { key: 'likes' as const, label: t('likes'), icon: 'star' as const },
    { key: 'visits' as const, label: t('profile_views'), icon: 'eye' as const },
  ];

  const handleShareReferral = async () => {
    const code = user?.referralCode || 'ISIZUO';
    const message = `${t('referral_share_text')}: ${code}`;
    try {
      await Share.share({ message });
    } catch {}
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Logo size="sm" showText={false} />
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Isizuo</Text>
        </View>
        <TouchableOpacity style={styles.notifBtn} onPress={() => setShowReferralModal(true)} accessibilityRole="button" accessibilityLabel={t('referral_title')}>
          <Ionicons name="gift-outline" size={22} color={COLORS.text} />
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
              <Badge label={`${displayMatches.length} ${t('new_count')}`} variant="success" icon="sparkles" />
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.newMatchesScroll} contentContainerStyle={styles.newMatchesContent}>
              {displayMatches.slice(0, 4).map((m: any, i: number) => (
                <TouchableOpacity key={m.id} style={styles.newMatchCard} activeOpacity={0.92} onPress={() => router.push(`/chat/${m.id}`)} accessibilityRole="button" accessibilityLabel={`${m.otherUser?.name || 'Match'}`}>
                  <LinearGradient
                    colors={AVATAR_GRADIENTS[i % AVATAR_GRADIENTS.length] as readonly [string, string]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.newMatchImage}
                  >
                    <Text style={styles.newMatchInitial}>{(m.otherUser?.name || 'M').charAt(0)}</Text>
                    {m.compatibilityScore && (
                      <View style={styles.newMatchBadge}>
                        <Text style={styles.newMatchBadgeText}>{m.compatibilityScore}%</Text>
                      </View>
                    )}
                  </LinearGradient>
                  <Text style={styles.newMatchName} numberOfLines={1}>{(m.otherUser?.name || 'Match').split(' ')[0]}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Conversations - Large Cards */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle} accessibilityRole="header">{t('messages')}</Text>
              <TouchableOpacity accessibilityRole="button" accessibilityLabel={t('see_all')} onPress={() => router.push('/(tabs)/explore')}>
                <Text style={styles.seeAll}>{t('see_all')}</Text>
              </TouchableOpacity>
            </View>
            {displayMatches.map((match: any, i: number) => (
              <TouchableOpacity key={match.id} style={styles.chatCard} activeOpacity={0.92} accessibilityRole="button" accessibilityLabel={`${match.otherUser?.name || 'Match'}`} onPress={() => router.push(`/chat/${match.id}`)}>
                <View style={styles.chatCardLeft}>
                  <LinearGradient
                    colors={AVATAR_GRADIENTS[i % AVATAR_GRADIENTS.length] as readonly [string, string]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.chatAvatar}
                  >
                    <Text style={styles.chatAvatarText}>{(match.otherUser?.name || 'M').charAt(0)}</Text>
                  </LinearGradient>
                </View>
                <View style={styles.chatInfo}>
                  <View style={styles.chatNameRow}>
                    <Text style={styles.chatName}>{match.otherUser?.name || 'Match'}</Text>
                  </View>
                  <Text style={styles.chatBio}>{match.otherUser?.bio || 'Start a conversation...'}</Text>
                </View>
                {match.compatibilityScore && (
                  <View style={styles.chatRight}>
                    <View style={styles.chatCompat}>
                      <Text style={styles.chatCompatText}>{match.compatibilityScore}%</Text>
                    </View>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </>
        )}

        {activeTab === 'likes' && (
          likesReceived.length > 0 ? (
            <>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>{t('who_likes_you_title')}</Text>
                <Badge label={`${likesReceived.length} ${t('likes_you')}`} variant="premium" icon="star" />
              </View>
              {likesReceived.length === 0 ? (
                <View style={styles.emptyLikes}>
                  <Ionicons name="heart-outline" size={48} color={COLORS.textLight} />
                  <Text style={styles.emptyLikesText}>{t('no_matches')}</Text>
                </View>
              ) : (
                <View style={styles.likesGrid}>
                  {likesReceived.map((liker: any, i: number) => (
                    <TouchableOpacity key={liker.id} style={styles.likeCard}>
                      <LinearGradient
                        colors={[['#B32464', '#FF6B6B'], ['#5B4BD5', '#A29BFE'], ['#00B894', '#55EFC4'], ['#E8A820', '#FDCB6E'], ['#DC3545', '#FF6B6B'], ['#4A90D9', '#74B9FF']][i % 6] as readonly [string, string]}
                        style={styles.likeAvatar}
                      >
                        <Text style={styles.likeAvatarText}>{(liker.name || 'U').charAt(0)}</Text>
                      </LinearGradient>
                      <Text style={styles.likeName} numberOfLines={1}>{liker.name}</Text>
                      <Text style={styles.likeAge}>{liker.age || ''}</Text>
                      <Button
                        title={t('like_back')}
                        variant="primary"
                        size="sm"
                        fullWidth
                        icon="heart"
                        onPress={() => { likeUser(liker.id); }}
                      />
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </>
          ) : (
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
              <Button title={t('upgrade')} variant="gradient" onPress={() => router.push('/ussd')} icon="diamond" fullWidth gradient={GRADIENTS.sunset as readonly [string, string]} />
            </View>
          )
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
            <Button title={t('upgrade')} variant="gradient" onPress={() => router.push('/ussd')} icon="diamond" fullWidth gradient={GRADIENTS.ocean as readonly [string, string]} />
          </View>
        )}
        {/* Referral Modal */}
        <Modal visible={showReferralModal} transparent animationType="slide">
          <View style={styles.referralOverlay}>
            <View style={styles.referralModal}>
              <TouchableOpacity style={styles.referralCloseBtn} onPress={() => setShowReferralModal(false)}>
                <Ionicons name="close" size={24} color={COLORS.text} />
              </TouchableOpacity>

              <LinearGradient colors={GRADIENTS.primary} style={styles.referralIconWrap}>
                <Ionicons name="gift" size={40} color="#FFFFFF" />
              </LinearGradient>
              <Text style={styles.referralTitle}>{t('referral_title')}</Text>
              <Text style={styles.referralDesc}>{t('referral_description')}</Text>

              <View style={styles.referralCodeBox}>
                <Text style={styles.referralCodeLabel}>{t('referral_code')}</Text>
                <Text style={styles.referralCode}>{user?.referralCode || 'ISIZUO'}</Text>
              </View>

              <View style={styles.referralStatsRow}>
                <TouchableOpacity style={styles.referralStat} onPress={handleShareReferral}>
                  <Ionicons name="share-social" size={24} color={COLORS.primary} />
                  <Text style={styles.referralStatValue}>{t('referral_share')}</Text>
                </TouchableOpacity>
                <View style={styles.referralStat}>
                  <Ionicons name="people" size={24} color={COLORS.primary} />
                  <Text style={styles.referralStatValue}>0 {t('people_joined')}</Text>
                </View>
                <View style={styles.referralStat}>
                  <Ionicons name="cash" size={24} color={COLORS.primary} />
                  <Text style={styles.referralStatValue}>0 {t('earn_credits')}</Text>
                </View>
              </View>

              <Button
                title={t('referral_share')}
                variant="gradient"
                size="lg"
                fullWidth
                icon="share-social"
                onPress={handleShareReferral}
              />
            </View>
          </View>
        </Modal>
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
  emptyLikes: { alignItems: 'center', padding: SPACING.xl * 2 },
  emptyLikesText: { fontSize: FONT_SIZES.md, fontFamily: FONTS.medium, color: COLORS.textLight, marginTop: SPACING.md },
  likesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm, paddingHorizontal: SPACING.lg },
  likeCard: {
    width: (width - SPACING.lg * 2 - SPACING.sm * 2) / 3,
    backgroundColor: COLORS.surface, borderRadius: BORDER_RADIUS.xl, padding: SPACING.sm,
    alignItems: 'center', ...SHADOWS.sm, marginBottom: SPACING.sm,
  },
  likeAvatar: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', marginBottom: 6 },
  likeAvatarText: { fontSize: 22, fontFamily: FONTS.extraBold, color: '#FFFFFF' },
  likeName: { fontSize: FONT_SIZES.sm, fontFamily: FONTS.semiBold, color: COLORS.text, textAlign: 'center' },
  likeAge: { fontSize: FONT_SIZES.xs, fontFamily: FONTS.regular, color: COLORS.textLight, marginBottom: 8 },
  referralOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end', padding: SPACING.lg },
  referralModal: {
    backgroundColor: COLORS.surface, borderRadius: BORDER_RADIUS.xl, padding: SPACING.xl,
    alignItems: 'center', ...SHADOWS.lg,
  },
  referralCloseBtn: { alignSelf: 'flex-end' },
  referralIconWrap: {
    width: 80, height: 80, borderRadius: 24, alignItems: 'center', justifyContent: 'center',
    marginBottom: SPACING.lg,
  },
  referralTitle: { fontSize: FONT_SIZES.xxl, fontFamily: FONTS.extraBold, color: COLORS.text, letterSpacing: -0.8, marginBottom: 8 },
  referralDesc: { fontSize: FONT_SIZES.md, fontFamily: FONTS.regular, color: COLORS.textLight, textAlign: 'center', lineHeight: 22, marginBottom: SPACING.lg },
  referralCodeBox: {
    backgroundColor: COLORS.primaryGlow, borderRadius: BORDER_RADIUS.lg, padding: SPACING.lg,
    width: '100%', alignItems: 'center', marginBottom: SPACING.lg,
  },
  referralCodeLabel: { fontSize: FONT_SIZES.xs, fontFamily: FONTS.semiBold, color: COLORS.primary, textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 6 },
  referralCode: { fontSize: 30, fontFamily: FONTS.extraBold, color: COLORS.primary, letterSpacing: 4 },
  referralStatsRow: { flexDirection: 'row', gap: SPACING.lg, marginBottom: SPACING.lg },
  referralStat: { alignItems: 'center', gap: 6 },
  referralStatValue: { fontSize: FONT_SIZES.sm, fontFamily: FONT_SIZES.semiBold, color: COLORS.text },
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
