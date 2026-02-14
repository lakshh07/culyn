import { useThemeColors } from '@/constants/useTheme';
import * as Haptics from 'expo-haptics';
import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import Animated from 'react-native-reanimated';

interface SearchBottomBarProps {
  onClearAll: () => void;
  onSearch: () => void;
  animatedStyle: any;
}

export function SearchBottomBar({
  onClearAll,
  onSearch,
  animatedStyle,
}: SearchBottomBarProps) {
  const colors = useThemeColors();

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor:
            colors.searchCardBackground ?? colors.cardBackgroundElevated,
          borderTopColor: colors.border,
        },
        animatedStyle,
      ]}
    >
      <Pressable
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          onClearAll();
        }}
        style={styles.clearButton}
      >
        <Text style={[styles.clearText, { color: colors.textSecondary }]}>
          Clear all
        </Text>
      </Pressable>

      <Pressable
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          onSearch();
        }}
        style={[
          styles.searchButton,
          { backgroundColor: colors.chipBackgroundActive },
        ]}
      >
        <Text style={[styles.searchText, { color: colors.chipTextActive }]}>
          Search
        </Text>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderTopWidth: 1,
  },
  clearButton: {
    paddingVertical: 10,
    paddingHorizontal: 4,
  },
  clearText: {
    fontSize: 15,
    fontFamily: 'Syne_500Medium',
    textDecorationLine: 'underline',
  },
  searchButton: {
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 12,
  },
  searchText: {
    fontSize: 15,
    fontFamily: 'Syne_600SemiBold',
  },
});
