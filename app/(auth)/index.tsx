import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Dimensions, Platform, KeyboardAvoidingView, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTranslation } from '@/hooks';
import { useAuthStore } from '@/stores';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS, SHADOWS, FONTS } from '@/constants';
import { Button } from '@/components/ui';
import { Logo } from '@/components/Logo';

const { width, height } = Dimensions.get('window');

export default function LoginScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { signIn } = useAuthStore();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSendOTP = async () => {
    if (!email.trim()) return;
    setIsLoading(true);
    try {
      await signIn(email.trim());
      router.replace('/(tabs)');
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.gradientBg}>
        <View style={[styles.circle, styles.circle1]} />
        <View style={[styles.circle, styles.circle2]} />
        <View style={[styles.circle, styles.circle3]} />
        <View style={[styles.circle, styles.circle4]} />
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.keyboardView}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.heroSection}>
            <View style={styles.logoWrap}>
              <View style={styles.logoIconBox}>
                <Text style={styles.logoLetter}>I</Text>
              </View>
            </View>
            <Text style={styles.heroTitle}>Isizuo</Text>
            <Text style={styles.heroTagline}>Date. Connect. Belong.</Text>
            <Text style={styles.heroSubtitle}>
              The dating app built for African singles. Find meaningful connections rooted in culture, community, and values.
            </Text>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>50K+</Text>
              <Text style={styles.statLabel}>Active Users</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>20+</Text>
              <Text style={styles.statLabel}>Communities</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>4.8</Text>
              <Text style={styles.statLabel}>App Rating</Text>
            </View>
          </View>

          <View style={styles.formCard}>
            <Text style={styles.formTitle}>Get started</Text>
            <Text style={styles.formDesc}>Enter your email to create an account or sign in</Text>

            <View style={styles.inputContainer}>
              <Ionicons name="mail-outline" size={20} color={COLORS.textLight} />
              <TextInput
                style={styles.input}
                placeholder="you@example.com"
                placeholderTextColor={COLORS.textLight}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <Button
              title="Continue with Email"
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
              <Text style={styles.dividerText}>or</Text>
              <View style={styles.dividerLine} />
            </View>

            <TouchableOpacity style={styles.socialBtn}>
              <Ionicons name="logo-google" size={20} color="#DB4437" />
              <Text style={styles.socialBtnText}>Continue with Google</Text>
            </TouchableOpacity>

            <Text style={styles.terms}>
              By continuing, you agree to our{' '}
              <Text style={styles.termsLink}>Terms of Service</Text>
              {' '}and{' '}
              <Text style={styles.termsLink}>Privacy Policy</Text>
            </Text>
          </View>

          <View style={styles.featuresGrid}>
            <View style={styles.featureCard}>
              <View style={[styles.featureIcon, { backgroundColor: '#E8F5E9' }]}>
                <Ionicons name="shield-checkmark" size={22} color={COLORS.safe} />
              </View>
              <Text style={styles.featureTitle}>Verified Profiles</Text>
              <Text style={styles.featureDesc}>Every profile is verified for your safety</Text>
            </View>
            <View style={styles.featureCard}>
              <View style={[styles.featureIcon, { backgroundColor: '#E3F2FD' }]}>
                <Ionicons name="people" size={22} color={COLORS.info} />
              </View>
              <Text style={styles.featureTitle}>Community First</Text>
              <Text style={styles.featureDesc}>Connect through shared cultural roots</Text>
            </View>
            <View style={styles.featureCard}>
              <View style={[styles.featureIcon, { backgroundColor: '#FCE4EC' }]}>
                <Ionicons name="heart" size={22} color={COLORS.primary} />
              </View>
              <Text style={styles.featureTitle}>Family Values</Text>
              <Text style={styles.featureDesc}>Find someone who shares your values</Text>
            </View>
            <View style={styles.featureCard}>
              <View style={[styles.featureIcon, { backgroundColor: '#FFF3E0' }]}>
                <Ionicons name="location" size={22} color={COLORS.accentDark} />
              </View>
              <Text style={styles.featureTitle}>Local Events</Text>
              <Text style={styles.featureDesc}>Meet at events in your city</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.usdBtn}>
            <Ionicons name="call-outline" size={18} color={COLORS.primary} />
            <Text style={styles.usdText}>Sign in with Phone (USSD coming soon)</Text>
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
    backgroundColor: COLORS.primary, overflow: 'hidden',
  },
  circle: { position: 'absolute', borderRadius: 999 },
  circle1: { width: 350, height: 350, top: -100, right: -80, backgroundColor: COLORS.secondary, opacity: 0.2 },
  circle2: { width: 200, height: 200, top: 120, left: -50, backgroundColor: COLORS.accent, opacity: 0.15 },
  circle3: { width: 280, height: 280, top: 250, right: -40, backgroundColor: '#FF6B6B', opacity: 0.12 },
  circle4: { width: 150, height: 150, top: 50, left: width * 0.3, backgroundColor: '#00B894', opacity: 0.1 },
  keyboardView: { flex: 1 },
  scrollContent: { flexGrow: 1, paddingHorizontal: SPACING.lg, paddingTop: 70, paddingBottom: SPACING.xxl },

  heroSection: { alignItems: 'center', marginBottom: SPACING.xl },
  logoWrap: { marginBottom: SPACING.lg },
  logoIconBox: {
    width: 80, height: 80, borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: 'rgba(255,255,255,0.3)',
  },
  logoLetter: {
    fontSize: 44, fontFamily: FONTS.black,
    color: COLORS.textInverse, marginTop: -3,
  },
  heroTitle: {
    fontSize: 48, fontFamily: FONTS.black,
    color: COLORS.textInverse, letterSpacing: -1.5, marginBottom: 4,
  },
  heroTagline: {
    fontSize: 16, fontFamily: FONTS.semiBold,
    color: 'rgba(255,255,255,0.85)', letterSpacing: 1, textTransform: 'uppercase',
    marginBottom: SPACING.md,
  },
  heroSubtitle: {
    fontSize: 15, fontFamily: FONTS.regular,
    color: 'rgba(255,255,255,0.75)', textAlign: 'center',
    lineHeight: 22, paddingHorizontal: SPACING.md, maxWidth: 380,
  },

  statsRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: BORDER_RADIUS.lg, paddingVertical: 16, paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.xl, gap: 0,
  },
  statItem: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: 22, fontFamily: FONTS.black, color: COLORS.textInverse },
  statLabel: { fontSize: 11, fontFamily: FONTS.medium, color: 'rgba(255,255,255,0.7)', marginTop: 2 },
  statDivider: { width: 1, height: 32, backgroundColor: 'rgba(255,255,255,0.2)' },

  formCard: {
    backgroundColor: COLORS.card, borderRadius: BORDER_RADIUS.xl, padding: SPACING.lg,
    marginBottom: SPACING.lg, ...SHADOWS.md,
  },
  formTitle: { fontSize: 22, fontFamily: FONTS.bold, color: COLORS.text, marginBottom: 4 },
  formDesc: { fontSize: 14, fontFamily: FONTS.regular, color: COLORS.textLight, marginBottom: SPACING.lg, lineHeight: 20 },
  inputContainer: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.background,
    borderRadius: BORDER_RADIUS.lg, paddingHorizontal: SPACING.md, paddingVertical: 16,
    marginBottom: SPACING.md, gap: SPACING.sm, borderWidth: 1.5, borderColor: COLORS.border,
  },
  input: { flex: 1, fontSize: 15, fontFamily: FONTS.regular, color: COLORS.text },

  dividerRow: {
    flexDirection: 'row', alignItems: 'center', marginVertical: SPACING.lg, gap: SPACING.md,
  },
  dividerLine: { flex: 1, height: 1, backgroundColor: COLORS.border },
  dividerText: { fontSize: 13, fontFamily: FONTS.medium, color: COLORS.textLight },

  socialBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: SPACING.sm,
    paddingVertical: 14, borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1.5, borderColor: COLORS.border, backgroundColor: COLORS.background,
  },
  socialBtnText: { fontSize: 15, fontFamily: FONTS.semiBold, color: COLORS.text },

  terms: {
    fontSize: 12, fontFamily: FONTS.regular, color: COLORS.textLight,
    textAlign: 'center', marginTop: SPACING.lg, lineHeight: 18,
  },
  termsLink: { fontFamily: FONTS.semiBold, color: COLORS.primary },

  featuresGrid: {
    flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm, marginBottom: SPACING.lg,
  },
  featureCard: {
    width: (width - SPACING.lg * 2 - SPACING.sm) / 2,
    backgroundColor: COLORS.card, borderRadius: BORDER_RADIUS.lg, padding: SPACING.md,
    borderWidth: 1, borderColor: COLORS.border,
  },
  featureIcon: {
    width: 40, height: 40, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center', marginBottom: 10,
  },
  featureTitle: { fontSize: 14, fontFamily: FONTS.bold, color: COLORS.text, marginBottom: 3 },
  featureDesc: { fontSize: 12, fontFamily: FONTS.regular, color: COLORS.textLight, lineHeight: 17 },

  usdBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: SPACING.sm,
    paddingVertical: 14, backgroundColor: COLORS.card, borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1.5, borderColor: COLORS.border,
  },
  usdText: { fontSize: 14, fontFamily: FONTS.semiBold, color: COLORS.primary },
});
