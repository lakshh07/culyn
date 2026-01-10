import { useColorScheme as useRNColorScheme } from 'react-native';
import { Colors } from './colors';

export function useColorScheme() {
  const scheme = useRNColorScheme();
  return scheme === 'dark' ? 'dark' : 'light';
}

export function useThemeColors() {
  const colorScheme = useColorScheme();
  return Colors[colorScheme];
}
