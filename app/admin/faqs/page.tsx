'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Save, X, Edit2, HelpCircle, Loader2 } from 'lucide-react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { FAQItem, HomepageContent } from '@/lib/types';
import { DEFAULT_HOMEPAGE_CONTENT } from '@/lib/ui-config';

export default function AdminFAQsPage() {
    const [faqs, setFaqs] = useState<FAQItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [editingIndex, setEditingIndex] = useState<number | null>(null);

    // Form State
    const [question, setQuestion] = useState('');
    const [answer, setAnswer] = useState('');
    const [isFormOpen, setIsFormOpen] = useState(false);

    useEffect(() => {
        fetchFAQs();
    }, []);

    const fetchFAQs = async () => {
        try {
            const docRef = doc(db, 'content', 'homepage');
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                const data = docSnap.data() as HomepageContent;
                setFaqs(data.faqs || DEFAULT_HOMEPAGE_CONTENT.faqs || []);
            } else {
                setFaqs(DEFAULT_HOMEPAGE_CONTENT.faqs || []);
            }
        } catch (error) {
            console.error("Error fetching FAQs:", error);
            setFaqs(DEFAULT_HOMEPAGE_CONTENT.faqs || []);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (index: number) => {
        setEditingIndex(index);
        setQuestion(faqs[index].question);
        setAnswer(faqs[index].answer);
        setIsFormOpen(true);
    };

    const handleDelete = async (index: number) => {
        if (!confirm('Are you sure you want to delete this FAQ?')) return;

        const newFaqs = faqs.filter((_, i) => i !== index);
        setFaqs(newFaqs);
        await saveToFirestore(newFaqs);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!question.trim() || !answer.trim()) return;

        let newFaqs = [...faqs];
        if (editingIndex !== null) {
            // Update existing
            newFaqs[editingIndex] = { question, answer };
        } else {
            // Add new
            newFaqs.push({ question, answer });
        }

        setFaqs(newFaqs);
        await saveToFirestore(newFaqs);

        // Reset form
        setIsFormOpen(false);
        setEditingIndex(null);
        setQuestion('');
        setAnswer('');
    };

    const saveToFirestore = async (newFaqs: FAQItem[]) => {
        setSaving(true);
        try {
            const docRef = doc(db, 'content', 'homepage');
            // Ensure document exists or merge
            await updateDoc(docRef, { faqs: newFaqs }).catch(async (err) => {
                // If doc doesn't exist, set it (rare case if content/homepage is missing)
                const { setDoc } = await import('firebase/firestore');
                await setDoc(docRef, { ...DEFAULT_HOMEPAGE_CONTENT, faqs: newFaqs }, { merge: true });
            });
        } catch (error) {
            console.error("Error saving FAQs:", error);
            alert("Failed to save changes. Please try again.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="p-8 max-w-5xl mx-auto text-black">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-4xl font-header font-black uppercase tracking-tighter mb-2">FAQ Management</h1>
                    <p className="text-black/60 font-medium">Manage the questions displayed on the homepage.</p>
                </div>
                <button
                    onClick={() => {
                        setEditingIndex(null);
                        setQuestion('');
                        setAnswer('');
                        setIsFormOpen(true);
                    }}
                    className="flex items-center gap-2 bg-black text-[#FFD93D] px-6 py-3 rounded-xl font-black uppercase tracking-wider neo-shadow hover:scale-105 transition-transform"
                >
                    <Plus size={20} strokeWidth={3} />
                    Add Question
                </button>
            </div>

            {loading ? (
                <div className="flex justify-center py-20">
                    <Loader2 size={40} className="animate-spin text-[#6C5CE7]" />
                </div>
            ) : (
                <div className="grid gap-4">
                    {faqs.map((faq, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white border-2 border-black rounded-xl p-6 shadow-[4px_4px_0px_#000] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_#000] transition-all flex justify-between items-start gap-4 group"
                        >
                            <div className="flex-1">
                                <h3 className="font-header font-black text-lg uppercase tracking-wide mb-2 flex items-center gap-2">
                                    <span className="text-[#00B894]">Q:</span> {faq.question}
                                </h3>
                                <p className="text-black/70 font-medium leading-relaxed">
                                    {faq.answer}
                                </p>
                            </div>
                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={() => handleEdit(index)}
                                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors border-2 border-transparent hover:border-black"
                                    title="Edit"
                                >
                                    <Edit2 size={18} />
                                </button>
                                <button
                                    onClick={() => handleDelete(index)}
                                    className="p-2 hover:bg-[#FF7675] hover:text-white rounded-lg transition-colors border-2 border-transparent hover:border-black"
                                    title="Delete"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </motion.div>
                    ))}

                    {faqs.length === 0 && (
                        <div className="text-center py-20 border-2 border-dashed border-black/20 rounded-xl">
                            <HelpCircle size={48} className="mx-auto text-black/20 mb-4" />
                            <p className="text-black/40 font-black uppercase text-xl">No FAQs Found</p>
                        </div>
                    )}
                </div>
            )}

            {/* Edit/Create Modal */}
            <AnimatePresence>
                {isFormOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                            onClick={() => setIsFormOpen(false)}
                        />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white border-4 border-black rounded-2xl p-8 w-full max-w-2xl relative z-10 shadow-[10px_10px_0px_#000]"
                        >
                            <button
                                onClick={() => setIsFormOpen(false)}
                                className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
                            >
                                <X size={24} />
                            </button>

                            <h2 className="text-2xl font-header font-black uppercase tracking-tighter mb-6">
                                {editingIndex !== null ? 'Edit FAQ' : 'New FAQ'}
                            </h2>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <label className="block font-black text-sm uppercase tracking-wider mb-2">Question</label>
                                    <input
                                        type="text"
                                        value={question}
                                        onChange={(e) => setQuestion(e.target.value)}
                                        placeholder="e.g. Do you ship internationally?"
                                        className="w-full bg-[#f8f8f8] border-2 border-black rounded-xl p-4 font-bold focus:outline-none focus:shadow-[4px_4px_0px_#000] focus:bg-white transition-all"
                                        autoFocus
                                    />
                                </div>

                                <div>
                                    <label className="block font-black text-sm uppercase tracking-wider mb-2">Answer</label>
                                    <textarea
                                        value={answer}
                                        onChange={(e) => setAnswer(e.target.value)}
                                        placeholder="Enter the answer here..."
                                        rows={5}
                                        className="w-full bg-[#f8f8f8] border-2 border-black rounded-xl p-4 font-bold focus:outline-none focus:shadow-[4px_4px_0px_#000] focus:bg-white transition-all resize-none"
                                    />
                                </div>

                                <div className="flex justify-end gap-4 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setIsFormOpen(false)}
                                        className="px-6 py-3 font-bold uppercase tracking-wider hover:bg-gray-100 rounded-xl transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={saving}
                                        className="bg-[#00B894] text-white border-2 border-black px-8 py-3 rounded-xl font-black uppercase tracking-wider neo-shadow hover:scale-105 transition-transform flex items-center gap-2"
                                    >
                                        {saving ? (
                                            <>
                                                <Loader2 size={20} className="animate-spin" />
                                                Saving...
                                            </>
                                        ) : (
                                            <>
                                                <Save size={20} />
                                                Save FAQ
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
