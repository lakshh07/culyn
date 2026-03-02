import { type PlaceType, type ProductCategory } from '@culyn/shared/schemas'

// ============================================================================
// Cook Time Presets (maps to cookTimeMin/cookTimeMax)
// ============================================================================

export type CookTimePreset = 'UNDER_15' | '15_30' | '30_60' | 'OVER_60'

export const COOK_TIME_PRESETS: {
  key: CookTimePreset
  label: string
  min?: number
  max?: number
}[] = [
  { key: 'UNDER_15', label: 'Under 15 min', max: 15 },
  { key: '15_30', label: '15-30 min', min: 15, max: 30 },
  { key: '30_60', label: '30-60 min', min: 30, max: 60 },
  { key: 'OVER_60', label: '1hr+', min: 60 },
]

// ============================================================================
// Calorie Presets (maps to caloriesMin/caloriesMax)
// ============================================================================

export type CaloriePreset = 'UNDER_200' | '200_500' | '500_1000' | 'OVER_1000'

export const CALORIE_PRESETS: {
  key: CaloriePreset
  label: string
  min?: number
  max?: number
}[] = [
  { key: 'UNDER_200', label: 'Under 200', max: 200 },
  { key: '200_500', label: '200-500', min: 200, max: 500 },
  { key: '500_1000', label: '500-1000', min: 500, max: 1000 },
  { key: 'OVER_1000', label: '1000+', min: 1000 },
]

// ============================================================================
// Price Presets (maps to priceMin/priceMax)
// ============================================================================

export type PricePreset = 'UNDER_25' | '25_50' | '50_100' | 'OVER_100'

export const PRICE_PRESETS: {
  key: PricePreset
  label: string
  min?: number
  max?: number
}[] = [
  { key: 'UNDER_25', label: 'Under $25', max: 25 },
  { key: '25_50', label: '$25-$50', min: 25, max: 50 },
  { key: '50_100', label: '$50-$100', min: 50, max: 100 },
  { key: 'OVER_100', label: '$100+', min: 100 },
]

// ============================================================================
// Sort Options
// ============================================================================

export type RecipeSortBy = 'newest' | 'oldest' | 'popular' | 'random'
export type PlaceSortBy = 'newest' | 'oldest' | 'popular' | 'random'
export type ProductSortBy = 'newest' | 'oldest' | 'popular' | 'price_asc' | 'price_desc' | 'random'

// ============================================================================
// Place Type Options
// ============================================================================

export const PLACE_TYPE_OPTIONS: { key: PlaceType; label: string }[] = [
  { key: 'RESTAURANT', label: 'Restaurant' },
  { key: 'CAFE', label: 'Cafe' },
  { key: 'BAR', label: 'Bar' },
  { key: 'BAKERY', label: 'Bakery' },
  { key: 'FOOD_TRUCK', label: 'Food Truck' },
  { key: 'MARKET', label: 'Market' },
  { key: 'GROCERY_STORE', label: 'Grocery' },
  { key: 'SPECIALTY_SHOP', label: 'Specialty' },
]

// ============================================================================
// Product Category Options
// ============================================================================

export const PRODUCT_CATEGORY_OPTIONS: {
  key: ProductCategory
  label: string
}[] = [
  { key: 'BEAUTY', label: 'Beauty' },
  { key: 'TECH', label: 'Tech' },
  { key: 'FASHION', label: 'Fashion' },
  { key: 'KITCHEN', label: 'Kitchen' },
  { key: 'HOME', label: 'Home' },
  { key: 'HEALTH', label: 'Health' },
  { key: 'SPORTS', label: 'Sports' },
  { key: 'BOOKS', label: 'Books' },
]

// ============================================================================
// Per-category filter state
// ============================================================================

export interface RecipeFilterState {
  q: string
  cookTime: CookTimePreset | null
  calories: CaloriePreset | null
  sortBy: RecipeSortBy
}

export interface PlaceFilterState {
  q: string
  type: PlaceType | null
  city: string
  sortBy: PlaceSortBy
}

export interface ProductFilterState {
  q: string
  category: ProductCategory | null
  brand: string
  price: PricePreset | null
  sortBy: ProductSortBy
}

// ============================================================================
// Combined filter state
// ============================================================================

export interface SearchFilters {
  recipe: RecipeFilterState
  place: PlaceFilterState
  product: ProductFilterState
}

export const INITIAL_RECIPE_FILTERS: RecipeFilterState = {
  q: '',
  cookTime: null,
  calories: null,
  sortBy: 'newest',
}

export const INITIAL_PLACE_FILTERS: PlaceFilterState = {
  q: '',
  type: null,
  city: '',
  sortBy: 'newest',
}

export const INITIAL_PRODUCT_FILTERS: ProductFilterState = {
  q: '',
  category: null,
  brand: '',
  price: null,
  sortBy: 'newest',
}

export const INITIAL_FILTERS: SearchFilters = {
  recipe: INITIAL_RECIPE_FILTERS,
  place: INITIAL_PLACE_FILTERS,
  product: INITIAL_PRODUCT_FILTERS,
}

// ============================================================================
// API param shapes (what gets sent to the backend)
// ============================================================================

export interface RecipeApiParams {
  q?: string
  cookTimeMin?: number
  cookTimeMax?: number
  caloriesMin?: number
  caloriesMax?: number
  sortBy?: RecipeSortBy
}

export interface PlaceApiParams {
  q?: string
  type?: PlaceType
  city?: string
  sortBy?: PlaceSortBy
}

export interface ProductApiParams {
  q?: string
  category?: ProductCategory
  brand?: string
  priceMin?: number
  priceMax?: number
  sortBy?: ProductSortBy
}

export type ApiFilterParams = RecipeApiParams | PlaceApiParams | ProductApiParams

// ============================================================================
// Reducer action types
// ============================================================================

export type SearchFilterAction =
  | { type: 'SET_RECIPE_Q'; payload: string }
  | { type: 'SET_RECIPE_COOK_TIME'; payload: CookTimePreset | null }
  | { type: 'SET_RECIPE_CALORIES'; payload: CaloriePreset | null }
  | { type: 'SET_RECIPE_SORT'; payload: RecipeSortBy }
  | { type: 'SET_PLACE_Q'; payload: string }
  | { type: 'SET_PLACE_TYPE'; payload: PlaceType | null }
  | { type: 'SET_PLACE_CITY'; payload: string }
  | { type: 'SET_PLACE_SORT'; payload: PlaceSortBy }
  | { type: 'SET_PRODUCT_Q'; payload: string }
  | { type: 'SET_PRODUCT_CATEGORY'; payload: ProductCategory | null }
  | { type: 'SET_PRODUCT_BRAND'; payload: string }
  | { type: 'SET_PRODUCT_PRICE'; payload: PricePreset | null }
  | { type: 'SET_PRODUCT_SORT'; payload: ProductSortBy }
  | { type: 'CLEAR_ALL' }
