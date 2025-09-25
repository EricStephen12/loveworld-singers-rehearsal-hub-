'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'

interface ProfileData {
  id: string
  first_name: string
  last_name: string
  middle_name?: string
  email: string
  phone_number?: string
  gender?: string
  birthday?: string
  region?: string
  zone?: string
  church?: string
  designation?: string
  administration?: string
  social_provider?: string
  social_id?: string
  created_at: string
  updated_at: string
}

interface AttendanceData {
  history: any[]
  stats: {
    total: number
    present: number
    late: number
    absent: number
    rate: number
  }
}

export function useUltraFastProfile() {
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [attendanceData, setAttendanceData] = useState<AttendanceData>({
    history: [],
    stats: { total: 0, present: 0, late: 0, absent: 0, rate: 0 }
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()

  // Cache key for localStorage
  const CACHE_KEY = 'ultra_fast_profile_cache'
  const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

  // Load profile from cache or fetch from Supabase
  const loadProfile = useCallback(async (forceRefresh = false) => {
    if (!user?.id) {
      setIsLoading(false)
      return
    }

    try {
      // Check cache first (unless force refresh) - INSTANT LOADING
      if (!forceRefresh) {
        const cached = localStorage.getItem(CACHE_KEY)
        if (cached) {
          const { data, timestamp } = JSON.parse(cached)
          const isExpired = Date.now() - timestamp > CACHE_DURATION
          
          if (!isExpired && data) {
            console.log('⚡ Profile loaded from cache instantly')
            setProfile(data)
            setIsLoading(false)
            
            // Load attendance data in background (non-blocking)
            setTimeout(() => loadAttendanceData(data.id), 0)
            return
          }
        }
      }

      // Only show loading if no cache available
      setIsLoading(true)
      setError(null)

      // Fetch from Supabase with performance tracking
      console.log('🚀 Fetching profile from database...')
      const startTime = performance.now()
      
      const { data, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (fetchError) {
        throw fetchError
      }

      const loadTime = performance.now() - startTime
      console.log(`⚡ Profile loaded from database in ${loadTime.toFixed(2)}ms`)

      if (data) {
        setProfile(data)
        
        // Cache the data
        localStorage.setItem(CACHE_KEY, JSON.stringify({
          data,
          timestamp: Date.now()
        }))

        // Load attendance data in background (non-blocking)
        setTimeout(() => loadAttendanceData(data.id), 0)
      }

    } catch (err) {
      console.error('Error loading profile:', err)
      setError(err instanceof Error ? err.message : 'Failed to load profile')
    } finally {
      setIsLoading(false)
    }
  }, [user?.id])

  // Load attendance data (non-blocking background operation)
  const loadAttendanceData = useCallback(async (profileId: string) => {
    try {
      console.log('🔄 Loading attendance data in background...')
      const startTime = performance.now()
      
      const [historyResult, statsResult] = await Promise.all([
        supabase
          .from('attendance')
          .select('*')
          .eq('user_id', profileId)
          .order('check_in_time', { ascending: false })
          .limit(5),
        supabase
          .from('attendance')
          .select('status')
          .eq('user_id', profileId)
      ])

      const history = historyResult.data || []
      const allRecords = statsResult.data || []
      
      const stats = {
        total: allRecords.length,
        present: allRecords.filter(r => r.status === 'present').length,
        late: allRecords.filter(r => r.status === 'late').length,
        absent: allRecords.filter(r => r.status === 'absent').length,
        rate: allRecords.length > 0 ? Math.round((allRecords.filter(r => r.status === 'present').length / allRecords.length) * 100) : 0
      }

      const loadTime = performance.now() - startTime
      console.log(`⚡ Attendance data loaded in ${loadTime.toFixed(2)}ms`)

      setAttendanceData({ history, stats })
    } catch (err) {
      console.error('Error loading attendance data:', err)
    }
  }, [])

  // Refresh profile data
  const refreshProfile = useCallback(() => {
    loadProfile(true)
  }, [loadProfile])

  // Preload profile data immediately on mount
  useEffect(() => {
    // Try to load from cache first (instant)
    const cached = localStorage.getItem(CACHE_KEY)
    if (cached) {
      const { data, timestamp } = JSON.parse(cached)
      const isExpired = Date.now() - timestamp > CACHE_DURATION
      
      if (!isExpired && data) {
        console.log('⚡ Profile preloaded from cache instantly')
        setProfile(data)
        setIsLoading(false)
        
        // Load attendance data in background
        setTimeout(() => loadAttendanceData(data.id), 0)
        return
      }
    }
    
    // If no cache, load from database
    loadProfile()
  }, [loadProfile])

  return {
    profile,
    attendanceData,
    isLoading,
    error,
    refreshProfile
  }
}


