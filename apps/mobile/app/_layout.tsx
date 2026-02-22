import { ThemeProvider } from '@/contexts/ThemeContext';
import { useShareImport } from '@/hooks/useShareImport';
import { setupNotificationResponseHandler } from '@/lib/notifications';
import { queryClient } from '@/lib/query-client';
import {
  EBGaramond_400Regular,
  EBGaramond_400Regular_Italic,
  EBGaramond_500Medium,
  EBGaramond_600SemiBold,
  EBGaramond_700Bold,
} from '@expo-google-fonts/eb-garamond';
import { LeckerliOne_400Regular } from '@expo-google-fonts/leckerli-one';
import {
  Poppins_400Regular,
  Poppins_500Medium,
} from '@expo-google-fonts/poppins';
import {
  Syne_400Regular,
  Syne_500Medium,
  Syne_600SemiBold,
} from '@expo-google-fonts/syne';
import { QueryClientProvider } from '@tanstack/react-query';
import { useFonts } from 'expo-font';
import * as Linking from 'expo-linking';
import { useURL } from 'expo-linking';

import { Stack, useRouter } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { StatusBar, StyleSheet, View } from 'react-native';

// Inner component that has access to ThemeProvider
function AppContent() {
  const router = useRouter();
  const incomingUrl = useURL();
  const { triggerImport } = useShareImport();

  // Handle deep links from share extension (culynapp://share?url=...)
  useEffect(() => {
    if (incomingUrl) {
      const parsed = Linking.parse(incomingUrl);
      if (parsed.path === 'share' && parsed.queryParams?.url) {
        triggerImport(parsed.queryParams.url as string);
      }
    }
  }, [incomingUrl, triggerImport]);

  // Handle notification taps → navigate to detail page
  useEffect(() => {
    const subscription = setupNotificationResponseHandler(router);
    return () => subscription.remove();
  }, [router]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle='light-content' backgroundColor='transparent' />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name='(auth)' />
        <Stack.Screen name='(tabs)' />
        <Stack.Screen name='settings' />
        <Stack.Screen name='recipes/[slug]' />
        <Stack.Screen name='places/[slug]' />
        <Stack.Screen name='places/map' />
        <Stack.Screen name='products/[slug]' />
        <Stack.Screen name='chat-detail/[id]' />
      </Stack>
    </View>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    EBGaramond_400Regular,
    EBGaramond_400Regular_Italic,
    EBGaramond_500Medium,
    EBGaramond_600SemiBold,
    EBGaramond_700Bold,
    LeckerliOne_400Regular,
    Poppins_400Regular,
    Poppins_500Medium,
    Syne_400Regular,
    Syne_500Medium,
    Syne_600SemiBold,
  });

  useEffect(() => {
    // Ensure we only call this once when the layout mounts
    SplashScreen.preventAutoHideAsync();
  }, []);

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.setOptions({ fade: true, duration: 400 });
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </QueryClientProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
