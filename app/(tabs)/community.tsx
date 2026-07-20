import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from '@/hooks';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS, SHADOWS, FONTS } from '@/constants';
import { Badge, Avatar, Button } from '@/components/ui';
import { Logo } from '@/components/Logo';

const { width } = Dimensions.get('window');

const SAMPLE_COMMUNITIES = [
  { id: '1', name: 'Yoruba Connect', members: 2340, category: 'Cultural', color: '#5B4BD5', description: 'A space for Yoruba singles to connect, share culture, and find love.', isVerified: true, isJoined: true },
  { id: '2', name: 'Nairobi Tech Singles', members: 890, category: 'Professional', color: '#B32464', description: 'Tech professionals looking for meaningful connections.', isVerified: true, isJoined: false },
  { id: '3', name: 'Lagos Foodies', members: 1560, category: 'Interest', color: '#E8A820', description: 'Bond over your love for African cuisine.', isVerified: false, isJoined: false },
  { id: '4', name: 'Swahili Hearts', members: 3120, category: 'Cultural', color: '#00A878', description: 'Connecting Swahili speakers across East Africa.', isVerified: true, isJoined: true },
  { id: '5', name: 'Abuja Elite', members: 670, category: 'Lifestyle', color: '#8B7FF5', description: 'For professionals in Abuja seeking quality relationships.', isVerified: false, isJoined: false },
  { id: '6', name: 'Igbo Heritage', members: 1890, category: 'Cultural', color: '#DC3545', description: 'Celebrating Igbo culture while finding love.', isVerified: true, isJoined: false },
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
        <Logo size="sm" showText={false} />
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle} accessibilityRole="header">{t('communities')}</Text>
        </View>
        <TouchableOpacity style={styles.createBtn} accessibilityRole="button" accessibilityLabel="Create community">
          <Ionicons name="add" size={24} color={COLORS.textInverse} />
        </TouchableOpacity>
      </View>

      <View style={styles.searchBar} accessibilityRole="search">
        <Ionicons name="search" size={20} color={COLORS.textLight} />
        <Text style={styles.searchPlaceholder}>Search communities...</Text>
      </View>

      <View style={styles.tabRow} accessibilityRole="tablist">
        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'discover' && styles.tabBtnActive]}
          onPress={() => setActiveTab('discover')}
          accessibilityRole="tab"
          accessibilityState={{ selected: activeTab === 'discover' }}
          accessibilityLabel="Discover communities"
        >
          <Text style={[styles.tabBtnText, activeTab === 'discover' && styles.tabBtnTextActive]}>Discover</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'joined' && styles.tabBtnActive]}
          onPress={() => setActiveTab('joined')}
          accessibilityRole="tab"
          accessibilityState={{ selected: activeTab === 'joined' }}
          accessibilityLabel={`Joined communities (${SAMPLE_COMMUNITIES.filter(c => c.isJoined).length})`}
        >
          <Text style={[styles.tabBtnText, activeTab === 'joined' && styles.tabBtnTextActive]}>Joined ({SAMPLE_COMMUNITIES.filter(c => c.isJoined).length})</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {filteredCommunities.map((community) => (
          <TouchableOpacity key={community.id} style={styles.communityCard} activeOpacity={0.92} accessibilityRole="button" accessibilityLabel={`${community.name}, ${community.members} members. ${community.description}`}>
            <View style={[styles.communityIcon, { backgroundColor: community.color + '15' }]}>
              <Text style={[styles.communityInitial, { color: community.color }]}>
                {community.name.charAt(0)}
              </Text>
            </View>
            <View style={styles.communityInfo}>
              <View style={styles.communityNameRow}>
                <Text style={styles.communityName}>{community.name}</Text>
                {community.isVerified && (
                  <Ionicons name="checkmark-circle" size={15} color={COLORS.info} />
                )}
              </View>
              <View style={styles.communityMeta}>
                <Badge label={community.category} variant="info" size="sm" />
                <View style={styles.memberCount}>
                  <Ionicons name="people-outline" size={12} color={COLORS.textLight} />
                  <Text style={styles.memberText}>{community.members.toLocaleString()} members</Text>
                </View>
              </View>
              <Text style={styles.communityDesc} numberOfLines={2}>{community.description}</Text>
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
    paddingHorizontal: SPACING.lg, paddingTop: 56, paddingBottom: SPACING.md,
  },
  headerCenter: { flex: 1, alignItems: 'center' },
  headerTitle: { fontSize: FONT_SIZES.xl, fontFamily: FONTS.extraBold, color: COLORS.text, letterSpacing: -0.6 },
  createBtn: {
    width: 44, height: 44, borderRadius: 22, backgroundColor: COLORS.primary,
    alignItems: 'center', justifyContent: 'center', ...SHADOWS.sm,
  },
  searchBar: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surface, marginHorizontal: SPACING.lg,
    marginTop: SPACING.sm, borderRadius: BORDER_RADIUS.xl, paddingHorizontal: SPACING.lg, paddingVertical: 16,
    gap: SPACING.md, ...SHADOWS.sm,
  },
  searchPlaceholder: { fontSize: FONT_SIZES.md, fontFamily: FONTS.regular, color: COLORS.textLight, flex: 1 },
  tabRow: {
    flexDirection: 'row', backgroundColor: COLORS.surface, marginHorizontal: SPACING.lg, marginTop: SPACING.md,
    borderRadius: BORDER_RADIUS.xl, padding: 4, ...SHADOWS.sm,
  },
  tabBtn: { flex: 1, alignItems: 'center', paddingVertical: 12, borderRadius: BORDER_RADIUS.xl },
  tabBtnActive: { backgroundColor: COLORS.primary + '12' },
  tabBtnText: { fontSize: FONT_SIZES.sm, fontFamily: FONTS.semiBold, color: COLORS.textLight },
  tabBtnTextActive: { color: COLORS.primary, fontFamily: FONTS.bold },
  content: { flex: 1, paddingHorizontal: SPACING.lg, paddingTop: SPACING.md },
  communityCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surface, borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg, marginBottom: SPACING.md, ...SHADOWS.md,
  },
  communityIcon: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
  communityInitial: { fontSize: 24, fontFamily: FONTS.bold },
  communityInfo: { flex: 1, marginLeft: SPACING.md },
  communityNameRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 5 },
  communityName: { fontSize: FONT_SIZES.md, fontFamily: FONTS.bold, color: COLORS.text, letterSpacing: -0.2 },
  communityMeta: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 5 },
  memberCount: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  memberText: { fontSize: FONT_SIZES.xs, fontFamily: FONTS.regular, color: COLORS.textLight },
  communityDesc: { fontSize: FONT_SIZES.xs, fontFamily: FONTS.regular, color: COLORS.textLight, lineHeight: 20 },
  communityAction: { marginLeft: SPACING.sm },
});
