'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import { usePopup } from '@/app/context/PopupContext';
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
  category: 'shop' | 'events' | 'experiences' | 'all';
  expiryDays: number;
  minPurchase: number;
  maxDiscount?: number;
  enabled: boolean;
  usageLimit?: number;
}

export default function AdminVouchersPage() {
  const { user } = useAuth();
  const { showConfirm } = usePopup();
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

  const [isIconDropdownOpen, setIsIconDropdownOpen] = useState(false);

  const SUGGESTED_ICONS = [
    '🎁', '🎟️', '🎫', '🛍️', '🎮', '🍔', '☕', '👕', '💎', '✨',
    '🌟', '🌈', '🍕', '🍰', '🚗', '🎬', '👗', '👟', '🕶️', '🧴',
    '📱', '🎧', '📷', '📚', '🎒', '🎨', '🎸', '⚽', '🏆', '🔥'
  ];



  const categoryIconMap: Record<string, string> = {
    shop: '🛍️',
    events: '🎫',
    experiences: '🎮',
    all: '🌟'
  };


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

  const handleToggleEnabled = async (voucher: VoucherTemplate) => {
    if (!user) return;

    const updatedVoucher = { ...voucher, enabled: !voucher.enabled };
    await handleSave(updatedVoucher);
  };

  const handleDelete = async (id: string) => {
    if (!user) return;

    const confirmed = await showConfirm('Delete this voucher? This action cannot be undone.', 'Delete Voucher');
    if (!confirmed) return;

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
    const randomSuffix = Math.random().toString(36).substring(2, 7).toUpperCase();
    const newVoucher: VoucherTemplate = {
      ...formData as VoucherTemplate,
      id: `voucher_${Date.now()}_${randomSuffix}`,
    };
    handleSave(newVoucher);
  };

  const handleInitializeDefaults = async () => {
    if (!user) return;

    const confirmed = await showConfirm('Initialize default vouchers? This will add 6 pre-configured vouchers.', 'Initialize Vouchers');
    if (!confirmed) return;

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
    <div className="px-3 py-4 pb-16 md:p-8 md:max-w-7xl mx-auto overflow-x-hidden min-h-screen">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex flex-col md:flex-row items-center gap-4 mb-4 text-center md:text-left">
          <div className="p-3 bg-[#FFD93D] border-3 md:border-4 border-black rounded-2xl neo-shadow inline-block">
            <Ticket className="w-6 h-6 md:w-8 md:h-8 text-black" />
          </div>
          <div>
            <h1 className="font-header text-3xl md:text-5xl font-black text-[#2D3436] tracking-tight uppecase">VOUCHER MANAGEMENT</h1>
            <p className="text-[#2D3436]/60 font-bold uppercase tracking-wider text-xs md:text-sm">Create & Manage Reward Vouchers</p>
          </div>
        </div>
      </motion.div>

      {/* Message */}
      {message && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`mb-6 p-4 rounded-2xl border-3 md:border-4 border-black font-bold flex items-center gap-3 ${message.startsWith('✅')
            ? 'bg-[#00B894] text-white'
            : 'bg-[#FF6B6B] text-white'
            }`}
        >
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p className="font-black text-sm md:text-base">{message}</p>
        </motion.div>
      )}

      {/* Add New Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-8 flex flex-col md:flex-row gap-3"
      >
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center justify-center gap-3 px-6 py-4 bg-[#00B894] text-white font-black text-sm uppercase tracking-wider rounded-2xl border-3 md:border-4 border-black neo-shadow-hover transition-all"
        >
          <Plus size={24} />
          ADD NEW VOUCHER
        </button>

        <button
          onClick={handleInitializeDefaults}
          disabled={saving}
          className="flex items-center justify-center gap-3 px-6 py-4 bg-[#FFD93D] text-black font-black text-sm uppercase tracking-wider rounded-2xl border-3 md:border-4 border-black neo-shadow-hover transition-all disabled:opacity-50"
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
          className="mb-8 bg-white border-3 md:border-4 border-black p-4 md:p-8 rounded-3xl neo-shadow"
        >
          <h2 className="font-header text-xl md:text-3xl font-black text-[#2D3436] mb-6">CREATE NEW VOUCHER</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
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
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsIconDropdownOpen(!isIconDropdownOpen)}
                  className="w-full flex items-center justify-between px-6 py-4 bg-white border-3 border-black rounded-xl font-black text-3xl neo-shadow hover:bg-gray-50 transition-all"
                >
                  <span className="flex-1 text-center ml-6">{formData.icon}</span>
                  <div className={`transition-transform duration-200 ${isIconDropdownOpen ? 'rotate-180' : ''}`}>
                    <Plus size={24} className="text-black/40 rotate-45" />
                  </div>
                </button>

                {isIconDropdownOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setIsIconDropdownOpen(false)}
                    />
                    <div className="absolute top-full left-0 right-0 mt-3 p-4 bg-white border-4 border-black rounded-2xl neo-shadow z-20 max-h-64 overflow-y-auto grid grid-cols-6 gap-2">
                      {SUGGESTED_ICONS.map(emoji => (
                        <button
                          key={emoji}
                          type="button"
                          onClick={() => {
                            setFormData({ ...formData, icon: emoji });
                            setIsIconDropdownOpen(false);
                          }}
                          className={`text-2xl p-3 rounded-xl hover:bg-[#FFD93D] transition-all border-2 border-transparent ${formData.icon === emoji ? 'bg-[#FFD93D] !border-black' : ''}`}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
              <p className="mt-2 text-[10px] font-bold text-black/40 uppercase tracking-widest text-center">Click to change icon</p>
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
                onChange={(e) => {
                  const newCat = e.target.value as any;
                  setFormData({
                    ...formData,
                    category: newCat,
                    icon: categoryIconMap[newCat] || formData.icon
                  });
                }}
                className="w-full px-4 py-3 bg-white border-3 border-black rounded-xl font-bold focus:outline-none focus:ring-4 focus:ring-[#FFD93D]"
              >
                <option value="shop">🛍️ Shop</option>
                <option value="events">🎫 Events</option>
                <option value="experiences">🎮 Experiences</option>
                <option value="all">🌟 All Categories</option>
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

          <div className="flex flex-col md:flex-row gap-3 mt-8">
            <button
              onClick={handleAddNew}
              disabled={saving || !formData.name}
              className="px-8 py-4 bg-[#6C5CE7] text-white font-black text-sm uppercase rounded-2xl border-4 border-black neo-shadow-hover disabled:opacity-50 transition-all flex-1"
            >
              {saving ? 'CREATING...' : 'CREATE VOUCHER'}
            </button>
            <button
              onClick={() => setShowAddForm(false)}
              className="px-8 py-4 bg-white text-black font-black text-sm uppercase rounded-2xl border-4 border-black neo-shadow-hover transition-all flex-1 md:flex-none"
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
            className="bg-white border-3 md:border-4 border-black p-4 md:p-6 rounded-3xl neo-shadow overflow-hidden"
          >
            <div className="flex flex-col md:flex-row md:items-start justify-between mb-4 gap-4">
              <div className="flex items-start gap-4">
                <div className="text-4xl md:text-5xl">{voucher.icon}</div>
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h3 className="font-header text-xl md:text-2xl font-black text-[#2D3436]">{voucher.name}</h3>
                    <span className={`px-2 py-0.5 rounded-lg text-[10px] md:text-xs font-black uppercase border-2 border-black ${voucher.category === 'shop' ? 'bg-[#FFD93D] text-black' :
                      voucher.category === 'events' ? 'bg-[#6C5CE7] text-white' :
                        voucher.category === 'experiences' ? 'bg-[#00B894] text-white' :
                          'bg-gradient-to-r from-[#FFD93D] via-[#6C5CE7] to-[#00B894] text-white'
                      }`}>
                      {voucher.category === 'shop' ? '🛍️ SHOP' :
                        voucher.category === 'events' ? '🎫 EVENTS' :
                          voucher.category === 'experiences' ? '🎮 EXPERIENCES' :
                            '🌟 ALL'}
                    </span>
                  </div>
                  <p className="text-[#2D3436]/60 font-bold text-xs md:text-sm">{voucher.description}</p>
                </div>
              </div>
              <div className="flex items-center justify-between md:justify-end gap-2 mt-2 md:mt-0">
                {/* Toggle Switch */}
                <div className="flex items-center gap-2 md:flex-col md:items-center">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={voucher.enabled}
                      onChange={() => handleToggleEnabled(voucher)}
                      disabled={saving}
                      className="sr-only peer"
                    />
                    <div className="w-12 h-6 md:w-14 md:h-8 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#FFD93D] rounded-full peer border-3 border-black peer-checked:after:translate-x-6 peer-checked:after:border-black after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-black after:border-3 after:rounded-full after:h-5 md:after:h-6 after:w-5 md:after:w-6 after:transition-all peer-checked:bg-[#00B894]"></div>
                  </label>
                  <span className="text-xs font-bold text-[#2D3436]/60">{voucher.enabled ? 'ON' : 'OFF'}</span>
                </div>
                {/* Delete Button */}
                <button
                  onClick={() => handleDelete(voucher.id)}
                  disabled={saving}
                  className="p-2 md:p-3 text-white bg-[#FF6B6B] hover:bg-[#ff5252] rounded-xl border-3 border-black transition-all disabled:opacity-50"
                  title="Delete Permanently"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 md:gap-4">
              <div className="bg-[#FFFDF5] border-3 border-black rounded-xl p-3">
                <p className="text-[#2D3436]/40 font-black uppercase text-[10px] md:text-xs mb-1">Cost</p>
                <p className="text-[#2D3436] font-black text-base md:text-lg">{voucher.pointsCost} JP</p>
              </div>
              <div className="bg-[#FFFDF5] border-3 border-black rounded-xl p-3">
                <p className="text-[#2D3436]/40 font-black uppercase text-[10px] md:text-xs mb-1">Discount</p>
                <p className="text-[#2D3436] font-black text-base md:text-lg">
                  {voucher.discountType === 'percentage' ? `${voucher.discountValue}%` : `₹${voucher.discountValue}`}
                </p>
              </div>
              <div className="bg-[#FFFDF5] border-3 border-black rounded-xl p-3">
                <p className="text-[#2D3436]/40 font-black uppercase text-[10px] md:text-xs mb-1">Min Purchase</p>
                <p className="text-[#2D3436] font-black text-base md:text-lg">₹{voucher.minPurchase}</p>
              </div>
              <div className="bg-[#FFFDF5] border-3 border-black rounded-xl p-3">
                <p className="text-[#2D3436]/40 font-black uppercase text-[10px] md:text-xs mb-1">Expiry</p>
                <p className="text-[#2D3436] font-black text-base md:text-lg">{voucher.expiryDays}d</p>
              </div>
              <div className="bg-[#FFFDF5] border-3 border-black rounded-xl p-3 col-span-2 lg:col-span-1">
                <p className="text-[#2D3436]/40 font-black uppercase text-[10px] md:text-xs mb-1">Status</p>
                <span className={`inline-block px-3 py-1 rounded-full text-[10px] md:text-xs font-black uppercase ${voucher.enabled ? 'bg-[#00B894] text-white' : 'bg-gray-400 text-white'}`}>
                  {voucher.enabled ? 'ACTIVE' : 'DISABLED'}
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {vouchers.length === 0 && !showAddForm && (
        <div className="text-center py-16 bg-white border-4 border-black rounded-3xl neo-shadow">
          <p className="text-[#2D3436]/40 font-black text-xl md:text-2xl mb-2">NO VOUCHERS YET</p>
          <p className="text-[#2D3436]/60 font-bold text-xs md:text-sm">Click &quot;Add New Voucher&quot; to create your first reward</p>
        </div>
      )}
    </div>
  );
}
