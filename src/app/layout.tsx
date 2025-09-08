import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import PWAInstall from '@/components/PWAInstall'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'LoveWorld Praise App',
  description: 'A comprehensive praise and worship management app',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Praise App',
  },
  formatDetection: {
    telephone: false,
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#1e40af',
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
        <link rel="apple-touch-icon" href="/icon-192x192.png" />
        <meta name="theme-color" content="#1e40af" />
      </head>
      <body className={inter.className}>
        <main className="min-h-screen bg-gray-50">
          {children}
        </main>
        <PWAInstall />
      </body>
    </html>
  )
}