// Debug script to check Firebase songs data structure
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, limit, query } = require('firebase/firestore');

// Firebase config
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function debugSongFields() {
  try {
    console.log('🔍 Fetching songs from Firebase...\n');
    
    // Get first 5 songs
    const q = query(collection(db, 'songs'), limit(5));
    const querySnapshot = await getDocs(q);
    
    console.log(`📊 Total songs fetched: ${querySnapshot.docs.length}\n`);
    console.log('='.repeat(80));
    
    querySnapshot.docs.forEach((doc, index) => {
      const data = doc.data();
      
      console.log(`\n🎵 SONG ${index + 1}: ${data.title || 'NO TITLE'}`);
      console.log('-'.repeat(80));
      console.log(`📝 Firebase Document ID: ${doc.id}`);
      console.log(`\n📋 ALL FIELDS IN THIS DOCUMENT:`);
      console.log(JSON.stringify(Object.keys(data).sort(), null, 2));
      
      console.log(`\n🎤 PERSONNEL FIELDS:`);
      console.log(`  - leadSinger: ${data.leadSinger || 'MISSING'}`);
      console.log(`  - writer: ${data.writer || 'MISSING'}`);
      console.log(`  - conductor: ${data.conductor || 'MISSING'}`);
      console.log(`  - leadKeyboardist: ${data.leadKeyboardist || 'MISSING'}`);
      console.log(`  - leadGuitarist: ${data.leadGuitarist || 'MISSING'}`);
      console.log(`  - drummer: ${data.drummer || 'MISSING'}`);
      
      console.log(`\n🎵 AUDIO FIELDS:`);
      console.log(`  - audioFile: ${data.audioFile || 'MISSING'}`);
      console.log(`  - audiofile: ${data.audiofile || 'MISSING'}`);
      console.log(`  - audio_url: ${data.audio_url || 'MISSING'}`);
      console.log(`  - mediaId: ${data.mediaId || 'MISSING'}`);
      
      console.log(`\n📊 OTHER FIELDS:`);
      console.log(`  - title: ${data.title || 'MISSING'}`);
      console.log(`  - status: ${data.status || 'MISSING'}`);
      console.log(`  - category: ${data.category || 'MISSING'}`);
      console.log(`  - praiseNightId: ${data.praiseNightId || 'MISSING'}`);
      console.log(`  - key: ${data.key || 'MISSING'}`);
      console.log(`  - tempo: ${data.tempo || 'MISSING'}`);
      console.log(`  - rehearsalCount: ${data.rehearsalCount || 'MISSING'}`);
      
      console.log(`\n📝 CONTENT FIELDS:`);
      console.log(`  - lyrics: ${data.lyrics ? 'EXISTS (' + data.lyrics.length + ' chars)' : 'MISSING'}`);
      console.log(`  - solfas: ${data.solfas ? 'EXISTS (' + data.solfas.length + ' chars)' : 'MISSING'}`);
      
      console.log(`\n💬 COMMENTS:`);
      console.log(`  - comments: ${data.comments ? (Array.isArray(data.comments) ? `ARRAY (${data.comments.length} items)` : typeof data.comments) : 'MISSING'}`);
      
      console.log(`\n📜 HISTORY:`);
      console.log(`  - history: ${data.history ? (Array.isArray(data.history) ? `ARRAY (${data.history.length} items)` : typeof data.history) : 'MISSING'}`);
      
      console.log(`\n🔍 RAW DATA SAMPLE:`);
      console.log(JSON.stringify({
        id: doc.id,
        title: data.title,
        leadSinger: data.leadSinger,
        leadGuitarist: data.leadGuitarist,
        leadKeyboardist: data.leadKeyboardist,
        drummer: data.drummer,
        audioFile: data.audioFile,
        audiofile: data.audiofile,
        audio_url: data.audio_url,
      }, null, 2));
      
      console.log('\n' + '='.repeat(80));
    });
    
    console.log('\n✅ Debug complete!\n');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

debugSongFields();

