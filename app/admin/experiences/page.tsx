'use client';

import { useState, useEffect } from 'react';
import { ExperienceCategory } from '@/lib/types';
import { Plus, Edit, Trash2, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { usePopup } from '@/app/context/PopupContext';

export default function AdminExperiencesPage() {
  const { showConfirm } = usePopup();
  const [categories, setCategories] = useState<ExperienceCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkingAdmin, setCheckingAdmin] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const auth = getAuth();

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        window.location.href = '/';
        return;
      }

      try {
        const snap = await getDoc(doc(db, 'users', user.uid));

        if (!snap.exists() || snap.data()?.role !== 'admin') {
          window.location.href = '/';
          return;
        }

        // ✅ admin confirmed
        setCheckingAdmin(false);
        fetchCategories(user);
      } catch (err) {
        console.error('Admin check failed', err);
        window.location.href = '/';
      }
    });

    return () => unsubscribe();
  }, []);

  const fetchCategories = async (user: any) => {
    try {
      setLoading(true);
      const token = await user.getIdToken();

      const response = await fetch('/api/experiences', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch categories');
      }

      setCategories(data.categories);
    } catch (err) {
      console.error('Error fetching categories:', err);
      setError('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const togglePublished = async (category: ExperienceCategory) => {
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) return;

      const token = await user.getIdToken();

      const response = await fetch(`/api/experiences/${category.id}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ published: !category.published }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update category');
      }

      // Update local state
      setCategories(prev => prev.map(c =>
        c.id === category.id ? data.category : c
      ));
    } catch (err) {
      console.error('Error updating category:', err);
      setError('Failed to update category');
    }
  };

  const deleteCategory = async (categoryId: string) => {
    const confirmed = await showConfirm('Are you sure you want to delete this category? This action cannot be undone.', 'Delete Category');
    if (!confirmed) {
      return;
    }

    try {
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) return;

      const token = await user.getIdToken();

      const response = await fetch(`/api/experiences/${categoryId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete category');
      }

      // Remove from local state
      setCategories(prev => prev.filter(c => c.id !== categoryId));
    } catch (err) {
      console.error('Error deleting category:', err);
      setError('Failed to delete category');
    }
  };

  if (checkingAdmin) {
    return (
      <div className="p-8">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-[#FFD93D] border-t-black mb-4"></div>
          <p className="text-black/60 font-black text-xs tracking-[0.4em]">CHECKING ADMIN ACCESS...</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-[#FFD93D] border-t-black mb-4"></div>
          <p className="text-black/60 font-black text-xs tracking-[0.4em]">LOADING CATEGORIES...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 pb-32 min-h-screen bg-[#FFFDF5]">
      <div className="flex items-center justify-between mb-8 border-b-2 border-black pb-8">
        <div>
          <h1 className="font-header text-5xl font-black text-[#2D3436] mb-2 uppercase tracking-tighter">Experience Categories</h1>
          <p className="text-[#2D3436]/60 font-bold text-lg">Manage your custom experience offerings</p>
        </div>
        <Link
          href="/admin/experiences/new"
          className="inline-flex items-center gap-2 px-6 py-3 bg-[#6C5CE7] text-white font-black uppercase tracking-wider border-2 border-black neo-shadow hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all rounded-xl"
        >
          <Plus size={20} />
          Add Category
        </Link>
      </div>

      {error && (
        <div className="bg-red-100 border-2 border-red-500 rounded-lg p-4 mb-6">
          <p className="text-red-700 font-medium">{error}</p>
        </div>
      )}

      <div className="bg-white rounded-lg border-2 border-black neo-shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-black text-white">
              <tr>
                <th className="px-6 py-4 text-left font-black text-xs tracking-[0.2em] uppercase">Category</th>
                <th className="px-6 py-4 text-left font-black text-xs tracking-[0.2em] uppercase">Status</th>
                <th className="px-6 py-4 text-left font-black text-xs tracking-[0.2em] uppercase">Created</th>
                <th className="px-6 py-4 text-center font-black text-xs tracking-[0.2em] uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((category) => (
                <tr key={category.id} className="border-b-2 border-black/5 hover:bg-[#FFFDF5] transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <img
                        src={category.image}
                        alt={category.name}
                        className="w-12 h-12 rounded-lg border-2 border-black object-cover"
                      />
                      <div>
                        <p className="font-black text-[#2D3436] uppercase">{category.name}</p>
                        <p className="text-[#2D3436]/60 text-xs font-bold">{category.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-lg text-xs font-black tracking-[0.1em] uppercase border-2 border-black shadow-[2px_2px_0px_rgba(0,0,0,0.1)] ${category.published
                      ? 'bg-[#00B894] text-black'
                      : 'bg-gray-100 text-black/60'
                      }`}>
                      {category.published ? <Eye size={12} /> : <EyeOff size={12} />}
                      {category.published ? 'Published' : 'Draft'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-[#2D3436]/80 font-black text-xs uppercase tracking-wider">
                      {category.createdAt ? new Date(category.createdAt).toLocaleDateString() : 'N/A'}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-2">
                      <Link
                        href={`/admin/experiences/${category.id}/edit`}
                        className="p-2 bg-[#74B9FF] text-black border-2 border-black rounded-lg hover:bg-[#5CA0E5] transition-colors neo-shadow-sm active:translate-y-[1px] active:shadow-none"
                        title="Edit"
                      >
                        <Edit size={16} />
                      </Link>
                      <button
                        onClick={() => togglePublished(category)}
                        className={`p-2 rounded-lg border-2 border-black transition-colors neo-shadow-sm active:translate-y-[1px] active:shadow-none ${category.published
                          ? 'bg-gray-200 text-black hover:bg-gray-300'
                          : 'bg-[#00B894] text-black hover:bg-[#00A383]'
                          }`}
                        title={category.published ? 'Unpublish' : 'Publish'}
                      >
                        {category.published ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                      <button
                        onClick={() => deleteCategory(category.id)}
                        className="p-2 bg-[#FF7675] text-black border-2 border-black rounded-lg hover:bg-[#FF5F5E] transition-colors neo-shadow-sm active:translate-y-[1px] active:shadow-none"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {categories.length === 0 && (
          <div className="text-center py-16 bg-[#FFFDF5]">
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-black border-dashed">
              <Plus size={32} className="text-black/20" />
            </div>
            <p className="text-[#2D3436] font-black uppercase tracking-widest text-lg">No experience categories found</p>
            <p className="text-[#2D3436]/40 font-bold text-sm mt-2">Create your first category to get started</p>
          </div>
        )}
      </div>
    </div>
  );
}