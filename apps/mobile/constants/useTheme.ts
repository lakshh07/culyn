import { useThemeOptional } from '@/contexts/ThemeContext'
import { Colors } from './colors'

export function useThemeColors() {
  const theme = useThemeOptional()
  const effectiveTheme = theme?.effectiveTheme ?? 'light'
  return Colors[effectiveTheme]
}
