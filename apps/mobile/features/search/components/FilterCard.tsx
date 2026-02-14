import { useThemeColors } from '@/constants/useTheme';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import React, { useState } from 'react';
import { LayoutAnimation, Pressable, StyleSheet, Text, View } from 'react-native';

interface FilterCardProps {
  title: string;
  defaultExpanded?: boolean;
  children: React.ReactNode;
}

export function FilterCard({
  title,
  defaultExpanded = true,
  children,
}: FilterCardProps) {
  const colors = useThemeColors();
  const [expanded, setExpanded] = useState(defaultExpanded);

  const toggle = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded((prev) => !prev);
  };

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.searchCardBackground ?? colors.cardBackgroundElevated,
          borderColor: colors.border,
        },
      ]}
    >
      <Pressable onPress={toggle} style={styles.header}>
        <Text style={[styles.title, { color: colors.textPrimary }]}>
          {title}
        </Text>
        <Feather
          name={expanded ? 'chevron-up' : 'chevron-down'}
          size={18}
          color={colors.textMuted}
        />
      </Pressable>
      {expanded && <View style={styles.body}>{children}</View>}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 12,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  title: {
    fontSize: 15,
    fontFamily: 'Syne_600SemiBold',
  },
  body: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
});
