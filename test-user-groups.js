// Test script to check user_groups table
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function testUserGroups() {
  try {
    console.log('🔍 Testing user_groups table...')
    
    // Check if table exists and get all records
    const { data: allGroups, error: allError } = await supabase
      .from('user_groups')
      .select('*')
    
    if (allError) {
      console.error('❌ Error fetching all groups:', allError)
      return
    }
    
    console.log('📊 All user groups in database:', allGroups)
    console.log('📊 Total groups:', allGroups?.length || 0)
    
    // Check table structure
    const { data: tableInfo, error: tableError } = await supabase
      .from('user_groups')
      .select('*')
      .limit(1)
    
    if (tableError) {
      console.error('❌ Table structure error:', tableError)
    } else {
      console.log('✅ Table structure looks good')
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error)
  }
}

testUserGroups()



