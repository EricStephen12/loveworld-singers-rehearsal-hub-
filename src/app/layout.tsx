import type { Metadata, Viewport } from 'next'
import './globals.css'
import PWAInstall from '@/components/PWAInstall'
import { AudioProvider } from '@/contexts/AudioContext'
import { AuthProvider } from '@/contexts/AuthContext'
import RealtimeNotifications from '@/components/RealtimeNotifications'
import VersionChecker from '@/components/VersionChecker'
// import ScreenshotPrevention from '@/components/ScreenshotPrevention'
import ServiceWorkerRegistration from '@/components/ServiceWorkerRegistration'
import ErrorBoundary from '@/components/ErrorBoundary'
// import GlobalMiniPlayer from '@/components/GlobalMiniPlayer'

// Use system fonts as fallback to avoid Google Fonts network issues
const inter = { 
  variable: '--font-inter',
  className: 'font-sans'
};

const poppins = { 
  variable: '--font-poppins',
  className: 'font-display'
};

const outfit = { 
  variable: '--font-outfit',
  className: 'font-heading'
};

// Static version for PWA stability (only change when manifest actually changes)
const APP_VERSION = '3.0.0'; // ✅ Updated for instant loading optimizations

export const metadata: Metadata = {
  title: 'LWSRHP - LOVEWORLD SINGERS REHEARSAL HUB PORTAL - LoveWorld Singers Rehearsal Hub',
  description: 'LoveWorld Singers Rehearsal Hub - Comprehensive praise and worship management app',
  manifest: `/manifest.json`,
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'LWSRHP - LOVEWORLD SINGERS REHEARSAL HUB PORTAL',
  },
  formatDetection: {
    telephone: false,
  },
  applicationName: 'LWSRHP - LOVEWORLD SINGERS REHEARSAL HUB PORTAL',
  generator: 'Next.js',
  keywords: ['praise', 'worship', 'rehearsal', 'music', 'loveworld', 'singers'],
  authors: [{ name: 'LoveWorld Singers' }],
  creator: 'LoveWorld Singers',
  publisher: 'LoveWorld Singers',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    siteName: 'LWSRHP - LOVEWORLD SINGERS REHEARSAL HUB PORTAL',
    title: 'LWSRHP - LOVEWORLD SINGERS REHEARSAL HUB PORTAL - LoveWorld Singers Rehearsal Hub',
    description: 'LoveWorld Singers Rehearsal Hub - Comprehensive praise and worship management app',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'LWSRHP - LOVEWORLD SINGERS REHEARSAL HUB PORTAL - LoveWorld Singers Rehearsal Hub',
    description: 'LoveWorld Singers Rehearsal Hub - Comprehensive praise and worship management app',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#ffffff',
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

        {/* ✅ INSTANT LOADING - Resource Hints */}
        <link rel="preconnect" href="https://supabase.co" />
        <link rel="dns-prefetch" href="https://supabase.co" />
        <link rel="preload" href="/logo.png" as="image" />
        <link rel="preload" href="/images/home.jpg" as="image" />

        <meta name="theme-color" content="#ffffff" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="LWSRHP - LOVEWORLD SINGERS REHEARSAL HUB PORTAL" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-navbutton-color" content="#ffffff" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="msapplication-TileColor" content="#ffffff" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
      </head>
      <body className={`${inter.variable} ${poppins.variable} ${outfit.variable} font-sans`}>
        <ServiceWorkerRegistration />
        <ErrorBoundary>
          <AuthProvider>
            <AudioProvider>
              {/* <ScreenshotPrevention /> */}
              <main className="h-full w-full bg-gray-50">
                {children}
              </main>
              <PWAInstall />
              <RealtimeNotifications />
            </AudioProvider>
          </AuthProvider>
        </ErrorBoundary>
      </body>
    </html>
  )
}