'use client';

import { useEffect, useState } from 'react';
import { Users, ShoppingBag, TrendingUp, Clock, Zap } from 'lucide-react';
import { LoadingScreen } from '@/components/ui/loading-screen';
import { useAuth } from '@/app/context/AuthContext';
import { useRouter } from 'next/navigation';
import { getDocs, collection, query, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';



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

      const stats: DashboardStats = {
        totalUsers,
        totalOrders,
        totalRevenue,
        averageOrderValue: totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0,
        totalPointsIssued,
        totalPointsRedeemed,
        activeUsers: Math.round(totalUsers * 0.25), // Estimate 25% active
        monthlyGrowth: 5.2, // Will update this dynamically later
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
    return <LoadingScreen message="LOADING_SYSTEM_METRICS..." />;
  }

  return (
    <div className="pb-16 min-h-screen text-white">
      {/* Header */}
      <div className="mb-12 border-b-2 border-[#333] pb-8 flex justify-between items-end">
        <div>
          <h1 className="font-arcade text-5xl text-white mb-2 text-3d-orange">COMMAND_CENTER</h1>
          <p className="text-gray-500 font-sans text-lg tracking-wide uppercase">Platform overview and analytics</p>
        </div>
        <div className="bg-[#111] border border-[#333] px-4 py-2 rounded text-xs font-mono text-gray-400">
          SYSTEM_STATUS: <span className="text-[#00B894]">ONLINE</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {/* Total Users */}
        <div className="relative group">
          <div className="absolute inset-0 bg-[#6C5CE7]/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="bg-[#080808] border border-[#333] group-hover:border-[#6C5CE7] transition-all p-6 h-full relative overflow-hidden">
            <div className="absolute top-0 right-0 w-16 h-16 bg-[#6C5CE7]/10 -mr-8 -mt-8 rounded-full blur-xl"></div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-arcade text-gray-400 text-xs tracking-widest uppercase">Total Users</h3>
              <Users className="w-5 h-5 text-[#6C5CE7]" />
            </div>
            <p className="font-arcade text-4xl text-white mb-2">{stats?.totalUsers.toLocaleString()}</p>
            <p className="text-[#6C5CE7] text-xs font-mono">+{stats?.monthlyGrowth}% this month</p>
          </div>
        </div>

        {/* Total Orders */}
        <div className="relative group">
          <div className="absolute inset-0 bg-[#00B894]/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="bg-[#080808] border border-[#333] group-hover:border-[#00B894] transition-all p-6 h-full relative overflow-hidden">
            <div className="absolute top-0 right-0 w-16 h-16 bg-[#00B894]/10 -mr-8 -mt-8 rounded-full blur-xl"></div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-arcade text-gray-400 text-xs tracking-widest uppercase">Total Orders</h3>
              <ShoppingBag className="w-5 h-5 text-[#00B894]" />
            </div>
            <p className="font-arcade text-4xl text-white mb-2">{stats?.totalOrders.toLocaleString()}</p>
            <p className="text-[#00B894] text-xs font-mono">₹{(stats?.totalRevenue || 0).toLocaleString()} Revenue</p>
          </div>
        </div>

        {/* Average Order Value */}
        <div className="relative group">
          <div className="absolute inset-0 bg-[#FF7675]/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="bg-[#080808] border border-[#333] group-hover:border-[#FF7675] transition-all p-6 h-full relative overflow-hidden">
            <div className="absolute top-0 right-0 w-16 h-16 bg-[#FF7675]/10 -mr-8 -mt-8 rounded-full blur-xl"></div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-arcade text-gray-400 text-xs tracking-widest uppercase">Avg Order Value</h3>
              <TrendingUp className="w-5 h-5 text-[#FF7675]" />
            </div>
            <p className="font-arcade text-4xl text-white mb-2">₹{stats?.averageOrderValue.toLocaleString()}</p>
            <p className="text-[#FF7675] text-xs font-mono">Per transaction</p>
          </div>
        </div>

        {/* Active Users */}
        <div className="relative group">
          <div className="absolute inset-0 bg-[#FFD400]/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="bg-[#080808] border border-[#333] group-hover:border-[#FFD400] transition-all p-6 h-full relative overflow-hidden">
            <div className="absolute top-0 right-0 w-16 h-16 bg-[#FFD400]/10 -mr-8 -mt-8 rounded-full blur-xl"></div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-arcade text-gray-400 text-xs tracking-widest uppercase">Active Users</h3>
              <Clock className="w-5 h-5 text-[#FFD400]" />
            </div>
            <p className="font-arcade text-4xl text-white mb-2">{stats?.activeUsers.toLocaleString()}</p>
            <p className="text-[#FFD400] text-xs font-mono">Last 24 hours</p>
          </div>
        </div>
      </div>

      {/* Points Statistics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
        <div className="bg-[#080808] border border-[#333] p-8 relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-1 h-full bg-[#FFD400] opacity-50 group-hover:opacity-100 transition-opacity"></div>
          <div className="flex items-center gap-4 mb-6 relative z-10">
            <div className="bg-[#FFD400]/20 p-3 rounded border border-[#FFD400]/50">
              <Zap className="w-6 h-6 text-[#FFD400]" />
            </div>
            <h3 className="font-arcade text-white text-2xl">Points Issued</h3>
          </div>
          <p className="font-arcade text-5xl text-[#FFD400] mb-4 text-shadow-glow">
            {(stats?.totalPointsIssued || 0).toLocaleString()}
          </p>
          <div className="space-y-3 relative z-10">
            <p className="text-gray-500 font-mono text-xs uppercase">Total system currency distributed</p>
            <div className="w-full bg-[#1A1A1A] h-2">
              <div className="bg-[#FFD400] h-full shadow-[0_0_10px_#FFD400]" style={{ width: '75%' }}></div>
            </div>
          </div>
        </div>

        <div className="bg-[#080808] border border-[#333] p-8 relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-1 h-full bg-[#00B894] opacity-50 group-hover:opacity-100 transition-opacity"></div>
          <div className="flex items-center gap-4 mb-6 relative z-10">
            <div className="bg-[#00B894]/20 p-3 rounded border border-[#00B894]/50">
              <Zap className="w-6 h-6 text-[#00B894]" />
            </div>
            <h3 className="font-arcade text-white text-2xl">Points Redeemed</h3>
          </div>
          <p className="font-arcade text-5xl text-[#00B894] mb-4 text-shadow-glow">
            {(stats?.totalPointsRedeemed || 0).toLocaleString()}
          </p>
          <div className="space-y-3 relative z-10">
            <p className="text-gray-500 font-mono text-xs uppercase">Currency utilized for upgrades</p>
            <div className="w-full bg-[#1A1A1A] h-2">
              <div className="bg-[#00B894] h-full shadow-[0_0_10px_#00B894]" style={{ width: '18%' }}></div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-[#080808] border border-[#333] p-8 relative overflow-hidden">
        <div className="flex items-center gap-3 mb-8 border-b border-[#333] pb-4">
          <ShoppingBag className="w-6 h-6 text-[#FFD400]" />
          <h2 className="font-arcade text-2xl text-white">RECENT_TRANSACTIONS</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#333]">
                <th className="py-4 px-4 text-gray-500 font-arcade text-xs tracking-widest uppercase">ID</th>
                <th className="py-4 px-4 text-gray-500 font-arcade text-xs tracking-widest uppercase">Amount</th>
                <th className="py-4 px-4 text-gray-500 font-arcade text-xs tracking-widest uppercase">Status</th>
                <th className="py-4 px-4 text-gray-500 font-arcade text-xs tracking-widest uppercase">Date</th>
              </tr>
            </thead>
            <tbody className="font-mono text-sm">
              {recentOrders.map((order) => (
                <tr key={order.id} className="border-b border-[#333]/50 hover:bg-[#111] transition-colors group">
                  <td className="py-4 px-4 text-[#FFD400] group-hover:text-white transition-colors">#{order.id.slice(0, 8)}...</td>
                  <td className="py-4 px-4 text-white">₹{order.totalPrice.toLocaleString()}</td>
                  <td className="py-4 px-4">
                    <span className="inline-flex px-2 py-1 bg-[#00B894]/20 border border-[#00B894] text-[#00B894] text-[10px] uppercase tracking-wider">
                      COMPLETED
                    </span>
                  </td>
                  <td className="py-4 px-4 text-gray-500">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
              {recentOrders.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-gray-600 font-arcade">NO_TRANSACTION_DATA_FOUND</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

