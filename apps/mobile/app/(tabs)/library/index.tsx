import { ErrorState } from '@/components/ui/ErrorState'
import { ContentCardSkeleton } from '@/components/ui/Skeleton'
import { useThemeColors } from '@/constants/useTheme'
import { usePendingImport } from '@/contexts/PendingImportContext'
import { HomeSearchBar, HomeTabsRow } from '@/features/home/components/HomeHeader'
import { PlaceCard } from '@/features/places/components/PlaceCard'
import { ProductCard } from '@/features/products/components/ProductCard'
import { RecipeCard } from '@/features/recipes/components/RecipeCard'
import { useLibrary } from '@/hooks/library/useLibrary'
import { useJobPolling } from '@/hooks/useJobPolling'
import {
  ContentCategory,
  PlaceListItem,
  ProductListItem,
  RecipeListItem,
  UnifiedContentItem,
} from '@culyn/shared/schemas'
import { Feather } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Animated, FlatList, StatusBar, StyleSheet, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

const BANNER_WIDTH = 280
const BAR_HIGHLIGHT = 80

function PendingImportBanner() {
  const colors = useThemeColors()
  const anim = useRef(new Animated.Value(0)).current

  useEffect(() => {
    Animated.loop(
      Animated.timing(anim, { toValue: 1, duration: 1200, useNativeDriver: true })
    ).start()
  }, [anim])

  const translateX = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [-BAR_HIGHLIGHT, BANNER_WIDTH],
  })

  return (
    <View style={[styles.banner, { backgroundColor: colors.headerBackground }]}>
      <View style={styles.bannerTextRow}>
        <Text style={[styles.bannerTitle, { color: colors.textPrimary }]}>
          We&apos;re cooking it
        </Text>
        <Text style={[styles.bannerSubtitle, { color: colors.textSecondary }]}>
          Your content will be ready in a few minutes
        </Text>
      </View>
      <View style={[styles.barTrack, { backgroundColor: colors.border }]}>
        <Animated.View
          style={[
            styles.barHighlight,
            { backgroundColor: colors.primary, transform: [{ translateX }] },
          ]}
        />
      </View>
    </View>
  )
}

type ListRow =
  | { type: 'tabs'; id: '__tabs__' }
  | { type: 'row'; id: string; items: UnifiedContentItem[] }
  | { type: 'skeleton'; id: string }
  | { type: 'empty'; id: '__empty__' }
  | { type: 'error'; id: '__error__' }

function toRecipeCard(item: UnifiedContentItem): RecipeListItem {
  return {
    id: item.id,
    slug: item.slug,
    title: item.title ?? '',
    shortTitle: item.title ?? '',
    imageUrl: item.imageUrl,
    cookTime: item.cookTime ?? null,
    calories: item.calories ?? null,
    tags: [],
    RecipeIngredient: [],
    RecipeFavorite: item.isFavorited ? [{ id: 'fav' }] : [],
    _count: { RecipeFavorite: 0 },
  } as unknown as RecipeListItem
}

function toPlaceCard(item: UnifiedContentItem): PlaceListItem {
  return {
    id: item.id,
    slug: item.slug,
    name: item.title,
    shortName: item.title,
    type: (item.placeType ?? 'RESTAURANT') as PlaceListItem['type'],
    city: item.city ?? null,
    imageUrl: item.imageUrl,
    cuisine: null,
    priceRange: null,
    rating: null,
    latitude: null,
    longitude: null,
    tags: [],
    PlaceFavorite: item.isFavorited ? [{ id: 'fav' }] : [],
    _count: { PlaceFavorite: 0 },
  } as unknown as PlaceListItem
}

function toProductCard(item: UnifiedContentItem): ProductListItem {
  return {
    id: item.id,
    slug: item.slug,
    name: item.title,
    shortName: item.title,
    category: 'OTHER' as ProductListItem['category'],
    brand: item.brand ?? null,
    price: item.price ?? null,
    currency: null,
    imageUrl: item.imageUrl,
    tags: [],
    ProductFavorite: item.isFavorited ? [{ id: 'fav' }] : [],
    _count: { ProductFavorite: 0 },
  } as unknown as ProductListItem
}

export default function LibraryScreen() {
  const colors = useThemeColors()
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const [selectedCategory, setSelectedCategory] = useState<ContentCategory>('RECIPE')

  const { pendingJobId, setPendingJobId } = usePendingImport()
  const { result: jobResult, error: jobError } = useJobPolling(pendingJobId ?? undefined)

  const { items, isLoading, error, refetch } = useLibrary(selectedCategory)

  // When job completes or fails, clear the pending state
  useEffect(() => {
    if (jobResult?.success) {
      setPendingJobId(null)
      refetch()
    }
  }, [jobResult, setPendingJobId, refetch])

  useEffect(() => {
    if (jobError) {
      setPendingJobId(null)
    }
  }, [jobError, setPendingJobId])

  const handleCategoryChange = useCallback((category: ContentCategory) => {
    setSelectedCategory(category)
  }, [])

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
          items: [items[i], items[i + 1]].filter(Boolean) as UnifiedContentItem[],
        })
      }
    }

    return rows
  }, [isLoading, error, items])

  const renderCardForCategory = useCallback(
    (item: UnifiedContentItem) => {
      if (selectedCategory === 'RECIPE') {
        const r = toRecipeCard(item)
        return (
          <RecipeCard
            item={r}
            onPress={() =>
              router.push({ pathname: '/recipes/[slug]', params: { slug: item.slug } })
            }
          />
        )
      }
      if (selectedCategory === 'PLACE') {
        const p = toPlaceCard(item)
        return (
          <PlaceCard
            id={item.id}
            item={p}
            onPress={() => router.push({ pathname: '/places/[slug]', params: { slug: item.slug } })}
          />
        )
      }
      const p = toProductCard(item)
      return (
        <ProductCard
          item={p}
          onPress={() => router.push({ pathname: '/products/[slug]', params: { slug: item.slug } })}
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
              showIcons={false}
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
            message="Could not load your library. Check your connection and try again."
            onRetry={refetch}
          />
        )
      }

      if (item.type === 'empty') {
        return (
          <View style={styles.emptyContainer}>
            <Feather name="bookmark" size={44} color={colors.textMuted} />
            <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>
              No saved items yet
            </Text>
            <Text style={[styles.emptyText, { color: colors.textMuted }]}>
              Save recipes, places, or products to see them here.
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

  return (
    <View style={[styles.container, { backgroundColor: colors.backgroundSecondary }]}>
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />

      <View style={{ backgroundColor: colors.headerBackground, zIndex: 10 }}>
        <View style={{ height: insets.top }} />
        <HomeSearchBar
          selectedCategory={selectedCategory}
          onMapPress={() => router.push('/places/map')}
          hasActiveFilters={false}
        />
      </View>

      {pendingJobId && <PendingImportBanner />}

      <FlatList
        key={selectedCategory}
        bounces={false}
        overScrollMode="never"
        data={listData}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        stickyHeaderIndices={[0]}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
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
  banner: {
    paddingHorizontal: 34,
    paddingVertical: 28,
    gap: 12,
  },
  bannerTextRow: {
    gap: 4,
  },
  bannerTitle: {
    fontSize: 17,
    fontFamily: 'EBGaramond_500Medium',
  },
  bannerSubtitle: {
    fontSize: 13,
    fontFamily: 'Syne_400Regular',
    lineHeight: 18,
  },
  barTrack: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
    width: BANNER_WIDTH,
  },
  barHighlight: {
    position: 'absolute',
    height: '100%',
    width: BAR_HIGHLIGHT,
    borderRadius: 2,
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
