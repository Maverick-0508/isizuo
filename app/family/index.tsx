import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '@/constants';
import { useTranslation } from '@/hooks';
import { useAuthStore } from '@/stores';
import { Card, Badge, Button, Avatar } from '@/components/ui';
import { sendFamilyEndorsementRequest } from '@/services/sms';

interface Endorsement {
  id: string;
  endorserName: string;
  relationship: string;
  message: string;
  status: 'approved' | 'pending' | 'declined';
  createdAt: string;
}

export default function FamilyScreen() {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [endorserName, setEndorserName] = useState('');
  const [relationship, setRelationship] = useState('');
  const [message, setMessage] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [endorsements, setEndorsements] = useState<Endorsement[]>([
    {
      id: '1',
      endorserName: 'Mama Achieng',
      relationship: 'Mother',
      message: 'My daughter is a kind and loving person. She values family and community.',
      status: 'approved',
      createdAt: new Date().toISOString(),
    },
    {
      id: '2',
      endorserName: 'Uncle Kofi',
      relationship: 'Uncle',
      message: 'A responsible young man with strong moral values. I fully endorse him.',
      status: 'pending',
      createdAt: new Date().toISOString(),
    },
  ]);

  const relationships = [
    'Parent', 'Sibling', 'Aunt/Uncle', 'Community Elder',
    'Friend', 'Colleague', 'Religious Leader', 'Other',
  ];

  const handleRequestEndorsement = async () => {
    if (!endorserName || !relationship) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    const newEndorsement: Endorsement = {
      id: Date.now().toString(),
      endorserName,
      relationship,
      message,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    setEndorsements([newEndorsement, ...endorsements]);
    setShowRequestForm(false);
    setEndorserName('');
    setRelationship('');
    setMessage('');

    if (contactPhone) {
      await sendFamilyEndorsementRequest(contactPhone, endorserName, user?.name || 'Isizuo user');
    }

    Alert.alert('Success', 'Endorsement request sent!');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'success';
      case 'pending': return 'warning';
      case 'declined': return 'error';
      default: return 'info';
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backText}>← {t('back')}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('family_endorsement')}</Text>
        <View style={{ width: 60 }} />
      </View>

      <View style={styles.scrollContent}>
        <View style={styles.introSection}>
          <Text style={styles.introIcon}>👨‍👩‍👧</Text>
          <Text style={styles.introTitle}>Family-Endorsed Matching</Text>
          <Text style={styles.introDescription}>
            Get endorsements from family and community members to build trust and show
            you're serious about meaningful connections.
          </Text>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {endorsements.filter((e) => e.status === 'approved').length}
            </Text>
            <Text style={styles.statLabel}>Approved</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {endorsements.filter((e) => e.status === 'pending').length}
            </Text>
            <Text style={styles.statLabel}>Pending</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{endorsements.length}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
        </View>

        <Button
          title={t('request_endorsement')}
          onPress={() => setShowRequestForm(!showRequestForm)}
          variant="primary"
        />

        {showRequestForm && (
          <Card style={styles.formCard}>
            <Text style={styles.formTitle}>Request Endorsement</Text>

            <Text style={styles.label}>Endorser Phone *</Text>
            <TextInput
              style={styles.textInput}
              value={contactPhone}
              onChangeText={setContactPhone}
              placeholder="+254 7XX XXX XXX"
              placeholderTextColor={COLORS.textLight}
              keyboardType="phone-pad"
            />

            <Text style={styles.label}>Endorser Name *</Text>
            <TextInput
              style={styles.textInput}
              value={endorserName}
              onChangeText={setEndorserName}
              placeholder="Enter their full name"
              placeholderTextColor={COLORS.textLight}
            />

            <Text style={styles.label}>Relationship *</Text>
            <View style={styles.relationshipGrid}>
              {relationships.map((rel) => (
                <TouchableOpacity
                  key={rel}
                  style={[styles.relationshipChip, relationship === rel && styles.relationshipChipActive]}
                  onPress={() => setRelationship(rel)}
                >
                  <Text style={[styles.relationshipText, relationship === rel && styles.relationshipTextActive]}>
                    {rel}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>Message (Optional)</Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              value={message}
              onChangeText={setMessage}
              placeholder="What would you like them to say about you?"
              placeholderTextColor={COLORS.textLight}
              multiline
              numberOfLines={3}
            />

            <View style={styles.formActions}>
              <Button title="Send Request" onPress={handleRequestEndorsement} />
              <Button title="Cancel" onPress={() => setShowRequestForm(false)} variant="outline" />
            </View>
          </Card>
        )}

        <Text style={styles.sectionTitle}>Your Endorsements</Text>
        {endorsements.map((endorsement) => (
          <Card key={endorsement.id} style={styles.endorsementCard}>
            <View style={styles.endorsementHeader}>
              <Avatar size={48} />
              <View style={styles.endorserInfo}>
                <Text style={styles.endorserName}>{endorsement.endorserName}</Text>
                <Text style={styles.endorserRelationship}>{endorsement.relationship}</Text>
              </View>
              <Badge
                label={endorsement.status}
                variant={getStatusColor(endorsement.status) as any}
                size="sm"
              />
            </View>
            {endorsement.message && (
              <Text style={styles.endorsementMessage}>"{endorsement.message}"</Text>
            )}
          </Card>
        ))}

        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>How It Works</Text>
          <View style={styles.infoItem}>
            <Text style={styles.infoIcon}>1️⃣</Text>
            <Text style={styles.infoText}>Request an endorsement from family or community members</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoIcon}>2️⃣</Text>
            <Text style={styles.infoText}>They receive an SMS with a link to write their endorsement</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoIcon}>3️⃣</Text>
            <Text style={styles.infoText}>Once approved, the endorsement appears on your profile</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoIcon}>4️⃣</Text>
            <Text style={styles.infoText}>Profiles with endorsements get 3x more matches!</Text>
          </View>
        </View>
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
  introSection: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
    marginBottom: SPACING.lg,
  },
  introIcon: {
    fontSize: 48,
    marginBottom: SPACING.md,
  },
  introTitle: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  introDescription: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textLight,
    textAlign: 'center',
    lineHeight: 22,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: '800',
    color: COLORS.primary,
  },
  statLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textLight,
    marginTop: SPACING.xs,
  },
  formCard: {
    marginTop: SPACING.md,
    marginBottom: SPACING.lg,
  },
  formTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  label: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '500',
    color: COLORS.text,
    marginBottom: SPACING.xs,
    marginTop: SPACING.sm,
  },
  textInput: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    backgroundColor: COLORS.surface,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  relationshipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginTop: SPACING.xs,
  },
  relationshipChip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  relationshipChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  relationshipText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text,
  },
  relationshipTextActive: {
    color: COLORS.textInverse,
  },
  formActions: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginTop: SPACING.md,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.md,
    marginTop: SPACING.md,
  },
  endorsementCard: {
    marginBottom: SPACING.md,
  },
  endorsementHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  endorserInfo: {
    flex: 1,
  },
  endorserName: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
  },
  endorserRelationship: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textLight,
  },
  endorsementMessage: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    fontStyle: 'italic',
    marginTop: SPACING.md,
    lineHeight: 22,
  },
  infoSection: {
    marginTop: SPACING.xl,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
  },
  infoTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.md,
    marginBottom: SPACING.md,
  },
  infoIcon: {
    fontSize: 20,
    marginTop: 2,
  },
  infoText: {
    flex: 1,
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    lineHeight: 20,
  },
});
