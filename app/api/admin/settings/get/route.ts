import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/app/api/auth/firebase-admin';

export async function GET(request: NextRequest) {
  try {
    // Get settings from Firestore
    const settingsDoc = await adminDb.collection('settings').doc('store').get();

    if (!settingsDoc.exists) {
      // Return default settings if not found
      return NextResponse.json({
        gstRate: 18,
        shippingCost: 50,
        freeShippingThreshold: 500,
        storeName: 'Joy Juncture',
      });
    }

    return NextResponse.json(settingsDoc.data());
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json(
      {
        gstRate: 18,
        shippingCost: 50,
        freeShippingThreshold: 500,
        storeName: 'Joy Juncture',
      },
      { status: 200 }
    );
  }
}
