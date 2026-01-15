import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';
import { getServerTodayString } from '@/lib/date-utils';

export async function GET(req: NextRequest) {
  const email = req.nextUrl.searchParams.get('email');
  const streakCount = parseInt(req.nextUrl.searchParams.get('count') || '5');
  
  if (!email) return NextResponse.json({ error: 'Email param required' });

  const usersRef = adminDb.collection('users');
  const snapshot = await usersRef.where('email', '==', email).get();

  if (snapshot.empty) {
    return NextResponse.json({ error: 'User not found' });
  }

  const today = getServerTodayString();
  const updates: any[] = [];

  snapshot.forEach(doc => {
    const p = doc.ref.update({
      'streak.count': streakCount,
      'streak.last_active_date': today,
      'streak.freeze_count': 2
    });
    updates.push(p);
  });

  await Promise.all(updates);

  return NextResponse.json({ success: true, message: `Updated streak to ${streakCount} and date to ${today}` });
}
