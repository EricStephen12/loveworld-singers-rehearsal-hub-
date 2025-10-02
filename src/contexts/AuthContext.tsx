'use client'

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { AuthService } from '@/lib/auth-service-simple'
import { userCache, profileCache, invalidateUserCache } from '@/lib/smart-cache'
import type { UserProfile } from '@/types/supabase'

interface AuthContextType {
  user: User | null
  session: Session | null
  profile: UserProfile | null
  isLoading: boolean
  isProfileComplete: boolean
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Simple state - no complex caching
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const refreshProfile = useCallback(async () => {
    if (!user?.id) return
    
    try {
      // Check cache first
      const cacheKey = `profile_${user.id}`
      const cachedProfile = profileCache.get(cacheKey)
      
      if (cachedProfile) {
        console.log('🚀 Using cached profile')
        setProfile(cachedProfile)
        return
      }
      
      console.log('💾 Fetching fresh profile')
      const userProfile = await AuthService.getCurrentUserProfile()
      if (userProfile) {
        setProfile(userProfile)
        // Cache the profile
        profileCache.set(cacheKey, userProfile)
      }
    } catch (error) {
      console.error('Profile refresh error:', error)
    }
  }, [user?.id])

  const signOut = useCallback(async () => {
    console.log('🚪 NUCLEAR LOGOUT - Destroying all session data...')
    
    // Set logout flag immediately
    setIsLoggingOut(true)
    
    // Clear all state immediately - no async
    setUser(null)
    setSession(null)
    setProfile(null)
    
    // Clear ALL possible storage
    try {
      localStorage.clear()
      sessionStorage.clear()
      // Clear specific keys that might persist
      localStorage.removeItem('supabase.auth.token')
      localStorage.removeItem('sb-auth-token')
      localStorage.removeItem('supabase.auth.session')
      sessionStorage.removeItem('supabase.auth.token')
      sessionStorage.removeItem('sb-auth-token')
      sessionStorage.removeItem('supabase.auth.session')
      // Clear any other possible auth keys
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key && (key.includes('supabase') || key.includes('auth') || key.includes('session'))) {
          localStorage.removeItem(key)
        }
      }
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i)
        if (key && (key.includes('supabase') || key.includes('auth') || key.includes('session'))) {
          sessionStorage.removeItem(key)
        }
      }
      
      // Clear cookies if they exist
      document.cookie.split(";").forEach(function(c) { 
        document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
      });
    } catch (e) {
      console.log('Storage clear error:', e)
    }
    
    // Clear caches
    try {
      invalidateUserCache(user?.id)
    } catch (e) {
      console.log('Cache clear error:', e)
    }
    
    // Force Supabase logout and wait for it
    try {
      await AuthService.signOut()
      console.log('✅ Supabase logout successful')
    } catch (error) {
      console.log('Supabase logout error:', error)
    }
    
    // Force immediate redirect with replace to prevent back button
    setTimeout(() => {
      console.log('🚪 Redirecting to auth...')
      window.location.replace('/auth')
    }, 100)
  }, [user?.id])

  useEffect(() => {
    let isMounted = true

    // Simple auth check - no complex caching
    const checkAuth = async () => {
      try {
        console.log('🔍 Checking authentication...')

        // If we're logging out, don't check auth
        if (isLoggingOut) {
          console.log('🚪 Logout in progress - skipping auth check')
          setSession(null)
          setUser(null)
          setProfile(null)
          setIsLoading(false)
          return
        }

        // ✅ ALWAYS check session, even on auth page
        // This allows redirect to work when user logs in
        const session = await AuthService.getCurrentSession()

        if (isMounted) {
          if (session) {
            console.log('✅ User is authenticated')
            setSession(session)
            setUser(session.user)

            // Load profile
            try {
              const userProfile = await AuthService.getCurrentUserProfile()
              if (isMounted && userProfile) {
                setProfile(userProfile)
              }
            } catch (error) {
              console.error('Profile load error:', error)
            }
          } else {
            console.log('ℹ️ No active session')
            setSession(null)
            setUser(null)
            setProfile(null)
          }
          setIsLoading(false)
        }
      } catch (error) {
        console.error('Auth check error:', error)
        if (isMounted) {
          setSession(null)
          setUser(null)
          setProfile(null)
          setIsLoading(false)
        }
      }
    }

    checkAuth()

    // Listen for auth changes
    const { data: { subscription } } = AuthService.onAuthStateChange(
      async (event, session) => {
        // If we're logging out, ignore ALL auth events
        if (isLoggingOut) {
          console.log('🚪 Logout in progress - ignoring auth event:', event)
          return
        }

        if (!isMounted) return

        console.log('Auth state changed:', event)

        // ✅ ALWAYS update session state, even on auth page
        // This allows redirect to work when user logs in
        setSession(session)
        setUser(session?.user || null)

        if (session?.user) {
          // Load profile
          try {
            const userProfile = await AuthService.getCurrentUserProfile()
            if (isMounted && userProfile) {
              setProfile(userProfile)
            }
          } catch (error) {
            console.error('Profile load error:', error)
          }
        } else {
          setProfile(null)
        }
      }
    )

    return () => {
      isMounted = false
      subscription?.unsubscribe()
    }
  }, [isLoggingOut])

  // Reset logout flag when component unmounts or when we're on auth page
  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.pathname === '/auth') {
      setIsLoggingOut(false)
    }
  }, [])

  // Handle redirects - only redirect FROM auth page TO home when logged in
  useEffect(() => {
    if (typeof window === 'undefined') return

    console.log('AuthContext: Checking redirect conditions...', {
      pathname: window.location.pathname,
      hasUser: !!user,
      hasSession: !!session,
      isLoggingOut
    });

    // Don't redirect if we're logging out
    if (isLoggingOut) {
      console.log('AuthContext: Logging out, not redirecting');
      return
    }

    // ✅ ONLY redirect FROM /auth TO /home when user logs in
    // Don't redirect if already on another page
    if (user && session && window.location.pathname === '/auth') {
      console.log('✅ AuthContext: User authenticated on auth page, redirecting to home')
      window.location.href = '/home'
    }
  }, [user, session, isLoggingOut])

  const isProfileComplete = profile?.profile_completed === true

  // Memoize context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    user,
    session,
    profile,
    isLoading,
    isProfileComplete,
    signOut,
    refreshProfile
  }), [user, session, profile, isLoading, isProfileComplete, signOut, refreshProfile])

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}