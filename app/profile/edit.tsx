import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS, COMMUNITIES, INTERESTS, VALUES_LIST } from '@/constants';
import { useAuthStore } from '@/stores';
import { useTranslation } from '@/hooks';
import { Card, Button, Badge } from '@/components/ui';
import { Language } from '@/types';

export default function EditProfileScreen() {
  const { user, updateProfile } = useAuthStore();
  const { t } = useTranslation();

  const [name, setName] = useState(user?.name || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [community, setCommunity] = useState(user?.community || '');
  const [religion, setReligion] = useState(user?.religion || '');
  const [selectedValues, setSelectedValues] = useState<string[]>(user?.values || []);
  const [selectedInterests, setSelectedInterests] = useState<string[]>(user?.interests || []);
  const [familyValues, setFamilyValues] = useState(user?.familyValues || 'balanced');
  const [lookingFor, setLookingFor] = useState(user?.lookingFor || 'relationship');
  const [languages, setLanguages] = useState<Language[]>(user?.languages || ['en']);

  const toggleValue = (value: string) => {
    setSelectedValues((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    );
  };

  const toggleInterest = (interest: string) => {
    setSelectedInterests((prev) =>
      prev.includes(interest) ? prev.filter((i) => i !== interest) : [...prev, interest]
    );
  };

  const handleSave = async () => {
    try {
      await updateProfile({
        name,
        bio,
        community,
        religion,
        values: selectedValues,
        interests: selectedInterests,
        familyValues: familyValues as any,
        lookingFor: lookingFor as any,
        languages,
      });
      Alert.alert('Success', 'Profile updated!');
      router.back();
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile');
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backText}>← {t('back')}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <Button title={t('save')} onPress={handleSave} variant="primary" size="sm" />
      </View>

      <View style={styles.scrollContent}>
        <Text style={styles.label}>{t('name')}</Text>
        <TextInput
          style={styles.textInput}
          value={name}
          onChangeText={setName}
          placeholder={t('name')}
          placeholderTextColor={COLORS.textLight}
        />

        <Text style={styles.label}>{t('bio')}</Text>
        <TextInput
          style={[styles.textInput, styles.textArea]}
          value={bio}
          onChangeText={setBio}
          placeholder={t('bio_placeholder')}
          placeholderTextColor={COLORS.textLight}
          multiline
          numberOfLines={3}
        />

        <Text style={styles.label}>{t('community')}</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.chipContainer}>
            {COMMUNITIES.map((c) => (
              <TouchableOpacity
                key={c}
                style={[styles.chip, community === c && styles.chipActive]}
                onPress={() => setCommunity(c)}
              >
                <Text style={[styles.chipText, community === c && styles.chipTextActive]}>{c}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        <Text style={styles.label}>{t('values')}</Text>
        <View style={styles.chipContainer}>
          {VALUES_LIST.map((v) => (
            <TouchableOpacity
              key={v}
              style={[styles.chip, selectedValues.includes(v) && styles.chipActive]}
              onPress={() => toggleValue(v)}
            >
              <Text style={[styles.chipText, selectedValues.includes(v) && styles.chipTextActive]}>{v}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>{t('interests')}</Text>
        <View style={styles.chipContainer}>
          {INTERESTS.map((i) => (
            <TouchableOpacity
              key={i}
              style={[styles.chip, selectedInterests.includes(i) && styles.chipActive]}
              onPress={() => toggleInterest(i)}
            >
              <Text style={[styles.chipText, selectedInterests.includes(i) && styles.chipTextActive]}>{i}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>{t('looking_for')}</Text>
        <View style={styles.optionRow}>
          {(['relationship', 'friendship', 'marriage', 'networking'] as const).map((lf) => (
            <TouchableOpacity
              key={lf}
              style={[styles.optionButton, lookingFor === lf && styles.optionButtonActive]}
              onPress={() => setLookingFor(lf)}
            >
              <Text style={[styles.optionText, lookingFor === lf && styles.optionTextActive]}>
                {t(`looking_${lf}`)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.dangerZone}>
          <Button title={t('delete_account')} onPress={() => {}} variant="danger" />
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
  label: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.sm,
    marginTop: SPACING.md,
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
    height: 100,
    textAlignVertical: 'top',
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  chip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  chipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  chipText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text,
  },
  chipTextActive: {
    color: COLORS.textInverse,
  },
  optionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  optionButton: {
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  optionButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  optionText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text,
    fontWeight: '500',
  },
  optionTextActive: {
    color: COLORS.textInverse,
  },
  dangerZone: {
    marginTop: SPACING.xxl,
    paddingTop: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
});
