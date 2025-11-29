import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Culyn - AI-Powered Cooking Assistant',
    short_name: 'Culyn',
    description:
      'AI-powered cooking and recipe management app. Import recipes from anywhere, get real-time cooking assistance, and build your personalized intelligent kitchen experience.',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#ffffff',
    orientation: 'portrait',
    categories: ['food', 'lifestyle', 'productivity', 'utilities'],
    icons: [
      {
        src: '/favicon.ico',
        sizes: '48x48',
        type: 'image/x-icon',
      },
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
    ],
    screenshots: [
      {
        src: '/screenshot-mobile.png',
        sizes: '390x844',
        type: 'image/png',
        form_factor: 'narrow',
      },
      {
        src: '/screenshot-desktop.png',
        sizes: '1920x1080',
        type: 'image/png',
        form_factor: 'wide',
      },
    ],
  }
}
