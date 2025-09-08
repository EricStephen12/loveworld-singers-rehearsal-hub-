'use client'

import { useState, useEffect } from 'react'
import { Download, X } from 'lucide-react'

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[]
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed'
    platform: string
  }>
  prompt(): Promise<void>
}

export default function PWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showInstallBanner, setShowInstallBanner] = useState(false)

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      setShowInstallBanner(true)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    }
  }, [])

  const handleInstallClick = async () => {
    if (!deferredPrompt) return

    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    
    if (outcome === 'accepted') {
      console.log('User accepted the install prompt')
    } else {
      console.log('User dismissed the install prompt')
    }
    
    setDeferredPrompt(null)
    setShowInstallBanner(false)
  }

  if (!showInstallBanner || !deferredPrompt) {
    return null
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 bg-white border border-gray-200 rounded-lg shadow-lg p-4 max-w-md mx-auto">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
            <Download className="w-5 h-5 text-white" />
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-gray-900">
            Install Praise App
          </h3>
          <p className="text-xs text-gray-600 mt-1">
            Install this app on your device for offline access and a better experience.
          </p>
          <div className="flex gap-2 mt-3">
            <button
              onClick={handleInstallClick}
              className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              Install
            </button>
            <button
              onClick={() => setShowInstallBanner(false)}
              className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              Not now
            </button>
          </div>
        </div>
        <button
          onClick={() => setShowInstallBanner(false)}
          className="flex-shrink-0 text-gray-400 hover:text-gray-600"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
