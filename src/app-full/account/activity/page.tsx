'use client';

import React, { useState } from 'react';
import { useUser } from '@clerk/nextjs';
import {
  Activity,
  Filter,
  Download,
  Calendar,
  Clock,
  Package,
  FileText,
  Settings,
  CreditCard,
  Users,
  Shield,
  ChevronRight,
  Search,
  Eye,
  Edit,
  Trash2,
  LogIn,
  LogOut,
  UserPlus,
  Mail,
  AlertCircle
} from 'lucide-react';
import Link from 'next/link';

interface ActivityEvent {
  id: string;
  type: 'login' | 'logout' | 'project' | 'settings' | 'billing' | 'team' | 'security' | 'account';
  action: string;
  description: string;
  metadata?: any;
  timestamp: Date;
  ipAddress?: string;
  device?: string;
}

export default function ActivityPage() {
  const { user } = useUser();
  const [filterType, setFilterType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateRange, setDateRange] = useState('7days');

  // Mock activity data
  const [activities] = useState<ActivityEvent[]>([
    {
      id: '1',
      type: 'login',
      action: 'User Login',
      description: 'Successfully logged in',
      timestamp: new Date(),
      ipAddress: '192.168.1.1',
      device: 'Chrome on MacOS'
    },
    {
      id: '2',
      type: 'project',
      action: 'Project Created',
      description: 'Created new LED design project "Greenhouse A"',
      metadata: { projectId: 'proj_123', projectName: 'Greenhouse A' },
      timestamp: new Date(Date.now() - 3600000)
    },
    {
      id: '3',
      type: 'settings',
      action: 'Settings Updated',
      description: 'Updated notification preferences',
      timestamp: new Date(Date.now() - 7200000)
    },
    {
      id: '4',
      type: 'billing',
      action: 'Payment Method Added',
      description: 'Added new credit card ending in 4242',
      timestamp: new Date(Date.now() - 86400000)
    },
    {
      id: '5',
      type: 'team',
      action: 'Team Member Invited',
      description: 'Invited john@example.com to team',
      metadata: { invitedEmail: 'john@example.com' },
      timestamp: new Date(Date.now() - 172800000)
    },
    {
      id: '6',
      type: 'security',
      action: 'Password Changed',
      description: 'Password successfully updated',
      timestamp: new Date(Date.now() - 259200000)
    },
    {
      id: '7',
      type: 'project',
      action: 'Project Deleted',
      description: 'Deleted project "Test Layout"',
      metadata: { projectName: 'Test Layout' },
      timestamp: new Date(Date.now() - 345600000)
    },
    {
      id: '8',
      type: 'account',
      action: 'Profile Updated',
      description: 'Updated profile information',
      timestamp: new Date(Date.now() - 432000000)
    }
  ]);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'login':
      case 'logout':
        return <LogIn className="w-4 h-4" />;
      case 'project':
        return <Package className="w-4 h-4" />;
      case 'settings':
        return <Settings className="w-4 h-4" />;
      case 'billing':
        return <CreditCard className="w-4 h-4" />;
      case 'team':
        return <Users className="w-4 h-4" />;
      case 'security':
        return <Shield className="w-4 h-4" />;
      case 'account':
        return <UserPlus className="w-4 h-4" />;
      default:
        return <Activity className="w-4 h-4" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'login':
      case 'logout':
        return 'text-blue-400 bg-blue-600/20';
      case 'project':
        return 'text-green-400 bg-green-600/20';
      case 'settings':
        return 'text-gray-400 bg-gray-600/20';
      case 'billing':
        return 'text-yellow-400 bg-yellow-600/20';
      case 'team':
        return 'text-purple-400 bg-purple-600/20';
      case 'security':
        return 'text-red-400 bg-red-600/20';
      case 'account':
        return 'text-cyan-400 bg-cyan-600/20';
      default:
        return 'text-gray-400 bg-gray-600/20';
    }
  };

  const filteredActivities = activities
    .filter(activity => filterType === 'all' || activity.type === filterType)
    .filter(activity => 
      searchQuery === '' || 
      activity.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      activity.action.toLowerCase().includes(searchQuery.toLowerCase())
    );

  const activityStats = {
    total: activities.length,
    today: activities.filter(a => 
      a.timestamp.toDateString() === new Date().toDateString()
    ).length,
    thisWeek: activities.filter(a => 
      a.timestamp > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    ).length,
    thisMonth: activities.filter(a => 
      a.timestamp > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    ).length
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-sm text-gray-400 mb-4">
          <Link href="/account/profile" className="hover:text-white">Account</Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-white">Activity</span>
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">Activity History</h1>
        <p className="text-gray-400">Track all your account activities and changes</p>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gray-800 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Total Activities</p>
              <p className="text-2xl font-bold text-white">{activityStats.total}</p>
            </div>
            <Activity className="w-8 h-8 text-gray-600" />
          </div>
        </div>
        <div className="bg-gray-800 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Today</p>
              <p className="text-2xl font-bold text-white">{activityStats.today}</p>
            </div>
            <Clock className="w-8 h-8 text-gray-600" />
          </div>
        </div>
        <div className="bg-gray-800 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">This Week</p>
              <p className="text-2xl font-bold text-white">{activityStats.thisWeek}</p>
            </div>
            <Calendar className="w-8 h-8 text-gray-600" />
          </div>
        </div>
        <div className="bg-gray-800 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">This Month</p>
              <p className="text-2xl font-bold text-white">{activityStats.thisMonth}</p>
            </div>
            <Calendar className="w-8 h-8 text-gray-600" />
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-gray-800 rounded-xl p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search activities..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400"
              />
            </div>
          </div>
          
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
          >
            <option value="all">All Activities</option>
            <option value="login">Login & Logout</option>
            <option value="project">Projects</option>
            <option value="settings">Settings</option>
            <option value="billing">Billing</option>
            <option value="team">Team</option>
            <option value="security">Security</option>
            <option value="account">Account</option>
          </select>
          
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
          >
            <option value="24hours">Last 24 Hours</option>
            <option value="7days">Last 7 Days</option>
            <option value="30days">Last 30 Days</option>
            <option value="90days">Last 90 Days</option>
            <option value="all">All Time</option>
          </select>
          
          <button className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* Activity Timeline */}
      <div className="bg-gray-800 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>
        
        {filteredActivities.length === 0 ? (
          <div className="text-center py-12">
            <Activity className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400">No activities found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredActivities.map((activity, index) => (
              <div key={activity.id} className="relative">
                {index < filteredActivities.length - 1 && (
                  <div className="absolute left-6 top-10 bottom-0 w-0.5 bg-gray-700"></div>
                )}
                
                <div className="flex gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${getActivityColor(activity.type)}`}>
                    {getActivityIcon(activity.type)}
                  </div>
                  
                  <div className="flex-1 bg-gray-700 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-medium text-white">{activity.action}</h4>
                        <p className="text-sm text-gray-300">{activity.description}</p>
                      </div>
                      <span className="text-xs text-gray-400">
                        {activity.timestamp.toLocaleString()}
                      </span>
                    </div>
                    
                    {activity.metadata && (
                      <div className="mt-2 p-2 bg-gray-800 rounded text-xs text-gray-400">
                        {Object.entries(activity.metadata).map(([key, value]) => (
                          <div key={key} className="flex gap-2">
                            <span className="text-gray-500">{key}:</span>
                            <span className="text-gray-300">{value as string}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {(activity.ipAddress || activity.device) && (
                      <div className="mt-2 flex gap-4 text-xs text-gray-500">
                        {activity.ipAddress && (
                          <span>IP: {activity.ipAddress}</span>
                        )}
                        {activity.device && (
                          <span>Device: {activity.device}</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {filteredActivities.length > 0 && (
          <div className="mt-6 flex justify-center">
            <button className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors">
              Load More
            </button>
          </div>
        )}
      </div>

      {/* Privacy Notice */}
      <div className="mt-6 p-4 bg-blue-900/20 border border-blue-600/30 rounded-lg">
        <div className="flex gap-3">
          <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0" />
          <div className="text-sm">
            <p className="text-blue-400 font-medium mb-1">Privacy Notice</p>
            <p className="text-gray-300">
              Activity logs are retained for 90 days and are only visible to you. 
              Critical security events may be retained longer for compliance purposes.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}