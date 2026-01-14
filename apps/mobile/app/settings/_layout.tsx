import { useThemeColors } from '@/constants/useTheme';
import { Stack } from 'expo-router';

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
        headerBackTitle: 'Back',
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen
        name='index'
        options={{
          title: 'Settings',
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
