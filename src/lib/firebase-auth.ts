// Firebase Authentication Service - Ultra Fast
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
  signInWithPopup,
  GoogleAuthProvider,
  deleteUser
} from 'firebase/auth'
import { auth, db } from './firebase-setup'
import { doc, getDoc, setDoc } from 'firebase/firestore'

export class FirebaseAuthService {
  // Sign in with email and password
  static async signIn(email: string, password: string) {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password)
      return { user: result.user, error: null }
    } catch (error: any) {
      return { user: null, error: error.message }
    }
  }

  // Sign up with email and password
  static async signUp(email: string, password: string, userData: any) {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password)
      
      // Create user profile in Firestore
      await setDoc(doc(db, 'profiles', result.user.uid), {
        ...userData,
        createdAt: new Date(),
        updatedAt: new Date()
      })
      
      return { user: result.user, error: null }
    } catch (error: any) {
      return { user: null, error: error.message }
    }
  }

  // Sign out
  static async signOut() {
    try {
      await signOut(auth)
      return { error: null }
    } catch (error: any) {
      return { error: error.message }
    }
  }

  // Get current user
  static getCurrentUser(): User | null {
    return auth.currentUser
  }

  // Listen to auth state changes
  static onAuthStateChange(callback: (user: User | null) => void) {
    return onAuthStateChanged(auth, callback)
  }

  // Get user profile
  static async getUserProfile(userId: string) {
    try {
      const docRef = doc(db, 'profiles', userId)
      const docSnap = await getDoc(docRef)
      
      if (docSnap.exists()) {
        return docSnap.data()
      } else {
        return null
      }
    } catch (error) {
      console.error('Error getting user profile:', error)
      return null
    }
  }

  // Test connection
  static async testConnection() {
    try {
      // Test if Firebase is initialized
      if (!auth) {
        return { status: 'error', message: 'Firebase Auth not initialized' }
      }
      
      // Test if we can access the auth object
      const currentUser = auth.currentUser
      return { 
        status: 'success', 
        message: 'Firebase Auth connected successfully',
        currentUser: currentUser ? 'User logged in' : 'No user logged in'
      }
    } catch (error: any) {
      return { status: 'error', message: error.message }
    }
  }

  // Create user with email and password (alias for signUp)
  static async createUserWithEmailAndPassword(email: string, password: string) {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password)
      
      // Create user profile in Firestore with profile_completed: false
      await setDoc(doc(db, 'profiles', result.user.uid), {
        id: result.user.uid,
        email: result.user.email,
        profile_completed: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      
      return { user: result.user, error: null }
    } catch (error: any) {
      return { user: null, error: error.message }
    }
  }

  // Sign in with email and password (alias for signIn)
  static async signInWithEmailAndPassword(email: string, password: string) {
    return this.signIn(email, password)
  }

  // Reset password
  static async resetPassword(email: string) {
    try {
      const { sendPasswordResetEmail } = await import('firebase/auth')
      await sendPasswordResetEmail(auth, email)
      return { error: null }
    } catch (error: any) {
      return { error: error.message }
    }
  }

  // Update password
  static async updatePassword(newPassword: string) {
    try {
      const { updatePassword } = await import('firebase/auth')
      const user = auth.currentUser
      if (!user) throw new Error('No user logged in')
      
      await updatePassword(user, newPassword)
      return { error: null }
    } catch (error: any) {
      return { error: error.message }
    }
  }

  // Sign in with Google
  static async signInWithGoogle() {
    try {
      const provider = new GoogleAuthProvider()
      const result = await signInWithPopup(auth, provider)
      
      // Check if user profile exists, if not create one
      const userProfile = await this.getUserProfile(result.user.uid)
      if (!userProfile) {
        const displayName = result.user.displayName || ''
        const nameParts = displayName.split(' ')
        await setDoc(doc(db, 'profiles', result.user.uid), {
          id: result.user.uid,
          first_name: nameParts[0] || '',
          last_name: nameParts.slice(1).join(' ') || '',
          email: result.user.email,
          profile_completed: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
      }
      
      return { user: result.user, error: null }
    } catch (error: any) {
      return { user: null, error: error.message }
    }
  }

  // Delete user account
  static async deleteUser() {
    try {
      const user = auth.currentUser
      if (!user) {
        throw new Error('No user logged in')
      }
      
      await deleteUser(user)
      return { success: true, error: null }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  // Sign out user
  static async signOut() {
    try {
      await signOut(auth)
      return { success: true, error: null }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }
}
