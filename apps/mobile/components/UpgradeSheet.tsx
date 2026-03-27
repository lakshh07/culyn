import { useThemeColors } from '@/constants/useTheme'
import { Feather } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { useRouter } from 'expo-router'
import React from 'react'
import { Modal, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

interface UpgradeSheetProps {
  visible: boolean
  onClose: () => void
}

const BENEFITS = [
  'Unlimited library items (recipes, places & products)',
  'Unlimited AI credits',
  'Unlimited shopping lists',
]

export function UpgradeSheet({ visible, onClose }: UpgradeSheetProps) {
  const colors = useThemeColors()
  const router = useRouter()
  const insets = useSafeAreaInsets()

  const handleUpgrade = () => {
    onClose()
    router.push('/(tabs)/profile/billing')
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.wrapper}>
        <Pressable
          style={[styles.backdrop, { backgroundColor: colors.overlayBackdrop }]}
          onPress={onClose}
        />

        <View
          style={[
            styles.card,
            {
              backgroundColor: colors.background,
              paddingBottom: insets.bottom + 24,
            },
          ]}>
          {/* Drag handle */}
          <View style={styles.handleRow}>
            <View style={[styles.handle, { backgroundColor: colors.border }]} />
          </View>

          {/* PRO badge */}
          <View style={[styles.badge, { backgroundColor: colors.primarySoft }]}>
            <Text style={[styles.badgeText, { color: colors.primary }]}>PRO</Text>
          </View>

          {/* Title */}
          <Text style={[styles.title, { color: colors.textPrimary }]}>Upgrade to Pro</Text>

          {/* Subtitle */}
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Unlock everything. Save more, explore deeper.
          </Text>

          {/* Benefits */}
          <View style={styles.benefits}>
            {BENEFITS.map(benefit => (
              <View key={benefit} style={styles.benefitRow}>
                <Feather name="check" size={16} color={colors.primary} />
                <Text style={[styles.benefitText, { color: colors.textSecondary }]}>{benefit}</Text>
              </View>
            ))}
          </View>

          {/* Upgrade button */}
          <TouchableOpacity onPress={handleUpgrade} style={styles.upgradeBtn}>
            <LinearGradient
              colors={[colors.primaryGradientStart, colors.primaryGradientEnd]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.gradientBtn}>
              <Text style={[styles.upgradeBtnText, { color: colors.white }]}>
                Try Pro — ₹49/month
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* Maybe later */}
          <TouchableOpacity onPress={onClose} style={styles.laterBtn}>
            <Text style={[styles.laterText, { color: colors.textMuted }]}>Maybe later</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  card: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 16,
  },
  handleRow: {
    alignItems: 'center',
    marginBottom: 20,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
  },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    marginBottom: 12,
  },
  badgeText: {
    fontSize: 12,
    fontFamily: 'Poppins_500Medium',
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 26,
    fontFamily: 'EBGaramond_500Medium',
    lineHeight: 34,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: 'Syne_400Regular',
    lineHeight: 20,
    marginBottom: 24,
  },
  benefits: {
    gap: 12,
    marginBottom: 28,
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  benefitText: {
    fontSize: 14,
    fontFamily: 'Poppins_400Regular',
    lineHeight: 20,
    flex: 1,
  },
  upgradeBtn: {
    marginBottom: 12,
  },
  gradientBtn: {
    paddingVertical: 15,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#6A89A7', // colors.primary (light theme)
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  upgradeBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Poppins_500Medium',
  },
  laterBtn: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  laterText: {
    fontSize: 14,
    fontFamily: 'Poppins_400Regular',
  },
})
