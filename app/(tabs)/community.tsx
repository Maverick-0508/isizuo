import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '@/constants';
import { useCommunityStore } from '@/stores';
import { useTranslation } from '@/hooks';
import { Card, Badge, Button, Avatar, EmptyState } from '@/components/ui';

const SAMPLE_COMMUNITIES = [
  { id: '1', name: 'Lagos Tech Hub', description: 'Connecting developers, designers, and tech entrepreneurs across West Africa.', category: 'professional', members: ['1', '2', '3'], isPublic: true, languages: ['en'] },
  { id: '2', name: 'Nairobi Music Collective', description: 'A space for East African musicians, producers, and music lovers to collaborate.', category: 'hobby', members: ['1', '2'], isPublic: true, languages: ['en', 'sw'] },
  { id: '3', name: 'African Writers Circle', description: 'Share your work, get feedback, and connect with writers across the continent.', category: 'cultural', members: ['1'], isPublic: true, languages: ['en', 'fr'] },
  { id: '4', name: 'Yoruba Heritage Club', description: 'Celebrating and preserving Yoruba language, traditions, and values.', category: 'cultural', members: ['1', '2', '3', '4'], isPublic: true, languages: ['en', 'yo'] },
  { id: '5', name: 'Healthcare Heroes Africa', description: 'Network for doctors, nurses, and healthcare workers making a difference.', category: 'professional', members: ['1', '2'], isPublic: false, languages: ['en'] },
];

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
    { key: 'all', label: 'All', icon: 'globe-outline' as const },
    { key: 'alumni', label: 'Alumni', icon: 'school-outline' as const },
    { key: 'professional', label: 'Work', icon: 'briefcase-outline' as const },
    { key: 'hobby', label: 'Hobby', icon: 'heart-outline' as const },
    { key: 'cultural', label: 'Culture', icon: 'color-palette-outline' as const },
    { key: 'cause', label: 'Cause', icon: 'megaphone-outline' as const },
  ];

  const displayCommunities = communities.length > 0
    ? (selectedTab === 'discover'
        ? communities.filter((c) => selectedCategory === 'all' || c.category === selectedCategory)
        : communities.filter((c) => userCommunities.includes(c.id)))
    : (selectedTab === 'discover'
        ? SAMPLE_COMMUNITIES.filter((c) => selectedCategory === 'all' || c.category === selectedCategory)
        : []);

  const categoryIcons: Record<string, string> = {
    alumni: 'school-outline',
    professional: 'briefcase-outline',
    hobby: 'heart-outline',
    cultural: 'color-palette-outline',
    cause: 'megaphone-outline',
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('communities')}</Text>
      </View>

      <View style={styles.tabRow}>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'discover' && styles.tabActive]}
          onPress={() => setSelectedTab('discover')}
          activeOpacity={0.7}
        >
          <Ionicons name="compass-outline" size={16} color={selectedTab === 'discover' ? COLORS.textInverse : COLORS.textLight} />
          <Text style={[styles.tabText, selectedTab === 'discover' && styles.tabTextActive]}>
            {t('community_groups')}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'my' && styles.tabActive]}
          onPress={() => setSelectedTab('my')}
          activeOpacity={0.7}
        >
          <Ionicons name="star-outline" size={16} color={selectedTab === 'my' ? COLORS.textInverse : COLORS.textLight} />
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

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
      >
        {displayCommunities.length === 0 ? (
          <EmptyState
            icon="people-outline"
            title="No communities found"
            message="Join communities to connect with like-minded people!"
            actionLabel="Explore"
            onAction={fetchCommunities}
          />
        ) : (
          displayCommunities.map((community) => {
            const isJoined = userCommunities.includes(community.id);
            const iconKey = community.category || 'professional';
            return (
              <Card key={community.id} style={styles.communityCard}>
                <View style={styles.communityHeader}>
                  <View style={styles.communityIcon}>
                    <Ionicons
                      name={(categoryIcons[iconKey] || 'people-outline') as keyof typeof Ionicons.glyphMap}
                      size={24}
                      color={COLORS.primary}
                    />
                  </View>
                  <View style={styles.communityInfo}>
                    <Text style={styles.communityName}>{community.name}</Text>
                    <View style={styles.memberRow}>
                      <Ionicons name="people-outline" size={12} color={COLORS.textLight} />
                      <Text style={styles.communityMembers}>
                        {community.members?.length || 0} {t('group_members')}
                      </Text>
                    </View>
                  </View>
                  {community.isPublic && <Badge label="Public" variant="success" size="sm" icon="globe-outline" />}
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
                    title={isJoined ? 'Joined' : t('join_community')}
                    onPress={() => joinCommunity(community.id)}
                    variant={isJoined ? 'success' : 'primary'}
                    size="sm"
                    icon={isJoined ? 'checkmark' : 'add'}
                  />
                </View>
              </Card>
            );
          })
        )}

        <View style={styles.section}>
          <Card style={styles.createCard}>
            <View style={styles.createIconContainer}>
              <Ionicons name="add-circle-outline" size={32} color={COLORS.primary} />
            </View>
            <Text style={styles.createTitle}>Start a Community</Text>
            <Text style={styles.createDescription}>
              Create a space for people who share your interests, profession, or cause
            </Text>
            <Button title="Get Started" onPress={() => {}} variant="outline" size="sm" icon="arrow-forward" />
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
    letterSpacing: 0.5,
  },
  tabRow: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    gap: SPACING.sm,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    paddingVertical: 10,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: COLORS.surface,
  },
  tabActive: {
    backgroundColor: COLORS.primary,
  },
  tabText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
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
    backgroundColor: COLORS.primary + '12',
    alignItems: 'center',
    justifyContent: 'center',
  },
  communityInfo: {
    flex: 1,
  },
  communityName: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.text,
  },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
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
  createCard: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
    borderStyle: 'dashed',
    borderWidth: 1.5,
    borderColor: COLORS.primary + '40',
    backgroundColor: COLORS.primary + '05',
  },
  createIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary + '12',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  createTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  createDescription: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textLight,
    textAlign: 'center',
    marginBottom: SPACING.md,
    paddingHorizontal: SPACING.lg,
    lineHeight: 18,
  },
});
