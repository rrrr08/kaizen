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
        <div className="min-h-screen bg-gradient-to-br from-black to-slate-900 pt-24 pb-8 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
              <span className="ml-3 text-amber-500/60">Loading analytics...</span>
            </div>
          </div>
        </div>
      </RoleProtected>
    );
  }

  return (
    <RoleProtected allowedRoles={[USER_ROLES.ADMIN]}>
      <div className="min-h-screen bg-gradient-to-br from-black to-slate-900 pt-24 pb-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-8 border-b border-amber-500/10 pb-12"
          >
            <div className="flex items-center justify-center mb-4">
              <div className="p-3 bg-gradient-to-r from-amber-500 to-amber-600 rounded-lg">
                <BarChart3 className="w-8 h-8 text-black" />
              </div>
            </div>
            <h1 className="text-5xl font-header font-bold text-amber-500 mb-4 tracking-tight">
              ANALYTICS & REPORTS
            </h1>
            <p className="text-lg text-white/60 max-w-2xl mx-auto font-header">
              Monitor platform performance and user engagement metrics.
            </p>
          </motion.div>


          {/* Stats Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
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
                  className="bg-slate-800/40 rounded-lg border border-amber-500/20 p-6 hover:border-amber-500/40 transition-all duration-300 backdrop-blur-sm"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-3 rounded-lg bg-amber-500/20">
                      <IconComponent className="w-6 h-6 text-amber-500" />
                    </div>
                    <span className="text-sm font-medium text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-full border border-emerald-500/20">
                      {stat.change}
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-1">
                    {typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}
                  </h3>
                  <p className="text-sm text-white/60">{stat.title}</p>
                </motion.div>
              );
            })}
          </motion.div>

          {/* User Roles Distribution */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="bg-slate-800/40 rounded-lg border border-amber-500/20 p-6 mb-8 backdrop-blur-sm"
          >
            <div className="flex items-center justify-center mb-8">
              <div className="p-2 bg-amber-500/20 rounded-lg">
                <Users className="w-5 h-5 text-amber-500" />
              </div>
              <h3 className="text-lg font-semibold text-white ml-3">User Distribution by Role</h3>
            </div>
            {roleCards.length > 0 ? (
              <div className="flex flex-col items-center justify-center gap-8">
                {/* Main Circular Chart - Bigger */}
                <div className="relative flex items-center justify-center">
                  <svg width="300" height="300" className="transform -rotate-90">
                    {/* Background circle */}
                    <circle
                      cx="150"
                      cy="150"
                      r="120"
                      fill="none"
                      stroke="#3a3f47"
                      strokeWidth="16"
                    />
                    {/* Role segments */}
                    {roleCards.map((roleData, index) => {
                      const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#F97316'];
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
                          strokeWidth="16"
                          strokeDasharray={strokeDasharray}
                          strokeDashoffset={strokeDashoffset}
                          className="transition-all duration-500 ease-in-out"
                        />
                      );
                    })}
                  </svg>
                  {/* Center text */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <div className="text-4xl font-bold text-amber-500">{analytics.totalUsers}</div>
                    <div className="text-lg text-white/60">Total Users</div>
                  </div>
                </div>

                {/* Linear User Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 w-full max-w-6xl">
                  {roleCards.map((roleData, index) => {
                    const colors = ['#d4af37', '#0d7377', '#14919b', '#6366f1', '#ec4899', '#f59e0b'];
                    return (
                      <div key={roleData.role} className="bg-slate-800/50 border border-amber-500/20 rounded-lg p-4 hover:border-amber-500/40 transition-all duration-300 hover:scale-105 backdrop-blur-sm">
                        <div className="flex items-center mb-3">
                          <div
                            className="w-5 h-5 rounded-full mr-3"
                            style={{ backgroundColor: colors[index % colors.length] }}
                          ></div>
                          <span className="font-semibold text-white text-sm">
                            {ROLE_LABELS[roleData.role] || roleData.role}
                          </span>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-amber-500 mb-1">{roleData.count}</div>
                          <div className="text-sm text-white/60">{roleData.percentage}% of users</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-white/60">
                <Users className="w-12 h-12 mx-auto mb-4 text-white/30" />
                <p>No user data available yet.</p>
              </div>
            )}
          </motion.div>

          {/* Footer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="mt-8 text-center text-white/40 text-sm"
          >
            <p>Analytics data is updated in real-time. Last updated: {new Date().toLocaleString()}</p>
          </motion.div>
        </div>
      </div>
    </RoleProtected>
  );
};

export default AdminAnalyticsPage;
