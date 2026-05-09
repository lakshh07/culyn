import { PendingImportProvider } from '@/contexts/PendingImportContext'
import { ShareImportProvider } from '@/contexts/ShareImportContext'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { useShareImport } from '@/hooks/useShareImport'
import { authClient } from '@/lib/auth-client'
import { setupNotificationResponseHandler } from '@/lib/notifications'
import { queryClient } from '@/lib/query-client'
import { SHARED_KEY_COOKIE, SHARED_KEY_JOB_ID, SHARED_KEYCHAIN_GROUP } from '@/lib/shared-keychain'
import {
  EBGaramond_400Regular,
  EBGaramond_400Regular_Italic,
  EBGaramond_500Medium,
  EBGaramond_600SemiBold,
  EBGaramond_700Bold,
} from '@expo-google-fonts/eb-garamond'
import { LeckerliOne_400Regular } from '@expo-google-fonts/leckerli-one'
import { Poppins_400Regular, Poppins_500Medium } from '@expo-google-fonts/poppins'
import { Syne_400Regular, Syne_500Medium, Syne_600SemiBold } from '@expo-google-fonts/syne'
import { QueryClientProvider } from '@tanstack/react-query'
import { useFonts } from 'expo-font'
import { Stack, useRouter } from 'expo-router'
import * as SecureStore from 'expo-secure-store'
import * as SplashScreen from 'expo-splash-screen'
import { useCallback, useEffect } from 'react'
import { AppState, StatusBar, StyleSheet, View } from 'react-native'

function AppContent() {
  const router = useRouter()
  const { triggerImport, resumeImport } = useShareImport()
  const session = authClient.useSession()

  // Keep the shared keychain cookie in sync with the current session
  useEffect(() => {
    const cookie = authClient.getCookie()
    if (cookie) {
      SecureStore.setItemAsync(SHARED_KEY_COOKIE, cookie, {
        accessGroup: SHARED_KEYCHAIN_GROUP,
      }).then(() => console.log('[SharedKeychain] Session cookie written for share extension'))
    } else {
      SecureStore.deleteItemAsync(SHARED_KEY_COOKIE, {
        accessGroup: SHARED_KEYCHAIN_GROUP,
      }).then(() => console.log('[SharedKeychain] Session cookie cleared'))
    }
  }, [session.data])

  // Resume any import that the share extension started while the app was closed
  const handleForeground = useCallback(async () => {
    const jobId = await SecureStore.getItemAsync(SHARED_KEY_JOB_ID, {
      accessGroup: SHARED_KEYCHAIN_GROUP,
    })
    if (jobId) {
      await SecureStore.deleteItemAsync(SHARED_KEY_JOB_ID, {
        accessGroup: SHARED_KEYCHAIN_GROUP,
      })
      resumeImport(jobId)
    }
  }, [resumeImport])

  useEffect(() => {
    // Check immediately on mount (app may have been launched after a share)
    handleForeground()

    const sub = AppState.addEventListener('change', state => {
      if (state === 'active') handleForeground()
    })
    return () => sub.remove()
  }, [handleForeground])

  useEffect(() => {
    const subscription = setupNotificationResponseHandler(router)
    return () => subscription.remove()
  }, [router])

  return (
    <ShareImportProvider triggerImport={triggerImport} resumeImport={resumeImport}>
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="transparent" />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="settings" />
          <Stack.Screen name="recipes/[slug]" />
          <Stack.Screen name="places/[slug]" />
          <Stack.Screen name="places/map" />
          <Stack.Screen name="products/[slug]" />
        </Stack>
      </View>
    </ShareImportProvider>
  )
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
  })

  useEffect(() => {
    SplashScreen.preventAutoHideAsync()
  }, [])

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.setOptions({ fade: true, duration: 400 })
      SplashScreen.hideAsync()
    }
  }, [fontsLoaded, fontError])

  if (!fontsLoaded && !fontError) {
    return null
  }

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <PendingImportProvider>
          <AppContent />
        </PendingImportProvider>
      </ThemeProvider>
    </QueryClientProvider>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
})
