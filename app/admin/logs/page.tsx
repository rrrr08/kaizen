'use client';

import { useEffect, useState } from 'react';
import { Clock, AlertCircle, Info, AlertTriangle, RefreshCw, Download, Search, Filter, ArrowLeft, Zap, Pause, BarChart3, AlertOctagon, User, Globe, ClipboardList, Timer } from 'lucide-react';
import Link from 'next/link';

interface LogEntry {
    timestamp: number;
    level: 'info' | 'warn' | 'error';
    event: string;
    userId?: string;
    data?: any;
    metadata?: {
        ip?: string;
        userAgent?: string;
        path?: string;
    };
}

interface LogStats {
    info: number;
    warn: number;
    error: number;
    total: number;
}

export default function LogsPage() {
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const [stats, setStats] = useState<LogStats>({ info: 0, warn: 0, error: 0, total: 0 });
    const [filter, setFilter] = useState<'all' | 'info' | 'warn' | 'error'>('all');
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [autoRefresh, setAutoRefresh] = useState(true);

    useEffect(() => {
        loadLogs();
        if (autoRefresh) {
            const interval = setInterval(loadLogs, 5000); // Auto-refresh every 5s
            return () => clearInterval(interval);
        }
    }, [filter, autoRefresh]);

    async function loadLogs(showRefreshing = false) {
        try {
            if (showRefreshing) setRefreshing(true);

            const [logsRes, statsRes] = await Promise.all([
                fetch(`/api/admin/logs?level=${filter}&limit=100`),
                fetch('/api/admin/logs/stats')
            ]);

            if (logsRes.ok) {
                const data = await logsRes.json();
                setLogs(data.logs || []);
            }

            if (statsRes.ok) {
                const data = await statsRes.json();
                setStats(data.stats || { info: 0, warn: 0, error: 0, total: 0 });
            }
        } catch (error) {
            console.error('Failed to load logs:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }

    const getLevelIcon = (level: string) => {
        switch (level) {
            case 'error': return <AlertCircle className="w-5 h-5" />;
            case 'warn': return <AlertTriangle className="w-5 h-5" />;
            default: return <Info className="w-5 h-5" />;
        }
    };

    const getLevelColor = (level: string) => {
        switch (level) {
            case 'error': return 'bg-[#FF7675] text-white';
            case 'warn': return 'bg-[#FFD93D] text-black';
            default: return 'bg-[#74B9FF] text-white';
        }
    };

    const getLevelBadge = (level: string) => {
        switch (level) {
            case 'error': return 'bg-[#FF7675]/20 text-[#FF7675] border-[#FF7675]';
            case 'warn': return 'bg-[#FFD93D]/20 text-[#FFD93D] border-[#FFD93D]';
            default: return 'bg-[#74B9FF]/20 text-[#74B9FF] border-[#74B9FF]';
        }
    };

    const filteredLogs = logs.filter(log => {
        if (!searchTerm) return true;
        const searchLower = searchTerm.toLowerCase();
        return (
            log.event.toLowerCase().includes(searchLower) ||
            log.userId?.toLowerCase().includes(searchLower) ||
            JSON.stringify(log.data).toLowerCase().includes(searchLower)
        );
    });

    const downloadLogs = () => {
        const dataStr = JSON.stringify(filteredLogs, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
        const exportFileDefaultName = `logs-${filter}-${new Date().toISOString()}.json`;
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
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
                        <ArrowLeft className="w-4 h-4 mr-2 inline" /> Back to Admin
                    </Link>

                    <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 bg-gradient-to-br from-[#6C5CE7] to-[#A29BFE] rounded-2xl border-4 border-black flex items-center justify-center neo-shadow transform hover:rotate-6 transition-transform">
                                <Clock className="w-8 h-8 text-white" strokeWidth={2.5} />
                            </div>
                            <div>
                                <h1 className="font-header text-4xl md:text-5xl font-black uppercase tracking-tight text-black">
                                    System Logs
                                </h1>
                                <p className="text-black/60 font-bold mt-1">Real-time activity monitoring • Auto-refresh {autoRefresh ? 'ON' : 'OFF'}</p>
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
                                {autoRefresh ? <span className="flex items-center gap-1"><Zap className="w-3 h-3" /> Live</span> : <span className="flex items-center gap-1"><Pause className="w-3 h-3" /> Paused</span>}
                            </button>
                            <button
                                onClick={() => loadLogs(true)}
                                disabled={refreshing}
                                className="px-4 py-2 bg-white border-4 border-black rounded-xl font-black uppercase text-xs shadow-[2px_2px_0px_#000] hover:shadow-[4px_4px_0px_#000] hover:-translate-y-1 transition-all disabled:opacity-50"
                            >
                                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                            </button>
                            <button
                                onClick={downloadLogs}
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
                            { label: 'Total', count: stats.total, color: 'from-black to-gray-800', icon: <BarChart3 className="w-8 h-8" />, trend: '+12%' },
                            { label: 'Info', count: stats.info, color: 'from-[#74B9FF] to-[#0984e3]', icon: <Info className="w-8 h-8" />, trend: '+8%' },
                            { label: 'Warnings', count: stats.warn, color: 'from-[#FFD93D] to-[#fdcb6e]', icon: <AlertTriangle className="w-8 h-8" />, trend: '+3%' },
                            { label: 'Errors', count: stats.error, color: 'from-[#FF7675] to-[#d63031]', icon: <AlertOctagon className="w-8 h-8" />, trend: '-5%' }
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
                                <p className="font-black text-4xl text-black mb-1">{stat.count.toLocaleString()}</p>
                                <div className="flex items-center justify-between">
                                    <p className="text-xs font-bold text-black/50 uppercase">Today</p>
                                    <span className={`text-xs font-black ${stat.trend.startsWith('+') ? 'text-[#00B894]' : 'text-[#FF7675]'}`}>
                                        {stat.trend}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Search & Filters */}
                    <div className="bg-white border-4 border-black rounded-xl p-6 neo-shadow mb-6">
                        <div className="flex flex-col md:flex-row gap-4">
                            {/* Search */}
                            <div className="flex-1 relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-black/40" />
                                <input
                                    type="text"
                                    placeholder="Search logs by event, user, or data..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3 border-2 border-black rounded-lg font-bold text-sm focus:outline-none focus:shadow-[4px_4px_0px_#000] transition-shadow"
                                />
                            </div>

                            {/* Filter Buttons */}
                            <div className="flex gap-2 flex-wrap">
                                {['all', 'info', 'warn', 'error'].map((level) => (
                                    <button
                                        key={level}
                                        onClick={() => setFilter(level as any)}
                                        className={`px-6 py-3 rounded-xl border-4 border-black font-black uppercase text-sm transition-all ${filter === level
                                            ? 'bg-[#6C5CE7] text-white shadow-[4px_4px_0px_#000] -translate-y-1'
                                            : 'bg-white text-black shadow-[2px_2px_0px_#000] hover:shadow-[4px_4px_0px_#000] hover:-translate-y-1'
                                            }`}
                                    >
                                        <Filter className="w-4 h-4 inline mr-2" />
                                        {level}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {searchTerm && (
                            <p className="mt-4 text-sm font-bold text-black/60">
                                Found {filteredLogs.length} result{filteredLogs.length !== 1 ? 's' : ''} for "{searchTerm}"
                            </p>
                        )}
                    </div>
                </div>

                {/* Logs List */}
                <div className="bg-white border-4 border-black rounded-[25px] p-8 neo-shadow">
                    {loading ? (
                        <div className="text-center py-12">
                            <div className="w-12 h-12 border-4 border-black border-t-[#6C5CE7] rounded-full animate-spin mx-auto mb-4"></div>
                            <p className="font-black text-xs tracking-[0.2em] uppercase text-black/50">Loading logs...</p>
                        </div>
                    ) : filteredLogs.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="w-20 h-20 bg-black/5 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Clock className="w-10 h-10 text-black/20" />
                            </div>
                            <p className="font-black text-xl uppercase text-black/40 mb-2">No logs found</p>
                            <p className="text-sm font-bold text-black/30">
                                {searchTerm ? 'Try a different search term' : 'Try changing the filter or generate test logs'}
                            </p>
                            {!searchTerm && (
                                <Link
                                    href="/api/test-logs"
                                    target="_blank"
                                    className="inline-block mt-4 px-6 py-3 bg-[#6C5CE7] text-white border-4 border-black rounded-xl font-black uppercase text-sm shadow-[4px_4px_0px_#000] hover:shadow-[6px_6px_0px_#000] hover:-translate-y-1 transition-all"
                                >
                                    Generate Test Logs
                                </Link>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {filteredLogs.map((log, index) => (
                                <div
                                    key={`${log.timestamp}-${index}`}
                                    className="border-2 border-black rounded-xl p-5 hover:bg-black/5 transition-all hover:shadow-[4px_4px_0px_#000] hover:-translate-y-1 group"
                                >
                                    <div className="flex items-start gap-4">
                                        <div className={`${getLevelColor(log.level)} p-3 rounded-lg border-2 border-black shadow-[2px_2px_0px_#000] group-hover:shadow-[4px_4px_0px_#000] transition-all flex-shrink-0`}>
                                            {getLevelIcon(log.level)}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-3 mb-3 flex-wrap">
                                                <span className="font-black uppercase text-base text-black">
                                                    {log.event}
                                                </span>
                                                <span className={`${getLevelBadge(log.level)} px-3 py-1 rounded-lg border-2 font-black text-xs uppercase`}>
                                                    {log.level}
                                                </span>
                                                {log.userId && (
                                                    <span className="text-xs font-bold text-black/50 bg-black/10 px-3 py-1 rounded-lg border border-black/20 flex items-center gap-1">
                                                        <User className="w-3 h-3" /> {log.userId.slice(0, 8)}...
                                                    </span>
                                                )}
                                                {log.metadata?.ip && (
                                                    <span className="text-xs font-bold text-black/50 bg-black/10 px-3 py-1 rounded-lg border border-black/20 flex items-center gap-1">
                                                        <Globe className="w-3 h-3" /> {log.metadata.ip}
                                                    </span>
                                                )}
                                            </div>

                                            {log.data && (
                                                <details className="mb-3 group/details">
                                                    <summary className="cursor-pointer text-xs font-bold text-black/60 hover:text-black uppercase mb-2 flex items-center gap-1">
                                                        <ClipboardList className="w-3 h-3" /> View Data
                                                    </summary>
                                                    <pre className="text-xs font-mono bg-black/5 p-4 rounded-lg border-2 border-black/20 overflow-x-auto">
                                                        {JSON.stringify(log.data, null, 2)}
                                                    </pre>
                                                </details>
                                            )}

                                            <div className="flex items-center gap-4 text-xs font-bold text-black/40">
                                                <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {new Date(log.timestamp).toLocaleString()}</span>
                                                <span className="flex items-center gap-1"><Timer className="w-3 h-3" /> {Math.floor((Date.now() - log.timestamp) / 1000 / 60)}m ago</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
