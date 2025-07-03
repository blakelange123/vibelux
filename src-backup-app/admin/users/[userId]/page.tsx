'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@clerk/nextjs';
import {
  User,
  Mail,
  Phone,
  Building,
  Calendar,
  CreditCard,
  Shield,
  Activity,
  Save,
  ArrowLeft,
  Edit3,
  Ban,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  DollarSign,
  Package,
  Settings,
  Eye,
  Key,
  RefreshCw,
  Send,
  Trash2,
  UserCheck,
  UserX
} from 'lucide-react';
import Link from 'next/link';

interface UserDetails {
  id: string;
  clerkId: string;
  email: string;
  firstName?: string;
  lastName?: string;
  imageUrl?: string;
  phoneNumber?: string;
  company?: string;
  role: 'user' | 'admin' | 'enterprise';
  subscriptionTier: 'free' | 'professional' | 'enterprise';
  subscriptionStatus: 'active' | 'canceled' | 'past_due';
  metadata?: {
    bio?: string;
    location?: string;
    timezone?: string;
    preferences?: any;
  };
  createdAt: string;
  lastSignInAt?: string;
  banned: boolean;
  verified: boolean;
}

export default function AdminUserDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { userId: adminId } = useAuth();
  
  const [user, setUser] = useState<UserDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState<Partial<UserDetails>>({});
  const [activities, setActivities] = useState<any[]>([]);
  const [showBanModal, setShowBanModal] = useState(false);
  const [banReason, setBanReason] = useState('');

  useEffect(() => {
    fetchUserDetails();
    fetchUserActivities();
  }, [params.userId]);

  async function fetchUserDetails() {
    try {
      const response = await fetch(`/api/admin/users/${params.userId}`);
      const data = await response.json();
      setUser(data.user);
      setEditedUser(data.user);
    } catch (error) {
      console.error('Error fetching user details:', error);
    } finally {
      setLoading(false);
    }
  }

  async function fetchUserActivities() {
    try {
      const response = await fetch(`/api/admin/users/${params.userId}/activities`);
      const data = await response.json();
      setActivities(data.activities);
    } catch (error) {
      console.error('Error fetching user activities:', error);
    }
  }

  async function handleSave() {
    setSaving(true);
    try {
      const response = await fetch(`/api/admin/users/${params.userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editedUser)
      });

      if (!response.ok) throw new Error('Failed to update user');

      const data = await response.json();
      setUser(data.user);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating user:', error);
      alert('Failed to update user');
    } finally {
      setSaving(false);
    }
  }

  async function handleBanUser() {
    if (!banReason.trim()) {
      alert('Please provide a reason for banning');
      return;
    }

    try {
      const response = await fetch(`/api/admin/users/${params.userId}/ban`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: banReason })
      });

      if (!response.ok) throw new Error('Failed to ban user');

      await fetchUserDetails();
      setShowBanModal(false);
      setBanReason('');
    } catch (error) {
      console.error('Error banning user:', error);
      alert('Failed to ban user');
    }
  }

  async function handleUnbanUser() {
    try {
      const response = await fetch(`/api/admin/users/${params.userId}/unban`, {
        method: 'POST'
      });

      if (!response.ok) throw new Error('Failed to unban user');

      await fetchUserDetails();
    } catch (error) {
      console.error('Error unbanning user:', error);
      alert('Failed to unban user');
    }
  }

  async function handleResetPassword() {
    if (!confirm('Send password reset email to this user?')) return;

    try {
      const response = await fetch(`/api/admin/users/${params.userId}/reset-password`, {
        method: 'POST'
      });

      if (!response.ok) throw new Error('Failed to send reset email');

      alert('Password reset email sent successfully');
    } catch (error) {
      console.error('Error sending reset email:', error);
      alert('Failed to send reset email');
    }
  }

  async function handleDeleteUser() {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;

    try {
      const response = await fetch(`/api/admin/users/${params.userId}`, {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error('Failed to delete user');

      router.push('/admin/users');
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Failed to delete user');
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-white">Loading user details...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-white">User not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Header */}
      <div className="bg-gray-900 border-b border-gray-800">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/admin/users"
                className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-400" />
              </Link>
              <div>
                <h1 className="text-xl font-bold text-white">User Management</h1>
                <p className="text-sm text-gray-400">{user.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg flex items-center gap-2"
                >
                  <Edit3 className="w-4 h-4" />
                  Edit User
                </button>
              ) : (
                <>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center gap-2 disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* User Info Card */}
          <div className="lg:col-span-1">
            <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
              {/* Profile Header */}
              <div className="flex flex-col items-center mb-6">
                <div className="w-24 h-24 rounded-full bg-gray-800 flex items-center justify-center mb-4">
                  {user.imageUrl ? (
                    <img src={user.imageUrl} alt={user.email} className="w-full h-full rounded-full object-cover" />
                  ) : (
                    <User className="w-12 h-12 text-gray-500" />
                  )}
                </div>
                <h2 className="text-xl font-semibold text-white text-center">
                  {user.firstName || user.lastName 
                    ? `${user.firstName || ''} ${user.lastName || ''}`.trim()
                    : 'No Name'
                  }
                </h2>
                <p className="text-gray-400">{user.email}</p>
                
                <div className="flex items-center gap-2 mt-2">
                  {user.banned ? (
                    <span className="px-2 py-1 bg-red-600/20 text-red-400 text-xs rounded-full flex items-center gap-1">
                      <UserX className="w-3 h-3" />
                      Banned
                    </span>
                  ) : (
                    <span className="px-2 py-1 bg-green-600/20 text-green-400 text-xs rounded-full flex items-center gap-1">
                      <UserCheck className="w-3 h-3" />
                      Active
                    </span>
                  )}
                  {user.verified && (
                    <span className="px-2 py-1 bg-blue-600/20 text-blue-400 text-xs rounded-full flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" />
                      Verified
                    </span>
                  )}
                </div>
              </div>

              {/* Quick Stats */}
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between py-2 border-t border-gray-800">
                  <span className="text-gray-400">Member Since</span>
                  <span className="text-white">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-gray-400">Last Active</span>
                  <span className="text-white">
                    {user.lastSignInAt 
                      ? new Date(user.lastSignInAt).toLocaleDateString()
                      : 'Never'
                    }
                  </span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-gray-400">Subscription</span>
                  <span className={`font-medium ${
                    user.subscriptionTier === 'enterprise' ? 'text-purple-400' :
                    user.subscriptionTier === 'professional' ? 'text-blue-400' :
                    'text-gray-400'
                  }`}>
                    {user.subscriptionTier.charAt(0).toUpperCase() + user.subscriptionTier.slice(1)}
                  </span>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="mt-6 space-y-2">
                <button
                  onClick={() => router.push(`/admin/impersonate/${user.clerkId}`)}
                  className="w-full px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg flex items-center justify-center gap-2"
                >
                  <Eye className="w-4 h-4" />
                  View as User
                </button>
                <button
                  onClick={handleResetPassword}
                  className="w-full px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg flex items-center justify-center gap-2"
                >
                  <Key className="w-4 h-4" />
                  Reset Password
                </button>
                {user.banned ? (
                  <button
                    onClick={handleUnbanUser}
                    className="w-full px-4 py-2 bg-green-600/20 hover:bg-green-600/30 text-green-400 rounded-lg flex items-center justify-center gap-2"
                  >
                    <UserCheck className="w-4 h-4" />
                    Unban User
                  </button>
                ) : (
                  <button
                    onClick={() => setShowBanModal(true)}
                    className="w-full px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg flex items-center justify-center gap-2"
                  >
                    <Ban className="w-4 h-4" />
                    Ban User
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* User Details */}
            <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">User Information</h3>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    First Name
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editedUser.firstName || ''}
                      onChange={(e) => setEditedUser({...editedUser, firstName: e.target.value})}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                    />
                  ) : (
                    <p className="text-white">{user.firstName || '-'}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Last Name
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editedUser.lastName || ''}
                      onChange={(e) => setEditedUser({...editedUser, lastName: e.target.value})}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                    />
                  ) : (
                    <p className="text-white">{user.lastName || '-'}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Email Address
                  </label>
                  <p className="text-white">{user.email}</p>
                  <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Phone Number
                  </label>
                  {isEditing ? (
                    <input
                      type="tel"
                      value={editedUser.phoneNumber || ''}
                      onChange={(e) => setEditedUser({...editedUser, phoneNumber: e.target.value})}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                    />
                  ) : (
                    <p className="text-white">{user.phoneNumber || '-'}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Company
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editedUser.company || ''}
                      onChange={(e) => setEditedUser({...editedUser, company: e.target.value})}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                    />
                  ) : (
                    <p className="text-white">{user.company || '-'}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Role
                  </label>
                  {isEditing ? (
                    <select
                      value={editedUser.role}
                      onChange={(e) => setEditedUser({...editedUser, role: e.target.value as any})}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                    >
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                      <option value="enterprise">Enterprise</option>
                    </select>
                  ) : (
                    <p className="text-white capitalize">{user.role}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Subscription Tier
                  </label>
                  {isEditing ? (
                    <select
                      value={editedUser.subscriptionTier}
                      onChange={(e) => setEditedUser({...editedUser, subscriptionTier: e.target.value as any})}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                    >
                      <option value="free">Free</option>
                      <option value="professional">Professional</option>
                      <option value="enterprise">Enterprise</option>
                    </select>
                  ) : (
                    <p className="text-white capitalize">{user.subscriptionTier}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Subscription Status
                  </label>
                  {isEditing ? (
                    <select
                      value={editedUser.subscriptionStatus}
                      onChange={(e) => setEditedUser({...editedUser, subscriptionStatus: e.target.value as any})}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                    >
                      <option value="active">Active</option>
                      <option value="canceled">Canceled</option>
                      <option value="past_due">Past Due</option>
                    </select>
                  ) : (
                    <p className={`capitalize ${
                      user.subscriptionStatus === 'active' ? 'text-green-400' :
                      user.subscriptionStatus === 'past_due' ? 'text-red-400' :
                      'text-gray-400'
                    }`}>
                      {user.subscriptionStatus.replace('_', ' ')}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>
              
              <div className="space-y-3">
                {activities.length === 0 ? (
                  <p className="text-gray-400 text-center py-8">No recent activity</p>
                ) : (
                  activities.slice(0, 10).map((activity) => (
                    <div key={activity.id} className="flex items-start gap-3 p-3 bg-gray-800 rounded-lg">
                      <Activity className="w-4 h-4 text-gray-400 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-white text-sm">{activity.description}</p>
                        <p className="text-gray-400 text-xs">
                          {new Date(activity.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Danger Zone */}
            <div className="bg-red-900/20 rounded-xl border border-red-600/30 p-6">
              <h3 className="text-lg font-semibold text-red-400 mb-4">Danger Zone</h3>
              <p className="text-gray-300 text-sm mb-4">
                These actions are irreversible. Please be certain.
              </p>
              <button
                onClick={handleDeleteUser}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Delete User Account
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Ban Modal */}
      {showBanModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-xl p-6 max-w-md w-full">
            <h3 className="text-xl font-semibold text-white mb-4">Ban User</h3>
            <p className="text-gray-400 mb-4">
              This will prevent the user from accessing their account. Provide a reason for the ban:
            </p>
            <textarea
              value={banReason}
              onChange={(e) => setBanReason(e.target.value)}
              placeholder="Reason for ban..."
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white mb-4"
              rows={4}
            />
            <div className="flex gap-3">
              <button
                onClick={() => setShowBanModal(false)}
                className="flex-1 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleBanUser}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg"
              >
                Ban User
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}