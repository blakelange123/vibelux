'use client';

import { useState, useEffect } from 'react';
import { useAuth, useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { Shield, Users, Activity, Search, UserCheck, AlertTriangle, LogOut, Eye, Database, TrendingUp, Settings, Flag, BarChart3, MessageSquare, FileText, DollarSign, Bot } from 'lucide-react';

interface User {
  id: string;
  clerkId: string;
  email: string;
  name: string | null;
  subscriptionTier: string;
  createdAt: string;
  lastActive?: string;
}

interface AuditLog {
  id: string;
  action: string;
  targetUser?: { email: string };
  details: any;
  createdAt: string;
}

export default function AdminDashboard() {
  const { isSignedIn, userId } = useAuth();
  const { user } = useUser();
  const router = useRouter();
  
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [impersonationReason, setImpersonationReason] = useState('');
  const [currentImpersonation, setCurrentImpersonation] = useState<any>(null);

  // Check if user is admin
  useEffect(() => {
    async function checkAdmin() {
      if (!userId) return;
      
      try {
        const response = await fetch('/api/admin/check-access');
        const data = await response.json();
        
        if (data.isAdmin) {
          setIsAdmin(true);
          fetchUsers();
          fetchAuditLogs();
          checkCurrentImpersonation();
        } else {
          router.push('/');
        }
      } catch (error) {
        console.error('Error checking admin access:', error);
        router.push('/');
      } finally {
        setLoading(false);
      }
    }
    
    checkAdmin();
  }, [userId, router]);

  // Fetch users
  async function fetchUsers() {
    try {
      const response = await fetch('/api/admin/users');
      const data = await response.json();
      setUsers(data.users);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  }

  // Fetch audit logs
  async function fetchAuditLogs() {
    try {
      const response = await fetch('/api/admin/audit-logs');
      const data = await response.json();
      setAuditLogs(data.logs);
    } catch (error) {
      console.error('Error fetching audit logs:', error);
    }
  }

  // Check current impersonation status
  async function checkCurrentImpersonation() {
    try {
      const response = await fetch('/api/admin/impersonation/status');
      const data = await response.json();
      if (data.isImpersonating) {
        setCurrentImpersonation(data);
      }
    } catch (error) {
      console.error('Error checking impersonation status:', error);
    }
  }

  // Start impersonation
  async function startImpersonation(targetUserId: string) {
    if (!impersonationReason.trim()) {
      alert('Please provide a reason for impersonation');
      return;
    }

    try {
      const response = await fetch('/api/admin/impersonation/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetUserId,
          reason: impersonationReason
        })
      });

      if (!response.ok) {
        throw new Error('Failed to start impersonation');
      }

      const data = await response.json();
      
      // Redirect to home page as impersonated user
      window.location.href = '/';
    } catch (error) {
      console.error('Error starting impersonation:', error);
      alert('Failed to start impersonation');
    }
  }

  // End impersonation
  async function endImpersonation() {
    try {
      const response = await fetch('/api/admin/impersonation/end', {
        method: 'POST'
      });

      if (!response.ok) {
        throw new Error('Failed to end impersonation');
      }

      // Refresh the page
      window.location.reload();
    } catch (error) {
      console.error('Error ending impersonation:', error);
      alert('Failed to end impersonation');
    }
  }

  // Filter users based on search
  const filteredUsers = users.filter(user => 
    user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-white">Unauthorized</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Header */}
      <div className="bg-gray-900 border-b border-gray-800">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="w-6 h-6 text-purple-400" />
              <h1 className="text-xl font-bold text-white">Admin Dashboard</h1>
            </div>
            
            {currentImpersonation && (
              <div className="flex items-center gap-3 bg-yellow-500/20 px-4 py-2 rounded-lg border border-yellow-500/50">
                <AlertTriangle className="w-4 h-4 text-yellow-400" />
                <span className="text-sm text-yellow-200">
                  Impersonating: {currentImpersonation.targetEmail}
                </span>
                <button
                  onClick={endImpersonation}
                  className="ml-2 px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded-md flex items-center gap-1"
                >
                  <LogOut className="w-3 h-3" />
                  End Session
                </button>
              </div>
            )}
          </div>
          
          {/* Admin Navigation */}
          <div className="mt-4 flex flex-wrap gap-2">
            <button 
              onClick={() => router.push('/admin')}
              className="px-3 py-2 bg-purple-600 text-white text-sm rounded-md flex items-center gap-2 hover:bg-purple-700 transition-colors"
            >
              <Users className="w-4 h-4" />
              Users
            </button>
            <button 
              onClick={() => router.push('/admin/performance')}
              className="px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded-md flex items-center gap-2 transition-colors"
            >
              <TrendingUp className="w-4 h-4" />
              Performance
            </button>
            <button 
              onClick={() => router.push('/admin/client-monitoring')}
              className="px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded-md flex items-center gap-2 transition-colors"
            >
              <Activity className="w-4 h-4" />
              Client Monitoring
            </button>
            <button 
              onClick={() => router.push('/admin/backup')}
              className="px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded-md flex items-center gap-2 transition-colors"
            >
              <Database className="w-4 h-4" />
              Backup
            </button>
            <button 
              onClick={() => router.push('/admin/features')}
              className="px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded-md flex items-center gap-2 transition-colors"
            >
              <Flag className="w-4 h-4" />
              Features
            </button>
            <button 
              onClick={() => router.push('/admin/automation')}
              className="px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded-md flex items-center gap-2 transition-colors"
            >
              <Bot className="w-4 h-4" />
              Automation
            </button>
            <button 
              onClick={() => router.push('/admin/settings')}
              className="px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded-md flex items-center gap-2 transition-colors"
            >
              <Settings className="w-4 h-4" />
              Settings
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Users List */}
          <div className="lg:col-span-2">
            <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Users
                </h2>
                
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search users..."
                    className="pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:border-purple-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-2">
                {filteredUsers.map(user => (
                  <div
                    key={user.id}
                    className="bg-gray-800 rounded-lg p-4 hover:bg-gray-700 transition-colors cursor-pointer"
                    onClick={() => setSelectedUser(user)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-white">{user.email}</div>
                        <div className="text-sm text-gray-400">
                          {user.name || 'No name'} • {user.subscriptionTier}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          Joined: {new Date(user.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                      
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedUser(user);
                          setImpersonationReason(`Support request - ${new Date().toLocaleDateString()}`);
                        }}
                        className="p-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
                        title="View as user"
                      >
                        <Eye className="w-4 h-4 text-white" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* User Details & Actions */}
          <div className="space-y-6">
            {selectedUser && (
              <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <UserCheck className="w-5 h-5" />
                  User Details
                </h3>
                
                <div className="space-y-3 text-sm">
                  <div>
                    <span className="text-gray-400">Email:</span>
                    <div className="text-white">{selectedUser.email}</div>
                  </div>
                  <div>
                    <span className="text-gray-400">Name:</span>
                    <div className="text-white">{selectedUser.name || 'Not set'}</div>
                  </div>
                  <div>
                    <span className="text-gray-400">Subscription:</span>
                    <div className="text-white">{selectedUser.subscriptionTier}</div>
                  </div>
                  <div>
                    <span className="text-gray-400">User ID:</span>
                    <div className="text-gray-300 text-xs font-mono">{selectedUser.clerkId}</div>
                  </div>
                </div>

                <div className="mt-6 space-y-3">
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">
                      Reason for impersonation:
                    </label>
                    <textarea
                      value={impersonationReason}
                      onChange={(e) => setImpersonationReason(e.target.value)}
                      placeholder="e.g., Investigating reported issue #123"
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:border-purple-500 focus:outline-none"
                      rows={3}
                    />
                  </div>
                  
                  <button
                    onClick={() => startImpersonation(selectedUser.clerkId)}
                    className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-white font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    <Eye className="w-4 h-4" />
                    View as User
                  </button>
                </div>
              </div>
            )}

            {/* Recent Audit Logs */}
            <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Recent Activity
              </h3>
              
              <div className="space-y-3">
                {auditLogs.slice(0, 5).map(log => (
                  <div key={log.id} className="text-sm">
                    <div className="text-white">{log.action.replace(/_/g, ' ')}</div>
                    <div className="text-gray-400 text-xs">
                      {log.targetUser?.email && `Target: ${log.targetUser.email} • `}
                      {new Date(log.createdAt).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}