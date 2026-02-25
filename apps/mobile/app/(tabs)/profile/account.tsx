import { SettingsRow } from '@/components/settings/SettingsRow';
import { SettingsSection } from '@/components/settings/SettingsSection';
import { useThemeColors } from '@/constants/useTheme';
import { useUserProfile } from '@/hooks/useUserProfile';
import { authClient } from '@/lib/auth-client';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function AccountScreen() {
  const colors = useThemeColors();
  const router = useRouter();
  const { session, profile, isLoading } = useUserProfile();
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // const isEmailPasswordAuth = !session?.user?.provider;

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'New passwords do not match');
      return;
    }

    if (newPassword.length < 8) {
      Alert.alert('Error', 'Password must be at least 8 characters long');
      return;
    }

    setIsChangingPassword(true);
    try {
      await authClient.changePassword({
        currentPassword,
        newPassword,
        revokeOtherSessions: false,
      });

      Alert.alert('Success', 'Password changed successfully');
      setShowChangePasswordModal(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to change password');
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently deleted.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            // TODO: Implement account deletion API
            Alert.alert(
              'Coming Soon',
              'Account deletion will be available soon',
            );
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
        <SettingsSection title='Authentication'>
          {/* {isEmailPasswordAuth && (
            <SettingsRow
              icon={<Text style={styles.icon}>🔑</Text>}
              title='Change Password'
              subtitle='Update your password'
              chevron
              onPress={() => setShowChangePasswordModal(true)}
            />
          )} */}
          <SettingsRow
            icon={<Text style={styles.icon}>📧</Text>}
            title='Email Verification'
            subtitle={
              profile?.emailVerified
                ? 'Your email is verified'
                : 'Verify your email address'
            }
            value={profile?.emailVerified ? 'Verified' : 'Not Verified'}
          />
        </SettingsSection>

        <SettingsSection title='Connected Accounts'>
          {/* <SettingsRow
            icon={<Text style={styles.icon}>🔗</Text>}
            title='Google'
            subtitle={
              session?.user?. === 'google'
                ? 'Connected'
                : 'Not connected'
            }
            value={session?.user?.provider === 'google' ? '✓' : ''}
          /> */}
        </SettingsSection>

        <SettingsSection title='Danger Zone'>
          <SettingsRow
            icon={<Text style={styles.icon}>⚠️</Text>}
            title='Delete Account'
            subtitle='Permanently delete your account and data'
            destructive
            chevron
            onPress={handleDeleteAccount}
          />
        </SettingsSection>
      </ScrollView>

      {/* Change Password Modal */}
      <Modal
        visible={showChangePasswordModal}
        animationType='slide'
        presentationStyle='pageSheet'
        onRequestClose={() => setShowChangePasswordModal(false)}
      >
        <SafeAreaView
          style={[
            styles.modalContainer,
            { backgroundColor: colors.backgroundSecondary },
          ]}
        >
          <View
            style={[styles.modalHeader, { borderBottomColor: colors.border }]}
          >
            <TouchableOpacity onPress={() => setShowChangePasswordModal(false)}>
              <Text
                style={[
                  styles.modalCancelButton,
                  {
                    color: colors.primary,
                    fontFamily: 'Poppins_400Regular',
                  },
                ]}
              >
                Cancel
              </Text>
            </TouchableOpacity>
            <Text
              style={[
                styles.modalTitle,
                {
                  color: colors.textPrimary,
                  fontFamily: 'EBGaramond_600SemiBold',
                },
              ]}
            >
              Change Password
            </Text>
            <View style={styles.modalHeaderSpacer} />
          </View>

          <ScrollView
            style={styles.modalContent}
            contentContainerStyle={styles.modalScrollContent}
          >
            <View style={styles.inputGroup}>
              <Text
                style={[
                  styles.label,
                  {
                    color: colors.textSecondary,
                    fontFamily: 'Poppins_500Medium',
                  },
                ]}
              >
                Current Password
              </Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.background,
                    color: colors.textPrimary,
                    borderColor: colors.border,
                    fontFamily: 'Poppins_400Regular',
                  },
                ]}
                value={currentPassword}
                onChangeText={setCurrentPassword}
                placeholder='Enter current password'
                placeholderTextColor={colors.textMuted}
                secureTextEntry
                autoCapitalize='none'
              />
            </View>

            <View style={styles.inputGroup}>
              <Text
                style={[
                  styles.label,
                  {
                    color: colors.textSecondary,
                    fontFamily: 'Poppins_500Medium',
                  },
                ]}
              >
                New Password
              </Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.background,
                    color: colors.textPrimary,
                    borderColor: colors.border,
                    fontFamily: 'Poppins_400Regular',
                  },
                ]}
                value={newPassword}
                onChangeText={setNewPassword}
                placeholder='Enter new password'
                placeholderTextColor={colors.textMuted}
                secureTextEntry
                autoCapitalize='none'
              />
            </View>

            <View style={styles.inputGroup}>
              <Text
                style={[
                  styles.label,
                  {
                    color: colors.textSecondary,
                    fontFamily: 'Poppins_500Medium',
                  },
                ]}
              >
                Confirm New Password
              </Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.background,
                    color: colors.textPrimary,
                    borderColor: colors.border,
                    fontFamily: 'Poppins_400Regular',
                  },
                ]}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder='Confirm new password'
                placeholderTextColor={colors.textMuted}
                secureTextEntry
                autoCapitalize='none'
              />
            </View>

            <TouchableOpacity
              style={[
                styles.saveButton,
                {
                  backgroundColor: colors.primary,
                  opacity: isChangingPassword ? 0.6 : 1,
                },
              ]}
              onPress={handleChangePassword}
              disabled={isChangingPassword}
            >
              {isChangingPassword ? (
                <ActivityIndicator size='small' color={colors.white} />
              ) : (
                <Text
                  style={[
                    styles.saveButtonText,
                    {
                      color: colors.white,
                      fontFamily: 'Poppins_500Medium',
                    },
                  ]}
                >
                  Change Password
                </Text>
              )}
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </Modal>
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
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  modalCancelButton: {
    fontSize: 16,
    lineHeight: 24,
  },
  modalTitle: {
    fontSize: 18,
    lineHeight: 24,
  },
  modalHeaderSpacer: {
    width: 60,
  },
  modalContent: {
    flex: 1,
  },
  modalScrollContent: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 32,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    fontSize: 16,
    lineHeight: 24,
  },
  saveButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  saveButtonText: {
    fontSize: 16,
    lineHeight: 24,
  },
});
