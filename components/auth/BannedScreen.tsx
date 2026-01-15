import React from 'react';
import { ShieldAlert, LogOut } from 'lucide-react';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';

const BannedScreen = () => {
    const handleSignOut = async () => {
        try {
            await signOut(auth);
            window.location.href = '/';
        } catch (error) {
            console.error('Error signing out:', error);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#FFFDF5] p-4">
            <div className="max-w-md w-full text-center">
                <div className="relative mx-auto w-32 h-32 mb-8">
                    <div className="absolute inset-0 bg-[#FF7675] rounded-full border-4 border-black neo-shadow animate-pulse"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <ShieldAlert className="w-16 h-16 text-black" />
                    </div>
                </div>

                <h1 className="text-4xl font-black text-black uppercase tracking-tighter mb-4">
                    Account Banned
                </h1>

                <div className="bg-white p-6 rounded-xl border-4 border-black neo-shadow mb-8 transform -rotate-1 hover:rotate-0 transition-transform duration-300">
                    <p className="font-bold text-lg text-black mb-2">
                        Access to this platform has been restricted.
                    </p>
                    <p className="text-black/60 font-medium text-sm">
                        Your account has been suspended due to a violation of our terms of service or community guidelines.
                    </p>
                </div>

                <button
                    onClick={handleSignOut}
                    className="inline-flex items-center px-6 py-4 bg-[#6C5CE7] text-white rounded-xl font-black uppercase tracking-widest border-2 border-black shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_rgba(0,0,0,1)] active:shadow-none transition-all"
                >
                    <LogOut className="w-5 h-5 mr-2" />
                    Sign Out
                </button>

                <div className="mt-8 text-xs font-bold text-black/40 uppercase tracking-widest">
                    Contact support if you believe this is a mistake
                </div>
            </div>
        </div>
    );
};

export default BannedScreen;
