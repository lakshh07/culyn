import { useThemeColors } from '@/constants/useTheme';
import { ProductCategory } from '@culyn/shared/schemas/products';
import React from 'react';
import { StyleSheet, TextInput, View } from 'react-native';

import {
  PRICE_PRESETS,
  PRODUCT_CATEGORY_OPTIONS,
  type PricePreset,
  type ProductFilterState,
  type ProductSortBy,
  type SearchFilterAction,
} from '../types';
import { FilterCard } from './FilterCard';
import { FilterChip } from './FilterChip';
import { SortPicker } from './SortPicker';

const PRODUCT_SORT_OPTIONS: { key: ProductSortBy; label: string }[] = [
  { key: 'newest', label: 'Newest' },
  { key: 'oldest', label: 'Oldest' },
  { key: 'popular', label: 'Popular' },
  { key: 'price_asc', label: 'Price Low→High' },
  { key: 'price_desc', label: 'Price High→Low' },
  { key: 'random', label: 'Random' },
];

interface ProductFiltersProps {
  filters: ProductFilterState;
  dispatch: React.Dispatch<SearchFilterAction>;
}

export function ProductFilters({ filters, dispatch }: ProductFiltersProps) {
  const colors = useThemeColors();

  return (
    <>
      <FilterCard title="Category">
        <View style={styles.chipRow}>
          {PRODUCT_CATEGORY_OPTIONS.map((opt) => (
            <FilterChip
              key={opt.key}
              label={opt.label}
              isSelected={filters.category === opt.key}
              onPress={() =>
                dispatch({
                  type: 'SET_PRODUCT_CATEGORY',
                  payload:
                    filters.category === opt.key
                      ? null
                      : (opt.key as ProductCategory),
                })
              }
            />
          ))}
        </View>
      </FilterCard>

      <FilterCard title="Brand">
        <TextInput
          style={[
            styles.textInput,
            {
              backgroundColor: colors.chipBackground,
              color: colors.textPrimary,
              borderColor: colors.border,
            },
          ]}
          placeholder="e.g. Apple"
          placeholderTextColor={colors.textMuted}
          value={filters.brand}
          onChangeText={(text) =>
            dispatch({ type: 'SET_PRODUCT_BRAND', payload: text })
          }
          returnKeyType="done"
        />
      </FilterCard>

      <FilterCard title="Price">
        <View style={styles.chipRow}>
          {PRICE_PRESETS.map((preset) => (
            <FilterChip
              key={preset.key}
              label={preset.label}
              isSelected={filters.price === preset.key}
              onPress={() =>
                dispatch({
                  type: 'SET_PRODUCT_PRICE',
                  payload:
                    filters.price === preset.key
                      ? null
                      : (preset.key as PricePreset),
                })
              }
            />
          ))}
        </View>
      </FilterCard>

      <FilterCard title="Sort" defaultExpanded={false}>
        <SortPicker
          options={PRODUCT_SORT_OPTIONS}
          value={filters.sortBy}
          onChange={(v) =>
            dispatch({ type: 'SET_PRODUCT_SORT', payload: v })
          }
        />
      </FilterCard>
    </>
  );
}

const styles = StyleSheet.create({
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  textInput: {
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    fontSize: 14,
    fontFamily: 'Syne_400Regular',
  },
});
