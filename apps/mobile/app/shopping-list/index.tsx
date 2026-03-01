import { useThemeColors } from '@/constants/useTheme'
import { useShoppingList } from '@/hooks/shopping-list/useShoppingList'
import { getIngredientImageUrl } from '@culyn/shared/lib'
import { ListItem } from '@culyn/shared/schemas'
import React from 'react'
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

const INGREDIENT_IMAGE_BASE_URL = `${process.env.EXPO_PUBLIC_AWS_PUBLIC_URL_BASE}`

const getInitials = (name: string): string => {
  const words = name.trim().split(/\s+/)
  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase()
  }
  return name.substring(0, 2).toUpperCase()
}

// Simple ingredient count icon (connected circles/atoms)
const IngredientCountIcon = React.memo(({ size = 16, color }: { size?: number; color: string }) => {
  return (
    <View style={{ width: size, height: size, position: 'relative' }}>
      <View
        style={{
          position: 'absolute',
          width: size * 0.4,
          height: size * 0.4,
          borderRadius: size * 0.2,
          backgroundColor: color,
          top: 0,
          left: 0,
        }}
      />
      <View
        style={{
          position: 'absolute',
          width: size * 0.4,
          height: size * 0.4,
          borderRadius: size * 0.2,
          backgroundColor: color,
          top: 0,
          right: 0,
        }}
      />
      <View
        style={{
          position: 'absolute',
          width: size * 0.4,
          height: size * 0.4,
          borderRadius: size * 0.2,
          backgroundColor: color,
          bottom: 0,
          left: size * 0.3,
        }}
      />
    </View>
  )
})

IngredientCountIcon.displayName = 'IngredientCountIcon'

export default function ShoppingListScreen() {
  const colors = useThemeColors()
  const { shoppingList, isLoading } = useShoppingList()

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: colors.backgroundSecondary }]}
      edges={['left', 'right']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={[styles.subtitle, { color: colors.textMuted }]}>
          Your shopping list from saved recipes.
        </Text>

        {isLoading ? (
          <Text style={[styles.loadingText, { color: colors.textMuted }]}>
            Loading shopping list...
          </Text>
        ) : shoppingList && shoppingList.length > 0 ? (
          <View style={styles.recipesList}>
            {shoppingList.map(list => (
              <View
                key={list.id}
                style={[
                  styles.recipeCard,
                  {
                    backgroundColor: colors.background,
                    borderColor: colors.border,
                  },
                ]}>
                {/* Header */}
                <View style={styles.cardHeader}>
                  <View style={styles.cardHeaderLeft}>
                    <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>
                      {list.name}
                    </Text>
                  </View>
                  <View style={styles.ingredientCountContainer}>
                    <Text style={[styles.ingredientCountText, { color: colors.textMuted }]}>
                      {list.items.length} {list.items.length === 1 ? 'item' : 'items'}
                    </Text>
                  </View>
                </View>

                {/* Items List */}
                {list.items.length > 0 ? (
                  <View style={styles.ingredientsList}>
                    {list.items.map(item => (
                      <IngredientCard key={item.id} ingredient={item} colors={colors} />
                    ))}
                  </View>
                ) : (
                  <Text style={[styles.emptyIngredientsText, { color: colors.textMuted }]}>
                    No items in this list.
                  </Text>
                )}
              </View>
            ))}
          </View>
        ) : (
          <View style={[styles.emptyState, { borderColor: colors.border }]}>
            <Text style={[styles.emptyStateText, { color: colors.textMuted }]}>
              No shopping lists yet. Add recipes to create a list.
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}

const IngredientCard = React.memo(
  ({ ingredient, colors }: { ingredient: ListItem; colors: ReturnType<typeof useThemeColors> }) => {
    const imageUrl = getIngredientImageUrl(ingredient.name, INGREDIENT_IMAGE_BASE_URL)

    return (
      <View style={styles.ingredientRow}>
        <View style={styles.ingredientImageContainer}>
          {imageUrl ? (
            <Image source={{ uri: imageUrl }} style={styles.ingredientImage} resizeMode="cover" />
          ) : (
            <View style={[styles.ingredientImagePlaceholder, { backgroundColor: colors.border }]}>
              <Text style={[styles.ingredientImageInitials, { color: colors.textMuted }]}>
                {getInitials(ingredient.name)}
              </Text>
            </View>
          )}
        </View>
        <View style={styles.ingredientInfo}>
          <Text style={[styles.ingredientName, { color: colors.textPrimary }]}>
            {ingredient.name}
          </Text>
          <Text style={[styles.ingredientQuantity, { color: colors.textMuted }]}>
            {ingredient.amount} {ingredient.unit || ''}
          </Text>
        </View>
        {/* TODO: Add checkbox to mark as bought */}
      </View>
    )
  }
)

IngredientCard.displayName = 'IngredientCard'

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 32,
    gap: 16,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: 'Poppins_400Regular',
  },
  recipesList: {
    gap: 16,
    marginTop: 8,
  },
  recipeCard: {
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.02,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 20,
  },
  cardHeaderLeft: {
    flex: 1,
    marginRight: 12,
  },
  cardTitle: {
    fontSize: 16,
    lineHeight: 20,
    fontFamily: 'Syne_500Medium',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 13,
    lineHeight: 18,
    fontFamily: 'Poppins_400Regular',
  },
  ingredientCountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  ingredientCountText: {
    fontSize: 12,
    lineHeight: 16,
    fontFamily: 'Poppins_400Regular',
  },
  ingredientsList: {
    marginTop: 20,
    gap: 16,
  },
  ingredientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  ingredientImageContainer: {
    width: 40,
    height: 40,
    aspectRatio: 1,
    position: 'relative',
    borderRadius: 12,
    overflow: 'hidden',
  },
  ingredientImage: {
    width: '100%',
    height: '100%',
  },
  ingredientImagePlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F3F0',
  },
  ingredientImageInitials: {
    fontSize: 16,
    fontFamily: 'Syne_400Regular',
    color: '#9CA3AF',
  },
  ingredientInfo: {
    flex: 1,
  },
  ingredientName: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: 'Poppins_500Medium',
    marginBottom: 2,
    textTransform: 'capitalize',
  },
  ingredientQuantity: {
    fontSize: 12,
    lineHeight: 16,
    fontFamily: 'Poppins_400Regular',
  },
  emptyState: {
    marginTop: 10,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: 'Poppins_400Regular',
  },
  loadingText: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: 'Poppins_400Regular',
    textAlign: 'center',
    padding: 16,
  },
  emptyIngredientsText: {
    fontSize: 13,
    lineHeight: 18,
    fontFamily: 'Poppins_400Regular',
    marginTop: 8,
  },
})
