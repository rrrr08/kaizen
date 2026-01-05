"use client";

import { useEffect, useMemo, useState } from "react";
import {
  collection,
  getDocs,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  Timestamp,
  query,
  orderBy,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/app/context/AuthContext";
import {
  Plus,
  Edit2,
  Trash2,
  Search,
  Filter,
  X,
  Image as ImageIcon,
} from "lucide-react";
import ImageUpload from "@/components/ui/ImageUpload";
import Image from "next/image";

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  author?: string;
  image?: string;
  published?: boolean;
  createdAt?: Date | null;
  updatedAt?: Date | null;
  publishedAt?: Date | null;
}

interface FormData {
  title: string;
  excerpt: string;
  content: string;
  category: string;
  image: string;
}

const CATEGORIES = [
  "Announcements",
  "Gameplay Guides",
  "Strategy & Tips",
  "Community",
];

export default function AdminBlogPage() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<"all" | string>("all");

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState<FormData>({
    title: "",
    excerpt: "",
    content: "",
    category: CATEGORIES[0],
    image: "",
  });

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, "blog_posts"), orderBy("createdAt", "desc"));
      const snap = await getDocs(q);
      const data = snap.docs.map((d) => {
        const raw = d.data() as BlogPost;
        return {
          id: d.id,
          title: raw.title || "",
          excerpt: raw.excerpt || "",
          content: raw.content || "",
          category: raw.category || CATEGORIES[0],
          author: raw.author || "",
          image: raw.image || "",
          published: raw.published,
          createdAt: raw.createdAt instanceof Timestamp ? raw.createdAt.toDate() : raw.createdAt || null,
          updatedAt: raw.updatedAt instanceof Timestamp ? raw.updatedAt.toDate() : raw.updatedAt || null,
          publishedAt: raw.publishedAt instanceof Timestamp ? raw.publishedAt.toDate() : raw.publishedAt || null,
        } as BlogPost;
      });
      setPosts(data);
    } catch (e) {
      console.error("Error loading blog posts", e);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  const filtered = useMemo(() => {
    return posts.filter((p) => {
      const s = search.trim().toLowerCase();
      const matchesSearch = !s ||
        p.title.toLowerCase().includes(s) ||
        p.excerpt.toLowerCase().includes(s) ||
        p.category.toLowerCase().includes(s);
      const matchesCategory = category === "all" || p.category === category;
      return matchesSearch && matchesCategory;
    });
  }, [posts, search, category]);

  const onAdd = () => {
    setEditingId(null);
    setForm({ title: "", excerpt: "", content: "", category: CATEGORIES[0], image: "" });
    setShowForm(true);
  };

  const onEdit = (post: BlogPost) => {
    setEditingId(post.id);
    setForm({
      title: post.title,
      excerpt: post.excerpt,
      content: post.content,
      category: post.category || CATEGORIES[0],
      image: post.image || "",
    });
    setShowForm(true);
  };

  const onDelete = async (id: string) => {
    if (!confirm("Delete this post? This cannot be undone.")) return;
    try {
      await deleteDoc(doc(db, "blog_posts", id));
      setPosts((p) => p.filter((x) => x.id !== id));
      alert("Post deleted");
    } catch (e) {
      console.error("Delete failed", e);
      alert("Failed to delete");
    }
  };

  // Publish functionality removed per requirements.

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.excerpt || !form.content) {
      alert("Please fill title, excerpt and content");
      return;
    }
    setSubmitting(true);
    try {
      const data = {
        title: form.title,
        excerpt: form.excerpt,
        content: form.content,
        category: form.category,
        image: form.image,
        author: user?.email || "admin",
        updatedAt: serverTimestamp(),
      } as any;

      if (editingId) {
        await updateDoc(doc(db, "blog_posts", editingId), data);
        setPosts((prev) => prev.map((p) => (p.id === editingId ? { ...p, ...data, updatedAt: new Date() } : p)));
        alert("Post updated");
      } else {
        const ref = doc(collection(db, "blog_posts"));
        await setDoc(ref, {
          ...data,
          createdAt: serverTimestamp(),
        });
        setPosts((prev) => [
          {
            id: ref.id,
            ...data,
            createdAt: new Date(),
          } as BlogPost,
          ...prev,
        ]);
        alert("Post created");
      }
      setShowForm(false);
      setEditingId(null);
    } catch (e) {
      console.error("Save failed", e);
      alert("Failed to save post");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen bg-[#FFFDF5]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#FFD93D] border-t-black rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-black font-black uppercase tracking-widest">Loading posts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 pb-16 min-h-screen bg-[#FFFDF5]">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 border-b-2 border-black pb-8">
        <div>
          <h1 className="font-header text-5xl font-black text-black mb-2 uppercase tracking-tighter">Blog Management</h1>
          <p className="text-black/60 font-bold text-lg">Create, edit, and manage blog posts</p>
        </div>
        <button
          onClick={onAdd}
          className="px-6 py-3 bg-[#FFD93D] text-black font-black uppercase tracking-wide rounded-xl border-2 border-black neo-shadow hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all flex items-center gap-2"
        >
          <Plus className="w-5 h-5" strokeWidth={3} />
          New Post
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white border-2 border-black rounded-xl p-6 mb-8 neo-shadow">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-black font-black text-xs uppercase tracking-widest mb-2">
              <Search className="w-4 h-4 inline mr-2" />
              Search
            </label>
            <input
              type="text"
              placeholder="Title, excerpt, category..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#FFFDF5] border-2 border-black rounded-xl px-4 py-3 text-black placeholder-black/30 focus:outline-none focus:ring-0 font-bold transition-all"
            />
          </div>
          <div>
            <label className="block text-black font-black text-xs uppercase tracking-widest mb-2">Category</label>
            <div className="relative">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-[#FFFDF5] border-2 border-black rounded-xl px-4 py-3 text-black focus:outline-none font-bold appearance-none cursor-pointer"
              >
                <option value="all">All</option>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
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

      {/* List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {filtered.map((post) => (
          <div key={post.id} className="bg-white border-2 border-black rounded-[25px] overflow-hidden hover:translate-x-[2px] hover:-translate-y-[2px] transition-transform duration-300 neo-shadow">
            <div className="relative h-56 bg-gray-100 border-b-2 border-black">
              {post.image ? (
                <Image
                  src={post.image}
                  alt={post.title}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-black/20 bg-gray-50">
                  <ImageIcon className="w-16 h-16" />
                </div>
              )}
              <div className="absolute top-4 left-4">
                <span className="px-3 py-1 bg-black text-white text-xs font-black uppercase tracking-wider rounded-lg border-2 border-black shadow-[2px_2px_0px_#FFD93D]">
                  {post.category}
                </span>
              </div>
            </div>
            <div className="p-8">
              <h3 className="font-header text-2xl font-black text-black mb-3 line-clamp-2 uppercase tracking-tight leading-none">{post.title}</h3>
              <p className="text-black/60 text-sm font-bold mb-6 line-clamp-2">{post.excerpt}</p>

              <div className="flex items-center justify-between text-xs font-black uppercase tracking-widest text-black/40 mb-6 pb-6 border-b-2 border-black/5">
                <span>By {post.author ? post.author.split('@')[0] : 'Admin'}</span>
                <span>{post.updatedAt ? `Updated ${new Date(post.updatedAt).toLocaleDateString()}` : ''}</span>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => onEdit(post)}
                  className="flex-1 px-4 py-3 bg-[#6C5CE7] border-2 border-black rounded-xl text-white text-sm font-black uppercase tracking-wide hover:bg-[#5849be] transition-all flex items-center justify-center gap-2 neo-shadow-sm active:translate-x-[1px] active:translate-y-[1px] active:shadow-none"
                >
                  <Edit2 className="w-4 h-4" />
                  Edit
                </button>
                <button
                  onClick={() => onDelete(post.id)}
                  className="flex-1 px-4 py-3 bg-[#FF7675]/20 border-2 border-[#FF7675] rounded-xl text-[#D63031] text-sm font-black uppercase tracking-wide hover:bg-[#FF7675] hover:text-black hover:border-black transition-all flex items-center justify-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-20 bg-white border-2 border-black rounded-[30px] border-dashed">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6 border-2 border-black">
            <ImageIcon className="w-10 h-10 text-black/20" />
          </div>
          <p className="text-black font-black uppercase tracking-widest text-lg">No posts found</p>
          <p className="text-black/40 font-bold mt-2">Start writing your first blog post!</p>
        </div>
      )}

      {/* Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#FFFDF5] border-4 border-black rounded-[20px] max-w-3xl w-full max-h-[90vh] overflow-y-auto neo-shadow-lg">
            <div className="flex items-center justify-between p-6 border-b-4 border-black bg-[#FFD93D] sticky top-0 z-30">
              <h2 className="font-header text-3xl font-black text-black uppercase tracking-tighter">
                {editingId ? "Edit Post" : "New Post"}
              </h2>
              <button onClick={() => setShowForm(false)} className="bg-black text-white p-2 rounded-lg hover:rotate-90 transition duration-300">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={onSubmit} className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-black font-black text-xs uppercase tracking-widest mb-2">Title *</label>
                  <input
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    className="w-full bg-white border-2 border-black rounded-xl px-4 py-3 text-black placeholder-black/30 focus:outline-none focus:ring-0 focus:shadow-[4px_4px_0px_#000] transition-shadow font-bold text-lg"
                    placeholder="Enter catchy title"
                    required
                  />
                </div>
                <div>
                  <label className="block text-black font-black text-xs uppercase tracking-widest mb-2">Category *</label>
                  <div className="relative">
                    <select
                      value={form.category}
                      onChange={(e) => setForm({ ...form, category: e.target.value })}
                      className="w-full bg-white border-2 border-black rounded-xl px-4 py-3 text-black focus:outline-none focus:shadow-[4px_4px_0px_#000] font-bold appearance-none transition-shadow cursor-pointer"
                    >
                      {CATEGORIES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M2.5 4.5L6 8L9.5 4.5" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-black font-black text-xs uppercase tracking-widest mb-2">Header Image</label>
                  <ImageUpload
                    value={form.image ? [form.image] : []}
                    onChange={(url) => setForm({ ...form, image: url })}
                    onRemove={() => setForm({ ...form, image: '' })}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-black font-black text-xs uppercase tracking-widest mb-2">Excerpt *</label>
                  <input
                    value={form.excerpt}
                    onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
                    className="w-full bg-white border-2 border-black rounded-xl px-4 py-3 text-black placeholder-black/30 focus:outline-none focus:shadow-[4px_4px_0px_#000] transition-shadow font-bold"
                    placeholder="Short summary for the card"
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-black font-black text-xs uppercase tracking-widest mb-2">Content *</label>
                  <textarea
                    value={form.content}
                    onChange={(e) => setForm({ ...form, content: e.target.value })}
                    className="w-full min-h-64 bg-white border-2 border-black rounded-xl px-4 py-3 text-black placeholder-black/30 focus:outline-none focus:shadow-[4px_4px_0px_#000] transition-shadow font-medium leading-relaxed"
                    placeholder="Write the full content here..."
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end gap-4 pt-6 border-t-2 border-black/10">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-6 py-3 bg-white border-2 border-black rounded-xl text-black font-black uppercase tracking-widest hover:bg-gray-100 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-8 py-3 bg-[#00B894] text-black font-black uppercase tracking-widest rounded-xl border-2 border-black neo-shadow hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all disabled:opacity-50"
                >
                  {submitting ? "Saving..." : editingId ? "Save Changes" : "Create Post"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
