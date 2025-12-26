"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Eye, EyeOff, Mail, Lock, User, Loader2, ArrowRight } from 'lucide-react';
import { USER_ROLES } from '@/lib/roles';
import { useCart } from '@/app/context/CartContext';

export function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { mergeLocalCartWithFirebase } = useCart();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get redirect URL from query params (default to home or checkout)
  const redirectUrl = searchParams.get('redirect') || '/';
  const hasCheckoutIntent = typeof window !== 'undefined' && sessionStorage.getItem('checkoutIntent') === 'true';

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Validate passwords match
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    // Validate password length
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      setLoading(false);
      return;
    }

    try {
      // Lazy load Firebase
      const { createUser, auth } = await import('@/lib/firebase');
      const { sendEmailVerification } = await import('firebase/auth');

      // Create user in Firebase
      await createUser(email, password, {
        email: email,
        first_name: firstName,
        last_name: lastName,
        name: `${firstName} ${lastName}`.trim(),
        role: USER_ROLES.MEMBER,
        balance: 0,
        xp: 0,
      });

      // Merge local cart with Firebase after signup
      await mergeLocalCartWithFirebase();

      // Send verification email
      if (auth && auth.currentUser) {
        const actionUrl = `${window.location.origin}/auth/action`;

        const actionCodeSettings = {
          url: actionUrl,
          handleCodeInApp: true,
        };

        await sendEmailVerification(auth.currentUser, actionCodeSettings);

        // Determine redirect after email verification
        let finalRedirect = redirectUrl;
        if (hasCheckoutIntent) {
          finalRedirect = '/checkout';
        }

        // Clear checkout intent
        if (hasCheckoutIntent) {
          if (typeof window !== 'undefined') {
            sessionStorage.removeItem('checkoutIntent');
          }
        }

        router.push(`/auth/verify?email=${email}&redirect=${encodeURIComponent(finalRedirect)}`);
      } else {
        setError("Signup was successful, but couldn't send verification email. Please try logging in.");
      }
    } catch (error: any) {
      if (error.code === 'auth/email-already-in-use') {
        setError("This email is already registered. Please try logging in instead.");
      } else if (error.code === 'auth/invalid-email') {
        setError("Invalid email format.");
      } else if (error.code === 'auth/weak-password') {
        setError("Password is too weak.");
      } else {
        setError(error.message || "An error occurred during signup");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setLoading(true);
    setError(null);

    try {
      const { signInWithGoogle } = await import('@/lib/firebase');
      const userCredential = await signInWithGoogle();

      if (userCredential) {
        await mergeLocalCartWithFirebase();

        let finalRedirect = redirectUrl;
        if (hasCheckoutIntent) {
          finalRedirect = '/checkout';
        }

        if (hasCheckoutIntent) {
          if (typeof window !== 'undefined') {
            sessionStorage.removeItem('checkoutIntent');
          }
        }

        router.push(finalRedirect);
      }
    } catch (error: any) {
      setError(error.message || "Google sign in failed");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFFDF5] text-[#2D3436] flex items-center justify-center px-4 py-12">
      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-12">
          <Link href="/" className="inline-block flex justify-center mb-6 hover:scale-105 transition-transform">
            <div className="bg-[#FFD93D] p-3 border-2 border-black rounded-[15px] neo-shadow">
              <span className="text-2xl font-black text-black">JJ</span>
            </div>
          </Link>
          <h1 className="font-header text-4xl font-black text-black mb-2 uppercase tracking-tight">Join The Guild</h1>
          <p className="font-sans font-bold text-black/60 text-sm">Start your adventure</p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 border-2 border-black bg-[#FF7675] rounded-[15px] neo-shadow animate-in fade-in slide-in-from-top-4">
            <p className="font-black text-sm text-black uppercase tracking-wide flex items-center gap-2">
              <span>⚠️</span> {error}
            </p>
          </div>
        )}

        {/* Signup Form Card */}
        <div className="border-2 border-black bg-white p-6 md:p-8 rounded-[25px] neo-shadow">
          <form onSubmit={handleSignup} className="space-y-4">
            {/* Name Fields */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="font-black text-xs tracking-widest text-black uppercase ml-1">
                  First Name
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-black" />
                  <input
                    type="text"
                    placeholder="First"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                    className="w-full bg-[#FFFDF5] border-2 border-black rounded-[12px] text-black placeholder:text-black/30 pl-10 pr-2 py-3 text-sm font-bold focus:bg-[#FFD93D]/20 focus:outline-none transition-all shadow-[2px_2px_0px_#000]"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="font-black text-xs tracking-widest text-black uppercase ml-1">
                  Last Name
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-black" />
                  <input
                    type="text"
                    placeholder="Last"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                    className="w-full bg-[#FFFDF5] border-2 border-black rounded-[12px] text-black placeholder:text-black/30 pl-10 pr-2 py-3 text-sm font-bold focus:bg-[#FFD93D]/20 focus:outline-none transition-all shadow-[2px_2px_0px_#000]"
                  />
                </div>
              </div>
            </div>

            {/* Email Field */}
            <div className="space-y-2">
              <label className="font-black text-xs tracking-widest text-black uppercase ml-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-black" />
                <input
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full bg-[#FFFDF5] border-2 border-black rounded-[12px] text-black placeholder:text-black/30 pl-12 pr-4 py-4 text-sm font-bold focus:bg-[#FFD93D]/20 focus:outline-none transition-all shadow-[2px_2px_0px_#000]"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label className="font-black text-xs tracking-widest text-black uppercase ml-1">
                Create Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-black" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="At least 6 chars"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full bg-[#FFFDF5] border-2 border-black rounded-[12px] text-black placeholder:text-black/30 pl-12 pr-12 py-4 text-sm font-bold focus:bg-[#FFD93D]/20 focus:outline-none transition-all shadow-[2px_2px_0px_#000]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-black/50 hover:text-black transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Confirm Password Field */}
            <div className="space-y-2">
              <label className="font-black text-xs tracking-widest text-black uppercase ml-1">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-black" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Repeat password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full bg-[#FFFDF5] border-2 border-black rounded-[12px] text-black placeholder:text-black/30 pl-12 pr-12 py-4 text-sm font-bold focus:bg-[#FFD93D]/20 focus:outline-none transition-all shadow-[2px_2px_0px_#000]"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-black/50 hover:text-black transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full border-2 border-black bg-[#00B894] text-white hover:bg-[#00a383] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_#000] active:translate-y-[2px] active:shadow-[2px_2px_0px_#000] py-4 rounded-[15px] font-black text-sm tracking-[0.2em] uppercase transition-all mt-6 flex items-center justify-center gap-3 neo-shadow"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>CREATING...</span>
                </>
              ) : (
                <>
                  <span>CREATE ACCOUNT</span>
                  <ArrowRight size={18} strokeWidth={3} />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center gap-4">
            <div className="flex-1 h-[2px] bg-black/10"></div>
            <span className="font-black text-xs tracking-widest text-black/40 uppercase">OR</span>
            <div className="flex-1 h-[2px] bg-black/10"></div>
          </div>

          {/* Google Sign Up */}
          <button
            type="button"
            onClick={handleGoogleSignup}
            disabled={loading}
            className="w-full border-2 border-black bg-white text-black hover:bg-gray-50 py-4 rounded-[15px] font-black text-xs tracking-[0.2em] uppercase transition-all flex items-center justify-center gap-3 neo-shadow hover:translate-y-[-2px]"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path fill='#4285F4' d='M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z' />
              <path fill='#34A853' d='M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z' />
              <path fill='#FBBC05' d='M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z' />
              <path fill='#EA4335' d='M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z' />
            </svg>
            <span>SIGN UP WITH GOOGLE</span>
          </button>

          {/* Sign In Link */}
          <div className="mt-8 text-center bg-[#FFD93D]/10 rounded-xl p-4 border-2 border-black/5">
            <p className="font-bold text-black/60 text-xs mb-2">
              Already have an account?
            </p>
            <Link
              href="/auth/login"
              className="inline-block font-black text-xs tracking-[0.2em] text-[#6C5CE7] hover:text-black uppercase border-b-2 border-[#6C5CE7] hover:border-black transition-all pb-1"
            >
              LOG IN HERE
            </Link>
          </div>

          {/* Terms */}
          <div className="mt-6 text-center">
            <p className="text-[10px] text-black/40 font-bold uppercase tracking-wide">
              By joining, you agree to our{" "}
              <Link href="/terms" className="text-black underline">Terms</Link> &{" "}
              <Link href="/privacy" className="text-black underline">Privacy</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
