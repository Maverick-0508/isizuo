import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Dimensions, Platform, KeyboardAvoidingView, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTranslation } from '@/hooks';
import { useAuthStore } from '@/stores';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS, SHADOWS } from '@/constants';
import { Button } from '@/components/ui';

const { width, height } = Dimensions.get('window');

export default function LoginScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { sendOTP } = useAuthStore();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSendOTP = async () => {
    if (!email.trim()) return;
    setIsLoading(true);
    try {
      await sendOTP(email.trim());
      router.push('/(auth)/verify');
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.gradientBg}>
        <View style={[styles.blob, styles.blob1]} />
        <View style={[styles.blob, styles.blob2]} />
        <View style={[styles.blob, styles.blob3]} />
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.keyboardView}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.heroSection}>
            <View style={styles.logoContainer}>
              <Ionicons name="heart" size={32} color={COLORS.textInverse} />
            </View>
            <Text style={styles.heroTitle}>Isizuo</Text>
            <Text style={styles.heroSubtitle}>Where meaningful connections begin</Text>
          </View>

          <View style={styles.featuresRow}>
            <View style={styles.featureItem}>
              <View style={styles.featureIcon}>
                <Ionicons name="shield-checkmark" size={20} color={COLORS.safe} />
              </View>
              <Text style={styles.featureText}>Safe</Text>
            </View>
            <View style={styles.featureItem}>
              <View style={styles.featureIcon}>
                <Ionicons name="people" size={20} color={COLORS.info} />
              </View>
              <Text style={styles.featureText}>Community</Text>
            </View>
            <View style={styles.featureItem}>
              <View style={styles.featureIcon}>
                <Ionicons name="heart" size={20} color={COLORS.primary} />
              </View>
              <Text style={styles.featureText}>Authentic</Text>
            </View>
          </View>

          <View style={styles.formCard}>
            <Text style={styles.formTitle}>Get started</Text>
            <Text style={styles.formDesc}>Enter your email to receive a verification code</Text>

            <View style={styles.inputContainer}>
              <Ionicons name="mail-outline" size={20} color={COLORS.textLight} />
              <TextInput
                style={styles.input}
                placeholder="Enter your email"
                placeholderTextColor={COLORS.textLight}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <Button
              title="Continue"
              onPress={handleSendOTP}
              variant="gradient"
              size="lg"
              fullWidth
              isLoading={isLoading}
              disabled={!email.trim()}
              icon="arrow-forward"
            />

            <Text style={styles.terms}>
              By continuing, you agree to our{' '}
              <Text style={styles.termsLink}>Terms of Service</Text>
              {' '}and{' '}
              <Text style={styles.termsLink}>Privacy Policy</Text>
            </Text>
          </View>

          <TouchableOpacity style={styles.usdBtn}>
            <Ionicons name="chatbubble-ellipses-outline" size={18} color={COLORS.primary} />
            <Text style={styles.usdText}>USSD (Coming Soon)</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  gradientBg: {
    position: 'absolute', top: 0, left: 0, right: 0, height: height * 0.6,
    backgroundColor: COLORS.primary, overflow: 'hidden',
  },
  blob: { position: 'absolute', borderRadius: 999, opacity: 0.15 },
  blob1: { width: 300, height: 300, top: -80, right: -60, backgroundColor: COLORS.secondary },
  blob2: { width: 200, height: 200, top: 100, left: -40, backgroundColor: COLORS.accent },
  blob3: { width: 250, height: 250, top: 200, right: -30, backgroundColor: '#FF6B6B' },
  keyboardView: { flex: 1 },
  scrollContent: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: SPACING.lg, paddingVertical: SPACING.xl },
  heroSection: { alignItems: 'center', marginBottom: SPACING.xl },
  logoContainer: {
    width: 64, height: 64, borderRadius: 32, backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center', justifyContent: 'center', marginBottom: SPACING.md,
  },
  heroTitle: { fontSize: 42, fontWeight: '900', color: COLORS.textInverse, letterSpacing: -1 },
  heroSubtitle: { fontSize: FONT_SIZES.lg, color: 'rgba(255,255,255,0.8)', marginTop: SPACING.xs },
  featuresRow: {
    flexDirection: 'row', justifyContent: 'center', gap: SPACING.xl, marginBottom: SPACING.xl,
  },
  featureItem: { alignItems: 'center', gap: 6 },
  featureIcon: {
    width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center', justifyContent: 'center',
  },
  featureText: { fontSize: FONT_SIZES.xs, fontWeight: '600', color: COLORS.textInverse },
  formCard: {
    backgroundColor: COLORS.card, borderRadius: BORDER_RADIUS.xl, padding: SPACING.lg,
    marginBottom: SPACING.md, ...SHADOWS.lg,
  },
  formTitle: { fontSize: FONT_SIZES.xxl, fontWeight: '800', color: COLORS.text, marginBottom: 4 },
  formDesc: { fontSize: FONT_SIZES.md, color: COLORS.textLight, marginBottom: SPACING.lg, lineHeight: 20 },
  inputContainer: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.background,
    borderRadius: BORDER_RADIUS.lg, paddingHorizontal: SPACING.md, paddingVertical: 14,
    marginBottom: SPACING.md, gap: SPACING.sm, borderWidth: 1, borderColor: COLORS.border,
  },
  input: { flex: 1, fontSize: FONT_SIZES.md, color: COLORS.text },
  terms: { fontSize: FONT_SIZES.xs, color: COLORS.textLight, textAlign: 'center', marginTop: SPACING.md, lineHeight: 18 },
  termsLink: { color: COLORS.primary, fontWeight: '600' },
  usdBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: SPACING.sm,
    paddingVertical: 12, backgroundColor: COLORS.card, borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1, borderColor: COLORS.border,
  },
  usdText: { fontSize: FONT_SIZES.sm, fontWeight: '600', color: COLORS.primary },
});
