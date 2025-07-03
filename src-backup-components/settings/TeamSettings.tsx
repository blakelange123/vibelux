"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Users,
  UserPlus,
  UserMinus,
  Shield,
  Edit,
  Mail,
  Calendar,
  Clock,
  MoreVertical,
  Search,
  Filter,
  Download,
  Settings,
  Key,
  Eye,
  Ban,
  CheckCircle,
  XCircle,
  AlertCircle,
  Crown,
  Star
} from 'lucide-react'

interface TeamMember {
  id: string
  name: string
  email: string
  role: 'owner' | 'admin' | 'manager' | 'operator' | 'viewer'
  status: 'active' | 'inactive' | 'pending'
  lastActive: string
  joinDate: string
  avatar: string
  permissions: string[]
  department?: string
}

interface Role {
  id: string
  name: string
  description: string
  permissions: string[]
  memberCount: number
  color: string
}

export function TeamSettings() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'members' | 'roles' | 'invites'>('members')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedRole, setSelectedRole] = useState<string>('all')
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState('viewer')
  const [isLoading, setIsLoading] = useState(false)
  const [inviteError, setInviteError] = useState('')
  const [subscription, setSubscription] = useState<any>(null)
  const [teamMemberLimit, setTeamMemberLimit] = useState(1)

  const [teamMembers] = useState<TeamMember[]>([
    {
      id: '1',
      name: 'John Smith',
      email: 'john@vibelux.com',
      role: 'owner',
      status: 'active',
      lastActive: '2024-02-15 14:30',
      joinDate: '2023-01-15',
      avatar: '/api/placeholder/40/40',
      permissions: ['all'],
      department: 'Operations'
    },
    {
      id: '2',
      name: 'Sarah Chen',
      email: 'sarah@vibelux.com',
      role: 'admin',
      status: 'active',
      lastActive: '2024-02-15 12:45',
      joinDate: '2023-03-20',
      avatar: '/api/placeholder/40/40',
      permissions: ['manage_users', 'manage_projects', 'view_analytics'],
      department: 'Cultivation'
    },
    {
      id: '3',
      name: 'Mike Rodriguez',
      email: 'mike@vibelux.com',
      role: 'manager',
      status: 'active',
      lastActive: '2024-02-14 18:20',
      joinDate: '2023-06-10',
      avatar: '/api/placeholder/40/40',
      permissions: ['manage_projects', 'view_analytics'],
      department: 'Research'
    },
    {
      id: '4',
      name: 'Lisa Wang',
      email: 'lisa@vibelux.com',
      role: 'operator',
      status: 'active',
      lastActive: '2024-02-15 09:15',
      joinDate: '2023-08-05',
      avatar: '/api/placeholder/40/40',
      permissions: ['manage_cultivation', 'view_reports'],
      department: 'Cultivation'
    },
    {
      id: '5',
      name: 'David Park',
      email: 'david@external.com',
      role: 'viewer',
      status: 'inactive',
      lastActive: '2024-02-10 16:30',
      joinDate: '2024-01-12',
      avatar: '/api/placeholder/40/40',
      permissions: ['view_dashboards'],
      department: 'External'
    }
  ])

  const [roles] = useState<Role[]>([
    {
      id: 'owner',
      name: 'Owner',
      description: 'Full access to all features and settings',
      permissions: ['all'],
      memberCount: 1,
      color: 'text-purple-400'
    },
    {
      id: 'admin',
      name: 'Administrator',
      description: 'Manage users, projects, and system settings',
      permissions: ['manage_users', 'manage_projects', 'manage_settings', 'view_analytics'],
      memberCount: 1,
      color: 'text-red-400'
    },
    {
      id: 'manager',
      name: 'Manager',
      description: 'Manage projects and view analytics',
      permissions: ['manage_projects', 'view_analytics', 'view_reports'],
      memberCount: 1,
      color: 'text-yellow-400'
    },
    {
      id: 'operator',
      name: 'Operator',
      description: 'Monitor and control cultivation systems',
      permissions: ['manage_cultivation', 'view_reports', 'view_dashboards'],
      memberCount: 1,
      color: 'text-green-400'
    },
    {
      id: 'viewer',
      name: 'Viewer',
      description: 'Read-only access to dashboards and reports',
      permissions: ['view_dashboards', 'view_reports'],
      memberCount: 1,
      color: 'text-blue-400'
    }
  ])

  const [pendingInvites] = useState([
    {
      id: '1',
      email: 'alex@newcompany.com',
      role: 'operator',
      invitedBy: 'John Smith',
      inviteDate: '2024-02-14',
      expiresDate: '2024-02-21'
    },
    {
      id: '2',
      email: 'maria@partner.com',
      role: 'viewer',
      invitedBy: 'Sarah Chen',
      inviteDate: '2024-02-13',
      expiresDate: '2024-02-20'
    }
  ])

  const filteredMembers = teamMembers.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.email.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesRole = selectedRole === 'all' || member.role === selectedRole
    return matchesSearch && matchesRole
  })

  useEffect(() => {
    // Fetch subscription info to get team member limits
    const fetchSubscription = async () => {
      try {
        const res = await fetch('/api/subscription')
        if (res.ok) {
          const data = await res.json()
          setSubscription(data)
          // Map subscription tier to team member limit
          const tierLimits: Record<string, number> = {
            'free': 1,
            'startup': 3,
            'greenhouse-basic': 5,
            'commercial-basic': 10,
            'professional': 3,
            'commercial-standard': 15,
            'greenhouse-pro': 20,
            'cultivation-expert': 25,
            'enterprise': 10,
            'commercial-enterprise': 50,
            'greenhouse-enterprise': 100,
            'cultivation-ai': 100,
            'research-academic': 15,
            'consultant-pro': 25,
            'manufacturer-partner': 100
          }
          setTeamMemberLimit(tierLimits[data.tier] || 1)
        }
      } catch (error) {
        console.error('Error fetching subscription:', error)
      }
    }
    fetchSubscription()
  }, [])

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setInviteError('')
    
    try {
      const res = await fetch('/api/facility/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: inviteEmail,
          role: inviteRole.toUpperCase(),
          sendEmail: true
        })
      })
      
      const data = await res.json()
      
      if (!res.ok) {
        if (data.error && data.error.includes('Team member limit reached')) {
          setInviteError(data.error)
          // Show upgrade prompt
          if (confirm(data.error + '\n\nWould you like to upgrade your plan?')) {
            router.push('/pricing')
          }
        } else {
          setInviteError(data.error || 'Failed to send invite')
        }
        return
      }
      
      // Success
      alert(`Invitation sent to ${inviteEmail} as ${inviteRole}`)
      setInviteEmail('')
      setInviteRole('viewer')
      setShowInviteModal(false)
      // TODO: Refresh team members list
    } catch (error) {
      setInviteError('Failed to send invite. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'owner': return Crown
      case 'admin': return Shield
      case 'manager': return Star
      case 'operator': return Settings
      case 'viewer': return Eye
      default: return Users
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-400'
      case 'inactive': return 'text-gray-400'
      case 'pending': return 'text-yellow-400'
      default: return 'text-gray-400'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return CheckCircle
      case 'inactive': return XCircle
      case 'pending': return AlertCircle
      default: return XCircle
    }
  }

  return (
    <div className="p-6 space-y-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Users className="w-6 h-6 text-green-400" />
          <h2 className="text-2xl font-bold text-white">Team Management</h2>
          <div className="px-3 py-1 bg-gray-800 rounded-full text-sm text-gray-400">
            {teamMembers.length} / {teamMemberLimit} seats
            {teamMembers.length >= teamMemberLimit && (
              <span className="ml-2 text-yellow-400">(Limit reached)</span>
            )}
          </div>
        </div>
        <button
          onClick={() => setShowInviteModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
        >
          <UserPlus className="w-4 h-4" />
          Invite Member
        </button>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 mb-6">
        {[
          { id: 'members', label: 'Team Members', count: teamMembers.length },
          { id: 'roles', label: 'Roles & Permissions', count: roles.length },
          { id: 'invites', label: 'Pending Invites', count: pendingInvites.length }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              activeTab === tab.id ? 'bg-purple-600 text-white' : 'bg-gray-800 hover:bg-gray-700'
            }`}
          >
            {tab.label}
            <span className="px-2 py-1 bg-gray-700 text-xs rounded-full">{tab.count}</span>
          </button>
        ))}
      </div>

      {/* Members Tab */}
      {activeTab === 'members' && (
        <div className="space-y-6">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search members..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-purple-500 text-white"
              />
            </div>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-purple-500 text-white"
            >
              <option value="all">All Roles</option>
              {roles.map(role => (
                <option key={role.id} value={role.id}>{role.name}</option>
              ))}
            </select>
            <button className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors flex items-center gap-2">
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>

          {/* Members List */}
          <div className="bg-gray-800 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-900">
                  <tr>
                    <th className="text-left py-3 px-4 text-gray-300 font-medium">Member</th>
                    <th className="text-left py-3 px-4 text-gray-300 font-medium">Role</th>
                    <th className="text-left py-3 px-4 text-gray-300 font-medium">Department</th>
                    <th className="text-left py-3 px-4 text-gray-300 font-medium">Status</th>
                    <th className="text-left py-3 px-4 text-gray-300 font-medium">Last Active</th>
                    <th className="text-center py-3 px-4 text-gray-300 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMembers.map(member => {
                    const RoleIcon = getRoleIcon(member.role)
                    const StatusIcon = getStatusIcon(member.status)
                    return (
                      <tr key={member.id} className="border-t border-gray-700 hover:bg-gray-700/50">
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center text-sm font-medium">
                              {member.name.split(' ').map(n => n[0]).join('')}
                            </div>
                            <div>
                              <p className="text-white font-medium">{member.name}</p>
                              <p className="text-gray-400 text-sm">{member.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2">
                            <RoleIcon className={`w-4 h-4 ${roles.find(r => r.id === member.role)?.color || 'text-gray-400'}`} />
                            <span className="text-white capitalize">{member.role}</span>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <span className="text-gray-300">{member.department}</span>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2">
                            <StatusIcon className={`w-4 h-4 ${getStatusColor(member.status)}`} />
                            <span className={`capitalize ${getStatusColor(member.status)}`}>
                              {member.status}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <span className="text-gray-400 text-sm">{member.lastActive}</span>
                        </td>
                        <td className="py-4 px-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button className="p-2 hover:bg-gray-600 rounded transition-colors">
                              <Edit className="w-4 h-4 text-gray-400" />
                            </button>
                            {member.role !== 'owner' && (
                              <button className="p-2 hover:bg-gray-600 rounded transition-colors">
                                <UserMinus className="w-4 h-4 text-red-400" />
                              </button>
                            )}
                            <button className="p-2 hover:bg-gray-600 rounded transition-colors">
                              <MoreVertical className="w-4 h-4 text-gray-400" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Roles Tab */}
      {activeTab === 'roles' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {roles.map(role => {
              const RoleIcon = getRoleIcon(role.id)
              return (
                <div key={role.id} className="bg-gray-800 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <RoleIcon className={`w-6 h-6 ${role.color}`} />
                      <h3 className="text-lg font-semibold text-white">{role.name}</h3>
                    </div>
                    <span className="px-2 py-1 bg-gray-700 text-sm rounded">
                      {role.memberCount} members
                    </span>
                  </div>
                  
                  <p className="text-gray-400 text-sm mb-4">{role.description}</p>
                  
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-gray-300">Permissions:</h4>
                    <div className="space-y-1">
                      {role.permissions.slice(0, 3).map(permission => (
                        <div key={permission} className="flex items-center gap-2 text-sm">
                          <CheckCircle className="w-3 h-3 text-green-400" />
                          <span className="text-gray-400 capitalize">{permission.replace('_', ' ')}</span>
                        </div>
                      ))}
                      {role.permissions.length > 3 && (
                        <div className="text-sm text-gray-500">
                          +{role.permissions.length - 3} more permissions
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <button className="w-full mt-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors text-sm">
                    Edit Role
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Invites Tab */}
      {activeTab === 'invites' && (
        <div className="space-y-6">
          <div className="bg-gray-800 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-900">
                  <tr>
                    <th className="text-left py-3 px-4 text-gray-300 font-medium">Email</th>
                    <th className="text-left py-3 px-4 text-gray-300 font-medium">Role</th>
                    <th className="text-left py-3 px-4 text-gray-300 font-medium">Invited By</th>
                    <th className="text-left py-3 px-4 text-gray-300 font-medium">Invite Date</th>
                    <th className="text-left py-3 px-4 text-gray-300 font-medium">Expires</th>
                    <th className="text-center py-3 px-4 text-gray-300 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingInvites.map(invite => (
                    <tr key={invite.id} className="border-t border-gray-700 hover:bg-gray-700/50">
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-gray-400" />
                          <span className="text-white">{invite.email}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-gray-300 capitalize">{invite.role}</span>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-gray-300">{invite.invitedBy}</span>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-gray-400 text-sm">{invite.inviteDate}</span>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-yellow-400 text-sm">{invite.expiresDate}</span>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition-colors">
                            Resend
                          </button>
                          <button className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded transition-colors">
                            Cancel
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 rounded-xl border border-gray-800 w-full max-w-md">
            <div className="p-6 border-b border-gray-800">
              <h3 className="text-xl font-semibold text-white">Invite Team Member</h3>
            </div>
            
            <form onSubmit={handleInvite} className="p-6 space-y-4">
              {inviteError && (
                <div className="p-3 bg-red-900/50 border border-red-800 rounded-lg text-red-300 text-sm">
                  {inviteError}
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Email Address</label>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="colleague@company.com"
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-purple-500 text-white"
                  required
                  disabled={isLoading}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Role</label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-purple-500 text-white"
                  disabled={isLoading}
                >
                  {roles.filter(role => role.id !== 'owner').map(role => (
                    <option key={role.id} value={role.id}>{role.name}</option>
                  ))}
                </select>
              </div>
              
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
                >
                  {isLoading ? 'Sending...' : 'Send Invitation'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="px-6 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}