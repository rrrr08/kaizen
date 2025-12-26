'use client';

import { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Bell, Settings, Smartphone, Trash2, Save, RotateCcw, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { LoadingScreen } from '@/components/ui/loading-screen';

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
        title: ' SYSTEM_ERROR',
        description: 'FAILED TO LOAD PREFERENCES',
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
        title: 'SUCCESS',
        description: 'PREFERENCE_PROTOCOLS_UPDATED',
      });
    } catch (error) {
      console.error('Error saving preferences:', error);
      addToast({
        title: 'ERROR',
        description: 'FAILED_TO_UPDATE_PROTOCOLS',
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
        title: 'SUCCESS',
        description: 'DEVICE_LINK_TERMINATED',
      });
    } catch (error) {
      console.error('Error unregistering device:', error);
      addToast({
        title: 'ERROR',
        description: 'TERMINATION_FAILED',
      });
    }
  }

  if (loading) {
    return <LoadingScreen message="LOADING_COMMS_CONFIG..." />;
  }

  return (
    <div className="min-h-screen pt-28 pb-16 bg-[#080808] text-white selection:bg-[#FFD400] selection:text-black">
      <div className="max-w-4xl mx-auto px-6 md:px-12">
        {/* Header */}
        <div className="mb-12 border-b-2 border-[#333] pb-8 flex justify-between items-end">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-[#FFD400]/20 p-2 rounded-sm border border-[#FFD400]/50">
                <Bell className="w-6 h-6 text-[#FFD400]" />
              </div>
              <h1 className="font-arcade text-4xl text-white uppercase text-shadow-glow">COMMS_CENTER</h1>
            </div>
            <p className="font-mono text-gray-500 text-sm tracking-wide">
              CONFIGURE_INCOMING_TRANSMISSIONS
            </p>
          </div>
          <div className="hidden md:block bg-[#1A1A1A] border border-[#333] px-3 py-1 rounded-sm">
            <span className="font-mono text-[10px] text-[#00B894] uppercase tracking-widest">SYSTEM_ONLINE</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sidebar / Main Controls */}
          <div className="lg:col-span-2 space-y-8">
            {/* Global Override */}
            <div className="bg-[#111] border border-[#333] p-6 rounded-sm relative overflow-hidden group hover:border-[#FFD400] transition-colors">
              <div className="absolute top-0 right-0 w-24 h-24 bg-[#FFD400]/5 blur-[40px] rounded-full pointer-events-none"></div>
              <div className="flex items-center justify-between relative z-10">
                <div>
                  <h3 className="font-arcade text-xl text-white mb-2 uppercase">Global Uplink</h3>
                  <p className="text-xs font-mono text-gray-400">ENABLE_REALTIME_NOTIFICATIONS</p>
                </div>
                <Switch
                  checked={preferences.pushEnabled}
                  onCheckedChange={(checked) =>
                    setPreferences((prev) => ({
                      ...prev,
                      pushEnabled: checked,
                    }))
                  }
                  className="data-[state=checked]:bg-[#FFD400]"
                />
              </div>
            </div>

            {/* Channels */}
            <div className="bg-[#111] border border-[#333] p-6 rounded-sm">
              <h3 className="font-arcade text-lg text-[#00B894] mb-6 border-b border-[#333] pb-2 uppercase tracking-wide">
                Active Frequencies
              </h3>

              <div className="space-y-4">
                {[
                  { key: 'promotional', label: 'MARKET_DATA', description: 'Deals and promotions' },
                  { key: 'offers', label: 'SPECIAL_OPS', description: 'Personalized exclusive offers' },
                  { key: 'ordersShipping', label: 'LOGISTICS', description: 'Order packing and shipping updates' },
                  { key: 'gamification', label: 'ACHIEVEMENTS', description: 'Level ups and quest completions' },
                  { key: 'announcements', label: 'SYSTEM_ALERTS', description: 'Platform updates and downtime' },
                ].map(({ key, label, description }) => (
                  <div key={key} className="flex items-center justify-between p-3 bg-[#080808] border border-[#222] hover:border-[#00B894] transition-colors rounded-sm group">
                    <div>
                      <p className="font-arcade text-sm text-white group-hover:text-[#00B894] transition-colors uppercase">{label}</p>
                      <p className="font-mono text-[10px] text-gray-500">{description}</p>
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
                      className="data-[state=checked]:bg-[#00B894]"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Frequency Modulation */}
            <div className="bg-[#111] border border-[#333] p-6 rounded-sm">
              <h3 className="font-arcade text-lg text-[#FF7675] mb-6 border-b border-[#333] pb-2 uppercase tracking-wide">
                Transmission Rate
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { value: 'all', label: 'REALTIME', description: 'Instant transmission' },
                  { value: 'daily', label: 'DAILY_LOG', description: 'Once per cycle' },
                  { value: 'weekly', label: 'WEEKLY_DUMP', description: 'Once per epoch' },
                  { value: 'none', label: 'SILENCE', description: 'Terminate all comms' },
                ].map(({ value, label, description }) => (
                  <label
                    key={value}
                    className={`
                          cursor-pointer p-4 border rounded-sm transition-all relative overflow-hidden group
                          ${preferences.frequency === value
                        ? 'bg-[#FF7675]/10 border-[#FF7675]'
                        : 'bg-[#080808] border-[#333] hover:border-[#FF7675]/50'}
                        `}
                  >
                    {preferences.frequency === value && (
                      <div className="absolute top-0 right-0 w-2 h-2 bg-[#FF7675] shadow-[0_0_5px_#FF7675]"></div>
                    )}
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
                      className="hidden"
                    />
                    <p className={`font-arcade text-sm uppercase mb-1 ${preferences.frequency === value ? 'text-[#FF7675]' : 'text-gray-400'}`}>
                      {label}
                    </p>
                    <p className="font-mono text-[10px] text-gray-600">
                      {description}
                    </p>
                  </label>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-4">
              <button
                onClick={savePreferences}
                disabled={saving}
                className="flex-1 bg-[#00B894] hover:bg-[#00a383] text-black font-arcade text-sm py-4 rounded-sm uppercase tracking-widest hover:shadow-[0_0_15px_#00B894] transition-all flex items-center justify-center gap-2"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {saving ? 'ENCODING...' : 'SAVE_CONFIG'}
              </button>
              <button
                onClick={() => loadPreferencesAndDevices()}
                className="px-6 bg-[#1A1A1A] border border-[#333] hover:border-white text-gray-400 hover:text-white font-mono text-xs py-4 rounded-sm uppercase tracking-wider transition-all"
              >
                RESET
              </button>
            </div>
          </div>

          {/* Sidebar / Quiet Hours & Devices */}
          <div className="lg:col-span-1 space-y-8">
            {/* Quiet Hours */}
            <div className="bg-[#111] border border-[#333] p-6 rounded-sm">
              <h3 className="font-arcade text-lg text-[#6C5CE7] mb-6 border-b border-[#333] pb-2 uppercase tracking-wide flex justify-between items-center">
                <span>Silent Mode</span>
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
                  className="data-[state=checked]:bg-[#6C5CE7]"
                />
              </h3>

              {preferences.quietHours?.enabled ? (
                <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-mono text-gray-500 mb-1 uppercase">Start_Time</label>
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
                        className="w-full bg-[#080808] border border-[#333] text-white px-3 py-2 text-xs font-mono rounded-sm focus:border-[#6C5CE7] outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-mono text-gray-500 mb-1 uppercase">End_Time</label>
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
                        className="w-full bg-[#080808] border border-[#333] text-white px-3 py-2 text-xs font-mono rounded-sm focus:border-[#6C5CE7] outline-none"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono text-gray-500 mb-1 uppercase">Region_Sync</label>
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
                      className="w-full bg-[#080808] border border-[#333] text-white px-3 py-2 text-xs font-mono rounded-sm focus:border-[#6C5CE7] outline-none"
                    >
                      <option value="Asia/Kolkata">ASIA_KOLKATA (IST)</option>
                      <option value="UTC">UTC_Standard</option>
                      <option value="America/New_York">US_EASTERN (EST)</option>
                      <option value="Europe/London">EU_WEST (GMT)</option>
                    </select>
                  </div>
                </div>
              ) : (
                <p className="text-gray-600 font-mono text-xs italic">
                  PROTOCOL_DISABLED. ALERTS WILL BE TRANSMITTED 24/7.
                </p>
              )}
            </div>

            {/* Linked Devices */}
            <div className="bg-[#111] border border-[#333] p-6 rounded-sm">
              <div className="flex items-center gap-2 mb-6 border-b border-[#333] pb-2">
                <Smartphone className="w-4 h-4 text-white" />
                <h3 className="font-arcade text-lg text-white uppercase tracking-wide">
                  Linked Terminals
                </h3>
              </div>

              <div className="space-y-3">
                {devices.length === 0 ? (
                  <div className="text-center py-6 border border-dashed border-[#333] rounded-sm">
                    <p className="text-gray-500 font-mono text-[10px] uppercase">
                      No_Hardware_Detected
                    </p>
                  </div>
                ) : (
                  devices.map((device) => (
                    <div key={device.id} className="bg-[#080808] border border-[#333] p-3 rounded-sm flex justify-between items-center group hover:border-gray-500 transition-colors">
                      <div>
                        <p className="font-arcade text-xs text-white uppercase">{device.deviceName}</p>
                        <p className="font-mono text-[8px] text-gray-600 uppercase">Id: {device.id.slice(0, 8)}...</p>
                      </div>
                      <button
                        onClick={() => unregisterDevice(device.id)}
                        className="text-[#FF003C] hover:bg-[#FF003C]/10 p-2 rounded-sm transition-colors"
                        title="Unlink Device"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Help / Support */}
            <div className="bg-[#080808] border border-[#333] p-4 rounded-sm text-center">
              <p className="font-mono text-[10px] text-gray-500 mb-2">
                SIGNAL_INTERFERENCE?
              </p>
              <Link href="/contact" className="font-arcade text-xs text-[#FFD400] hover:underline uppercase tracking-wider">
                CONTACT_SECTOR_CONTROL
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
