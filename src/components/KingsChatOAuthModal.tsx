'use client'

import { useState } from 'react'
import { X, Loader2, ExternalLink, CheckCircle } from 'lucide-react'
import { FirebaseDatabaseService } from '@/lib/firebase-database'

interface KingsChatOAuthModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: (authData: any) => void
  onError: (error: string) => void
}

export default function KingsChatOAuthModal({ 
  isOpen, 
  onClose, 
  onSuccess 
}: KingsChatOAuthModalProps) {
  const [isLoading] = useState(false)
  const [error, setError] = useState('')
  const [sessionId] = useState(() => Math.random().toString(36).substring(7))
  const [showOtpInput, setShowOtpInput] = useState(false)
  const [otp, setOtp] = useState('')
  const [verifyingOtp, setVerifyingOtp] = useState(false)

  // No cleanup needed for OTP approach

  const startKingsChatAuth = () => {
    setError('')
    
    // Create auth URL to our brilliant dedicated page
    const authUrl = `/auth/kingschat-login?session=${sessionId}`
    
    // Detect if we're in a WebView or regular browser
    const isWebView = navigator.userAgent.includes('wv') || (window as any).ReactNativeWebView
    
    if (isWebView) {
      // WebView: Navigate in same window to our auth page
      window.location.href = authUrl
    } else {
      // Regular browser: Open our auth page in new tab
      const authWindow = window.open(authUrl, '_blank')
      
      if (!authWindow) {
        setError('Popup blocked. Please allow popups for this site.')
        return
      }
      
      // Show OTP input after opening our brilliant page
      setShowOtpInput(true)
    }
  }

  const verifyOtp = async () => {
    if (!otp || otp.length !== 6) {
      setError('Please enter a valid 6-digit code')
      return
    }

    setVerifyingOtp(true)
    setError('')

    try {
      // Check Firebase for auth result with matching OTP
      let result = await FirebaseDatabaseService.getDocument('kingschat_auth_sessions', sessionId) as any
      
      // Fallback: Check localStorage if Firebase is offline
      if (!result) {
        try {
          const fallbackKey = `kingschat_auth_${sessionId}`
          const fallbackData = localStorage.getItem(fallbackKey)
          if (fallbackData) {
            result = JSON.parse(fallbackData)
            console.log('📱 Using localStorage fallback data')
          }
        } catch (localStorageError) {
          console.warn('⚠️ Failed to read from localStorage:', localStorageError)
        }
      }
      
      if (result && result.processed && result.success && result.otp === otp) {
        // OTP matches! Authentication successful
        console.log('✅ OTP verified successfully')
        
        // Extract KingsChat ID from the auth data
        const kingschatUserId = result.authData?.userProfile?.userId || result.authData?.userProfile?.id
        
        if (kingschatUserId) {
          console.log('🔐 Extracted KingsChat ID:', kingschatUserId)
          
          // Update the session with the KingsChat ID for the auth page to use
          await FirebaseDatabaseService.updateDocument('kingschat_auth_sessions', sessionId, {
            verified: true,
            verifiedAt: Date.now(),
            kingschatUserId: kingschatUserId // Save the KingsChat ID
          })
        }
        
        onSuccess({
          accessToken: `kc_token_${result.authData.code}`,
          refreshToken: `kc_refresh_${result.authData.code}`,
          expiresIn: 3600,
          userProfile: result.authData.userProfile,
          kingschatUserId: kingschatUserId // Pass the KingsChat ID
        })
        
        // Cleanup Firebase session
        try {
          await FirebaseDatabaseService.deleteDocument('kingschat_auth_sessions', sessionId)
        } catch (deleteError) {
          console.warn('⚠️ Failed to delete Firebase session:', deleteError)
        }
        
        // Cleanup localStorage fallback
        try {
          const fallbackKey = `kingschat_auth_${sessionId}`
          localStorage.removeItem(fallbackKey)
        } catch (localStorageError) {
          console.warn('⚠️ Failed to cleanup localStorage:', localStorageError)
        }
        
        onClose()
      } else if (result && result.processed && !result.success) {
        setError('Authentication failed. Please try again.')
      } else if (result && result.otp && result.otp !== otp) {
        setError('Invalid verification code. Please check and try again.')
      } else {
        setError('Authentication not found. Please complete authentication first.')
      }
    } catch (error) {
      console.error('OTP verification error:', error)
      setError('Failed to verify code. Please try again.')
    } finally {
      setVerifyingOtp(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
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
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Error State */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="text-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-purple-600 mx-auto mb-3" />
              <p className="text-gray-600 text-sm">
                Authenticating with KingsChat...
              </p>
              <p className="text-xs text-gray-500 mt-2">
                Complete authentication in the popup window
              </p>
            </div>
          )}

          {/* Auth Button */}
          {!showOtpInput && !isLoading && (
            <div className="space-y-4">
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <img 
                    src="/kingschat.jpeg" 
                    alt="KingsChat" 
                    className="w-10 h-10 rounded-full object-cover"
                  />
                </div>
                <h4 className="font-medium text-gray-900 mb-2">Ready to authenticate</h4>
                <p className="text-sm text-gray-600 mb-6">
                  Click below to sign in with your KingsChat account
                </p>
              </div>
              
              <button
                onClick={startKingsChatAuth}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-3 py-3 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <img 
                  src="/kingschat.jpeg" 
                  alt="KingsChat" 
                  className="w-5 h-5 rounded-full object-cover"
                />
                Continue with KingsChat
                <ExternalLink className="w-4 h-4" />
              </button>
              
              <div className="text-xs text-gray-500 text-center space-y-1">
                <p>Secure authentication via KingsChat OAuth</p>
                <p>Session ID: {sessionId}</p>
              </div>
            </div>
          )}

          {/* OTP Input */}
          {showOtpInput && (
            <div className="space-y-4">
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h4 className="font-medium text-gray-900 mb-2">Enter Verification Code</h4>
                <p className="text-sm text-gray-600 mb-6">
                  Complete authentication in the new tab, then enter the 6-digit code here
                </p>
              </div>
              
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="000000"
                  value={otp}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '').slice(0, 6)
                    setOtp(value)
                    setError('')
                  }}
                  className="w-full px-4 py-3 text-center text-2xl font-mono tracking-widest bg-gray-100 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-purple-600"
                  maxLength={6}
                />
                
                <button
                  onClick={verifyOtp}
                  disabled={otp.length !== 6 || verifyingOtp}
                  className="w-full py-3 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {verifyingOtp && <Loader2 className="w-4 h-4 animate-spin" />}
                  {verifyingOtp ? 'Verifying...' : 'Verify & Sign In'}
                </button>
                
                <button
                  onClick={() => {
                    setShowOtpInput(false)
                    setOtp('')
                    setError('')
                  }}
                  className="w-full py-2 text-gray-600 text-sm hover:text-gray-800 transition-colors"
                >
                  ← Back to authentication
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}