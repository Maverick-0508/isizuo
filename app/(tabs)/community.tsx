import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from '@/hooks';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS, SHADOWS } from '@/constants';
import { Badge, Avatar, Button } from '@/components/ui';

const { width } = Dimensions.get('window');

const SAMPLE_COMMUNITIES = [
  {
    id: '1', name: 'Yoruba Connect', members: 2340, category: 'Cultural',
    color: '#6C5CE7', description: 'A space for Yoruba singles to connect, share culture, and find love.',
    isVerified: true, isJoined: true,
  },
  {
    id: '2', name: 'Nairobi Tech Singles', members: 890, category: 'Professional',
    color: '#E84393', description: 'Tech professionals looking for meaningful connections.',
    isVerified: true, isJoined: false,
  },
  {
    id: '3', name: 'Lagos Foodies', members: 1560, category: 'Interest',
    color: '#FDCB6E', description: 'Bond over your love for African cuisine.',
    isVerified: false, isJoined: false,
  },
  {
    id: '4', name: 'Swahili Hearts', members: 3120, category: 'Cultural',
    color: '#00B894', description: 'Connecting Swahili speakers across East Africa.',
    isVerified: true, isJoined: true,
  },
  {
    id: '5', name: 'Abuja Elite', members: 670, category: 'Lifestyle',
    color: '#A29BFE', description: 'For professionals in Abuja seeking quality relationships.',
    isVerified: false, isJoined: false,
  },
  {
    id: '6', name: 'Igbo Heritage', members: 1890, category: 'Cultural',
    color: '#FF6B6B', description: 'Celebrating Igbo culture while finding love.',
    isVerified: true, isJoined: false,
  },
];

export default function CommunityScreen() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'discover' | 'joined'>('discover');

  const filteredCommunities = activeTab === 'joined'
    ? SAMPLE_COMMUNITIES.filter(c => c.isJoined)
    : SAMPLE_COMMUNITIES;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>{t('communities')}</Text>
          <Text style={styles.headerSubtitle}>Find your people</Text>
        </View>
        <TouchableOpacity style={styles.createBtn}>
          <Ionicons name="add" size={22} color={COLORS.textInverse} />
        </TouchableOpacity>
      </View>

      <View style={styles.searchBar}>
        <Ionicons name="search" size={18} color={COLORS.textLight} />
        <Text style={styles.searchPlaceholder}>Search communities...</Text>
      </View>

      <View style={styles.tabRow}>
        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'discover' && styles.tabBtnActive]}
          onPress={() => setActiveTab('discover')}
        >
          <Text style={[styles.tabBtnText, activeTab === 'discover' && styles.tabBtnTextActive]}>Discover</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'joined' && styles.tabBtnActive]}
          onPress={() => setActiveTab('joined')}
        >
          <Text style={[styles.tabBtnText, activeTab === 'joined' && styles.tabBtnTextActive]}>Joined</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {filteredCommunities.map((community) => (
          <TouchableOpacity key={community.id} style={styles.communityCard} activeOpacity={0.85}>
            <View style={[styles.communityIcon, { backgroundColor: community.color + '18' }]}>
              <Text style={[styles.communityInitial, { color: community.color }]}>
                {community.name.charAt(0)}
              </Text>
            </View>
            <View style={styles.communityInfo}>
              <View style={styles.communityNameRow}>
                <Text style={styles.communityName}>{community.name}</Text>
                {community.isVerified && (
                  <Ionicons name="checkmark-circle" size={14} color={COLORS.info} />
                )}
              </View>
              <Badge label={community.category} variant="info" size="sm" />
              <Text style={styles.communityDesc} numberOfLines={2}>{community.description}</Text>
              <View style={styles.communityMeta}>
                <Ionicons name="people-outline" size={12} color={COLORS.textLight} />
                <Text style={styles.communityMetaText}>{community.members.toLocaleString()} members</Text>
              </View>
            </View>
            <View style={styles.communityAction}>
              {community.isJoined ? (
                <Button title="Joined" variant="outline" size="sm" icon="checkmark" onPress={() => {}} />
              ) : (
                <Button title="Join" variant="primary" size="sm" icon="add" onPress={() => {}} />
              )}
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: SPACING.lg, paddingTop: 60, paddingBottom: SPACING.sm,
    backgroundColor: COLORS.card, borderBottomLeftRadius: BORDER_RADIUS.xl, borderBottomRightRadius: BORDER_RADIUS.xl,
    ...SHADOWS.sm,
  },
  headerTitle: { fontSize: FONT_SIZES.title, fontWeight: '900', color: COLORS.primary, letterSpacing: -1 },
  headerSubtitle: { fontSize: FONT_SIZES.sm, color: COLORS.textLight, marginTop: 2 },
  createBtn: {
    width: 36, height: 36, borderRadius: 18, backgroundColor: COLORS.primary,
    alignItems: 'center', justifyContent: 'center',
  },
  searchBar: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.card, marginHorizontal: SPACING.lg,
    marginTop: SPACING.md, borderRadius: BORDER_RADIUS.xl, paddingHorizontal: SPACING.md, paddingVertical: 12,
    gap: SPACING.sm, ...SHADOWS.sm,
  },
  searchPlaceholder: { fontSize: FONT_SIZES.md, color: COLORS.textLight, flex: 1 },
  tabRow: {
    flexDirection: 'row', backgroundColor: COLORS.card, marginHorizontal: SPACING.lg, marginTop: SPACING.md,
    borderRadius: BORDER_RADIUS.xl, padding: 4, ...SHADOWS.sm,
  },
  tabBtn: { flex: 1, alignItems: 'center', paddingVertical: 10, borderRadius: BORDER_RADIUS.xl },
  tabBtnActive: { backgroundColor: COLORS.primary + '12' },
  tabBtnText: { fontSize: FONT_SIZES.sm, fontWeight: '600', color: COLORS.textLight },
  tabBtnTextActive: { color: COLORS.primary },
  content: { flex: 1, paddingHorizontal: SPACING.lg, paddingTop: SPACING.md },
  communityCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.card, borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md, marginBottom: SPACING.sm, borderWidth: 1, borderColor: COLORS.border,
  },
  communityIcon: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
  communityInitial: { fontSize: 22, fontWeight: '800' },
  communityInfo: { flex: 1, marginLeft: SPACING.md },
  communityNameRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 4 },
  communityName: { fontSize: FONT_SIZES.md, fontWeight: '700', color: COLORS.text },
  communityDesc: { fontSize: FONT_SIZES.xs, color: COLORS.textLight, marginTop: 4, lineHeight: 16 },
  communityMeta: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6 },
  communityMetaText: { fontSize: FONT_SIZES.xs, color: COLORS.textLight },
  communityAction: { marginLeft: SPACING.sm },
});
