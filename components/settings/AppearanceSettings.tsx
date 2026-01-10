import { useState } from 'react';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Sun, Moon, Globe, Type, Zap } from 'lucide-react';

interface AppearanceSettingsProps {
    onSave: (settings: AppearanceSettings) => Promise<void>;
    initialSettings?: AppearanceSettings;
}

export interface AppearanceSettings {
    theme: 'light' | 'dark' | 'system';
    language: string;
    fontSize: 'small' | 'medium' | 'large';
    reducedMotion: boolean;
    highContrast: boolean;
}

export default function AppearanceSettings({ onSave, initialSettings }: AppearanceSettingsProps) {
    const [settings, setSettings] = useState<AppearanceSettings>(initialSettings || {
        theme: 'light',
        language: 'en',
        fontSize: 'medium',
        reducedMotion: false,
        highContrast: false,
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
            {/* Theme Selection */}
            <div className="space-y-4">
                <h3 className="font-black text-sm uppercase tracking-widest text-black/40 flex items-center gap-2">
                    <Sun className="w-4 h-4" />
                    Theme
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {[
                        { value: 'light', label: 'Light', icon: Sun, desc: 'Bright and vibrant' },
                        { value: 'dark', label: 'Dark', icon: Moon, desc: 'Easy on the eyes' },
                        { value: 'system', label: 'System', icon: Zap, desc: 'Match your device' },
                    ].map(({ value, label, icon: Icon, desc }) => (
                        <label
                            key={value}
                            className={`flex flex-col items-center p-4 border-2 border-black rounded-xl cursor-pointer transition-all ${settings.theme === value
                                    ? 'bg-[#FFD93D] shadow-[4px_4px_0px_#000] -translate-y-1'
                                    : 'bg-white hover:bg-black/5'
                                }`}
                        >
                            <Icon className="w-8 h-8 mb-2" />
                            <p className="font-black uppercase text-sm">{label}</p>
                            <p className="text-xs text-black/60 font-medium text-center">{desc}</p>
                            <input
                                type="radio"
                                name="theme"
                                value={value}
                                checked={settings.theme === value}
                                onChange={(e) =>
                                    setSettings((prev) => ({
                                        ...prev,
                                        theme: e.target.value as any,
                                    }))
                                }
                                className="hidden"
                            />
                        </label>
                    ))}
                </div>

                <div className="bg-[#FFD93D]/20 border-2 border-[#FFD93D] rounded-xl p-4">
                    <p className="text-xs font-bold text-black/70">
                        ℹ️ <strong>Note:</strong> Dark mode is currently in development. The interface will remain in light mode for now.
                    </p>
                </div>
            </div>

            {/* Language Selection */}
            <div className="space-y-4">
                <h3 className="font-black text-sm uppercase tracking-widest text-black/40 flex items-center gap-2 border-b-2 border-black/10 pb-2">
                    <Globe className="w-4 h-4" />
                    Language
                </h3>

                <select
                    value={settings.language}
                    onChange={(e) =>
                        setSettings((prev) => ({
                            ...prev,
                            language: e.target.value,
                        }))
                    }
                    className="w-full px-4 py-3 bg-white border-2 border-black rounded-xl font-bold text-sm focus:outline-none focus:shadow-[4px_4px_0px_#000] transition-all"
                >
                    <option value="en">English</option>
                    <option value="hi">हिन्दी (Hindi)</option>
                    <option value="es">Español (Spanish)</option>
                    <option value="fr">Français (French)</option>
                    <option value="de">Deutsch (German)</option>
                </select>

                <div className="bg-[#FFD93D]/20 border-2 border-[#FFD93D] rounded-xl p-4">
                    <p className="text-xs font-bold text-black/70">
                        ℹ️ <strong>Note:</strong> Multi-language support is coming soon. Currently only English is available.
                    </p>
                </div>
            </div>

            {/* Font Size */}
            <div className="space-y-4">
                <h3 className="font-black text-sm uppercase tracking-widest text-black/40 flex items-center gap-2 border-b-2 border-black/10 pb-2">
                    <Type className="w-4 h-4" />
                    Font Size
                </h3>

                <div className="grid grid-cols-3 gap-3">
                    {[
                        { value: 'small', label: 'Small', size: 'text-sm' },
                        { value: 'medium', label: 'Medium', size: 'text-base' },
                        { value: 'large', label: 'Large', size: 'text-lg' },
                    ].map(({ value, label, size }) => (
                        <label
                            key={value}
                            className={`flex flex-col items-center p-4 border-2 border-black rounded-xl cursor-pointer transition-all ${settings.fontSize === value
                                    ? 'bg-[#6C5CE7] text-white shadow-[4px_4px_0px_#000] -translate-y-1'
                                    : 'bg-white hover:bg-black/5'
                                }`}
                        >
                            <p className={`font-black uppercase ${size}`}>{label}</p>
                            <input
                                type="radio"
                                name="fontSize"
                                value={value}
                                checked={settings.fontSize === value}
                                onChange={(e) =>
                                    setSettings((prev) => ({
                                        ...prev,
                                        fontSize: e.target.value as any,
                                    }))
                                }
                                className="hidden"
                            />
                        </label>
                    ))}
                </div>
            </div>

            {/* Accessibility */}
            <div className="space-y-4">
                <h3 className="font-black text-sm uppercase tracking-widest text-black/40 border-b-2 border-black/10 pb-2">
                    Accessibility
                </h3>

                <div className="flex items-center justify-between p-4 border-2 border-black rounded-lg hover:bg-black/5 transition-colors">
                    <div>
                        <p className="font-bold text-sm uppercase">Reduced Motion</p>
                        <p className="text-xs text-black/60 font-medium">Minimize animations and transitions</p>
                    </div>
                    <Switch
                        checked={settings.reducedMotion}
                        onCheckedChange={(checked) =>
                            setSettings((prev) => ({
                                ...prev,
                                reducedMotion: checked,
                            }))
                        }
                        className="data-[state=checked]:bg-[#00B894] border-2 border-black"
                    />
                </div>

                <div className="flex items-center justify-between p-4 border-2 border-black rounded-lg hover:bg-black/5 transition-colors">
                    <div>
                        <p className="font-bold text-sm uppercase">High Contrast</p>
                        <p className="text-xs text-black/60 font-medium">Increase color contrast for better visibility</p>
                    </div>
                    <Switch
                        checked={settings.highContrast}
                        onCheckedChange={(checked) =>
                            setSettings((prev) => ({
                                ...prev,
                                highContrast: checked,
                            }))
                        }
                        className="data-[state=checked]:bg-[#00B894] border-2 border-black"
                    />
                </div>
            </div>

            {/* Save Button */}
            <button
                onClick={handleSave}
                disabled={saving}
                className="w-full px-6 py-4 bg-[#6C5CE7] text-white font-black uppercase tracking-widest rounded-xl border-2 border-black neo-shadow hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_#000] active:translate-y-[2px] active:shadow-none transition-all disabled:opacity-50"
            >
                {saving ? 'Saving...' : 'Save Appearance Settings'}
            </button>
        </div>
    );
}
