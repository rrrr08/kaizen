import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebaseAdmin';

// GET /api/games/history?gameId=sudoku
export async function GET(req: NextRequest) {
  try {
    // Get Firebase Auth token from Authorization header
    const authorization = req.headers.get('authorization');
    
    if (!authorization?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized - No token provided' }, { status: 401 });
    }

    const token = authorization.split('Bearer ')[1];
    let decodedToken;
    
    try {
      decodedToken = await adminAuth.verifyIdToken(token);
    } catch (error) {
      console.error('Token verification failed:', error);
      return NextResponse.json({ error: 'Unauthorized - Invalid token' }, { status: 401 });
    }

    const userId = decodedToken.uid;
    
    const { searchParams } = new URL(req.url);
    const gameId = searchParams.get('gameId');
    
    if (!gameId) {
      return NextResponse.json({ error: 'gameId required' }, { status: 400 });
    }
    
    // Fetch user's game history
    const historyRef = adminDb.collection(`users/${userId}/gameHistory`);
    const snapshot = await historyRef
      .where('gameId', '==', gameId)
      .orderBy('awardedAt', 'desc')
      .limit(20)
      .get();
    
    const history = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    return NextResponse.json({ history });
  } catch (error: any) {
    console.error('Error fetching game history:', error);
    return NextResponse.json({ error: 'Internal server error', details: error.message }, { status: 500 });
  }
}

