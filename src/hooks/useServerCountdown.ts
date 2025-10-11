import { useState, useEffect, useRef } from 'react'

interface ServerTimeResponse {
  serverTime: string
  timestamp: number
  timezone: string
}

interface CountdownData {
  days: number
  hours: number
  minutes: number
  seconds: number
}

interface UseServerCountdownProps {
  targetDate?: Date
  countdownData?: {
    days: number
    hours: number
    minutes: number
    seconds: number
  }
  praiseNightId?: string | number
}

export function useServerCountdown({ 
  targetDate, 
  countdownData, 
  praiseNightId 
}: UseServerCountdownProps) {
  const [timeLeft, setTimeLeft] = useState<CountdownData>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  })
  
  const [serverTimeOffset, setServerTimeOffset] = useState<number>(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const targetDateRef = useRef<Date | null>(null)

  // Fetch server time and calculate offset
  const fetchServerTime = async () => {
    try {
      const response = await fetch('/api/countdown', {
        cache: 'no-store', // Always get fresh server time
        headers: {
          'Cache-Control': 'no-cache'
        }
      })
      
      if (!response.ok) {
        throw new Error('Failed to fetch server time')
      }
      
      const data: ServerTimeResponse = await response.json()
      const serverTime = new Date(data.serverTime)
      const clientTime = new Date()
      
      // Calculate offset between server and client time
      const offset = serverTime.getTime() - clientTime.getTime()
      setServerTimeOffset(offset)
      
      
      return serverTime
    } catch (err) {
      console.error('Error fetching server time:', err)
      setError('Failed to sync with server time')
      // Fallback to client time with 0 offset
      setServerTimeOffset(0)
      return new Date()
    }
  }

  // Calculate time left using server-synced time
  const calculateTimeLeft = () => {
    if (!targetDateRef.current) return

    const now = new Date()
    // Apply server time offset to get accurate time
    const syncedTime = new Date(now.getTime() + serverTimeOffset)
    const difference = targetDateRef.current.getTime() - syncedTime.getTime()
    
    // Debug: Log calculation details
    console.log('🕐 Calculate Time Left:', {
      now: now.toISOString(),
      syncedTime: syncedTime.toISOString(),
      targetDate: targetDateRef.current.toISOString(),
      difference,
      serverTimeOffset
    });
    
    if (difference > 0) {
      const days = Math.floor(difference / (1000 * 60 * 60 * 24))
      const hours = Math.floor((difference / (1000 * 60 * 60)) % 24)
      const minutes = Math.floor((difference / (1000 * 60)) % 60)
      const seconds = Math.floor((difference / 1000) % 60)
      
      console.log('🕐 Calculated time left:', { days, hours, minutes, seconds });
      setTimeLeft({ days, hours, minutes, seconds })
    } else {
      // Countdown finished
      console.log('🕐 Countdown finished - difference is negative:', difference);
      setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 })
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }

  // Initialize countdown
  useEffect(() => {
    const initializeCountdown = async () => {
      setIsLoading(true)
      setError(null)


      try {
        // Get server time first
        const serverTime = await fetchServerTime()
        
        let target: Date
        
        if (targetDate) {
          // Use provided target date
          target = targetDate
        } else if (countdownData) {
          // Use the countdown data from Firebase directly
          const totalMs = 
            (countdownData.days * 24 * 60 * 60 * 1000) +
            (countdownData.hours * 60 * 60 * 1000) +
            (countdownData.minutes * 60 * 1000) +
            (countdownData.seconds * 1000);
          
          // Use the countdown data as-is from Firebase
          target = new Date(serverTime.getTime() + totalMs);
          
          console.log('🕐 Countdown data processing:', {
            countdownData,
            totalMs,
            serverTime: serverTime.toISOString(),
            target: target.toISOString()
          });
        } else {
          // If no countdown data, don't show countdown
          console.log('🕐 No countdown data available');
          setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
          setIsLoading(false);
          return;
        }
        
        targetDateRef.current = target
        
        // Store target date in localStorage for persistence
        if (praiseNightId) {
          const storageKey = `server_target_date_${praiseNightId}`
          localStorage.setItem(storageKey, target.toISOString())
        }
        
        
        // Calculate initial time
        calculateTimeLeft()
        
        // Debug: Log the target date and countdown data
        console.log('🕐 Server Countdown Debug:', {
          targetDate: target.toISOString(),
          countdownData,
          serverTime: serverTime.toISOString(),
          totalMs: countdownData ? 
            (countdownData.days * 24 * 60 * 60 * 1000) +
            (countdownData.hours * 60 * 60 * 1000) +
            (countdownData.minutes * 60 * 1000) +
            (countdownData.seconds * 1000) : 0
        });
        
        // Set up interval
        if (intervalRef.current) {
          clearInterval(intervalRef.current)
        }
        intervalRef.current = setInterval(calculateTimeLeft, 1000)
        
      } catch (err) {
        console.error('Error initializing countdown:', err)
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setIsLoading(false)
      }
    }

    initializeCountdown()

    // Cleanup
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [targetDate, countdownData, praiseNightId])

  // Sync with server time every 30 seconds to maintain accuracy
  useEffect(() => {
    const syncInterval = setInterval(async () => {
      await fetchServerTime()
    }, 30000) // Sync every 30 seconds

    return () => clearInterval(syncInterval)
  }, [])

  return {
    timeLeft,
    isLoading,
    error,
    serverTimeOffset
  }
}
