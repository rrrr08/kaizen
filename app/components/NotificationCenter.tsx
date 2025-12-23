'use client';

import { useEffect, useState } from 'react';
import { Bell, X } from 'lucide-react';
import Link from 'next/link';

interface InAppNotification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'offer';
  actionUrl?: string;
  read: boolean;
  createdAt: string;
}

export function NotificationCenter() {
  const [notifications, setNotifications] = useState<InAppNotification[]>([]);
  const [open, setOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Only load notifications if user is authenticated
    const checkAuth = async () => {
      const { auth } = await import('@/lib/firebase');
      if (auth.currentUser) {
        loadNotifications();

        // Reload notifications every 30 seconds
        const interval = setInterval(loadNotifications, 30000);

        return () => clearInterval(interval);
      }
    };

    checkAuth();
  }, []);

  async function loadNotifications() {
    try {
      // Lazy load Firebase
      const { auth } = await import('@/lib/firebase');
      
      // Skip if user not authenticated
      if (!auth.currentUser) {
        setNotifications([]);
        setUnreadCount(0);
        return;
      }

      setLoading(true);
      
      // Get the user's ID token
      const idToken = await auth.currentUser.getIdToken();
      const headers: HeadersInit = {
        'Authorization': `Bearer ${idToken}`
      };

      const response = await fetch('/api/notifications/in-app', { headers });
      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      } else if (response.status === 401) {
        // Clear notifications if unauthorized
        setNotifications([]);
        setUnreadCount(0);
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  }

  async function markAsRead(id: string) {
    try {
      let headers: HeadersInit = {};
      if (auth.currentUser) {
        const idToken = await auth.currentUser.getIdToken();
        headers['Authorization'] = `Bearer ${idToken}`;
      }
      
      await fetch(`/api/notifications/${id}/read`, { 
        method: 'POST',
        headers 
      });
      await loadNotifications();
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }

  async function dismiss(id: string) {
    try {
      let headers: HeadersInit = {};
      if (auth.currentUser) {
        const idToken = await auth.currentUser.getIdToken();
        headers['Authorization'] = `Bearer ${idToken}`;
      }
      
      await fetch(`/api/notifications/${id}/dismiss`, { 
        method: 'POST',
        headers 
      });
      setNotifications(notifications.filter((n) => n.id !== id));
      if (unreadCount > 0) setUnreadCount(unreadCount - 1);
    } catch (error) {
      console.error('Error dismissing notification:', error);
    }
  }

  const typeColors = {
    info: 'bg-blue-500/20 text-blue-600 border-blue-500/20',
    success: 'bg-green-500/20 text-green-600 border-green-500/20',
    warning: 'bg-yellow-500/20 text-yellow-600 border-yellow-500/20',
    offer: 'bg-purple-500/20 text-purple-600 border-purple-500/20',
  };

  return (
    <>
      {/* Bell Icon Button */}
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 hover:bg-muted rounded-full transition-colors"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 w-5 h-5 bg-destructive text-white text-xs rounded-full flex items-center justify-center font-semibold">
            {Math.min(unreadCount, 9)}
          </span>
        )}
      </button>

      {/* Notification Dropdown */}
      {open && (
        <div className="absolute right-0 top-full mt-2 w-96 bg-background border rounded-lg shadow-lg max-h-96 overflow-y-auto z-50">
          {/* Header */}
          <div className="p-4 border-b flex justify-between items-center sticky top-0 bg-background z-10">
            <h3 className="font-display font-bold text-lg">Notifications</h3>
            <button
              onClick={() => setOpen(false)}
              className="p-1 hover:bg-muted rounded transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Notification List */}
          {notifications.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No notifications</p>
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`p-4 hover:bg-muted/50 transition-colors cursor-pointer ${
                    !notif.read ? 'bg-primary/5' : ''
                  }`}
                  onClick={() => !notif.read && markAsRead(notif.id)}
                >
                  <div className="flex justify-between items-start gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-header font-semibold text-sm">{notif.title}</h4>
                        {!notif.read && (
                          <span className="w-2 h-2 rounded-full bg-primary" />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{notif.message}</p>
                      <p className="text-xs text-muted-foreground mt-2">
                        {new Date(notif.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        dismiss(notif.id);
                      }}
                      className="p-1 hover:bg-muted rounded transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {notif.actionUrl && (
                    <Link
                      href={notif.actionUrl}
                      onClick={() => markAsRead(notif.id)}
                      className="text-primary text-sm font-semibold mt-2 inline-block hover:underline"
                    >
                      View →
                    </Link>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Footer Link */}
          {notifications.length > 0 && (
            <div className="p-4 border-t text-center">
              <Link
                href="/notifications"
                className="text-primary text-sm font-semibold hover:underline"
              >
                View All Notifications
              </Link>
            </div>
          )}
        </div>
      )}
    </>
  );
}
