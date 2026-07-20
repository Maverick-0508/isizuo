import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from '@/hooks';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS, SHADOWS, FONTS, GRADIENTS } from '@/constants';
import { Badge, Avatar, Button, ActiveNowBadge, InterestPill } from '@/components/ui';
import { Logo } from '@/components/Logo';

const { width, height } = Dimensions.get('window');
const CARD_WIDTH = width - SPACING.lg * 2;
const CARD_HEIGHT = Math.min(height * 0.58, 440);

const CATEGORIES = [
  { key: 'nearby', label: 'Nearby', icon: 'location' },
  { key: 'online', label: 'Online Now', icon: 'radio' },
  { key: 'new', label: 'New', icon: 'sparkles' },
  { key: 'verified', label: 'Verified', icon: 'shield-checkmark' },
  { key: 'premium', label: 'Premium', icon: 'diamond' },
];

const AVATAR_GRADIENTS: readonly (readonly string[])[] = [
  ['#B32464', '#FF6B6B'],
  ['#5B4BD5', '#A29BFE'],
  ['#00B894', '#55EFC4'],
  ['#E8A820', '#FDCB6E'],
  ['#DC3545', '#FF6B6B'],
  ['#4A90D9', '#74B9FF'],
  ['#6C5CE7', '#A29BFE'],
  ['#00B894', '#00CEC9'],
];

const SAMPLE_PROFILES = [
  { id: '1', name: 'Amara', age: 26, location: 'Lagos, Nigeria', bio: 'Software Engineer who loves to travel and cook traditional meals. Looking for someone adventurous.', community: 'Yoruba', isVerified: true, isPremium: true, distance: '2 km', interests: ['Tech', 'Travel', 'Cooking'], isActive: true, compatibility: 92 },
  { id: '2', name: 'Zainab', age: 24, location: 'Nairobi, Kenya', bio: 'Medical student with a passion for community health and cultural exchange.', community: 'Swahili', isVerified: true, isPremium: false, distance: '5 km', interests: ['Reading', 'Fitness', 'Music'], isActive: false, lastActive: '2h ago', compatibility: 87 },
  { id: '3', name: 'Fatima', age: 28, location: 'Addis Ababa, Ethiopia', bio: 'Architect designing the future of African cities. Love art and photography.', community: 'Amhara', isVerified: false, isPremium: true, distance: '8 km', interests: ['Art', 'Photography', 'Fashion'], isActive: true, compatibility: 84 },
  { id: '4', name: 'Ngozi', age: 25, location: 'Abuja, Nigeria', bio: 'Lawyer by day, dancer by night. Family is everything to me.', community: 'Igbo', isVerified: true, isPremium: true, distance: '12 km', interests: ['Law', 'Dance', 'Cooking'], isActive: false, lastActive: '30m ago', compatibility: 91 },
  { id: '5', name: 'Aisha', age: 27, location: 'Johannesburg, SA', bio: 'Building the next big thing in fintech. Love live music and sunsets.', community: 'Zulu', isVerified: true, isPremium: false, distance: '3 km', interests: ['Business', 'Travel', 'Music'], isActive: true, compatibility: 88 },
];

export default function ExploreScreen() {
  const { t } = useTranslation();
  const [activeCategory, setActiveCategory] = useState('nearby');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [activeProfileTab, setActiveProfileTab] = useState<'about' | 'interests' | 'values'>('about');
  const currentProfile = SAMPLE_PROFILES[currentIndex % SAMPLE_PROFILES.length];
  const gradient = AVATAR_GRADIENTS[currentIndex % AVATAR_GRADIENTS.length] as readonly string[];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Logo size="sm" showText={false} />
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle} accessibilityRole="header">Explore</Text>
        </View>
        <TouchableOpacity style={styles.filterBtn} accessibilityRole="button" accessibilityLabel="Filter profiles">
          <Ionicons name="options-outline" size={22} color={COLORS.text} />
        </TouchableOpacity>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesScroll} contentContainerStyle={styles.categoriesContent}>
        {CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat.key}
            style={[styles.categoryPill, activeCategory === cat.key && styles.categoryPillActive]}
            onPress={() => setActiveCategory(cat.key)}
            accessibilityRole="button"
            accessibilityLabel={cat.label}
            accessibilityState={{ selected: activeCategory === cat.key }}
          >
            <Ionicons name={cat.icon as any} size={16} color={activeCategory === cat.key ? COLORS.textInverse : COLORS.textMuted} />
            <Text style={[styles.categoryText, activeCategory === cat.key && styles.categoryTextActive]}>{cat.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false} contentContainerStyle={styles.contentContainer}>
        {/* Immersive Discovery Card */}
        <View style={styles.cardStack}>
          {/* Background card (peek) */}
          <View style={[styles.discoveryCard, styles.discoveryCardBg, { top: 6 }]} />
          <View style={[styles.discoveryCard, styles.discoveryCardBg2, { top: 3 }]} />

          {/* Main card */}
          <View style={styles.discoveryCard}>
            <LinearGradient
              colors={gradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.cardImage}
            >
              <Text style={styles.cardInitials}>
                {currentProfile.name.charAt(0)}
              </Text>
              <View style={styles.cardTopBadges}>
                {currentProfile.isVerified && (
                  <View style={styles.topBadge}>
                    <Ionicons name="checkmark-circle" size={16} color={COLORS.textInverse} />
                    <Text style={styles.topBadgeText}>Verified</Text>
                  </View>
                )}
                {currentProfile.isPremium && (
                  <View style={[styles.topBadge, { backgroundColor: 'rgba(232, 168, 32, 0.85)' }]}>
                    <Ionicons name="diamond" size={14} color={COLORS.textInverse} />
                    <Text style={styles.topBadgeText}>Premium</Text>
                  </View>
                )}
              </View>
              <View style={styles.cardDistanceBadge}>
                <Ionicons name="location" size={12} color={COLORS.textInverse} />
                <Text style={styles.cardDistanceText}>{currentProfile.distance}</Text>
              </View>
            </LinearGradient>

            {/* Card Info Overlay */}
            <LinearGradient
              colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.7)']}
              style={styles.cardOverlay}
              pointerEvents="none"
            />
            <View style={styles.cardInfoOverlay}>
              <View>
                <View style={styles.cardNameRow}>
                  <Text style={styles.cardName}>{currentProfile.name}, {currentProfile.age}</Text>
                  {currentProfile.isVerified && <Ionicons name="checkmark-circle" size={18} color={COLORS.info} />}
                </View>
                <View style={styles.cardLocationRow}>
                  <Ionicons name="location-outline" size={13} color="rgba(255,255,255,0.8)" />
                  <Text style={styles.cardLocation}>{currentProfile.location}</Text>
                </View>
              </View>
              <View style={styles.compatibilityBadge}>
                <Text style={styles.compatibilityValue}>{currentProfile.compatibility}%</Text>
                <Text style={styles.compatibilityLabel}>Match</Text>
              </View>
            </View>

            {/* Card Body */}
            <View style={styles.cardBody}>
              <View style={styles.cardTabs}>
                {(['about', 'interests', 'values'] as const).map((tab) => (
                  <TouchableOpacity
                    key={tab}
                    style={[styles.cardTab, activeProfileTab === tab && styles.cardTabActive]}
                    onPress={() => setActiveProfileTab(tab)}
                  >
                    <Text style={[styles.cardTabText, activeProfileTab === tab && styles.cardTabTextActive]}>{tab.charAt(0).toUpperCase() + tab.slice(1)}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              {activeProfileTab === 'about' && (
                <Text style={styles.cardBio}>{currentProfile.bio}</Text>
              )}

              {activeProfileTab === 'interests' && (
                <View style={styles.pillRow}>
                  {currentProfile.interests.map((interest) => (
                    <InterestPill key={interest} label={interest} variant="default" />
                  ))}
                </View>
              )}

              {activeProfileTab === 'values' && (
                <View style={styles.pillRow}>
                  <InterestPill label="Family-oriented" variant="gradient" />
                  <InterestPill label="Ambitious" variant="default" />
                  <InterestPill label="Loyal" variant="default" />
                </View>
              )}
            </View>

            {/* Action Buttons */}
            <View style={styles.cardActions}>
              <TouchableOpacity style={styles.actionBtnPass} accessibilityRole="button" accessibilityLabel="Pass">
                <Ionicons name="close" size={28} color={COLORS.danger} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionBtnRewind} accessibilityRole="button" accessibilityLabel="Rewind">
                <Ionicons name="arrow-undo" size={22} color={COLORS.accent} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionBtnSuperLike} accessibilityRole="button" accessibilityLabel="Super like">
                <Ionicons name="star" size={24} color={COLORS.info} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionBtnLike} accessibilityRole="button" accessibilityLabel="Like">
                <Ionicons name="heart" size={28} color={COLORS.textInverse} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionBtnBoost} accessibilityRole="button" accessibilityLabel="Boost profile">
                <Ionicons name="flash" size={22} color={COLORS.premium} />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity style={styles.quickAction} accessibilityRole="button" accessibilityLabel="See who liked you">
            <View style={styles.quickActionIconWrap}>
              <Ionicons name="heart" size={20} color={COLORS.primary} />
            </View>
            <Text style={styles.quickActionLabel}>Who Likes You</Text>
            <Text style={styles.quickActionCount}>12 new</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickAction} accessibilityRole="button" accessibilityLabel="See profile visitors">
            <View style={[styles.quickActionIconWrap, { backgroundColor: COLORS.info + '15' }]}>
              <Ionicons name="eye" size={20} color={COLORS.info} />
            </View>
            <Text style={styles.quickActionLabel}>Profile Views</Text>
            <Text style={styles.quickActionCount}>23 total</Text>
          </TouchableOpacity>
        </View>
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
  filterBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: COLORS.surface, alignItems: 'center', justifyContent: 'center', ...SHADOWS.sm },
  categoriesScroll: { marginTop: SPACING.sm },
  categoriesContent: { paddingHorizontal: SPACING.lg, gap: SPACING.sm },
  categoryPill: {
    flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 18, paddingVertical: 12,
    borderRadius: BORDER_RADIUS.full, backgroundColor: COLORS.surface, ...SHADOWS.sm,
  },
  categoryPillActive: { backgroundColor: COLORS.primary },
  categoryText: { fontSize: FONT_SIZES.sm, fontFamily: FONTS.semiBold, color: COLORS.textMuted },
  categoryTextActive: { color: COLORS.textInverse },
  content: { flex: 1 },
  contentContainer: { paddingHorizontal: SPACING.lg, paddingTop: SPACING.md, paddingBottom: SPACING.xxl },
  cardStack: { position: 'relative', marginBottom: SPACING.xl },
  discoveryCardBg: {
    position: 'absolute', top: 6, left: 4, right: 4, height: CARD_HEIGHT,
    backgroundColor: COLORS.surface, borderRadius: BORDER_RADIUS.xl,
    opacity: 0.3,
  },
  discoveryCardBg2: {
    position: 'absolute', top: 3, left: 2, right: 2, height: CARD_HEIGHT,
    backgroundColor: COLORS.surface, borderRadius: BORDER_RADIUS.xl,
    opacity: 0.6,
  },
  discoveryCard: {
    backgroundColor: COLORS.surface, borderRadius: BORDER_RADIUS.xl, overflow: 'hidden',
    ...SHADOWS.lg,
  },
  cardImage: {
    width: '100%', height: CARD_HEIGHT * 0.6,
    alignItems: 'center', justifyContent: 'center',
  },
  cardInitials: { fontSize: 96, fontFamily: FONTS.extraBold, color: 'rgba(255,255,255,0.8)', letterSpacing: -3 },
  cardTopBadges: { position: 'absolute', top: 14, left: 14, flexDirection: 'row', gap: 8 },
  topBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: 'rgba(0,0,0,0.4)',
    paddingHorizontal: 10, paddingVertical: 5, borderRadius: BORDER_RADIUS.full,
  },
  topBadgeText: { fontSize: 12, fontFamily: FONTS.semiBold, color: COLORS.textInverse },
  cardDistanceBadge: {
    position: 'absolute', bottom: 14, right: 14,
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: 'rgba(0,0,0,0.4)',
    paddingHorizontal: 10, paddingVertical: 5, borderRadius: BORDER_RADIUS.full,
  },
  cardDistanceText: { fontSize: 12, fontFamily: FONTS.semiBold, color: COLORS.textInverse },
  cardOverlay: {
    position: 'absolute', top: CARD_HEIGHT * 0.35, left: 0, right: 0, height: CARD_HEIGHT * 0.25,
  },
  cardInfoOverlay: {
    position: 'absolute', top: CARD_HEIGHT * 0.42, left: 18, right: 18,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end',
  },
  cardNameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  cardName: { fontSize: FONT_SIZES.xxl, fontFamily: FONTS.extraBold, color: COLORS.textInverse, letterSpacing: -0.8 },
  cardLocationRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  cardLocation: { fontSize: FONT_SIZES.sm, fontFamily: FONTS.medium, color: 'rgba(255,255,255,0.8)' },
  compatibilityBadge: {
    backgroundColor: 'rgba(0,0,0,0.4)',
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
  },
  compatibilityValue: { fontSize: FONT_SIZES.xl, fontFamily: FONTS.extraBold, color: COLORS.textInverse, letterSpacing: -0.5 },
  compatibilityLabel: { fontSize: 11, fontFamily: FONTS.medium, color: 'rgba(255,255,255,0.7)', letterSpacing: 0.5, textTransform: 'uppercase' },
  cardBody: { padding: SPACING.lg },
  cardTabs: { flexDirection: 'row', gap: SPACING.md, marginBottom: SPACING.md },
  cardTab: { paddingVertical: 6 },
  cardTabActive: { borderBottomWidth: 2, borderBottomColor: COLORS.primary },
  cardTabText: { fontSize: FONT_SIZES.sm, fontFamily: FONTS.semiBold, color: COLORS.textMuted, textTransform: 'capitalize' },
  cardTabTextActive: { color: COLORS.primary },
  cardBio: { fontSize: FONT_SIZES.md, fontFamily: FONTS.regular, color: COLORS.textSecondary, lineHeight: 24 },
  pillRow: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm },
  cardActions: {
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: SPACING.md,
    paddingVertical: SPACING.lg, paddingHorizontal: SPACING.lg,
    borderTopWidth: 1, borderTopColor: COLORS.borderLight,
  },
  actionBtnPass: {
    width: 56, height: 56, borderRadius: 28, backgroundColor: COLORS.surface,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: COLORS.danger + '30',
  },
  actionBtnRewind: {
    width: 44, height: 44, borderRadius: 22, backgroundColor: COLORS.surface,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1.5, borderColor: COLORS.accent + '30',
  },
  actionBtnSuperLike: {
    width: 44, height: 44, borderRadius: 22, backgroundColor: COLORS.surface,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1.5, borderColor: COLORS.info + '30',
  },
  actionBtnLike: {
    width: 64, height: 64, borderRadius: 32, backgroundColor: COLORS.primary,
    alignItems: 'center', justifyContent: 'center',
    ...SHADOWS.glow,
  },
  actionBtnBoost: {
    width: 44, height: 44, borderRadius: 22, backgroundColor: COLORS.surface,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1.5, borderColor: COLORS.premium + '30',
  },
  quickActions: { flexDirection: 'row', gap: SPACING.md },
  quickAction: {
    flex: 1, backgroundColor: COLORS.surface, borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg, alignItems: 'center', ...SHADOWS.md,
  },
  quickActionIconWrap: {
    width: 44, height: 44, borderRadius: 14,
    backgroundColor: COLORS.primaryGlow,
    alignItems: 'center', justifyContent: 'center', marginBottom: SPACING.sm,
  },
  quickActionLabel: { fontSize: FONT_SIZES.sm, fontFamily: FONTS.bold, color: COLORS.text, marginBottom: 2 },
  quickActionCount: { fontSize: FONT_SIZES.xs, fontFamily: FONTS.medium, color: COLORS.primary },
});
