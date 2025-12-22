'use client';

import { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Bell, Settings, Smartphone } from 'lucide-react';
import Link from 'next/link';

interface Preferences {
  pushEnabled: boolean;
  categories: {
    promotional: boolean;
    offers: boolean;
    ordersShipping: boolean;
    gamification: boolean;
    announcements: boolean;
  };
  quietHours?: {
    enabled: boolean;
    startTime: string;
    endTime: string;
    timezone: string;
  };
  frequency: 'all' | 'daily' | 'weekly' | 'none';
}

interface Device {
  id: string;
  deviceName: string;
  deviceType: string;
  registeredAt: string;
}

export default function NotificationPreferencesPage() {
  const { addToast } = useToast();
  const [preferences, setPreferences] = useState<Preferences>({
    pushEnabled: false,
    categories: {
      promotional: true,
      offers: true,
      ordersShipping: true,
      gamification: true,
      announcements: true,
    },
    quietHours: {
      enabled: false,
      startTime: '22:00',
      endTime: '08:00',
      timezone: 'Asia/Kolkata',
    },
    frequency: 'all',
  });

  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadPreferencesAndDevices();
  }, []);

  async function loadPreferencesAndDevices() {
    try {
      setLoading(true);

      // Load preferences
      const prefsResponse = await fetch('/api/user/notification-preferences');
      if (prefsResponse.ok) {
        const data = await prefsResponse.json();
        setPreferences(data.preferences);
      }

      // Load devices
      const devicesResponse = await fetch('/api/push/my-devices');
      if (devicesResponse.ok) {
        const data = await devicesResponse.json();
        setDevices(data.devices || []);
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
      addToast({
        title: 'Error',
        description: 'Failed to load preferences',
      });
    } finally {
      setLoading(false);
    }
  }

  async function savePreferences() {
    try {
      setSaving(true);

      const response = await fetch('/api/user/notification-preferences', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(preferences),
      });

      if (!response.ok) {
        throw new Error('Failed to save preferences');
      }

      addToast({
        title: 'Success',
        description: 'Notification preferences saved',
      });
    } catch (error) {
      console.error('Error saving preferences:', error);
      addToast({
        title: 'Error',
        description: 'Failed to save preferences',
      });
    } finally {
      setSaving(false);
    }
  }

  async function unregisterDevice(deviceId: string) {
    try {
      const response = await fetch('/api/push/unregister-device', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deviceId }),
      });

      if (!response.ok) {
        throw new Error('Failed to unregister device');
      }

      setDevices(devices.filter((d) => d.id !== deviceId));
      addToast({
        title: 'Success',
        description: 'Device unregistered',
      });
    } catch (error) {
      console.error('Error unregistering device:', error);
      addToast({
        title: 'Error',
        description: 'Failed to unregister device',
      });
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen pt-28 pb-16 flex items-center justify-center bg-background">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-28 pb-16 bg-background">
      <div className="max-w-2xl mx-auto px-6 md:px-12">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center">
              <Bell className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="font-display text-4xl font-bold">Notification Preferences</h1>
              <p className="text-muted-foreground mt-1">
                Control how and when you receive notifications
              </p>
            </div>
          </div>
        </div>

        {/* Main Preferences */}
        <div className="glass-card p-8 rounded-lg mb-8">
          <h2 className="font-display text-2xl font-bold mb-6">Push Notifications</h2>

          {/* Enable/Disable */}
          <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg mb-6">
            <div>
              <p className="font-header font-semibold">Enable Push Notifications</p>
              <p className="text-sm text-muted-foreground mt-1">
                Receive real-time notifications on your devices
              </p>
            </div>
            <Switch
              checked={preferences.pushEnabled}
              onCheckedChange={(checked) =>
                setPreferences((prev) => ({
                  ...prev,
                  pushEnabled: checked,
                }))
              }
            />
          </div>

          {/* Notification Categories */}
          <div className="space-y-3 mb-8">
            <h3 className="font-header font-semibold">What to Receive</h3>

            {[
              { key: 'promotional', label: 'Promotional Offers', description: 'Latest deals and promotions' },
              { key: 'offers', label: 'Special Offers', description: 'Limited-time special offers just for you' },
              { key: 'ordersShipping', label: 'Order & Shipping Updates', description: 'Order confirmation and shipping updates' },
              { key: 'gamification', label: 'Level Up & Achievements', description: 'When you level up or unlock rewards' },
              { key: 'announcements', label: 'Announcements', description: 'Important platform announcements' },
            ].map(({ key, label, description }) => (
              <div
                key={key}
                className="flex items-center justify-between p-4 bg-muted/50 rounded-lg"
              >
                <div>
                  <p className="font-header font-semibold">{label}</p>
                  <p className="text-sm text-muted-foreground">{description}</p>
                </div>
                <Switch
                  checked={preferences.categories[key as keyof typeof preferences.categories]}
                  onCheckedChange={(checked) =>
                    setPreferences((prev) => ({
                      ...prev,
                      categories: {
                        ...prev.categories,
                        [key]: checked,
                      },
                    }))
                  }
                />
              </div>
            ))}
          </div>

          {/* Frequency */}
          <div className="space-y-3 mb-8">
            <h3 className="font-header font-semibold">Notification Frequency</h3>

            <div className="space-y-2">
              {[
                { value: 'all', label: 'All Notifications', description: 'Receive all notifications' },
                { value: 'daily', label: 'Daily Digest', description: 'Receive max 1 notification per day' },
                { value: 'weekly', label: 'Weekly Digest', description: 'Receive max 1 notification per week' },
                { value: 'none', label: 'Disable All', description: 'Turn off all notifications' },
              ].map(({ value, label, description }) => (
                <label
                  key={value}
                  className="flex items-center p-4 bg-muted/50 rounded-lg cursor-pointer hover:bg-muted/70 transition-colors"
                >
                  <input
                    type="radio"
                    name="frequency"
                    value={value}
                    checked={preferences.frequency === value}
                    onChange={(e) =>
                      setPreferences((prev) => ({
                        ...prev,
                        frequency: e.target.value as any,
                      }))
                    }
                    className="mr-4"
                  />
                  <div>
                    <p className="font-header font-semibold">{label}</p>
                    <p className="text-sm text-muted-foreground">{description}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Quiet Hours */}
          <div className="space-y-3">
            <h3 className="font-header font-semibold">Quiet Hours</h3>

            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg mb-3">
              <div>
                <p className="font-header font-semibold">Enable Quiet Hours</p>
                <p className="text-sm text-muted-foreground">Don't show notifications during specific hours</p>
              </div>
              <Switch
                checked={preferences.quietHours?.enabled || false}
                onCheckedChange={(checked) =>
                  setPreferences((prev) => ({
                    ...prev,
                    quietHours: {
                      ...prev.quietHours!,
                      enabled: checked,
                    },
                  }))
                }
              />
            </div>

            {preferences.quietHours?.enabled && (
              <div className="space-y-3 p-4 bg-primary/5 border border-primary/20 rounded-lg">
                <div>
                  <label className="block text-sm font-header font-semibold mb-2">From</label>
                  <input
                    type="time"
                    value={preferences.quietHours?.startTime || '22:00'}
                    onChange={(e) =>
                      setPreferences((prev) => ({
                        ...prev,
                        quietHours: {
                          ...prev.quietHours!,
                          startTime: e.target.value,
                        },
                      }))
                    }
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-header font-semibold mb-2">To</label>
                  <input
                    type="time"
                    value={preferences.quietHours?.endTime || '08:00'}
                    onChange={(e) =>
                      setPreferences((prev) => ({
                        ...prev,
                        quietHours: {
                          ...prev.quietHours!,
                          endTime: e.target.value,
                        },
                      }))
                    }
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-header font-semibold mb-2">Timezone</label>
                  <select
                    value={preferences.quietHours?.timezone || 'Asia/Kolkata'}
                    onChange={(e) =>
                      setPreferences((prev) => ({
                        ...prev,
                        quietHours: {
                          ...prev.quietHours!,
                          timezone: e.target.value,
                        },
                      }))
                    }
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                    <option value="UTC">UTC</option>
                    <option value="America/New_York">America/New_York (EST)</option>
                    <option value="Europe/London">Europe/London (GMT)</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* Save Button */}
          <div className="mt-8 flex gap-3">
            <Button onClick={savePreferences} disabled={saving}>
              {saving ? 'Saving...' : 'Save Preferences'}
            </Button>
            <Button variant="outline" onClick={() => loadPreferencesAndDevices()}>
              Reset
            </Button>
          </div>
        </div>

        {/* Registered Devices */}
        <div className="glass-card p-8 rounded-lg">
          <div className="flex items-center gap-3 mb-6">
            <Smartphone className="w-5 h-5" />
            <h2 className="font-display text-2xl font-bold">Registered Devices</h2>
          </div>

          {devices.length === 0 ? (
            <div className="text-center py-8">
              <Smartphone className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-50" />
              <p className="text-muted-foreground">No devices registered yet</p>
              <p className="text-sm text-muted-foreground mt-2">
                Enable notifications to register your device
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {devices.map((device) => (
                <div
                  key={device.id}
                  className="flex items-center justify-between p-4 bg-muted/50 rounded-lg"
                >
                  <div>
                    <p className="font-header font-semibold">{device.deviceName}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(device.registeredAt).toLocaleDateString()}
                    </p>
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => unregisterDevice(device.id)}
                  >
                    Remove
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Help Section */}
        <div className="mt-12 p-6 bg-secondary/10 border border-secondary/20 rounded-lg text-center">
          <p className="text-sm text-muted-foreground">
            Questions about notifications?{' '}
            <Link href="/contact" className="text-secondary font-semibold hover:underline">
              Contact Support
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
