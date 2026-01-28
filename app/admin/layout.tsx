
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Settings, Users, BarChart3, Zap, Bell, ShoppingBag, Home, Calendar, LayoutGrid, FileText, Gamepad2, Trophy, Database, Ticket, TrendingUp, MessageSquare, Mail, Truck, ChevronLeft, ChevronRight, Menu, X, Sparkles, Shield } from 'lucide-react';

import { useAuth } from '@/app/context/AuthContext';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading, isAdmin } = useAuth();

  // Sidebar State
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

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
    { href: '/admin/game-settings', label: 'Game Settings', icon: Gamepad2 },
    { href: '/admin/vouchers', label: 'Vouchers', icon: Ticket },
    { href: '/admin/orders', label: 'Orders', icon: ShoppingBag },
    { href: '/admin/shipments', label: 'Shipments', icon: Truck },
    { href: '/admin/products', label: 'Products', icon: LayoutGrid },
    { href: '/admin/media', label: 'Media', icon: FileText },
    { href: '/admin/blog', label: 'Blog', icon: FileText },
    { href: '/admin/events', label: 'Events', icon: Calendar },
    { href: '/admin/experiences', label: 'Experiences', icon: Sparkles },
    { href: '/admin/experiences/enquiries', label: 'Experience Enquiries', icon: MessageSquare },
    { href: '/admin/proofofjoy', label: 'Proof Of Joy', icon: MessageSquare },
    { href: '/admin/push-notifications', label: 'Notifications', icon: Zap },
    { href: '/admin/inquiries', label: 'Enquiries', icon: MessageSquare },
    { href: '/admin/moderation', label: 'Moderation', icon: Shield },
    { href: '/admin/logs', label: 'System Logs', icon: FileText },
    { href: '/admin/cdc', label: 'Database Changes', icon: Database },
  ];


  return (
    <div className="flex min-h-screen bg-[#FFFDF5] text-[#2D3436] font-sans">

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 w-full bg-white border-b-2 border-black z-50 p-4 flex justify-between items-center">
        <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <h2 className="font-header text-xl font-black">JOY ADMIN</h2>
        </Link>
        <button onClick={() => setIsMobileOpen(!isMobileOpen)} className="p-2 neo-border">
          {isMobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Overlay for Mobile */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
           fixed h-screen bg-white border-r-2 border-black z-40 transition-all duration-300
           ${isCollapsed ? 'w-20' : 'w-64'}
           ${isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
           pt-24 md:pt-8
         `}
      >
        {/* Toggle Button (Desktop Only) */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hidden md:flex absolute -right-3 top-10 bg-white border-2 border-black rounded-full p-1 hover:bg-yellow transition-colors"
        >
          {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>

        <div className={`p-4 h-full overflow-y-auto ${isCollapsed ? 'px-2' : ''}`}>
          {/* Logo Area */}
          <Link href="/" className={`block mb-8 ${isCollapsed ? 'text-center' : 'px-2'} hover:opacity-80 transition-opacity`}>
            {isCollapsed ? (
              <span className="font-header text-2xl font-black">J</span>
            ) : (
              <>
                <h2 className="font-header text-3xl font-black text-[#2D3436] leading-none">JOY</h2>
                <p className="font-black text-[10px] text-[#2D3436]/40 tracking-[0.2em] uppercase">ADMIN PANEL</p>
              </>
            )}
          </Link>

          <nav className="space-y-2">
            {adminMenuItems.map((item) => {
              const Icon = item?.icon || Settings; // Fallback to Settings icon
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  title={isCollapsed ? item.label : ''}
                  className={`
                    flex items-center gap-3 px-3 py-3 rounded-[12px] transition-all duration-200 
                    font-black uppercase tracking-wide border-2 group
                    ${isActive
                      ? 'bg-[#FFD93D] text-[#2D3436] border-black neo-shadow-sm'
                      : 'text-[#2D3436]/60 border-transparent hover:bg-black/5 hover:text-[#2D3436]'
                    }
                    ${isCollapsed ? 'justify-center' : ''}
                  `}
                >
                  <Icon size={20} strokeWidth={2.5} className="flex-shrink-0" />
                  {!isCollapsed && <span className="text-sm truncate font-bold">{item.label}</span>}

                  {/* Tooltip for collapsed state */}
                  {isCollapsed && (
                    <div className="absolute left-full ml-2 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50">
                      {item.label}
                    </div>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div
        className={`
            flex-1 min-h-screen transition-all duration-300 min-w-0
            ${isCollapsed ? 'md:ml-20' : 'md:ml-64'}
            pt-20 md:pt-0
         `}
      >
        {children}
      </div>
    </div>
  );
}
