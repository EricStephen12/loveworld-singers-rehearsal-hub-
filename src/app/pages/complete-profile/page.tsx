'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { FirebaseDatabaseService } from '@/lib/firebase-database'
import { ArrowLeft, Upload, User, Mail, Phone, MapPin, Calendar } from 'lucide-react'
import Image from 'next/image'

function CompleteProfileContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, profile, refreshProfile } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [profileImage, setProfileImage] = useState<string | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phone_number: '',
    gender: '',
    birthday: '',
    region: '',
    zone: '',
    church: ''
  })

  // Check if user came from KingsChat
  const fromKingsChat = searchParams.get('from') === 'kingschat'
  const kingschatUserId = searchParams.get('kingschatUserId')

  // Simple auth check using localStorage - no annoying re-renders!
  useEffect(() => {
    // Check if this is a KingsChat profile setup
    const isKingsChatSetup = typeof window !== 'undefined' && 
                             localStorage.getItem('kingschatProfileSetup') === 'true'
    
    // Allow access if: user exists OR KingsChat setup flag is set
    if (user || isKingsChatSetup) {
      console.log('✅ Access granted to profile completion')
      return
    }
    
    // No user and no KingsChat flag - redirect to auth
    console.log('❌ No access - redirecting to auth')
    router.push('/auth')
  }, [user, router])

  // Pre-fill form data when profile loads
  useEffect(() => {
    if (profile && user) {
      const displayEmail = profile.email?.includes('@kingschat.temp') ? '' : (profile.email || '')
      
      setFormData({
        first_name: profile.first_name || '',
        last_name: profile.last_name || '',
        phone_number: profile.phone_number || '',
        gender: profile.gender || '',
        birthday: profile.birthday || '',
        region: profile.region || '',
        zone: profile.zone || '',
        church: profile.church || ''
      })

      if (profile.profile_image_url) {
        setProfileImage(profile.profile_image_url)
      }
    }
  }, [profile, user])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setProfileImage(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setIsLoading(true)

    try {
      // Validate required fields
      if (!formData.first_name || !formData.last_name) {
        throw new Error('Please fill in all required fields (First Name, Last Name)')
      }

      // Upload profile image if selected
      let imageUrl = profileImage
      if (imageFile) {
        // TODO: Implement image upload to Cloudinary or Firebase Storage
        // For now, we'll use the base64 data URL
        imageUrl = profileImage
      }

      // Check if this is a KingsChat user without Firebase account yet
      if (fromKingsChat && kingschatUserId && !user) {
        console.log('🆕 Creating Firebase account for KingsChat user')
        console.log('📝 KingsChat UID from URL:', kingschatUserId)
        
        // Create Firebase account with TEMP EMAIL (KingsChat UID)
        const { FirebaseAuthService } = await import('@/lib/firebase-auth')
        
        // Use KingsChat UID as temp email for Firebase Auth
        const tempEmail = `${kingschatUserId}@kingschat.temp`
        // Use KingsChat UID as password (simple and consistent)
        const password = kingschatUserId
        console.log('📧 Firebase Auth temp email:', tempEmail)
        
        const profileData: any = {
          first_name: formData.first_name,
          last_name: formData.last_name,
          phone_number: formData.phone_number || '',
          gender: formData.gender || '',
          birthday: formData.birthday || '',
          region: formData.region || '',
          zone: formData.zone || '',
          church: formData.church || '',
          kingschatUserId: kingschatUserId, // Save KingsChat UID
          kingschatLinkedAt: new Date().toISOString(),
          authProviders: ['kingschat'],
          profile_completed: true
        }
        
        console.log('💾 Profile data to save:', profileData)
        
        if (imageUrl) {
          profileData.profile_image_url = imageUrl
        }
        
        // Create Firebase Auth account with TEMP EMAIL and UID as password
        const result = await FirebaseAuthService.createUserWithEmailAndPassword(
          tempEmail, // Use temp email for Firebase Auth
          password, // Use UID as password
          profileData
        )
        
        if (result.error) {
          throw new Error(result.error)
        }
        
        console.log('✅ Firebase account created with KingsChat UID saved')
      } else if (user) {
        // Existing user - just update profile
        console.log('📝 Updating existing user profile')
        console.log('👤 User ID:', user.uid)
        
        const updateData: any = {
          first_name: formData.first_name,
          last_name: formData.last_name,
          phone_number: formData.phone_number || '',
          gender: formData.gender || '',
          birthday: formData.birthday || '',
          region: formData.region || '',
          zone: formData.zone || '',
          church: formData.church || '',
          profile_completed: true,
          updated_at: new Date().toISOString()
        }
        
        // If this is a KingsChat user linking their account
        if (fromKingsChat && kingschatUserId) {
          console.log('🔗 Linking KingsChat to existing account')
          console.log('📝 KingsChat UID:', kingschatUserId)
          updateData.kingschatUserId = kingschatUserId
          updateData.kingschatLinkedAt = new Date().toISOString()
          updateData.authProviders = profile?.authProviders 
            ? [...new Set([...profile.authProviders, 'kingschat'])]
            : ['kingschat']
        }

        if (imageUrl) {
          updateData.profile_image_url = imageUrl
        }

        await FirebaseDatabaseService.updateDocument('profiles', user.uid, updateData)
      } else {
        throw new Error('Unable to complete profile. Please try logging in again.')
      }

      setSuccess('Profile completed successfully!')
      
      // Clear KingsChat setup flag
      if (typeof window !== 'undefined') {
        localStorage.removeItem('kingschatProfileSetup')
        localStorage.setItem('hasCompletedProfile', 'true')
      }
      
      // Refresh profile in context
      await refreshProfile()

      // Redirect to home immediately
      router.push('/home')

    } catch (error: any) {
      console.error('Failed to complete profile:', error)
      setError(error.message || 'Failed to complete profile')
    } finally {
      setIsLoading(false)
    }
  }


  return (
    <div className="h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 flex-shrink-0">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold text-gray-900">Complete Your Profile</h1>
          <div className="w-20"></div> {/* Spacer */}
        </div>
      </div>

      {/* Main Content - Scrollable */}
      <div className="flex-1 overflow-y-auto py-8 px-4">
        <div className="max-w-2xl mx-auto">
          {/* Welcome Message */}
          {fromKingsChat && (
            <div className="mb-6 p-4 bg-purple-50 border border-purple-200 rounded-lg">
              <h2 className="text-lg font-semibold text-purple-900 mb-2">
                Welcome to LWSRHP! 🎉
              </h2>
              <p className="text-sm text-purple-700">
                You've successfully signed in with KingsChat. Please complete your profile to get started.
              </p>
            </div>
          )}

          {/* Error/Success Messages */}
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-700">{success}</p>
            </div>
          )}

          {/* Profile Form */}
          <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg p-6 space-y-6">
            {/* Profile Image */}
            <div className="flex flex-col items-center">
              <div className="relative">
                <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-100 border-4 border-white shadow-lg">
                  {profileImage ? (
                    <Image
                      src={profileImage}
                      alt="Profile"
                      width={128}
                      height={128}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-400 to-blue-500">
                      <User className="w-16 h-16 text-white" />
                    </div>
                  )}
                </div>
                <label
                  htmlFor="profile-image"
                  className="absolute bottom-0 right-0 bg-purple-600 text-white p-2 rounded-full cursor-pointer hover:bg-purple-700 transition-colors shadow-lg"
                >
                  <Upload className="w-4 h-4" />
                  <input
                    id="profile-image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              </div>
              <p className="mt-2 text-sm text-gray-500">Click to upload profile picture</p>
            </div>

            {/* Personal Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <User className="w-5 h-5 text-purple-600" />
                Personal Information
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    First Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Enter your first name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Enter your last name"
                  />
                </div>
              </div>


              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                  <Phone className="w-4 h-4 text-gray-500" />
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phone_number"
                  value={formData.phone_number}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="+1234567890"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="">Select gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    Birthday
                  </label>
                  <input
                    type="date"
                    name="birthday"
                    value={formData.birthday}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Location Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-purple-600" />
                Location
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Region</label>
                  <input
                    type="text"
                    name="region"
                    value={formData.region}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Your region"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Zone</label>
                  <input
                    type="text"
                    name="zone"
                    value={formData.zone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Your zone"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Church</label>
                  <input
                    type="text"
                    name="church"
                    value={formData.church}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Your church"
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
              >
                {isLoading ? 'Saving...' : 'Complete Profile'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default function CompleteProfilePage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
      <CompleteProfileContent />
    </Suspense>
  )
}
