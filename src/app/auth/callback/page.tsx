'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase-client'
import { AuthService } from '@/lib/auth-service'

export default function AuthCallback() {
  const router = useRouter()

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Handle the OAuth callback
        const { data, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Auth callback error:', error)
          router.push('/auth?error=callback_error')
          return
        }

        if (data.session) {
          // Check if profile is complete
          const isComplete = await AuthService.isProfileComplete()
          
          if (isComplete) {
            router.push('/home')
          } else {
            router.push('/profile-completion')
          }
        } else {
          router.push('/auth')
        }
      } catch (error) {
        console.error('Callback handling error:', error)
        router.push('/auth?error=callback_error')
      }
    }

    handleAuthCallback()
  }, [router])

  return (
    <div className="fixed inset-0 z-50 bg-white flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600">Completing authentication...</p>
      </div>
    </div>
  )
}