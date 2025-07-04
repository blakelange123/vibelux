'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  DollarSign,
  Calendar,
  Users,
  TrendingUp,
  Settings,
  Camera,
  Edit,
  Eye,
  Star,
  Clock,
  MessageSquare,
  BarChart3,
  CreditCard,
  Upload,
  CheckCircle,
  AlertTriangle,
  Bell,
  Filter,
  Download
} from 'lucide-react';

interface ExpertStats {
  totalEarnings: number;
  monthlyEarnings: number;
  totalSessions: number;
  averageRating: number;
  responseTime: number;
  completionRate: number;
  pendingPayouts: number;
  nextPayoutDate: string;
}

interface RecentSession {
  id: string;
  clientName: string;
  date: string;
  duration: number;
  earnings: number;
  rating?: number;
  status: string;
}

interface ExpertProfile {
  id: string;
  displayName: string;
  title: string;
  bio: string;
  photoUrl?: string;
  specialties: string[];
  certifications: string[];
  hourlyRate: number;
  stripeConnectId?: string;
  stripeOnboardingComplete: boolean;
}

export default function ExpertDashboardPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState<ExpertStats | null>(null);
  const [recentSessions, setRecentSessions] = useState<RecentSession[]>([]);
  const [profile, setProfile] = useState<ExpertProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [photoUploading, setPhotoUploading] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // Load expert stats
      const statsResponse = await fetch('/api/experts/stats');
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData.stats);
      }

      // Load recent sessions
      const sessionsResponse = await fetch('/api/consultations?isExpert=true&limit=10');
      if (sessionsResponse.ok) {
        const sessionsData = await sessionsResponse.json();
        setRecentSessions(sessionsData.consultations);
      }

      // Load profile
      const profileResponse = await fetch('/api/experts/profile');
      if (profileResponse.ok) {
        const profileData = await profileResponse.json();
        setProfile(profileData.profile);
      }

    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setPhotoUploading(true);
    
    try {
      const formData = new FormData();
      formData.append('photo', file);

      const response = await fetch('/api/experts/profile/photo', {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        const result = await response.json();
        setProfile(prev => prev ? { ...prev, photoUrl: result.photoUrl } : null);
      }
    } catch (error) {
      console.error('Error uploading photo:', error);
    } finally {
      setPhotoUploading(false);
    }
  };

  const connectStripe = async () => {
    try {
      const response = await fetch('/api/experts/stripe/connect', {
        method: 'POST'
      });

      if (response.ok) {
        const result = await response.json();
        window.location.href = result.accountLinkUrl;
      }
    } catch (error) {
      console.error('Error connecting Stripe:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-950 pt-24 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 pt-24">
      {/* Header */}
      <div className="bg-gradient-to-br from-indigo-900/20 to-purple-900/20 border-b border-indigo-800/30">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="relative">
                <img
                  src={profile?.photoUrl || '/api/placeholder/80/80'}
                  alt={profile?.displayName || 'Expert'}
                  className="w-20 h-20 rounded-full object-cover border-2 border-indigo-500"
                />
                <label className="absolute bottom-0 right-0 p-1 bg-indigo-600 rounded-full cursor-pointer hover:bg-indigo-700 transition-colors">
                  <Camera className="w-4 h-4 text-white" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                    disabled={photoUploading}
                  />
                </label>
                {photoUploading && (
                  <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                  </div>
                )}
              </div>
              
              <div>
                <h1 className="text-3xl font-bold text-white">{profile?.displayName}</h1>
                <p className="text-gray-400">{profile?.title}</p>
                <div className="flex items-center gap-4 mt-2">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                    <span className="text-white font-medium">{stats?.averageRating?.toFixed(1) || 'N/A'}</span>
                  </div>
                  <div className="text-gray-400">
                    <span className="font-medium text-white">{stats?.totalSessions || 0}</span> sessions
                  </div>
                  <div className="text-gray-400">
                    <span className="font-medium text-white">${profile?.hourlyRate || 200}</span>/hour
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <Link
                href={`/experts/${profile?.id}`}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg flex items-center gap-2"
              >
                <Eye className="w-4 h-4" />
                View Public Profile
              </Link>
              <Link
                href="/expert-dashboard/settings"
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg flex items-center gap-2"
              >
                <Settings className="w-4 h-4" />
                Settings
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
        {/* Stripe Connect Alert */}
        {profile && !profile.stripeOnboardingComplete && (
          <div className="bg-yellow-900/20 border border-yellow-600/30 rounded-lg p-6 mb-8">
            <div className="flex items-start gap-4">
              <AlertTriangle className="w-6 h-6 text-yellow-500 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="font-semibold text-yellow-400 mb-2">Complete Your Payment Setup</h3>
                <p className="text-yellow-300 mb-4">
                  You need to complete your Stripe Connect setup to receive payments from consultations.
                </p>
                <button
                  onClick={connectStripe}
                  className="px-6 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg font-medium"
                >
                  Complete Setup
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="mb-8">
          <nav className="flex space-x-8 border-b border-gray-700">
            {[
              { id: 'overview', label: 'Overview', icon: BarChart3 },
              { id: 'earnings', label: 'Earnings', icon: DollarSign },
              { id: 'sessions', label: 'Sessions', icon: Calendar },
              { id: 'profile', label: 'Profile', icon: Edit },
              { id: 'analytics', label: 'Analytics', icon: TrendingUp }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                    activeTab === tab.id
                      ? 'border-indigo-500 text-indigo-400'
                      : 'border-transparent text-gray-400 hover:text-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-gray-800 rounded-xl p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Total Earnings</p>
                    <p className="text-2xl font-bold text-white">${stats?.totalEarnings?.toFixed(2) || '0.00'}</p>
                  </div>
                  <DollarSign className="w-8 h-8 text-green-500" />
                </div>
              </div>

              <div className="bg-gray-800 rounded-xl p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">This Month</p>
                    <p className="text-2xl font-bold text-white">${stats?.monthlyEarnings?.toFixed(2) || '0.00'}</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-indigo-500" />
                </div>
              </div>

              <div className="bg-gray-800 rounded-xl p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Total Sessions</p>
                    <p className="text-2xl font-bold text-white">{stats?.totalSessions || 0}</p>
                  </div>
                  <Calendar className="w-8 h-8 text-blue-500" />
                </div>
              </div>

              <div className="bg-gray-800 rounded-xl p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Avg Rating</p>
                    <p className="text-2xl font-bold text-white">{stats?.averageRating?.toFixed(1) || 'N/A'}</p>
                  </div>
                  <Star className="w-8 h-8 text-yellow-500" />
                </div>
              </div>
            </div>

            {/* Recent Sessions */}
            <div className="bg-gray-800 rounded-xl p-6">
              <h3 className="text-xl font-bold text-white mb-6">Recent Sessions</h3>
              <div className="space-y-4">
                {recentSessions.length > 0 ? (
                  recentSessions.slice(0, 5).map((session) => (
                    <div key={session.id} className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center">
                          <Users className="w-5 h-5 text-gray-400" />
                        </div>
                        <div>
                          <div className="font-medium text-white">{session.clientName}</div>
                          <div className="text-sm text-gray-400">
                            {new Date(session.date).toLocaleDateString()} • {session.duration} min
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-white">${session.earnings.toFixed(2)}</div>
                        {session.rating && (
                          <div className="text-sm text-gray-400 flex items-center gap-1">
                            <Star className="w-3 h-3 text-yellow-500 fill-current" />
                            {session.rating}
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-400 text-center py-8">No sessions yet</p>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'earnings' && (
          <div className="space-y-8">
            {/* Earnings Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gray-800 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Available for Payout</h3>
                <p className="text-3xl font-bold text-green-400">${stats?.pendingPayouts?.toFixed(2) || '0.00'}</p>
                <p className="text-sm text-gray-400 mt-2">
                  Next payout: {stats?.nextPayoutDate || 'No scheduled payout'}
                </p>
              </div>

              <div className="bg-gray-800 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">This Month</h3>
                <p className="text-3xl font-bold text-white">${stats?.monthlyEarnings?.toFixed(2) || '0.00'}</p>
                <p className="text-sm text-gray-400 mt-2">
                  From {stats?.totalSessions || 0} sessions
                </p>
              </div>

              <div className="bg-gray-800 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">All Time</h3>
                <p className="text-3xl font-bold text-white">${stats?.totalEarnings?.toFixed(2) || '0.00'}</p>
                <p className="text-sm text-gray-400 mt-2">
                  Platform fee: 10%
                </p>
              </div>
            </div>

            {/* Payment Setup */}
            <div className="bg-gray-800 rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white">Payment Setup</h3>
                {profile?.stripeOnboardingComplete ? (
                  <div className="flex items-center gap-2 text-green-400">
                    <CheckCircle className="w-5 h-5" />
                    <span>Verified</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-yellow-400">
                    <AlertTriangle className="w-5 h-5" />
                    <span>Setup Required</span>
                  </div>
                )}
              </div>

              {profile?.stripeOnboardingComplete ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-4 p-4 bg-green-900/20 border border-green-600/30 rounded-lg">
                    <CreditCard className="w-6 h-6 text-green-500" />
                    <div>
                      <div className="font-medium text-white">Stripe Connect Account Active</div>
                      <div className="text-sm text-gray-400">Payouts will be sent to your connected account</div>
                    </div>
                  </div>
                  <button className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg">
                    Manage Payout Settings
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-start gap-4 p-4 bg-yellow-900/20 border border-yellow-600/30 rounded-lg">
                    <AlertTriangle className="w-6 h-6 text-yellow-500 flex-shrink-0" />
                    <div>
                      <div className="font-medium text-white mb-2">Complete Payment Setup</div>
                      <p className="text-gray-400 text-sm mb-4">
                        Connect your bank account or debit card to receive payments from consultations.
                      </p>
                      <button
                        onClick={connectStripe}
                        className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium"
                      >
                        Connect Payment Account
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Payout History */}
            <div className="bg-gray-800 rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white">Payout History</h3>
                <button className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg">
                  <Download className="w-4 h-4" />
                  Export
                </button>
              </div>
              <div className="text-gray-400 text-center py-8">
                No payouts yet. Complete your first consultation to see payout history.
              </div>
            </div>
          </div>
        )}

        {activeTab === 'sessions' && (
          <div className="space-y-6">
            {/* Session Filters */}
            <div className="bg-gray-800 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-white">Session Management</h3>
                <div className="flex items-center gap-4">
                  <select className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white">
                    <option>All Sessions</option>
                    <option>Completed</option>
                    <option>Upcoming</option>
                    <option>Cancelled</option>
                  </select>
                  <button className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg">
                    <Filter className="w-4 h-4" />
                    Filter
                  </button>
                </div>
              </div>

              {/* Sessions List */}
              <div className="space-y-4">
                {recentSessions.map((session) => (
                  <div key={session.id} className="p-4 bg-gray-700 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gray-600 rounded-full flex items-center justify-center">
                          <Users className="w-6 h-6 text-gray-400" />
                        </div>
                        <div>
                          <div className="font-medium text-white">{session.clientName}</div>
                          <div className="text-sm text-gray-400">
                            {new Date(session.date).toLocaleDateString()} at{' '}
                            {new Date(session.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                          <div className="text-sm text-gray-400">
                            Duration: {session.duration} minutes
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-white">${session.earnings.toFixed(2)}</div>
                        <div className={`text-sm px-2 py-1 rounded ${
                          session.status === 'completed' ? 'bg-green-900/30 text-green-400' :
                          session.status === 'scheduled' ? 'bg-blue-900/30 text-blue-400' :
                          'bg-gray-600/30 text-gray-400'
                        }`}>
                          {session.status}
                        </div>
                        {session.rating && (
                          <div className="text-sm text-gray-400 flex items-center gap-1 mt-1">
                            <Star className="w-3 h-3 text-yellow-500 fill-current" />
                            {session.rating}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="space-y-6">
            <ProfileManagement profile={profile} onUpdate={loadDashboardData} />
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <AnalyticsDashboard stats={stats} />
          </div>
        )}
      </div>
    </div>
  );
}

// Profile Management Component
function ProfileManagement({ profile, onUpdate }: { profile: ExpertProfile | null; onUpdate: () => void }) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(profile || {});

  const handleSave = async () => {
    try {
      const response = await fetch('/api/experts/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setIsEditing(false);
        onUpdate();
      }
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  return (
    <div className="bg-gray-800 rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-white">Profile Management</h3>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg flex items-center gap-2"
        >
          <Edit className="w-4 h-4" />
          {isEditing ? 'Cancel' : 'Edit Profile'}
        </button>
      </div>

      {isEditing ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Display Name</label>
              <input
                type="text"
                value={formData.displayName || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, displayName: e.target.value }))}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Professional Title</label>
              <input
                type="text"
                value={formData.title || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Bio</label>
            <textarea
              value={formData.bio || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
              rows={4}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
            />
          </div>

          <div className="flex gap-4">
            <button
              onClick={handleSave}
              className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg"
            >
              Save Changes
            </button>
            <button
              onClick={() => setIsEditing(false)}
              className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-400">Display Name</label>
              <p className="text-white">{profile?.displayName || 'Not set'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400">Professional Title</label>
              <p className="text-white">{profile?.title || 'Not set'}</p>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400">Bio</label>
            <p className="text-white">{profile?.bio || 'Not set'}</p>
          </div>
        </div>
      )}
    </div>
  );
}

// Analytics Dashboard Component
function AnalyticsDashboard({ stats }: { stats: ExpertStats | null }) {
  return (
    <div className="space-y-6">
      <div className="bg-gray-800 rounded-xl p-6">
        <h3 className="text-xl font-bold text-white mb-6">Performance Analytics</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-gray-700 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-blue-500" />
              <span className="text-gray-400 text-sm">Response Time</span>
            </div>
            <p className="text-2xl font-bold text-white">{stats?.responseTime || 0}h</p>
            <p className="text-xs text-gray-400">Average response to bookings</p>
          </div>

          <div className="bg-gray-700 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span className="text-gray-400 text-sm">Completion Rate</span>
            </div>
            <p className="text-2xl font-bold text-white">{stats?.completionRate || 0}%</p>
            <p className="text-xs text-gray-400">Sessions completed successfully</p>
          </div>

          <div className="bg-gray-700 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Star className="w-4 h-4 text-yellow-500" />
              <span className="text-gray-400 text-sm">Client Satisfaction</span>
            </div>
            <p className="text-2xl font-bold text-white">{stats?.averageRating?.toFixed(1) || 'N/A'}</p>
            <p className="text-xs text-gray-400">Average rating from clients</p>
          </div>
        </div>
      </div>

      <div className="bg-gray-800 rounded-xl p-6">
        <h3 className="text-xl font-bold text-white mb-6">Marketing Insights</h3>
        <div className="text-gray-400 text-center py-8">
          Marketing analytics will be available once you complete more sessions.
        </div>
      </div>
    </div>
  );
}