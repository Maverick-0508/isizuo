import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from '@/hooks';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS, SHADOWS } from '@/constants';
import { Badge, Button, Card } from '@/components/ui';

const { width } = Dimensions.get('window');

const EVENT_CATEGORIES = [
  { key: 'all', label: 'All Events', icon: 'globe' },
  { key: 'social', label: 'Social', icon: 'people' },
  { key: 'professional', label: 'Professional', icon: 'briefcase' },
  { key: 'cultural', label: 'Cultural', icon: 'earth' },
  { key: 'sports', label: 'Sports', icon: 'football' },
];

const SAMPLE_EVENTS = [
  {
    id: '1', title: 'Lagos Tech Meetup', date: 'Sat, Jul 26', time: '6:00 PM',
    location: 'Eko Convention Centre, Lagos', category: 'professional',
    attendees: 128, isFree: true, color: '#6C5CE7',
    description: 'Connect with Africa\'s brightest tech minds.',
  },
  {
    id: '2', title: 'Nairobi Sunset Mixer', date: 'Fri, Jul 25', time: '5:00 PM',
    location: 'Nairobi Arboretum', category: 'social',
    attendees: 86, isFree: true, color: '#E84393',
    description: 'Network over drinks and live music.',
  },
  {
    id: '3', title: 'Afro-Cultural Night', date: 'Sat, Aug 2', time: '7:00 PM',
    location: 'Addis Ababa Cultural Centre', category: 'cultural',
    attendees: 240, isFree: false, color: '#FDCB6E',
    description: 'Celebrate African heritage through art and dance.',
  },
  {
    id: '4', title: '5K Charity Run', date: 'Sun, Jul 27', time: '7:00 AM',
    location: 'Johannesburg Zoo Lake', category: 'sports',
    attendees: 64, isFree: false, color: '#00B894',
    description: 'Run for a cause. All proceeds go to education.',
  },
  {
    id: '5', title: 'Women in Business Summit', date: 'Aug 15', time: '9:00 AM',
    location: 'Abuja International Conference Centre', category: 'professional',
    attendees: 310, isFree: false, color: '#A29BFE',
    description: 'Empowering women entrepreneurs across Africa.',
  },
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
        <View>
          <Text style={styles.headerTitle}>{t('events')}</Text>
          <Text style={styles.headerSubtitle}>Discover events near you</Text>
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

        {filteredEvents.map((event, index) => (
          <TouchableOpacity key={event.id} style={[styles.eventCard, index === 0 && styles.eventCardFirst]} activeOpacity={0.85}>
            <View style={[styles.eventCover, { backgroundColor: event.color + '18' }]}>
              <View style={[styles.eventIconCircle, { backgroundColor: event.color + '25' }]}>
                <Ionicons name={EVENT_CATEGORIES.find(c => c.key === event.category)?.icon as any || 'calendar'} size={24} color={event.color} />
              </View>
            </View>
            <View style={styles.eventInfo}>
              <View style={styles.eventDateBadge}>
                <Text style={styles.eventDateText}>{event.date}</Text>
                <Text style={styles.eventTimeText}>{event.time}</Text>
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
                <Button title="RSVP" variant="primary" size="sm" icon="checkmark" />
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
          <Ionicons name="calendar-outline" size={40} color={COLORS.primaryLight} />
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
  searchFilter: { padding: 4 },
  categoriesScroll: { marginTop: SPACING.md },
  categoriesContent: { paddingHorizontal: SPACING.lg, gap: SPACING.sm },
  categoryPill: {
    flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 14, paddingVertical: 8,
    borderRadius: BORDER_RADIUS.xl, backgroundColor: COLORS.card, borderWidth: 1, borderColor: COLORS.border,
  },
  categoryPillActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  categoryText: { fontSize: FONT_SIZES.sm, fontWeight: '600', color: COLORS.textLight },
  categoryTextActive: { color: COLORS.textInverse },
  content: { flex: 1, paddingHorizontal: SPACING.lg, paddingTop: SPACING.md },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.md, marginTop: SPACING.sm },
  sectionTitle: { fontSize: FONT_SIZES.lg, fontWeight: '700', color: COLORS.text },
  seeAll: { fontSize: FONT_SIZES.sm, fontWeight: '600', color: COLORS.primary },
  eventCard: {
    backgroundColor: COLORS.card, borderRadius: BORDER_RADIUS.lg, overflow: 'hidden',
    marginBottom: SPACING.md, borderWidth: 1, borderColor: COLORS.border,
  },
  eventCardFirst: { marginTop: 0 },
  eventCover: {
    height: 100, alignItems: 'center', justifyContent: 'center',
  },
  eventIconCircle: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
  eventInfo: { padding: SPACING.md },
  eventDateBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6,
  },
  eventDateText: { fontSize: FONT_SIZES.xs, fontWeight: '700', color: COLORS.primary },
  eventTimeText: { fontSize: FONT_SIZES.xs, color: COLORS.textLight },
  eventTitle: { fontSize: FONT_SIZES.lg, fontWeight: '800', color: COLORS.text, marginBottom: 4 },
  eventDesc: { fontSize: FONT_SIZES.sm, color: COLORS.textLight, marginBottom: 8, lineHeight: 18 },
  eventMeta: { gap: 4, marginBottom: 10 },
  eventMetaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  eventMetaText: { fontSize: FONT_SIZES.xs, color: COLORS.textLight, flex: 1 },
  eventActions: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  emptyEvents: {
    alignItems: 'center', paddingVertical: SPACING.xl * 2, backgroundColor: COLORS.card,
    borderRadius: BORDER_RADIUS.lg, borderWidth: 1, borderColor: COLORS.border,
  },
  emptyTitle: { fontSize: FONT_SIZES.md, fontWeight: '700', color: COLORS.text, marginTop: SPACING.md },
  emptyDesc: { fontSize: FONT_SIZES.sm, color: COLORS.textLight, marginTop: 4 },
});
