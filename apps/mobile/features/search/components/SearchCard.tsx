import { useThemeColors } from '@/constants/useTheme';
import { ContentCategory } from '@culyn/shared/schemas';
import { Feather } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import React, { forwardRef } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { PopularItem, usePopularItems } from '../hooks/usePopularItems';

const CATEGORY_TITLES: Record<ContentCategory, string> = {
  RECIPE: 'What do you want to cook?',
  PLACE: 'Where do you want to go?',
  PRODUCT: 'What are you looking for?',
};

interface SearchCardProps {
  category: ContentCategory;
  query: string;
  onQueryChange: (text: string) => void;
}

export const SearchCard = forwardRef<TextInput, SearchCardProps>(
  function SearchCard({ category, query, onQueryChange }, ref) {
    const colors = useThemeColors();
    const router = useRouter();
    const { data: popularItems, isLoading } = usePopularItems(category);
    const showSuggestions = !query && popularItems && popularItems.length > 0;

    const handleSuggestionPress = (item: PopularItem) => {
      if (item.category === 'RECIPE') {
        router.push({ pathname: '/recipes/[slug]', params: { slug: item.slug } });
      } else if (item.category === 'PLACE') {
        router.push({ pathname: '/places/[slug]', params: { slug: item.slug } });
      } else if (item.category === 'PRODUCT') {
        router.push({
          pathname: '/products/[slug]',
          params: { slug: item.slug },
        });
      }
    };

    return (
      <View
        style={[
          styles.card,
          {
            backgroundColor:
              colors.searchCardBackground ?? colors.cardBackgroundElevated,
            borderColor: colors.border,
          },
        ]}
      >
        <Text style={[styles.title, { color: colors.textPrimary }]}>
          {CATEGORY_TITLES[category]}
        </Text>

        <View
          style={[
            styles.inputRow,
            {
              backgroundColor: colors.chipBackground,
              borderColor: colors.border,
            },
          ]}
        >
          <Feather name="search" size={18} color={colors.textMuted} />
          <TextInput
            ref={ref}
            style={[styles.input, { color: colors.textPrimary }]}
            placeholder="Search..."
            placeholderTextColor={colors.textMuted}
            value={query}
            onChangeText={onQueryChange}
            returnKeyType="search"
            autoCorrect={false}
          />
          {query.length > 0 && (
            <Pressable onPress={() => onQueryChange('')}>
              <Feather name="x" size={16} color={colors.textMuted} />
            </Pressable>
          )}
        </View>

        {showSuggestions && (
          <View style={styles.suggestions}>
            <Text
              style={[styles.suggestionsLabel, { color: colors.textSecondary }]}
            >
              Popular
            </Text>
            {popularItems.map((item) => (
              <Pressable
                key={item.id}
                style={styles.suggestionRow}
                onPress={() => handleSuggestionPress(item)}
              >
                <View
                  style={[
                    styles.suggestionImage,
                    { backgroundColor: colors.chipBackground },
                  ]}
                >
                  {item.imageUrl ? (
                    <Image
                      source={{ uri: item.imageUrl }}
                      style={styles.suggestionImageInner}
                      contentFit="cover"
                    />
                  ) : (
                    <Feather
                      name="image"
                      size={16}
                      color={colors.textMuted}
                    />
                  )}
                </View>
                <View style={styles.suggestionText}>
                  <Text
                    style={[
                      styles.suggestionTitle,
                      { color: colors.textPrimary },
                    ]}
                    numberOfLines={1}
                  >
                    {item.title}
                  </Text>
                  {item.subtitle && (
                    <Text
                      style={[
                        styles.suggestionSubtitle,
                        { color: colors.textMuted },
                      ]}
                      numberOfLines={1}
                    >
                      {item.subtitle}
                    </Text>
                  )}
                </View>
                <Feather
                  name="arrow-up-right"
                  size={14}
                  color={colors.textMuted}
                />
              </Pressable>
            ))}
          </View>
        )}

        {!query && isLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color={colors.textMuted} />
          </View>
        )}
      </View>
    );
  },
);

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 12,
  },
  title: {
    fontSize: 20,
    fontFamily: 'Syne_600SemiBold',
    marginBottom: 14,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 14,
    gap: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
    fontFamily: 'Syne_400Regular',
    height: '100%',
  },
  suggestions: {
    marginTop: 16,
    gap: 4,
  },
  suggestionsLabel: {
    fontSize: 12,
    fontFamily: 'Syne_500Medium',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  suggestionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    gap: 12,
  },
  suggestionImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  suggestionImageInner: {
    width: 40,
    height: 40,
  },
  suggestionText: {
    flex: 1,
  },
  suggestionTitle: {
    fontSize: 14,
    fontFamily: 'Syne_600SemiBold',
  },
  suggestionSubtitle: {
    fontSize: 12,
    fontFamily: 'Syne_400Regular',
    marginTop: 1,
  },
  loadingContainer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
});
