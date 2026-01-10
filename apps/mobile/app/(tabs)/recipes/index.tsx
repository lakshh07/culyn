import { useThemeColors } from '@/constants/useTheme';
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function RecipesHomeScreen() {
  const colors = useThemeColors();

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: colors.background }]}
      edges={['left', 'right', 'bottom']}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.title, { color: colors.textPrimary }]}>
          Recipes
        </Text>
        <Text style={[styles.subtitle, { color: colors.textMuted }]}>
          Browse and save your favorite recipes here. (More coming soon.)
        </Text>
        <View style={[styles.placeholderCard, { borderColor: colors.border }]}>
          <Text style={[styles.placeholderText, { color: colors.textPrimary }]}>
            Recipes list coming next.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 32,
    gap: 12,
  },
  title: {
    fontSize: 28,
    lineHeight: 34,
    fontFamily: 'EBGaramond_600SemiBold',
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: 'Poppins_400Regular',
  },
  placeholderCard: {
    marginTop: 10,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  placeholderText: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: 'Poppins_400Regular',
  },
});
