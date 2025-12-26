'use client';

import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Bell, Send, Clock, BarChart3, Users } from 'lucide-react';
import { getCampaigns, addCampaign, Campaign } from '@/lib/firebase';

export default function PushNotificationsPage() {
  const { addToast } = useToast();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedSegment, setSelectedSegment] = useState('all');
  const [recipientPreview, setRecipientPreview] = useState(0);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    image: '',
    actionUrl: '',
    priority: 'normal',
    recipientSegment: 'all',
    scheduledFor: '',
  });

  useEffect(() => {
    loadCampaigns();
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

  function handleInputChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) {
    const { name, value } = e.target;
    setFormData((prev) => ({
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

    setLoading(true);

    try {
      const newCampaign = {
        title: formData.title,
        message: formData.message,
        status: 'sent',
        recipientCount: formData.recipientSegment === 'all' ? 1250 : 100,
        image: formData.image || undefined,
        actionUrl: formData.actionUrl || undefined,
        priority: formData.priority,
      };

      const docId = await addCampaign(newCampaign as any);

      setCampaigns([
        {
          id: docId,
          ...newCampaign,
          deliveredCount: 0,
          interactionCount: 0,
          createdAt: new Date().toISOString(),
        },
        ...campaigns,
      ]);

      addToast({
        title: 'Success',
        description: 'Campaign sent successfully!',
      });

      // Reset form
      setFormData({
        title: '',
        message: '',
        image: '',
        actionUrl: '',
        priority: 'normal',
        recipientSegment: 'all',
        scheduledFor: '',
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

  return (
    <div className="min-h-screen pt-28 pb-16 bg-[#FFFDF5]">
      <div className="max-w-6xl mx-auto px-6 md:px-12">
        {/* Header */}
        <div className="mb-12 border-b-2 border-black pb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-xl bg-[#6C5CE7] border-2 border-black flex items-center justify-center neo-shadow">
              <Bell className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="font-header text-5xl font-black text-black uppercase tracking-tighter">Push Notifications</h1>
              <p className="text-black/60 font-bold text-lg">Send mobile notifications to users in real-time</p>
            </div>
          </div>
        </div>

        <Tabs defaultValue="send" className="space-y-8">
          <TabsList className="grid grid-cols-3 w-full bg-transparent gap-4 h-auto p-0">
            <TabsTrigger
              value="send"
              className="flex items-center gap-2 bg-white border-2 border-black rounded-xl py-4 data-[state=active]:bg-[#FFD93D] data-[state=active]:text-black font-black uppercase tracking-widest text-black/40 hover:bg-gray-50 transition-all shadow-[4px_4px_0px_rgba(0,0,0,1)] data-[state=active]:shadow-none data-[state=active]:translate-x-[2px] data-[state=active]:translate-y-[2px]"
            >
              <Send className="w-4 h-4" strokeWidth={3} />
              Send Notification
            </TabsTrigger>
            <TabsTrigger
              value="scheduled"
              className="flex items-center gap-2 bg-white border-2 border-black rounded-xl py-4 data-[state=active]:bg-[#00B894] data-[state=active]:text-black font-black uppercase tracking-widest text-black/40 hover:bg-gray-50 transition-all shadow-[4px_4px_0px_rgba(0,0,0,1)] data-[state=active]:shadow-none data-[state=active]:translate-x-[2px] data-[state=active]:translate-y-[2px]"
            >
              <Clock className="w-4 h-4" strokeWidth={3} />
              Scheduled
            </TabsTrigger>
            <TabsTrigger
              value="analytics"
              className="flex items-center gap-2 bg-white border-2 border-black rounded-xl py-4 data-[state=active]:bg-[#FF7675] data-[state=active]:text-black font-black uppercase tracking-widest text-black/40 hover:bg-gray-50 transition-all shadow-[4px_4px_0px_rgba(0,0,0,1)] data-[state=active]:shadow-none data-[state=active]:translate-x-[2px] data-[state=active]:translate-y-[2px]"
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
                  <label className="block text-black font-black text-xs uppercase tracking-widest mb-2">
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
                      className="w-full bg-[#FFFDF5] border-2 border-black rounded-xl px-4 py-3 text-black placeholder-black/30 focus:outline-none focus:neo-shadow-sm transition-all font-bold pr-16"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-black text-black/40">
                      {formData.title.length}/65
                    </span>
                  </div>
                  <p className="text-xs text-black/40 font-bold mt-1 uppercase tracking-wide">Maximum 65 characters</p>
                </div>

                {/* Message Input */}
                <div>
                  <label className="block text-black font-black text-xs uppercase tracking-widest mb-2">
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
                      className="w-full bg-[#FFFDF5] border-2 border-black rounded-xl px-4 py-3 text-black placeholder-black/30 focus:outline-none focus:neo-shadow-sm transition-all resize-none font-medium leading-relaxed pr-16"
                    />
                    <span className="absolute right-4 bottom-4 text-xs font-black text-black/40">
                      {formData.message.length}/240
                    </span>
                  </div>
                  <p className="text-xs text-black/40 font-bold mt-1 uppercase tracking-wide">Maximum 240 characters</p>
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
                    placeholder="https://joyjuncture.com/shop"
                    className="w-full bg-[#FFFDF5] border-2 border-black rounded-xl px-4 py-3 text-black placeholder-black/30 focus:outline-none focus:neo-shadow-sm transition-all font-bold"
                  />
                </div>

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
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-2 border-black rounded-xl neo-shadow">
                        <SelectItem value="all" className="font-bold focus:bg-[#FFD93D] focus:text-black cursor-pointer">All Users</SelectItem>
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
                    className="w-full bg-[#FFFDF5] border-2 border-black rounded-xl px-4 py-3 text-black font-bold focus:outline-none focus:neo-shadow-sm transition-all"
                  />
                </div>

                {/* Recipient Preview */}
                <div className="p-4 bg-[#FFD93D]/10 border-2 border-[#FFD93D] border-dashed rounded-xl">
                  <p className="text-sm font-black text-black flex items-center gap-2 uppercase tracking-wide">
                    <Users className="w-4 h-4" />
                    Recipient Preview
                  </p>
                  <p className="text-sm text-black/60 font-bold mt-2">
                    This will reach approximately all subscribed users in the "{formData.recipientSegment}" segment.
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4 pt-4">
                  <button
                    type="submit"
                    disabled={loading || !formData.title || !formData.message}
                    className="flex-1 px-6 py-4 bg-[#00B894] text-black font-black uppercase tracking-widest rounded-xl border-2 border-black neo-shadow hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none disabled:opacity-50 disabled:cursor-not-allowed transition-all"
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
                    })}
                    className="px-6 py-4 bg-white text-black font-black uppercase tracking-widest rounded-xl border-2 border-black hover:bg-gray-50 transition-all"
                  >
                    Clear
                  </button>
                </div>
              </form>
            </div>

            {/* Recent Campaigns */}
            <div className="mt-12">
              <h2 className="font-header text-3xl font-black text-black mb-8 uppercase tracking-tighter">Recent Campaigns</h2>
              {campaigns.length === 0 ? (
                <div className="bg-white border-2 border-black border-dashed rounded-[25px] p-12 text-center">
                  <Bell className="w-12 h-12 text-black/20 mx-auto mb-4" />
                  <p className="text-black/40 font-black uppercase tracking-widest">No campaigns sent yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {campaigns.slice(0, 5).map((campaign) => (
                    <div
                      key={campaign.id}
                      className="bg-white border-2 border-black rounded-xl p-6 flex justify-between items-start hover:neo-shadow transition-all"
                    >
                      <div className="flex-1">
                        <h3 className="font-header text-xl font-black text-black uppercase tracking-tight">{campaign.title}</h3>
                        <p className="text-sm text-black/60 font-bold mt-2 line-clamp-2">
                          {campaign.message}
                        </p>
                        <div className="flex gap-6 mt-4 text-xs font-black text-black/40 uppercase tracking-widest">
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
                        <p className="text-xs text-black/40 font-bold mt-2 uppercase tracking-wide">
                          {new Date(campaign.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          {/* Scheduled Tab */}
          <TabsContent value="scheduled">
            <div className="bg-white border-2 border-black rounded-[25px] p-12 text-center neo-shadow">
              <Clock className="w-16 h-16 text-black/20 mx-auto mb-4" />
              <p className="text-black font-black uppercase tracking-widest text-lg">No scheduled campaigns</p>
              <p className="text-sm text-black/60 font-bold mt-2">
                Schedule a notification in the "Send Notification" tab to see it here
              </p>
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics">
            <div className="bg-white border-2 border-black rounded-[25px] p-12 text-center neo-shadow">
              <BarChart3 className="w-16 h-16 text-black/20 mx-auto mb-4" />
              <p className="text-black font-black uppercase tracking-widest text-lg">Analytics data will appear here</p>
              <p className="text-sm text-black/60 font-bold mt-2">
                Send notifications to see delivery and engagement statistics
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
