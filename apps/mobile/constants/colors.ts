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
  },
};

export type ColorScheme = keyof typeof Colors;
export type ThemeColors = typeof Colors.light;
