import React from 'react';
import { View, StyleSheet } from 'react-native';

import {
  CALORIE_PRESETS,
  COOK_TIME_PRESETS,
  type CaloriePreset,
  type CookTimePreset,
  type RecipeFilterState,
  type RecipeSortBy,
  type SearchFilterAction,
} from '../types';
import { FilterCard } from './FilterCard';
import { FilterChip } from './FilterChip';
import { SortPicker } from './SortPicker';

const RECIPE_SORT_OPTIONS: { key: RecipeSortBy; label: string }[] = [
  { key: 'newest', label: 'Newest' },
  { key: 'oldest', label: 'Oldest' },
  { key: 'popular', label: 'Popular' },
  { key: 'random', label: 'Random' },
];

interface RecipeFiltersProps {
  filters: RecipeFilterState;
  dispatch: React.Dispatch<SearchFilterAction>;
}

export function RecipeFilters({ filters, dispatch }: RecipeFiltersProps) {
  return (
    <>
      <FilterCard title="Cook Time">
        <View style={styles.chipRow}>
          {COOK_TIME_PRESETS.map((preset) => (
            <FilterChip
              key={preset.key}
              label={preset.label}
              isSelected={filters.cookTime === preset.key}
              onPress={() =>
                dispatch({
                  type: 'SET_RECIPE_COOK_TIME',
                  payload:
                    filters.cookTime === preset.key
                      ? null
                      : (preset.key as CookTimePreset),
                })
              }
            />
          ))}
        </View>
      </FilterCard>

      <FilterCard title="Calories">
        <View style={styles.chipRow}>
          {CALORIE_PRESETS.map((preset) => (
            <FilterChip
              key={preset.key}
              label={preset.label}
              isSelected={filters.calories === preset.key}
              onPress={() =>
                dispatch({
                  type: 'SET_RECIPE_CALORIES',
                  payload:
                    filters.calories === preset.key
                      ? null
                      : (preset.key as CaloriePreset),
                })
              }
            />
          ))}
        </View>
      </FilterCard>

      <FilterCard title="Sort" defaultExpanded={false}>
        <SortPicker
          options={RECIPE_SORT_OPTIONS}
          value={filters.sortBy}
          onChange={(v) =>
            dispatch({ type: 'SET_RECIPE_SORT', payload: v })
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
});
