"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Eye, EyeOff, Mail, Lock, Loader2, ArrowRight, AlertTriangle, Check } from 'lucide-react';
import { useCart } from '@/app/context/CartContext';
import Logo from '@/components/ui/Logo';

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
    <div className="min-h-screen bg-[#FFFDF5] text-[#2D3436] flex items-center justify-center px-4 pt-32 pb-12">
      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <Logo size="large" linkTo="/" />
          </div>
          <h1 className="font-header text-4xl font-black text-black mb-2 uppercase tracking-tight">Access Portal</h1>
          <p className="font-sans font-bold text-black/60 text-sm">Enter the Loop</p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 border-2 border-black bg-[#FF7675] rounded-[15px] neo-shadow animate-in fade-in slide-in-from-top-4">
            <p className="font-black text-sm text-black uppercase tracking-wide flex items-center gap-2">
              <AlertTriangle size={16} /> {error}
            </p>
          </div>
        )}

        {/* Login Form Card */}
        <div className="border-2 border-black bg-white p-8 rounded-[25px] neo-shadow">
          <form onSubmit={handleLogin} className="space-y-6">
            {/* Email Field */}
            <div className="space-y-2">
              <label className="font-black text-xs tracking-widest text-black uppercase ml-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-black" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  required
                  className="w-full bg-[#FFFDF5] border-2 border-black rounded-[12px] text-black placeholder:text-black/30 pl-12 pr-4 py-4 text-sm font-bold focus:bg-[#FFD93D]/20 focus:outline-none transition-all shadow-[2px_2px_0px_#000]"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label className="font-black text-xs tracking-widest text-black uppercase ml-1">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-black" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
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

            {/* Remember & Forgot */}
            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center gap-2 text-black font-bold cursor-pointer group">
                <div className={`w-5 h-5 border-2 border-black rounded flex items-center justify-center transition-colors ${rememberMe ? 'bg-[#00B894]' : 'bg-white'}`}>
                  {rememberMe && <Check size={14} className="text-black" strokeWidth={3} />}
                </div>
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="hidden"
                />
                <span className="group-hover:text-[#6C5CE7] transition-colors">REMEMBER ME</span>
              </label>
              <Link
                href="/auth/reset-password"
                className="font-black tracking-wide text-black/60 hover:text-[#FF7675] transition-colors uppercase border-b-2 border-transparent hover:border-[#FF7675]"
              >
                FORGOT?
              </Link>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full border-2 border-black bg-[#6C5CE7] text-white hover:bg-[#5a4bd1] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_#000] active:translate-y-[2px] active:shadow-[2px_2px_0px_#000] py-4 rounded-[15px] font-black text-sm tracking-[0.2em] uppercase transition-all mt-8 flex items-center justify-center gap-3 neo-shadow"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>PROCESSING...</span>
                </>
              ) : (
                <>
                  <span>ENTER THE WORLD</span>
                  <ArrowRight size={18} strokeWidth={3} />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="my-8 flex items-center gap-4">
            <div className="flex-1 h-[2px] bg-black/10"></div>
            <span className="font-black text-xs tracking-widest text-black/40 uppercase">OR</span>
            <div className="flex-1 h-[2px] bg-black/10"></div>
          </div>

          {/* Google Sign In */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full border-2 border-black bg-white text-black hover:bg-gray-50 py-4 rounded-[15px] font-black text-xs tracking-[0.2em] uppercase transition-all flex items-center justify-center gap-3 neo-shadow hover:translate-y-[-2px]"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path fill='#4285F4' d='M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z' />
              <path fill='#34A853' d='M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z' />
              <path fill='#FBBC05' d='M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z' />
              <path fill='#EA4335' d='M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z' />
            </svg>
            <span>CONTINUE WITH GOOGLE</span>
          </button>

          {/* Sign Up Link */}
          <div className="mt-8 text-center bg-[#FFD93D]/10 rounded-xl p-4 border-2 border-black/5">
            <p className="font-bold text-black/60 text-xs mb-2">
              New to Joy Juncture?
            </p>
            <Link
              href="/auth/signup"
              className="inline-block font-black text-xs tracking-[0.2em] text-[#6C5CE7] hover:text-black uppercase border-b-2 border-[#6C5CE7] hover:border-black transition-all pb-1"
            >
              CREATE AN ACCOUNT
            </Link>
          </div>

          {/* Terms */}
          <div className="mt-6 text-center">
            <p className="text-[10px] text-black/40 font-bold uppercase tracking-wide">
              By entering, you agree to our{" "}
              <Link href="/terms" className="text-black underline">Terms</Link> &{" "}
              <Link href="/privacy" className="text-black underline">Privacy</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}