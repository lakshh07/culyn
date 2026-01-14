import { expoClient } from '@better-auth/expo/client';
import { organizationClient } from 'better-auth/client/plugins';
import { createAuthClient } from 'better-auth/react';
import * as SecureStore from 'expo-secure-store';

export const authClient = createAuthClient({
  baseURL: process.env.BETTER_AUTH_URL || 'http://localhost:8000',
  plugins: [
    expoClient({
      scheme: 'culynapp',
      storage: SecureStore,
    }),
    organizationClient(),
  ],
});
