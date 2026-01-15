'use client';

import { useEffect, useState } from 'react';
import { Activity, Database, TrendingUp, RefreshCw, Download, Search, Filter, Zap, Package, Users, Gamepad2, Calendar } from 'lucide-react';
import Link from 'next/link';

interface ChangeEvent {
    collection: string;
    documentId: string;
    operation: 'create' | 'update' | 'delete';
    timestamp: number;
    userId?: string;
    before?: any;
    after?: any;
}

export default function CDCPage() {
    const [changes, setChanges] = useState<ChangeEvent[]>([]);
    const [filter, setFilter] = useState<string>('all');
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [autoRefresh, setAutoRefresh] = useState(true);

    useEffect(() => {
        loadChanges();
        if (autoRefresh) {
            const interval = setInterval(loadChanges, 5000); // Auto-refresh every 5s
            return () => clearInterval(interval);
        }
    }, [filter, autoRefresh]);

    async function loadChanges(showRefreshing = false) {
        try {
            if (showRefreshing) setRefreshing(true);

            const res = await fetch(`/api/admin/cdc?collection=${filter}&limit=100`);
            if (res.ok) {
                const data = await res.json();
                setChanges(data.changes || []);
            }
        } catch (error) {
            console.error('Failed to load changes:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }

    const getOperationColor = (operation: string) => {
        switch (operation) {
            case 'create': return 'bg-[#00B894] text-white';
            case 'update': return 'bg-[#74B9FF] text-white';
            case 'delete': return 'bg-[#FF7675] text-white';
            default: return 'bg-black text-white';
        }
    };

    const getOperationIcon = (operation: string) => {
        switch (operation) {
            case 'create': return '✨';
            case 'update': return '📝';
            case 'delete': return '🗑️';
            default: return '📊';
        }
    };

    const getCollectionIcon = (collection: string) => {
        switch (collection) {
            case 'orders': return <Package className="w-5 h-5" />;
            case 'users': return <Users className="w-5 h-5" />;
            case 'gameResults': return <Gamepad2 className="w-5 h-5" />;
            case 'events': return <Calendar className="w-5 h-5" />;
            default: return <Database className="w-5 h-5" />;
        }
    };

    const getCollectionColor = (collection: string) => {
        switch (collection) {
            case 'orders': return 'from-[#00B894] to-[#00a180]';
            case 'users': return 'from-[#6C5CE7] to-[#5F4FD1]';
            case 'gameResults': return 'from-[#FFD93D] to-[#fdcb6e]';
            case 'events': return 'from-[#FF7675] to-[#d63031]';
            default: return 'from-black to-gray-800';
        }
    };

    const collections = [
        { value: 'all', label: 'All Collections', icon: Database },
        { value: 'orders', label: 'Orders', icon: Package },
        { value: 'users', label: 'Users', icon: Users },
        { value: 'gameResults', label: 'Games', icon: Gamepad2 },
        { value: 'events', label: 'Events', icon: Calendar },
        { value: 'products', label: 'Products', icon: Package }
    ];

    const filteredChanges = changes.filter(change => {
        if (!searchTerm) return true;
        const searchLower = searchTerm.toLowerCase();
        return (
            change.collection.toLowerCase().includes(searchLower) ||
            change.documentId.toLowerCase().includes(searchLower) ||
            change.userId?.toLowerCase().includes(searchLower)
        );
    });

    const downloadChanges = () => {
        const dataStr = JSON.stringify(filteredChanges, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
        const exportFileDefaultName = `cdc-${filter}-${new Date().toISOString()}.json`;
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
    };

    const stats = {
        total: changes.length,
        creates: changes.filter(c => c.operation === 'create').length,
        updates: changes.filter(c => c.operation === 'update').length,
        deletes: changes.filter(c => c.operation === 'delete').length
    };

    return (
        <div className="min-h-screen pt-32 pb-16 bg-[#FFFDF5]">
            <div className="max-w-7xl mx-auto px-6">
                {/* Header */}
                <div className="mb-12">
                    <Link
                        href="/admin"
                        className="inline-block mb-6 font-black text-xs tracking-[0.2em] uppercase text-black/40 hover:text-black transition-colors"
                    >
                        ← Back to Admin
                    </Link>

                    <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 bg-gradient-to-br from-[#FF7675] to-[#d63031] rounded-2xl border-4 border-black flex items-center justify-center neo-shadow transform hover:rotate-6 transition-transform">
                                <Database className="w-8 h-8 text-white" strokeWidth={2.5} />
                            </div>
                            <div>
                                <h1 className="font-header text-4xl md:text-5xl font-black uppercase tracking-tight text-black">
                                    Database Changes
                                </h1>
                                <p className="text-black/60 font-bold mt-1">Real-time change data capture • Auto-refresh {autoRefresh ? 'ON' : 'OFF'}</p>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setAutoRefresh(!autoRefresh)}
                                className={`px-4 py-2 rounded-xl border-4 border-black font-black uppercase text-xs transition-all ${autoRefresh
                                        ? 'bg-[#00B894] text-white shadow-[4px_4px_0px_#000]'
                                        : 'bg-white text-black shadow-[2px_2px_0px_#000] hover:shadow-[4px_4px_0px_#000]'
                                    }`}
                            >
                                {autoRefresh ? '⚡ Live' : '⏸️ Paused'}
                            </button>
                            <button
                                onClick={() => loadChanges(true)}
                                disabled={refreshing}
                                className="px-4 py-2 bg-white border-4 border-black rounded-xl font-black uppercase text-xs shadow-[2px_2px_0px_#000] hover:shadow-[4px_4px_0px_#000] hover:-translate-y-1 transition-all disabled:opacity-50"
                            >
                                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                            </button>
                            <button
                                onClick={downloadChanges}
                                className="px-4 py-2 bg-[#FFD93D] border-4 border-black rounded-xl font-black uppercase text-xs shadow-[2px_2px_0px_#000] hover:shadow-[4px_4px_0px_#000] hover:-translate-y-1 transition-all flex items-center gap-2"
                            >
                                <Download className="w-4 h-4" />
                                Export
                            </button>
                        </div>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                        {[
                            { label: 'Total', count: stats.total, color: 'from-black to-gray-800', icon: '📊' },
                            { label: 'Created', count: stats.creates, color: 'from-[#00B894] to-[#00a180]', icon: '✨' },
                            { label: 'Updated', count: stats.updates, color: 'from-[#74B9FF] to-[#0984e3]', icon: '📝' },
                            { label: 'Deleted', count: stats.deletes, color: 'from-[#FF7675] to-[#d63031]', icon: '🗑️' }
                        ].map((stat) => (
                            <div
                                key={stat.label}
                                className="bg-white border-4 border-black rounded-xl p-6 neo-shadow hover:shadow-[6px_6px_0px_#000] hover:-translate-y-1 transition-all cursor-pointer group"
                            >
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-3xl group-hover:scale-110 transition-transform">{stat.icon}</span>
                                    <span className={`bg-gradient-to-r ${stat.color} text-white px-3 py-1 rounded-lg border-2 border-black font-black text-xs uppercase shadow-[2px_2px_0px_#000]`}>
                                        {stat.label}
                                    </span>
                                </div>
                                <p className="font-black text-4xl text-black">{stat.count.toLocaleString()}</p>
                                <p className="text-xs font-bold text-black/50 uppercase mt-1">Recent</p>
                            </div>
                        ))}
                    </div>

                    {/* Info Banner */}
                    <div className="bg-gradient-to-r from-[#DDFFF7] to-[#E3F9FF] border-4 border-black rounded-xl p-6 mb-8 neo-shadow">
                        <div className="flex items-start gap-4">
                            <Zap className="w-6 h-6 text-[#00B894] flex-shrink-0 mt-1" />
                            <div>
                                <p className="font-black uppercase text-sm text-black mb-2">⚡ Automatic Side Effects</p>
                                <p className="text-sm font-bold text-black/70">
                                    When data changes, automatic actions are triggered: inventory updates, email/SMS notifications, cache invalidation, analytics tracking, and leaderboard updates.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Search & Filters */}
                    <div className="bg-white border-4 border-black rounded-xl p-6 neo-shadow mb-6">
                        <div className="flex flex-col md:flex-row gap-4">
                            {/* Search */}
                            <div className="flex-1 relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-black/40" />
                                <input
                                    type="text"
                                    placeholder="Search by collection, document ID, or user..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3 border-2 border-black rounded-lg font-bold text-sm focus:outline-none focus:shadow-[4px_4px_0px_#000] transition-shadow"
                                />
                            </div>
                        </div>

                        {/* Collection Filters */}
                        <div className="flex gap-2 flex-wrap mt-4">
                            {collections.map((collection) => {
                                const Icon = collection.icon;
                                return (
                                    <button
                                        key={collection.value}
                                        onClick={() => setFilter(collection.value)}
                                        className={`px-4 py-2 rounded-xl border-4 border-black font-black uppercase text-xs transition-all flex items-center gap-2 ${filter === collection.value
                                                ? 'bg-[#FF7675] text-white shadow-[4px_4px_0px_#000] -translate-y-1'
                                                : 'bg-white text-black shadow-[2px_2px_0px_#000] hover:shadow-[4px_4px_0px_#000] hover:-translate-y-1'
                                            }`}
                                    >
                                        <Icon className="w-4 h-4" />
                                        {collection.label}
                                    </button>
                                );
                            })}
                        </div>

                        {searchTerm && (
                            <p className="mt-4 text-sm font-bold text-black/60">
                                Found {filteredChanges.length} result{filteredChanges.length !== 1 ? 's' : ''} for "{searchTerm}"
                            </p>
                        )}
                    </div>
                </div>

                {/* Changes List */}
                <div className="bg-white border-4 border-black rounded-[25px] p-8 neo-shadow">
                    {loading ? (
                        <div className="text-center py-12">
                            <div className="w-12 h-12 border-4 border-black border-t-[#FF7675] rounded-full animate-spin mx-auto mb-4"></div>
                            <p className="font-black text-xs tracking-[0.2em] uppercase text-black/50">Loading changes...</p>
                        </div>
                    ) : filteredChanges.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="w-20 h-20 bg-black/5 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Database className="w-10 h-10 text-black/20" />
                            </div>
                            <p className="font-black text-xl uppercase text-black/40 mb-2">No changes found</p>
                            <p className="text-sm font-bold text-black/30">
                                {searchTerm ? 'Try a different search term' : 'Make some changes to see them here'}
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {filteredChanges.map((change, index) => (
                                <div
                                    key={`${change.timestamp}-${index}`}
                                    className="border-2 border-black rounded-xl p-5 hover:bg-black/5 transition-all hover:shadow-[4px_4px_0px_#000] hover:-translate-y-1 group"
                                >
                                    <div className="flex items-start gap-4">
                                        <div className={`bg-gradient-to-br ${getCollectionColor(change.collection)} p-3 rounded-lg border-2 border-black shadow-[2px_2px_0px_#000] group-hover:shadow-[4px_4px_0px_#000] transition-all flex-shrink-0 text-white`}>
                                            {getCollectionIcon(change.collection)}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-3 mb-3 flex-wrap">
                                                <span className="font-black uppercase text-base text-black">
                                                    {change.collection}
                                                </span>
                                                <span className={`${getOperationColor(change.operation)} px-3 py-1 rounded-lg border-2 border-black font-black text-xs uppercase shadow-[2px_2px_0px_#000] flex items-center gap-1`}>
                                                    <span>{getOperationIcon(change.operation)}</span>
                                                    {change.operation}
                                                </span>
                                                <span className="text-xs font-bold text-black/50 bg-black/10 px-3 py-1 rounded-lg border border-black/20">
                                                    📄 {change.documentId.slice(0, 12)}...
                                                </span>
                                                {change.userId && (
                                                    <span className="text-xs font-bold text-black/50 bg-black/10 px-3 py-1 rounded-lg border border-black/20">
                                                        👤 {change.userId.slice(0, 8)}...
                                                    </span>
                                                )}
                                            </div>

                                            <div className="flex items-center gap-4 text-xs font-bold text-black/40">
                                                <span>🕐 {new Date(change.timestamp).toLocaleString()}</span>
                                                <span>⏱️ {Math.floor((Date.now() - change.timestamp) / 1000 / 60)}m ago</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Side Effects Info */}
                <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white border-4 border-black rounded-xl p-6 neo-shadow hover:shadow-[6px_6px_0px_#000] hover:-translate-y-1 transition-all">
                        <h3 className="font-black uppercase text-sm text-black mb-4 flex items-center gap-2">
                            <Package className="w-5 h-5 text-[#00B894]" />
                            Order Changes
                        </h3>
                        <ul className="space-y-2 text-sm font-bold text-black/70">
                            <li className="flex items-center gap-2">✅ Inventory updated</li>
                            <li className="flex items-center gap-2">✅ Email sent</li>
                            <li className="flex items-center gap-2">✅ SMS sent</li>
                            <li className="flex items-center gap-2">✅ Analytics tracked</li>
                        </ul>
                    </div>

                    <div className="bg-white border-4 border-black rounded-xl p-6 neo-shadow hover:shadow-[6px_6px_0px_#000] hover:-translate-y-1 transition-all">
                        <h3 className="font-black uppercase text-sm text-black mb-4 flex items-center gap-2">
                            <Gamepad2 className="w-5 h-5 text-[#FFD93D]" />
                            Game Changes
                        </h3>
                        <ul className="space-y-2 text-sm font-bold text-black/70">
                            <li className="flex items-center gap-2">✅ Leaderboard updated</li>
                            <li className="flex items-center gap-2">✅ Achievements checked</li>
                            <li className="flex items-center gap-2">✅ Notifications sent</li>
                            <li className="flex items-center gap-2">✅ Analytics tracked</li>
                        </ul>
                    </div>

                    <div className="bg-white border-4 border-black rounded-xl p-6 neo-shadow hover:shadow-[6px_6px_0px_#000] hover:-translate-y-1 transition-all">
                        <h3 className="font-black uppercase text-sm text-black mb-4 flex items-center gap-2">
                            <Users className="w-5 h-5 text-[#6C5CE7]" />
                            User Changes
                        </h3>
                        <ul className="space-y-2 text-sm font-bold text-black/70">
                            <li className="flex items-center gap-2">✅ Cache invalidated</li>
                            <li className="flex items-center gap-2">✅ Search index updated</li>
                            <li className="flex items-center gap-2">✅ Leaderboard synced</li>
                            <li className="flex items-center gap-2">✅ Profile refreshed</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}
