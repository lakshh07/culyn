import type { Metadata, Viewport } from 'next'
import { Montserrat, DM_Sans, Syne } from 'next/font/google'
import '@/styles/globals.css'
import { Providers } from '@/providers'
import { cn } from '@/lib/utils'
import { autography, sharpGrotesk } from '@/fonts'

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

export const viewport: Viewport = {
  themeColor: '#000000',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export const metadata: Metadata = {
  title: 'Culina AI',
  description: 'Your personal AI chef',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Culina AI',
  },
  formatDetection: {
    telephone: false,
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body
        className={cn(
          montserrat.variable,
          dmSans.variable,
          autography.variable,
          sharpGrotesk.variable,
          syne.variable,
          'antialiased'
        )}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
