"use client";

import React, { useState, useEffect } from 'react';
import { Users, Shield, ShieldCheck, Crown, Search, Mail, User, Calendar, Settings, Edit, X, Save, Ban, Trash2, RotateCcw, AlertTriangle } from 'lucide-react';
import { AdminService, AdminUser, DEFAULT_ADMIN_EMAILS } from '@/lib/admin-service';

interface MembersSectionProps {
  adminUser: AdminUser | null;
  addToast: (toast: { type: 'success' | 'error' | 'info'; message: string }) => void;
}

export default function MembersSection({ adminUser, addToast }: MembersSectionProps) {
  const [members, setMembers] = useState<any[]>([]);
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTab, setSelectedTab] = useState<'members' | 'admins'>('members');
  const [processingUserId, setProcessingUserId] = useState<string | null>(null);
  const [editingMember, setEditingMember] = useState<any | null>(null);
  const [editForm, setEditForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    kingschat_id: '',
    designation: '',
    administration: '',
    zone: ''
  });

  // Load members and admins
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [membersData, adminsData] = await Promise.all([
          AdminService.getAllMembers(),
          AdminService.getAllAdmins()
        ]);
        setMembers(membersData);
        setAdmins(adminsData);
      } catch (error) {
        console.error('Error loading members/admins:', error);
        addToast({
          type: 'error',
          message: 'Failed to load members and admins'
        });
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []); // Remove addToast from dependencies to prevent constant reloading

  // Filter members based on search term
  const filteredMembers = members.filter(member => {
    const searchLower = searchTerm.toLowerCase();
    return (
      member.first_name?.toLowerCase().includes(searchLower) ||
      member.last_name?.toLowerCase().includes(searchLower) ||
      member.email?.toLowerCase().includes(searchLower) ||
      member.kingschat_id?.toLowerCase().includes(searchLower)
    );
  });

  // Filter admins based on search term
  const filteredAdmins = admins.filter(admin => {
    const searchLower = searchTerm.toLowerCase();
    return (
      admin.first_name?.toLowerCase().includes(searchLower) ||
      admin.last_name?.toLowerCase().includes(searchLower) ||
      admin.email?.toLowerCase().includes(searchLower)
    );
  });

  // Make user admin
  const handleMakeAdmin = async (member: any) => {
    if (!adminUser) return;

    setProcessingUserId(member.id);
    try {
      const result = await AdminService.makeUserAdmin(member.id, member.email, 'admin');
      if (result.success) {
        addToast({
          type: 'success',
          message: `${member.first_name} ${member.last_name} is now an admin`
        });
        
        // Refresh data
        const [membersData, adminsData] = await Promise.all([
          AdminService.getAllMembers(),
          AdminService.getAllAdmins()
        ]);
        setMembers(membersData);
        setAdmins(adminsData);
      } else {
        addToast({
          type: 'error',
          message: result.error || 'Failed to make user admin'
        });
      }
    } catch (error) {
      console.error('Error making user admin:', error);
      addToast({
        type: 'error',
        message: 'Failed to make user admin'
      });
    } finally {
      setProcessingUserId(null);
    }
  };

  // Remove admin privileges
  const handleRemoveAdmin = async (admin: AdminUser) => {
    if (!adminUser) return;

    // Don't allow removing default admins
    if (DEFAULT_ADMIN_EMAILS.includes(admin.email)) {
      addToast({
        type: 'error',
        message: 'Cannot remove default admin privileges'
      });
      return;
    }

    setProcessingUserId(admin.id);
    try {
      const result = await AdminService.removeUserAdmin(admin.email);
      if (result.success) {
        addToast({
          type: 'success',
          message: `Removed admin privileges from ${admin.first_name} ${admin.last_name}`
        });
        
        // Refresh data
        const [membersData, adminsData] = await Promise.all([
          AdminService.getAllMembers(),
          AdminService.getAllAdmins()
        ]);
        setMembers(membersData);
        setAdmins(adminsData);
      } else {
        addToast({
          type: 'error',
          message: result.error || 'Failed to remove admin privileges'
        });
      }
    } catch (error) {
      console.error('Error removing admin privileges:', error);
      addToast({
        type: 'error',
        message: 'Failed to remove admin privileges'
      });
    } finally {
      setProcessingUserId(null);
    }
  };

  // Check if user is already an admin
  const isUserAdmin = (email: string) => {
    return admins.some(admin => admin.email === email && admin.isAdmin);
  };

  // Get user display name
  const getUserDisplayName = (user: any) => {
    if (user.first_name && user.last_name) {
      return `${user.first_name} ${user.last_name}`;
    }
    return user.email || 'Unknown User';
  };

  // Start editing member
  const handleEditMember = (member: any) => {
    setEditingMember(member);
    setEditForm({
      first_name: member.first_name || '',
      last_name: member.last_name || '',
      email: member.email || '',
      kingschat_id: member.kingschat_id || '',
      designation: member.designation || '',
      administration: member.administration || '',
      zone: member.zone || ''
    });
  };

  // Cancel editing
  const handleCancelEdit = () => {
    setEditingMember(null);
    setEditForm({
      first_name: '',
      last_name: '',
      email: '',
      kingschat_id: '',
      designation: '',
      administration: '',
      zone: ''
    });
  };

  // Save member changes
  const handleSaveMember = async () => {
    if (!editingMember) return;

    setProcessingUserId(editingMember.id);
    try {
      const result = await AdminService.updateMemberProfile(editingMember.id, editForm);
      if (result.success) {
        addToast({
          type: 'success',
          message: 'Member profile updated successfully'
        });
        
        // Refresh members data
        const membersData = await AdminService.getAllMembers();
        setMembers(membersData);
        handleCancelEdit();
      } else {
        addToast({
          type: 'error',
          message: result.error || 'Failed to update member profile'
        });
      }
    } catch (error) {
      console.error('Error updating member:', error);
      addToast({
        type: 'error',
        message: 'Failed to update member profile'
      });
    } finally {
      setProcessingUserId(null);
    }
  };

  // Block user
  const handleBlockUser = async (member: any) => {
    if (!adminUser) return;

    setProcessingUserId(member.id);
    try {
      const result = await AdminService.blockUser(member.id, member.email);
      if (result.success) {
        addToast({
          type: 'success',
          message: `${getUserDisplayName(member)} has been blocked`
        });
        
        // Refresh members data
        const membersData = await AdminService.getAllMembers();
        setMembers(membersData);
      } else {
        addToast({
          type: 'error',
          message: result.error || 'Failed to block user'
        });
      }
    } catch (error) {
      console.error('Error blocking user:', error);
      addToast({
        type: 'error',
        message: 'Failed to block user'
      });
    } finally {
      setProcessingUserId(null);
    }
  };

  // Unblock user
  const handleUnblockUser = async (member: any) => {
    if (!adminUser) return;

    setProcessingUserId(member.id);
    try {
      const result = await AdminService.unblockUser(member.id);
      if (result.success) {
        addToast({
          type: 'success',
          message: `${getUserDisplayName(member)} has been unblocked`
        });
        
        // Refresh members data
        const membersData = await AdminService.getAllMembers();
        setMembers(membersData);
      } else {
        addToast({
          type: 'error',
          message: result.error || 'Failed to unblock user'
        });
      }
    } catch (error) {
      console.error('Error unblocking user:', error);
      addToast({
        type: 'error',
        message: 'Failed to unblock user'
      });
    } finally {
      setProcessingUserId(null);
    }
  };

  // Delete user
  const handleDeleteUser = async (member: any) => {
    if (!adminUser) return;

    // Confirm deletion
    if (!confirm(`Are you sure you want to delete ${getUserDisplayName(member)}? This action cannot be undone.`)) {
      return;
    }

    setProcessingUserId(member.id);
    try {
      const result = await AdminService.deleteUser(member.id, member.email);
      if (result.success) {
        addToast({
          type: 'success',
          message: `${getUserDisplayName(member)} has been deleted`
        });
        
        // Refresh members data
        const membersData = await AdminService.getAllMembers();
        setMembers(membersData);
      } else {
        addToast({
          type: 'error',
          message: result.error || 'Failed to delete user'
        });
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      addToast({
        type: 'error',
        message: 'Failed to delete user'
      });
    } finally {
      setProcessingUserId(null);
    }
  };

  // Restore user
  const handleRestoreUser = async (member: any) => {
    if (!adminUser) return;

    setProcessingUserId(member.id);
    try {
      const result = await AdminService.restoreUser(member.id);
      if (result.success) {
        addToast({
          type: 'success',
          message: `${getUserDisplayName(member)} has been restored`
        });
        
        // Refresh members data
        const membersData = await AdminService.getAllMembers();
        setMembers(membersData);
      } else {
        addToast({
          type: 'error',
          message: result.error || 'Failed to restore user'
        });
      }
    } catch (error) {
      console.error('Error restoring user:', error);
      addToast({
        type: 'error',
        message: 'Failed to restore user'
      });
    } finally {
      setProcessingUserId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading members...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-white">
      {/* Header */}
      <div className="flex-shrink-0 border-b border-gray-200 bg-white px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Members & Admins</h1>
            <p className="text-gray-600 text-sm mt-1">
              Manage user accounts and admin privileges
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex mt-4 border-b border-gray-200">
          <button
            onClick={() => setSelectedTab('members')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              selectedTab === 'members'
                ? 'border-purple-500 text-purple-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              All Members ({filteredMembers.length})
            </div>
          </button>
          <button
            onClick={() => setSelectedTab('admins')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              selectedTab === 'admins'
                ? 'border-purple-500 text-purple-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Admins ({filteredAdmins.length})
            </div>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        {selectedTab === 'members' && (
          <div className="space-y-4">
            {filteredMembers.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-500 mb-2">No members found</h3>
                <p className="text-gray-400">
                  {searchTerm ? 'Try adjusting your search terms' : 'No members have registered yet'}
                </p>
              </div>
            ) : (
              <div className="grid gap-4">
                {filteredMembers.map((member) => (
                  <div
                    key={member.id}
                    className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                          {(member.first_name?.[0] || member.email?.[0] || '?').toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-gray-900">
                              {getUserDisplayName(member)}
                            </h3>
                            {member.is_blocked && (
                              <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-full">
                                Blocked
                              </span>
                            )}
                            {member.is_deleted && (
                              <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full">
                                Deleted
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                            <div className="flex items-center gap-1">
                              <Mail className="w-4 h-4" />
                              {member.email}
                            </div>
                            {member.kingschat_id && (
                              <div className="flex items-center gap-1">
                                <User className="w-4 h-4" />
                                KC: {member.kingschat_id}
                              </div>
                            )}
                          </div>
                          {member.created_at && (
                            <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                              <Calendar className="w-3 h-3" />
                              Joined {new Date(member.created_at).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        {/* Edit Button */}
                        <button
                          onClick={() => handleEditMember(member)}
                          disabled={member.is_deleted}
                          className="flex items-center gap-2 px-3 py-1 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Edit className="w-4 h-4" />
                          Edit
                        </button>

                        {/* Admin Status */}
                        {isUserAdmin(member.email) && (
                          <div className="flex items-center gap-2 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                            <ShieldCheck className="w-4 h-4" />
                            Admin
                          </div>
                        )}

                        {/* Block/Unblock Actions */}
                        {!DEFAULT_ADMIN_EMAILS.includes(member.email) && !member.is_deleted && (
                          <>
                            {member.is_blocked ? (
                              <button
                                onClick={() => handleUnblockUser(member)}
                                disabled={processingUserId === member.id}
                                className="flex items-center gap-2 px-3 py-1 bg-green-100 hover:bg-green-200 text-green-700 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                              >
                                <RotateCcw className="w-4 h-4" />
                                {processingUserId === member.id ? 'Processing...' : 'Unblock'}
                              </button>
                            ) : (
                              <button
                                onClick={() => handleBlockUser(member)}
                                disabled={processingUserId === member.id}
                                className="flex items-center gap-2 px-3 py-1 bg-orange-100 hover:bg-orange-200 text-orange-700 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                              >
                                <Ban className="w-4 h-4" />
                                {processingUserId === member.id ? 'Processing...' : 'Block'}
                              </button>
                            )}
                          </>
                        )}

                        {/* Delete/Restore Actions */}
                        {!DEFAULT_ADMIN_EMAILS.includes(member.email) && (
                          <>
                            {member.is_deleted ? (
                              <button
                                onClick={() => handleRestoreUser(member)}
                                disabled={processingUserId === member.id}
                                className="flex items-center gap-2 px-3 py-1 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                              >
                                <RotateCcw className="w-4 h-4" />
                                {processingUserId === member.id ? 'Processing...' : 'Restore'}
                              </button>
                            ) : (
                              <button
                                onClick={() => handleDeleteUser(member)}
                                disabled={processingUserId === member.id}
                                className="flex items-center gap-2 px-3 py-1 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                              >
                                <Trash2 className="w-4 h-4" />
                                {processingUserId === member.id ? 'Processing...' : 'Delete'}
                              </button>
                            )}
                          </>
                        )}

                        {/* Default Admin Protection */}
                        {DEFAULT_ADMIN_EMAILS.includes(member.email) && (
                          <div className="flex items-center gap-2 px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-medium">
                            <Crown className="w-4 h-4" />
                            Protected
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {selectedTab === 'admins' && (
          <div className="space-y-4">
            {filteredAdmins.length === 0 ? (
              <div className="text-center py-12">
                <Shield className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-500 mb-2">No admins found</h3>
                <p className="text-gray-400">No admin users match your search</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {filteredAdmins.map((admin) => (
                  <div
                    key={admin.id}
                    className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                          {(admin.first_name?.[0] || admin.email?.[0] || '?').toUpperCase()}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            {getUserDisplayName(admin)}
                          </h3>
                          <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                            <div className="flex items-center gap-1">
                              <Mail className="w-4 h-4" />
                              {admin.email}
                            </div>
                            <div className="flex items-center gap-1">
                              {admin.adminRole === 'super_admin' ? (
                                <>
                                  <Crown className="w-4 h-4 text-yellow-500" />
                                  <span className="text-yellow-600 font-medium">Super Admin</span>
                                </>
                              ) : (
                                <>
                                  <Shield className="w-4 h-4 text-purple-500" />
                                  <span className="text-purple-600 font-medium">Admin</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {DEFAULT_ADMIN_EMAILS.includes(admin.email) ? (
                          <div className="flex items-center gap-2 px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-medium">
                            <Crown className="w-4 h-4" />
                            Default Admin - Protected
                          </div>
                        ) : (
                          <button
                            onClick={() => handleRemoveAdmin(admin)}
                            disabled={processingUserId === admin.id}
                            className="flex items-center gap-2 px-3 py-1 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                          >
                            <AlertTriangle className="w-4 h-4" />
                            {processingUserId === admin.id ? 'Processing...' : 'Remove Admin'}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Edit Member Modal */}
      {editingMember && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Edit Member Profile</h2>
              <button
                onClick={handleCancelEdit}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Form */}
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    First Name
                  </label>
                  <input
                    type="text"
                    value={editForm.first_name}
                    onChange={(e) => setEditForm(prev => ({ ...prev, first_name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={editForm.last_name}
                    onChange={(e) => setEditForm(prev => ({ ...prev, last_name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  KingsChat ID
                </label>
                <input
                  type="text"
                  value={editForm.kingschat_id}
                  onChange={(e) => setEditForm(prev => ({ ...prev, kingschat_id: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Designation
                  </label>
                  <select
                    value={editForm.designation}
                    onChange={(e) => setEditForm(prev => ({ ...prev, designation: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="">Select Designation</option>
                    <option value="Soprano">Soprano</option>
                    <option value="Alto">Alto</option>
                    <option value="Tenor">Tenor</option>
                    <option value="Bass">Bass</option>
                    <option value="Instrumentalist">Instrumentalist</option>
                    <option value="Backup Singer">Backup Singer</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Administration
                  </label>
                  <select
                    value={editForm.administration}
                    onChange={(e) => setEditForm(prev => ({ ...prev, administration: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="">Select Administration</option>
                    <option value="Coordinator">Coordinator</option>
                    <option value="Assistant Coordinator">Assistant Coordinator</option>
                    <option value="Secretary">Secretary</option>
                    <option value="Treasurer">Treasurer</option>
                    <option value="Member">Member</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Zone
                </label>
                <input
                  type="text"
                  value={editForm.zone}
                  onChange={(e) => setEditForm(prev => ({ ...prev, zone: e.target.value }))}
                  placeholder="e.g., Zone 1, Zone A, etc."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
              <button
                onClick={handleCancelEdit}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveMember}
                disabled={processingUserId === editingMember?.id}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
              >
                {processingUserId === editingMember?.id ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
