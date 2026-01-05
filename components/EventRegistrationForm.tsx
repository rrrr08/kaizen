'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { User } from 'firebase/auth';
import { createPaymentOrder, completeRegistration } from '@/lib/db/payments';
import { useGamification } from '@/app/context/GamificationContext';
import { usePopup } from '@/app/context/PopupContext';
import { X, Check } from 'lucide-react';

interface EventRegistrationFormProps {
  event: any;
  user: User | null;
  onSuccess: () => void;
  onClose: () => void;
  onLockAcquired?: () => void;
  onLockReleased?: () => void;
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
  onClose: propsOnClose,
  onLockAcquired,
  onLockReleased,
}: EventRegistrationFormProps) {
  const router = useRouter();

  // Wrapper for onClose to release lock
  const onClose = async () => {
    // We can't access lockId state easily here if we are defining it before state :P 
    // We need to define this later or use effect.
    // Let's pass a handler to the actual buttons.
    propsOnClose();
  };

  const { hasEarlyEventAccess, workshopDiscountPercent, hasVIPSeating, config, calculatePointWorth } = useGamification();
  const { showAlert } = usePopup();
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

  // JP Wallet state
  const [walletPoints, setWalletPoints] = useState(0);
  const [redeemPoints, setRedeemPoints] = useState(0);
  const [pointsDiscount, setPointsDiscount] = useState(0);
  const [lockId, setLockId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: user?.displayName || '',
    email: user?.email || '',
    phone: '',
  });

  const isSuccessRef = useRef(false);

  // Release lock on unmount or close if transaction not completed
  useEffect(() => {
    return () => {
      if (lockId && !isSuccessRef.current) {
        // Only release (and notify) if NOT successful
        releaseLock(lockId);
      }
    };
  }, [lockId]);

  const releaseLock = async (id: string, notify = true) => {
    try {
      await fetch('/api/events/lock', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lockId: id }),
        keepalive: true
      });
      setLockId(null);
    } catch (e) {
      console.error('Failed to release lock', e);
    } finally {
      if (notify) {
        onLockReleased?.();
      }
    }
  };

  // Fetch user's wallet points and saved checkout info
  useEffect(() => {
    if (user) {
      const fetchUserData = async () => {
        try {
          const { getFirestore, doc, getDoc } = await import('firebase/firestore');
          const { app } = await import('@/lib/firebase');
          const db = getFirestore(app);
          const userRef = doc(db, 'users', user.uid);
          const userSnap = await getDoc(userRef);
          if (userSnap.exists()) {
            const userData = userSnap.data();
            setWalletPoints(userData?.points || 0);

            // Load saved checkout info for auto-fill
            const savedInfo = userData?.checkoutInfo;
            if (savedInfo) {
              setFormData(prev => ({
                name: savedInfo.name || user?.displayName || prev.name,
                email: savedInfo.email || user?.email || prev.email,
                phone: savedInfo.phone || prev.phone,
              }));
            }
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      };
      fetchUserData();
    }
  }, [user]);

  // Calculate price with tier discount
  const basePrice = event.price || 0;
  const tierDiscount = workshopDiscountPercent > 0 ? (basePrice * workshopDiscountPercent / 100) : 0;
  const priceAfterTierDiscount = basePrice - tierDiscount;

  // Maximum 50% of order can be paid with points
  const maxRedeemable = priceAfterTierDiscount * 0.5;
  const maxRedeemPoints = Math.floor(maxRedeemable / config.redeemRate);
  const actualRedeemPoints = Math.min(redeemPoints, walletPoints, maxRedeemPoints);
  const actualPointsDiscount = calculatePointWorth(actualRedeemPoints);

  const finalAmount = Math.max(0, priceAfterTierDiscount - actualPointsDiscount - voucherDiscount);

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

  const handleRedeemPointsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let points = parseInt(e.target.value) || 0;

    if (points > walletPoints) {
      points = walletPoints;
    }
    if (points > maxRedeemPoints) {
      points = maxRedeemPoints;
    }

    setRedeemPoints(points);
  };

  const handleUseMaxPoints = () => {
    const pointsToUse = Math.min(walletPoints, maxRedeemPoints);
    setRedeemPoints(pointsToUse);
  };

  const handleFreeRegistration = async () => {
    if (!user) return;
    try {
      // Complete registration directly without payment gateway
      const registrationResult = await completeRegistration(
        event.id,
        user.uid,
        null, // No payment order ID for free registration
        0, // Amount paid is 0
        0 // No wallet points for events
      );

      console.log('Registration result:', registrationResult);

      if (!registrationResult.success) {
        throw new Error(registrationResult.message || 'Registration failed');
      }

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
              orderId: registrationResult.registrationId
            })
          });
        } catch (voucherError) {
          console.error('Error marking voucher as used:', voucherError);
        }
      }

      const registrationId = registrationResult.registrationId;

      // Send confirmation email
      try {
        await fetch('/api/events/send-confirmation', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            registrationId,
            email: formData.email,
            name: formData.name,
            eventTitle: event.title,
            eventDate: event.datetime,
            eventLocation: event.location,
            amount: '0.00'
          })
        });
      } catch (emailError) {
        console.error('Error sending confirmation email:', emailError);
      }

      // Store registration details in localStorage for the success page
      const registrationDetails = {
        registrationId,
        eventTitle: event.title,
        eventDate: event.datetime ? new Date(event.datetime).toISOString() : undefined,
        eventLocation: event.location,
        amount: '0.00',
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

      // Save checkout info for future auto-fill
      try {
        const { getFirestore, doc, updateDoc } = await import('firebase/firestore');
        const { app } = await import('@/lib/firebase');
        const db = getFirestore(app);
        const userRef = doc(db, 'users', user.uid);
        await updateDoc(userRef, {
          checkoutInfo: {
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            updatedAt: new Date().toISOString(),
          }
        });
      } catch (saveError) {
        console.error('Failed to save checkout info:', saveError);
      }

      // Close modal and redirect to success page
      isSuccessRef.current = true;
      setLockId(null); // Clear lock state so we don't try to release it
      // For free registration, the registration itself "consumes" the spot. 
      // We should technically release the lock or let backend handle it?
      // The lock is still in 'event_locks'. We SHOULD release it.
      if (lockId) {
        await releaseLock(lockId, false); // Don't notify UI, as we are converting to registration
      }

      onSuccess?.();
      propsOnClose();
      router.push(`/events/registration-success/${registrationId}`);
    } catch (error) {
      console.error('Free registration error:', error);
      setError(error instanceof Error ? error.message : 'Registration failed');
      setShowErrorModal(true);
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePayment = async () => {
    if (!user) {
      await showAlert('Please sign in to register', 'warning');
      return;
    }

    if (!validateForm()) {
      return;
    }

    try {
      setIsProcessing(true);
      setError(null);

      // 0. Acquire Lock First
      if (!lockId) {
        try {
          // console.log('Attempting to acquire lock with:', { eventId: event?.id, userId: user?.uid });
          const lockRes = await fetch('/api/events/lock', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ eventId: event.id, userId: user.uid })
          });

          const lockData = await lockRes.json();
          if (!lockRes.ok || !lockData.success) {
            throw new Error(lockData.error || 'Event temporarily full. Please try again later.');
          }
          setLockId(lockData.lockId);
          onLockAcquired?.(); // Notify parent that lock is active
        } catch (lockError: any) {
          setError(lockError.message);
          setShowErrorModal(true);
          setIsProcessing(false);
          return;
        }
      }

      // If final amount is 0 (fully covered by points/vouchers), skip Razorpay
      if (finalAmount <= 0) {
        // Handle free registration
        await handleFreeRegistration();
        return;
      }

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
            userId: user.uid, // Add userId to notes for backend check
            eventName: event.title,
            userName: formData.name,
            userEmail: formData.email,
          },
        }),
      });

      if (!orderResponse.ok) {
        const errorData = await orderResponse.json();
        throw new Error(errorData.error || 'Failed to create payment order');
      }

      const orderData = await orderResponse.json();
      const razorpayOrderId = orderData.orderId;

      // Create payment order record in our DB
      const dbOrderResult = await createPaymentOrder(
        event.id,
        user.uid,
        finalAmount * 100, // Convert to paise
        0 // No wallet points for events
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
                  amount: Math.round(finalAmount * 100),
                  walletPointsUsed: 0,
                }),
              });

              const paymentData = await paymentResponse.json();

              if (paymentData.success) {
                isSuccessRef.current = true; // Prevents lock release/notify on cleanup

                // Clear lock ID so we don't try to release it manually either
                setLockId(null);

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
                  eventDate: event.datetime ? new Date(event.datetime).toISOString() : undefined,
                  eventLocation: event.location,
                  amount: finalAmount.toFixed(2),
                  pointsUsed: actualRedeemPoints,
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

                // Save checkout info for future auto-fill
                try {
                  const { getFirestore, doc, updateDoc } = await import('firebase/firestore');
                  const { app } = await import('@/lib/firebase');
                  const db = getFirestore(app);
                  const userRef = doc(db, 'users', user.uid);
                  await updateDoc(userRef, {
                    checkoutInfo: {
                      name: formData.name,
                      email: formData.email,
                      phone: formData.phone,
                      updatedAt: new Date().toISOString(),
                    }
                  });
                } catch (saveError) {
                  console.error('Failed to save checkout info:', saveError);
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
          modal: {
            ondismiss: function () {
              setIsProcessing(false);
              // Do NOT release lock immediately on modal dismiss? 
              // Actually user might want to try again. 
              // If we release lock here, they lose spot. 
              // Better to keep lock until they interact with OUR modal close.
            }
          }
        };

        const razorpay = new window.Razorpay(options);
        razorpay.open();
      };

      document.body.appendChild(script);
    } catch (err: any) {
      setError(err.message || 'Failed to initiate payment');
      setShowErrorModal(true);
      setIsProcessing(false);

      // If payment initiation failed completely, we might want to release lock?
      // Or keep it for retry. Let's keep it.
    }
  };

  if (!user) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-[#FFFDF5] border-4 border-black rounded-[30px] p-8 max-w-md w-full neo-shadow">
          <h2 className="font-header text-3xl text-black mb-4">SIGN IN REQUIRED</h2>
          <p className="text-black/70 font-medium text-lg leading-relaxed mb-8">
            You need to be signed in to register for events.
          </p>
          <div className="flex gap-4">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-white text-black border-2 border-black rounded-xl font-black text-xs tracking-widest hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all uppercase"
            >
              CANCEL
            </button>
            <a
              href="/auth/login"
              className="flex-1 px-6 py-3 bg-[#FFD93D] text-black border-2 border-black rounded-xl neo-shadow font-black text-xs tracking-widest hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all text-center uppercase"
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
          <div className="bg-[#FFFDF5] border-4 border-black rounded-[30px] p-8 max-w-md w-full neo-shadow">
            {/* Error Icon */}
            <div className="mb-6 flex justify-center">
              <div className="w-16 h-16 bg-[#FF7675] border-3 border-black rounded-full flex items-center justify-center neo-shadow">
                <span className="text-3xl text-black font-black">!</span>
              </div>
            </div>

            {/* Error Message */}
            <h2 className="font-header text-2xl text-black mb-4 text-center uppercase">Registration Error</h2>
            <p className="text-black/70 font-medium text-center mb-8">{error}</p>

            {/* Action Button */}
            <button
              onClick={() => setShowErrorModal(false)}
              className="w-full px-6 py-3 bg-[#FF7675] text-black border-2 border-black rounded-xl neo-shadow font-black text-xs tracking-widest hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all uppercase"
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
            if (lockId) releaseLock(lockId);
            propsOnClose();
          }
        }}
      >
        <div className="bg-[#FFFDF5] border-4 border-black rounded-[30px] p-8 md:p-10 max-w-2xl w-full my-8 neo-shadow relative" onClick={(e) => e.stopPropagation()}>
          {/* Header */}
          <div className="flex items-start justify-between mb-8">
            <div>
              <div className="bg-[#FFD93D] text-black px-3 py-1 rounded-lg border-2 border-black inline-block font-black text-[10px] tracking-[0.2em] mb-4 uppercase">
                EVENT REGISTRATION
              </div>
              <h2 className="font-header text-3xl md:text-4xl text-black leading-none">{event.title}</h2>
            </div>
            <button
              onClick={() => {
                if (lockId) releaseLock(lockId);
                propsOnClose();
              }}
              className="w-10 h-10 flex items-center justify-center bg-white border-2 border-black rounded-full hover:bg-black hover:text-white transition-colors"
            >
              <X className="w-5 h-5" strokeWidth={3} />
            </button>
          </div>

          {/* Form Section */}
          <div className="space-y-6 mb-10">
            <div>
              <label className="font-black text-xs tracking-widest text-black/60 mb-2 block uppercase">
                FULL NAME *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Enter your full name"
                className="w-full px-4 py-3 bg-white border-2 border-black rounded-xl text-black placeholder:text-black/30 focus:outline-none focus:shadow-[4px_4px_0px_#000] transition-all font-medium"
              />
            </div>

            <div>
              <label className="font-black text-xs tracking-widest text-black/60 mb-2 block uppercase">
                EMAIL *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Enter your email"
                className="w-full px-4 py-3 bg-white border-2 border-black rounded-xl text-black placeholder:text-black/30 focus:outline-none focus:shadow-[4px_4px_0px_#000] transition-all font-medium"
              />
            </div>

            <div>
              <label className="font-black text-xs tracking-widest text-black/60 mb-2 block uppercase">
                PHONE *
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="10-digit phone number"
                className="w-full px-4 py-3 bg-white border-2 border-black rounded-xl text-black placeholder:text-black/30 focus:outline-none focus:shadow-[4px_4px_0px_#000] transition-all font-medium"
              />
            </div>
          </div>

          {/* Tier Perks Section */}
          {(hasEarlyEventAccess || workshopDiscountPercent > 0 || hasVIPSeating) && (
            <div className="mb-8 p-6 bg-[#FFD93D]/30 border-2 border-black rounded-xl border-dashed">
              <div className="font-black text-xs tracking-widest text-black/60 mb-4 flex items-center gap-2 uppercase">
                <span className="text-xl">👑</span> YOUR TIER PERKS
              </div>

              <div className="space-y-3">
                {hasEarlyEventAccess && (
                  <div className="flex items-center gap-3 text-sm font-bold text-black">
                    <div className="w-5 h-5 bg-[#00B894] rounded-full flex items-center justify-center border border-black text-white text-xs">
                      <Check className="w-3 h-3" strokeWidth={4} />
                    </div>
                    <span>Early Event Access (Player Tier)</span>
                  </div>
                )}

                {workshopDiscountPercent > 0 && (
                  <div className="flex items-center gap-3 text-sm font-bold text-black">
                    <div className="w-5 h-5 bg-[#00B894] rounded-full flex items-center justify-center border border-black text-white text-xs">
                      <Check className="w-3 h-3" strokeWidth={4} />
                    </div>
                    <span>{workshopDiscountPercent}% Workshop Discount (Strategist Tier)</span>
                    <span className="ml-auto bg-black text-[#FFD93D] px-2 py-0.5 rounded text-xs">-₹{tierDiscount.toFixed(2)}</span>
                  </div>
                )}

                {hasVIPSeating && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-sm font-bold text-black">
                      <div className="w-5 h-5 bg-[#00B894] rounded-full flex items-center justify-center border border-black text-white text-xs">
                        <Check className="w-3 h-3" strokeWidth={4} />
                      </div>
                      <span>VIP Seating Available (Grandmaster Tier)</span>
                    </div>
                    <label className="flex items-center gap-3 cursor-pointer ml-8 p-3 bg-white border-2 border-black rounded-lg hover:shadow-[2px_2px_0px_#000] transition-all">
                      <div className="relative">
                        <input
                          type="checkbox"
                          checked={wantsVIPSeating}
                          onChange={(e) => setWantsVIPSeating(e.target.checked)}
                          className="peer appearance-none w-5 h-5 border-2 border-black rounded bg-white checked:bg-[#6C5CE7] checked:border-black transition-all cursor-pointer"
                        />
                        <Check className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity" strokeWidth={4} />
                      </div>
                      <span className="text-black font-bold text-sm select-none">Reserve VIP Seating</span>
                    </label>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Voucher Section */}
          <div className="mb-8 p-6 bg-[#6C5CE7]/10 border-2 border-black rounded-xl">
            <div className="font-black text-xs tracking-widest text-[#6C5CE7] mb-4 uppercase">HAVE A VOUCHER?</div>

            {!appliedVoucher ? (
              <div className="flex gap-3">
                <input
                  type="text"
                  value={voucherCode}
                  onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
                  placeholder="PROMO CODE"
                  className="flex-1 px-4 py-3 bg-white border-2 border-black rounded-xl text-black placeholder:text-black/30 focus:outline-none focus:shadow-[4px_4px_0px_#000] transition-all uppercase font-bold"
                />
                <button
                  onClick={handleApplyVoucher}
                  disabled={checkingVoucher || !voucherCode.trim()}
                  className="px-6 py-3 bg-[#6C5CE7] text-white border-2 border-black rounded-xl font-black text-xs tracking-widest hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all uppercase disabled:opacity-50 disabled:hover:translate-x-0 disabled:hover:translate-y-0"
                >
                  {checkingVoucher ? '...' : 'APPLY'}
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between p-4 bg-white border-2 border-black rounded-xl neo-shadow">
                <div>
                  <p className="text-black font-black text-sm uppercase">{appliedVoucher.name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs font-mono bg-black text-white px-1.5 py-0.5 rounded">{appliedVoucher.code}</span>
                    <span className="text-[#00B894] font-bold text-xs">SAVED ₹{voucherDiscount.toFixed(2)}</span>
                  </div>
                </div>
                <button
                  onClick={handleRemoveVoucher}
                  className="px-3 py-1.5 bg-[#FF7675] text-black border-2 border-black rounded-lg font-black text-[10px] tracking-widest hover:bg-red-400 transition-all uppercase"
                >
                  REMOVE
                </button>
              </div>
            )}

            {voucherError && (
              <p className="text-[#FF7675] font-bold text-xs mt-2 flex items-center gap-1">
                <span>!</span> {voucherError}
              </p>
            )}
          </div>

          {/* Price Breakdown */}
          <div className="mb-10 bg-white border-2 border-black rounded-xl overflow-hidden">
            <div className="p-6 space-y-3">
              <div className="flex justify-between text-black/60">
                <span className="font-black text-xs tracking-widest uppercase">EVENT PRICE</span>
                <span className="font-bold font-mono">₹{event.price || 0}</span>
              </div>

              {workshopDiscountPercent > 0 && tierDiscount > 0 && (
                <div className="flex justify-between text-[#00B894]">
                  <span className="font-black text-xs tracking-widest uppercase">TIER DISCOUNT ({workshopDiscountPercent}%)</span>
                  <span className="font-bold font-mono">-₹{tierDiscount.toFixed(2)}</span>
                </div>
              )}

              {appliedVoucher && voucherDiscount > 0 && (
                <div className="flex justify-between text-[#6C5CE7]">
                  <span className="font-black text-xs tracking-widest uppercase">VOUCHER DISCOUNT</span>
                  <span className="font-bold font-mono">-₹{voucherDiscount.toFixed(2)}</span>
                </div>
              )}
            </div>

            <div className="bg-[#FFFDF5] border-t-2 border-black p-6 flex justify-between items-center">
              <span className="font-black text-sm tracking-widest uppercase text-black">TOTAL AMOUNT</span>
              <span className="font-header text-3xl text-black">₹{finalAmount.toFixed(2)}</span>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-[#FF7675]/20 border-2 border-[#FF7675] rounded-xl flex gap-3 items-start">
              <div className="mt-0.5 min-w-[20px] h-5 bg-[#FF7675] rounded-full flex items-center justify-center text-white text-xs font-black">!</div>
              <p className="text-[#D63031] text-sm font-bold">{error}</p>
            </div>
          )}

          {/* Buttons */}
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => {
                if (lockId) releaseLock(lockId);
                propsOnClose();
              }}
              disabled={isProcessing}
              className="px-6 py-4 bg-white text-black border-2 border-black rounded-xl font-black text-xs tracking-widest hover:bg-gray-50 transition-all uppercase disabled:opacity-50"
            >
              CANCEL
            </button>
            <button
              onClick={handlePayment}
              disabled={isProcessing}
              className="px-6 py-4 bg-[#6C5CE7] text-white border-2 border-black rounded-xl neo-shadow font-black text-xs tracking-widest hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all uppercase disabled:opacity-50 disabled:shadow-none disabled:translate-x-0 disabled:translate-y-0"
            >
              {isProcessing ? 'PROCESSING...' : `PAY ₹${finalAmount.toFixed(2)}`}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
