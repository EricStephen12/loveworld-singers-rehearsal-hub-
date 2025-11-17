'use client'

import { useState } from 'react'
import { Music, Eye, EyeOff } from 'lucide-react'

interface AuthScreenProps {
  onComplete: (socialData?: {
    socialProvider: string
    socialId: string
    firstName: string
    lastName: string
    email: string
  }) => void







  
}

export default function AuthScreen({ onComplete }: AuthScreenProps) {
  const [isLogin, setIsLogin] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    // Personal Information
    firstName: '',
    middleName: '',
    lastName: '',
    gender: '',
    birthday: '',
    
    // Location Information
    region: '',
    zone: '',
    church: '',
    
    // Ministry Information
    designation: '',
    administration: '',
    
    // Contact Information
    email: '',
    phoneNumber: '',
    password: '',
    
    // Social Login
    socialProvider: '',
    socialId: ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!isLogin) {
      // Signup - pass the social data if available
      const socialData = formData.socialProvider && formData.socialId ? {
        socialProvider: formData.socialProvider,
        socialId: formData.socialId,
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email
      } : undefined
      
      onComplete(socialData)
    } else {
      // Login - just complete
      onComplete()
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const handleSocialSignup = async (provider: 'google' | 'kingschat', e?: React.MouseEvent) => {
    // Prevent form submission
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }
    
    if (provider === 'google') {
      // Google integration - placeholder for future implementation
      alert('Google integration coming soon!')
      return
    }
    
    if (provider === 'kingschat') {
      try {
        // Import KingsChat service
        const { KingsChatAuthService } = await import('@/lib/kingschat-auth')
        
        // Initiate KingsChat OAuth flow
        const authTokens = await KingsChatAuthService.login()
        
        if (!authTokens) {
          alert('KingsChat login was cancelled or failed. Please try again.')
          return
        }
        
        // Get user profile from KingsChat
        const userProfile = await KingsChatAuthService.getUserProfile(authTokens.accessToken)
        
        if (userProfile && userProfile.userId) {
          // Update form data with KingsChat information
          setFormData(prev => ({
            ...prev,
            socialId: userProfile.userId,
            socialProvider: 'kingschat',
            // Auto-fill name and email if available and form fields are empty
            firstName: prev.firstName || userProfile.firstName || '',
            lastName: prev.lastName || userProfile.lastName || '',
            email: prev.email || userProfile.email || ''
          }))
          
          alert('KingsChat account connected! Your information has been added to the form.')
        } else {
          alert('Could not retrieve KingsChat user information')
        }
      } catch (error: any) {
        console.error('KingsChat connect error:', error)
        alert(error.message || 'An error occurred while connecting to KingsChat')
      }
    }
  }


  return (
    <div className="fixed inset-0 z-50 bg-white overflow-y-auto relative">
     

      {/* Main Content */}
      <div className="min-h-screen flex flex-col justify-center px-8 py-8 relative z-10">
        {/* App Branding */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <img 
              src="/logo.png" 
              alt="LoveWorld Praise Logo" 
              className="object-contain"
              style={{ width: '120px', height: '120px' }}
            />
          </div>
          
        </div>

        {/* Auth Form */}
        <div className="max-w-md mx-auto w-full">
          <form onSubmit={handleSubmit} className="space-y-6">
            {isLogin ? (
              // Login Form
              <>
                {/* Email field */}
                <div>
                  <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-4 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
                    required
                  />
                </div>

                {/* Password field */}
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    placeholder="Password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full px-4 py-4 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base pr-12"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>

              </>
            ) : (
              // Signup Form - Now includes KingsChat integration
              <div className="space-y-6">
                <div className="text-center mb-8">
                  <p className="text-gray-600 text-sm">Create your account</p>
                </div>

                {/* Name Fields */}
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    name="firstName"
                    placeholder="First Name"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-4 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
                    required
                  />
                  <input
                    type="text"
                    name="lastName"
                    placeholder="Last Name"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-4 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
                    required
                  />
                </div>

                {/* Email Field */}
                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-4 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
                  required
                />

                {/* KingsChat ID Field with Connect Button */}
                <div className="relative">
                  <input
                    type="text"
                    name="kingschatId"
                    placeholder="KingsChat ID (Optional)"
                    value={formData.socialId}
                    onChange={handleInputChange}
                    className="w-full px-4 py-4 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base pr-20"
                    readOnly={!!formData.socialId}
                  />
                  <button
                    type="button"
                    onClick={(e) => handleSocialSignup('kingschat', e)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-2 bg-purple-600 text-white text-xs font-medium rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-1"
                  >
                    <img 
                      src="/kingschat.jpeg" 
                      alt="KingsChat" 
                      className="w-3 h-3 rounded-full object-cover"
                    />
                    {formData.socialId ? 'Connected' : 'Connect'}
                  </button>
                </div>

                {/* Password Fields */}
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    placeholder="Password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full px-4 py-4 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base pr-12"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full py-4 bg-purple-600 text-white font-semibold rounded-xl transition-colors duration-200 shadow-lg hover:shadow-xl touch-target hover:bg-purple-700"
            >
              {isLogin ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          {/* Social Login Buttons for Login - Below Sign In Button */}
          {isLogin && (
            <div className="mt-8 space-y-3">
              <button className="w-full py-4 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 font-medium hover:bg-gray-100 transition-colors duration-200 flex items-center justify-center space-x-3 touch-target">
                <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center">
                  <span className="text-black font-bold text-sm">G</span>
                </div>
                <span>Continue with Google</span>
              </button>

              <button className="w-full py-4 bg-purple-600 text-white font-medium hover:bg-purple-700 transition-colors duration-200 flex items-center justify-center space-x-3 touch-target rounded-xl">
                <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center">
                  <span className="text-black font-bold text-sm">K</span>
                </div>
                <span>Login with KingsChat</span>
              </button>
            </div>
          )}

          {/* Toggle between Login/Signup */}
          <div className="mt-6 text-center">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-gray-600 hover:text-gray-800 transition-colors text-base"
            >
              {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
            </button>
                      </div>
          </div>
      </div>
    </div>
  )
}
