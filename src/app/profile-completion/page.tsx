'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, User, MapPin, Users, ChevronDown, Loader2, Check, Sparkles, Heart, Music } from 'lucide-react'
import { FirebaseAuthService } from '@/lib/firebase-auth'
import { FirebaseDatabaseService } from '@/lib/firebase-database'
import type { ProfileCompletionData } from '@/types/supabase'

export default function ProfileCompletionPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    firstName: '',
    middleName: '',
    lastName: '',
    phoneNumber: '',
    gender: '',
    birthday: '',
    region: '',
    zone: '',
    church: '',
    designation: '' as 'Soprano' | 'Alto' | 'Tenor' | 'Bass' | 'Instrumentalist' | 'Backup Singer' | '',
    administration: '',
    group: '' as 'yourloveworldsingers' | 'pmc' | '24worship' | 'lmaorchestra' | 'nationalzonalchoir' | 'internationalzonalchoir' | ''
  })

  // Pre-populate first name and last name from user metadata
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const user = await FirebaseAuthService.getCurrentUser()
      if (user) {
        // Firebase Auth users don't have user_metadata like Supabase
        // We'll get the name from displayName or email
        const displayName = user.displayName || ''
        const nameParts = displayName.split(' ')
        setFormData(prev => ({
          ...prev,
          firstName: nameParts[0] || '',
          lastName: nameParts.slice(1).join(' ') || '',
          email: user.email || '' // Prefill email from Firebase Auth
        }))
      }
      } catch (error) {
        console.error('Error loading user data:', error)
      }
    }
    
    loadUserData()
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }



  // Save user groups to database
  const saveUserGroups = async (userId: string, groups: string[]) => {
    try {
      console.log('💾 Saving user groups:', groups)
      
      // Save groups to Firebase
      await FirebaseDatabaseService.updateDocument('profiles', userId, {
        groups: groups,
        updated_at: new Date().toISOString()
      })
      
      console.log('✅ User groups saved successfully')
      return true
    } catch (error) {
      console.error('Error saving user groups:', error)
      return false
    }
  }

  const handleComplete = async (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }
    console.log('🚀 Profile completion started...')
    console.log('📝 Form data:', formData)
    setError('')
    setIsLoading(true)
    
    try {
      // Check if user is authenticated first
      console.log('🔍 Checking user authentication...')
      const user = await FirebaseAuthService.getCurrentUser()
      
      if (!user) {
        console.log('❌ No user found')
        setError('Please sign in first to complete your profile')
        setTimeout(() => {
          router.push('/auth')
        }, 2000)
        return
      }
      
      console.log('✅ User authenticated:', user.uid)

      // DISABLED: Email confirmation check removed for development
      // if (!user.email_confirmed_at) {
      //   setError('Please verify your email first')
      //   setTimeout(() => {
      //     router.push(`/email-verification?email=${encodeURIComponent(user.email || '')}`)
      //   }, 2000)
      //   return
      // }

      const profileData = {
        first_name: formData.firstName || undefined,
        middle_name: formData.middleName || undefined,
        last_name: formData.lastName || undefined,
        phone_number: formData.phoneNumber || undefined,
        gender: formData.gender || undefined,
        birthday: formData.birthday || undefined,
        region: formData.region || undefined,
        zone: formData.zone || undefined,
        church: formData.church || undefined,
        designation: formData.designation || undefined,
        administration: formData.administration || undefined,
      }

      // Update profile in Firebase
      console.log('💾 Updating profile in Firebase...')
      await FirebaseDatabaseService.updateDocument('profiles', user.uid, {
        ...profileData,
        profile_completed: true,
        updated_at: new Date().toISOString()
      })
      
      console.log('✅ Profile updated successfully')
      
      // Save user group
      if (formData.group) {
        console.log('💾 Saving user group...')
        await saveUserGroups(user.uid, [formData.group])
        console.log('✅ User group saved successfully')
      }
      
      console.log('🎉 Profile completion successful! Redirecting to home...')
      
      // Profile completion is now handled by the database
      // No need to set localStorage flags - the database is the source of truth
      
      router.push('/home')
    } catch (error: any) {
      console.error('Profile completion error:', error)
      
      if (error.message.includes('No authenticated user')) {
        setError('Your session has expired. Please sign in again.')
        setTimeout(() => {
          router.push('/auth')
        }, 2000)
      } else {
        setError(error.message || 'An error occurred while completing your profile')
      }
    } finally {
      setIsLoading(false)
    }
  }


  // Big Company Style - Simple One-Step Form
  const renderForm = () => {
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="w-8 h-8 text-purple-600" />
              </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Complete Your Profile</h2>
          <p className="text-gray-600 text-sm">Just a few details to get you started</p>
            </div>

            <div className="space-y-4">
              {/* Email Display (Read-only) */}
              <div>
                <input
                  type="email"
                  value={formData.email}
                  readOnly
                  className="w-full px-4 py-4 bg-gray-50 border border-gray-200 rounded-xl text-gray-600 text-sm cursor-not-allowed"
                />
                <p className="text-xs text-gray-500 mt-1">This is the email you used to sign up</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  name="firstName"
                  placeholder="First Name"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-4 bg-gray-100 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-purple-600 text-sm"
                  required
                />
                <input
                  type="text"
                  name="lastName"
                  placeholder="Last Name"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-4 bg-gray-100 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-purple-600 text-sm"
                  required
                />
              </div>

              <input
                type="tel"
                name="phoneNumber"
                placeholder="Phone Number"
                value={formData.phoneNumber}
                onChange={handleInputChange}
                className="w-full px-4 py-4 bg-gray-100 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-purple-600 text-sm"
              />

              <div className="relative">
                <select
                  name="designation"
                  value={formData.designation}
                  onChange={handleInputChange}
                  className="w-full px-4 py-4 bg-gray-100 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-purple-600 text-sm appearance-none"
                >
              <option value="">Select Your Role</option>
                  <option value="Soprano">Soprano</option>
                  <option value="Alto">Alto</option>
                  <option value="Tenor">Tenor</option>
                  <option value="Bass">Bass</option>
                  <option value="Instrumentalist">Instrumentalist</option>
                  <option value="Backup Singer">Backup Singer</option>
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
              </div>

              {/* Additional Profile Fields */}
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  name="middleName"
                  placeholder="Middle Name"
                  value={formData.middleName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-4 bg-gray-100 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-purple-600 text-sm"
                />
                <input
                  type="text"
                  name="gender"
                  placeholder="Gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  className="w-full px-4 py-4 bg-gray-100 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-purple-600 text-sm"
                />
              </div>

              <input
                type="date"
                name="birthday"
                placeholder="Birthday"
                value={formData.birthday}
                onChange={handleInputChange}
                className="w-full px-4 py-4 bg-gray-100 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-purple-600 text-sm"
              />

              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  name="region"
                  placeholder="Region"
                  value={formData.region}
                  onChange={handleInputChange}
                  className="w-full px-4 py-4 bg-gray-100 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-purple-600 text-sm"
                />
                <input
                  type="text"
                  name="zone"
                  placeholder="Zone"
                  value={formData.zone}
                  onChange={handleInputChange}
                  className="w-full px-4 py-4 bg-gray-100 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-purple-600 text-sm"
                />
              </div>

              <input
                type="text"
                name="church"
                placeholder="Church"
                value={formData.church}
                onChange={handleInputChange}
                className="w-full px-4 py-4 bg-gray-100 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-purple-600 text-sm"
              />

              <div className="relative">
                <select
                  name="administration"
                  value={formData.administration}
                  onChange={handleInputChange}
                  className="w-full px-4 py-4 bg-gray-100 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-purple-600 text-sm appearance-none"
                >
                  <option value="">Select Administration</option>
                  <option value="Pastor">Pastor</option>
                  <option value="Minister">Minister</option>
                  <option value="Coordinator">Coordinator</option>
                  <option value="Leader">Leader</option>
                  <option value="Member">Member</option>
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
              </div>

              <div className="relative">
                <select
              name="group"
              value={formData.group}
                  onChange={handleInputChange}
                  className="w-full px-4 py-4 bg-gray-100 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-purple-600 text-sm appearance-none"
                >
              <option value="">Select Your Group</option>
              <option value="yourloveworldsingers">Your LoveWorld Singers</option>
              <option value="pmc">PMC</option>
              <option value="24worship">24 Worship</option>
              <option value="lmaorchestra">LMA/LOVEWORLD ORCHESTRA</option>
              <option value="nationalzonalchoir">National Zonal Choir Representatives</option>
              <option value="internationalzonalchoir">International Zonal Choir Representatives</option>
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
              </div>
            </div>
          </div>
        )
  }

  return (
    <div className="h-screen flex flex-col bg-white overflow-hidden">
      {/* Header - Big Company Style */}
      <div className="flex-shrink-0 bg-white border-b border-gray-200 px-4 py-4 flex items-center justify-between">
        <button
          onClick={() => router.back()}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        
        <div className="text-center">
          <h1 className="text-lg font-semibold text-gray-800">Complete Profile</h1>
          <p className="text-sm text-gray-500">Almost there!</p>
        </div>

        <div className="w-10"></div> {/* Spacer for centering */}
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        {/* Error Message */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {renderForm()}
      </div>

      {/* Bottom Actions - Big Company Style */}
      <div className="flex-shrink-0 bg-white border-t border-gray-200 px-4 py-4">
            <button
          type="button"
          onClick={handleComplete}
            disabled={isLoading}
          className="w-full py-4 bg-purple-600 text-white font-semibold rounded-xl transition-colors hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
          Complete Profile
          </button>
      </div>
    </div>
  )
}