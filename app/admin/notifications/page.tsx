'use client';

import { useEffect, useState } from 'react';
import { Bell, Send, Users, Download } from 'lucide-react';
import { getNotificationHistory, addNotification, NotificationHistory } from '@/lib/firebase';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationHistory[]>([]);
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [notificationType, setNotificationType] = useState<'info' | 'success' | 'offer' | 'warning'>('info');
  const [recipientType, setRecipientType] = useState<'all' | 'specific'>('all');
  const [actionUrl, setActionUrl] = useState('');
  const [history, setHistory] = useState<NotificationHistory[]>([]);

  useEffect(() => {
    loadNotificationHistory();
  }, []);

  const loadNotificationHistory = async () => {
    try {
      const data = await getNotificationHistory();
      setHistory(data);
    } catch (error) {
      console.error('Error loading notifications:', error);
      setHistory([]);
    }
  };

  const handleSendNotification = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !message.trim()) {
      alert('Please fill in title and message');
      return;
    }

    setLoading(true);

    try {
      const newNotification: any = {
        title,
        message,
        type: notificationType,
        recipientType,
        recipientCount: recipientType === 'all' ? 1250 : 1,
      };

      // Only add actionUrl if it has a value
      if (actionUrl && actionUrl.trim()) {
        newNotification.actionUrl = actionUrl;
      }

      const docId = await addNotification(newNotification);

      setHistory([
        {
          id: docId,
          ...newNotification,
          sentAt: new Date().toISOString(),
        },
        ...history,
      ]);

      // Reset form
      setTitle('');
      setMessage('');
      setActionUrl('');
      setNotificationType('info');
      setRecipientType('all');

      alert('Notification sent successfully!');
    } catch (error) {
      console.error('Error sending notification:', error);
      alert('Failed to send notification');
    } finally {
      setLoading(false);
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-green-500/10 border-green-500/20 text-green-400';
      case 'warning':
        return 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400';
      case 'offer':
        return 'bg-amber-500/10 border-amber-500/20 text-amber-400';
      case 'info':
        return 'bg-blue-500/10 border-blue-500/20 text-blue-400';
      default:
        return 'bg-white/5 border-white/10 text-white/60';
    }
  };

  return (
    <div className="p-8 pb-16">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-display text-5xl font-bold text-white mb-2">Notifications Manager</h1>
        <p className="text-white/60">Send notifications to users and view history</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Notification Composer */}
        <div className="lg:col-span-1">
          <div className="bg-gradient-to-br from-amber-500/10 to-transparent border border-amber-500/20 rounded-lg p-8 sticky top-24">
            <h2 className="font-display text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <Send className="w-5 h-5 text-amber-400" />
              Send Notification
            </h2>

            <form onSubmit={handleSendNotification} className="space-y-4">
              <div>
                <label className="block text-white/60 text-sm font-semibold mb-2">Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Notification title..."
                  className="w-full bg-white/5 border border-white/10 rounded px-4 py-2 text-white placeholder-white/40 focus:border-amber-500 outline-none transition"
                  maxLength={100}
                />
              </div>

              <div>
                <label className="block text-white/60 text-sm font-semibold mb-2">Message</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Notification message..."
                  rows={4}
                  className="w-full bg-white/5 border border-white/10 rounded px-4 py-2 text-white placeholder-white/40 focus:border-amber-500 outline-none transition resize-none"
                  maxLength={300}
                />
              </div>

              <div>
                <label className="block text-white/60 text-sm font-semibold mb-2">Type</label>
                <select
                  value={notificationType}
                  onChange={(e) => setNotificationType(e.target.value as any)}
                  className="w-full bg-white/5 border border-white/10 rounded px-4 py-2 text-white focus:border-amber-500 outline-none transition"
                >
                  <option value="info">ℹ️ Info</option>
                  <option value="success">✓ Success</option>
                  <option value="offer">🎁 Offer</option>
                  <option value="warning">⚠️ Warning</option>
                </select>
              </div>

              <div>
                <label className="block text-white/60 text-sm font-semibold mb-2">Send To</label>
                <select
                  value={recipientType}
                  onChange={(e) => setRecipientType(e.target.value as any)}
                  className="w-full bg-white/5 border border-white/10 rounded px-4 py-2 text-white focus:border-amber-500 outline-none transition"
                >
                  <option value="all">All Users (1,250)</option>
                  <option value="specific">Specific User</option>
                </select>
              </div>

              <div>
                <label className="block text-white/60 text-sm font-semibold mb-2">Action URL (Optional)</label>
                <input
                  type="text"
                  value={actionUrl}
                  onChange={(e) => setActionUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full bg-white/5 border border-white/10 rounded px-4 py-2 text-white placeholder-white/40 focus:border-amber-500 outline-none transition text-sm"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full px-6 py-3 bg-amber-500 text-black font-header font-bold rounded hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                {loading ? 'Sending...' : 'Send Notification'}
              </button>
            </form>

            {/* Preview */}
            {(title || message) && (
              <div className="mt-6 pt-6 border-t border-amber-500/20">
                <p className="text-white/60 text-xs font-semibold mb-3">PREVIEW</p>
                <div className={`${getTypeColor(notificationType)} border rounded-lg p-4`}>
                  <p className="font-semibold text-sm">{title || 'Notification Title'}</p>
                  <p className="text-xs mt-2 opacity-80">{message || 'Notification message appears here...'}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Notification History */}
        <div className="lg:col-span-2">
          <h2 className="font-display text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <Bell className="w-5 h-5 text-amber-400" />
            Recent Notifications
          </h2>

          <div className="space-y-4">
            {history.length === 0 ? (
              <div className="bg-black/40 border border-white/10 rounded-lg p-12 text-center">
                <Bell className="w-12 h-12 text-white/20 mx-auto mb-4" />
                <p className="text-white/60">No notifications sent yet</p>
              </div>
            ) : (
              history.map((notif) => (
                <div
                  key={notif.id}
                  className="bg-black/40 border border-white/10 rounded-lg p-6 hover:border-white/20 transition"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-display text-lg font-bold text-white">{notif.title}</h3>
                        <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold border ${getTypeColor(notif.type)}`}>
                          {notif.type}
                        </span>
                      </div>
                      <p className="text-white/60 text-sm mb-3">{notif.message}</p>
                      <div className="flex items-center gap-4 text-xs text-white/40">
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          {notif.recipientCount} users
                        </div>
                        <div>
                          {new Date(notif.sentAt).toLocaleDateString()} {new Date(notif.sentAt).toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <button className="px-3 py-1 bg-white/5 border border-white/10 rounded text-white/60 text-xs font-semibold hover:bg-white/10 transition">
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
