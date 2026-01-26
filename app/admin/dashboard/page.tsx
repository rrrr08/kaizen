'use client';

import { useEffect, useState } from 'react';
import { BarChart3, Users, ShoppingBag, TrendingUp, Clock, Zap, Calendar, Package, ArrowUpRight, ArrowDownRight, Activity } from 'lucide-react';
import { useAuth } from '@/app/context/AuthContext';
import { useRouter } from 'next/navigation';
import { getDocs, collection, query, orderBy, limit, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { USER_ROLES, ROLE_LABELS } from '@/lib/roles';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import LivePulse from '@/components/admin/LivePulse';
import DeepAnalytics from '@/components/admin/DeepAnalytics';

interface DashboardStats {
  totalUsers: number;
  totalOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  totalPointsIssued: number;
  totalPointsRedeemed: number;
  activeUsers: number;
  monthlyGrowth: number;
  usersByRole: Record<string, number>;
  recentGrowthCount: number;
  totalEvents: number;
  occupancyRate: number;
  totalProducts: number;
  outOfStockCount: number;
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
    loadDashboardData();
  }, [user]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // 1. Fetch Users Data
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const totalUsers = usersSnapshot.size;
      const usersByRole: Record<string, number> = {};
      let recentGrowthCount = 0;
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      usersSnapshot.docs.forEach(doc => {
        const data = doc.data();
        const role = data.role || 'member';
        usersByRole[role] = (usersByRole[role] || 0) + 1;

        if (data.created_at) {
          const createdAt = (data.created_at as Timestamp).toDate ? (data.created_at as Timestamp).toDate() : new Date(data.created_at);
          if (createdAt > thirtyDaysAgo) {
            recentGrowthCount++;
          }
        }
      });

      // 2. Fetch Orders Data
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
          createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date(data.createdAt).toISOString() || new Date().toISOString(),
          paymentStatus: data.paymentStatus || 'completed',
        });
      });

      // 3. Fetch Events Data
      const eventsSnapshot = await getDocs(collection(db, 'events'));
      const totalEvents = eventsSnapshot.size;
      let totalRegistrations = 0;
      let totalCapacity = 0;
      eventsSnapshot.docs.forEach(doc => {
        const data = doc.data();
        totalRegistrations += data.registered || 0;
        totalCapacity += data.capacity || 0;
      });
      const occupancyRate = totalCapacity > 0 ? Math.round((totalRegistrations / totalCapacity) * 100) : 0;

      // 4. Fetch Products Data
      const productsSnapshot = await getDocs(collection(db, 'products'));
      const totalProducts = productsSnapshot.size;
      const outOfStockCount = productsSnapshot.docs.filter(doc => (doc.data().stock || 0) <= 0).length;

      // Sort recent orders
      const recent = recentOrdersList
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5);

      setStats({
        totalUsers,
        totalOrders,
        totalRevenue,
        averageOrderValue: totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0,
        totalPointsIssued,
        totalPointsRedeemed,
        activeUsers: Math.ceil(totalUsers * 0.15), // Simulated active users
        monthlyGrowth: parseFloat(((recentGrowthCount / (totalUsers - recentGrowthCount || 1)) * 100).toFixed(1)),
        usersByRole,
        recentGrowthCount,
        totalEvents,
        occupancyRate,
        totalProducts,
        outOfStockCount
      });
      setRecentOrders(recent);
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ['#6C5CE7', '#00B894', '#FFD93D', '#FF7675', '#74B9FF', '#A29BFE'];
  const roleData = stats ? Object.entries(stats.usersByRole).map(([name, value]) => ({ name: ROLE_LABELS[name] || name, value })) : [];

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
    <div className="p-4 pb-16 md:p-8 md:pb-16 min-h-screen bg-[#FFFDF5]">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 md:mb-12 border-b-2 border-black pb-6 md:pb-8"
      >
        <div className="flex items-center gap-3 md:gap-4 mb-2">
          <div className="bg-[#FFD93D] p-2 rounded-lg border-2 border-black neo-shadow-sm">
            <Activity className="w-5 h-5 md:w-6 md:h-6 text-black" />
          </div>
          <h1 className="font-header text-3xl md:text-6xl font-black text-black uppercase tracking-tighter">DASHBOARD</h1>
        </div>
        <p className="text-black/60 font-bold text-sm md:text-xl md:ml-12 lg:ml-12">Platform overview and real-time statistics</p>
      </motion.div>

      {/* Deep Analytics Section */}
      <DeepAnalytics />

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8 md:mb-12">
        <StatCard
          title="Total Users"
          value={stats?.totalUsers || 0}
          icon={Users}
          color="#6C5CE7"
          detail={`+${stats?.recentGrowthCount} this month`}
        />
        <StatCard
          title="Total Orders"
          value={stats?.totalOrders || 0}
          icon={ShoppingBag}
          color="#00B894"
          detail={`₹${(stats?.totalRevenue || 0).toLocaleString()} Revenue`}
        />
        <StatCard
          title="Avg Order"
          value={`₹${stats?.averageOrderValue || 0}`}
          icon={TrendingUp}
          color="#FF7675"
          detail="Per Transaction"
        />
        <StatCard
          title="Active Now"
          value={stats?.activeUsers || 0}
          icon={Clock}
          color="#FFD93D"
          detail="Estimated active"
        />
      </div>

      <div className="flex flex-col lg:grid lg:grid-cols-3 gap-6 mb-8">
        {/* User Distribution Chart */}
        <div className="lg:col-span-2 bg-white p-4 md:p-6 rounded-2xl neo-border shadow-sm flex flex-col">
          <h3 className="text-lg md:text-xl font-black mb-4 md:mb-6 uppercase italic">User Distribution</h3>
          <div className="w-full relative" style={{ height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={roleData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={90}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                >
                  {roleData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip cursor={{ fill: 'transparent' }} />
              </PieChart>
            </ResponsiveContainer>
            {/* Legend Overlay */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
              <span className="text-2xl md:text-3xl font-black">{stats?.totalUsers || 0}</span>
              <p className="text-[10px] md:text-xs font-bold text-gray-400 uppercase">Users</p>
            </div>
          </div>
          <div className="mt-4 flex justify-center gap-x-4 gap-y-2 flex-wrap">
            {roleData.map((entry, index) => (
              <div key={index} className="flex items-center gap-2 text-xs font-bold uppercase">
                <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                <span>{entry.name} ({entry.value})</span>
              </div>
            ))}
          </div>
        </div>

        {/* Live Pulse Feed */}
        <div className="lg:col-span-1 h-[400px] lg:h-auto">
          <LivePulse />
        </div>
      </div>

      {/* Operations Overview */}
      <h2 className="font-header text-xl md:text-3xl font-black text-black mb-4 md:mb-6 uppercase tracking-tighter flex items-center gap-2">
        <Zap className="w-5 h-5 md:w-6 md:h-6 text-[#FFD93D]" fill="#FFD93D" />
        Operations Overview
      </h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-8 mb-8 md:mb-12">
        {/* Events Statistics */}
        <div className="bg-white border-2 border-black rounded-[25px] p-4 md:p-8 neo-shadow">
          <div className="flex items-center justify-between mb-6 md:mb-8">
            <h3 className="font-header text-lg md:text-2xl font-black text-black uppercase tracking-tight flex items-center gap-3">
              <div className="bg-[#FF7675] p-2 rounded-lg border-2 border-black">
                <Calendar className="w-4 h-4 md:w-5 md:h-5 text-white" />
              </div>
              Events Performance
            </h3>
            <Link href="/admin/events" className="text-[10px] font-black uppercase tracking-widest text-[#6C5CE7] hover:underline underline-offset-4 whitespace-nowrap">Manage Events &rarr;</Link>
          </div>
          <div className="grid grid-cols-2 gap-4 md:gap-8">
            <div>
              <p className="text-black/40 text-[10px] md:text-xs font-black uppercase tracking-widest mb-1">Total Events</p>
              <p className="text-2xl md:text-4xl font-black text-black">{stats?.totalEvents}</p>
            </div>
            <div>
              <p className="text-black/40 text-[10px] md:text-xs font-black uppercase tracking-widest mb-1">Occupancy</p>
              <div className="flex items-end gap-2">
                <p className="text-2xl md:text-4xl font-black text-[#00B894]">{stats?.occupancyRate}%</p>
                <div className="h-6 w-full bg-gray-100 rounded-full border border-black overflow-hidden mb-2 hidden sm:block">
                  <div className="h-full bg-[#00B894]" style={{ width: `${stats?.occupancyRate}%` }} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Shop Statistics */}
        <div className="bg-white border-2 border-black rounded-[25px] p-4 md:p-8 neo-shadow">
          <div className="flex items-center justify-between mb-6 md:mb-8">
            <h3 className="font-header text-lg md:text-2xl font-black text-black uppercase tracking-tight flex items-center gap-3">
              <div className="bg-[#74B9FF] p-2 rounded-lg border-2 border-black">
                <Package className="w-4 h-4 md:w-5 md:h-5 text-white" />
              </div>
              Shop Metrics
            </h3>
            <Link href="/admin/products" className="text-[10px] font-black uppercase tracking-widest text-[#6C5CE7] hover:underline underline-offset-4 whitespace-nowrap">Manage Shop &rarr;</Link>
          </div>
          <div className="grid grid-cols-2 gap-4 md:gap-8">
            <div>
              <p className="text-black/40 text-[10px] md:text-xs font-black uppercase tracking-widest mb-1">Live Products</p>
              <p className="text-2xl md:text-4xl font-black text-black">{stats?.totalProducts}</p>
            </div>
            <div>
              <p className="text-black/40 text-[10px] md:text-xs font-black uppercase tracking-widest mb-1">Stock Alerts</p>
              <p className={`text-2xl md:text-4xl font-black ${stats?.outOfStockCount ? 'text-[#FF7675]' : 'text-black/20'}`}>
                {stats?.outOfStockCount || 'None'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        {/* Recent Orders Table */}
        <div className="lg:col-span-2 bg-white border-2 border-black rounded-[25px] p-4 md:p-8 neo-shadow overflow-hidden">
          <h2 className="font-header text-lg md:text-2xl font-black text-black mb-6 md:mb-8 flex items-center gap-3 uppercase tracking-tighter">
            <div className="bg-black p-2 rounded-lg">
              <ShoppingBag className="w-4 h-4 text-white" />
            </div>
            RECENT ORDERS
          </h2>
          <div className="overflow-x-auto -mx-4 md:mx-0 px-4 md:px-0">
            <table className="w-full text-left border-collapse min-w-[500px] md:min-w-0">
              <thead>
                <tr className="border-b-2 border-black">
                  <th className="py-4 px-2 text-black font-black uppercase tracking-wider text-[10px]">ID</th>
                  <th className="py-4 px-2 text-black font-black uppercase tracking-wider text-[10px]">Total</th>
                  <th className="py-4 px-2 text-black font-black uppercase tracking-wider text-[10px]">Status</th>
                  <th className="py-4 px-2 text-black font-black uppercase tracking-wider text-[10px]">Date</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr key={order.id} className="border-b border-black/5 hover:bg-[#FFFDF5] transition group">
                    <td className="py-4 px-2 text-black font-bold font-mono text-xs">{order.id.substring(0, 8)}</td>
                    <td className="py-4 px-2 text-black font-black text-md">₹{order.totalPrice.toLocaleString()}</td>
                    <td className="py-4 px-2">
                      <span className="px-2 py-0.5 bg-[#00B894] border border-black rounded text-black text-[10px] font-black uppercase whitespace-nowrap">
                        {order.paymentStatus}
                      </span>
                    </td>
                    <td className="py-4 px-2 text-black/40 font-bold text-[10px] uppercase whitespace-nowrap">
                      {new Date(order.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Extensive Quick Actions */}
        <div className="bg-[#FFFDF5] border-2 border-black rounded-[25px] p-4 md:p-8 neo-shadow border-dashed">
          <h2 className="font-header text-lg md:text-2xl font-black text-black mb-6 md:mb-8 uppercase tracking-tighter">
            🚀 Quick Links
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3">
            <QuickLink href="/admin/game-settings" label="Game Console" color="#FFD93D" desc="Consolidated game management" />
            <QuickLink href="/admin/users" label="Users" color="#6C5CE7" desc="Member database & roles" />
            <QuickLink href="/admin/events" label="Events" color="#FF7675" desc="Booking & registrations" />
            <QuickLink href="/admin/products" label="Shop" color="#00B894" desc="Inventory & variants" />
            <QuickLink href="/admin/blog" label="The Blog" color="#74B9FF" desc="Content & publishing" />
            <QuickLink href="/admin/settings" label="Site Settings" color="#A29BFE" desc="Global configurations" />
          </div>
        </div>
      </div>
    </div>
  );
}

// Reusable Sub-components
const StatCard = ({ title, value, icon: Icon, color, detail }: any) => (
  <motion.div
    whileHover={{ y: -4, x: 4 }}
    className="border-2 border-black rounded-[20px] p-4 md:p-6 neo-shadow bg-white hover:shadow-none transition-all cursor-default"
  >
    <div className="flex items-center justify-between mb-4">
      <p className="font-black text-black/40 text-[10px] uppercase tracking-widest">{title}</p>
      <div className="p-2 rounded-lg border-2 border-black neo-shadow-sm" style={{ backgroundColor: color }}>
        <Icon className="w-4 h-4 text-white" />
      </div>
    </div>
    <p className="font-header text-2xl md:text-4xl font-black text-black mb-2 truncate">{value}</p>
    <p className="text-[10px] font-bold text-black/60 bg-[#FFFDF5] border border-black/10 px-2 py-1 rounded inline-block uppercase tracking-wider">{detail}</p>
  </motion.div>
);

const QuickLink = ({ href, label, color, desc }: any) => (
  <Link
    href={href}
    className="flex items-center gap-4 p-3 md:p-4 bg-white border-2 border-black rounded-xl hover:translate-x-1 hover:border-[#6C5CE7] transition-all group"
  >
    <div className="w-2 h-10 rounded-full border border-black/20 flex-shrink-0" style={{ backgroundColor: color }} />
    <div className="min-w-0">
      <h4 className="font-black text-black text-sm uppercase group-hover:text-[#6C5CE7] truncate">{label}</h4>
      <p className="text-[10px] font-bold text-black/40 truncate">{desc}</p>
    </div>
  </Link>
);
