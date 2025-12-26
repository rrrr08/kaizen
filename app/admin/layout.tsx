'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Settings, Users, BarChart3, Zap, Bell, ShoppingBag, Home, Package, Calendar, LayoutGrid, FileText, Smartphone } from 'lucide-react';
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
      <div className="flex items-center justify-center min-h-screen bg-[#050505]">
        <div className="text-center">
          <div className="text-[#FFD400] font-arcade tracking-[0.3em] animate-pulse text-xl">
            AUTHENTICATING_ADMIN_ACCESS...
          </div>
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
    { href: '/admin/blog', label: 'Blog', icon: FileText },
    { href: '/admin/events', label: 'Events', icon: Calendar },
    { href: '/admin/gamification', label: 'Gamification', icon: Zap },
    { href: '/admin/notifications', label: 'Alerts', icon: Bell },
    { href: '/admin/push-notifications', label: 'Push Notifs', icon: Smartphone },
    { href: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
  ];

  return (
    <div className="flex min-h-screen bg-[#050505] text-white font-sans selection:bg-[#FFD400] selection:text-black">
      {/* Sidebar */}
      <div className="w-64 bg-[#080808] border-r border-[#333] fixed h-screen pt-8 overflow-y-auto z-40 bg-[linear-gradient(rgba(0,255,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,0,0.02)_1px,transparent_1px)] bg-[size:16px_16px]">
        <div className="p-6 space-y-4">
          <div className="mb-10 pl-2 border-l-4 border-[#FFD400]">
            <h2 className="font-arcade text-3xl text-white text-3d-orange mb-1">KAIZEN</h2>
            <p className="font-arcade text-xs text-gray-500 tracking-[0.2em] uppercase">SYSTEM_ADMIN</p>
          </div>
          <nav className="space-y-2">
            {adminMenuItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 border-l-2 transition-all duration-200 text-sm font-arcade tracking-wide group ${isActive
                    ? 'bg-[#FFD93D]/10 border-[#FFD93D] text-[#FFD93D]'
                    : 'border-transparent text-gray-500 hover:text-white hover:bg-white/5 hover:border-white/50'
                    }`}
                >
                  <Icon size={16} strokeWidth={2} className={`${isActive ? 'text-[#FFD93D]' : 'text-gray-600 group-hover:text-white'}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 ml-64">
        <div className="min-h-screen bg-[#050505] p-8 bg-[linear-gradient(rgba(0,255,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,0,0.02)_1px,transparent_1px)] bg-[size:32px_32px]">
          {children}
        </div>
      </div>
    </div>
  );
}

