import type { Metadata, Viewport } from 'next'
import { Montserrat, DM_Sans, Syne, Leckerli_One } from 'next/font/google'
import '@/styles/globals.css'
import { Providers } from '@/providers'
import { cn } from '@/lib/utils'
import { autography, thicccboi, sharpGrotesk } from '@/fonts'
import { GoogleTag } from '@/scripts/google-tag'

const montserrat = Montserrat({
  variable: '--font-montserrat',
  subsets: ['latin'],
})

const dmSans = DM_Sans({
  variable: '--font-dm-sans',
  subsets: ['latin'],
})

const syne = Syne({
  variable: '--font-syne',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
})

const leckerli = Leckerli_One({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-leckerli',
})

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#000000' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  colorScheme: 'light dark',
}

export const metadata: Metadata = {
  metadataBase: new URL('https://culyn.app'),
  title: {
    default: 'Culyn - AI-Powered Cooking Assistant',
    template: '%s | Culyn',
  },
  description:
    'AI-powered cooking and recipe management app that makes home cooking effortless. Import recipes from Instagram, YouTube, blogs, or videos. Get real-time AI assistance, step-by-step guidance, and personalized meal planning.',
  applicationName: 'Culyn',
  authors: [{ name: 'Culyn Team' }],
  generator: 'Next.js',
  keywords: [
    'AI cooking assistant',
    'recipe management',
    'meal planning',
    'cooking app',
    'recipe import',
    'grocery list',
    'nutrition tracker',
    'cooking timer',
    'recipe organizer',
    'AI chef',
    'smart kitchen',
    'cooking guidance',
    'recipe extraction',
    'meal prep',
    'diet customization',
  ],
  referrer: 'origin-when-cross-origin',
  creator: 'Culyn Team',
  publisher: 'Culyn',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: 'https://culyn.app',
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '48x48' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [{ url: '/apple-icon.png', sizes: '180x180', type: 'image/png' }],
  },
  manifest: '/manifest.webmanifest',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://culyn.app',
    siteName: 'Culyn',
    title: 'Culyn - AI-Powered Cooking Assistant',
    description:
      'AI-powered cooking and recipe management app. Import recipes from anywhere, get real-time cooking assistance, and build your personalized intelligent kitchen experience.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Culyn - AI-Powered Cooking Assistant',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Culyn - AI-Powered Cooking Assistant',
    description:
      'AI-powered cooking and recipe management app. Import recipes from anywhere and get real-time cooking assistance.',
    images: ['/twitter-image.png'],
    creator: '@culyn',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Culyn',
    startupImage: [
      {
        url: '/apple-splash-2048-2732.png',
        media:
          '(device-width: 1024px) and (device-height: 1366px) and (-webkit-device-pixel-ratio: 2)',
      },
      {
        url: '/apple-splash-1668-2388.png',
        media:
          '(device-width: 834px) and (device-height: 1194px) and (-webkit-device-pixel-ratio: 2)',
      },
      {
        url: '/apple-splash-1536-2048.png',
        media:
          '(device-width: 768px) and (device-height: 1024px) and (-webkit-device-pixel-ratio: 2)',
      },
      {
        url: '/apple-splash-1290-2796.png',
        media:
          '(device-width: 430px) and (device-height: 932px) and (-webkit-device-pixel-ratio: 3)',
      },
      {
        url: '/apple-splash-1179-2556.png',
        media:
          '(device-width: 393px) and (device-height: 852px) and (-webkit-device-pixel-ratio: 3)',
      },
      {
        url: '/apple-splash-1125-2436.png',
        media:
          '(device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3)',
      },
    ],
  },
  formatDetection: {
    telephone: false,
    email: false,
    address: false,
  },
  category: 'food',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <GoogleTag />
      </head>
      <body
        className={cn(
          montserrat.variable,
          dmSans.variable,
          autography.variable,
          sharpGrotesk.variable,
          syne.variable,
          thicccboi.variable,
          leckerli.variable,
          'antialiased'
        )}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
