import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
} from 'react-native';
import { router } from 'expo-router';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS, COMMUNITIES, INTERESTS, VALUES_LIST, LOOKING_FOR_OPTIONS } from '@/constants';
import { useAuthStore, useAppStore } from '@/stores';
import { useTranslation } from '@/hooks';
import { Button, Card, Badge } from '@/components/ui';
import { Language } from '@/types';

const STEPS = ['name', 'basics', 'culture', 'values', 'looking', 'photo'];

export default function OnboardingScreen() {
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState<'male' | 'female' | 'other'>('male');
  const [bio, setBio] = useState('');
  const [languages, setLanguages] = useState<Language[]>(['en']);
  const [community, setCommunity] = useState('');
  const [religion, setReligion] = useState('');
  const [selectedValues, setSelectedValues] = useState<string[]>([]);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [familyValues, setFamilyValues] = useState<'traditional' | 'modern' | 'balanced'>('balanced');
  const [lookingFor, setLookingFor] = useState<'relationship' | 'friendship' | 'marriage' | 'networking'>('relationship');
  const [photos, setPhotos] = useState<string[]>([]);

  const { updateProfile } = useAuthStore();
  const { setLanguage, language } = useAppStore();
  const { t } = useTranslation();

  const currentStep = STEPS[step];

  const toggleLanguage = (lang: Language) => {
    if (languages.includes(lang)) {
      if (languages.length > 1) {
        setLanguages(languages.filter((l) => l !== lang));
      }
    } else {
      setLanguages([...languages, lang]);
    }
  };

  const toggleValue = (value: string) => {
    if (selectedValues.includes(value)) {
      setSelectedValues(selectedValues.filter((v) => v !== value));
    } else {
      setSelectedValues([...selectedValues, value]);
    }
  };

  const toggleInterest = (interest: string) => {
    if (selectedInterests.includes(interest)) {
      setSelectedInterests(selectedInterests.filter((i) => i !== interest));
    } else {
      setSelectedInterests([...selectedInterests, interest]);
    }
  };

  const handleNext = () => {
    if (step < STEPS.length - 1) {
      setStep(step + 1);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };

  const handleComplete = async () => {
    try {
      await updateProfile({
        name,
        age: parseInt(age),
        gender,
        bio,
        languages,
        community,
        religion,
        values: selectedValues,
        interests: selectedInterests,
        familyValues,
        lookingFor,
        photos,
        location: { latitude: 0, longitude: 0 },
        isVerified: false,
        isPhotoVerified: false,
        kycLevel: 'none',
        safetyScore: 50,
        credits: 10,
      });
      router.replace('/(tabs)');
    } catch (error) {
      Alert.alert('Error', 'Failed to save profile. Please try again.');
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 'name':
        return name.length >= 2;
      case 'basics':
        return age && parseInt(age) >= 18;
      case 'culture':
        return community.length > 0;
      case 'values':
        return selectedValues.length > 0 || selectedInterests.length > 0;
      case 'looking':
        return true;
      case 'photo':
        return true;
      default:
        return true;
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 'name':
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>{t('profile_setup')}</Text>
            <Text style={styles.stepSubtitle}>What should we call you?</Text>
            <TextInput
              style={styles.textInput}
              value={name}
              onChangeText={setName}
              placeholder={t('name')}
              placeholderTextColor={COLORS.textLight}
              autoFocus
            />
          </View>
        );

      case 'basics':
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>About You</Text>
            <Text style={styles.stepSubtitle}>Tell us a bit more</Text>

            <Text style={styles.label}>{t('age')}</Text>
            <TextInput
              style={styles.textInput}
              value={age}
              onChangeText={setAge}
              placeholder="18+"
              placeholderTextColor={COLORS.textLight}
              keyboardType="number-pad"
              maxLength={2}
            />

            <Text style={styles.label}>{t('gender')}</Text>
            <View style={styles.optionRow}>
              {(['male', 'female', 'other'] as const).map((g) => (
                <TouchableOpacity
                  key={g}
                  style={[styles.optionButton, gender === g && styles.optionButtonActive]}
                  onPress={() => setGender(g)}
                >
                  <Text style={[styles.optionText, gender === g && styles.optionTextActive]}>
                    {t(g)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

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
          </View>
        );

      case 'culture':
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Your Culture</Text>
            <Text style={styles.stepSubtitle}>Help us understand your background</Text>

            <Text style={styles.label}>{t('community')}</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
              <View style={styles.chipContainer}>
                {COMMUNITIES.map((c) => (
                  <TouchableOpacity
                    key={c}
                    style={[styles.chip, community === c && styles.chipActive]}
                    onPress={() => setCommunity(c)}
                  >
                    <Text style={[styles.chipText, community === c && styles.chipTextActive]}>
                      {c}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            <Text style={styles.label}>{t('languages')}</Text>
            <View style={styles.chipContainer}>
              {(['en', 'yo', 'sw', 'ha', 'am'] as Language[]).map((lang) => (
                <TouchableOpacity
                  key={lang}
                  style={[styles.chip, languages.includes(lang) && styles.chipActive]}
                  onPress={() => toggleLanguage(lang)}
                >
                  <Text style={[styles.chipText, languages.includes(lang) && styles.chipTextActive]}>
                    {lang.toUpperCase()}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>{t('family_values')}</Text>
            <View style={styles.optionRow}>
              {(['traditional', 'modern', 'balanced'] as const).map((fv) => (
                <TouchableOpacity
                  key={fv}
                  style={[styles.optionButton, familyValues === fv && styles.optionButtonActive]}
                  onPress={() => setFamilyValues(fv)}
                >
                  <Text style={[styles.optionText, familyValues === fv && styles.optionTextActive]}>
                    {t(fv)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        );

      case 'values':
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Your Values</Text>
            <Text style={styles.stepSubtitle}>Select what matters to you</Text>

            <Text style={styles.label}>{t('values')}</Text>
            <View style={styles.chipContainer}>
              {VALUES_LIST.map((v) => (
                <TouchableOpacity
                  key={v}
                  style={[styles.chip, selectedValues.includes(v) && styles.chipActive]}
                  onPress={() => toggleValue(v)}
                >
                  <Text style={[styles.chipText, selectedValues.includes(v) && styles.chipTextActive]}>
                    {v}
                  </Text>
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
                  <Text style={[styles.chipText, selectedInterests.includes(i) && styles.chipTextActive]}>
                    {i}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        );

      case 'looking':
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>{t('looking_for')}</Text>
            <Text style={styles.stepSubtitle}>What brings you here?</Text>

            {LOOKING_FOR_OPTIONS.map((option) => (
              <TouchableOpacity
                key={option.key}
                style={[
                  styles.lookingCard,
                  lookingFor === option.key && styles.lookingCardActive,
                ]}
                onPress={() => setLookingFor(option.key as any)}
              >
                <Text
                  style={[
                    styles.lookingText,
                    lookingFor === option.key && styles.lookingTextActive,
                  ]}
                >
                  {t(option.labelKey)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        );

      case 'photo':
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Add Photos</Text>
            <Text style={styles.stepSubtitle}>Show your best self (add at least 1)</Text>

            <View style={styles.photoGrid}>
              {[0, 1, 2, 3, 4, 5].map((index) => (
                <TouchableOpacity key={index} style={styles.photoSlot}>
                  <Text style={styles.photoPlaceholder}>+</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.photoHint}>
              Profiles with photos get 10x more matches
            </Text>
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.progress}>
        {STEPS.map((_, index) => (
          <View
            key={index}
            style={[styles.progressDot, index <= step && styles.progressDotActive]}
          />
        ))}
      </View>

      <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {renderStep()}
      </ScrollView>

      <View style={styles.bottomBar}>
        {step > 0 && (
          <Button title={t('back')} onPress={handleBack} variant="outline" />
        )}
        <Button
          title={step === STEPS.length - 1 ? 'Complete' : t('next')}
          onPress={handleNext}
          disabled={!canProceed()}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  progress: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: SPACING.sm,
    paddingTop: SPACING.xxl + SPACING.lg,
    paddingBottom: SPACING.md,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.border,
  },
  progressDotActive: {
    backgroundColor: COLORS.primary,
    width: 24,
  },
  scrollContent: {
    flex: 1,
    paddingHorizontal: SPACING.xl,
  },
  stepContent: {
    paddingBottom: SPACING.xl,
  },
  stepTitle: {
    fontSize: FONT_SIZES.title,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  stepSubtitle: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textLight,
    marginBottom: SPACING.xl,
  },
  label: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text,
    fontWeight: '600',
    marginBottom: SPACING.sm,
    marginTop: SPACING.md,
  },
  textInput: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    fontSize: FONT_SIZES.lg,
    color: COLORS.text,
    backgroundColor: COLORS.surface,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  optionRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  optionButton: {
    flex: 1,
    paddingVertical: SPACING.md,
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
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    fontWeight: '500',
  },
  optionTextActive: {
    color: COLORS.textInverse,
  },
  chipScroll: {
    marginBottom: SPACING.sm,
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
  lookingCard: {
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 2,
    borderColor: COLORS.border,
    marginBottom: SPACING.md,
  },
  lookingCardActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary + '10',
  },
  lookingText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.text,
    textAlign: 'center',
  },
  lookingTextActive: {
    color: COLORS.primary,
  },
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
    marginTop: SPACING.md,
  },
  photoSlot: {
    width: 100,
    height: 100,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 2,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surface,
  },
  photoPlaceholder: {
    fontSize: 32,
    color: COLORS.textLight,
  },
  photoHint: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textLight,
    textAlign: 'center',
    marginTop: SPACING.md,
  },
  bottomBar: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.lg,
    paddingBottom: SPACING.xxl,
    gap: SPACING.md,
  },
});
