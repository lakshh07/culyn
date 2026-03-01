import { useThemeColors } from '@/constants/useTheme'
import React from 'react'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'

type ThemeMode = 'light' | 'dark' | 'system'

interface ThemeSelectorProps {
  value: ThemeMode
  onChange: (mode: ThemeMode) => void
}

export function ThemeSelector({ value, onChange }: ThemeSelectorProps) {
  const colors = useThemeColors()

  const options: { value: ThemeMode; label: string; icon: string }[] = [
    { value: 'light', label: 'Light', icon: '☀️' },
    { value: 'dark', label: 'Dark', icon: '🌙' },
    { value: 'system', label: 'System', icon: '⚙️' },
  ]

  return (
    <View style={styles.container}>
      {options.map(option => (
        <TouchableOpacity
          key={option.value}
          style={[
            styles.option,
            {
              backgroundColor:
                value === option.value ? colors.primarySoft : colors.backgroundSecondary,
              borderColor: value === option.value ? colors.primary : colors.border,
            },
          ]}
          onPress={() => onChange(option.value)}
          activeOpacity={0.7}>
          <Text style={styles.icon}>{option.icon}</Text>
          <Text
            style={[
              styles.label,
              {
                color: value === option.value ? colors.primary : colors.textSecondary,
                fontFamily: value === option.value ? 'Poppins_500Medium' : 'Poppins_400Regular',
              },
            ]}>
            {option.label}
          </Text>
          {value === option.value && (
            <View style={[styles.checkmark, { backgroundColor: colors.primary }]}>
              <Text style={styles.checkmarkText}>✓</Text>
            </View>
          )}
        </TouchableOpacity>
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
  },
  icon: {
    fontSize: 24,
    marginRight: 12,
  },
  label: {
    flex: 1,
    fontSize: 16,
    lineHeight: 24,
  },
  checkmark: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmarkText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
})
