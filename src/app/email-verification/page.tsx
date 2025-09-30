'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Mail, CheckCircle, RefreshCw, ArrowRight } from 'lucide-react'

export default function EmailVerificationPage() {
  const router = useRouter()
  const [isVerified, setIsVerified] = useState(false)
  const [isChecking, setIsChecking] = useState(false)
  const [userEmail, setUserEmail] = useState('')

  useEffect(() => {
    // Get user email from signup data
    const signupData = localStorage.getItem('signupData')
    if (signupData) {
      try {
        const parsedData = JSON.parse(signupData)
        setUserEmail(parsedData.email || '')
      } catch (error) {
        console.error('Error parsing signup data:', error)
      }
    }
  }, [])

  const handleCheckVerification = async () => {
    setIsChecking(true)
    
    try {
      // Import supabase client
      const { supabase } = await import('@/lib/supabase-client')
      
      // Check if user is authenticated (email confirmed)
      const { data: { user }, error } = await supabase.auth.getUser()
      
      if (error) {
        console.error('Error checking verification:', error)
        setIsChecking(false)
        return
      }
      
      if (user && user.email_confirmed_at) {
        // Email is verified
        setIsVerified(true)
        console.log('✅ Email verified!')
        
        // Wait a moment then redirect to profile completion
        setTimeout(() => {
          router.push('/profile-completion')
        }, 2000)
      } else {
        console.log('⏳ Email not verified yet')
      }
    } catch (error) {
      console.error('Error checking verification:', error)
    } finally {
      setIsChecking(false)
    }
  }

  const handleResendEmail = async () => {
    try {
      const { supabase } = await import('@/lib/supabase-client')
      
      if (userEmail) {
        const { error } = await supabase.auth.resend({
          type: 'signup',
          email: userEmail
        })
        
        if (error) {
          console.error('Error resending email:', error)
          alert('Failed to resend verification email. Please try again.')
        } else {
          alert('Verification email sent! Please check your inbox.')
        }
      }
    } catch (error) {
      console.error('Error resending email:', error)
      alert('Failed to resend verification email. Please try again.')
    }
  }


  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-gray-100/50">
        <div className="flex items-center justify-between px-4 py-3">
          <button
            onClick={() => router.push('/auth')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <ArrowRight className="w-5 h-5 rotate-180" />
            <span className="text-sm font-medium">Back</span>
          </button>
          <h1 className="text-lg font-semibold text-gray-800">Email Verification</h1>
          <div className="w-16"></div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 py-8">
        <div className="max-w-md mx-auto">
          {!isVerified ? (
            <>
              {/* Email Icon */}
              <div className="flex justify-center mb-8">
                <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-purple-200 rounded-full flex items-center justify-center shadow-lg">
                  <Mail className="w-10 h-10 text-purple-600" />
                </div>
              </div>
              
              {/* Verification Message */}
              <div className="text-center mb-8">
                <h1 className="text-2xl font-bold text-gray-800 mb-2">
                  Check Your Email
                </h1>
                <p className="text-gray-600 text-sm leading-relaxed">
                  We've sent a verification link to
                </p>
                <p className="text-purple-600 font-semibold text-sm mt-1">
                  {userEmail}
                </p>
              </div>
              
              {/* Instructions */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
                <h3 className="text-sm font-semibold text-gray-800 mb-3">Next Steps:</h3>
                <ol className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start gap-2">
                    <span className="w-5 h-5 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0 mt-0.5">1</span>
                    <span>Check your email inbox (and spam folder)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-5 h-5 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0 mt-0.5">2</span>
                    <span>Click the verification link in the email</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-5 h-5 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0 mt-0.5">3</span>
                    <span>Return here and click "I've Verified My Email"</span>
                  </li>
                </ol>
              </div>
              
              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  onClick={handleCheckVerification}
                  disabled={isChecking}
                  className="w-full flex items-center justify-center gap-3 py-4 bg-purple-600 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
                >
                  {isChecking ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      Checking...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      I've Verified My Email
                    </>
                  )}
                </button>
                
                <button
                  onClick={handleResendEmail}
                  className="w-full py-3 text-purple-600 hover:text-purple-700 transition-colors text-sm font-medium border border-purple-200 rounded-xl hover:bg-purple-50"
                >
                  Resend Verification Email
                </button>
              </div>
            </>
          ) : (
            <>
              {/* Success Icon */}
              <div className="flex justify-center mb-8">
                <div className="w-20 h-20 bg-gradient-to-br from-green-100 to-green-200 rounded-full flex items-center justify-center shadow-lg animate-pulse">
                  <CheckCircle className="w-10 h-10 text-green-600" />
                </div>
              </div>
              
              {/* Success Message */}
              <div className="text-center mb-8">
                <h1 className="text-2xl font-bold text-gray-800 mb-2">
                  Email Verified!
                </h1>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Your account has been confirmed successfully.
                </p>
              </div>
              
              {/* Success Card */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                  <h3 className="text-sm font-semibold text-gray-800">Verification Complete</h3>
                </div>
                <p className="text-sm text-gray-600">
                  You'll be redirected to complete your profile in a moment.
                </p>
              </div>
              
              {/* Loading Animation */}
              <div className="flex items-center justify-center gap-2 text-purple-600">
                <RefreshCw className="w-5 h-5 animate-spin" />
                <span className="text-sm font-medium">Redirecting...</span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
