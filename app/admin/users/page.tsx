'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose
} from '@/components/ui/dialog';
import { getDocs, collection, updateDoc, doc, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { USER_ROLES, ROLE_LABELS, getRoleColor, getRoleIcon } from '@/lib/roles';
import { Users, Search, Edit3, Shield, Check, X, Eye, Calendar, ShoppingBag, Package } from 'lucide-react';
import RoleProtected from '@/components/auth/RoleProtected';
import { usePopup } from '@/app/context/PopupContext';

interface User {
  id: string;
  name?: string;
  email: string;
  role: string;
  created_at?: {
    toDate: () => Date;
  };
}

interface EventRegistration {
  id: string;
  eventName: string;
  registeredAt: string;
  status: string;
  ticketType?: string;
}

interface Purchase {
  id: string;
  items: Array<{ name: string; quantity: number; price: number; image?: string }>;
  totalAmount: number;
  status: string;
  createdAt: string;
  paymentMethod?: string;
  shippingAddress?: {
    name: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
  };
  pointsRedeemed?: number;
  totalPoints?: number;
}

const UserManagementPage = () => {
  const { showAlert } = usePopup();
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [viewDetailsUser, setViewDetailsUser] = useState<User | null>(null);
  const [userRegistrations, setUserRegistrations] = useState<EventRegistration[]>([]);
  const [userPurchases, setUserPurchases] = useState<Purchase[]>([]);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [detailsTab, setDetailsTab] = useState<'shop' | 'events'>('shop');
  const [newRole, setNewRole] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'users'));
        const userData = querySnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            name: data.name,
            email: data.email,
            role: data.role,
            created_at: data.created_at
          } as User;
        });
        setUsers(userData);
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const handleRoleChange = async () => {
    if (selectedUser && newRole) {
      try {
        const userRef = doc(db, 'users', selectedUser.id);
        await updateDoc(userRef, { role: newRole });
        setUsers(users.map(user => user.id === selectedUser.id ? { ...user, role: newRole } : user));
        setSelectedUser(null);
        await showAlert('User role updated successfully!', 'success');
      } catch (error) {
        console.error('Error updating role:', error);
        await showAlert('Failed to update role. Please check your permissions.', 'error');
      }
    }
  };

  const openDialog = (user: User) => {
    setSelectedUser(user);
    setNewRole(user.role);
  };

  const openDetailsDialog = async (user: User) => {
    setViewDetailsUser(user);
    setLoadingDetails(true);
    setDetailsTab('shop'); // Reset to shop tab when opening

    try {
      // Fetch event registrations
      const registrationsQuery = query(
        collection(db, 'event_registrations'),
        where('userId', '==', user.id)
      );
      const registrationsSnapshot = await getDocs(registrationsQuery);

      const registrations: EventRegistration[] = [];

      for (const docSnap of registrationsSnapshot.docs) {
        const data = docSnap.data();

        // Fetch event details
        let eventName = 'Unknown Event';
        if (data.eventId) {
          try {
            const eventResponse = await fetch(`/api/events/${data.eventId}`);
            if (eventResponse.ok) {
              const eventResult = await eventResponse.json();
              eventName = eventResult.event?.title || 'Unknown Event';
            }
          } catch (error) {
            console.error('Error fetching event details:', error);
          }
        }

        registrations.push({
          id: docSnap.id,
          eventName: eventName,
          registeredAt: data.createdAt?.toDate?.()?.toLocaleDateString() ||
            data.timestamp?.toDate?.()?.toLocaleDateString() || 'N/A',
          status: data.status || 'registered',
          ticketType: data.ticketType
        });
      }

      setUserRegistrations(registrations);

      // Fetch purchases/orders
      const ordersQuery = query(
        collection(db, 'orders'),
        where('userId', '==', user.id)
      );
      const ordersSnapshot = await getDocs(ordersQuery);
      const purchases = ordersSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          items: data.items || [],
          totalAmount: data.totalPrice || data.totalAmount || 0,
          status: data.paymentStatus || data.status || 'completed',
          createdAt: data.createdAt?.toDate?.()?.toLocaleDateString() || 'N/A',
          paymentMethod: data.paymentMethod || 'Razorpay',
          shippingAddress: data.shippingAddress,
          pointsRedeemed: data.pointsRedeemed || 0,
          totalPoints: data.totalPoints || 0
        };
      });
      setUserPurchases(purchases);
    } catch (error) {
      console.error('Error fetching user details:', error);
    } finally {
      setLoadingDetails(false);
    }
  };

  const filteredUsers = users.filter(user =>
    user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <RoleProtected allowedRoles={[USER_ROLES.ADMIN]}>
      <div className="min-h-screen bg-[#FFFDF5] pb-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12 border-b-2 border-black pb-8"
          >
            <div className="flex items-center justify-center mb-4">
              <div className="p-3 bg-[#6C5CE7] rounded-xl border-2 border-black neo-shadow">
                <Users className="w-8 h-8 text-white" />
              </div>
            </div>
            <h1 className="text-5xl font-header font-black text-black mb-2 tracking-tighter uppercase">
              User Management
            </h1>
            <p className="text-lg text-black/60 max-w-2xl mx-auto font-medium">
              Manage user accounts, roles, and permissions across the platform.
            </p>
          </motion.div>

          {/* Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mb-8"
          >
            <div className="relative max-w-md mx-auto lg:mx-0">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-black/40 w-5 h-5" />
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border-2 border-black rounded-xl bg-white text-black placeholder-black/40 focus:outline-none focus:ring-0 neo-shadow transition-all duration-300 font-bold"
              />
            </div>
          </motion.div>

          {/* Users Table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white rounded-xl border-2 border-black overflow-hidden neo-shadow"
          >
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#FFD93D] border-t-black mb-4"></div>
                <span className="text-black font-black uppercase tracking-widest text-xs">Loading users...</span>
              </div>
            ) : (
              <Table>
                <TableHeader className="bg-black text-white">
                  <TableRow className="border-b-2 border-black hover:bg-black">
                    <TableHead className="font-black text-white uppercase tracking-wider py-4">User</TableHead>
                    <TableHead className="font-black text-white uppercase tracking-wider py-4">Email</TableHead>
                    <TableHead className="font-black text-white uppercase tracking-wider py-4">Role</TableHead>
                    <TableHead className="font-black text-white uppercase tracking-wider py-4">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user, index) => (
                    <motion.tr
                      key={user.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className="border-b-2 border-black/5 hover:bg-[#FFFDF5] transition-colors"
                    >
                      <TableCell className="py-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-[#FFD93D] rounded-full border-2 border-black flex items-center justify-center text-black font-black shadow-[2px_2px_0px_rgba(0,0,0,1)]">
                            {user.name?.charAt(0)?.toUpperCase() || '?'}
                          </div>
                          <div>
                            <div className="font-bold text-black">{user.name || 'No Name'}</div>
                            <div className="text-xs text-black/60 font-medium uppercase tracking-wide">
                              Joined {user.created_at ? new Date(user.created_at.toDate()).toLocaleDateString() : 'N/A'}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-black font-medium">{user.email}</TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-black uppercase tracking-wider border-2 border-black shadow-[2px_2px_0px_rgba(0,0,0,0.1)] ${user.role === 'admin' ? 'bg-[#FF7675] text-black' : 'bg-gray-100 text-black/60'
                          }`}>
                          <span className="mr-2">{getRoleIcon(user.role)}</span>
                          {ROLE_LABELS[user.role] || 'Unknown'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <button
                            onClick={() => openDetailsDialog(user)}
                            className="inline-flex items-center px-3 py-2 bg-[#74B9FF] text-black rounded-lg hover:bg-[#5FA3E8] transition-all duration-200 text-xs font-black uppercase tracking-wider border-2 border-black shadow-[2px_2px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
                          >
                            <Eye className="w-3 h-3 mr-2" />
                            View
                          </button>
                          <button
                            onClick={() => openDialog(user)}
                            className="inline-flex items-center px-3 py-2 bg-white text-black rounded-lg hover:bg-black hover:text-white transition-all duration-200 text-xs font-black uppercase tracking-wider border-2 border-black shadow-[2px_2px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
                          >
                            <Edit3 className="w-3 h-3 mr-2" />
                            Edit
                          </button>
                        </div>
                      </TableCell>
                    </motion.tr>
                  ))}
                </TableBody>
              </Table>
            )}

            {!loading && filteredUsers.length === 0 && (
              <div className="text-center py-16 bg-[#FFFDF5]">
                <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-black border-dashed">
                  <Users className="w-8 h-8 text-black/40" />
                </div>
                <p className="text-black font-black uppercase tracking-widest">
                  {searchTerm ? 'No users found matching your search.' : 'No users found.'}
                </p>
              </div>
            )}
          </motion.div>

          {/* Role Edit Dialog */}
          {selectedUser && (
            <Dialog open={true} onOpenChange={() => setSelectedUser(null)}>
              <DialogContent className="sm:max-w-md bg-white border-4 border-black neo-shadow p-0 overflow-hidden">
                <DialogHeader className="p-6 bg-[#FFD93D] border-b-4 border-black">
                  <DialogTitle className="flex items-center space-x-2 text-black font-black text-2xl uppercase tracking-tighter">
                    <Shield className="w-6 h-6" />
                    <span>Edit User Role</span>
                  </DialogTitle>
                </DialogHeader>
                <div className="p-6 space-y-6">
                  <div className="flex items-center space-x-4 p-4 bg-[#FFFDF5] rounded-xl border-2 border-black">
                    <div className="w-12 h-12 bg-[#6C5CE7] rounded-full flex items-center justify-center text-white font-black border-2 border-black neo-shadow">
                      {selectedUser.name?.charAt(0)?.toUpperCase() || '?'}
                    </div>
                    <div>
                      <div className="font-black text-black text-lg">{selectedUser.name || 'No Name'}</div>
                      <div className="text-sm text-black/60 font-bold">{selectedUser.email}</div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-black text-black uppercase tracking-widest mb-3">
                      Select New Role
                    </label>
                    <select
                      value={newRole}
                      onChange={(e) => setNewRole(e.target.value)}
                      className="w-full p-4 border-2 border-black bg-white text-black rounded-xl focus:outline-none neo-shadow font-bold appearance-none cursor-pointer hover:bg-gray-50 transition-colors"
                    >
                      {Object.entries(ROLE_LABELS).map(([value, label]) => (
                        <option key={value} value={value} className="font-bold">
                          {label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <DialogFooter className="p-6 bg-gray-50 border-t-2 border-black flex gap-3">
                  <DialogClose asChild>
                    <button className="flex-1 flex items-center justify-center px-4 py-3 text-black bg-white rounded-xl hover:bg-gray-100 transition-colors border-2 border-black font-black uppercase tracking-wide text-xs">
                      <X className="w-4 h-4 mr-2" />
                      Cancel
                    </button>
                  </DialogClose>
                  <button
                    onClick={handleRoleChange}
                    className="flex-[2] flex items-center justify-center px-4 py-3 bg-[#00B894] text-black rounded-xl hover:bg-[#00A383] transition-colors border-2 border-black neo-shadow active:translate-y-[2px] active:translate-x-[2px] active:shadow-none font-black uppercase tracking-wide text-xs"
                  >
                    <Check className="w-4 h-4 mr-2" />
                    Save Changes
                  </button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}

          {/* User Details Dialog */}
          {viewDetailsUser && (
            <Dialog open={true} onOpenChange={() => setViewDetailsUser(null)}>
              <DialogContent className="sm:max-w-3xl bg-white border-4 border-black neo-shadow p-0 overflow-hidden max-h-[90vh] flex flex-col">
                <DialogHeader className="p-6 bg-[#74B9FF] border-b-4 border-black flex-shrink-0">
                  <DialogTitle className="flex items-center space-x-2 text-black font-black text-2xl uppercase tracking-tighter">
                    <Eye className="w-6 h-6" />
                    <span>User Activity Details</span>
                  </DialogTitle>
                  <div className="flex items-center space-x-4 mt-4 p-4 bg-white rounded-xl border-2 border-black">
                    <div className="w-12 h-12 bg-[#6C5CE7] rounded-full flex items-center justify-center text-white font-black border-2 border-black neo-shadow">
                      {viewDetailsUser.name?.charAt(0)?.toUpperCase() || '?'}
                    </div>
                    <div>
                      <div className="font-black text-black text-lg">{viewDetailsUser.name || 'No Name'}</div>
                      <div className="text-sm text-black/60 font-bold">{viewDetailsUser.email}</div>
                    </div>
                  </div>

                  {/* Toggle Tabs */}
                  <div className="mt-4 flex gap-2">
                    <button
                      onClick={() => setDetailsTab('shop')}
                      className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-black text-sm uppercase tracking-wider border-2 border-black transition-all ${detailsTab === 'shop'
                        ? 'bg-[#FFD93D] text-black shadow-[3px_3px_0px_rgba(0,0,0,1)]'
                        : 'bg-white text-black/60 hover:bg-gray-50'
                        }`}
                    >
                      <ShoppingBag className="w-4 h-4" />
                      Shop ({userPurchases.length})
                    </button>
                    <button
                      onClick={() => setDetailsTab('events')}
                      className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-black text-sm uppercase tracking-wider border-2 border-black transition-all ${detailsTab === 'events'
                        ? 'bg-[#FFD93D] text-black shadow-[3px_3px_0px_rgba(0,0,0,1)]'
                        : 'bg-white text-black/60 hover:bg-gray-50'
                        }`}
                    >
                      <Calendar className="w-4 h-4" />
                      Events ({userRegistrations.length})
                    </button>
                  </div>
                </DialogHeader>

                <div className="p-6 space-y-6 overflow-y-auto flex-1">
                  {loadingDetails ? (
                    <div className="flex flex-col items-center justify-center py-12">
                      <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#FFD93D] border-t-black mb-4"></div>
                      <span className="text-black font-black uppercase tracking-widest text-xs">Loading details...</span>
                    </div>
                  ) : (
                    <>
                      {/* Event Registrations Section */}
                      {detailsTab === 'events' && (
                        <div>
                          <div className="flex items-center space-x-2 mb-4">
                            <div className="p-2 bg-[#FF7675] rounded-lg border-2 border-black">
                              <Calendar className="w-5 h-5 text-black" />
                            </div>
                            <h3 className="text-xl font-black text-black uppercase tracking-tight">
                              Event Registrations ({userRegistrations.length})
                            </h3>
                          </div>

                          {userRegistrations.length > 0 ? (
                            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                              {userRegistrations.map((registration) => (
                                <motion.div
                                  key={registration.id}
                                  initial={{ opacity: 0, y: 10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  className="p-4 bg-[#FFFDF5] rounded-xl border-2 border-black shadow-[2px_2px_0px_rgba(0,0,0,0.1)]"
                                >
                                  <div className="flex justify-between items-start mb-2">
                                    <h4 className="font-bold text-black text-base">{registration.eventName}</h4>
                                    <span className={`px-2 py-1 rounded-lg text-xs font-black uppercase border-2 border-black ${registration.status === 'registered' || registration.status === 'confirmed' ? 'bg-[#00B894] text-black' :
                                      registration.status === 'cancelled' ? 'bg-[#FF7675] text-black' :
                                        'bg-gray-200 text-black'
                                      }`}>
                                      {registration.status}
                                    </span>
                                  </div>
                                  <div className="flex justify-between text-sm">
                                    <span className="text-black/60 font-medium">Registered: {registration.registeredAt}</span>
                                    {registration.ticketType && (
                                      <span className="text-black/60 font-medium">Ticket: {registration.ticketType}</span>
                                    )}
                                  </div>
                                </motion.div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center py-8 bg-[#FFFDF5] rounded-xl border-2 border-black border-dashed">
                              <Calendar className="w-12 h-12 text-black/20 mx-auto mb-2" />
                              <p className="text-black/60 font-bold text-sm">No event registrations found</p>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Purchases Section */}
                      {detailsTab === 'shop' && (
                        <div>
                          <div className="flex items-center space-x-2 mb-4">
                            <div className="p-2 bg-[#FFD93D] rounded-lg border-2 border-black">
                              <ShoppingBag className="w-5 h-5 text-black" />
                            </div>
                            <h3 className="text-xl font-black text-black uppercase tracking-tight">
                              Shop Purchases ({userPurchases.length})
                            </h3>
                          </div>

                          {userPurchases.length > 0 ? (
                            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                              {userPurchases.map((purchase) => (
                                <motion.div
                                  key={purchase.id}
                                  initial={{ opacity: 0, y: 10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  className="p-5 bg-[#FFFDF5] rounded-xl border-2 border-black shadow-[3px_3px_0px_rgba(0,0,0,0.1)]"
                                >
                                  {/* Header */}
                                  <div className="flex justify-between items-start mb-4 pb-3 border-b-2 border-black/10">
                                    <div>
                                      <div className="flex items-center space-x-2 mb-1">
                                        <Package className="w-4 h-4 text-black/60" />
                                        <span className="font-black text-black text-base">Order #{purchase.id.slice(-8).toUpperCase()}</span>
                                      </div>
                                      <span className="text-xs text-black/50 font-medium">{purchase.createdAt}</span>
                                    </div>
                                    <span className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase border-2 border-black shadow-[2px_2px_0px_rgba(0,0,0,1)] ${purchase.status === 'completed' || purchase.status === 'delivered' ? 'bg-[#00B894] text-black' :
                                      purchase.status === 'cancelled' ? 'bg-[#FF7675] text-black' :
                                        'bg-[#FFD93D] text-black'
                                      }`}>
                                      {purchase.status}
                                    </span>
                                  </div>

                                  {/* Items List */}
                                  <div className="mb-4">
                                    <h4 className="text-xs font-black text-black/70 uppercase tracking-wider mb-2">Items Ordered</h4>
                                    <div className="space-y-2">
                                      {purchase.items.map((item, idx) => (
                                        <div key={idx} className="flex justify-between items-center p-2 bg-white rounded-lg border border-black/10">
                                          <div className="flex-1">
                                            <div className="font-bold text-black text-sm">{item.name}</div>
                                            <div className="text-xs text-black/50 font-medium">Qty: {item.quantity} × ₹{item.price}</div>
                                          </div>
                                          <div className="font-black text-black">₹{(item.quantity * item.price).toFixed(2)}</div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>

                                  {/* Payment Details */}
                                  <div className="mb-4 p-3 bg-white rounded-lg border border-black/10">
                                    <h4 className="text-xs font-black text-black/70 uppercase tracking-wider mb-2">Payment Details</h4>
                                    <div className="space-y-1.5">
                                      <div className="flex justify-between text-sm">
                                        <span className="text-black/60 font-medium">Subtotal</span>
                                        <span className="font-bold text-black">₹{purchase.totalAmount}</span>
                                      </div>
                                      {(purchase.pointsRedeemed ?? 0) > 0 && (
                                        <div className="flex justify-between text-sm">
                                          <span className="text-black/60 font-medium">Points Redeemed</span>
                                          <span className="font-bold text-[#FF7675]">-₹{purchase.pointsRedeemed}</span>
                                        </div>
                                      )}
                                      {(purchase.totalPoints ?? 0) > 0 && (
                                        <div className="flex justify-between text-sm">
                                          <span className="text-black/60 font-medium">Points Earned</span>
                                          <span className="font-bold text-[#00B894]">+{purchase.totalPoints} pts</span>
                                        </div>
                                      )}
                                      <div className="flex justify-between text-sm pt-2 border-t border-black/10">
                                        <span className="text-black/60 font-medium">Payment Method</span>
                                        <span className="font-bold text-black">{purchase.paymentMethod}</span>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Shipping Address */}
                                  {purchase.shippingAddress && (
                                    <div className="p-3 bg-white rounded-lg border border-black/10">
                                      <h4 className="text-xs font-black text-black/70 uppercase tracking-wider mb-2">Shipping Address</h4>
                                      <div className="text-sm space-y-0.5">
                                        <div className="font-bold text-black">{purchase.shippingAddress.name}</div>
                                        <div className="text-black/60 font-medium">{purchase.shippingAddress.phone}</div>
                                        <div className="text-black/60 font-medium">{purchase.shippingAddress.address}</div>
                                        <div className="text-black/60 font-medium">
                                          {purchase.shippingAddress.city}, {purchase.shippingAddress.state} - {purchase.shippingAddress.pincode}
                                        </div>
                                      </div>
                                    </div>
                                  )}

                                  {/* Total */}
                                  <div className="flex justify-between items-center pt-4 mt-4 border-t-2 border-black/20">
                                    <span className="text-black/70 font-bold text-sm uppercase tracking-wider">Order Total</span>
                                    <span className="font-black text-black text-2xl">₹{purchase.totalAmount}</span>
                                  </div>
                                </motion.div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center py-8 bg-[#FFFDF5] rounded-xl border-2 border-black border-dashed">
                              <ShoppingBag className="w-12 h-12 text-black/20 mx-auto mb-2" />
                              <p className="text-black/60 font-bold text-sm">No purchases found</p>
                            </div>
                          )}
                        </div>
                      )}
                    </>
                  )}
                </div>

                <DialogFooter className="p-4 bg-gray-50 border-t-2 border-black flex-shrink-0">
                  <DialogClose asChild>
                    <button className="w-full flex items-center justify-center px-4 py-3 text-black bg-white rounded-xl hover:bg-gray-100 transition-colors border-2 border-black font-black uppercase tracking-wide text-sm shadow-[2px_2px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none">
                      <X className="w-4 h-4 mr-2" />
                      Close
                    </button>
                  </DialogClose>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>

        <style jsx global>{`
          .custom-scrollbar::-webkit-scrollbar {
            width: 8px;
          }
          
          .custom-scrollbar::-webkit-scrollbar-track {
            background: #f1f1f1;
            border-radius: 10px;
            border: 2px solid black;
          }
          
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: #FFD93D;
            border-radius: 10px;
            border: 2px solid black;
          }
          
          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: #FFC107;
          }
        `}</style>
      </div>
    </RoleProtected>
  );
};

export default UserManagementPage;

