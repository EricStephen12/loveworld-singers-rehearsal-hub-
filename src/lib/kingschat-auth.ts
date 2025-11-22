// KingsChat Authentication Service using Official Web SDK

export interface KingsChatTokens {
  accessToken: string
  refreshToken?: string
  expiresIn?: number
}

export interface KingsChatUser {
  userId: string
  id: string
  email?: string
  emailAddress?: string
  firstName?: string
  lastName?: string
  name?: string
  profilePicture?: string
  verified?: boolean
}

export class KingsChatAuthService {
  /**
   * Initiate KingsChat OAuth login using Official Web SDK
   */
  static async login(): Promise<KingsChatTokens | null> {
    try {
      console.log('🚀 Starting KingsChat OAuth with official SDK...')
      
      // Import the KingsChat Web SDK - it has a login function
      const { login } = await import('kingschat-web-sdk')
      
      console.log('📦 KingsChat SDK login function loaded')
      
      // Use the SDK's login function with proper scopes
      const authResult = await login({
        clientId: process.env.NEXT_PUBLIC_KINGSCHAT_CLIENT_ID || '331c9eda-a130-4bb8-9a00-9231a817207d',
        scopes: ['profile', 'email']
      } as any)
      
      if (!authResult) {
        console.log('⚠️ KingsChat authentication was cancelled')
        return null
      }
      
      console.log('✅ KingsChat authentication successful:', authResult)
      
      return {
        accessToken: authResult.accessToken,
        refreshToken: authResult.refreshToken,
        expiresIn: 3600
      }
      
    } catch (error: any) {
      console.error('❌ KingsChat SDK error:', error)
      throw new Error(`KingsChat authentication failed: ${error.message}`)
    }
  }



  /**
   * Decode JWT token to get user information
   */
  static async decodeToken(accessToken: string): Promise<KingsChatUser> {
    try {
      // Dynamic import to avoid SSR issues - EXACTLY like the working code
      const { jwtDecode } = await import('jwt-decode')
      const decoded: any = jwtDecode(accessToken)
      
      // Extract user data EXACTLY like the working code does
      const kingschatUserId = decoded.userId || decoded.sub || decoded.id
      
      return {
        userId: kingschatUserId,
        id: kingschatUserId,
        email: decoded.email || decoded.emailAddress,
        emailAddress: decoded.emailAddress || decoded.email,
        firstName: decoded.firstName || decoded.first_name,
        lastName: decoded.lastName || decoded.last_name,
        name: decoded.name || `${decoded.firstName || ''} ${decoded.lastName || ''}`.trim(),
        profilePicture: decoded.profilePicture || decoded.picture,
        verified: decoded.verified || false
      }
    } catch (error: any) {
      throw new Error(`Failed to decode token: ${error.message}`)
    }
  }

  /**
   * Get user profile from access token
   */
  static async getUserProfile(accessToken: string): Promise<KingsChatUser> {
    return this.decodeToken(accessToken)
  }

  /**
   * Clear stored KingsChat tokens
   */
  static clearTokens(): void {
    if (typeof window === 'undefined') return
    
    try {
      localStorage.removeItem('kingschat_access_token')
      localStorage.removeItem('kingschat_refresh_token')
      localStorage.removeItem('kingschat_user')
      console.log('🧹 KingsChat tokens cleared')
    } catch (error) {
      console.error('Error clearing KingsChat tokens:', error)
    }
  }
}