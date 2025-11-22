// Admin Service - Email-based admin system
import { FirebaseDatabaseService } from './firebase-database'
import { FirebaseAuthService } from './firebase-auth'

export interface AdminUser {
  id: string
  email: string
  first_name?: string
  last_name?: string
  kingschat_id?: string
  isAdmin: boolean
  adminRole: 'super_admin' | 'admin'
  createdAt: Date
  updatedAt: Date
}

// Default admin emails
export const DEFAULT_ADMIN_EMAILS = [
  'deamirclothingstores@gmail.com',
  'ephraimloveworld1@gmail.com',
  'ihenacho23@gmail.com',
  'lliamzelvin@gmail.com'
]

export class AdminService {
  // Check if a user is an admin by email
  static async isUserAdmin(email: string): Promise<boolean> {
    try {
      // Check if it's a default admin
      if (DEFAULT_ADMIN_EMAILS.includes(email)) {
        return true
      }

      // Check in admin_users collection
      const adminUsers = await FirebaseDatabaseService.getCollectionWhere(
        'admin_users',
        'email',
        '==',
        email
      )

      return adminUsers && adminUsers.length > 0 && (adminUsers[0] as any).isAdmin
    } catch (error) {
      console.error('Error checking admin status:', error)
      return false
    }
  }

  // Get admin user data by email
  static async getAdminUser(email: string): Promise<AdminUser | null> {
    try {
      // Check if it's a default admin
      if (DEFAULT_ADMIN_EMAILS.includes(email)) {
        // Get user profile from profiles collection
        const profiles = await FirebaseDatabaseService.getCollectionWhere(
          'profiles',
          'email',
          '==',
          email
        )

        if (profiles && profiles.length > 0) {
          const profile = profiles[0] as any
          return {
            id: profile.id,
            email: profile.email,
            first_name: profile.first_name,
            last_name: profile.last_name,
            kingschat_id: profile.kingschat_id,
            isAdmin: true,
            adminRole: 'super_admin',
            createdAt: new Date(),
            updatedAt: new Date()
          }
        }
      }

      // Check in admin_users collection
      const adminUsers = await FirebaseDatabaseService.getCollectionWhere(
        'admin_users',
        'email',
        '==',
        email
      )

      if (adminUsers && adminUsers.length > 0) {
        return adminUsers[0] as AdminUser
      }

      return null
    } catch (error) {
      console.error('Error getting admin user:', error)
      return null
    }
  }

  // Get all members (users) for admin management
  static async getAllMembers(): Promise<any[]> {
    try {
      const profiles = await FirebaseDatabaseService.getCollection('profiles')
      return profiles || []
    } catch (error) {
      console.error('Error getting all members:', error)
      return []
    }
  }

  // Make a user an admin
  static async makeUserAdmin(userId: string, email: string, adminRole: 'super_admin' | 'admin' = 'admin'): Promise<{ success: boolean; error?: string }> {
    try {
      // Get user profile first
      const profile = await FirebaseDatabaseService.getDocument('profiles', userId)
      if (!profile) {
        return { success: false, error: 'User profile not found' }
      }

      // Check if admin user already exists
      const existingAdmins = await FirebaseDatabaseService.getCollectionWhere(
        'admin_users',
        'email',
        '==',
        email
      )

      if (existingAdmins && existingAdmins.length > 0) {
        // Update existing admin
        const result = await FirebaseDatabaseService.updateDocument('admin_users', existingAdmins[0].id, {
          isAdmin: true,
          adminRole,
          updatedAt: new Date()
        })
        return { success: result.success, error: result.error as string | undefined }
      } else {
        // Create new admin user
        const profileData = profile as any
        const adminUser: Omit<AdminUser, 'id'> = {
          email: profileData.email,
          first_name: profileData.first_name,
          last_name: profileData.last_name,
          kingschat_id: profileData.kingschat_id,
          isAdmin: true,
          adminRole,
          createdAt: new Date(),
          updatedAt: new Date()
        }

        const result = await FirebaseDatabaseService.addDocument('admin_users', adminUser)
        return { success: result.success, error: result.error as string | undefined }
      }
    } catch (error) {
      console.error('Error making user admin:', error)
      return { success: false, error: 'Failed to make user admin' }
    }
  }

  // Remove admin privileges from a user
  static async removeUserAdmin(email: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Don't allow removing default admins
      if (DEFAULT_ADMIN_EMAILS.includes(email)) {
        return { success: false, error: 'Cannot remove default admin privileges' }
      }

      const adminUsers = await FirebaseDatabaseService.getCollectionWhere(
        'admin_users',
        'email',
        '==',
        email
      )

      if (adminUsers && adminUsers.length > 0) {
        const result = await FirebaseDatabaseService.updateDocument('admin_users', adminUsers[0].id, {
          isAdmin: false,
          updatedAt: new Date()
        })
        return { success: result.success, error: result.error as string | undefined }
      }

      return { success: true } // User wasn't an admin anyway
    } catch (error) {
      console.error('Error removing user admin:', error)
      return { success: false, error: 'Failed to remove admin privileges' }
    }
  }

  // Get all admin users
  static async getAllAdmins(): Promise<AdminUser[]> {
    try {
      const adminUsers = await FirebaseDatabaseService.getCollectionWhere(
        'admin_users',
        'isAdmin',
        '==',
        true
      )

      const admins = adminUsers || []

      // Always include default admins if not already in the list
      for (const defaultEmail of DEFAULT_ADMIN_EMAILS) {
        const hasDefaultAdmin = admins.some(admin => (admin as any).email === defaultEmail)
        if (!hasDefaultAdmin) {
          // Get default admin profile
          const profiles = await FirebaseDatabaseService.getCollectionWhere(
            'profiles',
            'email',
            '==',
            defaultEmail
          )

          if (profiles && profiles.length > 0) {
            const profile = profiles[0] as any
            admins.unshift({
              id: profile.id,
              email: profile.email,
              first_name: profile.first_name,
              last_name: profile.last_name,
              kingschat_id: profile.kingschat_id,
              isAdmin: true,
              adminRole: 'super_admin',
              createdAt: new Date(),
              updatedAt: new Date()
            } as any)
          }
        }
      }

      return admins as AdminUser[]
    } catch (error) {
      console.error('Error getting all admins:', error)
      return []
    }
  }

  // Update member profile
  static async updateMemberProfile(userId: string, updates: {
    first_name?: string
    last_name?: string
    email?: string
    kingschat_id?: string
    designation?: string
    administration?: string
    zone?: string
  }): Promise<{ success: boolean; error?: string }> {
    try {
      const result = await FirebaseDatabaseService.updateDocument('profiles', userId, {
        ...updates,
        updated_at: new Date()
      })
      return { success: result.success, error: result.error as string | undefined }
    } catch (error) {
      console.error('Error updating member profile:', error)
      return { success: false, error: 'Failed to update member profile' }
    }
  }

  // Block a user
  static async blockUser(userId: string, email: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Don't allow blocking default admins
      if (DEFAULT_ADMIN_EMAILS.includes(email)) {
        return { success: false, error: 'Cannot block default admin' }
      }

      const result = await FirebaseDatabaseService.updateDocument('profiles', userId, {
        is_blocked: true,
        blocked_at: new Date(),
        updated_at: new Date()
      })
      return { success: result.success, error: result.error }
    } catch (error) {
      console.error('Error blocking user:', error)
      return { success: false, error: 'Failed to block user' }
    }
  }

  // Unblock a user
  static async unblockUser(userId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const result = await FirebaseDatabaseService.updateDocument('profiles', userId, {
        is_blocked: false,
        blocked_at: null,
        updated_at: new Date()
      })
      return { success: result.success, error: result.error }
    } catch (error) {
      console.error('Error unblocking user:', error)
      return { success: false, error: 'Failed to unblock user' }
    }
  }

  // Delete a user (soft delete - mark as deleted)
  static async deleteUser(userId: string, email: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Don't allow deleting default admins
      if (DEFAULT_ADMIN_EMAILS.includes(email)) {
        return { success: false, error: 'Cannot delete default admin' }
      }

      // First remove admin privileges if they have any
      await this.removeUserAdmin(email)

      // Mark as deleted instead of actually deleting
      const result = await FirebaseDatabaseService.updateDocument('profiles', userId, {
        is_deleted: true,
        deleted_at: new Date(),
        updated_at: new Date()
      })
      return { success: result.success, error: result.error }
    } catch (error) {
      console.error('Error deleting user:', error)
      return { success: false, error: 'Failed to delete user' }
    }
  }

  // Restore a deleted user
  static async restoreUser(userId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const result = await FirebaseDatabaseService.updateDocument('profiles', userId, {
        is_deleted: false,
        deleted_at: null,
        updated_at: new Date()
      })
      return { success: result.success, error: result.error }
    } catch (error) {
      console.error('Error restoring user:', error)
      return { success: false, error: 'Failed to restore user' }
    }
  }

  // Get all members including blocked/deleted (for admin view)
  static async getAllMembersWithStatus(): Promise<any[]> {
    try {
      const profiles = await FirebaseDatabaseService.getCollection('profiles')
      return profiles || []
    } catch (error) {
      console.error('Error getting all members with status:', error)
      return []
    }
  }
}