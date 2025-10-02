'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, User, MapPin, Users, ChevronDown, Loader2, Check, Sparkles, Heart, Music } from 'lucide-react'
import { AuthService } from '@/lib/auth-service'
import { supabase } from '@/lib/supabase-client'
import type { ProfileCompletionData } from '@/types/supabase'

export default function ProfileCompletionPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    middleName: '',
    gender: '' as 'Male' | 'Female' | '',
    birthday: '',
    phoneNumber: '',
    region: '',
    zone: '',
    church: '',
    designation: '' as 'Soprano' | 'Alto' | 'Tenor' | 'Bass' | 'Instrumentalist' | 'Backup Singer' | '',
    administration: '' as 'Coordinator' | 'Assistant Coordinator' | 'Secretary' | 'Treasurer' | 'Member' | ''
  })
  const [selectedGroup, setSelectedGroup] = useState<string>('')
  const [availableGroups] = useState([
    'yourloveworldsingers',
    'pmc',
    '24 worship',
    'teens voice',
    'orchestra',
    'international representative',
    'national representative'
  ])

  // Pre-populate first name and last name from user metadata
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const user = await AuthService.getCurrentUser()
        if (user && user.user_metadata) {
          setFormData(prev => ({
            ...prev,
            firstName: user.user_metadata.first_name || '',
            lastName: user.user_metadata.last_name || ''
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

  const handleGroupSelect = (groupName: string) => {
    setSelectedGroup(groupName)
  }

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1)
    } else {
      handleComplete()
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    } else {
      router.back()
    }
  }

  // Save user groups to database
  const saveUserGroups = async (userId: string, groups: string[]) => {
    try {
      console.log('💾 Saving user groups:', groups)
      
      // First, delete all existing groups for this user
      const { error: deleteError } = await supabase
        .from('user_groups')
        .delete()
        .eq('user_id', userId)
      
      if (deleteError) {
        console.error('Error deleting existing groups:', deleteError)
        return false
      }
      
      // Then, insert new groups
      if (groups.length > 0) {
        const groupInserts = groups.map(groupName => ({
          user_id: userId,
          group_name: groupName
        }))
        
        const { error: insertError } = await supabase
          .from('user_groups')
          .insert(groupInserts)
        
        if (insertError) {
          console.error('Error inserting new groups:', insertError)
          return false
        }
      }
      
      console.log('✅ User groups saved successfully')
      return true
    } catch (error) {
      console.error('Error saving user groups:', error)
      return false
    }
  }

  const handleComplete = async () => {
    setError('')
    setIsLoading(true)
    
    try {
      // Check if user is authenticated first
      const user = await AuthService.getCurrentUser()
      
      if (!user) {
        setError('Please sign in first to complete your profile')
        setTimeout(() => {
          router.push('/auth')
        }, 2000)
        return
      }

      // DISABLED: Email confirmation check removed for development
      // if (!user.email_confirmed_at) {
      //   setError('Please verify your email first')
      //   setTimeout(() => {
      //     router.push(`/email-verification?email=${encodeURIComponent(user.email || '')}`)
      //   }, 2000)
      //   return
      // }

      const profileData: ProfileCompletionData = {
        firstName: formData.firstName || undefined,
        lastName: formData.lastName || undefined,
        middleName: formData.middleName || undefined,
        gender: formData.gender || undefined,
        birthday: formData.birthday || undefined,
        phoneNumber: formData.phoneNumber || undefined,
        region: formData.region || undefined,
        zone: formData.zone || undefined,
        church: formData.church || undefined,
        designation: formData.designation || undefined,
        administration: formData.administration || undefined
      }

      await AuthService.completeProfile(profileData)
      
      // Save user group
      if (selectedGroup) {
        await saveUserGroups(user.id, [selectedGroup])
      }
      
      // Set localStorage values for authentication state
      localStorage.setItem('isAuthenticated', 'true')
      localStorage.setItem('hasCompletedProfile', 'true')
      
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

  const handleSkip = () => {
    router.push('/home')
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="w-8 h-8 text-purple-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Personal Information</h2>
              <p className="text-gray-600 text-sm">Tell us a bit about yourself</p>
            </div>

            <div className="space-y-4">
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
                type="text"
                name="middleName"
                placeholder="Middle Name (Optional)"
                value={formData.middleName}
                onChange={handleInputChange}
                className="w-full px-4 py-4 bg-gray-100 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-purple-600 text-sm"
              />

              <div className="relative">
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  className="w-full px-4 py-4 bg-gray-100 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-purple-600 text-sm appearance-none"
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
              </div>

              <input
                type="date"
                name="birthday"
                placeholder="Birthday"
                value={formData.birthday}
                onChange={handleInputChange}
                className="w-full px-4 py-4 bg-gray-100 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-purple-600 text-sm"
              />

              <input
                type="tel"
                name="phoneNumber"
                placeholder="Phone Number"
                value={formData.phoneNumber}
                onChange={handleInputChange}
                className="w-full px-4 py-4 bg-gray-100 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-purple-600 text-sm"
              />
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-8 h-8 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Location Information</h2>
              <p className="text-gray-600 text-sm">Where are you located?</p>
            </div>

            <div className="space-y-4">
              <div className="relative">
                <select
                  name="region"
                  value={formData.region}
                  onChange={handleInputChange}
                  className="w-full px-4 py-4 bg-gray-100 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-purple-600 text-sm appearance-none"
                >
                  <option value="">Select Region</option>
                  <option value="Lagos">Lagos</option>
                  <option value="Abuja">Abuja</option>
                  <option value="Port Harcourt">Port Harcourt</option>
                  <option value="Kano">Kano</option>
                  <option value="Ibadan">Ibadan</option>
                  <option value="Other">Other</option>
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
              </div>

              <div className="relative">
                <select
                  name="zone"
                  value={formData.zone}
                  onChange={handleInputChange}
                  className="w-full px-4 py-4 bg-gray-100 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-purple-600 text-sm appearance-none"
                >
                  <option value="">Select Zone</option>
                  <option value="Zone 1">Zone 1</option>
                  <option value="Zone 2">Zone 2</option>
                  <option value="Zone 3">Zone 3</option>
                  <option value="Zone 4">Zone 4</option>
                  <option value="Zone 5">Zone 5</option>
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
              </div>

              <input
                type="text"
                name="church"
                placeholder="Church Name"
                value={formData.church}
                onChange={handleInputChange}
                className="w-full px-4 py-4 bg-gray-100 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-purple-600 text-sm"
              />
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Ministry Information</h2>
              <p className="text-gray-600 text-sm">What's your role in the ministry?</p>
            </div>

            <div className="space-y-4">
              <div className="relative">
                <select
                  name="designation"
                  value={formData.designation}
                  onChange={handleInputChange}
                  className="w-full px-4 py-4 bg-gray-100 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-purple-600 text-sm appearance-none"
                >
                  <option value="">Select Designation</option>
                  <option value="Soprano">Soprano</option>
                  <option value="Alto">Alto</option>
                  <option value="Tenor">Tenor</option>
                  <option value="Bass">Bass</option>
                  <option value="Instrumentalist">Instrumentalist</option>
                  <option value="Backup Singer">Backup Singer</option>
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
              </div>

              <div className="relative">
                <select
                  name="administration"
                  value={formData.administration}
                  onChange={handleInputChange}
                  className="w-full px-4 py-4 bg-gray-100 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-purple-600 text-sm appearance-none"
                >
                  <option value="">Select Administration Role</option>
                  <option value="Coordinator">Coordinator</option>
                  <option value="Assistant Coordinator">Assistant Coordinator</option>
                  <option value="Secretary">Secretary</option>
                  <option value="Treasurer">Treasurer</option>
                  <option value="Member">Member</option>
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
              </div>
            </div>
          </div>
        )

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Ministry Group</h2>
              <p className="text-gray-600 text-sm">Select the group you belong to</p>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {availableGroups.map((group) => (
                  <label key={group} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
                    <input
                      type="radio"
                      name="group"
                      value={group}
                      checked={selectedGroup === group}
                      onChange={() => handleGroupSelect(group)}
                      className="w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 focus:ring-purple-500 focus:ring-2"
                    />
                    <span className="text-sm text-gray-700 font-medium">{group}</span>
                  </label>
                ))}
              </div>
              
              {selectedGroup && (
                <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
                  <p className="text-sm text-purple-800">
                    <strong>Selected Group:</strong> {selectedGroup}
                  </p>
                </div>
              )}
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="h-screen flex flex-col bg-white overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0 bg-white border-b border-gray-200 px-4 py-4 flex items-center justify-between">
        <button
          onClick={handleBack}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        
        <div className="text-center">
          <h1 className="text-lg font-semibold text-gray-800">Complete Profile</h1>
          <p className="text-sm text-gray-500">Step {currentStep} of 4</p>
        </div>

        <button
          onClick={handleSkip}
          className="text-purple-600 text-sm font-medium hover:text-purple-700 transition-colors"
        >
          Skip
        </button>
      </div>

      {/* Progress Bar */}
      <div className="flex-shrink-0 px-4 py-4">
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-purple-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(currentStep / 4) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        {/* Error Message */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {renderStep()}
      </div>

      {/* Bottom Actions */}
      <div className="flex-shrink-0 bg-white border-t border-gray-200 px-4 py-4">
        <div className="flex gap-3">
          {currentStep > 1 && (
            <button
              onClick={handleBack}
              className="flex-1 py-4 bg-gray-100 text-gray-700 font-semibold rounded-xl transition-colors hover:bg-gray-200"
            >
              Back
            </button>
          )}
          
          <button
            onClick={handleNext}
            disabled={isLoading}
            className="flex-1 py-4 bg-purple-600 text-white font-semibold rounded-xl transition-colors hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
            {currentStep === 4 ? 'Complete Profile' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  )
}