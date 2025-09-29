'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase-client'

export default function SplashPage() {
  const router = useRouter()

  useEffect(() => {
    // Quick authentication check - no database queries on splash screen
    const checkAuthAndRedirect = async () => {
      try {
        // Get current session from Supabase (fast, no database query)
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Session check error:', error)
          router.push('/auth')
          return
        }

        if (session?.user) {
          // User is authenticated - go to home, let home page handle profile check
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

    // Check auth immediately for faster login
    checkAuthAndRedirect()
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