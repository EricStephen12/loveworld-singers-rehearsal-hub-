'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Loader2, CheckCircle, XCircle, ArrowLeft } from 'lucide-react'
import { FirebaseDatabaseService } from '@/lib/firebase-database'
import { KingsChatAuthService } from '@/lib/kingschat-auth'

export default function KingsChatLoginPage() {
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<'ready' | 'authenticating' | 'success' | 'error'>('ready')
  const [message, setMessage] = useState('Ready to authenticate with KingsChat')
  const [sessionId] = useState(() => searchParams.get('session') || Math.random().toString(36).substring(7))

  // Don't auto-start OAuth - wait for user to click button

  const startOAuthFlow = async () => {
    setStatus('authenticating')
    setMessage('Opening KingsChat authentication...')
    
    try {
      console.log('🚀 Starting KingsChat OAuth with SDK from auth page...')
      
      // Use the proper KingsChat SDK (like the working app)
      const authTokens = await KingsChatAuthService.login()
      
      if (!authTokens) {
        setStatus('error')
        setMessage('KingsChat login was cancelled. Please try again.')
        return
      }
      
      setMessage('Processing authentication...')
      
      // Decode the access token to get user info (like working app)
      const userProfile = await KingsChatAuthService.getUserProfile(authTokens.accessToken)
      
      if (!userProfile.userId) {
        setStatus('error')
        setMessage('Could not extract user ID from KingsChat token')
        return
      }
      
      console.log('🔐 KingsChat User ID:', userProfile.userId)
      
      // Generate 6-digit OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString()
      
      // Save successful authentication to Firebase with OTP
      const authData = {
        code: userProfile.userId,
        sessionId: sessionId,
        otp: otp,
        timestamp: Date.now(),
        accessToken: authTokens.accessToken,
        refreshToken: authTokens.refreshToken,
        userProfile: {
          userId: userProfile.userId,
          id: userProfile.userId,
          email: userProfile.email || '',
          firstName: userProfile.firstName || 'KingsChat',
          lastName: userProfile.lastName || 'User',
          name: userProfile.name || 'KingsChat User',
          profilePicture: userProfile.profilePicture || '/kingschat.jpeg',
          verified: userProfile.verified || true
        }
      }

      await saveAuthResult(sessionId, true, `Authentication successful! Use this code: ${otp}`, authData, otp)
      
      setStatus('success')
      setMessage(`Authentication successful! Use this code in the app: ${otp}`)
      
    } catch (error: any) {
      console.error('❌ KingsChat OAuth error:', error)
      setStatus('error')
      setMessage(error.message || 'KingsChat authentication failed')
      await saveAuthResult(sessionId, false, error.message || 'Authentication failed')
    }
  }

  const saveAuthResult = async (sessionId: string, success: boolean, message: string, authData?: any, otp?: string) => {
    const dataToSave = {
      success,
      message,
      authData: authData || null,
      otp: otp || null,
      timestamp: Date.now(),
      processed: true,
      verified: false // OTP not verified yet
    }
    
    try {
      console.log(`🔄 Saving auth result for session ${sessionId}...`)
      console.log('📝 Data to save:', dataToSave)
      
      // Save to Firebase with session ID as document ID
      await FirebaseDatabaseService.createDocument('kingschat_auth_sessions', sessionId, dataToSave)
      
      console.log(`✅ Auth result saved successfully for session ${sessionId}`)
      
      // Verify it was saved by reading it back (with retry logic)
      let retries = 3
      let savedData = null
      
      while (retries > 0 && !savedData) {
        try {
          savedData = await FirebaseDatabaseService.getDocument('kingschat_auth_sessions', sessionId)
          if (savedData) {
            console.log('🔍 Verification - saved data:', savedData)
            break
          }
        } catch (verifyError) {
          console.warn(`⚠️ Verification attempt failed, retries left: ${retries - 1}`)
          retries--
          if (retries > 0) {
            await new Promise(resolve => setTimeout(resolve, 1000))
          }
        }
      }
      
      if (!savedData) {
        console.warn('⚠️ Could not verify data was saved, but continuing anyway')
      }
      
    } catch (error) {
      console.error('❌ Failed to save auth result:', error)
      
      // Fallback: Save to localStorage if Firebase is offline
      try {
        const fallbackKey = `kingschat_auth_${sessionId}`
        localStorage.setItem(fallbackKey, JSON.stringify(dataToSave))
        console.log('💾 Saved auth result to localStorage as fallback')
      } catch (localStorageError) {
        console.error('❌ Failed to save to localStorage:', localStorageError)
      }
      
      // Don't fail the entire auth flow if Firebase is offline
      // The OTP is still valid and can be used
      console.log('⚠️ Continuing with auth flow despite Firebase save error')
      
      // Only set error status if this is a critical failure
      if (error instanceof Error && error.message.includes('offline')) {
        console.log('📱 Firebase is offline, but authentication was successful')
      } else {
        setStatus('error')
        setMessage('Failed to save authentication result. Please try again.')
      }
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center relative">

        {/* Status Icon */}
        <div className="mb-6">
          {status === 'ready' && (
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
              <img 
                src="/kingschat.jpeg" 
                alt="KingsChat" 
                className="w-10 h-10 rounded-full object-cover"
              />
            </div>
          )}
          {status === 'authenticating' && (
            <Loader2 className="w-16 h-16 text-purple-600 animate-spin mx-auto" />
          )}
          {status === 'success' && (
            <CheckCircle className="w-16 h-16 text-green-600 mx-auto" />
          )}
          {status === 'error' && (
            <XCircle className="w-16 h-16 text-red-600 mx-auto" />
          )}
        </div>

        {/* Message */}
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {status === 'ready' && 'Sign in with KingsChat'}
          {status === 'authenticating' && 'Authenticating'}
          {status === 'success' && 'Success!'}
          {status === 'error' && 'Authentication Failed'}
        </h2>
        <p className="text-gray-600 mb-6">
          {message}
        </p>

        {/* Action Buttons */}
        {status === 'ready' && (
          <button
            onClick={startOAuthFlow}
            className="w-full py-3 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-700 transition-colors mb-4 flex items-center justify-center gap-3"
          >
            <img 
              src="/kingschat.jpeg" 
              alt="KingsChat" 
              className="w-5 h-5 rounded-full object-cover"
            />
            Continue with KingsChat
          </button>
        )}

        {status === 'authenticating' && (
          <div className="text-center">
            <p className="text-sm text-gray-500">
              Authenticating with KingsChat...
            </p>
          </div>
        )}

        {status === 'success' && (
          <div className="space-y-4">
            {/* OTP Display */}
            <div className="p-6 bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl">
              <div className="text-center">
                <p className="text-xs text-gray-500 mb-2">Verification Code</p>
                <div className="text-3xl font-mono font-bold text-purple-600 tracking-widest">
                  {message.split(': ')[1]}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Enter this code in the app
                </p>
              </div>
            </div>
            
            <div className="w-full py-3 bg-gray-100 text-gray-400 rounded-xl font-medium cursor-not-allowed">
              Go Back to App
            </div>
          </div>
        )}

        {status === 'error' && (
          <button
            onClick={() => {
              setStatus('ready')
              setMessage('Ready to authenticate with KingsChat')
            }}
            className="w-full py-3 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-700 transition-colors"
          >
            Try Again
          </button>
        )}

        {/* Session Info */}
        <div className="text-xs text-gray-400 mt-8">
          Session: {sessionId}
        </div>
      </div>
    </div>
  )
}