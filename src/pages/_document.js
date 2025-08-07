// src/pages/_document.js
import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        {/* Preconnect to external domains for faster loading */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
        <link rel="dns-prefetch" href="//images.unsplash.com" />
        <link rel="dns-prefetch" href="//maps.googleapis.com" />
        <link rel="dns-prefetch" href="//lh3.googleusercontent.com" />
        <link rel="dns-prefetch" href="//lh5.googleusercontent.com" />
        
        {/* Preload critical fonts */}
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Merriweather:wght@300;400;700&family=Playfair+Display:wght@400;600;700&display=swap"
          rel="stylesheet"
        />
        
        {/* Critical CSS for above-the-fold content */}
        <style jsx>{`
          body {
            font-family: 'Inter', system-ui, -apple-system, sans-serif;
            line-height: 1.6;
            color: #2d3748;
            background-color: #ffffff;
          }
          
          /* Prevent flash of unstyled content */
          .soup-loading {
            visibility: hidden;
          }
          
          /* Critical styles for immediate render */
          .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 0 1rem;
          }
          
          /* Navigation critical styles */
          nav {
            background-color: #ffffff;
            border-bottom: 1px solid #e2e8f0;
          }
        `}</style>
      </Head>
      <body className="antialiased">
        <Main />
        <NextScript />
        
        {/* Remove loading class after render */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              document.addEventListener('DOMContentLoaded', function() {
                document.body.classList.remove('soup-loading');
              });
            `,
          }}
        />
      </body>
    </Html>
  )
}