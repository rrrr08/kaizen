'use client';

import { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, Search, RefreshCw, Check, Library } from "lucide-react";
import Image from "next/image";

interface CloudinaryResource {
    public_id: string;
    secure_url: string;
    format: string;
    width: number;
    height: number;
    created_at: string;
}

interface MediaGalleryModalProps {
    onSelect: (url: string) => void;
    trigger?: React.ReactNode;
}

export const MediaGalleryModal: React.FC<MediaGalleryModalProps> = ({
    onSelect,
    trigger
}) => {
    const [open, setOpen] = useState(false);
    const [resources, setResources] = useState<CloudinaryResource[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchResources = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/media');
            const data = await response.json();
            if (Array.isArray(data)) {
                setResources(data);
            }
        } catch (error) {
            console.error('Error fetching resources:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (open) {
            fetchResources();
        }
    }, [open]);

    const filteredResources = resources.filter(res =>
        res.public_id.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleSelect = (url: string) => {
        onSelect(url);
        setOpen(false);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button
                        type="button"
                        variant="outline"
                        className="bg-white text-black font-black uppercase tracking-wide border-2 border-black neo-shadow hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all flex items-center gap-2 whitespace-nowrap"
                    >
                        <Library className="h-4 w-4 mr-2" />
                        <span className="hidden md:inline">Choose from </span>Gallery
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[80vh] flex flex-col border-4 border-black rounded-[2rem] bg-[#FFFDF5]">
                <DialogHeader>
                    <DialogTitle className="font-header text-3xl font-black uppercase tracking-tighter">
                        Media Library
                    </DialogTitle>
                </DialogHeader>

                <div className="flex items-center gap-4 mb-6">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-black/40" />
                        <input
                            type="text"
                            placeholder="Search assets..."
                            className="w-full pl-10 pr-4 py-2 bg-white border-2 border-black rounded-xl font-bold focus:outline-none focus:neo-shadow-sm transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <Button
                        onClick={fetchResources}
                        variant="outline"
                        size="icon"
                        className="border-2 border-black neo-shadow-sm hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none"
                    >
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    </Button>
                </div>

                <div className="flex-1 overflow-y-auto min-h-[400px]">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center h-full gap-4 text-black/40">
                            <Loader2 className="w-10 h-10 animate-spin" />
                            <p className="font-black text-xs uppercase tracking-[0.2em]">Loading Assets...</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 p-1">
                            {filteredResources.map((resource) => (
                                <div
                                    key={resource.public_id}
                                    onClick={() => handleSelect(resource.secure_url)}
                                    className="group relative aspect-square bg-white rounded-xl overflow-hidden border-2 border-black cursor-pointer hover:neo-shadow transition-all"
                                >
                                    <Image
                                        src={resource.secure_url}
                                        alt={resource.public_id}
                                        fill
                                        className="object-cover"
                                    />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <div className="bg-white text-black p-2 rounded-full border-2 border-black neo-shadow-sm translate-y-2 group-hover:translate-y-0 transition-transform">
                                            <Check className="w-5 h-5" />
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {filteredResources.length === 0 && (
                                <div className="col-span-full py-20 text-center">
                                    <p className="text-black/40 font-bold">No assets found matching your search.</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
};
