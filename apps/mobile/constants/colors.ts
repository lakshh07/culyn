export const Colors = {
  light: {
    // Base colors
    white: '#FFFFFF',
    black: '#000000',
    surface: '#F9FAFB',
    surfaceElevated: '#FFFFFF',
    border: '#E5E7EB',
    borderLight: '#F3F4F6',

    // Background
    background: '#FFFFFF',
    backgroundSecondary: '#F9FAFB',

    // Text colors
    textPrimary: '#111827',
    textSecondary: '#6B7280',
    textMuted: '#9CA3AF',
    textDisabled: '#D1D5DB',

    // Primary colors
    primary: '#8B5CF6',
    primarySoft: '#EDE9FE',
    primaryPressed: '#7C3AED',
    primaryGradientStart: '#8B5CF6',
    primaryGradientEnd: '#6366F1',

    // AI colors
    ai: '#7C3AED',
    aiSoft: '#F3E8FF',

    // Food/Recipe colors
    food: '#16A34A',
    foodSoft: '#DCFCE7',

    // Accent colors
    accent: '#D2784A',
    accentSoft: '#FED7AA',

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
    info: '#3B82F6',
    infoSoft: '#DBEAFE',

    // Card colors
    cardBackground: '#F5F5F5',
    cardBackgroundElevated: '#FFFFFF',

    // Chip/Tag colors
    chipBackground: '#F0F0F0',
    chipBackgroundActive: '#3B2523',
    chipText: '#6B6B6B',
    chipTextActive: '#FFFFFF',

    // Search & Header colors
    searchBarBackground: '#FFFFFF',
    searchBarText: '#717171',
    searchBarIcon: '#222222',
    headerBackground: '#FFFFFF',
    tabIndicator: '#222222',
    tabDivider: '#EBEBEB',

    // Search overlay colors
    overlayBackdrop: 'rgba(0,0,0,0.4)',
    searchCardBackground: '#FFFFFF',

    // Gradient colors
    gradientStart: 'rgba(255,255,255,0)',
    gradientEnd: '#FFFFFF',
  },

  dark: {
    // Base colors
    white: '#FFFFFF',
    black: '#000000',
    surface: '#1F2937',
    surfaceElevated: '#374151',
    border: '#374151',
    borderLight: '#4B5563',

    // Background
    background: '#111827',
    backgroundSecondary: '#1F2937',

    // Text colors
    textPrimary: '#F9FAFB',
    textSecondary: '#D1D5DB',
    textMuted: '#9CA3AF',
    textDisabled: '#6B7280',

    // Primary colors
    primary: '#A78BFA',
    primarySoft: '#4C1D95',
    primaryPressed: '#8B5CF6',
    primaryGradientStart: '#A78BFA',
    primaryGradientEnd: '#818CF8',

    // AI colors
    ai: '#A78BFA',
    aiSoft: '#4C1D95',

    // Food/Recipe colors
    food: '#4ADE80',
    foodSoft: '#14532D',

    // Accent colors
    accent: '#FB923C',
    accentSoft: '#7C2D12',

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
    info: '#60A5FA',
    infoSoft: '#1E3A8A',

    // Card colors
    cardBackground: '#1F2937',
    cardBackgroundElevated: '#374151',

    // Chip/Tag colors
    chipBackground: '#374151',
    chipBackgroundActive: '#8B5CF6',
    chipText: '#D1D5DB',
    chipTextActive: '#FFFFFF',

    // Search & Header colors
    searchBarBackground: '#374151',
    searchBarText: '#9CA3AF',
    searchBarIcon: '#D1D5DB',
    headerBackground: '#111827',
    tabIndicator: '#F9FAFB',
    tabDivider: '#374151',

    // Search overlay colors
    overlayBackdrop: 'rgba(0,0,0,0.6)',
    searchCardBackground: '#1F2937',

    // Gradient colors
    gradientStart: 'rgba(17,24,39,0)',
    gradientEnd: '#111827',
  },
};

export type ColorScheme = keyof typeof Colors;
export type ThemeColors = typeof Colors.light;
