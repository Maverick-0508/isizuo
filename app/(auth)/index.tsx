import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Dimensions, Platform, KeyboardAvoidingView, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTranslation } from '@/hooks';
import { useAuthStore } from '@/stores';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS, SHADOWS, FONTS, GRADIENTS } from '@/constants';
import { Button } from '@/components/ui';
import { Logo } from '@/components/Logo';

const { width, height } = Dimensions.get('window');

export default function LoginScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { signIn } = useAuthStore();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSendOTP = async () => {
    if (!email.trim()) return;
    setError('');
    setIsLoading(true);
    try {
      await signIn(email.trim());
      router.replace('/(tabs)');
    } catch (err) {
      setError(t('error'));
    } finally {
      setIsLoading(false);
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
          <View style={styles.heroSection}>
            <View style={styles.logoWrap}>
              <View style={styles.logoIconBox}>
                <Text style={styles.logoLetter}>I</Text>
              </View>
            </View>
            <Text style={styles.heroTitle} accessibilityRole="header">Isizuo</Text>
            <Text style={styles.heroTagline}>{t('hero_tagline')}</Text>
            <Text style={styles.heroSubtitle}>
              {t('hero_subtitle')}
            </Text>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>50K+</Text>
              <Text style={styles.statLabel}>{t('active_users')}</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>20+</Text>
              <Text style={styles.statLabel}>{t('communities_count')}</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>4.8</Text>
              <Text style={styles.statLabel}>{t('app_rating')}</Text>
            </View>
          </View>

          <View style={styles.formCard}>
            <Text style={styles.formTitle} accessibilityRole="header">{t('get_started')}</Text>
            <Text style={styles.formDesc}>{t('email_description')}</Text>

            <View style={styles.inputContainer} accessibilityRole="form">
              <Ionicons name="mail-outline" size={20} color={COLORS.textLight} />
              <TextInput
                style={styles.input}
                placeholder="you@example.com"
                placeholderTextColor={COLORS.textLight}
                value={email}
                onChangeText={(text) => { setEmail(text); setError(''); }}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                accessibilityLabel={t('name')}
                accessibilityHint={t('email_description')}
                textContentType="emailAddress"
                autoComplete="email"
              />
            </View>

            {error ? (
              <View style={styles.errorRow}>
                <Ionicons name="alert-circle" size={16} color={COLORS.danger} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            <Button
              title={t('continue_with_email')}
              onPress={handleSendOTP}
              variant="gradient"
              size="lg"
              fullWidth
              isLoading={isLoading}
              disabled={!email.trim()}
              icon="arrow-forward"
            />

            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>{t('or')}</Text>
              <View style={styles.dividerLine} />
            </View>

            <TouchableOpacity style={styles.socialBtn} accessibilityRole="button" accessibilityLabel={t('continue_with_google')} accessibilityHint={t('email_description')}>
              <Ionicons name="logo-google" size={22} color="#DB4437" />
              <Text style={styles.socialBtnText}>{t('continue_with_google')}</Text>
            </TouchableOpacity>

            <Text style={styles.terms}>
              {t('by_continuing')}{' '}
              <Text style={styles.termsLink}>{t('terms_of_service')}</Text>
              {' '}{t('and')}{' '}
              <Text style={styles.termsLink}>{t('privacy_policy')}</Text>
            </Text>
          </View>

          <View style={styles.featuresGrid} accessibilityRole="summary">
            <View style={styles.featureCard} accessibilityLabel={t('verified_profiles')}>
              <View style={[styles.featureIcon, { backgroundColor: '#D4F5ED' }]}>
                <Ionicons name="shield-checkmark" size={24} color={COLORS.safe} />
              </View>
              <Text style={styles.featureTitle}>{t('verified_profiles')}</Text>
              <Text style={styles.featureDesc}>{t('verified_profiles_desc')}</Text>
            </View>
            <View style={styles.featureCard} accessibilityLabel={t('community_first')}>
              <View style={[styles.featureIcon, { backgroundColor: '#E0EDFF' }]}>
                <Ionicons name="people" size={24} color={COLORS.info} />
              </View>
              <Text style={styles.featureTitle}>{t('community_first')}</Text>
              <Text style={styles.featureDesc}>{t('community_first_desc')}</Text>
            </View>
            <View style={styles.featureCard} accessibilityLabel={t('family_values_title')}>
              <View style={[styles.featureIcon, { backgroundColor: '#FCE4EC' }]}>
                <Ionicons name="heart" size={24} color={COLORS.primary} />
              </View>
              <Text style={styles.featureTitle}>{t('family_values_title')}</Text>
              <Text style={styles.featureDesc}>{t('family_values_desc')}</Text>
            </View>
            <View style={styles.featureCard} accessibilityLabel={t('local_events')}>
              <View style={[styles.featureIcon, { backgroundColor: '#FEF3D6' }]}>
                <Ionicons name="location" size={24} color={COLORS.accentDark} />
              </View>
              <Text style={styles.featureTitle}>{t('local_events')}</Text>
              <Text style={styles.featureDesc}>{t('local_events_desc')}</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.usdBtn} accessibilityRole="button" accessibilityLabel={t('sign_in_phone')}>
            <Ionicons name="call-outline" size={20} color={COLORS.primary} />
            <Text style={styles.usdText}>{t('sign_in_phone')}</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  gradientBg: {
    position: 'absolute', top: 0, left: 0, right: 0, height: height * 0.55,
    backgroundColor: COLORS.primaryHero, overflow: 'hidden',
  },
  circle: { position: 'absolute', borderRadius: 999 },
  circle1: { width: 400, height: 400, top: -120, right: -100, backgroundColor: COLORS.secondary, opacity: 0.15 },
  circle2: { width: 250, height: 250, top: 100, left: -60, backgroundColor: COLORS.accent, opacity: 0.12 },
  circle3: { width: 300, height: 300, top: 280, right: -50, backgroundColor: '#DC3545', opacity: 0.08 },
  keyboardView: { flex: 1 },
  scrollContent: { flexGrow: 1, paddingHorizontal: SPACING.lg, paddingTop: 72, paddingBottom: SPACING.xxl },

  heroSection: { alignItems: 'center', marginBottom: SPACING.xl },
  logoWrap: { marginBottom: SPACING.lg },
  logoIconBox: {
    width: 88, height: 88, borderRadius: 26,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: 'rgba(255,255,255,0.25)',
  },
  logoLetter: {
    fontSize: 48, fontFamily: FONTS.extraBold,
    color: COLORS.textInverse, marginTop: -3,
  },
  heroTitle: {
    fontSize: 52, fontFamily: FONTS.extraBold,
    color: COLORS.textInverse, letterSpacing: -2, marginBottom: 6,
  },
  heroTagline: {
    fontSize: 17, fontFamily: FONTS.semiBold,
    color: '#FFFFFF', letterSpacing: 1.5, textTransform: 'uppercase',
    marginBottom: SPACING.md,
  },
  heroSubtitle: {
    fontSize: 16, fontFamily: FONTS.regular,
    color: 'rgba(255,255,255,0.88)', textAlign: 'center',
    lineHeight: 24, paddingHorizontal: SPACING.md, maxWidth: 380,
  },

  statsRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: BORDER_RADIUS.xl, paddingVertical: 20, paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.xl, gap: 0,
  },
  statItem: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: 24, fontFamily: FONTS.extraBold, color: '#FFFFFF', letterSpacing: -0.5 },
  statLabel: { fontSize: 13, fontFamily: FONTS.medium, color: 'rgba(255,255,255,0.8)', marginTop: 3 },
  statDivider: { width: 1, height: 36, backgroundColor: 'rgba(255,255,255,0.2)' },

  formCard: {
    backgroundColor: COLORS.card, borderRadius: BORDER_RADIUS.xl, padding: SPACING.xl,
    marginBottom: SPACING.lg, ...SHADOWS.lg,
  },
  formTitle: { fontSize: FONT_SIZES.xxl, fontFamily: FONTS.bold, color: COLORS.text, marginBottom: 6, letterSpacing: -0.5 },
  formDesc: { fontSize: FONT_SIZES.md, fontFamily: FONTS.regular, color: COLORS.textLight, marginBottom: SPACING.lg, lineHeight: 24 },
  inputContainer: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.background,
    borderRadius: BORDER_RADIUS.lg, paddingHorizontal: SPACING.lg, paddingVertical: 18,
    marginBottom: SPACING.md, gap: SPACING.md, borderWidth: 2, borderColor: COLORS.border,
  },
  input: { flex: 1, fontSize: FONT_SIZES.md, fontFamily: FONTS.regular, color: COLORS.text },
  errorRow: {
    flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: SPACING.md,
  },
  errorText: { fontSize: FONT_SIZES.sm, fontFamily: FONTS.medium, color: COLORS.danger },

  dividerRow: {
    flexDirection: 'row', alignItems: 'center', marginVertical: SPACING.lg, gap: SPACING.md,
  },
  dividerLine: { flex: 1, height: 1, backgroundColor: COLORS.border },
  dividerText: { fontSize: FONT_SIZES.sm, fontFamily: FONTS.medium, color: COLORS.textLight },

  socialBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: SPACING.md,
    paddingVertical: 16, borderRadius: BORDER_RADIUS.lg,
    backgroundColor: COLORS.background, ...SHADOWS.sm,
  },
  socialBtnText: { fontSize: FONT_SIZES.md, fontFamily: FONTS.semiBold, color: COLORS.text },

  terms: {
    fontSize: FONT_SIZES.xs, fontFamily: FONTS.regular, color: COLORS.textLight,
    textAlign: 'center', marginTop: SPACING.lg, lineHeight: 20,
  },
  termsLink: { fontFamily: FONTS.semiBold, color: COLORS.primary },

  featuresGrid: {
    flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.md, marginBottom: SPACING.lg,
  },
  featureCard: {
    width: (width - SPACING.lg * 2 - SPACING.md) / 2,
    backgroundColor: COLORS.card, borderRadius: BORDER_RADIUS.xl, padding: SPACING.lg,
    ...SHADOWS.md,
  },
  featureIcon: {
    width: 44, height: 44, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center', marginBottom: 12,
  },
  featureTitle: { fontSize: FONT_SIZES.md, fontFamily: FONTS.bold, color: COLORS.text, marginBottom: 4, letterSpacing: -0.2 },
  featureDesc: { fontSize: FONT_SIZES.xs, fontFamily: FONTS.regular, color: COLORS.textLight, lineHeight: 20 },

  usdBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: SPACING.md,
    paddingVertical: 16, backgroundColor: COLORS.surface, borderRadius: BORDER_RADIUS.xl,
    ...SHADOWS.sm,
  },
  usdText: { fontSize: FONT_SIZES.md, fontFamily: FONTS.semiBold, color: COLORS.primary },
});
