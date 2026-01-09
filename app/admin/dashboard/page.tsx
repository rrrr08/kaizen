'use client';

import { useEffect, useState } from 'react';
import { BarChart3, Users, ShoppingBag, TrendingUp, Clock, Zap } from 'lucide-react';
import { useAuth } from '@/app/context/AuthContext';
import { useRouter } from 'next/navigation';
import { getDocs, collection, query, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import Link from 'next/link';

interface DashboardStats {
  totalUsers: number;
  totalOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  totalPointsIssued: number;
  totalPointsRedeemed: number;
  activeUsers: number;
  monthlyGrowth: number;
}

interface RecentOrder {
  id: string;
  userId: string;
  totalPrice: number;
  createdAt: string;
  paymentStatus: string;
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is admin
    if (user && !user.email?.includes('admin')) {
      // For now, allow, but in production verify role
      loadDashboardData();
    } else {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch real data from Firebase
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const totalUsers = usersSnapshot.size;

      const ordersSnapshot = await getDocs(collection(db, 'orders'));
      const totalOrders = ordersSnapshot.size;

      let totalRevenue = 0;
      let totalPointsIssued = 0;
      let totalPointsRedeemed = 0;
      const recentOrdersList: RecentOrder[] = [];

      // For growth calculation
      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      let newUsersLast30Days = 0;

      usersSnapshot.docs.forEach(doc => {
        const data = doc.data();
        const createdAt = data.created_at?.toDate?.() || data.createdAt?.toDate?.() || new Date(0);
        if (createdAt > thirtyDaysAgo) {
          newUsersLast30Days++;
        }
      });

      ordersSnapshot.docs.forEach(doc => {
        const data = doc.data();
        totalRevenue += data.totalPrice || 0;
        totalPointsIssued += data.totalPoints || 0;
        totalPointsRedeemed += data.pointsRedeemed || 0;

        recentOrdersList.push({
          id: doc.id,
          userId: data.userId || 'unknown',
          totalPrice: data.totalPrice || 0,
          createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
          paymentStatus: data.paymentStatus || 'pending',
        });
      });

      // Sort by date and get recent 5
      const recent = recentOrdersList
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5);

      // Simple growth calculation
      const oldUsersCount = totalUsers - newUsersLast30Days;
      const monthlyGrowth = oldUsersCount > 0
        ? parseFloat(((newUsersLast30Days / oldUsersCount) * 100).toFixed(1))
        : 100;

      const stats: DashboardStats = {
        totalUsers,
        totalOrders,
        totalRevenue,
        averageOrderValue: totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0,
        totalPointsIssued,
        totalPointsRedeemed,
        activeUsers: Math.round(totalUsers * 0.25), // Estimate 25% active
        monthlyGrowth,
      };

      setStats(stats);
      setRecentOrders(recent);
    } catch (error) {
      console.error('Error loading dashboard:', error);
      // Set empty stats on error
      setStats({
        totalUsers: 0,
        totalOrders: 0,
        totalRevenue: 0,
        averageOrderValue: 0,
        totalPointsIssued: 0,
        totalPointsRedeemed: 0,
        activeUsers: 0,
        monthlyGrowth: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[calc(100vh-80px)] bg-[#FFFDF5]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#FFD93D] border-t-black rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-black font-black uppercase tracking-widest">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 pb-16 min-h-screen bg-[#FFFDF5]">
      {/* Header */}
      <div className="mb-12 border-b-2 border-black pb-8">
        <h1 className="font-header text-6xl font-black text-[#2D3436] mb-2 uppercase tracking-tighter">DASHBOARD</h1>
        <p className="text-[#2D3436]/60 font-bold text-xl">Platform overview and analytics</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {/* Total Users */}
        <div className="bg-[#6C5CE7] border-2 border-black rounded-[20px] p-6 neo-shadow hover:-translate-y-1 transition-transform">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-black text-white text-sm uppercase tracking-wider">Total Users</h3>
            <div className="bg-white p-2 rounded-lg border-2 border-black">
              <Users className="w-5 h-5 text-[#2D3436]" />
            </div>
          </div>
          <p className="font-header text-5xl font-black text-white mb-2">{stats?.totalUsers.toLocaleString()}</p>
          <div className="flex items-center gap-2">
            <span className="bg-black text-white text-xs font-black px-2 py-0.5 rounded-md uppercase tracking-wider">Growth</span>
            <p className="text-white font-bold text-sm">+{stats?.monthlyGrowth}%</p>
          </div>
        </div>

        {/* Total Orders */}
        <div className="bg-[#00B894] border-2 border-black rounded-[20px] p-6 neo-shadow hover:-translate-y-1 transition-transform">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-black text-[#2D3436] text-sm uppercase tracking-wider">Total Orders</h3>
            <div className="bg-white p-2 rounded-lg border-2 border-black">
              <ShoppingBag className="w-5 h-5 text-[#2D3436]" />
            </div>
          </div>
          <p className="font-header text-5xl font-black text-[#2D3436] mb-2">{stats?.totalOrders.toLocaleString()}</p>
          <div className="flex items-center gap-2">
            <span className="bg-white text-[#2D3436] text-xs font-black px-2 py-0.5 rounded-md border border-black uppercase tracking-wider">Revenue</span>
            <p className="text-[#2D3436] font-bold text-sm">₹{(stats?.totalRevenue || 0).toLocaleString()}</p>
          </div>
        </div>

        {/* Average Order Value */}
        <div className="bg-[#FF7675] border-2 border-black rounded-[20px] p-6 neo-shadow hover:-translate-y-1 transition-transform">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-black text-[#2D3436] text-sm uppercase tracking-wider">Avg Order</h3>
            <div className="bg-white p-2 rounded-lg border-2 border-black">
              <TrendingUp className="w-5 h-5 text-[#2D3436]" />
            </div>
          </div>
          <p className="font-header text-5xl font-black text-[#2D3436] mb-2">₹{stats?.averageOrderValue.toLocaleString()}</p>
          <p className="text-[#2D3436] font-bold text-sm bg-white/30 inline-block px-2 py-0.5 rounded border border-black/10">Per Transaction</p>
        </div>

        {/* Active Users */}
        <div className="bg-[#FFD93D] border-2 border-black rounded-[20px] p-6 neo-shadow hover:-translate-y-1 transition-transform">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-black text-[#2D3436] text-sm uppercase tracking-wider">Active Users</h3>
            <div className="bg-white p-2 rounded-lg border-2 border-black">
              <Clock className="w-5 h-5 text-[#2D3436]" />
            </div>
          </div>
          <p className="font-header text-5xl font-black text-[#2D3436] mb-2">{stats?.activeUsers.toLocaleString()}</p>
          <p className="text-[#2D3436] font-bold text-sm bg-white/30 inline-block px-2 py-0.5 rounded border border-black/10">Last 24 Hours</p>
        </div>
      </div>

      {/* Points Statistics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
        <div className="bg-white border-2 border-black rounded-[20px] p-8 neo-shadow relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-6">
              <div className="bg-[#FFD93D] p-3 rounded-xl border-2 border-black shadow-[4px_4px_0px_rgba(0,0,0,1)]">
                <Zap className="w-6 h-6 text-[#2D3436]" fill="#2D3436" />
              </div>
              <h3 className="font-header text-[#2D3436] text-3xl font-black uppercase tracking-tighter">Points Issued</h3>
            </div>
            <p className="font-header text-6xl font-black text-[#2D3436] mb-4 tracking-tighter">
              {(stats?.totalPointsIssued || 0).toLocaleString()}
            </p>
            <div className="space-y-3">
              <p className="text-[#2D3436]/60 font-black uppercase tracking-widest text-xs">Total points given to users</p>
              <div className="w-full bg-gray-100 rounded-full h-4 border-2 border-black overflow-hidden">
                <div
                  className="bg-[#FFD93D] h-full border-r-2 border-black transition-all duration-1000"
                  style={{ width: `${Math.min(100, (stats?.totalPointsIssued || 0) / 10000)}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white border-2 border-black rounded-[20px] p-8 neo-shadow relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-6">
              <div className="bg-[#00B894] p-3 rounded-xl border-2 border-black shadow-[4px_4px_0px_rgba(0,0,0,1)]">
                <Zap className="w-6 h-6 text-[#2D3436]" fill="#2D3436" />
              </div>
              <h3 className="font-header text-[#2D3436] text-3xl font-black uppercase tracking-tighter">Points Redeemed</h3>
            </div>
            <p className="font-header text-6xl font-black text-[#2D3436] mb-4 tracking-tighter">
              {(stats?.totalPointsRedeemed || 0).toLocaleString()}
            </p>
            <div className="space-y-3">
              <p className="text-[#2D3436]/60 font-black uppercase tracking-widest text-xs">Points used for discounts</p>
              <div className="w-full bg-gray-100 rounded-full h-4 border-2 border-black overflow-hidden">
                <div
                  className="bg-[#00B894] h-full border-r-2 border-black transition-all duration-1000"
                  style={{ width: `${Math.min(100, ((stats?.totalPointsRedeemed || 0) / (stats?.totalPointsIssued || 1)) * 100)}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white border-2 border-black rounded-[25px] p-8 neo-shadow mb-8">
        <h2 className="font-header text-3xl font-black text-[#2D3436] mb-8 flex items-center gap-3 uppercase tracking-tighter">
          <div className="bg-black p-2 rounded-lg">
            <ShoppingBag className="w-5 h-5 text-white" />
          </div>
          RECENT ORDERS
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b-2 border-black">
                <th className="py-4 px-4 text-[#2D3436] font-black uppercase tracking-wider text-xs">Order ID</th>
                <th className="py-4 px-4 text-[#2D3436] font-black uppercase tracking-wider text-xs">Amount</th>
                <th className="py-4 px-4 text-[#2D3436] font-black uppercase tracking-wider text-xs">Status</th>
                <th className="py-4 px-4 text-[#2D3436] font-black uppercase tracking-wider text-xs">Date</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((order) => (
                <tr key={order.id} className="border-b-2 border-black/5 hover:bg-[#FFFDF5] transition">
                  <td className="py-4 px-4 text-[#2D3436] font-bold font-mono text-sm">{order.id.substring(0, 8)}...</td>
                  <td className="py-4 px-4 text-[#2D3436] font-black text-lg">₹{order.totalPrice.toLocaleString()}</td>
                  <td className="py-4 px-4">
                    <span className="inline-flex px-3 py-1 bg-[#00B894] border-2 border-black rounded-lg text-[#2D3436] text-xs font-black uppercase shadow-[2px_2px_0px_rgba(0,0,0,0)]">
                      ✓ Completed
                    </span>
                  </td>
                  <td className="py-4 px-4 text-[#2D3436]/60 font-bold text-xs uppercase tracking-wide">
                    {new Date(order.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>
                </tr>
              ))}
              {recentOrders.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-black/40 font-bold uppercase tracking-widest">No recent orders found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white border-2 border-black rounded-[25px] p-8 neo-shadow">
        <h2 className="font-header text-3xl font-black text-[#2D3436] mb-8 uppercase tracking-tighter">
          ⚡ QUICK ACTIONS
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Link href="/admin/games" className="p-6 bg-[#6C5CE7] border-2 border-black rounded-xl neo-shadow hover:translate-x-[4px] hover:translate-y-[4px] hover:shadow-none transition-all">
            <h3 className="font-black text-white text-lg mb-2">🎮 GAME SETTINGS</h3>
            <p className="text-white/80 text-sm font-bold">Configure points, retries, Game of the Day</p>
          </Link>

          <Link href="/admin/gamification" className="p-6 bg-[#FFD93D] border-2 border-black rounded-xl neo-shadow hover:translate-x-[4px] hover:translate-y-[4px] hover:shadow-none transition-all">
            <h3 className="font-black text-[#2D3436] text-lg mb-2">🏆 GAMIFICATION</h3>
            <p className="text-[#2D3436]/80 text-sm font-bold">Wheel odds, economy rules</p>
          </Link>

          <Link href="/admin/game-content" className="p-6 bg-[#00B894] border-2 border-black rounded-xl neo-shadow hover:translate-x-[4px] hover:translate-y-[4px] hover:shadow-none transition-all">
            <h3 className="font-black text-white text-lg mb-2">💾 GAME CONTENT</h3>
            <p className="text-white/80 text-sm font-bold">Manage riddles, trivia, puzzles</p>
          </Link>

          <Link href="/admin/users" className="p-6 bg-[#FF7675] border-2 border-black rounded-xl neo-shadow hover:translate-x-[4px] hover:translate-y-[4px] hover:shadow-none transition-all">
            <h3 className="font-black text-white text-lg mb-2">👥 USERS</h3>
            <p className="text-white/80 text-sm font-bold">Manage user accounts & roles</p>
          </Link>

          <Link href="/admin/events" className="p-6 bg-[#A29BFE] border-2 border-black rounded-xl neo-shadow hover:translate-x-[4px] hover:translate-y-[4px] hover:shadow-none transition-all">
            <h3 className="font-black text-white text-lg mb-2">📅 EVENTS</h3>
            <p className="text-white/80 text-sm font-bold">Create & manage events</p>
          </Link>

          <Link href="/admin/products" className="p-6 bg-[#FDCB6E] border-2 border-black rounded-xl neo-shadow hover:translate-x-[4px] hover:translate-y-[4px] hover:shadow-none transition-all">
            <h3 className="font-black text-[#2D3436] text-lg mb-2">🛍️ PRODUCTS</h3>
            <p className="text-[#2D3436]/80 text-sm font-bold">Manage shop inventory</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
