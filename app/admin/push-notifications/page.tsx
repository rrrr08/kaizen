'use client';

import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Bell, Send, Clock, BarChart3, Users, Smartphone, MessageSquare, Mail, CheckCircle } from 'lucide-react';
import { getCampaigns, addCampaign, Campaign } from '@/lib/firebase';
import { auth } from '@/lib/firebase';

export default function PushNotificationsPage() {
  const { addToast } = useToast();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedSegment, setSelectedSegment] = useState('all');
  const [recipientPreview, setRecipientPreview] = useState(0);
  const [totalUsers, setTotalUsers] = useState(0);

  // Form state for Push
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    image: '',
    actionUrl: '',
    priority: 'normal',
    recipientSegment: 'all',
    scheduledFor: '',
    channels: ['push', 'in-app'] as ('push' | 'in-app' | 'sms')[],
  });

  // Form state for Email
  const [emailFormData, setEmailFormData] = useState({
    subject: '',
    message: '',
    recipientSegment: 'all',
  });

  useEffect(() => {
    loadCampaigns();
    loadUserCount();

    // Auto-refresh campaigns every 30 seconds to catch status changes
    const interval = setInterval(() => {
      loadCampaigns();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  async function loadCampaigns() {
    try {
      const data = await getCampaigns();
      setCampaigns(data);
    } catch (error) {
      console.error('Error loading campaigns:', error);
      setCampaigns([]);
    }
  }

  async function loadUserCount() {
    try {
      const { auth } = await import('@/lib/firebase');
      const currentUser = auth.currentUser;

      if (currentUser) {
        const token = await currentUser.getIdToken();
        const response = await fetch('/api/admin/users/count', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          setTotalUsers(data.count || 0);
        }
      }
    } catch (error) {
      console.error('Error loading user count:', error);
      setTotalUsers(0);
    }
  }

  function handleInputChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function handleEmailInputChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    const { name, value } = e.target;
    setEmailFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  async function handleSendCampaign(e: React.FormEvent) {
    e.preventDefault();

    if (!formData.title.trim()) {
      addToast({
        title: 'Validation Error',
        description: 'Title is required',
      });
      return;
    }

    if (!formData.message.trim()) {
      addToast({
        title: 'Validation Error',
        description: 'Message is required',
      });
      return;
    }

    if (formData.title.length > 65) {
      addToast({
        title: 'Validation Error',
        description: 'Title must be 65 characters or less',
      });
      return;
    }

    if (formData.message.length > 240) {
      addToast({
        title: 'Validation Error',
        description: 'Message must be 240 characters or less',
      });
      return;
    }

    // Validate scheduled time is in the future
    if (formData.scheduledFor) {
      const scheduledDate = new Date(formData.scheduledFor);
      const now = new Date();

      if (scheduledDate <= now) {
        addToast({
          title: 'Validation Error',
          description: 'Scheduled time must be in the future',
        });
        return;
      }
    }

    setLoading(true);
    try {
      const { auth } = await import('@/lib/firebase');
      const currentUser = auth.currentUser;

      if (!currentUser) {
        throw new Error('Not authenticated');
      }

      const token = await currentUser.getIdToken();

      const response = await fetch('/api/push/campaigns', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: formData.title,
          message: formData.message,
          image: formData.image || null,
          actionUrl: formData.actionUrl || null,
          priority: formData.priority,
          recipientSegment: formData.recipientSegment,
          scheduledFor: formData.scheduledFor || null,
          channels: formData.channels,
          actionType: 'navigate' // Default action
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to send campaign');
      }

      const result = await response.json();
      console.log('Campaign handled:', result);

      // Show toast
      addToast({
        title: 'Success',
        description: result.message || 'Campaign processed successfully!',
      });

      // Reload campaigns to show the new one
      await loadCampaigns();

      // Reset form
      setFormData({
        title: '',
        message: '',
        image: '',
        actionUrl: '',
        priority: 'normal',
        recipientSegment: 'all',
        scheduledFor: '',
        channels: ['push', 'in-app'],
      });
    } catch (error) {
      console.error('Error sending campaign:', error);
      addToast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to send campaign',
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleSendEmail(e: React.FormEvent) {
    e.preventDefault();

    if (!emailFormData.subject || !emailFormData.message) {
      addToast({
        title: 'Validation Error',
        description: 'Subject and message are required',
      });
      return;
    }

    setLoading(true);

    try {
      const { auth } = await import('@/lib/firebase');
      const currentUser = auth.currentUser;

      if (currentUser) {
        const token = await currentUser.getIdToken();

        const response = await fetch('/api/admin/send-email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(emailFormData)
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to send emails');
        }

        addToast({
          title: 'Success!',
          description: data.message,
        });

        // Reset form
        setEmailFormData({
          subject: '',
          message: '',
          recipientSegment: 'all',
        });
      }
    } catch (error: any) {
      console.error('Error sending emails:', error);
      addToast({
        title: 'Error',
        description: error.message || 'Failed to send emails',
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen pt-28 pb-16 bg-[#FFFDF5]">
      <div className="max-w-6xl mx-auto px-6 md:px-12">
        {/* Header */}
        <div className="mb-12 border-b-2 border-black pb-8">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-xl bg-[#6C5CE7] border-2 border-black flex flex-shrink-0 items-center justify-center neo-shadow">
              <Bell className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="font-header text-3xl md:text-5xl font-black text-[#2D3436] uppercase tracking-tighter">Push Notifications</h1>
              <p className="text-[#2D3436]/60 font-bold text-sm md:text-lg">Send mobile notifications to users in real-time</p>
            </div>
          </div>
        </div>

        <Tabs defaultValue="send" className="space-y-8">
          <TabsList className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 w-full bg-transparent gap-4 h-auto p-0">
            <TabsTrigger
              value="send"
              className="flex items-center justify-center gap-2 bg-white border-2 border-black rounded-xl py-4 data-[state=active]:bg-[#FFD93D] data-[state=active]:text-black font-black uppercase tracking-widest text-[#2D3436]/40 hover:bg-gray-50 transition-all shadow-[4px_4px_0px_rgba(0,0,0,1)] data-[state=active]:shadow-none data-[state=active]:translate-x-[2px] data-[state=active]:translate-y-[2px]"
            >
              <Send className="w-4 h-4" strokeWidth={3} />
              Notification
            </TabsTrigger>
            <TabsTrigger
              value="email"
              className="flex items-center justify-center gap-2 bg-white border-2 border-black rounded-xl py-4 data-[state=active]:bg-[#00B894] data-[state=active]:text-black font-black uppercase tracking-widest text-[#2D3436]/40 hover:bg-gray-50 transition-all shadow-[4px_4px_0px_rgba(0,0,0,1)] data-[state=active]:shadow-none data-[state=active]:translate-x-[2px] data-[state=active]:translate-y-[2px]"
            >
              <Mail className="w-4 h-4" strokeWidth={3} />
              Email
            </TabsTrigger>
            <TabsTrigger
              value="scheduled"
              className="flex items-center justify-center gap-2 bg-white border-2 border-black rounded-xl py-4 data-[state=active]:bg-[#6C5CE7] data-[state=active]:text-black font-black uppercase tracking-widest text-[#2D3436]/40 hover:bg-gray-50 transition-all shadow-[4px_4px_0px_rgba(0,0,0,1)] data-[state=active]:shadow-none data-[state=active]:translate-x-[2px] data-[state=active]:translate-y-[2px]"
            >
              <Clock className="w-4 h-4" strokeWidth={3} />
              Scheduled
            </TabsTrigger>
            <TabsTrigger
              value="analytics"
              className="flex items-center justify-center gap-2 bg-white border-2 border-black rounded-xl py-4 data-[state=active]:bg-[#FF7675] data-[state=active]:text-black font-black uppercase tracking-widest text-[#2D3436]/40 hover:bg-gray-50 transition-all shadow-[4px_4px_0px_rgba(0,0,0,1)] data-[state=active]:shadow-none data-[state=active]:translate-x-[2px] data-[state=active]:translate-y-[2px]"
            >
              <BarChart3 className="w-4 h-4" strokeWidth={3} />
              Analytics
            </TabsTrigger>
          </TabsList>

          {/* Send Notification Tab */}
          <TabsContent value="send">
            <div className="bg-white border-2 border-black rounded-[25px] p-8 max-w-2xl neo-shadow">
              <form onSubmit={handleSendCampaign} className="space-y-6">
                {/* Title Input */}
                <div>
                  <label className="block text-[#2D3436] font-black text-xs uppercase tracking-widest mb-2">
                    Title <span className="text-[#FF7675]">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      placeholder="e.g., Flash Sale - 50% Off!"
                      maxLength={65}
                      className="w-full bg-[#FFFDF5] border-2 border-black rounded-xl px-4 py-3 text-[#2D3436] placeholder-[#2D3436]/30 focus:outline-none focus:neo-shadow-sm transition-all font-bold pr-16"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-black text-[#2D3436]/40">
                      {formData.title.length}/65
                    </span>
                  </div>
                  <p className="text-xs text-[#2D3436]/40 font-bold mt-1 uppercase tracking-wide">Maximum 65 characters</p>
                </div>

                {/* Message Input */}
                <div>
                  <label className="block text-[#2D3436] font-black text-xs uppercase tracking-widest mb-2">
                    Message <span className="text-[#FF7675]">*</span>
                  </label>
                  <div className="relative">
                    <Textarea
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      placeholder="e.g., Get 50% off on selected games this weekend only!"
                      maxLength={240}
                      rows={4}
                      className="w-full bg-[#FFFDF5] border-2 border-black rounded-xl px-4 py-3 text-[#2D3436] placeholder-[#2D3436]/30 focus:outline-none focus:neo-shadow-sm transition-all resize-none font-medium leading-relaxed pr-16"
                    />
                    <span className="absolute right-4 bottom-4 text-xs font-black text-[#2D3436]/40">
                      {formData.message.length}/240
                    </span>
                  </div>
                  <p className="text-xs text-[#2D3436]/40 font-bold mt-1 uppercase tracking-wide">Maximum 240 characters</p>
                </div>

                {/* Image URL */}
                <div>
                  <label className="block text-black font-black text-xs uppercase tracking-widest mb-2">
                    Image URL (Optional)
                  </label>
                  <input
                    type="url"
                    name="image"
                    value={formData.image}
                    onChange={handleInputChange}
                    placeholder="https://example.com/image.jpg"
                    className="w-full bg-[#FFFDF5] border-2 border-black rounded-xl px-4 py-3 text-black placeholder-black/30 focus:outline-none focus:neo-shadow-sm transition-all font-bold"
                    maxLength={500}
                  />
                  <p className="text-xs text-black/40 font-bold mt-1 uppercase tracking-wide">Recommended size: 1024x1024px</p>
                </div>

                {/* Action URL */}
                <div>
                  <label className="block text-black font-black text-xs uppercase tracking-widest mb-2">
                    Action URL (Where to go when clicked)
                  </label>
                  <input
                    type="url"
                    name="actionUrl"
                    value={formData.actionUrl}
                    onChange={handleInputChange}
                    placeholder="https://joy-juncture.vercel.app/shop"
                    className="w-full bg-[#FFFDF5] border-2 border-black rounded-xl px-4 py-3 text-black placeholder-black/30 focus:outline-none focus:neo-shadow-sm transition-all font-bold"
                    maxLength={500}
                  />
                </div>

                {/* Notification Channels */}
                <div>
                  <label className="block text-black font-black text-xs uppercase tracking-widest mb-3">
                    Notification Channels <span className="text-[#FF7675]">*</span>
                  </label>
                  <div className="space-y-3">
                    <div
                      onClick={() => {
                        const newChannels = formData.channels.includes('push')
                          ? formData.channels.filter(c => c !== 'push')
                          : [...formData.channels, 'push'];
                        setFormData(prev => ({ ...prev, channels: newChannels as ('push' | 'in-app')[] }));
                      }}
                      className={`
                        flex items-center gap-3 p-4 border-2 border-black rounded-xl cursor-pointer transition-all
                        ${formData.channels.includes('push')
                          ? 'bg-[#6C5CE7] text-white shadow-[4px_4px_0px_#000]'
                          : 'bg-[#FFFDF5] text-black hover:translate-y-[-2px] hover:shadow-[2px_2px_0px_#000]'
                        }
                      `}
                    >
                      <div className={`
                        w-6 h-6 rounded-lg border-2 flex items-center justify-center font-black text-lg
                        ${formData.channels.includes('push')
                          ? 'bg-white text-[#6C5CE7] border-white'
                          : 'bg-white border-black'
                        }
                      `}>
                        {formData.channels.includes('push') && '✓'}
                      </div>
                      <div className="flex-1">
                        <p className="font-black text-sm uppercase">Push Notifications</p>
                        <p className={`text-xs font-bold uppercase tracking-wider mt-0.5 ${formData.channels.includes('push') ? 'text-white/80' : 'text-black/50'
                          }`}>
                          Real-time device alerts
                        </p>
                      </div>
                    </div>

                    <div
                      onClick={() => {
                        const newChannels = formData.channels.includes('in-app')
                          ? formData.channels.filter(c => c !== 'in-app')
                          : [...formData.channels, 'in-app'];
                        setFormData(prev => ({ ...prev, channels: newChannels as ('push' | 'in-app' | 'sms')[] }));
                      }}
                      className={`
                        flex items-center gap-3 p-4 border-2 border-black rounded-xl cursor-pointer transition-all
                        ${formData.channels.includes('in-app')
                          ? 'bg-[#FF7675] text-white shadow-[4px_4px_0px_#000]'
                          : 'bg-[#FFFDF5] text-black hover:translate-y-[-2px] hover:shadow-[2px_2px_0px_#000]'
                        }
                      `}
                    >
                      <div className={`
                        w-6 h-6 rounded-lg border-2 flex items-center justify-center font-black text-lg
                        ${formData.channels.includes('in-app')
                          ? 'bg-white text-[#FF7675] border-white'
                          : 'bg-white border-black'
                        }
                      `}>
                        {formData.channels.includes('in-app') && '✓'}
                      </div>
                      <div className="flex-1">
                        <p className="font-black text-sm uppercase">In-App Notifications</p>
                        <p className={`text-xs font-bold uppercase tracking-wider mt-0.5 ${formData.channels.includes('in-app') ? 'text-white/80' : 'text-black/50'
                          }`}>
                          Notification bell icon
                        </p>
                      </div>
                    </div>

                    <div
                      onClick={() => {
                        const newChannels = formData.channels.includes('sms')
                          ? formData.channels.filter(c => c !== 'sms')
                          : [...formData.channels, 'sms'];
                        setFormData(prev => ({ ...prev, channels: newChannels as ('push' | 'in-app' | 'sms')[] }));
                      }}
                      className={`
                        flex items-center gap-3 p-4 border-2 border-black rounded-xl cursor-pointer transition-all
                        ${formData.channels.includes('sms')
                          ? 'bg-[#00B894] text-white shadow-[4px_4px_0px_#000]'
                          : 'bg-[#FFFDF5] text-black hover:translate-y-[-2px] hover:shadow-[2px_2px_0px_#000]'
                        }
                      `}
                    >
                      <div className={`
                        w-6 h-6 rounded-lg border-2 flex items-center justify-center font-black text-lg
                        ${formData.channels.includes('sms')
                          ? 'bg-white text-[#00B894] border-white'
                          : 'bg-white border-black'
                        }
                      `}>
                        {formData.channels.includes('sms') && '✓'}
                      </div>
                      <div className="flex-1">
                        <p className="font-black text-sm uppercase">SMS Notifications</p>
                        <p className={`text-xs font-bold uppercase tracking-wider mt-0.5 ${formData.channels.includes('sms') ? 'text-white/80' : 'text-black/50'
                          }`}>
                          Text message alerts
                        </p>
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-black/40 font-bold mt-2 uppercase tracking-wide">
                    {formData.channels.length === 0 && '⚠️ Select at least one channel'}
                    {formData.channels.length === 1 && `Selected: ${formData.channels[0] === 'push' ? 'Push only' : formData.channels[0] === 'sms' ? 'SMS only' : 'In-App only'}`}
                    {formData.channels.length > 1 && `${formData.channels.length} channels selected`}
                  </p>
                </div>

                {/* 
                {/* Priority */}
                <div>
                  <label className="block text-black font-black text-xs uppercase tracking-widest mb-2">Priority</label>
                  <div className="relative">
                    <Select value={formData.priority} onValueChange={(value) =>
                      setFormData((prev) => ({ ...prev, priority: value }))
                    }>
                      <SelectTrigger className="w-full bg-[#FFFDF5] border-2 border-black rounded-xl px-4 py-3 text-black font-bold focus:ring-0 focus:ring-offset-0 h-auto">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-2 border-black rounded-xl neo-shadow">
                        <SelectItem value="high" className="font-bold focus:bg-[#FFD93D] focus:text-black cursor-pointer">High (Immediate)</SelectItem>
                        <SelectItem value="normal" className="font-bold focus:bg-[#FFD93D] focus:text-black cursor-pointer">Normal (Batched)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <p className="text-xs text-black/40 font-bold mt-1 uppercase tracking-wide">
                    High priority shows immediately. Normal respects quiet hours.
                  </p>
                </div>

                {/* Recipient Segment */}
                <div>
                  <label className="block text-black font-black text-xs uppercase tracking-widest mb-2">
                    Send To
                  </label>
                  <div className="relative">
                    <Select value={formData.recipientSegment} onValueChange={(value) =>
                      setFormData((prev) => ({ ...prev, recipientSegment: value }))
                    }>
                      <SelectTrigger className="w-full bg-[#FFFDF5] border-2 border-black rounded-xl px-4 py-3 text-black font-bold focus:ring-0 focus:ring-offset-0 h-auto">
                        <SelectValue>
                          {formData.recipientSegment === 'all' && (totalUsers > 0 ? `All Users (${totalUsers.toLocaleString()})` : 'All Users (Loading...)')}
                          {formData.recipientSegment === 'first-time' && 'First-Time Customers'}
                          {formData.recipientSegment === 'loyal' && 'Loyal Users (Level 3+)'}
                          {formData.recipientSegment === 'inactive' && 'Inactive (No purchase in 30 days)'}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent className="bg-white border-2 border-black rounded-xl neo-shadow">
                        <SelectItem value="all" className="font-bold focus:bg-[#FFD93D] focus:text-black cursor-pointer">
                          All Users ({totalUsers > 0 ? totalUsers.toLocaleString() : 'Loading...'})
                        </SelectItem>
                        <SelectItem value="first-time" className="font-bold focus:bg-[#FFD93D] focus:text-black cursor-pointer">First-Time Customers</SelectItem>
                        <SelectItem value="loyal" className="font-bold focus:bg-[#FFD93D] focus:text-black cursor-pointer">Loyal Users (Level 3+)</SelectItem>
                        <SelectItem value="inactive" className="font-bold focus:bg-[#FFD93D] focus:text-black cursor-pointer">Inactive (No purchase in 30 days)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Schedule */}
                <div>
                  <label className="block text-black font-black text-xs uppercase tracking-widest mb-2">
                    Schedule (Leave empty to send now)
                  </label>
                  <input
                    type="datetime-local"
                    name="scheduledFor"
                    value={formData.scheduledFor}
                    onChange={handleInputChange}
                    min={new Date().toISOString().slice(0, 16)}
                    className="w-full bg-[#FFFDF5] border-2 border-black rounded-xl px-4 py-3 text-black font-bold focus:outline-none focus:neo-shadow-sm transition-all"
                  />
                  {formData.scheduledFor && (
                    <p className="text-xs text-black/60 font-bold mt-2 uppercase tracking-wide">
                      ⏰ Will be sent automatically on {new Date(formData.scheduledFor).toLocaleString()}
                    </p>
                  )}
                  <p className="text-xs text-black/40 font-bold mt-1 uppercase tracking-wide">
                    Notifications are processed automatically every minute via cron job
                  </p>
                </div>

                {/* Recipient Preview Removed */}

                {/* Action Buttons */}
                <div className="flex gap-4 pt-4">
                  <button
                    type="submit"
                    disabled={loading || !formData.title || !formData.message}
                    className="flex-1 px-6 py-4 bg-[#00B894] text-[#2D3436] font-black uppercase tracking-widest rounded-xl border-2 border-black neo-shadow hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    {loading ? 'Sending...' : 'Send Notification'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({
                      title: '',
                      message: '',
                      image: '',
                      actionUrl: '',
                      priority: 'normal',
                      recipientSegment: 'all',
                      scheduledFor: '',
                      channels: ['push', 'in-app'],
                    })}
                    className="px-6 py-4 bg-white text-[#2D3436] font-black uppercase tracking-widest rounded-xl border-2 border-black hover:bg-gray-50 transition-all"
                  >
                    Clear
                  </button>
                </div>
              </form>
            </div>

            {/* Recent Campaigns */}
            <div className="mt-12">
              <h2 className="font-header text-3xl font-black text-[#2D3436] mb-8 uppercase tracking-tighter">Recent Campaigns</h2>
              {campaigns.length === 0 ? (
                <div className="bg-white border-2 border-black border-dashed rounded-[25px] p-12 text-center">
                  <Bell className="w-12 h-12 text-[#2D3436]/20 mx-auto mb-4" />
                  <p className="text-[#2D3436]/40 font-black uppercase tracking-widest">No campaigns sent yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {campaigns.slice(0, 5).map((campaign) => (
                    <div
                      key={campaign.id}
                      className="bg-white border-2 border-black rounded-xl p-6 flex justify-between items-start hover:neo-shadow transition-all"
                    >
                      <div className="flex-1">
                        <h3 className="font-header text-xl font-black text-[#2D3436] uppercase tracking-tight">{campaign.title}</h3>
                        <p className="text-sm text-[#2D3436]/60 font-bold mt-2 line-clamp-2">
                          {campaign.message}
                        </p>
                        <div className="flex gap-6 mt-4 text-xs font-black text-[#2D3436]/40 uppercase tracking-widest">
                          <span>📧 {campaign.recipientCount} recipients</span>
                          <span>✓ {campaign.deliveredCount} delivered</span>
                          <span>👁️ {campaign.interactionCount} clicks</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span
                          className={`inline-block px-3 py-1 rounded-lg border-2 border-black text-xs font-black uppercase tracking-wider ${campaign.status === 'sent'
                            ? 'bg-[#00B894] text-black'
                            : campaign.status === 'scheduled'
                              ? 'bg-[#FFD93D] text-black'
                              : 'bg-gray-100 text-black'
                            }`}
                        >
                          {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                        </span>
                        <p className="text-xs text-[#2D3436]/40 font-bold mt-2 uppercase tracking-wide">
                          {campaign.status === 'scheduled' && campaign.scheduledFor ? (
                            <span className="text-black font-black bg-[#FFD93D] px-1 rounded">
                              Scheduled: {new Date(campaign.scheduledFor).toLocaleString()}
                            </span>
                          ) : (
                            new Date(campaign.createdAt).toLocaleDateString()
                          )}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          {/* Send Email Tab */}
          <TabsContent value="email">
            <div className="bg-white border-2 border-black rounded-[25px] p-8 max-w-2xl neo-shadow">
              <form onSubmit={handleSendEmail} className="space-y-6">
                {/* Subject */}
                <div>
                  <label className="block text-[#2D3436] font-black text-xs uppercase tracking-widest mb-2">
                    Email Subject <span className="text-[#FF7675]">*</span>
                  </label>
                  <input
                    type="text"
                    name="subject"
                    value={emailFormData.subject}
                    onChange={handleEmailInputChange}
                    placeholder="e.g., Weekly Newsletter - Game Updates"
                    maxLength={100}
                    className="w-full bg-[#FFFDF5] border-2 border-black rounded-xl px-4 py-3 text-[#2D3436] placeholder-[#2D3436]/30 focus:outline-none focus:neo-shadow-sm transition-all font-bold"
                  />
                  <p className="text-xs text-[#2D3436]/40 font-bold mt-1 uppercase tracking-wide">
                    Keep it concise and clear
                  </p>
                </div>

                {/* Message */}
                <div>
                  <label className="block text-[#2D3436] font-black text-xs uppercase tracking-widest mb-2">
                    Email Message <span className="text-[#FF7675]">*</span>
                  </label>
                  <Textarea
                    name="message"
                    value={emailFormData.message}
                    onChange={handleEmailInputChange}
                    placeholder="Write your email content here... This will be sent to all selected users."
                    rows={10}
                    maxLength={5000}
                    className="w-full bg-[#FFFDF5] border-2 border-black rounded-xl px-4 py-3 text-[#2D3436] placeholder-[#2D3436]/30 focus:outline-none focus:neo-shadow-sm transition-all resize-none font-medium leading-relaxed"
                  />
                  <p className="text-[10px] text-[#2D3436]/40 font-bold mt-1 uppercase tracking-wider text-right">{emailFormData.message.length}/5000</p>
                </div>

                {/* Recipient Segment */}
                <div>
                  <label className="block text-black font-black text-xs uppercase tracking-widest mb-2">
                    Send To
                  </label>
                  <Select
                    value={emailFormData.recipientSegment}
                    onValueChange={(value) =>
                      setEmailFormData((prev) => ({ ...prev, recipientSegment: value }))
                    }
                  >
                    <SelectTrigger className="w-full bg-[#FFFDF5] border-2 border-black rounded-xl px-4 py-3 text-black font-bold focus:ring-0 focus:ring-offset-0 h-auto">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-2 border-black rounded-xl neo-shadow">
                      <SelectItem value="all" className="font-bold focus:bg-[#FFD93D] focus:text-black cursor-pointer">
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4" />
                          All Users
                        </div>
                      </SelectItem>
                      <SelectItem value="Bronze" className="font-bold focus:bg-[#FFD93D] focus:text-black cursor-pointer">Bronze Tier Users</SelectItem>
                      <SelectItem value="Silver" className="font-bold focus:bg-[#FFD93D] focus:text-black cursor-pointer">Silver Tier Users</SelectItem>
                      <SelectItem value="Gold" className="font-bold focus:bg-[#FFD93D] focus:text-black cursor-pointer">Gold Tier Users</SelectItem>
                      <SelectItem value="Platinum" className="font-bold focus:bg-[#FFD93D] focus:text-black cursor-pointer">Platinum Tier Users</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-black/40 font-bold mt-1 uppercase tracking-wide flex items-center gap-2">
                    <CheckCircle className="w-3 h-3" />
                    Emails only go to users with verified email addresses
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4 pt-4">
                  <button
                    type="submit"
                    disabled={loading || !emailFormData.subject || !emailFormData.message}
                    className="flex-1 px-6 py-4 bg-[#00B894] text-[#2D3436] font-black uppercase tracking-widest rounded-xl border-2 border-black neo-shadow hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    {loading ? 'Sending...' : 'Send Emails'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setEmailFormData({ subject: '', message: '', recipientSegment: 'all' })}
                    className="px-6 py-4 bg-white text-[#2D3436] font-black uppercase tracking-widest rounded-xl border-2 border-black hover:bg-gray-50 transition-all"
                  >
                    Clear
                  </button>
                </div>
              </form>
            </div>
          </TabsContent>

          {/* Scheduled Tab */}
          <TabsContent value="scheduled">
            <div>
              {/* Manual Process Button for Development */}
              <div className="mb-6 flex justify-between items-center">
                <div>
                  <h2 className="font-header text-2xl font-black text-black uppercase tracking-tight">Scheduled Campaigns</h2>
                  <p className="text-sm text-black/60 font-bold mt-1">
                    Campaigns are processed automatically every minute. Use the button below to process manually.
                  </p>
                </div>
                <button
                  onClick={async () => {
                    setLoading(true);
                    try {
                      const { auth } = await import('@/lib/firebase');
                      const currentUser = auth.currentUser;
                      if (!currentUser) {
                        throw new Error('Not authenticated');
                      }
                      const token = await currentUser.getIdToken();

                      const response = await fetch('/api/cron/process-scheduled-notifications', {
                        headers: {
                          'Authorization': `Bearer ${token}`
                        }
                      });

                      const result = await response.json();

                      if (response.ok) {
                        addToast({
                          title: 'Success',
                          description: result.processed > 0
                            ? `Processed ${result.processed} scheduled notification(s)`
                            : 'No scheduled notifications were due',
                        });
                        // Reload campaigns to see status changes
                        await loadCampaigns();
                      } else {
                        throw new Error(result.error || 'Failed to process');
                      }
                    } catch (error) {
                      console.error('Error processing scheduled notifications:', error);
                      addToast({
                        title: 'Error',
                        description: error instanceof Error ? error.message : 'Failed to process scheduled notifications',
                      });
                    } finally {
                      setLoading(false);
                    }
                  }}
                  disabled={loading}
                  className="px-6 py-3 bg-[#6C5CE7] text-white font-black uppercase tracking-widest rounded-xl border-2 border-black shadow-[4px_4px_0px_#000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {loading ? 'Processing...' : 'Process Scheduled Now'}
                </button>
              </div>

              {campaigns.filter(c => c.status === 'scheduled').length === 0 ? (
                <div className="bg-white border-2 border-black rounded-[25px] p-12 text-center neo-shadow">
                  <Clock className="w-16 h-16 text-black/20 mx-auto mb-4" />
                  <p className="text-black font-black uppercase tracking-widest text-lg">No scheduled campaigns</p>
                  <p className="text-sm text-black/60 font-bold mt-2">
                    Schedule a notification in the &quot;Send Notification&quot; tab to see it here
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {campaigns
                    .filter(c => c.status === 'scheduled')
                    .sort((a, b) => {
                      const aTime = a.scheduledFor ? new Date(a.scheduledFor).getTime() : 0;
                      const bTime = b.scheduledFor ? new Date(b.scheduledFor).getTime() : 0;
                      return aTime - bTime; // Sort by scheduled time (earliest first)
                    })
                    .map((campaign) => {
                      const scheduledTime = campaign.scheduledFor ? new Date(campaign.scheduledFor) : null;
                      const now = new Date();
                      const isOverdue = scheduledTime && scheduledTime < now;

                      return (
                        <div
                          key={campaign.id}
                          className={`bg-white border-2 border-black rounded-xl p-6 flex justify-between items-start hover:neo-shadow transition-all ${isOverdue ? 'bg-yellow-50' : ''}`}
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-header text-xl font-black text-black uppercase tracking-tight">{campaign.title}</h3>
                              {isOverdue && (
                                <span className="px-2 py-1 bg-red-500 text-white text-xs font-black uppercase rounded border border-black">
                                  OVERDUE
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-black/60 font-bold mt-2 line-clamp-2">
                              {campaign.message}
                            </p>
                            <div className="flex gap-6 mt-4 text-xs font-black text-black/40 uppercase tracking-widest">
                              <span>📧 {campaign.recipientCount} recipients</span>
                              <span>⏰ Scheduled for: {scheduledTime ? scheduledTime.toLocaleString() : 'N/A'}</span>
                              {isOverdue && (
                                <span className="text-red-500">⚠️ Should have been sent already</span>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <span
                              className="inline-block px-3 py-1 rounded-lg border-2 border-black text-xs font-black uppercase tracking-wider bg-[#FFD93D] text-black"
                            >
                              Scheduled
                            </span>
                            <p className="text-xs text-black/40 font-bold mt-2 uppercase tracking-wide">
                              Created: {new Date(campaign.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics">
            <div className="space-y-8">
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white border-2 border-black rounded-xl p-6 neo-shadow">
                  <div className="flex items-center justify-between mb-2">
                    <Bell className="w-8 h-8 text-[#6C5CE7]" />
                    <span className="text-xs font-black text-black/40 uppercase tracking-widest">Total</span>
                  </div>
                  <p className="font-header text-4xl font-black text-black">{campaigns.length}</p>
                  <p className="text-xs font-bold text-black/60 uppercase tracking-wider mt-1">Campaigns</p>
                </div>

                <div className="bg-white border-2 border-black rounded-xl p-6 neo-shadow">
                  <div className="flex items-center justify-between mb-2">
                    <CheckCircle className="w-8 h-8 text-[#00B894]" />
                    <span className="text-xs font-black text-black/40 uppercase tracking-widest">Sent</span>
                  </div>
                  <p className="font-header text-4xl font-black text-black">
                    {campaigns.filter(c => c.status === 'sent').length}
                  </p>
                  <p className="text-xs font-bold text-black/60 uppercase tracking-wider mt-1">Delivered</p>
                </div>

                <div className="bg-white border-2 border-black rounded-xl p-6 neo-shadow">
                  <div className="flex items-center justify-between mb-2">
                    <Users className="w-8 h-8 text-[#FFD93D]" />
                    <span className="text-xs font-black text-black/40 uppercase tracking-widest">Reach</span>
                  </div>
                  <p className="font-header text-4xl font-black text-black">
                    {campaigns.reduce((sum, c) => sum + (c.deliveredCount || 0), 0).toLocaleString()}
                  </p>
                  <p className="text-xs font-bold text-black/60 uppercase tracking-wider mt-1">Total Delivered</p>
                </div>

                <div className="bg-white border-2 border-black rounded-xl p-6 neo-shadow">
                  <div className="flex items-center justify-between mb-2">
                    <BarChart3 className="w-8 h-8 text-[#FF7675]" />
                    <span className="text-xs font-black text-black/40 uppercase tracking-widest">Engagement</span>
                  </div>
                  <p className="font-header text-4xl font-black text-black">
                    {campaigns.reduce((sum, c) => sum + (c.interactionCount || 0), 0).toLocaleString()}
                  </p>
                  <p className="text-xs font-bold text-black/60 uppercase tracking-wider mt-1">Total Clicks</p>
                </div>
              </div>

              {/* Campaign Performance Table */}
              <div className="bg-white border-2 border-black rounded-[25px] p-8 neo-shadow">
                <h2 className="font-header text-3xl font-black text-black uppercase tracking-tighter mb-6">Campaign Performance</h2>

                {campaigns.filter(c => c.status === 'sent').length === 0 ? (
                  <div className="text-center py-12">
                    <BarChart3 className="w-16 h-16 text-black/20 mx-auto mb-4" />
                    <p className="text-black font-black uppercase tracking-widest text-lg">No sent campaigns yet</p>
                    <p className="text-sm text-black/60 font-bold mt-2">
                      Send notifications to see delivery and engagement statistics
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b-2 border-black">
                          <th className="text-left py-4 px-2 text-xs font-black uppercase tracking-widest text-black/60">Campaign</th>
                          <th className="text-center py-4 px-2 text-xs font-black uppercase tracking-widest text-black/60">Recipients</th>
                          <th className="text-center py-4 px-2 text-xs font-black uppercase tracking-widest text-black/60">Delivered</th>
                          <th className="text-center py-4 px-2 text-xs font-black uppercase tracking-widest text-black/60">Clicks</th>
                          <th className="text-center py-4 px-2 text-xs font-black uppercase tracking-widest text-black/60">CTR</th>
                          <th className="text-center py-4 px-2 text-xs font-black uppercase tracking-widest text-black/60">Date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-black/10">
                        {campaigns
                          .filter(c => c.status === 'sent')
                          .slice(0, 10)
                          .map((campaign) => {
                            const deliveryRate = campaign.recipientCount > 0
                              ? ((campaign.deliveredCount / campaign.recipientCount) * 100).toFixed(1)
                              : '0.0';
                            const clickRate = campaign.deliveredCount > 0
                              ? ((campaign.interactionCount / campaign.deliveredCount) * 100).toFixed(1)
                              : '0.0';

                            return (
                              <tr key={campaign.id} className="hover:bg-[#FFFDF5] transition-colors">
                                <td className="py-4 px-2">
                                  <p className="font-black text-sm text-black uppercase tracking-tight line-clamp-1">
                                    {campaign.title}
                                  </p>
                                  <p className="text-xs text-black/50 font-bold mt-0.5 line-clamp-1">
                                    {campaign.message}
                                  </p>
                                </td>
                                <td className="text-center py-4 px-2 font-bold text-sm text-black">
                                  {campaign.recipientCount.toLocaleString()}
                                </td>
                                <td className="text-center py-4 px-2">
                                  <div className="flex flex-col items-center">
                                    <span className="font-black text-sm text-black">
                                      {campaign.deliveredCount.toLocaleString()}
                                    </span>
                                    <span className="text-xs font-bold text-[#00B894]">
                                      {deliveryRate}%
                                    </span>
                                  </div>
                                </td>
                                <td className="text-center py-4 px-2 font-bold text-sm text-black">
                                  {campaign.interactionCount.toLocaleString()}
                                </td>
                                <td className="text-center py-4 px-2">
                                  <span className={`inline-block px-3 py-1 rounded-lg border-2 border-black text-xs font-black uppercase ${parseFloat(clickRate) >= 10
                                    ? 'bg-[#00B894] text-black'
                                    : parseFloat(clickRate) >= 5
                                      ? 'bg-[#FFD93D] text-black'
                                      : 'bg-[#FF7675] text-black'
                                    }`}>
                                    {clickRate}%
                                  </span>
                                </td>
                                <td className="text-center py-4 px-2 text-xs font-bold text-black/60 uppercase tracking-wide">
                                  {new Date(campaign.sentAt || campaign.createdAt).toLocaleDateString()}
                                </td>
                              </tr>
                            );
                          })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Engagement Insights */}
              {campaigns.filter(c => c.status === 'sent').length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white border-2 border-black rounded-xl p-6 neo-shadow">
                    <h3 className="font-header text-xl font-black text-black uppercase tracking-tight mb-4">
                      Delivery Performance
                    </h3>
                    <div className="space-y-3">
                      {(() => {
                        const sentCampaigns = campaigns.filter(c => c.status === 'sent');
                        const totalRecipients = sentCampaigns.reduce((sum, c) => sum + (c.recipientCount || 0), 0);
                        const totalDelivered = sentCampaigns.reduce((sum, c) => sum + (c.deliveredCount || 0), 0);
                        const avgDeliveryRate = totalRecipients > 0 ? ((totalDelivered / totalRecipients) * 100).toFixed(1) : '0.0';

                        return (
                          <>
                            <div className="flex justify-between items-center">
                              <span className="text-sm font-bold text-black/60 uppercase tracking-wide">Avg. Delivery Rate</span>
                              <span className="font-black text-2xl text-[#00B894]">{avgDeliveryRate}%</span>
                            </div>
                            <div className="w-full bg-black/10 rounded-full h-3 border-2 border-black overflow-hidden">
                              <div
                                className="bg-[#00B894] h-full transition-all duration-500"
                                style={{ width: `${avgDeliveryRate}%` }}
                              />
                            </div>
                          </>
                        );
                      })()}
                    </div>
                  </div>

                  <div className="bg-white border-2 border-black rounded-xl p-6 neo-shadow">
                    <h3 className="font-header text-xl font-black text-black uppercase tracking-tight mb-4">
                      Click-Through Rate
                    </h3>
                    <div className="space-y-3">
                      {(() => {
                        const sentCampaigns = campaigns.filter(c => c.status === 'sent');
                        const totalDelivered = sentCampaigns.reduce((sum, c) => sum + (c.deliveredCount || 0), 0);
                        const totalClicks = sentCampaigns.reduce((sum, c) => sum + (c.interactionCount || 0), 0);
                        const avgCTR = totalDelivered > 0 ? ((totalClicks / totalDelivered) * 100).toFixed(1) : '0.0';

                        return (
                          <>
                            <div className="flex justify-between items-center">
                              <span className="text-sm font-bold text-black/60 uppercase tracking-wide">Avg. CTR</span>
                              <span className="font-black text-2xl text-[#6C5CE7]">{avgCTR}%</span>
                            </div>
                            <div className="w-full bg-black/10 rounded-full h-3 border-2 border-black overflow-hidden">
                              <div
                                className="bg-[#6C5CE7] h-full transition-all duration-500"
                                style={{ width: `${Math.min(parseFloat(avgCTR) * 5, 100)}%` }}
                              />
                            </div>
                          </>
                        );
                      })()}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div >
  );
}
