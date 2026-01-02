'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import { useGamification } from '@/app/context/GamificationContext';
import { Gift, Ticket, ShoppingBag, Sparkles, Check, Zap, Target, Gamepad2, CheckCircle2, XCircle } from 'lucide-react';
import confetti from 'canvas-confetti';
import { motion } from 'framer-motion';

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
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h1 className="font-header text-6xl md:text-7xl font-black tracking-tight mb-4 text-black">
            REWARDS <span className="text-[#6C5CE7]">STORE</span>
          </h1>
          <p className="text-black/70 font-bold text-xl mb-6">
            Redeem your Joy Points for exclusive vouchers and discounts
          </p>
          <div className="inline-flex items-center gap-4 px-8 py-4 bg-[#FFD93D] border-4 border-black rounded-2xl neo-shadow-lg">
            <Zap size={32} className="text-black" />
            <div>
              <p className="text-black/60 text-xs font-black uppercase tracking-wider">Your Balance</p>
              <p className="text-black font-header text-3xl font-black">{balance.toLocaleString()} JP</p>
            </div>
          </div>
        </motion.div>

        {/* Message */}
        {message && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`mb-6 p-4 rounded-2xl border-4 border-black font-bold flex items-center gap-2 ${message.startsWith('✅')
                ? 'bg-[#00B894] text-white'
                : message.startsWith('❌')
                  ? 'bg-[#FF6B6B] text-white'
                  : 'bg-[#6C5CE7] text-white'
              }`}
          >
            {message.startsWith('✅') && <CheckCircle2 size={20} />}
            {message.startsWith('❌') && <XCircle size={20} />}
            <p className="font-black">{message.replace(/^[✅❌]\s*/, '')}</p>
          </motion.div>
        )}

        {/* Category Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8 flex flex-wrap gap-3"
        >
          {(['all', 'shop', 'events', 'experiences'] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-6 py-3 font-black text-sm uppercase rounded-xl border-4 border-black transition-all flex items-center gap-2 ${selectedCategory === cat
                  ? 'bg-[#6C5CE7] text-white neo-shadow scale-105'
                  : 'bg-white text-black hover:bg-black/5 neo-shadow-hover'
                }`}
            >
              {cat === 'all' && <Target size={16} />}
              {cat === 'shop' && <ShoppingBag size={16} />}
              {cat === 'events' && <Ticket size={16} />}
              {cat === 'experiences' && <Gamepad2 size={16} />}
              {cat === 'all' ? 'All' : cat === 'shop' ? 'Shop' : cat === 'events' ? 'Events' : 'Experiences'}
            </button>
          ))}
        </motion.div>

        {/* Vouchers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {filteredVouchers.map((voucher, index) => {
            const canAfford = balance >= voucher.pointsCost;

            return (
              <motion.div
                key={voucher.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
                className={`bg-white border-4 border-black rounded-3xl p-6 transition-all ${canAfford ? 'neo-shadow-hover' : 'opacity-60'
                  }`}
              >
                <div className="text-5xl mb-4">{voucher.icon}</div>

                <h3 className="font-header text-2xl font-black text-black mb-2">{voucher.name}</h3>
                <p className="text-black/60 font-bold text-sm mb-4">{voucher.description}</p>

                <div className="flex items-center justify-between mb-4 pb-4 border-b-2 border-black/10">
                  <div className="flex items-center gap-2">
                    <Sparkles size={20} className="text-[#FFD93D]" />
                    <span className="font-black text-xl text-black">{voucher.pointsCost} JP</span>
                  </div>
                  <span className="text-xs text-black/60 font-bold uppercase">
                    {voucher.expiryDays}d Valid
                  </span>
                </div>

                <div className="mb-4 space-y-1 text-xs font-bold text-black/60">
                  {voucher.minPurchase > 0 && (
                    <p>• Min Purchase: ₹{voucher.minPurchase}</p>
                  )}
                  {voucher.maxDiscount && (
                    <p>• Max Discount: ₹{voucher.maxDiscount}</p>
                  )}
                  <p>• {voucher.discountType === 'percentage' ? `${voucher.discountValue}% OFF` : `₹${voucher.discountValue} OFF`}</p>
                </div>

                <button
                  onClick={() => handleRedeem(voucher)}
                  disabled={!canAfford || loading}
                  className={`w-full py-3 font-black text-sm uppercase rounded-xl border-4 border-black transition-all ${canAfford
                      ? 'bg-[#6C5CE7] text-white hover:bg-[#5B4CD6] neo-shadow-hover'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    }`}
                >
                  {canAfford ? 'REDEEM NOW' : 'INSUFFICIENT POINTS'}
                </button>
              </motion.div>
            );
          })}
        </div>

        {filteredVouchers.length === 0 && (
          <div className="text-center py-12 bg-white border-4 border-black rounded-3xl neo-shadow">
            <p className="text-black/40 font-black text-xl">No vouchers available</p>
            <p className="text-black/60 font-bold text-sm mt-2">Check back later for new rewards!</p>
          </div>
        )}

        {/* My Vouchers Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white border-4 border-black p-8 rounded-3xl neo-shadow"
        >
          <h2 className="font-header text-4xl font-black text-black mb-6 flex items-center gap-3">
            <Gift size={36} />
            MY VOUCHERS
          </h2>

          {myVouchers.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-black/40 font-black text-xl">No vouchers yet</p>
              <p className="text-black/60 font-bold text-sm mt-2">Redeem your points to get exclusive vouchers!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {myVouchers.map((voucher) => (
                <div
                  key={voucher.id}
                  className="p-6 bg-[#FFFDF5] border-3 border-black rounded-2xl neo-shadow"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-black text-black text-lg">{voucher.name}</h4>
                      <p className="text-xs text-black/60 font-bold mt-1">
                        Code: <span className="font-mono font-black text-[#6C5CE7]">{voucher.code}</span>
                      </p>
                    </div>
                    {!voucher.used && (
                      <span className="px-3 py-1 bg-[#00B894] text-white text-xs font-black rounded-full uppercase">
                        ACTIVE
                      </span>
                    )}
                    {voucher.used && (
                      <span className="px-3 py-1 bg-gray-400 text-white text-xs font-black rounded-full uppercase">
                        USED
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-black/70 font-bold mb-3">{voucher.description}</p>
                  <p className="text-xs text-black/40 font-bold">
                    Expires: {new Date(voucher.expiresAt).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
