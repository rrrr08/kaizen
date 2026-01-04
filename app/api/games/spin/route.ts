import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebaseAdmin';
import { headers } from 'next/headers';
import { FieldValue } from 'firebase-admin/firestore';

import { WHEEL_PRIZES as DEFAULT_PRIZES, SPIN_COST as SHARED_SPIN_COST } from '@/lib/gamification';

const SPIN_COST = 100;

export async function POST(req: NextRequest) {
  try {
    const headersList = await headers();
    const authorization = headersList.get('authorization');
    
    if (!authorization?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authorization.split('Bearer ')[1];
    const decodedToken = await adminAuth.verifyIdToken(token);
    const uid = decodedToken.uid;
    const body = await req.json();
    const { isFreeSpin } = body;

    const userRef = adminDb.collection('users').doc(uid);
    const settingsRef = adminDb.doc('settings/wheelPrizes');

    // Transaction to ensure atomicity
    const result = await adminDb.runTransaction(async (t) => {
      const userDoc = await t.get(userRef);
      const settingsDoc = await t.get(settingsRef);
      // Move read up to satisfy "all reads before writes" rule
      const xpSettingsSnap = await t.get(adminDb.doc('settings/xpSystem'));

      if (!userDoc.exists) {
        throw new Error('User not found');
      }

      const userData = userDoc.data()!;
      
      // 1. Validation
      if (isFreeSpin) {
        const today = new Date().toISOString().split('T')[0];
        const lastSpin = userData.daily_stats?.last_spin_date;
        
        if (lastSpin === today) {
          throw new Error('Free spin already used today');
        }
      } else {
        // Paid spin
        const balance = userData.points || 0; // Assuming 'points' is the balance field
        if (balance < SPIN_COST) {
          throw new Error('Insufficient funds');
        }
        
        // Deduct cost
        t.update(userRef, {
            points: FieldValue.increment(-SPIN_COST)
        });
      }

      // 2. Get Prizes
      let prizes = DEFAULT_PRIZES;
      if (settingsDoc.exists && settingsDoc.data()?.prizes) {
        prizes = settingsDoc.data()?.prizes;
      }
      
      // 3. Select Prize (Weighted Random)
      const rand = Math.random();
      let cumulative = 0;
      let selectedPrize = prizes[0];

      const totalWeight = prizes.reduce((sum: number, p: any) => sum + (p.probability || 0), 0);
      let randomWeight = rand * totalWeight;
      
      for (const prize of prizes) {
        randomWeight -= (prize.probability || 0);
        if (randomWeight <= 0) {
          selectedPrize = prize;
          break;
        }
      }

      // 4. Award Prize
      const updates: any = {
          'daily_stats.last_spin_date': new Date().toISOString().split('T')[0]
      };

      let message = `You won ${selectedPrize.label}`;
      let awardedValue = 0;

      // Get user's current tier for multiplier
      const currentXP = userData.xp || 0;
      const TIERS = xpSettingsSnap.exists && xpSettingsSnap.data()?.tiers ? xpSettingsSnap.data()!.tiers : [
        { name: 'Newbie', minXP: 0, multiplier: 1.0 },
        { name: 'Player', minXP: 500, multiplier: 1.1 },
        { name: 'Strategist', minXP: 2000, multiplier: 1.25 },
        { name: 'Grandmaster', minXP: 5000, multiplier: 1.5 }
      ];
      const currentTier = [...TIERS].reverse().find((tier: any) => currentXP >= tier.minXP) || TIERS[0];

      if (selectedPrize.type === 'JP' || selectedPrize.type === 'JACKPOT') {
         const basePrizeValue = Number(selectedPrize.value);
         // Apply tier multiplier to JP prizes
         const jpEarned = Math.round(basePrizeValue * currentTier.multiplier);
         updates.points = FieldValue.increment(jpEarned);
         awardedValue = jpEarned;
         message = `You won ${jpEarned} JP (${basePrizeValue} × ${currentTier.multiplier}x ${currentTier.name} bonus)!`;
         
      } else if (selectedPrize.type === 'XP') {
          // XP prizes don't get multiplier (consistent with game rewards)
          const prizeValue = Number(selectedPrize.value);
          updates.xp = FieldValue.increment(prizeValue);
          awardedValue = prizeValue;
      } else if (selectedPrize.type === 'ITEM' || selectedPrize.type === 'COUPON') {
          // Placeholder for item logic
      }

      t.update(userRef, updates);

      return {
          prize: selectedPrize,
          awardedValue
      };
    });

    return NextResponse.json({ success: true, result });

  } catch (error: any) {
    console.error('Spin error:', error);
    return NextResponse.json({ error: error.message || 'Spin failed' }, { status: 400 });
  }
}
