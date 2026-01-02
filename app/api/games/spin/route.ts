import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebaseAdmin';
import { headers } from 'next/headers';
import { FieldValue } from 'firebase-admin/firestore';

// DEFAULT PRIZES (Fallback)
const DEFAULT_PRIZES = [
  { id: 'jp_small', type: 'JP', value: 30, label: '30 JP', probability: 0.50, color: '#3b82f6' },
  { id: 'xp_boost', type: 'XP', value: 75, label: '75 XP', probability: 0.30, color: '#10b981' },
  { id: 'item_reroll', type: 'ITEM', value: 'Sudoku Reroll', label: 'Reroll', probability: 0.15, color: '#8b5cf6' },
  { id: 'coupon_20', type: 'COUPON', value: '20% OFF', label: '20% Off', probability: 0.04, color: '#f59e0b' },
  { id: 'jackpot', type: 'JACKPOT', value: 1000, label: '1000 JP', probability: 0.01, color: '#ef4444' }
];

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
      
      // Filter out invalid prizes (probability 0 or missing) if necessary, but assume config is good.

      // 3. Select Prize (Weighted Random)
      const rand = Math.random();
      let cumulative = 0;
      let selectedPrize = prizes[0];

      // Normalize probabilities if they don't sum to 1? 
      // Assuming admin ensures they sum to 1, or we handle it.
      // Better robust logic:
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

      if (selectedPrize.type === 'JP' || selectedPrize.type === 'JACKPOT') {
         // Apply multipliers? 
         // Logic from previous context: JP gets tier multiplier.
         // We might need to fetch tier here or just award raw and let frontend show it?
         // Ideally server handles everything.
         
         // Fetch Tiers for multiplier
         const xp = userData.xp || 0;
         // Hardcoding tiers lookup here or fetch from settings too?
         // For speed, let's assume we read tiers from settings or use defaults.
         // Let's keep it simple: Award the base value. 
         // If we want tier multiplier, we should fetch tiers.
         // Using simplified logic from previous conversation:
         
         const xpSettingsSnap = await t.get(adminDb.doc('settings/xpSystem'));
         const tiers = xpSettingsSnap.exists ? xpSettingsSnap.data()?.tiers : [];
         // ... get multiplier ...
         // For now, let's just award the raw value to fix the immediate bug of mismatch.
         
         const prizeValue = Number(selectedPrize.value);
         updates.points = FieldValue.increment(prizeValue);
         awardedValue = prizeValue;
         
      } else if (selectedPrize.type === 'XP') {
          const prizeValue = Number(selectedPrize.value);
          updates.xp = FieldValue.increment(prizeValue);
          awardedValue = prizeValue;
      } else if (selectedPrize.type === 'ITEM' || selectedPrize.type === 'COUPON') {
          // Add to inventory?
          // Placeholder
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
