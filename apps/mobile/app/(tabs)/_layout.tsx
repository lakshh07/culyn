import CustomTabBar from '@/components/navigation/CustomTabBar';
import { Tabs } from 'expo-router';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{ headerShown: false }}
      tabBar={(props) => <CustomTabBar {...props} />}
    >
      <Tabs.Screen name='discover' />
      <Tabs.Screen name='recipes' />
      <Tabs.Screen name='ai' />
      <Tabs.Screen name='meals' />
      <Tabs.Screen name='create' />
    </Tabs>
  );
}
