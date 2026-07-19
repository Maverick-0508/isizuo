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
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS, SHADOWS } from '@/constants';
import { useMatchingStore, useAuthStore } from '@/stores';
import { useTranslation } from '@/hooks';
import { Card, Badge, Button, Avatar, EmptyState } from '@/components/ui';
import { sendMatchNotification } from '@/services/sms';

const { width } = Dimensions.get('window');
const SAMPLE_NAMES = ['Amara', 'Kofi', 'Nia', 'Tendai', 'Zuri', 'Kwame', 'Aisha', 'Jabari'];
const SAMPLE_BIOS = [
  'Love cooking traditional dishes and exploring new cultures',
  'Software engineer by day, musician by night. Looking for genuine connections',
  'Passionate about education and community development',
  'Adventure seeker. Love hiking, photography, and African art',
  'Family is everything. Looking for someone who shares my values',
  'Entrepreneur building the future of fintech in Africa',
  'Medical student with a love for dance and storytelling',
  'Creative soul who loves fashion, travel, and good conversations',
];
const SAMPLE_INTERESTS = [
  ['Music', 'Cooking', 'Travel'], ['Technology', 'Entrepreneurship', 'Fitness'],
  ['Art', 'Photography', 'Dance'], ['Education', 'Volunteering', 'Reading'],
  ['Sports', 'Gaming', 'Film'], ['Fashion', 'Art', 'Travel'],
  ['Agriculture', 'Environment', 'Cooking'], ['Music', 'Dance', 'Fitness'],
];
const SAMPLE_LANGUAGES = [['en', 'yo'], ['en', 'sw'], ['en', 'ha'], ['en', 'am'], ['en']];

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

  const nameIndex = currentMatchIndex % SAMPLE_NAMES.length;

  if (!currentProfile) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Ionicons name="heart" size={24} color={COLORS.textInverse} />
            <Text style={styles.logo}>{t('app_name')}</Text>
          </View>
        </View>
        <EmptyState
          icon="heart-dislike-outline"
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
        <View style={styles.headerLeft}>
          <Ionicons name="heart" size={24} color={COLORS.textInverse} />
          <Text style={styles.logo}>{t('app_name')}</Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.headerButton} onPress={() => router.push('/ussd')}>
            <Ionicons name="hardware-chip-outline" size={20} color={COLORS.textInverse} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton} onPress={() => router.push('/safety')}>
            <Ionicons name="shield-checkmark-outline" size={20} color={COLORS.textInverse} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
        showsVerticalScrollIndicator={false}
      >
        <Card style={styles.profileCard}>
          <View style={styles.profileHeader}>
            <Avatar uri={currentProfile.photos?.[0]} size={72} isVerified={currentProfile.isVerified} name={currentProfile.name || SAMPLE_NAMES[nameIndex]} colorIndex={nameIndex} />
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>
                {currentProfile.name || SAMPLE_NAMES[nameIndex]}, {currentProfile.age || 25 + (currentMatchIndex % 10)}
              </Text>
              <View style={styles.locationRow}>
                <Ionicons name="location-outline" size={14} color={COLORS.textLight} />
                <Text style={styles.profileLocation}>
                  {currentProfile.community || 'Nairobi, Kenya'}
                </Text>
              </View>
              <View style={styles.badgeRow}>
                {currentProfile.isVerified && <Badge label="Verified" variant="verified" size="sm" icon="checkmark-circle" />}
                {currentProfile.lookingFor && (
                  <Badge label={t(`looking_${currentProfile.lookingFor}`)} variant="info" size="sm" />
                )}
              </View>
            </View>
          </View>

          {currentProfile.bio && (
            <Text style={styles.bio}>{currentProfile.bio}</Text>
          )}
          {!currentProfile.bio && (
            <Text style={styles.bio}>{SAMPLE_BIOS[nameIndex]}</Text>
          )}

          <View style={styles.compatibilitySection}>
            <Text style={styles.compatibilityTitle}>Compatibility</Text>
            <View style={styles.scoreRow}>
              <View style={styles.scoreItem}>
                <View style={styles.scoreCircle}>
                  <Text style={styles.scoreValue}>
                    {currentProfile._compatibilityScore || Math.floor(Math.random() * 20) + 75}%
                  </Text>
                </View>
                <Text style={styles.scoreLabel}>Overall</Text>
              </View>
              <View style={styles.scoreItem}>
                <View style={[styles.scoreCircle, { backgroundColor: COLORS.secondary + '15' }]}>
                  <Text style={[styles.scoreValue, { color: COLORS.secondary }]}>
                    {Math.floor(Math.random() * 25) + 65}%
                  </Text>
                </View>
                <Text style={styles.scoreLabel}>Culture</Text>
              </View>
              <View style={styles.scoreItem}>
                <View style={[styles.scoreCircle, { backgroundColor: COLORS.accent + '15' }]}>
                  <Text style={[styles.scoreValue, { color: COLORS.accentDark }]}>
                    {Math.floor(Math.random() * 25) + 55}%
                  </Text>
                </View>
                <Text style={styles.scoreLabel}>Interests</Text>
              </View>
            </View>
          </View>

          {(currentProfile.interests?.length > 0) ? (
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
          ) : (
            <View style={styles.interestsSection}>
              <Text style={styles.sectionTitle}>Interests</Text>
              <View style={styles.chipContainer}>
                {SAMPLE_INTERESTS[nameIndex].map((interest: string) => (
                  <View key={interest} style={styles.chip}>
                    <Text style={styles.chipText}>{interest}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {(currentProfile.languages?.length > 0) ? (
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
          ) : (
            <View style={styles.interestsSection}>
              <Text style={styles.sectionTitle}>Languages</Text>
              <View style={styles.chipContainer}>
                {SAMPLE_LANGUAGES[nameIndex].map((lang: string) => (
                  <View key={lang} style={styles.chip}>
                    <Text style={styles.chipText}>{lang.toUpperCase()}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </Card>

        <View style={styles.actionButtons}>
          <TouchableOpacity style={[styles.actionButton, styles.passButton]} onPress={handlePass} activeOpacity={0.7}>
            <Ionicons name="close" size={28} color={COLORS.textLight} />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionButton, styles.superLikeButton]} onPress={handleSuperLike} activeOpacity={0.7}>
            <Ionicons name="star" size={28} color={COLORS.textInverse} />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionButton, styles.likeButton]} onPress={handleLike} activeOpacity={0.7}>
            <Ionicons name="heart" size={28} color={COLORS.textInverse} />
          </TouchableOpacity>
        </View>

        {matches.length > 0 && (
          <View style={styles.matchedSection}>
            <Text style={styles.sectionTitle}>Recent Matches</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {matches.slice(0, 10).map((match, idx) => (
                <TouchableOpacity
                  key={match.id}
                  style={styles.matchedItem}
                  onPress={() => router.push(`/chat/${match.id}`)}
                  activeOpacity={0.7}
                >
                  <Avatar size={56} name={SAMPLE_NAMES[idx % SAMPLE_NAMES.length]} colorIndex={idx} isOnline={idx % 3 === 0} />
                  <Text style={styles.matchedName}>{SAMPLE_NAMES[idx % SAMPLE_NAMES.length]}</Text>
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
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  logo: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '800',
    color: COLORS.textInverse,
    letterSpacing: 0.5,
  },
  headerActions: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  headerButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
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
    marginBottom: 2,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: SPACING.xs,
  },
  profileLocation: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textLight,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: SPACING.xs,
    flexWrap: 'wrap',
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
    color: COLORS.textLight,
    marginBottom: SPACING.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  scoreRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  scoreItem: {
    alignItems: 'center',
  },
  scoreCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary + '12',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.xs,
  },
  scoreValue: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.primary,
  },
  scoreLabel: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textLight,
    fontWeight: '500',
  },
  interestsSection: {
    marginTop: SPACING.md,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.textLight,
    marginBottom: SPACING.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
  },
  chip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: 6,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.primary + '0D',
    borderWidth: 1,
    borderColor: COLORS.primary + '20',
  },
  chipText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.primary,
    fontWeight: '500',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: SPACING.xl,
    marginBottom: SPACING.xl,
    marginTop: SPACING.sm,
  },
  actionButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.md,
  },
  passButton: {
    backgroundColor: COLORS.surface,
    borderWidth: 1.5,
    borderColor: COLORS.border,
  },
  superLikeButton: {
    backgroundColor: COLORS.accent,
  },
  likeButton: {
    backgroundColor: COLORS.primary,
  },
  matchedSection: {
    marginTop: SPACING.sm,
  },
  matchedItem: {
    alignItems: 'center',
    marginRight: SPACING.md,
    width: 68,
  },
  matchedName: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.text,
    marginTop: SPACING.xs,
    fontWeight: '500',
  },
});
