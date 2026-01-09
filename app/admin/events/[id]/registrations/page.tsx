'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Mail, User, Download } from 'lucide-react';
import { getEventRegistrations, EventRegistration } from '@/lib/db/registrations';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface UserDetails {
    uid: string;
    name: string;
    email: string;
    photoURL?: string;
}

interface RegistrationWithUser extends EventRegistration {
    user?: UserDetails;
}

export default function EventRegistrationsPage() {
    const router = useRouter();
    const params = useParams();
    const eventId = params.id as string;

    const [loading, setLoading] = useState(true);
    const [eventTitle, setEventTitle] = useState('');
    const [registrations, setRegistrations] = useState<RegistrationWithUser[]>([]);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchData() {
            try {
                setLoading(true);

                // 1. Fetch Event Details
                const eventRef = doc(db, 'events', eventId);
                const eventSnap = await getDoc(eventRef);

                if (eventSnap.exists()) {
                    setEventTitle(eventSnap.data().title);
                } else {
                    setError('Event not found');
                    setLoading(false);
                    return;
                }

                // 2. Fetch Registrations
                const regs = await getEventRegistrations(eventId);

                // 3. Fetch User Details for each registration
                const regsWithUsers = await Promise.all(
                    regs.map(async (reg) => {
                        try {
                            const userRef = doc(db, 'users', reg.userId);
                            const userSnap = await getDoc(userRef);

                            if (userSnap.exists()) {
                                const userData = userSnap.data();
                                return {
                                    ...reg,
                                    user: {
                                        uid: userSnap.id,
                                        name: userData.name || 'Unknown',
                                        email: userData.email || 'No Email',
                                        photoURL: userData.photoURL || userData.avatar_url
                                    }
                                };
                            }
                        } catch (err) {
                            console.error(`Failed to fetch user ${reg.userId}`, err);
                        }
                        return reg;
                    })
                );

                setRegistrations(regsWithUsers);
            } catch (err: any) {
                console.error('Error fetching data:', err);
                setError(err.message || 'Failed to load registrations');
            } finally {
                setLoading(false);
            }
        }

        if (eventId) {
            fetchData();
        }
    }, [eventId]);

    const handleBack = () => {
        router.back();
    };

    const downloadCSV = () => {
        const headers = ['Name', 'Email', 'User ID', 'Registration Date', 'Status'];
        const csvContent = [
            headers.join(','),
            ...registrations.map(r => [
                `"${r.user?.name || 'Unknown'}"`,
                `"${r.user?.email || ''}"`,
                r.userId,
                new Date(r.createdAt).toLocaleDateString(),
                r.status
            ].join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `registrations-${eventId}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
    };

    if (loading) {
        return (
            <div className="p-8 flex items-center justify-center min-h-screen bg-[#FFFDF5]">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-[#FFD93D] border-t-black rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-black font-black uppercase tracking-widest">Loading registrations...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-[#FFFDF5]">
                <div className="text-red-500 font-black tracking-widest text-center">
                    {error}
                </div>
                <button
                    onClick={handleBack}
                    className="px-6 py-2 border-2 border-black rounded-xl hover:bg-black hover:text-white transition-all font-bold"
                >
                    Go Back
                </button>
            </div>
        );
    }

    return (
        <div className="p-8 pb-16 min-h-screen bg-[#FFFDF5]">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4 border-b-2 border-black pb-8">
                <div>
                    <button
                        onClick={handleBack}
                        className="flex items-center gap-2 text-black/60 hover:text-black font-bold mb-2 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" /> Back to Events
                    </button>
                    <h1 className="font-header text-4xl font-black text-black uppercase tracking-tighter">
                        {eventTitle} <span className="text-black/30">Registrations</span>
                    </h1>
                </div>

                <div className="flex gap-3">
                    <div className="px-4 py-2 bg-white border-2 border-black rounded-xl font-bold neo-shadow-sm">
                        Total: {registrations.length}
                    </div>
                    <button
                        onClick={downloadCSV}
                        className="px-4 py-2 bg-[#FFD93D] text-black border-2 border-black rounded-xl font-black uppercase tracking-wide hover:-translate-y-1 hover:shadow-none transition-all flex items-center gap-2 neo-shadow-sm"
                    >
                        <Download className="w-4 h-4" />
                        Export CSV
                    </button>
                </div>
            </div>

            {/* Registrations List */}
            <div className="space-y-4">
                {registrations.length === 0 ? (
                    <div className="text-center py-20 bg-white border-2 border-black rounded-[30px] border-dashed">
                        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6 border-2 border-black">
                            <User className="w-10 h-10 text-black/20" />
                        </div>
                        <p className="text-black font-black uppercase tracking-widest text-lg">No registrations yet</p>
                    </div>
                ) : (
                    <div className="bg-white border-2 border-black rounded-2xl overflow-hidden neo-shadow">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-gray-100 border-b-2 border-black">
                                    <tr>
                                        <th className="p-4 font-black uppercase tracking-wider text-xs">User</th>
                                        <th className="p-4 font-black uppercase tracking-wider text-xs">Email</th>
                                        <th className="p-4 font-black uppercase tracking-wider text-xs">Registered At</th>
                                        <th className="p-4 font-black uppercase tracking-wider text-xs">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y-2 divide-black/5">
                                    {registrations.map((reg) => (
                                        <tr key={reg.id} className="hover:bg-amber-50/50 transition-colors">
                                            <td className="p-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-gray-200 border border-black flex items-center justify-center overflow-hidden">
                                                        {reg.user?.photoURL ? (
                                                            <img src={reg.user.photoURL} alt={reg.user.name} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <span className="font-bold text-xs">{reg.user?.name?.charAt(0) || '?'}</span>
                                                        )}
                                                    </div>
                                                    <span className="font-bold">{reg.user?.name || 'Unknown User'}</span>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center gap-2 text-sm font-medium text-black/70">
                                                    <Mail className="w-3 h-3" />
                                                    {reg.user?.email || 'N/A'}
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <span className="text-sm font-bold">
                                                    {new Date(reg.createdAt).toLocaleDateString()}
                                                </span>
                                                <span className="text-xs text-black/50 ml-2 font-mono">
                                                    {new Date(reg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </td>
                                            <td className="p-4">
                                                <span className={`px-2 py-1 rounded-md text-xs font-black uppercase border border-black ${reg.status === 'registered' ? 'bg-[#00B894] text-white' :
                                                    reg.status === 'cancelled' ? 'bg-[#FF7675] text-white' :
                                                        'bg-gray-200 text-black'
                                                    }`}>
                                                    {reg.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
