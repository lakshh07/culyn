import { BackIcon, ChefHatIcon, HeartIcon } from '@/components/icons';
import { useThemeColors } from '@/constants/useTheme';
import { Feather } from '@expo/vector-icons';
import { GlassView } from 'expo-glass-effect';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import {
  Dimensions,
  Image,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useColorScheme,
} from 'react-native';
import Animated, {
  FadeIn,
  FadeInLeft,
  FadeInUp,
} from 'react-native-reanimated';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';

type RecipeDetail = {
  title: string;
  author: string;
  originalLink?: string;
  description: string;
  heroImage: string;
  details: {
    label: string;
    value: string;
    note?: string;
  }[];
  ingredients: {
    name: string;
    quantity: string;
    unit?: string;
    image?: string;
  }[];
  steps: {
    stepNumber: number;
    description: string;
    ingredientsUsed?: { name: string; amount: string }[];
  }[];
};

type DetailItem = RecipeDetail['details'][number];

const recipeDetails: Record<string, RecipeDetail> = {
  'mushroom-corn-melt': {
    title: 'Mushroom Corn Melt Sandwich',
    author: 'fit.khurana',
    originalLink: 'https://example.com/mushroom-corn-melt',
    description:
      'A high-protein, low-calorie, and quick vegetarian sandwich featuring a creamy paneer and yogurt base with sautéed mushrooms, corn, and fresh basil, toasted to golden perfection.',
    heroImage:
      'https://pub-9ee8a88c5e204f60bb31ce62c2b024e7.r2.dev/recipe-images/xkc5ozpa057wshb2atfljxl6-1766203607861.png',
    details: [
      { label: 'Skill Level', value: 'Easy' },
      { label: 'Cook Time', value: '10 mins' },
      { label: 'Servings', value: '2' },
      { label: 'Serving Size', value: '2 cups' },
      { label: 'Est. Calories', value: '378 kcal', note: '(19%)' },
      { label: 'Carbs', value: '40.0 g', note: '(15%)' },
    ],
    ingredients: [
      { name: 'Paneer', quantity: '120', unit: 'g' },
      { name: 'Hung curd', quantity: '50', unit: 'g' },
      { name: 'Mozzarella', quantity: '30', unit: 'g' },
      { name: 'Mushrooms', quantity: '80', unit: 'g' },
      { name: 'Sweet corn', quantity: '60', unit: 'g' },
      { name: 'Garlic', quantity: '2', unit: 'cloves' },
      { name: 'Basil', quantity: '6', unit: 'leaves' },
      { name: 'Whole wheat bread', quantity: '2', unit: 'slices' },
      { name: 'Olive oil spray', quantity: '4', unit: 'sprays' },
    ],
    steps: [
      {
        stepNumber: 1,
        description:
          'Combine paneer, hung curd, and half the mozzarella into a creamy spread.',
        ingredientsUsed: [
          { name: 'Paneer', amount: '120 g' },
          { name: 'Hung curd', amount: '50 g' },
          { name: 'Mozzarella', amount: '15 g' },
        ],
      },
      {
        stepNumber: 2,
        description:
          'Sauté garlic, mushrooms, and corn until tender; season lightly.',
        ingredientsUsed: [
          { name: 'Garlic', amount: '2 cloves' },
          { name: 'Mushrooms', amount: '80 g' },
          { name: 'Sweet corn', amount: '60 g' },
        ],
      },
      {
        stepNumber: 3,
        description:
          'Spread the paneer mix on bread, top with veggies, basil, and remaining cheese.',
        ingredientsUsed: [
          { name: 'Whole wheat bread', amount: '2 slices' },
          { name: 'Basil', amount: '6 leaves' },
          { name: 'Mozzarella', amount: '15 g' },
        ],
      },
      {
        stepNumber: 4,
        description:
          'Toast the sandwich with olive oil spray until golden and melty; slice and serve.',
        ingredientsUsed: [{ name: 'Olive oil spray', amount: '4 sprays' }],
      },
    ],
  },
  'thai-steak': {
    title: 'Thai Steak Bowl',
    author: 'cuisinehub',
    description:
      'Tender steak with bright herbs, crisp veggies, and a savory Thai-inspired dressing over rice.',
    heroImage:
      'https://pub-9ee8a88c5e204f60bb31ce62c2b024e7.r2.dev/recipe-images/xkc5ozpa057wshb2atfljxl6-1766203607861.png',
    details: [
      { label: 'Skill Level', value: 'Intermediate' },
      { label: 'Cook Time', value: '25 mins' },
      { label: 'Servings', value: '2' },
      { label: 'Serving Size', value: '1 bowl' },
      { label: 'Est. Calories', value: '520 kcal' },
      { label: 'Carbs', value: '48.0 g' },
    ],
    ingredients: [
      { name: 'Flank steak', quantity: '220', unit: 'g' },
      { name: 'Jasmine rice', quantity: '180', unit: 'g' },
      { name: 'Cucumber', quantity: '0.5', unit: 'cup' },
      { name: 'Carrot ribbons', quantity: '0.5', unit: 'cup' },
      { name: 'Fresh herbs', quantity: '0.25', unit: 'cup' },
      { name: 'Fish sauce', quantity: '1.5', unit: 'tbsp' },
      { name: 'Lime juice', quantity: '1', unit: 'tbsp' },
      { name: 'Chili flakes', quantity: '0.5', unit: 'tsp' },
    ],
    steps: [
      {
        stepNumber: 1,
        description:
          'Marinate steak with fish sauce, lime, and chili; rest 10 minutes.',
        ingredientsUsed: [
          { name: 'Flank steak', amount: '220 g' },
          { name: 'Fish sauce', amount: '1.5 tbsp' },
          { name: 'Lime juice', amount: '1 tbsp' },
        ],
      },
      {
        stepNumber: 2,
        description:
          'Grill or sear steak to medium; let it rest and slice thin.',
        ingredientsUsed: [{ name: 'Flank steak', amount: '220 g' }],
      },
      {
        stepNumber: 3,
        description:
          'Build bowls with rice, cucumber, carrot ribbons, and herbs.',
        ingredientsUsed: [
          { name: 'Jasmine rice', amount: '180 g' },
          { name: 'Cucumber', amount: '0.5 cup' },
          { name: 'Carrot ribbons', amount: '0.5 cup' },
          { name: 'Fresh herbs', amount: '0.25 cup' },
        ],
      },
      {
        stepNumber: 4,
        description: 'Top with sliced steak and drizzle remaining dressing.',
        ingredientsUsed: [
          { name: 'Flank steak', amount: '220 g' },
          { name: 'Fish sauce', amount: 'splash' },
        ],
      },
    ],
  },
  'monte-cristo': {
    title: 'Monte Cristo Croissant Breakfast',
    author: 'breakfastlove',
    originalLink: 'https://example.com/mushroom-corn-melt',
    description:
      'Buttery croissant pressed with ham, cheese, and a hint of sweetness for a cozy breakfast treat.',
    heroImage:
      'https://pub-9ee8a88c5e204f60bb31ce62c2b024e7.r2.dev/recipe-images/xkc5ozpa057wshb2atfljxl6-1766203607861.png',
    details: [
      { label: 'Skill Level', value: 'Easy' },
      { label: 'Cook Time', value: '15 mins' },
      { label: 'Servings', value: '2' },
      { label: 'Serving Size', value: '1 croissant' },
      { label: 'Est. Calories', value: '430 kcal' },
      { label: 'Carbs', value: '36.0 g' },
    ],
    ingredients: [
      {
        name: 'Croissant',
        quantity: '2',
        unit: 'pieces',
        image:
          'https://pub-9ee8a88c5e204f60bb31ce62c2b024e7.r2.dev/ingredients/paneer.png',
      },
      { name: 'Ham', quantity: '80', unit: 'g' },
      { name: 'Swiss cheese', quantity: '50', unit: 'g' },
      { name: 'Egg', quantity: '1', unit: 'pc' },
      { name: 'Milk', quantity: '30', unit: 'ml' },
      { name: 'Powdered sugar', quantity: '1', unit: 'tsp' },
    ],
    steps: [
      {
        stepNumber: 1,
        description:
          'Whisk egg with milk; dip split croissants lightly to coat the inside.',
        ingredientsUsed: [
          { name: 'Egg', amount: '1 pc' },
          { name: 'Milk', amount: '30 ml' },
        ],
      },
      {
        stepNumber: 2,
        description: 'Layer ham and Swiss cheese inside each croissant.',
        ingredientsUsed: [
          { name: 'Ham', amount: '80 g' },
          { name: 'Swiss cheese', amount: '50 g' },
          { name: 'Croissants', amount: '2 pieces' },
          { name: 'Eggs', amount: '1 pc' },
          { name: 'Butter', amount: '20 g' },
        ],
      },
      {
        stepNumber: 3,
        description:
          'Press on a skillet until cheese melts and croissant is crisp.',
        ingredientsUsed: [{ name: 'Croissant', amount: '2 pieces' }],
      },
      {
        stepNumber: 4,
        description: 'Dust lightly with powdered sugar and serve warm.',
        ingredientsUsed: [{ name: 'Powdered sugar', amount: '1 tsp' }],
      },
    ],
  },
  pasta: {
    title: 'Creamy Pesto Pasta',
    author: 'pastachef',
    description:
      'Silky pesto sauce tossed with al dente pasta, toasted pine nuts, and a touch of lemon.',
    heroImage:
      'https://images.unsplash.com/photo-1521389508051-d7ffb5dc8bb0?auto=format&fit=crop&w=1000&q=80',
    details: [
      { label: 'Skill Level', value: 'Easy' },
      { label: 'Cook Time', value: '20 mins' },
      { label: 'Servings', value: '3' },
      { label: 'Serving Size', value: '1 plate' },
      { label: 'Est. Calories', value: '610 kcal' },
      { label: 'Carbs', value: '65.0 g' },
    ],
    ingredients: [
      { name: 'Pasta', quantity: '240', unit: 'g' },
      { name: 'Pesto', quantity: '80', unit: 'g' },
      { name: 'Lemon juice', quantity: '1', unit: 'tbsp' },
      { name: 'Pine nuts', quantity: '20', unit: 'g' },
      { name: 'Parmesan', quantity: '30', unit: 'g' },
    ],
    steps: [
      {
        stepNumber: 1,
        description: 'Boil pasta until al dente; reserve a cup of pasta water.',
        ingredientsUsed: [{ name: 'Pasta', amount: '240 g' }],
      },
      {
        stepNumber: 2,
        description:
          'Toss pasta with pesto, lemon juice, and a splash of pasta water.',
        ingredientsUsed: [
          { name: 'Pesto', amount: '80 g' },
          { name: 'Lemon juice', amount: '1 tbsp' },
        ],
      },
      {
        stepNumber: 3,
        description:
          'Fold in toasted pine nuts and grated parmesan before serving.',
        ingredientsUsed: [
          { name: 'Pine nuts', amount: '20 g' },
          { name: 'Parmesan', amount: '30 g' },
        ],
      },
    ],
  },
};

const detailPairs = (details: DetailItem[]): DetailItem[][] => {
  const pairs: DetailItem[][] = [];
  for (let i = 0; i < details.length; i += 2) {
    pairs.push(details.slice(i, i + 2));
  }
  return pairs;
};

const getInitials = (name: string): string => {
  const words = name.trim().split(/\s+/);
  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
};

const handleAddIngredient = (ingredientName: string) => {
  // TODO: Implement add to grocery list functionality
  console.log('Add ingredient:', ingredientName);
};

export default function RecipeDetailScreen() {
  const colors = useThemeColors();
  const router = useRouter();
  const scheme = useColorScheme();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const screenWidth = Dimensions.get('window').width;
  const cardGap = 8;
  const horizontalPadding = 22 * 2; // paddingHorizontal from contentContainer
  const availableWidth = screenWidth - horizontalPadding;
  const cardWidth = (availableWidth - cardGap * 3) / 4; // 4 cards with 3 gaps
  const [cookingQuantity, setCookingQuantity] = useState(2);

  const recipe = useMemo<RecipeDetail>(() => {
    if (!id) return recipeDetails['mushroom-corn-melt'];
    return recipeDetails[id] ?? recipeDetails['mushroom-corn-melt'];
  }, [id]);

  const handleOpenLink = async () => {
    if (!recipe.originalLink) return;
    const supported = await Linking.canOpenURL(recipe.originalLink);
    if (supported) {
      await Linking.openURL(recipe.originalLink);
    }
  };

  const handleOpenFSSAIGuidelines = async () => {
    const fssaiUrl = 'https://www.fssai.gov.in/';
    const supported = await Linking.canOpenURL(fssaiUrl);
    if (supported) {
      await Linking.openURL(fssaiUrl);
    }
  };

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: colors.background }]}
      edges={['left', 'right']}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Image source={{ uri: recipe.heroImage }} style={styles.heroImage} />

        <Pressable
          style={[styles.scrollableButtonContainer, { top: insets.top + 106 }]}
          onPress={() => {
            console.log('Scrollable button pressed');
          }}
          hitSlop={8}
        >
          <GlassView
            isInteractive={true}
            style={[styles.buttonGlass, { backgroundColor: colors.background }]}
          >
            <HeartIcon width={22} height={22} />
          </GlassView>
        </Pressable>

        <View style={styles.contentContainer}>
          <View style={styles.recipeInfoContainer}>
            <Text style={[styles.title, { color: colors.textPrimary }]}>
              {recipe.title}
            </Text>

            <View style={styles.metaRow}>
              <Feather
                name='instagram'
                size={14}
                color={colors.textMuted}
                style={styles.metaIcon}
              />
              <Text style={[styles.metaLink, { color: colors.textSecondary }]}>
                By {recipe.author}
              </Text>
              {recipe.originalLink ? (
                <>
                  <Text
                    style={[
                      styles.metaSeparator,
                      { color: colors.textSecondary },
                    ]}
                  >
                    •
                  </Text>
                  <Pressable onPress={handleOpenLink} hitSlop={8}>
                    <Text
                      style={[styles.link, { color: colors.textSecondary }]}
                    >
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
              {detailPairs(recipe.details).map((row, rowIndex) => (
                <View key={`row-${rowIndex}`} style={styles.detailRow}>
                  {row.map((item, itemIndex) => {
                    const isLastInRow = itemIndex === row.length - 1;
                    const isLastRow =
                      rowIndex === detailPairs(recipe.details).length - 1;
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
                        ]}
                      >
                        <Text
                          style={[
                            styles.detailLabel,
                            { color: colors.textMuted },
                          ]}
                        >
                          {item.label}
                        </Text>
                        <Text
                          style={[
                            styles.detailValue,
                            { color: colors.textPrimary },
                          ]}
                        >
                          {item.value}
                        </Text>
                      </View>
                    );
                  })}
                </View>
              ))}
            </View>

            <View style={styles.detailNoteContainer}>
              <Pressable onPress={handleOpenFSSAIGuidelines} hitSlop={8}>
                <Text style={[styles.detailNote, { color: colors.textMuted }]}>
                  *Percent daily values are based on a 2,000 calorie diet as per
                  FSSAI guidelines.
                </Text>
              </Pressable>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
              Ingredients
            </Text>
            <View style={styles.ingredientsGrid}>
              {recipe.ingredients.map((ingredient, index) => (
                <Animated.View
                  key={ingredient.name}
                  entering={FadeInUp.delay(150 + index * 60)}
                  style={[
                    styles.ingredientCard,
                    {
                      width: cardWidth,
                      borderColor: colors.border,
                    },
                  ]}
                >
                  <View style={styles.ingredientImageContainer}>
                    {ingredient.image ? (
                      <Image
                        source={{ uri: ingredient.image }}
                        style={styles.ingredientImage}
                        resizeMode='cover'
                      />
                    ) : (
                      <View style={styles.ingredientImagePlaceholder}>
                        <Text style={styles.ingredientImageInitials}>
                          {getInitials(ingredient.name)}
                        </Text>
                      </View>
                    )}
                    <Pressable
                      style={styles.addButton}
                      onPress={() => handleAddIngredient(ingredient.name)}
                      hitSlop={8}
                    >
                      <Feather name='plus' size={14} color='#000000' />
                    </Pressable>
                  </View>
                  <View style={styles.ingredientTextContainer}>
                    <Text
                      style={[
                        styles.ingredientName,
                        { color: colors.textPrimary },
                      ]}
                      numberOfLines={2}
                    >
                      {ingredient.name}
                    </Text>
                    <Text
                      style={[
                        styles.ingredientMeta,
                        { color: colors.textMuted },
                      ]}
                    >
                      {ingredient.quantity}
                      {ingredient.unit ? ` ${ingredient.unit}` : ''}
                    </Text>
                  </View>
                </Animated.View>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
              Cooking Steps
            </Text>
            <View style={styles.stepsList}>
              {recipe.steps.map((step, index) => (
                <React.Fragment key={step.stepNumber}>
                  {index > 0 && (
                    <View
                      style={[
                        styles.stepDivider,
                        { borderColor: colors.border },
                      ]}
                    />
                  )}
                  <Animated.View
                    entering={FadeInLeft.delay(200 + index * 90)}
                    style={styles.stepContainer}
                  >
                    <View style={styles.stepContent}>
                      <Text
                        style={[styles.stepNumber, { color: colors.textMuted }]}
                      >
                        {step.stepNumber.toString().padStart(2, '0')}
                      </Text>
                      <Text
                        style={[
                          styles.stepTitle,
                          { color: colors.textPrimary },
                        ]}
                      >
                        {step.description}
                      </Text>
                    </View>
                    {step.ingredientsUsed && step.ingredientsUsed.length > 0 ? (
                      <Animated.View
                        entering={FadeIn.delay(220 + index * 90)}
                        style={styles.stepIngredientsContainer}
                      >
                        <ScrollView
                          horizontal
                          showsHorizontalScrollIndicator={false}
                          contentContainerStyle={styles.stepIngredients}
                        >
                          {step.ingredientsUsed.map((ing) => (
                            <View
                              key={`${step.stepNumber}-${ing.name}`}
                              style={[
                                styles.stepIngredientChip,
                                { backgroundColor: colors.backgroundSecondary },
                              ]}
                            >
                              <Text
                                style={[
                                  styles.stepIngredientName,
                                  { color: colors.textPrimary },
                                ]}
                              >
                                {ing.name}
                              </Text>
                              <Text
                                style={[
                                  styles.stepIngredientMeta,
                                  { color: colors.textMuted },
                                ]}
                              >
                                {ing.amount}
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
      <Pressable
        style={[
          styles.buttonContainer,
          {
            top: insets.top,
          },
        ]}
        onPress={() => router.back()}
        hitSlop={8}
      >
        <GlassView
          isInteractive={true}
          style={[styles.buttonGlass, { backgroundColor: colors.background }]}
        >
          <BackIcon width={22} height={22} />
        </GlassView>
      </Pressable>

      <GlassView
        style={[styles.footer, { backgroundColor: colors.background }]}
      >
        <View style={styles.footerLeft}>
          <Pressable
            style={styles.quantityButton}
            onPress={() => setCookingQuantity(Math.max(1, cookingQuantity - 1))}
            hitSlop={8}
          >
            <Feather name='minus' size={16} color={colors.textMuted} />
          </Pressable>
          <Text style={[styles.quantityText, { color: colors.textPrimary }]}>
            Cooking for {cookingQuantity}
          </Text>
          <Pressable
            style={styles.quantityButton}
            onPress={() => setCookingQuantity(cookingQuantity + 1)}
            hitSlop={8}
          >
            <Feather name='plus' size={16} color={colors.textMuted} />
          </Pressable>
        </View>

        <View style={styles.footerRight}>
          <Pressable hitSlop={8}>
            <LinearGradient
              colors={[colors.primaryGradientStart, colors.primaryGradientEnd]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.cookButton}
            >
              <ChefHatIcon width={20} height={20} color='#FFFFFF' />

              <Text style={styles.cookButtonText}>Cook</Text>
            </LinearGradient>
          </Pressable>
        </View>
      </GlassView>

      <LinearGradient
        colors={[
          scheme === 'dark' ? 'rgba(17,24,39,0)' : 'rgba(255,255,255,0)',
          colors.background,
        ]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        pointerEvents='none'
        style={[
          styles.gradientOverlay,
          // {
          //   bottom: bottomPadding + TAB_BAR_HEIGHT,
          // },
        ]}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    position: 'relative',
    top: '-6%',
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
  buttonGlass: {
    padding: 8,
    borderRadius: 999,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 8,
  },
  heroImage: {
    width: '100%',
    height: 420,
    marginTop: -24,
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
  ingredientImageContainer: {
    width: '98%',
    aspectRatio: 1,
    position: 'relative',
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
    backgroundColor: '#F5F3F0',
  },
  ingredientImageInitials: {
    fontSize: 16,
    fontFamily: 'Syne_400Regular',
    color: '#9CA3AF',
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
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
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
    shadowColor: '#000',
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
    color: '#FFFFFF',
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
  },
});
