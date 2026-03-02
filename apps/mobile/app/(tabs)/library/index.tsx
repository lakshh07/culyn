import { ErrorState } from '@/components/ui/ErrorState'
import { ContentCardSkeleton } from '@/components/ui/Skeleton'
import { useThemeColors } from '@/constants/useTheme'
import { UnifiedContentCard } from '@/features/content/components/UnifiedContentCard'
import { HomeHeader } from '@/features/home/components/HomeHeader'
import { useLibrary } from '@/hooks/library/useLibrary'
import { ContentCategory, UnifiedContentItem } from '@culyn/shared/schemas'
import { Feather } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import React, { useCallback, useState } from 'react'
import { FlatList, StyleSheet, Text, View } from 'react-native'

export default function LibraryScreen() {
  const colors = useThemeColors()
  const router = useRouter()
  const [selectedCategory, setSelectedCategory] = useState<ContentCategory>('RECIPE')

  const { items, isLoading, error, refetch } = useLibrary(selectedCategory)

  const handleCardPress = useCallback(
    (category: ContentCategory, slug: string) => {
      if (category === 'RECIPE') {
        router.push({ pathname: '/recipes/[slug]', params: { slug } })
      } else if (category === 'PLACE') {
        router.push({ pathname: '/places/[slug]', params: { slug } })
      } else if (category === 'PRODUCT') {
        router.push({ pathname: '/products/[slug]', params: { slug } })
      }
    },
    [router]
  )

  const renderItem = useCallback(
    ({ item }: { item: UnifiedContentItem }) => (
      <View style={styles.gridItem}>
        <UnifiedContentCard
          id={item.id}
          title={item.title}
          imageUrl={item.imageUrl}
          category={item.category}
          cookTime={item.cookTime}
          city={item.city}
          brand={item.brand}
          price={item.price}
          onPress={() => handleCardPress(item.category, item.slug)}
        />
      </View>
    ),
    [handleCardPress]
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
          message="Could not load your library. Check your connection and try again."
          onRetry={refetch}
        />
      )
    }

    return (
      <View style={styles.emptyContainer}>
        <Feather name="bookmark" size={44} color={colors.textMuted} />
        <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>No saved items yet</Text>
        <Text style={[styles.emptyText, { color: colors.textMuted }]}>
          Save recipes, places, or products to see them here.
        </Text>
      </View>
    )
  }, [isLoading, error, colors, refetch])

  return (
    <View style={[styles.container, { backgroundColor: colors.backgroundSecondary }]}>
      <HomeHeader
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        onMapPress={() => router.push('/places/map')}
      />
      <FlatList
        key={selectedCategory}
        data={items ?? []}
        numColumns={2}
        renderItem={renderItem}
        keyExtractor={item => `${item.category}-${item.id}`}
        ListEmptyComponent={ListEmptyComponent}
        contentContainerStyle={styles.listContent}
        columnWrapperStyle={styles.columnWrapper}
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
    width: '48.5%',
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
})
