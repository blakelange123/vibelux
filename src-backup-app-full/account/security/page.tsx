'use client';

import React, { useState } from 'react';
import { useUser } from '@clerk/nextjs';
import {
  Shield,
  Key,
  Smartphone,
  Monitor,
  Globe,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Mail,
  Lock,
  Eye,
  EyeOff,
  RefreshCw,
  Trash2,
  Download,
  ChevronRight,
  Info
} from 'lucide-react';
import Link from 'next/link';

interface Session {
  id: string;
  device: string;
  browser: string;
  location: string;
  ipAddress: string;
  lastActive: Date;
  current: boolean;
}

export default function SecurityPage() {
  const { user } = useUser();
  const [showPassword, setShowPassword] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [showSetup2FA, setShowSetup2FA] = useState(false);
  
  // Mock sessions data
  const [sessions] = useState<Session[]>([
    {
      id: '1',
      device: 'MacBook Pro',
      browser: 'Chrome 120',
      location: 'San Francisco, CA',
      ipAddress: '192.168.1.1',
      lastActive: new Date(),
      current: true
    },
    {
      id: '2',
      device: 'iPhone 15',
      browser: 'Safari',
      location: 'San Francisco, CA',
      ipAddress: '192.168.1.2',
      lastActive: new Date(Date.now() - 3600000),
      current: false
    }
  ]);

  const [securityEvents] = useState([
    {
      id: '1',
      type: 'login',
      description: 'Successful login',
      location: 'San Francisco, CA',
      timestamp: new Date(),
      status: 'success'
    },
    {
      id: '2',
      type: 'password_change',
      description: 'Password changed',
      location: 'San Francisco, CA',
      timestamp: new Date(Date.now() - 86400000),
      status: 'success'
    },
    {
      id: '3',
      type: 'login_failed',
      description: 'Failed login attempt',
      location: 'Unknown',
      timestamp: new Date(Date.now() - 172800000),
      status: 'failed'
    }
  ]);

  const handleRevokeSessions = () => {
  };

  const handleEnable2FA = () => {
    setShowSetup2FA(true);
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-sm text-gray-400 mb-4">
          <Link href="/account/profile" className="hover:text-white">Account</Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-white">Security</span>
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">Security Settings</h1>
        <p className="text-gray-400">Manage your account security and authentication preferences</p>
      </div>

      {/* Security Score */}
      <div className="bg-gray-800 rounded-xl p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-white">Security Score</h2>
          <div className="flex items-center gap-2">
            <div className="text-3xl font-bold text-yellow-400">75%</div>
            <Shield className="w-8 h-8 text-yellow-400" />
          </div>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2 mb-4">
          <div className="bg-yellow-400 h-2 rounded-full" style={{ width: '75%' }}></div>
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-400" />
            <span className="text-sm text-gray-300">Strong password</span>
          </div>
          <div className="flex items-center gap-3">
            <XCircle className="w-5 h-5 text-red-400" />
            <span className="text-sm text-gray-300">2FA not enabled</span>
          </div>
          <div className="flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-400" />
            <span className="text-sm text-gray-300">Verified email</span>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        {/* Password & Authentication */}
        <div className="bg-gray-800 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Password & Authentication</h3>
          
          {/* Password */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
            <div className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
              <div className="flex items-center gap-3">
                <Lock className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-white">••••••••••••</p>
                  <p className="text-xs text-gray-400">Last changed 30 days ago</p>
                </div>
              </div>
              <button className="px-3 py-1 bg-gray-600 hover:bg-gray-500 text-white text-sm rounded-lg transition-colors">
                Change
              </button>
            </div>
          </div>

          {/* Two-Factor Authentication */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Two-Factor Authentication
            </label>
            <div className="p-4 bg-gray-700 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <Smartphone className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-white">Authenticator App</p>
                    <p className="text-xs text-gray-400">
                      {twoFactorEnabled ? 'Enabled' : 'Not configured'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleEnable2FA}
                  className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                    twoFactorEnabled
                      ? 'bg-red-600/20 hover:bg-red-600/30 text-red-400'
                      : 'bg-green-600 hover:bg-green-700 text-white'
                  }`}
                >
                  {twoFactorEnabled ? 'Disable' : 'Enable'}
                </button>
              </div>
              {!twoFactorEnabled && (
                <div className="p-3 bg-yellow-900/20 border border-yellow-600/30 rounded-lg">
                  <div className="flex gap-2">
                    <AlertTriangle className="w-4 h-4 text-yellow-400 flex-shrink-0" />
                    <p className="text-xs text-yellow-400">
                      Enable 2FA for enhanced account security
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Recovery Options */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Recovery Options
            </label>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-white text-sm">Recovery Email</p>
                    <p className="text-xs text-gray-400">{user?.primaryEmailAddress?.emailAddress}</p>
                  </div>
                </div>
                <CheckCircle className="w-5 h-5 text-green-400" />
              </div>
              <button className="w-full p-4 bg-gray-700 hover:bg-gray-600 rounded-lg text-left transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Key className="w-5 h-5 text-gray-400" />
                    <span className="text-white text-sm">Backup Codes</span>
                  </div>
                  <span className="text-gray-400 text-sm">Generate →</span>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Connected Accounts */}
        <div className="bg-gray-800 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Connected Accounts</h3>
          
          <div className="space-y-3 mb-6">
            <div className="p-4 bg-gray-700 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-sm">G</span>
                  </div>
                  <div>
                    <p className="text-white">Google</p>
                    <p className="text-xs text-gray-400">Connected for sign-in</p>
                  </div>
                </div>
                <button className="text-red-400 hover:text-red-300 text-sm">
                  Disconnect
                </button>
              </div>
            </div>
          </div>

          <button className="w-full p-4 bg-gray-700 hover:bg-gray-600 rounded-lg text-center transition-colors">
            <span className="text-white">+ Connect Another Account</span>
          </button>

          {/* Privacy Settings */}
          <div className="mt-6">
            <h4 className="text-sm font-medium text-gray-300 mb-3">Privacy Settings</h4>
            <div className="space-y-3">
              <label className="flex items-center justify-between p-3 bg-gray-700 rounded-lg cursor-pointer">
                <span className="text-sm text-white">Show profile to search engines</span>
                <input type="checkbox" className="toggle" defaultChecked />
              </label>
              <label className="flex items-center justify-between p-3 bg-gray-700 rounded-lg cursor-pointer">
                <span className="text-sm text-white">Allow contact from verified users</span>
                <input type="checkbox" className="toggle" defaultChecked />
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Active Sessions */}
      <div className="bg-gray-800 rounded-xl p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Active Sessions</h3>
          <button
            onClick={handleRevokeSessions}
            className="text-sm text-red-400 hover:text-red-300"
          >
            Revoke All Other Sessions
          </button>
        </div>
        
        <div className="space-y-3">
          {sessions.map(session => (
            <div key={session.id} className="p-4 bg-gray-700 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Monitor className="w-5 h-5 text-gray-400" />
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-white font-medium">{session.device}</p>
                      {session.current && (
                        <span className="px-2 py-0.5 bg-green-600/20 text-green-400 text-xs rounded">
                          Current
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-400">
                      {session.browser} • {session.location} • {session.ipAddress}
                    </p>
                    <p className="text-xs text-gray-500">
                      Last active: {session.lastActive.toLocaleString()}
                    </p>
                  </div>
                </div>
                {!session.current && (
                  <button className="text-red-400 hover:text-red-300">
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Security Events */}
      <div className="bg-gray-800 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Recent Security Events</h3>
          <button className="text-sm text-gray-400 hover:text-white flex items-center gap-1">
            <Download className="w-4 h-4" />
            Export Log
          </button>
        </div>
        
        <div className="space-y-3">
          {securityEvents.map(event => (
            <div key={event.id} className="p-4 bg-gray-700 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {event.status === 'success' ? (
                    <CheckCircle className="w-5 h-5 text-green-400" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-400" />
                  )}
                  <div>
                    <p className="text-white">{event.description}</p>
                    <p className="text-sm text-gray-400">
                      {event.location} • {event.timestamp.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <button className="w-full mt-4 p-3 bg-gray-700 hover:bg-gray-600 rounded-lg text-center transition-colors">
          <span className="text-white text-sm">View All Security Events</span>
        </button>
      </div>

      {/* 2FA Setup Modal */}
      {showSetup2FA && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl p-6 max-w-md w-full">
            <h3 className="text-xl font-semibold text-white mb-4">Enable Two-Factor Authentication</h3>
            <div className="space-y-4">
              <div className="p-4 bg-gray-700 rounded-lg">
                <p className="text-sm text-gray-300 mb-3">
                  Scan this QR code with your authenticator app:
                </p>
                <div className="bg-white p-4 rounded-lg mb-3">
                  <div className="w-48 h-48 bg-gray-200 mx-auto"></div>
                </div>
                <p className="text-xs text-gray-400 text-center">
                  Or enter this code manually: ABCD-EFGH-IJKL-MNOP
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Enter verification code
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                  placeholder="000000"
                />
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={() => setShowSetup2FA(false)}
                  className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setTwoFactorEnabled(true);
                    setShowSetup2FA(false);
                  }}
                  className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg"
                >
                  Enable 2FA
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}