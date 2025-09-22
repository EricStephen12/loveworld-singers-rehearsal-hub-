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
    if (user) {
      const userProfile = await AuthService.getCurrentUserProfile()
      setProfile(userProfile)
    }
  }

  const signOut = async () => {
    await AuthService.signOut()
    setUser(null)
    setSession(null)
    setProfile(null)
  }

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      const session = await AuthService.getCurrentSession()
      setSession(session)
      setUser(session?.user || null)
      
      if (session?.user) {
        await refreshProfile()
      }
      
      setIsLoading(false)
    }

    getInitialSession()

    // Listen for auth changes
    const { data: { subscription } } = AuthService.onAuthStateChange(
      async (event, session) => {
        setSession(session)
        setUser(session?.user || null)
        
        if (session?.user) {
          await refreshProfile()
        } else {
          setProfile(null)
        }
        
        setIsLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const isProfileComplete = profile?.profile_completed || false

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