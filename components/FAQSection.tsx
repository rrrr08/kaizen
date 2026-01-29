'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus, HelpCircle, Sparkles } from 'lucide-react';
import { FAQItem } from '@/lib/types';

interface FAQSectionProps {
    faqs: FAQItem[];
}

const FAQSection: React.FC<FAQSectionProps> = ({ faqs }) => {
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    const toggleIndex = (index: number) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    if (!faqs || faqs.length === 0) return null;

    return (
        <section className="py-24 relative overflow-hidden bg-[#FFD93D] border-t-4 border-black">
            {/* Dot Pattern Background */}
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#000 2px, transparent 2px)', backgroundSize: '24px 24px' }}></div>

            <div className="container mx-auto px-4 relative z-10">

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
                    {/* Left Column: Headline */}
                    <div className="lg:col-span-4 static lg:sticky lg:top-32">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="text-left bg-black p-6 md:p-8 border-4 border-black rounded-[30px] shadow-[8px_8px_0px_#FFF]"
                        >
                            <div className="flex items-center gap-2 mb-4">
                                <Sparkles size={16} className="text-white" />
                                <span className="font-black text-xs tracking-[0.3em] text-white uppercase font-display">Support</span>
                            </div>

                            <h2 className="text-3xl sm:text-4xl md:text-6xl font-header font-black tracking-tighter uppercase mb-6 text-white leading-[0.9]">
                                Got <br />
                                <span className="text-[#FFD93D]">Questions?</span>
                            </h2>

                            <p className="font-bold text-white/80 text-lg leading-tight max-w-xs">
                                Everything you need to know about earning, spending, and playing.
                            </p>

                            <div className="mt-8">
                                <div className="w-12 h-1 bg-white rounded-full opacity-20"></div>
                            </div>
                        </motion.div>
                    </div>
                    {/* Right Column: Accordion */}
                    <div className="lg:col-span-8 space-y-4">
                        {faqs.map((faq, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                                className={`
                                  border-4 border-black rounded-2xl overflow-hidden transition-all duration-300 relative
                                  ${openIndex === index ? 'bg-white text-black shadow-[8px_8px_0px_#000]' : 'bg-white/90 hover:bg-white shadow-[4px_4px_0px_#000]'}
                                `}
                            >
                                <button
                                    onClick={() => toggleIndex(index)}
                                    className="w-full p-6 flex justify-between items-center text-left gap-6 focus:outline-none"
                                >
                                    <span className="font-header font-black text-xl md:text-2xl uppercase tracking-tight text-black">
                                        {faq.question}
                                    </span>
                                    <div className={`
                                        flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-xl border-2 transition-transform duration-300
                                        ${openIndex === index ? 'bg-black border-black text-white rotate-180' : 'bg-[#6C5CE7] border-black text-white'}
                                      `}>
                                        {openIndex === index ? <Minus size={20} strokeWidth={4} /> : <Plus size={20} strokeWidth={4} />}
                                    </div>
                                </button>

                                <AnimatePresence>
                                    {openIndex === index && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.3, ease: 'circOut' }}
                                        >
                                            <div className="px-6 pb-8 pt-2">
                                                <div className="h-[2px] w-full bg-black/10 mb-4 rounded-full"></div>
                                                <p className="font-bold text-lg md:text-xl text-black/80 leading-relaxed">
                                                    {faq.answer}
                                                </p>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        ))}
                    </div>
                </div>

            </div>
        </section>
    );
};

export default FAQSection;
