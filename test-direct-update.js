// Direct database test to bypass RLS issues
// Run this with: node test-direct-update.js

const { createClient } = require('@supabase/supabase-js');

// You'll need to set these environment variables or replace with your actual values
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'YOUR_SUPABASE_URL';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testDirectUpdate() {
  try {
    console.log('🔍 Testing direct database update...');
    
    // Test 1: Check if we can read from profiles
    console.log('📖 Testing profile read access...');
    const { data: readData, error: readError } = await supabase
      .from('profiles')
      .select('*')
      .limit(1);
      
    if (readError) {
      console.error('❌ Profile read error:', readError);
      return;
    }
    
    console.log('✅ Profile read successful:', readData);
    
    // Test 2: Check if we can update profiles
    console.log('📝 Testing profile update access...');
    const { data: updateData, error: updateError } = await supabase
      .from('profiles')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', 'test-id')
      .select();
      
    if (updateError) {
      console.error('❌ Profile update error:', updateError);
      console.error('Error details:', {
        code: updateError.code,
        message: updateError.message,
        details: updateError.details,
        hint: updateError.hint
      });
      return;
    }
    
    console.log('✅ Profile update successful:', updateData);
    
    // Test 3: Check RLS policies
    console.log('🔒 Testing RLS policies...');
    const { data: rlsData, error: rlsError } = await supabase
      .from('profiles')
      .select('id, first_name, last_name')
      .limit(1);
      
    if (rlsError) {
      console.error('❌ RLS policy error:', rlsError);
      return;
    }
    
    console.log('✅ RLS policies working:', rlsData);
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testDirectUpdate();

