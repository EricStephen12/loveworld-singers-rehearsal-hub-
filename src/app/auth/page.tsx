'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Music, Eye, EyeOff } from 'lucide-react'

export default function AuthPage() {
  const router = useRouter()
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
    // Save authentication status and mark as fully authenticated
    localStorage.setItem('isAuthenticated', 'true')
    localStorage.setItem('hasCompletedProfile', 'true')
    localStorage.setItem('hasSubscribed', 'true')
    router.push('/success?action=login')
  }

  const handleSocialLogin = (provider: string) => {
    // Mock social login
    const socialData = {
      socialProvider: provider,
      socialId: provider === 'google' ? 'user@gmail.com' : 'user@kingschat.com',
      firstName: 'John',
      lastName: 'Doe',
      email: provider === 'google' ? 'user@gmail.com' : 'user@kingschat.com'
    }
    
    setFormData(prev => ({
      ...prev,
      ...socialData
    }))
    
    // Save authentication status
    localStorage.setItem('isAuthenticated', 'true')
    router.push('/profile-completion')
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
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
              alt="LoveWorld Praise Logo" 
              className="object-contain"
              style={{ width: '60px', height: '60px' }}
            />
          </div>
        </div>

        {/* Auth Form */}
        <div className="max-w-md mx-auto w-full">
          {isLogin ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
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
              </div>

              <button
                type="submit"
                className="w-full py-4 bg-purple-600 text-white font-semibold rounded-xl transition-colors duration-200 shadow-lg hover:shadow-xl touch-target hover:bg-purple-700"
              >
                Sign In
              </button>
            </form>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-600 text-sm mb-6">
                Choose your preferred sign-up method
              </p>
            </div>
          )}

          {/* Divider - Only show for login */}
          {isLogin && (
            <div className="mt-6 mb-4">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">Or continue with</span>
                </div>
              </div>
            </div>
          )}

          {/* Social Login Buttons */}
          <div className={`space-y-3 ${isLogin ? 'mt-6' : 'mt-0'}`}>
            <button
              onClick={() => handleSocialLogin('google')}
              className="w-full flex items-center justify-center gap-3 py-3 bg-white border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              {isLogin ? 'Continue with Google' : 'Sign up with Google'}
            </button>
            
            <button
              onClick={() => handleSocialLogin('kingschat')}
              className="w-full flex items-center justify-center gap-3 py-3 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-700 transition-colors"
            >
              <span className="w-5 h-5 bg-white rounded-full flex items-center justify-center">
                <span className="text-purple-600 font-bold text-sm">K</span>
              </span>
              {isLogin ? 'Continue with KingsChat' : 'Sign up with KingsChat'}
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
    </div>
  )
}
