import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';

export async function GET(req: NextRequest) {
  const email = req.nextUrl.searchParams.get('email');
  if (!email) return NextResponse.json({ error: 'Email param required' });

  const usersRef = adminDb.collection('users');
  const snapshot = await usersRef.where('email', '==', email).get();

  if (snapshot.empty) {
    return NextResponse.json({ error: 'User not found' });
  }

  const userData = snapshot.docs.map(doc => ({
    id: doc.id,
    streak: doc.data().streak,
    daily_stats: doc.data().daily_stats,
    lastPlayed: doc.data().lastPlayed
  }));

  return NextResponse.json(userData);
}
