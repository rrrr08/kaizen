'use client';

import { useEffect, useState } from 'react';
import { useGamification } from '@/app/context/GamificationContext';
import Link from 'next/link';
import { Wallet as WalletIcon, TrendingUp, Gift } from 'lucide-react';

export const dynamic = 'force-dynamic';

interface WalletData {
  totalPoints: number;
  history?: any[];
  isFirstTimeCustomer?: boolean;
}

export default function WalletPage() {
  const { config, getCustomerLevel, calculatePointWorth } = useGamification();
  const [wallet, setWallet] = useState<WalletData>({ totalPoints: 0 });
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentLevel, setCurrentLevel] = useState(1);

  useEffect(() => {
    const loadWallet = async () => {
      try {
        // Lazy load Firebase
        const { auth, getUserWallet, getUserOrders } = await import('@/lib/firebase');
        const currentUser = auth.currentUser;
        if (!currentUser) {
          console.error('User not authenticated. Please log in to view wallet.');
          setLoading(false);
          return;
        }

        // Load from Firebase only
        const walletData = await getUserWallet(currentUser.uid);
        setWallet({
          totalPoints: walletData.points,
          history: walletData.history,
        });

        // Get orders to show transaction history
        const orders = await getUserOrders(currentUser.uid);
        const orderTransactions = orders.map((order: any) => ({
          id: order.id,
          type: 'earn',
          points: order.totalPoints,
          reason: 'purchase',
          createdAt: order.createdAt,
          orderId: order.id,
        }));
        
        setTransactions(orderTransactions);
        setLoading(false);
      } catch (error) {
        console.error('Error loading wallet:', error);
        setLoading(false);
      }
    };

    loadWallet();
  }, []);

  useEffect(() => {
    const level = getCustomerLevel(wallet.totalPoints || 0);
    setCurrentLevel(level);
  }, [wallet, getCustomerLevel]);

  const pointsWorth = calculatePointWorth(wallet.totalPoints || 0);
  const levelInfo = config.levelThresholds.find((l) => l.level === currentLevel);
  const nextLevel = config.levelThresholds[currentLevel];
  const pointsToNextLevel = nextLevel ? nextLevel.minPoints - (wallet.totalPoints || 0) : 0;

  if (loading) {
    return (
      <div className="min-h-screen pt-28 pb-16 flex items-center justify-center bg-background">
        <p className="text-muted-foreground font-body">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-28 pb-16 bg-background">
      <div className="max-w-6xl mx-auto px-6 md:px-12">
        {/* Header */}
        <div className="mb-16">
          <Link href="/shop" className="font-header text-sm text-muted-foreground hover:text-primary mb-8 inline-block transition-colors">
            ← BACK TO SHOP
          </Link>
          <h1 className="font-display text-5xl font-bold mb-4">MY WALLET</h1>
          <p className="text-lg text-muted-foreground font-body">Earn points with every purchase and unlock rewards</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
          {/* Main Points Card */}
          <div className="lg:col-span-2">
            <div className="glass-card p-12 rounded-lg">
              <div className="flex items-start justify-between mb-8">
                <div>
                  <p className="text-muted-foreground text-sm mb-2">TOTAL POINTS</p>
                  <p className="font-display text-7xl font-bold text-primary">{(wallet.totalPoints || 0).toLocaleString()}</p>
                </div>
                <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center">
                  <WalletIcon className="w-8 h-8 text-primary" />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-primary/10 border border-primary/20 rounded-lg">
                  <span className="font-header text-sm">Points Worth</span>
                  <span className="font-display font-bold text-primary">₹{pointsWorth.toFixed(2)}</span>
                </div>

                <div className="flex justify-between items-center p-4 bg-secondary/10 border border-secondary/20 rounded-lg">
                  <span className="font-header text-sm">Earnings Multiplier</span>
                  <span className="font-display font-bold text-secondary">{levelInfo?.multiplier}x</span>
                </div>

                <Link href="/checkout" className="block w-full py-4 bg-primary text-primary-foreground text-center font-header font-bold rounded-lg hover:opacity-90 transition-opacity mt-6">
                  USE POINTS AT CHECKOUT
                </Link>
              </div>
            </div>
          </div>

          {/* Level Card */}
          <div className="glass-card p-8 rounded-lg">
            <p className="text-muted-foreground text-sm mb-4">YOUR LEVEL</p>
            
            <div className="mb-8 text-center">
              <div
                className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center text-white font-display text-4xl font-bold"
                style={{ backgroundColor: levelInfo?.badgeColor || '#666' }}
              >
                {currentLevel}
              </div>
              <p className="font-display text-2xl font-bold mb-2">Level {currentLevel}</p>
              <p className="text-muted-foreground text-sm">{levelInfo?.benefits[0]}</p>
            </div>

            {nextLevel && pointsToNextLevel > 0 && (
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">Next Level: {nextLevel.minPoints.toLocaleString()} points</p>
                <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-primary h-full transition-all"
                    style={{
                      width: `${(((wallet.totalPoints || 0) / nextLevel.minPoints) * 100).toFixed(0)}%`,
                    }}
                  ></div>
                </div>
                <p className="text-xs text-primary font-header font-semibold">
                  {Math.max(0, pointsToNextLevel).toLocaleString()} points to go
                </p>
              </div>
            )}

            {!nextLevel && (
              <div className="text-center p-4 bg-primary/10 border border-primary/20 rounded-lg">
                <p className="font-header font-bold text-primary">MAX LEVEL REACHED!</p>
              </div>
            )}
          </div>
        </div>

        {/* Benefits Grid */}
        {levelInfo && levelInfo.benefits.length > 0 && (
          <div className="mb-16">
            <h2 className="font-display text-3xl font-bold mb-8">YOUR BENEFITS</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {levelInfo.benefits.map((benefit, idx) => (
                <div key={idx} className="glass-card p-6 rounded-lg flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <Gift className="w-5 h-5 text-primary" />
                  </div>
                  <p className="font-header font-semibold">{benefit}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Transaction History */}
        <div>
          <h2 className="font-display text-3xl font-bold mb-8">TRANSACTION HISTORY</h2>

          {transactions.length === 0 ? (
            <div className="glass-card p-12 rounded-lg text-center">
              <TrendingUp className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground font-body">No transactions yet. Start shopping to earn points!</p>
              <Link href="/shop" className="inline-block mt-6 px-8 py-3 bg-primary text-primary-foreground font-header font-bold rounded hover:opacity-90 transition-opacity">
                BROWSE GAMES
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {transactions.slice().reverse().map((transaction) => (
                <div
                  key={transaction.id}
                  className={`glass-card p-6 rounded-lg flex justify-between items-center ${
                    transaction.type === 'earn' ? 'border-secondary/20 border' : 'border-destructive/20 border'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        transaction.type === 'earn'
                          ? 'bg-secondary/20 text-secondary'
                          : 'bg-destructive/20 text-destructive'
                      }`}
                    >
                      {transaction.type === 'earn' ? '+' : '-'}
                    </div>
                    <div>
                      <p className="font-header font-semibold capitalize">{transaction.reason}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(transaction.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className={`font-display font-bold text-lg ${transaction.type === 'earn' ? 'text-secondary' : 'text-destructive'}`}>
                      {transaction.type === 'earn' ? '+' : '-'}{transaction.points.toLocaleString()} pts
                    </p>
                    {transaction.orderId && (
                      <p className="text-xs text-muted-foreground">{transaction.orderId}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Info Section */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="glass-card p-8 rounded-lg">
            <h3 className="font-display text-2xl font-bold mb-4">HOW TO EARN POINTS</h3>
            <ul className="space-y-3 text-muted-foreground font-body">
              <li className="flex gap-3">
                <span className="text-primary font-bold">1.</span>
                <span>Make a purchase: Earn {config.pointsPerRupee} point per rupee spent</span>
              </li>
              <li className="flex gap-3">
                <span className="text-primary font-bold">2.</span>
                <span>First-time bonus: Get {config.firstTimeBonusPoints} bonus points on your first order</span>
              </li>
              <li className="flex gap-3">
                <span className="text-primary font-bold">3.</span>
                <span>Level up: Earn bonus multipliers at higher levels</span>
              </li>
              <li className="flex gap-3">
                <span className="text-primary font-bold">4.</span>
                <span>Refer friends: Earn {config.referralBonus} points for each successful referral</span>
              </li>
            </ul>
          </div>

          <div className="glass-card p-8 rounded-lg">
            <h3 className="font-display text-2xl font-bold mb-4">HOW TO USE POINTS</h3>
            <ul className="space-y-3 text-muted-foreground font-body">
              <li className="flex gap-3">
                <span className="text-secondary font-bold">•</span>
                <span>Redeem points at checkout: 1 point = ₹{config.redeemRate}</span>
              </li>
              <li className="flex gap-3">
                <span className="text-secondary font-bold">•</span>
                <span>Max discount per order: {config.maxRedeemPercent}% of order value</span>
              </li>
              <li className="flex gap-3">
                <span className="text-secondary font-bold">•</span>
                <span>Points never expire once credited to your wallet</span>
              </li>
              <li className="flex gap-3">
                <span className="text-secondary font-bold">•</span>
                <span>Use combination of points and payment at checkout</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
