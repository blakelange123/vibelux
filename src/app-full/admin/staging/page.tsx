'use client';

import { useState, useEffect } from 'react';
import {
  ToggleLeft,
  Users,
  Flag,
  Settings,
  Plus,
  Trash2,
  Edit,
  Save,
  X,
  CheckCircle,
  AlertCircle,
  Copy,
  Download,
  Upload,
  RefreshCw,
  GitBranch,
  Target,
  Percent,
  Calendar,
  Filter,
  UserPlus,
  UserMinus,
  Activity
} from 'lucide-react';
import { stagingToggle, type FeatureFlag } from '@/lib/environment/staging-toggle';

export default function StagingPage() {
  const [activeTab, setActiveTab] = useState<'environment' | 'features' | 'users'>('environment');
  const [featureFlags, setFeatureFlags] = useState<FeatureFlag[]>([]);
  const [stagingUsers, setStagingUsers] = useState<any[]>([]);
  const [metrics, setMetrics] = useState({
    production: 0,
    staging: 0,
    development: 0,
    featureFlags: {
      total: 0,
      enabled: 0,
      staged: 0
    }
  });
  const [selectedFlag, setSelectedFlag] = useState<FeatureFlag | null>(null);
  const [isCreatingFlag, setIsCreatingFlag] = useState(false);
  const [newUserEmail, setNewUserEmail] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [flags, users, envMetrics] = await Promise.all([
        stagingToggle.getAllFeatureFlags(),
        stagingToggle.getStagingUsers(),
        stagingToggle.getEnvironmentMetrics()
      ]);

      setFeatureFlags(flags);
      setStagingUsers(users);
      setMetrics(envMetrics);
    } catch (error) {
      console.error('Failed to load staging data:', error);
    }
  };

  const handleCreateFlag = async () => {
    const newFlag: Omit<FeatureFlag, 'id' | 'createdAt' | 'updatedAt'> = {
      name: 'New Feature',
      key: `feature_${Date.now()}`,
      description: '',
      enabled: false,
      enabledInStaging: true,
      rolloutPercentage: 0,
      targetUsers: [],
      targetGroups: [],
      conditions: [],
      createdBy: 'current-user'
    };

    try {
      const created = await stagingToggle.upsertFeatureFlag(newFlag);
      setFeatureFlags([created, ...featureFlags]);
      setSelectedFlag(created);
      setIsCreatingFlag(true);
    } catch (error) {
      console.error('Failed to create feature flag:', error);
    }
  };

  const handleSaveFlag = async (flag: FeatureFlag) => {
    try {
      await stagingToggle.upsertFeatureFlag(flag);
      await loadData();
      setIsCreatingFlag(false);
    } catch (error) {
      console.error('Failed to save feature flag:', error);
    }
  };

  const handleDeleteFlag = async (key: string) => {
    if (confirm('Are you sure you want to delete this feature flag?')) {
      try {
        await stagingToggle.deleteFeatureFlag(key, 'current-user');
        await loadData();
        setSelectedFlag(null);
      } catch (error) {
        console.error('Failed to delete feature flag:', error);
      }
    }
  };

  const handleAddUserToStaging = async () => {
    if (!newUserEmail) return;

    try {
      // In production, look up user by email
      const userId = `user_${Date.now()}`; // Placeholder
      await stagingToggle.addUsersToStaging([userId], 'current-user');
      await loadData();
      setNewUserEmail('');
    } catch (error) {
      console.error('Failed to add user to staging:', error);
    }
  };

  const handleRemoveUserFromStaging = async (userId: string) => {
    try {
      await stagingToggle.toggleUserEnvironment(userId, 'production', 'current-user');
      await loadData();
    } catch (error) {
      console.error('Failed to remove user from staging:', error);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Staging Environment</h1>
        <p className="text-gray-400">Manage feature flags and staging users</p>
      </div>

      {/* Environment Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
          <div className="flex items-center justify-between mb-2">
            <Users className="w-8 h-8 text-blue-400" />
            <span className="text-xs text-gray-500">Production</span>
          </div>
          <p className="text-2xl font-bold text-white">{metrics.production}</p>
          <p className="text-gray-400 text-sm">Users</p>
        </div>

        <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
          <div className="flex items-center justify-between mb-2">
            <GitBranch className="w-8 h-8 text-yellow-400" />
            <span className="text-xs text-gray-500">Staging</span>
          </div>
          <p className="text-2xl font-bold text-white">{metrics.staging}</p>
          <p className="text-gray-400 text-sm">Users</p>
        </div>

        <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
          <div className="flex items-center justify-between mb-2">
            <Flag className="w-8 h-8 text-green-400" />
            <span className="text-xs text-gray-500">Active</span>
          </div>
          <p className="text-2xl font-bold text-white">{metrics.featureFlags.enabled}</p>
          <p className="text-gray-400 text-sm">Features</p>
        </div>

        <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
          <div className="flex items-center justify-between mb-2">
            <Activity className="w-8 h-8 text-purple-400" />
            <span className="text-xs text-gray-500">Staged</span>
          </div>
          <p className="text-2xl font-bold text-white">{metrics.featureFlags.staged}</p>
          <p className="text-gray-400 text-sm">Features</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 mb-6">
        {[
          { id: 'environment', label: 'Environment', icon: GitBranch },
          { id: 'features', label: 'Feature Flags', icon: Flag },
          { id: 'users', label: 'Staging Users', icon: Users }
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Environment Tab */}
      {activeTab === 'environment' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Environment Configuration</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Production API
                </label>
                <input
                  type="text"
                  value="https://api.vibelux.com"
                  readOnly
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Staging API
                </label>
                <input
                  type="text"
                  value="https://staging-api.vibelux.com"
                  readOnly
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                />
              </div>

              <div className="pt-4 border-t border-gray-800">
                <h3 className="text-sm font-medium text-gray-300 mb-3">Staging Features</h3>
                <div className="space-y-2">
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      defaultChecked
                      className="w-4 h-4 text-purple-600 bg-gray-800 border-gray-600 rounded focus:ring-purple-500"
                    />
                    <span className="text-white">Debug mode enabled</span>
                  </label>
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      defaultChecked
                      className="w-4 h-4 text-purple-600 bg-gray-800 border-gray-600 rounded focus:ring-purple-500"
                    />
                    <span className="text-white">Test payments enabled</span>
                  </label>
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      defaultChecked
                      className="w-4 h-4 text-purple-600 bg-gray-800 border-gray-600 rounded focus:ring-purple-500"
                    />
                    <span className="text-white">Performance monitoring</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Quick Actions</h2>
            
            <div className="space-y-3">
              <button className="w-full p-4 bg-gray-800 hover:bg-gray-700 rounded-lg text-left transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Copy className="w-5 h-5 text-purple-400" />
                    <div>
                      <p className="text-white font-medium">Clone to Staging</p>
                      <p className="text-gray-400 text-sm">Copy production data to staging</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-500" />
                </div>
              </button>

              <button className="w-full p-4 bg-gray-800 hover:bg-gray-700 rounded-lg text-left transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <RefreshCw className="w-5 h-5 text-blue-400" />
                    <div>
                      <p className="text-white font-medium">Sync Feature Flags</p>
                      <p className="text-gray-400 text-sm">Update staging with latest flags</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-500" />
                </div>
              </button>

              <button className="w-full p-4 bg-gray-800 hover:bg-gray-700 rounded-lg text-left transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <UserMinus className="w-5 h-5 text-red-400" />
                    <div>
                      <p className="text-white font-medium">Clear Staging Users</p>
                      <p className="text-gray-400 text-sm">Move all users back to production</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-500" />
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Feature Flags Tab */}
      {activeTab === 'features' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Flag List */}
          <div className="lg:col-span-1">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">Feature Flags</h2>
              <button
                onClick={handleCreateFlag}
                className="flex items-center gap-2 px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                New
              </button>
            </div>

            <div className="space-y-3">
              {featureFlags.map(flag => (
                <div
                  key={flag.id}
                  onClick={() => setSelectedFlag(flag)}
                  className={`p-4 bg-gray-800 rounded-lg cursor-pointer transition-all ${
                    selectedFlag?.id === flag.id
                      ? 'ring-2 ring-purple-500'
                      : 'hover:bg-gray-700'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-medium text-white">{flag.name}</h3>
                    <div className="flex items-center gap-2">
                      {flag.enabled && (
                        <span className="w-2 h-2 bg-green-500 rounded-full" title="Enabled in production" />
                      )}
                      {flag.enabledInStaging && (
                        <span className="w-2 h-2 bg-yellow-500 rounded-full" title="Enabled in staging" />
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-gray-400 mb-2">{flag.key}</p>
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Percent className="w-3 h-3" />
                      {flag.rolloutPercentage}%
                    </span>
                    {flag.targetUsers && flag.targetUsers.length > 0 && (
                      <span className="flex items-center gap-1">
                        <Target className="w-3 h-3" />
                        {flag.targetUsers.length}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Flag Editor */}
          <div className="lg:col-span-2">
            {selectedFlag ? (
              <div className="bg-gray-800 rounded-lg p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-white">Edit Feature Flag</h2>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleSaveFlag(selectedFlag)}
                      className="p-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-white transition-colors"
                    >
                      <Save className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteFlag(selectedFlag.key)}
                      className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-red-400 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Flag Name
                    </label>
                    <input
                      type="text"
                      value={selectedFlag.name}
                      onChange={(e) => setSelectedFlag({
                        ...selectedFlag,
                        name: e.target.value
                      })}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-purple-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Flag Key
                    </label>
                    <input
                      type="text"
                      value={selectedFlag.key}
                      onChange={(e) => setSelectedFlag({
                        ...selectedFlag,
                        key: e.target.value
                      })}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-purple-500 focus:outline-none"
                      readOnly={!isCreatingFlag}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Description
                    </label>
                    <textarea
                      value={selectedFlag.description || ''}
                      onChange={(e) => setSelectedFlag({
                        ...selectedFlag,
                        description: e.target.value
                      })}
                      rows={3}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-purple-500 focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <label className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={selectedFlag.enabled}
                        onChange={(e) => setSelectedFlag({
                          ...selectedFlag,
                          enabled: e.target.checked
                        })}
                        className="w-4 h-4 text-purple-600 bg-gray-700 border-gray-600 rounded focus:ring-purple-500"
                      />
                      <span className="text-white">Enabled in Production</span>
                    </label>

                    <label className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={selectedFlag.enabledInStaging}
                        onChange={(e) => setSelectedFlag({
                          ...selectedFlag,
                          enabledInStaging: e.target.checked
                        })}
                        className="w-4 h-4 text-purple-600 bg-gray-700 border-gray-600 rounded focus:ring-purple-500"
                      />
                      <span className="text-white">Enabled in Staging</span>
                    </label>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Rollout Percentage
                    </label>
                    <div className="flex items-center gap-4">
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={selectedFlag.rolloutPercentage}
                        onChange={(e) => setSelectedFlag({
                          ...selectedFlag,
                          rolloutPercentage: Number(e.target.value)
                        })}
                        className="flex-1"
                      />
                      <span className="w-12 text-right text-white">{selectedFlag.rolloutPercentage}%</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-gray-800 rounded-lg p-12 text-center">
                <Flag className="w-16 h-16 text-gray-700 mx-auto mb-4" />
                <p className="text-gray-400">Select a feature flag to edit</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Staging Users Tab */}
      {activeTab === 'users' && (
        <div className="space-y-6">
          <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">Add User to Staging</h2>
            </div>
            
            <div className="flex items-center gap-4">
              <input
                type="email"
                placeholder="Enter user email"
                value={newUserEmail}
                onChange={(e) => setNewUserEmail(e.target.value)}
                className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none"
              />
              <button
                onClick={handleAddUserToStaging}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                Add to Staging
              </button>
            </div>
          </div>

          <div className="bg-gray-900 rounded-lg border border-gray-800">
            <div className="p-6 border-b border-gray-800">
              <h2 className="text-lg font-semibold text-white">Staging Users ({stagingUsers.length})</h2>
            </div>
            
            <div className="divide-y divide-gray-800">
              {stagingUsers.map(user => (
                <div key={user.userId} className="p-6 hover:bg-gray-800 transition-colors">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-medium">{user.name || 'Unknown User'}</p>
                      <p className="text-gray-400 text-sm">{user.email}</p>
                      <p className="text-gray-500 text-xs mt-1">
                        Added {new Date(user.addedAt).toLocaleDateString()} by {user.addedBy}
                      </p>
                    </div>
                    <button
                      onClick={() => handleRemoveUserFromStaging(user.userId)}
                      className="px-3 py-1 bg-red-600/20 text-red-400 rounded-lg hover:bg-red-600/30 transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
              
              {stagingUsers.length === 0 && (
                <div className="p-12 text-center">
                  <Users className="w-12 h-12 text-gray-700 mx-auto mb-4" />
                  <p className="text-gray-400">No users in staging environment</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}