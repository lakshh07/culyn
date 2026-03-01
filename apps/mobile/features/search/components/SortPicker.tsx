import { useThemeColors } from '@/constants/useTheme'
import * as Haptics from 'expo-haptics'
import React from 'react'
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'

interface SortOption<T extends string> {
  key: T
  label: string
}

interface SortPickerProps<T extends string> {
  options: SortOption<T>[]
  value: T
  onChange: (value: T) => void
}

export function SortPicker<T extends string>({ options, value, onChange }: SortPickerProps<T>) {
  const colors = useThemeColors()

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: colors.textSecondary }]}>Sort by</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        {options.map(option => {
          const isSelected = value === option.key
          return (
            <Pressable
              key={option.key}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                onChange(option.key)
              }}
              style={[
                styles.pill,
                {
                  backgroundColor: isSelected ? colors.chipBackgroundActive : colors.chipBackground,
                  borderColor: isSelected ? colors.chipBackgroundActive : colors.border,
                },
              ]}>
              <Text
                style={[
                  styles.pillText,
                  {
                    color: isSelected ? colors.chipTextActive : colors.chipText,
                  },
                ]}>
                {option.label}
              </Text>
            </Pressable>
          )
        })}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    gap: 8,
  },
  label: {
    fontSize: 12,
    fontFamily: 'Syne_500Medium',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  scrollContent: {
    gap: 8,
  },
  pill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  pillText: {
    fontSize: 13,
    fontFamily: 'Syne_500Medium',
  },
})
