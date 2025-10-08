// Firebase Database Service - Ultra Fast for Millions of Users
import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  setDoc,
  updateDoc, 
  deleteDoc,
  query,
  orderBy,
  limit,
  where,
  onSnapshot
} from 'firebase/firestore'
import { db } from './firebase-setup'

export class FirebaseDatabaseService {
  // Get all praise nights (pages) - optimized for millions of users
  static async getPraiseNights(limitCount = 10) {
    try {
      const q = query(
        collection(db, 'praise_nights'),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      )
      
      const querySnapshot = await getDocs(q)
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
    } catch (error) {
      console.error('Error getting praise nights:', error)
      return []
    }
  }

  // Get songs for a specific praise night
  static async getSongs(praiseNightId: string) {
    try {
      const q = query(
        collection(db, 'songs'),
        where('praiseNightId', '==', praiseNightId)
      )
      
      const querySnapshot = await getDocs(q)
      const results = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      
      // Sort by orderIndex in JavaScript to avoid index requirement
      return results.sort((a, b) => {
        const indexA = (a as any).orderIndex || 0
        const indexB = (b as any).orderIndex || 0
        return indexA - indexB // Ascending order
      })
    } catch (error) {
      console.error('Error getting songs:', error)
      return []
    }
  }

  // Get user profile
  static async getUserProfile(userId: string) {
    try {
      const docRef = doc(db, 'profiles', userId)
      const docSnap = await getDoc(docRef)
      
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() }
      }
      return null
    } catch (error) {
      console.error('Error getting user profile:', error)
      return null
    }
  }

  // Real-time listener for praise nights
  static subscribeToPraiseNights(callback: (data: any[]) => void) {
    const q = query(
      collection(db, 'praise_nights'),
      orderBy('createdAt', 'desc'),
      limit(10)
    )
    
    return onSnapshot(q, (querySnapshot) => {
      const data = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      callback(data)
    })
  }

  // Add new praise night
  static async addPraiseNight(data: any) {
    try {
      const docRef = await addDoc(collection(db, 'praise_nights'), {
        ...data,
        createdAt: new Date(),
        updatedAt: new Date()
      })
      return { id: docRef.id, success: true }
    } catch (error) {
      console.error('Error adding praise night:', error)
      return { id: null, success: false }
    }
  }

  // Update praise night
  static async updatePraiseNight(id: string, data: any) {
    try {
      const docRef = doc(db, 'praise_nights', id)
      await updateDoc(docRef, {
        ...data,
        updatedAt: new Date()
      })
      return { success: true }
    } catch (error) {
      console.error('Error updating praise night:', error)
      return { success: false }
    }
  }

  // Delete praise night
  static async deletePraiseNight(id: string) {
    try {
      const docRef = doc(db, 'praise_nights', id)
      await deleteDoc(docRef)
      return { success: true }
    } catch (error) {
      console.error('Error deleting praise night:', error)
      return { success: false }
    }
  }

  // Test connection
  static async testConnection() {
    try {
      // Test if Firestore is initialized
      if (!db) {
        return { status: 'error', message: 'Firestore not initialized' }
      }
      
      // Test if we can access the database
      const testCollection = collection(db, 'test')
      return { 
        status: 'success', 
        message: 'Firebase Firestore connected successfully'
      }
    } catch (error: any) {
      return { status: 'error', message: error.message }
    }
  }

  // Generic methods for migration
  static async getCollection(collectionName: string) {
    try {
      const querySnapshot = await getDocs(collection(db, collectionName))
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        const result = {
          id: doc.id, // Firebase document ID (string)
          firebaseId: doc.id, // Also store as firebaseId for clarity
          supabaseId: data.id, // Store the original Supabase ID if it exists
          ...data
        }
        
        // Debug comments and solfas specifically for songs collection
        if (collectionName === 'songs') {
          console.log('🔍 Firebase getCollection - Song debug:', {
            songTitle: data.title,
            docId: doc.id,
            hasComments: !!data.comments,
            commentsType: typeof data.comments,
            commentsIsArray: Array.isArray(data.comments),
            commentsLength: data.comments?.length || 0,
            hasSolfas: !!data.solfas,
            solfasType: typeof data.solfas,
            solfasLength: data.solfas?.length || 0,
            solfasPreview: data.solfas ? data.solfas.substring(0, 100) + '...' : 'none'
          });
        }
        
        return result;
      })
    } catch (error) {
      console.error(`Error getting collection ${collectionName}:`, error)
      return []
    }
  }

  static async getDocument(collectionName: string, docId: string) {
    try {
      const docRef = doc(db, collectionName, docId)
      const docSnap = await getDoc(docRef)
      
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() }
      } else {
        return null
      }
    } catch (error) {
      console.error(`Error getting document ${docId}:`, error)
      return null
    }
  }

  static async createDocument(collectionName: string, docId: string, data: any) {
    try {
      const docRef = doc(db, collectionName, docId)
      await setDoc(docRef, data)
      return { id: docId, ...data }
    } catch (error) {
      console.error(`Error creating document ${docId}:`, error)
      throw error
    }
  }

  static async updateDocument(collectionName: string, docId: string, data: any) {
    try {
      const docRef = doc(db, collectionName, docId)
      await updateDoc(docRef, data)
      return { success: true }
    } catch (error) {
      console.error(`Error updating document ${docId}:`, error)
      throw error
    }
  }

  static async deleteDocument(collectionName: string, docId: string) {
    try {
      const docRef = doc(db, collectionName, docId)
      await deleteDoc(docRef)
      return { success: true }
    } catch (error) {
      console.error(`Error deleting document ${docId}:`, error)
      throw error
    }
  }

  static async getCollectionWhere(collectionName: string, field: string, operator: any, value: any) {
    try {
      const q = query(collection(db, collectionName), where(field, operator, value))
      const querySnapshot = await getDocs(q)
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
    } catch (error) {
      console.error(`Error getting collection ${collectionName} with where:`, error)
      return []
    }
  }

  // Category methods
  static async createCategory(categoryData: any) {
    try {
      const docRef = await addDoc(collection(db, 'categories'), categoryData)
      return { id: docRef.id, ...categoryData }
    } catch (error) {
      console.error('Error creating category:', error)
      return null
    }
  }

  static async updateCategory(categoryId: string | number, data: any) {
    try {
      console.log('🔄 Updating category with ID:', categoryId, 'Data:', data);
      await updateDoc(doc(db, 'categories', categoryId.toString()), data)
      console.log('✅ Category updated successfully');
      return true
    } catch (error) {
      console.error('❌ Error updating category:', error)
      return false
    }
  }

  static async deleteCategory(categoryId: string | number) {
    try {
      console.log('🔥 Deleting category with ID:', categoryId);
      await deleteDoc(doc(db, 'categories', categoryId.toString()))
      console.log('✅ Category deleted successfully');
      return true
    } catch (error) {
      console.error('❌ Error deleting category:', error)
      return false
    }
  }

  // Song methods
  static async createSong(songData: any) {
    try {
      // Filter out undefined values (Firebase doesn't allow them)
      const cleanData = Object.fromEntries(
        Object.entries(songData).filter(([_, value]) => value !== undefined)
      )
      
      console.log('🔥 Creating song with clean data:', cleanData)
      const docRef = await addDoc(collection(db, 'songs'), cleanData)
      return { id: docRef.id, ...cleanData }
    } catch (error) {
      console.error('Error creating song:', error)
      return null
    }
  }

  static async updateSong(songId: string | number, data: any) {
    try {
      console.log('🔥 Firebase updateSong called with:', {
        songId: songId,
        songIdType: typeof songId,
        dataKeys: Object.keys(data),
        hasId: !!data.id,
        hasFirebaseId: !!data.firebaseId,
        hasComments: !!data.comments,
        commentsCount: data.comments?.length || 0
      });
      
      // Filter out undefined values (Firebase doesn't allow them)
      const cleanData = Object.fromEntries(
        Object.entries(data).filter(([_, value]) => value !== undefined)
      )
      
      console.log('🔥 Updating song with ID:', songId, 'clean data:', cleanData)
      console.log('🔥 Comments being saved:', {
        comments: data.comments,
        commentsType: typeof data.comments,
        commentsIsArray: Array.isArray(data.comments),
        commentsLength: data.comments?.length || 0,
        commentsStringified: JSON.stringify(data.comments)
      })
      await updateDoc(doc(db, 'songs', songId.toString()), cleanData)
      console.log('✅ Firebase updateSong successful');
      return true
    } catch (error) {
      console.error('❌ Firebase updateSong error:', error)
      return false
    }
  }

  static async deleteSong(songId: string | number) {
    try {
      console.log('🔥 Deleting song from Firebase:', songId);
      
      // Check if document exists before deleting
      const docRef = doc(db, 'songs', songId.toString());
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        console.error('❌ Song not found in Firebase:', songId);
        return false;
      }
      
      await deleteDoc(docRef);
      console.log('✅ Song deleted from Firebase');
      return true
    } catch (error) {
      console.error('❌ Firebase delete error:', error)
      return false
    }
  }

  // Page methods
  static async createPage(pageData: any) {
    try {
      const docRef = await addDoc(collection(db, 'praise_nights'), pageData)
      return { id: docRef.id, ...pageData }
    } catch (error) {
      console.error('Error creating page:', error)
      return null
    }
  }

  static async updatePage(pageId: string | number, data: any) {
    try {
      const docId = typeof pageId === 'number' ? pageId.toString() : pageId
      console.log('🔥 Firebase updatePage called with:', { docId, data });
      
      // Check if document exists first
      const docRef = doc(db, 'praise_nights', docId);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        console.error('❌ Document does not exist:', docId);
        return false;
      }
      
      console.log('📄 Document exists, current data:', docSnap.data());
      
      await updateDoc(docRef, data);
      console.log('✅ Firebase updatePage successful');
      return true
    } catch (error) {
      console.error('❌ Firebase updatePage error:', error)
      return false
    }
  }

  static async deletePage(pageId: string | number) {
    try {
      const docId = typeof pageId === 'number' ? pageId.toString() : pageId
      await deleteDoc(doc(db, 'praise_nights', docId))
      return true
    } catch (error) {
      console.error('Error deleting page:', error)
      return false
    }
  }

  // Utility methods
  static async updateSongsCategory(oldCategory: string, newCategory: string) {
    try {
      // Get all songs with the old category
      const songsQuery = query(collection(db, 'songs'), where('category', '==', oldCategory))
      const songsSnapshot = await getDocs(songsQuery)
      
      // Update each song
      const updatePromises = songsSnapshot.docs.map(doc => 
        updateDoc(doc.ref, { category: newCategory })
      )
      
      await Promise.all(updatePromises)
      return true
    } catch (error) {
      console.error('Error updating songs category:', error)
      return false
    }
  }

  static async handleCategoryDeletion(categoryName: string, newCategory: string) {
    try {
      // Move songs from deleted category to new category
      return await this.updateSongsCategory(categoryName, newCategory)
    } catch (error) {
      console.error('Error handling category deletion:', error)
      return false
    }
  }

  // Get history entries for a song
  static async getHistoryBySongId(songId: number) {
    try {
      const q = query(
        collection(db, 'song_history'),
        where('song_id', '==', songId)
      )

      const querySnapshot = await getDocs(q)
      const results = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))

      // Sort by created_at in JavaScript to avoid index requirement
      return results.sort((a, b) => {
        const dateA = new Date((a as any).created_at || 0).getTime()
        const dateB = new Date((b as any).created_at || 0).getTime()
        return dateB - dateA // Descending order (newest first)
      })
    } catch (error) {
      console.error('Error getting song history:', error)
      return []
    }
  }

  // ===== GROUP POSTS OPERATIONS =====

  static async getGroupPosts(groupId: string) {
    try {
      const q = query(
        collection(db, 'group_posts'),
        where('group_id', '==', groupId),
        orderBy('timestamp', 'desc')
      )
      const querySnapshot = await getDocs(q)
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
    } catch (error) {
      console.error('Error getting group posts:', error)
      return []
    }
  }

  static async createGroupPost(postData: any) {
    try {
      const docRef = await addDoc(collection(db, 'group_posts'), postData)
      return { id: docRef.id, ...postData }
    } catch (error) {
      console.error('Error creating group post:', error)
      return null
    }
  }

  static async updateGroupPost(postId: string, data: any) {
    try {
      await updateDoc(doc(db, 'group_posts', postId), data)
      return true
    } catch (error) {
      console.error('Error updating group post:', error)
      return false
    }
  }

  static async deleteGroupPost(postId: string) {
    try {
      await deleteDoc(doc(db, 'group_posts', postId))
      return true
    } catch (error) {
      console.error('Error deleting group post:', error)
      return false
    }
  }

  // Create history entry
  static async createHistoryEntry(data: any) {
    try {
      const docRef = await addDoc(collection(db, 'song_history'), data)
      return { id: docRef.id, ...data }
    } catch (error) {
      console.error('Error creating history entry:', error)
      return null
    }
  }

  // Delete history entry
  static async deleteHistoryEntry(entryId: string) {
    try {
      await deleteDoc(doc(db, 'song_history', entryId))
      return true
    } catch (error) {
      console.error('Error deleting history entry:', error)
      return false
    }
  }
}
