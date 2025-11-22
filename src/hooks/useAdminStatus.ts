// Hook to check if current user is an admin
import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { AdminService, AdminUser } from '@/lib/admin-service'

export function useAdminStatus() {
  const { user, profile } = useAuth()
  const [isAdmin, setIsAdmin] = useState(false)
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user?.email || !profile) {
        setIsAdmin(false)
        setAdminUser(null)
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        const adminStatus = await AdminService.isUserAdmin(user.email)
        setIsAdmin(adminStatus)

        if (adminStatus) {
          const adminUserData = await AdminService.getAdminUser(user.email)
          setAdminUser(adminUserData)
        } else {
          setAdminUser(null)
        }
      } catch (error) {
        console.error('Error checking admin status:', error)
        setIsAdmin(false)
        setAdminUser(null)
      } finally {
        setIsLoading(false)
      }
    }

    checkAdminStatus()
  }, [user?.email, profile])

  return {
    isAdmin,
    adminUser,
    isLoading
  }
}