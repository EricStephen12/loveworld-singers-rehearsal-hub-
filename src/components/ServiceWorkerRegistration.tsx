'use client'

import { useEffect } from 'react'

export default function ServiceWorkerRegistration() {
  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      return
    }

    // Register the ultra-fast service worker for best performance
    const registerSW = async () => {
      try {
        const registration = await navigator.serviceWorker.register('/sw-ultra-fast.js', {
          scope: '/',
          updateViaCache: 'none' // Always check for updates
        })

        console.log('🚀 Ultra Fast Service Worker registered:', registration.scope)

        // Check for updates immediately
        registration.update()

        // Listen for updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // New version available - activate immediately
                console.log('🔄 New version available, updating...')
                newWorker.postMessage({ type: 'SKIP_WAITING' })
              }
            })
          }
        })

        // Listen for controller change (new SW activated)
        navigator.serviceWorker.addEventListener('controllerchange', () => {
          console.log('🔄 Service Worker updated, reloading...')
          window.location.reload()
        })

      } catch (error) {
        console.error('Service Worker registration failed:', error)
      }
    }

    // Register on load
    if (document.readyState === 'complete') {
      registerSW()
    } else {
      window.addEventListener('load', registerSW)
    }

    return () => {
      window.removeEventListener('load', registerSW)
    }
  }, [])

  return null
}

