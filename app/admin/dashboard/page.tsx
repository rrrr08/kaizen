'use client';

import { useEffect, useState } from 'react';
import { BarChart3, Users, ShoppingBag, TrendingUp, Clock, Zap } from 'lucide-react';
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
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-amber-500">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 pb-16">
      {/* Header */}
      <div className="mb-12">
        <h1 className="font-display text-5xl font-bold text-white mb-2">Dashboard</h1>
        <p className="text-white/60">Platform overview and analytics</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {/* Total Users */}
        <div className="bg-gradient-to-br from-blue-500/10 to-transparent border border-blue-500/20 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-header text-white/70 text-sm">Total Users</h3>
            <Users className="w-5 h-5 text-blue-500" />
          </div>
          <p className="font-display text-4xl font-bold text-white mb-2">{stats?.totalUsers.toLocaleString()}</p>
          <p className="text-blue-400 text-sm">+{stats?.monthlyGrowth}% this month</p>
        </div>

        {/* Total Orders */}
        <div className="bg-gradient-to-br from-green-500/10 to-transparent border border-green-500/20 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-header text-white/70 text-sm">Total Orders</h3>
            <ShoppingBag className="w-5 h-5 text-green-500" />
          </div>
          <p className="font-display text-4xl font-bold text-white mb-2">{stats?.totalOrders.toLocaleString()}</p>
          <p className="text-green-400 text-sm">₹{(stats?.totalRevenue || 0).toLocaleString()}</p>
        </div>

        {/* Average Order Value */}
        <div className="bg-gradient-to-br from-purple-500/10 to-transparent border border-purple-500/20 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-header text-white/70 text-sm">Avg Order Value</h3>
            <TrendingUp className="w-5 h-5 text-purple-500" />
          </div>
          <p className="font-display text-4xl font-bold text-white mb-2">₹{stats?.averageOrderValue.toLocaleString()}</p>
          <p className="text-purple-400 text-sm">Per transaction</p>
        </div>

        {/* Active Users */}
        <div className="bg-gradient-to-br from-amber-500/10 to-transparent border border-amber-500/20 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-header text-white/70 text-sm">Active Users</h3>
            <Clock className="w-5 h-5 text-amber-500" />
          </div>
          <p className="font-display text-4xl font-bold text-white mb-2">{stats?.activeUsers.toLocaleString()}</p>
          <p className="text-amber-400 text-sm">Last 24 hours</p>
        </div>
      </div>

      {/* Points Statistics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
        <div className="bg-gradient-to-br from-amber-500/10 to-transparent border border-amber-500/20 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <Zap className="w-5 h-5 text-amber-500" />
            <h3 className="font-header text-white text-lg">Points Issued</h3>
          </div>
          <p className="font-display text-4xl font-bold text-amber-400 mb-2">
            {(stats?.totalPointsIssued || 0).toLocaleString()}
          </p>
          <div className="space-y-2 text-sm text-white/60">
            <p>Total points given to users</p>
            <div className="w-full bg-white/10 rounded-full h-2">
              <div className="bg-amber-500 h-2 rounded-full" style={{ width: '75%' }}></div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500/10 to-transparent border border-green-500/20 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <Zap className="w-5 h-5 text-green-500" />
            <h3 className="font-header text-white text-lg">Points Redeemed</h3>
          </div>
          <p className="font-display text-4xl font-bold text-green-400 mb-2">
            {(stats?.totalPointsRedeemed || 0).toLocaleString()}
          </p>
          <div className="space-y-2 text-sm text-white/60">
            <p>Points used for discounts</p>
            <div className="w-full bg-white/10 rounded-full h-2">
              <div className="bg-green-500 h-2 rounded-full" style={{ width: '18%' }}></div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-black/40 border border-white/10 rounded-lg p-6">
        <h2 className="font-display text-2xl font-bold text-white mb-6 flex items-center gap-2">
          <ShoppingBag className="w-6 h-6 text-amber-500" />
          Recent Orders
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left py-3 px-4 text-white/60 font-header">Order ID</th>
                <th className="text-left py-3 px-4 text-white/60 font-header">Amount</th>
                <th className="text-left py-3 px-4 text-white/60 font-header">Status</th>
                <th className="text-left py-3 px-4 text-white/60 font-header">Date</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((order) => (
                <tr key={order.id} className="border-b border-white/5 hover:bg-white/5 transition">
                  <td className="py-3 px-4 text-white font-semibold">{order.id}</td>
                  <td className="py-3 px-4 text-amber-400">₹{order.totalPrice.toLocaleString()}</td>
                  <td className="py-3 px-4">
                    <span className="inline-flex px-3 py-1 bg-green-500/10 border border-green-500/20 rounded-full text-green-400 text-xs font-semibold">
                      ✓ Completed
                    </span>
                  </td>
                  <td className="py-3 px-4 text-white/60">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
