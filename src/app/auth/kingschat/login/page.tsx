'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Loader2, CheckCircle, XCircle, ArrowLeft } from 'lucide-react'
import { FirebaseDatabaseService } from '@/lib/firebase-database'

function KingsChatLoginContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [status, setStatus] = useState<'loading' | 'authenticating' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('Preparing KingsChat authentication...')
  const [sessionId] = useState(() => searchParams.get('session') || Math.random().toString(36).substring(7))

  useEffect(() => {
    // Start OAuth flow immediately
    startOAuthFlow()
  }, [])

  const startOAuthFlow = () => {
    const KINGSCHAT_CLIENT_ID = process.env.NEXT_PUBLIC_KINGSCHAT_CLIENT_ID || '331c9eda-a130-4bb8-9a00-9231a817207d'
    const REDIRECT_URI = `${window.location.origin}/auth/kingschat/login/callback?session=${sessionId}`
    
    const params = new URLSearchParams({
      client_id: KINGSCHAT_CLIENT_ID,
      redirect_uri: REDIRECT_URI,
      response_type: 'code',
      scope: 'profile email',
      state: sessionId
    })

    const authUrl = `https://kingschat.online/oauth/authorize?${params.toString()}`
    
    setStatus('authenticating')
    setMessage('Redirecting to KingsChat...')
    
    // Small delay for better UX
    setTimeout(() => {
      window.location.href = authUrl
    }, 1000)
  }

  const goBack = () => {
    // Go back to auth page
    router.push('/auth')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
        {/* Back Button */}
        <button
          onClick={goBack}
          className="absolute top-4 left-4 p-2 text-white hover:bg-white/20 rounded-full transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        {/* KingsChat Branding */}
        <div className="flex items-center justify-center mb-6">
          <img 
            src="/kingschat.jpeg" 
            alt="KingsChat" 
            className="w-16 h-16 rounded-full object-cover"
          />
        </div>

        {/* Status Icon */}
        <div className="mb-6">
          {status === 'loading' && (
            <Loader2 className="w-16 h-16 text-purple-600 animate-spin mx-auto" />
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
          {status === 'loading' && 'Preparing...'}
          {status === 'authenticating' && 'Authenticating'}
          {status === 'success' && 'Success!'}
          {status === 'error' && 'Authentication Failed'}
        </h2>
        <p className="text-gray-600 mb-6">
          {message}
        </p>

        {/* Session Info */}
        <div className="text-xs text-gray-400 mt-8">
          Session: {sessionId}
        </div>
      </div>
    </div>
  )
}

export default function KingsChatLoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
          <div className="flex items-center justify-center mb-6">
            <img 
              src="/kingschat.jpeg" 
              alt="KingsChat" 
              className="w-16 h-16 rounded-full object-cover"
            />
          </div>
          <Loader2 className="w-16 h-16 text-purple-600 animate-spin mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Loading...</h2>
          <p className="text-gray-600">Preparing KingsChat authentication</p>
        </div>
      </div>
    }>
      <KingsChatLoginContent />
    </Suspense>
  )
}