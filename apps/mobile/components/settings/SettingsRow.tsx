import { useThemeColors } from '@/constants/useTheme';
import React, { ReactNode } from 'react';
import {
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

interface SettingsRowProps {
  icon?: ReactNode;
  title: string;
  subtitle?: string;
  value?: string;
  onPress?: () => void;
  chevron?: boolean;
  toggle?: boolean;
  toggleValue?: boolean;
  onToggle?: (value: boolean) => void;
  destructive?: boolean;
}

export function SettingsRow({
  icon,
  title,
  subtitle,
  value,
  onPress,
  chevron = false,
  toggle = false,
  toggleValue = false,
  onToggle,
  destructive = false,
}: SettingsRowProps) {
  const colors = useThemeColors();

  const content = (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.background, borderBottomColor: colors.border },
      ]}
    >
      {icon && <View style={styles.iconContainer}>{icon}</View>}
      <View style={styles.content}>
        <View style={styles.textContainer}>
          <Text
            style={[
              styles.title,
              {
                color: destructive ? colors.error : colors.textPrimary,
                fontFamily: 'Poppins_400Regular',
              },
            ]}
          >
            {title}
          </Text>
          {subtitle && (
            <Text
              style={[
                styles.subtitle,
                {
                  color: colors.textSecondary,
                  fontFamily: 'Poppins_400Regular',
                },
              ]}
            >
              {subtitle}
            </Text>
          )}
        </View>
        {value && !toggle && (
          <Text
            style={[
              styles.value,
              {
                color: colors.textMuted,
                fontFamily: 'Poppins_400Regular',
              },
            ]}
          >
            {value}
          </Text>
        )}
        {chevron && !toggle && (
          <Text
            style={[
              styles.chevron,
              {
                color: colors.textMuted,
              },
            ]}
          >
            ›
          </Text>
        )}
        {toggle && (
          <Switch
            value={toggleValue}
            onValueChange={onToggle}
            trackColor={{
              false: colors.border,
              true: colors.primary,
            }}
            thumbColor={colors.white}
          />
        )}
      </View>
    </View>
  );

  if (onPress && !toggle) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
        {content}
      </TouchableOpacity>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  iconContainer: {
    marginRight: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  textContainer: {
    flex: 1,
    marginRight: 12,
  },
  title: {
    fontSize: 16,
    lineHeight: 24,
  },
  subtitle: {
    fontSize: 13,
    lineHeight: 18,
    marginTop: 2,
  },
  value: {
    fontSize: 14,
    lineHeight: 20,
    marginRight: 8,
  },
  chevron: {
    fontSize: 24,
    fontWeight: '300',
  },
});
