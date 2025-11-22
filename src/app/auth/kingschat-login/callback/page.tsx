'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Loader2, CheckCircle, XCircle } from 'lucide-react'
import { FirebaseDatabaseService } from '@/lib/firebase-database'

function KingsChatLoginCallbackContent() {
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing')
  const [message, setMessage] = useState('Processing authentication...')

  useEffect(() => {
    handleCallback()
  }, [])

  const handleCallback = async () => {
    try {
      const code = searchParams.get('code')
      const error = searchParams.get('error')
      const sessionId = searchParams.get('session')
      const state = searchParams.get('state')

      if (error) {
        setStatus('error')
        setMessage(`Authentication failed: ${error}`)
        await saveAuthResult(sessionId, false, `Authentication failed: ${error}`)
        return
      }

      if (!code || !sessionId) {
        setStatus('error')
        setMessage('Invalid authentication response')
        await saveAuthResult(sessionId, false, 'Missing authentication code or session')
        return
      }

      // Exchange code for tokens first
      setMessage('Exchanging authorization code for tokens...')
      
      const tokenResponse = await fetch('/api/auth/kingschat/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code,
          client_id: process.env.NEXT_PUBLIC_KINGSCHAT_CLIENT_ID || '331c9eda-a130-4bb8-9a00-9231a817207d',
          redirect_uri: `${window.location.origin}/auth/kingschat-login/callback?session=${sessionId}`
        })
      })

      if (!tokenResponse.ok) {
        throw new Error('Failed to exchange code for tokens')
      }

      const tokenData = await tokenResponse.json()
      
      if (tokenData.error) {
        throw new Error(tokenData.error)
      }

      setMessage('Decoding user information...')
      
      // Decode JWT token to get user info (like the working app)
      const { jwtDecode } = await import('jwt-decode')
      const decoded: any = jwtDecode(tokenData.access_token)
      
      const kingschatUserId = decoded.userId || decoded.sub || decoded.id
      
      if (!kingschatUserId) {
        throw new Error('Could not extract user ID from token')
      }
      
      // Generate 6-digit OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString()
      
      // Save successful authentication to Firebase with OTP
      const authData = {
        code: code,
        sessionId: sessionId,
        state: state,
        otp: otp,
        timestamp: Date.now(),
        accessToken: tokenData.access_token,
        refreshToken: tokenData.refresh_token,
        userProfile: {
          userId: kingschatUserId,
          id: kingschatUserId,
          email: decoded.email || decoded.emailAddress || '',
          firstName: decoded.firstName || decoded.first_name || 'KingsChat',
          lastName: decoded.lastName || decoded.last_name || 'User',
          name: decoded.name || `${decoded.firstName || ''} ${decoded.lastName || ''}`.trim() || 'KingsChat User',
          profilePicture: decoded.profilePicture || decoded.picture || '/kingschat.jpeg',
          verified: decoded.verified || true
        }
      }

      await saveAuthResult(sessionId, true, 'Authentication successful!', authData, otp)
      
      setStatus('success')
      setMessage(`Authentication successful! Use this code in the app: ${otp}`)

    } catch (error: any) {
      console.error('Callback processing error:', error)
      setStatus('error')
      setMessage('Failed to process authentication')
      await saveAuthResult(searchParams.get('session'), false, 'Failed to process authentication')
    }
  }

  const saveAuthResult = async (sessionId: string | null, success: boolean, message: string, authData?: any, otp?: string) => {
    if (!sessionId) return

    try {
      // Save to Firebase with session ID as document ID
      await FirebaseDatabaseService.createDocument('kingschat_auth_sessions', sessionId, {
        success,
        message,
        authData: authData || null,
        otp: otp || null,
        timestamp: Date.now(),
        processed: true,
        verified: false // OTP not verified yet
      })
      
      console.log(`✅ Auth result saved for session ${sessionId}:`, { success, message, otp })
    } catch (error) {
      console.error('Failed to save auth result:', error)
    }
  }

  const goBackToApp = () => {
    window.location.href = '/auth'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
        {/* Icon */}
        <div className="mb-6">
          {status === 'processing' && (
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
          {status === 'processing' && 'Processing...'}
          {status === 'success' && 'Success!'}
          {status === 'error' && 'Error'}
        </h2>
        <p className="text-gray-600 mb-6">
          {message}
        </p>

        {/* Action Button */}
        {(status === 'success' || status === 'error') && (
          <button
            onClick={goBackToApp}
            className="w-full py-3 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-700 transition-colors mb-4"
          >
            Go Back to App
          </button>
        )}

        {status === 'success' && (
          <div className="space-y-4">
            <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
              <p className="text-green-700 text-sm font-medium mb-2">
                🎉 Authentication Successful!
              </p>
              <p className="text-green-600 text-xs">
                Enter this verification code in the app:
              </p>
            </div>
            
            {/* OTP Display */}
            <div className="p-6 bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl">
              <div className="text-center">
                <p className="text-xs text-gray-500 mb-2">Verification Code</p>
                <div className="text-3xl font-mono font-bold text-purple-600 tracking-widest">
                  {message.split(': ')[1]}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  This code expires in 10 minutes
                </p>
              </div>
            </div>
            
            <div className="text-center">
              <p className="text-sm text-gray-600">
                Copy this code and paste it in the app to complete login
              </p>
            </div>
          </div>
        )}

        {/* KingsChat Branding */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
            <img 
              src="/kingschat.jpeg" 
              alt="KingsChat" 
              className="w-5 h-5 rounded-full object-cover"
            />
            <span>Powered by KingsChat</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function KingsChatLoginCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
          <Loader2 className="w-16 h-16 text-purple-600 animate-spin mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Loading...</h2>
          <p className="text-gray-600">Processing authentication callback</p>
        </div>
      </div>
    }>
      <KingsChatLoginCallbackContent />
    </Suspense>
  )
}