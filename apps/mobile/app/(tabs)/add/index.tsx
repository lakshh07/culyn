import { View } from 'react-native'

// This screen is never navigated to — the Import tab press is intercepted
// in CustomTabBar to open the ImportSheet directly.
export default function AddScreen() {
  return <View />
}
