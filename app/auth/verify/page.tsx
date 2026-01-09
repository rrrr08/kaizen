"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Loader2, Mail, AlertTriangle, CheckCircle2, ArrowLeft } from "lucide-react";

export const dynamic = 'force-dynamic';

function VerifyPageContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const emailFromQuery = searchParams.get("email") || "";
    const redirectUrl = searchParams.get("redirect") || searchParams.get("redirectTo") || "/";

    const [error, setError] = useState<string | null>(null);
    const [message, setMessage] = useState<string | null>(null);
    const [resending, setResending] = useState<boolean>(false);
    const [sessionChecking, setSessionChecking] = useState<boolean>(true);
    const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null);
    const [emailVerified, setEmailVerified] = useState<boolean>(false);

    useEffect(() => {
        // Get all URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        const mode = urlParams.get('mode');
        const oobCode = urlParams.get('oobCode');

        // If we have both mode and oobCode, redirect to action page with all params
        if (mode && oobCode) {
            router.push(`/auth/action?mode=${mode}&oobCode=${oobCode}`);
        }
    }, [router]);

    useEffect(() => {
        let interval: NodeJS.Timeout;

        // Lazy load Firebase and start polling
        import('@/lib/firebase').then(({ auth }) => {
            // Initial check
            import('firebase/auth').then(({ onAuthStateChanged }) => {
                const unsubscribe = onAuthStateChanged(auth, (user) => {
                    setSessionChecking(true);
                    if (user) {
                        setCurrentUserEmail(user.email);
                        setEmailVerified(user.emailVerified);
                        if (user.emailVerified) {
                            setMessage("Your email is already verified! Redirecting...");
                            setTimeout(() => {
                                router.push(decodeURIComponent(redirectUrl) || '/');
                            }, 2000);
                        } else {
                            if (!message && !error) { // Only set if no other message
                                setMessage("Please verify your email. If you received a code, enter it below, or request a new verification email.");
                            }
                        }
                    } else {
                        setCurrentUserEmail(null);
                        setEmailVerified(false);
                        if (!emailFromQuery) {
                            setError("No user session found. Please log in or ensure you have an email in the link to verify.");
                        } else if (!message) {
                            setMessage(`Attempting to verify for ${emailFromQuery}. If you received a code, enter it below.`);
                        }
                    }
                    setSessionChecking(false);
                });

                // Set up polling interval to check for verification every 3 seconds
                // This helps if the user verifies in another tab/window
                interval = setInterval(async () => {
                    if (auth.currentUser) {
                        await auth.currentUser.reload();
                        if (auth.currentUser.emailVerified) {
                            setEmailVerified(true);
                            setMessage("Email verification detected! Redirecting...");
                            clearInterval(interval);
                            setTimeout(() => {
                                window.location.reload();
                            }, 1000);
                        }
                    }
                }, 3000);

                return () => {
                    unsubscribe();
                    if (interval) clearInterval(interval);
                };
            });
        });

        // Cleanup function for the effect itself (in case component unmounts before firebase loads)
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [router, redirectUrl, emailFromQuery]);

    const handleResendOTP = async () => {
        // Lazy load Firebase
        const { auth } = await import('@/lib/firebase');
        const { sendEmailVerification } = await import('firebase/auth');

        const targetEmail = auth.currentUser?.email || emailFromQuery;
        if (!targetEmail) {
            setError("Email is required to resend verification link.");
            return;
        }

        setResending(true);
        setError(null);
        setMessage(null);

        try {
            if (auth.currentUser && !auth.currentUser.emailVerified) {
                await sendEmailVerification(auth.currentUser);
                setMessage("A new verification email has been sent to your registered email address.");
            } else if (auth.currentUser && auth.currentUser.emailVerified) {
                setMessage("Your email is already verified.");
            } else {
                setError("Please ensure you are logged in with the email you want to verify, or check the email sent during signup.");
            }
        } catch (error: any) {
            setError(error.message || "Failed to resend verification email.");
        } finally {
            setResending(false);
        }
    };

    if (sessionChecking) {
        return (
            <div className="min-h-screen bg-[#FFFDF5] text-[#2D3436] flex items-center justify-center px-4 pt-32 pb-12">
                <div className="flex flex-col items-center justify-center gap-4">
                    <div className="w-12 h-12 border-4 border-black border-t-[#6C5CE7] rounded-full animate-spin"></div>
                    <p className="font-black text-xs tracking-[0.2em] uppercase text-black/50">Status Check...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#FFFDF5] text-[#2D3436] flex items-center justify-center px-4 pt-32 pb-12">
            <div className="relative z-10 w-full max-w-md">

                {/* Logo */}
                <div className="text-center mb-10">
                    <Link href="/" className="inline-block flex justify-center mb-6 hover:scale-105 transition-transform">
                        <div className="bg-[#FFD93D] p-3 border-2 border-black rounded-[15px] neo-shadow">
                            <span className="text-2xl font-black text-black">JJ</span>
                        </div>
                    </Link>
                    <h1 className="font-header text-4xl font-black text-black mb-2 uppercase tracking-tight">
                        Verify Email
                    </h1>
                </div>

                <div className="bg-white border-2 border-black rounded-[25px] p-8 neo-shadow">

                    <div className="text-center mb-8">
                        <div className="inline-flex justify-center mb-6">
                            <div className="w-20 h-20 bg-[#6C5CE7]/20 rounded-full border-2 border-black flex items-center justify-center neo-shadow">
                                <Mail size={40} className="text-[#6C5CE7]" />
                            </div>
                        </div>

                        <p className="font-bold text-black/70 text-sm leading-relaxed">
                            Check your inbox for a verification link sent to:<br />
                            <span className="text-black font-black bg-[#FFD93D] px-2 py-0.5 rounded-md border text-xs">{currentUserEmail || emailFromQuery || "your email"}</span>
                        </p>
                        <p className="text-xs font-bold text-black/40 mt-4 uppercase tracking-wide">
                            Click the link in the email to verify
                        </p>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 border-2 border-black bg-[#FF7675] rounded-[15px] neo-shadow">
                            <p className="font-black text-xs text-black uppercase tracking-wide flex items-center gap-2">
                                <AlertTriangle size={16} /> {error}
                            </p>
                        </div>
                    )}

                    {message && (
                        <div className="mb-6 p-4 border-2 border-black bg-[#00B894] rounded-[15px] neo-shadow">
                            <p className="font-black text-xs text-black uppercase tracking-wide flex items-center gap-2">
                                <CheckCircle2 size={16} /> {message}
                            </p>
                        </div>
                    )}

                    {currentUserEmail && !emailVerified && (
                        <div className="mt-6 text-center">
                            <p className="font-bold text-black/60 text-xs mb-3">
                                Didn&apos;t receive an email?
                            </p>
                            <button
                                onClick={handleResendOTP}
                                disabled={resending}
                                className="w-full border-2 border-black bg-[#FFD93D] text-black hover:bg-[#ffcf0d] hover:translate-y-[-2px] hover:shadow-[4px_4px_0px_#000] active:translate-y-[2px] active:shadow-[1px_1px_0px_#000] py-3 rounded-[12px] font-black text-xs tracking-[0.2em] uppercase transition-all flex items-center justify-center gap-2 neo-shadow disabled:opacity-50"
                            >
                                {resending ? "Sending..." : "Resend Verification Email"}
                            </button>
                        </div>
                    )}

                    <div className="mt-8 text-center pt-6 border-t-2 border-black/5">
                        <Link
                            href="/auth/login"
                            className="inline-flex items-center gap-2 font-black text-xs tracking-[0.2em] text-black/50 hover:text-black uppercase transition-colors"
                        >
                            <ArrowLeft size={16} /> Back to Login
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

function VerifyPageFallback() {
    return (
        <div className="min-h-screen bg-[#FFFDF5] text-[#2D3436] flex items-center justify-center px-4 pt-32 pb-12">
            <div className="flex flex-col items-center justify-center gap-4">
                <div className="w-12 h-12 border-4 border-black border-t-[#6C5CE7] rounded-full animate-spin"></div>
                <p className="font-black text-xs tracking-[0.2em] uppercase text-black/50">Loading Verify...</p>
            </div>
        </div>
    );
}

export default function VerifyPage() {
    return (
        <Suspense fallback={<VerifyPageFallback />}>
            <VerifyPageContent />
        </Suspense>
    );
}