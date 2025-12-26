'use client';

import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Bell, Send, Clock, BarChart3, Users, Smartphone, Wifi, Radio } from 'lucide-react';
import { getCampaigns, addCampaign, Campaign } from '@/lib/firebase';

export default function PushNotificationsPage() {
  const { addToast } = useToast();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(false);

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
        title: 'VALIDATION_ERROR',
        description: 'TITLE_REQUIRED',
      });
      return;
    }

    if (!formData.message.trim()) {
      addToast({
        title: 'VALIDATION_ERROR',
        description: 'MESSAGE_REQUIRED',
      });
      return;
    }

    if (formData.title.length > 65) {
      addToast({
        title: 'VALIDATION_ERROR',
        description: 'TITLE_LENGTH_EXCEEDED',
      });
      return;
    }

    if (formData.message.length > 240) {
      addToast({
        title: 'VALIDATION_ERROR',
        description: 'MESSAGE_LENGTH_EXCEEDED',
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
        title: 'SUCCESS',
        description: 'CAMPAIGN_INITIATED',
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
        title: 'SYSTEM_ERROR',
        description: error instanceof Error ? error.message : 'FAILED_TO_SEND',
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen pt-12 pb-16 bg-[#050505] text-white px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-12 border-b-2 border-[#333] pb-6 flex items-end justify-between">
          <div>
            <h1 className="font-arcade text-5xl text-white mb-2 text-3d-orange">PUSH_COMMAND</h1>
            <p className="text-gray-500 font-sans text-lg tracking-wide uppercase">Real-time mobile device broadcasting</p>
          </div>
          <div className="bg-[#111] border border-[#333] px-4 py-2 rounded text-xs font-mono text-gray-400 flex items-center gap-2">
            <Wifi className="w-4 h-4 text-[#00B894] animate-pulse" />
            NETWORK_ONLINE
          </div>
        </div>

        <Tabs defaultValue="send" className="space-y-8">
          <TabsList className="grid grid-cols-3 w-full bg-[#080808] border border-[#333] p-1 h-auto rounded-[4px]">
            <TabsTrigger
              value="send"
              className="flex items-center gap-2 py-3 font-arcade text-sm uppercase data-[state=active]:bg-[#FFD400] data-[state=active]:text-black transition-all"
            >
              <Send className="w-4 h-4" />
              BROADCAST
            </TabsTrigger>
            <TabsTrigger
              value="scheduled"
              className="flex items-center gap-2 py-3 font-arcade text-sm uppercase data-[state=active]:bg-[#FFD400] data-[state=active]:text-black transition-all"
            >
              <Clock className="w-4 h-4" />
              SCHEDULED_OPS
            </TabsTrigger>
            <TabsTrigger
              value="analytics"
              className="flex items-center gap-2 py-3 font-arcade text-sm uppercase data-[state=active]:bg-[#FFD400] data-[state=active]:text-black transition-all"
            >
              <BarChart3 className="w-4 h-4" />
              TELEMETRY
            </TabsTrigger>
          </TabsList>

          {/* Send Notification Tab */}
          <TabsContent value="send" className="mt-0">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 bg-[#080808] border-2 border-[#333] rounded-[4px] p-8 shadow-[0_0_20px_rgba(0,0,0,0.5)]">
                <form onSubmit={handleSendCampaign} className="space-y-6">
                  {/* Title Input */}
                  <div>
                    <div className="flex justify-between mb-2">
                      <label className="block text-[#00B894] font-mono text-[10px] uppercase tracking-widest">
                        Header_Text <span className="text-red-500">*</span>
                      </label>
                      <span className={`text-[10px] font-mono ${formData.title.length > 65 ? 'text-red-500' : 'text-gray-500'}`}>
                        {formData.title.length}/65
                      </span>
                    </div>
                    <Input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      placeholder="E.G. FLASH SALE DETECTED"
                      maxLength={65}
                      className="bg-[#111] border-[#333] text-white font-mono placeholder:text-gray-700 focus:border-[#FFD400] uppercase"
                    />
                  </div>

                  {/* Message Input */}
                  <div>
                    <div className="flex justify-between mb-2">
                      <label className="block text-[#00B894] font-mono text-[10px] uppercase tracking-widest">
                        Payload_Message <span className="text-red-500">*</span>
                      </label>
                      <span className={`text-[10px] font-mono ${formData.message.length > 240 ? 'text-red-500' : 'text-gray-500'}`}>
                        {formData.message.length}/240
                      </span>
                    </div>
                    <Textarea
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      placeholder="E.G. ACCESS GRANTED TO SECTOR 7..."
                      maxLength={240}
                      rows={4}
                      className="bg-[#111] border-[#333] text-white font-mono placeholder:text-gray-700 focus:border-[#FFD400] resize-none"
                    />
                  </div>

                  {/* Image URL */}
                  <div>
                    <label className="block text-[#00B894] font-mono text-[10px] uppercase tracking-widest mb-2">
                      Visual_Data_URL (Optional)
                    </label>
                    <Input
                      type="url"
                      name="image"
                      value={formData.image}
                      onChange={handleInputChange}
                      placeholder="HTTPS://..."
                      className="bg-[#111] border-[#333] text-white font-mono placeholder:text-gray-700 focus:border-[#FFD400]"
                    />
                  </div>

                  {/* Action URL */}
                  <div>
                    <label className="block text-[#00B894] font-mono text-[10px] uppercase tracking-widest mb-2">
                      Target_Link_Vector
                    </label>
                    <Input
                      type="url"
                      name="actionUrl"
                      value={formData.actionUrl}
                      onChange={handleInputChange}
                      placeholder="HTTPS://..."
                      className="bg-[#111] border-[#333] text-white font-mono placeholder:text-gray-700 focus:border-[#FFD400]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    {/* Priority */}
                    <div>
                      <label className="block text-[#00B894] font-mono text-[10px] uppercase tracking-widest mb-2">Transmission_Priority</label>
                      <select
                        name="priority"
                        value={formData.priority}
                        onChange={handleInputChange as any}
                        className="w-full bg-[#111] border border-[#333] rounded-md px-3 py-2 text-white font-mono focus:border-[#FFD400] outline-none appearance-none uppercase text-sm"
                      >
                        <option value="high">HIGH (IMMEDIATE)</option>
                        <option value="normal">NORMAL (BATCHED)</option>
                      </select>
                    </div>

                    {/* Recipient Segment */}
                    <div>
                      <label className="block text-[#00B894] font-mono text-[10px] uppercase tracking-widest mb-2">
                        Target_Segment
                      </label>
                      <select
                        name="recipientSegment"
                        value={formData.recipientSegment}
                        onChange={handleInputChange as any}
                        className="w-full bg-[#111] border border-[#333] rounded-md px-3 py-2 text-white font-mono focus:border-[#FFD400] outline-none appearance-none uppercase text-sm"
                      >
                        <option value="all">ALL_UNITS</option>
                        <option value="first-time">ROOKIES</option>
                        <option value="loyal">VETERANS (LVL 3+)</option>
                        <option value="inactive">DORMANT</option>
                      </select>
                    </div>
                  </div>

                  {/* Schedule */}
                  <div>
                    <label className="block text-[#00B894] font-mono text-[10px] uppercase tracking-widest mb-2">
                      Time_Delay (Empty for Immediate)
                    </label>
                    <Input
                      type="datetime-local"
                      name="scheduledFor"
                      value={formData.scheduledFor}
                      onChange={handleInputChange}
                      className="bg-[#111] border-[#333] text-white font-mono placeholder:text-gray-700 focus:border-[#FFD400]"
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-4 pt-4 border-t border-[#333]">
                    <button
                      type="submit"
                      disabled={loading || !formData.title || !formData.message}
                      className="flex-1 px-6 py-4 bg-[#FFD400] text-black font-arcade text-sm uppercase tracking-widest hover:bg-[#FFE066] disabled:opacity-50 transition flex items-center justify-center gap-3 border border-[#FFD400]"
                    >
                      {loading ? (
                        <>
                          <Radio className="w-4 h-4 animate-ping" />
                          TRANSMITTING...
                        </>
                      ) : (
                        <>
                          <Smartphone className="w-4 h-4" />
                          INITIATE_PUSH
                        </>
                      )}
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
                      className="px-6 py-4 bg-transparent border border-[#333] text-gray-500 font-arcade text-sm uppercase tracking-widest hover:text-white hover:border-white transition"
                    >
                      RESET_DATA
                    </button>
                  </div>
                </form>
              </div>

              {/* Preview & Recent */}
              <div className="space-y-8">
                {/* Preview */}
                <div className="bg-[#111] border-2 border-[#333] rounded-[30px] p-6 relative max-w-[300px] mx-auto shadow-2xl">
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-6 bg-black rounded-b-xl z-10"></div>
                  <div className="border border-[#333] rounded-xl overflow-hidden bg-black/50 backdrop-blur min-h-[100px] p-3 mt-8">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-md bg-[#FFD400] flex items-center justify-center shrink-0">
                        <Bell className="w-5 h-5 text-black" />
                      </div>
                      <div>
                        <div className="flex justify-between items-center w-full">
                          <p className="text-[10px] font-bold text-gray-300 uppercase">KAIZEN_APP</p>
                          <span className="text-[8px] text-gray-500">NOW</span>
                        </div>
                        <p className="text-sm font-bold text-white leading-tight mt-0.5">{formData.title || 'HEADER_TEXT'}</p>
                        <p className="text-xs text-gray-400 mt-1 leading-snug">{formData.message || 'Waiting for transmission content...'}</p>
                      </div>
                    </div>
                  </div>
                  <p className="text-center text-gray-600 font-mono text-[10px] uppercase mt-4">DEVICE_PREVIEW_MODE</p>
                </div>

                {/* Recent Campaigns List */}
                <div className="bg-[#080808] border border-[#333] rounded-[4px] p-6">
                  <h2 className="font-arcade text-xl text-white mb-6">RECENT_LOGS</h2>
                  {campaigns.length === 0 ? (
                    <div className="text-center text-gray-500 py-8">
                      <Bell className="w-8 h-8 mx-auto mb-2 opacity-20" />
                      <p className="font-mono text-xs uppercase">NO_CAMPAIGNS_FOUND</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {campaigns.slice(0, 5).map((campaign) => (
                        <div
                          key={campaign.id}
                          className="bg-[#111] p-3 rounded-sm border border-[#222] hover:border-[#FFD400]/30 transition-colors"
                        >
                          <div className="flex justify-between items-start mb-1">
                            <h3 className="font-mono font-bold text-gray-200 text-xs truncate max-w-[150px]">{campaign.title}</h3>
                            <span
                              className={`text-[8px] px-1.5 py-0.5 rounded-sm uppercase font-bold border ${campaign.status === 'sent'
                                  ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                                  : 'bg-green-500/10 text-green-400 border-green-500/20'
                                }`}
                            >
                              {campaign.status}
                            </span>
                          </div>
                          <p className="text-[10px] text-gray-500 line-clamp-2 mb-2">{campaign.message}</p>
                          <div className="flex justify-between text-[8px] text-gray-600 uppercase font-mono">
                            <span>TGT: {campaign.recipientCount}</span>
                            <span>{new Date(campaign.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Scheduled Tab */}
          <TabsContent value="scheduled">
            <div className="bg-[#080808] border-2 border-[#333] rounded-[4px] p-24 text-center">
              <Clock className="w-16 h-16 text-[#333] mx-auto mb-6" />
              <p className="text-gray-500 font-arcade tracking-widest text-lg">NO_SCHEDULED_OPS</p>
              <p className="text-gray-600 font-mono text-xs uppercase mt-2">
                Configure time_delay in broadcast module
              </p>
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics">
            <div className="bg-[#080808] border-2 border-[#333] rounded-[4px] p-24 text-center">
              <BarChart3 className="w-16 h-16 text-[#333] mx-auto mb-6" />
              <p className="text-gray-500 font-arcade tracking-widest text-lg">TELEMETRY_OFFLINE</p>
              <p className="text-gray-600 font-mono text-xs uppercase mt-2">
                Data accumulation pending...
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
