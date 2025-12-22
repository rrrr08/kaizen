/**
 * API Route to Initialize Mock Data
 * Call GET /api/admin/init-mock-data to populate Firestore with demo data
 */

import { initializeAllMockData } from '@/lib/initMockData';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    await initializeAllMockData();
    return NextResponse.json({
      success: true,
      message: 'Mock data initialized successfully',
    });
  } catch (error) {
    console.error('Error initializing mock data:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to initialize mock data',
      },
      { status: 500 }
    );
  }
}
