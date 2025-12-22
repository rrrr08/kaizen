import { initializeFirebaseData } from '@/lib/initializeFirebaseData';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const result = await initializeFirebaseData();
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error('Initialization error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const result = await initializeFirebaseData();
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error('Initialization error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
