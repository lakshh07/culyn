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
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { ActivityIndicator, FlatList, StatusBar, StyleSheet, Text, View } from 'react-native'
import Animated from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

type ContentItem = RecipeListItem | PlaceListItem | ProductListItem

type ListRow =
  | { type: 'tabs'; id: '__tabs__' }
  | { type: 'row'; id: string; items: ContentItem[] }
  | { type: 'skeleton'; id: string }
  | { type: 'empty'; id: '__empty__' }
  | { type: 'error'; id: '__error__' }

export default function DiscoverScreen() {
  const colors = useThemeColors()
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const { showUpgrade } = useLocalSearchParams<{ showUpgrade?: string }>()
  const [showUpgradeSheet, setShowUpgradeSheet] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<ContentCategory>('RECIPE')
  const [searchOpen, setSearchOpen] = useState(false)

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

  const handleCategoryChange = useCallback((category: ContentCategory) => {
    setSelectedCategory(category)
  }, [])

  const handleEndReached = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage()
    }
  }, [fetchNextPage, hasNextPage, isFetchingNextPage])

  const listData = useMemo((): ListRow[] => {
    const rows: ListRow[] = [{ type: 'tabs', id: '__tabs__' }]

    if (isLoading) {
      for (let i = 0; i < 6; i++) {
        rows.push({ type: 'skeleton', id: `skeleton-${i}` })
      }
    } else if (error) {
      rows.push({ type: 'error', id: '__error__' })
    } else if (!items || items.length === 0) {
      rows.push({ type: 'empty', id: '__empty__' })
    } else {
      for (let i = 0; i < items.length; i += 2) {
        rows.push({
          type: 'row',
          id: items[i].id,
          items: [items[i], items[i + 1]].filter(Boolean),
        })
      }
    }

    return rows
  }, [isLoading, error, items])

  const renderCardForCategory = useCallback(
    (item: ContentItem) => {
      if (selectedCategory === 'RECIPE') {
        const r = item as RecipeListItem
        return (
          <RecipeCard
            item={r}
            onPress={() => router.push({ pathname: '/recipes/[slug]', params: { slug: r.slug } })}
          />
        )
      }
      if (selectedCategory === 'PLACE') {
        const p = item as PlaceListItem
        return (
          <PlaceCard
            id={p.id}
            item={p}
            onPress={() => router.push({ pathname: '/places/[slug]', params: { slug: p.slug } })}
          />
        )
      }
      const p = item as ProductListItem
      return (
        <ProductCard
          item={p}
          onPress={() => router.push({ pathname: '/products/[slug]', params: { slug: p.slug } })}
        />
      )
    },
    [selectedCategory, router]
  )

  const renderItem = useCallback(
    ({ item }: { item: ListRow }) => {
      if (item.type === 'tabs') {
        return (
          <View style={{ backgroundColor: colors.headerBackground }}>
            <HomeTabsRow
              selectedCategory={selectedCategory}
              onCategoryChange={handleCategoryChange}
            />
          </View>
        )
      }

      if (item.type === 'skeleton') {
        return (
          <View style={styles.row}>
            <View style={styles.gridItem}>
              <ContentCardSkeleton />
            </View>
            <View style={styles.gridItem}>
              <ContentCardSkeleton />
            </View>
          </View>
        )
      }

      if (item.type === 'error') {
        return (
          <ErrorState
            message="Could not load content. Check your connection and try again."
            onRetry={refetch}
          />
        )
      }

      if (item.type === 'empty') {
        return (
          <View style={styles.emptyContainer}>
            <Feather name="compass" size={44} color={colors.textMuted} />
            <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>Nothing here yet</Text>
            <Text style={[styles.emptyText, { color: colors.textMuted }]}>
              Import your first recipe, place, or product to get started.
            </Text>
          </View>
        )
      }

      return (
        <View style={styles.row}>
          {item.items.map(c => (
            <View key={c.id} style={styles.gridItem}>
              {renderCardForCategory(c)}
            </View>
          ))}
        </View>
      )
    },
    [selectedCategory, handleCategoryChange, renderCardForCategory, colors, refetch]
  )

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

      <Animated.View style={[{ flex: 1 }, headerFadeStyle]}>
        <FlatList
          key={selectedCategory}
          bounces={false}
          overScrollMode="never"
          ListHeaderComponent={<HomeHeroBlock />}
          data={listData}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          stickyHeaderIndices={[1]}
          onEndReached={handleEndReached}
          onEndReachedThreshold={0.3}
          ListFooterComponent={ListFooterComponent}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      </Animated.View>

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
  listContent: {
    paddingBottom: 86,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    marginTop: 12,
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
