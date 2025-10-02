'use client'

import { useEffect } from 'react'

export default function ServiceWorkerRegistration() {
  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      console.log('❌ Service Worker not supported in this environment')
      return
    }

    // Skip service worker in development if needed
    if (process.env.NODE_ENV === 'development' && window.location.hostname === 'localhost') {
      console.log('⚠️ Skipping Service Worker in development mode')
      return
    }

    // Register the ultra-fast service worker for best performance
    const registerSW = async () => {
      try {
        // Check if already registered
        const existingRegistration = await navigator.serviceWorker.getRegistration()
        if (existingRegistration) {
          console.log('🚀 Service Worker already registered:', existingRegistration.scope)
          return
        }

        console.log('🔄 Attempting to register service worker...')
        
        let registration
        try {
          // Use simple, reliable service worker for better compatibility
          registration = await navigator.serviceWorker.register('/sw-simple.js', {
            scope: '/',
            updateViaCache: 'none'
          })
          console.log('📱 Simple Service Worker registered successfully:', registration.scope)
        } catch (simpleError) {
          console.log('⚠️ Simple SW failed, trying fallback...')
          // Fallback to basic service worker
          registration = await navigator.serviceWorker.register('/sw.js', {
            scope: '/',
            updateViaCache: 'none'
          })
          console.log('📱 Fallback Service Worker registered successfully:', registration.scope)
        }

        // Check for updates immediately
        if (registration.update) {
          registration.update()
        }

        // Listen for updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // New version available - activate immediately
                console.log('🔄 New version available, updating...')
                if (newWorker && newWorker.postMessage) {
                  newWorker.postMessage({ type: 'SKIP_WAITING' })
                }
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
        console.error('❌ Service Worker registration failed:', error)
        console.error('Error details:', {
          name: error instanceof Error ? error.name : 'Unknown',
          message: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined
        })
      }
    }

    // Register with delay to ensure page is fully loaded
    const registerWithDelay = () => {
      setTimeout(() => {
        registerSW()
      }, 1000) // 1 second delay
    }

    // Register on load
    if (document.readyState === 'complete') {
      registerWithDelay()
    } else {
      window.addEventListener('load', registerWithDelay)
    }

    return () => {
      window.removeEventListener('load', registerWithDelay)
    }
  }, [])

  return null
}

