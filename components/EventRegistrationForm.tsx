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
  const { config } = useGamification();
  const [wallet, setWallet] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [useWalletPoints, setUseWalletPoints] = useState(false);
  const [pointsToUse, setPointsToUse] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);

  const [formData, setFormData] = useState({
    name: user?.displayName || '',
    email: user?.email || '',
    phone: '',
  });

  useEffect(() => {
    if (user) {
      loadWallet();
    }
  }, [user]);

  const loadWallet = async () => {
    try {
      if (!user?.uid) return;
      // Lazy load Firebase function
      const { getUserWallet } = await import('@/lib/firebase');
      const walletData = await getUserWallet(user.uid);
      // If wallet doesn't exist, create a default one with 0 points
      setWallet(walletData || { points: 0, userId: user.uid });
    } catch (err) {
      console.error('Error loading wallet:', err);
      // Set default wallet on error
      if (user?.uid) {
        setWallet({ points: 0, userId: user.uid });
      }
    }
  };

  // Convert points to rupees using standard conversion rate (1 point = redeemRate rupees)
  const pointsValue = pointsToUse * config.redeemRate;
  const finalAmount = Math.max(0, (event.price || 0) - pointsValue);

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
            walletPointsUsed: pointsToUse,
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
        pointsToUse
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
                  walletPointsUsed: pointsToUse,
                }),
              });

              const paymentData = await paymentResponse.json();

              if (paymentData.success) {
                const registrationId = paymentData.registrationId || dbOrderResult.orderId;
                
                // Store registration details in localStorage for the success page
                const registrationDetails = {
                  registrationId,
                  eventTitle: event.title,
                  eventDate: event.date,
                  eventLocation: event.location,
                  amount: finalAmount.toFixed(2),
                  pointsUsed: pointsToUse,
                  userName: formData.name,
                  userEmail: formData.email,
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

        {/* Wallet Points Section */}
        <div className="mb-8 p-4 bg-amber-500/10 border border-amber-500/30 rounded-sm">
          <div className="text-white/60 font-header text-sm tracking-widest mb-4">WALLET POINTS</div>
          
          {wallet === null ? (
            <div className="text-white/60 font-serif text-sm">Loading wallet...</div>
          ) : wallet && wallet.points > 0 ? (
            <>
              <label className="flex items-center gap-3 cursor-pointer mb-3">
                <input
                  type="checkbox"
                  checked={useWalletPoints}
                  onChange={(e) => {
                    setUseWalletPoints(e.target.checked);
                    setPointsToUse(0);
                  }}
                  className="w-4 h-4 accent-amber-500"
                />
                <span className="text-white font-header text-sm">Use Wallet Points</span>
                <span className="text-amber-400 font-serif ml-auto">{wallet.points} Points Available</span>
              </label>

              {useWalletPoints && (
                <div className="mt-4 space-y-3">
                  <div>
                    <label className="text-white/60 text-xs block mb-3">
                      Points to use (max: {Math.min(wallet.points, Math.floor((event.price || 0) / config.redeemRate))})
                    </label>
                    <input
                      type="range"
                      min="0"
                      max={Math.min(wallet.points, Math.floor((event.price || 0) / config.redeemRate))}
                      value={pointsToUse}
                      onChange={(e) => setPointsToUse(parseInt(e.target.value))}
                      className="w-full accent-amber-500"
                    />
                    <div className="flex justify-between text-xs text-white/50 mt-2">
                      <span>0 PTS</span>
                      <span className="text-amber-400">{pointsToUse} PTS = ₹{pointsValue.toFixed(2)}</span>
                      <span>{Math.min(wallet.points, Math.floor((event.price || 0) / config.redeemRate))} PTS</span>
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-white/60 font-serif text-sm">
              <p className="mb-2">No wallet points available. Earn points by attending events and making purchases.</p>
              <a href="/wallet" className="text-amber-400 hover:text-amber-300 text-xs inline-block mt-2">
                Check Wallet →
              </a>
            </div>
          )}
        </div>

        {/* Price Breakdown */}
        <div className="mb-8 p-4 bg-white/5 border border-white/10 rounded-sm space-y-3">
          <div className="flex justify-between text-white/60">
            <span className="font-header text-sm">EVENT PRICE:</span>
            <span className="font-serif">₹{event.price || 0}</span>
          </div>

          {useWalletPoints && pointsToUse > 0 && (
            <div className="flex justify-between text-amber-400">
              <span className="font-header text-sm">WALLET DISCOUNT:</span>
              <span className="font-serif">-₹{pointsValue.toFixed(2)}</span>
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
