'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@clerk/nextjs';
import {
  Users,
  Search,
  Filter,
  Download,
  Upload,
  UserPlus,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Mail,
  Calendar,
  CreditCard,
  Building,
  Shield,
  UserCheck,
  UserX,
  TrendingUp,
  TrendingDown,
  Eye,
  Edit,
  Ban,
  Trash2
} from 'lucide-react';
import Link from 'next/link';

interface User {
  id: string;
  clerkId: string;
  email: string;
  firstName?: string;
  lastName?: string;
  imageUrl?: string;
  company?: string;
  role: 'user' | 'admin' | 'enterprise';
  subscriptionTier: 'free' | 'professional' | 'enterprise';
  subscriptionStatus: 'active' | 'canceled' | 'past_due';
  createdAt: string;
  lastSignInAt?: string;
  banned: boolean;
  verified: boolean;
}

interface UserStats {
  totalUsers: number;
  activeUsers: number;
  newUsersThisMonth: number;
  churnRate: number;
  subscriptionBreakdown: {
    free: number;
    professional: number;
    enterprise: number;
  };
}

export default function AdminUsersPage() {
  const router = useRouter();
  const { userId: adminId } = useAuth();
  
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [filterSubscription, setFilterSubscription] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [showBulkActions, setShowBulkActions] = useState(false);
  
  const itemsPerPage = 20;

  useEffect(() => {
    fetchUsers();
    fetchStats();
  }, []);

  useEffect(() => {
    applyFiltersAndSort();
  }, [users, searchQuery, filterRole, filterSubscription, filterStatus, sortBy, sortOrder]);

  async function fetchUsers() {
    try {
      const response = await fetch('/api/admin/users');
      const data = await response.json();
      setUsers(data.users);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  }

  async function fetchStats() {
    try {
      const response = await fetch('/api/admin/users/stats');
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  }

  function applyFiltersAndSort() {
    let filtered = [...users];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(user =>
        user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.lastName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.company?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Role filter
    if (filterRole !== 'all') {
      filtered = filtered.filter(user => user.role === filterRole);
    }

    // Subscription filter
    if (filterSubscription !== 'all') {
      filtered = filtered.filter(user => user.subscriptionTier === filterSubscription);
    }

    // Status filter
    if (filterStatus === 'active') {
      filtered = filtered.filter(user => !user.banned && user.subscriptionStatus === 'active');
    } else if (filterStatus === 'banned') {
      filtered = filtered.filter(user => user.banned);
    } else if (filterStatus === 'inactive') {
      filtered = filtered.filter(user => user.subscriptionStatus !== 'active');
    }

    // Sort
    filtered.sort((a, b) => {
      let aVal: any = a[sortBy as keyof User];
      let bVal: any = b[sortBy as keyof User];

      if (sortBy === 'name') {
        aVal = `${a.firstName || ''} ${a.lastName || ''}`.trim() || a.email;
        bVal = `${b.firstName || ''} ${b.lastName || ''}`.trim() || b.email;
      }

      if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    setFilteredUsers(filtered);
    setCurrentPage(1);
  }

  async function handleBulkAction(action: string) {
    if (selectedUsers.length === 0) return;

    if (!confirm(`Are you sure you want to ${action} ${selectedUsers.length} users?`)) return;

    try {
      const response = await fetch('/api/admin/users/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userIds: selectedUsers,
          action
        })
      });

      if (!response.ok) throw new Error(`Failed to ${action} users`);

      await fetchUsers();
      setSelectedUsers([]);
      setShowBulkActions(false);
    } catch (error) {
      console.error(`Error performing bulk ${action}:`, error);
      alert(`Failed to ${action} users`);
    }
  }

  async function exportUsers() {
    try {
      const response = await fetch('/api/admin/users/export');
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `users_export_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
    } catch (error) {
      console.error('Error exporting users:', error);
      alert('Failed to export users');
    }
  }

  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-white">Loading users...</div>
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
                href="/admin"
                className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
              >
                <ChevronLeft className="w-5 h-5 text-gray-400" />
              </Link>
              <div>
                <h1 className="text-xl font-bold text-white">User Management</h1>
                <p className="text-sm text-gray-400">{filteredUsers.length} users found</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={exportUsers}
                className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Export
              </button>
              <Link
                href="/admin/users/invite"
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center gap-2"
              >
                <UserPlus className="w-4 h-4" />
                Invite User
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="container mx-auto px-4 py-6">
          <div className="grid md:grid-cols-5 gap-4">
            <div className="bg-gray-900 rounded-lg border border-gray-800 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Total Users</p>
                  <p className="text-2xl font-bold text-white">{stats.totalUsers}</p>
                </div>
                <Users className="w-8 h-8 text-gray-600" />
              </div>
            </div>
            <div className="bg-gray-900 rounded-lg border border-gray-800 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Active Users</p>
                  <p className="text-2xl font-bold text-green-400">{stats.activeUsers}</p>
                </div>
                <UserCheck className="w-8 h-8 text-green-600" />
              </div>
            </div>
            <div className="bg-gray-900 rounded-lg border border-gray-800 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">New This Month</p>
                  <p className="text-2xl font-bold text-blue-400">{stats.newUsersThisMonth}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-blue-600" />
              </div>
            </div>
            <div className="bg-gray-900 rounded-lg border border-gray-800 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Churn Rate</p>
                  <p className="text-2xl font-bold text-red-400">{stats.churnRate}%</p>
                </div>
                <TrendingDown className="w-8 h-8 text-red-600" />
              </div>
            </div>
            <div className="bg-gray-900 rounded-lg border border-gray-800 p-4">
              <div>
                <p className="text-sm text-gray-400 mb-2">Subscriptions</p>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-300">Free</span>
                    <span className="text-white">{stats.subscriptionBreakdown.free}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-400">Pro</span>
                    <span className="text-white">{stats.subscriptionBreakdown.professional}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-purple-400">Enterprise</span>
                    <span className="text-white">{stats.subscriptionBreakdown.enterprise}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters and Search */}
      <div className="container mx-auto px-4 py-4">
        <div className="bg-gray-900 rounded-lg border border-gray-800 p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name, email, or company..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400"
                />
              </div>
            </div>
            
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
            >
              <option value="all">All Roles</option>
              <option value="user">Users</option>
              <option value="admin">Admins</option>
              <option value="enterprise">Enterprise</option>
            </select>
            
            <select
              value={filterSubscription}
              onChange={(e) => setFilterSubscription(e.target.value)}
              className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
            >
              <option value="all">All Subscriptions</option>
              <option value="free">Free</option>
              <option value="professional">Professional</option>
              <option value="enterprise">Enterprise</option>
            </select>
            
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="banned">Banned</option>
            </select>
            
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
            >
              <option value="createdAt">Join Date</option>
              <option value="name">Name</option>
              <option value="email">Email</option>
              <option value="lastSignInAt">Last Active</option>
            </select>
            
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="px-3 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg text-white"
            >
              {sortOrder === 'asc' ? '↑' : '↓'}
            </button>
          </div>

          {selectedUsers.length > 0 && (
            <div className="mt-4 flex items-center justify-between p-3 bg-blue-600/20 border border-blue-600/30 rounded-lg">
              <p className="text-sm text-blue-400">
                {selectedUsers.length} users selected
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => handleBulkAction('email')}
                  className="px-3 py-1 bg-gray-800 hover:bg-gray-700 text-white text-sm rounded-lg"
                >
                  Send Email
                </button>
                <button
                  onClick={() => handleBulkAction('export')}
                  className="px-3 py-1 bg-gray-800 hover:bg-gray-700 text-white text-sm rounded-lg"
                >
                  Export Selected
                </button>
                <button
                  onClick={() => handleBulkAction('ban')}
                  className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded-lg"
                >
                  Ban Selected
                </button>
                <button
                  onClick={() => setSelectedUsers([])}
                  className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded-lg"
                >
                  Clear
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Users Table */}
      <div className="container mx-auto px-4">
        <div className="bg-gray-900 rounded-lg border border-gray-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-800">
                  <th className="p-4 text-left">
                    <input
                      type="checkbox"
                      checked={selectedUsers.length === paginatedUsers.length && paginatedUsers.length > 0}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedUsers(paginatedUsers.map(u => u.id));
                        } else {
                          setSelectedUsers([]);
                        }
                      }}
                      className="rounded border-gray-600"
                    />
                  </th>
                  <th className="p-4 text-left text-sm font-medium text-gray-400">User</th>
                  <th className="p-4 text-left text-sm font-medium text-gray-400">Role</th>
                  <th className="p-4 text-left text-sm font-medium text-gray-400">Subscription</th>
                  <th className="p-4 text-left text-sm font-medium text-gray-400">Status</th>
                  <th className="p-4 text-left text-sm font-medium text-gray-400">Joined</th>
                  <th className="p-4 text-left text-sm font-medium text-gray-400">Last Active</th>
                  <th className="p-4 text-left text-sm font-medium text-gray-400">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedUsers.map((user) => (
                  <tr key={user.id} className="border-t border-gray-800 hover:bg-gray-800/50">
                    <td className="p-4">
                      <input
                        type="checkbox"
                        checked={selectedUsers.includes(user.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedUsers([...selectedUsers, user.id]);
                          } else {
                            setSelectedUsers(selectedUsers.filter(id => id !== user.id));
                          }
                        }}
                        className="rounded border-gray-600"
                      />
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center">
                          {user.imageUrl ? (
                            <img src={user.imageUrl} alt="" className="w-full h-full rounded-full object-cover" />
                          ) : (
                            <User className="w-5 h-5 text-gray-500" />
                          )}
                        </div>
                        <div>
                          <p className="text-white font-medium">
                            {user.firstName || user.lastName 
                              ? `${user.firstName || ''} ${user.lastName || ''}`.trim()
                              : 'No Name'
                            }
                          </p>
                          <p className="text-sm text-gray-400">{user.email}</p>
                          {user.company && (
                            <p className="text-xs text-gray-500">{user.company}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`text-sm ${
                        user.role === 'admin' ? 'text-purple-400' :
                        user.role === 'enterprise' ? 'text-blue-400' :
                        'text-gray-400'
                      }`}>
                        {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`text-sm ${
                        user.subscriptionTier === 'enterprise' ? 'text-purple-400' :
                        user.subscriptionTier === 'professional' ? 'text-blue-400' :
                        'text-gray-400'
                      }`}>
                        {user.subscriptionTier.charAt(0).toUpperCase() + user.subscriptionTier.slice(1)}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        {user.banned ? (
                          <span className="px-2 py-1 bg-red-600/20 text-red-400 text-xs rounded-full">
                            Banned
                          </span>
                        ) : user.subscriptionStatus === 'active' ? (
                          <span className="px-2 py-1 bg-green-600/20 text-green-400 text-xs rounded-full">
                            Active
                          </span>
                        ) : user.subscriptionStatus === 'past_due' ? (
                          <span className="px-2 py-1 bg-yellow-600/20 text-yellow-400 text-xs rounded-full">
                            Past Due
                          </span>
                        ) : (
                          <span className="px-2 py-1 bg-gray-600/20 text-gray-400 text-xs rounded-full">
                            Inactive
                          </span>
                        )}
                        {user.verified && (
                          <CheckCircle className="w-4 h-4 text-blue-400" />
                        )}
                      </div>
                    </td>
                    <td className="p-4 text-sm text-gray-400">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-4 text-sm text-gray-400">
                      {user.lastSignInAt 
                        ? new Date(user.lastSignInAt).toLocaleDateString()
                        : 'Never'
                      }
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => router.push(`/admin/users/${user.id}`)}
                          className="p-1.5 hover:bg-gray-700 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4 text-gray-400" />
                        </button>
                        <button
                          onClick={() => router.push(`/admin/impersonate/${user.clerkId}`)}
                          className="p-1.5 hover:bg-gray-700 rounded-lg transition-colors"
                          title="View as User"
                        >
                          <UserCheck className="w-4 h-4 text-gray-400" />
                        </button>
                        <button
                          className="p-1.5 hover:bg-gray-700 rounded-lg transition-colors"
                          title="More Actions"
                        >
                          <MoreVertical className="w-4 h-4 text-gray-400" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="p-4 border-t border-gray-800 flex items-center justify-between">
            <p className="text-sm text-gray-400">
              Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredUsers.length)} of {filteredUsers.length} users
            </p>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-2 hover:bg-gray-800 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4 text-gray-400" />
              </button>
              
              <div className="flex gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const page = currentPage > 3 ? currentPage - 2 + i : i + 1;
                  if (page > totalPages) return null;
                  
                  return (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-3 py-1 rounded-lg ${
                        page === currentPage
                          ? 'bg-green-600 text-white'
                          : 'hover:bg-gray-800 text-gray-400'
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}
              </div>
              
              <button
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-2 hover:bg-gray-800 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}