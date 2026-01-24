'use client';

import { useEffect, useState } from 'react';
import { Bell, X, ArrowLeft, Settings } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface InAppNotification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'offer';
  actionUrl?: string;
  read: boolean;
  createdAt: string;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<InAppNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');

  useEffect(() => {
    loadNotifications();
  }, []);

  async function loadNotifications() {
    try {
      const { auth } = await import('@/lib/firebase');

      if (!auth || !auth.currentUser) {
        setNotifications([]);
        setLoading(false);
        return;
      }

      const idToken = await auth.currentUser.getIdToken();
      const response = await fetch('/api/notifications/in-app', {
        headers: { 'Authorization': `Bearer ${idToken}` }
      });

      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications || []);
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  }

  async function markAsRead(id: string) {
    try {
      const { auth } = await import('@/lib/firebase');
      if (!auth || !auth.currentUser) return;

      const idToken = await auth.currentUser.getIdToken();
      await fetch(`/api/notifications/${id}/read`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${idToken}` }
      });
      await loadNotifications();
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }

  async function markAllAsRead() {
    try {
      const { auth } = await import('@/lib/firebase');
      if (!auth || !auth.currentUser) return;

      const idToken = await auth.currentUser.getIdToken();
      await fetch('/api/notifications/mark-all-read', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${idToken}` }
      });
      await loadNotifications();
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  }

  async function dismiss(id: string) {
    try {
      const { auth } = await import('@/lib/firebase');
      if (!auth || !auth.currentUser) return;

      const idToken = await auth.currentUser.getIdToken();
      await fetch(`/api/notifications/${id}/dismiss`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${idToken}` }
      });
      setNotifications(notifications.filter((n) => n.id !== id));
    } catch (error) {
      console.error('Error dismissing notification:', error);
    }
  }

  const filteredNotifications = notifications
    .filter((n) => {
      if (filter === 'unread') return !n.read;
      if (filter === 'read') return n.read;
      return true;
    })
    .sort((a, b) => {
      // Sort unread first, then by date
      if (a.read !== b.read) {
        return a.read ? 1 : -1;
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  const unreadCount = (notifications || []).filter((n) => !n.read).length || 0;
  const totalCount = (notifications || []).length || 0;

  const typeColors = {
    info: 'border-blue-500/30 bg-blue-500/5',
    success: 'border-green-500/30 bg-green-500/5',
    warning: 'border-yellow-500/30 bg-yellow-500/5',
    offer: 'border-purple-500/30 bg-purple-500/5',
  };

  const typeBadges = {
    info: 'bg-blue-500/20 text-blue-600',
    success: 'bg-green-500/20 text-green-600',
    warning: 'bg-yellow-500/20 text-yellow-600',
    offer: 'bg-purple-500/20 text-purple-600',
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-primary text-primary-foreground py-6 border-b-4 border-black shadow-brutal">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex items-center justify-between mb-4">
            <Link
              href="/"
              className="flex items-center gap-2 text-primary-foreground hover:opacity-80 transition-opacity"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-header">Back</span>
            </Link>
            <Link
              href="/notification-preferences"
              className="flex items-center gap-2 px-4 py-2 bg-background text-foreground rounded-lg border-2 border-black shadow-brutal hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all"
            >
              <Settings className="w-4 h-4" />
              <span className="font-header text-sm">Settings</span>
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <Bell className="w-8 h-8" />
            <div>
              <h1 className="font-display text-3xl font-bold">Notifications</h1>
              {unreadCount > 0 && (
                <p className="text-sm opacity-90">
                  {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 font-header text-sm rounded-lg border-2 border-black transition-all ${filter === 'all'
                  ? 'bg-primary text-primary-foreground shadow-brutal'
                  : 'bg-background hover:translate-x-0.5 hover:translate-y-0.5'
                }`}
            >
              All ({totalCount})
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-4 py-2 font-header text-sm rounded-lg border-2 border-black transition-all ${filter === 'unread'
                  ? 'bg-primary text-primary-foreground shadow-brutal'
                  : 'bg-background hover:translate-x-0.5 hover:translate-y-0.5'
                }`}
            >
              Unread ({unreadCount})
            </button>
            <button
              onClick={() => setFilter('read')}
              className={`px-4 py-2 font-header text-sm rounded-lg border-2 border-black transition-all ${filter === 'read'
                  ? 'bg-primary text-primary-foreground shadow-brutal'
                  : 'bg-background hover:translate-x-0.5 hover:translate-y-0.5'
                }`}
            >
              Read ({totalCount - unreadCount})
            </button>
          </div>
          {unreadCount > 0 && (
            <Button
              onClick={markAllAsRead}
              variant="outline"
              size="sm"
              className="font-header"
            >
              Mark all as read
            </Button>
          )}
        </div>
      </div>

      {/* Notifications List */}
      <div className="max-w-4xl mx-auto px-4 pb-12">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent mx-auto"></div>
            <p className="text-muted-foreground mt-4">Loading notifications...</p>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="text-center py-12">
            <Bell className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="font-display text-xl font-bold mb-2">
              {filter === 'all' ? 'No notifications' : `No ${filter} notifications`}
            </h3>
            <p className="text-muted-foreground">
              {filter === 'all'
                ? "You're all caught up!"
                : `You have no ${filter} notifications.`}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredNotifications.map((notif) => (
              <div
                key={notif.id}
                className={`p-6 rounded-lg border-2 border-black ${typeColors[notif.type]
                  } ${!notif.read ? 'shadow-brutal' : 'opacity-75'
                  } transition-all hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none`}
              >
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                  <div className="flex-1 min-w-0 w-full">
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <span
                        className={`px-2 py-1 rounded text-[10px] sm:text-xs font-header font-semibold uppercase shrink-0 ${typeBadges[notif.type]
                          }`}
                      >
                        {notif.type}
                      </span>
                      {!notif.read && (
                        <span className="flex items-center gap-1.5 text-[10px] sm:text-xs font-header text-primary shrink-0">
                          <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                          New
                        </span>
                      )}
                    </div>
                    <h3 className="font-display text-base sm:text-lg font-bold mb-2 break-words">
                      {notif.title}
                    </h3>
                    <p className="text-sm sm:text-base text-foreground/80 mb-3 break-words">{notif.message}</p>
                    <p className="text-[10px] sm:text-sm text-muted-foreground">
                      {new Date(notif.createdAt).toLocaleString('en-US', {
                        dateStyle: 'medium',
                        timeStyle: 'short',
                      })}
                    </p>
                    {notif.actionUrl && (
                      <Link
                        href={notif.actionUrl}
                        onClick={() => !notif.read && markAsRead(notif.id)}
                        className="inline-block mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-lg border-2 border-black shadow-brutal hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all font-header text-xs sm:text-sm"
                      >
                        View Details →
                      </Link>
                    )}
                  </div>
                  <div className="flex sm:flex-col gap-2 w-full sm:w-auto justify-end sm:justify-start pt-4 sm:pt-0 border-t sm:border-t-0 border-black/5">
                    <button
                      onClick={() => dismiss(notif.id)}
                      className="p-2 hover:bg-black/10 rounded-lg transition-colors order-2 sm:order-1"
                      aria-label="Dismiss notification"
                    >
                      <X className="w-5 h-5" />
                    </button>
                    {!notif.read && (
                      <button
                        onClick={() => markAsRead(notif.id)}
                        className="px-3 py-1 bg-background text-foreground rounded border-2 border-black text-[10px] sm:text-xs font-header hover:translate-x-0.5 hover:translate-y-0.5 transition-all order-1 sm:order-2"
                      >
                        Mark read
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
