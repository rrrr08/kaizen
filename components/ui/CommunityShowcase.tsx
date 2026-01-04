'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Users, Trophy, Calendar, Star, Zap, Heart } from 'lucide-react';

const stats = [
    { icon: <Users size={48} />, value: '10,000+', label: 'Active Players', color: 'bg-[#6C5CE7]' },
    { icon: <Trophy size={48} />, value: '500+', label: 'Games Played Weekly', color: 'bg-[#FFD93D]' },
    { icon: <Calendar size={48} />, value: '50+', label: 'Monthly Events', color: 'bg-[#00B894]' },
    { icon: <Star size={48} />, value: '4.9/5', label: 'Community Rating', color: 'bg-[#6C5CE7]' }
];

const testimonials = [
    {
        name: 'Priya Sharma',
        role: 'Regular Player',
        quote: 'Found my tribe here. Every Friday is game night now!',
        avatar: '🎲'
    },
    {
        name: 'Arjun Patel',
        role: 'Tournament Winner',
        quote: 'The competitive scene is insane. Love the energy!',
        avatar: '🏆'
    },
    {
        name: 'Neha Gupta',
        role: 'Event Organizer',
        quote: 'Hosting events here changed my social life completely.',
        avatar: '🎯'
    }
];

const CommunityShowcase: React.FC = () => {
    return (
        <section className="px-6 py-32 bg-white relative overflow-hidden">
            {/* Decorative Background */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-[#FFD93D]/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#6C5CE7]/10 rounded-full blur-3xl" />

            <div className="container mx-auto relative z-10">
                {/* Section Header */}
                <div className="flex flex-col mb-16 space-y-4">
                    <h2 className="text-6xl font-black flex items-center gap-6">
                        <span className="bg-[#FFD93D] text-black px-6 py-2 rounded-2xl neo-border neo-shadow">02</span>
                        The Community Pulse
                    </h2>
                    <p className="text-2xl font-semibold text-charcoal/60 max-w-2xl ml-2">
                        Real people. Real connections. Real fun.
                    </p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
                    {stats.map((stat, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1 }}
                            whileHover={{ scale: 1.05, rotate: i % 2 === 0 ? 2 : -2 }}
                            className={`${stat.color} text-white p-8 rounded-[30px] neo-border-thick neo-shadow relative overflow-hidden group`}
                        >
                            <div className="absolute top-0 right-0 opacity-10 group-hover:opacity-20 transition-opacity">
                                {stat.icon}
                            </div>
                            <div className="relative z-10">
                                <div className="mb-4">{stat.icon}</div>
                                <p className="text-5xl font-black mb-2">{stat.value}</p>
                                <p className="text-lg font-bold opacity-90">{stat.label}</p>
                            </div>
                            <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-white/10 rounded-full blur-xl" />
                        </motion.div>
                    ))}
                </div>

                {/* Testimonials Section */}
                <div className="space-y-8">
                    <h3 className="text-4xl font-black flex items-center gap-4">
                        <Heart size={40} className="text-[#6C5CE7]" />
                        What Players Say
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {testimonials.map((testimonial, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, x: -20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.15 }}
                                whileHover={{ y: -8 }}
                                className="bg-[#FFFDF5] p-8 rounded-[30px] neo-border-thick neo-shadow relative"
                            >
                                <div className="absolute top-6 right-6 text-6xl opacity-20">{testimonial.avatar}</div>
                                <div className="relative z-10">
                                    <div className="flex items-center gap-4 mb-6">
                                        <div className="w-16 h-16 bg-[#6C5CE7] rounded-full flex items-center justify-center text-3xl neo-border">
                                            {testimonial.avatar}
                                        </div>
                                        <div>
                                            <p className="font-black text-xl">{testimonial.name}</p>
                                            <p className="font-bold text-sm text-charcoal/60">{testimonial.role}</p>
                                        </div>
                                    </div>
                                    <p className="text-xl font-bold text-charcoal/80 leading-relaxed italic">
                                        &ldquo;{testimonial.quote}&rdquo;
                                    </p>
                                    <div className="flex gap-1 mt-6">
                                        {[...Array(5)].map((_, i) => (
                                            <Star key={i} size={20} className="text-[#FFD93D] fill-current" />
                                        ))}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Live Activity Feed */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="mt-20 bg-black text-white p-10 rounded-[40px] neo-border-thick neo-shadow"
                >
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-4 h-4 bg-[#00B894] rounded-full animate-pulse" />
                        <h4 className="text-3xl font-black">Live Activity</h4>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white/10 p-6 rounded-2xl neo-border backdrop-blur-sm">
                            <Zap size={32} className="text-[#FFD93D] mb-3" />
                            <p className="font-black text-2xl mb-1">23</p>
                            <p className="font-bold text-sm opacity-70">Games in Progress</p>
                        </div>
                        <div className="bg-white/10 p-6 rounded-2xl neo-border backdrop-blur-sm">
                            <Users size={32} className="text-[#00B894] mb-3" />
                            <p className="font-black text-2xl mb-1">156</p>
                            <p className="font-bold text-sm opacity-70">Players Online Now</p>
                        </div>
                        <div className="bg-white/10 p-6 rounded-2xl neo-border backdrop-blur-sm">
                            <Calendar size={32} className="text-[#6C5CE7] mb-3" />
                            <p className="font-black text-2xl mb-1">Next Event</p>
                            <p className="font-bold text-sm opacity-70">Friday, 7 PM</p>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
};

export default CommunityShowcase;
