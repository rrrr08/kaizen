'use client';

import { useEffect, useState } from 'react';
import { LayoutGrid, Plus, Edit2, Trash2, Search, Filter, X, ShoppingBag, DollarSign, Activity, Package } from 'lucide-react';
import { getDocs, collection, deleteDoc, doc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface Product {
  id: string;
  name: string;
  price: number;
  cost: number;
  stock: number;
  category: string;
  image: string;
  rating: number;
  sales: number;
}

interface FormData {
  name: string;
  price: string;
  cost: string;
  stock: string;
  category: string;
  image: string;
  rating: string;
  sales: string;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'apparel' | 'accessories' | 'collectibles'>('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    price: '',
    cost: '',
    stock: '',
    category: 'apparel',
    image: '',
    rating: '0',
    sales: '0',
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'products'));
      const productsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Product));
      setProducts(productsData);
    } catch (error) {
      console.error('Error fetching products:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingId(null);
    setFormData({
      name: '',
      price: '',
      cost: '',
      stock: '',
      category: 'apparel',
      image: '',
      rating: '0',
      sales: '0',
    });
    setShowAddForm(true);
  };

  const handleEdit = (product: Product) => {
    setEditingId(product.id);
    setFormData({
      name: product.name,
      price: product.price.toString(),
      cost: product.cost.toString(),
      stock: product.stock.toString(),
      category: product.category,
      image: product.image,
      rating: product.rating.toString(),
      sales: product.sales.toString(),
    });
    setShowAddForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      await deleteDoc(doc(db, 'products', id));
      setProducts(products.filter(p => p.id !== id));
      alert('Product deleted successfully!');
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Failed to delete product');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.price || !formData.cost || !formData.stock) {
      alert('Please fill in all required fields');
      return;
    }

    setSubmitting(true);
    try {
      const productData = {
        name: formData.name,
        price: parseFloat(formData.price),
        cost: parseFloat(formData.cost),
        stock: parseInt(formData.stock),
        category: formData.category,
        image: formData.image,
        rating: parseFloat(formData.rating),
        sales: parseInt(formData.sales),
        updatedAt: new Date().toISOString(),
      };

      if (editingId) {
        // Update existing product
        await updateDoc(doc(db, 'products', editingId), productData);
        setProducts(products.map(p => p.id === editingId ? { ...p, ...productData } : p));
        alert('Product updated successfully!');
      } else {
        // Create new product
        const newDocRef = doc(collection(db, 'products'));
        await setDoc(newDocRef, {
          ...productData,
          createdAt: new Date().toISOString(),
        });
        setProducts([...products, { id: newDocRef.id, ...productData } as any]);
        alert('Product created successfully!');
      }

      setShowAddForm(false);
      setEditingId(null);
    } catch (error) {
      console.error('Error saving product:', error);
      alert('Failed to save product');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const totalValue = filteredProducts.reduce((sum, p) => sum + (p.price * p.stock), 0);
  const totalProfit = filteredProducts.reduce((sum, p) => sum + ((p.price - p.cost) * p.sales), 0);
  const outOfStock = filteredProducts.filter(p => p.stock === 0).length;

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen bg-[#050505]">
        <div className="text-center">
          <div className="text-[#FFD400] font-arcade tracking-[0.3em] animate-pulse text-xl">
            LOADING_INVENTORY...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 pb-16 text-white min-h-screen bg-[#050505]">
      {/* Header */}
      <div className="flex items-center justify-between mb-12 border-b-2 border-[#333] pb-6">
        <div>
          <h1 className="font-arcade text-5xl text-white mb-2 text-3d-orange">INVENTORY_CONTROL</h1>
          <p className="text-gray-500 font-sans text-lg tracking-wide uppercase">Manage system assets and merchandise</p>
        </div>
        <button
          onClick={handleAdd}
          className="px-6 py-3 bg-[#FFD400] text-black font-arcade text-sm font-bold rounded-sm hover:bg-[#FFE066] transition flex items-center gap-2 uppercase tracking-wider"
        >
          <Plus className="w-5 h-5" />
          ADD_ASSET
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
        <div className="bg-[#080808] border-2 border-[#333] rounded-[4px] p-6 hover:border-[#FFD400]/30 transition-colors">
          <div className="flex items-center gap-2 mb-2 text-gray-500 text-xs font-mono uppercase">
            <LayoutGrid className="w-4 h-4" /> Total Items
          </div>
          <p className="font-arcade text-4xl text-[#FFD400] text-shadow-glow">{filteredProducts.length}</p>
        </div>
        <div className="bg-[#080808] border-2 border-[#333] rounded-[4px] p-6 hover:border-red-500/30 transition-colors">
          <div className="flex items-center gap-2 mb-2 text-gray-500 text-xs font-mono uppercase">
            <Activity className="w-4 h-4" /> Stock Critical
          </div>
          <p className="font-arcade text-4xl text-red-500 text-shadow-glow">{outOfStock}</p>
        </div>
        <div className="bg-[#080808] border-2 border-[#333] rounded-[4px] p-6 hover:border-blue-500/30 transition-colors">
          <div className="flex items-center gap-2 mb-2 text-gray-500 text-xs font-mono uppercase">
            <DollarSign className="w-4 h-4" /> Asset Value
          </div>
          <p className="font-arcade text-3xl text-blue-400 text-shadow-glow">₹{(totalValue / 100000).toFixed(1)}L</p>
        </div>
        <div className="bg-[#080808] border-2 border-[#333] rounded-[4px] p-6 hover:border-[#00B894]/30 transition-colors">
          <div className="flex items-center gap-2 mb-2 text-gray-500 text-xs font-mono uppercase">
            <ShoppingBag className="w-4 h-4" /> Revenue
          </div>
          <p className="font-arcade text-3xl text-[#00B894] text-shadow-glow">₹{(totalProfit / 100000).toFixed(1)}L</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-[#111] border border-[#333] rounded-sm p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-[#00B894] text-xs font-mono uppercase tracking-widest mb-2">
              <Search className="w-3 h-3 inline mr-2" />
              SEARCH_ASSETS
            </label>
            <input
              type="text"
              placeholder="ENTER PRODUCT NAME..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-black border border-[#333] rounded-sm px-4 py-2 text-white font-mono placeholder-gray-700 focus:border-[#FFD400] outline-none transition uppercase"
            />
          </div>
          <div>
            <label className="block text-[#00B894] text-xs font-mono uppercase tracking-widest mb-2">
              <Filter className="w-3 h-3 inline mr-2" />
              CATEGORY_PROTOCOL
            </label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value as any)}
              className="w-full bg-black border border-[#333] rounded-sm px-4 py-2 text-white font-mono focus:border-[#FFD400] outline-none transition uppercase appearance-none cursor-pointer"
            >
              <option value="all">ALL_CATEGORIES</option>
              <option value="apparel">APPAREL</option>
              <option value="accessories">ACCESSORIES</option>
              <option value="collectibles">COLLECTIBLES</option>
            </select>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map((product) => (
          <div
            key={product.id}
            className="bg-[#080808] border-2 border-[#333] rounded-[4px] overflow-hidden hover:border-[#FFD400] transition-colors group"
          >
            {/* Image */}
            <div className="relative h-48 bg-[#111] overflow-hidden border-b-2 border-[#333]">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
              />
              <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.1)_1px,transparent_1px)] bg-[size:4px_4px] pointer-events-none"></div>
              <div className="absolute top-3 right-3 bg-black/80 backdrop-blur px-2 py-1 rounded-sm border border-[#333]">
                <p className="text-[#FFD400] font-mono text-xs">RATING: {product.rating}</p>
              </div>
              {product.stock === 0 && (
                <div className="absolute inset-0 bg-black/80 flex items-center justify-center border-2 border-red-500 m-2">
                  <p className="text-red-500 font-arcade text-lg tracking-widest animate-pulse">OUT_OF_STOCK</p>
                </div>
              )}
            </div>

            {/* Details */}
            <div className="p-6">
              <h3 className="font-arcade text-lg text-white mb-2 tracking-wide truncate">{product.name}</h3>

              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-[#FFD400] font-mono text-lg">₹{product.price.toLocaleString()}</p>
                  <p className="text-gray-600 font-mono text-[10px] uppercase">COST_BASIS: ₹{product.cost}</p>
                </div>
                <div className="text-right">
                  <p className="text-gray-600 font-mono text-[10px] uppercase">UNITS_SOLD</p>
                  <p className="text-[#00B894] font-mono">{product.sales}</p>
                </div>
              </div>

              {/* Stock Bar */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-gray-500 font-mono text-[10px] uppercase">INVENTORY_LEVEL</p>
                  <p className={`font-mono text-xs ${product.stock <= 10 ? 'text-red-500' : 'text-[#00B894]'}`}>
                    {product.stock} UNITS
                  </p>
                </div>
                <div className="w-full h-1.5 bg-[#111] rounded-full overflow-hidden border border-[#333]">
                  <div
                    className={`h-full ${product.stock <= 10 ? 'bg-red-500' : 'bg-[#00B894]'}`}
                    style={{ width: `${Math.min((product.stock / 100) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>

              <div className="flex items-center gap-2 mb-6 p-2 bg-[#111] rounded-sm border border-[#222]">
                <DollarSign className="w-3 h-3 text-[#00B894]" />
                <p className="text-gray-400 font-mono text-[10px] uppercase">
                  NET_PROFIT: <span className="text-white">₹{((product.price - product.cost) * product.sales).toLocaleString()}</span>
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-3 border-t border-[#222] pt-4">
                <button
                  onClick={() => handleEdit(product)}
                  className="flex-1 px-3 py-2 bg-[#111] border border-[#333] rounded-sm text-gray-300 font-mono text-xs uppercase hover:border-[#FFD400] hover:text-[#FFD400] transition flex items-center justify-center gap-2 group/btn"
                >
                  <Edit2 className="w-3 h-3 group-hover/btn:text-[#FFD400]" />
                  EDIT
                </button>
                <button
                  onClick={() => handleDelete(product.id)}
                  className="flex-1 px-3 py-2 bg-[#111] border border-red-900/40 rounded-sm text-red-500 font-mono text-xs uppercase hover:bg-red-900/10 hover:border-red-500 transition flex items-center justify-center gap-2"
                >
                  <Trash2 className="w-3 h-3" />
                  PURGE
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-24 border-2 border-dashed border-[#333] rounded-[4px]">
          <Package className="w-16 h-16 text-[#333] mx-auto mb-6" />
          <p className="text-gray-500 font-arcade tracking-widest">NO_ASSETS_FOUND_IN_DATABASE</p>
        </div>
      )}

      {/* Add/Edit Form Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-[#050505] border-2 border-[#333] rounded-[4px] max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-[0_0_50px_rgba(0,0,0,0.8)]">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b-2 border-[#333] sticky top-0 bg-[#050505] z-10">
              <h2 className="font-arcade text-2xl text-[#FFD400] text-shadow-glow">
                {editingId ? 'MODIFY_ASSET' : 'NEW_ASSET_ENTRY'}
              </h2>
              <button
                onClick={() => setShowAddForm(false)}
                className="text-gray-500 hover:text-red-500 transition"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Name */}
                <div>
                  <label className="block text-[#00B894] font-mono text-[10px] uppercase tracking-widest mb-2">ASSET_DESIGNATION *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-[#111] border border-[#333] rounded-sm px-4 py-2 text-white font-mono placeholder-gray-700 focus:border-[#FFD400] outline-none transition uppercase"
                    placeholder="ENTER NAME"
                    required
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-[#00B894] font-mono text-[10px] uppercase tracking-widest mb-2">CATEGORY_CLASS *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full bg-[#111] border border-[#333] rounded-sm px-4 py-2 text-white font-mono focus:border-[#FFD400] outline-none transition uppercase"
                    required
                  >
                    <option value="apparel">APPAREL</option>
                    <option value="accessories">ACCESSORIES</option>
                    <option value="collectibles">COLLECTIBLES</option>
                  </select>
                </div>

                {/* Price */}
                <div>
                  <label className="block text-[#00B894] font-mono text-[10px] uppercase tracking-widest mb-2">UNIT_PRICE (₹) *</label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full bg-[#111] border border-[#333] rounded-sm px-4 py-2 text-white font-mono placeholder-gray-700 focus:border-[#FFD400] outline-none transition"
                    placeholder="0"
                    step="0.01"
                    required
                  />
                </div>

                {/* Cost */}
                <div>
                  <label className="block text-[#00B894] font-mono text-[10px] uppercase tracking-widest mb-2">UNIT_COST (₹) *</label>
                  <input
                    type="number"
                    value={formData.cost}
                    onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                    className="w-full bg-[#111] border border-[#333] rounded-sm px-4 py-2 text-white font-mono placeholder-gray-700 focus:border-[#FFD400] outline-none transition"
                    placeholder="0"
                    step="0.01"
                    required
                  />
                </div>

                {/* Stock */}
                <div>
                  <label className="block text-[#00B894] font-mono text-[10px] uppercase tracking-widest mb-2">STOCK_LEVEL *</label>
                  <input
                    type="number"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    className="w-full bg-[#111] border border-[#333] rounded-sm px-4 py-2 text-white font-mono placeholder-gray-700 focus:border-[#FFD400] outline-none transition"
                    placeholder="0"
                    required
                  />
                </div>

                {/* Rating */}
                <div>
                  <label className="block text-[#00B894] font-mono text-[10px] uppercase tracking-widest mb-2">QUALITY_RATING</label>
                  <input
                    type="number"
                    value={formData.rating}
                    onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
                    className="w-full bg-[#111] border border-[#333] rounded-sm px-4 py-2 text-white font-mono placeholder-gray-700 focus:border-[#FFD400] outline-none transition"
                    placeholder="0"
                    min="0"
                    max="5"
                    step="0.1"
                  />
                </div>

                {/* Sales */}
                <div>
                  <label className="block text-[#00B894] font-mono text-[10px] uppercase tracking-widest mb-2">TOTAL_SALES</label>
                  <input
                    type="number"
                    value={formData.sales}
                    onChange={(e) => setFormData({ ...formData, sales: e.target.value })}
                    className="w-full bg-[#111] border border-[#333] rounded-sm px-4 py-2 text-white font-mono placeholder-gray-700 focus:border-[#FFD400] outline-none transition"
                    placeholder="0"
                  />
                </div>

                {/* Image URL */}
                <div className="md:col-span-2">
                  <label className="block text-[#00B894] font-mono text-[10px] uppercase tracking-widest mb-2">VISUAL_DATA_URL</label>
                  <input
                    type="url"
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    className="w-full bg-[#111] border border-[#333] rounded-sm px-4 py-2 text-white font-mono placeholder-gray-700 focus:border-[#FFD400] outline-none transition"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-4 pt-6 border-t border-[#333]">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="flex-1 px-4 py-3 bg-transparent border border-[#333] rounded-sm text-gray-400 font-arcade text-xs uppercase tracking-widest hover:text-white hover:border-gray-500 transition"
                >
                  CANCEL_OP
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-4 py-3 bg-[#FFD400] text-black font-arcade text-xs uppercase tracking-widest rounded-sm hover:bg-[#FFE066] transition disabled:opacity-50"
                >
                  {submitting ? 'PROCESSING...' : (editingId ? 'UPDATE_DATABASE' : 'REGISTER_ASSET')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
