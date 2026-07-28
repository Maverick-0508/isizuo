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
import { User } from '@/types';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { fetchUserProfile } from '@/stores';

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
    box-shadow: 0 0 0 4px ${COLORS.primaryGlow};
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
  const { isAuthenticated, isLoading, user } = useAuthStore();
  const segments = useSegments() as string[];
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
      const inOnboarding = segments[1] === 'onboarding';
      const hasCompletedOnboarding = user && user.name && user.name.length > 0;

      if (hasCompletedOnboarding && !inOnboarding && (!hasNavigated.current || inAuthGroup)) {
        hasNavigated.current = true;
        router.replace('/(tabs)');
      }
    }
  }, [isAuthenticated, isLoading, segments, router, user]);

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

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        let profile = await fetchUserProfile(session.user.id);
        if (!profile) {
          const { error: insertError } = await supabase
            .from('profiles')
            .insert({
              id: session.user.id,
              email: session.user.email || '',
              name: session.user.user_metadata?.full_name || '',
            });
          if (!insertError) {
            profile = await fetchUserProfile(session.user.id);
          }
        }
        setUser(profile);
      } else {
        setUser(null);
      }
    }).catch(() => {}).finally(() => {
      setReady(true);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      if (session?.user) {
        let profile = await fetchUserProfile(session.user.id);
        if (!profile) {
          const { error: insertError } = await supabase
            .from('profiles')
            .insert({
              id: session.user.id,
              email: session.user.email || '',
              name: session.user.user_metadata?.full_name || '',
            });
          if (!insertError) {
            profile = await fetchUserProfile(session.user.id);
          }
        }
        setUser(profile);
      } else {
        setUser(null);
      }
    });

    return () => {
      subscription.unsubscribe();
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
    <ErrorBoundary>
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
    </ErrorBoundary>
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
