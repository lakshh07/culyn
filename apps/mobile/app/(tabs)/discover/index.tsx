import { UpgradeSheet } from '@/components/UpgradeSheet'
import { ErrorState } from '@/components/ui/ErrorState'
import { ContentCardSkeleton } from '@/components/ui/Skeleton'
import { useThemeColors } from '@/constants/useTheme'
import { HomeHeroBlock, HomeSearchBar, HomeTabsRow } from '@/features/home/components/HomeHeader'
import { PlaceCard } from '@/features/places/components/PlaceCard'
import { ProductCard } from '@/features/products/components/ProductCard'
import { RecipeCard } from '@/features/recipes/components/RecipeCard'
import { SearchOverlay } from '@/features/search/components/SearchOverlay'
import { useSearchAnimation } from '@/features/search/hooks/useSearchAnimation'
import { useSearchFilters } from '@/features/search/hooks/useSearchFilters'
import { ApiFilterParams } from '@/features/search/types'
import { UnifiedContentFilters, useUnifiedContent } from '@/hooks/content/useUnifiedContent'
import {
  ContentCategory,
  PlaceListItem,
  ProductListItem,
  RecipeListItem,
} from '@culyn/shared/schemas'
import { Feather } from '@expo/vector-icons'
import * as Haptics from 'expo-haptics'
import { useLocalSearchParams, useRouter } from 'expo-router'
import React, { useCallback, useEffect, useState } from 'react'
import { ActivityIndicator, StatusBar, StyleSheet, Text, View } from 'react-native'
import Animated, {
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

export default function DiscoverScreen() {
  const colors = useThemeColors()
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const { showUpgrade } = useLocalSearchParams<{ showUpgrade?: string }>()
  const [showUpgradeSheet, setShowUpgradeSheet] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<ContentCategory>('RECIPE')
  const [searchOpen, setSearchOpen] = useState(false)
  const [tabsRowHeight, setTabsRowHeight] = useState(82)

  useEffect(() => {
    if (showUpgrade === '1') {
      setShowUpgradeSheet(true)
      router.setParams({ showUpgrade: undefined })
    }
  }, [showUpgrade, router])

  const [appliedFilters, setAppliedFilters] = useState<UnifiedContentFilters | null>(null)
  const { filters, dispatch, clearAll, getApiParams, hasActiveFilters } = useSearchFilters()

  const {
    open: openAnimation,
    close: closeAnimation,
    headerFadeStyle,
    overlayStyle,
    backdropStyle,
    bottomBarStyle,
  } = useSearchAnimation()

  const { items, isLoading, error, refetch, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useUnifiedContent(selectedCategory, appliedFilters)

  const scrollY = useSharedValue(0)
  const heroHeight = useSharedValue(148)

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: event => {
      scrollY.value = event.contentOffset.y
    },
  })

  const tabsTranslateStyle = useAnimatedStyle(() => {
    const offset = Math.max(0, heroHeight.value - scrollY.value)
    return {
      transform: [{ translateY: offset }],
      shadowColor: colors.black,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: offset <= 0 ? 0.08 : 0,
      shadowRadius: 8,
      elevation: offset <= 0 ? 4 : 0,
    }
  })

  const handleSearchOpen = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    setSearchOpen(true)
    openAnimation()
  }, [openAnimation])

  const handleSearchClose = useCallback(() => {
    closeAnimation()
    setTimeout(() => setSearchOpen(false), 300)
  }, [closeAnimation])

  const handleSearch = useCallback(() => {
    const params = getApiParams(selectedCategory) as ApiFilterParams
    setAppliedFilters(
      Object.keys(params).length > 0 ? (params as unknown as UnifiedContentFilters) : null
    )
    handleSearchClose()
  }, [getApiParams, selectedCategory, handleSearchClose])

  const handleClearAll = useCallback(() => {
    clearAll()
    setAppliedFilters(null)
    handleSearchClose()
  }, [clearAll, handleSearchClose])

  const handleCategoryChange = useCallback(
    (category: ContentCategory) => {
      setSelectedCategory(category)
      scrollY.value = 0
    },
    [scrollY]
  )

  const handleEndReached = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage()
    }
  }, [fetchNextPage, hasNextPage, isFetchingNextPage])

  const renderItem = useCallback(
    ({ item }: { item: RecipeListItem | PlaceListItem | ProductListItem }) => {
      if (selectedCategory === 'RECIPE') {
        const recipeItem = item as RecipeListItem
        return (
          <View style={styles.gridItem}>
            <RecipeCard
              item={recipeItem}
              onPress={() =>
                router.push({ pathname: '/recipes/[slug]', params: { slug: recipeItem.slug } })
              }
            />
          </View>
        )
      }

      if (selectedCategory === 'PLACE') {
        const placeItem = item as PlaceListItem
        return (
          <View style={styles.gridItem}>
            <PlaceCard
              id={placeItem.id}
              item={placeItem}
              onPress={() =>
                router.push({ pathname: '/places/[slug]', params: { slug: placeItem.slug } })
              }
            />
          </View>
        )
      }

      if (selectedCategory === 'PRODUCT') {
        const productItem = item as ProductListItem
        return (
          <View style={styles.gridItem}>
            <ProductCard
              item={productItem}
              onPress={() =>
                router.push({ pathname: '/products/[slug]', params: { slug: productItem.slug } })
              }
            />
          </View>
        )
      }

      return null
    },
    [selectedCategory, router]
  )

  const ListEmptyComponent = useCallback(() => {
    if (isLoading) {
      return (
        <View style={styles.contentGrid}>
          {Array.from({ length: 6 }).map((_, i) => (
            <View key={i} style={styles.gridItem}>
              <ContentCardSkeleton />
            </View>
          ))}
        </View>
      )
    }

    if (error) {
      return (
        <ErrorState
          message="Could not load content. Check your connection and try again."
          onRetry={refetch}
        />
      )
    }

    return (
      <View style={styles.emptyContainer}>
        <Feather name="compass" size={44} color={colors.textMuted} />
        <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>Nothing here yet</Text>
        <Text style={[styles.emptyText, { color: colors.textMuted }]}>
          Import your first recipe, place, or product to get started.
        </Text>
      </View>
    )
  }, [isLoading, error, colors, refetch])

  const ListFooterComponent = useCallback(() => {
    if (!isFetchingNextPage) return null
    return (
      <View style={styles.loadingMore}>
        <ActivityIndicator size="small" color={colors.primary} />
      </View>
    )
  }, [isFetchingNextPage, colors.primary])

  return (
    <View style={[styles.container, { backgroundColor: colors.backgroundSecondary }]}>
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />

      <Animated.View
        style={[{ backgroundColor: colors.headerBackground, zIndex: 20 }, headerFadeStyle]}>
        <View style={{ height: insets.top }} />
        <HomeSearchBar
          selectedCategory={selectedCategory}
          onSearchPress={handleSearchOpen}
          onMapPress={() => router.push('/places/map')}
          hasActiveFilters={hasActiveFilters(selectedCategory)}
        />
      </Animated.View>

      <View style={[styles.contentArea]}>
        <Animated.FlatList
          key={selectedCategory}
          onScroll={scrollHandler}
          scrollEventThrottle={16}
          bounces={false}
          overScrollMode="never"
          ListHeaderComponent={
            <Animated.View
              style={[
                headerFadeStyle,
                {
                  marginHorizontal: -12,
                  marginTop: -12,
                  backgroundColor: colors.headerBackground,
                },
              ]}>
              <HomeHeroBlock
                onLayout={e => {
                  heroHeight.value = e.nativeEvent.layout.height
                }}
              />
              <View
                style={{ height: tabsRowHeight + 12, backgroundColor: colors.backgroundSecondary }}
              />
            </Animated.View>
          }
          data={items ?? []}
          numColumns={2}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          onEndReached={handleEndReached}
          onEndReachedThreshold={0.3}
          ListEmptyComponent={ListEmptyComponent}
          ListFooterComponent={ListFooterComponent}
          contentContainerStyle={styles.listContent}
          columnWrapperStyle={styles.columnWrapper}
          showsVerticalScrollIndicator={false}
        />

        <Animated.View
          onLayout={e => setTabsRowHeight(Math.round(e.nativeEvent.layout.height))}
          style={[
            styles.tabsOverlay,
            tabsTranslateStyle,
            headerFadeStyle,
            { backgroundColor: colors.headerBackground },
          ]}>
          <HomeTabsRow
            selectedCategory={selectedCategory}
            onCategoryChange={handleCategoryChange}
          />
        </Animated.View>
      </View>

      <SearchOverlay
        isOpen={searchOpen}
        selectedCategory={selectedCategory}
        onCategoryChange={handleCategoryChange}
        filters={filters}
        dispatch={dispatch}
        onSearch={handleSearch}
        onClose={handleSearchClose}
        onClearAll={handleClearAll}
        overlayStyle={overlayStyle}
        backdropStyle={backdropStyle}
        bottomBarStyle={bottomBarStyle}
      />

      <UpgradeSheet visible={showUpgradeSheet} onClose={() => setShowUpgradeSheet(false)} />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentArea: {
    flex: 1,
  },
  tabsOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 15,
  },
  listContent: {
    paddingHorizontal: 12,
    paddingBottom: 86,
    paddingTop: 12,
  },
  columnWrapper: {
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  contentGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  gridItem: {
    width: '48%',
  },
  emptyContainer: {
    paddingTop: 80,
    alignItems: 'center',
    paddingHorizontal: 40,
    gap: 10,
  },
  emptyTitle: {
    fontSize: 18,
    fontFamily: 'Syne_500Medium',
  },
  emptyText: {
    fontSize: 14,
    fontFamily: 'Syne_400Regular',
    textAlign: 'center',
    lineHeight: 20,
  },
  loadingMore: {
    paddingVertical: 20,
    alignItems: 'center',
  },
})
