import React, { useEffect, useState } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';
import { useFonts } from 'expo-font';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  Inter_800ExtraBold,
  Inter_900Black,
} from '@expo-google-fonts/inter';
import { useAuthStore } from '@/stores';
import { COLORS } from '@/constants';
import { supabase } from '@/lib/supabase';

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!isAuthenticated && !inAuthGroup) {
      router.replace('/(auth)');
    } else if (isAuthenticated && inAuthGroup) {
      router.replace('/(tabs)');
    }
  }, [isAuthenticated, isLoading, segments]);

  return <>{children}</>;
}

export default function RootLayout() {
  const { setUser, setSession } = useAuthStore();
  const [ready, setReady] = useState(false);

  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    Inter_800ExtraBold,
    Inter_900Black,
  });

  useEffect(() => {
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
          animation: 'fade',
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
    width: 72,
    height: 72,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingLogoI: {
    fontSize: 36,
    fontFamily: 'Inter_900Black',
    color: COLORS.textInverse,
    marginTop: -2,
  },
  loadingText: {
    fontFamily: 'Inter_800ExtraBold',
    color: COLORS.text,
    marginTop: 16,
    fontSize: 24,
    letterSpacing: -0.5,
  },
  loadingSpinner: {
    marginTop: 20,
  },
});
