"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { Loader2, Mail, ArrowLeft, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const dynamic = 'force-dynamic';

function ResetPasswordPageContent() {
    const [email, setEmail] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<boolean>(false);

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            // Lazy load Firebase
            const { auth } = await import('@/lib/firebase');
            const { sendPasswordResetEmail } = await import('firebase/auth');

            await sendPasswordResetEmail(auth, email, {
                url: `${window.location.origin}/auth/action`,
                handleCodeInApp: true,
            });

            setSuccess(true);
        } catch (error: any) {
            const authError = error;

            if (authError.code === 'auth/user-not-found') {
                setError('No account found with this email address');
            } else if (authError.code === 'auth/invalid-email') {
                setError('Invalid email format');
            } else if (authError.code === 'auth/too-many-requests') {
                setError('Too many requests. Please try again later.');
            } else {
                setError(authError.message || "An error occurred while sending reset email");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#FFFDF5] text-[#2D3436] flex items-center justify-center px-4 pt-32 pb-12">
            <div className="relative z-10 w-full max-w-md">

                {/* Logo */}
                <div className="text-center mb-12">
                    <Link href="/" className="inline-block flex justify-center mb-6 hover:scale-105 transition-transform">
                        <div className="bg-[#FFD93D] p-3 border-2 border-black rounded-[15px] neo-shadow">
                            <span className="text-2xl font-black text-black">JJ</span>
                        </div>
                    </Link>
                    <h1 className="font-header text-4xl font-black text-black mb-2 uppercase tracking-tight">
                        {success ? 'Check Email' : 'Reset Access'}
                    </h1>
                    <p className="font-sans font-bold text-black/60 text-sm">
                        {success ? 'Recovery link sent' : 'Recover your account'}
                    </p>
                </div>

                {/* Main Card */}
                <div className="border-2 border-black bg-white p-8 rounded-[25px] neo-shadow">

                    {/* Back Link */}
                    <div className="mb-6">
                        <Link
                            href="/auth/login"
                            className="inline-flex items-center gap-2 font-black text-xs tracking-widest text-black/40 hover:text-black uppercase transition-colors"
                        >
                            <ArrowLeft className="h-3 w-3" strokeWidth={3} />
                            Back to Login
                        </Link>
                    </div>

                    {success ? (
                        <div className="text-center space-y-6">
                            <div className="flex justify-center">
                                <div className="w-16 h-16 bg-[#00B894] rounded-full border-2 border-black flex items-center justify-center neo-shadow">
                                    <CheckCircle className="h-8 w-8 text-white" strokeWidth={3} />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <p className="font-bold text-black/70 text-sm">
                                    We&apos;ve sent a password reset link to <span className="text-black">{email}</span>. Please check your inbox (and spam folder).
                                </p>

                                <button
                                    onClick={() => {
                                        setSuccess(false);
                                        setEmail('');
                                    }}
                                    className="w-full border-2 border-black bg-[#FFD93D] text-black hover:bg-[#ffcf0d] hover:translate-y-[-2px] hover:shadow-[4px_4px_0px_#000] active:translate-y-[2px] active:shadow-[1px_1px_0px_#000] py-3 rounded-[12px] font-black text-xs tracking-[0.2em] uppercase transition-all flex items-center justify-center gap-2 neo-shadow"
                                >
                                    Try Another Email
                                </button>
                            </div>
                        </div>
                    ) : (
                        <>
                            {error && (
                                <div className="mb-6 p-4 border-2 border-black bg-[#FF7675] rounded-[15px] neo-shadow animate-in fade-in slide-in-from-top-2">
                                    <p className="font-black text-xs text-black uppercase tracking-wide flex items-center gap-2">
                                        <span className="text-lg">⚠️</span> {error}
                                    </p>
                                </div>
                            )}

                            <form onSubmit={handleResetPassword} className="space-y-6">
                                <div className="space-y-2">
                                    <label htmlFor="email" className="font-black text-xs tracking-widest text-black uppercase ml-1">
                                        Email Address
                                    </label>
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-black" />
                                        <input
                                            id="email"
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="w-full bg-[#FFFDF5] border-2 border-black rounded-[12px] text-black placeholder:text-black/30 pl-12 pr-4 py-4 text-sm font-bold focus:bg-[#FFD93D]/20 focus:outline-none transition-all shadow-[2px_2px_0px_#000]"
                                            placeholder="name@example.com"
                                            required
                                            autoComplete="email"
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full border-2 border-black bg-[#6C5CE7] text-white hover:bg-[#5a4bd1] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_#000] active:translate-y-[2px] active:shadow-[2px_2px_0px_#000] py-4 rounded-[15px] font-black text-sm tracking-[0.2em] uppercase transition-all flex items-center justify-center gap-3 neo-shadow"
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="h-5 w-5 animate-spin" />
                                            <span>SENDING...</span>
                                        </>
                                    ) : (
                                        'SEND RESET LINK'
                                    )}
                                </button>
                            </form>
                        </>
                    )}

                    {/* Sign Up Link */}
                    <div className="mt-8 text-center bg-[#FFD93D]/10 rounded-xl p-4 border-2 border-black/5">
                        <p className="font-bold text-black/60 text-xs mb-2">
                            Don&apos;t have an account?
                        </p>
                        <Link
                            href="/auth/signup"
                            className="inline-block font-black text-xs tracking-[0.2em] text-[#6C5CE7] hover:text-black uppercase border-b-2 border-[#6C5CE7] hover:border-black transition-all pb-1"
                        >
                            CREATE ACCOUNT
                        </Link>
                    </div>

                    {/* Terms */}
                    <div className="mt-6 text-center">
                        <p className="text-[10px] text-black/40 font-bold uppercase tracking-wide">
                            By proceeding, you agree to our{" "}
                            <Link href="/terms" className="text-black underline">Terms</Link> &{" "}
                            <Link href="/privacy" className="text-black underline">Privacy</Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Loading fallback component
function ResetPasswordPageFallback() {
    return (
        <div className="min-h-[100dvh] w-full flex items-center justify-center bg-gradient-to-b from-dark via-accent to-highlight/90 px-4 sm:px-6 pt-32 pb-12">
            <div className="flex flex-col items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-accent" />
                <p className="mt-2 text-sm text-gray-500">Loading reset password page...</p>
            </div>
        </div>
    );
}

export default function ResetPasswordPage() {
    return (
        <Suspense fallback={<ResetPasswordPageFallback />}>
            <ResetPasswordPageContent />
        </Suspense>
    );
}