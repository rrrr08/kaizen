
import { adminDb } from '../lib/firebaseAdmin';

async function checkUserStreak() {
  console.log("Searching for user damgaurav04@gmail.com...");
  const usersRef = adminDb.collection('users');
  const snapshot = await usersRef.where('email', '==', 'damgaurav04@gmail.com').get();

  if (snapshot.empty) {
    console.log('No user found with that email.');
    return;
  }

  snapshot.forEach(doc => {
    console.log(`User ID: ${doc.id}`);
    const data = doc.data();
    console.log('Streak Data:', data.streak);
    console.log('Daily Stats:', data.daily_stats);
  });
}

checkUserStreak().catch(console.error);
