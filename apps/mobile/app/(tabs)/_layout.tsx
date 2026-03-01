import CustomTabBar from '@/components/navigation/CustomTabBar'
import { Tabs } from 'expo-router'

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false }} tabBar={props => <CustomTabBar {...props} />}>
      <Tabs.Screen name="discover" />
      <Tabs.Screen name="add" />
      <Tabs.Screen name="ai-chat" />
      <Tabs.Screen name="library" />
      <Tabs.Screen name="profile" />
    </Tabs>
  )
}
