import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from '@/hooks';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS, SHADOWS } from '@/constants';
import { Badge, Avatar, Card, Button } from '@/components/ui';

const { width } = Dimensions.get('window');

const CATEGORIES = [
  { key: 'nearby', label: 'Nearby', icon: 'location' },
  { key: 'online', label: 'Online Now', icon: 'radio' },
  { key: 'new', label: 'New', icon: 'sparkles' },
  { key: 'verified', label: 'Verified', icon: 'shield-checkmark' },
  { key: 'premium', label: 'Premium', icon: 'diamond' },
];

const SAMPLE_PROFILES = [
  { id: '1', name: 'Amara O.', age: 26, location: 'Lagos', bio: 'Software Engineer. Love to travel and cook traditional meals.', community: 'Yoruba', isVerified: true, isPremium: true, distance: '2 km', interests: ['Tech', 'Travel', 'Cooking'] },
  { id: '2', name: 'Zainab K.', age: 24, location: 'Nairobi', bio: 'Medical student with a passion for community health.', community: 'Swahili', isVerified: true, isPremium: false, distance: '5 km', interests: ['Reading', 'Fitness', 'Music'] },
  { id: '3', name: 'Fatima A.', age: 28, location: 'Addis Ababa', bio: 'Architect designing the future of African cities.', community: 'Amhara', isVerified: false, isPremium: true, distance: '8 km', interests: ['Art', 'Photography', 'Fashion'] },
  { id: '4', name: 'Ngozi C.', age: 25, location: 'Abuja', bio: 'Lawyer by day, dancer by night.', community: 'Igbo', isVerified: true, isPremium: true, distance: '12 km', interests: ['Law', 'Dance', 'Cooking'] },
  { id: '5', name: 'Aisha M.', age: 27, location: 'Johannesburg', bio: 'Building the next big thing in fintech.', community: 'Zulu', isVerified: true, isPremium: false, distance: '3 km', interests: ['Business', 'Travel', 'Music'] },
  { id: '6', name: 'Chidera N.', age: 23, location: 'Port Harcourt', bio: 'Content creator and aspiring filmmaker.', community: 'Igbo', isVerified: false, isPremium: false, distance: '15 km', interests: ['Photography', 'Dance', 'Film'] },
  { id: '7', name: 'Wanjiku M.', age: 29, location: 'Mombasa', bio: 'Marine biologist protecting our oceans.', community: 'Swahili', isVerified: true, isPremium: false, distance: '20 km', interests: ['Ocean', 'Travel', 'Science'] },
  { id: '8', name: 'Tendai R.', age: 26, location: 'Harare', bio: 'Graphic designer with a love for African art.', community: 'Shona', isVerified: false, isPremium: true, distance: '7 km', interests: ['Design', 'Art', 'Music'] },
];

export default function ExploreScreen() {
  const { t } = useTranslation();
  const [activeCategory, setActiveCategory] = useState('nearby');
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Isizuo</Text>
          <Text style={styles.headerSubtitle}>Discover people near you</Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.filterBtn}>
            <Ionicons name="options-outline" size={20} color={COLORS.text} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.filterBtn}>
            <Ionicons name="notifications-outline" size={20} color={COLORS.text} />
            <View style={styles.notifDot} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.searchBar}>
        <Ionicons name="search" size={18} color={COLORS.textLight} />
        <Text style={styles.searchPlaceholder}>Search by name, community, or interest...</Text>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesScroll} contentContainerStyle={styles.categoriesContent}>
        {CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat.key}
            style={[styles.categoryPill, activeCategory === cat.key && styles.categoryPillActive]}
            onPress={() => setActiveCategory(cat.key)}
          >
            <Ionicons name={cat.icon as any} size={14} color={activeCategory === cat.key ? COLORS.textInverse : COLORS.textLight} />
            <Text style={[styles.categoryText, activeCategory === cat.key && styles.categoryTextActive]}>{cat.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <FlatList
        data={SAMPLE_PROFILES}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.gridContent}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.profileCard} activeOpacity={0.85}>
            <View style={styles.profileImageContainer}>
              <View style={styles.profileImage}>
                <Text style={styles.profileInitials}>{item.name.split(' ').map(n => n[0]).join('')}</Text>
              </View>
              <View style={styles.profileOverlay}>
                <View style={styles.distanceBadge}>
                  <Ionicons name="location" size={10} color={COLORS.textInverse} />
                  <Text style={styles.distanceText}>{item.distance}</Text>
                </View>
                {item.isVerified && (
                  <View style={styles.verifiedBadge}>
                    <Ionicons name="checkmark-circle" size={16} color={COLORS.info} />
                  </View>
                )}
                {item.isPremium && (
                  <View style={styles.premiumBadge}>
                    <Ionicons name="diamond" size={12} color={COLORS.premium} />
                  </View>
                )}
              </View>
            </View>
            <View style={styles.profileInfo}>
              <View style={styles.nameRow}>
                <Text style={styles.profileName}>{item.name}, {item.age}</Text>
              </View>
              <Text style={styles.profileLocation} numberOfLines={1}>
                <Ionicons name="location-outline" size={10} color={COLORS.textLight} /> {item.location}
              </Text>
              <Text style={styles.profileBio} numberOfLines={2}>{item.bio}</Text>
              <View style={styles.interestTags}>
                {item.interests.slice(0, 2).map((interest) => (
                  <View key={interest} style={styles.interestTag}>
                    <Text style={styles.interestTagText}>{interest}</Text>
                  </View>
                ))}
              </View>
            </View>
          </TouchableOpacity>
        )}
      />
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
  headerActions: { flexDirection: 'row', gap: 8 },
  filterBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: COLORS.background, alignItems: 'center', justifyContent: 'center' },
  notifDot: { position: 'absolute', top: 6, right: 6, width: 7, height: 7, borderRadius: 3.5, backgroundColor: COLORS.primary, borderWidth: 1.5, borderColor: COLORS.card },
  searchBar: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.card, marginHorizontal: SPACING.lg,
    marginTop: SPACING.md, borderRadius: BORDER_RADIUS.xl, paddingHorizontal: SPACING.md, paddingVertical: 12,
    gap: SPACING.sm, ...SHADOWS.sm,
  },
  searchPlaceholder: { fontSize: FONT_SIZES.md, color: COLORS.textLight, flex: 1 },
  categoriesScroll: { marginTop: SPACING.md },
  categoriesContent: { paddingHorizontal: SPACING.lg, gap: SPACING.sm },
  categoryPill: {
    flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 14, paddingVertical: 8,
    borderRadius: BORDER_RADIUS.xl, backgroundColor: COLORS.card, borderWidth: 1, borderColor: COLORS.border,
  },
  categoryPillActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  categoryText: { fontSize: FONT_SIZES.sm, fontWeight: '600', color: COLORS.textLight },
  categoryTextActive: { color: COLORS.textInverse },
  row: { paddingHorizontal: SPACING.lg, gap: SPACING.sm },
  gridContent: { paddingVertical: SPACING.md, gap: SPACING.sm },
  profileCard: {
    flex: 1, backgroundColor: COLORS.card, borderRadius: BORDER_RADIUS.lg, overflow: 'hidden', marginBottom: SPACING.sm,
    borderWidth: 1, borderColor: COLORS.border,
  },
  profileImageContainer: { height: 180, position: 'relative' },
  profileImage: {
    width: '100%', height: '100%', backgroundColor: COLORS.primaryLight,
    alignItems: 'center', justifyContent: 'center',
  },
  profileInitials: { fontSize: 40, fontWeight: '800', color: COLORS.textInverse },
  profileOverlay: { position: 'absolute', top: 8, right: 8, gap: 6 },
  distanceBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 2, backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 8, paddingVertical: 4, borderRadius: BORDER_RADIUS.full, alignSelf: 'flex-start',
  },
  distanceText: { fontSize: 10, fontWeight: '600', color: COLORS.textInverse },
  verifiedBadge: { alignSelf: 'flex-start' },
  premiumBadge: { alignSelf: 'flex-start' },
  profileInfo: { padding: SPACING.sm },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  profileName: { fontSize: FONT_SIZES.md, fontWeight: '700', color: COLORS.text },
  profileLocation: { fontSize: FONT_SIZES.xs, color: COLORS.textLight, marginTop: 2 },
  profileBio: { fontSize: FONT_SIZES.xs, color: COLORS.textLight, marginTop: 4, lineHeight: 16 },
  interestTags: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginTop: 6 },
  interestTag: { backgroundColor: COLORS.primary + '12', paddingHorizontal: 8, paddingVertical: 3, borderRadius: BORDER_RADIUS.full },
  interestTagText: { fontSize: 10, fontWeight: '600', color: COLORS.primary },
});
