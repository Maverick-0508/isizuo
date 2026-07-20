import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from '@/hooks';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS, SHADOWS, FONTS, GRADIENTS } from '@/constants';
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
  const [searchQuery, setSearchQuery] = useState('');
  const [communities, setCommunities] = useState(SAMPLE_COMMUNITIES);

  const joinedCount = communities.filter(c => c.isJoined).length;

  const filteredCommunities = useMemo(() => {
    let result = communities;
    if (activeTab === 'joined') {
      result = result.filter(c => c.isJoined);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(c =>
        c.name.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        c.category.toLowerCase().includes(q)
      );
    }
    return result;
  }, [communities, activeTab, searchQuery]);

  const handleJoinToggle = (communityId: string) => {
    setCommunities(prev => prev.map(c =>
      c.id === communityId
        ? { ...c, isJoined: !c.isJoined, members: c.isJoined ? c.members - 1 : c.members + 1 }
        : c
    ));
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Logo size="sm" showText={false} />
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle} accessibilityRole="header">{t('communities')}</Text>
        </View>
        <TouchableOpacity style={styles.createBtn} accessibilityRole="button" accessibilityLabel={t('create_event')}>
          <Ionicons name="add" size={24} color={COLORS.textInverse} />
        </TouchableOpacity>
      </View>

      <View style={styles.searchBar} accessibilityRole="search">
        <Ionicons name="search" size={20} color={COLORS.textLight} />
        <TextInput
          style={styles.searchInput}
          placeholder={t('search_communities')}
          placeholderTextColor={COLORS.textLight}
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoCapitalize="none"
          autoCorrect={false}
          accessibilityLabel={t('search_communities')}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')} accessibilityRole="button" accessibilityLabel={t('cancel')}>
            <Ionicons name="close-circle" size={20} color={COLORS.textLight} />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.tabRow} accessibilityRole="tablist">
        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'discover' && styles.tabBtnActive]}
          onPress={() => setActiveTab('discover')}
          accessibilityRole="tab"
          accessibilityState={{ selected: activeTab === 'discover' }}
          accessibilityLabel={t('discover')}
        >
          <Text style={[styles.tabBtnText, activeTab === 'discover' && styles.tabBtnTextActive]}>{t('discover')}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'joined' && styles.tabBtnActive]}
          onPress={() => setActiveTab('joined')}
          accessibilityRole="tab"
          accessibilityState={{ selected: activeTab === 'joined' }}
          accessibilityLabel={`${t('joined')} (${joinedCount})`}
        >
          <Text style={[styles.tabBtnText, activeTab === 'joined' && styles.tabBtnTextActive]}>{t('joined')} ({joinedCount})</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {filteredCommunities.length === 0 && (
          <View style={styles.emptyEvents}>
            <View style={styles.emptyIconWrap}>
              <Ionicons name="people-outline" size={36} color={COLORS.primaryLight} />
            </View>
            <Text style={styles.emptyTitle}>{t('no_matches')}</Text>
            <Text style={styles.emptyDesc}>{t('search_filters')}</Text>
          </View>
        )}

        {filteredCommunities.map((community) => (
          <TouchableOpacity key={community.id} style={styles.communityCard} activeOpacity={0.92} accessibilityRole="button" accessibilityLabel={`${community.name}, ${community.members} ${t('members')}. ${community.description}`}>
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
                  <Text style={styles.memberText}>{community.members.toLocaleString()} {t('members')}</Text>
                </View>
              </View>
              <Text style={styles.communityDesc} numberOfLines={2}>{community.description}</Text>
            </View>
            <View style={styles.communityAction}>
              {community.isJoined ? (
                <Button title={t('joined_status')} variant="outline" size="sm" icon="checkmark" onPress={() => handleJoinToggle(community.id)} />
              ) : (
                <Button title={t('join')} variant="primary" size="sm" icon="add" onPress={() => handleJoinToggle(community.id)} />
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
  searchInput: {
    flex: 1, fontSize: FONT_SIZES.md, fontFamily: FONTS.regular, color: COLORS.text,
  },
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
  communityIcon: { width: 56, height: 56, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  communityInitial: { fontSize: 26, fontFamily: FONTS.bold },
  communityInfo: { flex: 1, marginLeft: SPACING.md },
  communityNameRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 5 },
  communityName: { fontSize: FONT_SIZES.md, fontFamily: FONTS.bold, color: COLORS.text, letterSpacing: -0.2 },
  communityMeta: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 5 },
  memberCount: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  memberText: { fontSize: FONT_SIZES.xs, fontFamily: FONTS.regular, color: COLORS.textLight },
  communityDesc: { fontSize: FONT_SIZES.xs, fontFamily: FONTS.regular, color: COLORS.textLight, lineHeight: 20 },
  communityAction: { marginLeft: SPACING.sm },
  emptyEvents: {
    alignItems: 'center', paddingVertical: SPACING.xl * 2, backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.xl, ...SHADOWS.sm,
  },
  emptyIconWrap: {
    width: 72, height: 72, borderRadius: 24, backgroundColor: COLORS.primary + '10',
    alignItems: 'center', justifyContent: 'center', marginBottom: SPACING.md,
  },
  emptyTitle: { fontSize: FONT_SIZES.md, fontFamily: FONTS.bold, color: COLORS.text },
  emptyDesc: { fontSize: FONT_SIZES.sm, fontFamily: FONTS.regular, color: COLORS.textLight, marginTop: 4 },
});
