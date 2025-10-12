'use client'

import { useState, useEffect } from 'react'
import { ArrowLeft, User, Users, Calendar, QrCode, CheckCircle, Clock, Award, Settings, Edit, Camera, LogOut, Menu, X, Bell, Music, BarChart3, HelpCircle, Home, Play, Loader2, AlertTriangle, Trash2, ChevronDown, ChevronUp, MapPin, Phone, Mail, Shield, Briefcase } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import ScreenHeader from '@/components/ScreenHeader'
import SharedDrawer from '@/components/SharedDrawer'
import { getMenuItems } from '@/config/menuItems'
import { useAuth } from '@/contexts/AuthContext'
import { handleAppRefresh } from '@/utils/refresh-utils'
import QRCodeGenerator from '@/components/QRCodeGenerator'
import { ultraFastUploadProfileImage, ultraFastDeleteImage } from '@/utils/ultraFastImageUpload'
import { validateImageFile } from '@/utils/imageUpload'
import { FirebaseAuthService } from '@/lib/firebase-auth'
import { FirebaseDatabaseService } from '@/lib/firebase-database'
import AuthGuard from '@/components/AuthGuard'

function ProfilePage() {
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
  // ✅ UPDATED: Official group names
  const [availableGroups] = useState([
    { value: 'yourloveworldsingers', label: 'Your LoveWorld Singers' },
    { value: 'pmc', label: 'PMC' },
    { value: '24worship', label: '24 Worship' },
    { value: 'lmaorchestra', label: 'LMA/LOVEWORLD ORCHESTRA' },
    { value: 'nationalzonalchoir', label: 'National Zonal Choir Representatives' },
    { value: 'internationalzonalchoir', label: 'International Zonal Choir Representatives' }
  ])
  const [profileImage, setProfileImage] = useState<string | null>(null)
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const [uploadProgress, setUploadProgress] = useState({ stage: '', progress: 0, message: '' })
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState('')
  const [saveProgress, setSaveProgress] = useState(0)
  const [saveStage, setSaveStage] = useState('')
  const [qrCode, setQrCode] = useState('')
  const [timeLeft, setTimeLeft] = useState(0) // Will be set when QR is generated
  const [isClient, setIsClient] = useState(false)
  const [qrGenerated, setQrGenerated] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [deleteConfirmation, setDeleteConfirmation] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)

  // Collapsible sections state
  const [expandedSections, setExpandedSections] = useState({
    account: false,
    personal: false,
    location: false,
    ministry: false,
    contact: false,
    qrCode: false,
    attendance: false
  })

  const router = useRouter()
  const { user, signOut, profile: currentProfile, isLoading, refreshProfile } = useAuth()

  // Toggle section expansion
  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  // Set client flag to prevent hydration issues
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Load user groups when user is available
  useEffect(() => {
    if (user?.uid) {
      loadUserGroups()
    }
  }, [user?.uid])

  // Refresh profile data when component mounts
  useEffect(() => {
    if (user?.uid && !currentProfile) {
      console.log('🔄 Refreshing profile data...')
      refreshProfile()
    }
  }, [user?.uid, currentProfile, refreshProfile])

  // Profile completion logic
  const isProfileComplete = currentProfile?.profile_completed || false
  
  // Simple profile update function
  const updateProfile = async (updates: any) => {
    try {
      console.log('🔍 Getting authenticated user...')
      // Use Firebase Auth instead of Supabase
      const { getAuth } = await import('firebase/auth')
      const { initializeApp } = await import('firebase/app')
      
      const firebaseConfig = {
        apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
        authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
        messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
        appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
        measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
      }

      const app = initializeApp(firebaseConfig)
      const auth = getAuth(app)
      const user = auth.currentUser
      
      // Firebase auth doesn't have authError like Supabase
      // Authentication is handled by FirebaseAuthService
      
      if (!user) {
        console.error('❌ No authenticated user found')
        throw new Error('No authenticated user')
      }

      console.log('👤 User ID:', user.uid)
      console.log('📝 Update data:', updates)

      // Test authentication and profile access before update using Firebase
      const testData = await FirebaseDatabaseService.getDocument('profiles', user.uid)
      
      if (!testData) {
        console.error('❌ Profile access test failed: Profile not found')
        throw new Error('Cannot access profile: Profile not found')
      }

      console.log('✅ Profile access test passed:', testData)

      const result = await FirebaseDatabaseService.updateDocument('profiles', user.uid, updates)

      if (!result) {
        console.error('❌ Database update error: Update failed')
        throw new Error('Database update failed: Update operation failed')
      }

      console.log('✅ Update successful:', result)
      
      // Refresh profile data
      await refreshProfile()
      return true
    } catch (error) {
      console.error('❌ Profile update error:', error)
      return false
    }
  }

  // Use default profile data if none is loaded yet - fixed duplicate declaration
  const profileData = currentProfile || {
    id: user?.uid || '',
    first_name: (user as any)?.user_metadata?.first_name || '',
    middle_name: (user as any)?.user_metadata?.middle_name || '',
    last_name: (user as any)?.user_metadata?.last_name || '',
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
    email_verified: (user as any)?.email_confirmed_at ? true : false,
    created_at: (user as any)?.created_at || new Date().toISOString(),
    updated_at: new Date().toISOString()
  }

  // Debug logging
  console.log('🔍 Profile Debug Info:')
  console.log('👤 User:', user?.uid)
  console.log('📋 Current Profile:', currentProfile)
  console.log('📊 Profile Data:', profileData)
  console.log('🔄 Is Loading:', isLoading)

  // Initialize edit form with profile data (only once on mount)
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
  }, []) // Remove profileData dependency to prevent form reset

  // Handle form input changes
  const handleInputChange = (field: string, value: string) => {
    setEditForm(prev => ({
      ...prev,
      [field]: value
    }))
  }

  // Load user groups
  const loadUserGroups = async () => {
    if (!user?.uid) return
    
    try {
      const data = await FirebaseDatabaseService.getCollectionWhere('user_groups', 'user_id', '==', user.uid)
      
      if (!data) {
        console.error('Error loading user groups: No data returned')
        return
      }
      
      const groups = data?.map((item: any) => item.group_name) || []
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
    if (!user?.uid) return false
    
    try {
      console.log('💾 Saving user group:', selectedGroup)
      
      // First, delete all existing groups for this user
      const existingGroups = await FirebaseDatabaseService.getCollectionWhere('user_groups', 'user_id', '==', user.uid)
      
      if (existingGroups && existingGroups.length > 0) {
        for (const group of existingGroups) {
          await FirebaseDatabaseService.deleteDocument('user_groups', group.id)
        }
      }
      
      // Then, insert new group
      if (selectedGroup) {
        await FirebaseDatabaseService.createDocument('user_groups', `${user.uid}_${Date.now()}`, {
          user_id: user.uid,
            group_name: selectedGroup
        })
      }
      
      console.log('✅ User group saved successfully')
      return true
    } catch (error) {
      console.error('Error saving user group:', error)
      return false
    }
  }

  // Handle image upload with instant preview
  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file
    const validation = validateImageFile(file)
    if (!validation.valid) {
      alert(validation.error)
      return
    }

    if (!user?.uid) {
      alert('User not authenticated')
      return
    }

    // INSTANT PREVIEW - Show image immediately before upload
    const previewUrl = URL.createObjectURL(file)
    setProfileImage(previewUrl)
    setIsUploadingImage(true)

    try {
      // Upload in background without blocking UI
      const result = await ultraFastUploadProfileImage(file, user.uid, (progress) => {
        setUploadProgress(progress)
      })

      if (result.success && result.url) {
        // Update profile with new image URL in background
        await updateProfile({
          profile_image_url: result.url
        })

        // Replace preview with actual URL
        URL.revokeObjectURL(previewUrl)
        setProfileImage(result.url)
      } else {
        // Revert to previous image on failure
        URL.revokeObjectURL(previewUrl)
        setProfileImage(profileData.profile_image_url || null)
        alert(result.error || 'Failed to upload image')
      }
    } catch (error) {
      // Revert to previous image on error
      URL.revokeObjectURL(previewUrl)
      setProfileImage(profileData.profile_image_url || null)
      alert(`Error uploading image: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsUploadingImage(false)
      setUploadProgress({ stage: '', progress: 0, message: '' })
    }
  }

  // Handle save profile
  const handleSaveProfile = async () => {
    console.log('🚀 Starting profile save process...')
    setIsSaving(true)
    setSaveProgress(0)
    setSaveStage('Validating...')
    setSaveMessage('')
    
    try {
      console.log('🚀 Starting profile save...')
      console.log('📝 Edit form data:', editForm)
      console.log('🖼️ Profile image:', profileImage)
      console.log('👤 Current user:', user?.uid)
      
      // Basic validation
      setSaveProgress(10)
      setSaveStage('Validating form data...')
      
      if (!editForm.firstName.trim()) {
        setSaveMessage('❌ First name is required')
        setIsSaving(false)
        return
      }
      
      if (!editForm.lastName.trim()) {
        setSaveMessage('❌ Last name is required')
        setIsSaving(false)
        return
      }
      
      if (!editForm.phoneNumber.trim()) {
        setSaveMessage('❌ Phone number is required')
        setIsSaving(false)
        return
      }
      
      if (!editForm.region.trim()) {
        setSaveMessage('❌ Region is required')
        setIsSaving(false)
        return
      }
      
      if (!editForm.church.trim()) {
        setSaveMessage('❌ Church is required')
        setIsSaving(false)
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
      
      // Test database connection first
      setSaveProgress(20)
      setSaveStage('Connecting to database...')
      console.log('🔍 Testing database connection...')
      
      try {
        if (!user?.uid) {
          throw new Error('User not authenticated')
        }
        const testData = await FirebaseDatabaseService.getDocument('profiles', user.uid)
        console.log('✅ Database connection successful:', testData)
      } catch (testError) {
        console.error('❌ Database connection failed:', testError)
        setSaveMessage(`❌ Database connection failed: ${(testError as Error).message}`)
        setIsSaving(false)
        return
      }
      
      // Update profile using the ultra-fast hook
      setSaveProgress(40)
      setSaveStage('Updating profile...')
      const profileSuccess = await updateProfile(updateData)
      
      console.log('✅ Profile update result:', profileSuccess)

      // ✅ NOW SAVE USER GROUPS (RLS issue is fixed!)
      setSaveProgress(70)
      setSaveStage('Saving group membership...')
      console.log('💾 Saving user groups...')
      const groupsSuccess = await saveUserGroups()

      console.log('✅ Groups update result:', groupsSuccess)

      if (profileSuccess && groupsSuccess) {
        setSaveProgress(100)
        setSaveStage('Complete!')
        setSaveMessage('✅ Profile and groups updated successfully!')
        setIsEditing(false)
        setTimeout(() => {
          setSaveMessage('')
          setSaveProgress(0)
          setSaveStage('')
        }, 3000)
        
        // Dispatch event to notify other components that groups were updated
        window.dispatchEvent(new CustomEvent('groupsUpdated', { 
          detail: { groups: selectedGroup } 
        }))
        console.log('📢 Dispatched groupsUpdated event with group:', selectedGroup)
      } else if (profileSuccess) {
        setSaveProgress(80)
        setSaveStage('Profile saved, groups failed')
        setSaveMessage('✅ Profile updated! ⚠️ Groups update failed.')
        setTimeout(() => {
          setSaveMessage('')
          setSaveProgress(0)
          setSaveStage('')
        }, 3000)
      } else {
        setSaveMessage('❌ Failed to update profile. Check console for details.')
        setTimeout(() => {
          setSaveMessage('')
          setSaveProgress(0)
          setSaveStage('')
        }, 3000)
      }
    } catch (error) {
      console.error('❌ Error saving profile:', error)
      setSaveMessage(`❌ Error saving profile: ${error instanceof Error ? error.message : 'Unknown error'}`)
      setTimeout(() => {
        setSaveMessage('')
        setSaveProgress(0)
        setSaveStage('')
      }, 3000)
    } finally {
      setIsSaving(false)
      console.log('✅ Profile save process completed - resetting saving state')
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
    // Don't use router.push - signOut already handles redirect
  }

  // Delete account function
  const handleDeleteAccount = async () => {
    if (deleteConfirmation !== 'DELETE') {
      alert('Please type "DELETE" to confirm account deletion')
      return
    }

    setIsDeleting(true)
    try {
      console.log('🗑️ Deleting user account...')
      
      // Delete user profile from Firebase
      await FirebaseDatabaseService.deleteDocument('profiles', user?.uid || '')
      
      // Delete user from Firebase Auth
      const result = await FirebaseAuthService.deleteUser()
      if (!result.success) {
        throw new Error(result.error)
      }
      
      console.log('✅ Account deleted successfully')
      
      // Sign out and redirect to auth page
    await signOut()
    router.push('/auth')
      
    } catch (error) {
      console.error('❌ Account deletion error:', error)
      alert('Failed to delete account. Please try again.')
    } finally {
      setIsDeleting(false)
      setShowDeleteDialog(false)
      setDeleteConfirmation('')
    }
  }

  // Only redirect if authentication is complete and no user is found
  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/auth')
    }
  }, [isLoading, user, router])

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

  if (!isLoading && !user) {
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
    totalRehearsals: 0,
    attendanceRate: 0,
    lastCheckIn: "Never",
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




  const menuItems = getMenuItems(handleLogout, handleAppRefresh)

  const rightButtons = null

  return (
    <div className="h-screen flex flex-col bg-white overflow-hidden overflow-x-hidden">
      {/* Animated Header */}
      <ScreenHeader 
        title="Profile" 
        onMenuClick={() => setIsMenuOpen(!isMenuOpen)}
        rightButtons={rightButtons}
        rightImageSrc="/logo.png"
        leftButtons={
          <button
            onClick={() => router.push('/home')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        }
      />



      {/* Scrollable Content Container */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden bg-gray-50">
      {/* Profile Header - Modern TikTok Style */}
      <div className="relative px-4 pt-6 pb-8 bg-gradient-to-br from-purple-600 via-purple-500 to-blue-500 overflow-hidden">
        {/* Decorative Background Pattern */}
        <div className="absolute inset-0 opacity-10 overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 sm:w-48 sm:h-48 lg:w-64 lg:h-64 bg-white rounded-full -translate-y-16 sm:-translate-y-24 lg:-translate-y-32 translate-x-16 sm:translate-x-24 lg:translate-x-32"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 sm:w-36 sm:h-36 lg:w-48 lg:h-48 bg-white rounded-full translate-y-12 sm:translate-y-18 lg:translate-y-24 -translate-x-12 sm:-translate-x-18 lg:-translate-x-24"></div>
        </div>

        <div className="relative text-center">
          {/* Profile Image with Glow Effect */}
          <div className="relative inline-block mb-4">
            <div className="absolute inset-0 bg-white rounded-full blur-xl opacity-50 scale-110"></div>
            <div className="relative w-28 h-28 bg-white rounded-full flex items-center justify-center mx-auto overflow-hidden ring-4 ring-white/30 shadow-2xl">
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
                      className="absolute top-1 right-1 w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-all shadow-lg hover:scale-110"
                      title="Delete image"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </>
              ) : (
              <User className="w-14 h-14 text-purple-600" />
              )}
            </div>

            {/* Edit Button with Animation */}
            <button
              onClick={() => {
                setIsEditing(!isEditing)
                setSaveMessage('')
              }}
              className="absolute bottom-0 right-0 w-11 h-11 bg-white text-purple-600 rounded-full flex items-center justify-center shadow-xl hover:shadow-2xl transition-all hover:scale-110 active:scale-95 focus:outline-none focus:ring-4 focus:ring-white/50"
              aria-label="Edit Profile"
            >
              <Edit className="w-5 h-5" />
            </button>
          </div>
          
          {/* User Info */}
          <h2 className="text-2xl font-bold text-white mb-1 drop-shadow-lg">
            {userProfile.fullName || 'User'}
          </h2>
          <p className="text-sm text-white/90 mb-4 drop-shadow">{userProfile.email || 'user@example.com'}</p>

          {/* Badges - Horizontal Scroll */}
          <div className="flex items-center justify-center gap-2 flex-wrap px-4">
            {userProfile.designation && (
              <span className="text-xs bg-white/20 backdrop-blur-sm text-white px-3 py-1.5 rounded-full font-medium border border-white/30 shadow-lg">
                {userProfile.designation}
            </span>
            )}
            {userProfile.administration && (
              <span className="text-xs bg-white/20 backdrop-blur-sm text-white px-3 py-1.5 rounded-full font-medium border border-white/30 shadow-lg">
                {userProfile.administration}
            </span>
            )}
            {selectedGroup && (
              <span className="text-xs bg-white/20 backdrop-blur-sm text-white px-3 py-1.5 rounded-full font-medium border border-white/30 shadow-lg">
                {availableGroups.find(g => g.value === selectedGroup)?.label || selectedGroup}
              </span>
            )}
          </div>
        </div>
      </div>


      {/* Account Information - Collapsible */}
      <div className="px-4 mt-3">
        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
          <button
            onClick={() => toggleSection('account')}
            className="w-full px-3 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors active:bg-gray-100"
          >
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center shadow-md">
                <Shield className="w-4 h-4 text-white" />
              </div>
              <div className="text-left">
                <h3 className="text-sm font-bold text-gray-900">Account</h3>
                <p className="text-[10px] text-gray-500">Login & security</p>
              </div>
            </div>
            <div className={`transform transition-transform duration-200 ${expandedSections.account ? 'rotate-180' : ''}`}>
              <ChevronDown className="w-4 h-4 text-gray-400" />
            </div>
          </button>

          <div className={`overflow-hidden transition-all duration-300 ${expandedSections.account ? 'max-h-96' : 'max-h-0'}`}>
            <div className="px-3 pb-3 pt-1">
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-2.5 border border-gray-200">
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shadow-md ${
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
                      <Mail className="w-4 h-4 text-white" />
                )}
              </div>
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-gray-900">
                  {userProfile.socialProvider === 'google' ? 'Google Account' : 
                   userProfile.socialProvider === 'kingschat' ? 'KingsChat Account' : 'Email Account'}
                </p>
                    <p className="text-[10px] text-gray-600 truncate">{userProfile.socialId}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Personal Information - Collapsible */}
      <div className="px-4 mt-2">
        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
          <button
            onClick={() => toggleSection('personal')}
            className="w-full px-3 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors active:bg-gray-100"
          >
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center shadow-md">
                <User className="w-4 h-4 text-white" />
          </div>
              <div className="text-left">
                <h3 className="text-sm font-bold text-gray-900">Personal Info</h3>
                <p className="text-[10px] text-gray-500">
                  {isEditing ? '✏️ Editing mode' : 'Name, contact & details'}
                </p>
              </div>
            </div>
            <div className={`transform transition-transform duration-200 ${expandedSections.personal ? 'rotate-180' : ''}`}>
              <ChevronDown className="w-4 h-4 text-gray-400" />
            </div>
          </button>

          <div className={`overflow-hidden transition-all duration-300 ${expandedSections.personal ? 'max-h-[2000px]' : 'max-h-0'}`}>
            <div className="px-3 pb-3 pt-1">
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

                {/* Basic Information Section */}
                <div className="pt-4">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">Basic Information</h4>
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm text-gray-700 font-bold">First Name</label>
                    <input
                      type="text"
                      value={editForm.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      className="w-full mt-1 px-2.5 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Enter first name"
                    />
                  </div>
                      <div>
                        <label className="text-sm text-gray-700 font-bold">Middle Name</label>
                        <input
                          type="text"
                          value={editForm.middleName}
                          onChange={(e) => handleInputChange('middleName', e.target.value)}
                          className="w-full mt-1 px-2.5 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          placeholder="Enter middle name"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-sm text-gray-700 font-bold">Last Name</label>
                      <input
                        type="text"
                        value={editForm.lastName}
                        onChange={(e) => handleInputChange('lastName', e.target.value)}
                        className="w-full mt-1 px-2.5 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="Enter last name"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-sm text-gray-700 font-bold">Gender</label>
                        <select
                          value={editForm.gender}
                          onChange={(e) => handleInputChange('gender', e.target.value)}
                          className="w-full mt-1 px-2.5 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        >
                          <option value="" className="text-sm italic">Select gender</option>
                          <option value="Male" className="text-sm italic">Male</option>
                          <option value="Female" className="text-sm italic">Female</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-sm text-gray-700 font-bold">Birthday</label>
                        <input
                          type="date"
                          value={editForm.birthday}
                          onChange={(e) => handleInputChange('birthday', e.target.value)}
                          className="w-full mt-1 px-2.5 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-sm text-gray-700 font-bold">Phone Number</label>
                      <input
                        type="tel"
                        value={editForm.phoneNumber}
                        onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                        className="w-full mt-1 px-2.5 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="Enter phone number"
                      />
                    </div>
                  </div>
                </div>

                {/* Location Information Section */}
                <div className="pt-4 border-t border-gray-100">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">Location Information</h4>
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-sm text-gray-700 font-bold">Region</label>
                        <input
                          type="text"
                          value={editForm.region}
                          onChange={(e) => handleInputChange('region', e.target.value)}
                          className="w-full mt-1 px-2.5 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          placeholder="Enter region"
                        />
                      </div>
                      <div>
                        <label className="text-sm text-gray-700 font-bold">Zone</label>
                        <input
                          type="text"
                          value={editForm.zone}
                          onChange={(e) => handleInputChange('zone', e.target.value)}
                          className="w-full mt-1 px-2.5 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          placeholder="Enter zone"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-sm text-gray-700 font-bold">Church</label>
                      <input
                        type="text"
                        value={editForm.church}
                        onChange={(e) => handleInputChange('church', e.target.value)}
                        className="w-full mt-1 px-2.5 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="Enter church"
                      />
                    </div>
                  </div>
                </div>

                {/* Ministry Information Section */}
                <div className="pt-4 border-t border-gray-100">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">Ministry Information</h4>
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-sm text-gray-700 font-bold">Designation</label>
                        <select
                          value={editForm.designation}
                          onChange={(e) => handleInputChange('designation', e.target.value)}
                          className="w-full mt-1 px-2.5 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        >
                          <option value="" className="text-sm italic">Select designation</option>
                          <option value="Soprano" className="text-sm italic">Soprano</option>
                          <option value="Alto" className="text-sm italic">Alto</option>
                          <option value="Tenor" className="text-sm italic">Tenor</option>
                          <option value="Bass" className="text-sm italic">Bass</option>
                          <option value="Instrumentalist" className="text-sm italic">Instrumentalist</option>
                          <option value="Backup Singer" className="text-sm italic">Backup Singer</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-sm text-gray-700 font-bold">Administration</label>
                        <select
                          value={editForm.administration}
                          onChange={(e) => handleInputChange('administration', e.target.value)}
                          className="w-full mt-1 px-2.5 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        >
                          <option value="" className="text-sm italic">Select administration</option>
                          <option value="Coordinator" className="text-sm italic">Coordinator</option>
                          <option value="Assistant Coordinator" className="text-sm italic">Assistant Coordinator</option>
                          <option value="Secretary" className="text-sm italic">Secretary</option>
                          <option value="Treasurer" className="text-sm italic">Treasurer</option>
                          <option value="Member" className="text-sm italic">Member</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="text-sm text-gray-700 font-bold">Group</label>
                      <div className="mt-2 grid grid-cols-1 gap-2">
                        {availableGroups.map((group) => (
                          <label key={group.value} className="flex items-center space-x-3 cursor-pointer p-2 rounded-lg border border-gray-200 hover:bg-purple-50 hover:border-purple-300 transition-all">
                            <input
                              type="radio"
                              name="group"
                              value={group.value}
                              checked={selectedGroup === group.value}
                              onChange={() => handleGroupSelect(group.value)}
                              className="w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 focus:ring-purple-500 focus:ring-2"
                            />
                            <span className="text-xs text-gray-800 font-medium italic">{group.label}</span>
                          </label>
                        ))}
                      </div>
                      <p className="text-[10px] text-gray-500 italic mt-2">Select the group you belong to</p>
                    </div>
                  </div>
                </div>

                {/* Save Progress & Message */}
                {(isSaving || saveMessage) && (
                  <div className="p-4 rounded-lg border bg-white shadow-sm">
                    {isSaving ? (
                      <div className="space-y-3">
                        {/* Progress Bar */}
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-gradient-to-r from-purple-500 to-purple-600 h-2 rounded-full transition-all duration-300 ease-out"
                            style={{ width: `${saveProgress}%` }}
                          />
                        </div>
                        
                        {/* Progress Text */}
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-700">
                            {saveStage}
                          </span>
                          <span className="text-sm text-gray-500">
                            {saveProgress}%
                          </span>
                        </div>
                        
                        {/* Loading Animation */}
                        <div className="flex items-center space-x-2">
                          <Loader2 className="w-4 h-4 animate-spin text-purple-600" />
                          <span className="text-sm text-gray-600">Saving your changes...</span>
                        </div>
                      </div>
                    ) : (
                      <div className={`p-3 rounded-lg text-sm font-medium ${
                        saveMessage.includes('✅')
                      ? 'bg-green-50 text-green-800 border border-green-200'
                      : 'bg-red-50 text-red-800 border border-red-200'
                  }`}>
                    {saveMessage}
                      </div>
                    )}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4 border-t border-gray-100">
                  <button
                    onClick={handleSaveProfile}
                    disabled={isSaving}
                    className="flex-1 bg-purple-600 text-white py-3 px-4 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      'Save Changes'
                    )}
                  </button>
                  <button
                    onClick={() => {
                      setIsEditing(false)
                      setSaveMessage('')
                      setSaveProgress(0)
                      setSaveStage('')
                    }}
                    disabled={isSaving}
                    className="flex-1 bg-gray-100 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </>
            ) : (
              <>
                {/* View Mode - Modern Cards */}
                <div className="space-y-2">
                  <div className="bg-gray-50 rounded-lg p-2 border border-gray-100">
                    <div className="grid grid-cols-2 gap-2">
              <div>
                        <label className="text-[10px] text-gray-500 font-semibold uppercase tracking-wide">First Name</label>
                        <p className="text-xs font-semibold text-gray-900 mt-0.5">{userProfile.firstName || 'Not set'}</p>
              </div>
              <div>
                        <label className="text-[10px] text-gray-500 font-semibold uppercase tracking-wide">Middle</label>
                        <p className="text-xs font-semibold text-gray-900 mt-0.5">{userProfile.middleName || 'Not set'}</p>
                      </div>
              </div>
            </div>
            
                  <div className="bg-gray-50 rounded-lg p-2 border border-gray-100">
                    <label className="text-[10px] text-gray-500 font-semibold uppercase tracking-wide">Last Name</label>
                    <p className="text-xs font-semibold text-gray-900 mt-0.5">{userProfile.lastName || 'Not set'}</p>
            </div>
            
                  <div className="bg-gray-50 rounded-lg p-2 border border-gray-100">
                    <div className="grid grid-cols-2 gap-2">
              <div>
                        <label className="text-[10px] text-gray-500 font-semibold uppercase tracking-wide">Gender</label>
                        <p className="text-xs font-semibold text-gray-900 mt-0.5">{userProfile.gender || 'Not set'}</p>
              </div>
              <div>
                        <label className="text-[10px] text-gray-500 font-semibold uppercase tracking-wide">Birthday</label>
                        <p className="text-xs font-semibold text-gray-900 mt-0.5">
                          {userProfile.birthday ? new Date(userProfile.birthday).toLocaleDateString() : 'Not set'}
                        </p>
                      </div>
              </div>
            </div>

                  <div className="bg-gray-50 rounded-lg p-2 border border-gray-100">
                    <label className="text-[10px] text-gray-500 font-semibold uppercase tracking-wide flex items-center gap-1">
                      <Phone className="w-3 h-3" />
                      Phone Number
                    </label>
                    <p className="text-xs font-semibold text-gray-900 mt-0.5">{userProfile.phoneNumber || 'Not set'}</p>
                  </div>
            </div>
              </>
            )}
            </div>
          </div>
        </div>
      </div>

      {/* Location Information - Collapsible */}
      <div className="px-4 mt-2">
        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
          <button
            onClick={() => toggleSection('location')}
            className="w-full px-3 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors active:bg-gray-100"
          >
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center shadow-md">
                <MapPin className="w-4 h-4 text-white" />
              </div>
              <div className="text-left">
                <h3 className="text-sm font-bold text-gray-900">Location</h3>
                <p className="text-[10px] text-gray-500">Region, zone & church</p>
              </div>
            </div>
            <div className={`transform transition-transform duration-200 ${expandedSections.location ? 'rotate-180' : ''}`}>
              <ChevronDown className="w-4 h-4 text-gray-400" />
            </div>
          </button>

          <div className={`overflow-hidden transition-all duration-300 ${expandedSections.location ? 'max-h-96' : 'max-h-0'}`}>
            <div className="px-3 pb-3 pt-1 space-y-2">
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-2 border border-green-100">
                <label className="text-[10px] text-green-700 font-semibold uppercase tracking-wide">Region</label>
                <p className="text-xs font-bold text-gray-900 mt-0.5">{userProfile.region || 'Not set'}</p>
            </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="bg-gray-50 rounded-lg p-2 border border-gray-100">
                  <label className="text-[10px] text-gray-500 font-semibold uppercase tracking-wide">Zone</label>
                  <p className="text-xs font-semibold text-gray-900 mt-0.5">{userProfile.zone || 'Not set'}</p>
              </div>
                <div className="bg-gray-50 rounded-lg p-2 border border-gray-100">
                  <label className="text-[10px] text-gray-500 font-semibold uppercase tracking-wide">Church</label>
                  <p className="text-xs font-semibold text-gray-900 mt-0.5">{userProfile.church || 'Not set'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Ministry Information - Collapsible */}
      <div className="px-4 mt-2">
        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
          <button
            onClick={() => toggleSection('ministry')}
            className="w-full px-3 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors active:bg-gray-100"
          >
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center shadow-md">
                <Briefcase className="w-4 h-4 text-white" />
              </div>
              <div className="text-left">
                <h3 className="text-sm font-bold text-gray-900">Ministry</h3>
                <p className="text-[10px] text-gray-500">Role & groups</p>
              </div>
            </div>
            <div className={`transform transition-transform duration-200 ${expandedSections.ministry ? 'rotate-180' : ''}`}>
              <ChevronDown className="w-4 h-4 text-gray-400" />
            </div>
          </button>

          <div className={`overflow-hidden transition-all duration-300 ${expandedSections.ministry ? 'max-h-96' : 'max-h-0'}`}>
            <div className="px-3 pb-3 pt-1 space-y-2">
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-2 border border-purple-100">
                <label className="text-[10px] text-purple-700 font-semibold uppercase tracking-wide">Designation</label>
              <div className="mt-1">
                  <span className="inline-flex items-center bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-xs font-bold shadow-sm">
                    <Music className="w-3 h-3 mr-1" />
                  {userProfile.designation || 'Not specified'}
                </span>
              </div>
            </div>

              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg p-2 border border-blue-100">
                <label className="text-[10px] text-blue-700 font-semibold uppercase tracking-wide">Administration</label>
              <div className="mt-1">
                  <span className="inline-flex items-center bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-bold shadow-sm">
                    <Award className="w-3 h-3 mr-1" />
                  {userProfile.administration || 'Not specified'}
                </span>
              </div>
            </div>

              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-2 border border-green-100">
                <label className="text-[10px] text-green-700 font-semibold uppercase tracking-wide">Groups</label>
                <div className="mt-1 flex flex-wrap gap-1.5">
                {userProfile.groups.map((group, index) => (
                    <span key={index} className="inline-flex items-center bg-green-100 text-green-800 px-2.5 py-1 rounded-full text-[10px] font-bold shadow-sm">
                      <Users className="w-3 h-3 mr-1" />
                    {group}
                  </span>
                ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* QR Code Check-in - Collapsible */}
      <div className="px-4 mt-2">
        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
          <button
            onClick={() => toggleSection('qrCode')}
            className="w-full px-3 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors active:bg-gray-100"
          >
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center shadow-md">
                <QrCode className="w-4 h-4 text-white" />
            </div>
              <div className="text-left">
                <h3 className="text-sm font-bold text-gray-900">QR Check-in</h3>
                <p className="text-[10px] text-gray-500">
                  {qrGenerated && timeLeft > 0 ? `⏱️ ${Math.floor(timeLeft / 60)}:${(timeLeft % 60).toString().padStart(2, '0')} left` : 'Tap to generate'}
                </p>
          </div>
        </div>
            <div className={`transform transition-transform duration-200 ${expandedSections.qrCode ? 'rotate-180' : ''}`}>
              <ChevronDown className="w-4 h-4 text-gray-400" />
      </div>
          </button>

          <div className={`overflow-hidden transition-all duration-300 ${expandedSections.qrCode ? 'max-h-[600px]' : 'max-h-0'}`}>
            <div className="px-3 pb-3 pt-1">
            {qrGenerated && qrCode ? (
                <div className="text-center">
                  <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg p-4 border border-indigo-100">
                    <div className="inline-block bg-white p-3 rounded-lg shadow-lg">
                    <QRCodeGenerator 
                      value={qrCode} 
                        size={160}
                      className="mx-auto"
                    />
                      </div>
                    <p className="text-[10px] text-gray-600 font-mono mt-2 bg-white/50 backdrop-blur-sm px-2 py-1 rounded-lg inline-block">{qrCode}</p>

                    {/* Timer Badge */}
                    <div className="mt-3 inline-flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-full shadow-sm">
                      <Clock className="w-3 h-3 text-indigo-600" />
                      <span className="text-xs font-bold text-gray-900">
                        {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
                      </span>
                    </div>

                <button
                  onClick={generateQRCode}
                      className="mt-3 w-full px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xs font-bold rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all shadow-md hover:shadow-lg active:scale-95"
                >
                      🔄 Generate New Code
                </button>
                  </div>
              </div>
            ) : (
                <div className="text-center py-4">
                  <div className="w-24 h-24 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-lg mx-auto mb-3 flex items-center justify-center">
                    <QrCode className="w-12 h-12 text-indigo-600" />
            </div>
                  <p className="text-xs text-gray-600 mb-3 font-medium">Generate your attendance QR code</p>
              <button 
                  onClick={generateQRCode}
                    className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xs font-bold rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all shadow-md hover:shadow-lg active:scale-95"
              >
                    ✨ Generate QR Code
              </button>
                  <p className="text-[10px] text-gray-500 mt-2">Valid for 5 minutes</p>
            </div>
            )}
            </div>
          </div>
        </div>
      </div>


      {/* Recent Attendance - Collapsible */}
      <div className="px-4 mt-2">
        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
          <button
            onClick={() => toggleSection('attendance')}
            className="w-full px-3 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors active:bg-gray-100"
          >
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center shadow-md">
                <Calendar className="w-4 h-4 text-white" />
              </div>
              <div className="text-left">
                <h3 className="text-sm font-bold text-gray-900">Attendance</h3>
                <p className="text-[10px] text-gray-500">Recent check-ins</p>
              </div>
            </div>
            <div className={`transform transition-transform duration-200 ${expandedSections.attendance ? 'rotate-180' : ''}`}>
              <ChevronDown className="w-4 h-4 text-gray-400" />
            </div>
          </button>

          <div className={`overflow-hidden transition-all duration-300 ${expandedSections.attendance ? 'max-h-[800px]' : 'max-h-0'}`}>
            <div className="px-3 pb-3 pt-1">
          {attendanceHistory.length > 0 ? (
                <div className="space-y-1.5">
            {attendanceHistory.map((record, index) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-2 border border-gray-100 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full shadow-sm ${
                      record.status === 'present' ? 'bg-green-500' : 
                      record.status === 'late' ? 'bg-yellow-500' : 'bg-red-500'
                  }`}></div>
                  <div>
                          <p className="text-xs font-bold text-gray-900">{record.event_name}</p>
                          <p className="text-[10px] text-gray-500">
                        {new Date(record.check_in_time).toLocaleDateString()}
                      </p>
                  </div>
                </div>
                <div className="text-right">
                        <p className={`text-[10px] font-bold ${
                      record.status === 'present' ? 'text-green-600' : 
                      record.status === 'late' ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                      {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                    </p>
                        <p className="text-[10px] text-gray-500">
                      {new Date(record.check_in_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
          </div>
          ) : (
                <div className="text-center py-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border border-gray-200">
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-2 shadow-sm">
                    <Calendar className="w-6 h-6 text-gray-400" />
                  </div>
                  <p className="text-xs font-semibold text-gray-700 mb-0.5">No attendance yet</p>
                  <p className="text-[10px] text-gray-500">Use your QR code to check in</p>
            </div>
          )}
          
              {/* Danger Zone */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="bg-gradient-to-br from-red-50 to-pink-50 border-2 border-red-200 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                    <h3 className="text-sm font-bold text-red-800">Danger Zone</h3>
                  </div>
                  <p className="text-xs text-red-600 mb-3">Deleting your account is permanent and cannot be undone.</p>
              <button
                onClick={() => setShowDeleteDialog(true)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-red-600 text-white text-sm font-bold rounded-lg hover:bg-red-700 transition-all shadow-md hover:shadow-lg active:scale-95"
              >
                    <Trash2 className="w-4 h-4" />
                Delete Account
              </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Spacing */}
      <div className="h-6"></div>

      </div> {/* Close Scrollable Content Container */}

      {/* Delete Account Dialog */}
      {showDeleteDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mr-3">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Delete Account</h3>
                <p className="text-sm text-gray-500">This action cannot be undone</p>
        </div>
      </div>
            
            <div className="mb-6">
              <p className="text-sm text-gray-600 mb-4">
                This will permanently delete your account and remove all your data from our servers. 
                This action cannot be undone.
              </p>
              
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                <p className="text-sm text-red-800 font-medium mb-2">What will be deleted:</p>
                <ul className="text-xs text-red-700 space-y-1">
                  <li>• Your profile information</li>
                  <li>• Your attendance records</li>
                  <li>• Your group memberships</li>
                  <li>• All associated data</li>
                </ul>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type <span className="font-mono bg-gray-100 px-1 rounded">DELETE</span> to confirm:
                </label>
                <input
                  type="text"
                  value={deleteConfirmation}
                  onChange={(e) => setDeleteConfirmation(e.target.value)}
                  placeholder="Type DELETE to confirm"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                />
              </div>
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowDeleteDialog(false)
                  setDeleteConfirmation('')
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleteConfirmation !== 'DELETE' || isDeleting}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Account
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <SharedDrawer open={isMenuOpen} onClose={() => setIsMenuOpen(false)} title="Menu" items={menuItems} />
    </div>
  )
}

export default function ProfilePageWithAuth() {
  return (
    <AuthGuard requireAuth={true} requireCompleteProfile={false}>
      <ProfilePage />
    </AuthGuard>
  )
}

