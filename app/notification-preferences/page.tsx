'use client';

import { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { usePushNotifications } from '@/hooks/use-push-notifications';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Bell, Settings, Smartphone, MessageSquare } from 'lucide-react';
import Link from 'next/link';
import PhoneVerification from '@/components/PhoneVerification';
import { auth, db } from '@/lib/firebase';
import { doc, onSnapshot } from 'firebase/firestore';

interface Preferences {
  pushEnabled: boolean;
  inAppEnabled: boolean;
  smsEnabled: boolean;
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
  const { requestPermission, permission, isSupported } = usePushNotifications();
  
  const [preferences, setPreferences] = useState<Preferences>({
    pushEnabled: true,
    inAppEnabled: true,
    smsEnabled: true,
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
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [phoneVerified, setPhoneVerified] = useState(false);

  useEffect(() => {
    loadPreferencesAndDevices();
    
    // Subscribe to real-time phone number updates
    const currentUser = auth.currentUser;
    if (currentUser) {
      const userRef = doc(db, 'users', currentUser.uid);
      const unsubscribe = onSnapshot(userRef, (snapshot) => {
        if (snapshot.exists()) {
          const userData = snapshot.data();
          setPhoneNumber(userData.phoneNumber || '');
          setPhoneVerified(userData.phoneVerified || false);
        }
      });

      return () => unsubscribe();
    }
  }, []);

  // Auto-register device if push is enabled and permission granted
  useEffect(() => {
    if (preferences.pushEnabled && permission === 'granted' && isSupported) {
      console.log('Push enabled with granted permission - ensuring device is registered');
      // Trigger registration by calling requestPermission (it will handle already-granted case)
      requestPermission().then(() => {
        loadPreferencesAndDevices(); // Reload to show newly registered device
      });
    }
  }, [preferences.pushEnabled, permission, isSupported]);

  async function loadPreferencesAndDevices() {
    try {
      setLoading(true);

      const currentUser = auth.currentUser;
      if (!currentUser) {
        console.log('No user logged in');
        return;
      }

      const token = await currentUser.getIdToken();

      // Load preferences
      const prefsResponse = await fetch('/api/user/notification-preferences', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (prefsResponse.ok) {
        const data = await prefsResponse.json();
        setPreferences(data.preferences);
      }

      // Load devices
      const devicesResponse = await fetch('/api/push/my-devices', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
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

      const currentUser = auth.currentUser;
      if (!currentUser) {
        addToast({
          title: 'Error',
          description: 'Please log in again',
        });
        return;
      }

      // Force token refresh to ensure it's valid
      const token = await currentUser.getIdToken(true);

      const response = await fetch('/api/user/notification-preferences', {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(preferences),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save preferences');
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
      const currentUser = auth.currentUser;
      if (!currentUser) {
        addToast({
          title: 'Error',
          description: 'Please log in again',
        });
        return;
      }

      const token = await currentUser.getIdToken(true);

      const response = await fetch('/api/push/unregister-device', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
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
      <div className="min-h-screen pt-32 pb-16 flex items-center justify-center bg-[#FFFDF5]">
        <div className="flex flex-col items-center justify-center gap-4">
          <div className="w-12 h-12 border-4 border-black border-t-[#6C5CE7] rounded-full animate-spin"></div>
          <p className="font-black text-xs tracking-[0.2em] uppercase text-black/50">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-32 pb-16 bg-[#FFFDF5] text-[#2D3436]">
      <div className="max-w-3xl mx-auto px-6">
        {/* Header */}
        <div className="mb-12 flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-2xl bg-[#FFD93D] border-2 border-black flex items-center justify-center mb-6 neo-shadow rotate-3 transform hover:rotate-6 transition-transform">
            <Bell className="w-8 h-8 text-black" strokeWidth={2.5} />
          </div>
          <h1 className="font-header text-4xl md:text-5xl font-black text-black uppercase tracking-tight mb-2">
            Notification<br />Preferences
          </h1>
          <p className="font-medium text-black/60 max-w-md mx-auto">
            Control how and when you receive pings, alerts, and other noise.
          </p>
        </div>

        {/* Main Preferences */}
        <div className="bg-white border-2 border-black rounded-[25px] p-8 neo-shadow mb-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
            <Bell size={120} strokeWidth={1} />
          </div>

          <h2 className="font-header text-2xl font-black uppercase text-black mb-6 flex items-center gap-3">
            <span className="w-8 h-8 bg-[#6C5CE7] rounded-lg border-2 border-black text-white flex items-center justify-center text-sm shadow-[2px_2px_0px_#000]">1</span>
            Notification Channels
          </h2>

          {/* Push Notifications Toggle */}
          <div className="flex items-center justify-between p-6 bg-[#FFFDF5] border-2 border-black rounded-xl mb-4 shadow-[4px_4px_0px_#000] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_#000] transition-all">
            <div className="flex items-center gap-3">
              <Smartphone className="w-5 h-5 text-[#6C5CE7]" />
              <div>
                <p className="font-black text-lg uppercase">Push Notifications</p>
                <p className="text-xs font-bold text-black/50 uppercase tracking-wider mt-1">
                  {!isSupported && '⚠️ Not supported on this browser'}
                  {isSupported && permission === 'denied' && '⚠️ Notifications blocked - Click the 🔒 icon in address bar to allow'}
                  {isSupported && permission === 'default' && 'Real-time alerts to your device'}
                  {isSupported && permission === 'granted' && '✅ Notifications enabled'}
                </p>
              </div>
            </div>
            <Switch
              checked={preferences.pushEnabled}
              disabled={!isSupported || permission === 'denied'}
              onCheckedChange={async (checked) => {
                if (checked && permission === 'default') {
                  // Request permission when enabling for the first time
                  const granted = await requestPermission();
                  if (!granted) {
                    addToast({
                      title: 'Permission Required',
                      description: 'Please click "Allow" when your browser asks for notification permission',
                      variant: 'destructive',
                    });
                    return;
                  }
                  addToast({
                    title: 'Device Registered!',
                    description: 'This device is now registered for push notifications',
                  });
                  loadPreferencesAndDevices(); // Refresh to show device
                }
                setPreferences((prev) => ({
                  ...prev,
                  pushEnabled: checked,
                }));
              }}
              className="data-[state=checked]:bg-[#00B894] data-[state=unchecked]:bg-gray-200 border-2 border-black"
            />
          </div>

          {/* Warning banner for denied permission */}
          {permission === 'denied' && (
            <div className="p-4 bg-[#FFE5E5] border-2 border-[#FF7675] rounded-xl mb-4">
              <p className="font-bold text-sm text-[#FF0000] uppercase mb-2">🚫 Notifications Blocked</p>
              <p className="text-xs font-medium text-black/70 mb-3">
                Push notifications are blocked by your browser. To enable them:
              </p>
              <ol className="text-xs font-medium text-black/70 space-y-1 ml-4 list-decimal">
                <li>Click the 🔒 lock icon in your browser's address bar</li>
                <li>Find "Notifications" in the permissions list</li>
                <li>Change it from "Block" to "Allow"</li>
                <li>Refresh this page</li>
              </ol>
            </div>
          )}

          {/* In-App Notifications Toggle */}
          <div className="flex items-center justify-between p-6 bg-[#FFFDF5] border-2 border-black rounded-xl mb-4 shadow-[4px_4px_0px_#000] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_#000] transition-all">
            <div className="flex items-center gap-3">
              <Bell className="w-5 h-5 text-[#FF7675]" />
              <div>
                <p className="font-black text-lg uppercase">In-App Notifications</p>
                <p className="text-xs font-bold text-black/50 uppercase tracking-wider mt-1">
                  Notification bell icon updates
                </p>
              </div>
            </div>
            <Switch
              checked={preferences.inAppEnabled}
              onCheckedChange={(checked) =>
                setPreferences((prev) => ({
                  ...prev,
                  inAppEnabled: checked,
                }))
              }
              className="data-[state=checked]:bg-[#00B894] data-[state=unchecked]:bg-gray-200 border-2 border-black"
            />
          </div>

          {/* SMS Notifications Toggle */}
          <div className="flex items-center justify-between p-6 bg-[#FFFDF5] border-2 border-black rounded-xl mb-8 shadow-[4px_4px_0px_#000] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_#000] transition-all">
            <div className="flex items-center gap-3">
              <MessageSquare className="w-5 h-5 text-[#00B894]" />
              <div>
                <p className="font-black text-lg uppercase">SMS Notifications</p>
                <p className="text-xs font-bold text-black/50 uppercase tracking-wider mt-1">
                  Text message alerts
                </p>
              </div>
            </div>
            <Switch
              checked={preferences.smsEnabled}
              onCheckedChange={(checked) =>
                setPreferences((prev) => ({
                  ...prev,
                  smsEnabled: checked,
                }))
              }
              className="data-[state=checked]:bg-[#00B894] data-[state=unchecked]:bg-gray-200 border-2 border-black"
            />
          </div>

          {/* Phone Verification Section for SMS */}
          {preferences.smsEnabled && (
            <div className="mt-8 mb-10 pt-8 border-t-2 border-black/10">
              <h3 className="font-black text-xl uppercase text-black mb-4 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-[#00B894]" />
                Phone Verification
              </h3>
              <p className="text-sm font-bold text-black/60 mb-6">
                Verify your phone number to receive SMS notifications
              </p>
              <PhoneVerification
                currentPhone={phoneNumber}
                isVerified={phoneVerified}
                onVerified={(verifiedPhone) => {
                  // Immediately update local state
                  setPhoneNumber(verifiedPhone);
                  setPhoneVerified(true);
                  
                  addToast({
                    title: 'Success!',
                    description: 'Phone number verified. You can now receive SMS notifications.',
                  });
                }}
              />
            </div>
          )}

          {/* Notification Categories */}
          <div className="space-y-4 mb-10">
            <h3 className="font-black text-sm uppercase tracking-widest text-black/40 mb-4 border-b-2 border-black/10 pb-2">What to Receive</h3>

            {[
              { key: 'promotional', label: 'Promotional Offers', description: 'Latest deals and promotions', color: 'bg-[#FF7675]' },
              { key: 'offers', label: 'Special Offers', description: 'Limited-time special offers', color: 'bg-[#74B9FF]' },
              { key: 'ordersShipping', label: 'Order Updates', description: 'Confirmation and shipping', color: 'bg-[#FFEAA7]' },
              { key: 'gamification', label: 'Game Rewards', description: 'Level ups and badges', color: 'bg-[#A29BFE]' },
              { key: 'announcements', label: 'Announcements', description: 'Platform news', color: 'bg-[#55EFC4]' },
            ].map(({ key, label, description, color }) => (
              <div
                key={key}
                className="flex items-center justify-between p-4 border-2 border-black rounded-lg hover:bg-black/5 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-3 h-3 rounded-full border border-black ${color}`}></div>
                  <div>
                    <p className="font-bold text-sm uppercase">{label}</p>
                    <p className="text-xs text-black/60 font-medium">{description}</p>
                  </div>
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
                  className="data-[state=checked]:bg-black border-2 border-black"
                />
              </div>
            ))}
          </div>

          {/* Frequency */}
          <div className="space-y-4 mb-10">
            <h3 className="font-black text-sm uppercase tracking-widest text-black/40 mb-4 border-b-2 border-black/10 pb-2">Frequency</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { value: 'all', label: 'All Pings', emoji: '⚡' },
                { value: 'daily', label: 'Daily Digest', emoji: '📅' },
                { value: 'weekly', label: 'Weekly', emoji: '📆' },
                { value: 'none', label: 'Silence', emoji: '🔕' },
              ].map(({ value, label, emoji }) => (
                <label
                  key={value}
                  className={`flex items-center p-4 border-2 border-black rounded-xl cursor-pointer transition-all ${preferences.frequency === value
                      ? 'bg-[#FFD93D] shadow-[4px_4px_0px_#000] -translate-y-1'
                      : 'bg-white hover:bg-black/5'
                    }`}
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
                    className="hidden"
                  />
                  <span className="text-2xl mr-3">{emoji}</span>
                  <div>
                    <p className="font-black uppercase text-sm">{label}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Quiet Hours */}
          <div className="space-y-4">
            <h3 className="font-black text-sm uppercase tracking-widest text-black/40 mb-4 border-b-2 border-black/10 pb-2">Quiet Hours</h3>

            <div className="flex items-center justify-between p-4 border-2 border-black rounded-lg">
              <div>
                <p className="font-bold uppercase text-sm">Enable Quiet Hours</p>
                <p className="text-xs text-black/60">Silence notifications during set times</p>
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
                className="data-[state=checked]:bg-black border-2 border-black"
              />
            </div>

            {preferences.quietHours?.enabled && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-black/5 rounded-xl border-2 border-black border-dashed">
                <div>
                  <label className="block text-xs font-black uppercase mb-2 ml-1">From</label>
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
                    className="w-full px-3 py-2 bg-white border-2 border-black rounded-lg font-bold text-sm focus:outline-none focus:shadow-[2px_2px_0px_#000]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black uppercase mb-2 ml-1">To</label>
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
                    className="w-full px-3 py-2 bg-white border-2 border-black rounded-lg font-bold text-sm focus:outline-none focus:shadow-[2px_2px_0px_#000]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black uppercase mb-2 ml-1">Timezone</label>
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
                    className="w-full px-3 py-2 bg-white border-2 border-black rounded-lg font-bold text-sm focus:outline-none focus:shadow-[2px_2px_0px_#000]"
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
          <div className="mt-8 flex flex-col sm:flex-row gap-4 pt-6 border-t-2 border-black">
            <Button
              onClick={savePreferences}
              disabled={saving}
              className="flex-1 bg-[#00B894] hover:bg-[#00a180] text-black border-2 border-black p-6 rounded-xl font-black text-sm uppercase tracking-widest hover:translate-y-[-2px] hover:shadow-[4px_4px_0px_#000] active:translate-y-[2px] active:shadow-none transition-all neo-shadow"
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin mr-2"></div>
                  Saving...
                </>
              ) : 'Save Changes'}
            </Button>
            <Button
              variant="outline"
              onClick={() => loadPreferencesAndDevices()}
              className="flex-1 bg-white hover:bg-black/5 text-black border-2 border-black p-6 rounded-xl font-black text-sm uppercase tracking-widest hover:translate-y-[-2px] hover:shadow-[4px_4px_0px_#000] active:translate-y-[2px] active:shadow-none transition-all neo-shadow"
            >
              Reset Defaults
            </Button>
          </div>
        </div>

        {/* Registered Devices */}
        <div className="bg-white border-2 border-black rounded-[25px] p-8 neo-shadow relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
            <Smartphone size={100} strokeWidth={1} />
          </div>

          <div className="flex items-center gap-3 mb-8">
            <div className="w-8 h-8 bg-[#FF7675] rounded-lg border-2 border-black text-white flex items-center justify-center text-sm shadow-[2px_2px_0px_#000]">2</div>
            <h2 className="font-header text-2xl font-black uppercase text-black">Registered Devices</h2>
          </div>

          {devices.length === 0 ? (
            <div className="text-center py-12 px-6 border-2 border-black border-dashed rounded-xl bg-[#FFFDF5]">
              <div className="w-16 h-16 bg-[#FFD93D]/30 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-black">
                <Smartphone className="w-8 h-8 text-black" strokeWidth={2} />
              </div>
              <p className="font-bold text-black uppercase mb-1">No devices found</p>
              <p className="text-xs text-black/60 font-medium mb-4">
                {!isSupported && 'Push notifications not supported on this browser'}
                {isSupported && permission === 'denied' && 'Allow notifications in browser settings first'}
                {isSupported && permission === 'default' && 'Click the button below to register this device'}
                {isSupported && permission === 'granted' && 'Click below to register or toggle push notifications ON above'}
              </p>
              {isSupported && permission !== 'denied' && (
                <Button
                  onClick={async () => {
                    const granted = await requestPermission();
                    
                    if (granted) {
                      addToast({
                        title: 'Device Registered!',
                        description: 'Reloading devices...',
                      });
                      setTimeout(() => loadPreferencesAndDevices(), 2000);
                    } else {
                      const currentPermission = Notification.permission;
                      addToast({
                        title: 'Registration Failed',
                        description: currentPermission === 'denied' 
                          ? 'Notifications are blocked. Check browser settings.' 
                          : 'Please allow notifications when prompted',
                        variant: 'destructive',
                      });
                    }
                  }}
                  className="bg-[#6C5CE7] hover:bg-[#5F4FD1] text-white font-black uppercase border-2 border-black shadow-[4px_4px_0px_#000] hover:shadow-[2px_2px_0px_#000] hover:translate-y-[2px]"
                >
                  Register This Device
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {devices.map((device) => (
                <div
                  key={device.id}
                  className="flex items-center justify-between p-4 border-2 border-black rounded-lg bg-white shadow-[2px_2px_0px_#000]"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-black text-white rounded-lg flex items-center justify-center border-2 border-black">
                      <Smartphone size={20} />
                    </div>
                    <div>
                      <p className="font-black text-sm uppercase">{device.deviceName}</p>
                      <p className="text-xs font-bold text-black/50 uppercase tracking-wider">
                        Registered: {new Date(device.registeredAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => unregisterDevice(device.id)}
                    className="bg-[#FF7675] hover:bg-[#ff5e5d] text-black border-2 border-black font-bold uppercase text-xs tracking-wide shadow-[2px_2px_0px_#000] hover:shadow-[3px_3px_0px_#000] hover:translate-y-[-1px]"
                  >
                    Remove
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Help Section */}
        <div className="mt-8 text-center">
          <Link href="/contact" className="inline-block font-black text-xs tracking-[0.2em] text-black/40 hover:text-black uppercase border-b-2 border-transparent hover:border-black transition-all pb-1">
            Need Help with Notifications?
          </Link>
        </div>
      </div>
    </div>
  );
}
