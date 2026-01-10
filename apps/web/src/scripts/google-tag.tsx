import Script from 'next/script'

const GOOGLE_TAG_ID = process.env.NEXT_PUBLIC_GOOGLE_TAG_ID

if (!GOOGLE_TAG_ID) {
  throw new Error('NEXT_PUBLIC_GOOGLE_TAG_ID is not set')
}

export const GoogleTag = () => {
  return (
    <>
      <Script
        async
        src={`https://www.googletagmanager.com/gtag/js?id=${GOOGLE_TAG_ID}`}
        strategy="afterInteractive"
      />
      <Script id="google-tag" strategy="afterInteractive">
        {`window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());

          gtag('config', '${GOOGLE_TAG_ID}');
        `}
      </Script>
    </>
  )
}
