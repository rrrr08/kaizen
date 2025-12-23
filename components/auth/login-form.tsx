"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Eye, EyeOff, Mail, Lock, Loader2 } from 'lucide-react';
import { signIn, signInWithGoogle, getUserProfile } from '@/lib/firebase';
import { useCart } from '@/app/context/CartContext';

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { mergeLocalCartWithFirebase } = useCart();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rememberMe, setRememberMe] = useState(false);

  // Get redirect URL from query params (default to home or checkout)
  const redirectUrl = searchParams.get('redirect') || '/';
  const hasCheckoutIntent = typeof window !== 'undefined' && sessionStorage.getItem('checkoutIntent') === 'true';

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const userCredential = await signIn(email, password);
      const user = userCredential.user;

      if (!user.emailVerified) {
        setError("Your email is not verified. Please check your inbox for a verification link or request a new one on the verification page.");
        router.push(`/verify?email=${user.email}&message=Please verify your email to log in.`);
        setLoading(false);
        return;
      }

      // Merge local cart with Firebase
      await mergeLocalCartWithFirebase();

      const profile = await getUserProfile(user.uid);

      if (!profile) {
        router.push("/");
        return;
      }

      // Check if user has completed onboarding
      if (!profile.onboardingCompleted && !profile.role) {
        router.push("/onboarding");
        return;
      }

      // Determine redirect destination
      let finalRedirect = redirectUrl;
      
      // If checkout intent is set, redirect to checkout
      if (hasCheckoutIntent) {
        finalRedirect = '/checkout';
      }
      
      // Clear checkout intent
      if (hasCheckoutIntent) {
        if (typeof window !== 'undefined') {
          sessionStorage.removeItem('checkoutIntent');
        }
      }

      // Redirect to determined URL
      router.push(finalRedirect);
    } catch (error) {
      const authError = error as { code?: string; message: string };

      if (authError.code === 'auth/user-not-found' || authError.code === 'auth/wrong-password') {
        setError('Invalid email or password');
      } else if (authError.code === 'auth/invalid-email') {
        setError('Invalid email format');
      } else if (authError.code === 'auth/too-many-requests') {
        setError('Too many unsuccessful login attempts. Please try again later.');
      } else if (authError.code === 'auth/user-disabled') {
        setError('This account has been disabled. Please contact support.');
      } else {
        setError(authError.message || "An error occurred during login");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);

    try {
      const userCredential = await signInWithGoogle();

      // If redirect is used instead of popup, the function returns null
      // The redirect will handle the auth automatically
      if (!userCredential) {
        // Redirect-based auth was initiated, page will redirect soon
        return;
      }

      if (userCredential) {
        // Merge local cart with Firebase
        await mergeLocalCartWithFirebase();

        const profile = await getUserProfile(userCredential.user.uid);

        if (!profile?.onboardingCompleted && !profile?.role) {
          router.push("/onboarding");
          return;
        }

        // Determine redirect destination
        let finalRedirect = redirectUrl;
        
        // If checkout intent is set, redirect to checkout
        if (hasCheckoutIntent) {
          finalRedirect = '/checkout';
        }
        
        // Clear checkout intent
        if (hasCheckoutIntent) {
          if (typeof window !== 'undefined') {
            sessionStorage.removeItem('checkoutIntent');
          }
        }

        // Redirect to determined URL
        router.push(finalRedirect);
      }
    } catch (error) {
      const authError = error as { code?: string; message: string };
      
      // Handle specific error codes
      if (authError.code === 'auth/popup-blocked') {
        setError('Opening Google Sign-In... Please complete the login in the new window/tab.');
      } else if (authError.code === 'auth/cancelled-popup-request') {
        setError('Google Sign-In was cancelled. Please try again.');
      } else if (authError.code === 'auth/popup-closed-by-user') {
        setError('You closed the sign-in popup. Please try again.');
      } else {
        setError(authError.message || "An error occurred with Google sign in");
      }
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-4 py-12">
      {/* Background Gradient */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-amber-500/5 rounded-full blur-[120px]"></div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-12">
          <Link href="/" className="inline-block font-header text-3xl tracking-[0.2em] hover:opacity-80 transition-opacity group mb-8">
            <span className="text-amber-500">JOY</span>
            <span className="text-white/40 ml-2">JUNCTURE</span>
          </Link>
          <h1 className="font-header text-[10px] tracking-[0.3em] text-amber-500 uppercase mb-2">WELCOME BACK</h1>
          <p className="font-serif italic text-white/40 text-sm">Enter the Lounge</p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 border border-red-500/40 bg-red-500/10 rounded-sm animate-in fade-in slide-in-from-top-4">
            <p className="font-serif text-sm text-red-400">{error}</p>
          </div>
        )}

        {/* Login Form Card */}
        <div className="border border-amber-500/20 bg-black/40 backdrop-blur-sm p-8 rounded-sm">
          <form onSubmit={handleLogin} className="space-y-6">
            {/* Email Field */}
            <div className="space-y-3">
              <label className="font-header text-[8px] tracking-[0.2em] text-amber-500/70 uppercase">
                Electronic Mail
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-500/40" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.email@example.com"
                  required
                  className="w-full bg-white/5 border border-amber-500/20 text-white placeholder:text-white/20 pl-10 pr-4 py-3 text-sm font-serif focus:border-amber-500/40 focus:bg-white/10 outline-none transition-all"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-3">
              <label className="font-header text-[8px] tracking-[0.2em] text-amber-500/70 uppercase">
                Passphrase
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-500/40" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full bg-white/5 border border-amber-500/20 text-white placeholder:text-white/20 pl-10 pr-10 py-3 text-sm font-serif focus:border-amber-500/40 focus:bg-white/10 outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-amber-500/40 hover:text-amber-500 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember & Forgot */}
            <div className="flex items-center justify-between text-[8px]">
              <label className="flex items-center gap-2 text-white/40 hover:text-amber-500/70 transition-colors cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 accent-amber-500"
                />
                <span className="font-header tracking-[0.1em]">REMEMBER ME</span>
              </label>
              <Link
                href="/auth/reset-password"
                className="font-header tracking-[0.1em] text-amber-500/70 hover:text-amber-500 transition-colors"
              >
                FORGOTTEN PASSPHRASE?
              </Link>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full border border-amber-500 bg-amber-500 text-black hover:bg-amber-400 disabled:opacity-50 disabled:cursor-wait py-3 font-header text-[8px] tracking-[0.4em] uppercase transition-all mt-8 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>PROCESSING...</span>
                </>
              ) : (
                'ENTER'
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="my-8 flex items-center gap-4">
            <div className="flex-1 h-px bg-gradient-to-r from-amber-500/0 to-amber-500/20"></div>
            <span className="font-header text-[7px] tracking-[0.2em] text-white/30 uppercase">OR</span>
            <div className="flex-1 h-px bg-gradient-to-l from-amber-500/0 to-amber-500/20"></div>
          </div>

          {/* Google Sign In */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full border border-amber-500/30 bg-white/5 hover:bg-white/10 disabled:opacity-50 disabled:cursor-wait py-3 font-header text-[8px] tracking-[0.3em] uppercase transition-all flex items-center justify-center gap-3"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path fill='#4285F4' d='M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z'/>
              <path fill='#34A853' d='M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z'/>
              <path fill='#FBBC05' d='M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z'/>
              <path fill='#EA4335' d='M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z'/>
            </svg>
            <span className="text-white/70">GOOGLE</span>
          </button>

          {/* Sign Up Link */}
          <div className="mt-8 text-center border-t border-amber-500/10 pt-8">
            <p className="font-serif italic text-white/40 text-sm mb-4">
              Art thou new to our halls?
            </p>
            <Link
              href="/auth/signup"
              className="inline-block font-header text-[8px] tracking-[0.2em] text-amber-500/70 hover:text-amber-500 uppercase border-b border-amber-500/0 hover:border-amber-500/40 transition-all pb-1"
            >
              ENTER THINE CREDENTIALS
            </Link>
          </div>

          {/* Terms */}
          <div className="mt-6 pt-6 border-t border-amber-500/10 text-center">
            <p className="font-serif italic text-white/30 text-xs leading-relaxed">
              By entering, thou agreest to our{" "}
              <Link href="/terms" className="text-amber-500/70 hover:text-amber-500 transition-colors">
                Terms
              </Link>
              {" "}and{" "}
              <Link href="/privacy" className="text-amber-500/70 hover:text-amber-500 transition-colors">
                Privacy
              </Link>
              .
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}