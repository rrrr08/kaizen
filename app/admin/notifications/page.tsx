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
        return 'bg-[#00B894] text-black border-black';
      case 'warning':
        return 'bg-[#FF7675] text-black border-black';
      case 'offer':
        return 'bg-[#FFD93D] text-black border-black';
      case 'info':
        return 'bg-[#6C5CE7] text-white border-black';
      default:
        return 'bg-gray-100 text-black border-black';
    }
  };

  return (
    <div className="p-8 pb-16 min-h-screen bg-[#FFFDF5]">
      {/* Header */}
      <div className="mb-12 border-b-2 border-black pb-8">
        <h1 className="font-header text-6xl font-black text-black mb-2 uppercase tracking-tighter">Notifications Manager</h1>
        <p className="text-xl text-black/60 font-bold">Send notifications to users and view history</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Notification Composer */}
        <div className="lg:col-span-1">
          <div className="bg-white border-2 border-black rounded-[25px] p-8 sticky top-24 neo-shadow">
            <h2 className="font-header text-2xl font-black text-black mb-8 flex items-center gap-3 border-b-2 border-black/10 pb-4 uppercase tracking-tight">
              <div className="p-2 bg-[#FFD93D] border-2 border-black rounded-lg">
                <Send className="w-5 h-5 text-black" />
              </div>
              Send Notification
            </h2>

            <form onSubmit={handleSendNotification} className="space-y-6">
              <div>
                <label className="block text-black font-black text-xs uppercase tracking-widest mb-2">Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Notification title..."
                  className="w-full bg-[#FFFDF5] border-2 border-black rounded-xl px-4 py-3 text-black placeholder-black/30 focus:outline-none focus:neo-shadow-sm transition-all font-bold"
                  maxLength={100}
                />
              </div>

              <div>
                <label className="block text-black font-black text-xs uppercase tracking-widest mb-2">Message</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Notification message..."
                  rows={4}
                  className="w-full bg-[#FFFDF5] border-2 border-black rounded-xl px-4 py-3 text-black placeholder-black/30 focus:outline-none focus:neo-shadow-sm transition-all resize-none font-medium leading-relaxed"
                  maxLength={300}
                />
              </div>

              <div>
                <label className="block text-black font-black text-xs uppercase tracking-widest mb-2">Type</label>
                <div className="relative">
                  <select
                    value={notificationType}
                    onChange={(e) => setNotificationType(e.target.value as any)}
                    className="w-full bg-[#FFFDF5] border-2 border-black rounded-xl px-4 py-3 text-black focus:outline-none focus:neo-shadow-sm transition-all font-bold appearance-none"
                  >
                    <option value="info">ℹ️ Info</option>
                    <option value="success">✓ Success</option>
                    <option value="offer">🎁 Offer</option>
                    <option value="warning">⚠️ Warning</option>
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M2.5 4.5L6 8L9.5 4.5" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-black font-black text-xs uppercase tracking-widest mb-2">Send To</label>
                <div className="relative">
                  <select
                    value={recipientType}
                    onChange={(e) => setRecipientType(e.target.value as any)}
                    className="w-full bg-[#FFFDF5] border-2 border-black rounded-xl px-4 py-3 text-black focus:outline-none focus:neo-shadow-sm transition-all font-bold appearance-none"
                  >
                    <option value="all">All Users (1,250)</option>
                    <option value="specific">Specific User</option>
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M2.5 4.5L6 8L9.5 4.5" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-black font-black text-xs uppercase tracking-widest mb-2">Action URL (Optional)</label>
                <input
                  type="text"
                  value={actionUrl}
                  onChange={(e) => setActionUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full bg-[#FFFDF5] border-2 border-black rounded-xl px-4 py-3 text-black placeholder-black/30 focus:outline-none focus:neo-shadow-sm transition-all font-bold text-sm"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full px-6 py-4 bg-[#00B894] text-black font-black uppercase tracking-widest rounded-xl border-2 border-black neo-shadow hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
              >
                <Send className="w-5 h-5" strokeWidth={3} />
                {loading ? 'Sending...' : 'Send Notification'}
              </button>
            </form>

            {/* Preview */}
            {(title || message) && (
              <div className="mt-8 pt-6 border-t-2 border-black/10 border-dashed">
                <p className="text-black/40 text-xs font-black uppercase tracking-widest mb-3">Preview</p>
                <div className={`${getTypeColor(notificationType)} border-2 rounded-xl p-4 shadow-[4px_4px_0px_rgba(0,0,0,0.1)]`}>
                  <p className="font-black text-sm uppercase tracking-wide">{title || 'Notification Title'}</p>
                  <p className="text-xs mt-2 font-bold opacity-80 leading-relaxed">{message || 'Notification message appears here...'}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Notification History */}
        <div className="lg:col-span-2">
          <h2 className="font-header text-3xl font-black text-black mb-8 flex items-center gap-3 uppercase tracking-tighter">
            <div className="p-2 bg-[#FF7675] border-2 border-black rounded-lg">
              <Bell className="w-6 h-6 text-black" />
            </div>
            Recent Notifications
          </h2>

          <div className="space-y-6">
            {history.length === 0 ? (
              <div className="bg-white border-2 border-black border-dashed rounded-[25px] p-20 text-center">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6 border-2 border-black">
                  <Bell className="w-10 h-10 text-black/20" />
                </div>
                <p className="text-black/40 font-black uppercase tracking-widest">No notifications sent yet</p>
              </div>
            ) : (
              history.map((notif) => (
                <div
                  key={notif.id}
                  className="bg-white border-2 border-black rounded-xl p-6 hover:translate-x-[2px] hover:-translate-y-[2px] hover:neo-shadow transition-transform duration-300"
                >
                  <div className="flex items-start justify-between gap-6">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-header text-xl font-black text-black uppercase tracking-tight">{notif.title}</h3>
                        <span className={`inline-flex px-3 py-1 rounded-lg text-xs font-black uppercase tracking-wider border-2 ${getTypeColor(notif.type)}`}>
                          {notif.type}
                        </span>
                      </div>
                      <p className="text-black/60 text-sm font-bold mb-4 leading-relaxed">{notif.message}</p>
                      <div className="flex items-center gap-6 text-xs text-black/40 font-black uppercase tracking-widest">
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
                      <button className="p-3 bg-gray-100 border-2 border-black rounded-lg text-black hover:bg-[#74B9FF] transition-colors">
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
