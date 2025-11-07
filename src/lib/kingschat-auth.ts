// KingsChat Authentication Service
import kingsChatWebSdk from 'kingschat-web-sdk'

// Replace with your actual KingsChat Client ID from KingsChat Developer Site
const KINGSCHAT_CLIENT_ID = process.env.NEXT_PUBLIC_KINGSCHAT_CLIENT_ID || 'YOUR_CLIENT_ID_HERE'

interface KingsChatAuthTokens {
  accessToken: string
  expiresInMillis: number
  refreshToken: string
}

interface KingsChatUserProfile {
  userId: string
  email?: string
  firstName?: string
  lastName?: string
  profilePicture?: string
}

export class KingsChatAuthService {
  /**
   * Initiate KingsChat login flow
   * Opens KingsChat OAuth popup and returns authentication tokens
   */
  static async login(): Promise<KingsChatAuthTokens | null> {
    try {
      console.log('🔐 Initiating KingsChat login...')
      
      const loginOptions = {
        scopes: ['profile', 'email'], // Request profile and email access
        clientId: KINGSCHAT_CLIENT_ID
      }

      const authResponse = await kingsChatWebSdk.login(loginOptions)
      
      console.log('✅ KingsChat login successful')
      
      // Store tokens in localStorage for persistence
      if (typeof window !== 'undefined') {
        localStorage.setItem('kingschat_access_token', authResponse.accessToken)
        localStorage.setItem('kingschat_refresh_token', authResponse.refreshToken)
        localStorage.setItem('kingschat_token_expiry', (Date.now() + authResponse.expiresInMillis).toString())
      }
      
      return authResponse
    } catch (error) {
      console.error('❌ KingsChat login failed:', error)
      return null
    }
  }

  /**
   * Refresh KingsChat authentication token
   */
  static async refreshToken(refreshToken: string): Promise<KingsChatAuthTokens | null> {
    try {
      console.log('🔄 Refreshing KingsChat token...')
      
      const refreshOptions = {
        clientId: KINGSCHAT_CLIENT_ID,
        refreshToken: refreshToken
      }

      const authResponse = await kingsChatWebSdk.refreshAuthenticationToken(refreshOptions)
      
      console.log('✅ KingsChat token refreshed')
      
      // Update stored tokens
      if (typeof window !== 'undefined') {
        localStorage.setItem('kingschat_access_token', authResponse.accessToken)
        localStorage.setItem('kingschat_refresh_token', authResponse.refreshToken)
        localStorage.setItem('kingschat_token_expiry', (Date.now() + authResponse.expiresInMillis).toString())
      }
      
      return authResponse
    } catch (error) {
      console.error('❌ KingsChat token refresh failed:', error)
      return null
    }
  }

  /**
   * Get stored KingsChat tokens from localStorage
   */
  static getStoredTokens(): KingsChatAuthTokens | null {
    if (typeof window === 'undefined') return null

    const accessToken = localStorage.getItem('kingschat_access_token')
    const refreshToken = localStorage.getItem('kingschat_refresh_token')
    const expiryStr = localStorage.getItem('kingschat_token_expiry')

    if (!accessToken || !refreshToken || !expiryStr) return null

    const expiresInMillis = parseInt(expiryStr) - Date.now()

    return {
      accessToken,
      refreshToken,
      expiresInMillis
    }
  }

  /**
   * Check if KingsChat token is expired
   */
  static isTokenExpired(): boolean {
    if (typeof window === 'undefined') return true

    const expiryStr = localStorage.getItem('kingschat_token_expiry')
    if (!expiryStr) return true

    const expiry = parseInt(expiryStr)
    return Date.now() >= expiry
  }

  /**
   * Get valid access token (refresh if needed)
   */
  static async getValidAccessToken(): Promise<string | null> {
    const tokens = this.getStoredTokens()
    if (!tokens) return null

    // If token is expired, refresh it
    if (this.isTokenExpired()) {
      const refreshedTokens = await this.refreshToken(tokens.refreshToken)
      return refreshedTokens?.accessToken || null
    }

    return tokens.accessToken
  }

  /**
   * Send message to KingsChat user
   */
  static async sendMessage(userIdentifier: string, message: string): Promise<boolean> {
    try {
      const accessToken = await this.getValidAccessToken()
      if (!accessToken) {
        console.error('❌ No valid access token')
        return false
      }

      const sendMessageOptions = {
        message,
        userIdentifier,
        accessToken
      }

      await kingsChatWebSdk.sendMessage(sendMessageOptions)
      console.log('✅ Message sent successfully')
      return true
    } catch (error) {
      console.error('❌ Failed to send message:', error)
      return false
    }
  }

  /**
   * Get KingsChat user profile from KingsChat API
   */
  static async getUserProfile(accessToken: string): Promise<KingsChatUserProfile | null> {
    try {
      console.log('📋 Fetching KingsChat user profile...')
      
      // Make API call to KingsChat to get user profile
      // Note: Update the endpoint based on KingsChat's actual API documentation
      const response = await fetch('https://api.kingsch.at/v1/user/me', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (!response.ok) {
        throw new Error(`Failed to fetch profile: ${response.statusText}`)
      }
      
      const data = await response.json()
      
      // Map KingsChat response to our profile interface
      const profile: KingsChatUserProfile = {
        userId: data.id || data.userId || data.user_id,
        email: data.email,
        firstName: data.firstName || data.first_name || data.name?.split(' ')[0],
        lastName: data.lastName || data.last_name || data.name?.split(' ').slice(1).join(' '),
        profilePicture: data.profilePicture || data.profile_picture || data.avatar
      }
      
      console.log('✅ KingsChat profile fetched successfully')
      return profile
    } catch (error) {
      console.error('❌ Failed to fetch user profile:', error)
      return null
    }
  }

  /**
   * Clear KingsChat tokens (logout)
   */
  static clearTokens(): void {
    if (typeof window === 'undefined') return

    localStorage.removeItem('kingschat_access_token')
    localStorage.removeItem('kingschat_refresh_token')
    localStorage.removeItem('kingschat_token_expiry')
    console.log('🚪 KingsChat tokens cleared')
  }

  /**
   * Check if user is authenticated with KingsChat
   */
  static isAuthenticated(): boolean {
    const tokens = this.getStoredTokens()
    return tokens !== null && !this.isTokenExpired()
  }
}
