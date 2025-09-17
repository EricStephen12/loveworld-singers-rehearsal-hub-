// Test Supabase Connection
import { createClient } from '@supabase/supabase-js';

// Load environment variables
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  console.error('Please check your .env.local file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  console.log('🧪 Testing Supabase connection...');
  
  try {
    // Test 1: Get pages
    console.log('\n📄 Testing pages...');
    const { data: pages, error: pagesError } = await supabase
      .from('pages')
      .select('*')
      .limit(3);
    
    if (pagesError) throw pagesError;
    console.log('✅ Pages loaded:', pages?.length || 0);
    console.log('📊 Sample page:', pages?.[0]?.name);
    
    // Test 2: Get songs
    console.log('\n🎵 Testing songs...');
    const { data: songs, error: songsError } = await supabase
      .from('songs')
      .select('*')
      .limit(3);
    
    if (songsError) throw songsError;
    console.log('✅ Songs loaded:', songs?.length || 0);
    console.log('📊 Sample song:', songs?.[0]?.title);
    
    // Test 3: Get comments
    console.log('\n💬 Testing comments...');
    const { data: comments, error: commentsError } = await supabase
      .from('comments')
      .select('*')
      .limit(3);
    
    if (commentsError) throw commentsError;
    console.log('✅ Comments loaded:', comments?.length || 0);
    console.log('📊 Sample comment:', comments?.[0]?.text?.substring(0, 50) + '...');
    
    console.log('\n🎉 All tests passed! Supabase is working correctly.');
    console.log('\n📊 Summary:');
    console.log(`- Pages: ${pages?.length || 0}`);
    console.log(`- Songs: ${songs?.length || 0}`);
    console.log(`- Comments: ${comments?.length || 0}`);
    
  } catch (error) {
    console.error('❌ Connection test failed:', error.message);
    console.error('\n🔧 Troubleshooting:');
    console.error('1. Check your .env.local file has correct credentials');
    console.error('2. Make sure you ran the SQL schema successfully');
    console.error('3. Verify your Supabase project is active');
  }
}

testConnection();

