'use client';

import React, { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import {
  Key,
  Plus,
  Copy,
  Eye,
  EyeOff,
  Trash2,
  RefreshCw,
  Shield,
  Clock,
  Activity,
  AlertTriangle,
  CheckCircle,
  Info,
  Code,
  Terminal,
  Globe,
  Lock,
  Zap,
  Calendar,
  ChevronRight,
  Download,
  Settings
} from 'lucide-react';
import Link from 'next/link';

interface ApiKey {
  id: string;
  name: string;
  key: string;
  keyPreview: string;
  permissions: string[];
  rateLimit: number;
  environment: 'development' | 'staging' | 'production';
  expiresAt?: Date;
  lastUsed?: Date;
  createdAt: Date;
  status: 'active' | 'expired' | 'revoked';
  usage: {
    today: number;
    thisMonth: number;
    total: number;
  };
}

export default function ApiKeysPage() {
  const { user } = useUser();
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showKey, setShowKey] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [newKeyForm, setNewKeyForm] = useState({
    name: '',
    environment: 'development',
    permissions: [] as string[],
    expiresIn: '90days',
    rateLimit: 1000
  });

  // Mock API keys data
  useEffect(() => {
    setApiKeys([
      {
        id: '1',
        name: 'Production API',
        key: 'sk_live_abcdefghijklmnopqrstuvwxyz123456',
        keyPreview: 'sk_live_...3456',
        permissions: ['read', 'write', 'delete'],
        rateLimit: 10000,
        environment: 'production',
        lastUsed: new Date(Date.now() - 3600000),
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        status: 'active',
        usage: {
          today: 1234,
          thisMonth: 45678,
          total: 234567
        }
      },
      {
        id: '2',
        name: 'Development Key',
        key: 'sk_test_zyxwvutsrqponmlkjihgfedcba654321',
        keyPreview: 'sk_test_...4321',
        permissions: ['read', 'write'],
        rateLimit: 1000,
        environment: 'development',
        lastUsed: new Date(),
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        status: 'active',
        usage: {
          today: 567,
          thisMonth: 8901,
          total: 12345
        }
      }
    ]);
  }, []);

  const availablePermissions = [
    { id: 'read', name: 'Read', description: 'Read access to resources' },
    { id: 'write', name: 'Write', description: 'Create and update resources' },
    { id: 'delete', name: 'Delete', description: 'Delete resources' },
    { id: 'admin', name: 'Admin', description: 'Full administrative access' }
  ];

  const handleCreateKey = () => {
    const newKey: ApiKey = {
      id: Date.now().toString(),
      name: newKeyForm.name,
      key: `sk_${newKeyForm.environment === 'production' ? 'live' : 'test'}_${crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF.toString(36).substring(2, 15)}`,
      keyPreview: 'sk_...',
      permissions: newKeyForm.permissions,
      rateLimit: newKeyForm.rateLimit,
      environment: newKeyForm.environment as any,
      createdAt: new Date(),
      status: 'active',
      usage: {
        today: 0,
        thisMonth: 0,
        total: 0
      }
    };

    setApiKeys([newKey, ...apiKeys]);
    setShowCreateModal(false);
    setNewKeyForm({
      name: '',
      environment: 'development',
      permissions: [],
      expiresIn: '90days',
      rateLimit: 1000
    });
    setShowKey(newKey.id);
  };

  const handleCopyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleRevokeKey = (keyId: string) => {
    if (!confirm('Are you sure you want to revoke this API key? This action cannot be undone.')) return;
    
    setApiKeys(apiKeys.map(key => 
      key.id === keyId ? { ...key, status: 'revoked' as const } : key
    ));
  };

  const handleRegenerateKey = (keyId: string) => {
    if (!confirm('Are you sure you want to regenerate this API key? The old key will stop working immediately.')) return;
    
    const newKey = `sk_${crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF.toString(36).substring(2, 15)}`;
    setApiKeys(apiKeys.map(key => 
      key.id === keyId ? { ...key, key: newKey } : key
    ));
    setShowKey(keyId);
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-sm text-gray-400 mb-4">
          <Link href="/developer" className="hover:text-white">Developer</Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-white">API Keys</span>
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">API Keys</h1>
        <p className="text-gray-400">Manage your API keys and access tokens</p>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gray-800 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Active Keys</p>
              <p className="text-2xl font-bold text-white">
                {apiKeys.filter(k => k.status === 'active').length}
              </p>
            </div>
            <Key className="w-8 h-8 text-gray-600" />
          </div>
        </div>
        <div className="bg-gray-800 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">API Calls Today</p>
              <p className="text-2xl font-bold text-white">
                {apiKeys.reduce((sum, key) => sum + key.usage.today, 0).toLocaleString()}
              </p>
            </div>
            <Activity className="w-8 h-8 text-gray-600" />
          </div>
        </div>
        <div className="bg-gray-800 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">This Month</p>
              <p className="text-2xl font-bold text-white">
                {apiKeys.reduce((sum, key) => sum + key.usage.thisMonth, 0).toLocaleString()}
              </p>
            </div>
            <Calendar className="w-8 h-8 text-gray-600" />
          </div>
        </div>
        <div className="bg-gray-800 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Rate Limit</p>
              <p className="text-2xl font-bold text-white">10K/hr</p>
            </div>
            <Zap className="w-8 h-8 text-gray-600" />
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Create New Key
          </button>
          <Link
            href="/developer/docs"
            className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg flex items-center gap-2"
          >
            <Code className="w-4 h-4" />
            API Documentation
          </Link>
        </div>
        <button className="p-2 hover:bg-gray-800 rounded-lg transition-colors">
          <Settings className="w-5 h-5 text-gray-400" />
        </button>
      </div>

      {/* API Keys List */}
      <div className="space-y-4">
        {apiKeys.map((apiKey) => (
          <div
            key={apiKey.id}
            className={`bg-gray-800 rounded-xl p-6 ${
              apiKey.status !== 'active' ? 'opacity-60' : ''
            }`}
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-3">
                  <h3 className="text-lg font-semibold text-white">{apiKey.name}</h3>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    apiKey.environment === 'production' 
                      ? 'bg-red-600/20 text-red-400'
                      : apiKey.environment === 'staging'
                      ? 'bg-yellow-600/20 text-yellow-400'
                      : 'bg-blue-600/20 text-blue-400'
                  }`}>
                    {apiKey.environment}
                  </span>
                  {apiKey.status !== 'active' && (
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      apiKey.status === 'expired'
                        ? 'bg-yellow-600/20 text-yellow-400'
                        : 'bg-red-600/20 text-red-400'
                    }`}>
                      {apiKey.status}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-4 mt-2 text-sm text-gray-400">
                  <span>Created {new Date(apiKey.createdAt).toLocaleDateString()}</span>
                  {apiKey.lastUsed && (
                    <span>Last used {new Date(apiKey.lastUsed).toLocaleString()}</span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {apiKey.status === 'active' && (
                  <>
                    <button
                      onClick={() => handleRegenerateKey(apiKey.id)}
                      className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                      title="Regenerate Key"
                    >
                      <RefreshCw className="w-4 h-4 text-gray-400" />
                    </button>
                    <button
                      onClick={() => handleRevokeKey(apiKey.id)}
                      className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                      title="Revoke Key"
                    >
                      <Trash2 className="w-4 h-4 text-red-400" />
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* API Key Display */}
            <div className="bg-gray-900 rounded-lg p-4 mb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <Key className="w-4 h-4 text-gray-400" />
                  <code className="text-sm text-gray-300 font-mono">
                    {showKey === apiKey.id ? apiKey.key : apiKey.keyPreview}
                  </code>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowKey(showKey === apiKey.id ? null : apiKey.id)}
                    className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                  >
                    {showKey === apiKey.id ? (
                      <EyeOff className="w-4 h-4 text-gray-400" />
                    ) : (
                      <Eye className="w-4 h-4 text-gray-400" />
                    )}
                  </button>
                  <button
                    onClick={() => handleCopyKey(apiKey.key)}
                    className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                  >
                    {copiedKey === apiKey.key ? (
                      <CheckCircle className="w-4 h-4 text-green-400" />
                    ) : (
                      <Copy className="w-4 h-4 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Key Details */}
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-400 mb-1">Permissions</p>
                <div className="flex flex-wrap gap-1">
                  {apiKey.permissions.map(perm => (
                    <span key={perm} className="px-2 py-1 bg-gray-700 text-xs text-gray-300 rounded">
                      {perm}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-400 mb-1">Rate Limit</p>
                <p className="text-white">{apiKey.rateLimit.toLocaleString()} requests/hour</p>
              </div>
              <div>
                <p className="text-sm text-gray-400 mb-1">Usage</p>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Today:</span>
                    <span className="text-white">{apiKey.usage.today.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">This Month:</span>
                    <span className="text-white">{apiKey.usage.thisMonth.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Example Usage */}
      <div className="mt-8 bg-gray-800 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Terminal className="w-5 h-5" />
          Quick Start
        </h3>
        <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
          <pre className="text-sm text-gray-300">
{`// Example API request
const response = await fetch('https://api.vibelux.com/v1/projects', {
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
});

const data = await response.json();`}
          </pre>
        </div>
        <div className="mt-4 flex items-center gap-4">
          <Link
            href="/developer/docs"
            className="text-sm text-green-400 hover:text-green-300 flex items-center gap-1"
          >
            View Full Documentation
            <ChevronRight className="w-4 h-4" />
          </Link>
          <Link
            href="/developer/examples"
            className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1"
          >
            Code Examples
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Security Notice */}
      <div className="mt-6 p-4 bg-yellow-900/20 border border-yellow-600/30 rounded-lg">
        <div className="flex gap-3">
          <Shield className="w-5 h-5 text-yellow-400 flex-shrink-0" />
          <div className="text-sm">
            <p className="text-yellow-400 font-medium mb-1">Security Best Practices</p>
            <ul className="text-gray-300 space-y-1">
              <li>• Never expose API keys in client-side code or public repositories</li>
              <li>• Use environment-specific keys (dev, staging, production)</li>
              <li>• Rotate keys regularly and revoke unused ones</li>
              <li>• Set appropriate permissions and rate limits for each key</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Create API Key Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl p-6 max-w-lg w-full">
            <h3 className="text-xl font-semibold text-white mb-6">Create New API Key</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Key Name
                </label>
                <input
                  type="text"
                  value={newKeyForm.name}
                  onChange={(e) => setNewKeyForm({...newKeyForm, name: e.target.value})}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                  placeholder="e.g., Production API"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Environment
                </label>
                <select
                  value={newKeyForm.environment}
                  onChange={(e) => setNewKeyForm({...newKeyForm, environment: e.target.value})}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                >
                  <option value="development">Development</option>
                  <option value="staging">Staging</option>
                  <option value="production">Production</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Permissions
                </label>
                <div className="space-y-2">
                  {availablePermissions.map(perm => (
                    <label key={perm.id} className="flex items-start gap-3 p-3 bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-600">
                      <input
                        type="checkbox"
                        checked={newKeyForm.permissions.includes(perm.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setNewKeyForm({
                              ...newKeyForm,
                              permissions: [...newKeyForm.permissions, perm.id]
                            });
                          } else {
                            setNewKeyForm({
                              ...newKeyForm,
                              permissions: newKeyForm.permissions.filter(p => p !== perm.id)
                            });
                          }
                        }}
                        className="mt-1"
                      />
                      <div>
                        <p className="text-white font-medium">{perm.name}</p>
                        <p className="text-sm text-gray-400">{perm.description}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Rate Limit (requests/hour)
                </label>
                <input
                  type="number"
                  value={newKeyForm.rateLimit}
                  onChange={(e) => setNewKeyForm({...newKeyForm, rateLimit: parseInt(e.target.value) || 0})}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Expires In
                </label>
                <select
                  value={newKeyForm.expiresIn}
                  onChange={(e) => setNewKeyForm({...newKeyForm, expiresIn: e.target.value})}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                >
                  <option value="30days">30 days</option>
                  <option value="90days">90 days</option>
                  <option value="1year">1 year</option>
                  <option value="never">Never</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateKey}
                disabled={!newKeyForm.name || newKeyForm.permissions.length === 0}
                className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Create Key
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}