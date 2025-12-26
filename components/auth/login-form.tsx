'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Eye, EyeOff, Mail, Lock, Loader2, ArrowRight } from 'lucide-react';
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
      // Lazy load Firebase
      const { signIn, getUserProfile } = await import('@/lib/firebase');

      const userCredential = await signIn(email, password);
      const user = userCredential.user;

      if (!user.emailVerified) {
        setError("Your email is not verified. Please check your inbox for a verification link.");
        router.push(`/verify?email=${user.email}&message=Please verify your email to log in.`);
        setLoading(false);
        return;
      }

      // Merge local cart with Firebase
      await mergeLocalCartWithFirebase();

      const profile = await getUserProfile(user.uid);

      // Determine redirect destination
      let finalRedirect = redirectUrl;

      // If checkout intent is set AND no explicit redirect URL, redirect to checkout
      if (hasCheckoutIntent && redirectUrl === '/') {
        finalRedirect = '/checkout';
      }

      // Clear checkout intent
      if (hasCheckoutIntent) {
        if (typeof window !== 'undefined') {
          sessionStorage.removeItem('checkoutIntent');
        }
      }

      if (!profile) {
        router.push(finalRedirect);
        return;
      }

      // Check if user has completed onboarding
      if (!profile.onboardingCompleted && !profile.role) {
        router.push("/onboarding");
        return;
      }

      // Redirect to determined URL
      router.push(finalRedirect);
    } catch (error: any) {
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        setError('Invalid email or password');
      } else {
        setError(error.message || "An error occurred during login");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);

    try {
      const { signInWithGoogle, getUserProfile } = await import('@/lib/firebase');
      const userCredential = await signInWithGoogle();

      if (userCredential) {
        await mergeLocalCartWithFirebase();
        const profile = await getUserProfile(userCredential.user.uid);

        let finalRedirect = redirectUrl;
        if (hasCheckoutIntent && redirectUrl === '/') {
          finalRedirect = '/checkout';
        }

        if (hasCheckoutIntent && typeof window !== 'undefined') {
          sessionStorage.removeItem('checkoutIntent');
        }

        if (!profile?.onboardingCompleted && !profile?.role) {
          router.push("/onboarding");
          return;
        }

        router.push(finalRedirect);
      }
    } catch (error: any) {
      setError(error.message || "Google sign in failed");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-4 py-12 selection:bg-[#FFD400] selection:text-black">
      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-12">
          <Link href="/" className="inline-block flex justify-center mb-6 hover:scale-105 transition-transform">
            <div className="bg-[#1A1A1A] p-3 border border-[#FFD400] rounded-sm shadow-[0_0_10px_#FFD400]">
              <span className="text-2xl font-arcade text-[#FFD400]">JJ</span>
            </div>
          </Link>
          <h1 className="font-arcade text-4xl text-white mb-2 uppercase tracking-tight text-shadow-glow">ACCESS_PORTAL</h1>
          <p className="font-mono text-gray-400 text-xs">INITIATE_LOGIN_SEQUENCE</p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 border border-[#FF003C] bg-[#FF003C]/10 rounded-sm relative overflow-hidden animate-in fade-in slide-in-from-top-4">
            <div className="absolute inset-0 bg-[#FF003C]/5 animate-pulse"></div>
            <p className="font-mono text-xs text-[#FF003C] uppercase tracking-wide flex items-center gap-2 relative z-10">
              <span>⚠️</span> {error}
            </p>
          </div>
        )}

        {/* Login Form Card */}
        <div className="border border-[#333] bg-[#080808] p-8 rounded-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#FFD400]/5 blur-[50px] transition-opacity"></div>

          <form onSubmit={handleLogin} className="space-y-6 relative z-10">
            {/* Email Field */}
            <div className="space-y-2">
              <label className="font-mono text-[10px] tracking-widest text-[#FFD400] uppercase ml-1">
                IDENTITY_STRING (EMAIL)
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  required
                  className="w-full bg-[#111] border border-[#333] rounded-sm text-white placeholder:text-gray-600 pl-12 pr-4 py-4 text-sm font-mono focus:border-[#FFD400] focus:bg-[#1A1A1A] focus:outline-none transition-all shadow-inner"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label className="font-mono text-[10px] tracking-widest text-[#FFD400] uppercase ml-1">
                ACCESS_CODE (PASSWORD)
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full bg-[#111] border border-[#333] rounded-sm text-white placeholder:text-gray-600 pl-12 pr-12 py-4 text-sm font-mono focus:border-[#FFD400] focus:bg-[#1A1A1A] focus:outline-none transition-all shadow-inner"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember & Forgot */}
            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center gap-2 text-gray-400 cursor-pointer group hover:text-white transition-colors">
                <div className={`w-4 h-4 border border-[#333] rounded-sm flex items-center justify-center transition-colors ${rememberMe ? 'bg-[#FFD400] border-[#FFD400]' : 'bg-[#111]'}`}>
                  {rememberMe && <span className="text-black text-[10px] leading-none">✓</span>}
                </div>
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="hidden"
                />
                <span className="font-mono text-[10px] uppercase tracking-wider">Maintain Session</span>
              </label>
              <Link
                href="/auth/reset-password"
                className="font-mono text-[10px] tracking-wide text-gray-500 hover:text-[#FF7675] transition-colors uppercase border-b border-transparent hover:border-[#FF7675]"
              >
                LOST_ACCESS_CODE?
              </Link>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full border border-[#FFD400] bg-[#FFD400]/10 text-[#FFD400] hover:bg-[#FFD400] hover:text-black py-4 rounded-sm font-arcade text-xs tracking-[0.2em] uppercase transition-all mt-8 flex items-center justify-center gap-3 shadow-[0_0_10px_rgba(255,212,0,0.1)] hover:shadow-[0_0_20px_#FFD400]"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>AUTHENTICATING...</span>
                </>
              ) : (
                <>
                  <span>ENTER_SYSTEM</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="my-8 flex items-center gap-4">
            <div className="flex-1 h-[1px] bg-[#333]"></div>
            <span className="font-mono text-[10px] tracking-widest text-gray-600 uppercase">OR_AUTHENTICATE_WITH</span>
            <div className="flex-1 h-[1px] bg-[#333]"></div>
          </div>

          {/* Google Sign In */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full border border-[#333] bg-[#111] text-white hover:bg-[#222] hover:border-gray-500 py-4 rounded-sm font-mono text-[10px] tracking-[0.1em] uppercase transition-all flex items-center justify-center gap-3"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path fill='#4285F4' d='M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z' />
              <path fill='#34A853' d='M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z' />
              <path fill='#FBBC05' d='M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z' />
              <path fill='#EA4335' d='M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z' />
            </svg>
            <span>GOOGLE_PROVIDER</span>
          </button>

          {/* Sign Up Link */}
          <div className="mt-8 text-center bg-[#1A1A1A] rounded-sm p-4 border border-[#333]">
            <p className="font-mono text-gray-500 text-[10px] mb-2 uppercase">
              NEW_USER_DETECTED?
            </p>
            <Link
              href="/auth/signup"
              className="inline-block font-arcade text-xs tracking-[0.2em] text-[#00B894] hover:text-white uppercase border-b border-[#00B894] hover:border-white transition-all pb-1 hover:animate-pulse"
            >
              INITIALIZE_REGISTRATION
            </Link>
          </div>

          {/* Terms */}
          <div className="mt-6 text-center">
            <p className="text-[10px] text-gray-600 font-mono uppercase tracking-wide">
              SYSTEM_ACCESS_SUBJECT_TO{" "}
              <Link href="/terms" className="text-gray-400 hover:text-white underline decoration-gray-600 underline-offset-2">PROTOCOLS</Link> &{" "}
              <Link href="/privacy" className="text-gray-400 hover:text-white underline decoration-gray-600 underline-offset-2">DATA_POLICY</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}