'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase-client'

export default function SplashPage() {
  const router = useRouter()

  useEffect(() => {
    // Ultra-fast authentication check with localStorage first
    const checkAuthAndRedirect = async () => {
      try {
        // INSTANT: Check localStorage first (0ms)
        const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true'
        const hasCompletedProfile = localStorage.getItem('hasCompletedProfile') === 'true'
        
        if (isAuthenticated && hasCompletedProfile) {
          // User is fully authenticated - go directly to home (instant)
          router.push('/home')
          return
        }
        
        if (isAuthenticated) {
          // User needs profile completion
          router.push('/profile-completion')
          return
        }
        
        // FAST: Get current session from Supabase (usually <100ms)
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Session check error:', error)
          router.push('/auth')
          return
        }

        if (session?.user) {
          // User is authenticated - go to home
          router.push('/home')
        } else {
          // No session, redirect to auth
          router.push('/auth')
        }
      } catch (error) {
        console.error('Auth check error:', error)
        router.push('/auth')
      }
    }

    // Add small delay to show splash screen briefly (500ms minimum)
    const timer = setTimeout(() => {
      checkAuthAndRedirect()
    }, 500)
    
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