// Offline Indicator - Shows when user needs to connect to internet
// Instagram-style offline UI

'use client'

import React, { useState, useEffect } from 'react'
import { Wifi, WifiOff, AlertCircle, RefreshCw } from 'lucide-react'

interface OfflineIndicatorProps {
  className?: string
}

export default function OfflineIndicator({ className = '' }: OfflineIndicatorProps) {
  const [isOnline, setIsOnline] = useState(true)
  const [showOfflineBanner, setShowOfflineBanner] = useState(false)
  const [connectionType, setConnectionType] = useState<string>('')

  useEffect(() => {
    // Check initial connection status
    setIsOnline(navigator.onLine)
    
    // Get connection type if available
    if ('connection' in navigator) {
      const connection = (navigator as any).connection
      setConnectionType(connection.effectiveType || 'unknown')
    }

    // Listen for online/offline events
    const handleOnline = () => {
      setIsOnline(true)
      setShowOfflineBanner(false)
      console.log('🌐 Connection restored')
    }

    const handleOffline = () => {
      setIsOnline(false)
      setShowOfflineBanner(true)
      console.log('📴 Connection lost')
    }

    // Listen for connection changes
    const handleConnectionChange = () => {
      if ('connection' in navigator) {
        const connection = (navigator as any).connection
        setConnectionType(connection.effectiveType || 'unknown')
      }
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    
    if ('connection' in navigator) {
      const connection = (navigator as any).connection
      connection.addEventListener('change', handleConnectionChange)
    }

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
      
      if ('connection' in navigator) {
        const connection = (navigator as any).connection
        connection.removeEventListener('change', handleConnectionChange)
      }
    }
  }, [])

  const handleRetry = () => {
    if (navigator.onLine) {
      setShowOfflineBanner(false)
      // Trigger a page refresh to reload data
      window.location.reload()
    }
  }

  // Don't show anything if online
  if (isOnline && !showOfflineBanner) {
    return null
  }

  return (
    <>
      {/* Fixed Offline Banner */}
      <div className={`fixed top-0 left-0 right-0 z-50 bg-red-500 text-white px-4 py-3 shadow-lg ${className}`}>
        <div className="flex items-center justify-between max-w-2xl mx-auto">
          <div className="flex items-center gap-3">
            <WifiOff className="w-5 h-5 flex-shrink-0" />
            <div>
              <p className="font-semibold text-sm">No Internet Connection</p>
              <p className="text-xs opacity-90">
                Please connect to the internet to continue
                {connectionType && ` (${connectionType})`}
              </p>
            </div>
          </div>
          <button
            onClick={handleRetry}
            className="flex items-center gap-2 bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Retry
          </button>
        </div>
      </div>

      {/* Offline Overlay */}
      {!isOnline && (
        <div className="fixed inset-0 bg-black/50 z-40 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full text-center shadow-2xl">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <WifiOff className="w-8 h-8 text-red-500" />
            </div>
            
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              You're Offline
            </h3>
            
            <p className="text-gray-600 text-sm mb-4">
              Please check your internet connection and try again.
            </p>
            
            <div className="space-y-3">
              <button
                onClick={handleRetry}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2.5 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Try Again
              </button>
              
              <div className="text-xs text-gray-500">
                Connection: {connectionType || 'Unknown'}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Low Data Warning */}
      {isOnline && connectionType && (connectionType === 'slow-2g' || connectionType === '2g') && (
        <div className="fixed top-16 left-0 right-0 z-40 bg-yellow-500 text-white px-4 py-2 shadow-lg">
          <div className="flex items-center justify-center gap-2 max-w-2xl mx-auto">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <p className="text-xs font-medium">
              Slow connection detected - Using optimized mode for better performance
            </p>
      </div>
    </div>
      )}
    </>
  )
}