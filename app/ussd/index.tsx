import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Animated,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS, GRADIENTS } from '@/constants';
import { useTranslation } from '@/hooks';
import { useAuthStore } from '@/stores';
import { handleUSSDRequest } from '@/services/sms';

interface USSDMenuItem {
  id: string;
  label: string;
  action?: () => void;
  submenu?: USSDMenuItem[];
}

const KEYPAD_KEYS = [
  [{ value: '1', letters: '' }, { value: '2', letters: 'ABC' }, { value: '3', letters: 'DEF' }],
  [{ value: '4', letters: 'GHI' }, { value: '5', letters: 'JKL' }, { value: '6', letters: 'MNO' }],
  [{ value: '7', letters: 'PQRS' }, { value: '8', letters: 'TUV' }, { value: '9', letters: 'WXYZ' }],
  [{ value: '*', letters: '' }, { value: '0', letters: '+' }, { value: '#', letters: '' }],
];

export default function USSDScreen() {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const [currentScreen, setCurrentScreen] = useState<'menu' | 'matches' | 'profile' | 'safety' | 'events' | 'credits'>('menu');
  const [inputValue, setInputValue] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [ussdOutput, setUssdOutput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const pulseAnim = useState(new Animated.Value(1))[0];

  const menuItems: USSDMenuItem[] = [
    { id: '1', label: 'View Matches', action: () => navigateTo('matches') },
    { id: '2', label: 'My Profile', action: () => navigateTo('profile') },
    { id: '3', label: 'Safety Check-In', action: () => navigateTo('safety') },
    { id: '4', label: 'Events Near Me', action: () => navigateTo('events') },
    { id: '5', label: 'My Credits', action: () => navigateTo('credits') },
    { id: '6', label: 'Settings', action: () => router.push('/(tabs)/profile') },
    { id: '0', label: 'Exit', action: () => router.back() },
  ];

  const subMenus: Record<string, USSDMenuItem[]> = {
    matches: [
      { id: '1', label: 'View Next Match' },
      { id: '2', label: 'Like Current Match' },
      { id: '3', label: 'Pass Current Match' },
      { id: '4', label: 'Send Message' },
      { id: '0', label: 'Back to Menu', action: () => navigateTo('menu') },
    ],
    profile: [
      { id: '1', label: 'View Profile' },
      { id: '2', label: 'Update Bio' },
      { id: '3', label: 'Update Interests' },
      { id: '4', label: 'Verify Phone' },
      { id: '0', label: 'Back to Menu', action: () => navigateTo('menu') },
    ],
    safety: [
      { id: '1', label: 'Start Check-In' },
      { id: '2', label: 'Share Location' },
      { id: '3', label: 'Emergency SOS' },
      { id: '4', label: 'Add Emergency Contact' },
      { id: '0', label: 'Back to Menu', action: () => navigateTo('menu') },
    ],
    events: [
      { id: '1', label: 'Social Events' },
      { id: '2', label: 'Professional Events' },
      { id: '3', label: 'Cultural Events' },
      { id: '4', label: 'Religious Events' },
      { id: '0', label: 'Back to Menu', action: () => navigateTo('menu') },
    ],
    credits: [
      { id: '1', label: 'View Balance' },
      { id: '2', label: 'Buy Credits (M-Pesa)' },
      { id: '3', label: 'Buy Credits (Airtime)' },
      { id: '4', label: 'Boost Profile' },
      { id: '0', label: 'Back to Menu', action: () => navigateTo('menu') },
    ],
  };

  const getItems = () => subMenus[currentScreen] || menuItems;

  const navigateTo = (screen: typeof currentScreen) => {
    setHistory([...history, currentScreen]);
    setCurrentScreen(screen);
    setInputValue('');
    setUssdOutput('');
  };

  const goBack = () => {
    const newHistory = [...history];
    const prev = (newHistory.pop() || 'menu') as typeof currentScreen;
    setHistory(newHistory);
    setCurrentScreen(prev);
    setInputValue('');
    setUssdOutput('');
  };

  const handleKeyPress = useCallback((key: string) => {
    if (inputValue.length < 6) {
      setInputValue((prev) => prev + key);
    }
  }, [inputValue]);

  const handleDelete = useCallback(() => {
    setInputValue((prev) => prev.slice(0, -1));
  }, []);

  const handleSend = useCallback(async () => {
    if (!inputValue) return;

    const items = getItems();
    const selected = items.find((item) => item.id === inputValue);
    if (selected?.action) {
      setIsSending(true);
      setTimeout(() => {
        selected.action!();
        setIsSending(false);
      }, 500);
      return;
    }

    if (user?.phone) {
      setIsSending(true);
      try {
        const response = await handleUSSDRequest(user.phone, Date.now().toString(), inputValue);
        setUssdOutput(response);
      } catch {
        setUssdOutput('Network error. Please try again.');
      }
      setIsSending(false);
    }
    setInputValue('');
  }, [inputValue, getItems, user]);

  Animated.loop(
    Animated.sequence([
      Animated.timing(pulseAnim, { toValue: 0.7, duration: 1000, useNativeDriver: true }),
      Animated.timing(pulseAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
    ]),
    { iterations: -1 }
  ).start();

  return (
    <View style={styles.container}>
      <View style={styles.statusBar}>
        <View style={styles.statusLeft}>
          <Ionicons name="cellular" size={14} color="rgba(255,255,255,0.7)" />
          <Text style={styles.statusBarText}>Isizuo USSD</Text>
        </View>
        <Text style={styles.statusBarText}>GPRS</Text>
      </View>

      <View style={styles.phoneFrame}>
        <View style={styles.phoneSpeaker} />

        <LinearGradient colors={['#0f0f23', '#1a1a3e']} style={styles.ussdDisplay}>
          <View style={styles.screenHeader}>
            <TouchableOpacity onPress={goBack} style={styles.backButton} disabled={history.length === 0}>
              <Ionicons name="chevron-back" size={20} color={history.length > 0 ? '#00d4ff' : 'rgba(255,255,255,0.2)'} />
              <Text style={[styles.backButtonText, history.length === 0 && { opacity: 0.2 }]}>Back</Text>
            </TouchableOpacity>
            <Text style={styles.screenTitle}>
              {currentScreen === 'menu' ? t('app_name') : currentScreen.toUpperCase()}
            </Text>
            <View style={{ width: 60 }} />
          </View>

          <View style={styles.screenContent}>
            <Animated.View style={[styles.signalDot, { opacity: pulseAnim }]} />

            <Text style={styles.ussdHeader}>
              {currentScreen === 'menu'
                ? `Welcome to ${t('app_name')}\nSelect an option:`
                : `${currentScreen.toUpperCase()} Menu\nSelect an option:`}
            </Text>

            <ScrollView style={styles.menuScroll} showsVerticalScrollIndicator={false}>
              {getItems().map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.ussdOption}
                  onPress={() => item.action?.()}
                  activeOpacity={0.7}
                >
                  <Text style={styles.ussdOptionId}>{item.id}.</Text>
                  <Text style={styles.ussdOptionText}>{item.label}</Text>
                </TouchableOpacity>
              ))}

              {currentScreen === 'credits' && (
                <View style={styles.balanceBox}>
                  <Text style={styles.balanceLabel}>Your Balance:</Text>
                  <Text style={styles.balanceValue}>10 Credits</Text>
                </View>
              )}

              {ussdOutput ? (
                <View style={styles.ussdResponse}>
                  <Text style={styles.ussdResponseText}>{ussdOutput}</Text>
                </View>
              ) : null}
            </ScrollView>

            <View style={styles.inputDisplay}>
              <Text style={styles.inputDisplayText}>
                {inputValue || (isSending ? 'Sending...' : 'Enter number...')}
              </Text>
              {inputValue.length > 0 && (
                <TouchableOpacity onPress={handleDelete}>
                  <Ionicons name="backspace" size={20} color="rgba(255,255,255,0.5)" />
                </TouchableOpacity>
              )}
            </View>
          </View>
        </LinearGradient>

        {/* KEYPAD */}
        <View style={styles.keypadContainer}>
          {KEYPAD_KEYS.map((row, rowIdx) => (
            <View key={rowIdx} style={styles.keypadRow}>
              {row.map((key) => (
                <TouchableOpacity
                  key={key.value}
                  style={styles.keypadKey}
                  onPress={() => handleKeyPress(key.value)}
                  activeOpacity={0.6}
                >
                  <Text style={styles.keypadKeyText}>{key.value}</Text>
                  {key.letters ? (
                    <Text style={styles.keypadKeyLetters}>{key.letters}</Text>
                  ) : null}
                </TouchableOpacity>
              ))}
            </View>
          ))}
          <View style={styles.keypadRow}>
            <TouchableOpacity style={styles.keypadKey} onPress={handleDelete} activeOpacity={0.6}>
              <Ionicons name="backspace" size={22} color="#FFFFFF" />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.keypadKey, styles.keypadKeySend]}
              onPress={handleSend}
              activeOpacity={0.6}
              disabled={isSending}
            >
              <Ionicons name="call" size={22} color="#FFFFFF" />
              <Text style={styles.keypadKeySendText}>Send</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.keypadKey} onPress={() => { setInputValue(''); setUssdOutput(''); }} activeOpacity={0.6}>
              <Ionicons name="close" size={22} color="#FF6B6B" />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <View style={styles.footer}>
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
    paddingBottom: SPACING.xs,
  },
  statusLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusBarText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 11,
    fontFamily: 'monospace',
  },
  phoneFrame: {
    flex: 1,
    marginHorizontal: SPACING.lg,
    borderRadius: BORDER_RADIUS.xl,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#333',
    backgroundColor: '#0f0f23',
  },
  phoneSpeaker: {
    width: 60,
    height: 4,
    backgroundColor: '#333',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 8,
    marginBottom: 4,
  },
  ussdDisplay: {
    flex: 1,
    padding: SPACING.sm,
  },
  screenHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,212,255,0.2)',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 60,
  },
  backButtonText: {
    color: '#00d4ff',
    fontSize: 13,
    fontFamily: 'monospace',
  },
  screenTitle: {
    color: '#00d4ff',
    fontSize: FONT_SIZES.sm,
    fontWeight: '700',
    fontFamily: 'monospace',
    textAlign: 'center',
    letterSpacing: 1,
  },
  screenContent: {
    flex: 1,
    paddingVertical: SPACING.sm,
  },
  signalDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#00ff88',
    alignSelf: 'flex-end',
    marginBottom: 4,
  },
  ussdHeader: {
    color: '#00ff88',
    fontSize: 12,
    fontFamily: 'monospace',
    marginBottom: SPACING.sm,
    lineHeight: 18,
  },
  menuScroll: {
    flex: 1,
  },
  ussdOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  ussdOptionId: {
    color: '#00d4ff',
    fontSize: 13,
    fontFamily: 'monospace',
    width: 24,
  },
  ussdOptionText: {
    color: '#ffffff',
    fontSize: 13,
    fontFamily: 'monospace',
  },
  balanceBox: {
    marginTop: SPACING.md,
    padding: SPACING.md,
    backgroundColor: 'rgba(0,255,136,0.08)',
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: 'rgba(0,255,136,0.3)',
  },
  balanceLabel: {
    color: '#00ff88',
    fontSize: 11,
    fontFamily: 'monospace',
  },
  balanceValue: {
    color: '#ffffff',
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
    fontFamily: 'monospace',
    marginTop: SPACING.xs,
  },
  ussdResponse: {
    marginTop: SPACING.md,
    padding: SPACING.md,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: BORDER_RADIUS.md,
  },
  ussdResponseText: {
    color: '#ffcc00',
    fontSize: 12,
    fontFamily: 'monospace',
    lineHeight: 18,
  },
  inputDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.sm,
    marginTop: 4,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: BORDER_RADIUS.sm,
    borderWidth: 1,
    borderColor: 'rgba(0,212,255,0.3)',
  },
  inputDisplayText: {
    color: '#ffffff',
    fontSize: 16,
    fontFamily: 'monospace',
    letterSpacing: 2,
  },
  keypadContainer: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    backgroundColor: '#12122a',
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  keypadRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 6,
  },
  keypadKey: {
    flex: 1,
    height: 48,
    borderRadius: 10,
    backgroundColor: '#1e1e3e',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  keypadKeyText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '600',
    fontFamily: 'monospace',
  },
  keypadKeyLetters: {
    color: 'rgba(255,255,255,0.35)',
    fontSize: 8,
    fontFamily: 'monospace',
    marginTop: -2,
  },
  keypadKeySend: {
    backgroundColor: '#00b894',
    borderColor: '#00b894',
    flexDirection: 'row',
    gap: 6,
  },
  keypadKeySendText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
    fontFamily: 'monospace',
  },
  footer: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    paddingBottom: SPACING.xxl,
  },
  footerText: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 11,
    fontFamily: 'monospace',
    textAlign: 'center',
  },
});
