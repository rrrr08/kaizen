"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Eye, EyeOff, Mail, Lock, User, Loader2 } from 'lucide-react';
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

        console.log('Sending verification email with action URL:', actionUrl);
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
        console.error("Signup successful, but auth.currentUser is null before sending verification email.");
        setError("Signup was successful, but couldn't send verification email. Please try logging in.");
      }
    } catch (error) {
      console.error("Signup error:", error);
      const authError = error as { code?: string; message: string };

      if (authError.code === 'auth/email-already-in-use') {
        setError("This email is already registered. Please try logging in instead.");
      } else if (authError.code === 'auth/invalid-email') {
        setError("Invalid email format. Please check your email and try again.");
      } else if (authError.code === 'auth/weak-password') {
        setError("Password is too weak. Please choose a stronger password.");
      } else if (authError.code === 'auth/network-request-failed') {
        setError("Network error. Please check your internet connection and try again.");
      } else if (authError.code === 'unavailable' || authError.message?.toLowerCase().includes('offline')) {
        setError("Unable to connect to the database. Please check your internet connection, firewall, or ensure the Firestore database exists in the Firebase Console.");
      } else {
        setError(authError.message || "An error occurred during signup");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setLoading(true);
    setError(null);

    try {
      // Lazy load Firebase
      const { signInWithGoogle } = await import('@/lib/firebase');

      const userCredential = await signInWithGoogle();

      // If redirect is used instead of popup, the function returns null
      // The redirect will handle the auth automatically
      if (!userCredential) {
        // Redirect-based auth was initiated, page will redirect soon
        return;
      }

      if (userCredential) {
        // Merge local cart with Firebase after Google signup
        await mergeLocalCartWithFirebase();

        // Determine redirect destination
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

        // Redirect to determined URL
        router.push(finalRedirect);
      }
    } catch (error) {
      console.error("Google sign in error:", error);
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
          <h1 className="font-header text-[10px] tracking-[0.3em] text-amber-500 uppercase mb-2">JOIN THE GUILD</h1>
          <p className="font-serif italic text-white/40 text-sm">Create your membership</p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 border border-red-500/40 bg-red-500/10 rounded-sm animate-in fade-in slide-in-from-top-4">
            <p className="font-serif text-sm text-red-400">{error}</p>
          </div>
        )}

        {/* Signup Form Card */}
        <div className="border border-amber-500/20 bg-black/40 backdrop-blur-sm p-8 rounded-sm">
          <form onSubmit={handleSignup} className="space-y-4">
            {/* Name Fields */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-3">
                <label className="font-header text-[8px] tracking-[0.2em] text-amber-500/70 uppercase">
                  Forename
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-500/40" />
                  <input
                    type="text"
                    placeholder="Your first name"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                    className="w-full bg-white/5 border border-amber-500/20 text-white placeholder:text-white/20 pl-10 pr-4 py-3 text-sm font-serif focus:border-amber-500/40 focus:bg-white/10 outline-none transition-all"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="font-header text-[8px] tracking-[0.2em] text-amber-500/70 uppercase">
                  Surname
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-500/40" />
                  <input
                    type="text"
                    placeholder="Your last name"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                    className="w-full bg-white/5 border border-amber-500/20 text-white placeholder:text-white/20 pl-10 pr-4 py-3 text-sm font-serif focus:border-amber-500/40 focus:bg-white/10 outline-none transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Email Field */}
            <div className="space-y-3">
              <label className="font-header text-[8px] tracking-[0.2em] text-amber-500/70 uppercase">
                Electronic Mail
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-500/40" />
                <input
                  type="email"
                  placeholder="your.email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
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
                  minLength={6}
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

            {/* Confirm Password Field */}
            <div className="space-y-3">
              <label className="font-header text-[8px] tracking-[0.2em] text-amber-500/70 uppercase">
                Confirm Passphrase
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-500/40" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full bg-white/5 border border-amber-500/20 text-white placeholder:text-white/20 pl-10 pr-10 py-3 text-sm font-serif focus:border-amber-500/40 focus:bg-white/10 outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-amber-500/40 hover:text-amber-500 transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
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
                'CREATE MEMBERSHIP'
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="my-8 flex items-center gap-4">
            <div className="flex-1 h-px bg-gradient-to-r from-amber-500/0 to-amber-500/20"></div>
            <span className="font-header text-[7px] tracking-[0.2em] text-white/30 uppercase">OR</span>
            <div className="flex-1 h-px bg-gradient-to-l from-amber-500/0 to-amber-500/20"></div>
          </div>

          {/* Google Sign Up */}
          <button
            type="button"
            onClick={handleGoogleSignup}
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

          {/* Sign In Link */}
          <div className="mt-8 text-center border-t border-amber-500/10 pt-8">
            <p className="font-serif italic text-white/40 text-sm mb-4">
              Already a member?
            </p>
            <Link
              href="/auth/login"
              className="inline-block font-header text-[8px] tracking-[0.2em] text-amber-500/70 hover:text-amber-500 uppercase border-b border-amber-500/0 hover:border-amber-500/40 transition-all pb-1"
            >
              ENTER THY CREDENTIALS
            </Link>
          </div>

          {/* Terms */}
          <div className="mt-6 pt-6 border-t border-amber-500/10 text-center">
            <p className="font-serif italic text-white/30 text-xs leading-relaxed">
              By joining, thou agreest to our{" "}
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
