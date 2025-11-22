'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Loader2, CheckCircle, XCircle } from 'lucide-react'
import { FirebaseDatabaseService } from '@/lib/firebase-database'

export default function KingsChatLoginCallbackPage() {
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
        await saveAuthResult(sessionId, false, `Authentication failed: ${error}`)
        setStatus('error')
        setMessage(`Authentication failed: ${error}`)
        return
      }

      if (!code || !sessionId) {
        await saveAuthResult(sessionId, false, 'Missing authentication code or session')
        setStatus('error')
        setMessage('Invalid authentication response')
        return
      }

      // Save successful authentication to Firebase
      const authData = {
        code: code,
        sessionId: sessionId,
        state: state,
        timestamp: Date.now(),
        userProfile: {
          userId: code, // Use code as unique identifier
          id: code,
          email: '',
          firstName: 'KingsChat',
          lastName: 'User',
          name: 'KingsChat User',
          profilePicture: '/kingschat.jpeg',
          verified: true
        }
      }

      await saveAuthResult(sessionId, true, 'Authentication successful', authData)
      
      setStatus('success')
      setMessage('Authentication successful! You can close this page.')
      
      // Auto-close after 3 seconds
      setTimeout(() => {
        window.close()
      }, 3000)

    } catch (error: any) {
      console.error('Callback processing error:', error)
      await saveAuthResult(searchParams.get('session'), false, 'Failed to process authentication')
      setStatus('error')
      setMessage('Failed to process authentication')
    }
  }

  const saveAuthResult = async (sessionId: string | null, success: boolean, message: string, authData?: any) => {
    if (!sessionId) return

    try {
      // Save to Firebase with session ID as document ID
      await FirebaseDatabaseService.createDocument('kingschat_auth_sessions', sessionId, {
        success,
        message,
        authData: authData || null,
        timestamp: Date.now(),
        processed: true
      })
      
      console.log(`✅ Auth result saved for session ${sessionId}:`, { success, message })
    } catch (error) {
      console.error('Failed to save auth result:', error)
    }
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

        {status === 'success' && (
          <p className="text-sm text-gray-500">
            This page will close automatically in a few seconds.
          </p>
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