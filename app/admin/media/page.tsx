'use client';

import { useState, useEffect } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import ImageUpload from '@/components/ui/ImageUpload';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Copy, Check, RefreshCw, ImagePlus, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { CldUploadWidget } from 'next-cloudinary';

// --- TYPES ---
interface CloudinaryResource {
    public_id: string;
    secure_url: string;
    format: string;
    width: number;
    height: number;
    created_at: string;
}

// --- MEDIA LIBRARY COMPONENT ---
const MediaLibrary = () => {
    const [resources, setResources] = useState<CloudinaryResource[]>([]);
    const [loading, setLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [copiedId, setCopiedId] = useState<string | null>(null);

    const fetchResources = async (showLoading = true) => {
        if (showLoading) setLoading(true);
        else setIsRefreshing(true);

        try {
            const response = await fetch('/api/media');
            const data = await response.json();
            if (Array.isArray(data)) setResources(data);
        } catch (error) {
            console.error('Error fetching resources:', error);
        } finally {
            setLoading(false);
            setIsRefreshing(false);
        }
    };

    useEffect(() => { fetchResources(true); }, []);

    const onCopy = (url: string) => {
        navigator.clipboard.writeText(url);
        setCopiedId(url);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const handleUploadSuccess = (result: any) => {
        // Optimistically add the new image to the top of the list
        const newImage: CloudinaryResource = {
            public_id: result.info.public_id,
            secure_url: result.info.secure_url,
            format: result.info.format,
            width: result.info.width,
            height: result.info.height,
            created_at: result.info.created_at
        };
        setResources(prev => [newImage, ...prev]);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-white p-4 rounded-xl border-2 border-black neo-shadow-sm">
                <Button onClick={() => fetchResources(false)} variant="outline" className="gap-2">
                    <RefreshCw className={`w-4 h-4 ${isRefreshing || loading ? 'animate-spin' : ''}`} /> Refresh
                </Button>
                <CldUploadWidget
                    onSuccess={handleUploadSuccess}
                    uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "kaizen_uploads"}
                    options={{
                        multiple: true,
                        maxFiles: 10,
                        folder: "kaizen_uploads"
                    }}
                >
                    {({ open }) => (
                        <Button onClick={() => open()} className="bg-[#FFD93D] text-black font-black uppercase border-2 border-black neo-shadow hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none">
                            <ImagePlus className="w-4 h-4 mr-2" /> Upload Assets
                        </Button>
                    )}
                </CldUploadWidget>
            </div>

            {loading ? (
                <div className="flex justify-center py-20">
                    <Loader2 className="w-10 h-10 animate-spin text-black/20" />
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {resources.map((resource) => (
                        <div key={resource.public_id} className="group relative aspect-square bg-gray-100 rounded-lg overflow-hidden border-2 border-black hover:neo-shadow transition-all">
                            <Image src={resource.secure_url} alt={resource.public_id} fill className="object-cover" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <Button onClick={() => onCopy(resource.secure_url)} size="sm" className="bg-white text-black border-2 border-black hover:bg-[#FFD93D]">
                                    {copiedId === resource.secure_url ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {!loading && resources.length === 0 && (
                <div className="text-center py-20 bg-white border-2 border-black border-dashed rounded-xl">
                    <p className="text-black/40 font-bold">No media found. Upload your first asset.</p>
                </div>
            )}
        </div>
    );
};

// --- SITE CONTENT MANAGER COMPONENT ---
const SiteContentManager = () => {
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    // State for different sections
    const [homeContent, setHomeContent] = useState<any>({
        hero: { backgroundImage: '' },
        trending: { title: 'Trending Games', subtitle: 'The hottest drops this week.' },
        bentoGrid: Array.from({ length: 4 }, () => ({ image: '' }))
    });

    const [aboutContent, setAboutContent] = useState<any>({
        founders: Array.from({ length: 2 }, () => ({ name: '', role: '', description: '', image: '' })) // Fix: Unique objects
    });

    const [blogContent, setBlogContent] = useState<any>({
        featuredStory: { image: '' },
        communityGallery: Array(4).fill('')
    });

    const [logoUrl, setLogoUrl] = useState<string>('');

    // Fetch all content on mount
    useEffect(() => {
        const fetchAll = async () => {
            setLoading(true);
            try {
                const homeSnap = await getDoc(doc(db, 'content', 'homepage'));
                if (homeSnap.exists()) setHomeContent((prev: any) => ({ ...prev, ...homeSnap.data() }));

                const aboutSnap = await getDoc(doc(db, 'content', 'about'));
                if (aboutSnap.exists()) setAboutContent((prev: any) => ({ ...prev, ...aboutSnap.data() }));

                const blogSnap = await getDoc(doc(db, 'content', 'blog'));
                if (blogSnap.exists()) setBlogContent((prev: any) => ({ ...prev, ...blogSnap.data() }));

                const logoSnap = await getDoc(doc(db, 'content', 'siteSettings'));
                if (logoSnap.exists()) setLogoUrl(logoSnap.data().logoUrl || '');
            } catch (error) {
                console.error("Error fetching content:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchAll();
    }, []);

    const handleSave = async (collection: string, data: any) => {
        setSaving(true);
        try {
            await setDoc(doc(db, 'content', collection), data);
            alert(`${collection} content updated!`);
        } catch (error) {
            console.error(`Error saving ${collection}:`, error);
            alert('Save failed');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-8 text-center font-bold text-black"><Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />Loading Content...</div>;

    return (
        <Accordion type="single" collapsible className="w-full space-y-4">

            {/* HOME PAGE */}
            <AccordionItem value="home" className="bg-white border-2 border-black rounded-xl px-4 neo-shadow">
                <AccordionTrigger className="font-black hover:no-underline text-lg uppercase">Home Page</AccordionTrigger>
                <AccordionContent className="space-y-8 pt-4 pb-8">
                    {/* HOME: TRENDING SECTION */}
                    <div className="space-y-4 border-b-2 border-black/10 pb-6">
                        <h3 className="font-black text-sm uppercase tracking-widest bg-[#6C5CE7] text-white inline-block px-2 py-1 border border-black rounded">Trending Section</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-black uppercase block mb-1">Section Title</label>
                                <input
                                    type="text"
                                    className="w-full bg-gray-50 border border-black rounded p-2 text-sm font-bold"
                                    value={homeContent.trending?.title || ''}
                                    onChange={(e) => setHomeContent({ ...homeContent, trending: { ...homeContent.trending, title: e.target.value } })}
                                />
                            </div>
                            <div>
                                <label className="text-xs font-black uppercase block mb-1">Section Subtitle</label>
                                <input
                                    type="text"
                                    className="w-full bg-gray-50 border border-black rounded p-2 text-sm font-bold"
                                    value={homeContent.trending?.subtitle || ''}
                                    onChange={(e) => setHomeContent({ ...homeContent, trending: { ...homeContent.trending, subtitle: e.target.value } })}
                                />
                            </div>
                        </div>
                    </div>

                    {/* HOME: HERO */}
                    <div className="space-y-4 border-b-2 border-black/10 pb-6">
                        <h3 className="font-black text-sm uppercase tracking-widest bg-[#FFD93D] inline-block px-2 py-1 border border-black rounded">Hero Section</h3>
                        <div>
                            <label className="text-xs font-black uppercase block mb-1">Hero Image (The Blob)</label>
                            <ImageUpload
                                uploadId="home-hero-bg"
                                value={homeContent.hero.backgroundImage ? [homeContent.hero.backgroundImage] : []}
                                onChange={(url) => setHomeContent({ ...homeContent, hero: { ...homeContent.hero, backgroundImage: url } })}
                                onRemove={() => setHomeContent({ ...homeContent, hero: { ...homeContent.hero, backgroundImage: '' } })}
                            />
                        </div>
                    </div>

                    {/* HOME: BENTO GRID */}
                    <div className="space-y-4 border-b-2 border-black/10 pb-6">
                        <h3 className="font-black text-sm uppercase tracking-widest bg-[#00B894] text-white inline-block px-2 py-1 border border-black rounded">Bento Grid (4 Images)</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                            {homeContent.bentoGrid.map((item: any, i: number) => (
                                <div key={i} className="border-2 border-black/10 p-4 rounded-lg">
                                    <p className="font-black text-xs uppercase mb-2">Item #{i + 1}</p>
                                    <ImageUpload
                                        uploadId={`home-bento-${i}`}
                                        value={item.image ? [item.image] : []}
                                        onChange={(url) => {
                                            const newGrid = [...homeContent.bentoGrid];
                                            newGrid[i] = { ...newGrid[i], image: url };
                                            setHomeContent({ ...homeContent, bentoGrid: newGrid });
                                        }}
                                        onRemove={() => {
                                            const newGrid = [...homeContent.bentoGrid];
                                            newGrid[i] = { ...newGrid[i], image: '' };
                                            setHomeContent({ ...homeContent, bentoGrid: newGrid });
                                        }}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                    <Button onClick={() => handleSave('homepage', homeContent)} disabled={saving} className="w-full bg-black text-white font-black uppercase py-6 hover:bg-neutral-800">
                        {saving ? <Loader2 className="animate-spin" /> : 'Save Home Content'}
                    </Button>
                </AccordionContent>
            </AccordionItem>

            {/* ABOUT PAGE */}
            <AccordionItem value="about" className="bg-white border-2 border-black rounded-xl px-4 neo-shadow">
                <AccordionTrigger className="font-black hover:no-underline text-lg uppercase">About Page</AccordionTrigger>
                <AccordionContent className="space-y-8 pt-4 pb-8">
                    <div className="space-y-6">
                        <h3 className="font-black text-sm uppercase tracking-widest bg-[#FF7675] text-white inline-block px-2 py-1 border border-black rounded">Founders</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                            {aboutContent.founders.map((founder: any, i: number) => (
                                <div key={i} className="border-2 border-black/10 p-4 rounded-lg space-y-3">
                                    <p className="font-black text-xs uppercase">Founder #{i + 1}</p>
                                    <ImageUpload
                                        uploadId={`about-founder-${i}`}
                                        value={founder.image ? [founder.image] : []}
                                        onChange={(url) => {
                                            const newFounders = [...aboutContent.founders];
                                            newFounders[i] = { ...newFounders[i], image: url };
                                            setAboutContent({ ...aboutContent, founders: newFounders });
                                        }}
                                        onRemove={() => {
                                            const newFounders = [...aboutContent.founders];
                                            newFounders[i] = { ...newFounders[i], image: '' };
                                            setAboutContent({ ...aboutContent, founders: newFounders });
                                        }}
                                    />
                                    <input type="text" placeholder="Name" className="w-full bg-gray-50 border border-black rounded p-2 text-sm font-bold"
                                        value={founder.name}
                                        onChange={(e) => {
                                            const newFounders = [...aboutContent.founders];
                                            newFounders[i] = { ...newFounders[i], name: e.target.value };
                                            setAboutContent({ ...aboutContent, founders: newFounders });
                                        }}
                                    />
                                    <input type="text" placeholder="Role (e.g. Design Whiz)" className="w-full bg-gray-50 border border-black rounded p-2 text-sm font-bold"
                                        value={founder.role}
                                        onChange={(e) => {
                                            const newFounders = [...aboutContent.founders];
                                            newFounders[i] = { ...newFounders[i], role: e.target.value };
                                            setAboutContent({ ...aboutContent, founders: newFounders });
                                        }}
                                    />
                                    <textarea placeholder="Description" className="w-full bg-gray-50 border border-black rounded p-2 text-sm font-bold h-20"
                                        value={founder.description}
                                        onChange={(e) => {
                                            const newFounders = [...aboutContent.founders];
                                            newFounders[i] = { ...newFounders[i], description: e.target.value };
                                            setAboutContent({ ...aboutContent, founders: newFounders });
                                        }}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                    <Button onClick={() => handleSave('about', aboutContent)} disabled={saving} className="w-full bg-black text-white font-black uppercase py-6 hover:bg-neutral-800">
                        {saving ? <Loader2 className="animate-spin" /> : 'Save About Content'}
                    </Button>
                </AccordionContent>
            </AccordionItem>

            {/* BLOG PAGE */}
            <AccordionItem value="blog" className="bg-white border-2 border-black rounded-xl px-4 neo-shadow">
                <AccordionTrigger className="font-black hover:no-underline text-lg uppercase">Blog Page</AccordionTrigger>
                <AccordionContent className="space-y-8 pt-4 pb-8">
                    <div className="space-y-6 border-b-2 border-black/10 pb-6">
                        <h3 className="font-black text-sm uppercase tracking-widest bg-[#6C5CE7] text-white inline-block px-2 py-1 border border-black rounded">Featured Story</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-4">
                                <label className="text-xs font-black uppercase block mb-1">Story Image</label>
                                <ImageUpload
                                    uploadId="blog-featured-story"
                                    value={blogContent.featuredStory.image ? [blogContent.featuredStory.image] : []}
                                    onChange={(url) => setBlogContent({ ...blogContent, featuredStory: { ...blogContent.featuredStory, image: url } })}
                                    onRemove={() => setBlogContent({ ...blogContent, featuredStory: { ...blogContent.featuredStory, image: '' } })}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <h3 className="font-black text-sm uppercase tracking-widest bg-[#FFD93D] inline-block px-2 py-1 border border-black rounded">Community Gallery (4 Images)</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                            {blogContent.communityGallery.map((img: string, i: number) => (
                                <div key={i} className="space-y-2">
                                    <ImageUpload
                                        uploadId={`blog-gallery-${i}`}
                                        value={img ? [img] : []}
                                        onChange={(url) => {
                                            const newGal = [...blogContent.communityGallery];
                                            newGal[i] = url;
                                            setBlogContent({ ...blogContent, communityGallery: newGal });
                                        }}
                                        onRemove={() => {
                                            const newGal = [...blogContent.communityGallery];
                                            newGal[i] = '';
                                            setBlogContent({ ...blogContent, communityGallery: newGal });
                                        }}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                    <Button onClick={() => handleSave('blog', blogContent)} disabled={saving} className="w-full bg-black text-white font-black uppercase py-6 hover:bg-neutral-800">
                        {saving ? <Loader2 className="animate-spin" /> : 'Save Blog Content'}
                    </Button>
                </AccordionContent>
            </AccordionItem>

            {/* SITE LOGO */}
            <AccordionItem value="logo" className="bg-white border-2 border-black rounded-xl px-4 neo-shadow">
                <AccordionTrigger className="font-black hover:no-underline text-lg uppercase">Site Logo</AccordionTrigger>
                <AccordionContent className="space-y-8 pt-4 pb-8">
                    <div className="space-y-6">
                        <h3 className="font-black text-sm uppercase tracking-widest bg-[#FF7675] text-white inline-block px-2 py-1 border border-black rounded">Global Logo</h3>
                        <div className="border-2 border-black/10 p-6 rounded-lg space-y-4">
                            <p className="text-xs font-bold text-black/60">Upload a custom logo that will appear across all pages (Navbar, Login, Signup, etc.). If no logo is uploaded, the default &quot;JJ&quot; logo will be used.</p>
                            <ImageUpload
                                uploadId="site-logo"
                                value={logoUrl ? [logoUrl] : []}
                                onChange={(url) => setLogoUrl(url)}
                                onRemove={() => setLogoUrl('')}
                            />
                            {logoUrl && (
                                <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-black/10">
                                    <p className="text-xs font-black uppercase mb-2">Preview:</p>
                                    <div className="flex items-center gap-4">
                                        <div className="bg-[#FFD93D] p-2.5 border-2 border-black rounded-[12px] neo-shadow">
                                            <Image src={logoUrl} alt="Logo Preview" width={40} height={40} className="object-contain" />
                                        </div>
                                        <p className="text-xs font-bold text-black/60">This is how your logo will appear</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                    <Button
                        onClick={async () => {
                            setSaving(true);
                            try {
                                await setDoc(doc(db, 'content', 'siteSettings'), { logoUrl });
                                alert('Logo updated successfully!');
                            } catch (error) {
                                console.error('Error saving logo:', error);
                                alert('Save failed');
                            } finally {
                                setSaving(false);
                            }
                        }}
                        disabled={saving}
                        className="w-full bg-black text-white font-black uppercase py-6 hover:bg-neutral-800"
                    >
                        {saving ? <Loader2 className="animate-spin" /> : 'Save Logo'}
                    </Button>
                </AccordionContent>
            </AccordionItem>
        </Accordion>
    );
};

// --- MAIN PAGE LAYOUT ---
export default function MediaPage() {
    return (
        <div className="p-8 pb-32 min-h-screen bg-[#FFFDF5]">
            <div className="mb-8 border-b-2 border-black pb-8">
                <h1 className="font-header text-5xl font-black text-black mb-2 uppercase tracking-tighter">Media & Content</h1>
                <p className="text-black/60 font-bold text-lg">Manage site assets and page content in one place.</p>
            </div>

            <Tabs defaultValue="library" className="w-full">
                <TabsList className="w-full max-w-md grid grid-cols-2 mb-8 bg-black/5 p-1 rounded-xl border-2 border-black/10">
                    <TabsTrigger value="library" className="data-[state=active]:bg-white data-[state=active]:border-black data-[state=active]:neo-shadow font-bold text-xs uppercase tracking-widest rounded-lg transition-all">Media Library</TabsTrigger>
                    <TabsTrigger value="content" className="data-[state=active]:bg-white data-[state=active]:border-black data-[state=active]:neo-shadow font-bold text-xs uppercase tracking-widest rounded-lg transition-all">Site Pages</TabsTrigger>
                </TabsList>

                <TabsContent value="library" className="mt-0">
                    <MediaLibrary />
                </TabsContent>

                <TabsContent value="content" className="mt-0">
                    <SiteContentManager />
                </TabsContent>
            </Tabs>
        </div>
    );
}
