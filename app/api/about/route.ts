import { NextRequest, NextResponse } from 'next/server';
import { getAboutData } from '@/lib/db/content';

export async function GET(request: NextRequest) {
  try {
    const data = await getAboutData();

    return NextResponse.json({
      success: true,
      data: data || {},
    });
  } catch (error: any) {
    console.error('Error fetching about data:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch about data',
        message: error.message 
      },
      { status: 500 }
    );
  }
}
