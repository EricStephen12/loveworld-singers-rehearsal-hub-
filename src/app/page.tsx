'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase-client'

export default function SplashPage() {
  const router = useRouter()

  useEffect(() => {
    // Check authentication status using Supabase session
    const checkAuthAndRedirect = async () => {
      try {
        // Get current session from Supabase
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Session check error:', error)
          router.push('/auth')
          return
        }

        if (session?.user) {
          // User is authenticated, check if profile is complete
          const { data: profile } = await supabase
            .from('profiles')
            .select('profile_completed')
            .eq('id', session.user.id)
            .single()

          if (profile?.profile_completed) {
            // User is fully authenticated and profile is complete
            router.push('/home')
          } else {
            // User is authenticated but profile is incomplete
            router.push('/profile-completion')
          }
        } else {
          // No session, redirect to auth
          router.push('/auth')
        }
      } catch (error) {
        console.error('Auth check error:', error)
        router.push('/auth')
      }
    }

    // Show splash for 2 seconds then redirect
    const timer = setTimeout(checkAuthAndRedirect, 2000)

    return () => clearTimeout(timer)
  }, [router])

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 flex items-center justify-center">
      {/* Background Pattern Overlay */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-10 left-10 w-32 h-32 bg-gray-600 rounded-full blur-3xl"></div>
        <div className="absolute top-20 right-20 w-24 h-24 bg-gray-500 rounded-full blur-2xl"></div>
        <div className="absolute bottom-10 left-1/3 w-28 h-28 bg-gray-400 rounded-full blur-2xl"></div>
      </div>
      
      {/* Logo with bounce animation */}
      <div className="relative z-10">
        <img 
          src="/logo.png" 
          alt="LoveWorld Praise Logo" 
          className="object-contain animate-bounce"
          style={{ 
            width: '120px', 
            height: '120px',
            animationDuration: '2s',
            animationIterationCount: 'infinite',
            animationTimingFunction: 'ease-in-out'
          }}
        />
        </div>
    </div>
  )
}