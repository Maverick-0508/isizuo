import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from '@/hooks';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS, SHADOWS, FONTS } from '@/constants';
import { Badge, Avatar, Card, Button } from '@/components/ui';
import { Logo } from '@/components/Logo';

const { width } = Dimensions.get('window');

const CATEGORIES = [
  { key: 'nearby', label: 'Nearby', icon: 'location' },
  { key: 'online', label: 'Online Now', icon: 'radio' },
  { key: 'new', label: 'New', icon: 'sparkles' },
  { key: 'verified', label: 'Verified', icon: 'shield-checkmark' },
  { key: 'premium', label: 'Premium', icon: 'diamond' },
];

const AVATAR_COLORS = ['#B32464', '#5B4BD5', '#00A878', '#E8A820', '#DC3545', '#4A90D9', '#8B7FF5', '#00A878'];

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

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Logo size="sm" showText={false} />
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle} accessibilityRole="header">Explore</Text>
        </View>
        <TouchableOpacity style={styles.filterBtn} accessibilityRole="button" accessibilityLabel="Filter profiles">
          <Ionicons name="options-outline" size={20} color={COLORS.text} />
        </TouchableOpacity>
      </View>

      <View style={styles.searchBar} accessibilityRole="search">
        <Ionicons name="search" size={20} color={COLORS.textLight} />
        <Text style={styles.searchPlaceholder}>Search by name, community, or interest...</Text>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesScroll} contentContainerStyle={styles.categoriesContent}>
        {CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat.key}
            style={[styles.categoryPill, activeCategory === cat.key && styles.categoryPillActive]}
            onPress={() => setActiveCategory(cat.key)}
            accessibilityRole="button"
            accessibilityLabel={cat.label}
            accessibilityState={{ selected: activeCategory === cat.key }}
          >
            <Ionicons name={cat.icon as any} size={16} color={activeCategory === cat.key ? COLORS.textInverse : COLORS.textLight} />
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
        renderItem={({ item, index }) => (
          <TouchableOpacity style={styles.profileCard} activeOpacity={0.92} accessibilityRole="button" accessibilityLabel={`${item.name}, ${item.age}, ${item.location}. ${item.bio}`}>
            <View style={styles.profileImageContainer}>
              <View style={[styles.profileImage, { backgroundColor: AVATAR_COLORS[index % AVATAR_COLORS.length] + '25' }]}>
                <Text style={[styles.profileInitials, { color: AVATAR_COLORS[index % AVATAR_COLORS.length] }]}>
                  {item.name.split(' ').map(n => n[0]).join('')}
                </Text>
              </View>
              <View style={styles.profileGradient} pointerEvents="none" />
              <View style={styles.profileOverlay}>
                <View style={styles.distanceBadge}>
                  <Ionicons name="location" size={10} color={COLORS.textInverse} />
                  <Text style={styles.distanceText}>{item.distance}</Text>
                </View>
                <View style={styles.profileBadges}>
                  {item.isVerified && (
                    <Ionicons name="checkmark-circle" size={16} color={COLORS.textInverse} />
                  )}
                  {item.isPremium && (
                    <Ionicons name="diamond" size={12} color={COLORS.premium} />
                  )}
                </View>
              </View>
              <View style={styles.profileBottomOverlay} pointerEvents="none" />
              <View style={styles.profileNameOverlay}>
                <Text style={styles.profileName}>{item.name}, {item.age}</Text>
                <View style={styles.locationRow}>
                  <Ionicons name="location-outline" size={11} color="rgba(255,255,255,0.8)" />
                  <Text style={styles.profileLocation}>{item.location}</Text>
                </View>
              </View>
            </View>
            <View style={styles.profileInfo}>
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
    paddingHorizontal: SPACING.lg, paddingTop: 56, paddingBottom: SPACING.md,
  },
  headerCenter: { flex: 1, alignItems: 'center' },
  headerTitle: { fontSize: FONT_SIZES.xl, fontFamily: FONTS.extraBold, color: COLORS.text, letterSpacing: -0.6 },
  filterBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: COLORS.surface, alignItems: 'center', justifyContent: 'center', ...SHADOWS.sm },
  searchBar: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surface, marginHorizontal: SPACING.lg,
    marginTop: SPACING.sm, borderRadius: BORDER_RADIUS.xl, paddingHorizontal: SPACING.lg, paddingVertical: 16,
    gap: SPACING.md, ...SHADOWS.sm,
  },
  searchPlaceholder: { fontSize: FONT_SIZES.md, fontFamily: FONTS.regular, color: COLORS.textLight, flex: 1 },
  categoriesScroll: { marginTop: SPACING.md },
  categoriesContent: { paddingHorizontal: SPACING.lg, gap: SPACING.sm },
  categoryPill: {
    flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 18, paddingVertical: 12,
    borderRadius: BORDER_RADIUS.full, backgroundColor: COLORS.surface, ...SHADOWS.sm,
  },
  categoryPillActive: { backgroundColor: COLORS.primary },
  categoryText: { fontSize: FONT_SIZES.sm, fontFamily: FONTS.semiBold, color: COLORS.textLight },
  categoryTextActive: { color: COLORS.textInverse },
  row: { paddingHorizontal: SPACING.lg, gap: SPACING.md },
  gridContent: { paddingVertical: SPACING.md, gap: SPACING.md },
  profileCard: {
    flex: 1, backgroundColor: COLORS.card, borderRadius: BORDER_RADIUS.xl, overflow: 'hidden', marginBottom: SPACING.sm,
    ...SHADOWS.card,
  },
  profileImageContainer: { height: 220, position: 'relative' },
  profileImage: {
    width: '100%', height: '100%',
    alignItems: 'center', justifyContent: 'center',
  },
  profileInitials: { fontSize: 48, fontFamily: FONTS.extraBold, letterSpacing: -1 },
  profileGradient: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  profileOverlay: { position: 'absolute', top: 10, right: 10, left: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  distanceBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 10, paddingVertical: 5, borderRadius: BORDER_RADIUS.full,
    backdropFilter: 'blur(8px)',
  },
  distanceText: { fontSize: 12, fontFamily: FONTS.semiBold, color: COLORS.textInverse },
  profileBadges: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  profileBottomOverlay: {
    position: 'absolute', bottom: 0, left: 0, right: 0, height: 100,
    backgroundColor: 'transparent',
    backgroundImage: 'linear-gradient(transparent, rgba(0,0,0,0.6))',
  },
  profileNameOverlay: { position: 'absolute', bottom: 10, left: 12, right: 12 },
  profileName: { fontSize: FONT_SIZES.lg, fontFamily: FONTS.bold, color: '#FFFFFF', letterSpacing: -0.3 },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 2 },
  profileLocation: { fontSize: FONT_SIZES.xs, fontFamily: FONTS.medium, color: 'rgba(255,255,255,0.8)' },
  profileInfo: { padding: SPACING.md },
  profileBio: { fontSize: FONT_SIZES.sm, fontFamily: FONTS.regular, color: COLORS.textSecondary, lineHeight: 21, marginBottom: 8 },
  interestTags: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  interestTag: { backgroundColor: COLORS.primary + '10', paddingHorizontal: 12, paddingVertical: 5, borderRadius: BORDER_RADIUS.full },
  interestTagText: { fontSize: FONT_SIZES.xs, fontFamily: FONTS.semiBold, color: COLORS.primary },
});
