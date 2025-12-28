import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? '✓ SET' : '✗ MISSING',
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ? '✓ SET' : '✗ MISSING',
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ? '✓ SET' : '✗ MISSING',
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ? '✓ SET' : '✗ MISSING',
  };

  try {
    const { getFirebaseDb } = await import('@/lib/firebase');
    const db = await getFirebaseDb();
    
    return NextResponse.json({
      status: 'Firebase initialized successfully',
      config: firebaseConfig,
      database: db ? 'Connected' : 'Not connected'
    });
  } catch (error: any) {
    return NextResponse.json({
      status: 'Firebase initialization failed',
      config: firebaseConfig,
      error: error.message,
      details: error.toString()
    }, { status: 500 });
  }
}
