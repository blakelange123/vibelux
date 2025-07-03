"use client"

import { useState } from 'react'
import Link from 'next/link'
import {
  Shield,
  Key,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  Users,
  Clock,
  AlertTriangle,
  CheckCircle,
  Smartphone,
  Globe,
  History,
  Download,
  Trash2,
  Settings,
  Plus,
  ExternalLink
} from 'lucide-react'

export function SecuritySettings() {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPasswords, setShowPasswords] = useState(false)
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false)
  const [loginNotifications, setLoginNotifications] = useState(true)

  const securityEvents = [
    {
      id: 1,
      type: 'login',
      description: 'Successful login from Chrome on Windows',
      location: 'San Francisco, CA',
      timestamp: '2024-02-15 14:32:00',
      risk: 'low'
    },
    {
      id: 2,
      type: 'password_change',
      description: 'Password changed',
      location: 'San Francisco, CA',
      timestamp: '2024-02-10 09:15:00',
      risk: 'low'
    },
    {
      id: 3,
      type: 'failed_login',
      description: 'Failed login attempt',
      location: 'Unknown Location',
      timestamp: '2024-02-08 22:45:00',
      risk: 'medium'
    }
  ]

  const activeSessions = [
    {
      id: 1,
      device: 'Chrome on Windows',
      location: 'San Francisco, CA',
      lastActive: '2024-02-15 14:32:00',
      current: true
    },
    {
      id: 2,
      device: 'Safari on iPhone',
      location: 'San Francisco, CA',
      lastActive: '2024-02-14 18:20:00',
      current: false
    }
  ]

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault()
    if (newPassword !== confirmPassword) {
      alert('Passwords do not match')
      return
    }
    // Handle password change
    alert('Password updated successfully')
    setCurrentPassword('')
    setNewPassword('')
    setConfirmPassword('')
  }

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'high': return 'text-red-400'
      case 'medium': return 'text-yellow-400'
      case 'low': return 'text-green-400'
      default: return 'text-gray-400'
    }
  }

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'login': return CheckCircle
      case 'password_change': return Key
      case 'failed_login': return AlertTriangle
      default: return History
    }
  }

  return (
    <div className="p-6 space-y-8">
      <div className="flex items-center gap-3 mb-6">
        <Shield className="w-6 h-6 text-blue-400" />
        <h2 className="text-2xl font-bold text-white">Security Settings</h2>
      </div>

      {/* Password Change */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Key className="w-5 h-5 text-purple-400" />
          Change Password
        </h3>
        
        <form onSubmit={handlePasswordChange} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Current Password</label>
            <div className="relative">
              <input
                type={showPasswords ? 'text' : 'password'}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:border-purple-500 text-white"
                required
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">New Password</label>
            <div className="relative">
              <input
                type={showPasswords ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:border-purple-500 text-white"
                required
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Confirm New Password</label>
            <div className="relative">
              <input
                type={showPasswords ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:border-purple-500 text-white"
                required
              />
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
              <input
                type="checkbox"
                checked={showPasswords}
                onChange={(e) => setShowPasswords(e.target.checked)}
                className="rounded"
              />
              Show passwords
            </label>
            
            <button
              type="submit"
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
            >
              Update Password
            </button>
          </div>
        </form>
      </div>

      {/* Two-Factor Authentication */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Smartphone className="w-5 h-5 text-green-400" />
          Two-Factor Authentication
        </h3>
        
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-white font-medium">Two-Factor Authentication</p>
            <p className="text-gray-400 text-sm">Add an extra layer of security to your account</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={twoFactorEnabled}
              onChange={(e) => setTwoFactorEnabled(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
          </label>
        </div>
        
        {twoFactorEnabled && (
          <div className="bg-gray-900 rounded-lg p-4">
            <p className="text-green-400 text-sm mb-3">✓ Two-factor authentication is enabled</p>
            <div className="flex gap-3">
              <button className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors">
                View Recovery Codes
              </button>
              <button className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors">
                Disable 2FA
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Security Preferences */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Settings className="w-5 h-5 text-yellow-400" />
          Security Preferences
        </h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white font-medium">Login Notifications</p>
              <p className="text-gray-400 text-sm">Get notified when someone logs into your account</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={loginNotifications}
                onChange={(e) => setLoginNotifications(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
            </label>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white font-medium">Session Timeout</p>
              <p className="text-gray-400 text-sm">Automatically log out after period of inactivity</p>
            </div>
            <select className="px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white">
              <option value="30">30 minutes</option>
              <option value="60">1 hour</option>
              <option value="240">4 hours</option>
              <option value="480">8 hours</option>
              <option value="never">Never</option>
            </select>
          </div>
        </div>
      </div>

      {/* Active Sessions */}
      <div className="bg-gray-800 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <Globe className="w-5 h-5 text-blue-400" />
            Active Sessions
          </h3>
          <Link 
            href="/settings/sessions"
            className="flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 transition-colors"
          >
            Manage All Sessions
            <ExternalLink className="w-4 h-4" />
          </Link>
        </div>
        
        <div className="space-y-3">
          {activeSessions.map(session => (
            <div key={session.id} className="flex items-center justify-between p-3 bg-gray-900 rounded-lg">
              <div className="flex items-center gap-3">
                <Smartphone className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-white font-medium flex items-center gap-2">
                    {session.device}
                    {session.current && (
                      <span className="px-2 py-1 bg-green-600 text-xs rounded-full">Current</span>
                    )}
                  </p>
                  <p className="text-gray-400 text-sm">{session.location}</p>
                  <p className="text-gray-500 text-xs">Last active: {session.lastActive}</p>
                </div>
              </div>
              {!session.current && (
                <button className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded transition-colors">
                  Revoke
                </button>
              )}
            </div>
          ))}
        </div>
        
        <button className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors">
          Revoke All Other Sessions
        </button>
      </div>

      {/* Security Events */}
      <div className="bg-gray-800 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <History className="w-5 h-5 text-orange-400" />
            Recent Security Events
          </h3>
          <button className="px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export Log
          </button>
        </div>
        
        <div className="space-y-3">
          {securityEvents.map(event => {
            const EventIcon = getEventIcon(event.type)
            return (
              <div key={event.id} className="flex items-center justify-between p-3 bg-gray-900 rounded-lg">
                <div className="flex items-center gap-3">
                  <EventIcon className={`w-5 h-5 ${getRiskColor(event.risk)}`} />
                  <div>
                    <p className="text-white font-medium">{event.description}</p>
                    <p className="text-gray-400 text-sm">{event.location}</p>
                    <p className="text-gray-500 text-xs">{event.timestamp}</p>
                  </div>
                </div>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  event.risk === 'high' ? 'bg-red-900 text-red-300' :
                  event.risk === 'medium' ? 'bg-yellow-900 text-yellow-300' :
                  'bg-green-900 text-green-300'
                }`}>
                  {event.risk} risk
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Account Security Score */}
      <div className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Security Score: 85/100</h3>
        <div className="w-full bg-gray-700 rounded-full h-2 mb-4">
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 h-2 rounded-full" style={{ width: '85%' }}></div>
        </div>
        <div className="space-y-2 text-sm">
          <p className="text-green-400">✓ Strong password</p>
          <p className="text-green-400">✓ Two-factor authentication enabled</p>
          <p className="text-yellow-400">⚠ Consider using a hardware security key</p>
          <p className="text-yellow-400">⚠ Review connected applications</p>
        </div>
      </div>
    </div>
  )
}