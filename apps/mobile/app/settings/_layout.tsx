import { useThemeColors } from '@/constants/useTheme';
import { HeaderBackButton } from '@react-navigation/elements';
import { Stack, useRouter } from 'expo-router';
import React from 'react';

function SettingsIndexHeaderLeft(props: any) {
  const colors = useThemeColors();
  const router = useRouter();

  // Use Expo Router's back navigation
  const handlePress = () => {
    router.back();
  };

  return (
    <HeaderBackButton
      {...props}
      onPress={handlePress}
      tintColor={colors.textPrimary}
      labelStyle={{ display: 'none' }}
    />
  );
}

export default function SettingsLayout() {
  const colors = useThemeColors();

  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: colors.backgroundSecondary,
        },
        headerTintColor: colors.textPrimary,
        headerTitleStyle: {
          fontFamily: 'EBGaramond_600SemiBold',
          fontSize: 20,
        },
        headerBackButtonDisplayMode: 'generic',
        headerShadowVisible: true,
      }}
    >
      <Stack.Screen
        name='index'
        options={{
          title: 'Settings',
          headerLeft: SettingsIndexHeaderLeft,
        }}
      />
      <Stack.Screen
        name='basic-info'
        options={{
          title: 'Basic Information',
        }}
      />
      <Stack.Screen
        name='appearance'
        options={{
          title: 'Appearance',
        }}
      />
      <Stack.Screen
        name='dietary'
        options={{
          title: 'Dietary Preferences',
        }}
      />
      <Stack.Screen
        name='account'
        options={{
          title: 'Account',
        }}
      />
      <Stack.Screen
        name='billing'
        options={{
          title: 'Billing & Subscription',
        }}
      />
      <Stack.Screen
        name='security'
        options={{
          title: 'Security',
        }}
      />
    </Stack>
  );
}
