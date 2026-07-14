import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
} from 'react-native';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS, INTERESTS } from '@/constants';
import { useTranslation } from '@/hooks';
import { Card, Badge, Avatar, Button } from '@/components/ui';
import { useAppStore } from '@/stores';

export default function ExploreScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const { t } = useTranslation();
  const { isLowDataMode, toggleLowDataMode } = useAppStore();

  const categories = [
    { key: 'all', label: 'All', icon: '🌍' },
    { key: 'verified', label: 'Verified', icon: '✓' },
    { key: 'online', label: 'Online', icon: '🟢' },
    { key: 'new', label: 'New', icon: '🆕' },
    { key: 'nearby', label: 'Nearby', icon: '📍' },
  ];

  const trendingInterests = INTERESTS.slice(0, 8);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Explore</Text>
        <TouchableOpacity style={styles.lowDataToggle} onPress={toggleLowDataMode}>
          <Text style={styles.lowDataText}>
            {isLowDataMode ? '📶 Standard' : '📱 Low Data'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search people, interests, communities..."
            placeholderTextColor={COLORS.textLight}
          />
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
          <View style={styles.categoryRow}>
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat.key}
                style={[styles.categoryPill, selectedCategory === cat.key && styles.categoryPillActive]}
                onPress={() => setSelectedCategory(cat.key)}
              >
                <Text style={styles.categoryIcon}>{cat.icon}</Text>
                <Text style={[styles.categoryLabel, selectedCategory === cat.key && styles.categoryLabelActive]}>
                  {cat.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Trending Interests</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.interestRow}>
              {trendingInterests.map((interest) => (
                <TouchableOpacity key={interest} style={styles.interestChip}>
                  <Text style={styles.interestText}>{interest}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Suggested For You</Text>
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} style={styles.suggestionCard}>
              <View style={styles.suggestionRow}>
                <Avatar size={56} isVerified={i % 2 === 0} />
                <View style={styles.suggestionInfo}>
                  <Text style={styles.suggestionName}>User {i}</Text>
                  <Text style={styles.suggestionDetail}>Community • Interests</Text>
                  <View style={styles.suggestionBadges}>
                    <Badge label={`${70 + i * 5}% match`} variant="success" size="sm" />
                  </View>
                </View>
                <Button title="Like" onPress={() => {}} variant="primary" size="sm" />
              </View>
            </Card>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActions}>
            <TouchableOpacity style={styles.quickAction}>
              <Text style={styles.quickActionIcon}>🎯</Text>
              <Text style={styles.quickActionLabel}>AI Icebreakers</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickAction}>
              <Text style={styles.quickActionIcon}>👨‍👩‍👧</Text>
              <Text style={styles.quickActionLabel}>Family Endorse</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickAction}>
              <Text style={styles.quickActionIcon}>🚀</Text>
              <Text style={styles.quickActionLabel}>Boost Profile</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickAction}>
              <Text style={styles.quickActionIcon}>🎁</Text>
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
  },
  lowDataToggle: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: 'rgba(255,255,255,0.2)',
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
    paddingVertical: SPACING.md,
  },
  searchInput: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  categoryScroll: {
    paddingLeft: SPACING.lg,
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
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: SPACING.xs,
  },
  categoryPillActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  categoryIcon: {
    fontSize: 14,
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
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  interestRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  interestChip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.primary + '10',
    borderWidth: 1,
    borderColor: COLORS.primary + '30',
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
  suggestionName: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
  },
  suggestionDetail: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textLight,
    marginBottom: SPACING.xs,
  },
  suggestionBadges: {
    flexDirection: 'row',
    gap: SPACING.xs,
  },
  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  quickAction: {
    width: '48%',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    alignItems: 'center',
  },
  quickActionIcon: {
    fontSize: 28,
    marginBottom: SPACING.sm,
  },
  quickActionLabel: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.text,
  },
});
