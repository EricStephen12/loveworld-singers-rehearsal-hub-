'use client'

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react'
import { User } from 'firebase/auth'
import { FirebaseAuthService } from '@/lib/firebase-auth'
import { FirebaseDatabaseService } from '@/lib/firebase-database'
import { userCache, profileCache, invalidateUserCache } from '@/lib/smart-cache'
import { cacheService, CACHE_KEYS } from '@/lib/cache-service'
import { OfflineFallback } from '@/lib/offline-fallback'
import { SessionManager } from '@/lib/session-manager'
import type { UserProfile } from '@/types/supabase'

interface AuthContextType {
  user: User | null
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
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const refreshProfile = useCallback(async () => {
    if (!user?.uid) return
    
    try {
      // Check cache first with new cache service
      const cacheKey = `${CACHE_KEYS.USER_PROFILE}_${user.uid}`
      const cachedProfile = cacheService.get(cacheKey)
      
      if (cachedProfile) {
        console.log('🚀 Using cached profile - instant load!')
        setProfile(cachedProfile as any)
        return
      }
      
      console.log('💾 Fetching fresh profile')
      const userProfile = await FirebaseDatabaseService.getDocument('profiles', user.uid)
      if (userProfile) {
        setProfile(userProfile as any)
        // Cache the profile with long TTL
        cacheService.setUserData(cacheKey, userProfile)
        // Also cache in old system for compatibility
        profileCache.set(cacheKey, userProfile)
      }
    } catch (error) {
      console.error('Profile refresh error:', error)
    }
  }, [user?.uid])

  const signOut = useCallback(async () => {
    console.log('🚪 NUCLEAR LOGOUT - Destroying all session data...')
    
    // Set logout flag immediately
    setIsLoggingOut(true)
    
    // DISABLED: Clear session manager (Instagram-style - keep session for next login)
    // SessionManager.clearSession()
    
    // Clear all state immediately - no async
    setUser(null)
    setProfile(null)
    
    // Clear ALL possible storage
    try {
      // Clear new cache service first
      if (user?.uid) {
        cacheService.invalidateUserData(user.uid)
      }
      
      // Clear authentication flags
      localStorage.removeItem('userAuthenticated')
      localStorage.removeItem('lastAuthTime')
      
      localStorage.clear()
      sessionStorage.clear()
      // Clear specific keys that might persist
      localStorage.removeItem('firebase.auth.token')
      localStorage.removeItem('firebase-auth-token')
      localStorage.removeItem('firebase.auth.session')
      sessionStorage.removeItem('firebase.auth.token')
      sessionStorage.removeItem('firebase-auth-token')
      sessionStorage.removeItem('firebase.auth.session')
      // Clear any other possible auth keys
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key && (key.includes('firebase') || key.includes('auth') || key.includes('session'))) {
          localStorage.removeItem(key)
        }
      }
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i)
        if (key && (key.includes('firebase') || key.includes('auth') || key.includes('session'))) {
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
      invalidateUserCache(user?.uid)
    } catch (e) {
      console.log('Cache clear error:', e)
    }
    
    // Force Firebase logout and wait for it
    try {
      const result = await FirebaseAuthService.signOut()
      if ((result as any).success) {
        console.log('✅ Firebase logout successful')
      } else {
        console.log('Firebase logout error:', result.error)
      }
    } catch (error) {
      console.log('Firebase logout error:', error)
    }
    
    // Force immediate redirect with replace to prevent back button
    setTimeout(() => {
      console.log('🚪 Redirecting to auth...')
      window.location.replace('/auth')
    }, 100)
  }, [user?.uid])

  useEffect(() => {
    let isMounted = true
    let timeoutId: NodeJS.Timeout

    // Simple auth check with timeout protection
    const checkAuth = async () => {
      try {
        console.log('🔍 Checking authentication...')

        // If we're logging out, don't check auth
        if (isLoggingOut) {
          console.log('🚪 Logout in progress - skipping auth check')
          setUser(null)
          setProfile(null)
          setIsLoading(false)
          return
        }

        // ✅ TIMEOUT PROTECTION: Don't wait forever for auth
        const authPromise = FirebaseAuthService.getCurrentUser()
        const timeoutPromise = new Promise((_, reject) => {
          timeoutId = setTimeout(() => {
            reject(new Error('Auth check timeout - proceeding without session'))
          }, 5000) // 5 second timeout
        })

        let currentUser
        try {
          currentUser = await Promise.race([authPromise, timeoutPromise])
        } catch (error) {
          console.log('⚠️ Auth check failed, trying offline fallback...')
          // Try offline fallback
          currentUser = OfflineFallback.getCachedSession()
          if (currentUser) {
            console.log('📱 Using cached session from offline fallback')
          }
        }

        // Handle app resume and offline scenarios (like Instagram)
        if (!currentUser && typeof window !== 'undefined') {
          const wasAuthenticated = localStorage.getItem('userAuthenticated') === 'true'
          const hasCompletedProfile = localStorage.getItem('hasCompletedProfile') === 'true'
          const bypassLogin = localStorage.getItem('bypassLogin') === 'true'
          const lastAuthTime = localStorage.getItem('lastAuthTime')
          const isOnline = navigator.onLine
          
          // Be more lenient - if user has any auth indicators, try to restore
          if ((wasAuthenticated || hasCompletedProfile || bypassLogin) && lastAuthTime) {
            const timeSinceAuth = Date.now() - parseInt(lastAuthTime)
            const oneWeek = 7 * 24 * 60 * 60 * 1000 // Extend to 1 week like Instagram
            
            // If authenticated within last week, try to restore session
            if (timeSinceAuth < oneWeek) {
              console.log('🔄 App resumed - attempting to restore session...')
              
              if (isOnline) {
                // Online: Try to restore from Firebase
                try {
                  currentUser = await FirebaseAuthService.getCurrentUser()
                  if (currentUser) {
                    console.log('✅ Session restored successfully from Firebase')
                  } else {
                    // If no Firebase user but we have auth indicators, use cached data
                    console.log('🔄 Using cached auth data (Firebase unavailable)')
                    currentUser = OfflineFallback.getCachedSession()
                  }
                } catch (error) {
                  console.log('❌ Firebase session restoration failed, using cached data')
                  currentUser = OfflineFallback.getCachedSession()
                }
              } else {
                // Offline: Use cached session data or create offline user
                console.log('📴 Offline mode - using cached session')
                currentUser = OfflineFallback.getCachedSession() || OfflineFallback.createOfflineUser()
              }
              
              // If we have any user data (from Firebase or cache), keep user logged in
              if (currentUser) {
                console.log('✅ User session maintained (online/offline)')
              } else {
                console.log('⚠️ No user data found, but keeping auth flags for next attempt')
                // Don't clear auth data - keep user logged in for next attempt
              }
            } else {
              console.log('⏰ Session expired (1 week), clearing auth data')
              localStorage.removeItem('userAuthenticated')
              localStorage.removeItem('lastAuthTime')
            }
          }
        }

        if (isMounted) {
          if (currentUser) {
            console.log('✅ User is authenticated')
            setUser(currentUser)

            // Set authentication flags for app resume (like Instagram)
            if (typeof window !== 'undefined') {
              localStorage.setItem('userAuthenticated', 'true')
              localStorage.setItem('lastAuthTime', Date.now().toString())
              localStorage.setItem('hasCompletedProfile', 'true') // Assume profile is complete if user exists
              localStorage.setItem('bypassLogin', 'true') // Additional flag for navigation
            }

            // Create or validate session (Instagram-style - very long duration)
            const existingSession = SessionManager.getCurrentSession()
            if (!existingSession) {
              // Create new session (30 days like Instagram)
              SessionManager.createCustomSession(currentUser.uid, currentUser.email || '', 30, 'days')
            }

            // Load profile with timeout protection and offline fallback
            try {
              const profilePromise = FirebaseDatabaseService.getDocument('profiles', currentUser.uid)
              const profileTimeoutPromise = new Promise((_, reject) => {
                setTimeout(() => {
                  reject(new Error('Profile load timeout'))
                }, 3000) // 3 second timeout for profile
              })

              let userProfile
              try {
                userProfile = await Promise.race([profilePromise, profileTimeoutPromise])
              } catch (error) {
                console.log('⚠️ Profile load failed, trying offline fallback...')
                // Try offline fallback
                userProfile = OfflineFallback.getCachedProfile()
                if (userProfile) {
                  console.log('📱 Using cached profile from offline fallback')
                }
              }

                  if (isMounted && userProfile) {
                    setProfile(userProfile)
              }
            } catch (error) {
              console.error('Profile load error:', error)
              // Continue without profile - user can still use the app
            }
          } else {
            console.log('ℹ️ No active session')
            setUser(null)
            setProfile(null)
          }
          setIsLoading(false)
        }
      } catch (error) {
        console.error('Auth check error:', error)
        if (isMounted) {
          // On any error, assume no session and proceed
          console.log('⚠️ Auth check failed - proceeding without session')
          setUser(null)
          setProfile(null)
          setIsLoading(false)
        }
      } finally {
        // Clear timeout if it was set
        if (timeoutId) {
          clearTimeout(timeoutId)
        }
      }
    }

    checkAuth()

    // Listen for auth changes
    const unsubscribe = FirebaseAuthService.onAuthStateChange(
      async (user) => {
        // If we're logging out, ignore ALL auth events
        if (isLoggingOut) {
          console.log('🚪 Logout in progress - ignoring auth event')
          return
        }

        if (!isMounted) return

        console.log('🔥 Firebase Auth state changed:', user ? `User signed in: ${user.email}` : 'User signed out')
        console.log('🔥 Auth persistence working:', user ? 'YES' : 'NO')

        // ✅ ALWAYS update user state, even on auth page
        // This allows redirect to work when user logs in
        setUser(user)

        if (user) {
          // Load profile
          try {
            console.log('📋 Loading profile for user:', user.uid)
            const userProfile = await FirebaseDatabaseService.getDocument('profiles', user.uid)
              if (isMounted && userProfile) {
              console.log('✅ Profile loaded successfully')
              setProfile(userProfile as any)
            } else {
              console.log('⚠️ No profile found for user')
            }
          } catch (error) {
            console.error('❌ Profile load error:', error)
          }
        } else {
          console.log('👤 No user - clearing profile')
          setProfile(null)
        }
      }
    )

    // DISABLED: Session monitoring (Instagram-style - never log out)
    // SessionManager.startSessionMonitoring()

    // DISABLED: Session expiration handling (Instagram-style - never log out)
    // const handleSessionExpired = () => {
    //   console.log('⏰ Session expired, logging out user...')
    //   setIsLoggingOut(true)
    //   setUser(null)
    //   setProfile(null)
    //   // Clear all caches
    //   if (user?.uid) {
    //     cacheService.invalidateUserData(user.uid)
    //     invalidateUserCache(user.uid)
    //   }
    // }

    // window.addEventListener('session-expired', handleSessionExpired)

    // Listen for online/offline transitions (Instagram-style)
    const handleOnline = () => {
      console.log('🌐 Connection restored - attempting to sync auth state')
      if (isMounted && !user) {
        // Try to restore session when coming back online
        const hasAuthIndicators = typeof window !== 'undefined' && (
          localStorage.getItem('userAuthenticated') === 'true' ||
          localStorage.getItem('hasCompletedProfile') === 'true' ||
          localStorage.getItem('bypassLogin') === 'true'
        )
        
        if (hasAuthIndicators) {
          console.log('🔄 Online: Restoring session from auth indicators')
          // Trigger a new auth check
          setTimeout(() => {
            checkAuth()
          }, 1000)
        }
      }
    }

    const handleOffline = () => {
      console.log('📴 Connection lost - maintaining auth state')
      // Don't clear auth state when going offline
    }

    // Add event listeners for connection changes
    if (typeof window !== 'undefined') {
      window.addEventListener('online', handleOnline)
      window.addEventListener('offline', handleOffline)
    }

    return () => {
      isMounted = false
      unsubscribe()
      // DISABLED: Session expiration listener (Instagram-style - never log out)
      // window.removeEventListener('session-expired', handleSessionExpired)
      if (typeof window !== 'undefined') {
        window.removeEventListener('online', handleOnline)
        window.removeEventListener('offline', handleOffline)
      }
    }
  }, [isLoggingOut])

  // Reset logout flag when component unmounts or when we're on auth page
  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.pathname === '/auth') {
      setIsLoggingOut(false)
    }
  }, [])

  // Remove automatic redirects - let AuthGuard handle all redirects
  // This prevents redirect loops between AuthContext and AuthGuard

  const isProfileComplete = profile?.profile_completed === true

  // Debug logging
  console.log('AuthContext: Profile state:', {
    hasProfile: !!profile,
    profileCompleted: profile?.profile_completed,
    isProfileComplete
  })

  // Memoize context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
        user,
        profile,
        isLoading,
        isProfileComplete,
        signOut,
        refreshProfile
  }), [user, profile, isLoading, isProfileComplete, signOut, refreshProfile])

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