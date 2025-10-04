'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import { FirebaseAuthService } from '@/lib/firebase-auth'
import { FirebaseDatabaseService } from '@/lib/firebase-database'
import AuthCheck from '@/components/AuthCheck'
// Removed Supabase import - using Firebase now

function AuthPageContent() {
  const router = useRouter()
  const [isLogin, setIsLogin] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [isCheckingAccount, setIsCheckingAccount] = useState(false)
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('')
  const [forgotPasswordSuccess, setForgotPasswordSuccess] = useState(false)
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  })

  // NO AUTH CHECK - Let AuthContext handle redirects
  // This prevents loops completely

  // Check for URL error parameters on mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const urlError = urlParams.get('error')
    const urlMessage = urlParams.get('message')

    if (urlError && urlMessage) {
      setError(urlMessage)
      // Clear URL parameters
      window.history.replaceState({}, document.title, window.location.pathname)
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    e.stopPropagation()
    console.log('Form submitted, preventing default behavior')
    setError('')
    setSuccess('')
    setIsLoading(true)
    setIsCheckingAccount(true)
    
    try {
      if (!isLogin) {
        // Signup validation
        if (formData.password !== formData.confirmPassword) {
          setError('Passwords do not match')
          setIsLoading(false)
          setIsCheckingAccount(false)
          return
        }
        if (formData.password.length < 6) {
          setError('Password must be at least 6 characters')
          setIsLoading(false)
          setIsCheckingAccount(false)
          return
        }

        setSuccess('Creating your account...')
        
        // Sign up with Firebase
        const result = await FirebaseAuthService.createUserWithEmailAndPassword(
          formData.email,
          formData.password
        )
        
        if (result.error) {
          setError(result.error)
          setIsLoading(false)
          setIsCheckingAccount(false)
          return
        }

        setSuccess('Account created! Setting up your profile...')
        
        // Create user profile in Firebase
        await FirebaseDatabaseService.createDocument('profiles', result.user!.uid, {
          id: result.user!.uid,
          first_name: formData.firstName,
          last_name: formData.lastName,
          email: formData.email,
          profile_completed: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        
        setSuccess('Account created successfully! Redirecting...')
        
        // Always go directly to profile completion
        console.log('✅ Account created, redirecting to profile completion...')
        console.log('👤 User created with profile_completed: false')
        setTimeout(() => {
          console.log('🔄 Redirecting to /profile-completion')
        router.push('/profile-completion')
        }, 1500)
      } else {
        setSuccess('Checking your account...')
        
        // Sign in with Firebase
        const result = await FirebaseAuthService.signInWithEmailAndPassword(
          formData.email,
          formData.password
        )
        
        if (result.error) {
          if (result.error.includes('user-not-found')) {
            setError('Account not found. Please check your email or sign up for a new account.')
          } else if (result.error.includes('wrong-password')) {
            setError('Incorrect password. Please try again.')
          } else if (result.error.includes('invalid-email')) {
            setError('Invalid email address. Please check your email.')
          } else if (result.error.includes('too-many-requests')) {
            setError('Too many failed attempts. Please try again later.')
          } else {
            setError(result.error)
          }
          setIsLoading(false)
          setIsCheckingAccount(false)
          return
        }
        
        setSuccess('Login successful! Welcome back!')
        console.log('Sign in successful:', result)

        // Instant redirect without reload
        setTimeout(() => {
        router.replace('/home')
        }, 1000)
      }
    } catch (error: any) {
      console.error('Auth error:', error)
      setError(error.message || 'An error occurred during authentication')
      setIsLoading(false)
      setIsCheckingAccount(false)
    } finally {
      if (isLogin) {
      setIsLoading(false)
        setIsCheckingAccount(false)
      }
    }
  }

  const handleSocialLogin = async (provider: string, e?: React.MouseEvent) => {
    // Prevent form submission
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }
    
    setError('')
    setSuccess('')
    setIsLoading(true)
    setIsCheckingAccount(true)
    
    try {
    if (provider === 'kingschat') {
      // KingsChat integration - placeholder for future implementation
      setError('KingsChat integration coming soon!')
        setIsLoading(false)
        setIsCheckingAccount(false)
      return
      }
    } catch (error: any) {
      console.error('Social login error:', error)
      setError(error.message || 'An error occurred during social login')
      setIsLoading(false)
      setIsCheckingAccount(false)
    } finally {
      if (provider === 'google') {
        setIsLoading(false)
        setIsCheckingAccount(false)
      }
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)
    
    try {
      await FirebaseAuthService.resetPassword(forgotPasswordEmail)
      setForgotPasswordSuccess(true)
    } catch (error: any) {
      console.error('Forgot password error:', error)
      setError(error.message || 'Failed to send reset email')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-white overflow-y-auto">
      {/* Dark Header Section */}
      <div className="bg-gray-900 px-8 py-12 relative overflow-hidden">
        {/* Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900"></div>
        
        {/* Background Pattern Overlay */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-10 left-10 w-32 h-32 bg-gray-600 rounded-full blur-3xl"></div>
          <div className="absolute top-20 right-20 w-24 h-24 bg-gray-500 rounded-full blur-2xl"></div>
          <div className="absolute bottom-10 left-1/3 w-28 h-28 bg-gray-400 rounded-full blur-2xl"></div>
        </div>
        
        {/* Header Content */}
        <div className="relative z-10 text-center pt-8">
          <h1 className="text-2xl font-bold text-white mb-2">
            Join LoveWorld Singers
          </h1>
          <h1 className="text-2xl font-bold text-white mb-4">
            Rehearsal Hub
          </h1>
          <p className="text-gray-300 text-sm">
            Connect with fellow singers and access rehearsal resources
          </p>
        </div>
      </div>

      {/* White Form Section */}
      <div className="bg-white rounded-t-3xl -mt-8 relative z-20 px-8 py-8 min-h-[70vh]">
        {/* App Branding */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-6">
            <img 
              src="/logo.png" 
              alt="Loveworld Singers Rehearsal Hub" 
              className="object-contain"
              style={{ width: '60px', height: '60px' }}
            />
          </div>
        </div>

        {/* Auth Form */}
        <div className="max-w-md mx-auto w-full">
          {/* Success Message */}
          {success && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-xl">
              <p className="text-green-600 text-sm">{success}</p>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              {!isLogin && (
                <>
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
                </>
              )}
              
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-4 py-4 bg-gray-100 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-purple-600 text-sm"
                required
              />
              
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full px-4 py-4 bg-gray-100 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-purple-600 text-sm pr-12"
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

              {/* Forgot Password Link - Only show for login */}
              {isLogin && (
                <div className="text-right">
                  <button
                    type="button"
                    onClick={() => setShowForgotPassword(true)}
                    className="text-purple-600 text-sm font-medium hover:text-purple-700 transition-colors"
                  >
                    Forgot Password?
                  </button>
                </div>
              )}

              {!isLogin && (
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    placeholder="Confirm Password"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="w-full px-4 py-4 bg-gray-100 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-purple-600 text-sm pr-12"
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
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 bg-purple-600 text-white font-semibold rounded-xl transition-colors duration-200 shadow-lg hover:shadow-xl touch-target hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              {isLoading && isLogin ? 'Signing In...' : isLoading && !isLogin ? 'Creating Account...' : isLogin ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or continue with</span>
            </div>
          </div>

          {/* Social Login Buttons */}
          <div className="space-y-3">
            <button
              type="button"
              onClick={(e) => handleSocialLogin('kingschat', e)}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-3 py-3 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading && isCheckingAccount ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
              <img 
                src="/kingschat.jpeg" 
                alt="KingsChat" 
                className="w-5 h-5 rounded-full object-cover"
              />
              )}
              {isLoading && isCheckingAccount ? 'Connecting...' : isLogin ? 'Continue with KingsChat' : 'Sign up with KingsChat'}
            </button>
          </div>

          {/* Toggle between Login and Signup */}
          <div className="mt-8 text-center">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-gray-600 text-sm focus:outline-none focus:ring-0 focus:border-0 border-0 outline-none"
            >
              {isLogin ? "Don't Have Account? " : "Already have an account? "}
              <span className="text-purple-600 font-semibold">
                {isLogin ? "Sign Up" : "Sign In"}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotPassword && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <div className="text-center mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-2">Reset Password</h2>
              <p className="text-gray-600 text-sm">
                Enter your email address and we'll send you a link to reset your password.
              </p>
            </div>

            {forgotPasswordSuccess ? (
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Email Sent!</h3>
                <p className="text-gray-600 text-sm mb-6">
                  We've sent a password reset link to <strong>{forgotPasswordEmail}</strong>
                </p>
                <button
                  onClick={() => {
                    setShowForgotPassword(false)
                    setForgotPasswordSuccess(false)
                    setForgotPasswordEmail('')
                  }}
                  className="w-full py-3 bg-purple-600 text-white font-semibold rounded-xl hover:bg-purple-700 transition-colors"
                >
                  Close
                </button>
              </div>
            ) : (
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <div>
                  <input
                    type="email"
                    placeholder="Enter your email"
                    value={forgotPasswordEmail}
                    onChange={(e) => setForgotPasswordEmail(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-purple-600 text-sm"
                    required
                  />
                </div>

                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-xl">
                    <p className="text-red-600 text-sm">{error}</p>
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowForgotPassword(false)
                      setForgotPasswordEmail('')
                      setError('')
                    }}
                    className="flex-1 py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 py-3 bg-purple-600 text-white font-semibold rounded-xl hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                    Send Reset Link
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default function AuthPage() {
  return (
    <AuthCheck>
      <AuthPageContent />
    </AuthCheck>
  )
}