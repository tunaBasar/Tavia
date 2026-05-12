import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments, useRootNavigationState } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import 'react-native-reanimated';

import { useCustomerAuthStore } from '@/store/useCustomerAuthStore';
import { useThemeStore } from '@/store/useThemeStore';
import { Colors } from '@/constants/theme';

/** Custom dark theme to match Tavia brand (Earthy Cafe Palette) */
const TaviaDark = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: Colors.dark.background,
    card: Colors.dark.background,
    primary: Colors.dark.tint,
  },
};

const TaviaLight = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: Colors.light.background,
    card: Colors.light.background,
    primary: Colors.light.tint,
  },
};

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const { customer, isHydrated } = useCustomerAuthStore();
  const { theme } = useThemeStore();
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
    <ThemeProvider value={theme === 'dark' ? TaviaDark : TaviaLight}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="auth" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
      </Stack>
      <StatusBar style={theme === 'dark' ? "light" : "dark"} />

      {/* Zustand hazır olana kadar ekranı kapatan yükleme katmanı */}
      {!isHydrated && (
        <View style={[StyleSheet.absoluteFill, styles.splash]}>
          <ActivityIndicator size="large" color={theme === 'dark' ? "#6B9E78" : "#2E5F3E"} />
        </View>
      )}
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  splash: {
    backgroundColor: '#1C2520',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
});