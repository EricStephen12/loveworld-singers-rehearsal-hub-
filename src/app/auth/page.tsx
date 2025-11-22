'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Loader2, CheckCircle } from 'lucide-react'
import { FirebaseAuthService } from '@/lib/firebase-auth'
import { FirebaseDatabaseService } from '@/lib/firebase-database'
import { KingsChatAuthService } from '@/lib/kingschat-auth'
import { AccountLinkingService } from '@/lib/account-linking'
import AuthCheck from '@/components/AuthCheck'
import KingsChatOAuthModal from '@/components/KingsChatOAuthModal'
import KingsChatLinkingModal from '@/components/KingsChatLinkingModal'
import KingsChatMigrationModal from '@/components/KingsChatMigrationModal'
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
  const [showKingsChatModal, setShowKingsChatModal] = useState(false)
  const [showKingsChatLinkingModal, setShowKingsChatLinkingModal] = useState(false)
  const [kingschatLinkingData, setKingschatLinkingData] = useState<{id: string, userData: any} | null>(null)
  const [showKingsChatMigrationModal, setShowKingsChatMigrationModal] = useState(false)
  const [kingschatMigrationData, setKingschatMigrationData] = useState<{id: string, userData: any, tempAccount: any} | null>(null)
  const [useRedirectAuth, setUseRedirectAuth] = useState(false)
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    kingschatId: ''
  })

  // NO AUTH CHECK - Let AuthContext handle redirects
  // This prevents loops completely

  // Check for URL error parameters and start auth monitoring on mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const urlError = urlParams.get('error')
    const urlMessage = urlParams.get('message')
    const convertFlag = urlParams.get('convert')
    const signupFlag = urlParams.get('signup')
    const kingschatIdParam = urlParams.get('kingschatId')

    if (urlError && urlMessage) {
      setError(urlMessage)
      // Clear URL parameters
      window.history.replaceState({}, document.title, window.location.pathname)
    }

    // Handle temp account conversion
    if (convertFlag === 'temp' && kingschatIdParam) {
      setIsLogin(false) // Switch to signup mode
      setSuccess('Please create your full account with a real email address')
      
      // Pre-fill KingsChat ID
      setFormData(prev => ({
        ...prev,
        kingschatId: kingschatIdParam
      }))
      
      // Try to get stored user data
      const storedUserData = localStorage.getItem('kingschatUserData')
      if (storedUserData) {
        try {
          const userData = JSON.parse(storedUserData)
          setFormData(prev => ({
            ...prev,
            firstName: userData.firstName || '',
            lastName: userData.lastName || '',
            email: userData.email || ''
          }))
        } catch (e) {
          console.warn('Failed to parse stored user data')
        }
      }
    }

    // Handle new user signup from KingsChat
    if (signupFlag === 'kingschat' && kingschatIdParam) {
      setIsLogin(false) // Switch to signup mode
      setSuccess('Please complete your account creation')
      
      // Pre-fill KingsChat ID
      setFormData(prev => ({
        ...prev,
        kingschatId: kingschatIdParam
      }))
      
      // Try to get stored user data
      const storedUserData = localStorage.getItem('kingschatUserData')
      if (storedUserData) {
        try {
          const userData = JSON.parse(storedUserData)
          setFormData(prev => ({
            ...prev,
            firstName: userData.firstName || '',
            lastName: userData.lastName || '',
            email: userData.email || ''
          }))
        } catch (e) {
          console.warn('Failed to parse stored user data')
        }
      }
    }

    // Check if user just returned from KingsChat auth
    checkForCompletedAuth()
    
    // Start continuous monitoring for auth completion
    startAuthMonitoring()
  }, [])

  const startAuthMonitoring = () => {
    // Check every 3 seconds for completed auth
    const authCheckInterval = setInterval(async () => {
      const returnData = localStorage.getItem('kingschat_auth_return')
      if (!returnData) return

      try {
        const { sessionId, timestamp } = JSON.parse(returnData)
        
        // Stop checking after 10 minutes
        if (Date.now() - timestamp > 600000) {
          localStorage.removeItem('kingschat_auth_return')
          clearInterval(authCheckInterval)
          return
        }

        // Check Firebase for auth result
        const result = await FirebaseDatabaseService.getDocument('kingschat_auth_sessions', sessionId) as any
        
        if (result && result.processed) {
          clearInterval(authCheckInterval)
          await processCompletedAuth(result, sessionId)
        }
      } catch (error) {
        console.error('Auth monitoring error:', error)
      }
    }, 3000)

    // Cleanup interval after 10 minutes
    setTimeout(() => {
      clearInterval(authCheckInterval)
    }, 600000)
  }

  const checkForCompletedAuth = async () => {
    try {
      const returnData = localStorage.getItem('kingschat_auth_return')
      if (!returnData) return

      const { sessionId, timestamp } = JSON.parse(returnData)
      
      // Check if auth was completed (within last 10 minutes)
      if (Date.now() - timestamp > 600000) {
        localStorage.removeItem('kingschat_auth_return')
        return
      }

      // Check Firebase for auth result
      const result = await FirebaseDatabaseService.getDocument('kingschat_auth_sessions', sessionId) as any
      
      if (result && result.processed) {
        await processCompletedAuth(result, sessionId)
      }
    } catch (error) {
      console.error('Error checking completed auth:', error)
    }
  }

  const processCompletedAuth = async (result: any, sessionId: string) => {
    try {
      if (result.success) {
        // Authentication was successful!
        console.log('✅ Found completed KingsChat authentication')
        
        setSuccess('KingsChat authentication successful! Checking your account...')
        
        // Process the auth data
        if (result.authData && result.authData.userProfile) {
          const userProfile = result.authData.userProfile
          const kingschatUserId = userProfile.userId || userProfile.id || result.kingschatUserId
          
          console.log('🔐 Processing KingsChat User ID:', kingschatUserId)
          
          if (!kingschatUserId) {
            setError('Could not extract KingsChat ID from authentication data')
            return
          }
          
          // Search for existing user with this KingsChat ID (enhanced search)
          const existingUser = await FirebaseDatabaseService.findUserByKingsChatId(kingschatUserId)
          
          if (existingUser) {
            // Found existing account
            console.log('✅ Found existing account:', existingUser.email, 'Type:', existingUser.accountType)
            
            if (existingUser.accountType === 'temp') {
              setSuccess('Found your temp account! Converting to full account...')
              
              // Redirect to signup form to convert temp account to real account
              if (typeof window !== 'undefined') {
                localStorage.setItem('convertTempAccount', 'true')
                localStorage.setItem('tempAccountData', JSON.stringify(existingUser))
                localStorage.setItem('kingschatUserId', kingschatUserId)
                localStorage.setItem('kingschatUserData', JSON.stringify(userProfile))
              }
              
              // Cleanup
              localStorage.removeItem('kingschat_auth_return')
              await FirebaseDatabaseService.deleteDocument('kingschat_auth_sessions', sessionId)
              
              setTimeout(() => {
                // Redirect to signup form with conversion flag
                router.push(`/auth?convert=temp&kingschatId=${kingschatUserId}`)
              }, 1500)
              
            } else {
              // Real account - sign them in
              setSuccess('Welcome back! Signing you in...')
              
              try {
                let signInEmail = existingUser.email
                let signInPassword = existingUser.password || kingschatUserId
                
                // Handle temp email accounts (legacy)
                if (signInEmail.includes('@kingschat.temp')) {
                  signInPassword = kingschatUserId
                }
                
                const signInResult = await FirebaseAuthService.signInWithEmailAndPassword(
                  signInEmail,
                  signInPassword
                )
                
                if (signInResult.error) {
                  // Try alternative sign-in
                  const fallbackSignIn = await FirebaseAuthService.signInWithEmailAndPassword(
                    signInEmail,
                    kingschatUserId
                  )
                  
                  if (fallbackSignIn.error) {
                    console.error('❌ Sign-in failed:', fallbackSignIn.error)
                    setError('Found your account but could not sign you in. Please try regular login.')
                    return
                  }
                }
                
                console.log('✅ Successfully signed in existing user')
                
                // Set authentication flags
                if (typeof window !== 'undefined') {
                  localStorage.setItem('userAuthenticated', 'true')
                  localStorage.setItem('hasCompletedProfile', 'true')
                  localStorage.setItem('authProvider', 'kingschat')
                  localStorage.setItem('bypassLogin', 'true')
                }
                
                // Cleanup
                localStorage.removeItem('kingschat_auth_return')
                await FirebaseDatabaseService.deleteDocument('kingschat_auth_sessions', sessionId)
                
                setTimeout(() => {
                  router.push('/home')
                }, 1500)
                
              } catch (signInError) {
                console.error('❌ Sign-in error:', signInError)
                setError('Could not sign you in. Please try regular login.')
              }
            }
          } else {
            // New user - redirect to signup form
            console.log('🆕 No existing account found - new user signup')
            setSuccess('New user detected! Redirecting to signup...')
            
            // Store KingsChat data for signup form
            if (typeof window !== 'undefined') {
              localStorage.setItem('kingschatProfileSetup', 'true')
              localStorage.setItem('kingschatUserId', kingschatUserId)
              localStorage.setItem('kingschatUserData', JSON.stringify(userProfile))
            }
            
            // Cleanup
            localStorage.removeItem('kingschat_auth_return')
            await FirebaseDatabaseService.deleteDocument('kingschat_auth_sessions', sessionId)
            
            setTimeout(() => {
              // Redirect to signup form with KingsChat data
              router.push(`/auth?signup=kingschat&kingschatId=${kingschatUserId}`)
            }, 1500)
          }
        }
      } else {
        // Authentication failed
        setError(result.message || 'KingsChat authentication failed')
        localStorage.removeItem('kingschat_auth_return')
        await FirebaseDatabaseService.deleteDocument('kingschat_auth_sessions', sessionId)
      }
    } catch (error) {
      console.error('Error processing completed auth:', error)
      setError('Failed to process authentication result')
    }
  }


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

        // Check if this is a temp account conversion
        const isConvertingTempAccount = localStorage.getItem('convertTempAccount') === 'true'
        const tempAccountData = localStorage.getItem('tempAccountData')
        
        if (isConvertingTempAccount && tempAccountData) {
          setSuccess('Converting your temp account to full account...')
          
          try {
            const tempAccount = JSON.parse(tempAccountData)
            
            // Create new account with real email
            const result = await FirebaseAuthService.createUserWithEmailAndPassword(
              formData.email,
              formData.password,
              {
                // Preserve any other data from temp account (excluding fields we want to override)
                ...Object.fromEntries(
                  Object.entries(tempAccount).filter(([key]) => 
                    !['email', 'first_name', 'last_name', 'accountType'].includes(key)
                  )
                ),
                // Override with new data
                first_name: formData.firstName,
                last_name: formData.lastName,
                email: formData.email,
                kingschat_id: formData.kingschatId,
                accountType: 'real'
              }
            )
            
            if (result.error) {
              setError(result.error)
              setIsLoading(false)
              setIsCheckingAccount(false)
              return
            }
            
            // TODO: Delete the old temp account if needed
            // This would require admin privileges or a cloud function
            
            setSuccess('Account converted successfully! Welcome!')
            
            // Cleanup conversion flags
            localStorage.removeItem('convertTempAccount')
            localStorage.removeItem('tempAccountData')
            localStorage.removeItem('kingschatUserId')
            localStorage.removeItem('kingschatUserData')
            
          } catch (conversionError) {
            console.error('Temp account conversion error:', conversionError)
            setError('Failed to convert temp account. Please try again.')
            setIsLoading(false)
            setIsCheckingAccount(false)
            return
          }
        } else {
          // Regular signup
          setSuccess('Creating your account...')
          
          // Validate KingsChat ID if provided
          if (formData.kingschatId) {
            console.log('🔍 Checking if KingsChat ID is already in use...')
            const existingUser = await FirebaseDatabaseService.findUserByKingsChatId(formData.kingschatId)
            
            if (existingUser) {
              setError('This KingsChat ID is already linked to another account. Please use a different ID or sign in to your existing account.')
              setIsLoading(false)
              setIsCheckingAccount(false)
              return
            }
          }
          
          // Sign up with Firebase and create profile in one step
          const result = await FirebaseAuthService.createUserWithEmailAndPassword(
            formData.email,
            formData.password,
            {
              first_name: formData.firstName,
              last_name: formData.lastName,
              email: formData.email,
              kingschat_id: formData.kingschatId || undefined,
              accountType: 'real'
            }
          )
          
          if (result.error) {
            setError(result.error)
            setIsLoading(false)
            setIsCheckingAccount(false)
            return
          }

          setSuccess('Account created! Setting up your profile...')
        }
        
        setSuccess('Account created successfully! Redirecting...')
        
        // Set auth flags immediately for AuthGuard
        if (typeof window !== 'undefined') {
          localStorage.setItem('userAuthenticated', 'true')
          localStorage.setItem('lastAuthTime', Date.now().toString())
          localStorage.setItem('bypassLogin', 'true')
          localStorage.setItem('hasCompletedProfile', 'true') // Profile is complete with basic info
          localStorage.setItem('authProvider', formData.kingschatId ? 'kingschat' : 'email')
        }
        
        // Cleanup any KingsChat signup data
        localStorage.removeItem('kingschatProfileSetup')
        localStorage.removeItem('kingschatUserId')
        localStorage.removeItem('kingschatUserData')
        
        // Go directly to home - no profile completion needed
        console.log('✅ Account created, redirecting to home...')
        console.log('👤 User created successfully')
        setTimeout(() => {
          console.log('🔄 Redirecting to /home')
          router.push('/home')
        }, 1500)
      } else {
        setSuccess('Checking your account...')
        
        // Check if it's special login (The President) - MUST be first!
        if (formData.email === 'The President' && formData.password === 'KING_PRIEST') {
          // Special login for president - bypass all validation
          setSuccess('Welcome, President! Redirecting...')
          
          // Set auth flags for special user
          if (typeof window !== 'undefined') {
            localStorage.setItem('userAuthenticated', 'true')
            localStorage.setItem('lastAuthTime', Date.now().toString())
            localStorage.setItem('hasCompletedProfile', 'true')
            localStorage.setItem('bypassLogin', 'true')
            localStorage.setItem('specialUser', 'true')
            localStorage.setItem('userRole', 'President')
            localStorage.setItem('userName', 'The President')
          }
          
          setTimeout(() => {
            router.push('/home')
          }, 1000)
          return
        }
        
        // Regular Firebase login (only if not special login)
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

        // Set auth flags immediately for AuthGuard
        if (typeof window !== 'undefined') {
          localStorage.setItem('userAuthenticated', 'true')
          localStorage.setItem('lastAuthTime', Date.now().toString())
          localStorage.setItem('hasCompletedProfile', 'true')
          localStorage.setItem('bypassLogin', 'true')
        }

        // Instant redirect without reload
        setTimeout(() => {
        router.replace('/home')
        }, 1000)
      }
    } catch (error: any) {
      console.error('Auth error:', error)
      // User-friendly error message - no technical details
      setError('Unable to complete authentication. Please check your internet connection and try again.')
      setIsLoading(false)
      setIsCheckingAccount(false)
    } finally {
      if (isLogin) {
      setIsLoading(false)
        setIsCheckingAccount(false)
      }
    }
  }

  const handleKingsChatConnect = (e: React.MouseEvent) => {
    // Prevent form submission
    e.preventDefault()
    e.stopPropagation()
    
    setError('')
    setSuccess('')
    setShowKingsChatModal(true)
  }

  const handleKingsChatModalSuccess = (authData: any) => {
    console.log('✅ KingsChat OAuth success:', authData)
    
    const userProfile = authData.userProfile
    
    if (userProfile && userProfile.userId) {
      // Update form data with KingsChat ID
      setFormData(prev => ({
        ...prev,
        kingschatId: userProfile.userId,
        // Auto-fill name and email if available and form fields are empty
        firstName: prev.firstName || userProfile.firstName || '',
        lastName: prev.lastName || userProfile.lastName || '',
        email: prev.email || userProfile.email || ''
      }))
      
      setSuccess('KingsChat account connected! It will be linked to your new account.')
    } else {
      setError('Could not retrieve KingsChat user information')
    }
  }

  const handleKingsChatModalError = (error: string) => {
    console.error('❌ KingsChat OAuth error:', error)
    setError(`KingsChat authentication failed: ${error}`)
  }

  const handleKingsChatLinkingSuccess = () => {
    console.log('✅ KingsChat ID linked successfully')
    setSuccess('KingsChat account linked! You can now use KingsChat to sign in.')
    setShowKingsChatLinkingModal(false)
    setKingschatLinkingData(null)
    
    // Optionally redirect to home or refresh the page
    setTimeout(() => {
      router.push('/home')
    }, 2000)
  }

  const handleCreateAccountFromLinking = () => {
    console.log('🆕 User chose to create new account from linking modal')
    
    // Switch to signup mode
    setIsLogin(false)
    setSuccess('Please complete your account creation')
    
    // Pre-fill the form with KingsChat data if available
    if (kingschatLinkingData) {
      const userData = kingschatLinkingData.userData
      setFormData(prev => ({
        ...prev,
        kingschatId: kingschatLinkingData.id,
        firstName: userData.firstName || '',
        lastName: userData.lastName || '',
        email: userData.email || ''
      }))
    }
    
    // Close modal and clear data
    setShowKingsChatLinkingModal(false)
    setKingschatLinkingData(null)
  }

  const handleMigrateTempAccount = (tempAccountData: any) => {
    console.log('🔄 Temp account migration triggered')
    
    // Store data for migration modal
    if (kingschatLinkingData) {
      setKingschatMigrationData({
        id: kingschatLinkingData.id,
        userData: kingschatLinkingData.userData,
        tempAccount: tempAccountData
      })
    }
    
    // Close linking modal and show migration modal
    setShowKingsChatLinkingModal(false)
    setKingschatLinkingData(null)
    setShowKingsChatMigrationModal(true)
  }

  const handleMigrationSuccess = () => {
    console.log('✅ Account migration completed successfully')
    setSuccess('Account upgraded successfully! Welcome to your new account!')
    setShowKingsChatMigrationModal(false)
    setKingschatMigrationData(null)
    
    // Redirect to home
    setTimeout(() => {
      router.push('/home')
    }, 2000)
  }

  const handleSocialLogin = (provider: string, e?: React.MouseEvent) => {
    // Prevent form submission
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }
    
    setError('')
    setSuccess('')
    
    if (provider === 'kingschat') {
      setShowKingsChatModal(true)
    }
  }

  const handleKingsChatLoginSuccess = async (authData: any) => {
    setIsLoading(true)
    setIsCheckingAccount(true)
    
    try {
      setSuccess('KingsChat authentication successful! Checking your account...')
      
      const userProfile = authData.userProfile
      const kingschatUserId = userProfile.userId || userProfile.id || authData.kingschatUserId
      
      if (!kingschatUserId) {
        setError('Could not extract user ID from KingsChat profile')
        setIsLoading(false)
        setIsCheckingAccount(false)
        return
      }
      
      console.log('🔐 KingsChat User ID:', kingschatUserId)
      
      // Search for existing user with this KingsChat ID (enhanced search)
      console.log('🔍 Searching for existing account with KingsChat ID:', kingschatUserId)
      
      const existingUser = await FirebaseDatabaseService.findUserByKingsChatId(kingschatUserId)
      
      if (existingUser) {
        // Found existing account
        console.log('✅ Found existing account:', existingUser.email, 'Type:', existingUser.accountType)
        
        // Check if it's a temp account that needs upgrading
        const isTempAccount = (
          existingUser.accountType === 'temp' || 
          existingUser.email?.includes('@kingschat.temp')
        )
        
        // Check if it's a real account (has real email and not temp)
        const isRealAccount = (
          existingUser.accountType === 'real' ||
          (existingUser.email && !existingUser.email.includes('@kingschat.temp'))
        )
        
        if (isTempAccount && !isRealAccount) {
          // Temp account found - show migration modal
          setSuccess('Found your account! Let\'s upgrade it with a real email address...')
          
          // Store data for migration modal
          setKingschatMigrationData({
            id: kingschatUserId,
            userData: userProfile,
            tempAccount: existingUser
          })
          
          setTimeout(() => {
            // Show migration modal
            setShowKingsChatMigrationModal(true)
            setSuccess('')
          }, 1500)
          
        } else {
          // Real account - sign them in
          setSuccess('Welcome back! Signing you in...')
          
          try {
            let signInEmail = existingUser.email
            let signInPassword = existingUser.password || kingschatUserId
            
            // Handle temp email accounts (legacy)
            if (signInEmail.includes('@kingschat.temp')) {
              console.log('📧 Legacy temp email account detected, using KingsChat ID as password')
              signInPassword = kingschatUserId
            }
            
            // Sign in with Firebase
            const signInResult = await FirebaseAuthService.signInWithEmailAndPassword(
              signInEmail,
              signInPassword
            )
            
            if (signInResult.error) {
              console.log('⚠️ First sign-in attempt failed, trying alternative method')
              
              // Try alternative sign-in methods
              const fallbackSignIn = await FirebaseAuthService.signInWithEmailAndPassword(
                signInEmail,
                kingschatUserId // Use KingsChat ID as password
              )
              
              if (fallbackSignIn.error) {
                console.error('❌ All sign-in methods failed:', fallbackSignIn.error)
                setError('Found your account but could not sign you in. Please try regular email/password login.')
                setIsLoading(false)
                setIsCheckingAccount(false)
                return
              }
            }
            
            console.log('✅ Successfully signed in existing user')
            
            // Set authentication flags
            if (typeof window !== 'undefined') {
              localStorage.setItem('userAuthenticated', 'true')
              localStorage.setItem('hasCompletedProfile', 'true')
              localStorage.setItem('authProvider', 'kingschat')
              localStorage.setItem('bypassLogin', 'true')
            }
            
            setSuccess('Welcome back! Redirecting to home...')
            
            setTimeout(() => {
              router.push('/home')
            }, 1500)
          } catch (signInError) {
            console.error('❌ Sign-in error:', signInError)
            setError('Could not sign you in. Please try regular login.')
          }
        }
        
      } else {
        // No existing account found - could be new user OR existing user without KingsChat ID
        console.log('🆕 No existing account found with KingsChat ID')
        
        setSuccess('No KingsChat account found. Checking options...')
        
        // Store KingsChat data for linking or signup
        setKingschatLinkingData({
          id: kingschatUserId,
          userData: userProfile
        })
        
        setTimeout(() => {
          // Show linking modal to let user choose: link existing account or create new
          setShowKingsChatLinkingModal(true)
          setSuccess('')
        }, 1500)
      }
      
    } catch (error: any) {
      console.error('❌ KingsChat authentication error:', error)
      setError('Unable to process KingsChat authentication. Please check your connection and try again.')
    } finally {
      setIsLoading(false)
      setIsCheckingAccount(false)
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
      if (!forgotPasswordEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(forgotPasswordEmail)) {
        setError('Please enter a valid email address')
        return
      }
      const res = await FirebaseAuthService.resetPassword(forgotPasswordEmail)
      if (res.error) {
        if (res.error.includes('user-not-found')) {
          setError('No account found with that email')
        } else if (res.error.includes('invalid-email')) {
          setError('Invalid email address')
        } else {
          setError(res.error)
        }
        return
      }
      setForgotPasswordSuccess(true)
    } catch (error: any) {
      console.error('Forgot password error:', error)
      // User-friendly error message
      setError('Unable to send password reset email. Please check your internet connection and try again.')
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

          <form onSubmit={handleSubmit} className="space-y-6" noValidate>
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
                  
                  {/* KingsChat Account Field with Connect Button */}
                  <div className="relative">
                    {formData.kingschatId ? (
                      // Connected state - show green success box with unlink option
                      <div className="w-full px-4 py-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3">
                        <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-green-800">KingsChat Connected</p>
                          <p className="text-xs text-green-600">Your account will be linked</p>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            setFormData(prev => ({ ...prev, kingschatId: '' }))
                            setSuccess('')
                          }}
                          className="px-3 py-1 bg-red-600 text-white text-xs font-medium rounded-lg hover:bg-red-700 transition-colors"
                        >
                          Unlink
                        </button>
                      </div>
                    ) : (
                      // Not connected state - show connect input
                      <div className="relative">
                        <input
                          type="text"
                          name="kingschatId"
                          placeholder="KingsChat Account (Optional)"
                          value=""
                          readOnly
                          className="w-full px-4 py-4 bg-gray-100 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-purple-600 text-sm pr-20"
                        />
                        <button
                          type="button"
                          onClick={handleKingsChatConnect}
                          className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-2 bg-purple-600 text-white text-xs font-medium rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-1"
                        >
                          <img 
                            src="/kingschat.jpeg" 
                            alt="KingsChat" 
                            className="w-3 h-3 rounded-full object-cover"
                          />
                          Connect
                        </button>
                      </div>
                    )}
                  </div>
                </>
              )}
              
              <input
                type="text"
                name="email"
                placeholder="Email or Username"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-4 py-4 bg-gray-100 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-purple-600 text-sm"
                required
                pattern=".*"
                title="Enter your email or username"
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

          {/* Divider - Only show for Login */}
          {isLogin && (
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or continue with</span>
              </div>
            </div>
          )}

          {/* Social Login Buttons - Only show for Login */}
          {isLogin && (
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
                {isLoading && isCheckingAccount ? 'Connecting...' : 'Continue with KingsChat'}
              </button>
            </div>
          )}

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

      {/* KingsChat OAuth Modal */}
      <KingsChatOAuthModal
        isOpen={showKingsChatModal}
        onClose={() => setShowKingsChatModal(false)}
        onSuccess={isLogin ? handleKingsChatLoginSuccess : handleKingsChatModalSuccess}
        onError={isLogin ? (error) => setError(error) : handleKingsChatModalError}
      />

      {/* KingsChat Account Linking Modal */}
      {kingschatLinkingData && (
        <KingsChatLinkingModal
          isOpen={showKingsChatLinkingModal}
          onClose={() => {
            setShowKingsChatLinkingModal(false)
            setKingschatLinkingData(null)
          }}
          onSuccess={handleKingsChatLinkingSuccess}
          onCreateAccount={handleCreateAccountFromLinking}
          onMigrateTempAccount={handleMigrateTempAccount}
          kingschatId={kingschatLinkingData.id}
          kingschatUserData={kingschatLinkingData.userData}
        />
      )}

      {/* KingsChat Account Migration Modal */}
      {kingschatMigrationData && (
        <KingsChatMigrationModal
          isOpen={showKingsChatMigrationModal}
          onClose={() => {
            setShowKingsChatMigrationModal(false)
            setKingschatMigrationData(null)
          }}
          onSuccess={handleMigrationSuccess}
          kingschatId={kingschatMigrationData.id}
          kingschatUserData={kingschatMigrationData.userData}
          tempAccountData={kingschatMigrationData.tempAccount}
        />
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