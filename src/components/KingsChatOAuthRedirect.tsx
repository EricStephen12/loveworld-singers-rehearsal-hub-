'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'

interface KingsChatOAuthRedirectProps {
  onSuccess: (authData: any) => void
  onError: (error: string) => void
}

export default function KingsChatOAuthRedirect({ 
  onSuccess, 
  onError 
}: KingsChatOAuthRedirectProps) {
  const router = useRouter()

  // KingsChat OAuth configuration
  const KINGSCHAT_CLIENT_ID = process.env.NEXT_PUBLIC_KINGSCHAT_CLIENT_ID || '331c9eda-a130-4bb8-9a00-9231a817207d'
  const REDIRECT_URI = typeof window !== 'undefined' ? `${window.location.origin}/auth/kingschat/callback` : ''

  useEffect(() => {
    if (REDIRECT_URI) {
      // Store current page URL to return after auth
      if (typeof window !== 'undefined') {
        localStorage.setItem('kingschat_return_url', window.location.href)
      }
      
      // Redirect to KingsChat OAuth
      const params = new URLSearchParams({
        client_id: KINGSCHAT_CLIENT_ID,
        redirect_uri: REDIRECT_URI,
        response_type: 'code',
        scope: 'profile email',
        state: Math.random().toString(36).substring(7)
      })

      const authUrl = `https://kingschat.online/oauth/authorize?${params.toString()}`
      console.log('🔗 Redirecting to KingsChat OAuth:', authUrl)
      
      // Redirect in same tab
      window.location.href = authUrl
    }
  }, [REDIRECT_URI])

  return (
    <div className="fixed inset-0 z-50 bg-white flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <img 
            src="/kingschat.jpeg" 
            alt="KingsChat" 
            className="w-10 h-10 rounded-full object-cover"
          />
        </div>
        <Loader2 className="w-8 h-8 animate-spin text-purple-600 mx-auto mb-3" />
        <h3 className="font-semibold text-gray-900 mb-2">Connecting to KingsChat</h3>
        <p className="text-gray-600 text-sm">
          Redirecting you to KingsChat for secure authentication...
        </p>
      </div>
    </div>
  )
}