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
import { useEventStore, useAuthStore } from '@/stores';
import { useTranslation } from '@/hooks';
import { Card, Badge, Button, EmptyState } from '@/components/ui';
import { sendEventReminder } from '@/services/sms';

const SAMPLE_EVENTS = [
  {
    id: '1', title: 'Lagos Tech Meetup', description: 'Connect with Africa\'s brightest tech minds. Lightning talks, networking, and free food.',
    date: '2026-08-15', time: '6:00 PM', category: 'professional', location: { name: 'Eko Hotel, Lagos' },
    currentAttendees: 89, maxAttendees: 200,
  },
  {
    id: '2', title: 'Nairobi Food Festival', description: 'Taste the best of East African cuisine. Over 50 vendors and live music.',
    date: '2026-08-22', time: '11:00 AM', category: 'social', location: { name: 'Uhuru Gardens, Nairobi' },
    currentAttendees: 234, maxAttendees: 500,
  },
  {
    id: '3', title: 'Kigali Cultural Night', description: 'An evening of Rwandan poetry, dance, and storytelling under the stars.',
    date: '2026-09-05', time: '7:30 PM', category: 'cultural', location: { name: 'Kigali Convention Centre' },
    currentAttendees: 45, maxAttendees: 150,
  },
  {
    id: '4', title: 'Accra Marathon 2026', description: 'Run for a cause! proceeds go to building schools in rural communities.',
    date: '2026-09-12', time: '6:00 AM', category: 'social', location: { name: 'Independence Square, Accra' },
    currentAttendees: 312, maxAttendees: 1000,
  },
  {
    id: '5', title: 'Ethiopian Coffee Ceremony', description: 'Experience the traditional Ethiopian coffee ceremony and learn about its cultural significance.',
    date: '2026-09-20', time: '3:00 PM', category: 'cultural', location: { name: 'Addis Ababa Cultural Center' },
    currentAttendees: 28, maxAttendees: 60,
  },
];

export default function EventsScreen() {
  const { events, userEvents, fetchEvents, rsvpEvent } = useEventStore();
  const { user } = useAuthStore();
  const { t } = useTranslation();
  const [selectedTab, setSelectedTab] = useState<'discover' | 'my'>('discover');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchEvents();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchEvents();
    setRefreshing(false);
  };

  const categories = [
    { key: 'all', label: 'All', icon: 'globe-outline' as const },
    { key: 'social', label: 'Social', icon: 'people-outline' as const },
    { key: 'professional', label: 'Work', icon: 'briefcase-outline' as const },
    { key: 'cultural', label: 'Cultural', icon: 'color-palette-outline' as const },
    { key: 'religious', label: 'Faith', icon: 'book-outline' as const },
    { key: 'hobby', label: 'Hobby', icon: 'heart-outline' as const },
  ];

  const displayEvents = events.length > 0
    ? (selectedTab === 'discover'
        ? events.filter((e) => selectedCategory === 'all' || e.category === selectedCategory)
        : events.filter((e) => userEvents.includes(e.id)))
    : (selectedTab === 'discover'
        ? SAMPLE_EVENTS.filter((e) => selectedCategory === 'all' || e.category === selectedCategory)
        : []);

  const categoryColors: Record<string, string> = {
    social: COLORS.primary,
    professional: COLORS.info,
    cultural: COLORS.accentDark,
    religious: '#6F42C1',
    hobby: COLORS.secondary,
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('events')}</Text>
        <TouchableOpacity style={styles.createBtn} activeOpacity={0.7}>
          <Ionicons name="add" size={22} color={COLORS.textInverse} />
        </TouchableOpacity>
      </View>

      <View style={styles.tabRow}>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'discover' && styles.tabActive]}
          onPress={() => setSelectedTab('discover')}
          activeOpacity={0.7}
        >
          <Ionicons name="compass-outline" size={16} color={selectedTab === 'discover' ? COLORS.textInverse : COLORS.textLight} />
          <Text style={[styles.tabText, selectedTab === 'discover' && styles.tabTextActive]}>
            {t('discover_events')}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'my' && styles.tabActive]}
          onPress={() => setSelectedTab('my')}
          activeOpacity={0.7}
        >
          <Ionicons name="bookmark-outline" size={16} color={selectedTab === 'my' ? COLORS.textInverse : COLORS.textLight} />
          <Text style={[styles.tabText, selectedTab === 'my' && styles.tabTextActive]}>
            {t('my_events')}
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
        {displayEvents.length === 0 ? (
          <EmptyState
            icon="calendar-outline"
            title="No events found"
            message="Check back later or create your own event!"
            actionLabel={t('create_event')}
            onAction={() => {}}
          />
        ) : (
          displayEvents.map((event) => (
            <Card key={event.id} style={styles.eventCard}>
              <View style={styles.eventHeader}>
                <View style={[styles.eventDateBadge, { backgroundColor: (categoryColors[event.category] || COLORS.primary) + '15' }]}>
                  <Text style={[styles.eventDay, { color: categoryColors[event.category] || COLORS.primary }]}>
                    {new Date(event.date).getDate()}
                  </Text>
                  <Text style={[styles.eventMonth, { color: categoryColors[event.category] || COLORS.primary }]}>
                    {new Date(event.date).toLocaleString('default', { month: 'short' })}
                  </Text>
                </View>
                <View style={styles.eventInfo}>
                  <Text style={styles.eventTitle}>{event.title}</Text>
                  <View style={styles.eventMetaRow}>
                    <Ionicons name="location-outline" size={12} color={COLORS.textLight} />
                    <Text style={styles.eventLocation}>{event.location?.name || 'TBA'}</Text>
                  </View>
                  <View style={styles.eventMetaRow}>
                    <Ionicons name="time-outline" size={12} color={COLORS.textLight} />
                    <Text style={styles.eventTime}>{event.time}</Text>
                  </View>
                </View>
              </View>

              <Text style={styles.eventDescription} numberOfLines={2}>
                {event.description}
              </Text>

              <View style={styles.eventFooter}>
                <View style={styles.eventMeta}>
                  <Badge label={event.category} variant="info" size="sm" />
                  <View style={styles.attendeeRow}>
                    <Ionicons name="people-outline" size={12} color={COLORS.textLight} />
                    <Text style={styles.attendeeCount}>
                      {event.currentAttendees}/{event.maxAttendees}
                    </Text>
                  </View>
                </View>
                <Button
                  title={userEvents.includes(event.id) ? 'Going' : t('rsvp')}
                  onPress={() => {
                    rsvpEvent(event.id);
                    if (user?.phone && !userEvents.includes(event.id)) {
                      sendEventReminder(user.phone, event.title, `${event.date} ${event.time}`);
                    }
                  }}
                  variant={userEvents.includes(event.id) ? 'success' : 'primary'}
                  size="sm"
                  icon={userEvents.includes(event.id) ? 'checkmark' : undefined}
                />
              </View>
            </Card>
          ))
        )}
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  createBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
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
  eventCard: {
    marginBottom: SPACING.md,
  },
  eventHeader: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: SPACING.md,
  },
  eventDateBadge: {
    width: 52,
    height: 52,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  eventDay: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '800',
  },
  eventMonth: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  eventInfo: {
    flex: 1,
    justifyContent: 'center',
    gap: 2,
  },
  eventTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.text,
  },
  eventMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  eventLocation: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textLight,
  },
  eventTime: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.primary,
    fontWeight: '500',
  },
  eventDescription: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    lineHeight: 20,
    marginBottom: SPACING.md,
  },
  eventFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  eventMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  attendeeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  attendeeCount: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textLight,
  },
});
