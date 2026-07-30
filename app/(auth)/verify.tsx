import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Dimensions, Platform, KeyboardAvoidingView, ScrollView, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTranslation } from '@/hooks';
import { useAuthStore } from '@/stores';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS, SHADOWS, FONTS, GRADIENTS } from '@/constants';
import { Button } from '@/components/ui';

const { width, height } = Dimensions.get('window');
const OTP_LENGTH = 6;

export default function VerifyScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { email } = useLocalSearchParams<{ email: string }>();
  const { verifySignIn, signIn } = useAuthStore();
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef<TextInput>(null);

  const handleVerify = async () => {
    if (code.length !== OTP_LENGTH || !email) return;
    setError('');
    setIsLoading(true);
    try {
      await verifySignIn(email, code);
      router.replace('/(tabs)');
    } catch (err) {
      setError(err instanceof Error ? err.message : t('invalid_otp'));
      setCode('');
      inputRef.current?.focus();
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email) return;
    setIsResending(true);
    try {
      await signIn(email);
      Alert.alert(t('otp_sent'), t('enter_otp'));
    } catch {
      setError('Failed to resend code');
    } finally {
      setIsResending(false);
    }
  };

  const handleCodeChange = (text: string) => {
    const digits = text.replace(/[^0-9]/g, '').slice(0, OTP_LENGTH);
    setCode(digits);
    setError('');
    if (digits.length === OTP_LENGTH) {
      // Auto-submit handled by the Verify button
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={GRADIENTS.hero as readonly [string, string]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientBg}
        pointerEvents="none"
      >
        <View style={[styles.circle, styles.circle1]} />
        <View style={[styles.circle, styles.circle2]} />
        <View style={[styles.circle, styles.circle3]} />
      </LinearGradient>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.keyboardView}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>

          <View style={styles.heroSection}>
            <View style={styles.iconWrap}>
              <Ionicons name="mail-unlock" size={40} color="#FFFFFF" />
            </View>
            <Text style={styles.heroTitle}>{t('verify_otp')}</Text>
            <Text style={styles.heroDesc}>{t('enter_otp')}</Text>
            {email && <Text style={styles.heroEmail}>{email}</Text>}
          </View>

          <View style={styles.formCard}>
            <Text style={styles.otpLabel}>Enter verification code</Text>

            <View style={styles.otpRow}>
              {Array.from({ length: OTP_LENGTH }).map((_, i) => (
                <View key={i} style={[styles.otpBox, code.length > i && styles.otpBoxFilled, code.length === i && styles.otpBoxActive]}>
                  <Text style={[styles.otpDigit, code.length > i && styles.otpDigitFilled]}>
                    {code[i] || ''}
                  </Text>
                </View>
              ))}
            </View>

            <TextInput
              ref={inputRef}
              style={styles.hiddenInput}
              value={code}
              onChangeText={handleCodeChange}
              keyboardType="number-pad"
              maxLength={OTP_LENGTH}
              autoFocus
              accessibilityLabel="OTP input"
            />

            {error ? (
              <View style={styles.errorRow}>
                <Ionicons name="alert-circle" size={16} color={COLORS.danger} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            <Button
              title={t('verify_otp')}
              onPress={handleVerify}
              variant="gradient"
              size="lg"
              fullWidth
              isLoading={isLoading}
              disabled={code.length !== OTP_LENGTH}
              icon="checkmark-circle"
            />

            <TouchableOpacity style={styles.resendBtn} onPress={handleResend} disabled={isResending}>
              <Text style={styles.resendText}>
                {isResending ? t('sending') : t('resend_code')}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  gradientBg: {
    position: 'absolute', top: 0, left: 0, right: 0, height: height * 0.5,
    backgroundColor: COLORS.primaryHero, overflow: 'hidden',
  },
  circle: { position: 'absolute', borderRadius: 999 },
  circle1: { width: 400, height: 400, top: -120, right: -100, backgroundColor: COLORS.secondary, opacity: 0.15 },
  circle2: { width: 250, height: 250, top: 100, left: -60, backgroundColor: COLORS.accent, opacity: 0.12 },
  circle3: { width: 300, height: 300, top: 250, right: -50, backgroundColor: '#DC3545', opacity: 0.08 },
  keyboardView: { flex: 1 },
  scrollContent: { flexGrow: 1, paddingHorizontal: SPACING.lg, paddingTop: 72, paddingBottom: SPACING.xxl },
  backBtn: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center', justifyContent: 'center',
    marginBottom: SPACING.xl,
  },
  heroSection: { alignItems: 'center', marginBottom: SPACING.xl },
  iconWrap: {
    width: 80, height: 80, borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center', justifyContent: 'center',
    marginBottom: SPACING.lg,
    borderWidth: 2, borderColor: 'rgba(255,255,255,0.25)',
  },
  heroTitle: {
    fontSize: 36, fontFamily: FONTS.extraBold,
    color: COLORS.textInverse, letterSpacing: -1.5, marginBottom: 8,
  },
  heroDesc: {
    fontSize: 16, fontFamily: FONTS.regular,
    color: 'rgba(255,255,255,0.88)', textAlign: 'center', lineHeight: 24,
  },
  heroEmail: {
    fontSize: 15, fontFamily: FONTS.semiBold,
    color: '#FFFFFF', marginTop: 8,
  },
  formCard: {
    backgroundColor: COLORS.card, borderRadius: BORDER_RADIUS.xl, padding: SPACING.xl,
    alignItems: 'center', ...SHADOWS.lg,
  },
  otpLabel: {
    fontSize: FONT_SIZES.sm, fontFamily: FONTS.semiBold,
    color: COLORS.textLight, marginBottom: SPACING.lg,
  },
  otpRow: {
    flexDirection: 'row', gap: 10, marginBottom: SPACING.xl,
  },
  otpBox: {
    width: 48, height: 58, borderRadius: BORDER_RADIUS.md,
    borderWidth: 2, borderColor: COLORS.border,
    backgroundColor: COLORS.background,
    alignItems: 'center', justifyContent: 'center',
  },
  otpBoxActive: { borderColor: COLORS.primary, borderWidth: 2.5 },
  otpBoxFilled: { borderColor: COLORS.primary, backgroundColor: COLORS.primaryGlow },
  otpDigit: {
    fontSize: 24, fontFamily: FONTS.bold, color: COLORS.text,
    textAlign: 'center',
  },
  otpDigitFilled: { color: COLORS.primary },
  hiddenInput: {
    position: 'absolute', width: 1, height: 1, opacity: 0,
  },
  errorRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: SPACING.md },
  errorText: { fontSize: FONT_SIZES.sm, fontFamily: FONTS.medium, color: COLORS.danger },
  resendBtn: { marginTop: SPACING.lg },
  resendText: { fontSize: FONT_SIZES.sm, fontFamily: FONTS.semiBold, color: COLORS.primary },
});
