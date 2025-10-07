// Session Manager for LoveWorld Singers Rehearsal Hub
// Handles session creation, validation, and automatic expiration

export interface SessionConfig {
  duration: number // Duration in milliseconds
  unit: 'hours' | 'days' // Time unit
  autoRefresh: boolean // Whether to auto-refresh session
  refreshThreshold: number // Refresh when this much time is left (in minutes)
}

export interface UserSession {
  userId: string
  email: string
  loginTime: number
  expiresAt: number
  refreshToken?: string
  isActive: boolean
}

export class SessionManager {
  private static readonly STORAGE_KEY = 'loveworld-singers-session'
  private static readonly DEFAULT_CONFIG: SessionConfig = {
    duration: 10, // 10 days by default
    unit: 'days',
    autoRefresh: true,
    refreshThreshold: 60 // Refresh when 1 hour is left
  }

  // Create a new session
  static createSession(userId: string, email: string, config?: Partial<SessionConfig>): UserSession {
    const sessionConfig = { ...this.DEFAULT_CONFIG, ...config }
    const now = Date.now()
    const durationMs = this.convertToMilliseconds(sessionConfig.duration, sessionConfig.unit)
    
    const session: UserSession = {
      userId,
      email,
      loginTime: now,
      expiresAt: now + durationMs,
      isActive: true
    }

    // Store session in localStorage
    this.saveSession(session)
    
    console.log(`✅ Session created for ${email}, expires in ${sessionConfig.duration} ${sessionConfig.unit}`)
    return session
  }

  // Get current session
  static getCurrentSession(): UserSession | null {
    try {
      if (typeof window === 'undefined') return null

      const sessionData = localStorage.getItem(this.STORAGE_KEY)
      if (!sessionData) return null

      const session: UserSession = JSON.parse(sessionData)
      
      // Check if session is expired
      if (this.isSessionExpired(session)) {
        console.log('⏰ Session expired, clearing...')
        this.clearSession()
        return null
      }

      // Check if session needs refresh
      if (this.shouldRefreshSession(session)) {
        console.log('🔄 Session needs refresh...')
        this.refreshSession(session)
      }

      return session
    } catch (error) {
      console.error('Error getting session:', error)
      this.clearSession()
      return null
    }
  }

  // Check if session is valid
  static isSessionValid(): boolean {
    const session = this.getCurrentSession()
    return session !== null && session.isActive
  }

  // Check if session is expired
  private static isSessionExpired(session: UserSession): boolean {
    return Date.now() >= session.expiresAt
  }

  // Check if session should be refreshed
  private static shouldRefreshSession(session: UserSession): boolean {
    const timeLeft = session.expiresAt - Date.now()
    const refreshThresholdMs = this.DEFAULT_CONFIG.refreshThreshold * 60 * 1000 // Convert minutes to ms
    return timeLeft <= refreshThresholdMs
  }

  // Refresh session (extend expiration time)
  private static refreshSession(session: UserSession): void {
    const durationMs = this.convertToMilliseconds(this.DEFAULT_CONFIG.duration, this.DEFAULT_CONFIG.unit)
    session.expiresAt = Date.now() + durationMs
    
    this.saveSession(session)
    console.log('🔄 Session refreshed')
  }

  // Extend session manually
  static extendSession(duration?: number, unit?: 'hours' | 'days'): boolean {
    const session = this.getCurrentSession()
    if (!session) return false

    const extendDuration = duration || this.DEFAULT_CONFIG.duration
    const extendUnit = unit || this.DEFAULT_CONFIG.unit
    const durationMs = this.convertToMilliseconds(extendDuration, extendUnit)
    
    session.expiresAt = Date.now() + durationMs
    this.saveSession(session)
    
    console.log(`⏰ Session extended by ${extendDuration} ${extendUnit}`)
    return true
  }

  // Clear session (logout)
  static clearSession(): void {
    try {
      localStorage.removeItem(this.STORAGE_KEY)
      console.log('🚪 Session cleared')
    } catch (error) {
      console.error('Error clearing session:', error)
    }
  }

  // Get session info
  static getSessionInfo(): { 
    isValid: boolean
    timeLeft: number
    timeLeftFormatted: string
    expiresAt: Date | null
  } {
    const session = this.getCurrentSession()
    
    if (!session) {
      return {
        isValid: false,
        timeLeft: 0,
        timeLeftFormatted: 'No active session',
        expiresAt: null
      }
    }

    const timeLeft = session.expiresAt - Date.now()
    const timeLeftFormatted = this.formatTimeLeft(timeLeft)
    
    return {
      isValid: true,
      timeLeft,
      timeLeftFormatted,
      expiresAt: new Date(session.expiresAt)
    }
  }

  // Save session to localStorage
  private static saveSession(session: UserSession): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(session))
    } catch (error) {
      console.error('Error saving session:', error)
    }
  }

  // Convert duration to milliseconds
  private static convertToMilliseconds(duration: number, unit: 'hours' | 'days'): number {
    switch (unit) {
      case 'hours':
        return duration * 60 * 60 * 1000
      case 'days':
        return duration * 24 * 60 * 60 * 1000
      default:
        return duration * 24 * 60 * 60 * 1000 // Default to days
    }
  }

  // Format time left in human readable format
  private static formatTimeLeft(timeLeft: number): string {
    if (timeLeft <= 0) return 'Expired'
    
    const days = Math.floor(timeLeft / (24 * 60 * 60 * 1000))
    const hours = Math.floor((timeLeft % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000))
    const minutes = Math.floor((timeLeft % (60 * 60 * 1000)) / (60 * 1000))
    
    if (days > 0) {
      return `${days} day${days > 1 ? 's' : ''} ${hours} hour${hours > 1 ? 's' : ''}`
    } else if (hours > 0) {
      return `${hours} hour${hours > 1 ? 's' : ''} ${minutes} minute${minutes > 1 ? 's' : ''}`
    } else {
      return `${minutes} minute${minutes > 1 ? 's' : ''}`
    }
  }

  // Set up automatic session monitoring
  static startSessionMonitoring(): void {
    // Check session every minute
    setInterval(() => {
      const session = this.getCurrentSession()
      if (!session) {
        // Session expired or invalid, trigger logout
        this.handleSessionExpired()
      }
    }, 60000) // Check every minute
  }

  // Handle session expiration
  private static handleSessionExpired(): void {
    console.log('⏰ Session expired, triggering logout...')
    
    // Clear session
    this.clearSession()
    
    // Dispatch custom event for components to listen to
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('session-expired'))
    }
  }

  // Create session with custom duration
  static createCustomSession(
    userId: string, 
    email: string, 
    duration: number, 
    unit: 'hours' | 'days' = 'days'
  ): UserSession {
    return this.createSession(userId, email, { duration, unit })
  }

  // Create short session (for testing)
  static createShortSession(userId: string, email: string, hours: number = 1): UserSession {
    return this.createSession(userId, email, { duration: hours, unit: 'hours' })
  }

  // Create long session (for trusted devices)
  static createLongSession(userId: string, email: string, days: number = 30): UserSession {
    return this.createSession(userId, email, { duration: days, unit: 'days' })
  }
}
