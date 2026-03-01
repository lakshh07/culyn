import { useThemeColors } from '@/constants/useTheme'
import { HeaderBackButton } from '@react-navigation/elements'
import { Stack, useRouter } from 'expo-router'
import React from 'react'

function ShoppingListHeaderLeft(props: any) {
  const colors = useThemeColors()
  const router = useRouter()

  // Use Expo Router's back navigation
  const handlePress = () => {
    router.back()
  }

  return (
    <HeaderBackButton
      {...props}
      onPress={handlePress}
      tintColor={colors.textPrimary}
      labelStyle={{ display: 'none' }}
    />
  )
}

export default function ShoppingListLayout() {
  const colors = useThemeColors()

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
        headerBlurEffect: 'light',
        headerBackButtonDisplayMode: 'generic',
        headerShadowVisible: true,
      }}>
      <Stack.Screen
        name="index"
        options={{
          title: 'Shopping List',
          headerLeft: ShoppingListHeaderLeft,
        }}
      />
    </Stack>
  )
}
