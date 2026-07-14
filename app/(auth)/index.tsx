import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '@/constants';
import { useAuthStore } from '@/stores';
import { useTranslation } from '@/hooks';
import { Button } from '@/components/ui';

export default function LoginScreen() {
  const [phone, setPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { signIn } = useAuthStore();
  const { t } = useTranslation();

  const handleSendOtp = async () => {
    if (!phone || phone.length < 10) {
      Alert.alert('Error', 'Please enter a valid phone number');
      return;
    }
    setIsLoading(true);
    try {
      await signIn(phone);
      router.push({ pathname: '/(auth)/verify', params: { phone } });
    } catch (error) {
      Alert.alert('Error', 'Failed to send verification code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.logo}>❤️</Text>
          <Text style={styles.title}>{t('app_name')}</Text>
          <Text style={styles.tagline}>{t('tagline')}</Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>{t('phone_placeholder')}</Text>
          <View style={styles.phoneInput}>
            <Text style={styles.countryCode}>+254</Text>
            <TextInput
              style={styles.input}
              value={phone}
              onChangeText={setPhone}
              placeholder="7XX XXX XXX"
              placeholderTextColor={COLORS.textLight}
              keyboardType="phone-pad"
              maxLength={12}
            />
          </View>

          <Button
            title={t('send_otp')}
            onPress={handleSendOtp}
            isLoading={isLoading}
            disabled={!phone || phone.length < 10}
          />
        </View>

        <TouchableOpacity
          style={styles.ussdButton}
          onPress={() => router.push('/ussd')}
        >
          <Text style={styles.ussdText}>📱 {t('ussd_mode')}</Text>
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            By continuing, you agree to our Terms of Service and Privacy Policy
          </Text>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primary,
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.xl,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: SPACING.xxl,
  },
  logo: {
    fontSize: 64,
    marginBottom: SPACING.md,
  },
  title: {
    fontSize: FONT_SIZES.hero,
    fontWeight: '800',
    color: COLORS.textInverse,
    marginBottom: SPACING.sm,
  },
  tagline: {
    fontSize: FONT_SIZES.lg,
    color: COLORS.textInverse,
    opacity: 0.9,
  },
  form: {
    backgroundColor: COLORS.background,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.xl,
    marginBottom: SPACING.lg,
  },
  label: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    marginBottom: SPACING.sm,
    fontWeight: '500',
  },
  phoneInput: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.lg,
    overflow: 'hidden',
  },
  countryCode: {
    backgroundColor: COLORS.surfaceDark,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    fontWeight: '600',
    borderRightWidth: 1,
    borderRightColor: COLORS.border,
  },
  input: {
    flex: 1,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    fontSize: FONT_SIZES.lg,
    color: COLORS.text,
  },
  ussdButton: {
    alignItems: 'center',
    padding: SPACING.md,
    marginBottom: SPACING.lg,
  },
  ussdText: {
    color: COLORS.textInverse,
    fontSize: FONT_SIZES.md,
    fontWeight: '500',
  },
  footer: {
    alignItems: 'center',
  },
  footerText: {
    color: COLORS.textInverse,
    fontSize: FONT_SIZES.xs,
    opacity: 0.7,
    textAlign: 'center',
  },
});
