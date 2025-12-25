'use client';

import Link from 'next/link';
import { useState } from 'react';
import { AlertCircle, Home, RotateCcw, MessageSquare } from 'lucide-react';

interface PaymentErrorProps {
  searchParams: {
    error?: string;
    orderId?: string;
    amount?: string;
  };
}

export default function PaymentError() {
  const [retrying, setRetrying] = useState(false);

  const handleRetry = async () => {
    setRetrying(true);
    // Redirect back to checkout to retry
    window.location.href = '/checkout';
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center px-6 pt-28 pb-16">
      <div className="max-w-lg w-full">
        {/* Icon */}
        <div className="mb-8 flex justify-center">
          <div className="relative">
            <div className="absolute inset-0 bg-red-500/20 blur-lg rounded-full"></div>
            <div className="relative bg-red-500/10 border border-red-500/30 rounded-full p-6">
              <AlertCircle size={48} className="text-red-500" />
            </div>
          </div>
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="font-display text-4xl font-bold mb-4">Payment Failed</h1>
          <p className="text-muted-foreground font-body text-lg">
            We couldn't process your payment. Your card was not charged.
          </p>
        </div>

        {/* Error Details */}
        <div className="bg-red-950/20 border border-red-500/30 rounded-lg p-6 mb-8">
          <p className="text-sm text-red-300 mb-4 font-header">
            What might have happened:
          </p>
          <ul className="space-y-2 text-sm text-red-300/80">
            <li className="flex items-start gap-2">
              <span className="text-red-500 mt-1">•</span>
              <span>Insufficient funds in your account</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-500 mt-1">•</span>
              <span>Incorrect card details entered</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-500 mt-1">•</span>
              <span>Your bank declined the transaction</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-500 mt-1">•</span>
              <span>International card transactions not supported</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-500 mt-1">•</span>
              <span>Network connectivity issue</span>
            </li>
          </ul>
        </div>

        {/* International Card Notice */}
        <div className="bg-amber-950/30 border border-amber-500/50 rounded-lg p-6 mb-8">
          <p className="text-sm text-amber-300 font-header mb-3 flex items-center gap-2">
            <span>💳</span> Using an International Card?
          </p>
          <p className="text-sm text-amber-300/90 mb-4">
            If you're using an international debit or credit card, we currently don't support international card transactions. Here are your options:
          </p>
          <ul className="space-y-2 text-sm text-amber-300/80">
            <li className="flex items-start gap-2">
              <span className="text-amber-400">→</span>
              <span><strong>Best Option:</strong> Use UPI or Indian payment methods</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-amber-400">→</span>
              <span>Use a domestic Indian debit/credit card if available</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-amber-400">→</span>
              <span>Contact your bank about using your card for Indian payments</span>
            </li>
          </ul>
        </div>

        {/* What to do */}
        <div className="bg-blue-950/20 border border-blue-500/30 rounded-lg p-6 mb-8">
          <p className="text-sm text-blue-300 mb-4 font-header">
            What to do next:
          </p>
          <ol className="space-y-2 text-sm text-blue-300/80">
            <li className="flex items-start gap-2">
              <span className="text-blue-400">1.</span>
              <span>Verify your card details are correct</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-400">2.</span>
              <span>Ensure sufficient funds in your account</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-400">3.</span>
              <span>Try a different payment method (UPI, NetBanking, etc.)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-400">4.</span>
              <span>Contact your bank if using an international card</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-400">5.</span>
              <span>Reach out to our support team if issues persist</span>
            </li>
          </ol>
        </div>

        {/* Actions */}
        <div className="space-y-4">
          <button
            onClick={handleRetry}
            disabled={retrying}
            className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-primary text-primary-foreground font-header font-bold rounded hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <RotateCcw size={18} />
            {retrying ? 'Returning to Checkout...' : 'Try Payment Again'}
          </button>

          <Link
            href="/shop"
            className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-primary/10 border border-primary/30 text-primary font-header font-bold rounded hover:bg-primary/20 transition-all"
          >
            <Home size={18} />
            Continue Shopping
          </Link>

          <a
            href="mailto:support@joyjuncture.com"
            className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-secondary/10 border border-secondary/30 text-secondary font-header font-bold rounded hover:bg-secondary/20 transition-all"
          >
            <MessageSquare size={18} />
            Contact Support
          </a>
        </div>

        {/* Help Text */}
        <p className="text-xs text-muted-foreground text-center mt-8">
          Your cart and points are saved. You can retry anytime.
        </p>
      </div>
    </div>
  );
}
