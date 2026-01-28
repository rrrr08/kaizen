'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import JoyPhoneInput from '@/components/ui/JoyPhoneInput';
import { useToast } from '@/hooks/use-toast';
import { Shield, Send, Check, Phone } from 'lucide-react';
import { auth } from '@/lib/firebase';

interface PhoneVerificationProps {
  currentPhone?: string;
  isVerified?: boolean;
  onVerified?: (phoneNumber: string) => void;
}

export default function PhoneVerification({
  currentPhone,
  isVerified,
  onVerified
}: PhoneVerificationProps) {
  const { addToast } = useToast();
  const [phoneNumber, setPhoneNumber] = useState(currentPhone || '');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);



  const handlePhoneChange = (value: string) => {
    setPhoneNumber(value);
  };

  const handleSendOTP = async () => {
    if (!phoneNumber || phoneNumber.length < 10) {
      addToast({
        title: 'Invalid Phone Number',
        description: 'Please enter a valid phone number with country code (e.g., +1234567890)',
      });
      return;
    }

    setLoading(true);

    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error('Not authenticated');
      }

      const token = await currentUser.getIdToken();

      const response = await fetch('/api/user/phone/send-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ phoneNumber })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send OTP');
      }

      addToast({
        title: 'OTP Sent!',
        description: 'Check your phone for the verification code',
      });

      setStep('otp');
      setCountdown(60); // 60 second cooldown

      // Start countdown timer
      const interval = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

    } catch (error: any) {
      console.error('Error sending OTP:', error);
      addToast({
        title: 'Error',
        description: error.message || 'Failed to send OTP',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (otp.length !== 6) {
      addToast({
        title: 'Invalid OTP',
        description: 'Please enter the 6-digit code',
      });
      return;
    }

    setLoading(true);

    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error('Not authenticated');
      }

      const token = await currentUser.getIdToken();

      const response = await fetch('/api/user/phone/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ phoneNumber, otp })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Invalid OTP');
      }

      addToast({
        title: 'Success!',
        description: 'Phone number verified successfully',
      });

      // Don't reset step - parent component will re-render with isVerified=true
      setOtp('');
      onVerified?.(phoneNumber); // Pass phone number to parent

    } catch (error: any) {
      console.error('Error verifying OTP:', error);
      addToast({
        title: 'Verification Failed',
        description: error.message || 'Invalid OTP code',
      });
    } finally {
      setLoading(false);
    }
  };

  if (isVerified) {
    return (
      <div className="p-6 bg-[#DDFFF7] border-2 border-black rounded-xl shadow-[4px_4px_0px_#000]">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-lg bg-[#00B894] border-2 border-black flex items-center justify-center shadow-[2px_2px_0px_#000]">
            <Check className="w-5 h-5 text-white" strokeWidth={3} />
          </div>
          <div>
            <p className="font-black text-lg uppercase text-black">Phone Verified</p>
            <p className="text-sm font-bold text-black/60">{currentPhone}</p>
          </div>
        </div>
        <p className="text-xs font-bold text-black/50 uppercase tracking-wider">
          ✓ Your phone number is verified and can receive SMS notifications
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-[#FFFDF5] border-2 border-black rounded-xl shadow-[4px_4px_0px_#000]">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-[#FF7675] border-2 border-black flex items-center justify-center shadow-[2px_2px_0px_#000]">
          <Shield className="w-5 h-5 text-white" strokeWidth={3} />
        </div>
        <div>
          <p className="font-black text-lg uppercase text-black">Verify Phone Number</p>
          <p className="text-xs font-bold text-black/50 uppercase tracking-wider">
            Required to receive SMS notifications
          </p>
        </div>
      </div>

      {step === 'phone' ? (
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-black mb-2">
              Phone Number
            </label>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <JoyPhoneInput
                  value={phoneNumber}
                  onChange={handlePhoneChange}
                  disabled={loading}
                />
              </div>
              <Button
                onClick={handleSendOTP}
                disabled={loading || !phoneNumber || countdown > 0}
                className="px-6 py-6 bg-[#6C5CE7] text-white font-black uppercase tracking-widest rounded-xl border-2 border-black shadow-[4px_4px_0px_#000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 w-full sm:w-auto"
              >
                {loading ? (
                  'Sending...'
                ) : countdown > 0 ? (
                  `Wait ${countdown}s`
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Send OTP
                  </>
                )}
              </Button>
            </div>
            <p className="text-xs text-black/40 font-bold mt-2 uppercase tracking-wide">
              Format: +[country code][number] (e.g., +1234567890)
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-black mb-2">
              Enter Verification Code
            </label>
            <p className="text-sm font-bold text-black/60 mb-3">
              We sent a 6-digit code to {phoneNumber}
            </p>
            <div className="flex gap-3">
              <Input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="000000"
                maxLength={6}
                className="flex-1 bg-white border-2 border-black rounded-xl px-4 py-6 text-center text-2xl font-black tracking-widest focus:outline-none focus:shadow-[2px_2px_0px_#000] transition-all"
                disabled={loading}
              />
              <Button
                onClick={handleVerifyOTP}
                disabled={loading || otp.length !== 6}
                className="px-6 py-6 bg-[#00B894] text-white font-black uppercase tracking-widest rounded-xl border-2 border-black shadow-[4px_4px_0px_#000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
              >
                {loading ? (
                  'Verifying...'
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    Verify
                  </>
                )}
              </Button>
            </div>
            <div className="flex items-center justify-between mt-3">
              <button
                onClick={() => {
                  setStep('phone');
                  setOtp('');
                }}
                className="text-xs font-bold text-[#6C5CE7] uppercase tracking-wider hover:underline"
                disabled={loading}
              >
                ← Change Number
              </button>
              {countdown === 0 && (
                <button
                  onClick={handleSendOTP}
                  className="text-xs font-bold text-[#6C5CE7] uppercase tracking-wider hover:underline"
                  disabled={loading}
                >
                  Resend Code →
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
