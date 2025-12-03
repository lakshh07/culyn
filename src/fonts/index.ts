import localFont from 'next/font/local'

export const sharpGrotesk = localFont({
  src: [
    {
      path: '../fonts/SharpGroteskLight20.woff2',
      weight: '300',
      style: 'normal',
    },
    {
      path: '../fonts/SharpGroteskBook20.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../fonts/SharpGroteskMedium20.woff2',
      weight: '500',
      style: 'normal',
    },
    {
      path: '../fonts/SharpGroteskSemiBold20.woff2',
      weight: '600',
      style: 'normal',
    },
    {
      path: '../fonts/SharpGroteskSemiBold25.woff2',
      weight: '700',
      style: 'normal',
    },
  ],
  variable: '--font-sharp-grotesk',
  display: 'swap',
})

export const autography = localFont({
  src: [
    {
      path: '../fonts/Autography.otf',
      weight: '400',
      style: 'normal',
    },
  ],
  variable: '--font-autography',
  display: 'swap',
})

export const thicccboi = localFont({
  src: [
    {
      path: './THICCCBOI-Thin.woff2',
      weight: '100',
      style: 'normal',
    },
    {
      path: './THICCCBOI-ExtraLight.woff2',
      weight: '200',
      style: 'normal',
    },
    {
      path: './THICCCBOI-Light.woff2',
      weight: '300',
      style: 'normal',
    },
    {
      path: './THICCCBOI-Regular.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: './THICCCBOI-Medium.woff2',
      weight: '500',
      style: 'normal',
    },
    {
      path: './THICCCBOI-SemiBold.woff2',
      weight: '600',
      style: 'normal',
    },
    {
      path: './THICCCBOI-Bold.woff2',
      weight: '700',
      style: 'normal',
    },
    {
      path: './THICCCBOI-ExtraBold.woff2',
      weight: '800',
      style: 'normal',
    },

    {
      path: './THICCCBOI-Black.woff2',
      weight: '900',
      style: 'normal',
    },
  ],
  variable: '--font-thicccboi',
})
