import type { Metadata, Viewport } from 'next'
import { Inter, Poppins, Outfit } from 'next/font/google'
import './globals.css'
import PWAInstall from '@/components/PWAInstall'

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap'
})

const poppins = Poppins({
  subsets: ['latin'],
  variable: '--font-poppins',
  display: 'swap',
  weight: ['300', '400', '500', '600', '700']
})

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
  display: 'swap',
  weight: ['300', '400', '500', '600', '700', '800']
})

export const metadata: Metadata = {
  title: 'LWSRH - LoveWorld Singers Rehearsal Hub',
  description: 'LoveWorld Singers Rehearsal Hub - Comprehensive praise and worship management app',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'LWSRH',
  },
  formatDetection: {
    telephone: false,
  },
  applicationName: 'LWSRH',
  generator: 'Next.js',
  keywords: ['praise', 'worship', 'rehearsal', 'music', 'loveworld', 'singers'],
  authors: [{ name: 'LoveWorld Singers' }],
  creator: 'LoveWorld Singers',
  publisher: 'LoveWorld Singers',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    siteName: 'LWSRH',
    title: 'LWSRH - LoveWorld Singers Rehearsal Hub',
    description: 'LoveWorld Singers Rehearsal Hub - Comprehensive praise and worship management app',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'LWSRH - LoveWorld Singers Rehearsal Hub',
    description: 'LoveWorld Singers Rehearsal Hub - Comprehensive praise and worship management app',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#9333ea',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/logo.png" />
        <link rel="apple-touch-icon" sizes="152x152" href="/logo.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/logo.png" />
        <link rel="apple-touch-icon" sizes="167x167" href="/logo.png" />
        <meta name="theme-color" content="#9333ea" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="LWSRH" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-navbutton-color" content="#9333ea" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="msapplication-TileColor" content="#9333ea" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
      </head>
      <body className={`${inter.variable} ${poppins.variable} ${outfit.variable} font-sans safe-area-top safe-area-bottom safe-area-left safe-area-right`}>
        <main className="min-h-screen bg-gray-50">
          {children}
        </main>
        <PWAInstall />
      </body>
    </html>
  )
}