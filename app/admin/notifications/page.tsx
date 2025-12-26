'use client';

import { useEffect, useState } from 'react';
import { Bell, Send, Users, Download, AlertTriangle, CheckCircle, Info, Gift } from 'lucide-react';
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
        return 'bg-[#00B894]/10 border-[#00B894]/30 text-[#00B894]';
      case 'warning':
        return 'bg-red-500/10 border-red-500/30 text-red-400';
      case 'offer':
        return 'bg-[#FFD400]/10 border-[#FFD400]/30 text-[#FFD400]';
      case 'info':
        return 'bg-blue-500/10 border-blue-500/30 text-blue-400';
      default:
        return 'bg-white/5 border-white/10 text-white/60';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle className="w-4 h-4" />;
      case 'warning': return <AlertTriangle className="w-4 h-4" />;
      case 'offer': return <Gift className="w-4 h-4" />;
      case 'info': return <Info className="w-4 h-4" />;
      default: return <Bell className="w-4 h-4" />;
    }
  }

  return (
    <div className="p-8 pb-16 text-white min-h-screen bg-[#050505]">
      {/* Header */}
      <div className="mb-12 border-b-2 border-[#333] pb-6">
        <h1 className="font-arcade text-5xl text-white mb-2 text-3d-orange">ALERT_SYSTEM</h1>
        <p className="text-gray-500 font-sans text-lg tracking-wide uppercase">Broadcast system messages to user terminals</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Notification Composer */}
        <div className="lg:col-span-1">
          <div className="bg-[#080808] border-2 border-[#333] rounded-[4px] p-8 sticky top-24 shadow-[0_0_20px_rgba(0,0,0,0.5)]">
            <h2 className="font-arcade text-xl text-[#FFD400] mb-8 flex items-center gap-3 border-b border-[#222] pb-4">
              <Send className="w-5 h-5 text-[#FFD400]" />
              COMPOSE_ALERT
            </h2>

            <form onSubmit={handleSendNotification} className="space-y-6">
              <div>
                <label className="block text-[#00B894] text-xs font-mono uppercase tracking-widest mb-2">Subject Line</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="ENTER SUBJECT"
                  className="w-full bg-[#111] border border-[#333] rounded-sm px-4 py-2 text-white font-mono placeholder-gray-700 focus:border-[#FFD400] outline-none transition uppercase"
                  maxLength={100}
                />
              </div>

              <div>
                <label className="block text-[#00B894] text-xs font-mono uppercase tracking-widest mb-2">Message Body</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="ENTER TRANSMISSION..."
                  rows={4}
                  className="w-full bg-[#111] border border-[#333] rounded-sm px-4 py-2 text-white font-mono placeholder-gray-700 focus:border-[#FFD400] outline-none transition resize-none text-sm"
                  maxLength={300}
                />
              </div>

              <div>
                <label className="block text-[#00B894] text-xs font-mono uppercase tracking-widest mb-2">Classification</label>
                <select
                  value={notificationType}
                  onChange={(e) => setNotificationType(e.target.value as any)}
                  className="w-full bg-[#111] border border-[#333] rounded-sm px-4 py-2 text-white font-mono focus:border-[#FFD400] outline-none transition uppercase appearance-none cursor-pointer"
                >
                  <option value="info">SYSTEM_INFO</option>
                  <option value="success">SUCCESS_CONFIRMATION</option>
                  <option value="offer">REWARD/OFFER</option>
                  <option value="warning">CRITICAL_WARNING</option>
                </select>
              </div>

              <div>
                <label className="block text-[#00B894] text-xs font-mono uppercase tracking-widest mb-2">Target Audience</label>
                <select
                  value={recipientType}
                  onChange={(e) => setRecipientType(e.target.value as any)}
                  className="w-full bg-[#111] border border-[#333] rounded-sm px-4 py-2 text-white font-mono focus:border-[#FFD400] outline-none transition uppercase appearance-none cursor-pointer"
                >
                  <option value="all">BROADCAST_ALL (1,250)</option>
                  <option value="specific">SINGLE_TARGET</option>
                </select>
              </div>

              <div>
                <label className="block text-[#00B894] text-xs font-mono uppercase tracking-widest mb-2">Action Vector (Optional)</label>
                <input
                  type="text"
                  value={actionUrl}
                  onChange={(e) => setActionUrl(e.target.value)}
                  placeholder="HTTPS://..."
                  className="w-full bg-[#111] border border-[#333] rounded-sm px-4 py-2 text-white font-mono placeholder-gray-700 focus:border-[#FFD400] outline-none transition text-sm"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full px-6 py-4 bg-[#FFD400] text-black font-arcade text-xs uppercase tracking-widest rounded-sm hover:bg-[#FFE066] disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center gap-2 group"
              >
                <Send className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                {loading ? 'TRANSMITTING...' : 'INITIATE_BROADCAST'}
              </button>
            </form>

            {/* Preview */}
            {(title || message) && (
              <div className="mt-8 pt-6 border-t border-[#333] relative">
                <div className="absolute top-[-8px] left-1/2 -translate-x-1/2 bg-[#080808] px-2 text-[#00B894] font-mono text-[10px] uppercase">
                  PREVIEW
                </div>
                <div className={`${getTypeColor(notificationType)} border rounded-sm p-4 font-mono`}>
                  <div className="flex items-center gap-2 mb-2 font-bold uppercase text-xs">
                    {getTypeIcon(notificationType)}
                    {title || 'HEADER_MISSING'}
                  </div>
                  <p className="text-xs opacity-80 leading-relaxed">{message || 'WAITING_FOR_INPUT...'}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Notification History */}
        <div className="lg:col-span-2">
          <h2 className="font-arcade text-2xl text-white mb-6 flex items-center gap-3">
            <Bell className="w-5 h-5 text-[#FFD400]" />
            HISTORY_LOGS
          </h2>

          <div className="space-y-4">
            {history.length === 0 ? (
              <div className="bg-[#080808] border-2 border-dashed border-[#333] rounded-[4px] p-12 text-center">
                <Bell className="w-12 h-12 text-[#333] mx-auto mb-6" />
                <p className="text-gray-500 font-arcade tracking-widest">NO_LOGS_AVAILABLE</p>
              </div>
            ) : (
              history.map((notif) => (
                <div
                  key={notif.id}
                  className="bg-[#080808] border-2 border-[#333] rounded-[4px] p-6 hover:border-[#FFD400]/50 transition-colors group"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-3">
                        <h3 className="font-arcade text-lg text-white tracking-wide">{notif.title}</h3>
                        <span className={`inline-flex px-2 py-0.5 rounded-sm text-[10px] font-mono font-bold uppercase border ${getTypeColor(notif.type)}`}>
                          {notif.type}
                        </span>
                      </div>
                      <p className="text-gray-400 font-mono text-xs mb-4">{notif.message}</p>
                      <div className="flex items-center gap-6 text-[10px] text-gray-600 font-mono uppercase">
                        <div className="flex items-center gap-1">
                          <Users className="w-3 h-3 text-[#00B894]" />
                          {notif.recipientCount} RECIPIENTS
                        </div>
                        <div>
                          {new Date(notif.sentAt).toLocaleDateString()} // {new Date(notif.sentAt).toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <button className="px-3 py-2 bg-[#111] border border-[#333] rounded-sm text-gray-500 hover:text-white hover:border-gray-500 transition">
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
