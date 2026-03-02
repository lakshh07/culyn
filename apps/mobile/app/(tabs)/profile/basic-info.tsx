import { Avatar } from '@/components/ui/Avatar'
import { useThemeColors } from '@/constants/useTheme'
import { useUserProfile } from '@/hooks/useUserProfile'
import { apiClient } from '@/lib/api'
import { useMutation } from '@tanstack/react-query'
import * as ImagePicker from 'expo-image-picker'
import React, { useState } from 'react'
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

export default function BasicInfoScreen() {
  const colors = useThemeColors()
  const { profile, isLoading, refetch } = useUserProfile()
  const [name, setName] = useState(profile?.name || '')

  const updateProfileMutation = useMutation({
    mutationFn: async (data: { name: string }) => {
      const response = await apiClient().patch('/user/profile', data)
      return response.data
    },
    onSuccess: () => {
      refetch()
      Alert.alert('Success', 'Profile updated successfully')
    },
    onError: (error: unknown) => {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update profile'
      Alert.alert('Error', errorMessage)
    },
  })

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Name cannot be empty')
      return
    }
    updateProfileMutation.mutate({ name: name.trim() })
  }

  const handleChangeAvatar = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync()

    if (!permissionResult.granted) {
      Alert.alert(
        'Permission Required',
        'Please grant camera roll permissions to change your avatar'
      )
      return
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    })

    if (!result.canceled && result.assets[0]) {
      // TODO: Implement avatar upload to S3
      Alert.alert('Coming Soon', 'Avatar upload will be available soon')
    }
  }

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.backgroundSecondary }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.backgroundSecondary }]}
      edges={['bottom']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {/* Avatar Section */}
        <View style={styles.avatarSection}>
          <Avatar
            imageUrl={profile?.image}
            name={name || profile?.name}
            email={profile?.email}
            size="large"
          />
          <TouchableOpacity
            style={[styles.changeAvatarButton, { borderColor: colors.primary }]}
            onPress={handleChangeAvatar}>
            <Text
              style={[
                styles.changeAvatarText,
                {
                  color: colors.primary,
                  fontFamily: 'Poppins_500Medium',
                },
              ]}>
              Change Avatar
            </Text>
          </TouchableOpacity>
        </View>

        {/* Form Section */}
        <View style={styles.formSection}>
          <View style={styles.inputGroup}>
            <Text
              style={[
                styles.label,
                {
                  color: colors.textSecondary,
                  fontFamily: 'Poppins_500Medium',
                },
              ]}>
              Full Name
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
              value={name}
              onChangeText={setName}
              placeholder="Enter your name"
              placeholderTextColor={colors.textMuted}
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
              ]}>
              Email
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.background,
                  color: colors.textMuted,
                  borderColor: colors.border,
                  fontFamily: 'Poppins_400Regular',
                },
              ]}
              value={profile?.email}
              editable={false}
            />
            <Text
              style={[
                styles.helperText,
                {
                  color: colors.textMuted,
                  fontFamily: 'Poppins_400Regular',
                },
              ]}>
              Email cannot be changed
            </Text>
          </View>

          <View style={styles.inputGroup}>
            <Text
              style={[
                styles.label,
                {
                  color: colors.textSecondary,
                  fontFamily: 'Poppins_500Medium',
                },
              ]}>
              Email Verification
            </Text>
            <View
              style={[
                styles.verificationBadge,
                {
                  backgroundColor: profile?.emailVerified ? colors.successSoft : colors.warningSoft,
                },
              ]}>
              <Text
                style={[
                  styles.verificationText,
                  {
                    color: profile?.emailVerified ? colors.success : colors.warning,
                    fontFamily: 'Poppins_500Medium',
                  },
                ]}>
                {profile?.emailVerified ? '✓ Verified' : '⚠ Not Verified'}
              </Text>
            </View>
          </View>
        </View>

        {/* Save Button */}
        <View style={styles.buttonSection}>
          <TouchableOpacity
            style={[
              styles.saveButton,
              {
                backgroundColor: colors.primary,
                opacity: updateProfileMutation.isPending ? 0.6 : 1,
              },
            ]}
            onPress={handleSave}
            disabled={updateProfileMutation.isPending}>
            {updateProfileMutation.isPending ? (
              <ActivityIndicator size="small" color={colors.white} />
            ) : (
              <Text
                style={[
                  styles.saveButtonText,
                  {
                    color: colors.white,
                    fontFamily: 'Poppins_500Medium',
                  },
                ]}>
                Save Changes
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
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
    paddingBottom: 32,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarSection: {
    alignItems: 'center',
    paddingBottom: 32,
    borderBottomWidth: StyleSheet.hairlineWidth,
    marginHorizontal: 20,
  },
  changeAvatarButton: {
    marginTop: 16,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderWidth: 1.5,
    borderRadius: 20,
  },
  changeAvatarText: {
    fontSize: 14,
    lineHeight: 20,
  },
  formSection: {
    paddingHorizontal: 20,
    paddingTop: 24,
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
  helperText: {
    fontSize: 12,
    lineHeight: 18,
    marginTop: 6,
  },
  verificationBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  verificationText: {
    fontSize: 13,
    lineHeight: 18,
  },
  buttonSection: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  saveButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    lineHeight: 24,
  },
})
