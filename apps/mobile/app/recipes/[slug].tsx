import { useThemeColors } from '@/constants/useTheme'
import { useRecipeBySlug } from '@/hooks/recipes/useRecipeBySlug'
import { useRecipeFavorite } from '@/hooks/recipes/useRecipeFavorite'
import { useAddToShoppingList } from '@/hooks/shopping-list/useAddToShoppingList'
import { getIngredientImageUrl } from '@culyn/shared/lib'
import { DIFFICULTY_MAP, scaleIngredientQuantity } from '@culyn/shared/utils'
import { Feather } from '@expo/vector-icons'
import * as Haptics from 'expo-haptics'
import { LinearGradient } from 'expo-linear-gradient'
import { useLocalSearchParams, useRouter } from 'expo-router'
import React, { useMemo, useRef, useState } from 'react'
import {
  Dimensions,
  Image,
  Linking,
  Pressable,
  Animated as RNAnimated,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native'
import Animated, { FadeIn, FadeInLeft, FadeInUp } from 'react-native-reanimated'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'

const INGREDIENT_IMAGE_BASE_URL = `${process.env.EXPO_PUBLIC_AWS_PUBLIC_URL_BASE}`

const getInitials = (name: string): string => {
  const words = name.trim().split(/\s+/)
  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase()
  }
  return name.substring(0, 2).toUpperCase()
}

export default function RecipeDetailScreen() {
  const colors = useThemeColors()
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const { slug } = useLocalSearchParams<{ slug: string }>()
  const screenWidth = Dimensions.get('window').width
  const cardGap = 8
  const horizontalPadding = 22 * 2 // paddingHorizontal from contentContainer
  const availableWidth = screenWidth - horizontalPadding
  const cardWidth = (availableWidth - cardGap * 3) / 4 // 4 cards with 3 gaps

  const { recipe } = useRecipeBySlug(slug)
  const { addFavorite, removeFavorite } = useRecipeFavorite(slug)
  const { addToList } = useAddToShoppingList()

  const isFavorited = (recipe?.RecipeFavorite?.length ?? 0) > 0
  const favoriteId = recipe?.RecipeFavorite?.[0]?.id

  const [addedIngredientIds, setAddedIngredientIds] = useState<Set<string>>(new Set())

  const handleToggleFavorite = () => {
    if (isFavorited && favoriteId) removeFavorite.mutate(favoriteId)
    else addFavorite.mutate()
  }

  const handleToggleIngredient = (ingredientId: string) => {
    if (addedIngredientIds.has(ingredientId)) {
      setAddedIngredientIds(prev => {
        const next = new Set(prev)
        next.delete(ingredientId)
        return next
      })
    } else {
      addToList.mutate({ recipeSlug: slug, ingredientIds: [ingredientId] })
      setAddedIngredientIds(prev => new Set(prev).add(ingredientId))
    }
  }

  const backScale = useRef(new RNAnimated.Value(1)).current
  const heartScale = useRef(new RNAnimated.Value(1)).current
  const ingredientScales = useRef(new Map<string, RNAnimated.Value>()).current

  const getIngredientScale = (id: string) => {
    if (!ingredientScales.has(id)) ingredientScales.set(id, new RNAnimated.Value(1))
    return ingredientScales.get(id)!
  }

  const makePressHandlers = (animValue: RNAnimated.Value, onPress: () => void) => ({
    onPressIn: () =>
      RNAnimated.spring(animValue, {
        toValue: 1.15,
        useNativeDriver: true,
        speed: 20,
        bounciness: 6,
      }).start(),
    onPressOut: () =>
      RNAnimated.spring(animValue, {
        toValue: 1,
        useNativeDriver: true,
        speed: 20,
        bounciness: 6,
      }).start(),
    onPress: () => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
      onPress()
    },
  })

  const originalServings = recipe?.servings || 2
  const [servings, setServings] = useState(originalServings)

  const handleOpenLink = async () => {
    if (!recipe?.sourceUrl) return
    const supported = await Linking.canOpenURL(recipe?.sourceUrl)
    if (supported) {
      await Linking.openURL(recipe?.sourceUrl)
    }
  }

  const handleOpenFSSAIGuidelines = async () => {
    const fssaiUrl = 'https://www.fssai.gov.in/'
    const supported = await Linking.canOpenURL(fssaiUrl)
    if (supported) {
      await Linking.openURL(fssaiUrl)
    }
  }

  React.useEffect(() => {
    if (recipe?.servings && servings === originalServings) {
      setServings(recipe.servings)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recipe?.servings])

  const scale = useMemo(() => servings / originalServings, [servings, originalServings])

  const scaledIngredients = useMemo(() => {
    if (!recipe?.RecipeIngredient) return []
    return recipe.RecipeIngredient.map(ri => ({
      ...ri,
      scaledAmount: scaleIngredientQuantity(ri.amount, scale),
    }))
  }, [recipe?.RecipeIngredient, scale])

  const scaledCookingSteps = useMemo(() => {
    if (!recipe?.cookingSteps) return []
    return recipe.cookingSteps.map(step => ({
      ...step,
      ingredients_used: step.ingredients_used.map(ingredient => ({
        ...ingredient,
        scaledQuantity: scaleIngredientQuantity(ingredient.quantity, scale),
      })),
    }))
  }, [recipe?.cookingSteps, scale])

  const nutritionalData = useMemo(
    () => ({
      caloriesPercent: recipe?.calories ? Math.round((Number(recipe.calories) / 2000) * 100) : 0,
      proteinPercent: recipe?.protein ? Math.round((Number(recipe.protein) / 50) * 100) : 0,
      carbsPercent: recipe?.carbs ? Math.round((Number(recipe.carbs) / 275) * 100) : 0,
      fatPercent: recipe?.fat ? Math.round((Number(recipe.fat) / 75) * 100) : 0,
    }),
    [recipe?.calories, recipe?.protein, recipe?.carbs, recipe?.fat]
  )

  if (!recipe) return null

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: colors.background }]}
      edges={['left', 'right']}>
      <LinearGradient
        colors={[colors.gradientStart, colors.gradientEnd]}
        start={{ x: 0, y: 1 }}
        end={{ x: 0, y: 0 }}
        pointerEvents="none"
        style={[styles.gradientOverlay2]}
      />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Image source={{ uri: recipe?.imageUrl ?? '' }} style={styles.heroImage} />

        <RNAnimated.View
          style={[
            styles.scrollableButtonContainer,
            { top: insets.top + 65, transform: [{ scale: heartScale }] },
          ]}>
          <Pressable {...makePressHandlers(heartScale, handleToggleFavorite)} hitSlop={8}>
            <View style={[styles.heartButton, { backgroundColor: colors.white }]}>
              <Image
                source={
                  isFavorited
                    ? require('@/assets/icons/heart-fill.png')
                    : require('@/assets/icons/heart.png')
                }
                style={styles.heartIcon}
                resizeMode="contain"
              />
            </View>
          </Pressable>
        </RNAnimated.View>

        <View style={styles.contentContainer}>
          <View style={styles.recipeInfoContainer}>
            <Text style={[styles.title, { color: colors.textPrimary }]}>{recipe.title}</Text>

            <View style={styles.metaRow}>
              <Feather
                name="instagram"
                size={14}
                color={colors.textMuted}
                style={styles.metaIcon}
              />
              <Text style={[styles.metaLink, { color: colors.textSecondary }]}>
                By {recipe.sourceName}
              </Text>
              {recipe.sourceUrl ? (
                <>
                  <Text style={[styles.metaSeparator, { color: colors.textSecondary }]}>•</Text>
                  <Pressable onPress={handleOpenLink} hitSlop={8}>
                    <Text style={[styles.link, { color: colors.textSecondary }]}>
                      Original Recipe Link
                    </Text>
                  </Pressable>
                </>
              ) : null}
            </View>

            <Text style={[styles.description, { color: colors.textSecondary }]}>
              {recipe.description}
            </Text>
          </View>

          <View style={styles.section}>
            <View style={[styles.detailGrid, { borderColor: colors.border }]}>
              {(() => {
                const details = [
                  {
                    label: 'Skill Level',
                    value: recipe.difficulty ? DIFFICULTY_MAP[recipe.difficulty] : 'Easy',
                  },
                  {
                    label: 'Cook Time',
                    value: recipe.cookTime ? `${recipe.cookTime} mins` : 'N/A',
                  },
                  { label: 'Servings', value: recipe.servings },
                  {
                    label: 'Serving Size',
                    value: recipe.servings ? `${Math.ceil(2)} cups` : 'N/A',
                  },
                  {
                    label: 'Est. Calories',
                    value: recipe.calories ? `${recipe.calories} kcal` : 'N/A',
                    percentage: nutritionalData.caloriesPercent,
                  },
                  {
                    label: 'Carbs',
                    value: recipe.carbs ? `${Number(recipe.carbs).toFixed(1)} g` : 'N/A',
                    percentage: nutritionalData.carbsPercent,
                  },
                  {
                    label: 'Protein',
                    value: recipe.protein ? `${Number(recipe.protein).toFixed(0)} g` : 'N/A',
                    percentage: nutritionalData.proteinPercent,
                  },
                  {
                    label: 'Fats',
                    value: recipe.fat ? `${Number(recipe.fat).toFixed(1)} g` : 'N/A',
                    percentage: nutritionalData.fatPercent,
                  },
                ]

                // Chunk details into rows of 2
                const rows = []
                for (let i = 0; i < details.length; i += 2) {
                  rows.push(details.slice(i, i + 2))
                }

                return rows.map((row, rowIndex) => (
                  <View key={`row-${rowIndex}`} style={styles.detailRow}>
                    {row.map((item, itemIndex) => {
                      const isLastInRow = itemIndex === row.length - 1
                      const isLastRow = rowIndex === rows.length - 1
                      return (
                        <View
                          key={item.label}
                          style={[
                            styles.detailCard,
                            {
                              borderRightWidth: isLastInRow ? 0 : 1,
                              borderBottomWidth: isLastRow ? 0 : 1,
                              borderColor: colors.border,
                              backgroundColor: colors.background,
                            },
                          ]}>
                          <Text style={[styles.detailLabel, { color: colors.textMuted }]}>
                            {item.label}
                          </Text>
                          <Text style={[styles.detailValue, { color: colors.textPrimary }]}>
                            {item.value}
                          </Text>
                        </View>
                      )
                    })}
                  </View>
                ))
              })()}
            </View>

            <View style={styles.detailNoteContainer}>
              <Pressable onPress={handleOpenFSSAIGuidelines} hitSlop={8}>
                <Text style={[styles.detailNote, { color: colors.textMuted }]}>
                  *Percent daily values are based on a 2,000 calorie diet as per FSSAI guidelines.
                </Text>
              </Pressable>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Ingredients</Text>
            <View style={styles.ingredientsGrid}>
              {scaledIngredients.map((ri, index) => {
                const imageUrl = getIngredientImageUrl(
                  ri.ingredient.name,
                  INGREDIENT_IMAGE_BASE_URL
                )

                return (
                  <Animated.View
                    key={ri.ingredient.slug}
                    entering={FadeInUp.delay(150 + index * 60)}
                    style={[
                      styles.ingredientCard,
                      {
                        width: cardWidth,
                        borderColor: colors.border,
                      },
                    ]}>
                    <View style={styles.ingredientImageWrapper}>
                      <View style={styles.ingredientImageContainer}>
                        {imageUrl ? (
                          <Image
                            source={{ uri: imageUrl }}
                            style={styles.ingredientImage}
                            resizeMode="cover"
                          />
                        ) : (
                          <View
                            style={[
                              styles.ingredientImagePlaceholder,
                              { backgroundColor: colors.surface },
                            ]}>
                            <Text
                              style={[styles.ingredientImageInitials, { color: colors.textMuted }]}>
                              {getInitials(ri.ingredient.name)}
                            </Text>
                          </View>
                        )}
                      </View>
                      <RNAnimated.View
                        style={[
                          styles.addButton,
                          {
                            backgroundColor: addedIngredientIds.has(ri.ingredient.id)
                              ? colors.success
                              : colors.white,
                          },
                          { transform: [{ scale: getIngredientScale(ri.ingredient.id) }] },
                        ]}>
                        <Pressable
                          style={styles.addButtonPressable}
                          {...makePressHandlers(getIngredientScale(ri.ingredient.id), () =>
                            handleToggleIngredient(ri.ingredient.id)
                          )}
                          hitSlop={8}>
                          <Feather
                            name={addedIngredientIds.has(ri.ingredient.id) ? 'check' : 'plus'}
                            size={14}
                            color={
                              addedIngredientIds.has(ri.ingredient.id) ? colors.white : colors.black
                            }
                          />
                        </Pressable>
                      </RNAnimated.View>
                    </View>
                    <View style={styles.ingredientTextContainer}>
                      <Text
                        style={[styles.ingredientName, { color: colors.textPrimary }]}
                        numberOfLines={2}>
                        {ri.ingredient.name}
                      </Text>
                      <Text style={[styles.ingredientMeta, { color: colors.textMuted }]}>
                        {ri.scaledAmount}
                        {ri.unit ? ` ${ri.unit}` : ''}
                      </Text>
                    </View>
                  </Animated.View>
                )
              })}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Cooking Steps</Text>
            <View style={styles.stepsList}>
              {scaledCookingSteps.map((step, index) => (
                <React.Fragment key={step.step_number}>
                  {index > 0 && (
                    <View style={[styles.stepDivider, { borderColor: colors.border }]} />
                  )}
                  <Animated.View
                    entering={FadeInLeft.delay(200 + index * 90)}
                    style={styles.stepContainer}>
                    <View style={styles.stepContent}>
                      <Text style={[styles.stepNumber, { color: colors.textMuted }]}>
                        {step.step_number.toString().padStart(2, '0')}
                      </Text>
                      <Text style={[styles.stepTitle, { color: colors.textPrimary }]}>
                        {step.step_description}
                      </Text>
                    </View>
                    {step.ingredients_used && step.ingredients_used.length > 0 ? (
                      <Animated.View
                        entering={FadeIn.delay(220 + index * 90)}
                        style={styles.stepIngredientsContainer}>
                        <ScrollView
                          horizontal
                          showsHorizontalScrollIndicator={false}
                          contentContainerStyle={styles.stepIngredients}>
                          {step.ingredients_used.map(ing => (
                            <View
                              key={`${step.step_number}-${ing.name}`}
                              style={[
                                styles.stepIngredientChip,
                                { backgroundColor: colors.backgroundSecondary },
                              ]}>
                              <Text
                                style={[styles.stepIngredientName, { color: colors.textPrimary }]}>
                                {ing.name}
                              </Text>
                              <Text
                                style={[styles.stepIngredientMeta, { color: colors.textMuted }]}>
                                {ing.scaledQuantity}
                              </Text>
                            </View>
                          ))}
                        </ScrollView>
                      </Animated.View>
                    ) : null}
                  </Animated.View>
                </React.Fragment>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>
      <RNAnimated.View
        style={[styles.buttonContainer, { top: insets.top, transform: [{ scale: backScale }] }]}>
        <Pressable {...makePressHandlers(backScale, () => router.back())} hitSlop={8}>
          <View style={styles.heartButton}>
            <Image
              source={require('@/assets/icons/back.png')}
              style={styles.heartIcon}
              resizeMode="contain"
            />
          </View>
        </Pressable>
      </RNAnimated.View>

      {/* TODO: Add cooking button and quantity buttons */}
      {/* <GlassView style={[styles.footer, { backgroundColor: colors.background }]}>
        <View style={styles.footerLeft}>
          <Pressable
            style={styles.quantityButton}
            onPress={() => setServings(Math.max(1, servings - 1))}
            hitSlop={8}>
            <Feather name="minus" size={16} color={colors.textMuted} />
          </Pressable>
          <Text style={[styles.quantityText, { color: colors.textPrimary }]}>
            Cooking for {servings}
          </Text>
          <Pressable
            style={styles.quantityButton}
            onPress={() => setServings(servings + 1)}
            hitSlop={8}>
            <Feather name="plus" size={16} color={colors.textMuted} />
          </Pressable>
        </View>

        <View style={styles.footerRight}>
          <Pressable hitSlop={8}>
            <LinearGradient
              colors={[colors.primaryGradientStart, colors.primaryGradientEnd]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.cookButton}>
              <ChefHatIcon width={20} height={20} color={colors.white} />

              <Text style={styles.cookButtonText}>Cook</Text>
            </LinearGradient>
          </Pressable>
        </View>
      </GlassView> */}

      <LinearGradient
        colors={[colors.gradientStart, colors.gradientEnd]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        pointerEvents="none"
        style={[styles.gradientOverlay]}
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    position: 'relative',
    paddingBottom: 24,
  },
  buttonContainer: {
    position: 'absolute',
    left: 18,
    zIndex: 9999,
  },
  scrollableButtonContainer: {
    position: 'absolute',
    left: 18,
    zIndex: 9998,
  },
  heartButton: {
    width: 40,
    height: 40,
    borderRadius: 15,
    backgroundColor: '#FFFFFF', // overridden inline with colors.white
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000000',
    shadowOpacity: 0.15,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
  },
  heartIcon: {
    width: 22,
    height: 22,
  },
  buttonGlass: {
    padding: 8,
    borderRadius: 15,
    shadowColor: '#000000',
    shadowOpacity: 0.15,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 8,
  },
  heroImage: {
    width: '100%',
    height: 420,
    marginTop: -55,
    position: 'relative',
    right: '-14%',
    marginBottom: -8,
    resizeMode: 'cover',
  },
  contentContainer: {
    paddingHorizontal: 18,
    paddingTop: 16,
    gap: 32,
  },
  title: {
    fontSize: 32,
    lineHeight: 34,
    fontFamily: 'EBGaramond_500Medium',
    fontWeight: '500',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  metaIcon: {
    marginRight: 2,
  },
  meta: {
    fontSize: 12,
    lineHeight: 14,
    fontFamily: 'Syne_400Regular',
  },
  metaLink: {
    fontSize: 12,
    lineHeight: 14,
    fontFamily: 'Syne_400Regular',
    textDecorationLine: 'underline',
  },
  metaSeparator: {
    fontSize: 12,
    lineHeight: 14,
    fontFamily: 'Syne_400Regular',
  },
  link: {
    fontSize: 12,
    lineHeight: 14,
    fontFamily: 'Syne_400Regular',
    textDecorationLine: 'underline',
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
    fontFamily: 'Syne_400Regular',
  },
  section: {
    gap: 12,
  },
  recipeInfoContainer: {
    gap: 16,
  },
  sectionTitle: {
    fontSize: 18,
    lineHeight: 22,
    fontFamily: 'Syne_500Medium',
    paddingBottom: 8,
  },
  detailGrid: {
    borderWidth: 1,
    borderRadius: 16,
    overflow: 'hidden',
  },
  detailRow: {
    flexDirection: 'row',
  },
  detailCard: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRightWidth: 1,
    borderBottomWidth: 1,
  },
  detailLabel: {
    fontSize: 12,
    lineHeight: 14,
    fontFamily: 'Syne_400Regular',
    marginBottom: 8,
  },
  detailValue: {
    fontSize: 14,
    lineHeight: 18,
    fontFamily: 'Syne_400Regular',
  },
  detailNote: {
    marginTop: 0,
    fontSize: 12,
    lineHeight: 14,
    textDecorationLine: 'underline',
    fontFamily: 'Syne_400Regular',
  },
  detailNoteContainer: {
    flexDirection: 'row',
    gap: 4,
  },
  ingredientsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    rowGap: 8,
    columnGap: 8,
  },
  ingredientCard: {
    // shadowColor: '#000',
    // shadowOpacity: 0.03,
    // shadowRadius: 6,
    // shadowOffset: { width: 0, height: 4 },
    // elevation: 2,
  },
  ingredientImageWrapper: {
    width: '98%',
    aspectRatio: 1,
    position: 'relative',
  },
  ingredientImageContainer: {
    width: '100%',
    height: '100%',
    borderRadius: 16,
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
    backgroundColor: '#EEF5FB', // overridden inline with colors.surface
  },
  ingredientImageInitials: {
    fontSize: 16,
    fontFamily: 'Syne_400Regular',
    color: '#6A89A7', // overridden inline with colors.textMuted
  },
  addButton: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 24,
    height: 24,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF', // overridden inline with colors.white
    zIndex: 10,
    shadowColor: '#000000',
    shadowOpacity: 0.15,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    elevation: 10,
  },
  addButtonPressable: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  ingredientTextContainer: {
    paddingVertical: 10,
    paddingHorizontal: 6,
  },
  ingredientName: {
    fontSize: 13,
    lineHeight: 16,
    fontFamily: 'Syne_400Regular',
    marginBottom: 4,
  },
  ingredientMeta: {
    fontSize: 11,
    lineHeight: 13,
    fontFamily: 'Syne_400Regular',
  },
  stepsList: {
    gap: 0,
    marginTop: -16,
  },
  stepContainer: {
    paddingVertical: 16,
    gap: 12,
  },
  stepDivider: {
    borderTopWidth: 1,
    marginVertical: 0,
  },
  stepContent: {
    flexDirection: 'row',
    gap: 16,
    alignItems: 'flex-start',
  },
  stepNumber: {
    fontSize: 32,
    lineHeight: 38,
    fontFamily: 'Syne_500Medium',
    minWidth: 40,
  },
  stepTitle: {
    flex: 1,
    fontSize: 16,
    lineHeight: 21,
    fontFamily: 'Syne_400Regular',
    paddingTop: 4,
  },
  stepIngredientsContainer: {
    marginLeft: -20,
    marginRight: -20,
  },
  stepIngredients: {
    flexDirection: 'row',
    gap: 8,
    paddingLeft: 76,
    paddingRight: 20,
  },
  stepIngredientChip: {
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    minWidth: 100,
  },
  stepIngredientName: {
    fontSize: 13,
    lineHeight: 16,
    fontFamily: 'Syne_400Regular',
    marginBottom: 4,
  },
  stepIngredientMeta: {
    fontSize: 12,
    lineHeight: 14,
    fontFamily: 'Syne_400Regular',
  },

  footer: {
    position: 'absolute',
    bottom: 25,
    left: '50%',
    transform: [{ translateX: '-50%' }],
    borderRadius: 9999,
    zIndex: 9996,
    shadowColor: '#000000',
    shadowOpacity: 0.15,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    paddingLeft: 14,
    paddingRight: 8,
    gap: 22,
  },
  footerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  quantityButton: {
    padding: 4,
  },
  quantityText: {
    fontSize: 15,
    lineHeight: 18,
    fontFamily: 'Syne_400Regular',
    minWidth: 100,
    textAlign: 'center',
  },
  footerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cookButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    width: 'auto',
    minWidth: 90,
    paddingVertical: 10,
    borderRadius: 9999,
  },
  cookButtonText: {
    color: '#FFFFFF', // white text on gradient button
    fontSize: 15,
    lineHeight: 18,
    fontFamily: 'Syne_500Medium',
    fontWeight: '500',
  },
  gradientOverlay: {
    zIndex: 9995,
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 100,
    opacity: 0.5,
  },
  gradientOverlay2: {
    zIndex: 9995,
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: 100,
    opacity: 0.5,
  },
})
