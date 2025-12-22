'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { CheckCircle } from 'lucide-react';
import { auth } from '@/lib/firebase';
import { getOrderById } from '@/lib/firebase';

interface Order {
  id: string;
  items: any[];
  totalPrice: number;
  totalPoints: number;
  shippingAddress: any;
  createdAt: string;
}

export default function OrderConfirmationPage() {
  const params = useParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadOrder = async () => {
      try {
        const orderId = params.id as string;
        
        // Load from Firebase only
        const firebaseOrder = await getOrderById(orderId);
        if (firebaseOrder) {
          setOrder(firebaseOrder as any);
        } else {
          console.error('Order not found in Firebase');
          setOrder(null);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error loading order:', error);
        setLoading(false);
      }
    };

    loadOrder();
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen pt-28 pb-16 flex items-center justify-center">
        <p className="text-white/60 font-serif italic">Loading...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen pt-28 pb-16 flex items-center justify-center">
        <div className="text-center">
          <h1 className="font-display text-6xl font-bold mb-6">ORDER NOT FOUND</h1>
          <Link href="/shop" className="text-amber-500 font-header-bold text-sm tracking-widest">
            RETURN TO SHOP
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-28 pb-16 bg-black">
      <div className="max-w-3xl mx-auto px-6 md:px-12">
        {/* Success Message */}
        <div className="text-center mb-16">
          <div className="flex justify-center mb-10">
            <CheckCircle className="w-24 h-24 text-green-500 drop-shadow-lg" />
          </div>
          <h1 className="font-display text-6xl font-bold mb-6 tracking-tight">
            ORDER CONFIRMED
          </h1>
          <p className="text-xl text-white/60 font-body">
            Thank you for your purchase! Your order has been placed successfully.
          </p>
        </div>

        {/* Order Details */}
        <div className="border border-white/10 rounded-lg p-8 bg-white/5 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <p className="text-xs font-header font-bold tracking-[0.15em] text-white/50 mb-3 uppercase">ORDER ID</p>
              <p className="font-serif text-xl font-semibold">{order.id}</p>
            </div>
            <div>
              <p className="text-xs font-header font-bold tracking-[0.15em] text-white/50 mb-3 uppercase">ORDER DATE</p>
              <p className="font-serif text-xl font-semibold">
                {new Date(order.createdAt).toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-xs font-header font-bold tracking-[0.15em] text-white/50 mb-3 uppercase">TOTAL AMOUNT</p>
              <p className="font-serif text-xl font-semibold text-amber-500">₹{order.totalPrice}</p>
            </div>
          </div>

          {/* Points Earned */}
          <div className="border-t border-white/10 pt-8">
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-6">
              <p className="text-xs font-header font-bold tracking-[0.15em] text-white/50 mb-3 uppercase">Points Earned</p>
              <p className="font-header text-5xl font-bold tracking-wider text-amber-500">+{order.totalPoints}</p>
              <p className="text-base text-white/60 mt-4 font-serif">
                These points have been added to your wallet and can be redeemed for future purchases or exclusive rewards!
              </p>
            </div>
          </div>
        </div>

        {/* Order Items */}
        <div className="border border-white/10 rounded-lg p-8 bg-white/5 mb-8">
          <h2 className="font-header text-2xl mb-6 tracking-wider">ITEMS ORDERED</h2>
          <div className="space-y-4">
            {order.items.map((item: any, idx: number) => (
              <div key={idx} className="flex justify-between items-center pb-4 border-b border-white/10 last:border-0">
                <div>
                  <p className="font-header tracking-wider">{item.product.name}</p>
                  <p className="text-sm text-white/60">Quantity: {item.quantity}</p>
                </div>
                <p className="font-serif italic text-amber-500">₹{item.product.price * item.quantity}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Shipping Address */}
        <div className="border border-white/10 rounded-lg p-8 bg-white/5 mb-8">
          <h2 className="font-header text-2xl mb-6 tracking-wider">SHIPPING ADDRESS</h2>
          <div className="text-white/80 font-serif italic space-y-1">
            <p>{order.shippingAddress.name}</p>
            <p>{order.shippingAddress.address}</p>
            <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}</p>
            <p className="mt-4 text-white/60">Phone: {order.shippingAddress.phone}</p>
            <p className="text-white/60">Email: {order.shippingAddress.email}</p>
          </div>
        </div>

        {/* Next Steps */}
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-8 mb-12">
          <h2 className="font-header text-2xl mb-6 tracking-wider">WHAT'S NEXT?</h2>
          <ul className="space-y-3 text-white/80 font-serif italic">
            <li>✓ Confirmation email sent to {order.shippingAddress.email}</li>
            <li>✓ Your order will be dispatched within 2-3 business days</li>
            <li>✓ Track your shipment using the order ID</li>
            <li>✓ Your {order.totalPoints} points are now in your wallet</li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            href="/wallet"
            className="flex-1 py-4 bg-amber-500 text-black font-header text-[10px] tracking-[0.4em] text-center hover:bg-amber-400 transition-all rounded-lg uppercase"
          >
            VIEW WALLET & POINTS
          </Link>
          <Link
            href="/shop"
            className="flex-1 py-4 border border-white/20 text-white font-header text-[10px] tracking-[0.4em] text-center hover:border-amber-500/40 transition-all rounded-lg uppercase"
          >
            CONTINUE SHOPPING
          </Link>
        </div>
      </div>
    </div>
  );
}
