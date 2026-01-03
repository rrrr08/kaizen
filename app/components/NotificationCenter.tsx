'use client';

import { useEffect, useState } from 'react';
import { Bell, X, CheckCheck, Sparkles, Info, AlertTriangle, Gift, Check, Settings } from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

interface InAppNotification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'offer';
  actionUrl?: string;
  read: boolean;
  createdAt: string;
}

export default function NotificationCenter(): JSX.Element {
  const [notifications, setNotifications] = useState<InAppNotification[]>([]);
  const [open, setOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasNewNotifications, setHasNewNotifications] = useState(false);

  useEffect(() => {
    let unsubscribe: (() => void) | null = null;

    const setupRealtimeListener = async () => {
      try {
        const { auth, db } = await import('@/lib/firebase');
        
        if (!auth || !auth.currentUser || !db) {
          setNotifications([]);
          setUnreadCount(0);
          setLoading(false);
          return;
        }

        setLoading(true);

        // Import Firestore functions
        const { collection, query, orderBy, limit, onSnapshot } = await import('firebase/firestore');

        // Set up real-time listener for user's notifications
        const notificationsRef = collection(db, 'users', auth.currentUser.uid, 'notifications');
        const notificationsQuery = query(
          notificationsRef,
          orderBy('createdAt', 'desc'),
          limit(50)
        );

        // Listen for real-time updates
        unsubscribe = onSnapshot(
          notificationsQuery,
          (snapshot) => {
            const notifs = snapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data(),
              createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || new Date().toISOString()
            })) as InAppNotification[];

            const unread = notifs.filter(n => !n.read).length;
            
            setNotifications(prev => {
              // Check if there are new notifications
              if (prev.length > 0 && unread > 0) {
                setHasNewNotifications(true);
              }
              return notifs;
            });
            setUnreadCount(unread);
            setLoading(false);
          },
          (error) => {
            console.error('Error in notification listener:', error);
            setLoading(false);
          }
        );
      } catch (error) {
        console.error('Error setting up notification listener:', error);
        setLoading(false);
      }
    };

    setupRealtimeListener();

    // Cleanup listener on unmount
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  // Mark notification as read (still uses API for server-side update)
  async function markAsRead(id: string) {
    try {
      const { auth } = await import('@/lib/firebase');
      if (!auth || !auth.currentUser) return;

      const idToken = await auth.currentUser.getIdToken();
      await fetch(`/api/notifications/${id}/read`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${idToken}` }
      });
      // Real-time listener will auto-update the UI
    } catch (error) {
      console.error('Error marking notification as read:', error);
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
      // Real-time listener will auto-update the UI
    } catch (error) {
      console.error('Error dismissing notification:', error);
    }
  }

  const typeColors = {
    info: {
      bg: 'bg-blue-50 dark:bg-blue-950/20',
      border: 'border-blue-200 dark:border-blue-800',
      icon: 'bg-blue-500',
      text: 'text-blue-700 dark:text-blue-300'
    },
    success: {
      bg: 'bg-green-50 dark:bg-green-950/20',
      border: 'border-green-200 dark:border-green-800',
      icon: 'bg-green-500',
      text: 'text-green-700 dark:text-green-300'
    },
    warning: {
      bg: 'bg-yellow-50 dark:bg-yellow-950/20',
      border: 'border-yellow-200 dark:border-yellow-800',
      icon: 'bg-yellow-500',
      text: 'text-yellow-700 dark:text-yellow-300'
    },
    offer: {
      bg: 'bg-purple-50 dark:bg-purple-950/20',
      border: 'border-purple-200 dark:border-purple-800',
      icon: 'bg-purple-500',
      text: 'text-purple-700 dark:text-purple-300'
    }
  };

  const typeIcons = {
    info: Info,
    success: Check,
    warning: AlertTriangle,
    offer: Gift
  };

  const getRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <>
      {/* Bell Icon Button with Neo-brutalist Style */}
      <button
        onClick={() => {
          setOpen(!open);
          if (!open) {
            setHasNewNotifications(false);
          }
        }}
        className={`relative p-3 rounded-xl border-2 border-black transition-all ${
          hasNewNotifications 
            ? 'bg-red-400 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none' 
            : 'bg-white hover:bg-gray-50 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
        }`}
        aria-label="Notifications"
      >
        <Bell className={`w-5 h-5 transition-all ${hasNewNotifications ? 'text-white animate-swing' : 'text-black'}`} />
        {unreadCount > 0 && (
          <span className={`absolute -top-1 -right-1 min-w-[22px] h-[22px] px-1.5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ${hasNewNotifications ? 'animate-bounce' : ''}`}>
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Dropdown with Animation */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 top-full mt-3 w-96 bg-background rounded-2xl border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden z-50"
          >
            {/* Header with gradient */}
            <div className="p-4 bg-gradient-to-r from-primary to-primary/80 border-b-4 border-black flex justify-between items-center sticky top-0 z-10">
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-primary-foreground" />
                <h3 className="font-display font-bold text-lg text-primary-foreground">Notifications</h3>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 bg-white text-primary rounded-full text-xs font-bold border-2 border-black">
                    {unreadCount}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Link
                  href="/notification-preferences"
                  onClick={() => setOpen(false)}
                  className="p-1.5 hover:bg-white/20 rounded-lg transition-colors text-primary-foreground"
                  title="Notification Settings"
                >
                  <Settings className="w-5 h-5" />
                </Link>
                <button
                  onClick={() => setOpen(false)}
                  className="p-1.5 hover:bg-white/20 rounded-lg transition-colors text-primary-foreground"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Notification List */}
            <div className="max-h-[450px] overflow-y-auto">
              {notifications.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="p-12 text-center"
                >
                  <div className="w-20 h-20 mx-auto mb-4 rounded-2xl border-4 border-black bg-gray-100 flex items-center justify-center">
                    <Bell className="w-10 h-10 text-gray-400" />
                  </div>
                  <p className="font-header text-lg font-bold mb-2">All caught up!</p>
                  <p className="text-sm text-muted-foreground">No new notifications</p>
                </motion.div>
              ) : (
                <div className="divide-y-2 divide-black">
                  {notifications
                    .sort((a, b) => {
                      if (a.read !== b.read) return a.read ? 1 : -1;
                      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
                    })
                    .map((notif, index) => {
                      const TypeIcon = typeIcons[notif.type];
                      const colors = typeColors[notif.type];
                      
                      return (
                        <motion.div
                          key={notif.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className={`p-4 transition-all hover:bg-gray-50 cursor-pointer relative ${!notif.read ? 'bg-primary/5' : ''}`}
                          onClick={() => !notif.read && markAsRead(notif.id)}
                        >
                          <div className="flex gap-3">
                            {/* Icon */}
                            <div className={`flex-shrink-0 w-10 h-10 rounded-xl ${colors.icon} border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center`}>
                              <TypeIcon className="w-5 h-5 text-white" />
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2 mb-1">
                                <div className="flex items-center gap-2">
                                  <h4 className="font-header font-bold text-sm text-foreground">{notif.title}</h4>
                                  {!notif.read && (
                                    <span className="flex-shrink-0 w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                                  )}
                                </div>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    dismiss(notif.id);
                                  }}
                                  className="flex-shrink-0 p-1 hover:bg-black/10 rounded transition-colors"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                              <p className="text-sm text-muted-foreground mb-2 line-clamp-2">{notif.message}</p>
                              <div className="flex items-center justify-between">
                                <span className="text-xs text-muted-foreground font-medium">
                                  {getRelativeTime(notif.createdAt)}
                                </span>
                                {notif.actionUrl && (
                                  <Link
                                    href={notif.actionUrl}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      markAsRead(notif.id);
                                    }}
                                    className="px-3 py-1 bg-primary text-primary-foreground text-xs font-header font-bold rounded-lg border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all"
                                  >
                                    View →
                                  </Link>
                                )}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                </div>
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="p-4 border-t-4 border-black bg-gray-50">
                <Link
                  href="/notifications"
                  onClick={() => setOpen(false)}
                  className="block w-full px-4 py-2.5 bg-white text-center font-header font-bold text-sm rounded-xl border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all"
                >
                  View All Notifications
                </Link>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Swing animation keyframes */}
      <style jsx>{`
        @keyframes swing {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(15deg); }
          75% { transform: rotate(-15deg); }
        }
        .animate-swing {
          animation: swing 0.5s ease-in-out infinite;
        }
      `}</style>
    </>
  );
}
