"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Loader2, ArrowLeft, CheckCircle, AlertTriangle, Check } from "lucide-react";

export const dynamic = 'force-dynamic';

function AuthActionPageContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    let mode = searchParams.get("mode");
    let oobCode = searchParams.get("oobCode");

    // Log all search parameters for debugging
    console.log("All URL search params:", Object.fromEntries([...searchParams.entries()]));

    // Check for continueUrl parameter that might contain encoded mode and oobCode
    const continueUrl = searchParams.get("continueUrl");
    console.log("Initial values:", { mode, oobCode, continueUrl });

    if (continueUrl) {
        try {
            const continueUrlObj = new URL(continueUrl);
            console.log("Parsed continueUrl:", continueUrlObj.toString());
            console.log("continueUrl search params:", continueUrlObj.search);

            const continueParams = new URLSearchParams(continueUrlObj.search);
            console.log("continueParams entries:", Object.fromEntries([...continueParams.entries()]));

            // Extract mode and oobCode from continueUrl if present
            if (!mode) {
                mode = continueParams.get("mode");
                console.log("mode from continueUrl:", mode);
            }
            if (!oobCode) {
                oobCode = continueParams.get("oobCode");
                console.log("oobCode from continueUrl:", oobCode);
            }

            // Check if mode and oobCode might be double-encoded
            if (!mode || !oobCode) {
                try {
                    // Try to decode the continueUrl once more in case it's double-encoded
                    const decodedUrl = decodeURIComponent(continueUrl);
                    const decodedUrlObj = new URL(decodedUrl);
                    const decodedParams = new URLSearchParams(decodedUrlObj.search);

                    console.log("Decoded continueUrl:", decodedUrl);
                    console.log("Decoded params:", Object.fromEntries([...decodedParams.entries()]));

                    if (!mode) mode = decodedParams.get("mode");
                    if (!oobCode) oobCode = decodedParams.get("oobCode");

                    console.log("After double-decode attempt:", { mode, oobCode });
                } catch (decodeErr) {
                    console.error("Error attempting to decode continueUrl:", decodeErr);
                }
            }
        } catch (err) {
            console.error("Error parsing continueUrl:", err);
        }
    }

    const [newPassword, setNewPassword] = useState<string>("");
    const [confirmNewPassword, setConfirmNewPassword] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);
    const [message, setMessage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isVerifying, setIsVerifying] = useState<boolean>(true);
    const [emailForReset, setEmailForReset] = useState<string | null>(null);

    useEffect(() => {
        // ... (keep existing useEffect logic for URL parsing and Firebase actions) ...
        console.log("useEffect running with:", { mode, oobCode });

        if (mode === "resetPassword" && oobCode) {
            console.log("Handling resetPassword action with code:", oobCode);
            (async () => {
                try {
                    const { auth: authModule } = await import('@/lib/firebase');
                    const { verifyPasswordResetCode } = await import('firebase/auth');

                    const email = await verifyPasswordResetCode(authModule, oobCode);
                    console.log("Password reset code verified for email:", email);
                    setEmailForReset(email);
                    setMessage("Please enter your new password.");
                    setIsVerifying(false);
                } catch (err) {
                    console.error("Invalid or expired oob code for password reset:", err);
                    setError(
                        "Invalid or expired password reset link. Please try resetting your password again."
                    );
                    setIsVerifying(false);
                }
            })();
        } else if (mode === "verifyEmail" && oobCode) {
            console.log("Handling verifyEmail action with code:", oobCode);
            (async () => {
                try {
                    const { auth: authModule } = await import('@/lib/firebase');
                    const { applyActionCode } = await import('firebase/auth');

                    await applyActionCode(authModule, oobCode);
                    console.log("Email verification successful");
                    setMessage(
                        "Your email address has been verified successfully! Setting up your profile..."
                    );
                    setIsVerifying(false);

                    // Check if user has completed onboarding
                    try {
                        const { getUserById } = await import('@/lib/firebase');
                        const user = authModule.currentUser;

                        if (user) {
                            const userProfile = await getUserById(user.uid);

                            // If user doesn't have a role (new user), redirect to onboarding
                            if (!userProfile?.role) {
                                setTimeout(() => router.push("/onboarding"), 2000);
                                return;
                            }
                        }
                    } catch (error) {
                        console.error('Error checking user profile:', error);
                    }

                    setTimeout(() => router.push("/"), 3000);
                } catch (err) {
                    console.error("Error verifying email:", err);
                    setError(
                        "Failed to verify email. The link may be invalid, expired, or the email may already be verified. Please try logging in or request a new verification email if needed."
                    );
                    setIsVerifying(false);
                }
            })();
        } else {
            console.error("No valid action detected:", { mode, oobCode });
            setError(
                mode ? "Invalid action or missing code." : "No action specified. Please check the link."
            );
            setIsVerifying(false);
        }
    }, [mode, oobCode, router]);

    const handleConfirmResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword !== confirmNewPassword) {
            setError("Passwords do not match.");
            return;
        }
        if (newPassword.length < 6) {
            setError("Password must be at least 6 characters long.");
            return;
        }
        if (!oobCode) {
            setError("Missing reset code. Please try again.");
            return;
        }

        setLoading(true);
        setError(null);
        setMessage(null);

        try {
            const { auth: authModule } = await import('@/lib/firebase');
            const { confirmPasswordReset } = await import('firebase/auth');

            await confirmPasswordReset(authModule, oobCode, newPassword);
            setMessage(
                "Your password has been reset successfully! You can now log in with your new password."
            );
            setNewPassword("");
            setConfirmNewPassword("");
            setTimeout(() => router.push("/auth/login?message=Password reset successfully"), 3000);
        } catch (err) {
            console.error("Error confirming password reset:", err);
            setError(
                "Failed to reset password. The link may have expired or been used already. Please try resetting your password again."
            );
        } finally {
            setLoading(false);
        }
    };

    if (isVerifying) {
        return (
            <div className="min-h-screen bg-[#FFFDF5] text-[#2D3436] flex items-center justify-center px-4 pt-32 pb-12">
                <div className="relative z-10 w-full max-w-md text-center">
                    <div className="bg-white border-2 border-black rounded-[25px] p-12 neo-shadow flex flex-col items-center">
                        <div className="w-16 h-16 border-4 border-black border-t-[#FFD93D] rounded-full animate-spin mb-6"></div>
                        <h2 className="font-header text-2xl font-black text-black uppercase tracking-tight mb-2">
                            Verifying Action...
                        </h2>
                        <p className="font-medium text-black/60">Please wait a moment.</p>
                    </div>
                </div>
            </div>
        );
    }

    // Success State for Email Verification
    if (mode !== "resetPassword" || !emailForReset) {
        if (mode === "verifyEmail" && !error && message) {
            return (
                <div className="min-h-screen bg-[#FFFDF5] text-[#2D3436] flex items-center justify-center px-4 pt-32 pb-12">
                    <div className="relative z-10 w-full max-w-md">
                        <div className="bg-white border-2 border-black rounded-[25px] p-8 neo-shadow text-center">

                            <div className="inline-flex justify-center mb-6">
                                <div className="w-20 h-20 bg-[#00B894] rounded-full border-2 border-black flex items-center justify-center neo-shadow">
                                    <Check className="w-10 h-10 text-white" strokeWidth={3} />
                                </div>
                            </div>

                            <h1 className="font-header text-3xl font-black text-black mb-4 uppercase">
                                Email Verified!
                            </h1>

                            <div className="bg-[#00B894]/10 border-2 border-[#00B894] p-4 rounded-xl mb-8">
                                <p className="font-bold text-[#00B894] text-sm">{message}</p>
                            </div>

                            <Link
                                href="/auth/login"
                                className="inline-flex w-full items-center justify-center px-6 py-4 bg-[#FFD93D] text-black border-2 border-black rounded-xl font-black text-sm tracking-[0.2em] uppercase hover:translate-y-[-2px] hover:shadow-[4px_4px_0px_#000] active:translate-y-[2px] active:shadow-none transition-all neo-shadow"
                            >
                                Proceed to Login
                            </Link>
                        </div>
                    </div>
                </div>
            );
        }

        // Error State
        return (
            <div className="min-h-screen bg-[#FFFDF5] text-[#2D3436] flex items-center justify-center px-4 pt-32 pb-12">
                <div className="relative z-10 w-full max-w-md">
                    <div className="bg-white border-2 border-black rounded-[25px] p-8 neo-shadow text-center">
                        <div className="inline-flex justify-center mb-6">
                            <div className="w-20 h-20 bg-[#FF7675] rounded-full border-2 border-black flex items-center justify-center neo-shadow">
                                <AlertTriangle size={40} strokeWidth={2.5} />
                            </div>
                        </div>

                        <h1 className="font-header text-3xl font-black text-black mb-4 uppercase">
                            Action Required
                        </h1>

                        <div className="bg-[#FF7675]/10 border-2 border-[#FF7675] p-4 rounded-xl mb-8">
                            <p className="font-bold text-[#D63031] text-sm">
                                {error || message || "Unknown state."}
                            </p>
                        </div>

                        <Link
                            href="/auth/login"
                            className="inline-flex w-full items-center justify-center px-6 py-4 bg-[#2D3436] text-white border-2 border-black rounded-xl font-black text-sm tracking-[0.2em] uppercase hover:bg-black hover:translate-y-[-2px] hover:shadow-[4px_4px_0px_#000] active:translate-y-[2px] active:shadow-none transition-all neo-shadow"
                        >
                            Back to Login
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    // Reset Password Form
    return (
        <div className="min-h-screen bg-[#FFFDF5] text-[#2D3436] flex items-center justify-center px-4 pt-32 pb-12">
            <div className="relative z-10 w-full max-w-md">

                <div className="text-center mb-10">
                    <Link href="/" className="inline-block flex justify-center mb-6 hover:scale-105 transition-transform">
                        <div className="bg-[#FFD93D] p-3 border-2 border-black rounded-[15px] neo-shadow">
                            <span className="text-2xl font-black text-black">JJ</span>
                        </div>
                    </Link>
                    <h1 className="font-header text-4xl font-black text-black mb-2 uppercase tracking-tight">
                        Set New Password
                    </h1>
                    <p className="font-sans font-bold text-black/60 text-sm">
                        Secure your account regarding <span className="text-black">{emailForReset}</span>
                    </p>
                </div>

                <div className="bg-white border-2 border-black rounded-[25px] p-8 neo-shadow">

                    {error && (
                        <div className="mb-6 p-4 border-2 border-black bg-[#FF7675] rounded-[15px] neo-shadow">
                            <p className="font-black text-xs text-black uppercase tracking-wide flex items-center gap-2">
                                <AlertTriangle size={16} /> {error}
                            </p>
                        </div>
                    )}

                    {message && !error && (
                        <div className="mb-6 p-4 border-2 border-black bg-[#00B894] rounded-[15px] neo-shadow">
                            <p className="font-black text-xs text-black uppercase tracking-wide flex items-center gap-2">
                                <CheckCircle size={16} /> {message}
                            </p>
                        </div>
                    )}

                    <form onSubmit={handleConfirmResetPassword} className="space-y-6">
                        <div className="space-y-2">
                            <label htmlFor="newPassword" className="font-black text-xs tracking-widest text-black uppercase ml-1">
                                New Password
                            </label>
                            <input
                                id="newPassword"
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="w-full bg-[#FFFDF5] border-2 border-black rounded-[12px] text-black placeholder:text-black/30 px-4 py-4 text-sm font-bold focus:bg-[#FFD93D]/20 focus:outline-none transition-all shadow-[2px_2px_0px_#000]"
                                placeholder="Min. 6 characters"
                                required
                                minLength={6}
                            />
                        </div>
                        <div className="space-y-2">
                            <label htmlFor="confirmNewPassword" className="font-black text-xs tracking-widest text-black uppercase ml-1">
                                Confirm New Password
                            </label>
                            <input
                                id="confirmNewPassword"
                                type="password"
                                value={confirmNewPassword}
                                onChange={(e) => setConfirmNewPassword(e.target.value)}
                                className="w-full bg-[#FFFDF5] border-2 border-black rounded-[12px] text-black placeholder:text-black/30 px-4 py-4 text-sm font-bold focus:bg-[#FFD93D]/20 focus:outline-none transition-all shadow-[2px_2px_0px_#000]"
                                placeholder="Re-enter password"
                                required
                                minLength={6}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading || isVerifying}
                            className="w-full border-2 border-black bg-[#6C5CE7] text-white hover:bg-[#5a4bd1] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_#000] active:translate-y-[2px] active:shadow-[2px_2px_0px_#000] py-4 rounded-[15px] font-black text-sm tracking-[0.2em] uppercase transition-all flex items-center justify-center gap-3 neo-shadow"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                    <span>Updating...</span>
                                </>
                            ) : (
                                'Reset Password'
                            )}
                        </button>
                    </form>

                    <div className="mt-8 text-center pt-6 border-t-2 border-black/5">
                        <Link
                            href="/auth/login"
                            className="inline-block font-black text-xs tracking-[0.2em] text-black/50 hover:text-black uppercase transition-colors"
                        >
                            <ArrowLeft size={16} className="inline mr-2" /> Back to Login
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

function AuthActionPageFallback() {
    return (
        <div className="min-h-screen bg-[#FFFDF5] text-[#2D3436] flex items-center justify-center px-4 pt-32 pb-12">
            <div className="flex flex-col items-center justify-center">
                <div className="w-12 h-12 border-4 border-black border-t-[#6C5CE7] rounded-full animate-spin mb-4"></div>
                <p className="font-black text-xs tracking-[0.2em] uppercase text-black/50">Processing Action...</p>
            </div>
        </div>
    );
}

export default function AuthActionPage() {
    return (
        <Suspense fallback={<AuthActionPageFallback />}>
            <AuthActionPageContent />
        </Suspense>
    );
}