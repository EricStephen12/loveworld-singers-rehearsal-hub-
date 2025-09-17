// Test script to check if audio URLs are accessible
const testUrls = [
  'https://res.cloudinary.com/dumhphyhvnyyqnmnahno/raw/upload/v1757936485/YOUR_DOMINION_IS_FOR_ETERNITY_ENIOLA%282%29.mp3',
  'https://res.cloudinary.com/dumhphyhvnyyqnmnahno/raw/upload/v1757936485/Forsaken_Epic_Trailer_Music_No_Copyright.mp3'
];

async function testUrl(url) {
  try {
    console.log(`Testing: ${url}`);
    const response = await fetch(url, { method: 'HEAD' });
    console.log(`Status: ${response.status} ${response.statusText}`);
    console.log(`Content-Type: ${response.headers.get('content-type')}`);
    console.log(`Content-Length: ${response.headers.get('content-length')}`);
    return response.ok;
  } catch (error) {
    console.error(`Error testing ${url}:`, error.message);
    return false;
  }
}

async function testAllUrls() {
  console.log('🔍 Testing audio URLs...\n');
  
  for (const url of testUrls) {
    const isAccessible = await testUrl(url);
    console.log(`Result: ${isAccessible ? '✅ Accessible' : '❌ Not accessible'}\n`);
  }
}

testAllUrls();

