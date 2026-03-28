import { Avatar } from '@/components/ui/Avatar'
import { useThemeColors } from '@/constants/useTheme'
import { authClient } from '@/lib/auth-client'
import { LinearGradient } from 'expo-linear-gradient'
import { useRouter } from 'expo-router'
import React from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

export default function TabsHeader() {
  const insets = useSafeAreaInsets()
  const colors = useThemeColors()
  const router = useRouter()
  const { data: session } = authClient.useSession()
  const topOffset = Math.max(insets.top, 18)

  return (
    <View style={[styles.topBar, { paddingTop: topOffset }]}>
      <View style={styles.logoMark}>
        <Text style={[styles.logoText, { color: colors.textPrimary }]}>Culyn</Text>
      </View>
      <View style={styles.topBarActions}>
        <LinearGradient
          colors={[colors.primaryGradientStart, colors.primaryGradientEnd]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.proButton}>
          <Text style={[styles.proButtonText, { color: colors.white }]}>Try Pro</Text>
        </LinearGradient>
        <Avatar
          imageUrl={session?.user?.image}
          name={session?.user?.name}
          email={session?.user?.email}
          size="small"
          onPress={() => router.push('/(tabs)/profile')}
        />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  topBar: {
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  topBarActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logoText: {
    fontSize: 24,
    fontFamily: 'LeckerliOne_400Regular',
  },
  logoMark: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 6,
  },
  proButton: {
    paddingVertical: 10,
    paddingHorizontal: 22,
    borderRadius: 16,
    shadowColor: '#6A89A7', // colors.primary (light theme)
    shadowOpacity: 0.4,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
  },
  proButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'EBGaramond_600SemiBold',
  },
})
