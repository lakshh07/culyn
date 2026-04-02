import { ConfigContext, ExpoConfig } from 'expo/config'

const IS_STAGING = process.env.APP_ENV === 'staging'

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: IS_STAGING ? 'Culyn (Staging)' : 'Culyn',
  slug: 'culyn-app',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/images/logo.png',
  scheme: IS_STAGING ? 'culynapp-staging' : 'culynapp',
  userInterfaceStyle: 'automatic',
  newArchEnabled: true,
  ios: {
    supportsTablet: true,
    bundleIdentifier: IS_STAGING ? 'com.culyn-ai.staging' : 'com.culyn-ai',
    appleTeamId: '3R4B4DSQSY',
  },
  web: {
    output: 'static',
    favicon: './assets/images/favicon.png',
  },
  android: {
    package: IS_STAGING ? 'com.culynai.staging' : 'com.culynai',
  },
  plugins: [
    'expo-router',
    [
      'expo-splash-screen',
      {
        image: './assets/images/splash.png',
        imageWidth: 200,
        resizeMode: 'contain',
        backgroundColor: '#ffffff',
        dark: {
          backgroundColor: '#ffffff',
        },
      },
    ],
    'expo-font',
    './plugins/withActionExtension',
    [
      'expo-share-extension',
      {
        activationRules: [
          {
            type: 'url',
            max: 1,
          },
        ],
        height: 150,
        backgroundColor: {
          red: 0,
          green: 0,
          blue: 0,
          alpha: 0.95,
        },
        excludedPackages: ['expo-dev-client', 'expo-splash-screen', 'expo-font'],
      },
    ],
    'expo-notifications',
  ],
  experiments: {
    typedRoutes: true,
    reactCompiler: true,
  },
  extra: {
    apiUrl: process.env.EXPO_PUBLIC_CULYN_API_URL,
    appEnv: process.env.APP_ENV ?? 'production',
  },
})
