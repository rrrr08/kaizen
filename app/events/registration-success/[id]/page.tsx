'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { CheckCircle, Calendar, Users, Award, MapPin, ArrowRight, Ticket } from 'lucide-react';
import { motion } from 'framer-motion';

export const dynamic = 'force-dynamic';

interface RegistrationDetails {
  registrationId: string;
  eventTitle: string;
  eventDate?: string;
  eventLocation?: string;
  amount: string;
  pointsUsed: number;
  userName: string;
  userEmail: string;
  vipSeating?: boolean;
  tierDiscount?: string;
  voucherDiscount?: string;
}

export default function EventRegistrationSuccessPage() {
  const params = useParams();
  const router = useRouter();
  const [details, setDetails] = useState<RegistrationDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDetails = async () => {
      try {
        const registrationId = params.id as string;

        // Try to parse from localStorage
        const stored = typeof window !== 'undefined'
          ? localStorage.getItem(`registration_${registrationId}`)
          : null;

        if (stored) {
          const parsedDetails = JSON.parse(stored);
          setDetails(parsedDetails);
          // Don't clear immediately - keep for 1 hour in case of refresh
          setTimeout(() => {
            if (typeof window !== 'undefined') {
              localStorage.removeItem(`registration_${registrationId}`);
            }
          }, 3600000);
        } else {
          // Try to fetch from Firestore as fallback
          try {
            const { doc, getDoc } = await import('firebase/firestore');
            const { getFirebaseDb } = await import('@/lib/firebase');
            const db = await getFirebaseDb();
            const registrationDoc = await getDoc(doc(db, 'event_registrations', registrationId));
            
            if (registrationDoc.exists()) {
              const data = registrationDoc.data();
              // Fetch event details
              const eventResponse = await fetch(`/api/events/${data.eventId}`);
              const eventData = eventResponse.ok ? await eventResponse.json() : null;
              
              setDetails({
                registrationId,
                eventTitle: eventData?.event?.title || 'Event',
                eventDate: eventData?.event?.datetime,
                eventLocation: eventData?.event?.location,
                amount: (data.amountPaid || 0).toFixed(2),
                pointsUsed: data.walletPointsUsed || 0,
                userName: data.name || '',
                userEmail: data.email || '',
              });
            } else {
              // Fallback with minimal info
              setDetails({
                registrationId,
                eventTitle: 'Event Registration',
                amount: '0.00',
                pointsUsed: 0,
                userName: '',
                userEmail: '',
              });
            }
          } catch (dbError) {
            console.error('Error fetching from database:', dbError);
            setDetails({
              registrationId,
              eventTitle: 'Event Registration',
              amount: '0.00',
              pointsUsed: 0,
              userName: '',
              userEmail: '',
            });
          }
        }

        setLoading(false);
      } catch (error) {
        console.error('Error loading registration details:', error);
        setDetails(null);
        setLoading(false);
      }
    };

    loadDetails();
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen pt-28 pb-16 flex items-center justify-center bg-[#FFFDF5]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-black border-t-[#FFD93D] mb-4"></div>
          <p className="text-black font-black text-xs tracking-[0.4em]">LOADING DETAILS...</p>
        </div>
      </div>
    );
  }

  if (!details) {
    return (
      <div className="min-h-screen pt-28 pb-16 flex items-center justify-center bg-[#FFFDF5]">
        <div className="text-center">
          <h1 className="font-header text-6xl font-black mb-6 text-black">DETAILS NOT FOUND</h1>
          <Link href="/events" className="inline-block px-8 py-4 bg-[#FFD93D] text-black font-black text-sm rounded-[15px] border-2 border-black neo-shadow hover:scale-105 transition-all">
            BACK TO EVENTS
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-32 pb-16 bg-[#FFFDF5] text-[#2D3436]">
      <div className="max-w-3xl mx-auto px-6 md:px-12">
        {/* Success Message */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="flex justify-center mb-8"
          >
            <div className="w-24 h-24 bg-[#00B894] rounded-full flex items-center justify-center border-3 border-black neo-shadow">
              <CheckCircle className="w-12 h-12 text-white" strokeWidth={3} />
            </div>
          </motion.div>
          <h1 className="font-header text-6xl md:text-7xl font-black mb-6 tracking-tighter text-black leading-none">
            YOU&apos;RE<br /><span className="text-[#6C5CE7] drop-shadow-[3px_3px_0px_#000]">REGISTERED!</span>
          </h1>
          <p className="text-xl text-black/70 font-bold max-w-lg mx-auto">
            See you there! We&apos;ve sent confirmation to your inbox.
          </p>
        </div>

        {/* Registration Details Card */}
        <div className="bg-white border-2 border-black rounded-[25px] p-8 neo-shadow mb-8 relative overflow-hidden">
          {/* Decorative bg */}
          <div className="absolute top-[-50px] right-[-50px] w-40 h-40 bg-[#6C5CE7]/20 rounded-full blur-[40px]"></div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8 relative z-10">
            <div>
              <p className="text-[10px] font-black tracking-[0.2em] text-black/40 mb-2 uppercase">REGISTRATION ID</p>
              <p className="font-mono text-lg font-bold bg-[#F0F0F0] px-3 py-1 rounded border border-black/10 inline-block">{details.registrationId.slice(0, 12)}...</p>
            </div>
            <div>
              <p className="text-[10px] font-black tracking-[0.2em] text-black/40 mb-2 uppercase">REGISTERED ON</p>
              <p className="font-header text-xl font-black text-black">
                {new Date().toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-black tracking-[0.2em] text-black/40 mb-2 uppercase">AMOUNT PAID</p>
              <p className="font-header text-3xl font-black text-[#6C5CE7]">₹{details.amount}</p>
            </div>
          </div>

          {/* VIP Badge if applicable */}
          {details.vipSeating && (
            <div className="border-t-2 border-dashed border-black/20 pt-8 relative z-10">
              <div className="bg-[#FFD93D] border-2 border-black rounded-xl p-6 flex items-center gap-6 shadow-[4px_4px_0px_rgba(0,0,0,0.1)]">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center border-2 border-black font-black text-2xl">
                  👑
                </div>
                <div>
                  <p className="text-xs font-black tracking-[0.1em] text-black/60 uppercase mb-1">VIP ACCESS</p>
                  <p className="font-header text-2xl font-black tracking-tight text-black">RESERVED SEATING</p>
                  <p className="text-sm text-black font-bold mt-1">
                    Your exclusive spot is confirmed!
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Event & Contact Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {/* Event Details */}
          <div className="bg-white border-2 border-black rounded-[25px] p-8 neo-shadow">
            <h2 className="font-header text-2xl mb-6 font-black flex items-center gap-2">
              <Ticket size={24} />
              EVENT DETAILS
            </h2>
            <div className="space-y-4">
              <div>
                <p className="text-xs font-black text-black/40 uppercase tracking-wide mb-1">Event Name</p>
                <p className="font-header text-lg font-black text-black">{details.eventTitle}</p>
              </div>
              {details.eventDate && (
                <div>
                  <p className="text-xs font-black text-black/40 uppercase tracking-wide mb-1">Date & Time</p>
                  <p className="font-bold text-black">{new Date(details.eventDate).toLocaleString()}</p>
                </div>
              )}
              {details.eventLocation && (
                <div>
                  <p className="text-xs font-black text-black/40 uppercase tracking-wide mb-1">Location</p>
                  <p className="font-bold text-black flex items-start gap-2">
                    <MapPin size={16} className="mt-1 flex-shrink-0" />
                    <span>{details.eventLocation}</span>
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Contact Info */}
          <div className="bg-[#FFFDF5] border-2 border-black rounded-[25px] p-8 neo-shadow">
            <h2 className="font-header text-2xl mb-6 font-black">YOUR INFO</h2>
            <div className="text-black font-bold text-sm space-y-4">
              <div>
                <p className="text-xs font-black text-black/40 uppercase tracking-wide mb-1">Name</p>
                <p className="text-lg capitalize">{details.userName}</p>
              </div>
              <div>
                <p className="text-xs font-black text-black/40 uppercase tracking-wide mb-1">Email</p>
                <p className="text-black/70">{details.userEmail}</p>
              </div>
              <div className="mt-4 pt-4 border-t-2 border-black/5">
                <p className="text-black/50 text-xs uppercase tracking-wide">Status</p>
                <div className="flex items-center gap-2 mt-1">
                  <div className="w-2 h-2 bg-[#00B894] rounded-full"></div>
                  <p className="font-black text-[#00B894]">CONFIRMED</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* What's Next Section */}
        <div className="bg-white border-2 border-black rounded-[25px] p-8 neo-shadow mb-8">
          <h2 className="font-header text-2xl font-black tracking-tight mb-6 uppercase">What&apos;s Next?</h2>
          <ul className="space-y-4">
            <li className="flex items-start gap-4">
              <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-[#FFD93D] border-2 border-black text-black text-sm font-black flex-shrink-0">
                1
              </span>
              <div>
                <p className="font-header font-black text-black mb-1">Check Your Email</p>
                <p className="text-sm text-black/60 font-bold">
                  A confirmation email has been sent to {details.userEmail} with all your registration details.
                </p>
              </div>
            </li>
            <li className="flex items-start gap-4">
              <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-[#FFD93D] border-2 border-black text-black text-sm font-black flex-shrink-0">
                2
              </span>
              <div>
                <p className="font-header font-black text-black mb-1">Save Your Registration ID</p>
                <p className="text-sm text-black/60 font-bold">
                  You&apos;ll need your Registration ID to check in at the event.
                </p>
              </div>
            </li>
            <li className="flex items-start gap-4">
              <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-[#FFD93D] border-2 border-black text-black text-sm font-black flex-shrink-0">
                3
              </span>
              <div>
                <p className="font-header font-black text-black mb-1">Join the Community</p>
                <p className="text-sm text-black/60 font-bold">
                  Connect with other attendees on our community page and stay updated on event details.
                </p>
              </div>
            </li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            href="/orders"
            className="flex-1 py-4 bg-white border-2 border-black text-black font-black text-sm tracking-wider text-center hover:bg-gray-50 hover:-translate-y-1 transition-all rounded-[15px] uppercase neo-shadow"
          >
            VIEW ORDERS
          </Link>
          <Link
            href="/events/upcoming"
            className="flex-1 py-4 bg-black text-white border-2 border-black font-black text-sm tracking-wider text-center hover:bg-[#6C5CE7] hover:-translate-y-1 transition-all rounded-[15px] uppercase neo-shadow flex items-center justify-center gap-2"
          >
            MORE EVENTS <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    </div>
  );
}
