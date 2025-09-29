'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase-client'

export default function AuthCallbackPage() {
  const router = useRouter()

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const { data, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Auth callback error:', error)
          router.push('/auth?error=callback_error')
          return
        }

        if (data.session) {
          // Check if this is a password recovery session
          const urlParams = new URLSearchParams(window.location.search)
          const type = urlParams.get('type')
          
          if (type === 'recovery') {
            // Redirect to password reset page
            router.push('/auth/reset-password')
          } else {
            // Regular auth success, go to home
            router.push('/home')
          }
        } else {
          // No session, redirect to auth
          router.push('/auth')
        }
      } catch (error) {
        console.error('Auth callback error:', error)
        router.push('/auth?error=callback_error')
      }
    }

    handleAuthCallback()
  }, [router])

  return (
    <div className="fixed inset-0 z-50 bg-white flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600">Processing authentication...</p>
      </div>
    </div>
  )
}