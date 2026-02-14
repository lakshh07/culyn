import { useThemeColors } from '@/constants/useTheme';
import { PlaceType } from '@culyn/shared/schemas/places';
import React from 'react';
import { StyleSheet, TextInput, View } from 'react-native';

import {
  PLACE_TYPE_OPTIONS,
  type PlaceFilterState,
  type PlaceSortBy,
  type SearchFilterAction,
} from '../types';
import { FilterCard } from './FilterCard';
import { FilterChip } from './FilterChip';
import { SortPicker } from './SortPicker';

const PLACE_SORT_OPTIONS: { key: PlaceSortBy; label: string }[] = [
  { key: 'newest', label: 'Newest' },
  { key: 'oldest', label: 'Oldest' },
  { key: 'popular', label: 'Popular' },
  { key: 'random', label: 'Random' },
];

interface PlaceFiltersProps {
  filters: PlaceFilterState;
  dispatch: React.Dispatch<SearchFilterAction>;
}

export function PlaceFilters({ filters, dispatch }: PlaceFiltersProps) {
  const colors = useThemeColors();

  return (
    <>
      <FilterCard title="Type">
        <View style={styles.chipRow}>
          {PLACE_TYPE_OPTIONS.map((opt) => (
            <FilterChip
              key={opt.key}
              label={opt.label}
              isSelected={filters.type === opt.key}
              onPress={() =>
                dispatch({
                  type: 'SET_PLACE_TYPE',
                  payload:
                    filters.type === opt.key
                      ? null
                      : (opt.key as PlaceType),
                })
              }
            />
          ))}
        </View>
      </FilterCard>

      <FilterCard title="City">
        <TextInput
          style={[
            styles.textInput,
            {
              backgroundColor: colors.chipBackground,
              color: colors.textPrimary,
              borderColor: colors.border,
            },
          ]}
          placeholder="e.g. New York"
          placeholderTextColor={colors.textMuted}
          value={filters.city}
          onChangeText={(text) =>
            dispatch({ type: 'SET_PLACE_CITY', payload: text })
          }
          returnKeyType="done"
        />
      </FilterCard>

      <FilterCard title="Sort" defaultExpanded={false}>
        <SortPicker
          options={PLACE_SORT_OPTIONS}
          value={filters.sortBy}
          onChange={(v) =>
            dispatch({ type: 'SET_PLACE_SORT', payload: v })
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
