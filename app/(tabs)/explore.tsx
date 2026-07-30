import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, Animated, PanResponder, ActivityIndicator, Modal, TextInput, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useTranslation } from '@/hooks';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS, SHADOWS, FONTS, GRADIENTS } from '@/constants';
import { Badge, Avatar, Button, ActiveNowBadge, InterestPill, EmptyState } from '@/components/ui';
import { Logo } from '@/components/Logo';
import { useMatchingStore } from '@/stores';

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

const AVATAR_GRADIENTS: readonly (readonly [string, string])[] = [
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
  const { potentialMatches, isLoading, fetchPotentialMatches, likeUser, passUser, superLikeUser } = useMatchingStore();
  const [activeCategory, setActiveCategory] = useState('nearby');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [activeProfileTab, setActiveProfileTab] = useState<'about' | 'interests' | 'values'>('about');
  const [swipedDirection, setSwipedDirection] = useState<'left' | 'right' | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  // New Modals State
  const [showMatchModal, setShowMatchModal] = useState(false);
  const [matchedProfile, setMatchedProfile] = useState<any>(null);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [minAge, setMinAge] = useState('18');
  const [maxAge, setMaxAge] = useState('35');
  const [maxDistance, setMaxDistance] = useState('50');
  const [verifiedOnlyFilter, setVerifiedOnlyFilter] = useState(false);

  // Enhanced Filter State
  const [filterGender, setFilterGender] = useState<string>('all');
  const [filterInterests, setFilterInterests] = useState<string[]>([]);
  const [filterCommunity, setFilterCommunity] = useState<string>('');

  // Match Modal Animation
  const matchScale = useRef(new Animated.Value(0)).current;
  const matchHeartPulse = useRef(new Animated.Value(1)).current;
  const matchParticles = useRef(new Animated.Value(0)).current;
  const matchFadeIn = useRef(new Animated.Value(0)).current;

  const particles = useMemo(() => {
    return Array.from({ length: 20 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 1500,
      size: 8 + Math.random() * 16,
      color: ['#FF4D6D', '#E8A820', '#5B4BD5', '#00B894', '#FF6B6B', '#A29BFE', '#FD79A8', '#74B9FF'][i % 8],
      icon: ['heart', 'star', 'sparkles', 'diamond'][i % 4],
    }));
  }, []);

  useEffect(() => {
    if (showMatchModal) {
      matchScale.setValue(0);
      matchHeartPulse.setValue(1);
      matchParticles.setValue(0);
      matchFadeIn.setValue(0);

      Animated.sequence([
        Animated.spring(matchScale, {
          toValue: 1, friction: 5, tension: 40, useNativeDriver: true,
        }),
        Animated.parallel([
          Animated.loop(
            Animated.sequence([
              Animated.timing(matchHeartPulse, {
                toValue: 1.2, duration: 600, useNativeDriver: true,
              }),
              Animated.timing(matchHeartPulse, {
                toValue: 1, duration: 600, useNativeDriver: true,
              }),
            ]),
            { iterations: -1 }
          ),
          Animated.timing(matchParticles, {
            toValue: 1, duration: 3000, useNativeDriver: true,
          }),
          Animated.timing(matchFadeIn, {
            toValue: 1, duration: 800, delay: 300, useNativeDriver: true,
          }),
        ]),
      ]).start();
    }
  }, [showMatchModal]);

  const position = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
  const scaleNext = useRef(new Animated.Value(0.95)).current;
  const scaleNext2 = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    fetchPotentialMatches();
  }, []);

  const profiles = potentialMatches.length > 0 ? potentialMatches : [];
  const currentProfile = profiles[currentIndex % profiles.length];
  const nextProfile = profiles[(currentIndex + 1) % profiles.length];
  const next2Profile = profiles[(currentIndex + 2) % profiles.length];
  const gradient = AVATAR_GRADIENTS[currentIndex % AVATAR_GRADIENTS.length];
  const nextGradient = AVATAR_GRADIENTS[(currentIndex + 1) % AVATAR_GRADIENTS.length];
  const next2Gradient = AVATAR_GRADIENTS[(currentIndex + 2) % AVATAR_GRADIENTS.length];

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

  const handlePass = useCallback(() => {
    if (profiles[currentIndex]) passUser(profiles[currentIndex].id);
    animateSwipe('left');
  }, [animateSwipe, profiles, currentIndex, passUser]);

  const handleLike = useCallback(() => {
    if (profiles[currentIndex]) {
      likeUser(profiles[currentIndex].id);
      setMatchedProfile(profiles[currentIndex]);
      setShowMatchModal(true);
    }
    animateSwipe('right');
  }, [animateSwipe, profiles, currentIndex, likeUser]);

  const handleSuperLike = useCallback(() => {
    if (profiles[currentIndex]) {
      superLikeUser(profiles[currentIndex].id);
      setMatchedProfile(profiles[currentIndex]);
      setShowMatchModal(true);
    }
    animateSwipe('right');
  }, [animateSwipe, profiles, currentIndex, superLikeUser]);

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
        <TouchableOpacity style={styles.filterBtn} onPress={() => setShowFilterModal(true)} accessibilityRole="button" accessibilityLabel={t('filter_profiles')}>
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
        {isLoading ? (
          <View style={styles.loadingWrap}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.loadingText}>{t('loading')}</Text>
          </View>
        ) : profiles.length === 0 ? (
          <EmptyState icon="people-outline" title={t('no_matches')} message="Check back later for new profiles" />
        ) : (
        <>
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
                <Text style={styles.cardDistanceText}>{typeof currentProfile.location === 'string' ? currentProfile.location : ''}</Text>
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
                  <Text style={styles.cardLocation}>{typeof currentProfile.location === 'string' ? currentProfile.location : `${currentProfile.location.latitude.toFixed(2)}, ${currentProfile.location.longitude.toFixed(2)}`}</Text>
                </View>
              </View>
              <View style={styles.compatibilityBadge}>
                <Text style={styles.compatibilityValue}>{currentProfile._compatibilityScore ?? 0}%</Text>
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
        </>
        )}
      </View>

      {/* ENHANCED MATCH CELEBRATION MODAL */}
      <Modal visible={showMatchModal} transparent animationType="fade">
        <View style={styles.modalOverlayDark}>
          <Animated.View style={[styles.matchParticlesContainer, { opacity: matchParticles }]}>
            {particles.map((p) => (
              <Animated.View
                key={p.id}
                style={[
                  styles.matchParticle,
                  {
                    left: `${p.left}%`,
                    top: -20,
                    opacity: matchParticles.interpolate({
                      inputRange: [0, 0.3, 1],
                      outputRange: [0, 1, 0],
                    }),
                    transform: [{
                      translateY: matchParticles.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, 600 + Math.random() * 200],
                      }),
                    }, {
                      translateX: matchParticles.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, (Math.random() - 0.5) * 100],
                      }),
                    }, {
                      rotate: matchParticles.interpolate({
                        inputRange: [0, 1],
                        outputRange: ['0deg', `${Math.random() * 720}deg`],
                      }),
                    }],
                  },
                ]}
              >
                <Ionicons name={p.icon as any} size={p.size} color={p.color} />
              </Animated.View>
            ))}
          </Animated.View>

          <Animated.View style={{ transform: [{ scale: matchScale }] }}>
            <LinearGradient
              colors={['#1E0F33', '#3B154C', '#120824']}
              style={styles.matchModalContainer}
            >
              <TouchableOpacity style={styles.modalCloseBtn} onPress={() => setShowMatchModal(false)}>
                <Ionicons name="close" size={26} color="#FFFFFF" />
              </TouchableOpacity>

              <Animated.View style={[styles.matchHeaderBox, { opacity: matchFadeIn }]}>
                <View style={styles.matchSparkleRow}>
                  <Ionicons name="sparkles" size={20} color={COLORS.accent} />
                  <Ionicons name="heart" size={36} color="#FF4D6D" />
                  <Ionicons name="sparkles" size={20} color={COLORS.accent} />
                </View>
                <Animated.View style={{ transform: [{ scale: matchHeartPulse }] }}>
                  <Text style={styles.matchTitleText}>It's a Match!</Text>
                </Animated.View>
                <Text style={styles.matchSubtitleText}>
                  You and {matchedProfile?.name || 'your match'} like each other!
                </Text>
              </Animated.View>

              <Animated.View style={[styles.matchAvatarsRow, { opacity: matchFadeIn }]}>
                <View style={styles.matchAvatarOuter}>
                  <LinearGradient colors={GRADIENTS.primary} style={styles.matchAvatarCircle}>
                    <Ionicons name="person" size={32} color="#FFFFFF" />
                  </LinearGradient>
                  <Text style={styles.matchAvatarLabel}>You</Text>
                </View>
                <Animated.View style={{ transform: [{ scale: matchHeartPulse }] }}>
                  <View style={styles.matchHeartIcon}>
                    <Ionicons name="heart" size={32} color="#FF4D6D" />
                  </View>
                </Animated.View>
                <View style={styles.matchAvatarOuter}>
                  <LinearGradient colors={GRADIENTS.cool} style={styles.matchAvatarCircle}>
                    <Text style={styles.matchAvatarText}>
                      {(matchedProfile?.name || 'M').charAt(0)}
                    </Text>
                  </LinearGradient>
                  <Text style={styles.matchAvatarLabel}>{matchedProfile?.name || 'Match'}</Text>
                </View>
              </Animated.View>

              <Animated.View style={[styles.matchCompatBadge, { opacity: matchFadeIn }]}>
                <Ionicons name="flash" size={16} color={COLORS.accent} />
                <Text style={styles.matchCompatBadgeText}>
                  {matchedProfile?.compatibilityScore || matchedProfile?.compatibility || 92}% Compatibility
                </Text>
              </Animated.View>

              <Animated.View style={[styles.matchCompatDetails, { opacity: matchFadeIn }]}>
                <View style={styles.matchCompatDetailItem}>
                  <Ionicons name="people" size={16} color="#A29BFE" />
                  <Text style={styles.matchCompatDetailText}>Cultural Match</Text>
                </View>
                <View style={styles.matchCompatDetailItem}>
                  <Ionicons name="heart-circle" size={16} color="#FF4D6D" />
                  <Text style={styles.matchCompatDetailText}>Interests Aligned</Text>
                </View>
                <View style={styles.matchCompatDetailItem}>
                  <Ionicons name="shield-checkmark" size={16} color="#00B894" />
                  <Text style={styles.matchCompatDetailText}>Values Match</Text>
                </View>
              </Animated.View>

              <Animated.View style={[styles.matchBtnCol, { opacity: matchFadeIn }]}>
                <Button
                  title="Send Message"
                  variant="gradient"
                  size="lg"
                  icon="chatbubbles"
                  fullWidth
                  onPress={() => {
                    setShowMatchModal(false);
                    router.push(`/chat/${matchedProfile?.id || '1'}`);
                  }}
                />
                <TouchableOpacity style={styles.keepSwipingBtn} onPress={() => setShowMatchModal(false)}>
                  <Text style={styles.keepSwipingText}>Keep Swiping</Text>
                </TouchableOpacity>
              </Animated.View>
            </LinearGradient>
          </Animated.View>
        </View>
      </Modal>

      {/* ENHANCED FILTER MODAL */}
      <Modal visible={showFilterModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.filterCard}>
            <View style={styles.filterHeader}>
              <Text style={styles.filterTitle}>Filter Matches</Text>
              <TouchableOpacity onPress={() => setShowFilterModal(false)}>
                <Ionicons name="close" size={24} color={COLORS.text} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: height * 0.65 }}>
              <View style={styles.filterField}>
                <Text style={styles.filterLabel}>Age Range</Text>
                <View style={styles.filterRow}>
                  <TextInput
                    style={styles.filterInput}
                    value={minAge}
                    onChangeText={setMinAge}
                    keyboardType="number-pad"
                    placeholder="Min"
                  />
                  <Text style={{ color: COLORS.textMuted }}>to</Text>
                  <TextInput
                    style={styles.filterInput}
                    value={maxAge}
                    onChangeText={setMaxAge}
                    keyboardType="number-pad"
                    placeholder="Max"
                  />
                </View>
              </View>

              <View style={styles.filterField}>
                <Text style={styles.filterLabel}>Maximum Distance (km)</Text>
                <TextInput
                  style={styles.filterInputFull}
                  value={maxDistance}
                  onChangeText={setMaxDistance}
                  keyboardType="number-pad"
                  placeholder="50"
                />
              </View>

              <View style={styles.filterField}>
                <Text style={styles.filterLabel}>Gender</Text>
                <View style={styles.filterGenderRow}>
                  {[
                    { key: 'all', icon: 'people', label: 'Everyone' },
                    { key: 'male', icon: 'man', label: 'Men' },
                    { key: 'female', icon: 'woman', label: 'Women' },
                  ].map((g) => (
                    <TouchableOpacity
                      key={g.key}
                      style={[styles.filterGenderBtn, filterGender === g.key && styles.filterGenderBtnActive]}
                      onPress={() => setFilterGender(g.key)}
                    >
                      <Ionicons name={g.icon as any} size={18} color={filterGender === g.key ? COLORS.textInverse : COLORS.textMuted} />
                      <Text style={[styles.filterGenderText, filterGender === g.key && styles.filterGenderTextActive]}>{g.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <TouchableOpacity
                style={styles.filterToggleRow}
                onPress={() => setVerifiedOnlyFilter(!verifiedOnlyFilter)}
              >
                <View style={[styles.filterCheckbox, verifiedOnlyFilter && styles.filterCheckboxActive]}>
                  {verifiedOnlyFilter && <Ionicons name="checkmark" size={16} color={COLORS.textInverse} />}
                </View>
                <Text style={styles.filterToggleText}>Verified Profiles Only</Text>
              </TouchableOpacity>

              <View style={styles.filterField}>
                <Text style={styles.filterLabel}>Community</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View style={styles.filterChipRow}>
                    <TouchableOpacity
                      style={[styles.filterChip, filterCommunity === '' && styles.filterChipActive]}
                      onPress={() => setFilterCommunity('')}
                    >
                      <Text style={[styles.filterChipText, filterCommunity === '' && styles.filterChipTextActive]}>All</Text>
                    </TouchableOpacity>
                    {['Yoruba', 'Igbo', 'Hausa', 'Swahili', 'Zulu', 'Amhara'].map((c) => (
                      <TouchableOpacity
                        key={c}
                        style={[styles.filterChip, filterCommunity === c && styles.filterChipActive]}
                        onPress={() => setFilterCommunity(c)}
                      >
                        <Text style={[styles.filterChipText, filterCommunity === c && styles.filterChipTextActive]}>{c}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </ScrollView>
              </View>

              <View style={styles.filterField}>
                <Text style={styles.filterLabel}>Interests</Text>
                <View style={styles.filterChipRow}>
                  {['Technology', 'Music', 'Travel', 'Cooking', 'Fitness', 'Art', 'Fashion', 'Reading'].map((interest) => (
                    <TouchableOpacity
                      key={interest}
                      style={[styles.filterChip, filterInterests.includes(interest) && styles.filterChipActive]}
                      onPress={() => {
                        setFilterInterests((prev) =>
                          prev.includes(interest) ? prev.filter((i) => i !== interest) : [...prev, interest]
                        );
                      }}
                    >
                      <Text style={[styles.filterChipText, filterInterests.includes(interest) && styles.filterChipTextActive]}>{interest}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </ScrollView>

            <View style={styles.filterActions}>
              <TouchableOpacity
                style={styles.filterResetBtn}
                onPress={() => {
                  setMinAge('18'); setMaxAge('35'); setMaxDistance('50');
                  setVerifiedOnlyFilter(false); setFilterGender('all');
                  setFilterInterests([]); setFilterCommunity('');
                }}
              >
                <Text style={styles.filterResetText}>Reset</Text>
              </TouchableOpacity>
              <View style={{ flex: 1 }}>
                <Button
                  title="Apply Filters"
                  variant="gradient"
                  size="md"
                  fullWidth
                  onPress={() => setShowFilterModal(false)}
                />
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  loadingWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: SPACING.md },
  loadingText: { fontSize: FONT_SIZES.md, fontFamily: FONTS.medium, color: COLORS.textMuted },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: SPACING.lg, paddingTop: 56, paddingBottom: SPACING.md,
  },
  headerCenter: { flex: 1, alignItems: 'center' },
  headerTitle: { fontSize: FONT_SIZES.xl, fontFamily: FONTS.extraBold, color: COLORS.text, letterSpacing: -0.6 },
  filterBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: COLORS.surface, alignItems: 'center', justifyContent: 'center', ...SHADOWS.sm },
  categoriesScroll: { marginTop: SPACING.sm, maxHeight: 48 },
  categoriesContent: { paddingHorizontal: SPACING.lg, gap: SPACING.sm, alignItems: 'center' },
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
  modalOverlayDark: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', alignItems: 'center', padding: SPACING.lg,
  },
  matchModalContainer: {
    width: '100%', maxWidth: 400, borderRadius: BORDER_RADIUS.xl, padding: SPACING.xl, alignItems: 'center',
  },
  modalCloseBtn: { alignSelf: 'flex-end', padding: 4 },
  matchHeaderBox: { alignItems: 'center', marginTop: 12, marginBottom: SPACING.lg },
  matchTitleText: { fontSize: 32, fontFamily: FONTS.extraBold, color: '#FFFFFF', letterSpacing: -1, marginBottom: 8 },
  matchSubtitleText: { fontSize: FONT_SIZES.md, fontFamily: FONTS.medium, color: 'rgba(255,255,255,0.8)', textAlign: 'center' },
  matchAvatarsRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md, marginVertical: SPACING.xl },
  matchAvatarCircle: { width: 80, height: 80, borderRadius: 40, alignItems: 'center', justifyContent: 'center' },
  matchAvatarText: { fontSize: 22, fontFamily: FONTS.bold, color: '#FFFFFF' },
  matchHeartIcon: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' },
  matchCompatBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(255,255,255,0.15)', paddingHorizontal: 16, paddingVertical: 8, borderRadius: BORDER_RADIUS.full, marginBottom: SPACING.xl },
  matchCompatBadgeText: { fontSize: FONT_SIZES.sm, fontFamily: FONTS.bold, color: COLORS.accent },
  matchBtnCol: { width: '100%', gap: SPACING.md },
  keepSwipingBtn: { paddingVertical: 14, alignItems: 'center' },
  keepSwipingText: { fontSize: FONT_SIZES.md, fontFamily: FONTS.semiBold, color: 'rgba(255,255,255,0.7)' },
  matchSparkleRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  matchParticlesContainer: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, overflow: 'hidden' },
  matchParticle: { position: 'absolute' },
  matchAvatarOuter: { alignItems: 'center', gap: 6 },
  matchAvatarLabel: { fontSize: 12, fontFamily: FONTS.semiBold, color: 'rgba(255,255,255,0.7)' },
  matchCompatDetails: { flexDirection: 'row', gap: 12, marginBottom: SPACING.xl },
  matchCompatDetailItem: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(255,255,255,0.08)', paddingHorizontal: 10, paddingVertical: 6, borderRadius: BORDER_RADIUS.full },
  matchCompatDetailText: { fontSize: 11, fontFamily: FONTS.medium, color: 'rgba(255,255,255,0.7)' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: SPACING.lg },
  filterCard: { width: '100%', maxWidth: 420, backgroundColor: COLORS.surface, borderRadius: BORDER_RADIUS.xl, padding: SPACING.xl, ...SHADOWS.lg },
  filterHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.lg },
  filterTitle: { fontSize: FONT_SIZES.xl, fontFamily: FONTS.bold, color: COLORS.text },
  filterField: { marginBottom: SPACING.lg },
  filterLabel: { fontSize: FONT_SIZES.sm, fontFamily: FONTS.semiBold, color: COLORS.text, marginBottom: 8 },
  filterRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md },
  filterInput: { flex: 1, borderWidth: 1, borderColor: COLORS.border, borderRadius: BORDER_RADIUS.md, paddingHorizontal: 12, paddingVertical: 10, fontSize: FONT_SIZES.md, color: COLORS.text },
  filterInputFull: { borderWidth: 1, borderColor: COLORS.border, borderRadius: BORDER_RADIUS.md, paddingHorizontal: 12, paddingVertical: 10, fontSize: FONT_SIZES.md, color: COLORS.text },
  filterGenderRow: { flexDirection: 'row', gap: SPACING.sm },
  filterGenderBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    paddingVertical: 12, borderRadius: BORDER_RADIUS.md, borderWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.surface,
  },
  filterGenderBtnActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  filterGenderText: { fontSize: FONT_SIZES.sm, fontFamily: FONTS.semiBold, color: COLORS.textMuted },
  filterGenderTextActive: { color: COLORS.textInverse },
  filterCheckbox: {
    width: 24, height: 24, borderRadius: 6, borderWidth: 2, borderColor: COLORS.border,
    alignItems: 'center', justifyContent: 'center',
  },
  filterCheckboxActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  filterToggleRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: SPACING.lg },
  filterToggleText: { fontSize: FONT_SIZES.md, fontFamily: FONTS.medium, color: COLORS.text },
  filterChipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm },
  filterChip: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: BORDER_RADIUS.full,
    borderWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.surface,
  },
  filterChipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  filterChipText: { fontSize: FONT_SIZES.xs, fontFamily: FONTS.semiBold, color: COLORS.textMuted },
  filterChipTextActive: { color: COLORS.textInverse },
  filterActions: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md, marginTop: SPACING.md },
  filterResetBtn: { paddingHorizontal: SPACING.md, paddingVertical: 12 },
  filterResetText: { fontSize: FONT_SIZES.sm, fontFamily: FONTS.semiBold, color: COLORS.textMuted },
});
