import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { COLORS, BORDER_RADIUS, FONTS, GRADIENTS } from '@/constants';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  onPress?: () => void;
  showText?: boolean;
  light?: boolean;
}

export function Logo({ size = 'md', onPress, showText = true, light = false }: LogoProps) {
  const router = useRouter();
  const handlePress = onPress || (() => router.replace('/(tabs)'));

  const dimensions = {
    sm: { box: 32, radius: 10, fontSize: 18, textSize: 16 },
    md: { box: 44, radius: 14, fontSize: 24, textSize: 22 },
    lg: { box: 64, radius: 18, fontSize: 36, textSize: 32 },
  }[size];

  const textColor = light ? COLORS.textInverse : COLORS.text;
  const subtextColor = light ? 'rgba(255,255,255,0.7)' : COLORS.textMuted;

  return (
    <TouchableOpacity style={styles.container} onPress={handlePress} activeOpacity={0.7}>
      <LinearGradient
        colors={GRADIENTS.primary as readonly [string, string]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.iconBox, {
          width: dimensions.box,
          height: dimensions.box,
          borderRadius: dimensions.radius,
        }]}
      >
        <Text style={[styles.iconText, { fontSize: dimensions.fontSize }]}>I</Text>
      </LinearGradient>
      {showText && (
        <View style={styles.textContainer}>
          <Text style={[styles.brandName, {
            fontSize: dimensions.textSize,
            color: textColor,
          }]}>Isizuo</Text>
          {size !== 'sm' && (
            <Text style={[styles.tagline, { color: subtextColor }]}>Date. Connect. Belong.</Text>
          )}
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconBox: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: {
    fontFamily: FONTS.black,
    color: COLORS.textInverse,
    marginTop: -2,
  },
  textContainer: {
    gap: 1,
  },
  brandName: {
    fontFamily: FONTS.extraBold,
    letterSpacing: -0.5,
  },
  tagline: {
    fontFamily: FONTS.medium,
    fontSize: 14,
    letterSpacing: 0.3,
  },
});
