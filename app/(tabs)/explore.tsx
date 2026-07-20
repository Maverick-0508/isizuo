import React, { useState, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, Animated, PanResponder } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from '@/hooks';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS, SHADOWS, FONTS, GRADIENTS } from '@/constants';
import { Badge, Avatar, Button, ActiveNowBadge, InterestPill } from '@/components/ui';
import { Logo } from '@/components/Logo';

const { width, height } = Dimensions.get('window');
const CARD_WIDTH = width - SPACING.lg * 2;
const CARD_HEIGHT = Math.min(height * 0.58, 440);
const SWIPE_THRESHOLD = width * 0.25;
const SWIPE_OUT_DURATION = 250;

const CATEGORIES = [
  { key: 'nearby', labelKey: 'nearby' as const, icon: 'location' },
  { key: 'online', labelKey: 'online' as const, icon: 'radio' },
  { key: 'new', labelKey: 'new' as const, icon: 'sparkles' },
  { key: 'verified', labelKey: 'verified' as const, icon: 'shield-checkmark' },
  { key: 'premium', labelKey: 'premium_badge' as const, icon: 'diamond' },
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
  const [swipedDirection, setSwipedDirection] = useState<'left' | 'right' | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  const position = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
  const scaleNext = useRef(new Animated.Value(0.95)).current;
  const scaleNext2 = useRef(new Animated.Value(0.9)).current;

  const currentProfile = SAMPLE_PROFILES[currentIndex % SAMPLE_PROFILES.length];
  const nextProfile = SAMPLE_PROFILES[(currentIndex + 1) % SAMPLE_PROFILES.length];
  const next2Profile = SAMPLE_PROFILES[(currentIndex + 2) % SAMPLE_PROFILES.length];
  const gradient = AVATAR_GRADIENTS[currentIndex % AVATAR_GRADIENTS.length] as readonly string[];
  const nextGradient = AVATAR_GRADIENTS[(currentIndex + 1) % AVATAR_GRADIENTS.length] as readonly string[];
  const next2Gradient = AVATAR_GRADIENTS[(currentIndex + 2) % AVATAR_GRADIENTS.length] as readonly string[];

  const resetCard = useCallback(() => {
    position.setValue({ x: 0, y: 0 });
    scaleNext.setValue(0.95);
    scaleNext2.setValue(0.9);
    setSwipedDirection(null);
  }, [position, scaleNext, scaleNext2]);

  const animateSwipe = useCallback((direction: 'left' | 'right') => {
    if (isAnimating) return;
    setIsAnimating(true);
    setSwipedDirection(direction);

    const x = direction === 'right' ? width + 100 : -width - 100;

    Animated.parallel([
      Animated.timing(position, {
        toValue: { x, y: 0 },
        duration: SWIPE_OUT_DURATION,
        useNativeDriver: false,
      }),
      Animated.spring(scaleNext, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: false,
      }),
      Animated.spring(scaleNext2, {
        toValue: 0.95,
        friction: 8,
        tension: 40,
        useNativeDriver: false,
      }),
    ]).start(() => {
      setCurrentIndex((prev) => prev + 1);
      resetCard();
      setIsAnimating(false);
    });
  }, [isAnimating, position, scaleNext, scaleNext2, resetCard]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => !isAnimating,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dx) > 5 || Math.abs(gestureState.dy) > 5;
      },
      onPanResponderMove: (_, gestureState) => {
        position.setValue({ x: gestureState.dx, y: gestureState.dy * 0.3 });

        const rotation = gestureState.dx * 0.08;
        const absDx = Math.abs(gestureState.dx);
        const progress = Math.min(absDx / SWIPE_THRESHOLD, 1);

        scaleNext.setValue(0.95 + progress * 0.05);
        scaleNext2.setValue(0.9 + progress * 0.05);
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dx > SWIPE_THRESHOLD) {
          animateSwipe('right');
        } else if (gestureState.dx < -SWIPE_THRESHOLD) {
          animateSwipe('left');
        } else {
          Animated.parallel([
            Animated.spring(position, {
              toValue: { x: 0, y: 0 },
              friction: 5,
              tension: 40,
              useNativeDriver: false,
            }),
            Animated.spring(scaleNext, {
              toValue: 0.95,
              friction: 5,
              tension: 40,
              useNativeDriver: false,
            }),
            Animated.spring(scaleNext2, {
              toValue: 0.9,
              friction: 5,
              tension: 40,
              useNativeDriver: false,
            }),
          ]).start();
        }
      },
    })
  ).current;

  const handlePass = useCallback(() => animateSwipe('left'), [animateSwipe]);
  const handleLike = useCallback(() => animateSwipe('right'), [animateSwipe]);
  const handleSuperLike = useCallback(() => animateSwipe('right'), [animateSwipe]);
  const handleBoost = useCallback(() => animateSwipe('right'), [animateSwipe]);

  const cardOpacity = position.x.interpolate({
    inputRange: [-width, 0, width],
    outputRange: [0.5, 1, 0.5],
    extrapolate: 'clamp',
  });

  const likeOpacity = position.x.interpolate({
    inputRange: [0, SWIPE_THRESHOLD],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const passOpacity = position.x.interpolate({
    inputRange: [-SWIPE_THRESHOLD, 0],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  const rotate = position.x.interpolate({
    inputRange: [-width / 2, 0, width / 2],
    outputRange: ['-8deg', '0deg', '8deg'],
    extrapolate: 'clamp',
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Logo size="sm" showText={false} />
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle} accessibilityRole="header">{t('explore')}</Text>
        </View>
        <TouchableOpacity style={styles.filterBtn} accessibilityRole="button" accessibilityLabel={t('filter_profiles')}>
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
            accessibilityLabel={t(cat.labelKey)}
            accessibilityState={{ selected: activeCategory === cat.key }}
          >
            <Ionicons name={cat.icon as any} size={16} color={activeCategory === cat.key ? COLORS.textInverse : COLORS.textMuted} />
            <Text style={[styles.categoryText, activeCategory === cat.key && styles.categoryTextActive]}>{t(cat.labelKey)}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={styles.content}>
        {/* Card Stack */}
        <View style={styles.cardStack} {...panResponder.panHandlers}>
          {/* Background card 2 (furthest peek) */}
          <Animated.View style={[styles.discoveryCard, styles.discoveryCardBg2, { transform: [{ scale: scaleNext2 }] }]} />

          {/* Background card 1 (closest peek) */}
          <Animated.View style={[styles.discoveryCard, styles.discoveryCardBg, { transform: [{ scale: scaleNext }] }]} />

          {/* Main card - animated */}
          <Animated.View style={[
            styles.discoveryCard,
            styles.discoveryCardMain,
            {
              transform: [
                { translateX: position.x },
                { translateY: position.y },
                { rotate },
              ],
              opacity: cardOpacity,
            },
          ]}>
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
                    <Text style={styles.topBadgeText}>{t('verified')}</Text>
                  </View>
                )}
                {currentProfile.isPremium && (
                  <View style={[styles.topBadge, { backgroundColor: 'rgba(232, 168, 32, 0.85)' }]}>
                    <Ionicons name="diamond" size={14} color={COLORS.textInverse} />
                    <Text style={styles.topBadgeText}>{t('premium_badge')}</Text>
                  </View>
                )}
              </View>
              <View style={styles.cardDistanceBadge}>
                <Ionicons name="location" size={12} color={COLORS.textInverse} />
                <Text style={styles.cardDistanceText}>{currentProfile.distance}</Text>
              </View>

              {/* Like/Pass indicators */}
              <Animated.View style={[styles.likeIndicator, { opacity: likeOpacity }]}>
                <Text style={styles.likeIndicatorText}>LIKE</Text>
              </Animated.View>
              <Animated.View style={[styles.passIndicator, { opacity: passOpacity }]}>
                <Text style={styles.passIndicatorText}>PASS</Text>
              </Animated.View>
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
                <Text style={styles.compatibilityLabel}>{t('match')}</Text>
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
                    <Text style={[styles.cardTabText, activeProfileTab === tab && styles.cardTabTextActive]}>
                      {tab === 'about' ? t('about') : tab === 'interests' ? t('interests') : t('values')}
                    </Text>
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
                  <InterestPill label={t('family_values')} variant="gradient" />
                  <InterestPill label={t('traditional')} variant="default" />
                  <InterestPill label={t('balanced')} variant="default" />
                </View>
              )}
            </View>

            {/* Action Buttons */}
            <View style={styles.cardActions}>
              <TouchableOpacity style={styles.actionBtnPass} accessibilityRole="button" accessibilityLabel={t('pass')} onPress={handlePass}>
                <Ionicons name="close" size={28} color={COLORS.danger} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionBtnRewind} accessibilityRole="button" accessibilityLabel={t('rewind')}>
                <Ionicons name="arrow-undo" size={22} color={COLORS.accent} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionBtnSuperLike} accessibilityRole="button" accessibilityLabel={t('super_like_action')} onPress={handleSuperLike}>
                <Ionicons name="star" size={24} color={COLORS.info} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionBtnLike} accessibilityRole="button" accessibilityLabel={t('like')} onPress={handleLike}>
                <Ionicons name="heart" size={28} color={COLORS.textInverse} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionBtnBoost} accessibilityRole="button" accessibilityLabel={t('boost')} onPress={handleBoost}>
                <Ionicons name="flash" size={22} color={COLORS.premium} />
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>

        {/* Swipe Hints */}
        <View style={styles.swipeHints}>
          <View style={styles.swipeHint}>
            <Ionicons name="arrow-back" size={16} color={COLORS.danger} />
            <Text style={[styles.swipeHintText, { color: COLORS.danger }]}>{t('swipe_left_pass')}</Text>
          </View>
          <View style={styles.swipeHint}>
            <Text style={[styles.swipeHintText, { color: COLORS.success }]}>{t('swipe_right_like')}</Text>
            <Ionicons name="arrow-forward" size={16} color={COLORS.success} />
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity style={styles.quickAction} accessibilityRole="button" accessibilityLabel={t('who_likes_you')}>
            <View style={styles.quickActionIconWrap}>
              <Ionicons name="heart" size={20} color={COLORS.primary} />
            </View>
            <Text style={styles.quickActionLabel}>{t('who_likes_you')}</Text>
            <Text style={styles.quickActionCount}>12 {t('new_count')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickAction} accessibilityRole="button" accessibilityLabel={t('profile_view_count')}>
            <View style={[styles.quickActionIconWrap, { backgroundColor: COLORS.info + '15' }]}>
              <Ionicons name="eye" size={20} color={COLORS.info} />
            </View>
            <Text style={styles.quickActionLabel}>{t('profile_view_count')}</Text>
            <Text style={styles.quickActionCount}>23 {t('total_count')}</Text>
          </TouchableOpacity>
        </View>
      </View>
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
  cardStack: { position: 'relative', marginHorizontal: SPACING.lg, marginTop: SPACING.md, height: CARD_HEIGHT + 12, marginBottom: SPACING.md },
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
  },
  discoveryCardMain: {
    ...SHADOWS.lg,
    position: 'absolute', top: 0, left: 0, right: 0, height: CARD_HEIGHT,
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
  likeIndicator: {
    position: 'absolute', top: 40, left: 24,
    borderWidth: 3, borderColor: COLORS.success, borderRadius: 12,
    paddingHorizontal: 16, paddingVertical: 8, transform: [{ rotate: '-15deg' }],
  },
  likeIndicatorText: {
    fontSize: 28, fontFamily: FONTS.extraBold, color: COLORS.success, letterSpacing: 2,
  },
  passIndicator: {
    position: 'absolute', top: 40, right: 24,
    borderWidth: 3, borderColor: COLORS.danger, borderRadius: 12,
    paddingHorizontal: 16, paddingVertical: 8, transform: [{ rotate: '15deg' }],
  },
  passIndicatorText: {
    fontSize: 28, fontFamily: FONTS.extraBold, color: COLORS.danger, letterSpacing: 2,
  },
  swipeHints: {
    flexDirection: 'row', justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg, marginBottom: SPACING.md,
  },
  swipeHint: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
  },
  swipeHintText: {
    fontSize: FONT_SIZES.xs, fontFamily: FONTS.semiBold,
  },
  quickActions: { flexDirection: 'row', gap: SPACING.md, paddingHorizontal: SPACING.lg },
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
