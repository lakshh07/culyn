import { useThemeColors } from '@/constants/useTheme'
import * as Haptics from 'expo-haptics'
import React from 'react'
import { Pressable, StyleSheet, Text } from 'react-native'

interface FilterChipProps {
  label: string
  isSelected: boolean
  onPress: () => void
}

export function FilterChip({ label, isSelected, onPress }: FilterChipProps) {
  const colors = useThemeColors()

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    onPress()
  }

  return (
    <Pressable
      onPress={handlePress}
      style={[
        styles.chip,
        {
          backgroundColor: isSelected ? colors.chipBackgroundActive : colors.chipBackground,
          borderColor: isSelected ? colors.chipBackgroundActive : colors.border,
        },
      ]}>
      <Text
        style={[
          styles.chipText,
          {
            color: isSelected ? colors.chipTextActive : colors.chipText,
          },
        ]}>
        {label}
      </Text>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
    marginBottom: 8,
  },
  chipText: {
    fontSize: 13,
    fontFamily: 'Syne_500Medium',
  },
})
