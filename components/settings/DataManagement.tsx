import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Trash2, Database, FileJson, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from '@/components/ui/dialog';

interface DataManagementProps {
    userId: string;
}

export default function DataManagement({ userId }: DataManagementProps) {
    const { addToast } = useToast();
    const [exporting, setExporting] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState('');

    const handleExportData = async () => {
        setExporting(true);
        try {
            const { auth } = await import('@/lib/firebase');
            const currentUser = auth.currentUser;
            if (!currentUser) throw new Error('Not authenticated');

            const token = await currentUser.getIdToken();
            const response = await fetch('/api/user/export-data', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to export data');
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `joy-juncture-data-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

            addToast({
                title: 'Success',
                description: 'Your data has been downloaded',
            });
        } catch (error) {
            console.error('Export error:', error);
            addToast({
                title: 'Error',
                description: 'Failed to export data',
                variant: 'destructive',
            });
        } finally {
            setExporting(false);
        }
    };

    const handleClearCache = async () => {
        try {
            // Clear localStorage items (except auth)
            const keysToKeep = ['firebase:authUser', 'firebase:host'];
            const allKeys = Object.keys(localStorage);
            allKeys.forEach(key => {
                if (!keysToKeep.some(keep => key.includes(keep))) {
                    localStorage.removeItem(key);
                }
            });

            addToast({
                title: 'Cache Cleared',
                description: 'Local cache has been cleared',
            });
        } catch (error) {
            addToast({
                title: 'Error',
                description: 'Failed to clear cache',
                variant: 'destructive',
            });
        }
    };

    return (
        <div className="space-y-6">
            {/* Data Export */}
            <div className="bg-white border-2 border-black rounded-xl p-6 neo-shadow">
                <div className="flex items-start gap-4 mb-4">
                    <div className="w-12 h-12 bg-[#00B894] border-2 border-black rounded-xl flex items-center justify-center">
                        <Download className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                        <h3 className="font-black text-lg uppercase mb-1">Export Your Data</h3>
                        <p className="text-sm text-black/60 font-medium">
                            Download a copy of all your data including orders, points history, and activity.
                        </p>
                    </div>
                </div>
                <Button
                    onClick={handleExportData}
                    disabled={exporting}
                    className="w-full bg-[#00B894] hover:bg-[#00a180] text-black border-2 border-black font-black uppercase tracking-widest neo-shadow"
                >
                    {exporting ? (
                        <>
                            <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin mr-2"></div>
                            Preparing Download...
                        </>
                    ) : (
                        <>
                            <FileJson className="w-4 h-4 mr-2" />
                            Download Data (JSON)
                        </>
                    )}
                </Button>
            </div>

            {/* Cache Management */}
            <div className="bg-white border-2 border-black rounded-xl p-6 neo-shadow">
                <div className="flex items-start gap-4 mb-4">
                    <div className="w-12 h-12 bg-[#FFD93D] border-2 border-black rounded-xl flex items-center justify-center">
                        <Database className="w-6 h-6 text-black" />
                    </div>
                    <div className="flex-1">
                        <h3 className="font-black text-lg uppercase mb-1">Clear Local Cache</h3>
                        <p className="text-sm text-black/60 font-medium">
                            Remove cached data from your browser. This won't delete your account data.
                        </p>
                    </div>
                </div>
                <Button
                    onClick={handleClearCache}
                    variant="outline"
                    className="w-full border-2 border-black font-black uppercase tracking-widest hover:bg-black/5"
                >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Clear Cache
                </Button>
            </div>

            {/* Data Deletion Warning */}
            <div className="bg-[#FF7675]/10 border-2 border-[#FF7675] rounded-xl p-6">
                <div className="flex items-start gap-4">
                    <AlertTriangle className="w-6 h-6 text-[#FF7675] flex-shrink-0 mt-1" />
                    <div>
                        <h3 className="font-black text-lg uppercase text-[#FF7675] mb-2">Data Deletion</h3>
                        <p className="text-sm text-black/70 font-medium mb-4">
                            To permanently delete your account and all associated data, use the "Deactivate Account" option in the main settings page.
                        </p>
                        <p className="text-xs text-black/50 font-bold uppercase tracking-wide">
                            ⚠️ Account deletion is irreversible
                        </p>
                    </div>
                </div>
            </div>

            {/* Storage Info */}
            <div className="bg-[#FFFDF5] border-2 border-black/10 rounded-xl p-6">
                <h3 className="font-black text-sm uppercase tracking-widest text-black/40 mb-4">
                    Data Storage Info
                </h3>
                <div className="space-y-2 text-sm font-medium text-black/70">
                    <p>• Your data is securely stored in Google Cloud Firestore</p>
                    <p>• All connections are encrypted with TLS 1.3</p>
                    <p>• You can request data deletion at any time</p>
                    <p>• Backups are retained for 30 days after deletion</p>
                </div>
            </div>
        </div>
    );
}
