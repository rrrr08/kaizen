'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Settings, Users, BarChart3, Zap, Bell, ShoppingBag, Home, Package, Calendar, LayoutGrid } from 'lucide-react';
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
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-amber-500">Loading...</p>
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
    { href: '/admin/orders', label: 'Orders', icon: ShoppingBag },
    { href: '/admin/products', label: 'Products', icon: LayoutGrid },
    { href: '/admin/events', label: 'Events', icon: Calendar },
    { href: '/admin/notifications', label: 'Notifications', icon: Bell },
    { href: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
  ];

  return (
    <div className="flex min-h-screen bg-black text-white">
      {/* Sidebar */}
      <div className="w-64 bg-gradient-to-b from-black to-black/80 border-r border-amber-500/10 fixed h-screen pt-24 overflow-y-auto scrollbar-hide z-40">
        <div className="p-6 space-y-2">
          <div className="mb-8">
            <h2 className="font-display text-2xl font-bold text-amber-500 mb-1">JOY</h2>
            <p className="font-header text-xs text-amber-500/60 tracking-widest">ADMIN PANEL</p>
          </div>
          <nav className="space-y-0.5">
            {adminMenuItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-200 text-sm ${
                    isActive
                      ? 'bg-amber-500/20 text-amber-500 border border-amber-500/30 shadow-lg shadow-amber-500/10'
                      : 'text-white/60 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon size={16} />
                  <span className="font-header">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 ml-64 pt-24">
        <div className="min-h-screen bg-gradient-to-b from-black to-black/80">
          {children}
        </div>
      </div>
    </div>
  );
}
