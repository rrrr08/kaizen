'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart3,
  Users,
  ShoppingCart,
  TrendingUp,
  Calendar,
  Eye,
  Heart,
  MessageCircle,
  Package,
  DollarSign,
  Activity,
  Globe,
  LucideIcon
} from 'lucide-react';
import { getDocs, collection, query, where, orderBy, limit, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { USER_ROLES, ROLE_LABELS } from '@/lib/roles';
import RoleProtected from '@/components/auth/RoleProtected';

// TypeScript Interfaces
interface UserCreationDate {
  date: Date;
  role: string;
}

interface Analytics {
  totalUsers: number;
  usersByRole: Record<string, number>;
  userCreationDates: UserCreationDate[];
}

interface UserData {
  id: string;
  role?: string;
  created_at?: Timestamp | Date | string;
  [key: string]: any;
}

interface StatsCard {
  title: string;
  value: number | string;
  change: string;
  icon: LucideIcon;
  color: string;
  bgColor: string;
  textColor: string;
}

interface RoleCard {
  role: string;
  count: number;
  percentage: string;
}

const AdminAnalyticsPage: React.FC = () => {
  const [analytics, setAnalytics] = useState<Analytics>({
    totalUsers: 0,
    usersByRole: {},
    userCreationDates: []
  });
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const fetchAnalyticsData = async (): Promise<void> => {
    try {
      setLoading(true);

      // Fetch users data
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const users = usersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as UserData[];

      // Count users by role (only valid roles)
      const usersByRole = users.reduce((acc: Record<string, number>, user: UserData) => {
        const role = user.role || 'member';
        // Only count valid roles defined in USER_ROLES
        // Validate role and set 'member' as default
        const validRole = Object.values(USER_ROLES).includes(role) ? role : 'member';
        acc[validRole] = (acc[validRole] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      // Get user creation dates for growth analysis
      const userCreationDates: UserCreationDate[] = users
        .filter((user: UserData) => user.created_at)
        .map((user: UserData) => {
          const createdAt = user.created_at as Timestamp | Date | string;
          const date = (createdAt as any).toDate ? (createdAt as Timestamp).toDate() : new Date(createdAt as Date | string);
          return {
            date,
            role: user.role || 'member'
          };
        })
        .sort((a, b) => a.date.getTime() - b.date.getTime());

      setAnalytics({
        totalUsers: users.length,
        usersByRole,
        userCreationDates
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate user growth from creation dates
  const getRecentGrowth = (): number => {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const recentUsers = analytics.userCreationDates.filter((user: UserCreationDate) => user.date > thirtyDaysAgo);
    return recentUsers.length;
  };

  const recentGrowth: number = getRecentGrowth();
  const growthPercentage: string = analytics.totalUsers > 0 ? ((recentGrowth / analytics.totalUsers) * 100).toFixed(1) : '0';

  const statsCards: StatsCard[] = [
    {
      title: 'Total Users',
      value: analytics.totalUsers,
      change: `+${recentGrowth} this month`,
      icon: Users,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600'
    }
  ];

  const roleCards: RoleCard[] = Object.entries(analytics.usersByRole).map(([role, count]: [string, number]): RoleCard => ({
    role,
    count,
    percentage: ((count / analytics.totalUsers) * 100).toFixed(1)
  }));

  if (loading) {
    return (
      <RoleProtected allowedRoles={[USER_ROLES.ADMIN]}>
        <div className="min-h-screen bg-[#FFFDF5] pt-24 pb-8 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-[#FFD93D] border-t-black rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-black font-black uppercase tracking-widest">Loading analytics...</p>
          </div>
        </div>
      </RoleProtected>
    );
  }

  return (
    <RoleProtected allowedRoles={[USER_ROLES.ADMIN]}>
      <div className="min-h-screen bg-[#FFFDF5] pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12 border-b-2 border-black pb-12"
          >
            <div className="flex items-center justify-center mb-6">
              <div className="p-4 bg-[#FFD93D] border-2 border-black rounded-xl neo-shadow">
                <BarChart3 className="w-10 h-10 text-black" />
              </div>
            </div>
            <h1 className="text-6xl font-header font-black text-black mb-4 tracking-tighter uppercase">
              ANALYTICS & REPORTS
            </h1>
            <p className="text-xl text-black/60 max-w-2xl mx-auto font-bold">
              Monitor platform performance and user engagement metrics.
            </p>
          </motion.div>

          {/* Stats Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12"
          >
            {statsCards.map((stat, index) => {
              const IconComponent = stat.icon;
              return (
                <motion.div
                  key={stat.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ y: -5, transition: { duration: 0.2 } }}
                  className="bg-white rounded-[20px] border-2 border-black p-8 hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] transition-all duration-300 neo-shadow"
                >
                  <div className="flex items-start justify-between mb-6">
                    <div className="p-3 rounded-xl bg-[#6C5CE7] border-2 border-black text-white">
                      <IconComponent className="w-6 h-6" />
                    </div>
                    <span className="text-xs font-black text-black bg-[#00B894] px-3 py-1 rounded-lg border-2 border-black uppercase tracking-wider">
                      {stat.change}
                    </span>
                  </div>
                  <h3 className="text-4xl font-black text-black mb-2 font-header">
                    {typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}
                  </h3>
                  <p className="text-sm font-black text-black/40 uppercase tracking-widest">{stat.title}</p>
                </motion.div>
              );
            })}
          </motion.div>

          {/* User Roles Distribution */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="bg-white rounded-[25px] border-2 border-black p-8 mb-12 neo-shadow"
          >
            <div className="flex items-center justify-center mb-12">
              <div className="p-3 bg-[#FF7675] border-2 border-black rounded-xl mr-4">
                <Users className="w-6 h-6 text-black" />
              </div>
              <h3 className="text-3xl font-black text-black font-header uppercase tracking-tight">User Distribution by Role</h3>
            </div>
            {roleCards.length > 0 ? (
              <div className="flex flex-col items-center justify-center gap-12">
                {/* Main Circular Chart - Bigger */}
                <div className="relative flex items-center justify-center">
                  <svg width="300" height="300" className="transform -rotate-90">
                    {/* Background circle */}
                    <circle
                      cx="150"
                      cy="150"
                      r="120"
                      fill="none"
                      stroke="#f3f4f6"
                      strokeWidth="24"
                    />
                    {/* Role segments */}
                    {roleCards.map((roleData, index) => {
                      const colors = ['#6C5CE7', '#00B894', '#FFD93D', '#FF7675', '#74B9FF', '#a29bfe'];
                      const percentage = parseFloat(roleData.percentage);
                      const circumference = 2 * Math.PI * 120;
                      const strokeDasharray = `${(percentage / 100) * circumference} ${circumference}`;

                      // Calculate offset based on previous segments
                      const prevPercentages = roleCards.slice(0, index).reduce((sum, role) => sum + parseFloat(role.percentage), 0);
                      const strokeDashoffset = -((prevPercentages / 100) * circumference);

                      return (
                        <circle
                          key={roleData.role}
                          cx="150"
                          cy="150"
                          r="120"
                          fill="none"
                          stroke={colors[index % colors.length]}
                          strokeWidth="24"
                          strokeDasharray={strokeDasharray}
                          strokeDashoffset={strokeDashoffset}
                          className="transition-all duration-500 ease-in-out"
                        />
                      );
                    })}
                    {/* Inner Border */}
                    <circle cx="150" cy="150" r="108" fill="none" stroke="black" strokeWidth="2" />
                    <circle cx="150" cy="150" r="132" fill="none" stroke="black" strokeWidth="2" />
                  </svg>
                  {/* Center text */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <div className="text-5xl font-black text-black font-header">{analytics.totalUsers}</div>
                    <div className="text-sm font-bold text-black/40 uppercase tracking-widest">Total Users</div>
                  </div>
                </div>

                {/* Linear User Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 w-full max-w-6xl">
                  {roleCards.map((roleData, index) => {
                    const colors = ['#6C5CE7', '#00B894', '#FFD93D', '#FF7675', '#74B9FF', '#a29bfe'];
                    return (
                      <div key={roleData.role} className="bg-[#FFFDF5] border-2 border-black rounded-xl p-6 hover:neo-shadow-sm transition-all duration-300 hover:-translate-y-1">
                        <div className="flex items-center mb-4">
                          <div
                            className="w-4 h-4 rounded-full mr-3 border-2 border-black"
                            style={{ backgroundColor: colors[index % colors.length] }}
                          ></div>
                          <span className="font-black text-black text-sm uppercase tracking-wider">
                            {ROLE_LABELS[roleData.role] || roleData.role}
                          </span>
                        </div>
                        <div className="text-center">
                          <div className="text-3xl font-black text-black mb-1">{roleData.count}</div>
                          <div className="text-xs font-bold text-black/60 uppercase tracking-wide">{roleData.percentage}% of users</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-black/60">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-black border-dashed">
                  <Users className="w-8 h-8 text-black/30" />
                </div>
                <p className="font-bold uppercase tracking-widest">No user data available yet.</p>
              </div>
            )}
          </motion.div>

          {/* Footer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="mt-12 text-center text-black/40 text-xs font-bold uppercase tracking-widest"
          >
            <p>Analytics data is updated in real-time. Last updated: {new Date().toLocaleString()}</p>
          </motion.div>
        </div>
      </div>
    </RoleProtected>
  );
};

export default AdminAnalyticsPage;
