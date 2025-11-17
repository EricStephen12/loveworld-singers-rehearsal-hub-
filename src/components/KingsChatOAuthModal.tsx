'use client'

import { useState, useEffect, useRef } from 'react'
import { X, Loader2 } from 'lucide-react'

interface KingsChatOAuthModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: (authData: any) => void
  onError: (error: string) => void
}

export default function KingsChatOAuthModal({ 
  isOpen, 
  onClose, 
  onSuccess, 
  onError 
}: KingsChatOAuthModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [authUrl, setAuthUrl] = useState('')
  const [error, setError] = useState('')
  const iframeRef = useRef<HTMLIFrameElement>(null)

  // KingsChat OAuth configuration
  const KINGSCHAT_CLIENT_ID = process.env.NEXT_PUBLIC_KINGSCHAT_CLIENT_ID || '331c9eda-a130-4bb8-9a00-9231a817207d'
  const REDIRECT_URI = typeof window !== 'undefined' ? `${window.location.origin}/auth/kingschat/callback` : ''

  useEffect(() => {
    if (isOpen && REDIRECT_URI) {
      generateAuthUrl()
    }
  }, [isOpen, REDIRECT_URI])

  const generateAuthUrl = () => {
    const params = new URLSearchParams({
      client_id: KINGSCHAT_CLIENT_ID,
      redirect_uri: REDIRECT_URI,
      response_type: 'code',
      scope: 'profile email',
      state: Math.random().toString(36).substring(7) // Random state for security
    })

    const url = `https://kingschat.online/oauth/authorize?${params.toString()}`
    console.log('🔗 Generated KingsChat OAuth URL:', url)
    setAuthUrl(url)
    setIsLoading(true)
  }

  const handleIframeLoad = () => {
    console.log('📱 OAuth iframe loaded')
    setIsLoading(false)
    
    // Listen for postMessage from the callback page
    window.addEventListener('message', handlePostMessage)
  }

  const handlePostMessage = (event: MessageEvent) => {
    try {
      // Verify origin for security
      if (event.origin !== window.location.origin) {
        console.warn('🚨 Ignoring message from unknown origin:', event.origin)
        return
      }

      console.log('📨 Received postMessage:', event.data)

      if (event.data && event.data.type === 'KINGSCHAT_AUTH_SUCCESS') {
        console.log('✅ OAuth success via postMessage')
        if (event.data.code) {
          handleAuthSuccess(event.data.code)
        } else {
          onError('No authorization code received')
          onClose()
        }
      } else if (event.data && event.data.type === 'KINGSCHAT_AUTH_ERROR') {
        console.error('❌ OAuth error via postMessage:', event.data.error)
        onError(`Authentication failed: ${event.data.description || event.data.error}`)
        onClose()
      }
    } catch (error: any) {
      console.error('❌ PostMessage handling error:', error)
      onError('Error processing authentication response')
      onClose()
    }
  }

  const handleAuthSuccess = async (authCode: string) => {
    try {
      setIsLoading(true)
      console.log('🔄 Processing authorization code...')

      // Use the authorization code as the KingsChat ID (just like in original signup)
      // This is what we did before - the code itself becomes the unique identifier
      const kingschatUserId = authCode
      
      console.log('🔐 Using authorization code as KingsChat ID:', kingschatUserId.substring(0, 10) + '...')

      // Create a simple profile using the auth code as the ID
      const userProfile = {
        userId: kingschatUserId,
        id: kingschatUserId,
        email: 'user@kingschat.com', // Can be updated later
        firstName: 'KingsChat',
        lastName: 'User',
        name: 'KingsChat User',
        profilePicture: '/kingschat.jpeg',
        verified: true
      }

      console.log('✅ KingsChat profile created using auth code as ID')

      // Return success with auth data
      onSuccess({
        accessToken: kingschatUserId, // Use the code as token too
        refreshToken: `refresh_${kingschatUserId}`,
        expiresIn: 3600,
        userProfile: userProfile
      })

      onClose()
    } catch (error: any) {
      console.error('❌ Auth processing error:', error)
      onError(error.message || 'Authentication processing failed')
      onClose()
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    // Clean up event listeners
    window.removeEventListener('message', handlePostMessage)
    
    setError('')
    setIsLoading(false)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md h-[600px] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <img 
              src="/kingschat.jpeg" 
              alt="KingsChat" 
              className="w-8 h-8 rounded-full object-cover"
            />
            <div>
              <h3 className="font-semibold text-gray-900">Sign in with KingsChat</h3>
              <p className="text-sm text-gray-500">Secure authentication</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin text-purple-600 mx-auto mb-3" />
              <p className="text-gray-600 text-sm">
                {authUrl ? 'Processing authentication...' : 'Loading KingsChat login...'}
              </p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="flex-1 flex items-center justify-center p-4">
            <div className="text-center">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <X className="w-6 h-6 text-red-600" />
              </div>
              <p className="text-red-600 text-sm mb-4">{error}</p>
              <button
                onClick={() => {
                  setError('')
                  generateAuthUrl()
                }}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        )}

        {/* OAuth Iframe */}
        {authUrl && !error && (
          <div className="flex-1 relative">
            <iframe
              ref={iframeRef}
              src={authUrl}
              className="w-full h-full border-0"
              onLoad={handleIframeLoad}
              onError={() => {
                setError('Failed to load KingsChat login page')
                setIsLoading(false)
              }}
              title="KingsChat OAuth"
              sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-top-navigation"
            />
          </div>
        )}

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <p className="text-xs text-gray-500 text-center">
            By continuing, you agree to KingsChat's terms of service and privacy policy.
          </p>
        </div>
      </div>
    </div>
  )
}