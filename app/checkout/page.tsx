'use client';

import { useCart } from '@/app/context/CartContext';
import { useAuth } from '@/app/context/AuthContext';
import { useGamification } from '@/app/context/GamificationContext';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase';
import { createOrder, updateUserWallet, addPointHistory, clearUserCart } from '@/lib/firebase';

// Extend window type for Razorpay
declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function CheckoutPage() {
  const { items, getTotalPrice, clearCart, appliedPointsDiscount, setAppliedPointsDiscount, getFinalPrice, mergeLocalCartWithFirebase } = useCart();
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

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
  });

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
        const currentUser = auth.currentUser;
        
        if (!currentUser) {
          console.error('User not authenticated');
          setWalletPoints(0);
          setIsFirstTime(true);
          return;
        }

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
  const subtotal = totalPrice - pointsWorthRupees;
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
      // Create order in our system and get Razorpay order ID
      const receiptId = `RCP-${Date.now()}`;
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
              paymentId: response.razorpay_payment_id,
              orderId: response.razorpay_order_id,
              signature: response.razorpay_signature,
            }),
          });

          if (!verifyResponse.ok) {
            throw new Error('Payment verification failed');
          }

          // Get current user
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

          // Update wallet in Firebase
          await updateUserWallet(currentUser.uid, earnedPoints - redeemPoints);

          // Add point history entries in Firebase
          if (redeemPoints > 0) {
            await addPointHistory(
              currentUser.uid,
              -redeemPoints,
              'Points redeemed for purchase',
              orderId_New
            );
          }
          await addPointHistory(
            currentUser.uid,
            earnedPoints,
            isFirstTime ? 'First-time purchase bonus' : 'Purchase points earned',
            orderId_New
          );

          // Clear cart from Firebase
          await clearUserCart(currentUser.uid);

          addToast({
            title: 'Payment Successful!',
            description: `You earned ${earnedPoints} points! Order ID: ${orderId_New}`,
          });

          clearCart();
          
          setTimeout(() => {
            router.push(`/order-confirmation/${orderId_New}`);
          }, 1500);
        },
        prefill: {
          name: formData.name,
          email: formData.email,
          contact: formData.phone,
        },
        theme: {
          color: '#3399cc',
        },
        modal: {
          ondismiss: function() {
            // User closed the payment modal without completing payment
            console.log('Payment modal dismissed');
            addToast({
              title: 'Payment Cancelled',
              description: 'You closed the payment modal. Your cart is still saved.',
            });
          }
        },
      };

      // Open Razorpay checkout
      if (window.Razorpay) {
        const razorpay = new (window as any).Razorpay(RazorpayOptions);
        razorpay.open();
      } else {
        throw new Error('Razorpay not loaded');
      }
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

  if (items.length === 0 && !authLoading) {
    return (
      <div className="min-h-screen pt-28 pb-16 flex items-center justify-center">
        <div className="text-center">
          <h1 className="font-display text-6xl font-bold mb-6">YOUR CART IS EMPTY</h1>
          <p className="text-lg text-muted-foreground font-body mb-10">Discover amazing games in our repository</p>
          <Link href="/shop" className="inline-block px-8 py-3 bg-primary text-primary-foreground font-header font-bold text-sm rounded hover:opacity-90 transition-all">
            BROWSE GAMES
          </Link>
        </div>
      </div>
    );
  }

  // Show loading while checking authentication
  if (authLoading || (user === null && authLoading === false && items.length > 0)) {
    return (
      <div className="min-h-screen pt-28 pb-16 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
          <p className="text-white/60 font-header text-[10px] tracking-[0.4em]">REDIRECTING TO LOGIN...</p>
        </div>
      </div>
    );
  }

  // Don't render checkout form if user is not authenticated (they'll be redirected)
  if (!user?.uid) {
    return null;
  }

  return (
    <div className="min-h-screen pt-28 pb-16 bg-background">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        {/* Header */}
        <div className="mb-16">
          <Link href="/shop" className="font-header text-sm text-muted-foreground hover:text-primary mb-8 inline-block transition-colors">
            ← BACK TO SHOP
          </Link>
          <h1 className="font-display text-5xl font-bold tracking-tight mb-6">CHECKOUT</h1>
          <p className="text-lg text-muted-foreground font-body">Complete your order and earn amazing rewards points</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Checkout Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handlePlaceOrder} className="space-y-8">
              {/* Shipping Information */}
              <div className="glass-card p-8 rounded-lg">
                <h2 className="font-display text-3xl font-bold mb-8">SHIPPING INFORMATION</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <input
                    type="text"
                    name="name"
                    placeholder="Full Name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="col-span-2 md:col-span-1 bg-input-background border border-border rounded px-4 py-3 text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none transition"
                    required
                  />
                  <input
                    type="email"
                    name="email"
                    placeholder="Email Address"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="col-span-2 md:col-span-1 bg-input-background border border-border rounded px-4 py-3 text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none transition"
                    required
                  />
                  <input
                    type="tel"
                    name="phone"
                    placeholder="Phone Number"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="col-span-2 md:col-span-1 bg-input-background border border-border rounded px-4 py-3 text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none transition"
                    required
                  />
                  <input
                    type="text"
                    name="address"
                    placeholder="Address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className="col-span-2 bg-input-background border border-border rounded px-4 py-3 text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none transition"
                    required
                  />
                  <input
                    type="text"
                    name="city"
                    placeholder="City"
                    value={formData.city}
                    onChange={handleInputChange}
                    className="bg-input-background border border-border rounded px-4 py-3 text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none transition"
                  />
                  <input
                    type="text"
                    name="state"
                    placeholder="State"
                    value={formData.state}
                    onChange={handleInputChange}
                    className="bg-input-background border border-border rounded px-4 py-3 text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none transition"
                  />
                  <input
                    type="text"
                    name="zipCode"
                    placeholder="ZIP Code"
                    value={formData.zipCode}
                    onChange={handleInputChange}
                    className="bg-input-background border border-border rounded px-4 py-3 text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none transition"
                  />
                </div>
              </div>

              {/* Wallet Points Redemption */}
              <div className="glass-card p-8 rounded-lg border-amber-500/30 border-2 bg-gradient-to-r from-amber-500/10 to-transparent">
                <h2 className="font-display text-3xl font-bold mb-6 text-amber-500">💰 USE WALLET POINTS</h2>
                
                <div className="bg-amber-500/20 border-2 border-amber-500/40 rounded-lg p-4 mb-6">
                  <p className="text-sm text-amber-500/70 mb-2 font-header tracking-wider">YOUR AVAILABLE POINTS</p>
                  <p className="font-display text-4xl font-bold text-amber-400">{walletPoints.toLocaleString()} PTS</p>
                  <p className="text-sm text-amber-500/80 mt-2">Worth up to ₹{calculatePointWorth(walletPoints).toFixed(2)} in discounts</p>
                </div>

                {walletPoints > 0 ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-header font-semibold mb-3 text-amber-500">How Many Points to Use?</label>
                      <div className="flex gap-2">
                        <input
                          type="number"
                          value={redeemPoints}
                          onChange={handleRedeemPointsChange}
                          max={Math.floor(maxRedeemable / config.redeemRate)}
                          placeholder="Enter points to redeem"
                          className="flex-1 bg-black/50 border-2 border-amber-500/30 rounded px-4 py-3 text-amber-400 placeholder-amber-500/40 focus:border-amber-500 focus:outline-none transition"
                        />
                        <button
                          type="button"
                          onClick={handleUseMaxPoints}
                          className="px-6 py-3 bg-amber-500 text-black font-header font-bold text-sm tracking-wider hover:bg-amber-400 transition-all rounded"
                        >
                          USE ALL
                        </button>
                      </div>
                      <p className="text-xs text-amber-500/70 mt-2">
                        Max you can use: {Math.floor(maxRedeemable / config.redeemRate).toLocaleString()} points (₹{maxRedeemable.toFixed(2)})
                      </p>
                    </div>

                    {redeemPoints > 0 && (
                      <div className="bg-black/50 border border-amber-500/20 rounded-lg p-4">
                        <div className="flex justify-between items-center">
                          <span className="text-amber-500/80">Points Discount:</span>
                          <span className="font-display text-xl font-bold text-amber-400">-₹{pointsWorthRupees.toFixed(2)}</span>
                        </div>
                        <div className="text-xs text-amber-500/60 mt-2">
                          {redeemPoints} points × ₹{config.redeemRate} = ₹{pointsWorthRupees.toFixed(2)} off
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="bg-amber-500/20 border border-amber-500/30 rounded-lg p-4 text-center">
                    <p className="text-amber-500/80 font-header">No points available yet</p>
                    <p className="text-sm text-amber-500/60 mt-2">Complete your first purchase to earn points and use them on future orders!</p>
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isProcessing}
                className="w-full py-4 bg-primary text-primary-foreground font-header font-bold hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all rounded-lg"
              >
                {isProcessing ? 'PROCESSING...' : `PLACE ORDER & EARN ${earnedPoints} POINTS`}
              </button>
            </form>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-32 glass-card p-8 rounded-lg">
              <h2 className="font-header text-2xl mb-8">ORDER SUMMARY</h2>

              {/* Items */}
              <div className="space-y-4 mb-8 pb-8 border-b border-border">
                {items.map((item) => (
                  <div key={item.productId} className="flex justify-between">
                    <div>
                      <p className="font-header text-sm line-clamp-2">
                        {item.product.name}
                      </p>
                      <p className="text-xs text-muted-foreground">x{item.quantity}</p>
                    </div>
                    <p className="text-right font-body">
                      ₹{item.product.price * item.quantity}
                    </p>
                  </div>
                ))}
              </div>

              {/* Pricing */}
              <div className="space-y-3 mb-8 pb-8 border-b border-border">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>₹{totalPrice.toFixed(2)}</span>
                </div>
                {redeemPoints > 0 && (
                  <div className="flex justify-between text-sm text-secondary">
                    <span>Points Discount</span>
                    <span>-₹{pointsWorthRupees.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className="text-secondary">FREE</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">GST ({gstRate}%)</span>
                  <span>₹{gstAmount.toFixed(2)}</span>
                </div>
              </div>

              {/* Points to Earn */}
              <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 mb-8">
                <p className="text-xs text-muted-foreground mb-2">YOU WILL EARN</p>
                <p className="font-display text-2xl font-bold text-primary">
                  +{earnedPoints.toLocaleString()} <span className="text-sm text-muted-foreground">PTS</span>
                </p>
              </div>

              {/* Total */}
              <div className="space-y-4">
                <div className="flex justify-between font-header text-lg">
                  <span>TOTAL</span>
                  <span className="text-primary font-bold text-2xl">₹{finalPrice.toFixed(2)}</span>
                </div>

                {/* Terms */}
                <p className="text-xs text-muted-foreground font-body">
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
