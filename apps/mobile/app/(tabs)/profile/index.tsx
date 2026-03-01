import { SettingsRow } from '@/components/settings/SettingsRow';
import { SettingsSection } from '@/components/settings/SettingsSection';
import { Avatar } from '@/components/ui/Avatar';
import { useThemeColors } from '@/constants/useTheme';
import { useUserProfile } from '@/hooks/useUserProfile';
import { apiClient } from '@/lib/api';
import { authClient } from '@/lib/auth-client';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import React from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ProfileScreen() {
  const colors = useThemeColors();
  const router = useRouter();
  const { session, profile, isLoading } = useUserProfile();

  const { data: billingInfo } = useQuery({
    queryKey: ['billing'],
    queryFn: async () => {
      const res = await apiClient().get<{ subscription: { plan: string } }>(
        '/user/billing',
      );
      return res.data;
    },
    enabled: !!session,
  });

  const isFree = !billingInfo || billingInfo.subscription.plan === 'FREE';

  const handleSignOut = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            await authClient.signOut();
            router.replace('/(auth)/onboarding');
          },
        },
      ],
      { cancelable: true },
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView
        style={[
          styles.container,
          { backgroundColor: colors.backgroundSecondary },
        ]}
        edges={['top']}
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
      edges={['top']}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <Avatar
            imageUrl={profile?.image}
            name={profile?.name}
            email={profile?.email}
            size='large'
          />
          <View style={styles.profileInfo}>
            <Text
              style={[
                styles.profileName,
                {
                  color: colors.textPrimary,
                  fontFamily: 'EBGaramond_600SemiBold',
                },
              ]}
            >
              {profile?.name || 'User'}
            </Text>
            <Text
              style={[
                styles.profileEmail,
                {
                  color: colors.textSecondary,
                  fontFamily: 'Poppins_400Regular',
                },
              ]}
            >
              {profile?.email}
            </Text>
          </View>
        </View>

        {/* Settings Sections */}
        <SettingsSection>
          <SettingsRow
            icon={<Text style={styles.icon}>👤</Text>}
            title='Basic Information'
            subtitle='Name, email, profile picture'
            chevron
            onPress={() => router.push('/(tabs)/profile/basic-info')}
          />
          <SettingsRow
            icon={<Text style={styles.icon}>🎨</Text>}
            title='App Appearance'
            subtitle='Theme and display settings'
            chevron
            onPress={() => router.push('/(tabs)/profile/appearance')}
          />
          <SettingsRow
            icon={<Text style={styles.icon}>🥗</Text>}
            title='Dietary Preferences'
            subtitle='Diet types, allergens, and dislikes'
            chevron
            onPress={() => router.push('/(tabs)/profile/dietary')}
          />
        </SettingsSection>

        <SettingsSection>
          <SettingsRow
            icon={<Text style={styles.icon}>🔑</Text>}
            title='Account'
            subtitle='Password, email, and account settings'
            chevron
            onPress={() => router.push('/(tabs)/profile/account')}
          />
          <SettingsRow
            icon={<Text style={styles.icon}>💳</Text>}
            title='Billing & Subscription'
            subtitle={
              isFree
                ? 'Upgrade to Pro — ₹49/month'
                : 'Plans, usage, and payment'
            }
            chevron
            onPress={() => router.push('/(tabs)/profile/billing')}
            rightElement={
              isFree ? (
                <View
                  style={[styles.proBadge, { backgroundColor: colors.primary }]}
                >
                  <Text
                    style={[
                      styles.proBadgeText,
                      { fontFamily: 'Poppins_500Medium' },
                    ]}
                  >
                    PRO
                  </Text>
                </View>
              ) : undefined
            }
          />
          <SettingsRow
            icon={<Text style={styles.icon}>🔒</Text>}
            title='Security'
            subtitle='Sessions, privacy, and security'
            chevron
            onPress={() => router.push('/(tabs)/profile/security')}
          />
        </SettingsSection>

        <SettingsSection>
          <SettingsRow
            icon={<Text style={styles.icon}>🚪</Text>}
            title='Sign Out'
            destructive
            onPress={handleSignOut}
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
            Culyn v1.0.0
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
    paddingTop: 24,
    paddingBottom: 100,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileHeader: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  profileInfo: {
    alignItems: 'center',
    marginTop: 16,
  },
  profileName: {
    fontSize: 24,
    lineHeight: 32,
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    lineHeight: 20,
  },
  icon: {
    fontSize: 20,
  },
  footer: {
    alignItems: 'center',
    paddingTop: 24,
    paddingBottom: 8,
  },
  footerText: {
    fontSize: 12,
    lineHeight: 18,
  },
  proBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    marginRight: 8,
  },
  proBadgeText: {
    color: '#fff',
    fontSize: 11,
  },
});
