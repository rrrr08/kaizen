'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { CheckCircle, ShoppingBag, ArrowRight, Printer, Download, MapPin, Mail, Phone } from 'lucide-react';
import { motion } from 'framer-motion';

export const dynamic = 'force-dynamic';

interface Product {
  name: string;
  price: number;
  image?: string;
}

interface OrderItem {
  product: Product;
  quantity: number;
  name?: string; // Fallback
  price?: number; // Fallback
}

interface Order {
  id: string;
  items: OrderItem[];
  totalPrice: number;
  subtotal?: number;
  gst?: number;
  gstRate?: number;
  discount?: number;
  shippingCost?: number;
  totalPoints: number;
  shippingAddress: {
    name: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    phone?: string;
    email?: string;
  };
  createdAt: string;
  paymentId?: string;
}

export default function OrderConfirmationPage() {
  const params = useParams();
  const searchParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadOrder = async () => {
      try {
        const { getOrderById } = await import('@/lib/firebase');
        const orderId = params.id as string;
        const firebaseOrder = await getOrderById(orderId);
        if (firebaseOrder) {
          setOrder(firebaseOrder as any);
        }
        setLoading(false);
      } catch (error) {
        console.error('Error loading order:', error);
        setLoading(false);
      }
    };
    loadOrder();
  }, [params.id]);

  useEffect(() => {
    if (!loading && order && searchParams?.get('autoPrint') === 'true') {
      setTimeout(() => {
        window.print();
      }, 500); // Small delay to ensure render
    }
  }, [loading, order, searchParams]);

  if (loading) {
    return (
      <div className="min-h-screen pt-28 pb-16 flex items-center justify-center bg-[#FFFDF5] print:hidden">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-black border-t-[#FFD93D] mb-4"></div>
          <p className="text-black font-black text-xs tracking-[0.4em]">VERIFYING ORDER...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen pt-28 pb-16 flex items-center justify-center bg-[#FFFDF5] print:hidden">
        <div className="text-center">
          <h1 className="font-header text-6xl font-black mb-6 text-black uppercase">ORDER NOT FOUND</h1>
          <Link href="/shop" className="inline-block px-8 py-4 bg-[#FFD93D] text-black font-black text-sm rounded-[15px] border-2 border-black neo-shadow hover:scale-105 transition-all">
            RETURN TO SHOP
          </Link>
        </div>
      </div>
    );
  }

  const subtotal = order.subtotal || order.items.reduce((acc, item) => acc + (item.product?.price || item.price || 0) * item.quantity, 0);
  const gst = order.gst || 0;
  const discount = order.discount || 0;
  const total = order.totalPrice;

  return (
    <div className="min-h-screen bg-[#FFFDF5] text-[#2D3436] print:bg-white print:p-0">

      {/* ==================== WEB VIEW (Gamified) ==================== */}
      <div className="pt-32 pb-16 max-w-3xl mx-auto px-6 md:px-12 print:hidden">
        <div className="text-center mb-16">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="flex justify-center mb-8">
            <div className="w-24 h-24 bg-[#00B894] rounded-full flex items-center justify-center border-3 border-black neo-shadow">
              <CheckCircle className="w-12 h-12 text-white" strokeWidth={3} />
            </div>
          </motion.div>
          <h1 className="font-header text-6xl md:text-7xl font-black mb-6 tracking-tighter text-black leading-none uppercase">
            ORDER<br /><span className="text-[#00B894] drop-shadow-[3px_3px_0px_#000]">CONFIRMED!</span>
          </h1>
          <p className="text-xl text-black/70 font-bold max-w-lg mx-auto italic mb-8">
            High five! Your loot is secured. You can download your official tax invoice below.
          </p>

          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 px-8 py-4 bg-black text-white font-black text-sm tracking-widest rounded-[15px] border-2 border-transparent hover:bg-[#6C5CE7] hover:-translate-y-1 transition-all neo-shadow shadow-black/20 uppercase"
          >
            <Printer className="w-5 h-5" />
            Download / Print Invoice
          </button>
        </div>

        <div className="bg-white border-2 border-black rounded-[25px] p-8 neo-shadow mb-8 relative overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8 relative z-10">
            <div>
              <p className="text-[10px] font-black tracking-[0.2em] text-black/40 mb-2 uppercase">ORDER ID</p>
              <p className="font-mono text-xs font-bold bg-[#F0F0F0] px-3 py-1 rounded border border-black/10 inline-block">{order.id.slice(0, 12)}...</p>
            </div>
            <div>
              <p className="text-[10px] font-black tracking-[0.2em] text-black/40 mb-2 uppercase">DATE</p>
              <p className="font-header text-xl font-black text-black">{new Date(order.createdAt).toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-[10px] font-black tracking-[0.2em] text-black/40 mb-2 uppercase">TOTAL</p>
              <p className="font-header text-3xl font-black text-[#6C5CE7]">₹{order.totalPrice.toFixed(2)}</p>
            </div>
          </div>

          <div className="border-t-2 border-dashed border-black/20 pt-8 relative z-10">
            <div className="bg-[#FFD93D] border-2 border-black rounded-xl p-6 flex items-center gap-6 shadow-[4px_4px_0px_rgba(0,0,0,0.1)]">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center border-2 border-black font-black text-2xl">🏆</div>
              <div>
                <p className="text-xs font-black tracking-[0.1em] text-black/60 uppercase mb-1">JP Gained</p>
                <p className="font-header text-4xl font-black tracking-tight text-black">+{order.totalPoints} JP</p>
                <p className="text-sm text-black font-bold mt-1 uppercase">Added to your stash!</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <Link href="/wallet" className="flex-1 py-4 bg-white border-2 border-black text-black font-black text-xs tracking-wider text-center hover:bg-gray-50 rounded-[15px] uppercase neo-shadow">VIEW WALLET</Link>
          <Link href="/shop" className="flex-1 py-4 bg-black text-white border-2 border-black font-black text-sm tracking-wider text-center hover:bg-[#6C5CE7] rounded-[15px] uppercase neo-shadow flex items-center justify-center gap-2">CONTINUE SHOPPING <ArrowRight size={18} /></Link>
        </div>
      </div>

      {/* ==================== PRINT VIEW (Invoice) ==================== */}
      <div className="hidden print:block p-8 max-w-[21cm] mx-auto bg-white text-black">
        {/* Header */}
        <div className="flex justify-between items-start border-b-2 border-black/10 pb-8 mb-8">
          <div>
            <h1 className="font-header text-4xl font-black uppercase mb-1 tracking-tighter">Joy Juncture</h1>
            <p className="text-xs font-bold text-black/40 tracking-[0.2em] uppercase mb-4">The Playground of Future</p>
            <div className="text-sm font-medium text-black/70 space-y-1">
              <p>Joy Juncture HQ</p>
              <p>123 Game Lane, Play City</p>
              <p>India, 560001</p>
              <p>support@joyjuncture.com</p>
            </div>
          </div>
          <div className="text-right">
            <h2 className="text-2xl font-black uppercase text-black/10 mb-2">TAX INVOICE</h2>
            <div className="space-y-1">
              <p className="text-sm"><span className="font-bold">Invoice #:</span> {order.id.slice(0, 8).toUpperCase()}</p>
              <p className="text-sm"><span className="font-bold">Date:</span> {new Date(order.createdAt).toLocaleDateString()}</p>
              <p className="text-sm"><span className="font-bold">Order ID:</span> {order.id}</p>
              {order.paymentId && <p className="text-sm"><span className="font-bold">Payment ID:</span> {order.paymentId}</p>}
            </div>
          </div>
        </div>

        {/* Bill To */}
        <div className="mb-12">
          <h3 className="text-xs font-black uppercase tracking-widest text-black/40 mb-4">Bill To</h3>
          <div className="bg-gray-50 p-6 rounded-lg border border-black/5">
            <p className="font-bold text-lg mb-1">{order.shippingAddress.name}</p>
            <p className="text-sm text-black/70">{order.shippingAddress.address}</p>
            <p className="text-sm text-black/70">
              {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}
            </p>
            <div className="mt-4 flex gap-6 text-sm text-black/60">
              {order.shippingAddress.email && <span className="flex items-center gap-2"><Mail size={14} /> {order.shippingAddress.email}</span>}
              {order.shippingAddress.phone && <span className="flex items-center gap-2"><Phone size={14} /> {order.shippingAddress.phone}</span>}
            </div>
          </div>
        </div>

        {/* Line Items */}
        <table className="w-full mb-8">
          <thead>
            <tr className="border-b-2 border-black">
              <th className="text-left py-4 text-xs font-black uppercase tracking-widest">Item Description</th>
              <th className="text-right py-4 text-xs font-black uppercase tracking-widest">Qty</th>
              <th className="text-right py-4 text-xs font-black uppercase tracking-widest">Unit Price</th>
              <th className="text-right py-4 text-xs font-black uppercase tracking-widest">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black/5">
            {order.items.map((item, idx) => (
              <tr key={idx}>
                <td className="py-4">
                  <p className="font-bold text-sm">{item.product?.name || item.name || 'Game Item'}</p>
                </td>
                <td className="py-4 text-right font-medium text-sm">{item.quantity}</td>
                <td className="py-4 text-right font-medium text-sm">₹{(item.product?.price || item.price || 0).toFixed(2)}</td>
                <td className="py-4 text-right font-bold text-sm">₹{((item.product?.price || item.price || 0) * item.quantity).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals */}
        <div className="flex justify-end mb-16">
          <div className="w-64 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="font-medium text-black/60">Subtotal</span>
              <span className="font-bold">₹{subtotal.toFixed(2)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-sm text-[#00B894]">
                <span className="font-medium">Discount</span>
                <span className="font-bold">-₹{discount.toFixed(2)}</span>
              </div>
            )}
            {gst > 0 && (
              <div className="flex justify-between text-sm">
                <span className="font-medium text-black/60">GST (Included)</span>
                <span className="font-bold">₹{gst.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between py-4 border-t-2 border-black">
              <span className="font-black uppercase tracking-widest">Total</span>
              <span className="font-header text-2xl font-black">₹{total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center pt-8 border-t border-black/10">
          <p className="text-sm font-bold text-black/60 mb-2">Thank you for playing with Joy Juncture!</p>
          <p className="text-[10px] text-black/30 font-medium uppercase tracking-widest">Computer Generated Invoice • No Signature Required</p>
        </div>
      </div>
    </div>
  );
}
