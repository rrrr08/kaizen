/**
 * Script to add sample photos/gallery items to Firebase
 * Run with: npx ts-node scripts/add-sample-photos.ts
 */

import { db, collection, addDoc, serverTimestamp } from '../lib/firebase';

const samplePhotos = [
  {
    title: 'Corporate Team Building',
    subtitle: 'Bringing teams closer through play',
    emoji: '🏢',
    category: 'corporate',
    approved: true,
    createdAt: new Date().toISOString(),
    // imageUrl: 'https://example.com/corporate-event.jpg', // Add actual image URLs here
  },
  {
    title: 'Wedding Celebration',
    subtitle: 'Making your special day unforgettable',
    emoji: '💒',
    category: 'wedding',
    approved: true,
    createdAt: new Date().toISOString(),
    // imageUrl: 'https://example.com/wedding.jpg',
  },
  {
    title: 'Community Game Night',
    subtitle: 'Where strangers become friends',
    emoji: '🎮',
    category: 'event',
    approved: true,
    createdAt: new Date().toISOString(),
    // imageUrl: 'https://example.com/game-night.jpg',
  },
];

async function addSamplePhotos() {
  console.log('Adding sample photos to Firebase...');
  
  try {
    const photosRef = collection(db, 'photos');
    
    for (const photo of samplePhotos) {
      const docRef = await addDoc(photosRef, {
        ...photo,
        updatedAt: serverTimestamp(),
      });
      console.log(`✓ Added photo: ${photo.title} (ID: ${docRef.id})`);
    }
    
    console.log('\n✅ Sample photos added successfully!');
    console.log('\nNote: To add actual images:');
    console.log('1. Upload images to Firebase Storage or use a CDN');
    console.log('2. Update the photo documents with imageUrl field');
  } catch (error) {
    console.error('Error adding sample photos:', error);
  }
}

// Run if called directly
if (require.main === module) {
  addSamplePhotos().then(() => {
    console.log('\nDone!');
    process.exit(0);
  }).catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

export { addSamplePhotos };
