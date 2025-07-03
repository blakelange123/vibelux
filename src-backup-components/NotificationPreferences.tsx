'use client';

import React, { useState, useEffect } from 'react';
import {
  Bell,
  Mail,
  MessageSquare,
  Smartphone,
  Monitor,
  Moon,
  AlertTriangle,
  Thermometer,
  Droplets,
  Wind,
  Activity,
  Zap,
  Settings,
  Save,
  Check
} from 'lucide-react';
import type { NotificationPreferences } from '@/lib/notifications/notification-service';

export function NotificationPreferencesComponent() {
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    userId: 'current-user',
    channels: {
      email: true,
      sms: false,
      push: true,
      inapp: true
    },
    alertTypes: {
      temperature: true,
      humidity: true,
      co2: true,
      ph: true,
      ec: true,
      equipment: true,
      system: true
    },
    quietHours: {
      enabled: false,
      start: '22:00',
      end: '08:00'
    },
    thresholds: {
      temperature: { min: 65, max: 85 },
      humidity: { min: 40, max: 70 },
      co2: { min: 400, max: 1500 },
      ph: { min: 5.5, max: 6.5 },
      ec: { min: 1.0, max: 3.0 },
      vpd: { min: 0.8, max: 1.2 }
    }
  });

  const [saved, setSaved] = useState(false);

  const updateChannel = (channel: keyof typeof preferences.channels, value: boolean) => {
    setPreferences(prev => ({
      ...prev,
      channels: {
        ...prev.channels,
        [channel]: value
      }
    }));
  };

  const updateAlertType = (type: keyof typeof preferences.alertTypes, value: boolean) => {
    setPreferences(prev => ({
      ...prev,
      alertTypes: {
        ...prev.alertTypes,
        [type]: value
      }
    }));
  };

  const updateThreshold = (
    type: keyof typeof preferences.thresholds, 
    field: 'min' | 'max', 
    value: number
  ) => {
    setPreferences(prev => ({
      ...prev,
      thresholds: {
        ...prev.thresholds,
        [type]: {
          ...prev.thresholds[type],
          [field]: value
        }
      }
    }));
  };

  const savePreferences = async () => {
    // Save to backend
    try {
      const response = await fetch('/api/v1/notifications/preferences', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(preferences)
      });
      
      if (response.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } catch (error) {
      console.error('Failed to save preferences:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Bell className="w-8 h-8 text-purple-500" />
            Notification Preferences
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            Configure how and when you receive alerts
          </p>
        </div>
        <button
          onClick={savePreferences}
          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors flex items-center gap-2"
        >
          {saved ? (
            <>
              <Check className="w-4 h-4" />
              Saved
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              Save Changes
            </>
          )}
        </button>
      </div>

      {/* Notification Channels */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Notification Channels
        </h3>
        <div className="space-y-4">
          <label className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg cursor-pointer">
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-blue-500" />
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Email</p>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Receive alerts via email
                </p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={preferences.channels.email}
              onChange={(e) => updateChannel('email', e.target.checked)}
              className="w-5 h-5 rounded border-gray-300"
            />
          </label>

          <label className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg cursor-pointer">
            <div className="flex items-center gap-3">
              <MessageSquare className="w-5 h-5 text-green-500" />
              <div>
                <p className="font-medium text-gray-900 dark:text-white">SMS</p>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Get text messages for critical alerts
                </p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={preferences.channels.sms}
              onChange={(e) => updateChannel('sms', e.target.checked)}
              className="w-5 h-5 rounded border-gray-300"
            />
          </label>

          <label className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg cursor-pointer">
            <div className="flex items-center gap-3">
              <Smartphone className="w-5 h-5 text-purple-500" />
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Push Notifications</p>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Mobile app notifications
                </p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={preferences.channels.push}
              onChange={(e) => updateChannel('push', e.target.checked)}
              className="w-5 h-5 rounded border-gray-300"
            />
          </label>

          <label className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg cursor-pointer">
            <div className="flex items-center gap-3">
              <Monitor className="w-5 h-5 text-orange-500" />
              <div>
                <p className="font-medium text-gray-900 dark:text-white">In-App</p>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Show notifications in the dashboard
                </p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={preferences.channels.inapp}
              onChange={(e) => updateChannel('inapp', e.target.checked)}
              className="w-5 h-5 rounded border-gray-300"
            />
          </label>
        </div>
      </div>

      {/* Alert Types */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Alert Types
        </h3>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
          <label className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg cursor-pointer">
            <input
              type="checkbox"
              checked={preferences.alertTypes.temperature}
              onChange={(e) => updateAlertType('temperature', e.target.checked)}
              className="w-4 h-4 rounded border-gray-300"
            />
            <Thermometer className="w-4 h-4 text-red-500" />
            <span className="text-sm font-medium text-gray-900 dark:text-white">Temperature</span>
          </label>

          <label className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg cursor-pointer">
            <input
              type="checkbox"
              checked={preferences.alertTypes.humidity}
              onChange={(e) => updateAlertType('humidity', e.target.checked)}
              className="w-4 h-4 rounded border-gray-300"
            />
            <Droplets className="w-4 h-4 text-blue-500" />
            <span className="text-sm font-medium text-gray-900 dark:text-white">Humidity</span>
          </label>

          <label className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg cursor-pointer">
            <input
              type="checkbox"
              checked={preferences.alertTypes.co2}
              onChange={(e) => updateAlertType('co2', e.target.checked)}
              className="w-4 h-4 rounded border-gray-300"
            />
            <Wind className="w-4 h-4 text-green-500" />
            <span className="text-sm font-medium text-gray-900 dark:text-white">CO₂</span>
          </label>

          <label className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg cursor-pointer">
            <input
              type="checkbox"
              checked={preferences.alertTypes.ph}
              onChange={(e) => updateAlertType('ph', e.target.checked)}
              className="w-4 h-4 rounded border-gray-300"
            />
            <Activity className="w-4 h-4 text-yellow-500" />
            <span className="text-sm font-medium text-gray-900 dark:text-white">pH</span>
          </label>

          <label className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg cursor-pointer">
            <input
              type="checkbox"
              checked={preferences.alertTypes.ec}
              onChange={(e) => updateAlertType('ec', e.target.checked)}
              className="w-4 h-4 rounded border-gray-300"
            />
            <Zap className="w-4 h-4 text-purple-500" />
            <span className="text-sm font-medium text-gray-900 dark:text-white">EC</span>
          </label>

          <label className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg cursor-pointer">
            <input
              type="checkbox"
              checked={preferences.alertTypes.system}
              onChange={(e) => updateAlertType('system', e.target.checked)}
              className="w-4 h-4 rounded border-gray-300"
            />
            <Settings className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-900 dark:text-white">System</span>
          </label>
        </div>
      </div>

      {/* Quiet Hours */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Moon className="w-5 h-5 text-indigo-500" />
          Quiet Hours
        </h3>
        <div className="space-y-4">
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={preferences.quietHours?.enabled}
              onChange={(e) => setPreferences(prev => ({
                ...prev,
                quietHours: {
                  ...prev.quietHours!,
                  enabled: e.target.checked
                }
              }))}
              className="w-5 h-5 rounded border-gray-300"
            />
            <span className="text-gray-900 dark:text-white">
              Enable quiet hours (no notifications except critical alerts)
            </span>
          </label>
          
          {preferences.quietHours?.enabled && (
            <div className="flex items-center gap-4 ml-8">
              <div>
                <label className="text-sm text-gray-600 dark:text-gray-300">Start</label>
                <input
                  type="time"
                  value={preferences.quietHours.start}
                  onChange={(e) => setPreferences(prev => ({
                    ...prev,
                    quietHours: {
                      ...prev.quietHours!,
                      start: e.target.value
                    }
                  }))}
                  className="block mt-1 px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md"
                />
              </div>
              <div>
                <label className="text-sm text-gray-600 dark:text-gray-300">End</label>
                <input
                  type="time"
                  value={preferences.quietHours.end}
                  onChange={(e) => setPreferences(prev => ({
                    ...prev,
                    quietHours: {
                      ...prev.quietHours!,
                      end: e.target.value
                    }
                  }))}
                  className="block mt-1 px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Alert Thresholds */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-yellow-500" />
          Alert Thresholds
        </h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {Object.entries(preferences.thresholds).map(([type, values]) => (
            <div key={type} className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">
                {type} {type === 'temperature' ? '(°F)' : type === 'humidity' ? '(%)' : 
                        type === 'co2' ? '(ppm)' : type === 'vpd' ? '(kPa)' : ''}
              </label>
              <div className="flex gap-3">
                <div className="flex-1">
                  <input
                    type="number"
                    value={values.min}
                    onChange={(e) => updateThreshold(
                      type as keyof typeof preferences.thresholds,
                      'min',
                      parseFloat(e.target.value)
                    )}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md"
                    placeholder="Min"
                  />
                </div>
                <span className="self-center text-gray-500">to</span>
                <div className="flex-1">
                  <input
                    type="number"
                    value={values.max}
                    onChange={(e) => updateThreshold(
                      type as keyof typeof preferences.thresholds,
                      'max',
                      parseFloat(e.target.value)
                    )}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md"
                    placeholder="Max"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}