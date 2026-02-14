import { SettingsRow } from '@/components/settings/SettingsRow';
import { SettingsSection } from '@/components/settings/SettingsSection';
import { useThemeColors } from '@/constants/useTheme';
import { apiClient } from '@/lib/api';
import { authClient } from '@/lib/auth-client';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import React from 'react';
import {
  ActivityIndicator,
  Alert,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface Session {
  id: string;
  userAgent?: string;
  ipAddress?: string;
  createdAt: string;
  expiresAt: string;
}

export default function SecurityScreen() {
  const colors = useThemeColors();
  const router = useRouter();

  const {
    data: sessions,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['sessions'],
    queryFn: async () => {
      const response = await apiClient().get<Session[]>('/user/sessions');
      return response.data;
    },
  });

  const handleSignOutAllDevices = () => {
    Alert.alert(
      'Sign Out All Devices',
      'Are you sure you want to sign out from all devices? You will need to sign in again on this device.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Sign Out All',
          style: 'destructive',
          onPress: async () => {
            try {
              await apiClient().delete('/user/sessions');
              await authClient.signOut();
              router.replace('/(auth)/onboarding');
            } catch (error: any) {
              Alert.alert(
                'Error',
                error.response?.data?.message ||
                  'Failed to sign out from all devices'
              );
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  const handleRevokeSession = (sessionId: string) => {
    Alert.alert(
      'Revoke Session',
      'Are you sure you want to sign out from this device?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Revoke',
          style: 'destructive',
          onPress: async () => {
            try {
              await apiClient().delete(`/user/sessions/${sessionId}`);
              refetch();
              Alert.alert('Success', 'Session revoked successfully');
            } catch (error: any) {
              Alert.alert(
                'Error',
                error.response?.data?.message || 'Failed to revoke session'
              );
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getDeviceInfo = (userAgent?: string) => {
    if (!userAgent) return 'Unknown Device';
    if (userAgent.includes('iPhone')) return 'iPhone';
    if (userAgent.includes('iPad')) return 'iPad';
    if (userAgent.includes('Android')) return 'Android Device';
    if (userAgent.includes('Mac')) return 'Mac';
    if (userAgent.includes('Windows')) return 'Windows PC';
    return 'Unknown Device';
  };

  if (isLoading) {
    return (
      <SafeAreaView
        style={[
          styles.container,
          { backgroundColor: colors.backgroundSecondary },
        ]}
      >
        <View style={styles.loadingContainer}>
          <ActivityIndicator size='large' color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[
        styles.container,
        { backgroundColor: colors.backgroundSecondary },
      ]}
      edges={['bottom']}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <SettingsSection title='Active Sessions'>
          {sessions && sessions.length > 0 ? (
            sessions.map((session, index) => (
              <View key={session.id}>
                <SettingsRow
                  icon={<Text style={styles.icon}>📱</Text>}
                  title={getDeviceInfo(session.userAgent)}
                  subtitle={`${
                    session.ipAddress || 'Unknown IP'
                  } • Last active ${formatDate(session.createdAt)}`}
                  chevron
                  onPress={() => handleRevokeSession(session.id)}
                />
              </View>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Text
                style={[
                  styles.emptyStateText,
                  {
                    color: colors.textSecondary,
                    fontFamily: 'Poppins_400Regular',
                  },
                ]}
              >
                No active sessions found
              </Text>
            </View>
          )}
        </SettingsSection>

        <SettingsSection>
          <SettingsRow
            icon={<Text style={styles.icon}>🚪</Text>}
            title='Sign Out All Devices'
            subtitle='Sign out from all devices including this one'
            destructive
            chevron
            onPress={handleSignOutAllDevices}
          />
        </SettingsSection>

        <SettingsSection title='Privacy & Security'>
          <SettingsRow
            icon={<Text style={styles.icon}>🔐</Text>}
            title='Two-Factor Authentication'
            subtitle='Coming soon'
            value='Not enabled'
          />
          <SettingsRow
            icon={<Text style={styles.icon}>📋</Text>}
            title='Privacy Policy'
            subtitle='Read our privacy policy'
            chevron
            onPress={() => {
              Linking.openURL('https://culyn.app/privacy');
            }}
          />
          <SettingsRow
            icon={<Text style={styles.icon}>📄</Text>}
            title='Terms of Service'
            subtitle='Read our terms of service'
            chevron
            onPress={() => {
              Linking.openURL('https://culyn.app/terms');
            }}
          />
        </SettingsSection>

        <View style={styles.footer}>
          <Text
            style={[
              styles.footerText,
              {
                color: colors.textMuted,
                fontFamily: 'Poppins_400Regular',
              },
            ]}
          >
            Your data is encrypted and secure. We never share your personal
            information with third parties.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 8,
    paddingBottom: 32,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    fontSize: 20,
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  footerText: {
    fontSize: 13,
    lineHeight: 20,
    textAlign: 'center',
  },
});
