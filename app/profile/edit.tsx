import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Modal,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS, COMMUNITIES, INTERESTS, VALUES_LIST, GRADIENTS, SHADOWS, FONTS } from '@/constants';
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

  // Prompts State
  const [prompts, setPrompts] = useState<{question: string; answer: string}[]>(user?.prompts || []);
  const [showPromptModal, setShowPromptModal] = useState(false);
  const [editingPromptIndex, setEditingPromptIndex] = useState<number | null>(null);
  const [promptQuestion, setPromptQuestion] = useState('');
  const [promptAnswer, setPromptAnswer] = useState('');

  // KYC Verification State
  const [kycStep, setKycStep] = useState<'idle' | 'selfie' | 'id_upload' | 'submitting' | 'success' | 'rejected'>('idle');
  const [selfieUri, setSelfieUri] = useState<string | null>(null);
  const [idFrontUri, setIdFrontUri] = useState<string | null>(null);
  const [idBackUri, setIdBackUri] = useState<string | null>(null);
  const [kycProgress, setKycProgress] = useState(0);

  useEffect(() => {
    if (user?.isPhotoVerified && user?.kycLevel === 'full') {
      setKycStep('success');
    } else if (user?.isPhotoVerified) {
      setKycStep('idle');
    }
  }, [user]);

  const requestCameraPermission = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Needed', 'Camera permission is required for KYC verification.');
      return false;
    }
    return true;
  };

  const requestGalleryPermission = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Needed', 'Gallery permission is required for ID upload.');
      return false;
    }
    return true;
  };

  const handleTakeSelfie = async () => {
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) return;

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 5],
      quality: 0.8,
    });

    if (!result.canceled && result.assets?.[0]) {
      setSelfieUri(result.assets[0].uri);
      setKycStep('id_upload');
      setKycProgress(50);
    }
  };

  const handleUploadSelfie = async () => {
    const hasPermission = await requestGalleryPermission();
    if (!hasPermission) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 5],
      quality: 0.8,
    });

    if (!result.canceled && result.assets?.[0]) {
      setSelfieUri(result.assets[0].uri);
      setKycStep('id_upload');
      setKycProgress(50);
    }
  };

  const handleTakeIdPhoto = async (side: 'front' | 'back') => {
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) return;

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [16, 10],
      quality: 0.7,
    });

    if (!result.canceled && result.assets?.[0]) {
      if (side === 'front') setIdFrontUri(result.assets[0].uri);
      else setIdBackUri(result.assets[0].uri);
    }
  };

  const uploadKycFile = async (uri: string, userId: string, prefix: string): Promise<string | null> => {
    const { supabase } = await import('@/lib/supabase');
    const ext = uri.split('.').pop() || 'jpg';
    const fileName = `${prefix}_${Date.now()}.${ext}`;
    const filePath = `${userId}/${fileName}`;

    const response = await fetch(uri);
    const blob = await response.blob();

    const { error } = await supabase.storage.from('kyc-documents').upload(filePath, blob, {
      contentType: `image/${ext === 'png' ? 'png' : 'jpeg'}`,
      upsert: false,
    });
    if (error) throw error;
    return filePath;
  };

  const handleSubmitKyc = async () => {
    if (!selfieUri || !idFrontUri || !user) {
      Alert.alert('Incomplete', 'Please provide both a selfie and ID photo.');
      return;
    }
    setKycStep('submitting');
    setKycProgress(30);

    try {
      const selfiePath = await uploadKycFile(selfieUri, user.id, 'selfie');
      setKycProgress(55);

      const idPath = await uploadKycFile(idFrontUri, user.id, 'id_front');
      setKycProgress(80);

      const { supabase } = await import('@/lib/supabase');
      await supabase.from('kyc_submissions').insert({
        user_id: user.id,
        selfie_url: selfiePath,
        id_url: idPath,
        status: 'pending',
      });

      await supabase.from('profiles').update({
        kyc_level: 'pending',
        is_photo_verified: false,
      }).eq('id', user.id);

      setKycProgress(100);
      setKycStep('success');

      const { updateProfile } = useAuthStore.getState();
      updateProfile({ kycLevel: 'pending', isPhotoVerified: false });

      Alert.alert('Verification Submitted', 'Your documents have been received. We will notify you once verified.');
    } catch (e) {
      Alert.alert('Upload Failed', 'There was an error submitting your documents. Please try again.');
      setKycStep('idle');
      setKycProgress(0);
    }
  };

  const resetKyc = () => {
    setKycStep('idle');
    setSelfieUri(null);
    setIdFrontUri(null);
    setIdBackUri(null);
    setKycProgress(0);
  };

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
        prompts,
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

  const openPromptModal = (index: number | null) => {
    if (index !== null) {
      setEditingPromptIndex(index);
      setPromptQuestion(prompts[index].question);
      setPromptAnswer(prompts[index].answer);
    } else {
      setEditingPromptIndex(null);
      setPromptQuestion('');
      setPromptAnswer('');
    }
    setShowPromptModal(true);
  };

  const savePrompt = () => {
    if (!promptQuestion.trim() || !promptAnswer.trim()) return;
    if (editingPromptIndex !== null) {
      setPrompts((prev) => prev.map((p, i) => i === editingPromptIndex ? { question: promptQuestion, answer: promptAnswer } : p));
    } else {
      setPrompts((prev) => [...prev, { question: promptQuestion, answer: promptAnswer }]);
    }
    setShowPromptModal(false);
  };

  const removePrompt = (index: number) => {
    setPrompts((prev) => prev.filter((_, i) => i !== index));
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

        {/* PROMPTS SECTION */}
        <Text style={styles.label}>{t('prompts')}</Text>
        <Text style={styles.promptHelp}>{t('prompts_help')}</Text>
        {prompts.map((p, i) => (
          <View key={i} style={styles.promptCard}>
            <Text style={styles.promptQuestion}>{p.question}</Text>
            <Text style={styles.promptAnswer}>{p.answer}</Text>
            <View style={styles.promptActions}>
              <TouchableOpacity onPress={() => openPromptModal(i)}>
                <Text style={styles.promptActionText}>{t('edit')}</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => removePrompt(i)}>
                <Text style={[styles.promptActionText, { color: COLORS.danger }]}>{t('cancel')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
        {prompts.length < 3 && (
          <TouchableOpacity style={styles.addPromptBtn} onPress={() => openPromptModal(null)}>
            <Ionicons name="add-circle-outline" size={22} color={COLORS.primary} />
            <Text style={styles.addPromptText}>{t('add_prompt')}</Text>
          </TouchableOpacity>
        )}

        {/* Prompt Edit Modal */}
        <Modal visible={showPromptModal} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.promptModal}>
              <TouchableOpacity style={styles.promptModalClose} onPress={() => setShowPromptModal(false)}>
                <Ionicons name="close" size={24} color={COLORS.text} />
              </TouchableOpacity>
              <Text style={styles.promptModalTitle}>{editingPromptIndex !== null ? t('edit_prompt') : t('add_prompt')}</Text>

              <Text style={styles.promptModalLabel}>{t('prompt_question')}</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.promptQuestionScroll}>
                <View style={styles.promptQuestionRow}>
                  {['My simple pleasures', "I'm weirdly good at", 'A life goal of mine', 'The way to my heart is', 'I feel most at home when', "Biggest risk I've ever taken", 'My favorite African dish', 'Best travel story', "I'm looking for someone who", 'My love language is'].map((q) => (
                    <TouchableOpacity
                      key={q}
                      style={[styles.promptQuestionChip, promptQuestion === q && styles.promptQuestionChipActive]}
                      onPress={() => setPromptQuestion(q)}
                    >
                      <Text style={[styles.promptQuestionChipText, promptQuestion === q && styles.promptQuestionChipTextActive]}>{q}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>

              <Text style={styles.promptModalLabel}>{t('prompt_answer')}</Text>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                value={promptAnswer}
                onChangeText={setPromptAnswer}
                placeholder="Write your answer..."
                placeholderTextColor={COLORS.textLight}
                multiline
                numberOfLines={3}
              />

              <Button title={t('save')} variant="gradient" size="md" fullWidth onPress={savePrompt} disabled={!promptQuestion.trim() || !promptAnswer.trim()} />
            </View>
          </View>
        </Modal>

        {/* KYC VERIFICATION SECTION */}
        <View style={styles.kycSection}>
          <View style={styles.kycHeader}>
            <Text style={styles.kycTitle}>KYC Verification</Text>
            {kycStep === 'success' ? (
              <Badge label="Verified" variant="success" icon="checkmark-circle" />
            ) : (
              <Badge label={user?.kycLevel === 'none' ? 'Not Verified' : 'Pending'} variant="warning" icon="alert-circle" />
            )}
          </View>

          {/* Progress Bar */}
          <View style={styles.kycProgressBar}>
            <View style={[styles.kycProgressFill, { width: `${kycProgress}%` }]} />
          </View>
          <Text style={styles.kycProgressText}>{kycProgress}% Complete</Text>

          {kycStep === 'idle' && (
            <View style={styles.kycIdleContent}>
              <View style={styles.kycIconWrap}>
                <Ionicons name="shield-checkmark" size={40} color={COLORS.primary} />
              </View>
              <Text style={styles.kycDescription}>
                Verify your identity to build trust in the community. Complete KYC to get a verified badge and unlock premium features.
              </Text>
              <View style={styles.kycFeaturesList}>
                {['Verified badge on your profile', 'Priority in matching algorithm', 'Access to exclusive events', 'Higher daily swipe limit'].map((feat, i) => (
                  <View key={i} style={styles.kycFeatureItem}>
                    <Ionicons name="checkmark-circle" size={16} color={COLORS.success} />
                    <Text style={styles.kycFeatureText}>{feat}</Text>
                  </View>
                ))}
              </View>
              <View style={styles.kycActionRow}>
                <Button title="Take Selfie" variant="gradient" size="md" icon="camera" onPress={handleTakeSelfie} />
                <Button title="Upload Photo" variant="outline" size="md" icon="image" onPress={handleUploadSelfie} />
              </View>
            </View>
          )}

          {kycStep === 'submitting' && (
            <View style={styles.kycLoadingContent}>
              <ActivityIndicator size="large" color={COLORS.primary} />
              <Text style={styles.kycLoadingText}>Submitting your documents...</Text>
              <Text style={styles.kycLoadingSub}>Please wait while we process your verification</Text>
            </View>
          )}

          {kycStep === 'success' && (
            <View style={styles.kycSuccessContent}>
              <LinearGradient colors={GRADIENTS.primary} style={styles.kycSuccessIconWrap}>
                <Ionicons name="checkmark" size={36} color="#FFFFFF" />
              </LinearGradient>
              <Text style={styles.kycSuccessTitle}>Identity Verified</Text>
              <Text style={styles.kycSuccessText}>
                Your identity has been verified. Your profile now has a verified badge.
              </Text>
              <Button title="Done" variant="primary" size="md" onPress={resetKyc} />
            </View>
          )}
        </View>

        <View style={styles.dangerZone}>
          <Button title={t('delete_account')} onPress={() => {}} variant="danger" />
        </View>
      </View>

      {/* KYC SELFIE PREVIEW MODAL */}
      <Modal visible={kycStep === 'id_upload'} transparent animationType="slide">
        <View style={styles.kycModalOverlay}>
          <View style={styles.kycModalCard}>
            <View style={styles.kycModalHeader}>
              <Text style={styles.kycModalTitle}>Upload ID Document</Text>
              <TouchableOpacity onPress={resetKyc}>
                <Ionicons name="close" size={24} color={COLORS.text} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Selfie Preview */}
              {selfieUri && (
                <View style={styles.kycPreviewSection}>
                  <Text style={styles.kycPreviewLabel}>Your Selfie</Text>
                  <Image source={{ uri: selfieUri }} style={styles.kycPreviewImage} />
                  <View style={styles.kycPreviewActions}>
                    <TouchableOpacity style={styles.kycRetakeBtn} onPress={handleTakeSelfie}>
                      <Ionicons name="camera" size={18} color={COLORS.primary} />
                      <Text style={styles.kycRetakeText}>Retake</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              {/* ID Front Upload */}
              <View style={styles.kycIdSection}>
                <Text style={styles.kycPreviewLabel}>ID Card - Front Side</Text>
                {idFrontUri ? (
                  <View>
                    <Image source={{ uri: idFrontUri }} style={styles.kycPreviewImage} />
                    <TouchableOpacity style={styles.kycRetakeBtn} onPress={() => handleTakeIdPhoto('front')}>
                      <Ionicons name="camera" size={18} color={COLORS.primary} />
                      <Text style={styles.kycRetakeText}>Retake</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TouchableOpacity style={styles.kycUploadBox} onPress={() => handleTakeIdPhoto('front')}>
                    <Ionicons name="camera-outline" size={36} color={COLORS.textLight} />
                    <Text style={styles.kycUploadText}>Tap to capture front side</Text>
                  </TouchableOpacity>
                )}
              </View>

              {/* ID Back Upload */}
              <View style={styles.kycIdSection}>
                <Text style={styles.kycPreviewLabel}>ID Card - Back Side (Optional)</Text>
                {idBackUri ? (
                  <View>
                    <Image source={{ uri: idBackUri }} style={styles.kycPreviewImage} />
                    <TouchableOpacity style={styles.kycRetakeBtn} onPress={() => handleTakeIdPhoto('back')}>
                      <Ionicons name="camera" size={18} color={COLORS.primary} />
                      <Text style={styles.kycRetakeText}>Retake</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TouchableOpacity style={styles.kycUploadBox} onPress={() => handleTakeIdPhoto('back')}>
                    <Ionicons name="camera-outline" size={36} color={COLORS.textLight} />
                    <Text style={styles.kycUploadText}>Tap to capture back side</Text>
                  </TouchableOpacity>
                )}
              </View>
            </ScrollView>

            <View style={styles.kycModalFooter}>
              <View style={{ flex: 1 }}>
                <Button
                  title="Submit for Verification"
                  variant="gradient"
                  size="lg"
                  fullWidth
                  icon="shield-checkmark"
                  onPress={handleSubmitKyc}
                />
              </View>
            </View>
          </View>
        </View>
      </Modal>
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
  kycSection: {
    marginTop: SPACING.xl,
    padding: SPACING.lg,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.xl,
    ...SHADOWS.md,
  },
  kycHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  kycTitle: {
    fontSize: FONT_SIZES.lg,
    fontFamily: FONTS.bold,
    color: COLORS.text,
    letterSpacing: -0.3,
  },
  kycProgressBar: {
    height: 6,
    backgroundColor: COLORS.borderLight,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 4,
  },
  kycProgressFill: {
    height: '100%',
    backgroundColor: COLORS.success,
    borderRadius: 3,
  },
  kycProgressText: {
    fontSize: FONT_SIZES.xs,
    fontFamily: FONTS.medium,
    color: COLORS.textLight,
    marginBottom: SPACING.md,
  },
  kycIdleContent: {
    alignItems: 'center',
  },
  kycIconWrap: {
    width: 72,
    height: 72,
    borderRadius: 24,
    backgroundColor: COLORS.primaryGlow,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  kycDescription: {
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: SPACING.md,
  },
  kycFeaturesList: {
    width: '100%',
    gap: 8,
    marginBottom: SPACING.lg,
  },
  kycFeatureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  kycFeatureText: {
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.regular,
    color: COLORS.text,
  },
  kycActionRow: {
    flexDirection: 'row',
    gap: SPACING.md,
    width: '100%',
  },
  kycLoadingContent: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
  },
  kycLoadingText: {
    fontSize: FONT_SIZES.md,
    fontFamily: FONTS.bold,
    color: COLORS.text,
    marginTop: SPACING.md,
  },
  kycLoadingSub: {
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.regular,
    color: COLORS.textLight,
    marginTop: 4,
  },
  kycSuccessContent: {
    alignItems: 'center',
    paddingVertical: SPACING.md,
  },
  kycSuccessIconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  kycSuccessTitle: {
    fontSize: FONT_SIZES.lg,
    fontFamily: FONTS.bold,
    color: COLORS.text,
    marginBottom: 4,
  },
  kycSuccessText: {
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: SPACING.md,
  },
  kycModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
    padding: SPACING.lg,
  },
  kycModalCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.xl,
    overflow: 'hidden',
    maxHeight: '85%',
    ...SHADOWS.lg,
  },
  kycModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  kycModalTitle: {
    fontSize: FONT_SIZES.lg,
    fontFamily: FONTS.bold,
    color: COLORS.text,
  },
  kycPreviewSection: {
    padding: SPACING.lg,
  },
  kycPreviewLabel: {
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.semiBold,
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  kycPreviewImage: {
    width: '100%',
    height: 200,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.background,
  },
  kycPreviewActions: {
    marginTop: SPACING.sm,
  },
  kycRetakeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
  },
  kycRetakeText: {
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.semiBold,
    color: COLORS.primary,
  },
  kycIdSection: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.lg,
  },
  kycUploadBox: {
    height: 120,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 2,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.background,
  },
  kycUploadText: {
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.regular,
    color: COLORS.textLight,
    marginTop: SPACING.sm,
  },
  kycModalFooter: {
    padding: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  promptHelp: { fontSize: FONT_SIZES.sm, fontFamily: FONTS.regular, color: COLORS.textLight, marginBottom: SPACING.md, lineHeight: 20 },
  promptCard: {
    backgroundColor: COLORS.surface, borderRadius: BORDER_RADIUS.md, padding: SPACING.md,
    marginBottom: SPACING.sm, borderWidth: 1, borderColor: COLORS.borderLight,
  },
  promptQuestion: { fontSize: FONT_SIZES.sm, fontFamily: FONTS.semiBold, color: COLORS.primary, marginBottom: 4 },
  promptAnswer: { fontSize: FONT_SIZES.md, fontFamily: FONTS.regular, color: COLORS.text, lineHeight: 22, marginBottom: 8 },
  promptActions: { flexDirection: 'row', gap: SPACING.md },
  promptActionText: { fontSize: FONT_SIZES.sm, fontFamily: FONTS.semiBold, color: COLORS.primary },
  addPromptBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingVertical: 14, paddingHorizontal: SPACING.md, backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md, borderWidth: 1.5, borderStyle: 'dashed', borderColor: COLORS.border,
    marginBottom: SPACING.lg,
  },
  addPromptText: { fontSize: FONT_SIZES.md, fontFamily: FONTS.semiBold, color: COLORS.primary },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end', padding: SPACING.lg },
  promptModal: {
    backgroundColor: COLORS.surface, borderRadius: BORDER_RADIUS.xl, padding: SPACING.xl,
    ...SHADOWS.lg,
  },
  promptModalClose: { alignSelf: 'flex-end' },
  promptModalTitle: { fontSize: FONT_SIZES.xl, fontFamily: FONTS.bold, color: COLORS.text, marginBottom: SPACING.lg, letterSpacing: -0.5 },
  promptModalLabel: { fontSize: FONT_SIZES.sm, fontFamily: FONTS.semiBold, color: COLORS.text, marginBottom: 8, marginTop: SPACING.md },
  promptQuestionScroll: { maxHeight: 100, marginBottom: SPACING.md },
  promptQuestionRow: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm },
  promptQuestionChip: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.borderLight,
  },
  promptQuestionChipActive: { backgroundColor: COLORS.primaryGlow, borderColor: COLORS.primary },
  promptQuestionChipText: { fontSize: FONT_SIZES.xs, fontFamily: FONTS.medium, color: COLORS.textMuted },
  promptQuestionChipTextActive: { color: COLORS.primary, fontFamily: FONTS.semiBold },
});
