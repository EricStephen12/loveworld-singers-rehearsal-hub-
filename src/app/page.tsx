'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'

export default function SplashPage() {
  const router = useRouter()
  const { user, isLoading } = useAuth()
  const [hasTimedOut, setHasTimedOut] = useState(false)

  useEffect(() => {
    // Set a maximum timeout of 3 seconds for auth loading
    const maxLoadTimer = setTimeout(() => {
      console.log('Auth loading timeout - proceeding anyway')
      setHasTimedOut(true)
    }, 3000)

    return () => clearTimeout(maxLoadTimer)
  }, [])

  useEffect(() => {
    // Wait for auth to load OR timeout, then redirect
    if (isLoading && !hasTimedOut) return

    // Add small delay to show splash screen briefly (500ms minimum)
    const timer = setTimeout(() => {
      if (!user) {
        // No user - go to auth
        console.log('Redirecting to auth page')
        router.push('/auth')
      } else {
        // User is authenticated - go to home (no profile check)
        console.log('Redirecting to home page')
        router.push('/home')
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [user, isLoading, hasTimedOut, router])

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 flex flex-col items-center justify-center">
      {/* Background Pattern Overlay */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-10 left-10 w-32 h-32 bg-gray-600 rounded-full blur-3xl"></div>
        <div className="absolute top-20 right-20 w-24 h-24 bg-gray-500 rounded-full blur-2xl"></div>
        <div className="absolute bottom-10 left-1/3 w-28 h-28 bg-gray-400 rounded-full blur-2xl"></div>
      </div>

      {/* Logo with bounce animation */}
      <div className="relative z-10 flex flex-col items-center">
        <img
          src="/logo.png"
          alt="LoveWorld Singers Rehearsal Hub"
          className="object-contain animate-bounce mb-8"
          style={{
            width: '120px',
            height: '120px',
            animationDuration: '2s',
            animationIterationCount: 'infinite',
            animationTimingFunction: 'ease-in-out'
          }}
        />

        {/* Loading spinner */}
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>

        {/* Loading text */}
        <p className="text-white text-sm mt-4 opacity-80">Loading...</p>
      </div>
    </div>
  )
}