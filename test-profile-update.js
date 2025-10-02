// Test profile update functionality
// Run this with: node test-profile-update.js

const { createClient } = require('@supabase/supabase-js');

// You'll need to set these environment variables or replace with your actual values
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'YOUR_SUPABASE_URL';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testProfileUpdate() {
  try {
    console.log('🔍 Testing profile update...');
    
    // Test 1: Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError) {
      console.error('❌ Auth error:', authError);
      return;
    }
    
    if (!user) {
      console.error('❌ No authenticated user');
      return;
    }
    
    console.log('✅ User authenticated:', user.id);
    
    // Test 2: Check if we can read profiles
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', user.id)
      .single();
      
    if (profileError) {
      console.error('❌ Profile read error:', profileError);
      return;
    }
    
    console.log('✅ Profile read access works:', profileData);
    
    // Test 3: Try a simple update
    const { data: updateData, error: updateError } = await supabase
      .from('profiles')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', user.id)
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
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testProfileUpdate();






