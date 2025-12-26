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
      <div className="min-h-screen text-white">
        {/* Header */}
        <div className="mb-12 border-b-2 border-[#333] pb-8 flex justify-between items-end">
          <div>
            <h1 className="font-arcade text-5xl text-white mb-2 text-3d-orange">USER_DATABASE</h1>
            <p className="text-gray-500 font-sans text-lg tracking-wide uppercase">Manage platform access and permissions</p>
          </div>
          <div className="bg-[#111] border border-[#333] px-4 py-2 rounded text-xs font-mono text-gray-400">
            TOTAL_ENTITIES: <span className="text-[#00B894]">{users.length}</span>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-8 max-w-md relative group">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-500 group-focus-within:text-[#FFD400] transition-colors" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-3 border-2 border-[#333] rounded-[4px] leading-5 bg-[#080808] text-white placeholder-gray-600 focus:outline-none focus:border-[#FFD400] focus:ring-1 focus:ring-[#FFD400] sm:text-sm font-mono tracking-wider transition-all"
            placeholder="SEARCH_USERS..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Users Table */}
        <div className="bg-[#080808] border-2 border-[#333] rounded-[4px] overflow-hidden shadow-[0_0_20px_rgba(0,0,0,0.5)]">
          {loading ? (
            <div className="p-12 text-center">
              <div className="text-[#FFD400] font-arcade tracking-[0.3em] animate-pulse text-xl">
                SCANNING_USER_DATA...
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-[#111] border-b-2 border-[#333]">
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="font-arcade text-[#FFD400] text-xs tracking-widest uppercase py-4">Entity</TableHead>
                    <TableHead className="font-arcade text-gray-400 text-xs tracking-widest uppercase py-4">Contact_Link</TableHead>
                    <TableHead className="font-arcade text-gray-400 text-xs tracking-widest uppercase py-4">Clearance_Level</TableHead>
                    <TableHead className="font-arcade text-gray-400 text-xs tracking-widest uppercase py-4">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="bg-[#050505]">
                  {filteredUsers.map((user) => (
                    <TableRow
                      key={user.id}
                      className="border-b border-[#222] hover:bg-[#111] transition-colors group"
                    >
                      <TableCell className="py-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-[#222] border border-[#333] group-hover:border-[#FFD400]/50 rounded-sm flex items-center justify-center text-[#FFD400] font-mono font-bold">
                            {user.name?.charAt(0)?.toUpperCase() || '?'}
                          </div>
                          <div>
                            <div className="font-mono text-white font-bold group-hover:text-[#FFD400] transition-colors">{user.name || 'UNKNOWN_ENTITY'}</div>
                            <div className="text-xs text-gray-600 font-mono mt-0.5">
                              JOINED: {user.created_at ? new Date(user.created_at.toDate()).toLocaleDateString() : 'N/A'}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-gray-400 font-mono text-sm group-hover:text-white transition-colors">{user.email}</TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center px-3 py-1 rounded-[2px] border text-xs font-mono font-bold tracking-wide uppercase ${user.role === 'admin'
                            ? 'bg-red-900/20 border-red-500 text-red-500'
                            : 'bg-blue-900/20 border-blue-500 text-blue-500'
                          }`}>
                          {user.role === 'admin' && <Shield className="w-3 h-3 mr-2" />}
                          {ROLE_LABELS[user.role] || user.role || 'MEMBER'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <button
                          onClick={() => openDialog(user)}
                          className="px-3 py-1.5 border border-[#333] hover:border-[#FFD400] text-gray-400 hover:text-[#FFD400] hover:bg-[#FFD400]/10 transition-all text-xs font-mono uppercase tracking-wider flex items-center gap-2"
                        >
                          <Edit3 className="w-3 h-3" />
                          MODIFY
                        </button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {!loading && filteredUsers.length === 0 && (
            <div className="text-center py-16 text-gray-600 font-mono">
              <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>NO_MATCHING_ENTITIES_FOUND</p>
            </div>
          )}
        </div>

        {/* Role Edit Dialog */}
        {selectedUser && (
          <Dialog open={true} onOpenChange={() => setSelectedUser(null)}>
            <DialogContent className="sm:max-w-md bg-[#080808] border-2 border-[#FFD400] shadow-[0_0_50px_rgba(255,212,0,0.2)] p-0 gap-0 overflow-hidden">
              <DialogHeader className="p-6 bg-[#111] border-b border-[#333]">
                <DialogTitle className="flex items-center space-x-2 text-white font-arcade text-xl tracking-wider">
                  <Shield className="w-5 h-5 text-[#FFD400]" />
                  <span>MODIFY_CLEARANCE</span>
                </DialogTitle>
              </DialogHeader>

              <div className="p-6 space-y-6">
                <div className="flex items-center space-x-4 p-4 bg-[#050505] border border-[#333] rounded-[2px]">
                  <div className="w-12 h-12 bg-[#222] border border-[#333] flex items-center justify-center text-[#FFD400] font-mono font-bold text-xl">
                    {selectedUser.name?.charAt(0)?.toUpperCase() || '?'}
                  </div>
                  <div>
                    <div className="font-mono text-white font-bold">{selectedUser.name || 'UNKNOWN'}</div>
                    <div className="text-xs text-gray-500 font-mono">{selectedUser.email}</div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono text-[#FFD400] mb-2 uppercase tracking-widest">
                    Select New Clearance Level
                  </label>
                  <select
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value)}
                    className="w-full p-3 border-2 border-[#333] bg-[#050505] text-white font-mono focus:outline-none focus:border-[#FFD400] transition-colors cursor-pointer hover:border-gray-600"
                  >
                    <option value="">SELECT_ROLE</option>
                    {Object.entries(ROLE_LABELS).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <DialogFooter className="p-6 bg-[#111] border-t border-[#333] flex gap-3">
                <DialogClose asChild>
                  <button className="px-5 py-2.5 border border-[#333] text-gray-400 hover:text-white hover:bg-[#222] transition-colors font-mono text-xs font-bold uppercase tracking-wider">
                    CANCEL
                  </button>
                </DialogClose>
                <button
                  onClick={handleRoleChange}
                  className="px-5 py-2.5 bg-[#FFD400] text-black hover:bg-[#FFE066] transition-colors font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  CONFIRM_CHANGES
                </button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </RoleProtected>
  );
};

export default UserManagementPage;

