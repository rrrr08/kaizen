'use client';

import { useCart } from '@/app/context/CartContext';
import { useAuth } from '@/app/context/AuthContext';
import { useGamification } from '@/app/context/GamificationContext';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { Coins, ArrowLeft, AlertTriangle, Check } from 'lucide-react';

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
  const { config, calculatePoints, calculatePointWorth, getMaxRedeemableAmount } = useGamification();
  const router = useRouter();
  const { addToast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoadingPayment, setIsLoadingPayment] = useState(false);
  const [walletPoints, setWalletPoints] = useState(0);
  const [redeemPoints, setRedeemPoints] = useState(0);
  const [isFirstTime, setIsFirstTime] = useState(false);
  const [gstRate, setGstRate] = useState(18); // Default 18%
  const [checkoutInfoLoaded, setCheckoutInfoLoaded] = useState(false);

  // Debug: Log cart items structure
  useEffect(() => {
    if (items.length > 0) {
      console.log('Cart items structure:', JSON.stringify(items[0], null, 2));
    }
  }, [items]);

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

          if (savedInfo) {
            setFormData(prev => ({
              name: savedInfo.name || user?.displayName || prev.name,
              email: savedInfo.email || user?.email || prev.email,
              phone: savedInfo.phone || prev.phone,
              address: savedInfo.address || prev.address,
              city: savedInfo.city || prev.city,
              state: savedInfo.state || prev.state,
              zipCode: savedInfo.zipCode || prev.zipCode,
            }));
          } else {
            // Use auth defaults if no saved info
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

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
  });

  // Voucher state
  const [voucherCode, setVoucherCode] = useState('');
  const [appliedVoucher, setAppliedVoucher] = useState<any>(null);
  const [appliedVoucherId, setAppliedVoucherId] = useState<string | null>(null);
  const [voucherDiscount, setVoucherDiscount] = useState(0);
  const [voucherError, setVoucherError] = useState('');
  const [checkingVoucher, setCheckingVoucher] = useState(false);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      // Store the intent to checkout after login
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('checkoutIntent', 'true');
      }
      router.push('/auth/login?redirect=/checkout');
    }
  }, [user, authLoading, router]);

  // Merge local cart when user signs in
  useEffect(() => {
    if (user?.uid && !authLoading) {
      mergeLocalCartWithFirebase().catch(error => {
        console.error('Failed to merge cart:', error);
      });
    }
  }, [user?.uid, authLoading, mergeLocalCartWithFirebase]);

  // Load wallet points and settings on mount
  useEffect(() => {
    const loadWalletData = async () => {
      try {
        // Lazy load Firebase
        const { auth } = await import('@/lib/firebase');

        if (!auth || !auth.currentUser) {
          console.error('User not authenticated');
          setWalletPoints(0);
          setIsFirstTime(true);
          return;
        }
        const currentUser = auth.currentUser;

        const { getUserWallet } = await import('@/lib/firebase');
        const firebaseWallet = await getUserWallet(currentUser.uid);
        setWalletPoints(firebaseWallet.points || 0);
      } catch (error) {
        console.error('Error loading wallet from Firebase:', error);
        setWalletPoints(0);
        setIsFirstTime(true);
      }
    };

    loadWalletData();

    // Fetch GST rate from settings
    const fetchSettings = async () => {
      try {
        const response = await fetch('/api/admin/settings/get');
        if (response.ok) {
          const data = await response.json();
          setGstRate(data.gstRate || 18);
        }
      } catch (error) {
        console.error('Error fetching GST rate:', error);
      }
    };

    fetchSettings();
  }, []);

  const totalPrice = getTotalPrice();
  const maxRedeemable = getMaxRedeemableAmount(totalPrice, walletPoints);
  const pointsWorthRupees = calculatePointWorth(redeemPoints);

  // Calculate with voucher
  let subtotalAfterPoints = totalPrice - pointsWorthRupees;
  let voucherDiscountAmount = 0;

  if (appliedVoucher) {
    if (appliedVoucher.discountType === 'percentage') {
      voucherDiscountAmount = (subtotalAfterPoints * appliedVoucher.discountValue) / 100;
      if (appliedVoucher.maxDiscount) {
        voucherDiscountAmount = Math.min(voucherDiscountAmount, appliedVoucher.maxDiscount);
      }
    } else {
      voucherDiscountAmount = appliedVoucher.discountValue;
    }
  }

  const subtotal = subtotalAfterPoints - voucherDiscountAmount;
  const gstAmount = Math.round(subtotal * (gstRate / 100));
  const finalPrice = subtotal + gstAmount;

  // Calculate points earned
  let earnedPoints = calculatePoints(finalPrice, isFirstTime);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRedeemPointsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let points = parseInt(e.target.value) || 0;
    const maxRedeemPoints = Math.floor(maxRedeemable / config.redeemRate);

    if (points > walletPoints) {
      points = walletPoints;
    }
    if (points > maxRedeemPoints) {
      points = maxRedeemPoints;
    }

    setRedeemPoints(points);
    setAppliedPointsDiscount(calculatePointWorth(points));
  };

  const handleUseMaxPoints = () => {
    const maxRedeemPoints = Math.floor(maxRedeemable / config.redeemRate);
    const pointsToUse = Math.min(walletPoints, maxRedeemPoints);
    setRedeemPoints(pointsToUse);
    setAppliedPointsDiscount(calculatePointWorth(pointsToUse));
  };

  const handleApplyVoucher = async () => {
    if (!voucherCode.trim()) {
      setVoucherError('Please enter a voucher code');
      return;
    }

    if (!user) {
      setVoucherError('Please log in to apply vouchers');
      return;
    }

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
          category: 'shop' // Checkout page is for shop purchases
        })
      });

      const data = await response.json();

      if (response.ok && data.valid) {
        setAppliedVoucher(data.voucher);
        setAppliedVoucherId(data.voucherId);
        setVoucherDiscount(data.discount.amount); // Use discount.amount from API
        setVoucherError('');
        addToast({
          title: 'Voucher Applied!',
          description: `You saved ₹${data.discount.amount.toFixed(2)}`,
        });
      } else {
        setVoucherError(data.error || 'Invalid voucher code');
        setAppliedVoucher(null);
        setAppliedVoucherId(null);
        setVoucherDiscount(0);
      }
    } catch (error) {
      setVoucherError('Failed to validate voucher');
      setAppliedVoucher(null);
      setAppliedVoucherId(null);
      setVoucherDiscount(0);
    } finally {
      setCheckingVoucher(false);
    }
  };

  const handleRemoveVoucher = () => {
    setAppliedVoucher(null);
    setAppliedVoucherId(null);
    setVoucherDiscount(0);
    setVoucherCode('');
    setVoucherError('');
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    // Double-check authentication
    if (!user?.uid) {
      addToast({
        title: 'Authentication Required',
        description: 'Please sign in to complete your purchase.',
      });
      router.push('/auth/login?redirect=/checkout');
      return;
    }

    if (!formData.name || !formData.email || !formData.phone || !formData.address) {
      addToast({
        title: 'Missing Information',
        description: 'Please fill in all required fields.',
      });
      return;
    }

    setIsProcessing(true);

    try {
      // Validate amount is reasonable (max 1 crore rupees = 10,000,000)
      const MAX_RAZORPAY_AMOUNT = 10000000;

      if (finalPrice > MAX_RAZORPAY_AMOUNT) {
        addToast({
          title: 'Order Amount Too Large',
          description: `Order amount (₹${finalPrice.toFixed(2)}) exceeds maximum allowed. Please review your cart.`,
          variant: 'destructive',
        });
        setIsProcessing(false);
        return;
      }

      if (finalPrice <= 0) {
        addToast({
          title: 'Invalid Order Amount',
          description: 'Order amount must be greater than 0.',
          variant: 'destructive',
        });
        setIsProcessing(false);
        return;
      }

      // Create order in our system and get Razorpay order ID
      const receiptId = `RCP-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
      const response = await fetch('/api/payments/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: finalPrice,
          currency: 'INR',
          receipt: receiptId,
          notes: {
            customerName: formData.name,
            customerEmail: formData.email,
            customerPhone: formData.phone,
          },
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create payment order');
      }

      const { orderId, amount } = await response.json();

      // Initialize Razorpay
      const RazorpayOptions = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: amount,
        currency: 'INR',
        name: 'Joy Juncture',
        description: `Order for ${formData.name}`,
        order_id: orderId,
        handler: async function (response: {
          razorpay_payment_id: string;
          razorpay_order_id: string;
          razorpay_signature: string;
        }) {
          // Verify payment on backend
          const verifyResponse = await fetch('/api/payments/verify', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
            }),
          });

          const verifyData = await verifyResponse.json();
          console.log('Verify response:', { status: verifyResponse.status, data: verifyData });

          if (!verifyResponse.ok) {
            console.error('Payment verification failed:', verifyData);
            throw new Error(verifyData.error || 'Payment verification failed');
          }

          // Get current user
          // Lazy load Firebase
          const { auth, createOrder, updateUserWallet, addPointHistory, clearUserCart } = await import('@/lib/firebase');
          const currentUser = auth.currentUser;
          if (!currentUser) {
            throw new Error('User not authenticated');
          }

          // Create order object
          const orderData = {
            items,
            totalPrice: finalPrice,
            subtotal: subtotal,
            gst: gstAmount,
            gstRate: gstRate,
            totalPoints: earnedPoints,
            pointsRedeemed: redeemPoints,
            discount: pointsWorthRupees,
            originalPrice: totalPrice,
            shippingAddress: formData,
            paymentId: response.razorpay_payment_id,
            razorpayOrderId: orderId,
          };

          // Save to Firebase
          const orderId_New = await createOrder(currentUser.uid, orderData);

          // Save checkout info for future auto-fill
          try {
            const { getFirestore, doc, updateDoc, setDoc } = await import('firebase/firestore');
            const { app } = await import('@/lib/firebase');
            const db = getFirestore(app);
            const userRef = doc(db, 'users', currentUser.uid);
            await updateDoc(userRef, {
              checkoutInfo: {
                name: formData.name,
                email: formData.email,
                phone: formData.phone,
                address: formData.address,
                city: formData.city,
                state: formData.state,
                zipCode: formData.zipCode,
                updatedAt: new Date().toISOString(),
              }
            });
          } catch (saveError) {
            console.error('Failed to save checkout info:', saveError);
          }

          // Send confirmation email via backend
          try {
            await fetch('/api/orders/send-confirmation', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                orderId: orderId_New,
                email: formData.email,
                name: formData.name,
                items: items,
                totalPrice: finalPrice,
                shippingAddress: formData,
              }),
            });
          } catch (emailError) {
            console.error('Failed to send confirmation email:', emailError);
          }

          // Update wallet in Firebase
          await updateUserWallet(currentUser.uid, earnedPoints - redeemPoints);

          // Add point history entries in Firebase
          // Add point history entries in Firebase
          // 1. Log Redemptions
          if (redeemPoints > 0) {
            // Still add to legacy array for safety/back compat
            await addPointHistory(
              currentUser.uid,
              -redeemPoints,
              'Points redeemed for purchase',
              orderId_New
            );

            // Log to New Transaction System
            // We use dynamic import for logTransaction to avoid circular deps if any
            const { logTransaction } = await import('@/lib/gamification');
            await logTransaction(
              currentUser.uid,
              'SPEND',
              redeemPoints,
              'SHOP_REDEMPTION',
              'Points Redeemed on Order',
              { orderId: orderId_New }
            );
          }

          // 2. Log Earnings
          await addPointHistory(
            currentUser.uid,
            earnedPoints,
            isFirstTime ? 'First-time purchase bonus' : 'Purchase points earned',
            orderId_New
          );

          const { logTransaction } = await import('@/lib/gamification');
          await logTransaction(
            currentUser.uid,
            'EARN',
            earnedPoints,
            'SHOP_PURCHASE',
            'Shop Purchase Reward',
            { orderId: orderId_New, isFirstTime }
          );

          // Mark voucher as used if one was applied
          if (appliedVoucherId) {
            try {
              const token = await currentUser.getIdToken();
              await fetch('/api/rewards/use', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                  voucherId: appliedVoucherId,
                  orderId: orderId_New
                })
              });
            } catch (voucherError) {
              console.error('Error marking voucher as used:', voucherError);
              // Don't fail the order if voucher marking fails
            }
          }

          // Clear cart - use context method for consistency
          try {
            console.log('Starting cart clear process...');

            // Use the CartContext clearCart method which handles everything
            await clearCart();
            console.log('Cart cleared successfully');

            // Clear voucher state
            setVoucherCode('');
            setAppliedVoucher(null);
            setAppliedVoucherId(null);
            setVoucherDiscount(0);
            setVoucherError('');

          } catch (clearError) {
            console.error('Error clearing cart:', clearError);
            // Continue anyway - cart will be cleared on next load
          }

          addToast({
            title: 'Payment Successful!',
            description: `You earned ${earnedPoints} points! Order ID: ${orderId_New}`,
          });

          // Use location.replace to force full page reload and clear cache
          setTimeout(() => {
            console.log('Redirecting to order confirmation...');
            window.location.replace(`/order-confirmation/${orderId_New}`);
          }, 300);
        },
        prefill: {
          name: formData.name,
          email: formData.email,
          contact: formData.phone,
        },
        theme: {
          color: '#000000',
        },
        modal: {
          ondismiss: function () {
            // User closed the payment modal without completing payment
            console.log('Payment modal dismissed');
            addToast({
              title: 'Payment Cancelled',
              description: 'You closed the payment modal. Your cart is still saved.',
            });
          }
        },
      };

      // Wait for Razorpay script to load
      let attempts = 0;
      const waitForRazorpay = () => {
        if (window.Razorpay) {
          const razorpay = new (window as any).Razorpay(RazorpayOptions);
          razorpay.open();
        } else if (attempts < 10) {
          attempts++;
          setTimeout(waitForRazorpay, 300);
        } else {
          throw new Error('Razorpay script failed to load. Please refresh the page and try again.');
        }
      };

      waitForRazorpay();
    } catch (error) {
      console.error('Payment error:', error);
      let errorMessage = 'Something went wrong. Please try again.';
      let errorDetails = '';

      if (error instanceof Error) {
        errorMessage = error.message;

        // Handle specific Razorpay errors
        if (error.message.includes('international_transaction_not_allowed') ||
          error.message.includes('BAD_REQUEST_ERROR')) {
          errorMessage = 'International card not supported';
          errorDetails = 'Please use a domestic Indian card, UPI, or other Indian payment methods.';
        } else if (error.message.includes('invalid_card') || error.message.includes('card')) {
          errorMessage = 'Card declined';
          errorDetails = 'Your card was declined. Please try another payment method.';
        } else if (error.message.includes('network')) {
          errorMessage = 'Network error';
          errorDetails = 'Please check your internet connection and try again.';
        }
      }

      addToast({
        title: 'Payment Failed',
        description: errorDetails || errorMessage,
      });

      // Redirect to payment error page
      setTimeout(() => {
        const fullError = errorDetails ? `${errorMessage}: ${errorDetails}` : errorMessage;
        router.push(`/payment-error?error=${encodeURIComponent(fullError)}&amount=${finalPrice}`);
      }, 2000);
    } finally {
      setIsProcessing(false);
    }
  };

  if (items.length === 0 && !authLoading && !isLoading) {
    return (
      <div className="min-h-screen pt-28 pb-16 flex items-center justify-center bg-[#FFFDF5]">
        <div className="text-center">
          <h1 className="font-header text-6xl font-black mb-6 text-black">YOUR CART IS EMPTY</h1>
          <p className="text-lg text-black/60 font-bold mb-10">Discover amazing games in our repository</p>
          <Link href="/shop" className="inline-block px-8 py-4 bg-[#FFD93D] text-black font-black text-sm rounded-[15px] border-2 border-black neo-shadow hover:scale-105 transition-all">
            BROWSE GAMES
          </Link>
        </div>
      </div>
    );
  }

  // Show loading while checking authentication or loading cart
  if (authLoading || isLoading || (user === null && authLoading === false && items.length > 0)) {
    return (
      <div className="min-h-screen pt-28 pb-16 flex items-center justify-center bg-[#FFFDF5]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-black border-t-[#FFD93D] mb-4"></div>
          <p className="text-black font-black text-xs tracking-[0.4em]">REDIRECTING TO LOGIN...</p>
        </div>
      </div>
    );
  }

  // Don't render checkout form if user is not authenticated (they'll be redirected)
  if (!user?.uid) {
    return null;
  }

  return (
    <div className="min-h-screen pt-28 pb-16 bg-[#FFFDF5] text-[#2D3436]">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        {/* Header */}
        <div className="mb-16">
          <Link href="/shop" className="font-black text-xs uppercase tracking-[0.3em] text-[#6C5CE7] hover:text-black mb-8 inline-flex items-center gap-2 transition-colors">
            <ArrowLeft size={16} /> BACK TO SHOP
          </Link>
          <h1 className="font-header text-6xl md:text-7xl font-black tracking-tighter mb-6 text-black">CHECKOUT</h1>
          <p className="text-xl text-black/60 font-medium">Complete your order and earn amazing rewards points</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Checkout Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handlePlaceOrder} className="space-y-8">
              {/* Shipping Information */}
              <div className="bg-white border-2 border-black rounded-[20px] p-8 neo-shadow">
                <h2 className="font-header text-3xl font-black mb-8 text-black">SHIPPING INFORMATION</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <input
                    type="text"
                    name="name"
                    placeholder="Full Name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="col-span-2 md:col-span-1 bg-white border-2 border-black rounded-lg px-4 py-3 text-black placeholder-black/40 focus:bg-[#FFD93D]/20 focus:outline-none transition font-bold"
                    required
                  />
                  <input
                    type="email"
                    name="email"
                    placeholder="Email Address"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="col-span-2 md:col-span-1 bg-white border-2 border-black rounded-lg px-4 py-3 text-black placeholder-black/40 focus:bg-[#FFD93D]/20 focus:outline-none transition font-bold"
                    required
                  />
                  <input
                    type="tel"
                    name="phone"
                    placeholder="Phone Number"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="col-span-2 md:col-span-1 bg-white border-2 border-black rounded-lg px-4 py-3 text-black placeholder-black/40 focus:bg-[#FFD93D]/20 focus:outline-none transition font-bold"
                    required
                  />
                  <input
                    type="text"
                    name="address"
                    placeholder="Address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className="col-span-2 bg-white border-2 border-black rounded-lg px-4 py-3 text-black placeholder-black/40 focus:bg-[#FFD93D]/20 focus:outline-none transition font-bold"
                    required
                  />
                  <input
                    type="text"
                    name="city"
                    placeholder="City"
                    value={formData.city}
                    onChange={handleInputChange}
                    className="bg-white border-2 border-black rounded-lg px-4 py-3 text-black placeholder-black/40 focus:bg-[#FFD93D]/20 focus:outline-none transition font-bold"
                  />
                  <input
                    type="text"
                    name="state"
                    placeholder="State"
                    value={formData.state}
                    onChange={handleInputChange}
                    className="bg-white border-2 border-black rounded-lg px-4 py-3 text-black placeholder-black/40 focus:bg-[#FFD93D]/20 focus:outline-none transition font-bold"
                  />
                  <input
                    type="text"
                    name="zipCode"
                    placeholder="ZIP Code"
                    value={formData.zipCode}
                    onChange={handleInputChange}
                    className="bg-white border-2 border-black rounded-lg px-4 py-3 text-black placeholder-black/40 focus:bg-[#FFD93D]/20 focus:outline-none transition font-bold"
                  />
                </div>
              </div>

              {/* Voucher Code Section */}
              <div className="bg-white border-2 border-black p-6 rounded-[20px] neo-shadow">
                <h3 className="font-header text-lg font-black mb-4 text-black">HAVE A VOUCHER?</h3>

                {!appliedVoucher ? (
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={voucherCode}
                        onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
                        placeholder="Enter voucher code"
                        className="flex-1 bg-white border-2 border-black rounded-lg px-4 py-3 text-black placeholder-black/40 focus:bg-[#FFD93D]/20 focus:outline-none transition font-bold uppercase"
                      />
                      <button
                        type="button"
                        onClick={handleApplyVoucher}
                        disabled={checkingVoucher || !voucherCode.trim()}
                        className="px-6 py-3 bg-[#6C5CE7] text-white font-black text-sm rounded-lg border-2 border-black neo-shadow hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed transition-all uppercase"
                      >
                        {checkingVoucher ? 'CHECKING...' : 'APPLY'}
                      </button>
                    </div>
                    {voucherError && (
                      <p className="text-red-600 text-sm font-bold flex items-center gap-2"><AlertTriangle size={16} /> {voucherError}</p>
                    )}
                  </div>
                ) : (
                  <div className="bg-[#00B894]/10 border-2 border-[#00B894] rounded-lg p-4 flex items-center justify-between">
                    <div>
                      <p className="font-black text-black text-sm flex items-center gap-2"><Check size={16} /> {appliedVoucher.name}</p>
                      <p className="text-xs text-black/60 font-bold">Code: {voucherCode}</p>
                      <p className="text-xs text-[#00B894] font-bold mt-1">
                        Saved ₹{voucherDiscountAmount.toFixed(2)}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveVoucher}
                      className="px-3 py-1 bg-red-500 text-white text-xs font-black rounded border-2 border-black hover:bg-red-600 transition-all"
                    >
                      REMOVE
                    </button>
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isProcessing}
                className="w-full py-5 bg-[#00B894] text-black font-header text-xl font-black hover:bg-[#00a884] hover:scale-[1.01] disabled:opacity-50 disabled:cursor-not-allowed transition-all rounded-[15px] border-2 border-black neo-shadow uppercase tracking-wide"
              >
                {isProcessing ? 'PROCESSING...' : `PLACE ORDER & EARN ${earnedPoints} POINTS`}
              </button>
            </form>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-32 bg-[#FFD93D] border-2 border-black p-8 rounded-[25px] neo-shadow">
              <h2 className="font-header text-2xl font-black mb-6 text-black">ORDER SUMMARY</h2>

              {/* Items */}
              <div className="space-y-4 mb-6 pb-6 border-b-2 border-black/10">
                {items.map((item) => (
                  <div key={item.productId} className="flex justify-between items-start">
                    <div>
                      <p className="font-header text-sm font-bold text-black line-clamp-2">
                        {item.product.name}
                      </p>
                      <p className="text-xs text-black/60 font-bold">x{item.quantity}</p>
                    </div>
                    <p className="text-right font-black text-black">
                      ₹{(item.product.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>

              {/* Pricing */}
              <div className="space-y-3 mb-6 pb-6 border-b-2 border-black/10">
                <div className="flex justify-between text-sm font-bold">
                  <span className="text-black/70">Subtotal</span>
                  <span className="text-black">₹{totalPrice.toFixed(2)}</span>
                </div>
                {redeemPoints > 0 && (
                  <div className="flex justify-between text-sm font-bold text-[#00B894]">
                    <span>Points Discount</span>
                    <span>-₹{pointsWorthRupees.toFixed(2)}</span>
                  </div>
                )}
                {appliedVoucher && voucherDiscountAmount > 0 && (
                  <div className="flex justify-between text-sm font-bold text-[#6C5CE7]">
                    <span>Voucher Discount</span>
                    <span>-₹{voucherDiscountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm font-bold">
                  <span className="text-black/70">Shipping</span>
                  <span className="text-black bg-white border border-black px-1 rounded text-[10px] uppercase">FREE</span>
                </div>
                <div className="flex justify-between text-sm font-bold">
                  <span className="text-black/70">GST ({gstRate}%)</span>
                  <span className="text-black">₹{gstAmount.toFixed(2)}</span>
                </div>
              </div>

              {/* Points to Earn */}
              <div className="bg-white border-2 border-black rounded-xl p-4 mb-8 flex items-center gap-3 shadow-[2px_2px_0px_rgba(0,0,0,0.1)]">
                <div className="w-8 h-8 rounded-full bg-[#6C5CE7] text-white flex items-center justify-center font-black border border-black">P</div>
                <div>
                  <p className="text-[10px] text-black/50 font-black uppercase">YOU WILL EARN</p>
                  <p className="font-header text-xl font-black text-black leading-none">
                    +{earnedPoints.toLocaleString()} <span className="text-xs text-black/60">PTS</span>
                  </p>
                </div>
              </div>

              {/* Total */}
              <div className="space-y-4">
                <div className="flex justify-between items-end font-header">
                  <span className="text-xl font-black text-black">TOTAL</span>
                  <span className="text-black font-black text-3xl">₹{finalPrice.toFixed(2)}</span>
                </div>

                {/* Terms */}
                <p className="text-[10px] text-black/50 font-bold text-center leading-tight">
                  By placing this order, you agree to our terms and conditions. Points will be credited upon order confirmation.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
