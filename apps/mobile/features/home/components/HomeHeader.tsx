import { useThemeColors } from '@/constants/useTheme'
import { ContentCategory } from '@culyn/shared/schemas'
import { Feather } from '@expo/vector-icons'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import {
  Dimensions,
  Image,
  ImageSourcePropType,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native'
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

interface HomeHeaderProps {
  selectedCategory: ContentCategory
  onCategoryChange: (category: ContentCategory) => void
  onSearchPress?: () => void
  onMapPress?: () => void
  headerFadeStyle?: any
  hasActiveFilters?: boolean
}

const TABS: {
  key: ContentCategory
  label: string
  image: ImageSourcePropType
}[] = [
  {
    key: 'RECIPE',
    label: 'Recipes',
    image: require('@/assets/icons/recipes.png'),
  },
  {
    key: 'PLACE',
    label: 'Places',
    image: require('@/assets/icons/places.png'),
  },
  {
    key: 'PRODUCT',
    label: 'Products',
    image: require('@/assets/icons/products.png'),
  },
]

const SEARCH_LABELS: Record<ContentCategory, string> = {
  RECIPE: 'Search recipes',
  PLACE: 'Search places',
  PRODUCT: 'Search products',
}

const SCREEN_WIDTH = Dimensions.get('window').width
const TAB_WIDTH = SCREEN_WIDTH / 3

const AnimatedImage = Animated.createAnimatedComponent(Image)

function TabIcon({ image, isActive }: { image: ImageSourcePropType; isActive: boolean }) {
  const scale = useSharedValue(isActive ? 1.15 : 1)

  useEffect(() => {
    scale.value = withSpring(isActive ? 1.15 : 1, {
      damping: 20,
      stiffness: 250,
    })
  }, [isActive])

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }))

  return <AnimatedImage source={image} style={[styles.tabImage, animatedStyle]} />
}

interface LabelLayout {
  x: number
  width: number
}

export function HomeHeader({
  selectedCategory,
  onCategoryChange,
  onSearchPress,
  onMapPress,
  headerFadeStyle,
  hasActiveFilters,
}: HomeHeaderProps) {
  const colors = useThemeColors()
  const insets = useSafeAreaInsets()
  const underlineX = useSharedValue(0)
  const underlineWidth = useSharedValue(0)
  const tabsRowRef = useRef<View>(null)
  const labelRefs = useRef<Record<string, Text | null>>({})
  const labelLayouts = useRef<Record<string, LabelLayout>>({})
  const [layoutReady, setLayoutReady] = useState(false)

  const measureAllLabels = useCallback(() => {
    const rowNode = tabsRowRef.current
    if (!rowNode) return

    let measured = 0
    TABS.forEach(tab => {
      const labelNode = labelRefs.current[tab.key]
      if (!labelNode) return

      labelNode.measureLayout(rowNode as any, (x, _y, width, _height) => {
        labelLayouts.current[tab.key] = { x, width }
        measured++

        if (measured === TABS.length && !layoutReady) {
          setLayoutReady(true)
          const layout = labelLayouts.current[selectedCategory]
          if (layout) {
            underlineX.value = layout.x
            underlineWidth.value = layout.width
          }
        }
      })
    })
  }, [layoutReady, selectedCategory])

  useEffect(() => {
    if (!layoutReady) return
    const layout = labelLayouts.current[selectedCategory]
    if (!layout) return
    underlineX.value = withTiming(layout.x, { duration: 400 })
    underlineWidth.value = withTiming(layout.width, { duration: 400 })
  }, [selectedCategory, layoutReady])

  const underlineStyle = useAnimatedStyle(() => ({
    left: underlineX.value,
    width: underlineWidth.value,
  }))

  return (
    <Animated.View
      style={[styles.container, { backgroundColor: colors.headerBackground }, headerFadeStyle]}>
      <View style={{ height: insets.top }} />

      {/* Search bar */}
      <View style={styles.searchBarWrapper}>
        <Pressable
          onPress={onSearchPress}
          style={[styles.searchBar, { backgroundColor: colors.searchBarBackground }]}>
          <Feather name="search" size={18} color={colors.searchBarIcon} />
          <Text style={[styles.searchBarText, { color: colors.searchBarText }]}>
            {SEARCH_LABELS[selectedCategory]}
          </Text>
          {hasActiveFilters && (
            <View style={[styles.filterDot, { backgroundColor: colors.primary }]} />
          )}
        </Pressable>
        {selectedCategory === 'PLACE' && onMapPress && (
          <Pressable onPress={onMapPress} style={styles.mapButton} hitSlop={8}>
            <Feather name="map" size={20} color={colors.textPrimary} />
          </Pressable>
        )}
      </View>

      {/* Category tabs */}
      <View ref={tabsRowRef} style={styles.tabsRow} onLayout={measureAllLabels}>
        {TABS.map(tab => {
          const isActive = selectedCategory === tab.key
          return (
            <Pressable key={tab.key} style={styles.tab} onPress={() => onCategoryChange(tab.key)}>
              <TabIcon image={tab.image} isActive={isActive} />
              <Text
                ref={ref => {
                  labelRefs.current[tab.key] = ref
                }}
                style={[
                  styles.tabLabel,
                  {
                    color: isActive ? colors.textPrimary : colors.textMuted,
                    fontFamily: isActive ? 'Syne_600SemiBold' : 'Syne_400Regular',
                  },
                ]}>
                {tab.label}
              </Text>
            </Pressable>
          )
        })}

        {/* Animated underline */}
        <Animated.View
          style={[styles.underline, { backgroundColor: colors.tabIndicator }, underlineStyle]}
        />
      </View>

      {/* Bottom divider */}
      <View style={[styles.divider, { backgroundColor: colors.tabDivider }]} />
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  container: {
    zIndex: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  searchBarWrapper: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    height: 52,
    borderRadius: 28,
    paddingHorizontal: 20,
    gap: 12,
    shadowColor: '#8E8E8E',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 50,
    elevation: 4,
  },
  searchBarText: {
    fontSize: 15,
    fontFamily: 'Syne_400Regular',
  },
  tabsRow: {
    flexDirection: 'row',
    position: 'relative',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    gap: 4,
  },
  tabImage: {
    width: 52,
    height: 52,
    resizeMode: 'contain',
  },
  tabLabel: {
    fontSize: 11,
  },
  underline: {
    position: 'absolute',
    bottom: 0,
    height: 3,
    borderTopLeftRadius: 2.5,
    borderTopRightRadius: 2.5,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
  },
  filterDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 'auto',
  },
  mapButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
})
