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
  const { events: storeEvents, isLoading, fetchEvents, rsvpEvent, unrsvpEvent, userEvents, createEvent } = useEventStore();
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

  // RSVP Confirmation State (Luma-style)
  const [showRSVPModal, setShowRSVPModal] = useState(false);
  const [rsvpTargetEvent, setRsvpTargetEvent] = useState<any>(null);
  const [rsvpStep, setRsvpStep] = useState<'form' | 'ticket'>('form');
  const [rsvpName, setRsvpName] = useState('');
  const [rsvpEmail, setRsvpEmail] = useState('');
  const [rsvpPhone, setRsvpPhone] = useState('');
  const [rsvpPlusOne, setRsvpPlusOne] = useState(false);
  const [rsvpNote, setRsvpNote] = useState('');
  const [rsvpQuestion, setRsvpQuestion] = useState('');

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

  const yourEvents = useMemo(() => enrichedEvents.filter((e: any) => e.rsvp), [enrichedEvents]);

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

  const handleRSVP = (event: any) => {
    if (event.rsvp) {
      unrsvpEvent(event.id);
      return;
    }
    setRsvpTargetEvent(event);
    setRsvpName('');
    setRsvpEmail('');
    setRsvpPhone('');
    setRsvpPlusOne(false);
    setRsvpNote('');
    setRsvpQuestion('');
    setRsvpStep('form');
    setShowRSVPModal(true);
  };

  const handleConfirmRSVP = () => {
    if (!rsvpName.trim()) {
      Alert.alert('Required', 'Please enter your name');
      return;
    }
    if (!rsvpEmail.trim()) {
      Alert.alert('Required', 'Please enter your email');
      return;
    }
    if (!rsvpPhone.trim()) {
      Alert.alert('Required', 'Please enter your phone number');
      return;
    }
    setRsvpStep('ticket');
  };

  const handleFinalizeRSVP = () => {
    rsvpEvent(rsvpTargetEvent.id);
    setShowRSVPModal(false);
    setRsvpTargetEvent(null);
    setRsvpStep('form');
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
          <TouchableOpacity key={event.id} style={styles.eventCard} activeOpacity={0.92} accessibilityRole="button" accessibilityLabel={`${event.title}, ${event.date}, ${event.time}, ${event.location}, ${event.currentAttendees} ${t('going')}`}>
            <View style={[styles.eventCover, { backgroundColor: event.color + '12' }]}>
              <View style={[styles.eventIconCircle, { backgroundColor: event.color + '20' }]}>
                <Ionicons name={EVENT_CATEGORIES.find(c => c.key === event.category)?.icon as any || 'calendar'} size={26} color={event.color} />
              </View>
              {event.rsvp && (
                <View style={styles.goingBadge}>
                  <Ionicons name="checkmark-circle" size={14} color="#FFFFFF" />
                  <Text style={styles.goingBadgeText}>Going</Text>
                </View>
              )}
            </View>
            <View style={styles.eventInfo}>
              <View style={styles.eventDateRow}>
                <Ionicons name="time-outline" size={13} color={COLORS.primary} />
                <Text style={styles.eventDate}>{event.date} • {event.time}</Text>
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
                  <Text style={styles.eventMetaText}>{event.currentAttendees ?? event.attendees ?? 0} {t('going')}</Text>
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
                  onPress={() => handleRSVP(event)}
                />
              </View>
            </View>
          </TouchableOpacity>
        ))}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle} accessibilityRole="header">{t('your_events')}</Text>
          {yourEvents.length > 0 && (
            <TouchableOpacity accessibilityRole="button" accessibilityLabel={t('see_all')} onPress={() => { setActiveCategory('all'); setSearchQuery(''); }}>
              <Text style={styles.seeAll}>{t('see_all')}</Text>
            </TouchableOpacity>
          )}
        </View>
        {yourEvents.length === 0 ? (
          <View style={styles.emptyEvents}>
            <View style={styles.emptyIconWrap}>
              <Ionicons name="calendar-outline" size={36} color={COLORS.primaryLight} />
            </View>
            <Text style={styles.emptyTitle}>{t('no_upcoming_events')}</Text>
            <Text style={styles.emptyDesc}>{t('rsvp_to_events')}</Text>
          </View>
        ) : (
          yourEvents.map((event) => (
            <TouchableOpacity key={event.id} style={styles.eventCard} activeOpacity={0.92} accessibilityRole="button" accessibilityLabel={`${event.title}, ${event.date}, ${event.time}, ${event.location}, ${event.currentAttendees} ${t('going')}`}>
              <View style={[styles.eventCover, { backgroundColor: event.color + '12' }]}>
                <View style={[styles.eventIconCircle, { backgroundColor: event.color + '20' }]}>
                  <Ionicons name={EVENT_CATEGORIES.find(c => c.key === event.category)?.icon as any || 'calendar'} size={26} color={event.color} />
                </View>
                <View style={styles.goingBadge}>
                  <Ionicons name="checkmark-circle" size={14} color="#FFFFFF" />
                  <Text style={styles.goingBadgeText}>Going</Text>
                </View>
              </View>
              <View style={styles.eventInfo}>
                <View style={styles.eventDateRow}>
                  <Ionicons name="time-outline" size={13} color={COLORS.primary} />
                  <Text style={styles.eventDate}>{event.date} • {event.time}</Text>
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
                    <Text style={styles.eventMetaText}>{event.currentAttendees ?? event.attendees ?? 0} {t('going')}</Text>
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
                    onPress={() => handleRSVP(event)}
                  />
                </View>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      {/* LUMA-STYLE RSVP MODAL */}
      <Modal visible={showRSVPModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.rsvpModalCard}>

            {rsvpStep === 'form' && rsvpTargetEvent && (
              <>
                {/* Event Header */}
                <LinearGradient
                  colors={[rsvpTargetEvent.color || GRADIENTS.primary[0], GRADIENTS.primary[1]]}
                  style={styles.rsvpEventCover}
                >
                  <TouchableOpacity style={styles.rsvpCloseBtn} onPress={() => setShowRSVPModal(false)}>
                    <Ionicons name="close" size={22} color="#FFFFFF" />
                  </TouchableOpacity>
                  <View style={styles.rsvpEventCoverContent}>
                    <View style={styles.rsvpCategoryBadge}>
                      <Ionicons name={EVENT_CATEGORIES.find(c => c.key === rsvpTargetEvent.category)?.icon as any || 'calendar'} size={12} color="#FFFFFF" />
                      <Text style={styles.rsvpCategoryBadgeText}>{rsvpTargetEvent.category}</Text>
                    </View>
                    <Text style={styles.rsvpCoverTitle}>{rsvpTargetEvent.title}</Text>
                    <View style={styles.rsvpCoverMeta}>
                      <Ionicons name="calendar-outline" size={13} color="rgba(255,255,255,0.85)" />
                      <Text style={styles.rsvpCoverMetaText}>{rsvpTargetEvent.date} • {rsvpTargetEvent.time}</Text>
                    </View>
                    <View style={styles.rsvpCoverMeta}>
                      <Ionicons name="location-outline" size={13} color="rgba(255,255,255,0.85)" />
                      <Text style={styles.rsvpCoverMetaText}>{rsvpTargetEvent.location}</Text>
                    </View>
                    <View style={styles.rsvpCoverMeta}>
                      <Ionicons name="people-outline" size={13} color="rgba(255,255,255,0.85)" />
                      <Text style={styles.rsvpCoverMetaText}>{rsvpTargetEvent.attendees || 0} attending</Text>
                    </View>
                  </View>
                </LinearGradient>

                {/* Registration Form */}
                <ScrollView showsVerticalScrollIndicator={false} style={styles.rsvpFormBody}>
                  <Text style={styles.rsvpFormSectionTitle}>Enter your details to reserve your spot</Text>

                  <Text style={styles.rsvpFormLabel}>Full Name *</Text>
                  <TextInput
                    style={styles.rsvpInput}
                    value={rsvpName}
                    onChangeText={setRsvpName}
                    placeholder="Your name"
                    placeholderTextColor={COLORS.textLight}
                  />

                  <Text style={styles.rsvpFormLabel}>Email Address *</Text>
                  <TextInput
                    style={styles.rsvpInput}
                    value={rsvpEmail}
                    onChangeText={setRsvpEmail}
                    placeholder="your@email.com"
                    placeholderTextColor={COLORS.textLight}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />

                  <Text style={styles.rsvpFormLabel}>Phone Number *</Text>
                  <TextInput
                    style={styles.rsvpInput}
                    value={rsvpPhone}
                    onChangeText={setRsvpPhone}
                    placeholder="+254 7XX XXX XXX"
                    placeholderTextColor={COLORS.textLight}
                    keyboardType="phone-pad"
                  />

                  <View style={styles.rsvpDivider} />

                  <Text style={styles.rsvpFormLabel}>How did you hear about this event?</Text>
                  <TextInput
                    style={styles.rsvpInput}
                    value={rsvpQuestion}
                    onChangeText={setRsvpQuestion}
                    placeholder="e.g. Social media, friend, community"
                    placeholderTextColor={COLORS.textLight}
                  />

                  <TouchableOpacity
                    style={styles.rsvpToggleRow}
                    onPress={() => setRsvpPlusOne(!rsvpPlusOne)}
                  >
                    <View style={[styles.rsvpCheckbox, rsvpPlusOne && styles.rsvpCheckboxActive]}>
                      {rsvpPlusOne && <Ionicons name="checkmark" size={16} color={COLORS.textInverse} />}
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.rsvpToggleText}>Bringing a guest</Text>
                      <Text style={styles.rsvpToggleSub}>They'll need to register separately</Text>
                    </View>
                  </TouchableOpacity>

                  <Text style={styles.rsvpFormLabel}>Anything else? (optional)</Text>
                  <TextInput
                    style={[styles.rsvpInput, styles.rsvpTextArea]}
                    value={rsvpNote}
                    onChangeText={setRsvpNote}
                    placeholder="Dietary restrictions, questions..."
                    placeholderTextColor={COLORS.textLight}
                    multiline
                    numberOfLines={2}
                  />
                </ScrollView>

                <View style={styles.rsvpFormFooter}>
                  <Text style={styles.rsvpFooterNote}>
                    By registering, you agree to the event terms and Isizuo's community guidelines.
                  </Text>
                  <Button title="Reserve my spot" variant="gradient" size="lg" fullWidth icon="checkmark-circle" onPress={handleConfirmRSVP} />
                </View>
              </>
            )}

            {rsvpStep === 'ticket' && rsvpTargetEvent && (
              <>
                {/* Ticket Confirmation */}
                <ScrollView showsVerticalScrollIndicator={false}>
                  <View style={styles.ticketContainer}>
                    <TouchableOpacity style={styles.rsvpCloseBtn} onPress={() => { setShowRSVPModal(false); setRsvpStep('form'); }}>
                      <Ionicons name="close" size={22} color={COLORS.text} />
                    </TouchableOpacity>

                    <View style={styles.ticketSuccessIcon}>
                      <LinearGradient colors={GRADIENTS.primary} style={styles.ticketSuccessIconInner}>
                        <Ionicons name="checkmark" size={32} color="#FFFFFF" />
                      </LinearGradient>
                    </View>

                    <Text style={styles.ticketTitle}>You're in!</Text>
                    <Text style={styles.ticketSubtitle}>
                      Your spot is reserved for {rsvpTargetEvent.title}
                    </Text>

                    <View style={styles.ticketCard}>
                      <LinearGradient colors={[COLORS.primary, COLORS.secondary]} style={styles.ticketCardGradient}>
                        <View style={styles.ticketCardHeader}>
                          <Text style={styles.ticketCardTitle}>{rsvpTargetEvent.title}</Text>
                          <Text style={styles.ticketCardCategory}>{rsvpTargetEvent.category}</Text>
                        </View>
                        <View style={styles.ticketCardBody}>
                          <View style={styles.ticketCardRow}>
                            <Ionicons name="calendar" size={16} color="rgba(255,255,255,0.8)" />
                            <Text style={styles.ticketCardRowText}>{rsvpTargetEvent.date} at {rsvpTargetEvent.time}</Text>
                          </View>
                          <View style={styles.ticketCardRow}>
                            <Ionicons name="location" size={16} color="rgba(255,255,255,0.8)" />
                            <Text style={styles.ticketCardRowText}>{rsvpTargetEvent.location}</Text>
                          </View>
                          <View style={styles.ticketCardRow}>
                            <Ionicons name="person" size={16} color="rgba(255,255,255,0.8)" />
                            <Text style={styles.ticketCardRowText}>{rsvpName}</Text>
                          </View>
                        </View>
                        <View style={styles.ticketDivider}>
                          <View style={styles.ticketDividerDotLeft} />
                          <View style={styles.ticketDividerLine} />
                          <View style={styles.ticketDividerDotRight} />
                        </View>
                        <View style={styles.ticketCardFooter}>
                          <View style={styles.ticketQRPlaceholder}>
                            <Ionicons name="qr-code" size={32} color="rgba(255,255,255,0.4)" />
                          </View>
                          <Text style={styles.ticketQRText}>Show this at check-in</Text>
                        </View>
                      </LinearGradient>
                    </View>

                    <View style={styles.ticketActions}>
                      <TouchableOpacity style={styles.ticketActionBtn}>
                        <Ionicons name="calendar" size={18} color={COLORS.primary} />
                        <Text style={styles.ticketActionText}>Add to Calendar</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.ticketActionBtn}>
                        <Ionicons name="share-social" size={18} color={COLORS.primary} />
                        <Text style={styles.ticketActionText}>Share</Text>
                      </TouchableOpacity>
                    </View>

                    <Text style={styles.ticketUpdateNote}>
                      Event updates will be sent to {rsvpEmail}
                    </Text>
                  </View>
                </ScrollView>

                <View style={styles.rsvpFormFooter}>
                  <View style={{ flex: 1 }}>
                    <Button title="Done" variant="gradient" size="lg" fullWidth onPress={handleFinalizeRSVP} />
                  </View>
                </View>
              </>
            )}

          </View>
        </View>
      </Modal>

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
  goingBadge: {
    position: 'absolute', top: 8, right: 8,
    flexDirection: 'row', alignItems: 'center', gap: 3,
    backgroundColor: COLORS.primary, paddingHorizontal: 8, paddingVertical: 3,
    borderRadius: BORDER_RADIUS.full,
  },
  goingBadgeText: { fontSize: 10, fontFamily: FONTS.bold, color: '#FFFFFF', letterSpacing: 0.3 },
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
  rsvpModalCard: {
    backgroundColor: COLORS.surface, borderRadius: BORDER_RADIUS.xl, overflow: 'hidden',
    maxHeight: height * 0.92, ...SHADOWS.lg,
  },
  rsvpEventCover: {
    paddingTop: 48, paddingBottom: SPACING.lg, paddingHorizontal: SPACING.lg,
    position: 'relative',
  },
  rsvpCloseBtn: {
    position: 'absolute', top: 12, right: 12, zIndex: 10,
    width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(0,0,0,0.25)',
    alignItems: 'center', justifyContent: 'center',
  },
  rsvpEventCoverContent: { gap: 6 },
  rsvpCategoryBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4, alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: BORDER_RADIUS.full,
  },
  rsvpCategoryBadgeText: { fontSize: 11, fontFamily: FONTS.semiBold, color: '#FFFFFF', textTransform: 'capitalize' },
  rsvpCoverTitle: { fontSize: FONT_SIZES.xxl, fontFamily: FONTS.extraBold, color: '#FFFFFF', letterSpacing: -0.8, marginTop: 4 },
  rsvpCoverMeta: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  rsvpCoverMetaText: { fontSize: 13, fontFamily: FONTS.medium, color: 'rgba(255,255,255,0.85)' },
  rsvpFormBody: { padding: SPACING.lg, maxHeight: 340 },
  rsvpFormSectionTitle: { fontSize: FONT_SIZES.md, fontFamily: FONTS.bold, color: COLORS.text, marginBottom: SPACING.md },
  rsvpFormLabel: { fontSize: FONT_SIZES.sm, fontFamily: FONTS.semiBold, color: COLORS.text, marginBottom: 6, marginTop: SPACING.md },
  rsvpInput: {
    borderWidth: 1, borderColor: COLORS.border, borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: 14, paddingVertical: 12, fontSize: FONT_SIZES.md, color: COLORS.text,
    backgroundColor: COLORS.background,
  },
  rsvpTextArea: { height: 65, textAlignVertical: 'top' },
  rsvpDivider: { height: 1, backgroundColor: COLORS.borderLight, marginVertical: SPACING.sm },
  rsvpToggleRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: SPACING.md },
  rsvpCheckbox: {
    width: 24, height: 24, borderRadius: 6, borderWidth: 2, borderColor: COLORS.border,
    alignItems: 'center', justifyContent: 'center',
  },
  rsvpCheckboxActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  rsvpToggleText: { fontSize: FONT_SIZES.md, fontFamily: FONTS.semiBold, color: COLORS.text },
  rsvpToggleSub: { fontSize: FONT_SIZES.xs, fontFamily: FONTS.regular, color: COLORS.textLight, marginTop: 1 },
  rsvpFormFooter: {
    padding: SPACING.lg, borderTopWidth: 1, borderTopColor: COLORS.borderLight, gap: SPACING.md,
  },
  rsvpFooterNote: { fontSize: FONT_SIZES.xs, fontFamily: FONTS.regular, color: COLORS.textLight, textAlign: 'center', lineHeight: 18 },
  ticketContainer: { padding: SPACING.lg, alignItems: 'center' },
  ticketSuccessIcon: { marginTop: SPACING.lg, marginBottom: SPACING.md },
  ticketSuccessIconInner: { width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center' },
  ticketTitle: { fontSize: FONT_SIZES.title, fontFamily: FONTS.extraBold, color: COLORS.text, letterSpacing: -1 },
  ticketSubtitle: { fontSize: FONT_SIZES.md, fontFamily: FONTS.regular, color: COLORS.textSecondary, textAlign: 'center', marginBottom: SPACING.lg },
  ticketCard: { width: '100%', borderRadius: BORDER_RADIUS.xl, overflow: 'hidden', ...SHADOWS.lg, marginBottom: SPACING.lg },
  ticketCardGradient: { padding: 0 },
  ticketCardHeader: { padding: SPACING.lg, paddingBottom: SPACING.md },
  ticketCardTitle: { fontSize: FONT_SIZES.lg, fontFamily: FONTS.bold, color: '#FFFFFF', letterSpacing: -0.3 },
  ticketCardCategory: { fontSize: FONT_SIZES.xs, fontFamily: FONTS.semiBold, color: 'rgba(255,255,255,0.7)', textTransform: 'capitalize', marginTop: 2 },
  ticketCardBody: { paddingHorizontal: SPACING.lg, gap: 8, paddingBottom: SPACING.lg },
  ticketCardRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  ticketCardRowText: { fontSize: FONT_SIZES.sm, fontFamily: FONTS.medium, color: 'rgba(255,255,255,0.9)' },
  ticketDivider: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: SPACING.lg,
  },
  ticketDividerDotLeft: {
    width: 20, height: 20, borderRadius: 10, backgroundColor: COLORS.surface, marginRight: -6, zIndex: 1,
  },
  ticketDividerLine: { flex: 1, height: 2, borderStyle: 'dashed', borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)' },
  ticketDividerDotRight: {
    width: 20, height: 20, borderRadius: 10, backgroundColor: COLORS.surface, marginLeft: -6, zIndex: 1,
  },
  ticketCardFooter: { padding: SPACING.lg, alignItems: 'center', gap: 8 },
  ticketQRPlaceholder: {
    width: 64, height: 64, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center', justifyContent: 'center',
  },
  ticketQRText: { fontSize: FONT_SIZES.xs, fontFamily: FONTS.medium, color: 'rgba(255,255,255,0.6)' },
  ticketActions: { flexDirection: 'row', gap: SPACING.md, marginBottom: SPACING.md },
  ticketActionBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    paddingVertical: 12, borderRadius: BORDER_RADIUS.md, borderWidth: 1, borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  ticketActionText: { fontSize: FONT_SIZES.sm, fontFamily: FONTS.semiBold, color: COLORS.primary },
  ticketUpdateNote: { fontSize: FONT_SIZES.xs, fontFamily: FONTS.regular, color: COLORS.textLight, textAlign: 'center' },
});
