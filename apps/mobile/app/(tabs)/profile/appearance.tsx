import { ThemeSelector } from '@/components/settings/ThemeSelector'
import { useThemeColors } from '@/constants/useTheme'
import { useTheme } from '@/contexts/ThemeContext'
import React from 'react'
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

export default function AppearanceScreen() {
  const colors = useThemeColors()
  const { themeMode, setThemeMode, effectiveTheme } = useTheme()

  const handleThemeChange = async (mode: 'light' | 'dark' | 'system') => {
    try {
      await setThemeMode(mode)
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to update theme preference'
      Alert.alert('Error', errorMessage)
    }
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.backgroundSecondary }]}
      edges={['bottom']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text
            style={[
              styles.sectionTitle,
              {
                color: colors.textPrimary,
                fontFamily: 'EBGaramond_600SemiBold',
              },
            ]}>
            Theme
          </Text>
          <Text
            style={[
              styles.sectionDescription,
              {
                color: colors.textSecondary,
                fontFamily: 'Poppins_400Regular',
              },
            ]}>
            Choose how Culyn looks on your device. System mode will match your device settings.
          </Text>
        </View>

        <View style={styles.themeSection}>
          <ThemeSelector value={themeMode} onChange={handleThemeChange} />
        </View>

        <View style={[styles.currentThemeInfo, { backgroundColor: colors.background }]}>
          <Text
            style={[
              styles.currentThemeLabel,
              {
                color: colors.textSecondary,
                fontFamily: 'Poppins_400Regular',
              },
            ]}>
            Currently using:
          </Text>
          <Text
            style={[
              styles.currentThemeValue,
              {
                color: colors.textPrimary,
                fontFamily: 'Poppins_500Medium',
              },
            ]}>
            {effectiveTheme === 'dark' ? 'Dark Mode' : 'Light Mode'}
          </Text>
        </View>

        <View style={styles.previewSection}>
          <Text
            style={[
              styles.sectionTitle,
              {
                color: colors.textPrimary,
                fontFamily: 'EBGaramond_600SemiBold',
              },
            ]}>
            Preview
          </Text>
          <View
            style={[
              styles.previewCard,
              {
                backgroundColor: colors.background,
                borderColor: colors.border,
              },
            ]}>
            <Text
              style={[
                styles.previewTitle,
                {
                  color: colors.textPrimary,
                  fontFamily: 'EBGaramond_600SemiBold',
                },
              ]}>
              Recipe Card
            </Text>
            <Text
              style={[
                styles.previewDescription,
                {
                  color: colors.textSecondary,
                  fontFamily: 'Poppins_400Regular',
                },
              ]}>
              This is how your recipe cards will look with the current theme.
            </Text>
            <View style={styles.previewChips}>
              <View style={[styles.previewChip, { backgroundColor: colors.primarySoft }]}>
                <Text
                  style={[
                    styles.previewChipText,
                    {
                      color: colors.primary,
                      fontFamily: 'Poppins_400Regular',
                    },
                  ]}>
                  Vegetarian
                </Text>
              </View>
              <View style={[styles.previewChip, { backgroundColor: colors.foodSoft }]}>
                <Text
                  style={[
                    styles.previewChipText,
                    {
                      color: colors.food,
                      fontFamily: 'Poppins_400Regular',
                    },
                  ]}>
                  Quick
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 24,
    paddingBottom: 32,
    paddingHorizontal: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 22,
    lineHeight: 28,
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  themeSection: {
    marginBottom: 24,
  },
  currentThemeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    marginBottom: 32,
  },
  currentThemeLabel: {
    fontSize: 14,
    lineHeight: 20,
  },
  currentThemeValue: {
    fontSize: 16,
    lineHeight: 24,
  },
  previewSection: {
    marginTop: 8,
  },
  previewCard: {
    marginTop: 16,
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
  },
  previewTitle: {
    fontSize: 20,
    lineHeight: 26,
    marginBottom: 8,
  },
  previewDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  previewChips: {
    flexDirection: 'row',
    gap: 8,
  },
  previewChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  previewChipText: {
    fontSize: 12,
    lineHeight: 18,
  },
})
