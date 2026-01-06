'use client';

import { useAuth } from '@/app/context/AuthContext';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  User,
  Shield,
  Bell,
  Mail,
  Zap,
  ChevronRight,
  ShieldCheck,
  Smartphone,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import Link from 'next/link';

export default function SettingsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  if (loading) {
    return (
      <div className="min-h-screen pt-28 pb-16 flex items-center justify-center bg-[#FFFDF5]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-black border-t-[#FFD93D] mb-4"></div>
          <p className="text-black font-black text-xs tracking-[0.4em]">LOADING SECURE CHANNEL...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    router.push('/auth/login');
    return null;
  }

  const settingsOptions = [
    {
      title: 'Personal Information',
      desc: 'Email, Identity, and Avatar',
      icon: User,
      color: 'bg-[#FFD93D]'
    },
    {
      title: 'Security & Password',
      desc: 'Two-factor and logins',
      icon: Shield,
      color: 'bg-[#6C5CE7]',
      text: 'text-white'
    },
    {
      title: 'Notifications',
      desc: 'Alerts and newsletters',
      icon: Bell,
      color: 'bg-[#00B894]',
      text: 'text-white'
    }
  ];

  return (
    <div className="min-h-screen pt-28 pb-16 bg-[#FFFDF5] text-black">
      <div className="max-w-4xl mx-auto px-6">
        {/* Header */}
        <div className="mb-12">
          <Link
            href="/profile"
            className="inline-flex items-center gap-2 text-black/40 hover:text-black font-black text-[10px] uppercase tracking-[0.3em] mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Base
          </Link>
          <h1 className="font-header text-6xl font-black tracking-tighter uppercase leading-none mb-4">
            System <br />Preferences
          </h1>
          <p className="text-xl font-bold text-black/60 max-w-md">Configure your JOY account settings and security protocols.</p>
        </div>

        <div className="space-y-8">
          {/* Security Status Card */}
          <div className="bg-white border-4 border-black p-8 rounded-[30px] neo-shadow flex flex-col md:flex-row items-center gap-8">
            <div className="w-20 h-20 bg-[#00B894] border-2 border-black rounded-full flex items-center justify-center shadow-[4px_4px_0px_#000]">
              <ShieldCheck className="w-10 h-10 text-white" />
            </div>
            <div className="text-center md:text-left">
              <h3 className="text-2xl font-black uppercase tracking-tight mb-1">Account Integrity: Shield ON</h3>
              <p className="font-bold text-black/40">Your connection is encrypted. Identity verification is active.</p>
            </div>
          </div>

          {/* Options Grid */}
          <div className="grid grid-cols-1 gap-4">
            {settingsOptions.map((opt, i) => (
              <motion.div
                key={i}
                whileHover={{ x: 10 }}
                className="bg-white border-4 border-black p-6 rounded-2xl neo-shadow flex items-center justify-between group cursor-pointer"
              >
                <div className="flex items-center gap-6">
                  <div className={`w-14 h-14 ${opt.color} border-2 border-black rounded-xl flex items-center justify-center shadow-[4px_4px_0px_#000] rotate-2 group-hover:rotate-0 transition-transform`}>
                    <opt.icon className={opt.text || 'text-black'} size={28} />
                  </div>
                  <div>
                    <h4 className="text-xl font-black uppercase tracking-tight">{opt.title}</h4>
                    <p className="text-xs font-bold text-black/40 uppercase tracking-widest">{opt.desc}</p>
                  </div>
                </div>
                <ChevronRight className="w-6 h-6 text-black/10 group-hover:text-black transition-colors" />
              </motion.div>
            ))}
          </div>

          {/* Details Section */}
          <div className="bg-white border-4 border-black rounded-[35px] p-10 neo-shadow">
            <h3 className="font-header text-3xl font-black mb-8 uppercase flex items-center gap-3">
              <Smartphone className="w-8 h-8" /> Connection Details
            </h3>

            <div className="space-y-6">
              <div className="flex justify-between items-center py-4 border-b-2 border-black/5">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-black/40 mb-1">Registered Email</p>
                  <p className="text-lg font-black text-black">{user.email}</p>
                </div>
                <div className="flex items-center gap-2 bg-[#00B894]/10 text-[#00B894] px-4 py-2 rounded-full border-2 border-[#00B894] text-xs font-black uppercase">
                  <CheckCircle2 size={14} /> Verified
                </div>
              </div>

              <div className="flex justify-between items-center py-4 border-b-2 border-black/5">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-black/40 mb-1">Public ID</p>
                  <p className="text-lg font-black text-black uppercase">{user.uid.slice(0, 16)}</p>
                </div>
              </div>

              <div className="flex justify-between items-center py-4">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-black/40 mb-1">Login Provider</p>
                  <p className="text-lg font-black text-black flex items-center gap-2 uppercase tracking-tight">
                    <Mail size={18} /> Google Authenticator
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="pt-12">
            <div className="bg-[#FF7675]/10 border-4 border-[#FF7675] p-8 rounded-[30px] flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <AlertTriangle className="text-[#FF7675]" size={32} />
                <div>
                  <h4 className="text-xl font-black text-[#FF7675] uppercase tracking-tight">Danger Zone</h4>
                  <p className="text-xs font-bold text-[#FF7675]/60 uppercase">System account removal (Irreversible)</p>
                </div>
              </div>
              <button className="px-8 py-4 bg-[#FF7675] text-white font-black text-xs uppercase tracking-widest rounded-xl hover:bg-red-600 transition-colors shadow-[4px_4px_0px_#000]">
                Deactivate System Account
              </button>
            </div>
          </div>
        </div>

        <div className="mt-20 text-center opacity-20">
          <p className="text-[8px] font-black tracking-[0.8em] uppercase">SYSTEM_PREFS_ENCRYPTED_v2.1</p>
        </div>
      </div>
    </div>
  );
}
