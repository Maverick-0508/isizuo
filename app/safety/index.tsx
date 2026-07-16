import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  TextInput,
} from 'react-native';
import { router } from 'expo-router';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS, REPORT_REASONS, SAFETY_CHECK_INTERVALS } from '@/constants';
import { useSafetyStore, useAuthStore } from '@/stores';
import { useTranslation } from '@/hooks';
import { Card, Badge, Button, Avatar } from '@/components/ui';
import { sendSafetyAlert, sendCheckInReminder } from '@/services/sms';

export default function SafetyScreen() {
  const { activeCheckIn, startCheckIn, endCheckIn, triggerEmergency, reportUser, trustedContacts, addTrustedContact } = useSafetyStore();
  const { user } = useAuthStore();
  const { t } = useTranslation();
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState<string>('');
  const [reportDescription, setReportDescription] = useState('');
  const [showAddContact, setShowAddContact] = useState(false);
  const [contactPhone, setContactPhone] = useState('');
  const [selectedInterval, setSelectedInterval] = useState(30);

  const handleStartCheckIn = async () => {
    await startCheckIn('current-match');
    if (user?.phone) {
      sendCheckInReminder(user.phone, selectedInterval);
    }
    trustedContacts.forEach((contact) => {
      sendCheckInReminder(contact, selectedInterval);
    });
    Alert.alert('Safety Check-In Started', `We'll remind you every ${selectedInterval} minutes to check in.`);
  };

  const handleEmergency = () => {
    Alert.alert(
      '🚨 Emergency SOS',
      'This will share your location with your emergency contacts and alert them. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Trigger SOS',
          style: 'destructive',
          onPress: async () => {
            await triggerEmergency();
            const location = user?.location || { latitude: 0, longitude: 0 };
            trustedContacts.forEach((contact) => {
              sendSafetyAlert(contact, location);
            });
          },
        },
      ]
    );
  };

  const handleSubmitReport = () => {
    if (!reportReason) {
      Alert.alert('Error', 'Please select a reason');
      return;
    }
    reportUser('reported-user', reportReason as any, reportDescription);
    Alert.alert('Report Submitted', t('moderation_notice'));
    setShowReportModal(false);
    setReportReason('');
    setReportDescription('');
  };

  const handleAddContact = () => {
    if (contactPhone.length < 10) {
      Alert.alert('Error', 'Please enter a valid phone number');
      return;
    }
    addTrustedContact(contactPhone);
    setContactPhone('');
    setShowAddContact(false);
    Alert.alert('Success', 'Emergency contact added');
  };

  if (showReportModal) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setShowReportModal(false)}>
            <Text style={styles.backText}>← {t('back')}</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t('report_user')}</Text>
          <View style={{ width: 60 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Text style={styles.sectionTitle}>Why are you reporting this user?</Text>
          {REPORT_REASONS.map((reason) => (
            <TouchableOpacity
              key={reason}
              style={[styles.reasonOption, reportReason === reason && styles.reasonOptionActive]}
              onPress={() => setReportReason(reason)}
            >
              <Text style={[styles.reasonText, reportReason === reason && styles.reasonTextActive]}>
                {reason.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
              </Text>
              {reportReason === reason && <Text style={styles.checkmark}>✓</Text>}
            </TouchableOpacity>
          ))}

          <Text style={styles.sectionTitle}>Additional Details (Optional)</Text>
          <TextInput
            style={styles.textArea}
            value={reportDescription}
            onChangeText={setReportDescription}
            placeholder="Provide more details about the issue..."
            placeholderTextColor={COLORS.textLight}
            multiline
            numberOfLines={4}
          />

          <Button
            title="Submit Report"
            onPress={handleSubmitReport}
            variant="danger"
          />
        </ScrollView>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backText}>← {t('back')}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('safety_center')}</Text>
        <View style={{ width: 60 }} />
      </View>

      <View style={styles.scrollContent}>
        <Card style={styles.safetyScoreCard}>
          <Text style={styles.safetyScoreTitle}>{t('safety_score')}</Text>
          <View style={styles.safetyScoreCircle}>
            <Text style={styles.safetyScoreValue}>{user?.safetyScore || 50}%</Text>
          </View>
          <Text style={styles.safetyScoreHint}>
            Complete verification to increase your safety score
          </Text>
        </Card>

        <Text style={styles.sectionTitle}>Verification</Text>
        <Card style={styles.menuCard}>
          <TouchableOpacity style={styles.menuItem} onPress={() => {}}>
            <Text style={styles.menuIcon}>📱</Text>
            <View style={styles.menuInfo}>
              <Text style={styles.menuLabel}>{t('verify_profile')}</Text>
              <Text style={styles.menuDescription}>Verify your phone number</Text>
            </View>
            <Badge label="Done" variant="success" size="sm" />
          </TouchableOpacity>

          <TouchableOpacity style={[styles.menuItem, styles.menuItemBorder]} onPress={() => {}}>
            <Text style={styles.menuIcon}>📷</Text>
            <View style={styles.menuInfo}>
              <Text style={styles.menuLabel}>{t('photo_verification')}</Text>
              <Text style={styles.menuDescription}>{t('take_selfie')}</Text>
            </View>
            <Badge label={user?.isPhotoVerified ? 'Done' : 'Pending'} variant={user?.isPhotoVerified ? 'success' : 'warning'} size="sm" />
          </TouchableOpacity>

          <TouchableOpacity style={[styles.menuItem, styles.menuItemBorder]} onPress={() => {}}>
            <Text style={styles.menuIcon}>🪪</Text>
            <View style={styles.menuInfo}>
              <Text style={styles.menuLabel}>{t('kyc_verification')}</Text>
              <Text style={styles.menuDescription}>Verify your identity with government ID</Text>
            </View>
            <Badge label={user?.kycLevel === 'full' ? 'Done' : 'Upgrade'} variant={user?.kycLevel === 'full' ? 'success' : 'info'} size="sm" />
          </TouchableOpacity>
        </Card>

        <Text style={styles.sectionTitle}>Safety Check-In</Text>
        <Card style={styles.checkInCard}>
          {activeCheckIn && activeCheckIn.status === 'active' ? (
            <View>
              <View style={styles.activeCheckInHeader}>
                <Badge label="Active" variant="success" size="md" />
                <Text style={styles.checkInTimer}>Checking in every {activeCheckIn.checkInInterval} min</Text>
              </View>
              <Text style={styles.checkInHint}>
                Your location is being shared with your trusted contacts
              </Text>
              <View style={styles.checkInActions}>
                <Button title="Check In Now" onPress={() => {}} variant="success" />
                <Button title="End Check-In" onPress={endCheckIn} variant="outline" />
              </View>
            </View>
          ) : (
            <View>
              <Text style={styles.checkInTitle}>{t('start_check-in')}</Text>
              <Text style={styles.checkInDescription}>
                Share your location with trusted contacts when meeting someone for the first time
              </Text>
              <View style={styles.intervalRow}>
                {SAFETY_CHECK_INTERVALS.map((interval) => (
                  <TouchableOpacity
                    key={interval}
                    style={[styles.intervalChip, selectedInterval === interval && styles.intervalChipActive]}
                    onPress={() => setSelectedInterval(interval)}
                  >
                    <Text style={[styles.intervalText, selectedInterval === interval && styles.intervalTextActive]}>
                      {interval}min
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              <Button title={t('start_check-in')} onPress={handleStartCheckIn} />
            </View>
          )}
        </Card>

        <Text style={styles.sectionTitle}>Emergency</Text>
        <TouchableOpacity style={styles.sosButton} onPress={handleEmergency}>
          <Text style={styles.sosIcon}>🚨</Text>
          <Text style={styles.sosText}>{t('emergency_sos')}</Text>
          <Text style={styles.sosDescription}>
            Share your location with emergency contacts
          </Text>
        </TouchableOpacity>

        <Text style={styles.sectionTitle}>{t('trusted_contacts')}</Text>
        <Card style={styles.contactsCard}>
          {trustedContacts.length === 0 ? (
            <Text style={styles.noContacts}>No emergency contacts added yet</Text>
          ) : (
            trustedContacts.map((contact, index) => (
              <View key={index} style={styles.contactItem}>
                <Avatar size={40} />
                <Text style={styles.contactPhone}>{contact}</Text>
              </View>
            ))
          )}
          <TouchableOpacity style={styles.addContactButton} onPress={() => setShowAddContact(true)}>
            <Text style={styles.addContactText}>+ {t('add_contact')}</Text>
          </TouchableOpacity>
        </Card>

        {showAddContact && (
          <Card style={styles.addContactCard}>
            <Text style={styles.addContactTitle}>Add Emergency Contact</Text>
            <TextInput
              style={styles.phoneInput}
              value={contactPhone}
              onChangeText={setContactPhone}
              placeholder="+254 7XX XXX XXX"
              placeholderTextColor={COLORS.textLight}
              keyboardType="phone-pad"
            />
            <View style={styles.addContactActions}>
              <Button title="Add" onPress={handleAddContact} size="sm" />
              <Button title="Cancel" onPress={() => setShowAddContact(false)} variant="outline" size="sm" />
            </View>
          </Card>
        )}

        <Text style={styles.sectionTitle}>Report</Text>
        <Card style={styles.reportCard}>
          <TouchableOpacity style={styles.reportButton} onPress={() => setShowReportModal(true)}>
            <Text style={styles.reportIcon}>⚠️</Text>
            <Text style={styles.reportText}>{t('report_user')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.reportButton, styles.reportButtonBorder]} onPress={() => {}}>
            <Text style={styles.reportIcon}>🚫</Text>
            <Text style={styles.reportText}>{t('block_user')}</Text>
          </TouchableOpacity>
        </Card>
      </View>
    </ScrollView>
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
  backText: {
    color: COLORS.textInverse,
    fontSize: FONT_SIZES.md,
    fontWeight: '500',
  },
  headerTitle: {
    color: COLORS.textInverse,
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
  },
  scrollContent: {
    padding: SPACING.lg,
    paddingBottom: 100,
  },
  safetyScoreCard: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
    marginBottom: SPACING.lg,
  },
  safetyScoreTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  safetyScoreCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    borderColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  safetyScoreValue: {
    fontSize: FONT_SIZES.title,
    fontWeight: '800',
    color: COLORS.primary,
  },
  safetyScoreHint: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textLight,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.textLight,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: SPACING.sm,
    marginTop: SPACING.md,
  },
  menuCard: {
    padding: 0,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
  },
  menuItemBorder: {
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  menuIcon: {
    fontSize: 20,
    marginRight: SPACING.md,
  },
  menuInfo: {
    flex: 1,
  },
  menuLabel: {
    fontSize: FONT_SIZES.md,
    fontWeight: '500',
    color: COLORS.text,
  },
  menuDescription: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textLight,
  },
  checkInCard: {
    padding: SPACING.lg,
  },
  activeCheckInHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  checkInTimer: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text,
    fontWeight: '500',
  },
  checkInHint: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textLight,
    marginBottom: SPACING.md,
  },
  checkInActions: {
    gap: SPACING.sm,
  },
  checkInTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  checkInDescription: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textLight,
    marginBottom: SPACING.md,
    lineHeight: 20,
  },
  intervalRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  intervalChip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  intervalChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  intervalText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text,
  },
  intervalTextActive: {
    color: COLORS.textInverse,
  },
  sosButton: {
    backgroundColor: COLORS.danger + '10',
    borderWidth: 2,
    borderColor: COLORS.danger,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    alignItems: 'center',
  },
  sosIcon: {
    fontSize: 32,
    marginBottom: SPACING.sm,
  },
  sosText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.danger,
    marginBottom: SPACING.xs,
  },
  sosDescription: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textLight,
    textAlign: 'center',
  },
  contactsCard: {
    padding: SPACING.md,
  },
  noContacts: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textLight,
    textAlign: 'center',
    paddingVertical: SPACING.md,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  contactPhone: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
  },
  addContactButton: {
    alignItems: 'center',
    paddingVertical: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    marginTop: SPACING.sm,
  },
  addContactText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.primary,
    fontWeight: '500',
  },
  addContactCard: {
    marginTop: SPACING.md,
  },
  addContactTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  phoneInput: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  addContactActions: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  reportCard: {
    padding: 0,
  },
  reportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    gap: SPACING.md,
  },
  reportButtonBorder: {
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  reportIcon: {
    fontSize: 20,
  },
  reportText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    fontWeight: '500',
  },
  reasonOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  reasonOptionActive: {
    backgroundColor: COLORS.primary + '10',
  },
  reasonText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
  },
  reasonTextActive: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  checkmark: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  textArea: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    minHeight: 100,
    textAlignVertical: 'top',
    marginBottom: SPACING.lg,
  },
});
