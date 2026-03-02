import { DietaryChipSelector } from '@/components/settings/DietaryChipSelector'
import { useThemeColors } from '@/constants/useTheme'
import { apiClient } from '@/lib/api'
import { useMutation, useQuery } from '@tanstack/react-query'
import React, { useEffect, useState } from 'react'
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

interface DietaryPreference {
  id: string
  type: string
  allergens: string[]
  dislikes: string[]
  preferences: string | null
}

const DIET_TYPES = [
  { value: 'VEGETARIAN', label: 'Vegetarian' },
  { value: 'VEGAN', label: 'Vegan' },
  { value: 'KETO', label: 'Keto' },
  { value: 'PALEO', label: 'Paleo' },
  { value: 'GLUTEN_FREE', label: 'Gluten Free' },
  { value: 'DAIRY_FREE', label: 'Dairy Free' },
  { value: 'NUT_FREE', label: 'Nut Free' },
  { value: 'LOW_CARB', label: 'Low Carb' },
  { value: 'LOW_FAT', label: 'Low Fat' },
  { value: 'HALAL', label: 'Halal' },
  { value: 'KOSHER', label: 'Kosher' },
]

const COMMON_ALLERGENS = [
  { value: 'nuts', label: 'Nuts' },
  { value: 'dairy', label: 'Dairy' },
  { value: 'gluten', label: 'Gluten' },
  { value: 'shellfish', label: 'Shellfish' },
  { value: 'eggs', label: 'Eggs' },
  { value: 'soy', label: 'Soy' },
  { value: 'fish', label: 'Fish' },
  { value: 'wheat', label: 'Wheat' },
  { value: 'sesame', label: 'Sesame' },
]

export default function DietaryPreferencesScreen() {
  const colors = useThemeColors()
  const [selectedDietTypes, setSelectedDietTypes] = useState<string[]>([])
  const [selectedAllergens, setSelectedAllergens] = useState<string[]>([])
  const [dislikedIngredients, setDislikedIngredients] = useState('')
  const [additionalPreferences, setAdditionalPreferences] = useState('')

  const { data: preferences, isLoading } = useQuery({
    queryKey: ['dietary-preferences'],
    queryFn: async () => {
      const response = await apiClient().get<DietaryPreference[]>('/user/dietary')
      return response.data
    },
  })

  useEffect(() => {
    if (preferences && preferences.length > 0) {
      // Aggregate all preferences
      const dietTypes = preferences.map(p => p.type)
      const allergens = preferences.flatMap(p => p.allergens || [])
      const dislikes = preferences.flatMap(p => p.dislikes || [])
      const prefs = preferences
        .map(p => p.preferences)
        .filter(Boolean)
        .join('\n')

      setSelectedDietTypes(dietTypes)
      setSelectedAllergens(allergens)
      setDislikedIngredients(dislikes.join(', '))
      setAdditionalPreferences(prefs)
    }
  }, [preferences])

  const updatePreferencesMutation = useMutation({
    mutationFn: async (data: {
      dietTypes: string[]
      allergens: string[]
      dislikes: string[]
      preferences: string
    }) => {
      const response = await apiClient().post('/user/dietary', data)
      return response.data
    },
    onSuccess: () => {
      Alert.alert('Success', 'Dietary preferences updated successfully')
    },
    onError: (error: unknown) => {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update preferences'
      Alert.alert('Error', errorMessage)
    },
  })

  const handleSave = () => {
    const dislikes = dislikedIngredients
      .split(',')
      .map(item => item.trim())
      .filter(Boolean)

    updatePreferencesMutation.mutate({
      dietTypes: selectedDietTypes,
      allergens: selectedAllergens,
      dislikes,
      preferences: additionalPreferences.trim(),
    })
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
        <View style={styles.section}>
          <Text
            style={[
              styles.sectionTitle,
              {
                color: colors.textPrimary,
                fontFamily: 'EBGaramond_600SemiBold',
              },
            ]}>
            Diet Types
          </Text>
          <Text
            style={[
              styles.sectionDescription,
              {
                color: colors.textSecondary,
                fontFamily: 'Poppins_400Regular',
              },
            ]}>
            Select all dietary preferences that apply to you
          </Text>
          <View style={styles.chipSelectorWrapper}>
            <DietaryChipSelector
              options={DIET_TYPES}
              selectedValues={selectedDietTypes}
              onChange={setSelectedDietTypes}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text
            style={[
              styles.sectionTitle,
              {
                color: colors.textPrimary,
                fontFamily: 'EBGaramond_600SemiBold',
              },
            ]}>
            Allergens
          </Text>
          <Text
            style={[
              styles.sectionDescription,
              {
                color: colors.textSecondary,
                fontFamily: 'Poppins_400Regular',
              },
            ]}>
            Select ingredients you&apos;re allergic to
          </Text>
          <View style={styles.chipSelectorWrapper}>
            <DietaryChipSelector
              options={COMMON_ALLERGENS}
              selectedValues={selectedAllergens}
              onChange={setSelectedAllergens}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text
            style={[
              styles.sectionTitle,
              {
                color: colors.textPrimary,
                fontFamily: 'EBGaramond_600SemiBold',
              },
            ]}>
            Disliked Ingredients
          </Text>
          <Text
            style={[
              styles.sectionDescription,
              {
                color: colors.textSecondary,
                fontFamily: 'Poppins_400Regular',
              },
            ]}>
            Enter ingredients you don&apos;t like, separated by commas
          </Text>
          <TextInput
            style={[
              styles.textArea,
              {
                backgroundColor: colors.background,
                color: colors.textPrimary,
                borderColor: colors.border,
                fontFamily: 'Poppins_400Regular',
              },
            ]}
            value={dislikedIngredients}
            onChangeText={setDislikedIngredients}
            placeholder="e.g., cilantro, olives, mushrooms"
            placeholderTextColor={colors.textMuted}
            multiline
          />
        </View>

        <View style={styles.section}>
          <Text
            style={[
              styles.sectionTitle,
              {
                color: colors.textPrimary,
                fontFamily: 'EBGaramond_600SemiBold',
              },
            ]}>
            Additional Preferences
          </Text>
          <Text
            style={[
              styles.sectionDescription,
              {
                color: colors.textSecondary,
                fontFamily: 'Poppins_400Regular',
              },
            ]}>
            Any other dietary preferences or restrictions
          </Text>
          <TextInput
            style={[
              styles.textArea,
              {
                backgroundColor: colors.background,
                color: colors.textPrimary,
                borderColor: colors.border,
                fontFamily: 'Poppins_400Regular',
              },
            ]}
            value={additionalPreferences}
            onChangeText={setAdditionalPreferences}
            placeholder="e.g., prefer organic, low sodium, etc."
            placeholderTextColor={colors.textMuted}
            multiline
            numberOfLines={3}
          />
        </View>

        <View style={styles.buttonSection}>
          <TouchableOpacity
            style={[
              styles.saveButton,
              {
                backgroundColor: colors.primary,
                opacity: updatePreferencesMutation.isPending ? 0.6 : 1,
              },
            ]}
            onPress={handleSave}
            disabled={updatePreferencesMutation.isPending}>
            {updatePreferencesMutation.isPending ? (
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
                Save Preferences
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
    paddingHorizontal: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    lineHeight: 26,
    marginBottom: 6,
  },
  sectionDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  chipSelectorWrapper: {
    marginTop: 4,
  },
  textArea: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    fontSize: 15,
    lineHeight: 22,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  buttonSection: {
    marginTop: 8,
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
