'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Mail, Send, MessageSquare, User, AtSign, ArrowRight, Twitter, Instagram, Youtube } from 'lucide-react';
import { useAuth } from '@/app/context/AuthContext';

export default function ContactPage() {
    const { user } = useAuth();
    const [formData, setFormData] = useState({
        name: user?.displayName || '',
        email: user?.email || '',
        subject: '',
        message: '',
    });

    // Update form when user data is available
    useEffect(() => {
        if (user) {
            setFormData(prev => ({
                ...prev,
                name: prev.name || user.displayName || '',
                email: prev.email || user.email || '',
            }));
        }
    }, [user]);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        // Basic check to prevent input beyond maxLength even if browser doesn't enforce it strictly
        const limits: Record<string, number> = { name: 100, email: 100, subject: 100, message: 2000 };
        if (limits[name] && value.length > limits[name]) return;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess(false);

        try {
            const response = await fetch('/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Something went wrong');
            }

            setSuccess(true);
            setFormData({ name: '', email: '', subject: '', message: '' });
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen pt-32 pb-20 bg-[#FFFDF5]">
            <div className="container mx-auto px-6 max-w-5xl">
                {/* Header Section */}
                <div className="text-center mb-16">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-block px-4 py-1.5 bg-[#FFD93D] border-2 border-black rounded-full font-black text-xs uppercase tracking-widest mb-6 shadow-[2px_2px_0px_rgba(0,0,0,1)]"
                    >
                        Get In Touch
                    </motion.div>
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-6xl md:text-8xl font-black font-display text-black uppercase tracking-tighter mb-6 leading-none"
                    >
                        Say <span className="text-[#6C5CE7]">Hello!</span>
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-xl font-bold text-black/60 max-w-2xl mx-auto"
                    >
                        Have a question about our board games, events, or just want to chat? We're all ears!
                    </motion.p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
                    {/* Info Side */}
                    <div className="lg:col-span-5 space-y-6">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 }}
                            className="bg-white border-2 border-black p-8 rounded-[30px] neo-shadow group"
                        >
                            <div className="w-14 h-14 bg-[#FF7675] border-2 border-black rounded-2xl flex items-center justify-center mb-6 shadow-[4px_4px_0px_#000] rotate-[-5deg] group-hover:rotate-0 transition-transform">
                                <Mail className="text-white w-6 h-6" />
                            </div>
                            <h3 className="text-2xl font-black font-display mb-2 uppercase tracking-tight">Email Us</h3>
                            <p className="font-bold text-black/50 mb-4 text-sm">Our team usually responds within 24 hours.</p>
                            <a href="mailto:hello@joyjuncture.com" className="text-lg font-black text-black hover:text-[#6C5CE7] transition-colors break-words block">
                                hello@joyjuncture.com
                            </a>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.4 }}
                            className="bg-[#00B894] border-2 border-black p-8 rounded-[30px] neo-shadow"
                        >
                            <h3 className="text-2xl font-black font-display mb-6 uppercase tracking-tight text-white">Follow the fun</h3>
                            <div className="flex flex-wrap gap-3">
                                {[
                                    { name: 'Twitter', icon: Twitter, color: 'hover:bg-[#1DA1F2]' },
                                    { name: 'Instagram', icon: Instagram, color: 'hover:bg-[#E4405F]' },
                                    { name: 'YouTube', icon: Youtube, color: 'hover:bg-[#FF0000]' }
                                ].map((social) => (
                                    <button
                                        key={social.name}
                                        className={`flex items-center gap-2 px-4 py-3 bg-white border-2 border-black rounded-xl font-black text-[10px] uppercase tracking-wider shadow-[4px_4px_0px_#000] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all ${social.color} hover:text-white`}
                                    >
                                        <social.icon size={14} />
                                        {social.name}
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    </div>

                    {/* Form Side */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.5 }}
                        className="lg:col-span-7 bg-white border-2 border-black p-8 md:p-12 rounded-[40px] neo-shadow-lg"
                    >
                        {success ? (
                            <div className="text-center py-12">
                                <div className="w-20 h-20 bg-[#00B894] border-2 border-black rounded-full flex items-center justify-center mx-auto mb-8 shadow-[6px_6px_0px_#000]">
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ type: 'spring', damping: 10 }}
                                    >
                                        <Send className="text-white w-10 h-10" />
                                    </motion.div>
                                </div>
                                <h2 className="text-4xl font-black font-display mb-4 uppercase tracking-tight">Message Sent!</h2>
                                <p className="text-lg font-bold text-black/60 mb-8">
                                    Check your inbox for an acknowledgement email. We'll get back to you soon!
                                </p>
                                <button
                                    onClick={() => setSuccess(false)}
                                    className="px-8 py-4 bg-[#FFD93D] border-2 border-black rounded-2xl font-black uppercase tracking-widest shadow-[4px_4px_0px_#000] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all"
                                >
                                    Send another message
                                </button>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-black uppercase tracking-widest text-black/40 ml-2">Your Name</label>
                                        <div className="relative">
                                            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-black/20" />
                                            <input
                                                required
                                                type="text"
                                                name="name"
                                                value={formData.name}
                                                onChange={handleInputChange}
                                                placeholder="John Doe"
                                                maxLength={100}
                                                className="w-full pl-12 pr-4 py-4 bg-[#FFFDF5] border-2 border-black rounded-2xl focus:outline-none focus:shadow-[4px_4px_0px_#000] transition-all font-bold placeholder:text-black/20"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-black uppercase tracking-widest text-black/40 ml-2">Email Address</label>
                                        <div className="relative">
                                            <AtSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-black/20" />
                                            <input
                                                required
                                                type="email"
                                                name="email"
                                                value={formData.email}
                                                onChange={handleInputChange}
                                                placeholder="john@example.com"
                                                maxLength={100}
                                                className="w-full pl-12 pr-4 py-4 bg-[#FFFDF5] border-2 border-black rounded-2xl focus:outline-none focus:shadow-[4px_4px_0px_#000] transition-all font-bold placeholder:text-black/20"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-widest text-black/40 ml-2">Subject</label>
                                    <div className="relative">
                                        <MessageSquare className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-black/20" />
                                        <input
                                            required
                                            type="text"
                                            name="subject"
                                            value={formData.subject}
                                            onChange={handleInputChange}
                                            placeholder="How can we help?"
                                            maxLength={100}
                                            className="w-full pl-12 pr-4 py-4 bg-[#FFFDF5] border-2 border-black rounded-2xl focus:outline-none focus:shadow-[4px_4px_0px_#000] transition-all font-bold placeholder:text-black/20"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-widest text-black/40 ml-2">Message</label>
                                    <textarea
                                        required
                                        name="message"
                                        rows={5}
                                        value={formData.message}
                                        onChange={handleInputChange}
                                        placeholder="Tell us everything..."
                                        maxLength={2000}
                                        className="w-full px-6 py-4 bg-[#FFFDF5] border-2 border-black rounded-2xl focus:outline-none focus:shadow-[4px_4px_0px_#000] transition-all font-bold placeholder:text-black/20 resize-none"
                                    />
                                    <p className="text-[10px] text-black/40 font-bold mt-1 uppercase tracking-wider text-right">{formData.message.length}/2000</p>
                                </div>

                                {error && (
                                    <div className="p-4 bg-[#FF7675]/10 border-2 border-[#FF7675] rounded-xl text-[#FF7675] font-black text-sm uppercase tracking-tight">
                                        Error: {error}
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-5 bg-[#6C5CE7] text-white font-black uppercase tracking-[0.2em] rounded-2xl border-2 border-black shadow-[6px_6px_0px_#000] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                                >
                                    {loading ? (
                                        <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin" />
                                    ) : (
                                        <>
                                            Send Message
                                            <ArrowRight className="w-5 h-5" />
                                        </>
                                    )}
                                </button>
                            </form>
                        )}
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
