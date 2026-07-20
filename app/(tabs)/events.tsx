import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from '@/hooks';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS, SHADOWS, FONTS, GRADIENTS } from '@/constants';
import { Badge, Button, Card } from '@/components/ui';
import { Logo } from '@/components/Logo';

const { width } = Dimensions.get('window');

const EVENT_CATEGORIES = [
  { key: 'all', labelKey: 'explore' as const, icon: 'globe' },
  { key: 'social', labelKey: 'community_groups' as const, icon: 'people' },
  { key: 'professional', labelKey: 'professional_network' as const, icon: 'briefcase' },
  { key: 'cultural', labelKey: 'cultural_groups' as const, icon: 'earth' },
  { key: 'sports', labelKey: 'hobby_groups' as const, icon: 'football' },
];

const SAMPLE_EVENTS = [
  { id: '1', title: 'Lagos Tech Meetup', date: 'Sat, Jul 26', time: '6:00 PM', location: 'Eko Convention Centre, Lagos', category: 'professional', attendees: 128, isFree: true, color: '#5B4BD5', description: 'Connect with Africa\'s brightest tech minds.', rsvp: false },
  { id: '2', title: 'Nairobi Sunset Mixer', date: 'Fri, Jul 25', time: '5:00 PM', location: 'Nairobi Arboretum', category: 'social', attendees: 86, isFree: true, color: '#B32464', description: 'Network over drinks and live music.', rsvp: false },
  { id: '3', title: 'Afro-Cultural Night', date: 'Sat, Aug 2', time: '7:00 PM', location: 'Addis Ababa Cultural Centre', category: 'cultural', attendees: 240, isFree: false, color: '#E8A820', description: 'Celebrate African heritage through art and dance.', rsvp: false },
  { id: '4', title: '5K Charity Run', date: 'Sun, Jul 27', time: '7:00 AM', location: 'Johannesburg Zoo Lake', category: 'sports', attendees: 64, isFree: false, color: '#00A878', description: 'Run for a cause. All proceeds go to education.', rsvp: false },
  { id: '5', title: 'Women in Business Summit', date: 'Aug 15', time: '9:00 AM', location: 'Abuja International Conference Centre', category: 'professional', attendees: 310, isFree: false, color: '#8B7FF5', description: 'Empowering women entrepreneurs across Africa.', rsvp: false },
];

export default function EventsScreen() {
  const { t } = useTranslation();
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [events, setEvents] = useState(SAMPLE_EVENTS);

  const filteredEvents = useMemo(() => {
    let result = events;
    if (activeCategory !== 'all') {
      result = result.filter(e => e.category === activeCategory);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(e =>
        e.title.toLowerCase().includes(q) ||
        e.location.toLowerCase().includes(q) ||
        e.description.toLowerCase().includes(q)
      );
    }
    return result;
  }, [events, activeCategory, searchQuery]);

  const handleRSVP = (eventId: string) => {
    setEvents(prev => prev.map(e =>
      e.id === eventId
        ? { ...e, rsvp: !e.rsvp, attendees: e.rsvp ? e.attendees - 1 : e.attendees + 1 }
        : e
    ));
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Logo size="sm" showText={false} />
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle} accessibilityRole="header">{t('events')}</Text>
        </View>
        <TouchableOpacity style={styles.createBtn} accessibilityRole="button" accessibilityLabel={t('create_event')}>
          <Ionicons name="add" size={24} color={COLORS.textInverse} />
        </TouchableOpacity>
      </View>

      <View style={styles.searchBar} accessibilityRole="search">
        <Ionicons name="search" size={20} color={COLORS.textLight} />
        <TextInput
          style={styles.searchInput}
          placeholder={t('search_events')}
          placeholderTextColor={COLORS.textLight}
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoCapitalize="none"
          autoCorrect={false}
          accessibilityLabel={t('search_events')}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')} accessibilityRole="button" accessibilityLabel={t('cancel')}>
            <Ionicons name="close-circle" size={20} color={COLORS.textLight} />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesScroll} contentContainerStyle={styles.categoriesContent}>
        {EVENT_CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat.key}
            style={[styles.categoryPill, activeCategory === cat.key && styles.categoryPillActive]}
            onPress={() => setActiveCategory(cat.key)}
            accessibilityRole="button"
            accessibilityLabel={t(cat.labelKey)}
            accessibilityState={{ selected: activeCategory === cat.key }}
          >
            <Ionicons name={cat.icon as any} size={16} color={activeCategory === cat.key ? COLORS.textInverse : COLORS.textLight} />
            <Text style={[styles.categoryText, activeCategory === cat.key && styles.categoryTextActive]}>{t(cat.labelKey)}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle} accessibilityRole="header">{t('featured_events')}</Text>
          <TouchableOpacity accessibilityRole="button" accessibilityLabel={t('see_all')}>
            <Text style={styles.seeAll}>{t('see_all')}</Text>
          </TouchableOpacity>
        </View>

        {filteredEvents.length === 0 && (
          <View style={styles.emptyEvents}>
            <View style={styles.emptyIconWrap}>
              <Ionicons name="search-outline" size={36} color={COLORS.primaryLight} />
            </View>
            <Text style={styles.emptyTitle}>{t('no_upcoming_events')}</Text>
            <Text style={styles.emptyDesc}>{t('rsvp_to_events')}</Text>
          </View>
        )}

        {filteredEvents.map((event) => (
          <TouchableOpacity key={event.id} style={styles.eventCard} activeOpacity={0.92} accessibilityRole="button" accessibilityLabel={`${event.title}, ${event.date}, ${event.time}, ${event.location}, ${event.attendees} ${t('going')}`}>
            <View style={[styles.eventCover, { backgroundColor: event.color + '12' }]}>
              <View style={[styles.eventIconCircle, { backgroundColor: event.color + '20' }]}>
                <Ionicons name={EVENT_CATEGORIES.find(c => c.key === event.category)?.icon as any || 'calendar'} size={26} color={event.color} />
              </View>
            </View>
            <View style={styles.eventInfo}>
              <View style={styles.eventDateRow}>
                <Ionicons name="time-outline" size={13} color={COLORS.primary} />
                <Text style={styles.eventDate}>{event.date} \u2022 {event.time}</Text>
              </View>
              <Text style={styles.eventTitle}>{event.title}</Text>
              <Text style={styles.eventDesc} numberOfLines={2}>{event.description}</Text>
              <View style={styles.eventMeta}>
                <View style={styles.eventMetaItem}>
                  <Ionicons name="location-outline" size={13} color={COLORS.textLight} />
                  <Text style={styles.eventMetaText} numberOfLines={1}>{event.location}</Text>
                </View>
                <View style={styles.eventMetaItem}>
                  <Ionicons name="people-outline" size={13} color={COLORS.textLight} />
                  <Text style={styles.eventMetaText}>{event.attendees} {t('going')}</Text>
                </View>
              </View>
              <View style={styles.eventActions}>
                {event.isFree ? (
                  <Badge label={t('free')} variant="success" icon="checkmark-circle" />
                ) : (
                  <Badge label={t('paid')} variant="info" icon="card" />
                )}
                <Button
                  title={event.rsvp ? t('cancel') : t('rsvp')}
                  variant={event.rsvp ? 'outline' : 'primary'}
                  size="sm"
                  icon={event.rsvp ? 'close' : 'checkmark'}
                  onPress={() => handleRSVP(event.id)}
                />
              </View>
            </View>
          </TouchableOpacity>
        ))}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle} accessibilityRole="header">{t('your_events')}</Text>
          <TouchableOpacity accessibilityRole="button" accessibilityLabel={t('see_all')}>
            <Text style={styles.seeAll}>{t('see_all')}</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.emptyEvents}>
          <View style={styles.emptyIconWrap}>
            <Ionicons name="calendar-outline" size={36} color={COLORS.primaryLight} />
          </View>
          <Text style={styles.emptyTitle}>{t('no_upcoming_events')}</Text>
          <Text style={styles.emptyDesc}>{t('rsvp_to_events')}</Text>
        </View>
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
  categoriesScroll: { marginTop: SPACING.md },
  categoriesContent: { paddingHorizontal: SPACING.lg, gap: SPACING.sm },
  categoryPill: {
    flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 18, paddingVertical: 12,
    borderRadius: BORDER_RADIUS.full, backgroundColor: COLORS.surface, ...SHADOWS.sm,
  },
  categoryPillActive: { backgroundColor: COLORS.primary },
  categoryText: { fontSize: FONT_SIZES.sm, fontFamily: FONTS.semiBold, color: COLORS.textLight },
  categoryTextActive: { color: COLORS.textInverse },
  content: { flex: 1, paddingHorizontal: SPACING.lg, paddingTop: SPACING.md },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.md, marginTop: SPACING.sm },
  sectionTitle: { fontSize: FONT_SIZES.lg, fontFamily: FONTS.bold, color: COLORS.text, letterSpacing: -0.3 },
  seeAll: { fontSize: FONT_SIZES.sm, fontFamily: FONTS.semiBold, color: COLORS.primary },
  eventCard: {
    backgroundColor: COLORS.surface, borderRadius: BORDER_RADIUS.xl, overflow: 'hidden',
    marginBottom: SPACING.md, ...SHADOWS.card,
  },
  eventCover: { height: 90, alignItems: 'center', justifyContent: 'center' },
  eventIconCircle: { width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center' },
  eventInfo: { padding: SPACING.lg },
  eventDateRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 8 },
  eventDate: { fontSize: FONT_SIZES.xs, fontFamily: FONTS.semiBold, color: COLORS.primary },
  eventTitle: { fontSize: FONT_SIZES.lg, fontFamily: FONTS.bold, color: COLORS.text, marginBottom: 4, letterSpacing: -0.3 },
  eventDesc: { fontSize: FONT_SIZES.sm, fontFamily: FONTS.regular, color: COLORS.textLight, marginBottom: 12, lineHeight: 21 },
  eventMeta: { gap: 6, marginBottom: 14 },
  eventMetaItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  eventMetaText: { fontSize: FONT_SIZES.xs, fontFamily: FONTS.regular, color: COLORS.textLight, flex: 1 },
  eventActions: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
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
