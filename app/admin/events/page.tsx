'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, Plus, Edit2, Trash2, Search, MapPin, Users } from 'lucide-react';
import { GameEvent } from '@/lib/types';
import { splitDateTime } from '@/lib/utils';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { usePopup } from '@/app/context/PopupContext';


export default function EventsPage() {
  const router = useRouter();
  const { showAlert, showConfirm } = usePopup();
  const [events, setEvents] = useState<GameEvent[]>([]);
  const [checkingAdmin, setCheckingAdmin] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'upcoming' | 'past'>('upcoming');
  const [categoryFilter, setCategoryFilter] = useState<'All' | 'Workshop' | 'Game Night' | 'Other'>('All');

  useEffect(() => {
    const auth = getAuth();

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.replace('/');
        return;
      }

      try {
        const snap = await getDoc(doc(db, 'users', user.uid));

        if (!snap.exists() || snap.data()?.role !== 'admin') {
          router.replace('/');
          return;
        }

        // ✅ admin confirmed
        setCheckingAdmin(false);
      } catch (err) {
        console.error('Admin check failed', err);
        router.replace('/');
      }
    });

    return () => unsubscribe();
  }, [router]);

  useEffect(() => {
    if (!checkingAdmin)
      loadEvents();
  }, [checkingAdmin, statusFilter]);

  const loadEvents = async () => {
    try {
      const response = await fetch(`/api/events?status=${statusFilter}`);

      if (!response.ok) {
        throw new Error(`Failed to fetch events: ${statusFilter}`);
      }

      const eventData = await response.json();

      if (eventData.success) {
        setEvents(eventData.events);
      } else {
        setError(eventData.error || 'Failed to load events');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load upcoming events');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.location.toLowerCase().includes(searchTerm.toLowerCase());
    const eventCategory = event.category || 'Other';
    const matchesCategory = categoryFilter === 'All' || eventCategory === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const totalEvents = filteredEvents.length;
  const totalRegistrations = filteredEvents.reduce((sum, e) => sum + e.registered, 0);
  const totalCapacity = filteredEvents.reduce((sum, e) => sum + e.capacity, 0);
  const occupancyRate = totalCapacity > 0 ? Math.round((totalRegistrations / totalCapacity) * 100) : 0;

  const handleCreateEvent = () => {
    router.push('/admin/events/create');
  };

  const handleEditEvent = (eventId: string) => {
    router.push(`/admin/events/${eventId}/edit`);
  };

  const handleViewRegistrations = (eventId: string) => {
    router.push(`/admin/events/${eventId}/registrations`);
  };

  const handleDeleteEvent = async (eventId: string) => {
    const confirmed = await showConfirm('Are you sure you want to cancel this event?', 'Cancel Event');
    if (!confirmed) return;

    try {
      const auth = getAuth();
      const user = auth.currentUser;

      if (!user) {
        await showAlert('Not authenticated', 'error');
        return;
      }

      const token = await user.getIdToken();

      const res = await fetch(`/api/events/${eventId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to delete event');
      }

      setEvents(prev => prev.filter(e => e.id !== eventId));
    } catch (error) {
      console.error('Error deleting event:', error);
      await showAlert('Failed to delete event', 'error');
    }
  };


  if (checkingAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FFFDF5]">
        <p className="font-black text-xs tracking-widest text-black/60">
          CHECKING ACCESS…
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen bg-[#FFFDF5]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#FFD93D] border-t-black rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-black font-black uppercase tracking-widest">Loading events...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen pt-28 pb-16 flex flex-col items-center justify-center gap-4">
        <div className="text-red-500 font-header tracking-widest text-center">
          {error}
        </div>
        <button
          onClick={loadEvents}
          className="px-6 py-2 border border-amber-500 text-amber-500 hover:bg-amber-500/10 transition-all"
        >
          TRY AGAIN
        </button>
      </div>
    );
  }

  return (
    <div className="px-3 py-4 pb-16 md:p-8 md:pb-16 min-h-screen bg-[#FFFDF5] overflow-x-hidden">
      {/* Header */}
      <div className="mb-8 md:mb-12 border-b-2 border-black pb-6 md:pb-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3 md:gap-4">
            <div className="p-2 bg-[#6C5CE7] rounded-lg border-2 border-black neo-shadow-sm">
              <Calendar className="w-5 h-5 md:w-6 md:h-6 text-white" />
            </div>
            <div>
              <h1 className="font-header text-3xl md:text-6xl font-black text-black uppercase tracking-tighter">Events</h1>
              <p className="text-black/60 font-bold text-sm md:text-lg">Organize and manage community events</p>
            </div>
          </div>
          <button
            onClick={handleCreateEvent}
            className="px-4 md:px-6 py-2 md:py-3 bg-[#FFD93D] text-black font-black uppercase tracking-wide rounded-xl border-2 border-black neo-shadow hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all flex items-center gap-2 text-sm md:text-base"
          >
            <Plus className="w-4 h-4 md:w-5 md:h-5" strokeWidth={3} />
            Create Event
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-6 mb-12">
        <div className="bg-[#6C5CE7] border-2 border-black rounded-[20px] p-4 md:p-6 neo-shadow hover:-translate-y-1 transition-transform">
          <p className="text-white text-xs font-black uppercase tracking-widest mb-2">Total Events</p>
          <p className="font-header text-5xl font-black text-white">{totalEvents}</p>
        </div>
        <div className="bg-[#FF7675] border-2 border-black rounded-[20px] p-4 md:p-6 neo-shadow hover:-translate-y-1 transition-transform">
          <p className="text-black text-xs font-black uppercase tracking-widest mb-2">Registrations</p>
          <p className="font-header text-5xl font-black text-black">{totalRegistrations}</p>
        </div>
        <div className="bg-[#74B9FF] border-2 border-black rounded-[20px] p-4 md:p-6 neo-shadow hover:-translate-y-1 transition-transform">
          <p className="text-black text-xs font-black uppercase tracking-widest mb-2">Capacity</p>
          <p className="font-header text-5xl font-black text-black">{totalCapacity}</p>
        </div>
        <div className="bg-[#00B894] border-2 border-black rounded-[20px] p-4 md:p-6 neo-shadow hover:-translate-y-1 transition-transform">
          <p className="text-black text-xs font-black uppercase tracking-widest mb-2">Occupancy Rate</p>
          <p className="font-header text-5xl font-black text-black">{occupancyRate}%</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border-2 border-black rounded-xl p-6 mb-8 neo-shadow">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-black font-black text-xs uppercase tracking-widest mb-2">
              <Search className="w-4 h-4 inline mr-2" />
              Search Events
            </label>
            <input
              type="text"
              placeholder="Event name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#FFFDF5] border-2 border-black rounded-xl px-4 py-3 text-black placeholder-black/30 focus:outline-none focus:ring-0 font-bold transition-all"
            />
          </div>
          <div>
            <label className="block text-black font-black text-xs uppercase tracking-widest mb-2">Filter by Status</label>
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="w-full bg-[#FFFDF5] border-2 border-black rounded-xl px-4 py-3 text-black focus:outline-none font-bold appearance-none cursor-pointer"
              >
                <option value="upcoming">Upcoming</option>
                <option value="past">Past</option>
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M2.5 4.5L6 8L9.5 4.5" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </div>
          </div>
          <div>
            <label className="block text-black font-black text-xs uppercase tracking-widest mb-2">Filter by Category</label>
            <div className="flex flex-wrap gap-2">
              {['All', 'Workshop', 'Game Night', 'Other'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat as any)}
                  className={`px-4 py-2 rounded-xl font-black text-[10px] tracking-widest uppercase transition-all border-2 border-black ${categoryFilter === cat
                    ? 'bg-[#FFD93D] text-black shadow-[2px_2px_0px_#000]'
                    : 'bg-[#FFFDF5] text-black/40 hover:text-black hover:border-black'
                    }`}
                >
                  {cat === 'All' ? 'All' : cat === 'Other' ? 'Others' : `${cat}s`}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Events Cards */}
      <div className="space-y-6">
        {filteredEvents.map((event) => (
          <div
            key={event.id}
            className="bg-white border-2 border-black rounded-[25px] overflow-hidden hover:translate-x-1 hover:-translate-y-1 transition-transform duration-300 neo-shadow group flex flex-col md:flex-row"
          >
            {/* Image */}
            <div className="w-full md:w-80 h-64 md:h-auto bg-gray-100 flex-shrink-0 overflow-hidden border-b-2 md:border-b-0 md:border-r-2 border-black relative">
              {event.image !== "" ? (
                <img
                  src={event.image}
                  alt={event.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-200">
                  <Calendar className="w-12 h-12 text-black/20" />
                </div>
              )}
              <div className="absolute top-4 left-4">
                <span className={`px-3 py-1 text-black text-xs font-black uppercase tracking-wider rounded-lg border-2 border-black shadow-[2px_2px_0px_rgba(0,0,0,1)] ${statusFilter === 'upcoming' ? 'bg-[#00B894]' : 'bg-gray-300'}`}>
                  {statusFilter === 'upcoming' ? 'Upcoming' : 'Past'}
                </span>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 p-4 md:p-8 flex flex-col justify-between">
              <div>
                <div className="mb-6">
                  <h3 className="font-header text-3xl font-black text-black mb-2 uppercase tracking-tight">{event.title}</h3>
                  <p className="text-black/60 text-sm font-medium leading-relaxed">{event.description}</p>
                </div>

                {/* Event Details */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  <div className="bg-[#FFFDF5] p-3 rounded-xl border-2 border-black">
                    <p className="text-black/40 text-xs font-black uppercase tracking-wider mb-1 flex items-center gap-1">
                      <Calendar className="w-3 h-3" /> Date
                    </p>
                    <p className="text-black font-black">{splitDateTime(event.datetime).date}</p>
                    <p className="text-black/60 text-xs font-bold">{splitDateTime(event.datetime).time}</p>
                  </div>
                  <div className="bg-[#FFFDF5] p-3 rounded-xl border-2 border-black">
                    <p className="text-black/40 text-xs font-black uppercase tracking-wider mb-1 flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> Location
                    </p>
                    <p className="text-black font-black text-sm truncate" title={event.location}>{event.location}</p>
                  </div>
                  <div className="bg-[#FFFDF5] p-3 rounded-xl border-2 border-black">
                    <p className="text-black/40 text-xs font-black uppercase tracking-wider mb-1">Capacity</p>
                    <p className="text-black font-black">{event.capacity}</p>
                  </div>
                  <div className="bg-[#FFFDF5] p-3 rounded-xl border-2 border-black">
                    <p className="text-black/40 text-xs font-black uppercase tracking-wider mb-1 flex items-center gap-1">
                      <Users className="w-3 h-3" /> Registered
                    </p>
                    <p className="text-[#00B894] font-black">{event.registered}</p>
                    <p className="text-black/40 text-xs font-bold">{Math.round((event.registered / event.capacity) * 100)}% full</p>
                  </div>
                </div>

                {/* Registration Bar */}
                <div className="mb-6">
                  <div className="w-full h-4 bg-gray-100 rounded-full overflow-hidden border-2 border-black">
                    <div
                      className="h-full bg-[#FFD93D] border-r-2 border-black"
                      style={{ width: `${Math.min((event.registered / event.capacity) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col md:flex-row gap-4 pt-6 border-t-2 border-black/5">
                <button
                  onClick={() => handleEditEvent(event.id)}
                  className="flex-1 px-4 py-3 bg-white border-2 border-black rounded-xl text-black text-sm font-black uppercase tracking-wide hover:bg-black hover:text-white transition-all flex items-center justify-center gap-2 neo-shadow-sm active:translate-x-[1px] active:translate-y-[1px] active:shadow-none"
                >
                  <Edit2 className="w-4 h-4" />
                  Edit
                </button>
                <button
                  onClick={() => handleViewRegistrations(event.id)}
                  className="flex-1 px-4 py-3 bg-[#6C5CE7] border-2 border-black rounded-xl text-white text-sm font-black uppercase tracking-wide hover:bg-[#5849be] transition-all neo-shadow-sm active:translate-x-[1px] active:translate-y-[1px] active:shadow-none"
                >
                  Registrations
                </button>
                <button
                  onClick={() => handleDeleteEvent(event.id)}
                  className="flex-1 px-4 py-3 bg-[#FF7675]/20 border-2 border-[#FF7675] rounded-xl text-[#D63031] text-sm font-black uppercase tracking-wide hover:bg-[#FF7675] hover:text-white hover:border-black transition-all flex items-center justify-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Cancel
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredEvents.length === 0 && (
        <div className="text-center py-20 bg-white border-2 border-black rounded-[30px] border-dashed">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6 border-2 border-black">
            <Calendar className="w-10 h-10 text-black/20" />
          </div>
          <p className="text-black font-black uppercase tracking-widest text-lg">No events found</p>
          <p className="text-black/40 font-bold mt-2">Create a new event to get started</p>
        </div>
      )}
    </div>
  );
}
