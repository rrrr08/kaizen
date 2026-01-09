'use client';

import { useState } from 'react';
import { CommunityService } from '@/lib/db/community-service';
import { useAuth } from '@/app/context/AuthContext';
import { X, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export default function CreateThreadModal({ isOpen, onClose, onSuccess }: Props) {
    const { user } = useAuth();
    const { addToast } = useToast();
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        title: '',
        description: '',
        category: 'general' as 'general' | 'announcement' | 'qna'
    });

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        setLoading(true);
        const result = await CommunityService.createThread({
            ...form,
            createdBy: user.uid,
            category: form.category,
            isLocked: false
        });

        setLoading(false);
        if (result.success) {
            setForm({ title: '', description: '', category: 'general' });
            onSuccess();
        } else {
            addToast({
                title: 'Error',
                description: 'Failed to create thread. Please try again.',
                variant: 'destructive'
            });
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white border-4 border-black p-8 rounded-[30px] max-w-md w-full shadow-[8px_8px_0px_#000] relative">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-black hover:rotate-90 transition-transform"
                >
                    <X size={24} />
                </button>

                <h3 className="font-header text-2xl mb-6 text-black">Start Discussion</h3>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-black uppercase tracking-widest mb-2 text-black/70">Category</label>
                        <div className="grid grid-cols-3 gap-2">
                            {['general', 'announcement', 'qna'].map(cat => (
                                <button
                                    key={cat}
                                    type="button"
                                    onClick={() => setForm({ ...form, category: cat as any })}
                                    className={`py-2 rounded-lg text-xs font-bold uppercase tracking-wider border-2 transition-all ${form.category === cat
                                        ? 'bg-black text-white border-black'
                                        : 'bg-white text-black border-gray-200'
                                        }`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-black uppercase tracking-widest mb-2 text-black/70">Title</label>
                        <input
                            required
                            value={form.title}
                            onChange={e => setForm({ ...form, title: e.target.value })}
                            className="w-full border-2 border-black rounded-xl p-3 font-bold focus:outline-none focus:ring-4 focus:ring-[#FFD93D]/50"
                            placeholder="What's this about?"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-black uppercase tracking-widest mb-2 text-black/70">Description</label>
                        <textarea
                            required
                            value={form.description}
                            onChange={e => setForm({ ...form, description: e.target.value })}
                            className="w-full border-2 border-black rounded-xl p-3 font-bold focus:outline-none focus:ring-4 focus:ring-[#FFD93D]/50 min-h-[100px] resize-none"
                            placeholder="Give some context..."
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-4 bg-[#FFD93D] text-black font-black text-xs tracking-[0.2em] border-2 border-black hover:translate-y-[-2px] transition-transform rounded-xl mt-4 flex justify-center gap-2"
                    >
                        {loading && <Loader2 className="animate-spin" size={16} />}
                        CREATE THREAD
                    </button>
                </form>
            </div>
        </div>
    );
}
