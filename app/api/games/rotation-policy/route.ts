import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';

// GET /api/games/rotation-policy - Get current rotation policy
export async function GET() {
  try {
    const policySnap = await adminDb.doc('settings/rotationPolicy').get();
    
    if (!policySnap.exists) {
      // Return default policy
      return NextResponse.json({
        enabled: false,
        gamesPerDay: 5,
        selectedGames: [],
        rotationSchedule: {},
        lastRotation: null
      });
    }
    
    return NextResponse.json(policySnap.data());
  } catch (error: any) {
    console.error('Error fetching rotation policy:', error);
    return NextResponse.json({ error: 'Internal server error', details: error.message }, { status: 500 });
  }
}

// POST /api/games/rotation-policy - Update rotation policy (Admin only)
export async function POST(req: NextRequest) {
  try {
    // Get Firebase Auth token from Authorization header
    const authorization = req.headers.get('authorization');
    
    if (!authorization?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized - No token provided' }, { status: 401 });
    }

    const token = authorization.split('Bearer ')[1];
    let decodedToken;
    
    try {
      const { adminAuth } = await import('@/lib/firebaseAdmin');
      decodedToken = await adminAuth.verifyIdToken(token);
    } catch (error) {
      console.error('Token verification failed:', error);
      return NextResponse.json({ error: 'Unauthorized - Invalid token' }, { status: 401 });
    }

    // Check if user is admin
    const userRef = adminDb.collection('users').doc(decodedToken.uid);
    const userSnap = await userRef.get();
    const userData = userSnap.data();
    
    if (!userData?.isAdmin && userData?.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }
    
    const body = await req.json();
    const { enabled, gamesPerDay, selectedGames } = body;
    
    if (gamesPerDay < 1 || gamesPerDay > 20) {
      return NextResponse.json({ error: 'gamesPerDay must be between 1 and 20' }, { status: 400 });
    }
    
    const today = new Date().toISOString().slice(0, 10);
    
    // Get all available games
    const settingsSnap = await adminDb.doc('settings/gamePoints').get();
    const allGames = settingsSnap.exists ? Object.keys(settingsSnap.data() || {}) : [];
    
    // If no specific games selected, use all games
    const gamesToRotate = selectedGames && selectedGames.length > 0 ? selectedGames : allGames;
    
    // Generate today's rotation
    const shuffled = [...gamesToRotate].sort(() => Math.random() - 0.5);
    const todaysGames = shuffled.slice(0, Math.min(gamesPerDay, shuffled.length));
    
    const policy = {
      enabled,
      gamesPerDay,
      selectedGames: gamesToRotate,
      rotationSchedule: {
        [today]: todaysGames
      },
      lastRotation: today,
      updatedAt: new Date().toISOString()
    };
    
    await adminDb.doc('settings/rotationPolicy').set(policy);
    
    return NextResponse.json({ success: true, policy });
  } catch (error: any) {
    console.error('Error updating rotation policy:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/games/rotation-policy/rotate - Manually trigger rotation (Admin only)
export async function PUT(req: NextRequest) {
  try {
    // Get Firebase Auth token from Authorization header
    const authorization = req.headers.get('authorization');
    
    if (!authorization?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized - No token provided' }, { status: 401 });
    }

    const token = authorization.split('Bearer ')[1];
    let decodedToken;
    
    try {
      const { adminAuth } = await import('@/lib/firebaseAdmin');
      decodedToken = await adminAuth.verifyIdToken(token);
    } catch (error) {
      console.error('Token verification failed:', error);
      return NextResponse.json({ error: 'Unauthorized - Invalid token' }, { status: 401 });
    }

    // Check if user is admin
    const userRef = adminDb.collection('users').doc(decodedToken.uid);
    const userSnap = await userRef.get();
    const userData = userSnap.data();
    
    if (!userData?.isAdmin && userData?.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }
    
    const policySnap = await adminDb.doc('settings/rotationPolicy').get();
    if (!policySnap.exists) {
      return NextResponse.json({ error: 'No rotation policy configured' }, { status: 404 });
    }
    
    const policy = policySnap.data();
    const today = new Date().toISOString().slice(0, 10);
    
    // Generate new rotation
    const shuffled = [...policy.selectedGames].sort(() => Math.random() - 0.5);
    const todaysGames = shuffled.slice(0, Math.min(policy.gamesPerDay, shuffled.length));
    
    const updatedPolicy = {
      ...policy,
      rotationSchedule: {
        ...policy.rotationSchedule,
        [today]: todaysGames
      },
      lastRotation: today,
      updatedAt: new Date().toISOString()
    };
    
    await adminDb.doc('settings/rotationPolicy').set(updatedPolicy);
    
    return NextResponse.json({ success: true, todaysGames });
  } catch (error: any) {
    console.error('Error rotating games:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
