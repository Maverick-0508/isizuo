import React, { useEffect, useState } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator, StyleSheet, Text, Platform } from 'react-native';
import { useFonts } from 'expo-font';
import {
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
  PlusJakartaSans_800ExtraBold,
} from '@expo-google-fonts/plus-jakarta-sans';
import { useAuthStore } from '@/stores';
import { COLORS } from '@/constants';
import { supabase } from '@/lib/supabase';

const FOCUS_CSS = `
  *:focus-visible {
    outline: 3px solid ${COLORS.primary};
    outline-offset: 3px;
    border-radius: 8px;
    transition: outline-offset 0.15s ease;
  }
  input:focus-visible {
    outline: none;
    border-color: ${COLORS.primary} !important;
    box-shadow: 0 0 0 4px rgba(179, 36, 100, 0.15);
  }
  [role="button"]:focus-visible,
  button:focus-visible {
    outline: 3px solid ${COLORS.primary};
    outline-offset: 3px;
  }
  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
    }
  }
`;

function injectGlobalStyles() {
  if (Platform.OS !== 'web') return;
  if (typeof document === 'undefined') return;
  if (document.getElementById('isizuo-global-styles')) return;
  const style = document.createElement('style');
  style.id = 'isizuo-global-styles';
  style.textContent = FOCUS_CSS;
  document.head.appendChild(style);
}

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();
  const hasNavigated = React.useRef(false);

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === '(auth)';
    const inTabsGroup = segments[0] === '(tabs)';

    if (!isAuthenticated && !inAuthGroup) {
      if (!hasNavigated.current || inTabsGroup) {
        hasNavigated.current = true;
        router.replace('/(auth)');
      }
    } else if (isAuthenticated && inAuthGroup) {
      if (!hasNavigated.current || inAuthGroup) {
        hasNavigated.current = true;
        router.replace('/(tabs)');
      }
    }
  }, [isAuthenticated, isLoading]);

  return <>{children}</>;
}

export default function RootLayout() {
  const { setUser, setSession } = useAuthStore();
  const [ready, setReady] = useState(false);

  const [fontsLoaded] = useFonts({
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
    PlusJakartaSans_800ExtraBold,
  });

  useEffect(() => {
    injectGlobalStyles();
    const timeout = setTimeout(() => setReady(true), 2000);

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user as any);
    }).catch(() => {}).finally(() => {
      clearTimeout(timeout);
      setReady(true);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user as any);
    });

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, []);

  if (!ready || !fontsLoaded) {
    return (
      <View style={styles.loading}>
        <View style={styles.loadingLogo}>
          <Text style={styles.loadingLogoI}>I</Text>
        </View>
        <Text style={styles.loadingText}>Isizuo</Text>
        <ActivityIndicator size="small" color={COLORS.primary} style={styles.loadingSpinner} />
      </View>
    );
  }

  return (
    <AuthGuard>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: COLORS.background },
        }}
      >
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="ussd" />
        <Stack.Screen name="profile" />
        <Stack.Screen name="safety" />
        <Stack.Screen name="events" />
        <Stack.Screen name="community" />
        <Stack.Screen name="chat" />
        <Stack.Screen name="family" />
      </Stack>
    </AuthGuard>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  loadingLogo: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingLogoI: {
    fontSize: 40,
    fontFamily: 'PlusJakartaSans_800ExtraBold',
    color: COLORS.textInverse,
    marginTop: -2,
  },
  loadingText: {
    fontFamily: 'PlusJakartaSans_800ExtraBold',
    color: COLORS.text,
    marginTop: 18,
    fontSize: 28,
    letterSpacing: -0.8,
  },
  loadingSpinner: {
    marginTop: 24,
  },
});
