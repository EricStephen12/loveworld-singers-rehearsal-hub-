'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Loader2, CheckCircle, XCircle } from 'lucide-react'

function KingsChatCallbackContent() {
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing')
  const [message, setMessage] = useState('Processing authentication...')

  useEffect(() => {
    const code = searchParams.get('code')
    const error = searchParams.get('error')
    const errorDescription = searchParams.get('error_description')

    if (error) {
      setStatus('error')
      setMessage(errorDescription || error || 'Authentication failed')
      
      // Send error to opener window
      if (window.opener) {
        window.opener.postMessage({
          type: 'KINGSCHAT_AUTH_ERROR',
          error: error,
          description: errorDescription
        }, window.location.origin)
        
        // Close popup after a delay
        setTimeout(() => {
          window.close()
        }, 2000)
      }
      return
    }

    if (code) {
      setStatus('success')
      setMessage('Authentication successful! Redirecting...')
      
      // Send success to opener window (popup flow)
      if (window.opener) {
        window.opener.postMessage({
          type: 'KINGSCHAT_AUTH_SUCCESS',
          code: code
        }, window.location.origin)
        
        // Close popup after a short delay
        setTimeout(() => {
          window.close()
        }, 1000)
      } else {
        // Check if this is from WebView redirect or regular redirect
        const returnUrl = localStorage.getItem('oauth_return_url')
        if (returnUrl) {
          localStorage.removeItem('oauth_return_url')
          // Store auth code for the return page to process
          localStorage.setItem('kingschat_auth_code', code)
          setMessage('Authentication successful! Returning to app...')
          setTimeout(() => {
            window.location.href = returnUrl
          }, 1000)
        } else {
          // Regular redirect flow
          const kingschatReturnUrl = localStorage.getItem('kingschat_return_url')
          if (kingschatReturnUrl) {
            localStorage.removeItem('kingschat_return_url')
            localStorage.setItem('kingschat_auth_code', code)
            setMessage('Redirecting back to app...')
            setTimeout(() => {
              window.location.href = kingschatReturnUrl
            }, 1000)
          } else {
            // Fallback to auth page
            localStorage.setItem('kingschat_auth_code', code)
            setMessage('Redirecting to login...')
            setTimeout(() => {
              window.location.href = '/auth'
            }, 1000)
          }
        }
      }
    } else {
      setStatus('error')
      setMessage('No authorization code received')
    }
  }, [searchParams])

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
          {status === 'error' && 'Authentication Failed'}
        </h2>
        <p className="text-gray-600">
          {message}
        </p>

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

export default function KingsChatCallbackPage() {
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
      <KingsChatCallbackContent />
    </Suspense>
  )
}