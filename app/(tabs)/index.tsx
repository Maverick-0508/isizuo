import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { router } from 'expo-router';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS, SHADOWS } from '@/constants';
import { useMatchingStore, useAuthStore } from '@/stores';
import { useTranslation } from '@/hooks';
import { Card, Badge, Button, Avatar, EmptyState } from '@/components/ui';
import { sendMatchNotification } from '@/services/sms';

const { width } = Dimensions.get('window');

export default function MatchesScreen() {
  const { matches, fetchPotentialMatches, potentialMatches, currentMatchIndex, likeUser, passUser, superLikeUser } = useMatchingStore();
  const { user } = useAuthStore();
  const { t } = useTranslation();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchPotentialMatches();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchPotentialMatches();
    setRefreshing(false);
  };

  const currentProfile = potentialMatches[currentMatchIndex];

  const handleLike = async () => {
    if (!currentProfile) return;
    await likeUser(currentProfile.id);
    if (currentProfile.phone) {
      sendMatchNotification(currentProfile.phone, user?.name || 'Someone');
    }
  };

  const handlePass = () => {
    if (currentProfile) passUser(currentProfile.id);
  };

  const handleSuperLike = async () => {
    if (!currentProfile) return;
    await superLikeUser(currentProfile.id);
    if (currentProfile.phone) {
      sendMatchNotification(currentProfile.phone, user?.name || 'Someone');
    }
  };

  if (!currentProfile) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.logo}>❤️ {t('app_name')}</Text>
        </View>
        <EmptyState
          icon="💔"
          title={t('no_matches')}
          message="We're finding people who match your preferences. Check back soon!"
          actionLabel={t('retry')}
          onAction={fetchPotentialMatches}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.logo}>❤️ {t('app_name')}</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.headerButton} onPress={() => router.push('/ussd')}>
            <Text style={styles.headerButtonText}>📱</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton} onPress={() => router.push('/safety')}>
            <Text style={styles.headerButtonText}>🛡️</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <Card style={styles.profileCard}>
          <View style={styles.profileHeader}>
            <Avatar uri={currentProfile.photos?.[0]} size={80} isVerified={currentProfile.isVerified} />
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>
                {currentProfile.name}, {currentProfile.age}
              </Text>
              <Text style={styles.profileLocation}>
                {currentProfile.community || 'Nearby'}
              </Text>
              <View style={styles.badgeRow}>
                {currentProfile.isVerified && <Badge label="✓ Verified" variant="verified" size="sm" />}
                {currentProfile.lookingFor && (
                  <Badge label={t(`looking_${currentProfile.lookingFor}`)} variant="info" size="sm" />
                )}
              </View>
            </View>
          </View>

          {currentProfile.bio && (
            <Text style={styles.bio}>{currentProfile.bio}</Text>
          )}

          <View style={styles.compatibilitySection}>
            <Text style={styles.compatibilityTitle}>{t('compatibility')}</Text>
            <View style={styles.scoreRow}>
              <View style={styles.scoreItem}>
                <Text style={styles.scoreValue}>
                  {Math.floor(Math.random() * 30) + 70}%
                </Text>
                <Text style={styles.scoreLabel}>{t('compatibility')}</Text>
              </View>
              <View style={styles.scoreItem}>
                <Text style={styles.scoreValue}>
                  {Math.floor(Math.random() * 30) + 60}%
                </Text>
                <Text style={styles.scoreLabel}>{t('cultural_match')}</Text>
              </View>
              <View style={styles.scoreItem}>
                <Text style={styles.scoreValue}>
                  {Math.floor(Math.random() * 30) + 50}%
                </Text>
                <Text style={styles.scoreLabel}>{t('interests_match')}</Text>
              </View>
            </View>
          </View>

          {currentProfile.interests && currentProfile.interests.length > 0 && (
            <View style={styles.interestsSection}>
              <Text style={styles.sectionTitle}>Interests</Text>
              <View style={styles.chipContainer}>
                {currentProfile.interests.slice(0, 6).map((interest: string) => (
                  <View key={interest} style={styles.chip}>
                    <Text style={styles.chipText}>{interest}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {currentProfile.languages && currentProfile.languages.length > 0 && (
            <View style={styles.interestsSection}>
              <Text style={styles.sectionTitle}>Languages</Text>
              <View style={styles.chipContainer}>
                {currentProfile.languages.map((lang: string) => (
                  <View key={lang} style={styles.chip}>
                    <Text style={styles.chipText}>{lang.toUpperCase()}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </Card>

        <View style={styles.actionButtons}>
          <TouchableOpacity style={[styles.actionButton, styles.passButton]} onPress={handlePass}>
            <Text style={styles.passButtonText}>✕</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.actionButton, styles.superLikeButton]} onPress={handleSuperLike}>
            <Text style={styles.superLikeButtonText}>⭐</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.actionButton, styles.likeButton]} onPress={handleLike}>
            <Text style={styles.likeButtonText}>❤️</Text>
          </TouchableOpacity>
        </View>

        {matches.length > 0 && (
          <View style={styles.matchedSection}>
            <Text style={styles.sectionTitle}>Recent Matches</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {matches.slice(0, 10).map((match) => (
                <TouchableOpacity
                  key={match.id}
                  style={styles.matchedAvatar}
                  onPress={() => router.push(`/chat/${match.id}`)}
                >
                  <Avatar size={60} />
                  <Text style={styles.matchedName}>Match</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.xxl + SPACING.md,
    paddingBottom: SPACING.md,
    backgroundColor: COLORS.primary,
  },
  logo: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '800',
    color: COLORS.textInverse,
  },
  headerActions: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerButtonText: {
    fontSize: 18,
  },
  scrollContent: {
    padding: SPACING.lg,
    paddingBottom: 100,
  },
  profileCard: {
    marginBottom: SPACING.lg,
  },
  profileHeader: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: SPACING.md,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: '700',
    color: COLORS.text,
  },
  profileLocation: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textLight,
    marginBottom: SPACING.xs,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: SPACING.xs,
  },
  bio: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    lineHeight: 22,
    marginBottom: SPACING.md,
  },
  compatibilitySection: {
    marginBottom: SPACING.md,
  },
  compatibilityTitle: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  scoreRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  scoreItem: {
    alignItems: 'center',
  },
  scoreValue: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
    color: COLORS.primary,
  },
  scoreLabel: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textLight,
  },
  interestsSection: {
    marginTop: SPACING.md,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
  },
  chip: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.surface,
  },
  chipText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.text,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: SPACING.lg,
    marginBottom: SPACING.xl,
  },
  actionButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.md,
  },
  passButton: {
    backgroundColor: COLORS.surface,
    borderWidth: 2,
    borderColor: COLORS.border,
  },
  passButtonText: {
    fontSize: 24,
    color: COLORS.textLight,
  },
  superLikeButton: {
    backgroundColor: COLORS.accent,
  },
  superLikeButtonText: {
    fontSize: 24,
  },
  likeButton: {
    backgroundColor: COLORS.primary,
  },
  likeButtonText: {
    fontSize: 24,
  },
  matchedSection: {
    marginTop: SPACING.md,
  },
  matchedAvatar: {
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  matchedName: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.text,
    marginTop: SPACING.xs,
  },
});
