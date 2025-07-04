'use client';

import React, { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import {
  Watch, Heart, Activity, TrendingUp, AlertCircle,
  CheckCircle, X, Settings, Battery, Zap, Timer,
  Shield, Users, Bell, Smartphone, RotateCcw
} from 'lucide-react';
import { ZoneBasedTracker, BiometricData } from '@/lib/tracking/zone-based-tracker';

interface AppleWatchIntegrationProps {
  onClose: () => void;
  onComplete: (connected: boolean) => void;
}

export function AppleWatchIntegration({ onClose, onComplete }: AppleWatchIntegrationProps) {
  const { user } = useUser();
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'available' | 'connected' | 'error'>('checking');
  const [permissions, setPermissions] = useState({
    heartRate: false,
    activeCalories: false,
    stepCount: false,
    heartRateVariability: false,
    workoutDetection: false
  });
  const [selectedMetrics, setSelectedMetrics] = useState({
    heartRate: true,
    activeCalories: true,
    stepCount: true,
    heartRateVariability: false,
    workoutDetection: true
  });
  const [isConnecting, setIsConnecting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [liveData, setLiveData] = useState<BiometricData | null>(null);

  const zoneTracker = new ZoneBasedTracker();

  useEffect(() => {
    checkAppleWatchAvailability();
  }, []);

  const checkAppleWatchAvailability = async () => {
    try {
      // Check if we're on iOS and HealthKit is available
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      const hasHealthKit = 'HealthKit' in window; // This would be available in a real iOS app
      
      if (isIOS || hasHealthKit) {
        setConnectionStatus('available');
      } else {
        // For demo purposes, we'll simulate availability
        setTimeout(() => setConnectionStatus('available'), 1000);
      }
    } catch (error) {
      console.error('Failed to check Apple Watch availability:', error);
      setConnectionStatus('error');
      setErrorMessage('Unable to detect Apple Watch compatibility');
    }
  };

  const connectAppleWatch = async () => {
    if (!user) return;

    setIsConnecting(true);
    setErrorMessage(null);

    try {
      // In a real implementation, this would connect to Apple HealthKit
      const success = await zoneTracker.connectAppleWatch(user.id);
      
      if (success) {
        // Simulate permission requests
        await simulatePermissionRequests();
        setConnectionStatus('connected');
        startLiveDataDemo();
        onComplete(true);
      } else {
        throw new Error('Connection failed');
      }
    } catch (error) {
      console.error('Apple Watch connection error:', error);
      setConnectionStatus('error');
      setErrorMessage('Failed to connect to Apple Watch. Please ensure it\'s paired and HealthKit is enabled.');
    } finally {
      setIsConnecting(false);
    }
  };

  const simulatePermissionRequests = async () => {
    // Simulate the iOS permission request flow
    for (const [key, enabled] of Object.entries(selectedMetrics)) {
      if (enabled) {
        // Simulate permission dialog
        await new Promise(resolve => setTimeout(resolve, 500));
        setPermissions(prev => ({ ...prev, [key]: true }));
      }
    }
  };

  const startLiveDataDemo = () => {
    // Simulate live biometric data updates
    const interval = setInterval(() => {
      const mockData: BiometricData = {
        timestamp: new Date(),
        heartRate: 70 + Math.random() * 30, // 70-100 bpm
        activeCalories: Math.random() * 5, // calories per update
        steps: Math.floor(Math.random() * 10), // steps per update
        stressLevel: Math.random() * 50, // 0-50 stress level
        exertionLevel: Math.random() > 0.7 ? 'moderate' : 'light'
      };
      setLiveData(mockData);
    }, 2000);

    // Clean up interval after 30 seconds
    setTimeout(() => clearInterval(interval), 30000);
  };

  const disconnectAppleWatch = () => {
    setConnectionStatus('available');
    setPermissions({
      heartRate: false,
      activeCalories: false,
      stepCount: false,
      heartRateVariability: false,
      workoutDetection: false
    });
    setLiveData(null);
    onComplete(false);
  };

  const renderConnectionSetup = () => (
    <div className="space-y-6">
      {/* Apple Watch Status */}
      <div className="text-center">
        <div className="w-24 h-24 mx-auto bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl flex items-center justify-center mb-4 shadow-lg">
          <Watch className="w-12 h-12 text-white" />
        </div>
        <h3 className="text-xl font-semibold mb-2">Connect Your Apple Watch</h3>
        <p className="text-gray-600">
          Sync health data to get personalized insights and safety monitoring during work.
        </p>
      </div>

      {/* Privacy Benefits */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-3">
          <Shield className="w-5 h-5 text-green-600" />
          <h4 className="font-medium text-green-800">Your Privacy is Protected</h4>
        </div>
        <ul className="text-sm text-green-700 space-y-1">
          <li>• All health data stays encrypted on your device</li>
          <li>• Only aggregated insights are shared (not raw data)</li>
          <li>• You control which metrics to monitor</li>
          <li>• Disconnect anytime with full data deletion</li>
        </ul>
      </div>

      {/* Metric Selection */}
      <div>
        <h4 className="font-medium mb-3">Select Health Metrics to Monitor</h4>
        <div className="space-y-3">
          {Object.entries({
            heartRate: { label: 'Heart Rate', icon: Heart, desc: 'Monitor exertion and stress levels', color: 'text-red-500' },
            activeCalories: { label: 'Active Calories', icon: Zap, desc: 'Track energy burned during work', color: 'text-orange-500' },
            stepCount: { label: 'Step Count', icon: TrendingUp, desc: 'Measure movement and activity', color: 'text-blue-500' },
            heartRateVariability: { label: 'Heart Rate Variability', icon: Activity, desc: 'Advanced stress and recovery monitoring', color: 'text-purple-500' },
            workoutDetection: { label: 'Workout Detection', icon: Timer, desc: 'Automatically detect work activities', color: 'text-green-500' }
          }).map(([key, { label, icon: Icon, desc, color }]) => (
            <label key={key} className="flex items-start gap-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedMetrics[key as keyof typeof selectedMetrics]}
                onChange={(e) => setSelectedMetrics(prev => ({
                  ...prev,
                  [key]: e.target.checked
                }))}
                className="mt-1"
              />
              <Icon className={`w-5 h-5 mt-0.5 ${color}`} />
              <div className="flex-1">
                <div className="font-medium">{label}</div>
                <div className="text-sm text-gray-600">{desc}</div>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Personal Benefits */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-800 mb-3">What You'll Get</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="flex items-center gap-2 text-sm text-blue-700">
            <Bell className="w-4 h-4" />
            <span>Break reminders when overexerted</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-blue-700">
            <TrendingUp className="w-4 h-4" />
            <span>Personal fitness progress tracking</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-blue-700">
            <Battery className="w-4 h-4" />
            <span>Energy level optimization tips</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-blue-700">
            <Users className="w-4 h-4" />
            <span>Anonymous team health insights</span>
          </div>
        </div>
      </div>

      {/* Connection Button */}
      <button
        onClick={connectAppleWatch}
        disabled={isConnecting || Object.values(selectedMetrics).every(v => !v)}
        className="w-full py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
      >
        {isConnecting ? (
          <>
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            Connecting...
          </>
        ) : (
          <>
            <Watch className="w-4 h-4" />
            Connect Apple Watch
          </>
        )}
      </button>

      {Object.values(selectedMetrics).every(v => !v) && (
        <p className="text-sm text-gray-500 text-center">
          Please select at least one health metric to continue
        </p>
      )}
    </div>
  );

  const renderConnectedStatus = () => (
    <div className="space-y-6">
      {/* Connected Status */}
      <div className="text-center">
        <div className="w-24 h-24 mx-auto bg-gradient-to-br from-green-500 to-green-600 rounded-3xl flex items-center justify-center mb-4 shadow-lg">
          <CheckCircle className="w-12 h-12 text-white" />
        </div>
        <h3 className="text-xl font-semibold mb-2">Apple Watch Connected</h3>
        <p className="text-gray-600">
          Your health data is now being monitored for safety and insights.
        </p>
      </div>

      {/* Live Data Preview */}
      {liveData && (
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-medium mb-3 flex items-center gap-2">
            <Activity className="w-4 h-4" />
            Live Health Data
          </h4>
          <div className="grid grid-cols-2 gap-4">
            {liveData.heartRate && (
              <div className="flex items-center gap-2">
                <Heart className="w-4 h-4 text-red-500" />
                <span className="text-sm">
                  {Math.round(liveData.heartRate)} bpm
                </span>
              </div>
            )}
            {liveData.activeCalories && (
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-orange-500" />
                <span className="text-sm">
                  {Math.round(liveData.activeCalories * 10)} cal/hr
                </span>
              </div>
            )}
            {liveData.steps && (
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-blue-500" />
                <span className="text-sm">
                  {Math.round(liveData.steps * 100)} steps/hr
                </span>
              </div>
            )}
            {liveData.exertionLevel && (
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-purple-500" />
                <span className="text-sm">
                  {liveData.exertionLevel} intensity
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Permissions Status */}
      <div>
        <h4 className="font-medium mb-3">Active Permissions</h4>
        <div className="space-y-2">
          {Object.entries(permissions).map(([key, granted]) => {
            const labels = {
              heartRate: 'Heart Rate',
              activeCalories: 'Active Calories',
              stepCount: 'Step Count',
              heartRateVariability: 'Heart Rate Variability',
              workoutDetection: 'Workout Detection'
            };
            
            return (
              <div key={key} className="flex items-center justify-between py-2">
                <span className="text-sm">{labels[key as keyof typeof labels]}</span>
                {granted ? (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                ) : (
                  <X className="w-4 h-4 text-gray-400" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Health Insights Preview */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-800 mb-2">Today's Insights</h4>
        <div className="space-y-2 text-sm text-blue-700">
          <p>• Your heart rate suggests you're working at a comfortable pace</p>
          <p>• You've burned an estimated 280 calories during work today</p>
          <p>• Consider taking a 5-minute break in the next hour</p>
        </div>
      </div>

      {/* Disconnect Option */}
      <button
        onClick={disconnectAppleWatch}
        className="w-full py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors flex items-center justify-center gap-2"
      >
        <RotateCcw className="w-4 h-4" />
        Disconnect Apple Watch
      </button>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Watch className="w-6 h-6 text-gray-700" />
              Apple Watch Integration
            </h2>
            <p className="text-gray-600">
              {connectionStatus === 'connected' 
                ? 'Manage your Apple Watch connection and health data'
                : 'Connect your Apple Watch for personalized health insights'
              }
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {connectionStatus === 'checking' && (
            <div className="text-center py-8">
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">Checking Apple Watch compatibility...</p>
            </div>
          )}

          {connectionStatus === 'available' && renderConnectionSetup()}
          {connectionStatus === 'connected' && renderConnectedStatus()}

          {connectionStatus === 'error' && (
            <div className="text-center py-8">
              <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Connection Error</h3>
              <p className="text-gray-600 mb-4">{errorMessage}</p>
              <button
                onClick={checkAppleWatchAvailability}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                Try Again
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}