'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { AuthService } from '@/lib/auth-service-simple'
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

  const refreshProfile = async () => {
    try {
      const userProfile = await AuthService.getCurrentUserProfile()
      setProfile(userProfile)
    } catch (error) {
      console.error('Profile refresh error:', error)
    }
  }

  const signOut = async () => {
    try {
      console.log('🚪 Logging out...')
      
      // Clear all state immediately
      setUser(null)
      setSession(null)
      setProfile(null)
      
      // Clear localStorage
      localStorage.clear()
      
      // Sign out from Supabase
      await AuthService.signOut()
      
      // Redirect to auth
      window.location.href = '/auth'
    } catch (error) {
      console.error('Logout error:', error)
      // Force redirect even if there's an error
      window.location.href = '/auth'
    }
  }

  useEffect(() => {
    let isMounted = true

    // Simple auth check - no complex caching
    const checkAuth = async () => {
      try {
        console.log('🔍 Checking authentication...')
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
        if (!isMounted) return

        console.log('Auth state changed:', event)
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
  }, [])

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