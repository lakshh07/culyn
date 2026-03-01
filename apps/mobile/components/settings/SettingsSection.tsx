import { useThemeColors } from '@/constants/useTheme'
import React, { ReactNode } from 'react'
import { StyleSheet, Text, View } from 'react-native'

interface SettingsSectionProps {
  title?: string
  children: ReactNode
  style?: any
}

export function SettingsSection({ title, children, style }: SettingsSectionProps) {
  const colors = useThemeColors()

  return (
    <View style={[styles.container, style]}>
      {title && (
        <Text
          style={[
            styles.title,
            {
              color: colors.textSecondary,
              fontFamily: 'Poppins_500Medium',
            },
          ]}>
          {title}
        </Text>
      )}
      <View
        style={[
          styles.content,
          {
            backgroundColor: colors.background,
            borderRadius: 12,
            overflow: 'hidden',
          },
        ]}>
        {children}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  title: {
    fontSize: 13,
    lineHeight: 18,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
    marginLeft: 20,
  },
  content: {
    overflow: 'hidden',
  },
})
