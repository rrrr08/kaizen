'use client';

import { useEffect, useState } from 'react';
import { LayoutGrid, Plus, Edit2, Trash2, Search, Filter, X, Star } from 'lucide-react';
import { getDocs, collection, deleteDoc, doc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import ImageUpload from '@/components/ui/ImageUpload';
import Image from 'next/image';

interface Product {
  id: string;
  name: string;
  subtitle?: string;
  description?: string;
  price: number;
  cost: number;
  stock: number;
  category: string;
  image: string;
  images?: string[];
  rating: number;
  sales: number;
  minPlayers?: number;
  maxPlayers?: number;
  ageGroup?: string;
  features?: { title: string; description: string }[];
  howToPlay?: { title: string; description: string }[];
  boxContent?: string;
}

interface FormData {
  name: string;
  subtitle: string;
  description: string;
  price: string;
  cost: string;
  stock: string;
  category: string;
  image: string;
  images: string[];
  rating: string;
  sales: string;
  minPlayers: string;
  maxPlayers: string;
  ageGroup: string;
  features: { title: string; description: string }[];
  howToPlay: { title: string; description: string }[];
  boxContent: string;
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
    subtitle: '',
    description: '',
    price: '',
    cost: '',
    stock: '',
    category: 'apparel',
    image: '',
    images: [],
    rating: '0',
    sales: '0',
    minPlayers: '2',
    maxPlayers: '4',
    ageGroup: 'Adult',
    features: [{ title: '', description: '' }],
    howToPlay: [{ title: '', description: '' }],
    boxContent: '',
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
      subtitle: '',
      description: '',
      price: '',
      cost: '',
      stock: '',
      category: 'apparel',
      image: '',
      images: [],
      rating: '0',
      sales: '0',
      minPlayers: '2',
      maxPlayers: '4',
      ageGroup: 'Adult',
      features: [{ title: '', description: '' }],
      howToPlay: [{ title: '', description: '' }],
      boxContent: '',
    });
    setShowAddForm(true);
  };

  const handleEdit = (product: Product) => {
    setEditingId(product.id);
    setFormData({
      name: product.name || '',
      subtitle: product.subtitle || '',
      description: product.description || '',
      price: product.price?.toString() || '',
      cost: product.cost?.toString() || '',
      stock: product.stock?.toString() || '',
      category: product.category || 'apparel',
      image: product.image || '',
      images: product.images || [],
      rating: product.rating?.toString() || '0',
      sales: product.sales?.toString() || '0',
      minPlayers: product.minPlayers?.toString() || '2',
      maxPlayers: product.maxPlayers?.toString() || '4',
      ageGroup: product.ageGroup || 'Adult',
      features: product.features && product.features.length > 0 ? product.features : [{ title: '', description: '' }],
      howToPlay: product.howToPlay && product.howToPlay.length > 0 ? product.howToPlay : [{ title: '', description: '' }],
      boxContent: product.boxContent || '',
    });
    setShowAddForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      await deleteDoc(doc(db, 'products', id));
      setProducts(products.filter(p => p.id !== id));
      alert('Product deleted successfully!');
    } catch (error: any) {
      console.error('Error deleting product:', error);
      alert(`Failed to delete product: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
        subtitle: formData.subtitle,
        description: formData.description,
        price: parseFloat(formData.price),
        cost: parseFloat(formData.cost),
        stock: parseInt(formData.stock),
        category: formData.category,
        image: formData.image,
        images: formData.images,
        rating: parseFloat(formData.rating),
        sales: parseInt(formData.sales),
        minPlayers: parseInt(formData.minPlayers),
        maxPlayers: parseInt(formData.maxPlayers),
        ageGroup: formData.ageGroup,
        features: formData.features.filter(f => f.title.trim() !== ''),
        howToPlay: formData.howToPlay.filter(h => h.title.trim() !== ''),
        boxContent: formData.boxContent,
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

  const addFeature = () => {
    setFormData({ ...formData, features: [...formData.features, { title: '', description: '' }] });
  };

  const updateFeature = (index: number, field: 'title' | 'description', value: string) => {
    const newFeatures = [...formData.features];
    newFeatures[index][field] = value;
    setFormData({ ...formData, features: newFeatures });
  };

  const removeFeature = (index: number) => {
    const newFeatures = [...formData.features];
    newFeatures.splice(index, 1);
    setFormData({ ...formData, features: newFeatures });
  };


  const addHowToPlay = () => {
    setFormData({ ...formData, howToPlay: [...formData.howToPlay, { title: '', description: '' }] });
  };

  const updateHowToPlay = (index: number, field: 'title' | 'description', value: string) => {
    const newSteps = [...formData.howToPlay];
    newSteps[index][field] = value;
    setFormData({ ...formData, howToPlay: newSteps });
  };

  const removeHowToPlay = (index: number) => {
    const newSteps = [...formData.howToPlay];
    newSteps.splice(index, 1);
    setFormData({ ...formData, howToPlay: newSteps });
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
      <div className="p-8 flex items-center justify-center min-h-screen bg-[#FFFDF5]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#FFD93D] border-t-black rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-black font-black uppercase tracking-widest">Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 pb-16 min-h-screen bg-[#FFFDF5]">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 border-b-2 border-black pb-8">
        <div>
          <h1 className="font-header text-5xl font-black text-black mb-2 uppercase tracking-tighter">Products</h1>
          <p className="text-black/60 font-bold text-lg">Manage all products in your shop</p>
        </div>
        <button
          onClick={handleAdd}
          className="px-6 py-3 bg-[#FFD93D] text-black font-black uppercase tracking-wide rounded-xl border-2 border-black neo-shadow hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all flex items-center gap-2"
        >
          <Plus className="w-5 h-5" strokeWidth={3} />
          Add Product
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
        <div className="bg-[#6C5CE7] border-2 border-black rounded-[20px] p-6 neo-shadow hover:-translate-y-1 transition-transform">
          <p className="text-white text-xs font-black uppercase tracking-widest mb-2">Total Products</p>
          <p className="font-header text-5xl font-black text-white">{filteredProducts.length}</p>
        </div>
        <div className="bg-[#FF7675] border-2 border-black rounded-[20px] p-6 neo-shadow hover:-translate-y-1 transition-transform">
          <p className="text-black text-xs font-black uppercase tracking-widest mb-2">Out of Stock</p>
          <p className="font-header text-5xl font-black text-black">{outOfStock}</p>
        </div>
        <div className="bg-[#74B9FF] border-2 border-black rounded-[20px] p-6 neo-shadow hover:-translate-y-1 transition-transform">
          <p className="text-black text-xs font-black uppercase tracking-widest mb-2">Total Value</p>
          <p className="font-header text-3xl font-black text-black">₹{(totalValue / 100000).toFixed(2)}L</p>
        </div>
        <div className="bg-[#00B894] border-2 border-black rounded-[20px] p-6 neo-shadow hover:-translate-y-1 transition-transform">
          <p className="text-black text-xs font-black uppercase tracking-widest mb-2">Total Profit</p>
          <p className="font-header text-3xl font-black text-black">₹{(totalProfit / 100000).toFixed(2)}L</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border-2 border-black rounded-xl p-6 mb-8 neo-shadow">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-black font-black text-xs uppercase tracking-widest mb-2">
              <Search className="w-4 h-4 inline mr-2" />
              Search Products
            </label>
            <input
              type="text"
              placeholder="Product name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#FFFDF5] border-2 border-black rounded-xl px-4 py-3 text-black placeholder-black/30 focus:outline-none focus:ring-0 font-bold transition-all"
            />
          </div>
          <div>
            <label className="block text-black font-black text-xs uppercase tracking-widest mb-2">
              <Filter className="w-4 h-4 inline mr-2" />
              Category
            </label>
            <div className="relative">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value as any)}
                className="w-full bg-[#FFFDF5] border-2 border-black rounded-xl px-4 py-3 text-black focus:outline-none font-bold appearance-none cursor-pointer"
              >
                <option value="all">All Categories</option>
                <option value="apparel">Apparel</option>
                <option value="accessories">Accessories</option>
                <option value="collectibles">Collectibles</option>
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M2.5 4.5L6 8L9.5 4.5" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredProducts.map((product) => (
          <div
            key={product.id}
            className="bg-white border-2 border-black rounded-[25px] overflow-hidden hover:-translate-y-2 transition-transform duration-300 neo-shadow group flex flex-col"
          >
            {/* Image Container with Badge */}
            <div className="relative h-64 bg-gray-50 overflow-hidden border-b-2 border-black group">
              {product.image || (product.images && product.images.length > 0) ? (
                <Image
                  src={product.image || product.images?.[0] || "/placeholder.png"}
                  alt={product.name}
                  fill
                  className="object-cover group-hover:scale-105 transition duration-500"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-300">
                  <span className="text-[10px] font-black uppercase tracking-widest">No Image</span>
                </div>
              )}

              {/* Photo Count Badge */}
              <div className="absolute top-4 left-4 z-10 flex gap-2">
                <div className="bg-black text-white px-3 py-1 rounded-lg text-[10px] font-black border-2 border-white/20 neo-shadow-sm flex items-center gap-1.5 uppercase tracking-wider">
                  <LayoutGrid size={12} />
                  {1 + (product.images?.length || 0)} Images
                </div>
              </div>

              {/* Small Gallery Strip at Bottom */}
              {product.images && product.images.length > 0 && (
                <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/60 to-transparent translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                  <div className="flex gap-2 overflow-hidden">
                    {product.images.slice(0, 4).map((img, i) => (
                      <div key={i} className="w-10 h-10 rounded-md border-2 border-white overflow-hidden flex-shrink-0 shadow-lg relative">
                        <Image
                          src={img}
                          alt="gallery"
                          fill
                          className="object-cover"
                        />
                      </div>
                    ))}
                    {product.images.length > 4 && (
                      <div className="w-10 h-10 rounded-md border-2 border-white bg-black/80 flex items-center justify-center flex-shrink-0">
                        <span className="text-[10px] text-white font-black">+{product.images.length - 4}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="absolute top-4 right-4 bg-white border-2 border-black px-3 py-1 rounded-full neo-shadow-sm z-10">
                <p className="text-black font-black text-sm">⭐ {product.rating}</p>
              </div>
              {product.stock === 0 && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-sm z-20">
                  <p className="text-[#FF7675] font-black text-xl border-2 border-[#FF7675] p-2 rounded-lg -rotate-12 uppercase tracking-widest">OUT OF STOCK</p>
                </div>
              )}
            </div>

            {/* Details */}
            <div className="p-6 flex-1 flex flex-col justify-between">
              <div>
                <h3 className="font-header text-2xl font-black text-black mb-1 line-clamp-1">{product.name}</h3>
                <p className="text-black/50 text-xs font-black uppercase tracking-widest mb-4">{product.category}</p>

                <div className="flex items-center justify-between mb-6">
                  <div>
                    <p className="text-[#6C5CE7] font-black text-2xl">₹{product.price.toLocaleString()}</p>
                    <p className="text-black/40 text-xs font-bold">Cost: ₹{product.cost}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-black/60 text-xs font-black uppercase tracking-wide">Sales</p>
                    <p className="text-[#00B894] font-black text-xl">{product.sales}</p>
                  </div>
                </div>

                {/* Stock Bar */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-black/60 text-xs font-black uppercase tracking-wide">Stock Level</p>
                    <p className={`font-black text-sm ${product.stock <= 10 ? 'text-[#FF7675]' : 'text-[#00B894]'}`}>
                      {product.stock} units
                    </p>
                  </div>
                  <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden border-2 border-black/10">
                    <div
                      className={`h-full border-r-2 border-black/20 ${product.stock <= 10 ? 'bg-[#FF7675]' : 'bg-[#00B894]'}`}
                      style={{ width: `${Math.min((product.stock / 100) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 mt-4 pt-4 border-t-2 border-black/5">
                <button
                  onClick={() => handleEdit(product)}
                  className="flex-1 px-4 py-2 bg-white border-2 border-black rounded-xl text-black text-sm font-black uppercase tracking-wide hover:bg-black hover:text-white transition-all flex items-center justify-center gap-2 neo-shadow-sm active:translate-y-[1px] active:shadow-none"
                >
                  <Edit2 className="w-4 h-4" />
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(product.id)}
                  className="flex-1 px-4 py-2 bg-[#FF7675]/20 border-2 border-[#FF7675] rounded-xl text-[#D63031] text-sm font-black uppercase tracking-wide hover:bg-[#FF7675] hover:text-black hover:border-black transition-all flex items-center justify-center gap-2"
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
        <div className="text-center py-20 bg-white border-2 border-black rounded-[30px] border-dashed">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6 border-2 border-black">
            <LayoutGrid className="w-10 h-10 text-black/20" />
          </div>
          <p className="text-black font-black uppercase tracking-widest text-lg">No products found</p>
          <p className="text-black/40 font-bold mt-2">Try adjusting your search or filters</p>
        </div>
      )}

      {/* Add/Edit Form Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#FFFDF5] border-4 border-black rounded-[20px] max-w-2xl w-full max-h-[90vh] overflow-y-auto neo-shadow-lg">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b-4 border-black bg-[#FFD93D] sticky top-0 z-30">
              <h2 className="font-header text-3xl font-black text-black uppercase tracking-tighter">
                {editingId ? 'Edit Product' : 'Add New Product'}
              </h2>
              <button
                onClick={() => setShowAddForm(false)}
                className="bg-black text-white p-2 rounded-lg hover:rotate-90 transition duration-300"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Name */}
                <div className="md:col-span-2">
                  <label className="block text-black font-black text-xs uppercase tracking-widest mb-2">Product Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-white border-2 border-black rounded-xl px-4 py-3 text-black placeholder-black/30 focus:outline-none focus:ring-0 focus:shadow-[4px_4px_0px_#000] transition-shadow font-bold"
                    placeholder="Enter product name"
                    maxLength={80}
                    required
                  />
                  <p className="text-[10px] text-black/40 font-bold mt-1 uppercase tracking-wider text-right">{formData.name.length}/80</p>
                </div>

                {/* Subtitle */}
                <div className="md:col-span-2">
                  <label className="block text-black font-black text-xs uppercase tracking-widest mb-2">Subtitle</label>
                  <input
                    type="text"
                    value={formData.subtitle}
                    onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                    className="w-full bg-white border-2 border-black rounded-xl px-4 py-3 text-black placeholder-black/30 focus:outline-none focus:ring-0 focus:shadow-[4px_4px_0px_#000] transition-shadow font-bold"
                    placeholder="e.g. Pickleball Card Game"
                    maxLength={100}
                  />
                  <p className="text-[10px] text-black/40 font-bold mt-1 uppercase tracking-wider text-right">{formData.subtitle.length}/100</p>
                </div>
                {/* Description */}
                <div className="md:col-span-2">
                  <label className="block text-black font-black text-xs uppercase tracking-widest mb-2">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full bg-white border-2 border-black rounded-xl px-4 py-3 text-black placeholder-black/30 focus:outline-none focus:ring-0 focus:shadow-[4px_4px_0px_#000] transition-shadow font-bold"
                    placeholder="Detailed product description..."
                    rows={4}
                    maxLength={2000}
                  />
                  <p className="text-[10px] text-black/40 font-bold mt-1 uppercase tracking-wider text-right">{formData.description.length}/2000</p>
                </div>

                {/* Category */}
                <div>
                  <label className="block text-black font-black text-xs uppercase tracking-widest mb-2">Category *</label>
                  <div className="relative">
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full bg-white border-2 border-black rounded-xl px-4 py-3 text-black focus:outline-none focus:shadow-[4px_4px_0px_#000] font-bold appearance-none transition-shadow"
                      required
                    >
                      <option value="apparel">Apparel</option>
                      <option value="accessories">Accessories</option>
                      <option value="collectibles">Collectibles</option>
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M2.5 4.5L6 8L9.5 4.5" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Price */}
                <div>
                  <label className="block text-black font-black text-xs uppercase tracking-widest mb-2">Price (₹) *</label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full bg-white border-2 border-black rounded-xl px-4 py-3 text-black placeholder-black/30 focus:outline-none focus:shadow-[4px_4px_0px_#000] transition-shadow font-bold"
                    placeholder="0"
                    step="0.01"
                    required
                  />
                </div>

                {/* Cost */}
                <div>
                  <label className="block text-black font-black text-xs uppercase tracking-widest mb-2">Cost (₹) *</label>
                  <input
                    type="number"
                    value={formData.cost}
                    onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                    className="w-full bg-white border-2 border-black rounded-xl px-4 py-3 text-black placeholder-black/30 focus:outline-none focus:shadow-[4px_4px_0px_#000] transition-shadow font-bold"
                    placeholder="0"
                    step="0.01"
                    required
                  />
                </div>

                {/* Stock */}
                <div>
                  <label className="block text-black font-black text-xs uppercase tracking-widest mb-2">Stock *</label>
                  <input
                    type="number"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    className="w-full bg-white border-2 border-black rounded-xl px-4 py-3 text-black placeholder-black/30 focus:outline-none focus:shadow-[4px_4px_0px_#000] transition-shadow font-bold"
                    placeholder="0"
                    required
                  />
                </div>

                {/* Rating */}
                <div>
                  <label className="block text-black font-black text-xs uppercase tracking-widest mb-2">Rating</label>
                  <input
                    type="number"
                    value={formData.rating}
                    onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
                    className="w-full bg-white border-2 border-black rounded-xl px-4 py-3 text-black placeholder-black/30 focus:outline-none focus:shadow-[4px_4px_0px_#000] transition-shadow font-bold"
                    placeholder="0"
                    min="0"
                    max="5"
                    step="0.1"
                  />
                </div>

                {/* Sales */}
                <div>
                  <label className="block text-black font-black text-xs uppercase tracking-widest mb-2">Sales</label>
                  <input
                    type="number"
                    value={formData.sales}
                    onChange={(e) => setFormData({ ...formData, sales: e.target.value })}
                    className="w-full bg-white border-2 border-black rounded-xl px-4 py-3 text-black placeholder-black/30 focus:outline-none focus:shadow-[4px_4px_0px_#000] transition-shadow font-bold"
                    placeholder="0"
                  />
                </div>

                {/* Min Players */}
                <div>
                  <label className="block text-black font-black text-xs uppercase tracking-widest mb-2">Min Players</label>
                  <input
                    type="number"
                    value={formData.minPlayers}
                    onChange={(e) => setFormData({ ...formData, minPlayers: e.target.value })}
                    className="w-full bg-white border-2 border-black rounded-xl px-4 py-3 text-black placeholder-black/30 focus:outline-none focus:shadow-[4px_4px_0px_#000] transition-shadow font-bold"
                    placeholder="2"
                  />
                </div>

                {/* Max Players */}
                <div>
                  <label className="block text-black font-black text-xs uppercase tracking-widest mb-2">Max Players</label>
                  <input
                    type="number"
                    value={formData.maxPlayers}
                    onChange={(e) => setFormData({ ...formData, maxPlayers: e.target.value })}
                    className="w-full bg-white border-2 border-black rounded-xl px-4 py-3 text-black placeholder-black/30 focus:outline-none focus:shadow-[4px_4px_0px_#000] transition-shadow font-bold"
                    placeholder="4"
                  />
                </div>

                {/* Age Group */}
                <div>
                  <label className="block text-black font-black text-xs uppercase tracking-widest mb-2">Age Group</label>
                  <input
                    type="text"
                    value={formData.ageGroup}
                    onChange={(e) => setFormData({ ...formData, ageGroup: e.target.value })}
                    className="w-full bg-white border-2 border-black rounded-xl px-4 py-3 text-black placeholder-black/30 focus:outline-none focus:shadow-[4px_4px_0px_#000] transition-shadow font-bold"
                    placeholder="Adult"
                  />
                </div>

                {/* Box Content */}
                <div className="md:col-span-2">
                  <label className="block text-black font-black text-xs uppercase tracking-widest mb-2">Box Content</label>
                  <textarea
                    value={formData.boxContent}
                    onChange={(e) => setFormData({ ...formData, boxContent: e.target.value })}
                    className="w-full bg-white border-2 border-black rounded-xl px-4 py-3 text-black placeholder-black/30 focus:outline-none focus:ring-0 focus:shadow-[4px_4px_0px_#000] transition-shadow font-bold"
                    placeholder="e.g. 52 Cards, Rulebook..."
                    rows={2}
                    maxLength={500}
                  />
                  <p className="text-[10px] text-black/40 font-bold mt-1 uppercase tracking-wider text-right">{formData.boxContent.length}/500</p>
                </div>


                {/* Primary Image Upload */}
                <div className="md:col-span-2 p-6 bg-white border-2 border-black rounded-2xl neo-shadow-sm">
                  <label className="block text-black font-black text-sm uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Star className="w-4 h-4 text-[#FFD93D]" fill="#FFD93D" />
                    Primary Product Photo *
                  </label>
                  <ImageUpload
                    value={formData.image ? [formData.image] : []}
                    disabled={submitting}
                    onChange={(url) => setFormData((prev) => ({ ...prev, image: url }))}
                    onRemove={() => setFormData((prev) => ({ ...prev, image: '' }))}
                    maxFiles={1}
                  />
                  <p className="mt-2 text-[10px] text-black/40 font-bold uppercase tracking-wider">This is the main image shown in shop lists.</p>
                </div>

                {/* Gallery Images Upload */}
                <div className="md:col-span-2 p-6 bg-white border-2 border-dashed border-black/20 rounded-2xl">
                  <label className="block text-black font-black text-sm uppercase tracking-widest mb-4 flex items-center gap-2">
                    <LayoutGrid size={16} />
                    Additional Gallery Images
                  </label>
                  <ImageUpload
                    value={formData.images}
                    disabled={submitting}
                    onChange={(url) => setFormData((prev) => ({ ...prev, images: [...prev.images, url] }))}
                    onRemove={(url) => setFormData((prev) => ({ ...prev, images: prev.images.filter((current) => current !== url) }))}
                  />
                  <p className="mt-2 text-[10px] text-black/40 font-bold uppercase tracking-wider">Upload any number of images for the product gallery.</p>
                </div>

                {/* Features Dynamic List */}
                <div className="md:col-span-2 border-t-2 border-black/10 pt-4">
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-black font-black text-sm uppercase tracking-widest">Key Features</label>
                    <button type="button" onClick={addFeature} className="text-xs bg-black text-white px-2 py-1 rounded">Add Feature</button>
                  </div>
                  {formData.features.map((feature, index) => (
                    <div key={index} className="flex gap-2 mb-2">
                      <input
                        type="text"
                        placeholder="Title"
                        value={feature.title}
                        onChange={(e) => updateFeature(index, 'title', e.target.value)}
                        className="flex-1 bg-white border-2 border-black rounded-lg px-2 py-1 text-sm font-bold"
                        maxLength={50}
                      />
                      <input
                        type="text"
                        placeholder="Description"
                        value={feature.description}
                        onChange={(e) => updateFeature(index, 'description', e.target.value)}
                        className="flex-1 bg-white border-2 border-black rounded-lg px-2 py-1 text-sm"
                        maxLength={200}
                      />
                      <button type="button" onClick={() => removeFeature(index)} className="text-red-500"><X size={16} /></button>
                    </div>
                  ))}
                </div>


                {/* How To Play Dynamic List */}
                <div className="md:col-span-2 border-t-2 border-black/10 pt-4">
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-black font-black text-sm uppercase tracking-widest">How To Play Steps</label>
                    <button type="button" onClick={addHowToPlay} className="text-xs bg-black text-white px-2 py-1 rounded">Add Step</button>
                  </div>
                  {formData.howToPlay.map((step, index) => (
                    <div key={index} className="flex gap-2 mb-2">
                      <input
                        type="text"
                        placeholder="Step Title (e.g. Step 1)"
                        value={step.title}
                        onChange={(e) => updateHowToPlay(index, 'title', e.target.value)}
                        className="w-1/4 bg-white border-2 border-black rounded-lg px-2 py-1 text-sm font-bold"
                        maxLength={50}
                      />
                      <textarea
                        placeholder="Step Description"
                        value={step.description}
                        onChange={(e) => updateHowToPlay(index, 'description', e.target.value)}
                        className="flex-1 bg-white border-2 border-black rounded-lg px-2 py-1 text-sm"
                        rows={2}
                        maxLength={500}
                      />
                      <button type="button" onClick={() => removeHowToPlay(index)} className="text-red-500"><X size={16} /></button>
                    </div>
                  ))}
                </div>

              </div>

              {/* Buttons */}
              <div className="flex gap-4 pt-6 border-t-2 border-black/10">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="flex-1 px-4 py-4 bg-white border-2 border-black rounded-xl text-black font-black uppercase tracking-widest hover:bg-gray-100 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-[2] px-4 py-4 bg-[#6C5CE7] text-white font-black uppercase tracking-widest rounded-xl border-2 border-black neo-shadow hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all disabled:opacity-50"
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
