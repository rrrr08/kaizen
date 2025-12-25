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
      <div className="min-h-screen bg-gradient-to-br from-black to-slate-900 pt-24 pb-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-8 border-b border-amber-500/10 pb-12"
          >
            <div className="flex items-center justify-center mb-4">
              <div className="p-3 bg-gradient-to-r from-emerald-600 to-emerald-700 rounded-lg">
                <Users className="w-8 h-8 text-white" />
              </div>
            </div>
            <h1 className="text-5xl font-header font-bold text-amber-500 mb-4 tracking-tight">
              USER MANAGEMENT
            </h1>
            <p className="text-lg text-white/60 max-w-2xl mx-auto font-header">
              Manage user accounts, roles, and permissions across the platform.
            </p>
          </motion.div>

          {/* Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mb-6"
          >
            <div className="relative max-w-md mx-auto lg:mx-0">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40 w-5 h-5" />
              <input
                type="text"
                placeholder="Search users by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-amber-500/20 rounded-lg bg-slate-800/40 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-300 backdrop-blur-sm"
              />
            </div>
          </motion.div>

          {/* Users Table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-slate-800/40 rounded-lg border border-amber-500/20 overflow-hidden backdrop-blur-sm"
          >
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
                <span className="ml-3 text-amber-500/60">Loading users...</span>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-amber-500/10">
                    <TableHead className="font-semibold text-amber-500">User</TableHead>
                    <TableHead className="font-semibold text-amber-500">Email</TableHead>
                    <TableHead className="font-semibold text-amber-500">Role</TableHead>
                    <TableHead className="font-semibold text-amber-500">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user, index) => (
                    <motion.tr
                      key={user.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className="hover:bg-slate-700/30 transition-colors border-b border-amber-500/5"
                    >
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-r from-amber-500 to-amber-600 rounded-full flex items-center justify-center text-black font-medium">
                            {user.name?.charAt(0)?.toUpperCase() || '?'}
                          </div>
                          <div>
                            <div className="font-medium text-white">{user.name || 'No Name'}</div>
                            <div className="text-sm text-white/60">
                              {user.created_at ? new Date(user.created_at.toDate()).toLocaleDateString() : 'Unknown date'}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-white/80">{user.email}</TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                          <span className="mr-1">{getRoleIcon(user.role)}</span>
                          {ROLE_LABELS[user.role] || 'Unknown'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <button
                          onClick={() => openDialog(user)}
                          className="inline-flex items-center px-3 py-2 bg-amber-500/20 text-amber-400 rounded-lg hover:bg-amber-500/30 transition-colors duration-200 text-sm font-medium border border-amber-500/30"
                        >
                          <Edit3 className="w-4 h-4 mr-1" />
                          Edit Role
                        </button>
                      </TableCell>
                    </motion.tr>
                  ))}
                </TableBody>
              </Table>
            )}

            {!loading && filteredUsers.length === 0 && (
              <div className="text-center py-12">
                <Users className="w-12 h-12 text-white/20 mx-auto mb-4" />
                <p className="text-white/60">
                  {searchTerm ? 'No users found matching your search.' : 'No users found.'}
                </p>
              </div>
            )}
          </motion.div>

          {/* Role Edit Dialog */}
          {selectedUser && (
            <Dialog open={true} onOpenChange={() => setSelectedUser(null)}>
              <DialogContent className="sm:max-w-md bg-slate-800 border border-amber-500/20">
                <DialogHeader>
                  <DialogTitle className="flex items-center space-x-2 text-white">
                    <Shield className="w-5 h-5 text-amber-500" />
                    <span>Edit User Role</span>
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3 p-4 bg-slate-700/50 rounded-lg border border-amber-500/10">
                    <div className="w-12 h-12 bg-gradient-to-r from-amber-500 to-amber-600 rounded-full flex items-center justify-center text-black font-medium">
                      {selectedUser.name?.charAt(0)?.toUpperCase() || '?'}
                    </div>
                    <div>
                      <div className="font-medium text-white">{selectedUser.name || 'No Name'}</div>
                      <div className="text-sm text-white/60">{selectedUser.email}</div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-amber-500 mb-2">
                      Select New Role
                    </label>
                    <select
                      value={newRole}
                      onChange={(e) => setNewRole(e.target.value)}
                      className="w-full p-3 border border-amber-500/20 bg-slate-700/50 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    >
                      {Object.entries(ROLE_LABELS).map(([value, label]) => (
                        <option key={value} value={value}>
                          {getRoleIcon(value)} {label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <DialogFooter className="flex space-x-2">
                  <DialogClose asChild>
                    <button className="flex items-center px-4 py-2 text-white/60 bg-slate-700/50 rounded-lg hover:bg-slate-700 transition-colors border border-white/10">
                      <X className="w-4 h-4 mr-1" />
                      Cancel
                    </button>
                  </DialogClose>
                  <button
                    onClick={handleRoleChange}
                    className="flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                  >
                    <Check className="w-4 h-4 mr-1" />
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

