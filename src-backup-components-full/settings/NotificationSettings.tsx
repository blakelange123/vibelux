"use client"

import { useState } from 'react'
import {
  Bell,
  Mail,
  MessageSquare,
  Smartphone,
  Monitor,
  AlertTriangle,
  CheckCircle,
  Info,
  Clock,
  Volume2,
  VolumeX,
  Settings,
  Zap,
  TrendingUp,
  Users,
  Calendar,
  Leaf
} from 'lucide-react'

interface NotificationSetting {
  id: string
  title: string
  description: string
  email: boolean
  push: boolean
  sms: boolean
  inApp: boolean
  category: string
  icon: React.ElementType
}

export function NotificationSettings() {
  const [notificationSettings, setNotificationSettings] = useState<NotificationSetting[]>([
    {
      id: 'system-alerts',
      title: 'System Alerts',
      description: 'Critical system issues and downtime notifications',
      email: true,
      push: true,
      sms: true,
      inApp: true,
      category: 'System',
      icon: AlertTriangle
    },
    {
      id: 'cultivation-alerts',
      title: 'Cultivation Alerts',
      description: 'Temperature, humidity, and environmental warnings',
      email: true,
      push: true,
      sms: false,
      inApp: true,
      category: 'Cultivation',
      icon: Leaf
    },
    {
      id: 'equipment-status',
      title: 'Equipment Status',
      description: 'Equipment failures, maintenance reminders',
      email: true,
      push: true,
      sms: false,
      inApp: true,
      category: 'Equipment',
      icon: Settings
    },
    {
      id: 'energy-usage',
      title: 'Energy Usage',
      description: 'Power consumption alerts and efficiency reports',
      email: false,
      push: false,
      sms: false,
      inApp: true,
      category: 'Energy',
      icon: Zap
    },
    {
      id: 'yield-predictions',
      title: 'Yield Predictions',
      description: 'ML-based yield forecasts and growth insights',
      email: true,
      push: false,
      sms: false,
      inApp: true,
      category: 'Analytics',
      icon: TrendingUp
    },
    {
      id: 'team-activity',
      title: 'Team Activity',
      description: 'Team member actions and collaboration updates',
      email: false,
      push: true,
      sms: false,
      inApp: true,
      category: 'Team',
      icon: Users
    },
    {
      id: 'schedule-reminders',
      title: 'Schedule Reminders',
      description: 'Lighting schedules, irrigation cycles, and tasks',
      email: true,
      push: true,
      sms: false,
      inApp: true,
      category: 'Schedule',
      icon: Calendar
    },
    {
      id: 'security-events',
      title: 'Security Events',
      description: 'Login attempts, password changes, account activity',
      email: true,
      push: true,
      sms: true,
      inApp: true,
      category: 'Security',
      icon: CheckCircle
    }
  ])

  const [globalSettings, setGlobalSettings] = useState({
    doNotDisturb: false,
    quietHoursStart: '22:00',
    quietHoursEnd: '07:00',
    soundEnabled: true,
    emailDigest: 'daily',
    pushEnabled: true
  })

  const updateNotificationSetting = (id: string, type: 'email' | 'push' | 'sms' | 'inApp', value: boolean) => {
    setNotificationSettings(prev => prev.map(setting => 
      setting.id === id ? { ...setting, [type]: value } : setting
    ))
  }

  const categories = Array.from(new Set(notificationSettings.map(s => s.category)))

  const getPriorityColor = (category: string) => {
    switch (category) {
      case 'System': return 'text-red-400'
      case 'Cultivation': return 'text-green-400'
      case 'Equipment': return 'text-yellow-400'
      case 'Energy': return 'text-blue-400'
      case 'Analytics': return 'text-purple-400'
      case 'Team': return 'text-pink-400'
      case 'Schedule': return 'text-orange-400'
      case 'Security': return 'text-indigo-400'
      default: return 'text-gray-400'
    }
  }

  return (
    <div className="p-6 space-y-8">
      <div className="flex items-center gap-3 mb-6">
        <Bell className="w-6 h-6 text-purple-400" />
        <h2 className="text-2xl font-bold text-white">Notification Settings</h2>
      </div>

      {/* Global Settings */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Settings className="w-5 h-5 text-purple-400" />
          Global Preferences
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-medium">Do Not Disturb</p>
                <p className="text-gray-400 text-sm">Pause all notifications temporarily</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={globalSettings.doNotDisturb}
                  onChange={(e) => setGlobalSettings(prev => ({ ...prev, doNotDisturb: e.target.checked }))}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
              </label>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-medium">Sound Notifications</p>
                <p className="text-gray-400 text-sm">Play sounds for notifications</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={globalSettings.soundEnabled}
                  onChange={(e) => setGlobalSettings(prev => ({ ...prev, soundEnabled: e.target.checked }))}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
              </label>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-medium">Push Notifications</p>
                <p className="text-gray-400 text-sm">Receive push notifications on this device</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={globalSettings.pushEnabled}
                  onChange={(e) => setGlobalSettings(prev => ({ ...prev, pushEnabled: e.target.checked }))}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
              </label>
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Email Digest Frequency</label>
              <select 
                value={globalSettings.emailDigest}
                onChange={(e) => setGlobalSettings(prev => ({ ...prev, emailDigest: e.target.value }))}
                className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white"
              >
                <option value="realtime">Real-time</option>
                <option value="daily">Daily digest</option>
                <option value="weekly">Weekly digest</option>
                <option value="never">Never</option>
              </select>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Quiet Hours Start</label>
                <input
                  type="time"
                  value={globalSettings.quietHoursStart}
                  onChange={(e) => setGlobalSettings(prev => ({ ...prev, quietHoursStart: e.target.value }))}
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Quiet Hours End</label>
                <input
                  type="time"
                  value={globalSettings.quietHoursEnd}
                  onChange={(e) => setGlobalSettings(prev => ({ ...prev, quietHoursEnd: e.target.value }))}
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Notification Categories */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-blue-400" />
          Notification Preferences
        </h3>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left py-3 text-gray-300 font-medium">Notification Type</th>
                <th className="text-center py-3 text-gray-300 font-medium w-20">
                  <div className="flex items-center justify-center gap-1">
                    <Mail className="w-4 h-4" />
                    <span className="hidden sm:inline">Email</span>
                  </div>
                </th>
                <th className="text-center py-3 text-gray-300 font-medium w-20">
                  <div className="flex items-center justify-center gap-1">
                    <Smartphone className="w-4 h-4" />
                    <span className="hidden sm:inline">Push</span>
                  </div>
                </th>
                <th className="text-center py-3 text-gray-300 font-medium w-20">
                  <div className="flex items-center justify-center gap-1">
                    <MessageSquare className="w-4 h-4" />
                    <span className="hidden sm:inline">SMS</span>
                  </div>
                </th>
                <th className="text-center py-3 text-gray-300 font-medium w-20">
                  <div className="flex items-center justify-center gap-1">
                    <Monitor className="w-4 h-4" />
                    <span className="hidden sm:inline">In-App</span>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {notificationSettings.map(setting => {
                const IconComponent = setting.icon
                return (
                  <tr key={setting.id} className="border-b border-gray-700/50 hover:bg-gray-700/30">
                    <td className="py-4">
                      <div className="flex items-center gap-3">
                        <IconComponent className={`w-5 h-5 ${getPriorityColor(setting.category)}`} />
                        <div>
                          <p className="text-white font-medium">{setting.title}</p>
                          <p className="text-gray-400 text-sm">{setting.description}</p>
                          <span className={`inline-block px-2 py-1 text-xs rounded mt-1 ${getPriorityColor(setting.category)} bg-gray-700`}>
                            {setting.category}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="text-center py-4">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={setting.email}
                          onChange={(e) => updateNotificationSetting(setting.id, 'email', e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-9 h-5 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-purple-600"></div>
                      </label>
                    </td>
                    <td className="text-center py-4">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={setting.push}
                          onChange={(e) => updateNotificationSetting(setting.id, 'push', e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-9 h-5 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-purple-600"></div>
                      </label>
                    </td>
                    <td className="text-center py-4">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={setting.sms}
                          onChange={(e) => updateNotificationSetting(setting.id, 'sms', e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-9 h-5 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-purple-600"></div>
                      </label>
                    </td>
                    <td className="text-center py-4">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={setting.inApp}
                          onChange={(e) => updateNotificationSetting(setting.id, 'inApp', e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-9 h-5 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-purple-600"></div>
                      </label>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Test Notifications */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-green-400" />
          Test Notifications
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button 
            onClick={() => alert('Test email notification sent!')}
            className="flex items-center justify-center gap-2 p-3 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
          >
            <Mail className="w-4 h-4" />
            Test Email
          </button>
          <button 
            onClick={() => alert('Test push notification sent!')}
            className="flex items-center justify-center gap-2 p-3 bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
          >
            <Smartphone className="w-4 h-4" />
            Test Push
          </button>
          <button 
            onClick={() => alert('Test SMS sent!')}
            className="flex items-center justify-center gap-2 p-3 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
          >
            <MessageSquare className="w-4 h-4" />
            Test SMS
          </button>
          <button 
            onClick={() => alert('Test in-app notification!')}
            className="flex items-center justify-center gap-2 p-3 bg-orange-600 hover:bg-orange-700 rounded-lg transition-colors"
          >
            <Monitor className="w-4 h-4" />
            Test In-App
          </button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
        <div className="flex flex-wrap gap-3">
          <button 
            onClick={() => {
              setNotificationSettings(prev => prev.map(s => ({ ...s, email: true, inApp: true })))
              alert('All critical notifications enabled')
            }}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
          >
            Enable All Critical
          </button>
          <button 
            onClick={() => {
              setNotificationSettings(prev => prev.map(s => ({ ...s, sms: false })))
              alert('All SMS notifications disabled')
            }}
            className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 rounded-lg transition-colors"
          >
            Disable SMS
          </button>
          <button 
            onClick={() => {
              setNotificationSettings(prev => prev.map(s => ({ ...s, push: false })))
              alert('All push notifications disabled')
            }}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
          >
            Disable Push
          </button>
        </div>
      </div>
    </div>
  )
}