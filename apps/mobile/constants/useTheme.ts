import { useTheme } from '@/contexts/ThemeContext'
import { useColorScheme as useRNColorScheme } from 'react-native'
import { Colors } from './colors'

export function useColorScheme() {
  const scheme = useRNColorScheme()
  return scheme === 'dark' ? 'dark' : 'light'
}

export function useThemeColors() {
  // Try to use the ThemeContext if available (after app initialization)
  try {
    const { effectiveTheme } = useTheme()
    return Colors[effectiveTheme]
  } catch {
    // Fallback to system theme if ThemeContext is not available yet
    const scheme = useRNColorScheme()
    const colorScheme = scheme === 'dark' ? 'dark' : 'light'
    return Colors[colorScheme]
  }
}
