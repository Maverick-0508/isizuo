import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Switch,
} from 'react-native';
import { router } from 'expo-router';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS, AVAILABLE_LANGUAGES } from '@/constants';
import { useAuthStore, useAppStore } from '@/stores';
import { useTranslation } from '@/hooks';
import { Card, Badge, Button, Avatar } from '@/components/ui';

export default function ProfileScreen() {
  const { user, signOut } = useAuthStore();
  const { language, setLanguage, isLowDataMode, toggleLowDataMode } = useAppStore();
  const { t } = useTranslation();
  const [showLanguagePicker, setShowLanguagePicker] = useState(false);

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: signOut },
    ]);
  };

  const menuItems = [
    {
      section: 'Account',
      items: [
        { icon: '👤', label: 'Edit Profile', onPress: () => router.push('/profile/edit') },
        { icon: '📷', label: 'Photo Verification', onPress: () => router.push('/safety'), badge: user?.isPhotoVerified ? 'Verified' : 'Pending' },
        { icon: '🛡️', label: 'Safety Center', onPress: () => router.push('/safety') },
        { icon: '👨‍👩‍👧', label: 'Family Endorsement', onPress: () => router.push('/family') },
      ],
    },
    {
      section: 'Premium',
      items: [
        { icon: '🚀', label: 'Boost Profile', onPress: () => {} },
        { icon: '🎁', label: 'Send Gift', onPress: () => {} },
        { icon: '💎', label: 'Subscription Plans', onPress: () => {} },
        { icon: '💰', label: 'My Credits', onPress: () => {}, rightText: `${user?.credits || 0}` },
      ],
    },
    {
      section: 'Safety',
      items: [
        { icon: '📍', label: 'Location Sharing', onPress: () => {} },
        { icon: '🚨', label: 'Emergency Contacts', onPress: () => router.push('/safety') },
        { icon: '🚫', label: 'Blocked Users', onPress: () => {} },
        { icon: '📋', label: 'My Reports', onPress: () => {} },
      ],
    },
    {
      section: 'Settings',
      items: [
        { icon: '🌐', label: 'Language', onPress: () => setShowLanguagePicker(!showLanguagePicker), rightText: AVAILABLE_LANGUAGES.find((l) => l.code === language)?.nativeName },
        { icon: '📱', label: 'Low Data Mode', onPress: toggleLowDataMode, isSwitch: true, switchValue: isLowDataMode },
        { icon: '🔔', label: 'Notifications', onPress: () => {} },
        { icon: '🔒', label: 'Privacy', onPress: () => {} },
      ],
    },
    {
      section: 'Developer',
      items: [
        { icon: '📱', label: 'USSD Mode', onPress: () => router.push('/ussd') },
        { icon: '🔌', label: 'Embedded SDK', onPress: () => {} },
      ],
    },
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Avatar size={80} isVerified={user?.isVerified} />
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{user?.name || 'User'}</Text>
          <Text style={styles.userPhone}>{user?.phone || '+254 XXX XXX XXX'}</Text>
          <View style={styles.badgeRow}>
            {user?.isVerified && <Badge label="✓ Verified" variant="verified" size="sm" />}
            {user?.kycLevel && user.kycLevel !== 'none' && (
              <Badge label={`KYC: ${user.kycLevel.toUpperCase()}`} variant="info" size="sm" />
            )}
            <Badge label={`Safety: ${user?.safetyScore || 50}%`} variant="success" size="sm" />
          </View>
        </View>
      </View>

      {showLanguagePicker && (
        <Card style={styles.languageCard}>
          <Text style={styles.languageTitle}>{t('language_setting')}</Text>
          {AVAILABLE_LANGUAGES.map((lang) => (
            <TouchableOpacity
              key={lang.code}
              style={[styles.languageOption, language === lang.code && styles.languageOptionActive]}
              onPress={() => {
                setLanguage(lang.code);
                setShowLanguagePicker(false);
              }}
            >
              <Text style={[styles.languageText, language === lang.code && styles.languageTextActive]}>
                {lang.nativeName} ({lang.name})
              </Text>
              {language === lang.code && <Text style={styles.checkmark}>✓</Text>}
            </TouchableOpacity>
          ))}
        </Card>
      )}

      {menuItems.map((section) => (
        <View key={section.section} style={styles.section}>
          <Text style={styles.sectionTitle}>{section.section}</Text>
          <Card style={styles.menuCard}>
            {section.items.map((item, index) => (
              <TouchableOpacity
                key={item.label}
                style={[styles.menuItem, index < section.items.length - 1 && styles.menuItemBorder]}
                onPress={item.onPress}
              >
                <Text style={styles.menuIcon}>{item.icon}</Text>
                <Text style={styles.menuLabel}>{item.label}</Text>
                <View style={styles.menuRight}>
                  {item.isSwitch ? (
                    <Switch
                      value={item.switchValue}
                      onValueChange={item.onPress}
                      trackColor={{ false: COLORS.border, true: COLORS.primaryLight }}
                      thumbColor={item.switchValue ? COLORS.primary : COLORS.textLight}
                    />
                  ) : (
                    <>
                      {item.rightText && <Text style={styles.menuRightText}>{item.rightText}</Text>}
                      {item.badge && <Badge label={item.badge} variant="info" size="sm" />}
                      <Text style={styles.menuArrow}>›</Text>
                    </>
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </Card>
        </View>
      ))}

      <View style={styles.footer}>
        <Button title="Logout" onPress={handleLogout} variant="danger" />
        <Text style={styles.version}>Isizuo v1.0.0</Text>
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
    alignItems: 'center',
    gap: SPACING.md,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.xxl + SPACING.md,
    paddingBottom: SPACING.lg,
    backgroundColor: COLORS.primary,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
    color: COLORS.textInverse,
  },
  userPhone: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textInverse,
    opacity: 0.8,
    marginBottom: SPACING.xs,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: SPACING.xs,
    flexWrap: 'wrap',
  },
  languageCard: {
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
  },
  languageTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  languageOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  languageOptionActive: {
    borderBottomColor: COLORS.primary,
  },
  languageText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
  },
  languageTextActive: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  checkmark: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  section: {
    paddingHorizontal: SPACING.lg,
    marginTop: SPACING.lg,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.textLight,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: SPACING.sm,
  },
  menuCard: {
    padding: 0,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
  },
  menuItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  menuIcon: {
    fontSize: 20,
    marginRight: SPACING.md,
    width: 28,
  },
  menuLabel: {
    flex: 1,
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
  },
  menuRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  menuRightText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textLight,
  },
  menuArrow: {
    fontSize: FONT_SIZES.xl,
    color: COLORS.textLight,
  },
  footer: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.xl,
    paddingBottom: 100,
    alignItems: 'center',
  },
  version: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textLight,
    marginTop: SPACING.md,
  },
});
