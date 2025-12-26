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
  FileText,
  Tag
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
      <div className="p-8 flex items-center justify-center min-h-screen bg-[#050505]">
        <div className="text-center">
          <div className="text-[#FFD400] font-arcade tracking-[0.3em] animate-pulse text-xl">
            LOADING_TRANSMISSIONS...
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
          <h1 className="font-arcade text-5xl text-white mb-2 text-3d-orange">COMMS_LOG</h1>
          <p className="text-gray-500 font-sans text-lg tracking-wide uppercase">Manage system announcements and guides</p>
        </div>
        <button
          onClick={onAdd}
          className="px-6 py-3 bg-[#FFD400] text-black font-arcade text-sm font-bold rounded-sm hover:bg-[#FFE066] transition flex items-center gap-2 uppercase tracking-wider"
        >
          <Plus className="w-5 h-5" />
          BROADCAST_NEW
        </button>
      </div>

      {/* Filters */}
      <div className="bg-[#111] border border-[#333] rounded-sm p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-[#00B894] text-xs font-mono uppercase tracking-widest mb-2">
              <Search className="w-3 h-3 inline mr-2" />
              SEARCH_ARCHIVES
            </label>
            <input
              type="text"
              placeholder="ENTER KEYWORDS..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-black border border-[#333] rounded-sm px-4 py-2 text-white font-mono placeholder-gray-700 focus:border-[#FFD400] outline-none transition uppercase"
            />
          </div>
          <div>
            <label className="block text-[#00B894] text-xs font-mono uppercase tracking-widest mb-2">
              <Filter className="w-3 h-3 inline mr-2" />
              CATEGORY_FILTER
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-black border border-[#333] rounded-sm px-4 py-2 text-white font-mono focus:border-[#FFD400] outline-none transition uppercase appearance-none cursor-pointer"
            >
              <option value="all">ALL_CHANNELS</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c.toUpperCase()}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filtered.map((post) => (
          <div key={post.id} className="bg-[#080808] border-2 border-[#333] rounded-[4px] overflow-hidden hover:border-[#FFD400] transition-colors group">
            <div className="relative h-40 bg-[#111] border-b-2 border-[#333]">
              {post.image ? (
                <>
                  <img src={post.image} alt={post.title} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                  <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.1)_1px,transparent_1px)] bg-[size:4px_4px] pointer-events-none"></div>
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[#333] border-b border-[#333]">
                  <ImageIcon className="w-10 h-10" />
                </div>
              )}
              <div className="absolute top-3 right-3 bg-black/80 backdrop-blur px-2 py-1 rounded-sm border border-[#333]">
                <p className="text-[#FFD400] font-mono text-[10px] uppercase">{post.category}</p>
              </div>
            </div>
            <div className="p-6">
              <h3 className="font-arcade text-lg text-white mb-2 tracking-wide truncate">{post.title}</h3>
              <p className="text-gray-500 font-mono text-xs mb-6 line-clamp-2">{post.excerpt}</p>

              <div className="flex items-center gap-2 mb-6 text-[10px] text-gray-600 font-mono uppercase">
                <span>{post.updatedAt ? `LAST_UPDATE: ${new Date(post.updatedAt).toLocaleDateString()}` : 'UPDATE_PENDING'}</span>
              </div>

              <div className="flex gap-3 border-t border-[#222] pt-4">
                <button
                  onClick={() => onEdit(post)}
                  className="flex-1 px-3 py-2 bg-[#111] border border-[#333] rounded-sm text-gray-300 font-mono text-xs uppercase hover:border-[#FFD400] hover:text-[#FFD400] transition flex items-center justify-center gap-2 group/btn"
                >
                  <Edit2 className="w-3 h-3 group-hover/btn:text-[#FFD400]" />
                  EDIT
                </button>
                <button
                  onClick={() => onDelete(post.id)}
                  className="flex-1 px-3 py-2 bg-[#111] border border-red-900/40 rounded-sm text-red-500 font-mono text-xs uppercase hover:bg-red-900/10 hover:border-red-500 transition flex items-center justify-center gap-2"
                >
                  <Trash2 className="w-3 h-3" />
                  DELETE
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-24 border-2 border-dashed border-[#333] rounded-[4px]">
          <FileText className="w-16 h-16 text-[#333] mx-auto mb-6" />
          <p className="text-gray-500 font-arcade tracking-widest">NO_RECORDS_FOUND</p>
        </div>
      )}

      {/* Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-[#050505] border-2 border-[#333] rounded-[4px] max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-[0_0_50px_rgba(0,0,0,0.8)]">
            <div className="flex items-center justify-between p-6 border-b-2 border-[#333] sticky top-0 bg-[#050505] z-10">
              <h2 className="font-arcade text-2xl text-[#FFD400] text-shadow-glow">
                {editingId ? "EDIT_LOG" : "NEW_ENTRY"}
              </h2>
              <button onClick={() => setShowForm(false)} className="text-gray-500 hover:text-red-500 transition">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={onSubmit} className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[#00B894] font-mono text-[10px] uppercase tracking-widest mb-2">HEADER_TITLE *</label>
                  <input
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    className="w-full bg-[#111] border border-[#333] rounded-sm px-4 py-2 text-white font-mono placeholder-gray-700 focus:border-[#FFD400] outline-none transition uppercase"
                    placeholder="ENTER TITLE"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[#00B894] font-mono text-[10px] uppercase tracking-widest mb-2">CHANNEL_CATEGORY *</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full bg-[#111] border border-[#333] rounded-sm px-4 py-2 text-white font-mono focus:border-[#FFD400] outline-none transition uppercase"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c.toUpperCase()}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-[#00B894] font-mono text-[10px] uppercase tracking-widest mb-2">BRIEF_SYNOPSIS *</label>
                  <input
                    value={form.excerpt}
                    onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
                    className="w-full bg-[#111] border border-[#333] rounded-sm px-4 py-2 text-white font-mono placeholder-gray-700 focus:border-[#FFD400] outline-none transition"
                    placeholder="SHORT SUMMARY"
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-[#00B894] font-mono text-[10px] uppercase tracking-widest mb-2">FULL_CONTENT_DATA *</label>
                  <textarea
                    value={form.content}
                    onChange={(e) => setForm({ ...form, content: e.target.value })}
                    className="w-full min-h-48 bg-[#111] border border-[#333] rounded-sm px-4 py-2 text-white font-mono placeholder-gray-700 focus:border-[#FFD400] outline-none transition text-sm"
                    placeholder="ENTER CONTENT..."
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-[#00B894] font-mono text-[10px] uppercase tracking-widest mb-2">HEADER_MEDIA_URL</label>
                  <input
                    value={form.image}
                    onChange={(e) => setForm({ ...form, image: e.target.value })}
                    className="w-full bg-[#111] border border-[#333] rounded-sm px-4 py-2 text-white font-mono placeholder-gray-700 focus:border-[#FFD400] outline-none transition"
                    placeholder="HTTPS://..."
                  />
                </div>
                {/* Publish controls removed */}
              </div>

              <div className="flex justify-end gap-4 pt-6 border-t border-[#333]">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-6 py-3 bg-transparent border border-[#333] rounded-sm text-gray-400 font-arcade text-xs uppercase tracking-widest hover:text-white hover:border-gray-500 transition"
                >
                  ABORT
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-8 py-3 bg-[#FFD400] text-black font-arcade text-xs uppercase tracking-widest rounded-sm hover:bg-[#FFE066] transition disabled:opacity-50"
                >
                  {submitting ? "PROCESSING..." : editingId ? "REROUTE_DATA" : "INITIATE_UPLOAD"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
