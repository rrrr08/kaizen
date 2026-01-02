'use client';
import { useState, useEffect } from 'react';
import { collection, doc, getDoc, setDoc, getFirestore } from 'firebase/firestore';
import { app } from '@/lib/firebase';
const db = getFirestore(app);
import { Trash, Plus, Save } from 'lucide-react';

interface WheelPrize {
    id: string;
    type: 'JP' | 'XP' | 'ITEM' | 'COUPON' | 'JACKPOT';
    value: number | string;
    label: string;
    probability: number;
    color: string;
}

export default function WheelSettingsPage() {
    const [prizes, setPrizes] = useState<WheelPrize[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchPrizes();
    }, []);

    const fetchPrizes = async () => {
        try {
            const docRef = doc(db, 'settings', 'wheelPrizes');
            const docSnap = await getDoc(docRef);
            if (docSnap.exists() && docSnap.data().prizes) {
                setPrizes(docSnap.data().prizes);
            } else {
                // Init with default if empty?
            }
        } catch (error) {
            console.error("Error fetching prizes:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            // Validate probabilities sum to 1 (warn only?)
            const totalProb = prizes.reduce((sum, p) => sum + Number(p.probability), 0);
            if (Math.abs(totalProb - 1) > 0.01) {
                alert(`Warning: Total probability is ${totalProb.toFixed(2)}, should be 1.00`);
            }

            await setDoc(doc(db, 'settings', 'wheelPrizes'), {
                prizes: prizes.map(p => ({
                    ...p,
                    probability: Number(p.probability), // Ensure number
                    value: p.type === 'JP' || p.type === 'XP' || p.type === 'JACKPOT' ? Number(p.value) : p.value
                }))
            });
            alert('Settings saved!');
        } catch (error) {
            console.error("Save failed", error);
            alert('Failed to save');
        } finally {
            setSaving(false);
        }
    };

    const addPrize = () => {
        setPrizes([...prizes, {
            id: `prize_${Date.now()}`,
            type: 'JP',
            value: 10,
            label: '10 JP',
            probability: 0.1,
            color: '#000000'
        }]);
    };

    const removePrize = (index: number) => {
        const newPrizes = [...prizes];
        newPrizes.splice(index, 1);
        setPrizes(newPrizes);
    };

    const handleChange = (index: number, field: keyof WheelPrize, value: any) => {
        const newPrizes = [...prizes];
        newPrizes[index] = { ...newPrizes[index], [field]: value };
        setPrizes(newPrizes);
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold mb-6">Wheel of Joy Settings</h1>

            <div className="space-y-4">
                {prizes.map((prize, index) => (
                    <div key={prize.id} className="flex gap-4 items-end border p-4 rounded bg-gray-50">
                        <div>
                            <label className="block text-xs font-bold">Type</label>
                            <select
                                value={prize.type}
                                onChange={(e) => handleChange(index, 'type', e.target.value)}
                                className="p-2 border rounded"
                            >
                                <option value="JP">JP</option>
                                <option value="XP">XP</option>
                                <option value="JACKPOT">Jackpot</option>
                                <option value="ITEM">Item</option>
                                <option value="COUPON">Coupon</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold">Value</label>
                            <input
                                type="text"
                                value={prize.value}
                                onChange={(e) => handleChange(index, 'value', e.target.value)}
                                className="p-2 border rounded w-24"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold">Label</label>
                            <input
                                type="text"
                                value={prize.label}
                                onChange={(e) => handleChange(index, 'label', e.target.value)}
                                className="p-2 border rounded w-32"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold">Prob (0-1)</label>
                            <input
                                type="number"
                                step="0.01"
                                value={prize.probability}
                                onChange={(e) => handleChange(index, 'probability', e.target.value)}
                                className="p-2 border rounded w-20"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold">Color</label>
                            <input
                                type="color"
                                value={prize.color}
                                onChange={(e) => handleChange(index, 'color', e.target.value)}
                                className="p-2 h-10 w-16 cursor-pointer"
                            />
                        </div>
                        <button onClick={() => removePrize(index)} className="p-2 text-red-500 hover:bg-red-100 rounded">
                            <Trash size={18} />
                        </button>
                    </div>
                ))}
            </div>

            <div className="mt-6 flex gap-4">
                <button onClick={addPrize} className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200">
                    <Plus size={18} /> Add Prize
                </button>
                <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-6 py-2 bg-black text-white rounded hover:bg-gray-800 disabled:opacity-50">
                    <Save size={18} /> {saving ? 'Saving...' : 'Save Changes'}
                </button>
            </div>
        </div>
    );
}
