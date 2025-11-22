'use client'

import { useState, useEffect } from 'react'
import { X, Loader2, Eye, EyeOff, CheckCircle, AlertCircle, ArrowRight, Trash2 } from 'lucide-react'
import { FirebaseAuthService } from '@/lib/firebase-auth'
import { FirebaseDatabaseService } from '@/lib/firebase-database'

interface KingsChatMigrationModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  kingschatId: string
  kingschatUserData: any
  tempAccountData: any
}

export default function KingsChatMigrationModal({ 
  isOpen, 
  onClose, 
  onSuccess,
  kingschatId,
  kingschatUserData,
  tempAccountData
}: KingsChatMigrationModalProps) {
  
  // Debug logging
  console.log('🔍 Migration Modal Data:')
  console.log('KingsChat User Data:', kingschatUserData)
  console.log('Temp Account Data:', tempAccountData)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [emailVerified, setEmailVerified] = useState(false)
  const [verifyingEmail, setVerifyingEmail] = useState(false)
  const [step, setStep] = useState<'verify' | 'complete'>('verify')
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  })

  // Update form data when props change
  useEffect(() => {
    // Prioritize temp account data (real names) over KingsChat data (generic names)
    const firstName = tempAccountData?.first_name || 
                     tempAccountData?.firstName || 
                     kingschatUserData?.firstName || 
                     ''
    const lastName = tempAccountData?.last_name || 
                     tempAccountData?.lastName || 
                     kingschatUserData?.lastName || 
                     ''
    
    console.log('📝 Setting form data - First Name:', firstName, 'Last Name:', lastName)
    console.log('📝 Temp account first_name:', tempAccountData?.first_name)
    console.log('📝 Temp account last_name:', tempAccountData?.last_name)
    
    setFormData(prev => ({
      ...prev,
      firstName,
      lastName
    }))
  }, [kingschatUserData, tempAccountData])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
    // Reset verification if email or password changes
    if (e.target.name === 'email' || e.target.name === 'password') {
      setEmailVerified(false)
      setStep('verify')
      setError('')
      setSuccess('')
    }
  }

  const handleVerifyAccount = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setVerifyingEmail(true)

    try {
      // Validate email and password
      if (!formData.email || !formData.password) {
        setError('Please enter both email and password')
        setVerifyingEmail(false)
        return
      }

      if (formData.password.length < 6) {
        setError('Password must be at least 6 characters')
        setVerifyingEmail(false)
        return
      }

      setSuccess('Verifying account...')

      // FIRST: Check if this KingsChat ID is already linked to ANY account
      console.log('🔍 Checking if KingsChat ID is already in use:', kingschatId)
      const existingKingsChatUser = await FirebaseDatabaseService.findUserByKingsChatId(kingschatId)
      
      if (existingKingsChatUser) {
        // Check if it's the temp account we're trying to migrate (that's okay)
        if (existingKingsChatUser.id !== tempAccountData.id) {
          setError('This KingsChat account is already linked to another account. Cannot proceed.')
          setEmailVerified(false)
          setStep('verify')
          setVerifyingEmail(false)
          return
        }
        console.log('✅ KingsChat ID belongs to temp account being migrated')
      }

      // SECOND: Try to sign in with the provided credentials
      const signInResult = await FirebaseAuthService.signInWithEmailAndPassword(
        formData.email,
        formData.password
      )

      if (signInResult.error) {
        // Account doesn't exist - that's okay, we'll create it
        console.log('📧 Email account does not exist, will create new account')
        setSuccess('Account verified! You can proceed to complete setup.')
        setEmailVerified(true)
        setStep('complete')
        setVerifyingEmail(false)
        return
      }

      // Account exists - check if it has KingsChat ID
      if (signInResult.user) {
        const existingProfile = await FirebaseDatabaseService.getUserProfile(signInResult.user.uid)
        
        // Sign out immediately (this was just a check)
        await FirebaseAuthService.signOut()
        
        if (existingProfile && ((existingProfile as any).kingschat_id || (existingProfile as any).kingschatUserId)) {
          setError('This email account already has a KingsChat account linked. Please use a different email address.')
          setEmailVerified(false)
          setStep('verify')
          setVerifyingEmail(false)
          return
        }
        
        // Account exists but no KingsChat ID - perfect!
        console.log('✅ Email account exists and has no KingsChat linked')
        setSuccess('Account verified! You can proceed to complete setup.')
        setEmailVerified(true)
        setStep('complete')
      }

    } catch (error: any) {
      console.error('Account verification error:', error)
      setError('Failed to verify account. Please check your credentials.')
      setEmailVerified(false)
      setStep('verify')
    } finally {
      setVerifyingEmail(false)
    }
  }

  const handleCompleteSetup = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      // Validation
      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match')
        setIsLoading(false)
        return
      }

      setSuccess('Linking KingsChat to your account...')

      // Try to sign in again to get the user
      const signInResult = await FirebaseAuthService.signInWithEmailAndPassword(
        formData.email,
        formData.password
      )

      if (!signInResult.error && signInResult.user) {
        // Account exists - update it with KingsChat ID
        // Filter out temp account fields that shouldn't be migrated
        const { id, accountType: tempAccountType, email: tempEmail, ...tempDataToMigrate } = tempAccountData
        
        await FirebaseDatabaseService.updateUserProfile(signInResult.user.uid, {
          // Migrate selected data from temp account (excluding id, accountType, email)
          ...tempDataToMigrate,
          // Override with new data
          first_name: formData.firstName,
          last_name: formData.lastName,
          email: formData.email, // Use the real email
          kingschat_id: kingschatId,
          accountType: 'real', // Explicitly set to real
          migratedFrom: tempAccountData.id,
          migratedAt: new Date().toISOString()
        })
        
        setSuccess('KingsChat linked successfully!')
        
        // Mark temp account as migrated (safer than deletion)
        try {
          console.log('🔄 Marking temp account as migrated:', tempAccountData.id)
          await FirebaseDatabaseService.updateDocument('profiles', tempAccountData.id, {
            accountType: 'migrated',
            migratedTo: signInResult.user.uid,
            migratedAt: new Date().toISOString(),
            kingschat_id: null // Remove KingsChat ID so it won't be found in searches
          })
          console.log('✅ Temp account marked as migrated')
        } catch (updateError) {
          console.error('❌ Failed to mark temp account as migrated:', updateError)
          // Try to delete as fallback
          try {
            await FirebaseDatabaseService.deleteDocument('profiles', tempAccountData.id)
            console.log('✅ Temp account deleted as fallback')
          } catch (deleteError) {
            console.error('❌ Failed to delete temp account:', deleteError)
          }
        }
        
        // Set auth flags
        if (typeof window !== 'undefined') {
          localStorage.setItem('userAuthenticated', 'true')
          localStorage.setItem('hasCompletedProfile', 'true')
          localStorage.setItem('authProvider', 'kingschat')
          localStorage.setItem('bypassLogin', 'true')
        }
        
        setTimeout(() => {
          onSuccess()
          onClose()
        }, 2000)
        
        return
      }

      // Account doesn't exist - create new one
      setSuccess('Creating your account...')

      // Filter out temp account fields that shouldn't be migrated
      const { id, accountType: tempAccountType, email: tempEmail, ...tempDataToMigrate } = tempAccountData

      const newAuthResult = await FirebaseAuthService.createUserWithEmailAndPassword(
        formData.email,
        formData.password,
        {
          // Migrate selected data from temp account (excluding id, accountType, email)
          ...tempDataToMigrate,
          // Override with new data
          first_name: formData.firstName,
          last_name: formData.lastName,
          email: formData.email, // Use the real email
          kingschat_id: kingschatId,
          accountType: 'real', // Explicitly set to real
          migratedFrom: tempAccountData.id,
          migratedAt: new Date().toISOString()
        }
      )

      if (newAuthResult.error) {
        setError(newAuthResult.error)
        setIsLoading(false)
        return
      }

      setSuccess('Almost done...')

      // Mark temp account as migrated (safer than deletion)
      try {
        console.log('🔄 Marking temp account as migrated:', tempAccountData.id)
        await FirebaseDatabaseService.updateDocument('profiles', tempAccountData.id, {
          accountType: 'migrated',
          migratedTo: newAuthResult.user?.uid,
          migratedAt: new Date().toISOString(),
          kingschat_id: null // Remove KingsChat ID so it won't be found in searches
        })
        console.log('✅ Temp account marked as migrated')
      } catch (updateError) {
        console.error('❌ Failed to mark temp account as migrated:', updateError)
        // Try to delete as fallback
        try {
          await FirebaseDatabaseService.deleteDocument('profiles', tempAccountData.id)
          console.log('✅ Temp account deleted as fallback')
        } catch (deleteError) {
          console.error('❌ Failed to delete temp account:', deleteError)
        }
      }

      setSuccess('Account setup complete! Welcome!')

      // Set auth flags
      if (typeof window !== 'undefined') {
        localStorage.setItem('userAuthenticated', 'true')
        localStorage.setItem('hasCompletedProfile', 'true')
        localStorage.setItem('authProvider', 'kingschat')
        localStorage.setItem('bypassLogin', 'true')
      }

      setTimeout(() => {
        onSuccess()
        onClose()
      }, 2000)

    } catch (error: any) {
      console.error('Account setup error:', error)
      setError('Failed to complete setup. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <img 
              src="/kingschat.jpeg" 
              alt="KingsChat" 
              className="w-8 h-8 rounded-full object-cover"
            />
            <div>
              <h3 className="font-semibold text-gray-900">Complete Setup</h3>
              <p className="text-sm text-gray-500">Add your email address</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Success Message */}
          {success && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
              <p className="text-green-600 text-sm">{success}</p>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {/* Account Found Info */}
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h4 className="font-medium text-gray-900 mb-2">Account Found!</h4>
            <p className="text-sm text-gray-600">
              We found your existing account. Please add your real email address to complete the setup.
            </p>
          </div>

          {/* Migration Form */}
          <form onSubmit={step === 'verify' ? handleVerifyAccount : handleCompleteSetup} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <input
                type="text"
                name="firstName"
                placeholder="First Name"
                value={formData.firstName}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-purple-600 text-sm"
                required
              />
              <input
                type="text"
                name="lastName"
                placeholder="Last Name"
                value={formData.lastName}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-purple-600 text-sm"
                required
              />
            </div>

            <input
              type="email"
              name="email"
              placeholder="Your real email address"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-purple-600 text-sm"
              required
            />

            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                placeholder="Create password"
                value={formData.password}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-purple-600 text-sm pr-12"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* Only show confirm password after verification */}
            {step === 'complete' && (
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  placeholder="Confirm password"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-purple-600 text-sm pr-12"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            )}

            {/* KingsChat Status */}
            <div className="w-full px-4 py-3 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-green-800">KingsChat Connected</p>
                <p className="text-xs text-green-600">Will be linked to your new account</p>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || verifyingEmail}
              className="w-full py-3 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {(isLoading || verifyingEmail) && <Loader2 className="w-4 h-4 animate-spin" />}
              {step === 'verify' 
                ? (verifyingEmail ? 'Verifying...' : 'Verify Account')
                : (isLoading ? 'Completing...' : 'Complete Setup')
              }
            </button>
          </form>

          <div className="text-center">
            <p className="text-xs text-gray-500">
              This will complete your account setup.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}