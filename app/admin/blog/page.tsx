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
  Eye,
  EyeOff,
  Image as ImageIcon,
} from "lucide-react";

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
        const raw = d.data() as any;
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
    setForm({ title: "", excerpt: "", content: "", category: CATEGORIES[0], image: "", published: false });
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
      <div className="p-8 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-amber-500">Loading posts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 pb-16">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-5xl font-bold text-white mb-2">Blog Management</h1>
          <p className="text-white/60">Create, edit, publish and manage blog posts</p>
        </div>
        <button
          onClick={onAdd}
          className="px-6 py-3 bg-amber-500 text-black font-header font-bold rounded hover:bg-amber-400 transition flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          New Post
        </button>
      </div>

      {/* Filters */}
      <div className="bg-black/40 border border-white/10 rounded-lg p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-white/60 text-sm mb-2">
              <Search className="w-4 h-4 inline mr-2" />
              Search
            </label>
            <input
              type="text"
              placeholder="Title, excerpt, category..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded px-4 py-2 text-white placeholder-white/40 focus:border-amber-500 outline-none transition"
            />
          </div>
          <div>
            <label className="block text-white/60 text-sm mb-2">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded px-4 py-2 text-white focus:border-amber-500 outline-none transition"
            >
              <option value="all">All</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filtered.map((post) => (
          <div key={post.id} className="bg-black/40 border border-white/10 rounded-lg overflow-hidden">
            <div className="relative h-40 bg-white/5">
              {post.image ? (
                <img src={post.image} alt={post.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white/30">
                  <ImageIcon className="w-10 h-10" />
                </div>
              )}
            </div>
            <div className="p-6">
              <h3 className="font-display text-xl font-bold text-white mb-1">{post.title}</h3>
              <p className="text-white/60 text-sm mb-3">{post.excerpt}</p>
              <div className="flex items-center justify-between text-xs text-white/50 mb-4">
                <span>{post.category}</span>
                <span>{post.updatedAt ? `Updated ${new Date(post.updatedAt).toLocaleDateString()}` : ''}</span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => onEdit(post)}
                  className="flex-1 px-3 py-2 bg-blue-500/10 border border-blue-500/20 rounded text-blue-400 text-sm font-semibold hover:bg-blue-500/20 transition flex items-center justify-center gap-2"
                >
                  <Edit2 className="w-4 h-4" />
                  Edit
                </button>
                <button
                  onClick={() => onDelete(post.id)}
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

      {filtered.length === 0 && (
        <div className="text-center py-12 text-white/60">No posts found</div>
      )}

      {/* Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-black border border-white/10 rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-white/10 sticky top-0 bg-black">
              <h2 className="font-display text-2xl font-bold text-white">
                {editingId ? "Edit Post" : "New Post"}
              </h2>
              <button onClick={() => setShowForm(false)} className="text-white/60 hover:text-white transition">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={onSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-white/60 text-sm mb-2">Title *</label>
                  <input
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded px-4 py-2 text-white placeholder-white/40 focus:border-amber-500 outline-none transition"
                    placeholder="Enter title"
                    required
                  />
                </div>
                <div>
                  <label className="block text-white/60 text-sm mb-2">Category *</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded px-4 py-2 text-white focus:border-amber-500 outline-none transition"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-white/60 text-sm mb-2">Excerpt *</label>
                  <input
                    value={form.excerpt}
                    onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded px-4 py-2 text-white placeholder-white/40 focus:border-amber-500 outline-none transition"
                    placeholder="Short summary"
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-white/60 text-sm mb-2">Content *</label>
                  <textarea
                    value={form.content}
                    onChange={(e) => setForm({ ...form, content: e.target.value })}
                    className="w-full min-h-48 bg-white/5 border border-white/10 rounded px-4 py-2 text-white placeholder-white/40 focus:border-amber-500 outline-none transition"
                    placeholder="Write the full content here"
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-white/60 text-sm mb-2">Header Image URL</label>
                  <input
                    value={form.image}
                    onChange={(e) => setForm({ ...form, image: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded px-4 py-2 text-white placeholder-white/40 focus:border-amber-500 outline-none transition"
                    placeholder="https://..."
                  />
                </div>
                {/* Publish controls removed */}
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 bg-white/5 border border-white/10 rounded text-white/80 hover:bg-white/10 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2 bg-amber-500 text-black font-header font-bold rounded hover:bg-amber-400 transition disabled:opacity-50"
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
