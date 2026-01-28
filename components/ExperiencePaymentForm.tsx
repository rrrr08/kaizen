'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { usePopup } from '@/app/context/PopupContext';
import { useGamification } from '@/app/context/GamificationContext';
import { X, Check, Zap } from 'lucide-react';
import Script from 'next/script';

interface ExperiencePaymentFormProps {
    enquiry: any;
    user: any;
    onSuccess: () => void;
    onClose: () => void;
}

declare global {
    interface Window {
        Razorpay: any;
    }
}

export default function ExperiencePaymentForm({
    enquiry,
    user,
    onSuccess,
    onClose,
}: ExperiencePaymentFormProps) {
    const router = useRouter();
    const { showAlert } = usePopup();

    // Kept for future use if we need config
    useGamification();

    const [error, setError] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [showErrorModal, setShowErrorModal] = useState(false);
    const [isRazorpayLoaded, setIsRazorpayLoaded] = useState(false);

    // Form Data
    const [formData, setFormData] = useState({
        name: user?.displayName || enquiry.name || '',
        email: user?.email || enquiry.email || '',
        phone: enquiry.phone || user?.phoneNumber || '',
    });

    // Gamification & Voucher State
    const [voucherCode, setVoucherCode] = useState('');
    const [appliedVoucher, setAppliedVoucher] = useState<any>(null);
    const [appliedVoucherId, setAppliedVoucherId] = useState<string | null>(null);
    const [voucherDiscount, setVoucherDiscount] = useState(0);
    const [voucherError, setVoucherError] = useState('');
    const [checkingVoucher, setCheckingVoucher] = useState(false);

    // Hardcoded Earnings as requested
    const EARN_XP = 60;
    const EARN_JP = 60;

    const finalPrice = enquiry.finalPrice || 0;
    const finalAmount = Math.max(0, finalPrice - voucherDiscount);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const validateForm = () => {
        if (!formData.name.trim()) { setError('Please enter your name'); setShowErrorModal(true); return false; }
        if (!formData.email.trim()) { setError('Please enter your email'); setShowErrorModal(true); return false; }
        if (!formData.phone.trim()) { setError('Please enter your phone number'); setShowErrorModal(true); return false; }
        const phoneRegex = /^\+?[\d\s-()]{10,20}$/;
        if (!phoneRegex.test(formData.phone)) {
            setError('Please enter a valid phone number');
            setShowErrorModal(true);
            return false;
        }
        return true;
    };

    const handleApplyVoucher = async () => {
        if (!voucherCode.trim()) { setVoucherError('Please enter a voucher code'); return; }
        if (!user) { setVoucherError('Please log in to apply vouchers'); return; }

        setCheckingVoucher(true);
        setVoucherError('');

        try {
            const token = await user.getIdToken();
            const response = await fetch('/api/rewards/validate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({
                    code: voucherCode,
                    orderTotal: finalPrice,
                    category: 'experiences'
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
        } catch (e) {
            setVoucherError('Failed to validate voucher');
        } finally {
            setCheckingVoucher(false);
        }
    };

    const handleRemoveVoucher = () => {
        setAppliedVoucher(null); setAppliedVoucherId(null); setVoucherDiscount(0); setVoucherCode(''); setVoucherError('');
    };

    const handlePayment = async () => {
        if (!user) { await showAlert('Please sign in to proceed', 'warning'); return; }
        if (!validateForm()) return;

        try {
            setIsProcessing(true);
            setError(null);

            // Create Order
            const orderResponse = await fetch('/api/experiences/payment/create-order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    enquiryId: enquiry.id,
                    amount: finalAmount,
                    currency: 'INR',
                    receipt: `EXP-${enquiry.id.slice(0, 8)}`,
                    notes: {
                        enquiryId: enquiry.id,
                        userId: user.uid,
                        categoryName: enquiry.categoryName,
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
            const razorpayOrderId = orderData.orderId || orderData.id;

            // Load Razorpay
            if (!window.Razorpay) {
                throw new Error('Payment system is not ready. Please try again in a moment.');
            }

            const options = {
                key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
                amount: orderData.amount,
                currency: orderData.currency,
                name: 'Joy Juncture',
                description: `Experience: ${enquiry.categoryName}`,
                order_id: razorpayOrderId,
                prefill: {
                    name: formData.name,
                    email: formData.email,
                    contact: formData.phone, // KEY FIX: Razorpay expects 'contact', not 'phone'
                },
                handler: async (response: any) => {
                    try {
                        // Verify Payment
                        const paymentResponse = await fetch('/api/experiences/payment/verify', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_signature: response.razorpay_signature,
                                enquiryId: enquiry.id,
                                userId: user.uid,
                                amount: orderData.amount,
                                walletPointsUsed: 0
                            }),
                        });

                        const paymentData = await paymentResponse.json();

                        if (paymentData.success) {
                            // Redeem Voucher if used
                            if (appliedVoucherId) {
                                try {
                                    const token = await user.getIdToken();
                                    await fetch('/api/rewards/use', {
                                        method: 'POST',
                                        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                                        body: JSON.stringify({ voucherId: appliedVoucherId, orderId: razorpayOrderId })
                                    });
                                } catch (e) { console.error("Voucher use failed", e); }
                            }

                            await showAlert('Payment Successful! Your experience is confirmed.', 'success');

                            // Save checkout info
                            try {
                                const { getFirestore, doc, updateDoc } = await import('firebase/firestore');
                                const { app } = await import('@/lib/firebase');
                                const db = getFirestore(app);
                                await updateDoc(doc(db, 'users', user.uid), {
                                    checkoutInfo: {
                                        name: formData.name,
                                        email: formData.email,
                                        phone: formData.phone,
                                        updatedAt: new Date().toISOString()
                                    }
                                });
                            } catch (e) { }

                            onSuccess();
                            onClose();
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
                theme: { color: '#6C5CE7' },
                modal: { ondismiss: function () { setIsProcessing(false); } }
            };

            const razorpay = new window.Razorpay(options);
            razorpay.on('payment.failed', function (response: any) {
                console.error('Payment Failed:', response.error);
                setError(response.error.description || 'Payment Failed');
                setShowErrorModal(true);
                setIsProcessing(false);
            });
            razorpay.open();


        } catch (err: any) {
            console.error("Payment failed", err);
            setError(err.message || 'Failed to initiate payment');
            setShowErrorModal(true);
            setIsProcessing(false);
        }
    };

    return (
        <>
            <Script
                id="razorpay-experience-checkout"
                src="https://checkout.razorpay.com/v1/checkout.js"
                strategy="lazyOnload"
                onLoad={() => setIsRazorpayLoaded(true)}
            />

            {/* Error Modal */}
            {showErrorModal && error && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
                    <div className="bg-[#FFFDF5] border-4 border-black rounded-[30px] p-8 max-w-md w-full neo-shadow">
                        <div className="mb-6 flex justify-center">
                            <div className="w-16 h-16 bg-[#FF7675] border-3 border-black rounded-full flex items-center justify-center neo-shadow">
                                <span className="text-3xl text-black font-black">!</span>
                            </div>
                        </div>
                        <h2 className="font-header text-2xl text-black mb-4 text-center uppercase">Error</h2>
                        <p className="text-black/70 font-medium text-center mb-8">{error}</p>
                        <button
                            onClick={() => setShowErrorModal(false)}
                            className="w-full px-6 py-3 bg-[#FF7675] text-black border-2 border-black rounded-xl neo-shadow font-black text-xs tracking-widest hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all uppercase"
                        >
                            CLOSE
                        </button>
                    </div>
                </div>
            )}

            {/* Payment Modal Content */}
            <div
                className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                onClick={(e) => {
                    if (e.target === e.currentTarget) onClose();
                }}
            >
                <div className="bg-[#FFFDF5] border-4 border-black rounded-[30px] p-8 md:p-10 max-w-2xl w-full neo-shadow relative max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                    {/* Header */}
                    <div className="flex items-start justify-between mb-8">
                        <div>
                            <div className="bg-[#FFD93D] text-black px-3 py-1 rounded-lg border-2 border-black inline-block font-black text-[10px] tracking-[0.2em] mb-4 uppercase">
                                EXPERIENCE PAYMENT
                            </div>
                            <h2 className="font-header text-3xl md:text-4xl text-black leading-none">{enquiry.categoryName}</h2>
                            <p className="text-black/60 font-bold text-sm mt-2">Custom Experience Confirmation</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="w-10 h-10 flex items-center justify-center bg-white border-2 border-black rounded-full hover:bg-black hover:text-white transition-colors"
                        >
                            <X className="w-5 h-5" strokeWidth={3} />
                        </button>
                    </div>

                    {/* Form Section */}
                    <div className="space-y-6 mb-10">
                        <div>
                            <label className="font-black text-xs tracking-widest text-black/60 mb-2 block uppercase">FULL NAME *</label>
                            <input type="text" name="name" value={formData.name} onChange={handleInputChange} placeholder="Enter your full name" className="w-full px-4 py-3 bg-white border-2 border-black rounded-xl text-black placeholder:text-black/30 focus:outline-none focus:shadow-[4px_4px_0px_#000] transition-all font-medium" />
                        </div>
                        <div>
                            <label className="font-black text-xs tracking-widest text-black/60 mb-2 block uppercase">EMAIL *</label>
                            <input type="email" name="email" value={formData.email} onChange={handleInputChange} placeholder="Enter your email" className="w-full px-4 py-3 bg-white border-2 border-black rounded-xl text-black placeholder:text-black/30 focus:outline-none focus:shadow-[4px_4px_0px_#000] transition-all font-medium" />
                        </div>
                        <div>
                            <label className="font-black text-xs tracking-widest text-black/60 mb-2 block uppercase">PHONE *</label>
                            <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} placeholder="10-digit phone number" className="w-full px-4 py-3 bg-white border-2 border-black rounded-xl text-black placeholder:text-black/30 focus:outline-none focus:shadow-[4px_4px_0px_#000] transition-all font-medium" />
                        </div>
                    </div>

                    {/* You Will Earn Section */}
                    <div className="mb-8 p-6 bg-[#FFD93D]/20 border-2 border-black rounded-xl border-dashed">
                        <div className="font-black text-xs tracking-widest text-black/60 mb-4 flex items-center gap-2 uppercase">
                            <Zap className="fill-current text-[#FFD93D]" size={20} /> YOU WILL EARN
                        </div>
                        <div className="flex gap-4">
                            <span className="flex items-center gap-2 px-3 py-1 bg-black text-white rounded-lg font-black text-xs tracking-wider border-2 border-transparent">
                                {EARN_XP} XP
                            </span>
                            <span className="flex items-center gap-2 px-3 py-1 bg-[#FFD93D] text-black rounded-lg font-black text-xs tracking-wider border-2 border-black">
                                {EARN_JP} JP
                            </span>
                        </div>
                    </div>

                    {/* Voucher Section */}
                    <div className="mb-8 p-4 md:p-6 bg-[#6C5CE7]/10 border-2 border-black rounded-xl">
                        <div className="font-black text-xs tracking-widest text-[#6C5CE7] mb-4 uppercase">HAVE A VOUCHER?</div>
                        {!appliedVoucher ? (
                            <div className="flex flex-col sm:flex-row gap-3">
                                <input type="text" value={voucherCode} onChange={(e) => setVoucherCode(e.target.value.toUpperCase())} placeholder="PROMO CODE" className="flex-1 px-4 py-3 bg-white border-2 border-black rounded-xl text-black placeholder:text-black/30 focus:outline-none focus:shadow-[4px_4px_0px_#000] transition-all uppercase font-bold w-full" />
                                <button onClick={handleApplyVoucher} disabled={checkingVoucher || !voucherCode.trim()} className="px-6 py-3 bg-[#6C5CE7] text-white border-2 border-black rounded-xl font-black text-xs tracking-widest hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all uppercase disabled:opacity-50 disabled:hover:translate-x-0 disabled:hover:translate-y-0 w-full sm:w-auto">
                                    {checkingVoucher ? '...' : 'APPLY'}
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center justify-between p-4 bg-white border-2 border-black rounded-xl neo-shadow">
                                <div>
                                    <p className="text-black font-black text-sm uppercase">{appliedVoucher.code} APPLIED</p>
                                    <p className="text-[#00B894] font-bold text-xs mt-1">SAVED ₹{voucherDiscount}</p>
                                </div>
                                <button onClick={handleRemoveVoucher} className="px-3 py-1.5 bg-[#FF7675] text-black border-2 border-black rounded-lg font-black text-[10px] tracking-widest hover:bg-red-400 transition-all uppercase">REMOVE</button>
                            </div>
                        )}
                        {voucherError && <p className="text-[#FF7675] font-bold text-xs mt-2 flex items-center gap-1"><span>!</span> {voucherError}</p>}
                    </div>

                    {/* Price Breakdown */}
                    <div className="mb-10 bg-white border-2 border-black rounded-xl overflow-hidden">
                        <div className="p-6 space-y-3">
                            <div className="flex justify-between text-black/60">
                                <span className="font-black text-xs tracking-widest uppercase">EXPERIENCE PRICE</span>
                                <span className="font-bold font-mono">₹{finalPrice}</span>
                            </div>
                            {voucherDiscount > 0 && (
                                <div className="flex justify-between text-[#6C5CE7]">
                                    <span className="font-black text-xs tracking-widest uppercase">VOUCHER DISCOUNT</span>
                                    <span className="font-bold font-mono">-₹{voucherDiscount}</span>
                                </div>
                            )}
                        </div>
                        <div className="bg-[#FFFDF5] border-t-2 border-black p-6 flex justify-between items-center">
                            <span className="font-black text-sm tracking-widest uppercase text-black">TOTAL AMOUNT</span>
                            <span className="font-header text-3xl text-black">₹{finalAmount}</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <button
                            onClick={onClose}
                            disabled={isProcessing}
                            className="px-6 py-4 bg-white text-black border-2 border-black rounded-xl font-black text-xs tracking-widest hover:bg-gray-50 transition-all uppercase disabled:opacity-50"
                        >
                            CANCEL
                        </button>
                        <button
                            onClick={handlePayment}
                            disabled={isProcessing}
                            className={`px-6 py-4 bg-[#6C5CE7] text-white border-2 border-black rounded-xl neo-shadow font-black text-xs tracking-widest hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all uppercase disabled:opacity-50 disabled:shadow-none disabled:translate-x-0 disabled:translate-y-0`}
                        >
                            {isProcessing ? 'PROCESSING...' : `PAY ₹${finalAmount}`}
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}
