import { useThemeColors } from '@/constants/useTheme';
import { authClient } from '@/lib/auth-client';
import { Redirect } from 'expo-router';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

export default function Index() {
  const { data: session, isPending } = authClient.useSession();
  const colors = useThemeColors();

  if (isPending) {
    return (
      <View
        style={[
          styles.loadingContainer,
          { backgroundColor: colors.background },
        ]}
      >
        <ActivityIndicator size='large' color={colors.primary} />
      </View>
    );
  }

  return session ? (
    <Redirect href='/(tabs)/discover' />
  ) : (
    <Redirect href='/(auth)/onboarding' />
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
