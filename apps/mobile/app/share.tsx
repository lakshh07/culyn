import { useThemeColors } from '@/constants/useTheme'
import { useShareImport } from '@/hooks/useShareImport'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useEffect } from 'react'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'

export default function ShareScreen() {
  const { url } = useLocalSearchParams<{ url: string }>()
  const { triggerImport } = useShareImport()
  const router = useRouter()
  const colors = useThemeColors()

  useEffect(() => {
    if (url) {
      triggerImport(url)
    }
  }, [url, triggerImport])

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.iconContainer, { backgroundColor: colors.success }]}>
        <Text style={styles.icon}>✓</Text>
      </View>

      <Text style={[styles.headline, { color: colors.textPrimary }]}>Import Started!</Text>
      <Text style={[styles.subtext, { color: colors.textSecondary }]}>
        We&apos;ve got your link! It&apos;s being processed and will show up in your Library
        shortly.
      </Text>

      <TouchableOpacity
        style={[styles.button, { backgroundColor: colors.primary }]}
        onPress={() => router.replace('/(tabs)/library' as any)}
        activeOpacity={0.8}>
        <Text style={[styles.buttonText, { color: colors.white }]}>Go to Library</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.closeButton}
        onPress={() => router.replace('/(tabs)/library' as any)}
        activeOpacity={0.7}>
        <Text style={[styles.closeText, { color: colors.textMuted }]}>Close</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  closeButton: {
    marginTop: 16,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  closeText: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 14,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
  },
  icon: {
    fontSize: 36,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  headline: {
    fontFamily: 'Syne_600SemiBold',
    fontSize: 28,
    textAlign: 'center',
    marginBottom: 14,
  },
  subtext: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 48,
  },
  button: {
    paddingHorizontal: 40,
    paddingVertical: 14,
    borderRadius: 100,
  },
  buttonText: {
    fontFamily: 'Syne_600SemiBold',
    fontSize: 16,
  },
})
