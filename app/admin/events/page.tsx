'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, Plus, Edit2, Trash2, Search, MapPin, Users } from 'lucide-react';
import { getDocs, collection, deleteDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface Event {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  capacity: number;
  registered: number;
  status: 'upcoming' | 'ongoing' | 'completed';
  description: string;
  image: string;
}

export default function EventsPage() {
  const router = useRouter();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'upcoming' | 'ongoing' | 'completed'>('all');

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'events'));
      const eventsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Event));
      setEvents(eventsData);
    } catch (error) {
      console.error('Error fetching events:', error);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || event.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalEvents = filteredEvents.length;
  const totalRegistrations = filteredEvents.reduce((sum, e) => sum + e.registered, 0);
  const totalCapacity = filteredEvents.reduce((sum, e) => sum + e.capacity, 0);
  const occupancyRate = totalCapacity > 0 ? Math.round((totalRegistrations / totalCapacity) * 100) : 0;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming':
        return 'bg-blue-500/10 border-blue-500/20 text-blue-400';
      case 'ongoing':
        return 'bg-green-500/10 border-green-500/20 text-green-400';
      case 'completed':
        return 'bg-gray-500/10 border-gray-500/20 text-gray-400';
      default:
        return 'bg-white/5 border-white/10 text-white/60';
    }
  };

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
      await deleteDoc(doc(db, 'events', eventId));
      setEvents(events.filter(e => e.id !== eventId));
    } catch (error) {
      console.error('Error deleting event:', error);
      alert('Failed to delete event');
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-amber-500">Loading events...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 pb-16">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-5xl font-bold text-white mb-2">Events Management</h1>
          <p className="text-white/60">Organize and manage community events</p>
        </div>
        <button 
          onClick={handleCreateEvent}
          className="px-6 py-3 bg-amber-500 text-black font-header font-bold rounded hover:bg-amber-400 transition flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Create Event
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-purple-500/10 to-transparent border border-purple-500/20 rounded-lg p-6">
          <p className="text-white/60 text-sm mb-2">Total Events</p>
          <p className="font-display text-4xl font-bold text-purple-400">{totalEvents}</p>
        </div>
        <div className="bg-gradient-to-br from-blue-500/10 to-transparent border border-blue-500/20 rounded-lg p-6">
          <p className="text-white/60 text-sm mb-2">Total Registrations</p>
          <p className="font-display text-4xl font-bold text-blue-400">{totalRegistrations}</p>
        </div>
        <div className="bg-gradient-to-br from-green-500/10 to-transparent border border-green-500/20 rounded-lg p-6">
          <p className="text-white/60 text-sm mb-2">Total Capacity</p>
          <p className="font-display text-4xl font-bold text-green-400">{totalCapacity}</p>
        </div>
        <div className="bg-gradient-to-br from-amber-500/10 to-transparent border border-amber-500/20 rounded-lg p-6">
          <p className="text-white/60 text-sm mb-2">Occupancy Rate</p>
          <p className="font-display text-4xl font-bold text-amber-400">{occupancyRate}%</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-black/40 border border-white/10 rounded-lg p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-white/60 text-sm mb-2">
              <Search className="w-4 h-4 inline mr-2" />
              Search Events
            </label>
            <input
              type="text"
              placeholder="Event name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded px-4 py-2 text-white placeholder-white/40 focus:border-amber-500 outline-none transition"
            />
          </div>
          <div>
            <label className="block text-white/60 text-sm mb-2">Filter by Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="w-full bg-white/5 border border-white/10 rounded px-4 py-2 text-white focus:border-amber-500 outline-none transition"
            >
              <option value="all">All Events</option>
              <option value="upcoming">Upcoming</option>
              <option value="ongoing">Ongoing</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Events Cards */}
      <div className="space-y-6">
        {filteredEvents.map((event) => (
          <div
            key={event.id}
            className="bg-black/40 border border-white/10 rounded-lg overflow-hidden hover:border-amber-500/50 transition flex flex-col md:flex-row"
          >
            {/* Image */}
            <div className="w-full md:w-64 h-48 md:h-auto bg-white/5 flex-shrink-0 overflow-hidden">
              <img
                src={event.image}
                alt={event.title}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Content */}
            <div className="flex-1 p-8 flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <h3 className="font-display text-2xl font-bold text-white mb-2">{event.title}</h3>
                    <p className="text-white/60 text-sm mb-4">{event.description}</p>
                  </div>
                  <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold border whitespace-nowrap ${getStatusColor(event.status)}`}>
                    {event.status}
                  </span>
                </div>

                {/* Event Details */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div>
                    <p className="text-white/60 text-xs mb-1 flex items-center gap-1">
                      <Calendar className="w-3 h-3" /> Date
                    </p>
                    <p className="text-white font-semibold">{new Date(event.date).toLocaleDateString()}</p>
                    <p className="text-white/60 text-xs">{event.time}</p>
                  </div>
                  <div>
                    <p className="text-white/60 text-xs mb-1 flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> Location
                    </p>
                    <p className="text-white font-semibold text-sm">{event.location}</p>
                  </div>
                  <div>
                    <p className="text-white/60 text-xs mb-1">Capacity</p>
                    <p className="text-white font-semibold">{event.capacity}</p>
                  </div>
                  <div>
                    <p className="text-white/60 text-xs mb-1 flex items-center gap-1">
                      <Users className="w-3 h-3" /> Registered
                    </p>
                    <p className="text-amber-400 font-semibold">{event.registered}</p>
                    <p className="text-white/60 text-xs">{Math.round((event.registered / event.capacity) * 100)}% full</p>
                  </div>
                </div>

                {/* Registration Bar */}
                <div className="mb-6">
                  <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-amber-500 to-amber-400"
                      style={{ width: `${(event.registered / event.capacity) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button 
                  onClick={() => handleEditEvent(event.id)}
                  className="flex-1 px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded text-blue-400 text-sm font-semibold hover:bg-blue-500/20 transition flex items-center justify-center gap-2"
                >
                  <Edit2 className="w-4 h-4" />
                  Edit
                </button>
                <button 
                  onClick={() => handleViewRegistrations(event.id)}
                  className="flex-1 px-4 py-2 bg-amber-500/10 border border-amber-500/20 rounded text-amber-400 text-sm font-semibold hover:bg-amber-500/20 transition"
                >
                  View Registrations
                </button>
                <button 
                  onClick={() => handleDeleteEvent(event.id)}
                  className="flex-1 px-4 py-2 bg-red-500/10 border border-red-500/20 rounded text-red-400 text-sm font-semibold hover:bg-red-500/20 transition flex items-center justify-center gap-2"
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
        <div className="text-center py-12">
          <Calendar className="w-12 h-12 text-white/20 mx-auto mb-4" />
          <p className="text-white/60">No events found</p>
        </div>
      )}
    </div>
  );
}
