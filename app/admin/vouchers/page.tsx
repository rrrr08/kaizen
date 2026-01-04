'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import { Plus, Edit2, Trash2, Save, Ticket, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

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
      ...formData as VoucherTemplate,
      id: `voucher_${Date.now()}`
    };
    handleSave(newVoucher);
  };

  const handleInitializeDefaults = async () => {
    if (!user || !confirm('Initialize default vouchers? This will add 6 pre-configured vouchers.')) return;

    setSaving(true);
    try {
      const token = await user.getIdToken();
      const response = await fetch('/api/admin/initialize-vouchers', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(`✅ ${data.message}`);
        fetchVouchers();
      } else {
        setMessage(`❌ ${data.error || 'Failed to initialize vouchers'}`);
      }
    } catch (error) {
      setMessage('❌ Network error');
    } finally {
      setSaving(false);
      setTimeout(() => setMessage(''), 5000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FFFDF5] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-black border-t-[#FFD93D] rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-black font-black text-xl uppercase tracking-wider">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center gap-4 mb-4">
          <div className="p-3 bg-[#FFD93D] border-4 border-black rounded-2xl neo-shadow">
            <Ticket className="w-8 h-8 text-black" />
          </div>
          <div>
            <h1 className="font-header text-5xl font-black text-black tracking-tight">VOUCHER MANAGEMENT</h1>
            <p className="text-black/60 font-bold uppercase tracking-wider text-sm">Create & Manage Reward Vouchers</p>
          </div>
        </div>
      </motion.div>

      {/* Message */}
      {message && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`mb-6 p-4 rounded-2xl border-4 border-black font-bold flex items-center gap-3 ${message.startsWith('✅')
              ? 'bg-[#00B894] text-white'
              : 'bg-[#FF6B6B] text-white'
            }`}
        >
          <AlertCircle className="w-5 h-5" />
          <p className="font-black">{message}</p>
        </motion.div>
      )}

      {/* Add New Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-8 flex gap-3"
      >
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-3 px-6 py-4 bg-[#00B894] text-white font-black text-sm uppercase tracking-wider rounded-2xl border-4 border-black neo-shadow-hover transition-all"
        >
          <Plus size={24} />
          ADD NEW VOUCHER
        </button>

        <button
          onClick={handleInitializeDefaults}
          disabled={saving}
          className="flex items-center gap-3 px-6 py-4 bg-[#FFD93D] text-black font-black text-sm uppercase tracking-wider rounded-2xl border-4 border-black neo-shadow-hover transition-all disabled:opacity-50"
        >
          <Ticket size={24} />
          INITIALIZE DEFAULTS
        </button>
      </motion.div>

      {/* Add Form */}
      {showAddForm && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 bg-white border-4 border-black p-8 rounded-3xl neo-shadow"
        >
          <h2 className="font-header text-3xl font-black text-black mb-6">CREATE NEW VOUCHER</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-black/60 mb-2">Voucher Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 bg-white border-3 border-black rounded-xl font-bold focus:outline-none focus:ring-4 focus:ring-[#FFD93D]"
                placeholder="e.g., 20% Off Shop"
              />
            </div>

            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-black/60 mb-2">Icon (Emoji)</label>
              <input
                type="text"
                value={formData.icon}
                onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                className="w-full px-4 py-3 bg-white border-3 border-black rounded-xl font-bold text-2xl text-center focus:outline-none focus:ring-4 focus:ring-[#FFD93D]"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-black uppercase tracking-wider text-black/60 mb-2">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-3 bg-white border-3 border-black rounded-xl font-bold focus:outline-none focus:ring-4 focus:ring-[#FFD93D]"
                rows={2}
                placeholder="Describe the voucher benefits"
              />
            </div>

            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-black/60 mb-2">Points Cost</label>
              <input
                type="number"
                value={formData.pointsCost}
                onChange={(e) => setFormData({ ...formData, pointsCost: parseInt(e.target.value) })}
                className="w-full px-4 py-3 bg-white border-3 border-black rounded-xl font-bold focus:outline-none focus:ring-4 focus:ring-[#FFD93D]"
              />
            </div>

            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-black/60 mb-2">Discount Type</label>
              <select
                value={formData.discountType}
                onChange={(e) => setFormData({ ...formData, discountType: e.target.value as 'percentage' | 'fixed' })}
                className="w-full px-4 py-3 bg-white border-3 border-black rounded-xl font-bold focus:outline-none focus:ring-4 focus:ring-[#FFD93D]"
              >
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed Amount (₹)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-black/60 mb-2">
                Discount Value {formData.discountType === 'percentage' ? '(%)' : '(₹)'}
              </label>
              <input
                type="number"
                value={formData.discountValue}
                onChange={(e) => setFormData({ ...formData, discountValue: parseInt(e.target.value) })}
                className="w-full px-4 py-3 bg-white border-3 border-black rounded-xl font-bold focus:outline-none focus:ring-4 focus:ring-[#FFD93D]"
              />
            </div>

            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-black/60 mb-2">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as 'shop' | 'events' | 'experiences' })}
                className="w-full px-4 py-3 bg-white border-3 border-black rounded-xl font-bold focus:outline-none focus:ring-4 focus:ring-[#FFD93D]"
              >
                <option value="shop">🛍️ Shop</option>
                <option value="events">🎫 Events</option>
                <option value="experiences">🎮 Experiences</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-black/60 mb-2">Min Purchase (₹)</label>
              <input
                type="number"
                value={formData.minPurchase}
                onChange={(e) => setFormData({ ...formData, minPurchase: parseInt(e.target.value) })}
                className="w-full px-4 py-3 bg-white border-3 border-black rounded-xl font-bold focus:outline-none focus:ring-4 focus:ring-[#FFD93D]"
                placeholder="0 = No minimum"
              />
            </div>

            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-black/60 mb-2">Max Discount (₹)</label>
              <input
                type="number"
                value={formData.maxDiscount || ''}
                onChange={(e) => setFormData({ ...formData, maxDiscount: e.target.value ? parseInt(e.target.value) : undefined })}
                className="w-full px-4 py-3 bg-white border-3 border-black rounded-xl font-bold focus:outline-none focus:ring-4 focus:ring-[#FFD93D]"
                placeholder="Optional"
              />
            </div>

            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-black/60 mb-2">Expiry (Days)</label>
              <input
                type="number"
                value={formData.expiryDays}
                onChange={(e) => setFormData({ ...formData, expiryDays: parseInt(e.target.value) })}
                className="w-full px-4 py-3 bg-white border-3 border-black rounded-xl font-bold focus:outline-none focus:ring-4 focus:ring-[#FFD93D]"
              />
            </div>

            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-black/60 mb-2">Enabled</label>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.enabled}
                  onChange={(e) => setFormData({ ...formData, enabled: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-14 h-8 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#FFD93D] rounded-full peer border-3 border-black peer-checked:after:translate-x-6 peer-checked:after:border-black after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-black after:border-3 after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-[#00B894]"></div>
              </label>
            </div>
          </div>

          <div className="flex gap-3 mt-8">
            <button
              onClick={handleAddNew}
              disabled={saving || !formData.name}
              className="px-8 py-4 bg-[#6C5CE7] text-white font-black text-sm uppercase rounded-2xl border-4 border-black neo-shadow-hover disabled:opacity-50 transition-all"
            >
              {saving ? 'CREATING...' : 'CREATE VOUCHER'}
            </button>
            <button
              onClick={() => setShowAddForm(false)}
              className="px-8 py-4 bg-white text-black font-black text-sm uppercase rounded-2xl border-4 border-black neo-shadow-hover transition-all"
            >
              CANCEL
            </button>
          </div>
        </motion.div>
      )}

      {/* Vouchers List */}
      <div className="space-y-6">
        {vouchers.map((voucher, index) => (
          <motion.div
            key={voucher.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 * index }}
            className="bg-white border-4 border-black p-6 rounded-3xl neo-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className="text-5xl">{voucher.icon}</div>
                <div>
                  <h3 className="font-header text-2xl font-black text-black">{voucher.name}</h3>
                  <p className="text-black/60 font-bold text-sm">{voucher.description}</p>
                </div>
              </div>
              <button
                onClick={() => handleDelete(voucher.id)}
                disabled={saving}
                className="p-3 text-white bg-[#FF6B6B] hover:bg-[#ff5252] rounded-xl border-3 border-black transition-all disabled:opacity-50"
              >
                <Trash2 size={20} />
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="bg-[#FFFDF5] border-3 border-black rounded-xl p-3">
                <p className="text-black/40 font-black uppercase text-xs mb-1">Cost</p>
                <p className="text-black font-black text-lg">{voucher.pointsCost} JP</p>
              </div>
              <div className="bg-[#FFFDF5] border-3 border-black rounded-xl p-3">
                <p className="text-black/40 font-black uppercase text-xs mb-1">Discount</p>
                <p className="text-black font-black text-lg">
                  {voucher.discountType === 'percentage' ? `${voucher.discountValue}%` : `₹${voucher.discountValue}`}
                </p>
              </div>
              <div className="bg-[#FFFDF5] border-3 border-black rounded-xl p-3">
                <p className="text-black/40 font-black uppercase text-xs mb-1">Min Purchase</p>
                <p className="text-black font-black text-lg">₹{voucher.minPurchase}</p>
              </div>
              <div className="bg-[#FFFDF5] border-3 border-black rounded-xl p-3">
                <p className="text-black/40 font-black uppercase text-xs mb-1">Expiry</p>
                <p className="text-black font-black text-lg">{voucher.expiryDays}d</p>
              </div>
              <div className="bg-[#FFFDF5] border-3 border-black rounded-xl p-3">
                <p className="text-black/40 font-black uppercase text-xs mb-1">Status</p>
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-black uppercase ${voucher.enabled ? 'bg-[#00B894] text-white' : 'bg-gray-400 text-white'}`}>
                  {voucher.enabled ? 'ACTIVE' : 'DISABLED'}
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {vouchers.length === 0 && !showAddForm && (
        <div className="text-center py-16 bg-white border-4 border-black rounded-3xl neo-shadow">
          <p className="text-black/40 font-black text-2xl mb-2">NO VOUCHERS YET</p>
          <p className="text-black/60 font-bold text-sm">Click &quot;Add New Voucher&quot; to create your first reward</p>
        </div>
      )}
    </div>
  );
}
