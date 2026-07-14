import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
} from 'react-native';
import { router } from 'expo-router';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '@/constants';
import { useTranslation } from '@/hooks';

interface USSDMenuItem {
  id: string;
  label: string;
  action?: () => void;
  submenu?: USSDMenuItem[];
}

export default function USSDScreen() {
  const { t } = useTranslation();
  const [currentScreen, setCurrentScreen] = useState<'menu' | 'matches' | 'profile' | 'safety' | 'events' | 'credits'>('menu');
  const [inputValue, setInputValue] = useState('');
  const [history, setHistory] = useState<string[]>([]);

  const menuItems: USSDMenuItem[] = [
    { id: '1', label: 'View Matches', action: () => navigateTo('matches') },
    { id: '2', label: 'My Profile', action: () => navigateTo('profile') },
    { id: '3', label: 'Safety Check-In', action: () => navigateTo('safety') },
    { id: '4', label: 'Events Near Me', action: () => navigateTo('events') },
    { id: '5', label: 'My Credits', action: () => navigateTo('credits') },
    { id: '6', label: 'Settings', action: () => {} },
    { id: '0', label: 'Exit', action: () => router.back() },
  ];

  const matchItems: USSDMenuItem[] = [
    { id: '1', label: 'View Next Match' },
    { id: '2', label: 'Like Current Match' },
    { id: '3', label: 'Pass Current Match' },
    { id: '4', label: 'Send Message' },
    { id: '0', label: 'Back to Menu', action: () => navigateTo('menu') },
  ];

  const profileItems: USSDMenuItem[] = [
    { id: '1', label: 'View Profile' },
    { id: '2', label: 'Update Bio' },
    { id: '3', label: 'Update Interests' },
    { id: '4', label: 'Verify Phone' },
    { id: '0', label: 'Back to Menu', action: () => navigateTo('menu') },
  ];

  const safetyItems: USSDMenuItem[] = [
    { id: '1', label: 'Start Check-In' },
    { id: '2', label: 'Share Location' },
    { id: '3', label: 'Emergency SOS' },
    { id: '4', label: 'Add Emergency Contact' },
    { id: '0', label: 'Back to Menu', action: () => navigateTo('menu') },
  ];

  const eventItems: USSDMenuItem[] = [
    { id: '1', label: 'Social Events' },
    { id: '2', label: 'Professional Events' },
    { id: '3', label: 'Cultural Events' },
    { id: '4', label: 'Religious Events' },
    { id: '0', label: 'Back to Menu', action: () => navigateTo('menu') },
  ];

  const creditItems: USSDMenuItem[] = [
    { id: '1', label: 'View Balance' },
    { id: '2', label: 'Buy Credits (M-Pesa)' },
    { id: '3', label: 'Buy Credits (Airtime)' },
    { id: '4', label: 'Boost Profile' },
    { id: '0', label: 'Back to Menu', action: () => navigateTo('menu') },
  ];

  const getItems = () => {
    switch (currentScreen) {
      case 'matches': return matchItems;
      case 'profile': return profileItems;
      case 'safety': return safetyItems;
      case 'events': return eventItems;
      case 'credits': return creditItems;
      default: return menuItems;
    }
  };

  const navigateTo = (screen: typeof currentScreen) => {
    setHistory([...history, currentScreen]);
    setCurrentScreen(screen);
    setInputValue('');
  };

  const goBack = () => {
    const newHistory = [...history];
    const prev = newHistory.pop() || 'menu';
    setHistory(newHistory);
    setCurrentScreen(prev);
    setInputValue('');
  };

  const handleSelect = (item: USSDMenuItem) => {
    if (item.action) {
      item.action();
    }
  };

  const handleInput = () => {
    const items = getItems();
    const selected = items.find((item) => item.id === inputValue);
    if (selected) {
      handleSelect(selected);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.statusBar}>
        <Text style={styles.statusBarText}>USSD Mode</Text>
        <Text style={styles.statusBarText}>📶 Low Data</Text>
      </View>

      <View style={styles.phoneFrame}>
        <View style={styles.phoneHeader}>
          <TouchableOpacity onPress={goBack} style={styles.backButton}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.screenTitle}>
            {currentScreen === 'menu' ? t('app_name') : currentScreen.toUpperCase()}
          </Text>
        </View>

        <View style={styles.ussdDisplay}>
          <Text style={styles.ussdHeader}>
            {currentScreen === 'menu'
              ? `Welcome to ${t('app_name')}\nSelect an option:`
              : `${currentScreen.toUpperCase()} Menu\nSelect an option:`}
          </Text>

          {getItems().map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.ussdOption}
              onPress={() => handleSelect(item)}
            >
              <Text style={styles.ussdOptionText}>
                {item.id}. {item.label}
              </Text>
            </TouchableOpacity>
          ))}

          {currentScreen === 'credits' && (
            <View style={styles.balanceBox}>
              <Text style={styles.balanceLabel}>Your Balance:</Text>
              <Text style={styles.balanceValue}>10 Credits</Text>
            </View>
          )}
        </View>

        <View style={styles.inputArea}>
          <TextInput
            style={styles.ussdInput}
            value={inputValue}
            onChangeText={setInputValue}
            placeholder="Enter number..."
            placeholderTextColor={COLORS.textLight}
            keyboardType="number-pad"
            maxLength={2}
          />
          <TouchableOpacity style={styles.sendButton} onPress={handleInput}>
            <Text style={styles.sendButtonText}>Send</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          💡 Tip: USSD mode works on any phone without internet
        </Text>
        <Text style={styles.footerText}>
          Dial *123# on your feature phone for full USSD access
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  statusBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.xxl + SPACING.md,
    paddingBottom: SPACING.sm,
  },
  statusBarText: {
    color: COLORS.textInverse,
    fontSize: FONT_SIZES.xs,
    opacity: 0.7,
  },
  phoneFrame: {
    flex: 1,
    backgroundColor: '#0f0f23',
    marginHorizontal: SPACING.lg,
    borderRadius: BORDER_RADIUS.xl,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#333',
  },
  phoneHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: '#16213e',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  backButton: {
    marginRight: SPACING.md,
  },
  backButtonText: {
    color: '#00d4ff',
    fontSize: FONT_SIZES.md,
  },
  screenTitle: {
    color: '#00d4ff',
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
    flex: 1,
    textAlign: 'center',
  },
  ussdDisplay: {
    flex: 1,
    padding: SPACING.md,
  },
  ussdHeader: {
    color: '#00ff88',
    fontSize: FONT_SIZES.sm,
    fontFamily: 'monospace',
    marginBottom: SPACING.md,
    lineHeight: 20,
  },
  ussdOption: {
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  ussdOptionText: {
    color: '#ffffff',
    fontSize: FONT_SIZES.sm,
    fontFamily: 'monospace',
  },
  balanceBox: {
    marginTop: SPACING.md,
    padding: SPACING.md,
    backgroundColor: '#16213e',
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: '#00ff88',
  },
  balanceLabel: {
    color: '#00ff88',
    fontSize: FONT_SIZES.xs,
    fontFamily: 'monospace',
  },
  balanceValue: {
    color: '#ffffff',
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
    fontFamily: 'monospace',
    marginTop: SPACING.xs,
  },
  inputArea: {
    flexDirection: 'row',
    padding: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: '#333',
    gap: SPACING.sm,
  },
  ussdInput: {
    flex: 1,
    backgroundColor: '#16213e',
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    color: '#ffffff',
    fontSize: FONT_SIZES.lg,
    fontFamily: 'monospace',
    borderWidth: 1,
    borderColor: '#333',
  },
  sendButton: {
    backgroundColor: '#00d4ff',
    paddingHorizontal: SPACING.lg,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonText: {
    color: '#000000',
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
  },
  footer: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    paddingBottom: SPACING.xxl,
  },
  footerText: {
    color: COLORS.textInverse,
    fontSize: FONT_SIZES.xs,
    opacity: 0.5,
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
});
