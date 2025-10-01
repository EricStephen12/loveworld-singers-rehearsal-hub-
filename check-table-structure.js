// Check if user_groups table exists and its structure
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://dumhphyhvnyyqnmnahno.supabase.co'
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR1bWhwaHlodm55eXFubW5haG5vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc5NjM0ODUsImV4cCI6MjA3MzUzOTQ4NX0.JlTOmEJyMGH3cBSeiO3LOuQdHLDdB57Vi3Hm8rGeDOI'

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkTableStructure() {
  try {
    console.log('🔍 Checking if user_groups table exists...')
    
    // Try to insert a test record to see if table exists
    const testRecord = {
      user_id: 'test-user-123',
      group_name: 'test-group'
    }
    
    const { data, error } = await supabase
      .from('user_groups')
      .insert(testRecord)
      .select()
    
    if (error) {
      console.error('❌ Table might not exist or has wrong structure:', error)
      console.log('💡 This could mean:')
      console.log('   1. user_groups table does not exist')
      console.log('   2. Table has different column names')
      console.log('   3. RLS policies are blocking access')
      return
    }
    
    console.log('✅ Table exists and is accessible')
    console.log('📊 Test record inserted:', data)
    
    // Clean up test record
    await supabase
      .from('user_groups')
      .delete()
      .eq('user_id', 'test-user-123')
    
    console.log('🧹 Test record cleaned up')
    
  } catch (error) {
    console.error('❌ Check failed:', error)
  }
}

checkTableStructure()



