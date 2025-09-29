'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'

export default function SplashPage() {
  const router = useRouter()
  const { user, isLoading } = useAuth()

  useEffect(() => {
    // Wait for auth to load, then redirect
    if (isLoading) return

    // Add small delay to show splash screen briefly (500ms minimum)
    const timer = setTimeout(() => {
      if (!user) {
        // No user - go to auth
        router.push('/auth')
      } else {
        // User is authenticated - go to home (no profile check)
        router.push('/home')
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [user, isLoading, router])

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