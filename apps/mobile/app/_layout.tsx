import { useColorScheme, useThemeColors } from '@/constants/useTheme';
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
import { useFonts } from 'expo-font';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { Platform, StatusBar, StyleSheet, View } from 'react-native';

const GRADIENT_HEIGHT = 100;

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

  const colors = useThemeColors();
  const scheme = useColorScheme();

  useEffect(() => {
    // Ensure we only call this once when the layout mounts
    SplashScreen.preventAutoHideAsync();
  }, []);

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle='dark-content' backgroundColor='transparent' />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name='(tabs)' />
        {/* <Stack.Screen name='(auth)' /> */}
      </Stack>
      <LinearGradient
        colors={[
          scheme === 'dark' ? 'rgba(17,24,39,0)' : 'rgba(255,255,255,0)',
          colors.background,
        ]}
        start={{ x: 0, y: 1 }}
        end={{ x: 0, y: 0 }}
        pointerEvents='none'
        style={styles.gradientOverlay}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradientOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: GRADIENT_HEIGHT,
    zIndex: 9999,
    ...(Platform.OS === 'android' && { elevation: 9999 }),
  },
});
