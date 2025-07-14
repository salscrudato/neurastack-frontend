/**
 * Delete Existing Firebase Firestore Data Script
 *
 * This script deletes all existing user data from Firebase Firestore
 * for cleanup purposes.
 *
 * WARNING: This will permanently delete all user data. Use with caution.
 */

import { initializeApp } from 'firebase/app';
import {
    collection,
    deleteDoc,
    getDocs,
    getFirestore,
    limit,
    query,
    writeBatch
} from 'firebase/firestore';

// Firebase config - using environment variables
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
  measurementId: process.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

/**
 * Delete all documents in a collection in batches
 */
async function deleteCollection(collectionPath: string): Promise<number> {
  const collectionRef = collection(db, collectionPath);
  let deletedCount = 0;
  let hasMore = true;

  console.log(`🗑️  Starting deletion of collection: ${collectionPath}`);

  while (hasMore) {
    // Get documents in batches of 500 (Firestore limit)
    const q = query(collectionRef, limit(500));
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      hasMore = false;
      break;
    }

    // Create batch for deletion
    const batch = writeBatch(db);
    snapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });

    // Execute batch deletion
    await batch.commit();
    deletedCount += snapshot.docs.length;
    
    console.log(`   ✅ Deleted ${snapshot.docs.length} documents (Total: ${deletedCount})`);
  }

  console.log(`🎯 Completed deletion of ${collectionPath}: ${deletedCount} documents deleted\n`);
  return deletedCount;
}

/**
 * Delete all subcollections for a specific user
 */
async function deleteUserSubcollections(userId: string): Promise<number> {
  let totalDeleted = 0;
  
  console.log(`👤 Deleting subcollections for user: ${userId}`);

  // List of subcollections to delete
  const subcollections = [
    'analytics',
    'chatMessages',
    'chatHistory',
    'prompts'
  ];

  for (const subcollection of subcollections) {
    try {
      const subcollectionPath = `users/${userId}/${subcollection}`;
      const deleted = await deleteCollection(subcollectionPath);
      totalDeleted += deleted;
    } catch (error) {
      console.warn(`   ⚠️  Failed to delete ${subcollection} for user ${userId}:`, error);
    }
  }

  return totalDeleted;
}

/**
 * Delete all user documents and their subcollections
 */
async function deleteAllUserData(): Promise<void> {
  console.log('🚀 Starting comprehensive Firestore data deletion...\n');
  
  let totalUsersProcessed = 0;
  let totalDocumentsDeleted = 0;

  try {
    // Get all users
    const usersRef = collection(db, 'users');
    const usersSnapshot = await getDocs(usersRef);
    
    console.log(`📊 Found ${usersSnapshot.docs.length} users to process\n`);

    // Process each user
    for (const userDoc of usersSnapshot.docs) {
      const userId = userDoc.id;
      console.log(`🔄 Processing user: ${userId}`);
      
      // Delete all subcollections for this user
      const deletedSubcollections = await deleteUserSubcollections(userId);
      totalDocumentsDeleted += deletedSubcollections;
      
      // Delete the user document itself
      await deleteDoc(userDoc.ref);
      totalDocumentsDeleted += 1;
      totalUsersProcessed += 1;
      
      console.log(`   ✅ User ${userId} completely deleted\n`);
    }

    // Delete community prompts collection if it exists
    try {
      const communityDeleted = await deleteCollection('communityPrompts');
      totalDocumentsDeleted += communityDeleted;
    } catch (error) {
      console.warn('⚠️  Failed to delete communityPrompts collection:', error);
    }

    // Summary
    console.log('🎉 DELETION COMPLETE!');
    console.log('📊 SUMMARY:');
    console.log(`   👥 Users processed: ${totalUsersProcessed}`);
    console.log(`   🗑️  Total documents deleted: ${totalDocumentsDeleted}`);
    console.log('   ✅ Database is now clean and ready for new API integration\n');

  } catch (error) {
    console.error('❌ Error during deletion process:', error);
    throw error;
  }
}

/**
 * Confirmation prompt for safety
 */
async function confirmDeletion(): Promise<boolean> {
  const { createInterface } = await import('readline');

  return new Promise((resolve) => {
    const rl = createInterface({
      input: process.stdin,
      output: process.stdout
    });

    console.log('⚠️  WARNING: This will permanently delete ALL user data from Firestore!');
    console.log('   This includes:');
    console.log('   • All user profiles');
    console.log('   • All analytics and session data');
    console.log('   • All chat history');
    console.log('   • Community prompts');
    console.log('');

    rl.question('Are you sure you want to proceed? Type "DELETE_ALL_DATA" to confirm: ', (answer) => {
      rl.close();
      resolve(answer === 'DELETE_ALL_DATA');
    });
  });
}

/**
 * Main execution function
 */
async function main() {
  try {
    console.log('🔥 NeuraStack Firestore Data Deletion Script');
    console.log('==========================================\n');

    // Safety confirmation
    const confirmed = await confirmDeletion();
    
    if (!confirmed) {
      console.log('❌ Deletion cancelled. No data was deleted.');
      process.exit(0);
    }

    console.log('\n🚀 Starting deletion process...\n');
    
    // Execute deletion
    await deleteAllUserData();
    
    console.log('✅ Script completed successfully!');
    process.exit(0);
    
  } catch (error) {
    console.error('💥 Script failed:', error);
    process.exit(1);
  }
}

// Run the script
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { deleteAllUserData, deleteCollection, deleteUserSubcollections };
