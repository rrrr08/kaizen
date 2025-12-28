'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Clock, Zap, Heart } from 'lucide-react';
import Image from 'next/image';
import { Product } from '@/lib/types';
import { useCart } from '@/app/context/CartContext';
import { useToast } from '@/hooks/use-toast';

interface ProductCardProps {
    product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
    const [isFlipped, setIsFlipped] = useState(false);
    const { addToCart } = useCart();
    const { addToast } = useToast();

    const handleAddToCart = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        addToCart(product, 1);
        addToast({
            title: "Added to Cart",
            description: `${product.name} added to cart!`,
            variant: 'success'
        });
    };

    return (
        <div
            className="relative w-full h-[550px] cursor-pointer perspective-1000"
            onMouseEnter={() => setIsFlipped(true)}
            onMouseLeave={() => setIsFlipped(false)}
        >
            <motion.div
                className="w-full h-full relative preserve-3d"
                initial={false}
                animate={{ rotateY: isFlipped ? 180 : 0 }}
                transition={{ duration: 0.8, type: 'spring', stiffness: 200, damping: 20 }}
            >
                {/* Front Side */}
                <div
                    className="absolute inset-0 w-full h-full bg-white rounded-[30px] neo-border-thick neo-shadow flex flex-col overflow-hidden backface-hidden"
                >
                    {/* Card Top / Image Area */}
                    <div className="h-[65%] w-full relative bg-gray-100 overflow-hidden border-b-3 border-black group">
                        <motion.div
                            animate={{ scale: isFlipped ? 1.1 : 1 }}
                            className="w-full h-full relative"
                        >
                            {product.image ? (
                                <Image
                                    src={product.image}
                                    alt={product.name}
                                    fill
                                    className="object-cover transition-transform duration-700"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-gray-200">
                                    <span className="text-black/40 font-black uppercase text-sm">No Image</span>
                                </div>
                            )}
                        </motion.div>

                        {/* Badges */}
                        <div className="absolute top-5 left-5 flex flex-col gap-3">
                            {product.badges?.map((badge, i) => (
                                <span key={i} className="bg-[#FFD93D] text-black px-4 py-1.5 rounded-full text-xs font-black neo-border neo-shadow uppercase tracking-widest">
                                    {badge}
                                </span>
                            ))}
                        </div>

                        {/* Favorite Button */}
                        <motion.button
                            whileHover={{ scale: 1.2, rotate: 10 }}
                            className="absolute top-5 right-5 bg-white p-3 rounded-full neo-border neo-shadow hover:bg-pink-50 transition-colors"
                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
                        >
                            <Heart size={20} className="text-black group-hover:text-red-500 transition-colors" />
                        </motion.button>
                    </div>

                    {/* Card Bottom / Info Area */}
                    <div className="p-8 flex-grow flex flex-col justify-between bg-[#FFFDF5]">
                        <div className="space-y-2">
                            <h3 className="text-3xl font-black leading-none text-black">{product.name}</h3>
                            <div className="flex items-center gap-3">
                                <span className="text-2xl font-black text-[#6C5CE7]">${product.price}</span>
                                <span className="text-sm font-bold opacity-40 uppercase line-through text-black">${product.price + 15}</span>
                            </div>
                        </div>

                        <div className="flex justify-between items-center bg-gray-100 px-5 py-3 rounded-2xl neo-border">
                            <span className="flex items-center gap-2 font-black text-sm text-black"><Users size={18} className="text-[#6C5CE7]" /> {product.players}</span>
                            <div className="w-1 h-1 bg-black/20 rounded-full" />
                            <span className="flex items-center gap-2 font-black text-sm text-black"><Clock size={18} className="text-[#00B894]" /> {product.time}</span>
                        </div>
                    </div>
                </div>

                {/* Back Side */}
                <div
                    className="absolute inset-0 w-full h-full bg-[#6C5CE7] rounded-[30px] neo-border-thick neo-shadow flex flex-col p-10 text-white backface-hidden"
                    style={{ transform: 'rotateY(180deg)' }}
                >
                    <div className="flex justify-between items-start mb-10">
                        <h4 className="text-3xl font-black uppercase tracking-tighter leading-none">Game<br />Dossier</h4>
                        <div className="bg-[#FFD93D] p-3 rounded-xl neo-border neo-shadow text-black">
                            <Zap size={24} />
                        </div>
                    </div>

                    <div className="space-y-8 flex-grow">
                        <div className="flex items-center gap-6">
                            <div className="bg-white/10 p-4 rounded-2xl neo-border-thick">
                                <Users size={28} />
                            </div>
                            <div>
                                <p className="text-xs font-black uppercase tracking-widest opacity-60">Ideal Group</p>
                                <p className="text-xl font-black">{product.players} Players</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-6">
                            <div className="bg-white/10 p-4 rounded-2xl neo-border-thick">
                                <Clock size={28} />
                            </div>
                            <div>
                                <p className="text-xs font-black uppercase tracking-widest opacity-60">Average Session</p>
                                <p className="text-xl font-black">{product.time}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-6">
                            <div className="bg-white/10 p-4 rounded-2xl neo-border-thick">
                                <Zap size={28} />
                            </div>
                            <div>
                                <p className="text-xs font-black uppercase tracking-widest opacity-60">Mood Check</p>
                                <p className="text-xl font-black bg-[#FFD93D] text-black px-3 py-0.5 rounded-lg neo-border inline-block">{product.mood}</p>
                            </div>
                        </div>
                    </div>

                    <motion.button
                        whileHover={{ scale: 1.05, y: -5 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleAddToCart}
                        className="w-full bg-[#FFD93D] text-black py-5 rounded-2xl font-black text-xl neo-border-thick neo-shadow hover:bg-yellow-400 transition-all"
                    >
                        Add to Bag — ${product.price}
                    </motion.button>
                </div>
            </motion.div >
        </div >
    );
};

export default ProductCard;
