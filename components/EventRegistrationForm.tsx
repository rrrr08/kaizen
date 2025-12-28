'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User } from 'firebase/auth';
import { createPaymentOrder, completeRegistration } from '@/lib/db/payments';
import { useGamification } from '@/app/context/GamificationContext';

interface EventRegistrationFormProps {
  event: any;
  user: User | null;
  onSuccess: () => void;
  onClose: () => void;
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function EventRegistrationForm({
  event,
  user,
  onSuccess,
  onClose,
}: EventRegistrationFormProps) {
  const router = useRouter();
  const { hasEarlyEventAccess, workshopDiscountPercent, hasVIPSeating } = useGamification();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [wantsVIPSeating, setWantsVIPSeating] = useState(false);

  // Voucher state
  const [voucherCode, setVoucherCode] = useState('');
  const [appliedVoucher, setAppliedVoucher] = useState<any>(null);
  const [appliedVoucherId, setAppliedVoucherId] = useState<string | null>(null);
  const [voucherDiscount, setVoucherDiscount] = useState(0);
  const [voucherError, setVoucherError] = useState('');
  const [checkingVoucher, setCheckingVoucher] = useState(false);

  const [formData, setFormData] = useState({
    name: user?.displayName || '',
    email: user?.email || '',
    phone: '',
  });

  // Calculate price with tier discount
  const basePrice = event.price || 0;
  const tierDiscount = workshopDiscountPercent > 0 ? (basePrice * workshopDiscountPercent / 100) : 0;
  const priceAfterTierDiscount = basePrice - tierDiscount;
  const finalAmount = Math.max(0, priceAfterTierDiscount - voucherDiscount);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError('Please enter your name');
      setShowErrorModal(true);
      return false;
    }
    if (!formData.email.trim()) {
      setError('Please enter your email');
      setShowErrorModal(true);
      return false;
    }
    if (!formData.phone.trim()) {
      setError('Please enter your phone number');
      setShowErrorModal(true);
      return false;
    }
    if (!/^\d{10}$/.test(formData.phone.replace(/\D/g, ''))) {
      setError('Please enter a valid phone number');
      setShowErrorModal(true);
      return false;
    }
    return true;
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
          orderTotal: priceAfterTierDiscount,
          category: 'events' // Event registration category
        })
      });

      const data = await response.json();

      if (response.ok && data.valid) {
        setAppliedVoucher(data.voucher);
        setAppliedVoucherId(data.voucherId);
        setVoucherDiscount(data.discount.amount);
        setVoucherError('');
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

  const handlePayment = async () => {
    if (!user) {
      alert('Please sign in to register');
      return;
    }

    if (!validateForm()) {
      return;
    }

    try {
      setIsProcessing(true);
      setError(null);

      // First, create a Razorpay order
      const orderResponse = await fetch('/api/payments/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: finalAmount,
          currency: 'INR',
          receipt: `EVT-${event.id}-${Date.now()}`,
          notes: {
            eventId: event.id,
            eventName: event.title,
            userName: formData.name,
            userEmail: formData.email,
          },
        }),
      });

      if (!orderResponse.ok) {
        throw new Error('Failed to create payment order');
      }

      const orderData = await orderResponse.json();
      const razorpayOrderId = orderData.orderId;

      // Create payment order record in our DB
      const dbOrderResult = await createPaymentOrder(
        event.id,
        user.uid,
        finalAmount * 100, // Convert to paise
        0 // No wallet points used
      );

      // Load Razorpay script
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;

      script.onload = () => {
        const options = {
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
          amount: finalAmount * 100, // in paise
          currency: 'INR',
          name: 'Joy Juncture',
          description: `Registration for ${event.title}`,
          order_id: razorpayOrderId, // Use Razorpay order ID
          prefill: {
            name: formData.name,
            email: formData.email,
            contact: formData.phone,
          },
          handler: async (response: any) => {
            try {
              // Verify payment and complete registration
              const paymentResponse = await fetch('/api/payments/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_signature: response.razorpay_signature,
                  orderId: dbOrderResult.orderId,
                  eventId: event.id,
                  userId: user.uid,
                  amount: finalAmount,
                  walletPointsUsed: 0,
                }),
              });

              const paymentData = await paymentResponse.json();

              if (paymentData.success) {
                // Mark voucher as used if one was applied
                if (appliedVoucherId) {
                  try {
                    const token = await user.getIdToken();
                    await fetch('/api/rewards/use', {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                      },
                      body: JSON.stringify({
                        voucherId: appliedVoucherId,
                        orderId: dbOrderResult.orderId
                      })
                    });
                  } catch (voucherError) {
                    console.error('Error marking voucher as used:', voucherError);
                  }
                }

                const registrationId = paymentData.registrationId || dbOrderResult.orderId;
                
                // Store registration details in localStorage for the success page
                const registrationDetails = {
                  registrationId,
                  eventTitle: event.title,
                  eventDate: event.date,
                  eventLocation: event.location,
                  amount: finalAmount.toFixed(2),
                  pointsUsed: 0,
                  userName: formData.name,
                  userEmail: formData.email,
                  vipSeating: hasVIPSeating && wantsVIPSeating,
                  tierDiscount: tierDiscount > 0 ? tierDiscount.toFixed(2) : null,
                  voucherDiscount: voucherDiscount > 0 ? voucherDiscount.toFixed(2) : null,
                };
                
                if (typeof window !== 'undefined') {
                  localStorage.setItem(
                    `registration_${registrationId}`,
                    JSON.stringify(registrationDetails)
                  );
                }
                
                // Close modal and redirect to success page
                onClose();
                router.push(`/events/registration-success/${registrationId}`);
              } else {
                setError(paymentData.error || 'Payment verification failed');
                setShowErrorModal(true);
                setIsProcessing(false);
              }
            } catch (err: any) {
              setError(err.message || 'Payment verification failed');
              setShowErrorModal(true);
              setIsProcessing(false);
            }
          },
          theme: {
            color: '#fbbf24',
          },
        };

        const razorpay = new window.Razorpay(options);
        razorpay.open();
      };

      document.body.appendChild(script);
    } catch (err: any) {
      setError(err.message || 'Failed to initiate payment');
      setShowErrorModal(true);
      setIsProcessing(false);
    }
  };

  if (!user) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-black border border-white/10 rounded-sm p-8 max-w-md w-full">
          <h2 className="font-header text-2xl text-white mb-4">Sign In Required</h2>
          <p className="text-white/60 font-serif mb-6">
            You need to be signed in to register for events.
          </p>
          <div className="flex gap-4">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-white/20 text-white font-header text-[9px] tracking-widest hover:border-white/40 transition-all rounded-sm"
            >
              CANCEL
            </button>
            <a
              href="/auth/login"
              className="flex-1 px-4 py-2 bg-amber-500 text-black font-header text-[9px] tracking-widest hover:bg-amber-400 transition-all rounded-sm text-center"
            >
              SIGN IN
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Error Modal */}
      {showErrorModal && error && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
          <div className="bg-black border border-red-500/30 rounded-sm p-8 max-w-md w-full">
            {/* Error Icon */}
            <div className="mb-6 flex justify-center">
              <div className="w-16 h-16 bg-red-500/20 border border-red-500 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>

            {/* Error Message */}
            <h2 className="font-header text-2xl text-white mb-4 text-center">Registration Error</h2>
            <p className="text-red-300 font-serif text-center mb-8">{error}</p>

            {/* Action Button */}
            <button
              onClick={() => setShowErrorModal(false)}
              className="w-full px-4 py-3 bg-red-600 text-white font-header text-[10px] tracking-widest hover:bg-red-700 transition-all rounded-sm"
            >
              TRY AGAIN
            </button>
          </div>
        </div>
      )}



      {/* Registration Form */}
      <div 
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto"
        onClick={(e) => {
          // Close modal when clicking on the backdrop (outside the modal content)
          if (e.target === e.currentTarget) {
            onClose();
          }
        }}
      >
      <div className="bg-black border border-white/10 rounded-sm p-8 max-w-2xl w-full my-8" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="font-header text-3xl text-white">{event.title}</h2>
            <p className="text-amber-500 font-header text-[10px] tracking-widest mt-2">
              EVENT REGISTRATION
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-white/40 hover:text-white transition-colors text-2xl"
          >
            ✕
          </button>
        </div>

        {/* Form Section */}
        <div className="space-y-4 mb-8 pb-8 border-b border-white/10">
          <div>
            <label className="text-white/60 text-sm font-header tracking-widest mb-2 block">
              FULL NAME *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Enter your full name"
              className="w-full px-4 py-2 bg-white/5 border border-white/10 text-white placeholder:text-white/30 rounded-sm focus:outline-none focus:border-amber-500 transition-all"
            />
          </div>

          <div>
            <label className="text-white/60 text-sm font-header tracking-widest mb-2 block">
              EMAIL *
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="Enter your email"
              className="w-full px-4 py-2 bg-white/5 border border-white/10 text-white placeholder:text-white/30 rounded-sm focus:outline-none focus:border-amber-500 transition-all"
            />
          </div>

          <div>
            <label className="text-white/60 text-sm font-header tracking-widest mb-2 block">
              PHONE *
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              placeholder="10-digit phone number"
              className="w-full px-4 py-2 bg-white/5 border border-white/10 text-white placeholder:text-white/30 rounded-sm focus:outline-none focus:border-amber-500 transition-all"
            />
          </div>
        </div>

        {/* Tier Perks Section */}
        {(hasEarlyEventAccess || workshopDiscountPercent > 0 || hasVIPSeating) && (
          <div className="mb-8 p-4 bg-gradient-to-r from-amber-500/10 to-purple-500/10 border border-amber-500/30 rounded-sm">
            <div className="text-white/60 font-header text-sm tracking-widest mb-4 flex items-center gap-2">
              <span className="text-2xl">👑</span> YOUR TIER PERKS
            </div>
            
            <div className="space-y-3">
              {hasEarlyEventAccess && (
                <div className="flex items-center gap-3 text-sm">
                  <span className="text-green-400">✓</span>
                  <span className="text-white font-bold">Early Event Access (Player Tier)</span>
                </div>
              )}
              
              {workshopDiscountPercent > 0 && (
                <div className="flex items-center gap-3 text-sm">
                  <span className="text-green-400">✓</span>
                  <span className="text-white font-bold">{workshopDiscountPercent}% Workshop Discount (Strategist Tier)</span>
                  <span className="ml-auto text-amber-400 font-bold">-₹{tierDiscount.toFixed(2)}</span>
                </div>
              )}
              
              {hasVIPSeating && (
                <div className="space-y-2">
                  <div className="flex items-center gap-3 text-sm">
                    <span className="text-green-400">✓</span>
                    <span className="text-white font-bold">VIP Seating Available (Grandmaster Tier)</span>
                  </div>
                  <label className="flex items-center gap-3 cursor-pointer ml-6">
                    <input
                      type="checkbox"
                      checked={wantsVIPSeating}
                      onChange={(e) => setWantsVIPSeating(e.target.checked)}
                      className="w-4 h-4 accent-amber-500"
                    />
                    <span className="text-white/80 font-serif text-sm">Reserve VIP Seating</span>
                  </label>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Voucher Section */}
        <div className="mb-8 p-4 bg-purple-500/10 border border-purple-500/30 rounded-sm">
          <div className="text-white/60 font-header text-sm tracking-widest mb-4">HAVE A VOUCHER?</div>
          
          {!appliedVoucher ? (
            <div className="flex gap-2">
              <input
                type="text"
                value={voucherCode}
                onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
                placeholder="Enter voucher code"
                className="flex-1 px-4 py-2 bg-white/5 border border-white/10 text-white placeholder:text-white/30 rounded-sm focus:outline-none focus:border-purple-500 transition-all uppercase"
              />
              <button
                onClick={handleApplyVoucher}
                disabled={checkingVoucher || !voucherCode.trim()}
                className="px-6 py-2 bg-purple-600 text-white font-header text-xs tracking-widest hover:bg-purple-700 disabled:opacity-50 transition-all rounded-sm"
              >
                {checkingVoucher ? 'CHECKING...' : 'APPLY'}
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between p-3 bg-purple-500/20 border border-purple-500/50 rounded-sm">
              <div>
                <p className="text-white font-header text-sm">{appliedVoucher.name}</p>
                <p className="text-purple-300 text-xs mt-1">Code: {appliedVoucher.code}</p>
                <p className="text-green-400 text-xs mt-1">Saved ₹{voucherDiscount.toFixed(2)}</p>
              </div>
              <button
                onClick={handleRemoveVoucher}
                className="px-4 py-2 bg-red-600/80 text-white font-header text-xs tracking-widest hover:bg-red-700 transition-all rounded-sm"
              >
                REMOVE
              </button>
            </div>
          )}
          
          {voucherError && (
            <p className="text-red-400 text-xs mt-2">{voucherError}</p>
          )}
        </div>

        {/* Price Breakdown */}
        <div className="mb-8 p-4 bg-white/5 border border-white/10 rounded-sm space-y-3">
          <div className="flex justify-between text-white/60">
            <span className="font-header text-sm">EVENT PRICE:</span>
            <span className="font-serif">₹{event.price || 0}</span>
          </div>

          {workshopDiscountPercent > 0 && tierDiscount > 0 && (
            <div className="flex justify-between text-amber-400">
              <span className="font-header text-sm">TIER DISCOUNT ({workshopDiscountPercent}%):</span>
              <span className="font-serif">-₹{tierDiscount.toFixed(2)}</span>
            </div>
          )}

          {appliedVoucher && voucherDiscount > 0 && (
            <div className="flex justify-between text-purple-400">
              <span className="font-header text-sm">VOUCHER DISCOUNT:</span>
              <span className="font-serif">-₹{voucherDiscount.toFixed(2)}</span>
            </div>
          )}

          <div className="border-t border-white/10 pt-3 flex justify-between">
            <span className="font-header text-white">FINAL AMOUNT:</span>
            <span className="font-header text-amber-500 text-xl">₹{finalAmount.toFixed(2)}</span>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-sm">
            <p className="text-red-400 text-sm font-serif">{error}</p>
          </div>
        )}

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="flex-1 px-4 py-3 border border-white/20 text-white font-header text-[9px] tracking-widest hover:border-white/40 disabled:opacity-50 transition-all rounded-sm"
          >
            CANCEL
          </button>
          <button
            onClick={handlePayment}
            disabled={isProcessing}
            className="flex-1 px-4 py-3 bg-amber-500 text-black font-header text-[9px] tracking-widest hover:bg-amber-400 disabled:opacity-50 transition-all rounded-sm"
          >
            {isProcessing ? 'PROCESSING...' : `PAY ₹${finalAmount.toFixed(2)}`}
          </button>
        </div>
      </div>
      </div>
    </>
  );
}
