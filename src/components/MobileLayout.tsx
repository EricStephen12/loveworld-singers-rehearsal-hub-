'use client'

import { useState, useEffect } from 'react'
import SplashScreen from './SplashScreen'
import AuthScreen from './AuthScreen'
import ProfileCompletionScreen from './ProfileCompletionScreen'
import SubscriptionOnboardingScreen from './SubscriptionOnboardingScreen'
import SubscriptionCheck from './SubscriptionCheck'

interface MobileLayoutProps {
  children: React.ReactNode
}

export default function MobileLayout({ children }: MobileLayoutProps) {
  const [showSplash, setShowSplash] = useState(true)
  const [showAuth, setShowAuth] = useState(false)
  const [showProfileCompletion, setShowProfileCompletion] = useState(false)
  const [showSubscription, setShowSubscription] = useState(false)
  const [socialData, setSocialData] = useState(null)
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

    // Check if user is already authenticated
    const checkAuthStatus = () => {
      const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true'
      const hasCompletedProfile = localStorage.getItem('hasCompletedProfile') === 'true'
      const hasSubscribed = localStorage.getItem('hasSubscribed') === 'true'
      
      if (isAuthenticated && hasCompletedProfile && hasSubscribed) {
        // User is fully set up, skip all screens
        setShowSplash(false)
        setShowAuth(false)
        setShowProfileCompletion(false)
        setShowSubscription(false)
      } else if (isAuthenticated && hasCompletedProfile) {
        // User needs subscription
        setShowSplash(false)
        setShowAuth(false)
        setShowProfileCompletion(false)
        setShowSubscription(true)
      } else if (isAuthenticated) {
        // User needs to complete profile
        setShowSplash(false)
        setShowAuth(false)
        setShowProfileCompletion(true)
        setShowSubscription(false)
      } else {
        // User needs to authenticate
        setShowSplash(false)
        setShowAuth(true)
        setShowProfileCompletion(false)
        setShowSubscription(false)
      }
      
      setIsInitialized(true)
    }

    checkMobile()
    checkAuthStatus()
    window.addEventListener('resize', checkMobile)

    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const handleSplashComplete = () => {
    setShowSplash(false)
    setShowAuth(true)
  }

  const handleAuthComplete = (socialData = null) => {
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
    setShowSubscription(true)
  }

  const handleProfileBack = () => {
    setShowProfileCompletion(false)
    setShowAuth(true)
  }

  const handleSubscriptionComplete = () => {
    localStorage.setItem('hasSubscribed', 'true')
    setShowSubscription(false)
  }

  const handleSubscriptionBack = () => {
    setShowSubscription(false)
    setShowProfileCompletion(true)
  }

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

  if (showSubscription) {
    return <SubscriptionOnboardingScreen onComplete={handleSubscriptionComplete} onBack={handleSubscriptionBack} />
  }

  return (
    <div className={`min-h-screen ${isMobile ? 'mobile-optimized' : ''}`}>
      <SubscriptionCheck>
        {children}
      </SubscriptionCheck>
    </div>
  )
}
