export const Colors = {
  light: {
    // Base colors
    white: '#FFFFFF',
    black: '#000000',
    surface: '#EEF5FB',
    surfaceElevated: '#FFFFFF',
    border: '#C8D8E8',
    borderLight: '#DDEAF5',

    // Background
    background: '#FFFFFF',
    backgroundSecondary: '#EEF5FB',

    // Text colors
    textPrimary: '#111827',
    textSecondary: '#384959',
    textMuted: '#6A89A7',
    textDisabled: '#BDDDFC',

    // Primary colors
    primary: '#6A89A7',
    primarySoft: '#EEF5FB',
    primaryPressed: '#425B79',
    primaryGradientStart: '#88BDF2',
    primaryGradientEnd: '#6A89A7',

    // AI colors
    ai: '#6A89A7',
    aiSoft: '#EEF5FB',

    // Food/Recipe colors
    food: '#16A34A',
    foodSoft: '#DCFCE7',

    // Accent colors
    accent: '#88BDF2',
    accentSoft: '#EEF5FB',

    // Category colors
    categoryRecipe: '#EF4444',
    categoryRecipeSoft: '#FEE2E2',
    categoryPlace: '#14B8A6',
    categoryPlaceSoft: '#CCFBF1',
    categoryProduct: '#22C55E',
    categoryProductSoft: '#DCFCE7',

    // Status colors
    success: '#22C55E',
    successSoft: '#DCFCE7',
    warning: '#F59E0B',
    warningSoft: '#FEF3C7',
    error: '#EF4444',
    errorSoft: '#FEE2E2',
    info: '#88BDF2',
    infoSoft: '#EEF5FB',

    // Card colors
    cardBackground: '#EEF5FB',
    cardBackgroundElevated: '#FFFFFF',

    // Chip/Tag colors
    chipBackground: '#DDEAF5',
    chipBackgroundActive: '#384959',
    chipText: '#6A89A7',
    chipTextActive: '#FFFFFF',

    // Search & Header colors
    searchBarBackground: '#FFFFFF',
    searchBarText: '#6A89A7',
    searchBarIcon: '#384959',
    headerBackground: '#FFFFFF',
    tabIndicator: '#384959',
    tabDivider: '#C8D8E8',

    // Search overlay colors
    overlayBackdrop: 'rgba(0,0,0,0.4)',
    searchCardBackground: '#FFFFFF',

    // Gradient colors
    gradientStart: 'rgba(238,245,251,0)',
    gradientEnd: '#EEF5FB',

    // Card overlay (semi-transparent badge over card images)
    cardOverlay: 'rgba(255,255,255,0.9)',

    // Google brand color (external brand, unchanged)
    googleBrand: '#4285F4',
  },

  dark: {
    // Base colors
    white: '#FFFFFF',
    black: '#000000',
    surface: '#2E3F4F',
    surfaceElevated: '#384959',
    border: '#475E6D',
    borderLight: '#566B7A',

    // Background
    background: '#243545',
    backgroundSecondary: '#2E3F4F',

    // Text colors
    textPrimary: '#F0F7FF',
    textSecondary: '#BDDDFC',
    textMuted: '#88BDF2',
    textDisabled: '#566B7A',

    // Primary colors
    primary: '#88BDF2',
    primarySoft: '#2E3F4F',
    primaryPressed: '#BDDDFC',
    primaryGradientStart: '#88BDF2',
    primaryGradientEnd: '#6A89A7',

    // AI colors
    ai: '#88BDF2',
    aiSoft: '#2E3F4F',

    // Food/Recipe colors
    food: '#4ADE80',
    foodSoft: '#14532D',

    // Accent colors
    accent: '#BDDDFC',
    accentSoft: '#2E3F4F',

    // Category colors
    categoryRecipe: '#F87171',
    categoryRecipeSoft: '#7F1D1D',
    categoryPlace: '#2DD4BF',
    categoryPlaceSoft: '#134E4A',
    categoryProduct: '#4ADE80',
    categoryProductSoft: '#14532D',

    // Status colors
    success: '#4ADE80',
    successSoft: '#14532D',
    warning: '#FBBF24',
    warningSoft: '#78350F',
    error: '#F87171',
    errorSoft: '#7F1D1D',
    info: '#88BDF2',
    infoSoft: '#2E3F4F',

    // Card colors
    cardBackground: '#2E3F4F',
    cardBackgroundElevated: '#384959',

    // Chip/Tag colors
    chipBackground: '#384959',
    chipBackgroundActive: '#88BDF2',
    chipText: '#BDDDFC',
    chipTextActive: '#243545',

    // Search & Header colors
    searchBarBackground: '#2E3F4F',
    searchBarText: '#88BDF2',
    searchBarIcon: '#BDDDFC',
    headerBackground: '#243545',
    tabIndicator: '#BDDDFC',
    tabDivider: '#384959',

    // Search overlay colors
    overlayBackdrop: 'rgba(0,0,0,0.6)',
    searchCardBackground: '#2E3F4F',

    // Gradient colors
    gradientStart: 'rgba(36,53,69,0)',
    gradientEnd: '#243545',

    // Card overlay (semi-transparent badge over card images)
    cardOverlay: 'rgba(46,63,79,0.9)',

    // Google brand color (external brand, unchanged)
    googleBrand: '#4285F4',
  },
}

export type ColorScheme = keyof typeof Colors
export type ThemeColors = typeof Colors.light
