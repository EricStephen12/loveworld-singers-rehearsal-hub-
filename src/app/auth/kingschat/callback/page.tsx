'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Loader2, CheckCircle, XCircle } from 'lucide-react'

function KingsChatCallbackContent() {
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')

  useEffect(() => {
    try {
      const code = searchParams.get('code')
      const error = searchParams.get('error')
      const errorDescription = searchParams.get('error_description')

      console.log('🔄 KingsChat OAuth callback received')
      console.log('📋 Code:', code ? 'Present' : 'Missing')
      console.log('❌ Error:', error)

      if (error) {
        setStatus('error')
        setMessage(errorDescription || error || 'Authentication failed')
        
        // Notify parent window about the error
        if (window.parent && window.parent !== window) {
          window.parent.postMessage({
            type: 'KINGSCHAT_AUTH_ERROR',
            error: error,
            description: errorDescription
          }, '*')
        }
      } else if (code) {
        setStatus('success')
        setMessage('Authentication successful! Processing...')
        
        // Notify parent window about success
        if (window.parent && window.parent !== window) {
          window.parent.postMessage({
            type: 'KINGSCHAT_AUTH_SUCCESS',
            code: code
          }, '*')
        }
      } else {
        setStatus('error')
        setMessage('No authorization code received')
        
        if (window.parent && window.parent !== window) {
          window.parent.postMessage({
            type: 'KINGSCHAT_AUTH_ERROR',
            error: 'no_code',
            description: 'No authorization code received'
          }, '*')
        }
      }
    } catch (error: any) {
      console.error('❌ Callback processing error:', error)
      setStatus('error')
      setMessage('Error processing authentication callback')
      
      if (window.parent && window.parent !== window) {
        window.parent.postMessage({
          type: 'KINGSCHAT_AUTH_ERROR',
          error: 'callback_error',
          description: 'Error processing authentication callback'
        }, '*')
      }
    }
  }, [searchParams])

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center">
        <div className="mb-6">
          <img 
            src="/kingschat.jpeg" 
            alt="KingsChat" 
            className="w-16 h-16 rounded-full object-cover mx-auto mb-4"
          />
          <h1 className="text-xl font-bold text-gray-900 mb-2">
            KingsChat Authentication
          </h1>
        </div>

        {status === 'loading' && (
          <div className="space-y-4">
            <Loader2 className="w-12 h-12 animate-spin text-purple-600 mx-auto" />
            <p className="text-gray-600">Processing authentication...</p>
          </div>
        )}

        {status === 'success' && (
          <div className="space-y-4">
            <CheckCircle className="w-12 h-12 text-green-600 mx-auto" />
            <div>
              <p className="text-green-600 font-semibold mb-2">Success!</p>
              <p className="text-gray-600 text-sm">{message}</p>
            </div>
          </div>
        )}

        {status === 'error' && (
          <div className="space-y-4">
            <XCircle className="w-12 h-12 text-red-600 mx-auto" />
            <div>
              <p className="text-red-600 font-semibold mb-2">Authentication Failed</p>
              <p className="text-gray-600 text-sm">{message}</p>
            </div>
            <button
              onClick={() => window.close()}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
            >
              Close
            </button>
          </div>
        )}

        <div className="mt-6 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            This window will close automatically
          </p>
        </div>
      </div>
    </div>
  )
}

export default function KingsChatCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center">
          <Loader2 className="w-12 h-12 animate-spin text-purple-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <KingsChatCallbackContent />
    </Suspense>
  )
}