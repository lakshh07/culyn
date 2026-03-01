import { useThemeColors } from '@/constants/useTheme'
import { Feather } from '@expo/vector-icons'
import React from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'

interface ErrorStateProps {
  message?: string
  onRetry?: () => void
}

export function ErrorState({ message = 'Something went wrong.', onRetry }: ErrorStateProps) {
  const colors = useThemeColors()

  return (
    <View style={styles.container}>
      <Feather name="alert-circle" size={40} color={colors.error} />
      <Text style={[styles.message, { color: colors.textPrimary }]}>{message}</Text>
      {onRetry && (
        <Pressable onPress={onRetry} style={[styles.retryButton, { borderColor: colors.border }]}>
          <Feather name="refresh-cw" size={16} color={colors.primary} />
          <Text style={[styles.retryText, { color: colors.primary }]}>Try Again</Text>
        </Pressable>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    gap: 14,
  },
  message: {
    fontSize: 15,
    fontFamily: 'Syne_400Regular',
    textAlign: 'center',
    lineHeight: 22,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 4,
  },
  retryText: {
    fontSize: 14,
    fontFamily: 'Syne_500Medium',
  },
})
