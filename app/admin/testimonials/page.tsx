'use client';

import { useEffect, useState } from 'react';
import { MessageSquare, Check, X, Trash2, Search, Filter, Loader2, Upload, Image as ImageIcon, Library } from 'lucide-react';
import Image from 'next/image';
import { CldUploadWidget } from 'next-cloudinary';
import { MediaGalleryModal } from '@/components/ui/MediaGalleryModal';

interface Testimonial {
    id: string;
    name: string;
    role: string;
    quote: string;
    image?: string;
    status: 'pending' | 'approved' | 'rejected';
    createdAt: string;
}

export default function TestimonialsPage() {
    const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
    const [uploadingPhoto, setUploadingPhoto] = useState<string | null>(null);

    useEffect(() => {
        fetchTestimonials();
    }, []);

    const fetchTestimonials = async () => {
        try {
            const res = await fetch('/api/testimonials?all=true');
            const data = await res.json();
            if (data.success) {
                setTestimonials(data.testimonials);
            }
        } catch (error) {
            console.error('Error loading testimonials:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (id: string, newStatus: 'approved' | 'rejected') => {
        try {
            const res = await fetch('/api/testimonials', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, status: newStatus }),
            });
            const data = await res.json();

            if (data.success) {
                setTestimonials(prev => prev.map(t => t.id === id ? { ...t, status: newStatus } : t));
            } else {
                alert('Failed to update status');
            }
        } catch (error) {
            console.error('Error updating status:', error);
            alert('Error updating status');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this testimonial?')) return;

        try {
            const res = await fetch(`/api/testimonials?id=${id}`, {
                method: 'DELETE',
            });
            const data = await res.json();

            if (data.success) {
                setTestimonials(prev => prev.filter(t => t.id !== id));
            } else {
                alert('Failed to delete');
            }
        } catch (error) {
            console.error('Error deleting:', error);
            alert('Error deleting');
        }
    };

    const handlePhotoUpload = async (id: string, imageUrl: string) => {
        setUploadingPhoto(id);
        try {
            const res = await fetch('/api/testimonials', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, image: imageUrl }),
            });
            const data = await res.json();

            if (data.success) {
                setTestimonials(prev => prev.map(t =>
                    t.id === id ? { ...t, image: imageUrl } : t
                ));
            } else {
                alert('Failed to upload photo');
            }
        } catch (error) {
            console.error('Error uploading photo:', error);
            alert('Error uploading photo');
        } finally {
            setUploadingPhoto(null);
        }
    };

    const filteredTestimonials = testimonials.filter(t => filter === 'all' || t.status === filter);

    const pendingCount = testimonials.filter(t => t.status === 'pending').length;
    const approvedCount = testimonials.filter(t => t.status === 'approved').length;

    if (loading) {
        return (
            <div className="p-8 flex items-center justify-center min-h-screen bg-[#FFFDF5]">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-[#FFD93D] border-t-black rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-black font-black uppercase tracking-widest">Loading testimonials...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-8 pb-16 min-h-screen bg-[#FFFDF5]">
            {/* Header */}
            <div className="flex items-center justify-between mb-8 border-b-2 border-black pb-8">
                <div>
                    <h1 className="font-header text-5xl font-black text-black mb-2 uppercase tracking-tighter">Testimonials</h1>
                    <p className="text-black/60 font-bold text-lg">Manage community stories and reviews</p>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                <div className="bg-[#FFD93D] border-2 border-black rounded-[20px] p-6 neo-shadow hover:-translate-y-1 transition-transform">
                    <p className="text-black text-xs font-black uppercase tracking-widest mb-2">Total Stories</p>
                    <p className="font-header text-5xl font-black text-black">{testimonials.length}</p>
                </div>
                <div className="bg-[#FF7675] border-2 border-black rounded-[20px] p-6 neo-shadow hover:-translate-y-1 transition-transform">
                    <p className="text-black text-xs font-black uppercase tracking-widest mb-2">Pending Review</p>
                    <p className="font-header text-5xl font-black text-black">{pendingCount}</p>
                </div>
                <div className="bg-[#00B894] border-2 border-black rounded-[20px] p-6 neo-shadow hover:-translate-y-1 transition-transform">
                    <p className="text-black text-xs font-black uppercase tracking-widest mb-2">Approved</p>
                    <p className="font-header text-5xl font-black text-black">{approvedCount}</p>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white border-2 border-black rounded-xl p-4 mb-8 neo-shadow flex gap-4 overflow-x-auto">
                {(['all', 'pending', 'approved', 'rejected'] as const).map(f => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`px-4 py-2 rounded-lg font-black uppercase text-xs tracking-widest border-2 transition-all ${filter === f
                            ? 'bg-black text-white border-black'
                            : 'bg-white text-black border-transparent hover:bg-gray-100'
                            }`}
                    >
                        {f}
                    </button>
                ))}
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredTestimonials.map(t => (
                    <div key={t.id} className="bg-white border-2 border-black rounded-[25px] p-6 neo-shadow flex flex-col gap-4 relative overflow-hidden group">

                        {/* Status Badge */}
                        <div className={`absolute top-4 right-4 px-3 py-1 rounded-full border-2 border-black text-[10px] font-black uppercase tracking-widest ${t.status === 'approved' ? 'bg-[#00B894] text-white' :
                            t.status === 'rejected' ? 'bg-gray-200 text-gray-500' :
                                'bg-[#FF7675] text-white'
                            }`}>
                            {t.status}
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="relative group/avatar">
                                <Image
                                    src={t.image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${t.name}`}
                                    alt={t.name}
                                    width={48}
                                    height={48}
                                    className="w-12 h-12 rounded-full border-2 border-black bg-gray-100 object-cover"
                                />
                                {/* Upload overlay */}
                                <div className="flex flex-col gap-1">
                                    <CldUploadWidget
                                        onSuccess={(result: any) => {
                                            if (result.event === 'success' && result.info?.secure_url) {
                                                handlePhotoUpload(t.id, result.info.secure_url);
                                            }
                                        }}
                                        uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "kaizen_uploads"}
                                    >
                                        {({ open }) => (
                                            <button
                                                type="button"
                                                onClick={() => open()}
                                                disabled={uploadingPhoto === t.id}
                                                className="absolute inset-0 bg-black/70 rounded-full flex items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-opacity cursor-pointer disabled:cursor-not-allowed z-10"
                                            >
                                                {uploadingPhoto === t.id ? (
                                                    <Loader2 size={20} className="text-white animate-spin" />
                                                ) : (
                                                    <Upload size={20} className="text-white" />
                                                )}
                                            </button>
                                        )}
                                    </CldUploadWidget>
                                    <div className="absolute -bottom-2 -right-2 z-20 opacity-0 group-hover/avatar:opacity-100 transition-opacity">
                                        <MediaGalleryModal
                                            onSelect={(url) => handlePhotoUpload(t.id, url)}
                                            trigger={
                                                <button className="bg-[#FFD93D] p-1.5 rounded-full border-2 border-black neo-shadow-sm hover:scale-110 transition-transform">
                                                    <Library size={12} />
                                                </button>
                                            }
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="flex-1">
                                <p className="font-black text-lg text-black leading-tight">{t.name}</p>
                                <p className="text-black/50 text-xs font-bold uppercase tracking-wider">{t.role}</p>
                                {t.image && t.image.startsWith('http') && (
                                    <div className="flex items-center gap-1 mt-1">
                                        <ImageIcon size={12} className="text-green-600" />
                                        <span className="text-[10px] font-bold text-green-600 uppercase">Has Photo</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="bg-gray-50 border-2 border-black/5 rounded-xl p-4 flex-1">
                            <p className="italic font-medium text-black/80">&quot;{t.quote}&quot;</p>
                        </div>

                        <p className="text-black/30 text-[10px] font-black uppercase text-right">
                            {new Date(t.createdAt).toLocaleDateString()}
                        </p>

                        {/* Actions */}
                        <div className="flex gap-2 pt-4 border-t-2 border-black/5">
                            {t.status === 'pending' && (
                                <>
                                    <button
                                        onClick={() => handleStatusUpdate(t.id, 'approved')}
                                        className="flex-1 bg-[#00B894] text-black border-2 border-black rounded-lg p-2 hover:bg-[#00a884] transition shadow-[2px_2px_0px_#000] active:translate-y-[2px] active:shadow-none font-black text-xs uppercase flex items-center justify-center gap-1"
                                    >
                                        <Check size={14} /> Approve
                                    </button>
                                    <button
                                        onClick={() => handleStatusUpdate(t.id, 'rejected')}
                                        className="flex-1 bg-[#FF7675] text-black border-2 border-black rounded-lg p-2 hover:bg-[#ff6b6b] transition shadow-[2px_2px_0px_#000] active:translate-y-[2px] active:shadow-none font-black text-xs uppercase flex items-center justify-center gap-1"
                                    >
                                        <X size={14} /> Reject
                                    </button>
                                </>
                            )}
                            {t.status !== 'pending' && (
                                <button
                                    onClick={() => handleStatusUpdate(t.id, t.status === 'approved' ? 'rejected' : 'approved')}
                                    className="flex-1 bg-white text-black border-2 border-black rounded-lg p-2 hover:bg-gray-100 transition font-black text-xs uppercase"
                                >
                                    {t.status === 'approved' ? 'Reject' : 'Approve'}
                                </button>
                            )}
                            <button
                                onClick={() => handleDelete(t.id)}
                                className="w-10 flex items-center justify-center bg-gray-100 border-2 border-black rounded-lg hover:bg-red-100 hover:text-red-500 transition"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>

                    </div>
                ))}
            </div>

            {filteredTestimonials.length === 0 && (
                <div className="text-center py-20 bg-white border-2 border-black rounded-[30px] border-dashed">
                    <MessageSquare className="w-12 h-12 text-black/20 mx-auto mb-4" />
                    <p className="text-black/40 font-black uppercase">No testimonials found</p>
                </div>
            )}
        </div>
    );
}
