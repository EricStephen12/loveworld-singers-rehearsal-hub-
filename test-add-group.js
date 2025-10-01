// Test script to add a group for testing
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://dumhphyhvnyyqnmnahno.supabase.co'
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR1bWhwaHlodm55eXFubW5haG5vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc5NjM0ODUsImV4cCI6MjA3MzUzOTQ4NX0.JlTOmEJyMGH3cBSeiO3LOuQdHLDdB57Vi3Hm8rGeDOI'

const supabase = createClient(supabaseUrl, supabaseKey)

async function testAddGroup() {
  try {
    console.log('🔍 Testing user_groups table...')
    
    // First, let's see what users exist
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, first_name, last_name, email')
      .limit(5)
    
    if (profilesError) {
      console.error('❌ Error fetching profiles:', profilesError)
      return
    }
    
    console.log('👥 Available users:', profiles)
    
    if (profiles && profiles.length > 0) {
      const testUserId = profiles[0].id
      console.log('🧪 Testing with user:', testUserId)
      
      // Try to add a test group
      const { data, error } = await supabase
        .from('user_groups')
        .insert({
          user_id: testUserId,
          group_name: 'yourloveworldsingers'
        })
        .select()
      
      if (error) {
        console.error('❌ Error adding group:', error)
        return
      }
      
      console.log('✅ Group added successfully:', data)
      
      // Now try to fetch it back
      const { data: userGroups, error: fetchError } = await supabase
        .from('user_groups')
        .select('*')
        .eq('user_id', testUserId)
      
      if (fetchError) {
        console.error('❌ Error fetching groups:', fetchError)
        return
      }
      
      console.log('📊 User groups:', userGroups)
      
      // Clean up
      await supabase
        .from('user_groups')
        .delete()
        .eq('user_id', testUserId)
      
      console.log('🧹 Test data cleaned up')
    } else {
      console.log('⚠️ No users found in profiles table')
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error)
  }
}

testAddGroup()



