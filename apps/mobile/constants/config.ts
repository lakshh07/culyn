import Constants from 'expo-constants'

export type AppEnv = 'staging' | 'production' | 'development'

export const APP_ENV: AppEnv =
  (Constants.expoConfig?.extra?.appEnv as AppEnv) ?? (process.env.APP_ENV as AppEnv) ?? 'production'

export const IS_STAGING = APP_ENV === 'staging'
export const IS_PRODUCTION = APP_ENV === 'production'
export const IS_DEV = APP_ENV === 'development' || __DEV__

// Resolved at build time via EXPO_PUBLIC_CULYN_API_URL (set in .env.staging / .env.production)
// or via Constants.expoConfig.extra.apiUrl (set in app.config.ts from the same env var).
// For EAS production builds, APP_ENV and EXPO_PUBLIC_CULYN_API_URL are injected via eas.json env block.
export const API_URL: string =
  process.env.EXPO_PUBLIC_CULYN_API_URL ??
  (Constants.expoConfig?.extra?.apiUrl as string) ??
  'https://your-api-domain.com'
