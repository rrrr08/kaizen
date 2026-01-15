'use client';

import { useAuth } from '@/app/context/AuthContext';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  User,
  Shield,
  Bell,
  Mail,
  Smartphone,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  ShieldCheck,
  X,
  Lock,
  Database,
  Palette
} from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import ImageUpload from '@/components/ui/ImageUpload';
import DataManagement from '@/components/settings/DataManagement';
import AppearanceSettings, { AppearanceSettings as AppearanceSettingsType } from '@/components/settings/AppearanceSettings';

export default function SettingsPage() {
  const { user, userProfile, loading } = useAuth();
  const router = useRouter();
  const { addToast } = useToast();

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isDeactivating, setIsDeactivating] = useState(false);
  const [isSecurityOpen, setIsSecurityOpen] = useState(false);
  const [isNetworkInfoOpen, setIsNetworkInfoOpen] = useState(false);
  const [isDataOpen, setIsDataOpen] = useState(false);
  const [isAppearanceOpen, setIsAppearanceOpen] = useState(false);

  const [displayName, setDisplayName] = useState('');
  const [photoURL, setPhotoURL] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [deactivateConfirm, setDeactivateConfirm] = useState('');

  useEffect(() => {
    if (user) {
      setDisplayName(userProfile?.name || user.displayName || '');
      setPhotoURL(userProfile?.photoURL || user.photoURL || '');
      setPhoneNumber(userProfile?.phoneNumber || userProfile?.checkoutInfo?.phone || '');
    }
  }, [user, userProfile]);

  if (loading) {
    return (
      <div className="min-h-screen pt-28 pb-16 flex items-center justify-center bg-[#FFFDF5]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-black border-t-[#FFD93D] mb-4"></div>
          <p className="text-black font-black text-xs tracking-[0.4em]">LOADING SECURE CHANNEL...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    router.push('/auth/login');
    return null;
  }

  const handleUpdateProfile = async () => {
    if (!displayName.trim()) {
      addToast({ title: 'Error', description: 'Display name cannot be empty', variant: 'destructive' });
      return;
    }

    setIsSaving(true);
    try {
      const { updateProfile } = await import('firebase/auth');
      const { doc, updateDoc, getFirestore } = await import('firebase/firestore');
      const { app } = await import('@/lib/firebase');

      const db = getFirestore(app);

      // Update Auth Profile
      await updateProfile(user, { displayName, photoURL });

      // Update Firestore User Doc
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        name: displayName,
        image: photoURL,
      });

      addToast({ title: 'Success', description: 'Profile updated successfully!', variant: 'success' });
      setIsEditingProfile(false);
    } catch (error: any) {
      console.error('Profile update error:', error);
      addToast({ title: 'Error', description: error.message || 'Failed to update profile', variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeactivateAccount = async () => {
    if (deactivateConfirm !== 'DELETE') {
      addToast({ title: 'Error', description: 'Please type DELETE to confirm.', variant: 'destructive' });
      return;
    }

    setIsSaving(true);
    try {
      const { deleteUser } = await import('firebase/auth');
      await deleteUser(user);
      addToast({ title: 'Account Deleted', description: 'Your account has been deactivated.', variant: 'default' });
      router.push('/');
    } catch (error: any) {
      console.error('Account deletion error:', error);
      if (error.code === 'auth/requires-recent-login') {
        addToast({ title: 'Security Alert', description: 'Please log in again before deleting your account.', variant: 'destructive' });
      } else {
        addToast({ title: 'Error', description: error.message || 'Failed to deactivate account', variant: 'destructive' });
      }
    } finally {
      setIsSaving(false);
      setIsDeactivating(false);
    }
  };

  const handleSecurityAction = async () => {
    const providerId = user.providerData[0]?.providerId;

    if (providerId === 'password') {
      setIsSaving(true);
      try {
        const { getAuth, sendPasswordResetEmail } = await import('firebase/auth');
        const auth = getAuth();
        await sendPasswordResetEmail(auth, user.email!);
        addToast({ title: 'Email Sent', description: `Check ${user.email} for password reset instructions.`, variant: 'success' });
        setIsSecurityOpen(false);
      } catch (error: any) {
        addToast({ title: 'Error', description: error.message, variant: 'destructive' });
      } finally {
        setIsSaving(false);
      }
    } else {
      addToast({ title: 'External Provider', description: `Your security is managed by ${providerId}.` });
    }
  };



  const handleSaveAppearance = async (settings: AppearanceSettingsType) => {
    try {
      const { doc, updateDoc, getFirestore } = await import('firebase/firestore');
      const { app } = await import('@/lib/firebase');
      const db = getFirestore(app);
      const userRef = doc(db, 'users', user.uid);

      await updateDoc(userRef, { appearanceSettings: settings });

      addToast({ title: 'Success', description: 'Appearance settings saved!', variant: 'success' });
      setIsAppearanceOpen(false);
    } catch (error: any) {
      addToast({ title: 'Error', description: 'Failed to save appearance settings', variant: 'destructive' });
      throw error;
    }
  };

  const isPasswordUser = user.providerData[0]?.providerId === 'password';
  const providerLabel = user.providerData[0]?.providerId || 'Unknown Provider';

  const settingsOptions = [
    {
      title: 'Personal Information',
      desc: 'Edit Name & Identity',
      icon: User,
      color: 'bg-[#FFD93D]',
      action: () => setIsEditingProfile(true)
    },
    {
      title: 'Security & Password',
      desc: 'Two-factor and logins',
      icon: Shield,
      color: 'bg-[#6C5CE7]',
      text: 'text-white',
      action: () => setIsSecurityOpen(true)
    },
    {
      title: 'Data Management',
      desc: 'Export & manage your data',
      icon: Database,
      color: 'bg-[#74B9FF]',
      text: 'text-white',
      action: () => setIsDataOpen(true)
    },
    {
      title: 'Appearance',
      desc: 'Theme & accessibility',
      icon: Palette,
      color: 'bg-[#FF7675]',
      text: 'text-white',
      action: () => setIsAppearanceOpen(true)
    },
    {
      title: 'Notifications',
      desc: 'Alerts and newsletters',
      icon: Bell,
      color: 'bg-[#00B894]',
      text: 'text-white',
      href: '/notification-preferences'
    }
  ];

  return (
    <div className="min-h-screen pt-28 pb-16 bg-[#FFFDF5] text-black">
      <div className="max-w-4xl mx-auto px-6">
        {/* Header */}
        <div className="mb-12">
          <Link
            href="/profile"
            className="inline-flex items-center gap-2 text-black/40 hover:text-black font-black text-[10px] uppercase tracking-[0.3em] mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Base
          </Link>
          <h1 className="font-header text-6xl font-black tracking-tighter uppercase leading-none mb-4">
            System <br />Preferences
          </h1>
          <p className="text-xl font-bold text-black/60 max-w-md">Configure your JOY account settings and security protocols.</p>
        </div>

        <div className="space-y-8">
          {/* Security Status Card */}
          <div
            onClick={() => setIsNetworkInfoOpen(true)}
            className="bg-white border-4 border-black p-8 rounded-[30px] neo-shadow flex flex-col md:flex-row items-center gap-8 cursor-pointer hover:scale-[1.01] transition-transform"
          >
            <div className="w-20 h-20 bg-[#00B894] border-2 border-black rounded-full flex items-center justify-center shadow-[4px_4px_0px_#000]">
              <ShieldCheck className="w-10 h-10 text-white" />
            </div>
            <div className="text-center md:text-left">
              <h3 className="text-2xl font-black uppercase tracking-tight mb-1">Account Integrity: Shield ON</h3>
              <p className="font-bold text-black/40">Your connection is encrypted. Identity verification is active. Click for details.</p>
            </div>
          </div>

          {/* Options Grid */}
          <div className="grid grid-cols-1 gap-4">
            {settingsOptions.map((opt, i) => {
              const Content = (
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-6">
                    <div className={`w-14 h-14 ${opt.color} border-2 border-black rounded-xl flex items-center justify-center shadow-[4px_4px_0px_#000] rotate-2 group-hover:rotate-0 transition-transform`}>
                      <opt.icon className={opt.text || 'text-black'} size={28} />
                    </div>
                    <div>
                      <h4 className="text-xl font-black uppercase tracking-tight text-left">{opt.title}</h4>
                      <p className="text-xs font-bold text-black/40 uppercase tracking-widest text-left">{opt.desc}</p>
                    </div>
                  </div>
                  <ChevronRight className="w-6 h-6 text-black/10 group-hover:text-black transition-colors" />
                </div>
              );

              return opt.href ? (
                <Link key={i} href={opt.href}>
                  <motion.div
                    whileHover={{ x: 10 }}
                    className="bg-white border-4 border-black p-6 rounded-2xl neo-shadow flex items-center justify-between group cursor-pointer h-full"
                  >
                    {Content}
                  </motion.div>
                </Link>
              ) : (
                <motion.div
                  key={i}
                  whileHover={{ x: 10 }}
                  onClick={opt.action}
                  className="bg-white border-4 border-black p-6 rounded-2xl neo-shadow flex items-center justify-between group cursor-pointer"
                >
                  {Content}
                </motion.div>
              );
            })}
          </div>

          {/* Details Section */}
          <div className="bg-white border-4 border-black rounded-[35px] p-10 neo-shadow">
            <h3 className="font-header text-3xl font-black mb-8 uppercase flex items-center gap-3">
              <Smartphone className="w-8 h-8" /> Connection Details
            </h3>

            <div className="space-y-6">
              <div className="flex justify-between items-center py-4 border-b-2 border-black/5">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-black/40 mb-1">Registered Email</p>
                  <p className="text-lg font-black text-black">{user.email}</p>
                </div>
                <div className="flex items-center gap-2 bg-[#00B894]/10 text-[#00B894] px-4 py-2 rounded-full border-2 border-[#00B894] text-xs font-black uppercase">
                  <CheckCircle2 size={14} /> Verified
                </div>
              </div>

              <div className="flex justify-between items-center py-4 border-b-2 border-black/5">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-black/40 mb-1">Public ID</p>
                  <p className="text-lg font-black text-black uppercase">{user.uid.slice(0, 16)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="pt-12">
            <div className="bg-[#FF7675]/10 border-4 border-[#FF7675] p-8 rounded-[30px] flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <AlertTriangle className="text-[#FF7675]" size={32} />
                <div>
                  <h4 className="text-xl font-black text-[#FF7675] uppercase tracking-tight">Danger Zone</h4>
                  <p className="text-xs font-bold text-[#FF7675]/60 uppercase">System account removal (Irreversible)</p>
                </div>
              </div>
              <button
                onClick={() => setIsDeactivating(true)}
                className="px-8 py-4 bg-[#FF7675] text-white font-black text-xs uppercase tracking-widest rounded-xl hover:bg-red-600 transition-colors shadow-[4px_4px_0px_#000]"
              >
                Deactivate System Account
              </button>
            </div>
          </div>
        </div>

        <div className="mt-20 text-center opacity-20">
          <p className="text-[8px] font-black tracking-[0.8em] uppercase">SYSTEM_PREFS_ENCRYPTED_v2.1</p>
        </div>
      </div>

      {/* Edit Profile Dialog */}
      <Dialog open={isEditingProfile} onOpenChange={setIsEditingProfile}>
        <DialogContent className="sm:max-w-md max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-header text-3xl font-black uppercase">Edit Identity</DialogTitle>
            <DialogDescription className="font-bold text-black/60">
              Update your persona on the grid.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="flex flex-col items-center">
              <label className="text-xs font-black uppercase tracking-widest mb-2 w-full text-left">Profile Avatar</label>
              <ImageUpload
                value={photoURL ? [photoURL] : []}
                onChange={(url) => setPhotoURL(url)}
                onRemove={() => setPhotoURL('')}
                maxFiles={1}
                showGallery={false}
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest">Display Name</label>
              <Input
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="border-2 border-black font-bold text-lg"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-black/40">Phone Number (Linked)</label>
              <div className="flex items-center gap-3 p-4 bg-black/5 border-2 border-dashed border-black/20 rounded-xl">
                <span className="font-bold text-black/40">{phoneNumber || 'No phone number linked'}</span>
                {phoneNumber && userProfile?.phoneVerified && (
                  <span className="ml-auto bg-[#00B894] text-white text-[10px] px-2 py-0.5 rounded-full font-black uppercase">Verified</span>
                )}
              </div>
              <p className="text-[10px] font-bold text-black/30 uppercase mt-1">
                You can manage your phone number in <Link href="/notification-preferences" className="underline hover:text-black">Notification Settings</Link>
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditingProfile(false)} className="border-2 border-black font-black uppercase">Cancel</Button>
            <Button onClick={handleUpdateProfile} disabled={isSaving} className="bg-[#FFD93D] text-black hover:bg-[#FFD93D]/80 border-2 border-black font-black uppercase">
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Security Dialog */}
      <Dialog open={isSecurityOpen} onOpenChange={setIsSecurityOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="w-12 h-12 bg-[#6C5CE7] rounded-xl border-2 border-black flex items-center justify-center mb-4 neo-shadow">
              <Lock className="text-white" />
            </div>
            <DialogTitle className="font-header text-3xl font-black uppercase">Security Protocol</DialogTitle>
            <DialogDescription className="font-bold text-black/60">
              Manage your access credentials and authentication methods.
            </DialogDescription>
          </DialogHeader>

          <div className="py-6 space-y-4">
            {isPasswordUser ? (
              <div className="bg-gray-50 p-4 rounded-xl border-2 border-black/10">
                <p className="font-black text-sm uppercase mb-2">Password Authentication</p>
                <p className="text-sm font-medium text-black/70 mb-4">You use a password to log in. We recommend changing it periodically.</p>
                <Button onClick={handleSecurityAction} disabled={isSaving} className="w-full bg-black text-white font-black uppercase tracking-widest hover:bg-[#6C5CE7]">
                  {isSaving ? 'Sending...' : 'Send Password Reset Email'}
                </Button>
              </div>
            ) : (
              <div className="bg-[#E8F0FE] p-4 rounded-xl border-2 border-[#1a73e8]">
                <p className="font-black text-sm uppercase mb-2 text-[#1a73e8]">Managed by {providerLabel}</p>
                <p className="text-sm font-medium text-black/70">
                  Your account security (password, 2FA) is handled by your login provider. Please visit their account settings to make changes.
                </p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Network Info Dialog */}
      <Dialog open={isNetworkInfoOpen} onOpenChange={setIsNetworkInfoOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-header text-3xl font-black uppercase text-[#00B894]">Network Integrity</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="flex items-start gap-4">
              <div className="bg-black text-white p-2 rounded-lg font-black text-xs mt-1">SSL</div>
              <div>
                <h4 className="font-black text-lg">Encrypted Connection</h4>
                <p className="text-sm text-black/70 font-medium">All data transmitted between your device and Joy Juncture is encrypted using TLS 1.3/SSL protocols.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="bg-black text-white p-2 rounded-lg font-black text-xs mt-1">AUTH</div>
              <div>
                <h4 className="font-black text-lg">Secure Token Authentication</h4>
                <p className="text-sm text-black/70 font-medium">We use Firebase Authentication JSON Web Tokens (JWT) to securely identify you without exposing your credentials.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="bg-black text-white p-2 rounded-lg font-black text-xs mt-1">DB</div>
              <div>
                <h4 className="font-black text-lg">Cloud Firestore Rules</h4>
                <p className="text-sm text-black/70 font-medium">Strict database security rules ensure only you can access and modify your personal private data.</p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setIsNetworkInfoOpen(false)} className="bg-black text-white font-black uppercase hover:bg-black/80 w-full">Acknowledged</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Deactivate Account Dialog */}
      <Dialog open={isDeactivating} onOpenChange={setIsDeactivating}>
        <DialogContent className="border-[#FF7675] bg-[#FFF5F5] shadow-[8px_8px_0px_#FF7675] sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-header text-3xl font-black uppercase text-[#FF7675]">Critical Warning</DialogTitle>
            <DialogDescription className="font-bold text-black/60">
              This action is <span className="text-[#FF7675]">IRREVERSIBLE</span>. All your data, points, and history will be permanently erased.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm font-bold">Type <span className="font-black bg-white px-2 py-1 rounded border border-black select-all">DELETE</span> to confirm.</p>
            <Input
              value={deactivateConfirm}
              onChange={(e) => setDeactivateConfirm(e.target.value)}
              className="border-2 border-[#FF7675] font-bold text-lg focus-visible:ring-[#FF7675]"
              placeholder="Type DELETE"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeactivating(false)} className="border-2 border-black font-black uppercase bg-white">Cancel</Button>
            <Button
              onClick={handleDeactivateAccount}
              disabled={isSaving || deactivateConfirm !== 'DELETE'}
              className="bg-[#FF7675] text-white hover:bg-red-600 border-2 border-[#FF7675] font-black uppercase"
            >
              {isSaving ? 'Deactivating...' : 'Confirm Deactivation'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Data Management Dialog */}
      <Dialog open={isDataOpen} onOpenChange={setIsDataOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="w-12 h-12 bg-[#74B9FF] rounded-xl border-2 border-black flex items-center justify-center mb-4 neo-shadow">
              <Database className="text-white" />
            </div>
            <DialogTitle className="font-header text-3xl font-black uppercase">Data Management</DialogTitle>
            <DialogDescription className="font-bold text-black/60">
              Export, manage, and control your data
            </DialogDescription>
          </DialogHeader>
          <DataManagement userId={user.uid} />
        </DialogContent>
      </Dialog>

      {/* Appearance Settings Dialog */}
      <Dialog open={isAppearanceOpen} onOpenChange={setIsAppearanceOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="w-12 h-12 bg-[#FF7675] rounded-xl border-2 border-black flex items-center justify-center mb-4 neo-shadow">
              <Palette className="text-white" />
            </div>
            <DialogTitle className="font-header text-3xl font-black uppercase">Appearance</DialogTitle>
            <DialogDescription className="font-bold text-black/60">
              Customize your visual experience
            </DialogDescription>
          </DialogHeader>
          <AppearanceSettings onSave={handleSaveAppearance} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
