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
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const refreshProfile = async () => {
    console.log('Refreshing profile...')
    const userProfile = await AuthService.getCurrentUserProfile()
    console.log('Refreshed profile:', userProfile)
    setProfile(userProfile)
  }

  const signOut = async () => {
    await AuthService.signOut()
    setUser(null)
    setSession(null)
    setProfile(null)
  }

  useEffect(() => {
    // Get initial session (non-blocking)
    const getInitialSession = async () => {
      try {
        const session = await AuthService.getCurrentSession()
        setSession(session)
        setUser(session?.user || null)
        
        // Load profile in background (non-blocking)
        if (session?.user) {
          // Don't wait for profile - load it in background
          AuthService.getCurrentUserProfile()
            .then(userProfile => {
              setProfile(userProfile)
              console.log('Background profile load:', userProfile)
            })
            .catch(error => {
              console.error('Background profile load error:', error)
            })
        }
        
        setIsLoading(false)
      } catch (error) {
        console.error('Initial session error:', error)
        setIsLoading(false)
      }
    }

    getInitialSession()

    // Listen for auth changes
    const { data: { subscription } } = AuthService.onAuthStateChange(
      async (event, session) => {
        setSession(session)
        setUser(session?.user || null)
        
        if (session?.user) {
          // Load profile immediately
          try {
            const userProfile = await AuthService.getCurrentUserProfile()
            setProfile(userProfile)
            console.log('Auth change profile load:', userProfile)
          } catch (error) {
            console.error('Auth change profile load error:', error)
            setProfile(null)
          }
        } else {
          setProfile(null)
        }
        
        setIsLoading(false)
      }
    )

    return () => subscription.unsubscribe()
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