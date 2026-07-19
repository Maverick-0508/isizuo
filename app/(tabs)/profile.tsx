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
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '@/constants';
import { AVAILABLE_LANGUAGES } from '@/i18n';
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
        { icon: 'person-outline' as const, label: 'Edit Profile', onPress: () => router.push('/profile/edit') },
        { icon: 'camera-outline' as const, label: 'Photo Verification', onPress: () => router.push('/safety'), badge: user?.isPhotoVerified ? 'Verified' : 'Pending' },
        { icon: 'shield-checkmark-outline' as const, label: 'Safety Center', onPress: () => router.push('/safety') },
        { icon: 'people-outline' as const, label: 'Family Endorsement', onPress: () => router.push('/family') },
      ],
    },
    {
      section: 'Premium',
      items: [
        { icon: 'rocket-outline' as const, label: 'Boost Profile', onPress: () => {} },
        { icon: 'gift-outline' as const, label: 'Send Gift', onPress: () => {} },
        { icon: 'diamond-outline' as const, label: 'Subscription Plans', onPress: () => {} },
        { icon: 'wallet-outline' as const, label: 'My Credits', onPress: () => {}, rightText: `${user?.credits || 0}` },
      ],
    },
    {
      section: 'Safety',
      items: [
        { icon: 'location-outline' as const, label: 'Location Sharing', onPress: () => {} },
        { icon: 'alert-circle-outline' as const, label: 'Emergency Contacts', onPress: () => router.push('/safety') },
        { icon: 'ban-outline' as const, label: 'Blocked Users', onPress: () => {} },
        { icon: 'document-text-outline' as const, label: 'My Reports', onPress: () => {} },
      ],
    },
    {
      section: 'Settings',
      items: [
        { icon: 'language-outline' as const, label: 'Language', onPress: () => setShowLanguagePicker(!showLanguagePicker), rightText: AVAILABLE_LANGUAGES.find((l) => l.code === language)?.nativeName },
        { icon: 'phone-portrait-outline' as const, label: 'Low Data Mode', onPress: toggleLowDataMode, isSwitch: true, switchValue: isLowDataMode },
        { icon: 'notifications-outline' as const, label: 'Notifications', onPress: () => {} },
        { icon: 'lock-closed-outline' as const, label: 'Privacy', onPress: () => {} },
      ],
    },
    {
      section: 'Developer',
      items: [
        { icon: 'keypad-outline' as const, label: 'USSD Mode', onPress: () => router.push('/ussd') },
        { icon: 'extension-puzzle-outline' as const, label: 'Embedded SDK', onPress: () => {} },
      ],
    },
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Avatar size={72} isVerified={user?.isVerified} name={user?.name || 'User'} colorIndex={0} />
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{user?.name || 'Isizuo User'}</Text>
          <Text style={styles.userEmail}>{user?.email || 'user@isizuo.com'}</Text>
          <View style={styles.badgeRow}>
            {user?.isVerified && <Badge label="Verified" variant="verified" size="sm" icon="checkmark-circle" />}
            {user?.kycLevel && user.kycLevel !== 'none' && (
              <Badge label={`KYC: ${user.kycLevel.toUpperCase()}`} variant="info" size="sm" />
            )}
            <Badge label={`Safety: ${user?.safetyScore || 50}%`} variant="success" size="sm" icon="shield-checkmark" />
          </View>
        </View>
      </View>

      {showLanguagePicker && (
        <Card style={styles.languageCard}>
          <View style={styles.languageHeader}>
            <Ionicons name="language-outline" size={18} color={COLORS.text} />
            <Text style={styles.languageTitle}>{t('language_setting')}</Text>
          </View>
          {AVAILABLE_LANGUAGES.map((lang) => (
            <TouchableOpacity
              key={lang.code}
              style={[styles.languageOption, language === lang.code && styles.languageOptionActive]}
              onPress={() => {
                setLanguage(lang.code);
                setShowLanguagePicker(false);
              }}
              activeOpacity={0.7}
            >
              <Text style={[styles.languageText, language === lang.code && styles.languageTextActive]}>
                {lang.nativeName} ({lang.name})
              </Text>
              {language === lang.code && <Ionicons name="checkmark-circle" size={18} color={COLORS.primary} />}
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
                activeOpacity={0.7}
              >
                <View style={styles.menuIconContainer}>
                  <Ionicons name={item.icon} size={20} color={COLORS.textLight} />
                </View>
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
                      {item.badge && <Badge label={item.badge} variant={item.badge === 'Verified' ? 'verified' : 'warning'} size="sm" />}
                      <Ionicons name="chevron-forward" size={16} color={COLORS.textLight} />
                    </>
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </Card>
        </View>
      ))}

      <View style={styles.footer}>
        <Button title="Logout" onPress={handleLogout} variant="danger" size="lg" icon="log-out-outline" />
        <Text style={styles.version}>Isizuo v1.0.0</Text>
        <Text style={styles.copyright}>Made with love in Africa</Text>
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
  userEmail: {
    fontSize: FONT_SIZES.sm,
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
  languageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  languageTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
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
  section: {
    paddingHorizontal: SPACING.lg,
    marginTop: SPACING.lg,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '700',
    color: COLORS.textLight,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
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
  menuIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.surfaceDark,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  menuLabel: {
    flex: 1,
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    fontWeight: '500',
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
  footer: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.xl,
    paddingBottom: 120,
    alignItems: 'center',
  },
  version: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textLight,
    marginTop: SPACING.md,
  },
  copyright: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textLight,
    marginTop: 4,
    opacity: 0.7,
  },
});
