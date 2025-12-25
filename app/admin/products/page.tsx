'use client';

import { useEffect, useState } from 'react';
import { LayoutGrid, Plus, Edit2, Trash2, Search, Filter, X } from 'lucide-react';
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
      <div className="p-8 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-amber-500">Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 pb-16">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-5xl font-bold text-white mb-2">Products Management</h1>
          <p className="text-white/60">Manage all products in your shop</p>
        </div>
        <button
          onClick={handleAdd}
          className="px-6 py-3 bg-amber-500 text-black font-header font-bold rounded hover:bg-amber-400 transition flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Add Product
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-purple-500/10 to-transparent border border-purple-500/20 rounded-lg p-6">
          <p className="text-white/60 text-sm mb-2">Total Products</p>
          <p className="font-display text-4xl font-bold text-purple-400">{filteredProducts.length}</p>
        </div>
        <div className="bg-gradient-to-br from-red-500/10 to-transparent border border-red-500/20 rounded-lg p-6">
          <p className="text-white/60 text-sm mb-2">Out of Stock</p>
          <p className="font-display text-4xl font-bold text-red-400">{outOfStock}</p>
        </div>
        <div className="bg-gradient-to-br from-blue-500/10 to-transparent border border-blue-500/20 rounded-lg p-6">
          <p className="text-white/60 text-sm mb-2">Total Value</p>
          <p className="font-display text-3xl font-bold text-blue-400">₹{(totalValue / 100000).toFixed(1)}L</p>
        </div>
        <div className="bg-gradient-to-br from-green-500/10 to-transparent border border-green-500/20 rounded-lg p-6">
          <p className="text-white/60 text-sm mb-2">Total Profit</p>
          <p className="font-display text-3xl font-bold text-green-400">₹{(totalProfit / 100000).toFixed(1)}L</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-black/40 border border-white/10 rounded-lg p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-white/60 text-sm mb-2">
              <Search className="w-4 h-4 inline mr-2" />
              Search Products
            </label>
            <input
              type="text"
              placeholder="Product name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded px-4 py-2 text-white placeholder-white/40 focus:border-amber-500 outline-none transition"
            />
          </div>
          <div>
            <label className="block text-white/60 text-sm mb-2">
              <Filter className="w-4 h-4 inline mr-2" />
              Category
            </label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value as any)}
              className="w-full bg-white/5 border border-white/10 rounded px-4 py-2 text-white focus:border-amber-500 outline-none transition"
            >
              <option value="all">All Categories</option>
              <option value="apparel">Apparel</option>
              <option value="accessories">Accessories</option>
              <option value="collectibles">Collectibles</option>
            </select>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map((product) => (
          <div
            key={product.id}
            className="bg-black/40 border border-white/10 rounded-lg overflow-hidden hover:border-amber-500/50 transition group"
          >
            {/* Image */}
            <div className="relative h-48 bg-white/5 overflow-hidden">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover group-hover:scale-110 transition duration-300"
              />
              <div className="absolute top-3 right-3 bg-black/60 backdrop-blur px-3 py-1 rounded-full">
                <p className="text-amber-400 font-semibold text-sm">⭐ {product.rating}</p>
              </div>
              {product.stock === 0 && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <p className="text-red-400 font-bold text-lg">OUT OF STOCK</p>
                </div>
              )}
            </div>

            {/* Details */}
            <div className="p-6">
              <h3 className="font-display text-xl font-bold text-white mb-2">{product.name}</h3>

              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-amber-400 font-semibold text-lg">₹{product.price.toLocaleString()}</p>
                  <p className="text-white/40 text-xs">Cost: ₹{product.cost}</p>
                </div>
                <div className="text-right">
                  <p className="text-white/60 text-xs">Sales</p>
                  <p className="text-green-400 font-semibold">{product.sales}</p>
                </div>
              </div>

              {/* Stock Bar */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-white/60 text-xs">Stock</p>
                  <p className={product.stock <= 10 ? 'text-red-400 font-semibold' : 'text-green-400 font-semibold'}>
                    {product.stock}
                  </p>
                </div>
                <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${product.stock <= 10 ? 'bg-red-500' : 'bg-green-500'}`}
                    style={{ width: `${Math.min((product.stock / 100) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>

              <p className="text-white/60 text-xs mb-4">
                <span className="text-amber-400 font-semibold">
                  ₹{((product.price - product.cost) * product.sales).toLocaleString()}
                </span>
                {' '}profit from sales
              </p>

              {/* Actions */}
              <div className="flex gap-2">
                <button 
                  onClick={() => handleEdit(product)}
                  className="flex-1 px-3 py-2 bg-blue-500/10 border border-blue-500/20 rounded text-blue-400 text-sm font-semibold hover:bg-blue-500/20 transition flex items-center justify-center gap-2"
                >
                  <Edit2 className="w-4 h-4" />
                  Edit
                </button>
                <button 
                  onClick={() => handleDelete(product.id)}
                  className="flex-1 px-3 py-2 bg-red-500/10 border border-red-500/20 rounded text-red-400 text-sm font-semibold hover:bg-red-500/20 transition flex items-center justify-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-12">
          <LayoutGrid className="w-12 h-12 text-white/20 mx-auto mb-4" />
          <p className="text-white/60">No products found</p>
        </div>
      )}

      {/* Add/Edit Form Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-black border border-white/10 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/10 sticky top-0 bg-black">
              <h2 className="font-display text-2xl font-bold text-white">
                {editingId ? 'Edit Product' : 'Add New Product'}
              </h2>
              <button
                onClick={() => setShowAddForm(false)}
                className="text-white/60 hover:text-white transition"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Name */}
                <div>
                  <label className="block text-white/60 text-sm mb-2">Product Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded px-4 py-2 text-white placeholder-white/40 focus:border-amber-500 outline-none transition"
                    placeholder="Enter product name"
                    required
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-white/60 text-sm mb-2">Category *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded px-4 py-2 text-white focus:border-amber-500 outline-none transition"
                    required
                  >
                    <option value="apparel">Apparel</option>
                    <option value="accessories">Accessories</option>
                    <option value="collectibles">Collectibles</option>
                  </select>
                </div>

                {/* Price */}
                <div>
                  <label className="block text-white/60 text-sm mb-2">Price (₹) *</label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded px-4 py-2 text-white placeholder-white/40 focus:border-amber-500 outline-none transition"
                    placeholder="0"
                    step="0.01"
                    required
                  />
                </div>

                {/* Cost */}
                <div>
                  <label className="block text-white/60 text-sm mb-2">Cost (₹) *</label>
                  <input
                    type="number"
                    value={formData.cost}
                    onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded px-4 py-2 text-white placeholder-white/40 focus:border-amber-500 outline-none transition"
                    placeholder="0"
                    step="0.01"
                    required
                  />
                </div>

                {/* Stock */}
                <div>
                  <label className="block text-white/60 text-sm mb-2">Stock *</label>
                  <input
                    type="number"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded px-4 py-2 text-white placeholder-white/40 focus:border-amber-500 outline-none transition"
                    placeholder="0"
                    required
                  />
                </div>

                {/* Rating */}
                <div>
                  <label className="block text-white/60 text-sm mb-2">Rating</label>
                  <input
                    type="number"
                    value={formData.rating}
                    onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded px-4 py-2 text-white placeholder-white/40 focus:border-amber-500 outline-none transition"
                    placeholder="0"
                    min="0"
                    max="5"
                    step="0.1"
                  />
                </div>

                {/* Sales */}
                <div>
                  <label className="block text-white/60 text-sm mb-2">Sales</label>
                  <input
                    type="number"
                    value={formData.sales}
                    onChange={(e) => setFormData({ ...formData, sales: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded px-4 py-2 text-white placeholder-white/40 focus:border-amber-500 outline-none transition"
                    placeholder="0"
                  />
                </div>

                {/* Image URL */}
                <div className="md:col-span-2">
                  <label className="block text-white/60 text-sm mb-2">Image URL</label>
                  <input
                    type="url"
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded px-4 py-2 text-white placeholder-white/40 focus:border-amber-500 outline-none transition"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded text-white font-semibold hover:bg-white/10 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-4 py-2 bg-amber-500 text-black font-semibold rounded hover:bg-amber-400 transition disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : (editingId ? 'Update Product' : 'Create Product')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
