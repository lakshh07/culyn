import { useThemeColors } from '@/constants/useTheme';
import { ContentCategory } from '@culyn/shared/schemas';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

const TABS: { key: ContentCategory; label: string }[] = [
  { key: 'RECIPE', label: 'Recipes' },
  { key: 'PLACE', label: 'Places' },
  { key: 'PRODUCT', label: 'Products' },
];

interface CategoryTabsExpandedProps {
  selectedCategory: ContentCategory;
  onCategoryChange: (category: ContentCategory) => void;
  onClose: () => void;
}

export function CategoryTabsExpanded({
  selectedCategory,
  onCategoryChange,
  onClose,
}: CategoryTabsExpandedProps) {
  const colors = useThemeColors();

  return (
    <View style={styles.container}>
      <View style={styles.tabsRow}>
        {TABS.map((tab) => {
          const isActive = selectedCategory === tab.key;
          return (
            <Pressable
              key={tab.key}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                onCategoryChange(tab.key);
              }}
              style={[
                styles.tab,
                {
                  backgroundColor: isActive
                    ? colors.chipBackgroundActive
                    : 'transparent',
                  borderColor: isActive
                    ? colors.chipBackgroundActive
                    : colors.border,
                },
              ]}
            >
              <Text
                style={[
                  styles.tabLabel,
                  {
                    color: isActive
                      ? colors.chipTextActive
                      : colors.textSecondary,
                  },
                ]}
              >
                {tab.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <Pressable
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          onClose();
        }}
        style={[styles.closeButton, { backgroundColor: colors.chipBackground }]}
        hitSlop={8}
      >
        <Feather name="x" size={18} color={colors.textPrimary} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    gap: 12,
  },
  tabsRow: {
    flexDirection: 'row',
    flex: 1,
    gap: 8,
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 24,
    borderWidth: 1,
  },
  tabLabel: {
    fontSize: 13,
    fontFamily: 'Syne_600SemiBold',
  },
  closeButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
