import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';

// GET /api/users/[userId]/walletTransactions
export async function GET(req: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
  const { userId } = await params;
  if (!userId) return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
  const txSnap = await adminDb.collection(`users/${userId}/walletTransactions`).orderBy('awardedAt', 'desc').limit(50).get();
  const transactions = txSnap.docs.map(doc => doc.data());
  return NextResponse.json({ transactions });
}
