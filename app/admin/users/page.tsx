'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
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
import { getDocs, collection, updateDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { USER_ROLES, ROLE_LABELS, getRoleColor, getRoleIcon } from '@/lib/roles';
import { Users, Search, Edit3, Shield, Check, X } from 'lucide-react';
import RoleProtected from '@/components/auth/RoleProtected';

interface User {
  id: string;
  name?: string;
  email: string;
  role: string;
  created_at?: {
    toDate: () => Date;
  };
}

const UserManagementPage = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
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
      } catch (error) {
        console.error('Error updating role:', error);
      }
    }
  };

  const openDialog = (user: User) => {
    setSelectedUser(user);
    setNewRole(user.role);
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
                        <span className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-black uppercase tracking-wider border-2 border-black shadow-[2px_2px_0px_rgba(0,0,0,0.1)] ${user.role === 'admin' ? 'bg-[#FF7675] text-black' :
                            user.role === 'manager' ? 'bg-[#00B894] text-black' : 'bg-gray-100 text-black/60'
                          }`}>
                          <span className="mr-2">{getRoleIcon(user.role)}</span>
                          {ROLE_LABELS[user.role] || 'Unknown'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <button
                          onClick={() => openDialog(user)}
                          className="inline-flex items-center px-4 py-2 bg-white text-black rounded-lg hover:bg-black hover:text-white transition-all duration-200 text-xs font-black uppercase tracking-wider border-2 border-black shadow-[2px_2px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
                        >
                          <Edit3 className="w-3 h-3 mr-2" />
                          Edit Role
                        </button>
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
        </div>
      </div>
    </RoleProtected>
  );
};

export default UserManagementPage;

