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
    <div className="min-h-screen pt-28 pb-16 bg-background">
      <div className="max-w-6xl mx-auto px-6 md:px-12">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center">
              <Bell className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="font-display text-3xl font-bold">Push Notifications</h1>
              <p className="text-muted-foreground">Send mobile notifications to users in real-time</p>
            </div>
          </div>
        </div>

        <Tabs defaultValue="send" className="space-y-6">
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger value="send" className="flex items-center gap-2">
              <Send className="w-4 h-4" />
              Send Notification
            </TabsTrigger>
            <TabsTrigger value="scheduled" className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Scheduled
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Analytics
            </TabsTrigger>
          </TabsList>

          {/* Send Notification Tab */}
          <TabsContent value="send">
            <div className="glass-card p-8 rounded-lg max-w-2xl">
              <form onSubmit={handleSendCampaign} className="space-y-6">
                {/* Title Input */}
                <div>
                  <label className="block text-sm font-header font-semibold mb-2">
                    Title <span className="text-destructive">*</span>
                  </label>
                  <div className="relative">
                    <Input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      placeholder="e.g., Flash Sale - 50% Off!"
                      maxLength={65}
                      className="pr-12"
                    />
                    <span className="absolute right-3 top-3 text-xs text-muted-foreground">
                      {formData.title.length}/65
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Maximum 65 characters</p>
                </div>

                {/* Message Input */}
                <div>
                  <label className="block text-sm font-header font-semibold mb-2">
                    Message <span className="text-destructive">*</span>
                  </label>
                  <div className="relative">
                    <Textarea
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      placeholder="e.g., Get 50% off on selected games this weekend only!"
                      maxLength={240}
                      rows={4}
                      className="resize-none pr-12"
                    />
                    <span className="absolute right-3 bottom-3 text-xs text-muted-foreground">
                      {formData.message.length}/240
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Maximum 240 characters</p>
                </div>

                {/* Image URL */}
                <div>
                  <label className="block text-sm font-header font-semibold mb-2">
                    Image URL (Optional)
                  </label>
                  <Input
                    type="url"
                    name="image"
                    value={formData.image}
                    onChange={handleInputChange}
                    placeholder="https://example.com/image.jpg"
                  />
                  <p className="text-xs text-muted-foreground mt-1">Recommended size: 1024x1024px</p>
                </div>

                {/* Action URL */}
                <div>
                  <label className="block text-sm font-header font-semibold mb-2">
                    Action URL (Where to go when clicked)
                  </label>
                  <Input
                    type="url"
                    name="actionUrl"
                    value={formData.actionUrl}
                    onChange={handleInputChange}
                    placeholder="https://joyjuncture.com/shop"
                  />
                </div>

                {/* Priority */}
                <div>
                  <label className="block text-sm font-header font-semibold mb-2">Priority</label>
                  <Select value={formData.priority} onValueChange={(value) => 
                    setFormData((prev) => ({ ...prev, priority: value }))
                  }>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="high">High (Immediate)</SelectItem>
                      <SelectItem value="normal">Normal (Batched)</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground mt-1">
                    High priority shows immediately. Normal respects quiet hours.
                  </p>
                </div>

                {/* Recipient Segment */}
                <div>
                  <label className="block text-sm font-header font-semibold mb-2">
                    Send To
                  </label>
                  <Select value={formData.recipientSegment} onValueChange={(value) => 
                    setFormData((prev) => ({ ...prev, recipientSegment: value }))
                  }>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Users</SelectItem>
                      <SelectItem value="first-time">First-Time Customers</SelectItem>
                      <SelectItem value="loyal">Loyal Users (Level 3+)</SelectItem>
                      <SelectItem value="inactive">Inactive (No purchase in 30 days)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Schedule */}
                <div>
                  <label className="block text-sm font-header font-semibold mb-2">
                    Schedule (Leave empty to send now)
                  </label>
                  <Input
                    type="datetime-local"
                    name="scheduledFor"
                    value={formData.scheduledFor}
                    onChange={handleInputChange}
                  />
                </div>

                {/* Recipient Preview */}
                <div className="p-4 bg-secondary/10 border border-secondary/20 rounded-lg">
                  <p className="text-sm font-header font-semibold flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Recipient Preview
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    This will reach approximately all subscribed users in the "{formData.recipientSegment}" segment.
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <Button
                    type="submit"
                    disabled={loading || !formData.title || !formData.message}
                    className="flex-1"
                  >
                    {loading ? 'Sending...' : 'Send Notification'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setFormData({
                      title: '',
                      message: '',
                      image: '',
                      actionUrl: '',
                      priority: 'normal',
                      recipientSegment: 'all',
                      scheduledFor: '',
                    })}
                  >
                    Clear
                  </Button>
                </div>
              </form>
            </div>

            {/* Recent Campaigns */}
            <div className="mt-12">
              <h2 className="font-display text-2xl font-bold mb-6">Recent Campaigns</h2>
              {campaigns.length === 0 ? (
                <div className="glass-card p-12 rounded-lg text-center text-muted-foreground">
                  <Bell className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No campaigns sent yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {campaigns.slice(0, 5).map((campaign) => (
                    <div
                      key={campaign.id}
                      className="glass-card p-4 rounded-lg flex justify-between items-start"
                    >
                      <div className="flex-1">
                        <h3 className="font-header font-semibold">{campaign.title}</h3>
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                          {campaign.message}
                        </p>
                        <div className="flex gap-4 mt-3 text-xs text-muted-foreground">
                          <span>📧 {campaign.recipientCount} recipients</span>
                          <span>✓ {campaign.deliveredCount} delivered</span>
                          <span>👁️ {campaign.interactionCount} clicks</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                            campaign.status === 'sent'
                              ? 'bg-secondary/20 text-secondary'
                              : campaign.status === 'scheduled'
                              ? 'bg-primary/20 text-primary'
                              : 'bg-muted text-muted-foreground'
                          }`}
                        >
                          {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                        </span>
                        <p className="text-xs text-muted-foreground mt-2">
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
            <div className="glass-card p-12 rounded-lg text-center">
              <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground">No scheduled campaigns</p>
              <p className="text-sm text-muted-foreground mt-2">
                Schedule a notification in the "Send Notification" tab to see it here
              </p>
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics">
            <div className="glass-card p-12 rounded-lg text-center">
              <BarChart3 className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground">Analytics data will appear here</p>
              <p className="text-sm text-muted-foreground mt-2">
                Send notifications to see delivery and engagement statistics
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
