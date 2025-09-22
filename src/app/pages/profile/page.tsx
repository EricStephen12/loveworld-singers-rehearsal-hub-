'use client'

import { useState, useEffect } from 'react'
import { ArrowLeft, User, Users, Calendar, QrCode, CheckCircle, Clock, Award, Settings, Edit, Camera, LogOut, Menu, X, Bell, Music, BarChart3, HelpCircle, Home, Play } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import ScreenHeader from '@/components/ScreenHeader'
import SharedDrawer from '@/components/SharedDrawer'
import { getMenuItems } from '@/config/menuItems'
import { useAuth } from '@/contexts/AuthContext'
import QRCodeGenerator from '@/components/QRCodeGenerator'
import { AttendanceService } from '@/lib/attendance-service'

export default function ProfilePage() {
  const [showQRCode, setShowQRCode] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [qrCode, setQrCode] = useState('')
  const [timeLeft, setTimeLeft] = useState(300) // 5 minutes in seconds
  const [isClient, setIsClient] = useState(false)
  const [attendanceHistory, setAttendanceHistory] = useState<any[]>([])
  const [attendanceStats, setAttendanceStats] = useState({ total: 0, present: 0, late: 0, absent: 0, rate: 0 })
  const router = useRouter()
  const { profile, isProfileComplete, signOut, isLoading, refreshProfile } = useAuth()
  const [localProfile, setLocalProfile] = useState(profile)

  // Set client flag to prevent hydration issues
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Ensure profile loads immediately when component mounts
  useEffect(() => {
    const loadProfileImmediately = async () => {
      if (!profile && !isLoading) {
        console.log('Loading profile immediately...')
        try {
          const { AuthService } = await import('@/lib/auth-service')
          const userProfile = await AuthService.getCurrentUserProfile()
          console.log('Immediate profile load result:', userProfile)
          setLocalProfile(userProfile)
        } catch (error) {
          console.error('Immediate profile load error:', error)
        }
      } else if (profile) {
        setLocalProfile(profile)
      }
    }

    loadProfileImmediately()
  }, [profile, isLoading])

  // Update local profile when context profile changes
  useEffect(() => {
    if (profile) {
      setLocalProfile(profile)
    }
  }, [profile])

  // Load attendance data when profile is available
  useEffect(() => {
    if (localProfile?.id) {
      loadAttendanceData()
    }
  }, [localProfile?.id])

  // Set client-side flag
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Auto-generate QR code every 5 minutes (client-side only)
  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return
    
    // Generate initial QR code
    generateQRCode()

    // Set up interval to regenerate every 5 minutes
    const interval = setInterval(() => {
      generateQRCode()
    }, 300000) // 5 minutes

    return () => clearInterval(interval)
  }, [localProfile?.id])

  // Countdown timer (client-side only)
  useEffect(() => {
    if (typeof window === 'undefined') return // Skip on server
    
    if (timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft(prev => prev - 1)
      }, 1000)
      
      return () => clearInterval(timer)
    }
  }, [timeLeft])

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-sm">Loading profile...</p>
        </div>
      </div>
    )
  }

  const handleLogout = async () => {
    await signOut()
    router.push('/auth')
  }

  // Real user data from profile (use localProfile for immediate loading)
  const userProfile = {
    // Personal Information
    firstName: localProfile?.first_name || '',
    middleName: localProfile?.middle_name || '',
    lastName: localProfile?.last_name || '',
    fullName: `${localProfile?.first_name || ''} ${localProfile?.middle_name || ''} ${localProfile?.last_name || ''}`.trim(),
    email: localProfile?.email || '',
    phoneNumber: localProfile?.phone_number || '',
    gender: localProfile?.gender || '',
    birthday: localProfile?.birthday || '',
    
    // Location Information
    region: localProfile?.region || '',
    zone: localProfile?.zone || '',
    church: localProfile?.church || '',
    
    // Ministry Information
    designation: localProfile?.designation || '',
    administration: localProfile?.administration || '',
    socialProvider: localProfile?.social_provider || 'email',
    socialId: localProfile?.social_id || localProfile?.email || '',
    
    // Additional Profile Data (these would come from other tables in a real app)
    groups: ["Main Choir", "Praise Team"], // TODO: Fetch from user_groups table
    joinDate: localProfile?.created_at ? new Date(localProfile.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : '',
    totalRehearsals: 0, // TODO: Calculate from attendance records
    attendanceRate: 0, // TODO: Calculate from attendance records
    lastCheckIn: "Never", // TODO: Get from latest attendance record
    achievements: ["Profile Completed"], // TODO: Fetch from achievements table
    qrCode: localProfile?.id ? `LW-USER-${localProfile.id.slice(0, 8).toUpperCase()}` : "LW-USER-00000000"
  }


  // Generate a new QR code (client-side only)
  const generateQRCode = () => {
    if (typeof window === 'undefined') return // Skip on server
    
    if (localProfile?.id) {
      // Use a more stable approach to prevent hydration issues
      const now = new Date()
      const minutes = Math.floor(now.getTime() / 300000) // 5-minute intervals
      const stableCode = `LW-ATTEND-${localProfile.id.slice(0, 8).toUpperCase()}-${minutes}-STABLE`
      setQrCode(stableCode)
      setTimeLeft(300) // 5 minutes
    }
  }

  // Load attendance data
  const loadAttendanceData = async () => {
    if (!localProfile?.id) return

    try {
      const [history, stats] = await Promise.all([
        AttendanceService.getUserAttendance(localProfile.id, 5),
        AttendanceService.getAttendanceStats(localProfile.id)
      ])
      
      setAttendanceHistory(history)
      setAttendanceStats(stats)
    } catch (error) {
      console.error('Error loading attendance data:', error)
    }
  }




  const menuItems = getMenuItems(handleLogout)

  const rightButtons = null

  return (
    <div className="min-h-screen bg-white">
      {/* Animated Header */}
      <ScreenHeader 
        title="Profile" 
        onMenuClick={() => setIsMenuOpen(!isMenuOpen)}
        rightButtons={rightButtons}
        rightImageSrc="/logo.png"
      />


      {/* Profile Completion Banner */}
      {!isProfileComplete && (
        <div className="mx-4 mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-amber-600" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-amber-800">Complete Your Profile</h3>
                <p className="text-xs text-amber-600">Add more details to personalize your experience</p>
              </div>
            </div>
            <button
              onClick={() => router.push('/profile-completion')}
              className="px-3 py-1 bg-amber-600 text-white text-xs font-medium rounded-lg hover:bg-amber-700 transition-colors"
            >
              Complete
            </button>
          </div>
        </div>
      )}

      {/* Profile Header */}
      <div className="px-4 py-8 bg-gradient-to-br from-purple-50 to-blue-50">
        <div className="text-center">
          <div className="relative inline-block mb-4">
            <div className="w-24 h-24 bg-purple-600 rounded-full flex items-center justify-center mx-auto">
              <User className="w-12 h-12 text-white" />
            </div>
            <button 
              onClick={() => setIsEditing(!isEditing)}
              className="absolute -bottom-1 -right-1 w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center shadow-lg hover:bg-purple-700 transition-colors focus:outline-none focus:ring-0 focus:border-0"
              style={{ outline: 'none', border: 'none', boxShadow: 'none' }}
            >
              <Edit className="w-4 h-4 text-white" />
            </button>
          </div>
          
          <h2 className="text-2xl font-outfit-bold text-gray-800 mb-2">
            {localProfile ? `${localProfile.first_name || ''} ${localProfile.last_name || ''}`.trim() || 'User' : 'User'}
          </h2>
          <p className="text-sm text-gray-600 mb-1">@{localProfile?.social_id || 'user'}</p>
          <p className="text-xs text-gray-500 mb-4">{localProfile?.email || 'user@example.com'}</p>
          
          <div className="flex items-center justify-center space-x-2">
            <span className="text-sm bg-purple-100 text-purple-700 px-3 py-1 rounded-full font-poppins-medium">
              {localProfile?.designation || 'Member'}
            </span>
            <span className="text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-poppins-medium">
              {localProfile?.administration || 'General'}
            </span>
          </div>
        </div>
      </div>


      {/* Account Information */}
      <div className="px-4 py-4">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Account Information</h3>
          
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 mb-4">
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                userProfile.socialProvider === 'google' ? 'bg-blue-500' : 
                userProfile.socialProvider === 'kingschat' ? 'bg-purple-500' : 'bg-gray-500'
              }`}>
                {userProfile.socialProvider === 'google' ? (
                  <svg className="w-4 h-4 text-white" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  </svg>
                ) : userProfile.socialProvider === 'kingschat' ? (
                  <span className="text-white font-bold text-sm">K</span>
                ) : (
                  <span className="text-white font-bold text-sm">@</span>
                )}
              </div>
              <div>
                <p className="text-gray-900 text-sm font-medium">
                  {userProfile.socialProvider === 'google' ? 'Google Account' : 
                   userProfile.socialProvider === 'kingschat' ? 'KingsChat Account' : 'Email Account'}
                </p>
                <p className="text-gray-600 text-xs">{userProfile.socialId}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Personal Information */}
      <div className="px-4 py-4">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Personal Information</h3>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-500 uppercase tracking-wide font-medium">First Name</label>
                <p className="text-sm font-medium text-gray-800 mt-1">{userProfile.firstName || 'Not provided'}</p>
              </div>
              <div>
                <label className="text-xs text-gray-500 uppercase tracking-wide font-medium">Middle Name</label>
                <p className="text-sm font-medium text-gray-800 mt-1">{userProfile.middleName || 'Not provided'}</p>
              </div>
            </div>
            
            <div>
              <label className="text-xs text-gray-500 uppercase tracking-wide font-medium">Last Name</label>
              <p className="text-sm font-medium text-gray-800 mt-1">{userProfile.lastName || 'Not provided'}</p>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-500 uppercase tracking-wide font-medium">Gender</label>
                <p className="text-sm font-medium text-gray-800 mt-1">{userProfile.gender || 'Not provided'}</p>
              </div>
              <div>
                <label className="text-xs text-gray-500 uppercase tracking-wide font-medium">Birthday</label>
                <p className="text-sm font-medium text-gray-800 mt-1">
                  {userProfile.birthday ? new Date(userProfile.birthday).toLocaleDateString() : 'Not provided'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Location Information */}
      <div className="px-4 py-4">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Location Information</h3>
          
          <div className="space-y-4">
            <div>
              <label className="text-xs text-gray-500 uppercase tracking-wide font-medium">Region</label>
              <p className="text-sm font-medium text-gray-800 mt-1">{userProfile.region || 'Not provided'}</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-500 uppercase tracking-wide font-medium">Zone</label>
                <p className="text-sm font-medium text-gray-800 mt-1">{userProfile.zone || 'Not provided'}</p>
              </div>
              <div>
                <label className="text-xs text-gray-500 uppercase tracking-wide font-medium">Church</label>
                <p className="text-sm font-medium text-gray-800 mt-1">{userProfile.church || 'Not provided'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Ministry Information */}
      <div className="px-4 py-4">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Ministry Information</h3>
          
          <div className="space-y-4">
            <div>
              <label className="text-xs text-gray-500 uppercase tracking-wide font-medium">Designation</label>
              <div className="mt-1">
                <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium">
                  {userProfile.designation || 'Not specified'}
                </span>
              </div>
            </div>

            <div>
              <label className="text-xs text-gray-500 uppercase tracking-wide font-medium">Administration</label>
              <div className="mt-1">
                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                  {userProfile.administration || 'Not specified'}
                </span>
              </div>
            </div>

            <div>
              <label className="text-xs text-gray-500 uppercase tracking-wide font-medium">Groups</label>
              <div className="mt-1 flex flex-wrap gap-2">
                {userProfile.groups.map((group, index) => (
                  <span key={index} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                    {group}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Information */}
      <div className="px-4 py-4">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Contact Information</h3>
          
          <div className="space-y-4">
            <div>
              <label className="text-xs text-gray-500 uppercase tracking-wide font-medium">Email</label>
              <p className="text-sm font-medium text-gray-800 mt-1">{userProfile.email || 'Not provided'}</p>
            </div>
            
            <div>
              <label className="text-xs text-gray-500 uppercase tracking-wide font-medium">Phone Number</label>
              <p className="text-sm font-medium text-gray-800 mt-1">{userProfile.phoneNumber || 'Not provided'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* QR Code Check-in */}
      <div className="px-4 py-4">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-800">Attendance Check-in</h3>
            <div className="flex items-center space-x-1 text-xs text-gray-500">
              <Clock className="w-3 h-3" />
              <span>Expires in {timeLeft}s</span>
            </div>
          </div>
          
          <div className="text-center">
            {isClient && qrCode ? (
              <div className="mb-4">
                <QRCodeGenerator 
                  value={qrCode} 
                  size={200} 
                  className="mx-auto"
                />
                <p className="text-xs text-gray-600 font-mono mt-2">{qrCode}</p>
              </div>
            ) : (
            <div className="w-32 h-32 bg-gray-100 rounded-lg mx-auto mb-4 flex items-center justify-center">
                <QrCode className="w-16 h-16 text-gray-400" />
              </div>
            )}
            
          </div>
        </div>
      </div>


      {/* Recent Attendance */}
      <div className="px-4 py-4">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-gray-800 mb-3">Recent Attendance</h3>
          
          {attendanceHistory.length > 0 ? (
          <div className="space-y-3">
            {attendanceHistory.map((record, index) => (
              <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                <div className="flex items-center space-x-3">
                  <div className={`w-2 h-2 rounded-full ${
                      record.status === 'present' ? 'bg-green-500' : 
                      record.status === 'late' ? 'bg-yellow-500' : 'bg-red-500'
                  }`}></div>
                  <div>
                      <p className="text-sm font-medium text-gray-800">{record.event_name}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(record.check_in_time).toLocaleDateString()}
                      </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-xs font-medium ${
                      record.status === 'present' ? 'text-green-600' : 
                      record.status === 'late' ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                      {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(record.check_in_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
          </div>
          ) : (
            <div className="text-center py-6">
              <Calendar className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-500">No attendance records yet</p>
              <p className="text-xs text-gray-400">Check in using your QR code to start tracking</p>
            </div>
          )}
        </div>
      </div>

      {/* Achievements */}
      <div className="px-4 py-4 pb-8">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-gray-800 mb-3">Achievements</h3>
          
          <div className="space-y-2">
            {userProfile.achievements.map((achievement, index) => (
              <div key={index} className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="text-sm text-gray-700">{achievement}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <SharedDrawer open={isMenuOpen} onClose={() => setIsMenuOpen(false)} title="Menu" items={menuItems} />
    </div>
  )
}
