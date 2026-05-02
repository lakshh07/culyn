import { ImportSheet } from '@/components/ImportSheet'
import { ProcessingPopup } from '@/components/ProcessingPopup'
import { UpgradeSheet } from '@/components/UpgradeSheet'
import { useThemeColors } from '@/constants/useTheme'
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs'
import { LinearGradient } from 'expo-linear-gradient'
import { usePathname } from 'expo-router'
import React, { useEffect, useState } from 'react'
import { Image, ImageSourcePropType, Pressable, StyleSheet, Text, View } from 'react-native'
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

const TAB_BAR_HEIGHT = 52
const GRADIENT_HEIGHT = 15

type TabConfig = {
  label: string
  image: ImageSourcePropType
}

const TAB_CONFIG: Record<string, TabConfig> = {
  discover: {
    label: 'Discover',
    image: require('@/assets/icons/discover.png'),
  },
  add: {
    label: 'Import',
    image: require('@/assets/icons/import.png'),
  },
  'ai-chat': {
    label: 'Chat',
    image: require('@/assets/icons/ai-chat.png'),
  },
  library: {
    label: 'Library',
    image: require('@/assets/icons/library.png'),
  },
  profile: {
    label: 'Profile',
    image: require('@/assets/icons/profile.png'),
  },
}

const AnimatedImage = Animated.createAnimatedComponent(Image)

function TabIcon({ image, isActive }: { image: ImageSourcePropType; isActive: boolean }) {
  const scale = useSharedValue(isActive ? 1.15 : 1)
  const opacity = useSharedValue(isActive ? 1 : 0.4)

  useEffect(() => {
    scale.value = withSpring(isActive ? 1.05 : 1, {
      damping: 20,
      stiffness: 250,
    })
    opacity.value = withSpring(isActive ? 1 : 0.6, {
      damping: 20,
      stiffness: 250,
    })
  }, [isActive, scale, opacity])

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }))

  return <AnimatedImage source={image} style={[styles.tabIcon, animatedStyle]} />
}

export default function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets()
  const colors = useThemeColors()
  const bottomPadding = Math.min(insets.bottom, 22)
  const pathname = usePathname()
  const [showImportSheet, setShowImportSheet] = useState(false)
  const [showUpgradeSheet, setShowUpgradeSheet] = useState(false)

  // Hide tab bar on detail pages and profile sub-screens
  const isDetailPage =
    (pathname.includes('/recipes/') && !pathname.endsWith('/recipes')) ||
    (pathname.includes('/places/') && !pathname.endsWith('/places')) ||
    (pathname.includes('/products/') && !pathname.endsWith('/products')) ||
    (pathname.includes('/chat-detail/') && !pathname.endsWith('/chat-detail')) ||
    (pathname.includes('/profile/') && !pathname.endsWith('/profile'))

  if (isDetailPage) {
    return null
  }

  return (
    <View
      style={[
        styles.container,
        {
          paddingBottom: bottomPadding,
          backgroundColor: colors.background,
        },
      ]}>
      <ProcessingPopup />

      <LinearGradient
        colors={[colors.gradientStart, colors.background]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        pointerEvents="none"
        style={[
          styles.gradientOverlay,
          {
            top: -GRADIENT_HEIGHT,
          },
        ]}
      />

      <ImportSheet
        visible={showImportSheet}
        onClose={() => setShowImportSheet(false)}
        onShowUpgrade={() => {
          setShowImportSheet(false)
          setShowUpgradeSheet(true)
        }}
      />
      <UpgradeSheet visible={showUpgradeSheet} onClose={() => setShowUpgradeSheet(false)} />

      <View style={styles.tabBar}>
        {state.routes.map((route, index) => {
          const isFocused = state.index === index
          const { options } = descriptors[route.key]

          const config = TAB_CONFIG[route.name] ?? TAB_CONFIG.discover

          const onPress = () => {
            if (route.name === 'add') {
              setShowImportSheet(true)
              return
            }

            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            })

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name as never)
            }
          }

          const onLongPress = () => {
            navigation.emit({
              type: 'tabLongPress',
              target: route.key,
            })
          }

          let label: string
          if (typeof options.tabBarLabel === 'string') {
            label = options.tabBarLabel
          } else if (typeof options.title === 'string') {
            label = options.title
          } else {
            label = config.label ?? route.name
          }

          return (
            <Pressable
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              onPress={onPress}
              onLongPress={onLongPress}
              style={({ pressed }) => [
                styles.tabItem,
                {
                  opacity: pressed ? 0.7 : 1,
                },
              ]}>
              <TabIcon image={config.image} isActive={isFocused} />
              <Text
                style={[
                  styles.label,
                  {
                    color: isFocused ? colors.textPrimary : colors.textMuted,
                  },
                ]}>
                {label}
              </Text>
            </Pressable>
          )
        })}
      </View>
    </View>
  )
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
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  tabIcon: {
    width: 22,
    height: 22,
    resizeMode: 'contain',
  },
  label: {
    fontSize: 11,
    fontFamily: 'Syne_500Medium',
  },
  gradientOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: GRADIENT_HEIGHT,
  },
})
