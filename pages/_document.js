import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="en">
      <Head>
          <meta name="site-build" content="update-13" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="icon" type="image/png" href="/images/favicon.png" />
        <link rel="shortcut icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/images/apple-touch-icon.png" />
        {/* Satisfy = display text (only where asked), Baloo Tamma 2 = the Kannada name, Nunito = titles/headings, PT Sans = body */}
        <link
          href="https://fonts.googleapis.com/css2?family=Nunito:ital,wght@0,400;0,600;0,700;0,800;0,900;1,400;1,700&family=PT+Sans:ital,wght@0,400;0,700;1,400;1,700&family=Satisfy&family=Baloo+Tamma+2:wght@600;700&display=swap"
          rel="stylesheet"
        />
        {/* entrance animations: hide the page for a moment until the animation script is ready (never longer than 2.5s) */}
        <script
          dangerouslySetInnerHTML={{
            __html: "document.documentElement.classList.add('js');setTimeout(function(){document.documentElement.classList.add('rv-ready')},2500)",
          }}
        />
        <noscript><style>{'html.js:not(.rv-ready) #__next{visibility:visible!important}'}</style></noscript>
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
