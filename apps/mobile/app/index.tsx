// import { useAuthStore } from '@/store/auth.store';
import { Redirect } from 'expo-router';

export default function Index() {
  // const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
  // Avoid redirecting to the same route (`/`) which causes an infinite loop.
  // For now, send both logged-in and logged-out users to the main `discover` tab.
  return <Redirect href='/discover' />;
}
