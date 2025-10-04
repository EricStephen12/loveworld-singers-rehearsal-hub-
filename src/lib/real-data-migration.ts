// Real Data Migration Script - Migrate actual Supabase data to Firebase
import { initializeApp } from 'firebase/app'
import { getFirestore, collection, addDoc, doc, setDoc } from 'firebase/firestore'

// Supabase client for reading data
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

// Firebase config
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
}

const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

export class RealDataMigration {
  static async migratePraiseNights() {
    try {
      console.log('🔄 Migrating praise nights from Supabase to Firebase...')
      
      // Get all pages from Supabase
      const { data: praiseNights, error } = await supabase
        .from('pages')
        .select('*')
      
      console.log('📊 Praise nights data:', praiseNights)

      if (error) {
        console.error('❌ Error fetching praise nights:', error)
        return { success: false, error: (error as Error).message }
      }

      if (!praiseNights || praiseNights.length === 0) {
        console.log('ℹ️ No praise nights found in Supabase')
        return { success: true, count: 0 }
      }

      console.log(`📊 Found ${praiseNights.length} praise nights in Supabase`)

      // Migrate each praise night to Firebase
      let migratedCount = 0
      for (const praiseNight of praiseNights) {
        try {
          // Convert Supabase data to Firebase format
          const firebaseData = {
            id: praiseNight.id,
            name: praiseNight.name || 'Untitled Page',
            title: praiseNight.name || 'Untitled Page', // Use name as title for compatibility
            description: praiseNight.description || '',
            date: praiseNight.date || '',
            location: praiseNight.location || '',
            category: praiseNight.category || 'ongoing', // Default to 'ongoing' if not specified
            is_active: praiseNight.is_active || true,
            bannerImage: praiseNight.bannerimage || '', // Note: bannerimage (lowercase) from your screenshot
            // Ensure compatibility with existing code
            page_id: praiseNight.id,
            page_title: praiseNight.name,
            page_description: praiseNight.description || '',
            migrated_from_supabase: true,
            migrated_at: new Date().toISOString()
          }

          // Add to Firebase
          await setDoc(doc(db, 'praise_nights', praiseNight.id.toString()), firebaseData)
          migratedCount++
          console.log(`✅ Migrated praise night: ${firebaseData.name} (category: ${firebaseData.category})`)
        } catch (error) {
          console.error(`❌ Error migrating praise night ${praiseNight.id}:`, error)
        }
      }

      console.log(`🎉 Successfully migrated ${migratedCount} praise nights`)
      return { success: true, count: migratedCount }
    } catch (error) {
      console.error('❌ Migration error:', error)
      return { success: false, error: (error as Error).message }
    }
  }

  static async migrateSongs() {
    try {
      console.log('🔄 Migrating songs from Supabase to Firebase...')
      
      // Get all songs from Supabase
      const { data: songs, error } = await supabase
        .from('songs')
        .select('*')

      if (error) {
        console.error('❌ Error fetching songs:', error)
        return { success: false, error: (error as Error).message }
      }

      if (!songs || songs.length === 0) {
        console.log('ℹ️ No songs found in Supabase')
        return { success: true, count: 0 }
      }

      console.log(`📊 Found ${songs.length} songs in Supabase`)

      // Migrate each song to Firebase
      let migratedCount = 0
      for (const song of songs) {
        try {
          // Convert Supabase data to Firebase format
          const firebaseData = {
            id: song.id,
            title: song.title,
            writer: song.writer,
            leadguitarist: song.leadguitarist,
            drummer: song.drummer,
            leadkeyboardist: song.leadkeyboardist,
            leadsinger: song.leadsinger,
            conductor: song.conductor,
            category: song.category,
            lyrics: song.lyrics,
            solfas: song.solfas,
            status: song.status,
            key: song.key,
            tempo: song.tempo,
            rehearsalcount: song.rehearsalcount,
            audiofile: song.audiofile,
            mediaid: song.mediaid,
            comments: song.comments,
            praisenightid: song.praisenightid,
            praise_night_id: song.praise_night_id,
            created_at: song.created_at,
            updated_at: song.updated_at,
            createdat: song.createdat,
            updatedat: song.updatedat,
            // Ensure compatibility with existing code
            song_id: song.id,
            song_title: song.title,
            migrated_from_supabase: true,
            migrated_at: new Date().toISOString()
          }

          // Add to Firebase
          await setDoc(doc(db, 'songs', song.id.toString()), firebaseData)
          migratedCount++
          console.log(`✅ Migrated song: ${song.title}`)
        } catch (error) {
          console.error(`❌ Error migrating song ${song.id}:`, error)
        }
      }

      console.log(`🎉 Successfully migrated ${migratedCount} songs`)
      return { success: true, count: migratedCount }
    } catch (error) {
      console.error('❌ Migration error:', error)
      return { success: false, error: (error as Error).message }
    }
  }

  static async migrateComments() {
    try {
      console.log('🔄 Migrating comments from Supabase to Firebase...')
      
      const { data: comments, error } = await supabase
        .from('comments')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('❌ Error fetching comments:', error)
        return { success: false, error: (error as Error).message }
      }

      if (!comments || comments.length === 0) {
        console.log('ℹ️ No comments found in Supabase')
        return { success: true, count: 0 }
      }

      console.log(`📊 Found ${comments.length} comments in Supabase`)

      let migratedCount = 0
      for (const comment of comments) {
        try {
          const firebaseData = {
            id: comment.id,
            ...comment,
            migrated_from_supabase: true,
            migrated_at: new Date().toISOString()
          }

          await setDoc(doc(db, 'comments', comment.id.toString()), firebaseData)
          migratedCount++
          console.log(`✅ Migrated comment: ${comment.id}`)
        } catch (error) {
          console.error(`❌ Error migrating comment ${comment.id}:`, error)
        }
      }

      console.log(`🎉 Successfully migrated ${migratedCount} comments`)
      return { success: true, count: migratedCount }
    } catch (error) {
      console.error('❌ Comments migration error:', error)
      return { success: false, error: (error as Error).message }
    }
  }

  static async migrateSongHistory() {
    try {
      console.log('🔄 Migrating song history from Supabase to Firebase...')
      
      const { data: history, error } = await supabase
        .from('song_history')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('❌ Error fetching song history:', error)
        return { success: false, error: (error as Error).message }
      }

      if (!history || history.length === 0) {
        console.log('ℹ️ No song history found in Supabase')
        return { success: true, count: 0 }
      }

      console.log(`📊 Found ${history.length} song history entries in Supabase`)

      let migratedCount = 0
      for (const entry of history) {
        try {
          const firebaseData = {
            id: entry.id,
            ...entry,
            migrated_from_supabase: true,
            migrated_at: new Date().toISOString()
          }

          await setDoc(doc(db, 'song_history', entry.id.toString()), firebaseData)
          migratedCount++
          console.log(`✅ Migrated song history: ${entry.id}`)
        } catch (error) {
          console.error(`❌ Error migrating song history ${entry.id}:`, error)
        }
      }

      console.log(`🎉 Successfully migrated ${migratedCount} song history entries`)
      return { success: true, count: migratedCount }
    } catch (error) {
      console.error('❌ Song history migration error:', error)
      return { success: false, error: (error as Error).message }
    }
  }

  static async migrateChatData() {
    try {
      console.log('🔄 Migrating chat data from Supabase to Firebase...')
      
      // Migrate chat groups
      const { data: chatGroups, error: groupsError } = await supabase
        .from('chat_groups')
        .select('*')

      if (!groupsError && chatGroups && chatGroups.length > 0) {
        console.log(`📊 Found ${chatGroups.length} chat groups`)
        for (const group of chatGroups) {
          try {
            const firebaseData = {
              id: group.id,
              ...group,
              migrated_from_supabase: true,
              migrated_at: new Date().toISOString()
            }
            await setDoc(doc(db, 'chat_groups', group.id), firebaseData)
            console.log(`✅ Migrated chat group: ${group.name}`)
          } catch (error) {
            console.error(`❌ Error migrating chat group ${group.id}:`, error)
          }
        }
      }

      // Migrate chat messages
      const { data: chatMessages, error: messagesError } = await supabase
        .from('chat_messages')
        .select('*')

      if (!messagesError && chatMessages && chatMessages.length > 0) {
        console.log(`📊 Found ${chatMessages.length} chat messages`)
        for (const message of chatMessages) {
          try {
            const firebaseData = {
              id: message.id,
              ...message,
              migrated_from_supabase: true,
              migrated_at: new Date().toISOString()
            }
            await setDoc(doc(db, 'chat_messages', message.id), firebaseData)
            console.log(`✅ Migrated chat message: ${message.id}`)
          } catch (error) {
            console.error(`❌ Error migrating chat message ${message.id}:`, error)
          }
        }
      }

      // Migrate chat group members
      const { data: groupMembers, error: membersError } = await supabase
        .from('chat_group_members')
        .select('*')

      if (!membersError && groupMembers && groupMembers.length > 0) {
        console.log(`📊 Found ${groupMembers.length} chat group members`)
        for (const member of groupMembers) {
          try {
            const firebaseData = {
              id: member.id,
              ...member,
              migrated_from_supabase: true,
              migrated_at: new Date().toISOString()
            }
            await setDoc(doc(db, 'chat_group_members', member.id), firebaseData)
            console.log(`✅ Migrated chat group member: ${member.id}`)
          } catch (error) {
            console.error(`❌ Error migrating chat group member ${member.id}:`, error)
          }
        }
      }

      return { success: true }
    } catch (error) {
      console.error('❌ Chat data migration error:', error)
      return { success: false, error: (error as Error).message }
    }
  }

  static async migrateRemainingTables() {
    try {
      console.log('🔄 Migrating essential tables from Supabase to Firebase...')
      console.log('ℹ️ Skipping user-generated tables - will be created fresh in Firebase')
      
      const results = {
        comments: 0,
        songHistory: 0,
        // Skip user-generated tables - will be created fresh
        userGroups: 'SKIPPED - Will create fresh',
        userOnlineStatus: 'SKIPPED - Will create fresh', 
        supportMessages: 'SKIPPED - Will create fresh',
        attendance: 'SKIPPED - Will create fresh',
        achievements: 'SKIPPED - Will create fresh',
        friends: 'SKIPPED - Will create fresh',
        groupMembers: 'SKIPPED - Will create fresh',
        groupMessages: 'SKIPPED - Will create fresh',
        individualConversations: 'SKIPPED - Will create fresh',
        individualMessages: 'SKIPPED - Will create fresh',
        messageReactions: 'SKIPPED - Will create fresh',
        typingIndicators: 'SKIPPED - Will create fresh'
      }

      // Migrate comments
      try {
        const { data: comments, error } = await supabase.from('comments').select('*')
        if (error) {
          console.log('ℹ️ Comments table not found or no access:', error.message)
        } else if (comments && comments.length > 0) {
          for (const comment of comments) {
            await setDoc(doc(db, 'comments', comment.id.toString()), {
              ...comment,
              migrated_from_supabase: true,
              migrated_at: new Date().toISOString()
            })
          }
          results.comments = comments.length
          console.log(`✅ Migrated ${comments.length} comments`)
        } else {
          console.log('ℹ️ No comments found in Supabase')
        }
      } catch (error) {
        console.warn('⚠️ Comments migration failed:', error)
      }

      // Migrate song_history
      try {
        const { data: songHistory, error } = await supabase.from('song_history').select('*')
        if (!error && songHistory && songHistory.length > 0) {
          for (const entry of songHistory) {
            await setDoc(doc(db, 'song_history', entry.id.toString()), {
              ...entry,
              migrated_from_supabase: true,
              migrated_at: new Date().toISOString()
            })
          }
          results.songHistory = songHistory.length
          console.log(`✅ Migrated ${songHistory.length} song history entries`)
        }
      } catch (error) {
        console.warn('⚠️ Song history migration failed:', error)
      }

      // Skip user-generated tables - will be created fresh in Firebase
      console.log('ℹ️ Skipping user-generated tables - will create fresh in Firebase:')
      console.log('  - user_groups, user_online_status, support_messages')
      console.log('  - attendance, achievements, friends, group_members')
      console.log('  - group_messages, individual_conversations, individual_messages')
      console.log('  - message_reactions, typing_indicators')
      console.log('  - chat_groups, chat_messages, chat_group_members')
      console.log('  - message_read_status')

      console.log('🎉 Remaining tables migration completed!')
      return { success: true, results }
    } catch (error) {
      console.error('❌ Remaining tables migration error:', error)
      return { success: false, error: (error as Error).message }
    }
  }

  static async migrateAllData() {
    try {
      console.log('🚀 Starting PAGES migration from Supabase to Firebase...')
      console.log('ℹ️ Skipping songs, categories, media - already migrated successfully!')
      
      // ONLY migrate pages (praise nights) - skip everything else
      const pagesResult = await this.migratePraiseNights()
      if (!pagesResult.success) {
        return { success: false, error: pagesResult.error }
      }

      console.log('🎉 Pages migration successful!')
      return { 
        success: true, 
        pages: pagesResult.count,
        songs: 'SKIPPED - Already migrated',
        categories: 'SKIPPED - Already migrated', 
        media: 'SKIPPED - Already migrated'
      }
    } catch (error) {
      console.error('❌ Pages migration error:', error)
      return { success: false, error: (error as Error).message }
    }
  }
}
