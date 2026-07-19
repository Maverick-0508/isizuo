import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from '@/hooks';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS, SHADOWS, FONTS } from '@/constants';
import { Badge, Avatar, Button } from '@/components/ui';
import { Logo } from '@/components/Logo';

const { width } = Dimensions.get('window');

const SAMPLE_COMMUNITIES = [
  { id: '1', name: 'Yoruba Connect', members: 2340, category: 'Cultural', color: '#6C5CE7', description: 'A space for Yoruba singles to connect, share culture, and find love.', isVerified: true, isJoined: true },
  { id: '2', name: 'Nairobi Tech Singles', members: 890, category: 'Professional', color: '#E84393', description: 'Tech professionals looking for meaningful connections.', isVerified: true, isJoined: false },
  { id: '3', name: 'Lagos Foodies', members: 1560, category: 'Interest', color: '#FDCB6E', description: 'Bond over your love for African cuisine.', isVerified: false, isJoined: false },
  { id: '4', name: 'Swahili Hearts', members: 3120, category: 'Cultural', color: '#00B894', description: 'Connecting Swahili speakers across East Africa.', isVerified: true, isJoined: true },
  { id: '5', name: 'Abuja Elite', members: 670, category: 'Lifestyle', color: '#A29BFE', description: 'For professionals in Abuja seeking quality relationships.', isVerified: false, isJoined: false },
  { id: '6', name: 'Igbo Heritage', members: 1890, category: 'Cultural', color: '#FF6B6B', description: 'Celebrating Igbo culture while finding love.', isVerified: true, isJoined: false },
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
          <Text style={styles.headerTitle}>{t('communities')}</Text>
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
          <Text style={[styles.tabBtnText, activeTab === 'joined' && styles.tabBtnTextActive]}>Joined ({SAMPLE_COMMUNITIES.filter(c => c.isJoined).length})</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {filteredCommunities.map((community) => (
          <TouchableOpacity key={community.id} style={styles.communityCard} activeOpacity={0.85}>
            <View style={[styles.communityIcon, { backgroundColor: community.color + '15' }]}>
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
              <View style={styles.communityMeta}>
                <Badge label={community.category} variant="info" size="sm" />
                <View style={styles.memberCount}>
                  <Ionicons name="people-outline" size={11} color={COLORS.textLight} />
                  <Text style={styles.memberText}>{community.members.toLocaleString()}</Text>
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
    paddingHorizontal: SPACING.lg, paddingTop: 56, paddingBottom: SPACING.sm,
    backgroundColor: COLORS.card, borderBottomLeftRadius: BORDER_RADIUS.xl, borderBottomRightRadius: BORDER_RADIUS.xl,
    ...SHADOWS.sm,
  },
  headerCenter: { flex: 1, alignItems: 'center' },
  headerTitle: { fontSize: 20, fontFamily: FONTS.extraBold, color: COLORS.text, letterSpacing: -0.5 },
  createBtn: {
    width: 36, height: 36, borderRadius: 18, backgroundColor: COLORS.primary,
    alignItems: 'center', justifyContent: 'center',
  },
  searchBar: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.card, marginHorizontal: SPACING.lg,
    marginTop: SPACING.md, borderRadius: BORDER_RADIUS.xl, paddingHorizontal: SPACING.md, paddingVertical: 14,
    gap: SPACING.sm, borderWidth: 1, borderColor: COLORS.border,
  },
  searchPlaceholder: { fontSize: 14, fontFamily: FONTS.regular, color: COLORS.textLight, flex: 1 },
  tabRow: {
    flexDirection: 'row', backgroundColor: COLORS.card, marginHorizontal: SPACING.lg, marginTop: SPACING.md,
    borderRadius: BORDER_RADIUS.xl, padding: 4, ...SHADOWS.sm,
  },
  tabBtn: { flex: 1, alignItems: 'center', paddingVertical: 10, borderRadius: BORDER_RADIUS.xl },
  tabBtnActive: { backgroundColor: COLORS.primary + '12' },
  tabBtnText: { fontSize: 13, fontFamily: FONTS.semiBold, color: COLORS.textLight },
  tabBtnTextActive: { color: COLORS.primary, fontFamily: FONTS.bold },
  content: { flex: 1, paddingHorizontal: SPACING.lg, paddingTop: SPACING.md },
  communityCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.card, borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md, marginBottom: SPACING.sm, borderWidth: 1, borderColor: COLORS.border,
  },
  communityIcon: { width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center' },
  communityInitial: { fontSize: 22, fontFamily: FONTS.bold },
  communityInfo: { flex: 1, marginLeft: SPACING.md },
  communityNameRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 4 },
  communityName: { fontSize: FONT_SIZES.md, fontFamily: FONTS.bold, color: COLORS.text },
  communityMeta: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  memberCount: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  memberText: { fontSize: 11, fontFamily: FONTS.regular, color: COLORS.textLight },
  communityDesc: { fontSize: 12, fontFamily: FONTS.regular, color: COLORS.textLight, lineHeight: 17 },
  communityAction: { marginLeft: SPACING.sm },
});
