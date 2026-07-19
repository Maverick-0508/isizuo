import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from '@/hooks';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS, SHADOWS, FONTS } from '@/constants';
import { Badge, Button, Card } from '@/components/ui';
import { Logo } from '@/components/Logo';

const { width } = Dimensions.get('window');

const EVENT_CATEGORIES = [
  { key: 'all', label: 'All Events', icon: 'globe' },
  { key: 'social', label: 'Social', icon: 'people' },
  { key: 'professional', label: 'Professional', icon: 'briefcase' },
  { key: 'cultural', label: 'Cultural', icon: 'earth' },
  { key: 'sports', label: 'Sports', icon: 'football' },
];

const SAMPLE_EVENTS = [
  { id: '1', title: 'Lagos Tech Meetup', date: 'Sat, Jul 26', time: '6:00 PM', location: 'Eko Convention Centre, Lagos', category: 'professional', attendees: 128, isFree: true, color: '#6C5CE7', description: 'Connect with Africa\'s brightest tech minds.' },
  { id: '2', title: 'Nairobi Sunset Mixer', date: 'Fri, Jul 25', time: '5:00 PM', location: 'Nairobi Arboretum', category: 'social', attendees: 86, isFree: true, color: '#E84393', description: 'Network over drinks and live music.' },
  { id: '3', title: 'Afro-Cultural Night', date: 'Sat, Aug 2', time: '7:00 PM', location: 'Addis Ababa Cultural Centre', category: 'cultural', attendees: 240, isFree: false, color: '#FDCB6E', description: 'Celebrate African heritage through art and dance.' },
  { id: '4', title: '5K Charity Run', date: 'Sun, Jul 27', time: '7:00 AM', location: 'Johannesburg Zoo Lake', category: 'sports', attendees: 64, isFree: false, color: '#00B894', description: 'Run for a cause. All proceeds go to education.' },
  { id: '5', title: 'Women in Business Summit', date: 'Aug 15', time: '9:00 AM', location: 'Abuja International Conference Centre', category: 'professional', attendees: 310, isFree: false, color: '#A29BFE', description: 'Empowering women entrepreneurs across Africa.' },
];

export default function EventsScreen() {
  const { t } = useTranslation();
  const [activeCategory, setActiveCategory] = useState('all');

  const filteredEvents = activeCategory === 'all'
    ? SAMPLE_EVENTS
    : SAMPLE_EVENTS.filter(e => e.category === activeCategory);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Logo size="sm" showText={false} />
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>{t('events')}</Text>
        </View>
        <TouchableOpacity style={styles.createBtn}>
          <Ionicons name="add" size={22} color={COLORS.textInverse} />
        </TouchableOpacity>
      </View>

      <View style={styles.searchBar}>
        <Ionicons name="search" size={18} color={COLORS.textLight} />
        <Text style={styles.searchPlaceholder}>Search events...</Text>
        <TouchableOpacity style={styles.searchFilter}>
          <Ionicons name="options-outline" size={16} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesScroll} contentContainerStyle={styles.categoriesContent}>
        {EVENT_CATEGORIES.map((cat) => (
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

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Featured Events</Text>
          <TouchableOpacity>
            <Text style={styles.seeAll}>See all</Text>
          </TouchableOpacity>
        </View>

        {filteredEvents.map((event) => (
          <TouchableOpacity key={event.id} style={styles.eventCard} activeOpacity={0.85}>
            <View style={[styles.eventCover, { backgroundColor: event.color + '12' }]}>
              <View style={[styles.eventIconCircle, { backgroundColor: event.color + '20' }]}>
                <Ionicons name={EVENT_CATEGORIES.find(c => c.key === event.category)?.icon as any || 'calendar'} size={24} color={event.color} />
              </View>
            </View>
            <View style={styles.eventInfo}>
              <View style={styles.eventDateRow}>
                <Ionicons name="time-outline" size={12} color={COLORS.primary} />
                <Text style={styles.eventDate}>{event.date} \u2022 {event.time}</Text>
              </View>
              <Text style={styles.eventTitle}>{event.title}</Text>
              <Text style={styles.eventDesc} numberOfLines={2}>{event.description}</Text>
              <View style={styles.eventMeta}>
                <View style={styles.eventMetaItem}>
                  <Ionicons name="location-outline" size={12} color={COLORS.textLight} />
                  <Text style={styles.eventMetaText} numberOfLines={1}>{event.location}</Text>
                </View>
                <View style={styles.eventMetaItem}>
                  <Ionicons name="people-outline" size={12} color={COLORS.textLight} />
                  <Text style={styles.eventMetaText}>{event.attendees} going</Text>
                </View>
              </View>
              <View style={styles.eventActions}>
                {event.isFree ? (
                  <Badge label="Free" variant="success" icon="checkmark-circle" />
                ) : (
                  <Badge label="Paid" variant="info" icon="card" />
                )}
                <Button title="RSVP" variant="primary" size="sm" icon="checkmark" onPress={() => {}} />
              </View>
            </View>
          </TouchableOpacity>
        ))}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Your Events</Text>
          <TouchableOpacity>
            <Text style={styles.seeAll}>See all</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.emptyEvents}>
          <View style={styles.emptyIconWrap}>
            <Ionicons name="calendar-outline" size={32} color={COLORS.primaryLight} />
          </View>
          <Text style={styles.emptyTitle}>No upcoming events</Text>
          <Text style={styles.emptyDesc}>RSVP to events to see them here</Text>
        </View>
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
  searchFilter: { padding: 4 },
  categoriesScroll: { marginTop: SPACING.md },
  categoriesContent: { paddingHorizontal: SPACING.lg, gap: SPACING.sm },
  categoryPill: {
    flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 16, paddingVertical: 10,
    borderRadius: BORDER_RADIUS.full, backgroundColor: COLORS.card, borderWidth: 1.5, borderColor: COLORS.border,
  },
  categoryPillActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  categoryText: { fontSize: 13, fontFamily: FONTS.semiBold, color: COLORS.textLight },
  categoryTextActive: { color: COLORS.textInverse },
  content: { flex: 1, paddingHorizontal: SPACING.lg, paddingTop: SPACING.md },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.md, marginTop: SPACING.sm },
  sectionTitle: { fontSize: FONT_SIZES.lg, fontFamily: FONTS.bold, color: COLORS.text },
  seeAll: { fontSize: FONT_SIZES.sm, fontFamily: FONTS.semiBold, color: COLORS.primary },
  eventCard: {
    backgroundColor: COLORS.card, borderRadius: BORDER_RADIUS.lg, overflow: 'hidden',
    marginBottom: SPACING.md, borderWidth: 1, borderColor: COLORS.border,
  },
  eventCover: { height: 80, alignItems: 'center', justifyContent: 'center' },
  eventIconCircle: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  eventInfo: { padding: SPACING.md },
  eventDateRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 6 },
  eventDate: { fontSize: 12, fontFamily: FONTS.semiBold, color: COLORS.primary },
  eventTitle: { fontSize: FONT_SIZES.lg, fontFamily: FONTS.bold, color: COLORS.text, marginBottom: 4 },
  eventDesc: { fontSize: 13, fontFamily: FONTS.regular, color: COLORS.textLight, marginBottom: 10, lineHeight: 19 },
  eventMeta: { gap: 4, marginBottom: 12 },
  eventMetaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  eventMetaText: { fontSize: 12, fontFamily: FONTS.regular, color: COLORS.textLight, flex: 1 },
  eventActions: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  emptyEvents: {
    alignItems: 'center', paddingVertical: SPACING.xl * 2, backgroundColor: COLORS.card,
    borderRadius: BORDER_RADIUS.lg, borderWidth: 1, borderColor: COLORS.border,
  },
  emptyIconWrap: {
    width: 64, height: 64, borderRadius: 32, backgroundColor: COLORS.primary + '10',
    alignItems: 'center', justifyContent: 'center', marginBottom: SPACING.md,
  },
  emptyTitle: { fontSize: FONT_SIZES.md, fontFamily: FONTS.bold, color: COLORS.text },
  emptyDesc: { fontSize: 13, fontFamily: FONTS.regular, color: COLORS.textLight, marginTop: 4 },
});
