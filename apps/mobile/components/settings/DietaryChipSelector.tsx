import { useThemeColors } from '@/constants/useTheme'
import React from 'react'
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'

interface DietaryChipSelectorProps {
  options: { value: string; label: string }[]
  selectedValues: string[]
  onChange: (values: string[]) => void
  multiSelect?: boolean
}

export function DietaryChipSelector({
  options,
  selectedValues,
  onChange,
  multiSelect = true,
}: DietaryChipSelectorProps) {
  const colors = useThemeColors()

  const handleToggle = (value: string) => {
    if (multiSelect) {
      if (selectedValues.includes(value)) {
        onChange(selectedValues.filter(v => v !== value))
      } else {
        onChange([...selectedValues, value])
      }
    } else {
      onChange([value])
    }
  }

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal={false}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        <View style={styles.chipsContainer}>
          {options.map(option => {
            const isSelected = selectedValues.includes(option.value)
            return (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.chip,
                  {
                    backgroundColor: isSelected ? colors.primary : colors.backgroundSecondary,
                    borderColor: isSelected ? colors.primary : colors.border,
                  },
                ]}
                onPress={() => handleToggle(option.value)}
                activeOpacity={0.7}>
                <Text
                  style={[
                    styles.chipLabel,
                    {
                      color: isSelected ? colors.white : colors.textPrimary,
                      fontFamily: isSelected ? 'Poppins_500Medium' : 'Poppins_400Regular',
                    },
                  ]}>
                  {option.label}
                </Text>
              </TouchableOpacity>
            )
          })}
        </View>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    maxHeight: 300,
  },
  scrollContent: {
    paddingVertical: 4,
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1.5,
  },
  chipLabel: {
    fontSize: 14,
    lineHeight: 20,
  },
})
