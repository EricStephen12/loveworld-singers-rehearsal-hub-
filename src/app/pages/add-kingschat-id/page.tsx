'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Loader2, CheckCircle } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { FirebaseDatabaseService } from '@/lib/firebase-database'

export default function AddKingsChatIdPage() {
  const router = useRouter()
  const { user, profile, refreshProfile } = useAuth()
  const [kingschatId, setKingschatId] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    if (!kingschatId.trim()) {
      setError('Please enter your KingsChat ID')
      return
    }

    if (!user?.uid) {
      setError('You must be logged in to add KingsChat ID')
      return
    }

    setIsSubmitting(true)

    try {
      // Check if this KingsChat ID is already used by another account
      const existingUser = await FirebaseDatabaseService.findUserByKingsChatId(kingschatId.trim())
      
      if (existingUser && existingUser.id !== user.uid) {
        setError('This KingsChat ID is already linked to another account. Please use a different ID.')
        setIsSubmitting(false)
        return
      }

      // Update user profile with KingsChat ID
      await FirebaseDatabaseService.updateDocument('profiles', user.uid, {
        kingschat_id: kingschatId.trim(),
        updated_at: new Date().toISOString()
      })

      setSuccess(true)
      await refreshProfile()

      // Redirect to profile after 2 seconds
      setTimeout(() => {
        router.push('/pages/profile')
      }, 2000)

    } catch (error: any) {
      console.error('Error adding KingsChat ID:', error)
      // User-friendly error message - no technical details
      setError('Unable to add KingsChat ID at this time. Please check your internet connection and try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Check if user already has KingsChat ID
  const hasKingsChatId = (profile as any)?.kingschat_id

  if (hasKingsChatId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Already Set Up!</h2>
          <p className="text-gray-600 mb-6">
            Your KingsChat ID is already linked to your account.
          </p>
          <button
            onClick={() => router.push('/pages/profile')}
            className="w-full py-3 bg-purple-600 text-white font-semibold rounded-xl hover:bg-purple-700 transition-colors"
          >
            Go to Profile
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-bold text-gray-900">Add KingsChat ID</h1>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-md mx-auto p-6">
        {success ? (
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Success!</h2>
            <p className="text-gray-600 mb-4">
              Your KingsChat ID has been added to your account.
            </p>
            <p className="text-sm text-gray-500">
              Redirecting to your profile...
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-xl p-6">
            {/* Info Section */}
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-4">
                <img 
                  src="/kingschat.jpeg" 
                  alt="KingsChat" 
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Link Your KingsChat</h2>
                  <p className="text-sm text-gray-600">One-time setup</p>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <p className="text-sm text-blue-900 font-medium mb-2">Why add your KingsChat ID?</p>
                <ul className="text-xs text-blue-800 space-y-1">
                  <li>✓ Sign in faster with KingsChat</li>
                  <li>✓ Access group features</li>
                  <li>✓ Connect with other members</li>
                </ul>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-xs text-yellow-900">
                  <strong>Note:</strong> This is for existing users who created accounts before KingsChat integration. 
                  New users automatically get this during signup.
                </p>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Your KingsChat ID
                </label>
                <input
                  type="text"
                  value={kingschatId}
                  onChange={(e) => setKingschatId(e.target.value)}
                  placeholder="Enter your KingsChat ID"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-purple-600"
                  disabled={isSubmitting}
                />
                <p className="text-xs text-gray-500 mt-2">
                  You can find your KingsChat ID in your KingsChat profile settings
                </p>
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting || !kingschatId.trim()}
                className="w-full py-3 bg-purple-600 text-white font-semibold rounded-xl hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Adding KingsChat ID...
                  </>
                ) : (
                  'Add KingsChat ID'
                )}
              </button>
            </form>

            {/* Help Text */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-xs text-gray-600 text-center">
                Don't have a KingsChat account?{' '}
                <a 
                  href="https://kingsch.at" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-purple-600 font-semibold hover:underline"
                >
                  Get KingsChat
                </a>
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
