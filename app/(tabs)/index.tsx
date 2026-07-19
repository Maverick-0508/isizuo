import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTranslation } from '@/hooks';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS, SHADOWS, FONTS } from '@/constants';
import { Button, Badge, Avatar } from '@/components/ui';
import { Logo } from '@/components/Logo';

const { width } = Dimensions.get('window');

const SAMPLE_MATCHES = [
  { id: '1', name: 'Amara O.', age: 26, bio: 'Lagos \u2022 Software Engineer', isVerified: true, isPremium: true, community: 'Yoruba', interests: ['Tech', 'Travel', 'Cooking'], lastActive: '2h ago' },
  { id: '2', name: 'Zainab K.', age: 24, bio: 'Nairobi \u2022 Medical Student', isVerified: true, isPremium: false, community: 'Swahili', interests: ['Reading', 'Fitness', 'Music'], lastActive: '5h ago' },
  { id: '3', name: 'Fatima A.', age: 28, bio: 'Addis Ababa \u2022 Architect', isVerified: false, isPremium: true, community: 'Amhara', interests: ['Art', 'Photography', 'Fashion'], lastActive: '1d ago' },
  { id: '4', name: 'Ngozi C.', age: 25, bio: 'Abuja \u2022 Lawyer', isVerified: true, isPremium: true, community: 'Igbo', interests: ['Law', 'Dance', 'Cooking'], lastActive: '30m ago' },
  { id: '5', name: 'Aisha M.', age: 27, bio: 'Johannesburg \u2022 Entrepreneur', isVerified: true, isPremium: false, community: 'Zulu', interests: ['Business', 'Travel', 'Music'], lastActive: '3h ago' },
  { id: '6', name: 'Chidera N.', age: 23, bio: 'Port Harcourt \u2022 Content Creator', isVerified: false, isPremium: false, community: 'Igbo', interests: ['Photography', 'Dance', 'Film'], lastActive: '12h ago' },
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
        <TouchableOpacity style={styles.settingsBtn}>
          <Ionicons name="notifications-outline" size={20} color={COLORS.text} />
          <View style={styles.notifDot} />
        </TouchableOpacity>
      </View>

      <View style={styles.tabRow}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tabBtn, activeTab === tab.key && styles.tabBtnActive]}
            onPress={() => setActiveTab(tab.key)}
          >
            <Text style={[styles.tabBtnText, activeTab === tab.key && styles.tabBtnTextActive]}>{tab.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {activeTab === 'matches' && (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{t('new_matches')}</Text>
              <Badge label="6 new" variant="success" icon="sparkles" />
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.newMatchesScroll}>
              {SAMPLE_MATCHES.slice(0, 3).map((m) => (
                <TouchableOpacity key={m.id} style={styles.newMatchCard} activeOpacity={0.85}>
                  <View style={styles.newMatchAvatarWrap}>
                    <Avatar name={m.name} size={68} isVerified={m.isVerified} colorIndex={parseInt(m.id)} />
                  </View>
                  <Text style={styles.newMatchName} numberOfLines={1}>{m.name}</Text>
                  <Text style={styles.newMatchTime}>{m.lastActive}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recent conversations</Text>
              <TouchableOpacity>
                <Text style={styles.seeAll}>See all</Text>
              </TouchableOpacity>
            </View>
            {SAMPLE_MATCHES.map((match) => (
              <TouchableOpacity key={match.id} style={styles.chatCard} activeOpacity={0.85}>
                <Avatar name={match.name} size={52} isVerified={match.isVerified} isOnline={Math.random() > 0.5} colorIndex={parseInt(match.id)} />
                <View style={styles.chatInfo}>
                  <View style={styles.chatNameRow}>
                    <Text style={styles.chatName}>{match.name}</Text>
                    {match.isPremium && <Ionicons name="diamond" size={12} color={COLORS.premium} />}
                    <Text style={styles.chatTime}>{match.lastActive}</Text>
                  </View>
                  <Text style={styles.chatLastMsg} numberOfLines={1}>{match.bio}</Text>
                  <View style={styles.interestRow}>
                    {match.interests.slice(0, 2).map((interest) => (
                      <Badge key={interest} label={interest} variant="info" size="sm" />
                    ))}
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={16} color={COLORS.textLight} />
              </TouchableOpacity>
            ))}
          </>
        )}

        {activeTab === 'likes' && (
          <View style={styles.premiumPrompt}>
            <View style={styles.premiumIconWrap}>
              <Ionicons name="star" size={36} color={COLORS.accent} />
            </View>
            <Text style={styles.premiumTitle}>{t('likes_received')}</Text>
            <Text style={styles.premiumDesc}>
              Upgrade to see who liked your profile. Get unlimited swipes and more!
            </Text>
            <Button title={t('upgrade')} variant="gradient" onPress={() => {}} icon="diamond" fullWidth />
          </View>
        )}

        {activeTab === 'visits' && (
          <View style={styles.premiumPrompt}>
            <View style={styles.premiumIconWrap}>
              <Ionicons name="eye" size={36} color={COLORS.info} />
            </View>
            <Text style={styles.premiumTitle}>{t('profile_views')}</Text>
            <Text style={styles.premiumDesc}>
              See who viewed your profile in the last 30 days. Get premium to unlock this feature.
            </Text>
            <Button title={t('upgrade')} variant="gradient" onPress={() => {}} icon="diamond" fullWidth />
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
    paddingHorizontal: SPACING.lg, paddingTop: 56, paddingBottom: SPACING.sm,
    backgroundColor: COLORS.card, borderBottomLeftRadius: BORDER_RADIUS.xl, borderBottomRightRadius: BORDER_RADIUS.xl,
    ...SHADOWS.sm,
  },
  headerCenter: { flex: 1, alignItems: 'center' },
  headerTitle: { fontSize: 20, fontFamily: FONTS.extraBold, color: COLORS.text, letterSpacing: -0.5 },
  settingsBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.background, alignItems: 'center', justifyContent: 'center' },
  notifDot: { position: 'absolute', top: 8, right: 8, width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.primary, borderWidth: 1.5, borderColor: COLORS.card },
  tabRow: {
    flexDirection: 'row', backgroundColor: COLORS.card, marginHorizontal: SPACING.lg, marginTop: SPACING.md,
    borderRadius: BORDER_RADIUS.xl, padding: 4, ...SHADOWS.sm,
  },
  tabBtn: { flex: 1, alignItems: 'center', paddingVertical: 10, borderRadius: BORDER_RADIUS.xl },
  tabBtnActive: { backgroundColor: COLORS.primary + '12' },
  tabBtnText: { fontSize: 13, fontFamily: FONTS.semiBold, color: COLORS.textLight },
  tabBtnTextActive: { color: COLORS.primary, fontFamily: FONTS.bold },
  content: { flex: 1, paddingHorizontal: SPACING.lg, paddingTop: SPACING.md },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.md, marginTop: SPACING.sm },
  sectionTitle: { fontSize: FONT_SIZES.lg, fontFamily: FONTS.bold, color: COLORS.text },
  seeAll: { fontSize: FONT_SIZES.sm, fontFamily: FONTS.semiBold, color: COLORS.primary },
  newMatchesScroll: { marginBottom: SPACING.lg, marginLeft: -4 },
  newMatchCard: { alignItems: 'center', marginRight: SPACING.md, width: 84 },
  newMatchAvatarWrap: { marginBottom: 6 },
  newMatchName: { fontSize: 12, fontFamily: FONTS.semiBold, color: COLORS.text, textAlign: 'center' },
  newMatchTime: { fontSize: 11, fontFamily: FONTS.regular, color: COLORS.textLight, marginTop: 1 },
  chatCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.card, borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md, marginBottom: SPACING.sm, ...SHADOWS.sm,
  },
  chatInfo: { flex: 1, marginLeft: SPACING.md },
  chatNameRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 3 },
  chatName: { fontSize: FONT_SIZES.md, fontFamily: FONTS.bold, color: COLORS.text },
  chatTime: { fontSize: 11, fontFamily: FONTS.regular, color: COLORS.textLight, marginLeft: 'auto' },
  chatLastMsg: { fontSize: FONT_SIZES.sm, fontFamily: FONTS.regular, color: COLORS.textLight, marginBottom: 6 },
  interestRow: { flexDirection: 'row', gap: 4 },
  premiumPrompt: {
    alignItems: 'center', padding: SPACING.xl, backgroundColor: COLORS.card,
    borderRadius: BORDER_RADIUS.lg, marginTop: SPACING.lg, borderWidth: 1, borderColor: COLORS.border,
  },
  premiumIconWrap: {
    width: 64, height: 64, borderRadius: 32, backgroundColor: COLORS.background,
    alignItems: 'center', justifyContent: 'center', marginBottom: SPACING.md,
  },
  premiumTitle: { fontSize: FONT_SIZES.xl, fontFamily: FONTS.bold, color: COLORS.text, marginBottom: SPACING.sm },
  premiumDesc: { fontSize: FONT_SIZES.md, fontFamily: FONTS.regular, color: COLORS.textLight, textAlign: 'center', marginBottom: SPACING.lg, lineHeight: 22 },
});
