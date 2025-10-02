'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { AuthService } from '@/lib/auth-service'
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
  // Initialize from cache immediately for instant load
  const [user, setUser] = useState<User | null>(() => {
    if (typeof window === 'undefined') return null
    const cached = AuthService.getCachedSession()
    console.log('🔐 AuthContext init: Cached session:', cached ? 'Found' : 'Not found')
    return cached?.user || null
  })

  const [session, setSession] = useState<Session | null>(() => {
    if (typeof window === 'undefined') return null
    const cached = AuthService.getCachedSession()
    return cached
  })

  const [profile, setProfile] = useState<UserProfile | null>(() => {
    if (typeof window === 'undefined') return null
    try {
      const cached = localStorage.getItem('cached_user_profile')
      if (cached) {
        const parsed = JSON.parse(cached)
        console.log('👤 AuthContext init: Cached profile found for:', parsed.first_name)
        return parsed
      }
    } catch (error) {
      console.error('Error parsing cached profile:', error)
    }
    return null
  })

  const [isLoading, setIsLoading] = useState(false) // ✅ Always false - instant load with cache
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const refreshProfile = async () => {
    console.log('Refreshing profile...')
    const userProfile = await AuthService.getCurrentUserProfile()
    console.log('Refreshed profile:', userProfile)
    setProfile(userProfile)

    // Cache the profile
    if (userProfile) {
      localStorage.setItem('cached_user_profile', JSON.stringify(userProfile))
    }
  }

  const signOut = async () => {
    try {
      console.log('🚪 Starting logout process...')
      setIsLoggingOut(true)
      
      // Clear all cached data FIRST
      localStorage.removeItem('cached_user_profile')
      localStorage.removeItem('cached_session')
      localStorage.removeItem('cached_pages_data')
      localStorage.removeItem('cached_pages_timestamp')
      localStorage.removeItem('loveworld_audio_state')
      localStorage.removeItem('loveworld_audio_time')
      localStorage.removeItem('loveworld_audio_song')
      localStorage.removeItem('audio_timestamp')

      // Clear state immediately
      setUser(null)
      setSession(null)
      setProfile(null)

      // Sign out from Supabase
      await AuthService.signOut()

      console.log('✅ Logout completed, redirecting...')
      // Force redirect to auth page
      if (typeof window !== 'undefined') {
        window.location.href = '/auth'
      }
    } catch (error) {
      console.error('Logout error:', error)
      // Clear state even if there's an error
      setUser(null)
      setSession(null)
      setProfile(null)
      
      // Force redirect even if there's an error
      if (typeof window !== 'undefined') {
        window.location.href = '/auth'
      }
    }
  }

  useEffect(() => {
    let isMounted = true

    // Verify cached session is still valid
    const verifyCachedSession = async () => {
      try {
        // Don't verify session if we're logging out
        if (isLoggingOut) return
        
        const cachedSession = AuthService.getCachedSession()

        // If we have cached session, verify it's still valid
        if (cachedSession) {
          console.log('🔍 Verifying cached session...')
          // Session already set from initial state, just verify in background
          const session = await AuthService.getCurrentSession()

          if (isMounted && session) {
            console.log('✅ Session is valid')
            // Session is valid, update if needed
            if (session.access_token !== cachedSession.access_token) {
              console.log('🔄 Updating session with new token')
              setSession(session)
              setUser(session.user)
            }

            // Load/refresh profile in background if not cached
            if (!profile) {
              console.log('📥 Loading profile in background...')
              AuthService.getCurrentUserProfile()
                .then(userProfile => {
                  if (isMounted && userProfile) {
                    setProfile(userProfile)
                    localStorage.setItem('cached_user_profile', JSON.stringify(userProfile))
                  }
                })
                .catch(error => {
                  console.error('Background profile load error:', error)
                })
            }
          } else if (isMounted && !session) {
            // Cached session is invalid, clear it
            console.warn('⚠️ Cached session is invalid, clearing...')
            setSession(null)
            setUser(null)
            setProfile(null)
            localStorage.removeItem('cached_user_profile')
          }
        } else {
          // No cached session, check if there's a session
          console.log('ℹ️ No cached session found, checking Supabase...')
          const session = await AuthService.getCurrentSession()

          if (isMounted) {
            setSession(session)
            setUser(session?.user || null)

            if (session?.user) {
              AuthService.getCurrentUserProfile()
                .then(userProfile => {
                  if (isMounted && userProfile) {
                    setProfile(userProfile)
                    localStorage.setItem('cached_user_profile', JSON.stringify(userProfile))
                  }
                })
                .catch(error => {
                  console.error('Background profile load error:', error)
                })
            }
          }
        }
      } catch (error) {
        console.error('Session verification error:', error)
      }
    }

    verifyCachedSession()

    // Listen for auth changes (login/logout events)
    const { data: { subscription } } = AuthService.onAuthStateChange(
      async (event, session) => {
        if (!isMounted || isLoggingOut) return

        console.log('Auth state changed:', event)

        // Only update if the session actually changed to prevent unnecessary re-renders
        setSession(prevSession => {
          if (prevSession?.access_token !== session?.access_token) {
            return session
          }
          return prevSession
        })
        
        setUser(session?.user || null)

        if (session?.user) {
          // Load profile on auth change
          AuthService.getCurrentUserProfile()
            .then(userProfile => {
              if (isMounted && userProfile) {
                setProfile(userProfile)
                localStorage.setItem('cached_user_profile', JSON.stringify(userProfile))
              }
            })
            .catch(error => {
              console.error('Auth change profile load error:', error)
              if (isMounted) {
                setProfile(null)
              }
            })
        } else {
          // User logged out, clear cache
          setProfile(null)
          localStorage.removeItem('cached_user_profile')
        }
      }
    )

    return () => {
      isMounted = false
      subscription.unsubscribe()
    }
  }, [profile])

  const isProfileComplete = profile?.profile_completed === true

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        isLoading,
        isProfileComplete,
        signOut,
        refreshProfile
      }}
    >
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