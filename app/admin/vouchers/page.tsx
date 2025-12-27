'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import { Plus, Edit2, Trash2, Save } from 'lucide-react';

interface VoucherTemplate {
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
  usageLimit?: number;
}

export default function AdminVouchersPage() {
  const { user } = useAuth();
  const [vouchers, setVouchers] = useState<VoucherTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState<Partial<VoucherTemplate>>({
    name: '',
    description: '',
    pointsCost: 500,
    discountType: 'percentage',
    discountValue: 10,
    icon: '🎁',
    color: 'from-blue-500 to-cyan-500',
    category: 'shop',
    expiryDays: 30,
    minPurchase: 0,
    maxDiscount: undefined,
    enabled: true,
    usageLimit: undefined
  });

  useEffect(() => {
    fetchVouchers();
  }, []);

  const fetchVouchers = async () => {
    try {
      const response = await fetch('/api/admin/vouchers');
      if (response.ok) {
        const data = await response.json();
        setVouchers(data.vouchers || []);
      }
    } catch (error) {
      console.error('Error fetching vouchers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (voucher: VoucherTemplate) => {
    if (!user) return;
    
    setSaving(true);
    try {
      const token = await user.getIdToken();
      const response = await fetch('/api/admin/vouchers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(voucher)
      });

      if (response.ok) {
        setMessage('✅ Voucher saved successfully!');
        fetchVouchers();
        setEditingId(null);
        setShowAddForm(false);
        setFormData({
          name: '',
          description: '',
          pointsCost: 500,
          discountType: 'percentage',
          discountValue: 10,
          icon: '🎁',
          color: 'from-blue-500 to-cyan-500',
          category: 'shop',
          expiryDays: 30,
          minPurchase: 0,
          enabled: true
        });
      } else {
        setMessage('❌ Failed to save voucher');
      }
    } catch (error) {
      setMessage('❌ Network error');
    } finally {
      setSaving(false);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handleDelete = async (id: string) => {
    if (!user || !confirm('Delete this voucher?')) return;
    
    setSaving(true);
    try {
      const token = await user.getIdToken();
      const response = await fetch(`/api/admin/vouchers?id=${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setMessage('✅ Voucher deleted successfully!');
        fetchVouchers();
      } else {
        setMessage('❌ Failed to delete voucher');
      }
    } catch (error) {
      setMessage('❌ Network error');
    } finally {
      setSaving(false);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handleAddNew = () => {
    const newVoucher: VoucherTemplate = {
      id: `voucher_${Date.now()}`,
      ...formData as VoucherTemplate
    };
    handleSave(newVoucher);
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-28 pb-16 bg-[#FFFDF5] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-[#FFD93D] border-t-black mb-4"></div>
          <p className="text-black/60 font-black text-xs tracking-[0.4em]">LOADING...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-28 pb-16 bg-[#FFFDF5]">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        {/* Header */}
        <div className="mb-12 border-b-2 border-black pb-8">
          <h1 className="font-header text-5xl md:text-7xl tracking-tighter mb-4 text-[#2D3436]">
            VOUCHER <span className="text-[#6C5CE7]">MANAGEMENT</span>
          </h1>
          <p className="text-black/70 font-bold text-lg">
            Create and manage reward vouchers
          </p>
        </div>

        {/* Message */}
        {message && (
          <div className={`mb-6 p-4 rounded-xl border-2 ${
            message.startsWith('✅') 
              ? 'bg-green-100 border-green-500 text-green-800' 
              : 'bg-red-100 border-red-500 text-red-800'
          }`}>
            <p className="font-bold">{message}</p>
          </div>
        )}

        {/* Add New Button */}
        <div className="mb-8">
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-2 px-6 py-3 bg-[#00B894] text-white font-black text-sm uppercase tracking-widest rounded-xl border-2 border-black neo-shadow hover:translate-x-[4px] hover:translate-y-[4px] hover:shadow-none transition-all"
          >
            <Plus size={20} />
            ADD NEW VOUCHER
          </button>
        </div>

        {/* Add Form */}
        {showAddForm && (
          <div className="mb-8 bg-white border-2 border-black p-8 rounded-[30px] neo-shadow">
            <h2 className="font-header text-2xl text-black mb-6">Create New Voucher</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-black/60 font-bold text-xs tracking-widest mb-2">NAME</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-4 py-2 border-2 border-black/20 rounded-lg focus:border-[#6C5CE7] focus:outline-none"
                />
              </div>
              
              <div>
                <label className="block text-black/60 font-bold text-xs tracking-widest mb-2">ICON (Emoji)</label>
                <input
                  type="text"
                  value={formData.icon}
                  onChange={(e) => setFormData({...formData, icon: e.target.value})}
                  className="w-full px-4 py-2 border-2 border-black/20 rounded-lg focus:border-[#6C5CE7] focus:outline-none"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-black/60 font-bold text-xs tracking-widest mb-2">DESCRIPTION</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full px-4 py-2 border-2 border-black/20 rounded-lg focus:border-[#6C5CE7] focus:outline-none"
                  rows={2}
                />
              </div>

              <div>
                <label className="block text-black/60 font-bold text-xs tracking-widest mb-2">POINTS COST</label>
                <input
                  type="number"
                  value={formData.pointsCost}
                  onChange={(e) => setFormData({...formData, pointsCost: parseInt(e.target.value)})}
                  className="w-full px-4 py-2 border-2 border-black/20 rounded-lg focus:border-[#6C5CE7] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-black/60 font-bold text-xs tracking-widest mb-2">DISCOUNT TYPE</label>
                <select
                  value={formData.discountType}
                  onChange={(e) => setFormData({...formData, discountType: e.target.value as 'percentage' | 'fixed'})}
                  className="w-full px-4 py-2 border-2 border-black/20 rounded-lg focus:border-[#6C5CE7] focus:outline-none"
                >
                  <option value="percentage">Percentage</option>
                  <option value="fixed">Fixed Amount</option>
                </select>
              </div>

              <div>
                <label className="block text-black/60 font-bold text-xs tracking-widest mb-2">
                  DISCOUNT VALUE {formData.discountType === 'percentage' ? '(%)' : '(₹)'}
                </label>
                <input
                  type="number"
                  value={formData.discountValue}
                  onChange={(e) => setFormData({...formData, discountValue: parseInt(e.target.value)})}
                  className="w-full px-4 py-2 border-2 border-black/20 rounded-lg focus:border-[#6C5CE7] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-black/60 font-bold text-xs tracking-widest mb-2">CATEGORY</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value as any})}
                  className="w-full px-4 py-2 border-2 border-black/20 rounded-lg focus:border-[#6C5CE7] focus:outline-none"
                >
                  <option value="shop">Shop</option>
                  <option value="events">Events</option>
                  <option value="experiences">Experiences</option>
                </select>
              </div>

              <div>
                <label className="block text-black/60 font-bold text-xs tracking-widest mb-2">MIN PURCHASE (₹)</label>
                <input
                  type="number"
                  value={formData.minPurchase}
                  onChange={(e) => setFormData({...formData, minPurchase: parseInt(e.target.value)})}
                  className="w-full px-4 py-2 border-2 border-black/20 rounded-lg focus:border-[#6C5CE7] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-black/60 font-bold text-xs tracking-widest mb-2">MAX DISCOUNT (₹) - Optional</label>
                <input
                  type="number"
                  value={formData.maxDiscount || ''}
                  onChange={(e) => setFormData({...formData, maxDiscount: e.target.value ? parseInt(e.target.value) : undefined})}
                  className="w-full px-4 py-2 border-2 border-black/20 rounded-lg focus:border-[#6C5CE7] focus:outline-none"
                  placeholder="No limit"
                />
              </div>

              <div>
                <label className="block text-black/60 font-bold text-xs tracking-widest mb-2">EXPIRY (Days)</label>
                <input
                  type="number"
                  value={formData.expiryDays}
                  onChange={(e) => setFormData({...formData, expiryDays: parseInt(e.target.value)})}
                  className="w-full px-4 py-2 border-2 border-black/20 rounded-lg focus:border-[#6C5CE7] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-black/60 font-bold text-xs tracking-widest mb-2">COLOR GRADIENT</label>
                <select
                  value={formData.color}
                  onChange={(e) => setFormData({...formData, color: e.target.value})}
                  className="w-full px-4 py-2 border-2 border-black/20 rounded-lg focus:border-[#6C5CE7] focus:outline-none"
                >
                  <option value="from-blue-500 to-cyan-500">Blue to Cyan</option>
                  <option value="from-purple-500 to-pink-500">Purple to Pink</option>
                  <option value="from-green-500 to-emerald-500">Green to Emerald</option>
                  <option value="from-orange-500 to-red-500">Orange to Red</option>
                  <option value="from-yellow-500 to-orange-500">Yellow to Orange</option>
                  <option value="from-indigo-500 to-purple-500">Indigo to Purple</option>
                </select>
              </div>

              <div>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.enabled}
                    onChange={(e) => setFormData({...formData, enabled: e.target.checked})}
                    className="w-5 h-5"
                  />
                  <span className="text-black/80 font-bold text-sm">Enabled</span>
                </label>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleAddNew}
                disabled={saving || !formData.name}
                className="px-6 py-3 bg-[#6C5CE7] text-white font-black text-sm uppercase rounded-xl border-2 border-black neo-shadow hover:translate-x-[4px] hover:translate-y-[4px] hover:shadow-none disabled:opacity-50 transition-all"
              >
                CREATE VOUCHER
              </button>
              <button
                onClick={() => setShowAddForm(false)}
                className="px-6 py-3 bg-white text-black font-black text-sm uppercase rounded-xl border-2 border-black neo-shadow hover:translate-x-[4px] hover:translate-y-[4px] hover:shadow-none transition-all"
              >
                CANCEL
              </button>
            </div>
          </div>
        )}

        {/* Vouchers List */}
        <div className="space-y-6">
          {vouchers.map((voucher) => (
            <div key={voucher.id} className="bg-white border-2 border-black p-6 rounded-[30px] neo-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${voucher.color} flex items-center justify-center text-3xl border-2 border-black`}>
                    {voucher.icon}
                  </div>
                  <div>
                    <h3 className="font-header text-xl text-black">{voucher.name}</h3>
                    <p className="text-black/60 text-sm">{voucher.description}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleDelete(voucher.id)}
                    disabled={saving}
                    className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-all"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-black/40 font-bold uppercase text-xs">Cost</p>
                  <p className="text-black font-black">{voucher.pointsCost} JP</p>
                </div>
                <div>
                  <p className="text-black/40 font-bold uppercase text-xs">Discount</p>
                  <p className="text-black font-black">
                    {voucher.discountType === 'percentage' ? `${voucher.discountValue}%` : `₹${voucher.discountValue}`}
                  </p>
                </div>
                <div>
                  <p className="text-black/40 font-bold uppercase text-xs">Min Purchase</p>
                  <p className="text-black font-black">₹{voucher.minPurchase}</p>
                </div>
                <div>
                  <p className="text-black/40 font-bold uppercase text-xs">Status</p>
                  <span className={`inline-block px-2 py-1 rounded text-xs font-bold ${voucher.enabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                    {voucher.enabled ? 'ACTIVE' : 'DISABLED'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {vouchers.length === 0 && !showAddForm && (
          <div className="text-center py-12">
            <p className="text-black/40 font-bold text-lg">No vouchers created yet</p>
            <p className="text-black/60 text-sm mt-2">Click "Add New Voucher" to get started</p>
          </div>
        )}
      </div>
    </div>
  );
}
