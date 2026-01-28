'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { CheckCircle, ShoppingBag, ArrowRight, Printer, Download, MapPin, Mail, Phone, Eye } from 'lucide-react';
import { motion } from 'framer-motion';
import InvoiceModal from '@/components/ui/InvoiceModal';

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
  const [showInvoice, setShowInvoice] = useState(false);

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

      {/* ==================== WEB VIEW (Gamified & Redesigned) ==================== */}
      <div className="pt-28 pb-16 min-h-screen print:hidden">
        <div className="max-w-6xl mx-auto px-6 md:px-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start"
          >
            {/* LEFT COLUMN: Celebration & Actions */}
            <div className="space-y-10 pt-8">
              <div className="space-y-6">
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 200, damping: 15 }}
                  className="w-24 h-24 bg-[#00B894] rounded-[2rem] flex items-center justify-center border-4 border-black neo-shadow-lg rotate-3"
                >
                  <CheckCircle className="w-12 h-12 text-white" strokeWidth={4} />
                </motion.div>

                <h1 className="font-header text-6xl md:text-8xl font-black tracking-tighter text-black leading-[0.9] uppercase drop-shadow-sm">
                  ORDER<br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00B894] to-[#00CEC9] drop-shadow-[4px_4px_0px_#000]">
                    SECURED!
                  </span>
                </h1>

                <p className="text-xl md:text-2xl font-bold text-black/70 max-w-md leading-relaxed">
                  High five! Your loot has been claimed. We've sent a high-priority owl (email) with the details.
                </p>
              </div>

              {/* Gamification Card */}
              <motion.div
                whileHover={{ scale: 1.02, rotate: 1 }}
                className="bg-[#FFD93D] border-4 border-black rounded-[2rem] p-8 neo-shadow-lg relative overflow-hidden group"
              >
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <span className="text-9xl">🏆</span>
                </div>
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="bg-black text-white text-[10px] font-black uppercase px-2 py-1 rounded tracking-widest">Rewards</span>
                  </div>
                  <p className="font-header text-5xl md:text-6xl font-black text-black mb-1">+{order.totalPoints}<span className="text-2xl align-top ml-2">JP</span></p>
                  <p className="font-bold text-black/80 uppercase tracking-wide">Added to your stash balance</p>
                </div>
              </motion.div>

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Link
                  href="/shop"
                  className="flex-1 py-5 bg-black text-white border-2 border-black font-black text-sm tracking-widest text-center hover:bg-[#2D3436] hover:-translate-y-1 transition-all rounded-xl uppercase neo-shadow flex items-center justify-center gap-3 group"
                >
                  Continue Shopping <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
                <button
                  onClick={() => setShowInvoice(true)}
                  className="flex-1 py-5 bg-white text-black border-2 border-black font-black text-sm tracking-widest text-center hover:bg-gray-50 hover:-translate-y-1 transition-all rounded-xl uppercase neo-shadow flex items-center justify-center gap-3"
                >
                  <Download className="w-4 h-4" /> Invoice
                </button>
              </div>
            </div>

            {/* RIGHT COLUMN: Receipt / Ticket Stub Look */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="relative"
            >
              <div className="bg-white border-4 border-black font-mono text-sm relative z-10 filter drop-shadow-[8px_8px_0px_rgba(0,0,0,1)]">
                {/* Receipt Header */}
                <div className="bg-black text-white p-6 text-center border-b-4 border-black">
                  <div className="w-12 h-12 bg-white rounded-full mx-auto mb-3 flex items-center justify-center border-2 border-black">
                    <ShoppingBag className="w-6 h-6 text-black" />
                  </div>
                  <h2 className="font-header text-2xl font-black uppercase tracking-widest mb-1">Official Receipt</h2>
                  <p className="text-white/60 text-xs tracking-[0.2em]">{new Date(order.createdAt).toLocaleDateString()} • {new Date(order.createdAt).toLocaleTimeString()}</p>
                </div>

                {/* Jagged Edge Top (Visual CSS trick) */}
                <div className="h-4 bg-black w-full" style={{ clipPath: 'polygon(0% 0%, 5% 100%, 10% 0%, 15% 100%, 20% 0%, 25% 100%, 30% 0%, 35% 100%, 40% 0%, 45% 100%, 50% 0%, 55% 100%, 60% 0%, 65% 100%, 70% 0%, 75% 100%, 80% 0%, 85% 100%, 90% 0%, 95% 100%, 100% 0%)', marginTop: '-1px' }}></div>

                {/* Receipt Body */}
                <div className="p-8 space-y-6">
                  {/* Order ID Barcode-ish */}
                  <div className="text-center mb-6">
                    <p className="text-[10px] uppercase text-gray-500 tracking-widest mb-1">Order Reference</p>
                    <p className="font-black text-lg tracking-widest">{order.id.slice(-8).toUpperCase()}</p>
                    <div className="h-8 mt-2 opacity-50 bg-[url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAACCAYAAAB/qH1jAAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH5gMWEw0s6mFw2AAAAAtJREFUCNdjYMAHAAAUAAHqbPCeAAAAAElFTkSuQmCC')] bg-repeat-x"></div>
                  </div>

                  {/* Items List (Simplified) */}
                  <div className="space-y-4">
                    {order.items.slice(0, 3).map((item, idx) => (
                      <div key={idx} className="flex justify-between items-start pb-4 border-b border-dashed border-gray-300 last:border-0 last:pb-0">
                        <div>
                          <p className="font-bold text-base">{item.product?.name || item.name || 'Unknown Item'}</p>
                          <p className="text-xs text-gray-500">Qty: {item.quantity} x ₹{item.product?.price || item.price}</p>
                        </div>
                        <p className="font-bold">₹{((item.product?.price || item.price || 0) * item.quantity).toFixed(2)}</p>
                      </div>
                    ))}
                    {order.items.length > 3 && (
                      <p className="text-xs text-center text-gray-400 italic pt-2">+ {order.items.length - 3} more items...</p>
                    )}
                  </div>

                  {/* Totals */}
                  <div className="bg-gray-50 p-4 border-2 border-dashed border-black/10 rounded-xl space-y-2">
                    <div className="flex justify-between text-gray-600">
                      <span>Subtotal</span>
                      <span>₹{subtotal.toFixed(2)}</span>
                    </div>
                    {gst > 0 && (
                      <div className="flex justify-between text-gray-600">
                        <span>GST</span>
                        <span>₹{gst.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-black text-xl pt-2 border-t border-black/10 mt-2">
                      <span>TOTAL PAID</span>
                      <span>₹{order.totalPrice.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Address */}
                  <div className="text-xs text-center text-gray-400 pt-4">
                    <p className="uppercase tracking-widest font-bold mb-1">Delivering To</p>
                    <p>{order.shippingAddress.name} • {order.shippingAddress.city}</p>
                  </div>
                </div>

                {/* Jagged Edge Bottom */}
                <div className="h-4 bg-black w-full" style={{ clipPath: 'polygon(0% 100%, 5% 0%, 10% 100%, 15% 0%, 20% 100%, 25% 0%, 30% 100%, 35% 0%, 40% 100%, 45% 0%, 50% 100%, 55% 0%, 60% 100%, 65% 0%, 70% 100%, 75% 0%, 80% 100%, 85% 0%, 90% 100%, 95% 0%, 100% 100%)', marginBottom: '-1px' }}></div>
              </div>
            </motion.div>
          </motion.div>
        </div>

        <InvoiceModal
          order={order}
          isOpen={showInvoice}
          onClose={() => setShowInvoice(false)}
        />
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
