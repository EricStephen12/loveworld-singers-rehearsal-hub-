'use client'

import { useState } from 'react'
import { X, Loader2, Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react'
import { FirebaseAuthService } from '@/lib/firebase-auth'
import { FirebaseDatabaseService } from '@/lib/firebase-database'

interface KingsChatLinkingModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  onCreateAccount: () => void
  onMigrateTempAccount: (tempAccountData: any) => void
  kingschatId: string
  kingschatUserData: any
}

export default function KingsChatLinkingModal({ 
  isOpen, 
  onClose, 
  onSuccess,
  onCreateAccount,
  onMigrateTempAccount,
  kingschatId,
  kingschatUserData
}: KingsChatLinkingModalProps) {
  const [step, setStep] = useState<'verify' | 'link'>('verify')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [verifiedUser, setVerifiedUser] = useState<any>(null)
  const [hasExistingKingsChat, setHasExistingKingsChat] = useState(false)
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    kingschatId: kingschatId
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const handleVerifyAccount = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      // Verify the user's existing account
      const signInResult = await FirebaseAuthService.signInWithEmailAndPassword(
        formData.email,
        formData.password
      )

      if (signInResult.error) {
        if (signInResult.error.includes('user-not-found')) {
          setError('No account found with this email. Please check your email or create a new account.')
        } else if (signInResult.error.includes('wrong-password')) {
          setError('Incorrect password. Please try again.')
        } else if (signInResult.error.includes('invalid-email')) {
          setError('Invalid email address. Please check your email.')
        } else {
          setError(signInResult.error)
        }
        setIsLoading(false)
        return
      }

      // Account verified successfully
      console.log('✅ Account verified:', formData.email)
      setSuccess('Account verified! Now linking your KingsChat account...')
      
      // Get the user's profile to check for existing KingsChat ID
      if (!signInResult.user) {
        throw new Error('Sign in succeeded but user is null')
      }
      
      const userProfile = await FirebaseDatabaseService.getUserProfile(signInResult.user.uid)
      
      setVerifiedUser(signInResult.user)
      
      // Check if they already have a KingsChat ID
      const hasExisting = !!(userProfile && (userProfile as any).kingschat_id)
      setHasExistingKingsChat(hasExisting)
      
      if (hasExisting) {
        setSuccess('Account verified! This will update your existing KingsChat connection.')
      } else {
        setSuccess('Account verified! Now linking your KingsChat account...')
      }
      
      setStep('link')
      
    } catch (error: any) {
      console.error('Account verification error:', error)
      setError('Unable to verify account. Please check your credentials and try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleLinkKingsChat = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      if (!verifiedUser) {
        setError('Please verify your account first')
        setIsLoading(false)
        return
      }

      // Check if this KingsChat ID is already used by another account
      const existingUser = await FirebaseDatabaseService.findUserByKingsChatId(formData.kingschatId)
      
      if (existingUser && existingUser.id !== verifiedUser.uid) {
        // Check if it's a temp account - offer migration instead of error
        if (existingUser.accountType === 'temp' || existingUser.email?.includes('@kingschat.temp')) {
          console.log('🔄 Found temp account, triggering migration modal')
          onMigrateTempAccount(existingUser)
          onClose()
          return
        } else {
          setError('This KingsChat account is already linked to another account.')
          setIsLoading(false)
          return
        }
      }

      // Update the user's profile with KingsChat ID
      await FirebaseDatabaseService.updateUserProfile(verifiedUser.uid, {
        kingschat_id: formData.kingschatId,
        kingschatUserId: formData.kingschatId, // Also save in legacy field
        updatedAt: new Date()
      })

      console.log('✅ KingsChat account linked/updated successfully')
      setSuccess(hasExistingKingsChat ? 
        'KingsChat connection updated successfully! You can now use KingsChat to sign in.' :
        'KingsChat account linked successfully! You can now use KingsChat to sign in.'
      )
      
      setTimeout(() => {
        onSuccess()
        onClose()
      }, 2000)

    } catch (error: any) {
      console.error('KingsChat linking error:', error)
      setError('Failed to link KingsChat account. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleReconnectKingsChat = () => {
    // Allow user to reconnect KingsChat to get a fresh ID
    setError('Please reconnect your KingsChat account to get the latest ID')
    // You could trigger the KingsChat OAuth modal again here
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
              <h3 className="font-semibold text-gray-900">Link KingsChat Account</h3>
              <p className="text-sm text-gray-500">Connect to your existing account</p>
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

          {/* Step 1: Verify Existing Account */}
          {step === 'verify' && (
            <div className="space-y-4">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="w-8 h-8 text-blue-600" />
                </div>
                <h4 className="font-medium text-gray-900 mb-2">KingsChat Account Not Found</h4>
                <p className="text-sm text-gray-600 mb-6">
                  We couldn't find an account linked to your KingsChat ID. You have two options:
                </p>
                <div className="bg-purple-50 rounded-lg p-4 mb-6">
                  <div className="space-y-2 text-sm text-purple-800">
                    <div className="flex items-start gap-2">
                      <span className="font-semibold">1.</span>
                      <span><strong>Link to existing account:</strong> Enter your email/password below</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="font-semibold">2.</span>
                      <span><strong>Create new account:</strong> Use the green button below</span>
                    </div>
                  </div>
                </div>
              </div>

              <form onSubmit={handleVerifyAccount} className="space-y-4">
                <div>
                  <input
                    type="email"
                    name="email"
                    placeholder="Your existing email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-purple-600 text-sm"
                    required
                  />
                </div>

                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    placeholder="Your password"
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

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                  {isLoading ? 'Verifying...' : 'Verify Account'}
                </button>
              </form>

              {/* Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">Or</span>
                </div>
              </div>

              {/* Create New Account Button */}
              <button
                onClick={() => {
                  // Store KingsChat data for signup and close modal
                  localStorage.setItem('kingschatProfileSetup', 'true')
                  localStorage.setItem('kingschatUserId', kingschatId)
                  localStorage.setItem('kingschatUserData', JSON.stringify(kingschatUserData))
                  onCreateAccount()
                  onClose()
                }}
                className="w-full py-3 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
              >
                <CheckCircle className="w-4 h-4" />
                Create New Account
              </button>

              <div className="text-center mt-4">
                <p className="text-xs text-gray-500">
                  Don't have an existing account? Create a new one with your KingsChat ID pre-filled.
                </p>
              </div>
            </div>
          )}

          {/* Step 2: Link KingsChat ID */}
          {step === 'link' && (
            <div className="space-y-4">
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h4 className="font-medium text-gray-900 mb-2">Account Verified!</h4>
                <p className="text-sm text-gray-600 mb-6">
                  Now let's link your KingsChat account to your profile.
                </p>
              </div>

              <form onSubmit={handleLinkKingsChat} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Verified Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    disabled
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-500 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    KingsChat Account
                  </label>
                  <div className="w-full px-4 py-3 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-green-800">KingsChat Connected</p>
                      <p className="text-xs text-green-600">Ready to link to your account</p>
                    </div>
                  </div>
                  
                  {hasExistingKingsChat && (
                    <div className="mt-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-amber-800">Update Existing Connection</p>
                          <p className="text-xs text-amber-700 mt-1">
                            This will replace your current KingsChat connection with the new one.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <p className="text-xs text-gray-500 mt-1">
                    Your KingsChat account was successfully authenticated
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                  {isLoading ? (hasExistingKingsChat ? 'Updating...' : 'Linking...') : (hasExistingKingsChat ? 'Update KingsChat Connection' : 'Link KingsChat Account')}
                </button>

                <button
                  type="button"
                  onClick={handleReconnectKingsChat}
                  className="w-full py-2 text-gray-600 text-sm hover:text-gray-800 transition-colors"
                >
                  Reconnect KingsChat to get fresh ID
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}