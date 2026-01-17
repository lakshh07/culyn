import { useThemeColors } from '@/constants/useTheme';
import { useCookbook } from '@/hooks/cookbook/useCookbook';
import { router } from 'expo-router';
import React from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function RecipesHomeScreen() {
  const colors = useThemeColors();
  const { cookbook } = useCookbook();

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: colors.backgroundSecondary }]}
      edges={['left', 'right']}
    >
      <StatusBar
        barStyle='dark-content'
        translucent
        backgroundColor='transparent'
      />
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.textPrimary }]}>
            Cookbook
          </Text>
          <Text style={[styles.subtitle, { color: colors.textMuted }]}>
            Your all recipes in one place.
          </Text>
        </View>

        {cookbook && cookbook.length > 0 ? (
          <View style={styles.recipesList}>
            {cookbook.map((item) => (
              <View key={item.id}>
                <Pressable
                  style={[
                    styles.recipeCard,
                    { backgroundColor: colors.cardBackgroundElevated },
                  ]}
                  onPress={() => {
                    router.push({
                      pathname: '/recipes/[slug]',
                      params: { slug: item.recipe.slug },
                    });
                  }}
                >
                  <View style={styles.cardHeader}>
                    <View style={styles.imageWrapper}>
                      <Image
                        source={{ uri: item.recipe.imageUrl }}
                        style={styles.image}
                      />
                    </View>
                    <View style={styles.cardHeaderLeft}>
                      <Text
                        style={[
                          styles.cardTitle,
                          { color: colors.textPrimary },
                        ]}
                      >
                        {item.recipe.title}
                      </Text>
                      <View style={styles.footerRow}>
                        {item.recipe.cookTime && (
                          <View style={styles.footerItem}>
                            <Text
                              style={[
                                styles.credit,
                                { color: colors.textSecondary },
                              ]}
                            >
                              {item.recipe.cookTime}min cook time
                            </Text>
                          </View>
                        )}
                      </View>
                    </View>
                  </View>
                </Pressable>
              </View>
            ))}
          </View>
        ) : (
          <View style={[styles.emptyState, { borderColor: colors.border }]}>
            <Text style={[styles.emptyStateText, { color: colors.textMuted }]}>
              No recipes in your cookbook yet.
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 14,
    paddingTop: 82,
    paddingBottom: 150,
    gap: 16,
  },
  header: {
    gap: 2,
  },
  imageWrapper: {
    width: 110,
    height: 110,
    borderRadius: 75,
    overflow: 'hidden',
    backgroundColor: '#f5f5f5',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  title: {
    fontSize: 30,
    lineHeight: 34,
    letterSpacing: 0.2,
    fontFamily: 'EBGaramond_500Medium',
    fontWeight: '500',
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.2,
    fontFamily: 'Syne_400Regular',
  },
  recipesList: {
    gap: 16,
    marginTop: 8,
  },
  recipeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    paddingHorizontal: 8,
    paddingVertical: 10,
    shadowColor: '#000',
    shadowOpacity: 0.01,
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
    flexDirection: 'column',
    flex: 1,
    gap: 10,
    marginRight: 12,
  },
  cardTitle: {
    fontSize: 20,
    lineHeight: 26,
    fontFamily: 'EBGaramond_400Regular',
  },
  cardSubtitle: {
    fontSize: 13,
    lineHeight: 18,
    fontFamily: 'Poppins_400Regular',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  credit: {
    fontSize: 11,
    fontFamily: 'Poppins_400Regular',
    lineHeight: 14,
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
});
