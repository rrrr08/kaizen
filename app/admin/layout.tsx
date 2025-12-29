'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Settings, Users, BarChart3, Zap, Bell, ShoppingBag, Home, Calendar, LayoutGrid, FileText, Gamepad2, Trophy, Database, Ticket, TrendingUp,MessageSquare } from 'lucide-react';

import { useAuth } from '@/app/context/AuthContext';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading, isAdmin } = useAuth();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login');
    }
  }, [user, loading, router]);

  // Redirect to home if not admin
  useEffect(() => {
    if (!loading && user && !isAdmin) {
      router.push('/');
    }
  }, [user, loading, isAdmin, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#FFFDF5]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-black border-t-[#FFD93D] rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-black font-black uppercase tracking-widest">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return null;
  }

  const adminMenuItems = [
    { href: '/admin/dashboard', label: 'Dashboard', icon: Home },
    { href: '/admin/settings', label: 'Settings', icon: Settings },
    { href: '/admin/users', label: 'Users', icon: Users },
    { href: '/admin/games', label: 'Games', icon: Gamepad2 },
    { href: '/admin/gamification', label: 'Gamification', icon: Trophy },
    { href: '/admin/xp-tiers', label: 'XP & Tiers', icon: TrendingUp },
    { href: '/admin/game-content', label: 'Game Content', icon: Database },
    { href: '/admin/vouchers', label: 'Vouchers', icon: Ticket },
    { href: '/admin/api-test', label: 'API Test', icon: Zap },
    { href: '/admin/orders', label: 'Orders', icon: ShoppingBag },
    { href: '/admin/products', label: 'Products', icon: LayoutGrid },
    { href: '/admin/media', label: 'Media', icon: FileText },
    { href: '/admin/blog', label: 'Blog', icon: FileText },
    { href: '/admin/events', label: 'Events', icon: Calendar },
    { href: '/admin/testimonials', label: 'Testimonials', icon: MessageSquare },
    { href: '/admin/notifications', label: 'Notifications', icon: Bell },
    { href: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
  ];

  return (
    <div className="flex min-h-screen bg-[#FFFDF5] text-black font-sans">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r-2 border-black fixed h-screen pt-24 overflow-y-auto z-40">
        <div className="p-6 space-y-4">
          <div className="mb-8">
            <h2 className="font-header text-4xl font-black text-black mb-1">JOY</h2>
            <p className="font-black text-xs text-black/40 tracking-[0.2em] uppercase">ADMIN PANEL</p>
          </div>
          <nav className="space-y-2">
            {adminMenuItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-[12px] transition-all duration-200 text-sm font-black uppercase tracking-wide border-2 ${isActive
                    ? 'bg-[#FFD93D] text-black border-black neo-shadow-sm'
                    : 'text-black/60 border-transparent hover:bg-black/5 hover:text-black'
                    }`}
                >
                  <Icon size={18} strokeWidth={2.5} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 ml-64 pt-24">
        <div className="min-h-screen bg-[#FFFDF5] p-6">
          {children}
        </div>
      </div>
    </div>
  );
}
