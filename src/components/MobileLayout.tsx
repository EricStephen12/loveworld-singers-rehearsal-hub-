'use client'

import { useState, useEffect } from 'react'
import SplashScreen from './SplashScreen'
import AuthScreen from './AuthScreen'
import ProfileCompletionScreen from './ProfileCompletionScreen'
// Subscription components removed

interface MobileLayoutProps {
  children: React.ReactNode
}

export default function MobileLayout({ children }: MobileLayoutProps) {
  const [showSplash, setShowSplash] = useState(true)
  const [showAuth, setShowAuth] = useState(false)
  const [showProfileCompletion, setShowProfileCompletion] = useState(false)
  // Subscription state removed
  const [socialData, setSocialData] = useState<{
    socialProvider: string
    socialId: string
    firstName: string
    lastName: string
    email: string
  } | null>(null)
  const [isMobile, setIsMobile] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    // Check if device is mobile
    const checkMobile = () => {
      const userAgent = navigator.userAgent
      const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent)
      const isSmallScreen = window.innerWidth < 768
      setIsMobile(isMobileDevice || isSmallScreen)
    }

    // FAST: Check if user is already authenticated (localStorage is instant)
    const checkAuthStatus = () => {
      const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true'
      const hasCompletedProfile = localStorage.getItem('hasCompletedProfile') === 'true'
      
      if (isAuthenticated && hasCompletedProfile) {
        // User is fully set up, skip all screens immediately
        setShowSplash(false)
        setShowAuth(false)
        setShowProfileCompletion(false)
      } else if (isAuthenticated) {
        // User needs to complete profile
        setShowSplash(false)
        setShowAuth(false)
        setShowProfileCompletion(true)
      } else {
        // User needs to authenticate
        setShowSplash(false)
        setShowAuth(true)
        setShowProfileCompletion(false)
      }
      
      setIsInitialized(true)
    }

    // Run checks immediately (no delays)
    checkMobile()
    checkAuthStatus()
    window.addEventListener('resize', checkMobile)

    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const handleSplashComplete = () => {
    setShowSplash(false)
    setShowAuth(true)
  }

  const handleAuthComplete = (socialData?: {
    socialProvider: string
    socialId: string
    firstName: string
    lastName: string
    email: string
  }) => {
    localStorage.setItem('isAuthenticated', 'true')
    if (socialData) {
      setSocialData(socialData)
      setShowAuth(false)
      setShowProfileCompletion(true)
    } else {
      setShowAuth(false)
    }
  }

  const handleProfileComplete = () => {
    localStorage.setItem('hasCompletedProfile', 'true')
    setShowProfileCompletion(false)
    // Subscription removed - user goes directly to main app
  }

  const handleProfileBack = () => {
    setShowProfileCompletion(false)
    setShowAuth(true)
  }

  // Subscription functionality removed

  // Show loading while checking authentication status
  if (!isInitialized) {
    return (
      <div className="fixed inset-0 z-50 bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  if (showSplash) {
    return <SplashScreen onComplete={handleSplashComplete} />
  }

  if (showAuth) {
    return <AuthScreen onComplete={handleAuthComplete} />
  }

  if (showProfileCompletion && socialData) {
    return <ProfileCompletionScreen onComplete={handleProfileComplete} onBack={handleProfileBack} socialData={socialData} />
  }

  // Subscription screen removed

  return (
    <div className={`min-h-screen ${isMobile ? 'mobile-optimized' : ''}`}>
      {children}
    </div>
  )
}
