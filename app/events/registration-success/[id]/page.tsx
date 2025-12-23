'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { CheckCircle, Calendar, Users, Award } from 'lucide-react';

interface RegistrationDetails {
  registrationId: string;
  eventTitle: string;
  eventDate?: string;
  eventLocation?: string;
  amount: string;
  pointsUsed: number;
  userName: string;
  userEmail: string;
}

export default function EventRegistrationSuccessPage() {
  const params = useParams();
  const router = useRouter();
  const [details, setDetails] = useState<RegistrationDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      // Get details from URL search params
      const registrationId = params.id as string;
      
      // Try to parse from localStorage or URL params
      const stored = typeof window !== 'undefined' 
        ? localStorage.getItem(`registration_${registrationId}`)
        : null;

      if (stored) {
        const parsedDetails = JSON.parse(stored);
        setDetails(parsedDetails);
        // Clear the stored data
        localStorage.removeItem(`registration_${registrationId}`);
      } else {
        // Fallback with minimal info
        setDetails({
          registrationId,
          eventTitle: 'Event',
          amount: '0',
          pointsUsed: 0,
          userName: '',
          userEmail: '',
        });
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error loading registration details:', error);
      setDetails(null);
      setLoading(false);
    }
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen pt-28 pb-16 flex items-center justify-center">
        <p className="text-white/60 font-serif italic">Loading registration details...</p>
      </div>
    );
  }

  if (!details) {
    return (
      <div className="min-h-screen pt-28 pb-16 flex items-center justify-center">
        <div className="text-center">
          <h1 className="font-display text-4xl font-bold mb-4">Registration Details Not Found</h1>
          <Link href="/events" className="text-amber-500 font-header text-sm tracking-widest mt-6 inline-block">
            BACK TO EVENTS
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-28 pb-16 bg-black">
      <div className="max-w-4xl mx-auto px-6 md:px-12">
        {/* Success Header */}
        <div className="text-center mb-16">
          <div className="flex justify-center mb-8">
            <div className="relative">
              <div className="absolute inset-0 bg-green-500/20 blur-lg rounded-full"></div>
              <div className="relative bg-green-500/10 border border-green-500/30 rounded-full p-6">
                <CheckCircle width={64} height={64} className="text-green-500" />
              </div>
            </div>
          </div>
          
          <h1 className="font-display text-5xl md:text-6xl font-bold mb-4 tracking-tight">
            REGISTRATION SUCCESSFUL!
          </h1>
          
          <p className="text-xl text-white/60 font-body mb-2">
            You have been registered for
          </p>
          <p className="text-3xl font-header text-amber-400 tracking-wide">
            {details.eventTitle}
          </p>
        </div>

        {/* Registration Details Card */}
        <div className="bg-gradient-to-br from-green-500/10 via-black to-amber-500/10 border border-green-500/30 rounded-lg p-8 md:p-12 mb-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            {/* Registration ID */}
            <div className="border-b md:border-b-0 md:border-r border-white/10 pb-8 md:pb-0 md:pr-8">
              <p className="text-xs font-header font-bold tracking-[0.15em] text-white/50 mb-3 uppercase">
                Registration ID
              </p>
              <p className="font-serif text-lg font-semibold break-all text-green-400">
                {details.registrationId}
              </p>
            </div>

            {/* Registration Date */}
            <div>
              <p className="text-xs font-header font-bold tracking-[0.15em] text-white/50 mb-3 uppercase">
                Registered On
              </p>
              <p className="font-serif text-lg font-semibold">
                {new Date().toLocaleDateString('en-IN', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-white/10 my-8"></div>

          {/* Payment Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Amount Paid */}
            <div className="flex items-start gap-4">
              <div className="bg-amber-500/20 border border-amber-500/30 rounded-lg p-3 mt-1">
                <Award width={20} height={20} className="text-amber-400" />
              </div>
              <div>
                <p className="text-xs font-header font-bold tracking-[0.15em] text-white/50 mb-2 uppercase">
                  Amount Paid
                </p>
                <p className="font-serif text-2xl font-semibold text-amber-400">
                  ₹{details.amount}
                </p>
              </div>
            </div>

            {/* Points Used */}
            {details.pointsUsed > 0 && (
              <div className="flex items-start gap-4">
                <div className="bg-purple-500/20 border border-purple-500/30 rounded-lg p-3 mt-1">
                  <Award width={20} height={20} className="text-purple-400" />
                </div>
                <div>
                  <p className="text-xs font-header font-bold tracking-[0.15em] text-white/50 mb-2 uppercase">
                    Points Used
                  </p>
                  <p className="font-serif text-2xl font-semibold text-purple-400">
                    {details.pointsUsed}
                  </p>
                </div>
              </div>
            )}

            {/* Status */}
            <div className="flex items-start gap-4">
              <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-3 mt-1">
                <CheckCircle width={20} height={20} className="text-green-400" />
              </div>
              <div>
                <p className="text-xs font-header font-bold tracking-[0.15em] text-white/50 mb-2 uppercase">
                  Status
                </p>
                <p className="font-serif text-lg font-semibold text-green-400">
                  CONFIRMED
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* What's Next Section */}
        <div className="bg-white/5 border border-white/10 rounded-lg p-8 mb-12">
          <h2 className="font-header text-xl font-bold tracking-widest mb-6 uppercase">What's Next?</h2>
          <ul className="space-y-4">
            <li className="flex items-start gap-4">
              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-400 text-xs font-bold flex-shrink-0">
                1
              </span>
              <div>
                <p className="font-header font-semibold mb-1">Check Your Email</p>
                <p className="text-sm text-white/60">
                  A confirmation email has been sent to {details.userEmail} with all your registration details.
                </p>
              </div>
            </li>
            <li className="flex items-start gap-4">
              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-400 text-xs font-bold flex-shrink-0">
                2
              </span>
              <div>
                <p className="font-header font-semibold mb-1">Save Your Registration ID</p>
                <p className="text-sm text-white/60">
                  You'll need your Registration ID to check in at the event.
                </p>
              </div>
            </li>
            <li className="flex items-start gap-4">
              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-400 text-xs font-bold flex-shrink-0">
                3
              </span>
              <div>
                <p className="font-header font-semibold mb-1">Join the Community</p>
                <p className="text-sm text-white/60">
                  Connect with other attendees on our community page and stay updated on event details.
                </p>
              </div>
            </li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/events"
            className="flex items-center justify-center gap-2 px-8 py-4 bg-amber-500 text-black font-header font-bold text-sm tracking-widest rounded-lg hover:bg-amber-400 transition-colors"
          >
            <Calendar width={18} height={18} />
            EXPLORE MORE EVENTS
          </Link>
          <Link
            href="/community"
            className="flex items-center justify-center gap-2 px-8 py-4 bg-white/10 border border-white/20 text-white font-header font-bold text-sm tracking-widest rounded-lg hover:bg-white/20 transition-colors"
          >
            <Users width={18} height={18} />
            JOIN COMMUNITY
          </Link>
        </div>

        {/* Support Info */}
        <div className="text-center mt-12 pt-12 border-t border-white/10">
          <p className="text-sm text-white/50 font-body mb-3">
            Need help? Contact our support team
          </p>
          <a 
            href="mailto:support@joyjuncture.com"
            className="text-amber-400 hover:text-amber-300 font-header text-xs tracking-widest"
          >
            SUPPORT@JOYJUNCTURE.COM
          </a>
        </div>
      </div>
    </div>
  );
}
