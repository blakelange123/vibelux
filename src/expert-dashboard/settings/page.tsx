'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft,
  Settings,
  CreditCard,
  Bell,
  Globe,
  Shield,
  Eye,
  EyeOff,
  Calendar,
  Clock,
  DollarSign,
  User,
  Mail,
  Phone,
  MapPin,
  Save,
  AlertTriangle,
  CheckCircle,
  Trash2
} from 'lucide-react';

interface ExpertSettings {
  // Profile settings
  displayName: string;
  title: string;
  bio: string;
  hourlyRate: number;
  timezone: string;
  linkedinUrl: string;
  websiteUrl: string;
  
  // Availability settings
  availableDays: number[];
  availableHours: { start: string; end: string };
  bufferTime: number;
  autoApprove: boolean;
  cancellationHours: number;
  
  // Notification settings
  emailNotifications: {
    newBookings: boolean;
    cancellations: boolean;
    reviews: boolean;
    payouts: boolean;
    marketing: boolean;
  };
  
  // Privacy settings
  profileVisible: boolean;
  showLastSeen: boolean;
  allowDirectContact: boolean;
  
  // Payment settings
  stripeConnected: boolean;
  payoutSchedule: 'weekly' | 'monthly';
}

export default function ExpertSettingsPage() {
  const [settings, setSettings] = useState<ExpertSettings | null>(null);
  const [activeTab, setActiveTab] = useState('profile');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const response = await fetch('/api/experts/settings');
      if (response.ok) {
        const data = await response.json();
        setSettings(data.settings);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateSettings = (updates: Partial<ExpertSettings>) => {
    setSettings(prev => prev ? { ...prev, ...updates } : null);
  };

  const saveSettings = async () => {
    if (!settings) return;
    
    setSaving(true);
    setSaveMessage('');

    try {
      const response = await fetch('/api/experts/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });

      if (response.ok) {
        setSaveMessage('Settings saved successfully!');
        setTimeout(() => setSaveMessage(''), 3000);
      } else {
        setSaveMessage('Failed to save settings. Please try again.');
      }
    } catch (error) {
      setSaveMessage('Network error. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const toggleDay = (day: number) => {
    if (!settings) return;
    
    const newDays = settings.availableDays.includes(day)
      ? settings.availableDays.filter(d => d !== day)
      : [...settings.availableDays, day].sort();
    
    updateSettings({ availableDays: newDays });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-950 pt-24 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="min-h-screen bg-gray-950 pt-24">
      {/* Header */}
      <div className="bg-gradient-to-br from-indigo-900/20 to-purple-900/20 border-b border-indigo-800/30">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/expert-dashboard"
                className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-400" />
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-white">Expert Settings</h1>
                <p className="text-gray-400">Manage your profile, availability, and preferences</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {saveMessage && (
                <div className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                  saveMessage.includes('success') 
                    ? 'bg-green-900/30 text-green-400' 
                    : 'bg-red-900/30 text-red-400'
                }`}>
                  {saveMessage.includes('success') ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    <AlertTriangle className="w-4 h-4" />
                  )}
                  {saveMessage}
                </div>
              )}
              
              <button
                onClick={saveSettings}
                disabled={isSaving}
                className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-800 text-white rounded-lg flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Settings Navigation */}
          <div className="lg:col-span-1">
            <nav className="space-y-2">
              {[
                { id: 'profile', label: 'Profile', icon: User },
                { id: 'availability', label: 'Availability', icon: Calendar },
                { id: 'payments', label: 'Payments', icon: CreditCard },
                { id: 'notifications', label: 'Notifications', icon: Bell },
                { id: 'privacy', label: 'Privacy', icon: Shield },
                { id: 'account', label: 'Account', icon: Settings }
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition-colors ${
                      activeTab === tab.id
                        ? 'bg-indigo-600 text-white'
                        : 'text-gray-400 hover:text-white hover:bg-gray-800'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Settings Content */}
          <div className="lg:col-span-3">
            {activeTab === 'profile' && (
              <div className="space-y-6">
                <div className="bg-gray-800 rounded-xl p-6">
                  <h3 className="text-xl font-bold text-white mb-6">Profile Information</h3>
                  
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Display Name
                        </label>
                        <input
                          type="text"
                          value={settings?.displayName || ''}
                          onChange={(e) => updateSettings({ displayName: e.target.value })}
                          className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-indigo-500 focus:outline-none"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Professional Title
                        </label>
                        <input
                          type="text"
                          value={settings?.title || ''}
                          onChange={(e) => updateSettings({ title: e.target.value })}
                          className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-indigo-500 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Bio
                      </label>
                      <textarea
                        value={settings?.bio || ''}
                        onChange={(e) => updateSettings({ bio: e.target.value })}
                        rows={4}
                        className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-indigo-500 focus:outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Hourly Rate ($)
                        </label>
                        <input
                          type="number"
                          value={settings?.hourlyRate || 200}
                          onChange={(e) => updateSettings({ hourlyRate: parseFloat(e.target.value) })}
                          min="50"
                          max="500"
                          className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-indigo-500 focus:outline-none"
                        />
                        <p className="text-sm text-gray-400 mt-1">You receive 90% after platform fee</p>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Timezone
                        </label>
                        <select
                          value={settings?.timezone || 'America/Los_Angeles'}
                          onChange={(e) => updateSettings({ timezone: e.target.value })}
                          className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-indigo-500 focus:outline-none"
                        >
                          <option value="America/Los_Angeles">Pacific Time</option>
                          <option value="America/Denver">Mountain Time</option>
                          <option value="America/Chicago">Central Time</option>
                          <option value="America/New_York">Eastern Time</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          LinkedIn URL
                        </label>
                        <input
                          type="url"
                          value={settings?.linkedinUrl || ''}
                          onChange={(e) => updateSettings({ linkedinUrl: e.target.value })}
                          placeholder="https://linkedin.com/in/yourprofile"
                          className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-indigo-500 focus:outline-none"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Website URL
                        </label>
                        <input
                          type="url"
                          value={settings?.websiteUrl || ''}
                          onChange={(e) => updateSettings({ websiteUrl: e.target.value })}
                          placeholder="https://yourwebsite.com"
                          className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-indigo-500 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'availability' && (
              <div className="space-y-6">
                <div className="bg-gray-800 rounded-xl p-6">
                  <h3 className="text-xl font-bold text-white mb-6">Availability Settings</h3>
                  
                  <div className="space-y-6">
                    {/* Available Days */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-4">
                        Available Days
                      </label>
                      <div className="grid grid-cols-7 gap-2">
                        {dayNames.map((dayName, index) => (
                          <button
                            key={index}
                            onClick={() => toggleDay(index)}
                            className={`p-3 rounded-lg text-center font-medium transition-all ${
                              settings?.availableDays.includes(index)
                                ? 'bg-indigo-600 text-white'
                                : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                            }`}
                          >
                            {dayName}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Available Hours */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-4">
                        Available Hours
                      </label>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs text-gray-400 mb-1">Start Time</label>
                          <input
                            type="time"
                            value={settings?.availableHours.start || '09:00'}
                            onChange={(e) => updateSettings({
                              availableHours: { 
                                ...settings?.availableHours!, 
                                start: e.target.value 
                              }
                            })}
                            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-indigo-500 focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-400 mb-1">End Time</label>
                          <input
                            type="time"
                            value={settings?.availableHours.end || '17:00'}
                            onChange={(e) => updateSettings({
                              availableHours: { 
                                ...settings?.availableHours!, 
                                end: e.target.value 
                              }
                            })}
                            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-indigo-500 focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Booking Settings */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Buffer Time (minutes)
                        </label>
                        <select
                          value={settings?.bufferTime || 15}
                          onChange={(e) => updateSettings({ bufferTime: parseInt(e.target.value) })}
                          className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-indigo-500 focus:outline-none"
                        >
                          <option value={0}>No buffer</option>
                          <option value={15}>15 minutes</option>
                          <option value={30}>30 minutes</option>
                          <option value={60}>1 hour</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Cancellation Notice (hours)
                        </label>
                        <select
                          value={settings?.cancellationHours || 24}
                          onChange={(e) => updateSettings({ cancellationHours: parseInt(e.target.value) })}
                          className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-indigo-500 focus:outline-none"
                        >
                          <option value={12}>12 hours</option>
                          <option value={24}>24 hours</option>
                          <option value={48}>48 hours</option>
                          <option value={72}>72 hours</option>
                        </select>
                      </div>
                    </div>

                    {/* Auto-approval */}
                    <div className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
                      <div>
                        <div className="font-medium text-white">Auto-approve bookings</div>
                        <div className="text-sm text-gray-400">
                          Automatically approve consultation requests without manual review
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings?.autoApprove || false}
                          onChange={(e) => updateSettings({ autoApprove: e.target.checked })}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'payments' && (
              <div className="space-y-6">
                <div className="bg-gray-800 rounded-xl p-6">
                  <h3 className="text-xl font-bold text-white mb-6">Payment Settings</h3>
                  
                  <div className="space-y-6">
                    {/* Stripe Connect Status */}
                    <div className="p-4 bg-gray-700 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <CreditCard className="w-8 h-8 text-indigo-500" />
                          <div>
                            <div className="font-medium text-white">Payment Account</div>
                            <div className="text-sm text-gray-400">
                              {settings?.stripeConnected ? 'Connected and verified' : 'Not connected'}
                            </div>
                          </div>
                        </div>
                        {settings?.stripeConnected ? (
                          <div className="flex items-center gap-2 text-green-400">
                            <CheckCircle className="w-5 h-5" />
                            <span>Active</span>
                          </div>
                        ) : (
                          <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg">
                            Connect Account
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Payout Schedule */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Payout Schedule
                      </label>
                      <select
                        value={settings?.payoutSchedule || 'weekly'}
                        onChange={(e) => updateSettings({ payoutSchedule: e.target.value as 'weekly' | 'monthly' })}
                        className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-indigo-500 focus:outline-none"
                      >
                        <option value="weekly">Weekly (Fridays)</option>
                        <option value="monthly">Monthly (1st of month)</option>
                      </select>
                    </div>

                    {/* Fee Information */}
                    <div className="p-4 bg-blue-900/20 border border-blue-600/30 rounded-lg">
                      <h4 className="font-medium text-blue-400 mb-2">Fee Structure</h4>
                      <div className="space-y-2 text-sm text-blue-300">
                        <div className="flex justify-between">
                          <span>Platform fee:</span>
                          <span>10% of consultation fee</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Your earnings:</span>
                          <span>90% of consultation fee</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Payment processing:</span>
                          <span>Included</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <div className="bg-gray-800 rounded-xl p-6">
                  <h3 className="text-xl font-bold text-white mb-6">Notification Preferences</h3>
                  
                  <div className="space-y-4">
                    {[
                      { key: 'newBookings', label: 'New consultation bookings', description: 'Get notified when clients book consultations' },
                      { key: 'cancellations', label: 'Booking cancellations', description: 'Get notified when clients cancel consultations' },
                      { key: 'reviews', label: 'New reviews', description: 'Get notified when clients leave reviews' },
                      { key: 'payouts', label: 'Payout notifications', description: 'Get notified about payment transfers' },
                      { key: 'marketing', label: 'Marketing updates', description: 'Platform updates and marketing tips' }
                    ].map((notification) => (
                      <div key={notification.key} className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
                        <div>
                          <div className="font-medium text-white">{notification.label}</div>
                          <div className="text-sm text-gray-400">{notification.description}</div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={settings?.emailNotifications?.[notification.key as keyof typeof settings.emailNotifications] || false}
                            onChange={(e) => updateSettings({
                              emailNotifications: {
                                ...settings?.emailNotifications!,
                                [notification.key]: e.target.checked
                              }
                            })}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'privacy' && (
              <div className="space-y-6">
                <div className="bg-gray-800 rounded-xl p-6">
                  <h3 className="text-xl font-bold text-white mb-6">Privacy Settings</h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
                      <div>
                        <div className="font-medium text-white">Profile visibility</div>
                        <div className="text-sm text-gray-400">Show your profile in expert directory</div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings?.profileVisible || true}
                          onChange={(e) => updateSettings({ profileVisible: e.target.checked })}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
                      <div>
                        <div className="font-medium text-white">Show last seen</div>
                        <div className="text-sm text-gray-400">Display when you were last active</div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings?.showLastSeen || false}
                          onChange={(e) => updateSettings({ showLastSeen: e.target.checked })}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                      </label>
                    </div>

                    <div className="p-4 bg-yellow-900/20 border border-yellow-600/30 rounded-lg">
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                        <div>
                          <div className="font-medium text-yellow-400">Platform Protection</div>
                          <div className="text-sm text-yellow-300 mt-1">
                            All consultations must be conducted through the VibeLux platform. 
                            Direct contact outside the platform violates our terms of service.
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'account' && (
              <div className="space-y-6">
                <div className="bg-gray-800 rounded-xl p-6">
                  <h3 className="text-xl font-bold text-white mb-6">Account Management</h3>
                  
                  <div className="space-y-6">
                    <div className="p-4 bg-red-900/20 border border-red-600/30 rounded-lg">
                      <div className="flex items-start gap-4">
                        <AlertTriangle className="w-6 h-6 text-red-500 flex-shrink-0" />
                        <div className="flex-1">
                          <h4 className="font-medium text-red-400 mb-2">Deactivate Expert Account</h4>
                          <p className="text-red-300 text-sm mb-4">
                            This will hide your profile from the directory and prevent new bookings. 
                            Existing consultations will not be affected.
                          </p>
                          <button className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg">
                            Deactivate Account
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-red-900/20 border border-red-600/30 rounded-lg">
                      <div className="flex items-start gap-4">
                        <Trash2 className="w-6 h-6 text-red-500 flex-shrink-0" />
                        <div className="flex-1">
                          <h4 className="font-medium text-red-400 mb-2">Delete Expert Account</h4>
                          <p className="text-red-300 text-sm mb-4">
                            Permanently delete your expert account and all associated data. 
                            This action cannot be undone.
                          </p>
                          <button className="px-4 py-2 bg-red-700 hover:bg-red-800 text-white rounded-lg">
                            Delete Account
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}