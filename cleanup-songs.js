// Data cleanup script for songs
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, doc, updateDoc, deleteDoc } = require('firebase/firestore');

// You'll need to add your actual Firebase config here
const firebaseConfig = {
  // Add your Firebase config
};

async function cleanupSongs() {
  try {
    console.log('🧹 Starting songs cleanup...');
    
    // Initialize Firebase
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    
    // Get all songs
    const songsRef = collection(db, 'songs');
    const songsSnapshot = await getDocs(songsRef);
    const songs = songsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    console.log(`📊 Found ${songs.length} songs to check`);
    
    let cleanedCount = 0;
    let deletedCount = 0;
    
    for (const song of songs) {
      let needsUpdate = false;
      let needsDeletion = false;
      const updates = {};
      
      // Check for corrupted song title
      if (song.title && song.title.includes('tueyiruotiepryotupy')) {
        console.log(`🗑️ Deleting corrupted song: ${song.title}`);
        needsDeletion = true;
      }
      
      // Check for missing page ID
      if (!song.praisenightid && !song.praiseNightId) {
        console.log(`⚠️ Song without page ID: ${song.title}`);
        // You might want to assign it to a default page or delete it
        // For now, let's assign it to page 3 (New Praise Songs page)
        updates.praisenightid = 3;
        needsUpdate = true;
      }
      
      // Normalize category names
      if (song.category) {
        const normalizedCategory = song.category.trim();
        if (normalizedCategory !== song.category) {
          updates.category = normalizedCategory;
          needsUpdate = true;
        }
        
        // Fix specific category names
        if (song.category === 'Previously ministered (was previously scheduled for update)') {
          updates.category = 'Previously Ministered Songs';
          needsUpdate = true;
        }
      }
      
      // Apply updates or deletion
      if (needsDeletion) {
        await deleteDoc(doc(db, 'songs', song.id));
        deletedCount++;
        console.log(`✅ Deleted corrupted song: ${song.title}`);
      } else if (needsUpdate) {
        await updateDoc(doc(db, 'songs', song.id), updates);
        cleanedCount++;
        console.log(`✅ Updated song: ${song.title}`, updates);
      }
    }
    
    console.log(`\n🎉 Cleanup complete!`);
    console.log(`📊 Songs cleaned: ${cleanedCount}`);
    console.log(`🗑️ Songs deleted: ${deletedCount}`);
    console.log(`📊 Total processed: ${cleanedCount + deletedCount}`);
    
  } catch (error) {
    console.error('❌ Error during cleanup:', error);
  }
}

// Run cleanup
cleanupSongs();





