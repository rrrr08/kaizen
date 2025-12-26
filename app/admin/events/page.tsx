'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, Plus, Edit2, Trash2, Search, MapPin, Users, Activity, BarChart2 } from 'lucide-react';
import { deleteDoc, doc } from 'firebase/firestore';
import { GameEvent } from '@/lib/types';
import { splitDateTime } from '@/lib/utils';
import { getFirebaseDb } from '@/lib/firebase';

export default function EventsPage() {
  const router = useRouter();
  const [events, setEvents] = useState<GameEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'upcoming' | 'past'>('upcoming');

  useEffect(() => {
    loadEvents();
  }, [statusFilter]);

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

  const filteredEvents = events;

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
    if (!window.confirm('Are you sure you want to cancel this event?')) {
      return;
    }

    try {
      const res = await fetch(`/api/events/${eventId}`, {
        method: 'DELETE',
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to delete event');
      }

      setEvents(prev => prev.filter(e => e.id !== eventId));
    } catch (error) {
      console.error('Error deleting event:', error);
      alert('Failed to delete event');
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen bg-[#050505]">
        <div className="text-center">
          <div className="text-[#FFD400] font-arcade tracking-[0.3em] animate-pulse text-xl">
            LOADING_EVENTS...
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen pt-28 pb-16 flex flex-col items-center justify-center gap-4 bg-[#050505]">
        <div className="text-red-500 font-arcade tracking-widest text-center text-xl">
          SYSTEM_MALFUNCTION: {error}
        </div>
        <button
          onClick={loadEvents}
          className="px-8 py-3 bg-transparent border-2 border-[#FFD400] text-[#FFD400] font-arcade hover:bg-[#FFD400]/10 transition-all uppercase tracking-widest"
        >
          RETRY_CONNECTION
        </button>
      </div>
    );
  }

  return (
    <div className="p-8 pb-16 text-white min-h-screen bg-[#050505]">
      {/* Header */}
      <div className="flex items-center justify-between mb-12 border-b-2 border-[#333] pb-6">
        <div>
          <h1 className="font-arcade text-5xl text-white mb-2 text-3d-orange">EVENT_MANAGER</h1>
          <p className="text-gray-500 font-sans text-lg tracking-wide uppercase">Organize and manage community events</p>
        </div>
        <button
          onClick={handleCreateEvent}
          className="px-6 py-3 bg-[#FFD400] text-black font-arcade text-sm font-bold rounded-sm hover:bg-[#FFE066] transition flex items-center gap-2 uppercase tracking-wider"
        >
          <Plus className="w-5 h-5" />
          INIT_NEW_EVENT
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
        <div className="bg-[#080808] border-2 border-[#333] rounded-[4px] p-6 hover:border-[#FFD400]/30 transition-colors">
          <div className="flex items-center gap-2 mb-2 text-gray-500 text-xs font-mono uppercase">
            <Calendar className="w-4 h-4" /> Total Events
          </div>
          <p className="font-arcade text-4xl text-[#FFD400] text-shadow-glow">{totalEvents}</p>
        </div>
        <div className="bg-[#080808] border-2 border-[#333] rounded-[4px] p-6 hover:border-[#00B894]/30 transition-colors">
          <div className="flex items-center gap-2 mb-2 text-gray-500 text-xs font-mono uppercase">
            <Users className="w-4 h-4" /> Registrations
          </div>
          <p className="font-arcade text-4xl text-[#00B894] text-shadow-glow">{totalRegistrations}</p>
        </div>
        <div className="bg-[#080808] border-2 border-[#333] rounded-[4px] p-6 hover:border-blue-500/30 transition-colors">
          <div className="flex items-center gap-2 mb-2 text-gray-500 text-xs font-mono uppercase">
            <Activity className="w-4 h-4" /> Capacity
          </div>
          <p className="font-arcade text-4xl text-blue-400 text-shadow-glow">{totalCapacity}</p>
        </div>
        <div className="bg-[#080808] border-2 border-[#333] rounded-[4px] p-6 hover:border-purple-500/30 transition-colors">
          <div className="flex items-center gap-2 mb-2 text-gray-500 text-xs font-mono uppercase">
            <BarChart2 className="w-4 h-4" /> Occupancy
          </div>
          <p className="font-arcade text-4xl text-purple-400 text-shadow-glow">{occupancyRate}%</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-[#111] border border-[#333] rounded-sm p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-[#00B894] text-xs font-mono uppercase tracking-widest mb-2">
              <Search className="w-3 h-3 inline mr-2" />
              SEARCH_EVENTS
            </label>
            <input
              type="text"
              placeholder="SEARCH PROTOCOL..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-black border border-[#333] rounded-sm px-4 py-2 text-white font-mono placeholder-gray-700 focus:border-[#FFD400] outline-none transition uppercase"
            />
          </div>
          <div>
            <label className="block text-[#00B894] text-xs font-mono uppercase tracking-widest mb-2">FILTER_STATUS</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="w-full bg-black border border-[#333] rounded-sm px-4 py-2 text-white font-mono focus:border-[#FFD400] outline-none transition uppercase appearance-none cursor-pointer"
            >
              <option value="upcoming">UPCOMING_OPERATIONS</option>
              <option value="past">ARCHIVED_MISSIONS</option>
            </select>
          </div>
        </div>
      </div>

      {/* Events Cards */}
      <div className="space-y-6">
        {filteredEvents.map((event) => (
          <div
            key={event.id}
            className="bg-[#080808] border-2 border-[#333] rounded-[4px] overflow-hidden hover:border-[#FFD400] transition-colors flex flex-col md:flex-row group"
          >
            {/* Image */}
            <div className="w-full md:w-64 h-48 md:h-auto bg-[#111] flex-shrink-0 overflow-hidden relative border-r-2 border-[#333]">
              {event.image !== "" ? (
                <>
                  <img
                    src={event.image}
                    alt={event.title}
                    className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                  />
                  <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.1)_1px,transparent_1px)] bg-[size:4px_4px] pointer-events-none"></div>
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-700 font-mono text-xs uppercase">
                  NO_SIGNAL
                </div>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 p-8 flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <h3 className="font-arcade text-2xl text-white mb-2 tracking-widest group-hover:text-[#FFD400] transition-colors">{event.title}</h3>
                    <p className="text-gray-400 font-mono text-xs mb-4 max-w-2xl line-clamp-2">{event.description}</p>
                  </div>
                </div>

                {/* Event Details */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div>
                    <p className="text-[#00B894] text-[10px] font-mono uppercase mb-1 flex items-center gap-1">
                      <Calendar className="w-3 h-3" /> DATE_TIME
                    </p>
                    <p className="text-white font-mono text-sm">{splitDateTime(event.datetime).date}</p>
                    <p className="text-gray-500 font-mono text-xs">{splitDateTime(event.datetime).time}</p>
                  </div>
                  <div>
                    <p className="text-[#00B894] text-[10px] font-mono uppercase mb-1 flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> SECTOR
                    </p>
                    <p className="text-white font-mono text-sm truncate">{event.location}</p>
                  </div>
                  <div>
                    <p className="text-[#00B894] text-[10px] font-mono uppercase mb-1">CAPACITY_LIMIT</p>
                    <p className="text-white font-mono text-sm">{event.capacity} UNITS</p>
                  </div>
                  <div>
                    <p className="text-[#00B894] text-[10px] font-mono uppercase mb-1 flex items-center gap-1">
                      <Users className="w-3 h-3" /> ENGAGED
                    </p>
                    <p className="text-[#FFD400] font-mono text-sm">{event.registered}</p>
                    <p className="text-gray-500 font-mono text-[10px]">{Math.round((event.registered / event.capacity) * 100)}% LOAD</p>
                  </div>
                </div>

                {/* Registration Bar */}
                <div className="mb-6 relative h-2 bg-[#111] rounded-full overflow-hidden border border-[#333]">
                  <div className="absolute top-0 right-0 bottom-0 left-0 bg-[linear-gradient(90deg,transparent_0%,rgba(255,255,255,0.05)_50%,transparent_100%)] animate-shimmer"></div>
                  <div
                    className="h-full bg-[#FFD400] box-shadow-[0_0_10px_#FFD400]"
                    style={{ width: `${(event.registered / event.capacity) * 100}%` }}
                  ></div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-4 border-t border-[#222] pt-6">
                <button
                  onClick={() => handleEditEvent(event.id)}
                  className="px-6 py-2 bg-[#111] border border-[#333] rounded-sm text-gray-300 font-mono text-xs uppercase hover:border-[#FFD400] hover:text-[#FFD400] transition flex items-center justify-center gap-2 group/btn"
                >
                  <Edit2 className="w-3 h-3 group-hover/btn:text-[#FFD400]" />
                  MODIFY_DATA
                </button>
                <button
                  onClick={() => handleViewRegistrations(event.id)}
                  className="px-6 py-2 bg-[#111] border border-[#333] rounded-sm text-gray-300 font-mono text-xs uppercase hover:border-[#00B894] hover:text-[#00B894] transition flex items-center justify-center gap-2 group/btn"
                >
                  <Users className="w-3 h-3 group-hover/btn:text-[#00B894]" />
                  VIEW_ROSTER
                </button>
                <button
                  onClick={() => handleDeleteEvent(event.id)}
                  className="px-6 py-2 bg-[#111] border border-red-900/40 rounded-sm text-red-500 font-mono text-xs uppercase hover:bg-red-900/10 hover:border-red-500 transition flex items-center justify-center gap-2 ml-auto"
                >
                  <Trash2 className="w-3 h-3" />
                  ABORT
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredEvents.length === 0 && (
        <div className="text-center py-24 border-2 border-dashed border-[#333] rounded-[4px]">
          <Calendar className="w-16 h-16 text-[#333] mx-auto mb-6" />
          <p className="text-gray-500 font-arcade tracking-widest">NO_EVENTS_DETECTED_IN_SECTOR</p>
        </div>
      )}
    </div>
  );
}
