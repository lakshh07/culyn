import { SettingsRow } from '@/components/settings/SettingsRow';
import { SettingsSection } from '@/components/settings/SettingsSection';
import { Avatar } from '@/components/ui/Avatar';
import { useThemeColors } from '@/constants/useTheme';
import { useUserProfile } from '@/hooks/useUserProfile';
import { authClient } from '@/lib/auth-client';
import { useRouter } from 'expo-router';
import React from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SettingsScreen() {
  const colors = useThemeColors();
  const router = useRouter();
  const { session, profile, isLoading } = useUserProfile();

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
      { cancelable: true }
    );
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
      {/* Custom Header with Back Button */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Text
            style={[
              styles.backButtonText,
              { color: colors.primary, fontFamily: 'Poppins_400Regular' },
            ]}
          >
            ← Back
          </Text>
        </TouchableOpacity>
        <Text
          style={[
            styles.headerTitle,
            {
              color: colors.textPrimary,
              fontFamily: 'EBGaramond_600SemiBold',
            },
          ]}
        >
          Settings
        </Text>
        <View style={styles.headerSpacer} />
      </View>

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
            onPress={() => router.push('/settings/basic-info')}
          />
          <SettingsRow
            icon={<Text style={styles.icon}>🎨</Text>}
            title='App Appearance'
            subtitle='Theme and display settings'
            chevron
            onPress={() => router.push('/settings/appearance')}
          />
          <SettingsRow
            icon={<Text style={styles.icon}>🥗</Text>}
            title='Dietary Preferences'
            subtitle='Diet types, allergens, and dislikes'
            chevron
            onPress={() => router.push('/settings/dietary')}
          />
        </SettingsSection>

        <SettingsSection>
          <SettingsRow
            icon={<Text style={styles.icon}>🔑</Text>}
            title='Account'
            subtitle='Password, email, and account settings'
            chevron
            onPress={() => router.push('/settings/account')}
          />
          <SettingsRow
            icon={<Text style={styles.icon}>💳</Text>}
            title='Billing & Subscription'
            subtitle='Plans, usage, and payment'
            chevron
            onPress={() => router.push('/settings/billing')}
          />
          <SettingsRow
            icon={<Text style={styles.icon}>🔒</Text>}
            title='Security'
            subtitle='Sessions, privacy, and security'
            chevron
            onPress={() => router.push('/settings/security')}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  backButton: {
    paddingVertical: 4,
  },
  backButtonText: {
    fontSize: 16,
    lineHeight: 24,
  },
  headerTitle: {
    fontSize: 20,
    lineHeight: 26,
    position: 'absolute',
    left: 0,
    right: 0,
    textAlign: 'center',
    zIndex: -1,
  },
  headerSpacer: {
    width: 60,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 24,
    paddingBottom: 32,
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
});
