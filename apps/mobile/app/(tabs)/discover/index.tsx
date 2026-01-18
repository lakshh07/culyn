import TabsHeader from '@/components/navigation/TabsHeader';
import { useThemeColors } from '@/constants/useTheme';
import { RecipeCard } from '@/features/recipes/components/RecipeCard';
import { useRecipes } from '@/hooks/recipes/useRecipes';
import { useRouter } from 'expo-router';
import React from 'react';
import {
  FlatList,
  Image,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type QuickAction = {
  id: string;
  title: string;
  path: string;
  subtitle: string;
  image: string;
};

const weekdayNames = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

const monthNames = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const quickActions: QuickAction[] = [
  {
    id: 'surprise',
    title: 'Surprise Me',
    path: '/recipes',
    subtitle: 'Curated recipes for you',
    image:
      'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=200&q=80&sat=-50',
  },
  {
    id: 'shopping',
    title: 'Shopping List',
    path: '/shopping-list',
    subtitle: 'What are we buying?',
    image:
      'https://images.unsplash.com/photo-1481391032119-d89fee407e44?auto=format&fit=crop&w=240&q=80',
  },
];

const getOrdinalSuffix = (day: number) => {
  const remainderTen = day % 10;
  const remainderHundred = day % 100;

  if (remainderHundred >= 11 && remainderHundred <= 13) return 'th';
  if (remainderTen === 1) return 'st';
  if (remainderTen === 2) return 'nd';
  if (remainderTen === 3) return 'rd';
  return 'th';
};

const getMealTypeByTime = (): string => {
  const hour = new Date().getHours();

  if (hour >= 5 && hour < 11) {
    return 'breakfast';
  } else if (hour >= 11 && hour < 16) {
    return 'lunch';
  } else if (hour >= 16 && hour < 21) {
    return 'dinner';
  } else {
    return 'late night snacks';
  }
};

const buildDateString = (date: Date) => {
  const weekday = weekdayNames[date.getDay()];
  const month = monthNames[date.getMonth()];
  const day = date.getDate();
  const suffix = getOrdinalSuffix(day);

  return `It's ${weekday}, ${month} ${day}${suffix}.`;
};

export default function Index() {
  const today = new Date();
  const dateString = buildDateString(today);
  const mealType = getMealTypeByTime();
  const colors = useThemeColors();
  const router = useRouter();

  const { recipes } = useRecipes();

  return (
    <SafeAreaView
      style={[
        styles.container,
        { backgroundColor: colors.backgroundSecondary },
      ]}
      edges={['left', 'right']}
    >
      <StatusBar
        barStyle='dark-content'
        translucent
        backgroundColor='transparent'
      />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentInsetAdjustmentBehavior='never'
        contentContainerStyle={styles.scrollContent}
      >
        <TabsHeader />

        <View style={styles.heroBlock}>
          <Text style={[styles.welcomeFaint, { color: colors.textSecondary }]}>
            Welcome back.
          </Text>
          <Text style={[styles.heroDate, { color: colors.textPrimary }]}>
            {dateString}
          </Text>
          <Text style={[styles.heroQuestion, { color: colors.textPrimary }]}>
            What are we making for <Text style={styles.meal}>{mealType}?</Text>
          </Text>
        </View>

        <FlatList
          data={quickActions}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.quickGrid}
          renderItem={({ item }) => (
            <View key={item.id} style={styles.quickColumn}>
              <Pressable
                onPress={() => {
                  router.push(item.path as any);
                }}
              >
                <View
                  style={[
                    styles.quickCard,
                    { backgroundColor: colors.background },
                  ]}
                >
                  <View style={styles.quickTextBlock}>
                    <Text
                      style={[styles.quickTitle, { color: colors.textPrimary }]}
                    >
                      {item.title}
                    </Text>
                    <Text
                      style={[
                        styles.quickSubtitle,
                        { color: colors.textMuted },
                      ]}
                    >
                      {item.subtitle}
                    </Text>
                  </View>
                  <Image
                    source={require('@/assets/images/empty-basket.png')}
                    style={styles.quickImage}
                  />
                </View>
              </Pressable>
            </View>
          )}
          keyExtractor={(item, index) => `column-${index}`}
        />

        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
            What others are saving
          </Text>
        </View>

        <FlatList
          data={[
            'All',
            'Breakfast',
            'Lunch',
            'Dinner',
            'Dessert',
            'Vegetarian',
          ]}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipRow}
          renderItem={({ item, index }) => (
            <View
              style={[
                styles.chip,
                {
                  backgroundColor:
                    index === 0 ? colors.chipBackgroundActive : undefined,
                },
              ]}
            >
              <Text
                style={[
                  styles.chipLabel,
                  {
                    color:
                      index === 0 ? colors.chipTextActive : colors.chipText,
                  },
                ]}
              >
                {item}
              </Text>
            </View>
          )}
          keyExtractor={(item) => item}
        />

        <View style={styles.recipeGrid}>
          {recipes &&
            recipes.map((recipe) => (
              <View key={recipe.id} style={styles.recipeItem}>
                <RecipeCard
                  id={recipe.id}
                  title={recipe.title}
                  image={recipe.imageUrl ?? ''}
                  cookTime={recipe.cookTime}
                  calories={recipe.calories}
                  onPress={() => {
                    router.push({
                      pathname: '/recipes/[slug]',
                      params: { slug: recipe.slug },
                    });
                  }}
                  onHeartPress={(liked) => {
                    // Handle heart press
                  }}
                />
              </View>
            ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 86,
  },
  heroBlock: {
    paddingHorizontal: 20,
    paddingTop: 52,
    paddingBottom: 42,
    gap: 6,
  },
  welcomeFaint: {
    fontSize: 22,
    lineHeight: 24,
    fontFamily: 'EBGaramond_400Regular',
  },
  heroDate: {
    fontSize: 22,
    lineHeight: 24,
    fontFamily: 'EBGaramond_400Regular',
  },
  heroQuestion: {
    fontSize: 22,
    lineHeight: 24,
    fontFamily: 'EBGaramond_400Regular',
  },
  meal: {
    fontStyle: 'italic',
    fontFamily: 'EBGaramond_400Regular_Italic',
  },
  quickGrid: {
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 8,
    gap: 10,
  },
  quickColumn: {
    gap: 10,
  },
  quickCard: {
    borderRadius: 16,
    paddingTop: 4,
    paddingBottom: 10,
    paddingLeft: 14,
    paddingRight: 4,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  quickTextBlock: {
    // marginRight: 40,
  },
  quickTitle: {
    fontSize: 16,
    fontFamily: 'EBGaramond_400Regular',
  },
  quickSubtitle: {
    marginTop: 3,
    fontSize: 12,
    fontFamily: 'Syne_400Regular',
  },
  quickImage: {
    width: 72,
    height: 72,
  },
  sectionHeader: {
    paddingHorizontal: 20,
    paddingTop: 30,
  },
  sectionTitle: {
    fontSize: 22,
    lineHeight: 24,
    fontFamily: 'EBGaramond_400Regular',
  },
  chipRow: {
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 10,
    gap: 2,
  },
  chip: {
    paddingHorizontal: 18,
    paddingVertical: 6,
    borderRadius: 16,
  },
  chipLabel: {
    fontSize: 12.5,
    lineHeight: 20,
    fontFamily: 'Poppins_400Regular',
  },
  chipLabelActive: {
    fontFamily: 'Poppins_400Regular',
  },
  recipeGrid: {
    marginHorizontal: 12,
    marginTop: 12,
    marginBottom: 48,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  recipeItem: {
    width: '48.5%',
    marginBottom: 16,
  },
});
