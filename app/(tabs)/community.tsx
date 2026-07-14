import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '@/constants';
import { useCommunityStore } from '@/stores';
import { useTranslation } from '@/hooks';
import { Card, Badge, Button, Avatar, EmptyState } from '@/components/ui';

export default function CommunityScreen() {
  const { communities, userCommunities, fetchCommunities, joinCommunity } = useCommunityStore();
  const { t } = useTranslation();
  const [selectedTab, setSelectedTab] = useState<'discover' | 'my'>('discover');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchCommunities();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchCommunities();
    setRefreshing(false);
  };

  const categories = [
    { key: 'all', label: 'All', icon: '🌍' },
    { key: 'alumni', label: 'Alumni', icon: '🎓' },
    { key: 'professional', label: 'Professional', icon: '💼' },
    { key: 'hobby', label: 'Hobby', icon: '🎨' },
    { key: 'cultural', label: 'Cultural', icon: '🎭' },
    { key: 'cause', label: 'Cause', icon: '✊' },
  ];

  const displayCommunities = selectedTab === 'discover'
    ? communities.filter((c) => selectedCategory === 'all' || c.category === selectedCategory)
    : communities.filter((c) => userCommunities.includes(c.id));

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('communities')}</Text>
      </View>

      <View style={styles.tabRow}>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'discover' && styles.tabActive]}
          onPress={() => setSelectedTab('discover')}
        >
          <Text style={[styles.tabText, selectedTab === 'discover' && styles.tabTextActive]}>
            {t('community_groups')}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'my' && styles.tabActive]}
          onPress={() => setSelectedTab('my')}
        >
          <Text style={[styles.tabText, selectedTab === 'my' && styles.tabTextActive]}>
            {t('my_communities')}
          </Text>
        </TouchableOpacity>
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

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {displayCommunities.length === 0 ? (
          <EmptyState
            icon="👥"
            title="No communities found"
            message="Join communities to connect with like-minded people!"
            actionLabel="Explore"
            onAction={fetchCommunities}
          />
        ) : (
          displayCommunities.map((community) => (
            <Card key={community.id} style={styles.communityCard}>
              <View style={styles.communityHeader}>
                <View style={styles.communityIcon}>
                  <Text style={styles.communityIconText}>
                    {categories.find((c) => c.key === community.category)?.icon || '👥'}
                  </Text>
                </View>
                <View style={styles.communityInfo}>
                  <Text style={styles.communityName}>{community.name}</Text>
                  <Text style={styles.communityMembers}>
                    {community.members?.length || 0} {t('group_members')}
                  </Text>
                </View>
                {community.isPublic && <Badge label="Public" variant="success" size="sm" />}
              </View>

              <Text style={styles.communityDescription} numberOfLines={2}>
                {community.description}
              </Text>

              {community.languages && community.languages.length > 0 && (
                <View style={styles.languageRow}>
                  {community.languages.map((lang) => (
                    <Badge key={lang} label={lang.toUpperCase()} variant="info" size="sm" />
                  ))}
                </View>
              )}

              <View style={styles.communityFooter}>
                <Button
                  title={userCommunities.includes(community.id) ? 'Joined ✓' : t('join_community')}
                  onPress={() => joinCommunity(community.id)}
                  variant={userCommunities.includes(community.id) ? 'success' : 'primary'}
                  size="sm"
                />
              </View>
            </Card>
          ))
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Create Your Own</Text>
          <Card style={styles.createCard}>
            <Text style={styles.createIcon}>➕</Text>
            <Text style={styles.createTitle}>Start a Community</Text>
            <Text style={styles.createDescription}>
              Create a space for people who share your interests, profession, or cause
            </Text>
            <Button title="Get Started" onPress={() => {}} variant="primary" size="sm" />
          </Card>
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
  tabRow: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    gap: SPACING.sm,
  },
  tab: {
    flex: 1,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    backgroundColor: COLORS.surface,
  },
  tabActive: {
    backgroundColor: COLORS.primary,
  },
  tabText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '500',
    color: COLORS.text,
  },
  tabTextActive: {
    color: COLORS.textInverse,
  },
  categoryScroll: {
    paddingLeft: SPACING.lg,
    marginTop: SPACING.md,
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
  },
  categoryLabelActive: {
    color: COLORS.textInverse,
  },
  scrollContent: {
    padding: SPACING.lg,
    paddingBottom: 100,
  },
  communityCard: {
    marginBottom: SPACING.md,
  },
  communityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    marginBottom: SPACING.md,
  },
  communityIcon: {
    width: 48,
    height: 48,
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: COLORS.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  communityIconText: {
    fontSize: 24,
  },
  communityInfo: {
    flex: 1,
  },
  communityName: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.text,
  },
  communityMembers: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textLight,
  },
  communityDescription: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    lineHeight: 20,
    marginBottom: SPACING.md,
  },
  languageRow: {
    flexDirection: 'row',
    gap: SPACING.xs,
    marginBottom: SPACING.md,
  },
  communityFooter: {
    alignItems: 'flex-start',
  },
  section: {
    marginTop: SPACING.lg,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  createCard: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
  },
  createIcon: {
    fontSize: 32,
    marginBottom: SPACING.md,
  },
  createTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  createDescription: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textLight,
    textAlign: 'center',
    marginBottom: SPACING.md,
    paddingHorizontal: SPACING.lg,
  },
});
