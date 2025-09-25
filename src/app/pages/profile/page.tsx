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

export default function ProfilePage() {
  const [showQRCode, setShowQRCode] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState({
    firstName: '',
    lastName: '',
    phoneNumber: '',
    region: '',
    zone: '',
    church: '',
    designation: '',
    administration: ''
  })
  const [profileImage, setProfileImage] = useState<string | null>(null)
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [qrCode, setQrCode] = useState('')
  const [timeLeft, setTimeLeft] = useState(0) // Will be set when QR is generated
  const [isClient, setIsClient] = useState(false)
  const [qrGenerated, setQrGenerated] = useState(false)
  const router = useRouter()
  const { user, profile: currentProfile, isLoading, isProfileComplete, signOut, refreshProfile } = useAuth()

  // Set client flag to prevent hydration issues
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Force refresh profile on mount to ensure data is loaded
  useEffect(() => {
    if (user && !currentProfile) {
      console.log('🔄 No profile data found, refreshing...')
      refreshProfile()
    }
  }, [user, currentProfile, refreshProfile])

  // Use default profile data if none is loaded yet - fixed duplicate declaration
  const profileData = currentProfile || {
    id: user?.id || '',
    first_name: user?.user_metadata?.first_name || '',
    middle_name: user?.user_metadata?.middle_name || '',
    last_name: user?.user_metadata?.last_name || '',
    email: user?.email || '',
    phone_number: '',
    gender: '',
    birthday: '',
    region: '',
    zone: '',
    church: '',
    designation: '',
    administration: '',
    social_provider: 'email',
    social_id: user?.email || '',
    profile_completed: false,
    email_verified: user?.email_confirmed_at ? true : false,
    created_at: user?.created_at || new Date().toISOString(),
    updated_at: new Date().toISOString()
  }

  // Initialize edit form with profile data
  useEffect(() => {
    setEditForm({
      firstName: profileData.first_name || '',
      lastName: profileData.last_name || '',
      phoneNumber: profileData.phone_number || '',
      region: profileData.region || '',
      zone: profileData.zone || '',
      church: profileData.church || '',
      designation: profileData.designation || '',
      administration: profileData.administration || ''
    })
  }, [profileData])

  // Handle form input changes
  const handleInputChange = (field: string, value: string) => {
    setEditForm(prev => ({
      ...prev,
      [field]: value
    }))
  }

  // Handle image upload
  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size must be less than 5MB')
      return
    }

    setIsUploadingImage(true)
    try {
      // Create a preview URL
      const imageUrl = URL.createObjectURL(file)
      setProfileImage(imageUrl)
      
      // Here you would upload to Supabase Storage
      console.log('Image uploaded:', file.name)
      alert('Profile image updated successfully!')
    } catch (error) {
      console.error('Error uploading image:', error)
      alert('Error uploading image. Please try again.')
    } finally {
      setIsUploadingImage(false)
    }
  }

  // Handle save profile
  const handleSaveProfile = async () => {
    try {
      // Here you would typically call an API to update the profile
      console.log('Saving profile:', editForm)
      console.log('Profile image:', profileImage)
      
      // For now, just close the edit mode
      setIsEditing(false)
      alert('Profile updated successfully!')
    } catch (error) {
      console.error('Error saving profile:', error)
      alert('Error saving profile. Please try again.')
    }
  }

  // Countdown timer (client-side only)
  useEffect(() => {
    if (typeof window === 'undefined') return // Skip on server
    
    if (timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft(prev => prev - 1)
      }, 1000)
      
      return () => clearInterval(timer)
    } else if (timeLeft === 0 && qrGenerated) {
      // QR code expired
      setQrCode('')
      setQrGenerated(false)
    }
  }, [timeLeft, qrGenerated])

  // Show loading state only if we have absolutely no profile data and it's still loading
  if (isLoading && !currentProfile) {
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

  // Show loading state only if no user at all
  if (isLoading && !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    )
  }

  // Redirect if not authenticated
  if (!user) {
    router.push('/auth')
    return null
  }

  // Real user data from profile (use currentProfile for immediate loading)
  const userProfile = {
    // Personal Information
    firstName: profileData.first_name || '',
    middleName: profileData.middle_name || '',
    lastName: profileData.last_name || '',
    fullName: `${profileData.first_name || ''} ${profileData.middle_name || ''} ${profileData.last_name || ''}`.trim(),
    email: profileData.email || '',
    phoneNumber: profileData.phone_number || '',
    gender: profileData.gender || '',
    birthday: profileData.birthday || '',
    
    // Location Information
    region: profileData.region || '',
    zone: profileData.zone || '',
    church: profileData.church || '',
    
    // Ministry Information
    designation: profileData.designation || '',
    administration: profileData.administration || '',
    socialProvider: profileData.social_provider || 'email',
    socialId: profileData.social_id || profileData.email || '',
    
    // Additional Profile Data (these would come from other tables in a real app)
    groups: ["Main Choir", "Praise Team"], // TODO: Fetch from user_groups table
    joinDate: profileData.created_at ? new Date(profileData.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : '',
    totalRehearsals: 0, // TODO: Calculate from attendance records
    attendanceRate: 0, // TODO: Calculate from attendance records
    lastCheckIn: "Never", // TODO: Get from latest attendance record
    achievements: ["Profile Completed"], // TODO: Fetch from achievements table
    qrCode: profileData.id ? `LW-USER-${profileData.id.slice(0, 8).toUpperCase()}` : "LW-USER-00000000"
  }


  // Generate a new QR code (client-side only)
  const generateQRCode = () => {
    try {
      if (typeof window === 'undefined') return // Skip on server
      
      if (currentProfile?.id) {
        // Generate a unique QR code with timestamp
        const now = new Date()
        const timestamp = now.getTime()
        const code = `LW-ATTEND-${currentProfile.id.slice(0, 8).toUpperCase()}-${timestamp}`
        setQrCode(code)
        setTimeLeft(300) // 5 minutes
        setQrGenerated(true)
      }
    } catch (error) {
      console.error('Error generating QR code:', error)
      // Set a fallback QR code
      setQrCode('LW-ATTEND-FALLBACK-00000000')
      setTimeLeft(300)
      setQrGenerated(true)
    }
  }

  // Mock attendance data for now
  const attendanceHistory: any[] = []
  const attendanceStats = { total: 0, present: 0, late: 0, absent: 0, rate: 0 }




  const menuItems = getMenuItems(handleLogout)

  const rightButtons = (
    <button
      onClick={refreshProfile}
      className="p-2 text-gray-600 hover:text-purple-600 transition-colors"
      title="Refresh Profile"
    >
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
      </svg>
    </button>
  )

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
            <div className="w-24 h-24 bg-purple-600 rounded-full flex items-center justify-center mx-auto overflow-hidden">
              {profileImage ? (
                <img 
                  src={profileImage} 
                  alt="Profile" 
                  className="w-full h-full object-cover"
                />
              ) : (
              <User className="w-12 h-12 text-white" />
              )}
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
            {userProfile.fullName || 'User'}
          </h2>
          <p className="text-sm text-gray-600 mb-1">@{userProfile.socialId || 'user'}</p>
          <p className="text-xs text-gray-500 mb-4">{userProfile.email || 'user@example.com'}</p>
          
          <div className="flex items-center justify-center space-x-2">
            <span className="text-sm bg-purple-100 text-purple-700 px-3 py-1 rounded-full font-poppins-medium">
              {userProfile.designation || 'Member'}
            </span>
            <span className="text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-poppins-medium">
              {userProfile.administration || 'General'}
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
            {isEditing ? (
              <>
                {/* Profile Image Upload */}
                <div className="mb-6">
                  <label className="text-xs text-gray-500 uppercase tracking-wide font-medium">Profile Image</label>
                  <div className="mt-2 flex items-center gap-4">
                    <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center overflow-hidden">
                      {profileImage ? (
                        <img 
                          src={profileImage} 
                          alt="Profile" 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User className="w-8 h-8 text-purple-600" />
                      )}
                    </div>
                    <div className="flex-1">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        disabled={isUploadingImage}
                        className="hidden"
                        id="profile-image-upload"
                      />
                      <label
                        htmlFor="profile-image-upload"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors cursor-pointer disabled:opacity-50"
                      >
                        <Camera className="w-4 h-4" />
                        {isUploadingImage ? 'Uploading...' : 'Upload Image'}
                      </label>
                      <p className="text-xs text-gray-500 mt-1">Max 5MB, JPG/PNG</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-gray-500 uppercase tracking-wide font-medium">First Name</label>
                    <input
                      type="text"
                      value={editForm.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Enter first name"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 uppercase tracking-wide font-medium">Last Name</label>
                    <input
                      type="text"
                      value={editForm.lastName}
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
                      className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Enter last name"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="text-xs text-gray-500 uppercase tracking-wide font-medium">Phone Number</label>
                  <input
                    type="tel"
                    value={editForm.phoneNumber}
                    onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                    className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Enter phone number"
                  />
                </div>

                <div>
                  <label className="text-xs text-gray-500 uppercase tracking-wide font-medium">Region</label>
                  <input
                    type="text"
                    value={editForm.region}
                    onChange={(e) => handleInputChange('region', e.target.value)}
                    className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Enter region"
                  />
                </div>

                <div>
                  <label className="text-xs text-gray-500 uppercase tracking-wide font-medium">Church</label>
                  <input
                    type="text"
                    value={editForm.church}
                    onChange={(e) => handleInputChange('church', e.target.value)}
                    className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Enter church"
                  />
                </div>
                
                <div className="flex gap-3">
                  <button
                    onClick={handleSaveProfile}
                    className="flex-1 bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    Save Changes
                  </button>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </>
            ) : (
              <>
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
              </>
            )}
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
            {qrGenerated && timeLeft > 0 && (
            <div className="flex items-center space-x-1 text-xs text-gray-500">
              <Clock className="w-3 h-3" />
                <span>Expires in {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}</span>
            </div>
            )}
          </div>
          
          <div className="text-center">
            {qrGenerated && qrCode ? (
              <div className="mb-4">
                <div className="flex justify-center">
                  <div className="relative">
                    <QRCodeGenerator 
                      value={qrCode} 
                      size={200} 
                      className="mx-auto"
                    />
                    {/* Fallback if QR code fails */}
                    <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-90 hidden" id="qr-fallback">
              <div className="text-center">
                        <QrCode className="w-16 h-16 text-gray-400 mx-auto mb-2" />
                        <p className="text-xs text-gray-500">QR Code unavailable</p>
                      </div>
                    </div>
                  </div>
                </div>
                <p className="text-xs text-gray-600 font-mono mt-2">{qrCode}</p>
                <button
                  onClick={generateQRCode}
                  className="mt-3 px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Generate New QR Code
                </button>
              </div>
            ) : (
              <div className="text-center">
                <div className="w-32 h-32 bg-gray-100 rounded-lg mx-auto mb-4 flex items-center justify-center">
                  <QrCode className="w-16 h-16 text-gray-400" />
            </div>
                <p className="text-sm text-gray-600 mb-4">Generate a QR code for attendance check-in</p>
              <button 
                  onClick={generateQRCode}
                  className="px-6 py-3 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition-colors"
              >
                  Generate QR Code
              </button>
                <p className="text-xs text-gray-500 mt-2">QR code expires in 5 minutes</p>
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
