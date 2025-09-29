'use client'

import { useState, useEffect } from 'react'
import { ArrowLeft, User, Users, Calendar, QrCode, CheckCircle, Clock, Award, Settings, Edit, Camera, LogOut, Menu, X, Bell, Music, BarChart3, HelpCircle, Home, Play, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import ScreenHeader from '@/components/ScreenHeader'
import SharedDrawer from '@/components/SharedDrawer'
import { getMenuItems } from '@/config/menuItems'
import { useAuth } from '@/contexts/AuthContext'
import QRCodeGenerator from '@/components/QRCodeGenerator'
import { ultraFastUploadProfileImage, ultraFastDeleteImage } from '@/utils/ultraFastImageUpload'
import { validateImageFile } from '@/utils/imageUpload'
import { supabase } from '@/lib/supabase-client'

export default function ProfilePage() {
  const [showQRCode, setShowQRCode] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState({
    firstName: '',
    lastName: '',
    middleName: '',
    phoneNumber: '',
    gender: '',
    birthday: '',
    region: '',
    zone: '',
    church: '',
    designation: '',
    administration: ''
  })
  const [selectedGroup, setSelectedGroup] = useState<string>('')
  const [availableGroups] = useState([
    'YourLoveWorldSingers',
    'PMC',
    '24 Worship',
    'Teens Voice',
    'Orchestra',
    'International Representative',
    'National Representative'
  ])
  const [profileImage, setProfileImage] = useState<string | null>(null)
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const [uploadProgress, setUploadProgress] = useState({ stage: '', progress: 0, message: '' })
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState('')
  const [qrCode, setQrCode] = useState('')
  const [timeLeft, setTimeLeft] = useState(0) // Will be set when QR is generated
  const [isClient, setIsClient] = useState(false)
  const [qrGenerated, setQrGenerated] = useState(false)
  const router = useRouter()
  const { user, signOut, profile: currentProfile, isLoading, refreshProfile } = useAuth()

  // Set client flag to prevent hydration issues
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Load user groups when user is available
  useEffect(() => {
    if (user?.id) {
      loadUserGroups()
    }
  }, [user?.id])

  // Profile completion logic
  const isProfileComplete = currentProfile?.profile_completed || false
  
  // Simple profile update function
  const updateProfile = async (updates: any) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('No authenticated user')

      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id)

      if (error) throw error
      
      // Refresh profile data
      await refreshProfile()
      return true
    } catch (error) {
      console.error('Profile update error:', error)
      return false
    }
  }

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
    profile_image_url: '',
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
      middleName: profileData.middle_name || '',
      phoneNumber: profileData.phone_number || '',
      gender: profileData.gender || '',
      birthday: profileData.birthday || '',
      region: profileData.region || '',
      zone: profileData.zone || '',
      church: profileData.church || '',
      designation: profileData.designation || '',
      administration: profileData.administration || ''
    })
    
    // Initialize profile image from profile data
    if (profileData.profile_image_url) {
      setProfileImage(profileData.profile_image_url)
    }
  }, [profileData])

  // Handle form input changes
  const handleInputChange = (field: string, value: string) => {
    setEditForm(prev => ({
      ...prev,
      [field]: value
    }))
  }

  // Load user groups
  const loadUserGroups = async () => {
    if (!user?.id) return
    
    try {
      const { data, error } = await supabase
        .from('user_groups')
        .select('group_name')
        .eq('user_id', user.id)
      
      if (error) {
        console.error('Error loading user groups:', error)
        return
      }
      
      const groups = data?.map(item => item.group_name) || []
      setSelectedGroup(groups[0] || '')
      console.log('📋 Loaded user group:', groups[0] || '')
    } catch (error) {
      console.error('Error loading user groups:', error)
    }
  }

  // Handle group selection
  const handleGroupSelect = (groupName: string) => {
    setSelectedGroup(groupName)
  }

  // Save user groups
  const saveUserGroups = async () => {
    if (!user?.id) return false
    
    try {
      console.log('💾 Saving user group:', selectedGroup)
      
      // First, delete all existing groups for this user
      const { error: deleteError } = await supabase
        .from('user_groups')
        .delete()
        .eq('user_id', user.id)
      
      if (deleteError) {
        console.error('Error deleting existing groups:', deleteError)
        return false
      }
      
      // Then, insert new group
      if (selectedGroup) {
        const { error: insertError } = await supabase
          .from('user_groups')
          .insert([{
            user_id: user.id,
            group_name: selectedGroup
          }])
        
        if (insertError) {
          console.error('Error inserting new group:', insertError)
          return false
        }
      }
      
      console.log('✅ User group saved successfully')
      return true
    } catch (error) {
      console.error('Error saving user group:', error)
      return false
    }
  }

  // Handle image upload
  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) {
      console.log('❌ No file selected')
      return
    }

    console.log('📁 Selected file:', file.name, file.size, file.type)

    // Validate file
    const validation = validateImageFile(file)
    if (!validation.valid) {
      console.log('❌ File validation failed:', validation.error)
      alert(validation.error)
      return
    }

    if (!user?.id) {
      console.log('❌ User not authenticated')
      alert('User not authenticated')
      return
    }

    console.log('👤 User ID:', user.id)

    setIsUploadingImage(true)
    setUploadProgress({ stage: 'compressing', progress: 0, message: 'Preparing image...' })
    
    try {
      console.log('🚀 Starting ULTRA-FAST image upload...')
      
      // Upload with progress tracking
      const result = await ultraFastUploadProfileImage(file, user.id, (progress) => {
        setUploadProgress(progress)
        console.log('📊 Upload progress:', progress)
      })
      
      console.log('📤 Upload result:', result)
      
      if (result.success && result.url) {
        console.log('✅ ULTRA-FAST upload successful!', `Time: ${result.uploadTime}ms`)
        
        // Update profile with new image URL
        const updateSuccess = await updateProfile({
          profile_image_url: result.url
        })
        
        console.log('📝 Profile update result:', updateSuccess)
        
        if (updateSuccess) {
          // Set local state for immediate UI update
          setProfileImage(result.url)
          const timeText = result.uploadTime ? ` (${result.uploadTime}ms)` : ''
          alert(`Profile image updated successfully${timeText}!`)
        } else {
          alert('Failed to update profile with new image. Please try again.')
        }
      } else {
        console.log('❌ Upload failed:', result.error)
        alert(result.error || 'Failed to upload image. Please try again.')
      }
    } catch (error) {
      console.error('❌ Error uploading image:', error)
      alert(`Error uploading image: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsUploadingImage(false)
      setUploadProgress({ stage: '', progress: 0, message: '' })
    }
  }

  // Handle save profile
  const handleSaveProfile = async () => {
    setIsSaving(true)
    setSaveMessage('')
    
    try {
      console.log('🚀 Starting profile save...')
      console.log('📝 Edit form data:', editForm)
      console.log('🖼️ Profile image:', profileImage)
      console.log('👤 Current user:', user?.id)
      
      // Basic validation
      if (!editForm.firstName.trim()) {
        setSaveMessage('First name is required')
        setTimeout(() => setSaveMessage(''), 2000)
        return
      }
      
      if (!editForm.lastName.trim()) {
        setSaveMessage('Last name is required')
        setTimeout(() => setSaveMessage(''), 2000)
        return
      }
      
      if (!editForm.phoneNumber.trim()) {
        setSaveMessage('Phone number is required')
        setTimeout(() => setSaveMessage(''), 2000)
        return
      }
      
      if (!editForm.region.trim()) {
        setSaveMessage('Region is required')
        setTimeout(() => setSaveMessage(''), 2000)
        return
      }
      
      if (!editForm.church.trim()) {
        setSaveMessage('Church is required')
        setTimeout(() => setSaveMessage(''), 2000)
        return
      }
      
      const updateData = {
        first_name: editForm.firstName.trim(),
        last_name: editForm.lastName.trim(),
        middle_name: editForm.middleName.trim() || undefined,
        phone_number: editForm.phoneNumber.trim(),
        gender: editForm.gender as 'Male' | 'Female' | undefined,
        birthday: editForm.birthday || undefined,
        region: editForm.region.trim(),
        zone: editForm.zone.trim() || undefined,
        church: editForm.church.trim(),
        designation: editForm.designation as 'Soprano' | 'Alto' | 'Tenor' | 'Bass' | 'Instrumentalist' | 'Backup Singer' | undefined,
        administration: editForm.administration as 'Coordinator' | 'Assistant Coordinator' | 'Secretary' | 'Treasurer' | 'Member' | undefined
      }
      
      console.log('📤 Sending update data:', updateData)
      
      // Update profile using the ultra-fast hook
      const profileSuccess = await updateProfile(updateData)
      
      console.log('✅ Profile update result:', profileSuccess)
      
      // Save user groups
      const groupsSuccess = await saveUserGroups()
      
      console.log('✅ Groups update result:', groupsSuccess)
      
      if (profileSuccess && groupsSuccess) {
        setSaveMessage('Profile and group updated successfully!')
        setIsEditing(false)
        setTimeout(() => setSaveMessage(''), 2000)
      } else if (profileSuccess) {
        setSaveMessage('Profile updated successfully, but there was an issue with group.')
        setIsEditing(false)
        setTimeout(() => setSaveMessage(''), 2000)
      } else {
        setSaveMessage('Failed to update profile. Please try again.')
        setTimeout(() => setSaveMessage(''), 2000)
      }
    } catch (error) {
      console.error('❌ Error saving profile:', error)
      setSaveMessage(`Error saving profile: ${error instanceof Error ? error.message : 'Unknown error'}`)
      setTimeout(() => setSaveMessage(''), 2000)
    } finally {
      setIsSaving(false)
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


  const handleLogout = async () => {
    await signOut()
    router.push('/auth')
  }

  // Show loading state while authentication is being checked
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-sm">Loading profile data...</p>
        </div>
      </div>
    )
  }

  // Only redirect if authentication is complete and no user is found
  if (!isLoading && !user) {
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
    groups: selectedGroup ? [selectedGroup] : ["No group assigned"], // Use actual user group
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



      {/* Profile Header */}
      <div className="px-4 py-8 bg-gradient-to-br from-purple-50 to-blue-50">
        <div className="text-center">
          <div className="relative inline-block mb-4">
            <div className="relative w-24 h-24 bg-purple-600 rounded-full flex items-center justify-center mx-auto overflow-hidden">
              {profileImage ? (
                <>
                  <img 
                    src={profileImage} 
                    alt="Profile" 
                    className="w-full h-full object-cover"
                  />
                  {isEditing && (
                    <button
                      onClick={async () => {
                        if (confirm('Are you sure you want to delete this profile image?')) {
                          try {
                            const success = await ultraFastDeleteImage(profileImage)
                            if (success) {
                              setProfileImage(null)
                              await updateProfile({ profile_image_url: undefined })
                              alert('Profile image deleted successfully!')
                            } else {
                              alert('Failed to delete image. Please try again.')
                            }
                          } catch (error) {
                            console.error('Error deleting image:', error)
                            alert('Error deleting image. Please try again.')
                          }
                        }
                      }}
                      className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                      title="Delete image"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </>
              ) : (
              <User className="w-12 h-12 text-white" />
              )}
            </div>
            <button
              onClick={() => {
                setIsEditing(!isEditing)
                setSaveMessage('')
              }}
              className="absolute bottom-0 right-0 w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center shadow-lg hover:bg-purple-700 transition-all hover:scale-110 active:scale-95 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
              aria-label="Edit Profile"
            >
              <Edit className="w-5 h-5 text-white" />
            </button>
          </div>
          
          <h2 className="text-2xl font-outfit-bold text-gray-800 mb-2">
            {userProfile.fullName || 'User'}
          </h2>
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
                  <img 
                    src="/kingschat.jpeg" 
                    alt="KingsChat" 
                    className="w-4 h-4 rounded-full object-cover"
                  />
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
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Personal Information</h3>
            {isEditing && (
              <span className="text-xs text-purple-600 font-medium">Editing Mode</span>
            )}
          </div>

          <div className="space-y-4">
            {isEditing ? (
              <>
                {/* Profile Image Upload */}
                <div className="pb-4 border-b border-gray-100">
                  <label className="text-xs text-gray-700 uppercase tracking-wide font-bold mb-2 block">Profile Image</label>
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center overflow-hidden border-2 border-purple-200">
                      {profileImage ? (
                        <img
                          src={profileImage}
                          alt="Profile"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User className="w-10 h-10 text-purple-600" />
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
                        className="inline-flex items-center gap-2 px-4 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors cursor-pointer disabled:opacity-50 font-medium"
                      >
                        <Camera className="w-4 h-4" />
                        {isUploadingImage ? 'Uploading...' : 'Change Photo'}
                      </label>
                      <p className="text-xs text-gray-500 mt-2">Max 10MB • JPG, PNG, or WebP</p>
                      
                      {/* Upload Progress */}
                      {isUploadingImage && uploadProgress.stage && (
                        <div className="mt-2 w-full">
                          <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                            <span>{uploadProgress.message}</span>
                            <span>{uploadProgress.progress}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-purple-600 h-2 rounded-full transition-all duration-300 ease-out"
                              style={{ width: `${uploadProgress.progress}%` }}
                            ></div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-gray-700 uppercase tracking-wide font-bold">First Name</label>
                    <input
                      type="text"
                      value={editForm.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Enter first name"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-700 uppercase tracking-wide font-bold">Middle Name</label>
                    <input
                      type="text"
                      value={editForm.middleName}
                      onChange={(e) => handleInputChange('middleName', e.target.value)}
                      className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Enter middle name"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs text-gray-700 uppercase tracking-wide font-bold">Last Name</label>
                  <input
                    type="text"
                    value={editForm.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Enter last name"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-gray-700 uppercase tracking-wide font-bold">Gender</label>
                    <select
                      value={editForm.gender}
                      onChange={(e) => handleInputChange('gender', e.target.value)}
                      className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="">Select gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-gray-700 uppercase tracking-wide font-bold">Birthday</label>
                    <input
                      type="date"
                      value={editForm.birthday}
                      onChange={(e) => handleInputChange('birthday', e.target.value)}
                      className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs text-gray-700 uppercase tracking-wide font-bold">Phone Number</label>
                  <input
                    type="tel"
                    value={editForm.phoneNumber}
                    onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                    className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Enter phone number"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-gray-700 uppercase tracking-wide font-bold">Region</label>
                    <input
                      type="text"
                      value={editForm.region}
                      onChange={(e) => handleInputChange('region', e.target.value)}
                      className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Enter region"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-700 uppercase tracking-wide font-bold">Zone</label>
                    <input
                      type="text"
                      value={editForm.zone}
                      onChange={(e) => handleInputChange('zone', e.target.value)}
                      className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Enter zone"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs text-gray-700 uppercase tracking-wide font-bold">Church</label>
                  <input
                    type="text"
                    value={editForm.church}
                    onChange={(e) => handleInputChange('church', e.target.value)}
                    className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Enter church"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-gray-700 uppercase tracking-wide font-bold">Designation</label>
                    <select
                      value={editForm.designation}
                      onChange={(e) => handleInputChange('designation', e.target.value)}
                      className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="">Select designation</option>
                      <option value="Soprano">Soprano</option>
                      <option value="Alto">Alto</option>
                      <option value="Tenor">Tenor</option>
                      <option value="Bass">Bass</option>
                      <option value="Instrumentalist">Instrumentalist</option>
                      <option value="Backup Singer">Backup Singer</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-gray-700 uppercase tracking-wide font-bold">Administration</label>
                    <select
                      value={editForm.administration}
                      onChange={(e) => handleInputChange('administration', e.target.value)}
                      className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="">Select administration</option>
                      <option value="Coordinator">Coordinator</option>
                      <option value="Assistant Coordinator">Assistant Coordinator</option>
                      <option value="Secretary">Secretary</option>
                      <option value="Treasurer">Treasurer</option>
                      <option value="Member">Member</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs text-gray-700 uppercase tracking-wide font-bold">Group</label>
                  <div className="mt-2 grid grid-cols-1 gap-2">
                    {availableGroups.map((group) => (
                      <label key={group} className="flex items-center space-x-3 cursor-pointer p-3 rounded-lg border border-gray-200 hover:bg-purple-50 hover:border-purple-300 transition-all">
                        <input
                          type="radio"
                          name="group"
                          value={group}
                          checked={selectedGroup === group}
                          onChange={() => handleGroupSelect(group)}
                          className="w-5 h-5 text-purple-600 bg-gray-100 border-gray-300 focus:ring-purple-500 focus:ring-2"
                        />
                        <span className="text-sm text-gray-800 font-medium">{group}</span>
                      </label>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-2">Select the group you belong to</p>
                </div>
                
                {saveMessage && (
                  <div className={`p-3 rounded-lg text-sm font-medium ${
                    saveMessage.includes('successfully') 
                      ? 'bg-green-100 text-green-800 border border-green-200' 
                      : 'bg-red-100 text-red-800 border border-red-200'
                  }`}>
                    {saveMessage}
                  </div>
                )}
                
                <div className="flex gap-3">
                  <button
                    onClick={handleSaveProfile}
                    disabled={isSaving}
                    className="flex-1 bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button
                    onClick={() => {
                      setIsEditing(false)
                      setSaveMessage('')
                    }}
                    disabled={isSaving}
                    className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
              <label className="text-xs text-gray-700 uppercase tracking-wide font-bold">Groups</label>
              <div className="mt-2 flex flex-wrap gap-2">
                {userProfile.groups.map((group, index) => (
                  <span key={index} className="bg-purple-100 text-purple-800 px-4 py-2 rounded-full text-sm font-medium">
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
