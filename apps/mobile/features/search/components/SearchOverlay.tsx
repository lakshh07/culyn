import { useThemeColors } from '@/constants/useTheme';
import { ContentCategory } from '@culyn/shared/schemas';
import React, { useCallback, useRef } from 'react';
import {
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import Animated from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { SearchFilterAction, SearchFilters } from '../types';
import { CategoryTabsExpanded } from './CategoryTabsExpanded';
import { PlaceFilters } from './PlaceFilters';
import { ProductFilters } from './ProductFilters';
import { RecipeFilters } from './RecipeFilters';
import { SearchBottomBar } from './SearchBottomBar';
import { SearchCard } from './SearchCard';

const SCREEN_HEIGHT = Dimensions.get('window').height;
const MAX_OVERLAY_HEIGHT = SCREEN_HEIGHT * 0.7;

interface SearchOverlayProps {
  isOpen: boolean;
  selectedCategory: ContentCategory;
  onCategoryChange: (category: ContentCategory) => void;
  filters: SearchFilters;
  dispatch: React.Dispatch<SearchFilterAction>;
  onSearch: () => void;
  onClose: () => void;
  onClearAll: () => void;
  overlayStyle: any;
  backdropStyle: any;
  bottomBarStyle: any;
}

const QUERY_ACTION_MAP: Record<ContentCategory, SearchFilterAction['type']> = {
  RECIPE: 'SET_RECIPE_Q',
  PLACE: 'SET_PLACE_Q',
  PRODUCT: 'SET_PRODUCT_Q',
};

function getQuery(filters: SearchFilters, category: ContentCategory): string {
  switch (category) {
    case 'RECIPE':
      return filters.recipe.q;
    case 'PLACE':
      return filters.place.q;
    case 'PRODUCT':
      return filters.product.q;
  }
}

export function SearchOverlay({
  isOpen,
  selectedCategory,
  onCategoryChange,
  filters,
  dispatch,
  onSearch,
  onClose,
  onClearAll,
  overlayStyle,
  backdropStyle,
  bottomBarStyle,
}: SearchOverlayProps) {
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();
  const inputRef = useRef<TextInput>(null);

  const handleQueryChange = useCallback(
    (text: string) => {
      dispatch({
        type: QUERY_ACTION_MAP[selectedCategory],
        payload: text,
      } as SearchFilterAction);
    },
    [selectedCategory, dispatch],
  );

  const query = getQuery(filters, selectedCategory);

  const renderCategoryFilters = () => {
    switch (selectedCategory) {
      case 'RECIPE':
        return (
          <RecipeFilters filters={filters.recipe} dispatch={dispatch} />
        );
      case 'PLACE':
        return (
          <PlaceFilters filters={filters.place} dispatch={dispatch} />
        );
      case 'PRODUCT':
        return (
          <ProductFilters filters={filters.product} dispatch={dispatch} />
        );
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Full-screen dim backdrop — tapping closes overlay */}
      <Animated.View
        style={[styles.backdrop, { backgroundColor: colors.black }, backdropStyle]}
      >
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
      </Animated.View>

      {/* Top-anchored overlay panel (Airbnb-style expanding card) */}
      <Animated.View
        style={[
          styles.overlayPanel,
          {
            backgroundColor: colors.backgroundSecondary,
            paddingTop: insets.top + 4,
            maxHeight: MAX_OVERLAY_HEIGHT,
            shadowColor: colors.black,
          },
          overlayStyle,
        ]}
      >
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={0}
        >
          {/* Category tabs + close (X) at top */}
          <View style={styles.topBar}>
            <CategoryTabsExpanded
              selectedCategory={selectedCategory}
              onCategoryChange={onCategoryChange}
              onClose={onClose}
            />
          </View>

          {/* Scrollable content: search card + filters */}
          <ScrollView
            style={styles.flex}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            bounces={false}
          >
            <SearchCard
              ref={inputRef}
              category={selectedCategory}
              query={query}
              onQueryChange={handleQueryChange}
            />

            {renderCategoryFilters()}
          </ScrollView>

          {/* Bottom bar: Clear all + Search */}
          <SearchBottomBar
            onClearAll={onClearAll}
            onSearch={onSearch}
            animatedStyle={bottomBarStyle}
          />
        </KeyboardAvoidingView>
      </Animated.View>
    </>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 50,
  },
  overlayPanel: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 51,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 12,
    overflow: 'hidden',
  },
  flex: {
    flex: 1,
  },
  topBar: {
    paddingHorizontal: 16,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
});
