'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Mail, Send, Users, CheckCircle } from 'lucide-react';
import { auth } from '@/lib/firebase';
import RoleProtected from '@/components/auth/RoleProtected';
import { USER_ROLES } from '@/lib/roles';

export default function AdminEmailsPage() {
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    subject: '',
    message: '',
    recipientSegment: 'all',
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.subject || !formData.message) {
      addToast({
        title: 'Validation Error',
        description: 'Subject and message are required',
      });
      return;
    }

    setLoading(true);

    try {
      const currentUser = auth.currentUser;

      if (currentUser) {
        const token = await currentUser.getIdToken();

        const response = await fetch('/api/admin/send-email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(formData)
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to send emails');
        }

        addToast({
          title: 'Success!',
          description: data.message,
        });

        // Reset form
        setFormData({
          subject: '',
          message: '',
          recipientSegment: 'all',
        });
      }
    } catch (error: any) {
      console.error('Error sending emails:', error);
      addToast({
        title: 'Error',
        description: error.message || 'Failed to send emails',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <RoleProtected allowedRoles={[USER_ROLES.ADMIN]}>
      <div className="min-h-screen pt-28 pb-16 bg-[#FFFDF5]">
        <div className="max-w-4xl mx-auto px-6 md:px-12">
          {/* Header */}
          <div className="mb-12 border-b-2 border-black pb-8">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 rounded-xl bg-[#FF7675] border-2 border-black flex items-center justify-center shadow-[4px_4px_0px_#000]">
                <Mail className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="font-header text-5xl font-black text-black uppercase tracking-tighter">Send Emails</h1>
                <p className="text-black/60 font-bold text-lg">Compose and send emails to users</p>
              </div>
            </div>
          </div>

          {/* Email Composer */}
          <div className="bg-white border-2 border-black rounded-[25px] p-8 shadow-[8px_8px_0px_#000]">
            <form onSubmit={handleSendEmail} className="space-y-6">
              {/* Subject */}
              <div>
                <label className="block text-black font-black text-xs uppercase tracking-widest mb-2">
                  Email Subject <span className="text-[#FF7675]">*</span>
                </label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  placeholder="e.g., Weekly Newsletter - Game Updates"
                  maxLength={100}
                  className="w-full bg-[#FFFDF5] border-2 border-black rounded-xl px-4 py-3 text-black placeholder-black/30 focus:outline-none focus:shadow-[2px_2px_0px_#000] transition-all font-bold"
                />
                <p className="text-xs text-black/40 font-bold mt-1 uppercase tracking-wide">
                  Keep it concise and clear
                </p>
              </div>

              {/* Message */}
              <div>
                <label className="block text-black font-black text-xs uppercase tracking-widest mb-2">
                  Email Message <span className="text-[#FF7675]">*</span>
                </label>
                <Textarea
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  placeholder="Write your email content here... This will be sent to all selected users."
                  rows={12}
                  maxLength={5000}
                  className="w-full bg-[#FFFDF5] border-2 border-black rounded-xl px-4 py-3 text-black placeholder-black/30 focus:outline-none focus:shadow-[2px_2px_0px_#000] transition-all resize-none font-medium leading-relaxed"
                />
                <p className="text-[10px] text-black/40 font-bold mt-1 uppercase tracking-wider text-right">{formData.message.length}/5000</p>
                <p className="text-xs text-black/40 font-bold mt-1 uppercase tracking-wide">
                  Plain text will be formatted automatically
                </p>
              </div>

              {/* Recipient Segment */}
              <div>
                <label className="block text-black font-black text-xs uppercase tracking-widest mb-2">
                  Send To
                </label>
                <Select
                  value={formData.recipientSegment}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, recipientSegment: value }))
                  }
                >
                  <SelectTrigger className="w-full bg-[#FFFDF5] border-2 border-black rounded-xl px-4 py-3 text-black font-bold focus:ring-0 focus:ring-offset-0 h-auto">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-2 border-black rounded-xl shadow-[4px_4px_0px_#000]">
                    <SelectItem value="all" className="font-bold focus:bg-[#FFD93D] focus:text-black cursor-pointer">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        All Users
                      </div>
                    </SelectItem>
                    <SelectItem value="bronze" className="font-bold focus:bg-[#FFD93D] focus:text-black cursor-pointer">
                      Bronze Tier Users
                    </SelectItem>
                    <SelectItem value="silver" className="font-bold focus:bg-[#FFD93D] focus:text-black cursor-pointer">
                      Silver Tier Users
                    </SelectItem>
                    <SelectItem value="gold" className="font-bold focus:bg-[#FFD93D] focus:text-black cursor-pointer">
                      Gold Tier Users
                    </SelectItem>
                    <SelectItem value="platinum" className="font-bold focus:bg-[#FFD93D] focus:text-black cursor-pointer">
                      Platinum Tier Users
                    </SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-black/40 font-bold mt-1 uppercase tracking-wide flex items-center gap-2">
                  <CheckCircle className="w-3 h-3" />
                  Emails will only be sent to users with verified email addresses
                </p>
              </div>

              {/* Preview Box */}
              <div className="p-6 bg-[#F0F0F0] border-2 border-black rounded-xl">
                <p className="text-xs font-black uppercase tracking-wider text-black/50 mb-3">Email Preview</p>
                <div className="bg-white p-4 rounded-lg border border-black/20">
                  <p className="font-black text-lg text-black mb-2">
                    {formData.subject || 'Your Subject Here'}
                  </p>
                  <p className="text-sm text-black/70 whitespace-pre-wrap">
                    {formData.message || 'Your message will appear here...'}
                  </p>
                </div>
              </div>

              {/* Send Button */}
              <div className="flex gap-4 pt-4">
                <Button
                  type="submit"
                  disabled={loading || !formData.subject || !formData.message}
                  className="flex-1 px-6 py-6 bg-[#00B894] text-white font-black uppercase tracking-widest rounded-xl border-2 border-black shadow-[4px_4px_0px_#000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Send Emails
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  onClick={() => setFormData({ subject: '', message: '', recipientSegment: 'all' })}
                  className="px-6 py-6 bg-white text-black font-black uppercase tracking-widest rounded-xl border-2 border-black hover:bg-gray-50 transition-all"
                >
                  Clear
                </Button>
              </div>
            </form>
          </div>

          {/* Info Box */}
          <div className="mt-8 p-6 bg-[#DDFFF7] border-2 border-black rounded-xl shadow-[4px_4px_0px_#000]">
            <h3 className="font-black text-sm uppercase tracking-wider text-black mb-3 flex items-center gap-2">
              <Mail className="w-4 h-4 text-[#00B894]" />
              Email Information
            </h3>
            <ul className="space-y-2 text-sm font-bold text-black/70">
              <li>✓ Emails are sent from your configured Gmail account</li>
              <li>✓ Users must have valid email addresses in their profile</li>
              <li>✓ Emails include your branding and formatting</li>
              <li>✓ Failed sends are logged and reported</li>
            </ul>
          </div>
        </div>
      </div>
    </RoleProtected>
  );
}
