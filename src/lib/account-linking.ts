// Account Linking Service - Links KingsChat accounts to existing Firebase accounts
import { FirebaseDatabaseService } from './firebase-database'
import { KingsChatAuthService } from './kingschat-auth'
import { FirebaseAuthService } from './firebase-auth'
import type { UserProfile } from '@/types/supabase'

interface LinkedAccount {
  kingschatUserId?: string
  kingschatEmail?: string
  kingschatLinkedAt?: string
  authProviders: string[] // ['email', 'kingschat']
}

export class AccountLinkingService {
  /**
   * Link KingsChat account to existing Firebase user
   */
  static async linkKingsChatToFirebase(
    firebaseUserId: string,
    kingschatAccessToken: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      console.log('🔗 Linking KingsChat account to Firebase user...')

      // Get KingsChat user profile
      const kingschatProfile = await KingsChatAuthService.getUserProfile(kingschatAccessToken)
      
      if (!kingschatProfile) {
        return { success: false, error: 'Failed to fetch KingsChat profile' }
      }

      // Check if this KingsChat account is already linked to another user
      const existingLink = await this.findUserByKingsChatId(kingschatProfile.userId)
      
      if (existingLink && existingLink.id !== firebaseUserId) {
        return { 
          success: false, 
          error: 'This KingsChat account is already linked to another account' 
        }
      }

      // Update Firebase user profile with KingsChat data
      const currentProfile = await FirebaseDatabaseService.getDocument('profiles', firebaseUserId) as UserProfile | null
      
      if (!currentProfile) {
        return { success: false, error: 'User profile not found' }
      }

      const authProviders = currentProfile.authProviders || ['email']
      if (!authProviders.includes('kingschat')) {
        authProviders.push('kingschat')
      }

      await FirebaseDatabaseService.updateDocument('profiles', firebaseUserId, {
        kingschatUserId: kingschatProfile.userId,
        kingschatEmail: kingschatProfile.email,
        kingschatLinkedAt: new Date().toISOString(),
        authProviders: authProviders,
        updated_at: new Date().toISOString()
      })

      console.log('✅ KingsChat account linked successfully')
      return { success: true }
    } catch (error: any) {
      console.error('❌ Failed to link KingsChat account:', error)
      return { success: false, error: error.message || 'Failed to link account' }
    }
  }

  /**
   * Unlink KingsChat account from Firebase user
   */
  static async unlinkKingsChatFromFirebase(
    firebaseUserId: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      console.log('🔓 Unlinking KingsChat account...')

      const currentProfile = await FirebaseDatabaseService.getDocument('profiles', firebaseUserId)
      
      if (!currentProfile) {
        return { success: false, error: 'User profile not found' }
      }

      // Remove KingsChat data from profile
      await FirebaseDatabaseService.updateDocument('profiles', firebaseUserId, {
        kingschatUserId: null,
        kingschatEmail: null,
        kingschatLinkedAt: null,
        authProviders: ['email'], // Keep only email
        updated_at: new Date().toISOString()
      })

      // Clear KingsChat tokens
      KingsChatAuthService.clearTokens()

      console.log('✅ KingsChat account unlinked successfully')
      return { success: true }
    } catch (error: any) {
      console.error('❌ Failed to unlink KingsChat account:', error)
      return { success: false, error: error.message || 'Failed to unlink account' }
    }
  }

  /**
   * Find Firebase user by KingsChat user ID
   */
  static async findUserByKingsChatId(kingschatUserId: string): Promise<UserProfile | null> {
    try {
      const users = await FirebaseDatabaseService.getCollectionWhere(
        'profiles',
        'kingschatUserId',
        '==',
        kingschatUserId
      )
      
      if (users && users.length > 0) {
        return users[0] as UserProfile
      }
      
      return null
    } catch (error) {
      console.error('Error finding user by KingsChat ID:', error)
      return null
    }
  }

  /**
   * Find Firebase user by KingsChat email
   */
  static async findUserByKingsChatEmail(email: string): Promise<string | null> {
    try {
      // Query Firestore for user with this email
      const users = await FirebaseDatabaseService.getCollectionWhere(
        'profiles',
        'email',
        '==',
        email
      )

      if (users && users.length > 0) {
        return users[0].id
      }

      return null
    } catch (error) {
      console.error('❌ Failed to find user by email:', error)
      return null
    }
  }

  /**
   * Check if user has KingsChat linked
   */
  static async isKingsChatLinked(firebaseUserId: string): Promise<boolean> {
    try {
      const profile = await FirebaseDatabaseService.getDocument('profiles', firebaseUserId) as UserProfile | null
      return !!(profile?.kingschatUserId)
    } catch (error) {
      console.error('❌ Failed to check KingsChat link status:', error)
      return false
    }
  }

  /**
   * Handle KingsChat login - either link to existing account or create new one
   */
  static async handleKingsChatLogin(
    kingschatAccessToken: string
  ): Promise<{ 
    success: boolean
    userId?: string
    isNewUser?: boolean
    needsLinking?: boolean
    error?: string 
  }> {
    try {
      console.log('🔐 Handling KingsChat login...')

      // Get KingsChat profile
      const kingschatProfile = await KingsChatAuthService.getUserProfile(kingschatAccessToken)
      
      if (!kingschatProfile) {
        return { success: false, error: 'Failed to fetch KingsChat profile' }
      }

      // Check if this KingsChat account is already linked
      let existingUser = await this.findUserByKingsChatId(kingschatProfile.userId)

      if (existingUser) {
        // User exists with this KingsChat account
        console.log('✅ Existing user found with KingsChat account')
        return { success: true, userId: existingUser.id, isNewUser: false }
      }

      // Check if user exists with same email
      let userId: string | null = null
      if (kingschatProfile.email) {
        userId = await this.findUserByKingsChatEmail(kingschatProfile.email)
        
        if (userId) {
          // User exists with same email but KingsChat not linked
          console.log('⚠️ User exists with same email - needs linking')
          return { 
            success: true, 
            userId, 
            isNewUser: false,
            needsLinking: true 
          }
        }
      }

      // New user - create Firebase account
      console.log('🆕 Creating new user account with KingsChat')
      
      // Generate a random password for Firebase (user won't use it)
      const randomPassword = Math.random().toString(36).slice(-16) + Math.random().toString(36).slice(-16)
      
      const result = await FirebaseAuthService.createUserWithEmailAndPassword(
        kingschatProfile.email || `${kingschatProfile.userId}@kingschat.temp`,
        randomPassword,
        {
          first_name: kingschatProfile.firstName || '',
          last_name: kingschatProfile.lastName || '',
          email: kingschatProfile.email || '',
          kingschatUserId: kingschatProfile.userId,
          kingschatEmail: kingschatProfile.email,
          kingschatLinkedAt: new Date().toISOString(),
          authProviders: ['kingschat'],
          profile_completed: true
        }
      )

      if (result.error || !result.user) {
        return { success: false, error: result.error || 'Failed to create account' }
      }

      console.log('✅ New user created successfully')
      return { success: true, userId: result.user.uid, isNewUser: true }

    } catch (error: any) {
      console.error('❌ Failed to handle KingsChat login:', error)
      return { success: false, error: error.message || 'Failed to process login' }
    }
  }
}
