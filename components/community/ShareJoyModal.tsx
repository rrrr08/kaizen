'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Loader2, Sparkles, ImagePlus, Trash } from 'lucide-react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { usePopup } from '@/app/context/PopupContext';
import { CldUploadWidget } from 'next-cloudinary';
import Image from 'next/image';

interface ShareJoyModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export default function ShareJoyModal({ isOpen, onClose, onSuccess }: ShareJoyModalProps) {
    const { showAlert } = usePopup();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        role: '',
        quote: '',
        image: '' // Optional image URL
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.name.trim() || !formData.quote.trim()) {
            showAlert('Name and Quote are required!', 'error');
            return;
        }

        try {
            setLoading(true);

            // Create new testimonial
            // NOTE: Status is 'pending' to allow for moderation before public visibility.
            await addDoc(collection(db, 'proofofjoys'), {
                name: formData.name,
                role: formData.role || 'Community Member',
                quote: formData.quote,
                image: formData.image || '',
                status: 'pending',
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            });

            showAlert('Your story has been shared!', 'success');
            onSuccess(); // Triggers refresh in parent
            onClose();
            setFormData({ name: '', role: '', quote: '', image: '' }); // Reset
        } catch (error) {
            console.error("Error submitting joy:", error);
            showAlert('Failed to share details. Please try again.', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        className="relative w-full max-w-lg bg-[#FFFDF5] border-4 border-black rounded-[32px] p-8 neo-shadow overflow-hidden"
                    >
                        {/* Close Button */}
                        <button
                            onClick={onClose}
                            className="absolute top-6 right-6 p-2 hover:bg-black/5 rounded-full transition-colors"
                        >
                            <X size={24} className="text-black" />
                        </button>

                        <div className="mb-8">
                            <div className="flex items-center gap-2 mb-2">
                                <Sparkles className="text-[#FF7675]" size={20} />
                                <span className="font-black text-xs uppercase tracking-[0.2em] text-[#FF7675]">Spread the Joy</span>
                            </div>
                            <h3 className="font-header text-4xl text-black">Share Your Story</h3>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="block font-bold text-sm uppercase tracking-wide mb-2 text-black/60">Your Name *</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full bg-white border-2 border-black rounded-xl p-4 font-bold focus:outline-none focus:ring-4 focus:ring-[#6C5CE7]/20 transition-all"
                                    placeholder="e.g. Alex Chen"
                                />
                            </div>

                            <div>
                                <label className="block font-bold text-sm uppercase tracking-wide mb-2 text-black/60">Your Role / Title</label>
                                <input
                                    type="text"
                                    value={formData.role}
                                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                    className="w-full bg-white border-2 border-black rounded-xl p-4 font-bold focus:outline-none focus:ring-4 focus:ring-[#6C5CE7]/20 transition-all"
                                    placeholder="e.g. Game Enthusiast"
                                />
                            </div>

                            <div>
                                <label className="block font-bold text-sm uppercase tracking-wide mb-2 text-black/60">Your Joy Moment *</label>
                                <textarea
                                    value={formData.quote}
                                    onChange={(e) => setFormData({ ...formData, quote: e.target.value })}
                                    rows={4}
                                    className="w-full bg-white border-2 border-black rounded-xl p-4 font-bold focus:outline-none focus:ring-4 focus:ring-[#6C5CE7]/20 transition-all resize-none"
                                    placeholder="Share a short testimonial or a happy moment..."
                                />
                            </div>

                            <div>
                                <label className="block font-bold text-sm uppercase tracking-wide mb-2 text-black/60">Profile Photo</label>

                                {formData.image ? (
                                    <div className="relative w-full h-48 bg-gray-100 rounded-xl overflow-hidden border-2 border-black group">
                                        <Image
                                            src={formData.image}
                                            alt="Preview"
                                            fill
                                            className="object-cover"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setFormData({ ...formData, image: '' })}
                                            className="absolute top-2 right-2 p-2 bg-[#FF7675] border-2 border-black rounded-lg hover:bg-red-500 transition-colors"
                                        >
                                            <Trash size={16} className="text-white" />
                                        </button>
                                    </div>
                                ) : (
                                    <CldUploadWidget
                                        onSuccess={(result: any) => {
                                            if (result?.info?.secure_url) {
                                                setFormData({ ...formData, image: result.info.secure_url });
                                            }
                                        }}
                                        uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "kaizen_uploads"}
                                        options={{
                                            maxFiles: 1,
                                            resourceType: "image"
                                        }}
                                    >
                                        {({ open }) => {
                                            return (
                                                <button
                                                    type="button"
                                                    onClick={() => open()}
                                                    className="w-full py-4 border-2 border-dashed border-black/30 rounded-xl flex flex-col items-center justify-center gap-2 text-black/40 hover:text-black hover:border-black hover:bg-black/5 transition-all"
                                                >
                                                    <ImagePlus size={24} />
                                                    <span className="font-bold uppercase tracking-wide">Upload Photo</span>
                                                </button>
                                            );
                                        }}
                                    </CldUploadWidget>
                                )}
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-4 bg-[#6C5CE7] text-white border-2 border-black rounded-xl font-black uppercase tracking-widest hover:translate-y-[-2px] hover:shadow-[4px_4px_0px_#000] active:translate-y-[0px] active:shadow-none transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? <Loader2 className="animate-spin" /> : <Send size={20} />}
                                <span>Submit Story</span>
                            </button>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
