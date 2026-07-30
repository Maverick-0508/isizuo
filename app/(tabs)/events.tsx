import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Dimensions, Modal, Alert, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from '@/hooks';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS, SHADOWS, FONTS, GRADIENTS } from '@/constants';
import { Badge, Button, Card } from '@/components/ui';
import { Logo } from '@/components/Logo';
import { useEventStore } from '@/stores';

const { width, height } = Dimensions.get('window');

const EVENT_CATEGORIES = [
  { key: 'all', labelKey: 'explore' as const, icon: 'globe' },
  { key: 'social', labelKey: 'community_groups' as const, icon: 'people' },
  { key: 'professional', labelKey: 'professional_network' as const, icon: 'briefcase' },
  { key: 'cultural', labelKey: 'cultural_groups' as const, icon: 'earth' },
  { key: 'sports', labelKey: 'hobby_groups' as const, icon: 'football' },
];

export default function EventsScreen() {
  const { t } = useTranslation();
  const { events: storeEvents, isLoading, fetchEvents, rsvpEvent, userEvents, createEvent } = useEventStore();
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Create Event Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('');
  const [newLocation, setNewLocation] = useState('');
  const [newCategory, setNewCategory] = useState<'social' | 'professional' | 'cultural' | 'sports'>('social');
  const [newDescription, setNewDescription] = useState('');

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleCreateEventSubmit = async () => {
    if (!newTitle.trim() || !newLocation.trim()) {
      Alert.alert('Error', 'Please fill in event title and location');
      return;
    }
    await createEvent({
      title: newTitle.trim(),
      date: newDate.trim() || 'Sat, Aug 9',
      time: newTime.trim() || '6:00 PM',
      location: newLocation.trim(),
      category: newCategory,
      maxAttendees: 100,
      isFree: true,
      description: newDescription.trim() || 'Join us for a fantastic community event!',
      organizerId: 'user-1',
    });
    setShowCreateModal(false);
    setNewTitle('');
    setNewDate('');
    setNewTime('');
    setNewLocation('');
    setNewDescription('');
    Alert.alert('Event Created', 'Your new event has been published to the community!');
  };

  const events = storeEvents.length > 0 ? storeEvents : [];

  const enrichedEvents = useMemo(() => {
    return events.map((e: any) => ({
      ...e,
      rsvp: userEvents.includes(e.id),
    }));
  }, [events, userEvents]);

  const filteredEvents = useMemo(() => {
    let result = enrichedEvents;
    if (activeCategory !== 'all') {
      result = result.filter((e: any) => e.category === activeCategory);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((e: any) =>
        (e.title || '').toLowerCase().includes(q) ||
        (e.location || '').toLowerCase().includes(q) ||
        (e.description || '').toLowerCase().includes(q)
      );
    }
    return result;
  }, [enrichedEvents, activeCategory, searchQuery]);

  const handleRSVP = (eventId: string) => {
    rsvpEvent(eventId);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Logo size="sm" showText={false} />
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle} accessibilityRole="header">{t('events')}</Text>
        </View>
        <TouchableOpacity style={styles.createBtn} onPress={() => setShowCreateModal(true)} accessibilityRole="button" accessibilityLabel={t('create_event')}>
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
          <TouchableOpacity accessibilityRole="button" accessibilityLabel={t('see_all')} onPress={() => { setActiveCategory('all'); setSearchQuery(''); }}>
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

      {/* CREATE EVENT MODAL */}
      <Modal visible={showCreateModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.createModalCard}>
            <LinearGradient colors={GRADIENTS.primary} style={styles.createModalHeader}>
              <Text style={styles.createModalTitle}>Create Event</Text>
              <TouchableOpacity onPress={() => setShowCreateModal(false)}>
                <Ionicons name="close" size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </LinearGradient>

            <ScrollView showsVerticalScrollIndicator={false} style={styles.createModalBody}>
              <View style={styles.createField}>
                <Text style={styles.createLabel}>Event Title</Text>
                <TextInput
                  style={styles.createInput}
                  value={newTitle}
                  onChangeText={setNewTitle}
                  placeholder="e.g. Lagos Tech Meetup"
                  placeholderTextColor={COLORS.textLight}
                />
              </View>

              <View style={styles.createFieldRow}>
                <View style={styles.createFieldHalf}>
                  <Text style={styles.createLabel}>Date</Text>
                  <TextInput
                    style={styles.createInput}
                    value={newDate}
                    onChangeText={setNewDate}
                    placeholder="e.g. Sat, Aug 9"
                    placeholderTextColor={COLORS.textLight}
                  />
                </View>
                <View style={styles.createFieldHalf}>
                  <Text style={styles.createLabel}>Time</Text>
                  <TextInput
                    style={styles.createInput}
                    value={newTime}
                    onChangeText={setNewTime}
                    placeholder="e.g. 6:00 PM"
                    placeholderTextColor={COLORS.textLight}
                  />
                </View>
              </View>

              <View style={styles.createField}>
                <Text style={styles.createLabel}>Location</Text>
                <TextInput
                  style={styles.createInput}
                  value={newLocation}
                  onChangeText={setNewLocation}
                  placeholder="e.g. The Hub, Lagos"
                  placeholderTextColor={COLORS.textLight}
                />
              </View>

              <View style={styles.createField}>
                <Text style={styles.createLabel}>Category</Text>
                <View style={styles.createCategoryRow}>
                  {(['social', 'professional', 'cultural', 'sports'] as const).map((cat) => (
                    <TouchableOpacity
                      key={cat}
                      style={[styles.createCategoryBtn, newCategory === cat && styles.createCategoryBtnActive]}
                      onPress={() => setNewCategory(cat)}
                    >
                      <Ionicons
                        name={cat === 'social' ? 'people' : cat === 'professional' ? 'briefcase' : cat === 'cultural' ? 'globe' : 'football'}
                        size={16}
                        color={newCategory === cat ? COLORS.textInverse : COLORS.textMuted}
                      />
                      <Text style={[styles.createCategoryText, newCategory === cat && styles.createCategoryTextActive]}>
                        {cat.charAt(0).toUpperCase() + cat.slice(1)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.createField}>
                <Text style={styles.createLabel}>Description</Text>
                <TextInput
                  style={[styles.createInput, styles.createTextArea]}
                  value={newDescription}
                  onChangeText={setNewDescription}
                  placeholder="Describe your event..."
                  placeholderTextColor={COLORS.textLight}
                  multiline
                  numberOfLines={3}
                />
              </View>
            </ScrollView>

            <View style={styles.createModalFooter}>
              <Button title="Publish Event" variant="gradient" size="lg" fullWidth onPress={handleCreateEventSubmit} />
            </View>
          </View>
        </View>
      </Modal>
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
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end', padding: SPACING.lg },
  createModalCard: {
    backgroundColor: COLORS.surface, borderRadius: BORDER_RADIUS.xl, overflow: 'hidden',
    maxHeight: height * 0.85, ...SHADOWS.lg,
  },
  createModalHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: SPACING.lg,
  },
  createModalTitle: { fontSize: FONT_SIZES.lg, fontFamily: FONTS.bold, color: '#FFFFFF' },
  createModalBody: { padding: SPACING.lg },
  createField: { marginBottom: SPACING.md },
  createFieldRow: { flexDirection: 'row', gap: SPACING.md, marginBottom: SPACING.sm },
  createFieldHalf: { flex: 1, marginBottom: SPACING.md },
  createLabel: { fontSize: FONT_SIZES.sm, fontFamily: FONTS.semiBold, color: COLORS.text, marginBottom: 6 },
  createInput: {
    borderWidth: 1, borderColor: COLORS.border, borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: 14, paddingVertical: 12, fontSize: FONT_SIZES.md, color: COLORS.text,
    backgroundColor: COLORS.background,
  },
  createTextArea: { height: 80, textAlignVertical: 'top' },
  createCategoryRow: { flexDirection: 'row', gap: SPACING.sm },
  createCategoryBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4,
    paddingVertical: 10, borderRadius: BORDER_RADIUS.md, borderWidth: 1, borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  createCategoryBtnActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  createCategoryText: { fontSize: FONT_SIZES.xs, fontFamily: FONTS.semiBold, color: COLORS.textMuted },
  createCategoryTextActive: { color: COLORS.textInverse },
  createModalFooter: { padding: SPACING.lg, borderTopWidth: 1, borderTopColor: COLORS.borderLight },
});
