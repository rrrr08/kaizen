'use client';

import { useCart } from '@/app/context/CartContext';
import { useAuth } from '@/app/context/AuthContext';
import { useGamification } from '@/app/context/GamificationContext';
import Link from 'next/link';
import Script from 'next/script'; // Import Script
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { Coins, ArrowLeft, AlertTriangle, Check } from 'lucide-react';
import JoyPhoneInput from '@/components/ui/JoyPhoneInput';

export const dynamic = 'force-dynamic';

// Extend window type for Razorpay
declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function CheckoutPage() {
  const { items, getTotalPrice, clearCart, appliedPointsDiscount, setAppliedPointsDiscount, getFinalPrice, mergeLocalCartWithFirebase, isLoading } = useCart();
  const { user, loading: authLoading } = useAuth();
  const { balance, config, calculatePoints, calculatePointWorth, getMaxRedeemableAmount } = useGamification();
  const router = useRouter();
  const { addToast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [redeemPoints, setRedeemPoints] = useState(0);
  const [isFirstTime, setIsFirstTime] = useState(false);
  const [gstRate, setGstRate] = useState(18); // Default 18%
  const [shippingCost, setShippingCost] = useState(50);
  const [freeShippingThreshold, setFreeShippingThreshold] = useState(500);
  const [checkoutInfoLoaded, setCheckoutInfoLoaded] = useState(false);
  const [isRazorpayLoaded, setIsRazorpayLoaded] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
  });

  const [voucherCode, setVoucherCode] = useState('');
  const [appliedVoucher, setAppliedVoucher] = useState<any>(null);
  const [appliedVoucherId, setAppliedVoucherId] = useState<string | null>(null);
  const [voucherDiscountAmount, setVoucherDiscountAmount] = useState(0);
  const [voucherError, setVoucherError] = useState('');
  const [checkingVoucher, setCheckingVoucher] = useState(false);

  // Load saved checkout info from Firestore
  useEffect(() => {
    const loadSavedCheckoutInfo = async () => {
      if (!user || checkoutInfoLoaded) return;

      try {
        const { getFirestore, doc, getDoc } = await import('firebase/firestore');
        const { app } = await import('@/lib/firebase');
        const db = getFirestore(app);
        const userRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          const userData = userSnap.data();
          const savedInfo = userData?.checkoutInfo;

          if (savedInfo || userData?.phoneNumber) {
            setFormData(prev => ({
              ...prev,
              name: savedInfo?.name || user?.displayName || prev.name,
              email: savedInfo?.email || user?.email || prev.email,
              phone: userData?.phoneNumber || savedInfo?.phone || prev.phone,
              address: savedInfo?.address || prev.address,
              city: savedInfo?.city || prev.city,
              state: savedInfo?.state || prev.state,
              zipCode: savedInfo?.zipCode || prev.zipCode,
            }));
          } else {
            setFormData(prev => ({
              ...prev,
              name: user?.displayName || prev.name,
              email: user?.email || prev.email,
            }));
          }
        }
        setCheckoutInfoLoaded(true);
      } catch (error) {
        console.error('Error loading saved checkout info:', error);
        setCheckoutInfoLoaded(true);
      }
    };

    loadSavedCheckoutInfo();
  }, [user, checkoutInfoLoaded]);

  useEffect(() => {
    if (!authLoading && !user) {
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('checkoutIntent', 'true');
      }
      router.push('/auth/login?redirect=/checkout');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user?.uid && !authLoading) {
      mergeLocalCartWithFirebase().catch(error => {
        console.error('Failed to merge cart:', error);
      });
    }
  }, [user?.uid, authLoading, mergeLocalCartWithFirebase]);

  useEffect(() => {
    const loadFirstTimeStatus = async () => {
      try {
        const { auth, getUserOrders } = await import('@/lib/firebase');
        if (!auth || !auth.currentUser) return;
        const currentUser = auth.currentUser;
        const userOrders = await getUserOrders(currentUser.uid);
        setIsFirstTime(userOrders.length === 0);
      } catch (error) {
        console.error('Error checking first-time status:', error);
      }
    };

    loadFirstTimeStatus();

    const fetchSettings = async () => {
      try {
        const response = await fetch('/api/admin/settings/get');
        if (response.ok) {
          const data = await response.json();
          setGstRate(data.gstRate ?? 18);
          setShippingCost(data.shippingCost ?? 50);
          setFreeShippingThreshold(data.freeShippingThreshold ?? 500);
        }
      } catch (error) {
        console.error('Error fetching GST rate:', error);
      }
    };

    fetchSettings();
  }, [user]);

  const totalPrice = getTotalPrice();
  const walletPoints = balance || 0;
  const maxRedeemable = getMaxRedeemableAmount(totalPrice, walletPoints);
  const pointsWorthRupees = calculatePointWorth(redeemPoints);

  let currentSubtotal = totalPrice - pointsWorthRupees;

  if (appliedVoucher) {
    if (appliedVoucher.discountType === 'percentage') {
      let calcDiscount = (currentSubtotal * appliedVoucher.discountValue) / 100;
      if (appliedVoucher.maxDiscount) {
        calcDiscount = Math.min(calcDiscount, appliedVoucher.maxDiscount);
      }
      if (voucherDiscountAmount !== calcDiscount) setVoucherDiscountAmount(calcDiscount);
    } else {
      if (voucherDiscountAmount !== appliedVoucher.discountValue) setVoucherDiscountAmount(appliedVoucher.discountValue);
    }
  }

  const subtotal = currentSubtotal - voucherDiscountAmount;
  const gstAmount = Math.round(subtotal * (gstRate / 100));

  // Shipping Calculation
  const needsShipping = subtotal < freeShippingThreshold && subtotal > 0;
  const shippingAmount = needsShipping ? shippingCost : 0;

  const finalPrice = subtotal + gstAmount + shippingAmount;
  const earnedPoints = calculatePoints(finalPrice, isFirstTime);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePhoneChange = (value: string) => {
    setFormData((prev) => ({ ...prev, phone: value }));
  };

  const handleRedeemPointsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let points = parseInt(e.target.value) || 0;
    const maxRedeemPoints = Math.floor(maxRedeemable / config.redeemRate);

    if (points > walletPoints) points = walletPoints;
    if (points > maxRedeemPoints) points = maxRedeemPoints;

    setRedeemPoints(points);
    setAppliedPointsDiscount(calculatePointWorth(points));
  };

  const handleApplyVoucher = async () => {
    if (!voucherCode.trim() || !user) return;
    setCheckingVoucher(true);
    setVoucherError('');

    try {
      const token = await user.getIdToken();
      const response = await fetch('/api/rewards/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          code: voucherCode,
          orderTotal: totalPrice - pointsWorthRupees,
          category: 'shop'
        })
      });

      const data = await response.json();
      if (response.ok && data.valid) {
        setAppliedVoucher(data.voucher);
        setAppliedVoucherId(data.voucherId);
        setVoucherDiscountAmount(data.discount.amount);
        addToast({ title: 'Voucher Applied!', description: `You saved ₹${data.discount.amount.toFixed(2)}` });
      } else {
        setVoucherError(data.error || 'Invalid voucher code');
      }
    } catch (error) {
      setVoucherError('Failed to validate voucher');
    } finally {
      setCheckingVoucher(false);
    }
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.uid || !formData.name || !formData.email || !formData.phone || !formData.address) {
      addToast({ title: 'Missing Information', description: 'Please fill in all required fields.' });
      return;
    }

    // Validate email
    try {
      const res = await fetch(`/api/validate-email?email=${encodeURIComponent(formData.email)}`);
      const data = await res.json();
      if (!data.isValid) {
        addToast({ title: 'Invalid Email', description: data.error || 'Please provide a valid email', variant: 'destructive' });
        return;
      }
    } catch (err) {
      console.error("Email validation failed", err);
      // Fail open
    }

    if (!isRazorpayLoaded) {
      addToast({ title: 'System Loading', description: 'Payment system is initializing. Please wait a moment.' });
      return;
    }

    setIsProcessing(true);

    try {
      const response = await fetch('/api/payments/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: finalPrice,
          currency: 'INR',
          receipt: `RCP-${Date.now()}`,
          notes: { name: formData.name, email: formData.email, userId: user?.uid },
          items,
          shippingAddress: formData,
          userId: user?.uid
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || errorData.details || 'Failed to create payment order');
      }
      const { orderId, amount, dbOrderId } = await response.json();

      const RazorpayOptions = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount,
        currency: 'INR',
        name: 'Joy Juncture',
        order_id: orderId,
        handler: async function (response: any) {
          try {
            const verifyResponse = await fetch('/api/payments/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
                amount: finalPrice,
                userId: user?.uid
              }),
            });

            if (!verifyResponse.ok) throw new Error('Payment verification failed');

            // Order creation and stock deduction is now handled server-side in 'verify'
            // We just need to clear local state and redirect.

            await clearCart();

            // Use the internal DB Order ID for the confirmation page
            window.location.replace(`/order-confirmation/${dbOrderId}`);
          } catch (error) {
            console.error('Checkout Error:', error);
            addToast({ title: 'Order Placed', description: 'Payment successful, but there was an issue finalizing. Please contact support.' });
            // Still redirect to home or order history if possible? 
            // If we have dbOrderId, we can still try to go there.
            if (dbOrderId) window.location.replace(`/order-confirmation/${dbOrderId}`);
          }
        },
        prefill: { name: formData.name, email: formData.email, contact: formData.phone },
        theme: { color: '#000000' },
      };

      if (!window.Razorpay) {
        throw new Error('Payment SDK not loaded');
      }

      const rzp = new window.Razorpay(RazorpayOptions);
      rzp.on('payment.failed', function (response: any) {
        addToast({
          title: 'Payment Failed',
          description: response.error.description || 'Payment was declined',
          variant: 'destructive'
        });
      });
      rzp.open();
    } catch (error: any) {
      addToast({ title: 'Payment Failed', description: error.message, variant: 'destructive' });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen pt-28 pb-16 bg-[#FFFDF5] text-[#2D3436]">
      <Script
        id="razorpay-checkout-js"
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="lazyOnload"
        onLoad={() => setIsRazorpayLoaded(true)}
      />

      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="mb-16">
          <Link href="/shop" className="font-black text-xs uppercase tracking-[0.3em] text-[#6C5CE7] hover:text-black mb-8 inline-flex items-center gap-2 transition-colors">
            <ArrowLeft size={16} /> BACK TO SHOP
          </Link>
          <h1 className="font-header text-6xl md:text-7xl font-black tracking-tighter mb-6 text-black">CHECKOUT</h1>
          <p className="text-xl text-black/60 font-medium">Complete your order and earn amazing rewards points</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2">
            <form id="checkout-form" onSubmit={handlePlaceOrder} className="space-y-8">
              <div className="bg-white border-2 border-black rounded-[20px] p-8 neo-shadow">
                <h2 className="font-header text-2xl md:text-3xl font-black mb-6 md:mb-8 text-black">SHIPPING INFORMATION</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  <input type="text" name="name" placeholder="Full Name" value={formData.name} onChange={handleInputChange} className="col-span-1 bg-white border-2 border-black rounded-lg px-4 py-3 md:py-4 text-sm md:text-base font-bold focus:bg-[#FFD93D]/20 outline-none w-full" required />
                  <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleInputChange} className="col-span-1 bg-white border-2 border-black rounded-lg px-4 py-3 md:py-4 text-sm md:text-base font-bold focus:bg-[#FFD93D]/20 outline-none w-full" required />
                  <div className="col-span-1">
                    <JoyPhoneInput
                      value={formData.phone}
                      onChange={handlePhoneChange}
                      required
                      error={formData.phone && formData.phone.length < 13 ? "Invalid Number" : undefined}
                    />
                  </div>
                  <input type="text" name="address" placeholder="Address" value={formData.address} onChange={handleInputChange} className="col-span-1 md:col-span-2 bg-white border-2 border-black rounded-lg px-4 py-3 md:py-4 text-sm md:text-base font-bold focus:bg-[#FFD93D]/20 outline-none w-full" required />
                  <input type="text" name="city" placeholder="City" value={formData.city} onChange={handleInputChange} className="bg-white border-2 border-black rounded-lg px-4 py-3 md:py-4 text-sm md:text-base font-bold focus:bg-[#FFD93D]/20 outline-none w-full" />
                  <input type="text" name="state" placeholder="State" value={formData.state} onChange={handleInputChange} className="bg-white border-2 border-black rounded-lg px-4 py-3 md:py-4 text-sm md:text-base font-bold focus:bg-[#FFD93D]/20 outline-none w-full" />
                  <input type="text" name="zipCode" placeholder="ZIP" value={formData.zipCode} onChange={handleInputChange} className="bg-white border-2 border-black rounded-lg px-4 py-3 md:py-4 text-sm md:text-base font-bold focus:bg-[#FFD93D]/20 outline-none w-full" />
                </div>
              </div>

              <div className="bg-white border-2 border-black p-6 rounded-[20px] neo-shadow">
                <h3 className="font-header text-lg font-black mb-4 uppercase">Points & Vouchers</h3>
                {/* Points Redemption Slider Removed - Points only for Vouchers now */}
                <div className="flex flex-col md:flex-row gap-2 md:gap-4">
                  <input type="text" value={voucherCode} onChange={(e) => setVoucherCode(e.target.value.toUpperCase())} placeholder="Voucher Code" className="w-full md:flex-1 border-2 border-black rounded-lg px-4 py-3 font-bold uppercase text-sm md:text-base" />
                  <button type="button" onClick={handleApplyVoucher} disabled={checkingVoucher} className="bg-black text-white px-6 py-3 rounded-lg font-black neo-shadow uppercase text-xs tracking-widest hover:bg-[#6C5CE7] transition-all">{checkingVoucher ? '...' : 'Apply'}</button>
                </div>
                {voucherError && <p className="text-red-500 text-xs font-bold mt-2">{voucherError}</p>}
              </div>

              <button type="submit" disabled={isProcessing} className="hidden lg:block w-full py-5 bg-[#00B894] text-black font-header text-xl font-black rounded-[15px] border-2 border-black neo-shadow uppercase tracking-wide hover:scale-[1.01] transition-all">
                {isProcessing ? 'PROCESSING...' : `PLACE ORDER${earnedPoints > 0 ? ` & EARN ${earnedPoints} JP` : ''}`}
              </button>
            </form>
          </div>

          <div className="lg:col-span-1">
            <div className="!static lg:!sticky lg:top-32 bg-[#FFD93D] border-2 border-black p-8 rounded-[25px] neo-shadow z-0 mb-8 lg:mb-0">
              <h2 className="font-header text-2xl font-black mb-6 text-black uppercase">Order Summary</h2>
              <div className="space-y-4 mb-6 pb-6 border-b-2 border-black/10">
                {items.map((item) => (
                  <div key={item.productId} className="flex justify-between items-start">
                    <p className="font-bold text-sm text-black line-clamp-2 uppercase">{item.product.name} x{item.quantity}</p>
                    <p className="font-black text-black text-sm">₹{item.product.price * item.quantity}</p>
                  </div>
                ))}
              </div>
              <div className="space-y-3 mb-6 pb-6 border-b-2 border-black/10 font-bold text-sm">
                <div className="flex justify-between"><span>Subtotal</span><span>₹{totalPrice}</span></div>
                {/* JP Discount removed */}
                {voucherDiscountAmount > 0 && <div className="flex justify-between text-[#6C5CE7]"><span>Voucher</span><span>-₹{voucherDiscountAmount}</span></div>}
                <div className="flex justify-between"><span>GST ({gstRate}%)</span><span>₹{gstAmount}</span></div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  {shippingAmount === 0 ? <span className="text-green-600">FREE</span> : <span>₹{shippingAmount}</span>}
                </div>
              </div>
              <div className="flex justify-between items-end font-header mb-8">
                <span className="text-xl font-black uppercase">Total</span>
                <span className="text-3xl font-black">₹{finalPrice}</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white border-2 border-black rounded-xl p-4 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#6C5CE7] text-white flex items-center justify-center font-black border border-black text-xs">JP</div>
                  <div>
                    <p className="text-[10px] text-black/50 font-black uppercase">Earnings</p>
                    <p className="font-header text-lg font-black">+{earnedPoints} JP</p>
                  </div>
                </div>
                <div className="bg-white border-2 border-black rounded-xl p-4 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#00B894] text-white flex items-center justify-center font-black border border-black text-xs">W</div>
                  <div>
                    <p className="text-[10px] text-black/50 font-black uppercase">Wallet</p>
                    <p className="font-header text-lg font-black">{balance} JP</p>
                  </div>
                </div>
              </div>

              {/* Mobile Place Order Button - Now Inside the Card */}
              <div className="lg:hidden mt-8 pt-8 border-t-2 border-black/10">
                <button
                  type="submit"
                  form="checkout-form"
                  disabled={isProcessing}
                  className="w-full py-5 bg-[#00B894] text-black font-header text-xl font-black rounded-[15px] border-2 border-black neo-shadow uppercase tracking-wide hover:scale-[1.01] transition-all"
                >
                  {isProcessing ? 'PROCESSING...' : `PLACE ORDER${earnedPoints > 0 ? ` & EARN ${earnedPoints} JP` : ''}`}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}