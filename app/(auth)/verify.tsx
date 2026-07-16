import React, { useState, useRef } from 'react';
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
import { router, useLocalSearchParams } from 'expo-router';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '@/constants';
import { useAuthStore } from '@/stores';
import { useTranslation } from '@/hooks';
import { Button } from '@/components/ui';

export default function VerifyScreen() {
  const { email } = useLocalSearchParams<{ email: string }>();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const { verifyOtp } = useAuthStore();
  const { t } = useTranslation();
  const inputRefs = useRef<(TextInput | null)[]>([]);

  const handleOtpChange = (value: string, index: number) => {
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (key: string, index: number) => {
    if (key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const otpString = otp.join('');
    if (otpString.length !== 6) {
      Alert.alert('Error', 'Please enter the complete verification code');
      return;
    }

    setIsLoading(true);
    try {
      const success = await verifyOtp(email || '', otpString);
      if (success) {
        router.replace('/(tabs)');
      } else {
        Alert.alert('Error', t('invalid_otp'));
      }
    } catch (error) {
      Alert.alert('Error', 'Verification failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      const { signIn } = useAuthStore.getState();
      await signIn(email || '');
      Alert.alert('Success', t('otp_sent'));
    } catch (error) {
      Alert.alert('Error', 'Failed to resend code');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.content}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backText}>← {t('back')}</Text>
        </TouchableOpacity>

        <View style={styles.header}>
          <Text style={styles.title}>{t('verify_otp')}</Text>
          <Text style={styles.subtitle}>We sent a 6-digit code to</Text>
          <Text style={styles.email}>{email}</Text>
        </View>

        <View style={styles.otpContainer}>
          {otp.map((digit, index) => (
            <TextInput
              key={index}
              ref={(ref) => (inputRefs.current[index] = ref)}
              style={[styles.otpInput, digit ? styles.otpInputFilled : null]}
              value={digit}
              onChangeText={(value) => handleOtpChange(value, index)}
              onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, index)}
              keyboardType="number-pad"
              maxLength={1}
              selectTextOnFocus
            />
          ))}
        </View>

        <View style={styles.buttonContainer}>
          <Button
            title={t('verify_otp')}
            onPress={handleVerify}
            isLoading={isLoading}
            disabled={otp.join('').length !== 6}
          />
        </View>

        <TouchableOpacity style={styles.resendButton} onPress={handleResend}>
          <Text style={styles.resendText}>Didn't receive the code? Resend</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.xxl,
  },
  backButton: {
    marginBottom: SPACING.xl,
  },
  backText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.primary,
    fontWeight: '500',
  },
  header: {
    marginBottom: SPACING.xxl,
  },
  title: {
    fontSize: FONT_SIZES.title,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  subtitle: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textLight,
    marginBottom: SPACING.sm,
  },
  email: {
    fontSize: FONT_SIZES.lg,
    color: COLORS.primary,
    fontWeight: '600',
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.xxl,
  },
  otpInput: {
    width: 48,
    height: 56,
    borderWidth: 2,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.md,
    textAlign: 'center',
    fontSize: FONT_SIZES.xxl,
    fontWeight: '700',
    color: COLORS.text,
    backgroundColor: COLORS.surface,
  },
  otpInputFilled: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryLight + '20',
  },
  buttonContainer: {
    marginBottom: SPACING.lg,
  },
  resendButton: {
    alignItems: 'center',
  },
  resendText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.primary,
    fontWeight: '500',
  },
});
