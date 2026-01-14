import {
  AddFillIcon,
  AddIcon,
  DiscoverFillIcon,
  DiscoverIcon,
  MealPlanFillIcon,
  MealPlanIcon,
  RecipesFillIcon,
  RecipesIcon,
} from '@/components/icons';
import { useThemeColors } from '@/constants/useTheme';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { LinearGradient } from 'expo-linear-gradient';
import { usePathname } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { type SvgProps } from 'react-native-svg';

type IconComponent = React.ComponentType<SvgProps>;

const TAB_BAR_HEIGHT = 52;
const GRADIENT_HEIGHT = 100;

type TabConfig = {
  label: string;
  inactiveIcon: IconComponent;
  activeIcon: IconComponent;
};

const TAB_CONFIG: Record<string, TabConfig> = {
  discover: {
    label: 'Discover',
    inactiveIcon: DiscoverIcon,
    activeIcon: DiscoverFillIcon,
  },
  recipes: {
    label: 'Recipes',
    inactiveIcon: RecipesIcon,
    activeIcon: RecipesFillIcon,
  },
  create: {
    label: 'Add',
    inactiveIcon: AddIcon,
    activeIcon: AddFillIcon,
  },
  ai: {
    label: 'Ask',
    inactiveIcon: MealPlanIcon,
    activeIcon: MealPlanFillIcon,
  },
  meals: {
    label: 'Meals',
    inactiveIcon: MealPlanIcon,
    activeIcon: MealPlanFillIcon,
  },
};

export default function CustomTabBar({
  state,
  descriptors,
  navigation,
}: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const colors = useThemeColors();
  const bottomPadding = Math.max(insets.bottom, 18);
  const pathname = usePathname();

  // Hide tab bar when on recipe detail page (recipes/[id])
  // Pathname will be like: /recipes/monte-cristo or /(tabs)/recipes/monte-cristo
  const isRecipeDetailPage =
    pathname.includes('/recipes/') && !pathname.endsWith('/recipes');

  if (isRecipeDetailPage) {
    return null;
  }

  return (
    <View
      style={[
        styles.container,
        {
          paddingBottom: bottomPadding,
          backgroundColor: colors.background,
        },
      ]}
    >
      <LinearGradient
        colors={[colors.gradientStart, colors.gradientEnd]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        pointerEvents='none'
        style={[
          styles.gradientOverlay,
          {
            bottom: bottomPadding + TAB_BAR_HEIGHT,
          },
        ]}
      />

      <View style={styles.tabBar}>
        {state.routes.map((route, index) => {
          const isFocused = state.index === index;
          const { options } = descriptors[route.key];

          const config = TAB_CONFIG[route.name] ?? TAB_CONFIG.discover;
          const Icon = isFocused ? config.activeIcon : config.inactiveIcon;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name as never);
            }
          };

          const onLongPress = () => {
            navigation.emit({
              type: 'tabLongPress',
              target: route.key,
            });
          };

          let label: string;
          if (typeof options.tabBarLabel === 'string') {
            label = options.tabBarLabel;
          } else if (typeof options.title === 'string') {
            label = options.title;
          } else {
            label = config.label ?? route.name;
          }

          return (
            <Pressable
              key={route.key}
              accessibilityRole='button'
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              onPress={onPress}
              onLongPress={onLongPress}
              style={({ pressed }) => [
                styles.tabItem,
                {
                  opacity: pressed ? 0.7 : 1,
                },
              ]}
            >
              <Icon width={23} height={23} opacity={isFocused ? 1 : 0.6} />
              <Text
                style={[
                  styles.label,
                  {
                    color: isFocused ? colors.textPrimary : colors.textMuted,
                  },
                ]}
              >
                {label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
  },
  tabBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: TAB_BAR_HEIGHT,
    paddingHorizontal: 26,
    paddingTop: 10,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  label: {
    fontSize: 10,
    fontFamily: 'Syne_500Medium',
  },
  gradientOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: GRADIENT_HEIGHT,
  },
});
