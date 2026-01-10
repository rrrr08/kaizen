import { useState } from 'react';
import { Switch } from '@/components/ui/switch';
import { Shield, Eye, EyeOff, Users, Lock } from 'lucide-react';

interface PrivacySettingsProps {
    onSave: (settings: PrivacySettings) => Promise<void>;
    initialSettings?: PrivacySettings;
}

export interface PrivacySettings {
    profileVisibility: 'public' | 'private' | 'friends';
    showActivity: boolean;
    showAchievements: boolean;
    showPurchaseHistory: boolean;
    allowMessages: boolean;
    showOnlineStatus: boolean;
}

export default function PrivacySettings({ onSave, initialSettings }: PrivacySettingsProps) {
    const [settings, setSettings] = useState<PrivacySettings>(initialSettings || {
        profileVisibility: 'public',
        showActivity: true,
        showAchievements: true,
        showPurchaseHistory: false,
        allowMessages: true,
        showOnlineStatus: true,
    });

    const [saving, setSaving] = useState(false);

    const handleSave = async () => {
        setSaving(true);
        try {
            await onSave(settings);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Profile Visibility */}
            <div className="space-y-4">
                <h3 className="font-black text-sm uppercase tracking-widest text-black/40 flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    Profile Visibility
                </h3>

                <div className="grid grid-cols-1 gap-3">
                    {[
                        { value: 'public', label: 'Public', desc: 'Anyone can view your profile', icon: Users },
                        { value: 'private', label: 'Private', desc: 'Only you can see your profile', icon: Lock },
                        { value: 'friends', label: 'Friends Only', desc: 'Only approved friends', icon: Eye },
                    ].map(({ value, label, desc, icon: Icon }) => (
                        <label
                            key={value}
                            className={`flex items-center justify-between p-4 border-2 border-black rounded-xl cursor-pointer transition-all ${settings.profileVisibility === value
                                    ? 'bg-[#FFD93D] shadow-[4px_4px_0px_#000] -translate-y-1'
                                    : 'bg-white hover:bg-black/5'
                                }`}
                        >
                            <div className="flex items-center gap-3">
                                <Icon className="w-5 h-5" />
                                <div>
                                    <p className="font-black uppercase text-sm">{label}</p>
                                    <p className="text-xs text-black/60 font-medium">{desc}</p>
                                </div>
                            </div>
                            <input
                                type="radio"
                                name="visibility"
                                value={value}
                                checked={settings.profileVisibility === value}
                                onChange={(e) =>
                                    setSettings((prev) => ({
                                        ...prev,
                                        profileVisibility: e.target.value as any,
                                    }))
                                }
                                className="hidden"
                            />
                        </label>
                    ))}
                </div>
            </div>

            {/* Activity Settings */}
            <div className="space-y-4">
                <h3 className="font-black text-sm uppercase tracking-widest text-black/40 border-b-2 border-black/10 pb-2">
                    What Others Can See
                </h3>

                {[
                    { key: 'showActivity', label: 'Activity Feed', desc: 'Recent games and interactions' },
                    { key: 'showAchievements', label: 'Achievements & Badges', desc: 'Unlocked rewards and milestones' },
                    { key: 'showPurchaseHistory', label: 'Purchase History', desc: 'Products you\'ve bought' },
                    { key: 'allowMessages', label: 'Direct Messages', desc: 'Allow others to message you' },
                    { key: 'showOnlineStatus', label: 'Online Status', desc: 'Show when you\'re active' },
                ].map(({ key, label, desc }) => (
                    <div
                        key={key}
                        className="flex items-center justify-between p-4 border-2 border-black rounded-lg hover:bg-black/5 transition-colors"
                    >
                        <div>
                            <p className="font-bold text-sm uppercase">{label}</p>
                            <p className="text-xs text-black/60 font-medium">{desc}</p>
                        </div>
                        <Switch
                            checked={settings[key as keyof PrivacySettings] as boolean}
                            onCheckedChange={(checked) =>
                                setSettings((prev) => ({
                                    ...prev,
                                    [key]: checked,
                                }))
                            }
                            className="data-[state=checked]:bg-[#00B894] border-2 border-black"
                        />
                    </div>
                ))}
            </div>

            {/* Save Button */}
            <button
                onClick={handleSave}
                disabled={saving}
                className="w-full px-6 py-4 bg-[#6C5CE7] text-white font-black uppercase tracking-widest rounded-xl border-2 border-black neo-shadow hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_#000] active:translate-y-[2px] active:shadow-none transition-all disabled:opacity-50"
            >
                {saving ? 'Saving...' : 'Save Privacy Settings'}
            </button>
        </div>
    );
}
