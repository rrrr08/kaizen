'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import { useGamification } from '@/app/context/GamificationContext';
import { Gift, Ticket, ShoppingBag, Sparkles, Check } from 'lucide-react';
import confetti from 'canvas-confetti';

interface Voucher {
  id: string;
  name: string;
  description: string;
  pointsCost: number;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  icon: string;
  color: string;
  category: 'shop' | 'events' | 'experiences';
  expiryDays: number;
  minPurchase: number;
  maxDiscount?: number;
  enabled: boolean;
}

export default function RewardsPage() {
  const { user } = useAuth();
  const { balance, spendPoints } = useGamification();
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'shop' | 'events' | 'experiences'>('all');
  const [myVouchers, setMyVouchers] = useState<any[]>([]);
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchVouchers();
    if (user) {
      fetchMyVouchers();
    }
  }, [user]);

  const fetchVouchers = async () => {
    try {
      const response = await fetch('/api/admin/vouchers');
      if (response.ok) {
        const data = await response.json();
        setVouchers(data.vouchers.filter((v: any) => v.enabled));
      }
    } catch (error) {
      console.error('Error fetching vouchers:', error);
    }
  };

  const fetchMyVouchers = async () => {
    if (!user) return;
    
    try {
      const token = await user.getIdToken();
      const response = await fetch('/api/rewards/my-vouchers', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setMyVouchers(data.vouchers || []);
      }
    } catch (error) {
      console.error('Error fetching vouchers:', error);
    }
  };

  const handleRedeem = async (voucher: Voucher) => {
    if (!user) {
      setMessage('Please log in to redeem vouchers');
      return;
    }

    if (balance < voucher.pointsCost) {
      setMessage(`Insufficient points! You need ${voucher.pointsCost} JP but have ${balance} JP`);
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    setLoading(true);
    setMessage('Redeeming voucher...');

    try {
      const token = await user.getIdToken();
      const response = await fetch('/api/rewards/redeem', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          voucherId: voucher.id,
          pointsCost: voucher.pointsCost,
          voucherData: voucher
        })
      });

      const data = await response.json();

      if (response.ok) {
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
        setMessage(`✅ Voucher redeemed successfully! Code: ${data.code}`);
        fetchMyVouchers();
        setTimeout(() => setMessage(''), 5000);
      } else {
        setMessage(`❌ ${data.error || 'Failed to redeem voucher'}`);
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (error) {
      setMessage('❌ Network error');
      setTimeout(() => setMessage(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  const filteredVouchers = selectedCategory === 'all' 
    ? vouchers 
    : vouchers.filter(v => v.category === selectedCategory);

  return (
    <div className="min-h-screen pt-28 pb-16 bg-[#FFFDF5]">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        {/* Header */}
        <div className="mb-12 border-b-2 border-black pb-8">
          <h1 className="font-header text-5xl md:text-7xl tracking-tighter mb-4 text-[#2D3436]">
            REWARDS <span className="text-[#6C5CE7]">STORE</span>
          </h1>
          <p className="text-black/70 font-bold text-lg mb-4">
            Redeem your Joy Points for exclusive vouchers and discounts
          </p>
          <div className="inline-flex items-center gap-3 px-6 py-3 bg-[#FFD93D] border-2 border-black rounded-xl neo-shadow">
            <Sparkles size={24} className="text-black" />
            <div>
              <p className="text-black/60 text-xs font-bold uppercase tracking-wide">Your Balance</p>
              <p className="text-black font-black text-2xl">{balance} JP</p>
            </div>
          </div>
        </div>

        {/* Message */}
        {message && (
          <div className={`mb-6 p-4 rounded-xl border-2 ${
            message.startsWith('✅') 
              ? 'bg-green-100 border-green-500 text-green-800' 
              : message.startsWith('❌')
              ? 'bg-red-100 border-red-500 text-red-800'
              : 'bg-blue-100 border-blue-500 text-blue-800'
          }`}>
            <p className="font-bold">{message}</p>
          </div>
        )}

        {/* Category Filter */}
        <div className="mb-8 flex flex-wrap gap-3">
          {(['all', 'shop', 'events', 'experiences'] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-6 py-3 font-black text-sm uppercase rounded-xl border-2 border-black transition-all ${
                selectedCategory === cat
                  ? 'bg-[#6C5CE7] text-white neo-shadow'
                  : 'bg-white text-black hover:bg-black/5'
              }`}
            >
              {cat === 'all' ? '🎯 All' : cat === 'shop' ? '🛍️ Shop' : cat === 'events' ? '🎫 Events' : '🎮 Experiences'}
            </button>
          ))}
        </div>

        {/* Vouchers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {filteredVouchers.map((voucher) => {
            const canAfford = balance >= voucher.pointsCost;
            
            return (
              <div
                key={voucher.id}
                className={`bg-white border-2 border-black rounded-[30px] p-6 neo-shadow transition-all ${
                  canAfford ? 'hover:translate-x-[4px] hover:translate-y-[4px] hover:shadow-none' : 'opacity-60'
                }`}
              >
                <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${voucher.color} flex items-center justify-center text-3xl mb-4 border-2 border-black`}>
                  {voucher.icon}
                </div>
                
                <h3 className="font-header text-xl text-black mb-2">{voucher.name}</h3>
                <p className="text-black/60 text-sm mb-4">{voucher.description}</p>
                
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Sparkles size={16} className="text-[#FFD93D]" />
                    <span className="font-black text-lg text-black">{voucher.pointsCost} JP</span>
                  </div>
                  <span className="text-xs text-black/40 font-bold">
                    Valid {voucher.expiryDays} days
                  </span>
                </div>
                
                <button
                  onClick={() => handleRedeem(voucher)}
                  disabled={!canAfford || loading}
                  className={`w-full py-3 font-black text-sm uppercase rounded-xl border-2 border-black transition-all ${
                    canAfford
                      ? 'bg-[#6C5CE7] text-white hover:bg-[#5B4CD6]'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  {canAfford ? 'REDEEM NOW' : 'INSUFFICIENT POINTS'}
                </button>
              </div>
            );
          })}
        </div>

        {/* My Vouchers Section */}
        <div className="bg-white border-2 border-black p-8 rounded-[30px] neo-shadow">
          <h2 className="font-header text-3xl text-black mb-6 flex items-center gap-3">
            <Gift size={32} />
            MY VOUCHERS
          </h2>
          
          {myVouchers.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-black/40 font-bold text-lg">No vouchers yet</p>
              <p className="text-black/60 text-sm mt-2">Redeem your points to get exclusive vouchers!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {myVouchers.map((voucher) => (
                <div
                  key={voucher.id}
                  className="p-4 bg-[#FFFDF5] border-2 border-black/10 rounded-xl"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-bold text-black">{voucher.name}</h4>
                      <p className="text-xs text-black/60">Code: <span className="font-mono font-bold">{voucher.code}</span></p>
                    </div>
                    {!voucher.used && (
                      <span className="px-2 py-1 bg-green-500 text-white text-xs font-bold rounded">
                        ACTIVE
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-black/70 mb-2">{voucher.description}</p>
                  <p className="text-xs text-black/40">
                    Expires: {new Date(voucher.expiresAt).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
