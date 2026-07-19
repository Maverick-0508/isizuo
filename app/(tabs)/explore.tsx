import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS, INTERESTS } from '@/constants';
import { useTranslation } from '@/hooks';
import { Card, Badge, Avatar, Button } from '@/components/ui';
import { useAppStore } from '@/stores';

const SUGGESTED_USERS = [
  { name: 'Amara Okonkwo', community: 'Igbo', interests: ['Technology', 'Travel'], match: 92, verified: true, online: true },
  { name: 'Kofi Mensah', community: 'Twi', interests: ['Music', 'Entrepreneurship'], match: 87, verified: false, online: true },
  { name: 'Nia Wanjiku', community: 'Kikuyu', interests: ['Art', 'Photography'], match: 84, verified: true, online: false },
  { name: 'Tendai Moyo', community: 'Shona', interests: ['Sports', 'Fitness'], match: 79, verified: false, online: true },
  { name: 'Zuri Adebayo', community: 'Yoruba', interests: ['Fashion', 'Dance'], match: 76, verified: true, online: false },
];

export default function ExploreScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const { t } = useTranslation();
  const { isLowDataMode, toggleLowDataMode } = useAppStore();

  const categories = [
    { key: 'all', label: 'All', icon: 'globe-outline' as const },
    { key: 'verified', label: 'Verified', icon: 'checkmark-circle-outline' as const },
    { key: 'online', label: 'Online', icon: 'radio-outline' as const },
    { key: 'new', label: 'New', icon: 'sparkles-outline' as const },
    { key: 'nearby', label: 'Nearby', icon: 'location-outline' as const },
  ];

  const trendingInterests = INTERESTS.slice(0, 8);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Explore</Text>
        <TouchableOpacity style={styles.lowDataToggle} onPress={toggleLowDataMode} activeOpacity={0.7}>
          <Ionicons name={isLowDataMode ? 'wifi-outline' : 'phone-portrait-outline'} size={14} color={COLORS.textInverse} />
          <Text style={styles.lowDataText}>
            {isLowDataMode ? 'Standard' : 'Low Data'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.searchContainer}>
          <View style={styles.searchInputWrapper}>
            <Ionicons name="search-outline" size={18} color={COLORS.textLight} />
            <TextInput
              style={styles.searchInput}
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search people, interests, communities..."
              placeholderTextColor={COLORS.textLight}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={18} color={COLORS.textLight} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
          <View style={styles.categoryRow}>
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat.key}
                style={[styles.categoryPill, selectedCategory === cat.key && styles.categoryPillActive]}
                onPress={() => setSelectedCategory(cat.key)}
                activeOpacity={0.7}
              >
                <Ionicons name={cat.icon} size={14} color={selectedCategory === cat.key ? COLORS.textInverse : COLORS.textLight} />
                <Text style={[styles.categoryLabel, selectedCategory === cat.key && styles.categoryLabelActive]}>
                  {cat.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Trending Interests</Text>
            <Ionicons name="trending-up" size={16} color={COLORS.primary} />
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.interestRow}>
              {trendingInterests.map((interest) => (
                <TouchableOpacity key={interest} style={styles.interestChip} activeOpacity={0.7}>
                  <Text style={styles.interestText}>{interest}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Suggested For You</Text>
            <TouchableOpacity>
              <Text style={styles.seeAll}>See All</Text>
            </TouchableOpacity>
          </View>
          {SUGGESTED_USERS.map((u, i) => (
            <Card key={i} style={styles.suggestionCard}>
              <View style={styles.suggestionRow}>
                <Avatar size={52} isVerified={u.verified} name={u.name} colorIndex={i} isOnline={u.online} />
                <View style={styles.suggestionInfo}>
                  <View style={styles.nameRow}>
                    <Text style={styles.suggestionName}>{u.name}</Text>
                    {u.verified && <Ionicons name="checkmark-circle" size={14} color={COLORS.verified} />}
                  </View>
                  <Text style={styles.suggestionDetail}>{u.community} community</Text>
                  <View style={styles.suggestionBadges}>
                    <Badge label={`${u.match}% match`} variant="success" size="sm" icon="heart" />
                  </View>
                </View>
                <TouchableOpacity style={styles.likeButton}>
                  <Ionicons name="heart-outline" size={20} color={COLORS.primary} />
                </TouchableOpacity>
              </View>
            </Card>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActions}>
            <TouchableOpacity style={styles.quickAction} activeOpacity={0.7}>
              <View style={[styles.quickActionIcon, { backgroundColor: COLORS.primary + '12' }]}>
                <Ionicons name="chatbubble-ellipses-outline" size={22} color={COLORS.primary} />
              </View>
              <Text style={styles.quickActionLabel}>AI Icebreakers</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickAction} activeOpacity={0.7}>
              <View style={[styles.quickActionIcon, { backgroundColor: COLORS.secondary + '12' }]}>
                <Ionicons name="people-outline" size={22} color={COLORS.secondary} />
              </View>
              <Text style={styles.quickActionLabel}>Family Endorse</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickAction} activeOpacity={0.7}>
              <View style={[styles.quickActionIcon, { backgroundColor: COLORS.accent + '12' }]}>
                <Ionicons name="rocket-outline" size={22} color={COLORS.accentDark} />
              </View>
              <Text style={styles.quickActionLabel}>Boost Profile</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickAction} activeOpacity={0.7}>
              <View style={[styles.quickActionIcon, { backgroundColor: '#6F42C1' + '12' }]}>
                <Ionicons name="gift-outline" size={22} color="#6F42C1" />
              </View>
              <Text style={styles.quickActionLabel}>Send Gift</Text>
            </TouchableOpacity>
          </View>
        </View>
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
  title: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: '800',
    color: COLORS.textInverse,
    letterSpacing: 0.5,
  },
  lowDataToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: SPACING.md,
    paddingVertical: 8,
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: BORDER_RADIUS.full,
  },
  lowDataText: {
    color: COLORS.textInverse,
    fontSize: FONT_SIZES.sm,
    fontWeight: '500',
  },
  scrollContent: {
    paddingBottom: 100,
  },
  searchContainer: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.sm,
  },
  searchInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.xl,
    paddingHorizontal: SPACING.md,
    gap: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
  },
  categoryScroll: {
    paddingLeft: SPACING.lg,
    paddingBottom: SPACING.sm,
  },
  categoryRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    paddingRight: SPACING.lg,
  },
  categoryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: 8,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 6,
  },
  categoryPillActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  categoryLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text,
    fontWeight: '500',
  },
  categoryLabelActive: {
    color: COLORS.textInverse,
  },
  section: {
    paddingHorizontal: SPACING.lg,
    marginTop: SPACING.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.text,
  },
  seeAll: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.primary,
    fontWeight: '600',
  },
  interestRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  interestChip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: 8,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.primary + '0D',
    borderWidth: 1,
    borderColor: COLORS.primary + '20',
  },
  interestText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.primary,
    fontWeight: '500',
  },
  suggestionCard: {
    marginBottom: SPACING.sm,
  },
  suggestionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  suggestionInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  suggestionName: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
  },
  suggestionDetail: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textLight,
    marginBottom: 4,
  },
  suggestionBadges: {
    flexDirection: 'row',
    gap: SPACING.xs,
  },
  likeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  quickAction: {
    width: '48%',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.sm,
  },
  quickActionLabel: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.text,
  },
});
