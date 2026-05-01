import { DarkTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments, useRootNavigationState } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import 'react-native-reanimated';

import { useCustomerAuthStore } from '@/store/useCustomerAuthStore';

/** Custom dark theme to match Tavia brand */
const TaviaDark = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: '#0F0F1A',
    card: '#0F0F1A',
    primary: '#6C63FF',
  },
};

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const { customer, isHydrated } = useCustomerAuthStore();
  const segments = useSegments();
  const router = useRouter();
  const rootNavigationState = useRootNavigationState();

  useEffect(() => {
    // Navigasyon hazır değilse veya Zustand yüklenmediyse bekle
    if (!rootNavigationState?.key || !isHydrated) return;

    const inAuthGroup = segments[0] === 'auth';
    const isLoggedIn = customer !== null;

    // Yönlendirme için ufak bir bekleme (Expo'nun rahatlaması için)
    setTimeout(() => {
      if (!isLoggedIn && !inAuthGroup) {
        router.replace('/auth/login');
      } else if (isLoggedIn && inAuthGroup) {
        router.replace('/(tabs)');
      }
    }, 0);
  }, [customer, isHydrated, segments, rootNavigationState?.key]);

  // DİKKAT: Artık erken "return" yok! Stack her zaman render ediliyor.
  return (
    <ThemeProvider value={TaviaDark}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="auth" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
      </Stack>
      <StatusBar style="light" />

      {/* Zustand hazır olana kadar ekranı kapatan yükleme katmanı */}
      {!isHydrated && (
        <View style={[StyleSheet.absoluteFill, styles.splash]}>
          <ActivityIndicator size="large" color="#6C63FF" />
        </View>
      )}
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  splash: {
    backgroundColor: '#0F0F1A',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
});