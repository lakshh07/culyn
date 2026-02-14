import { ContentCategory } from '@culyn/shared/schemas';
import { useCallback, useReducer } from 'react';

import {
  CALORIE_PRESETS,
  COOK_TIME_PRESETS,
  INITIAL_FILTERS,
  PRICE_PRESETS,
  type ApiFilterParams,
  type PlaceApiParams,
  type ProductApiParams,
  type RecipeApiParams,
  type SearchFilterAction,
  type SearchFilters,
} from '../types';

function searchFilterReducer(
  state: SearchFilters,
  action: SearchFilterAction,
): SearchFilters {
  switch (action.type) {
    // Recipe
    case 'SET_RECIPE_Q':
      return { ...state, recipe: { ...state.recipe, q: action.payload } };
    case 'SET_RECIPE_COOK_TIME':
      return { ...state, recipe: { ...state.recipe, cookTime: action.payload } };
    case 'SET_RECIPE_CALORIES':
      return { ...state, recipe: { ...state.recipe, calories: action.payload } };
    case 'SET_RECIPE_SORT':
      return { ...state, recipe: { ...state.recipe, sortBy: action.payload } };

    // Place
    case 'SET_PLACE_Q':
      return { ...state, place: { ...state.place, q: action.payload } };
    case 'SET_PLACE_TYPE':
      return { ...state, place: { ...state.place, type: action.payload } };
    case 'SET_PLACE_CITY':
      return { ...state, place: { ...state.place, city: action.payload } };
    case 'SET_PLACE_SORT':
      return { ...state, place: { ...state.place, sortBy: action.payload } };

    // Product
    case 'SET_PRODUCT_Q':
      return { ...state, product: { ...state.product, q: action.payload } };
    case 'SET_PRODUCT_CATEGORY':
      return {
        ...state,
        product: { ...state.product, category: action.payload },
      };
    case 'SET_PRODUCT_BRAND':
      return { ...state, product: { ...state.product, brand: action.payload } };
    case 'SET_PRODUCT_PRICE':
      return { ...state, product: { ...state.product, price: action.payload } };
    case 'SET_PRODUCT_SORT':
      return { ...state, product: { ...state.product, sortBy: action.payload } };

    case 'CLEAR_ALL':
      return INITIAL_FILTERS;

    default:
      return state;
  }
}

export function useSearchFilters() {
  const [filters, dispatch] = useReducer(searchFilterReducer, INITIAL_FILTERS);

  const clearAll = useCallback(() => dispatch({ type: 'CLEAR_ALL' }), []);

  const getApiParams = useCallback(
    (category: ContentCategory): ApiFilterParams => {
      switch (category) {
        case 'RECIPE': {
          const { q, cookTime, calories, sortBy } = filters.recipe;
          const preset = cookTime
            ? COOK_TIME_PRESETS.find((p) => p.key === cookTime)
            : null;
          const calPreset = calories
            ? CALORIE_PRESETS.find((p) => p.key === calories)
            : null;
          const params: RecipeApiParams = {};
          if (q) params.q = q;
          if (preset?.min) params.cookTimeMin = preset.min;
          if (preset?.max) params.cookTimeMax = preset.max;
          if (calPreset?.min) params.caloriesMin = calPreset.min;
          if (calPreset?.max) params.caloriesMax = calPreset.max;
          if (sortBy !== 'newest') params.sortBy = sortBy;
          return params;
        }
        case 'PLACE': {
          const { q, type, city, sortBy } = filters.place;
          const params: PlaceApiParams = {};
          if (q) params.q = q;
          if (type) params.type = type;
          if (city) params.city = city;
          if (sortBy !== 'newest') params.sortBy = sortBy;
          return params;
        }
        case 'PRODUCT': {
          const { q, category, brand, price, sortBy } = filters.product;
          const pricePreset = price
            ? PRICE_PRESETS.find((p) => p.key === price)
            : null;
          const params: ProductApiParams = {};
          if (q) params.q = q;
          if (category) params.category = category;
          if (brand) params.brand = brand;
          if (pricePreset?.min) params.priceMin = pricePreset.min;
          if (pricePreset?.max) params.priceMax = pricePreset.max;
          if (sortBy !== 'newest') params.sortBy = sortBy;
          return params;
        }
      }
    },
    [filters],
  );

  const hasActiveFilters = useCallback(
    (category: ContentCategory): boolean => {
      switch (category) {
        case 'RECIPE': {
          const { q, cookTime, calories, sortBy } = filters.recipe;
          return !!(q || cookTime || calories || sortBy !== 'newest');
        }
        case 'PLACE': {
          const { q, type, city, sortBy } = filters.place;
          return !!(q || type || city || sortBy !== 'newest');
        }
        case 'PRODUCT': {
          const { q, category, brand, price, sortBy } = filters.product;
          return !!(
            q ||
            category ||
            brand ||
            price ||
            sortBy !== 'newest'
          );
        }
      }
    },
    [filters],
  );

  return {
    filters,
    dispatch,
    clearAll,
    getApiParams,
    hasActiveFilters,
  };
}
