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
      title: 'Active Entites',
      value: analytics.totalUsers,
      change: `+${recentGrowth} new seq.`,
      icon: Users,
      color: 'text-[#00B894]',
      bgColor: 'bg-[#00B894]/10',
      textColor: 'text-[#00B894]'
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
        <div className="min-h-screen text-white pt-24 pb-8 px-4 sm:px-6 lg:px-8 bg-[#050505] bg-[linear-gradient(rgba(0,255,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,0,0.02)_1px,transparent_1px)] bg-[size:32px_32px]">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-center py-12">
              <div className="text-[#FFD400] font-arcade tracking-[0.3em] animate-pulse text-xl">
                CALCULATING_METRICS...
              </div>
            </div>
          </div>
        </div>
      </RoleProtected>
    );
  }

  return (
    <RoleProtected allowedRoles={[USER_ROLES.ADMIN]}>
      <div className="min-h-screen text-white">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-12 border-b-2 border-[#333] pb-8 flex justify-between items-end">
            <div>
              <h1 className="font-arcade text-5xl text-white mb-2 text-3d-orange">SYSTEM_ANALYTICS</h1>
              <p className="text-gray-500 font-sans text-lg tracking-wide uppercase">Performance monitoring and logs</p>
            </div>
            <div className="bg-[#111] border border-[#333] px-4 py-2 rounded text-xs font-mono text-gray-400 flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#00B894] animate-pulse" />
              LIVE_FEED
            </div>
          </div>


          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {statsCards.map((stat, index) => {
              const IconComponent = stat.icon;
              return (
                <div
                  key={stat.title}
                  className="bg-[#080808] border border-[#333] p-6 hover:border-[#FFD400] transition-all duration-300 relative group overflow-hidden"
                >
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <IconComponent className="w-24 h-24 text-[#FFD400]" />
                  </div>
                  <div className="flex items-start justify-between mb-4 relative z-10">
                    <div className="p-3 bg-[#111] border border-[#333] group-hover:border-[#FFD400] transition-colors">
                      <IconComponent className="w-6 h-6 text-[#FFD400]" />
                    </div>
                    <span className="text-[10px] font-mono text-[#00B894] border border-[#00B894]/30 bg-[#00B894]/10 px-2 py-1 uppercase tracking-wider">
                      {stat.change}
                    </span>
                  </div>
                  <h3 className="text-4xl font-arcade text-white mb-1 relative z-10 text-shadow-glow">
                    {typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}
                  </h3>
                  <p className="text-xs text-gray-500 font-mono uppercase tracking-widest relative z-10">{stat.title}</p>
                </div>
              );
            })}
          </div>

          {/* User Roles Distribution */}
          <div className="bg-[#080808] border border-[#333] p-8 mb-8 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-[#FFD400]"></div>
            <div className="flex items-center justify-center mb-12">
              <h3 className="text-xl font-arcade text-white tracking-widest uppercase">Clearance_Level_Distribution</h3>
            </div>
            {roleCards.length > 0 ? (
              <div className="flex flex-col items-center justify-center gap-12">
                {/* Main Circular Chart - Bigger */}
                <div className="relative flex items-center justify-center">
                  <div className="absolute inset-0 bg-[#FFD400]/5 blur-3xl rounded-full"></div>
                  <svg width="300" height="300" className="transform -rotate-90 relative z-10 drop-shadow-[0_0_15px_rgba(255,212,0,0.3)]">
                    {/* Background circle */}
                    <circle
                      cx="150"
                      cy="150"
                      r="120"
                      fill="none"
                      stroke="#111"
                      strokeWidth="24"
                    />
                    {/* Role segments */}
                    {roleCards.map((roleData, index) => {
                      // Neon colors palette
                      const colors = ['#FFD400', '#00B894', '#6C5CE7', '#FF7675', '#0984E3', '#E17055'];
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
                          className="transition-all duration-500 ease-in-out hover:opacity-80 cursor-pointer"
                        />
                      );
                    })}
                  </svg>
                  {/* Center text */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <div className="text-6xl font-arcade text-white text-shadow-glow">{analytics.totalUsers}</div>
                    <div className="text-xs font-mono text-gray-500 uppercase tracking-widest mt-2">Total Entities</div>
                  </div>
                </div>

                {/* Linear User Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 w-full max-w-6xl">
                  {roleCards.map((roleData, index) => {
                    const colors = ['#FFD400', '#00B894', '#6C5CE7', '#FF7675', '#0984E3', '#E17055'];
                    const color = colors[index % colors.length];
                    return (
                      <div key={roleData.role} className="bg-[#111] border border-[#333] hover:border-[#FFD400] p-4 transition-all duration-300 group">
                        <div className="flex items-center mb-3">
                          <div
                            className="w-3 h-3 mr-3 shadow-[0_0_8px]"
                            style={{ backgroundColor: color, boxShadow: `0 0 8px ${color}` }}
                          ></div>
                          <span className="font-mono text-white text-xs uppercase tracking-wider group-hover:text-[#FFD400] transition-colors">
                            {ROLE_LABELS[roleData.role] || roleData.role}
                          </span>
                        </div>
                        <div className="flex items-end justify-between">
                          <div className="text-2xl font-arcade text-white">{roleData.count}</div>
                          <div className="text-xs font-mono text-gray-500">{roleData.percentage}%</div>
                        </div>
                        {/* Progress bar */}
                        <div className="w-full bg-[#222] h-1 mt-3">
                          <div
                            className="h-full transition-all duration-500"
                            style={{ width: `${roleData.percentage}%`, backgroundColor: color }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-600 font-mono">
                <Users className="w-12 h-12 mx-auto mb-4 opacity-30" />
                <p>NO_DATA_AVAILABLE</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="mt-8 text-center text-gray-600 text-[10px] font-mono uppercase tracking-widest">
            <p>SYSTEM_LOGS_SYNCED: {new Date().toLocaleString()}</p>
          </div>
        </div>
      </div>
    </RoleProtected>
  );
};

export default AdminAnalyticsPage;
