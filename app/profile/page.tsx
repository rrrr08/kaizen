'use client';

import { useAuth } from '@/app/context/AuthContext';
import { useGamification } from '@/app/context/GamificationContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Wallet, 
  Gift, 
  TrendingUp, 
  ShoppingBag, 
  Calendar, 
  Settings, 
  Bell,
  Award,
  Target,
  Zap
} from 'lucide-react';
import LevelBadge from '@/components/gamification/LevelBadge';

export const dynamic = 'force-dynamic';

export default function ProfilePage() {
  const { user, loading: authLoading } = useAuth();
  const { xp, balance, tier, loading: gamificationLoading } = useGamification();
  const router = useRouter();

  if (authLoading || gamificationLoading) {
    return (
      <div className="min-h-screen pt-28 pb-16 flex items-center justify-center bg-[#FFFDF5]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-black border-t-[#FFD93D] mb-4"></div>
          <p className="text-black font-black text-xs tracking-[0.4em]">LOADING PROFILE...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    router.push('/auth/login');
    return null;
  }

  const profileSections = [
    {
      title: 'Dashboard',
      description: 'View your wallet, points, and XP',
      icon: Wallet,
      href: '/wallet',
      color: 'bg-[#FFD93D]',
      textColor: 'text-black',
    },
    {
      title: 'Rewards',
      description: 'Claim vouchers and special offers',
      icon: Gift,
      href: '/rewards',
      color: 'bg-[#6C5CE7]',
      textColor: 'text-white',
    },
    {
      title: 'Progress',
      description: 'Track your achievements and milestones',
      icon: TrendingUp,
      href: '/progress',
      color: 'bg-[#00B894]',
      textColor: 'text-white',
    },
    {
      title: 'Orders',
      description: 'Complete purchase history and receipts',
      icon: ShoppingBag,
      href: '/orders',
      color: 'bg-[#FF7675]',
      textColor: 'text-white',
    },
    {
      title: 'Experience Enquiries',
      description: 'Track your submitted experience enquiries',
      icon: Calendar,
      href: '/profile/enquiries',
      color: 'bg-[#A29BFE]',
      textColor: 'text-white',
    },
    {
      title: 'Settings',
      description: 'Manage your account preferences',
      icon: Settings,
      href: '/profile/settings',
      color: 'bg-white',
      textColor: 'text-black',
      border: 'border-2 border-black',
    },
  ];

  return (
    <div className="min-h-screen pt-28 pb-16 bg-[#FFFDF5] text-[#2D3436]">
      <div className="max-w-6xl mx-auto px-6 md:px-12">
        {/* Header Section */}
        <div className="mb-12">
          <h1 className="font-header text-6xl md:text-7xl font-black tracking-tighter mb-4 text-black">
            MY PROFILE
          </h1>
          <p className="text-xl text-black/60 font-bold">
            Welcome back, {user.email?.split('@')[0]}!
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {/* XP Card */}
          <div className="bg-white border-2 border-black rounded-[20px] p-6 neo-shadow">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-[#6C5CE7] p-2 rounded-lg border-2 border-black">
                <Award className="w-5 h-5 text-white" />
              </div>
              <span className="font-black text-xs tracking-widest text-[#6C5CE7]">EXPERIENCE</span>
            </div>
            <div className="font-header text-4xl font-black text-black mb-2">
              {xp.toLocaleString()} XP
            </div>
            <div className="flex items-center gap-2">
              <LevelBadge size="sm" />
            </div>
          </div>

          {/* Balance Card */}
          <div className="bg-[#FFD93D] border-2 border-black rounded-[20px] p-6 neo-shadow">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-black p-2 rounded-lg">
                <Wallet className="w-5 h-5 text-white" />
              </div>
              <span className="font-black text-xs tracking-widest text-black">JOY POINTS</span>
            </div>
            <div className="font-header text-4xl font-black text-black mb-2">
              {balance.toLocaleString()}
            </div>
            <p className="text-xs text-black/70 font-bold">Spendable currency</p>
          </div>

          {/* Tier Card */}
          <div className="bg-[#00B894] border-2 border-black rounded-[20px] p-6 neo-shadow">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-white p-2 rounded-lg border-2 border-black">
                <Target className="w-5 h-5 text-[#00B894]" />
              </div>
              <span className="font-black text-xs tracking-widest text-white">CURRENT TIER</span>
            </div>
            <div className="font-header text-4xl font-black text-white mb-2">
              {tier.name}
            </div>
            <p className="text-xs text-white/80 font-bold">{tier.multiplier}x multiplier</p>
          </div>
        </div>

        {/* Quick Actions Grid */}
        <div className="mb-12">
          <h2 className="font-header text-3xl font-black mb-6 text-black">QUICK ACCESS</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {profileSections.map((section) => {
              const Icon = section.icon;
              return (
                <Link
                  key={section.href}
                  href={section.href}
                  className={`${section.color} ${section.border || 'border-2 border-black'} rounded-[20px] p-6 neo-shadow hover:translate-y-[-4px] transition-all duration-300 group`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className={`${section.textColor === 'text-white' ? 'bg-white/20' : 'bg-black/10'} p-3 rounded-xl border-2 ${section.textColor === 'text-white' ? 'border-white/30' : 'border-black/20'} group-hover:scale-110 transition-transform`}>
                      <Icon className={`w-6 h-6 ${section.textColor}`} strokeWidth={2.5} />
                    </div>
                    <Zap className={`w-5 h-5 ${section.textColor} opacity-0 group-hover:opacity-100 transition-opacity`} />
                  </div>
                  <h3 className={`font-header text-2xl font-black mb-2 ${section.textColor}`}>
                    {section.title}
                  </h3>
                  <p className={`text-sm font-bold ${section.textColor} ${section.textColor === 'text-white' ? 'opacity-80' : 'opacity-60'}`}>
                    {section.description}
                  </p>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Account Info Section */}
        <div className="bg-white border-2 border-black rounded-[20px] p-8 neo-shadow">
          <h2 className="font-header text-2xl font-black mb-6 text-black">ACCOUNT INFORMATION</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center py-3 border-b-2 border-black/10">
              <span className="font-bold text-black/60">Email</span>
              <span className="font-black text-black">{user.email}</span>
            </div>
            <div className="flex justify-between items-center py-3 border-b-2 border-black/10">
              <span className="font-bold text-black/60">Member Since</span>
              <span className="font-black text-black">
                {user.metadata?.creationTime 
                  ? new Date(user.metadata.creationTime).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })
                  : 'N/A'}
              </span>
            </div>
            <div className="flex justify-between items-center py-3">
              <span className="font-bold text-black/60">Account Status</span>
              <span className="font-black text-[#00B894] flex items-center gap-2">
                <span className="w-2 h-2 bg-[#00B894] rounded-full animate-pulse"></span>
                Active
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
