'use client';

import { useAuth } from '@/app/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Bell, Lock, User, ChevronRight } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default function SettingsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  if (loading) {
    return (
      <div className="min-h-screen pt-28 pb-16 flex items-center justify-center bg-[#FFFDF5]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-black border-t-[#FFD93D] mb-4"></div>
          <p className="text-black font-black text-xs tracking-[0.4em]">LOADING...</p>
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
      title: 'Notification Preferences',
      description: 'Manage your notification settings',
      icon: Bell,
      href: '/notification-preferences',
      color: 'bg-[#6C5CE7]',
    },
    {
      title: 'Account Security',
      description: 'Password and authentication settings',
      icon: Lock,
      href: '/auth/reset-password',
      color: 'bg-[#FF7675]',
    },
    {
      title: 'Profile Information',
      description: 'Update your personal details',
      icon: User,
      href: '/profile',
      color: 'bg-[#FFD93D]',
    },
  ];

  return (
    <div className="min-h-screen pt-28 pb-16 bg-[#FFFDF5] text-[#2D3436]">
      <div className="max-w-4xl mx-auto px-6 md:px-12">
        {/* Header */}
        <div className="mb-12">
          <Link href="/profile" className="font-black text-xs uppercase tracking-[0.3em] text-[#6C5CE7] hover:text-black mb-8 inline-block transition-colors">
            ← BACK TO PROFILE
          </Link>
          <h1 className="font-header text-6xl md:text-7xl font-black tracking-tighter mb-4 text-black">
            SETTINGS
          </h1>
          <p className="text-xl text-black/60 font-bold">
            Manage your account preferences
          </p>
        </div>

        {/* Settings Options */}
        <div className="space-y-4">
          {settingsOptions.map((option) => {
            const Icon = option.icon;
            return (
              <Link
                key={option.href}
                href={option.href}
                className="block bg-white border-2 border-black rounded-[20px] p-6 neo-shadow hover:translate-x-2 transition-all duration-300 group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`${option.color} p-3 rounded-xl border-2 border-black group-hover:scale-110 transition-transform`}>
                      <Icon className="w-6 h-6 text-black" strokeWidth={2.5} />
                    </div>
                    <div>
                      <h3 className="font-header text-xl font-black text-black mb-1">
                        {option.title}
                      </h3>
                      <p className="text-sm font-bold text-black/60">
                        {option.description}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-6 h-6 text-black/40 group-hover:text-black group-hover:translate-x-1 transition-all" />
                </div>
              </Link>
            );
          })}
        </div>

        {/* Account Info */}
        <div className="mt-12 bg-white border-2 border-black rounded-[20px] p-8 neo-shadow">
          <h2 className="font-header text-2xl font-black mb-6 text-black">ACCOUNT DETAILS</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center py-3 border-b-2 border-black/10">
              <span className="font-bold text-black/60">Email</span>
              <span className="font-black text-black">{user.email}</span>
            </div>
            <div className="flex justify-between items-center py-3 border-b-2 border-black/10">
              <span className="font-bold text-black/60">User ID</span>
              <span className="font-mono text-sm text-black/60">{user.uid}</span>
            </div>
            <div className="flex justify-between items-center py-3">
              <span className="font-bold text-black/60">Email Verified</span>
              <span className={`font-black ${user.emailVerified ? 'text-[#00B894]' : 'text-[#FF7675]'}`}>
                {user.emailVerified ? 'Yes' : 'No'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
