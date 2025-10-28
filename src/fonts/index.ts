import localFont from 'next/font/local';

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
});

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
});
