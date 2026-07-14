import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { router } from 'expo-router';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '@/constants';
import { useEventStore } from '@/stores';
import { useTranslation } from '@/hooks';
import { Card, Badge, Button, EmptyState } from '@/components/ui';

export default function EventsScreen() {
  const { events, userEvents, fetchEvents, rsvpEvent } = useEventStore();
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
    { key: 'all', label: 'All', icon: '🌍' },
    { key: 'social', label: 'Social', icon: '🎉' },
    { key: 'professional', label: 'Professional', icon: '💼' },
    { key: 'cultural', label: 'Cultural', icon: '🎭' },
    { key: 'religious', label: 'Religious', icon: '⛪' },
    { key: 'hobby', label: 'Hobby', icon: '🎨' },
  ];

  const displayEvents = selectedTab === 'discover'
    ? events.filter((e) => selectedCategory === 'all' || e.category === selectedCategory)
    : events.filter((e) => userEvents.includes(e.id));

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('events')}</Text>
        <Button title={t('create_event')} onPress={() => {}} variant="outline" size="sm" />
      </View>

      <View style={styles.tabRow}>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'discover' && styles.tabActive]}
          onPress={() => setSelectedTab('discover')}
        >
          <Text style={[styles.tabText, selectedTab === 'discover' && styles.tabTextActive]}>
            {t('discover_events')}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'my' && styles.tabActive]}
          onPress={() => setSelectedTab('my')}
        >
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
            >
              <Text style={styles.categoryIcon}>{cat.icon}</Text>
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
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {displayEvents.length === 0 ? (
          <EmptyState
            icon="📅"
            title="No events found"
            message="Check back later or create your own event!"
            actionLabel={t('create_event')}
            onAction={() => {}}
          />
        ) : (
          displayEvents.map((event) => (
            <Card key={event.id} style={styles.eventCard}>
              <View style={styles.eventHeader}>
                <View style={styles.eventDateBadge}>
                  <Text style={styles.eventDay}>{new Date(event.date).getDate()}</Text>
                  <Text style={styles.eventMonth}>
                    {new Date(event.date).toLocaleString('default', { month: 'short' })}
                  </Text>
                </View>
                <View style={styles.eventInfo}>
                  <Text style={styles.eventTitle}>{event.title}</Text>
                  <Text style={styles.eventLocation}>{event.location?.name || 'Location TBA'}</Text>
                  <Text style={styles.eventTime}>{event.time}</Text>
                </View>
              </View>

              <Text style={styles.eventDescription} numberOfLines={2}>
                {event.description}
              </Text>

              <View style={styles.eventFooter}>
                <View style={styles.eventMeta}>
                  <Badge label={event.category} variant="info" size="sm" />
                  <Text style={styles.attendeeCount}>
                    {event.currentAttendees}/{event.maxAttendees} attendees
                  </Text>
                </View>
                <Button
                  title={userEvents.includes(event.id) ? 'Going ✓' : t('rsvp')}
                  onPress={() => rsvpEvent(event.id)}
                  variant={userEvents.includes(event.id) ? 'success' : 'primary'}
                  size="sm"
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
  },
  tabRow: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    gap: SPACING.sm,
  },
  tab: {
    flex: 1,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    backgroundColor: COLORS.surface,
  },
  tabActive: {
    backgroundColor: COLORS.primary,
  },
  tabText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '500',
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
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: SPACING.xs,
  },
  categoryPillActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  categoryIcon: {
    fontSize: 14,
  },
  categoryLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text,
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
    width: 50,
    height: 50,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  eventDay: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
    color: COLORS.textInverse,
  },
  eventMonth: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textInverse,
    textTransform: 'uppercase',
  },
  eventInfo: {
    flex: 1,
  },
  eventTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.text,
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
  attendeeCount: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textLight,
  },
});
