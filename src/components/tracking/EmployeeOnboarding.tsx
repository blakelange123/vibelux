'use client';

import React, { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import {
  Shield, MapPin, MessageCircle, AlertTriangle, Battery,
  CheckCircle, Clock, Smartphone, Wifi, Navigation, Radio,
  FileText, Settings, ChevronRight, ChevronLeft, X,
  QrCode, Heart, Activity, Watch, TrendingUp, Users2
} from 'lucide-react';
import { RealtimeTracker } from '@/lib/realtime-tracker';
import { PrivacyControlsService } from '@/lib/privacy-controls';
import { ZoneBasedTracker } from '@/lib/tracking/zone-based-tracker';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  component: React.ReactNode;
}

interface EmployeeOnboardingProps {
  facilityId: string;
  onComplete: (tracker: RealtimeTracker) => void;
  onCancel: () => void;
}

export function EmployeeOnboarding({ facilityId, onComplete, onCancel }: EmployeeOnboardingProps) {
  const { user } = useUser();
  const [currentStep, setCurrentStep] = useState(0);
  const [privacyConsent, setPrivacyConsent] = useState(false);
  const [trackingSettings, setTrackingSettings] = useState({
    trackingMode: 'zone-based' as 'zone-based' | 'continuous' | 'manual' | 'disabled',
    enableQRZoneEntry: true,
    enableBiometrics: false,
    enableProductivityTracking: true,
    allowRealTimeTracking: false,
    allowHistoricalAccess: true,
    shareWithSupervisors: false,
    shareWithPeers: false,
    shareAggregatedData: true,
    locationRetentionDays: 90,
    biometricDataTypes: {
      heartRate: false,
      calories: false,
      steps: false,
      stress: false,
      temperature: false,
      oxygenSaturation: false
    },
    enableBreakSuggestions: true,
    enableHealthAlerts: false,
    maxDailyHours: 8
  });
  const [permissions, setPermissions] = useState({
    location: false,
    notifications: false
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [tracker, setTracker] = useState<RealtimeTracker | null>(null);

  // Check existing permissions on load
  useEffect(() => {
    checkExistingPermissions();
  }, []);

  const checkExistingPermissions = async () => {
    // Check location permission
    if ('geolocation' in navigator) {
      try {
        await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 1000 });
        });
        setPermissions(prev => ({ ...prev, location: true }));
      } catch {
        setPermissions(prev => ({ ...prev, location: false }));
      }
    }

    // Check notification permission
    if ('Notification' in window) {
      setPermissions(prev => ({ 
        ...prev, 
        notifications: Notification.permission === 'granted' 
      }));
    }
  };

  const requestLocationPermission = async () => {
    if ('geolocation' in navigator) {
      try {
        await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 10000
          });
        });
        setPermissions(prev => ({ ...prev, location: true }));
        return true;
      } catch (error) {
        alert('Location access is required for tracking. Please enable location services and try again.');
        return false;
      }
    }
    return false;
  };

  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      const granted = permission === 'granted';
      setPermissions(prev => ({ ...prev, notifications: granted }));
      return granted;
    }
    return false;
  };

  const handlePrivacySubmit = async () => {
    if (!user || !privacyConsent) return;

    setIsProcessing(true);
    try {
      await PrivacyControlsService.updatePrivacySettings(user.id, facilityId, {
        ...trackingSettings,
        consentVersion: '1.0',
        consentDate: new Date()
      });
    } catch (error) {
      console.error('Failed to save privacy settings:', error);
      alert('Failed to save privacy settings. Please try again.');
    }
    setIsProcessing(false);
  };

  const handleComplete = async () => {
    if (!user) return;

    setIsProcessing(true);
    try {
      // Create and initialize tracker
      const newTracker = new RealtimeTracker(user.id, facilityId);
      await newTracker.startTracking({
        trackingMode: 'balanced'
      });
      
      setTracker(newTracker);
      onComplete(newTracker);
    } catch (error) {
      console.error('Failed to start tracking:', error);
      alert('Failed to start tracking. Please check your permissions and try again.');
    }
    setIsProcessing(false);
  };

  const steps: OnboardingStep[] = [
    {
      id: 'welcome',
      title: 'Welcome to Tracking',
      description: 'Set up real-time location tracking for safety and coordination',
      icon: <Shield className="w-8 h-8 text-blue-500" />,
      component: (
        <div className="text-center space-y-6">
          <div className="bg-blue-50 p-6 rounded-lg">
            <Shield className="w-16 h-16 text-blue-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Stay Safe & Connected</h3>
            <p className="text-gray-600 mb-4">
              Our tracking system helps keep you safe while enabling better team coordination.
            </p>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-green-500" />
                <span>Real-time location</span>
              </div>
              <div className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-blue-500" />
                <span>Instant messaging</span>
              </div>
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-500" />
                <span>Emergency alerts</span>
              </div>
              <div className="flex items-center gap-2">
                <Battery className="w-4 h-4 text-yellow-500" />
                <span>Battery optimized</span>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'privacy',
      title: 'Privacy & Data Settings',
      description: 'Control how your location data is used and shared',
      icon: <FileText className="w-8 h-8 text-green-500" />,
      component: (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-lg border border-green-200">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-5 h-5 text-green-600" />
              <h3 className="font-semibold text-green-800">Privacy-First Approach</h3>
            </div>
            <p className="text-sm text-gray-700">
              Choose your comfort level. We use QR codes instead of continuous GPS tracking for better privacy.
            </p>
          </div>

          {/* Tracking Mode Selection */}
          <div className="space-y-3">
            <label className="block font-medium">How would you like to be tracked?</label>
            <div className="space-y-2">
              <label className="flex items-start gap-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                <input
                  type="radio"
                  name="trackingMode"
                  value="zone-based"
                  checked={trackingSettings.trackingMode === 'zone-based'}
                  onChange={(e) => setTrackingSettings(prev => ({
                    ...prev,
                    trackingMode: e.target.value as any
                  }))}
                  className="mt-1"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <QrCode className="w-4 h-4 text-blue-500" />
                    <span className="font-medium text-green-700">QR Zone Entry (Recommended)</span>
                  </div>
                  <div className="text-sm text-gray-600">
                    Scan QR codes when entering work areas. No continuous GPS tracking.
                  </div>
                </div>
              </label>
              
              <label className="flex items-start gap-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                <input
                  type="radio"
                  name="trackingMode"
                  value="manual"
                  checked={trackingSettings.trackingMode === 'manual'}
                  onChange={(e) => setTrackingSettings(prev => ({
                    ...prev,
                    trackingMode: e.target.value as any
                  }))}
                  className="mt-1"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-500" />
                    <span className="font-medium">Manual Check-in Only</span>
                  </div>
                  <div className="text-sm text-gray-600">
                    You control when to log your location and activities.
                  </div>
                </div>
              </label>
              
              <label className="flex items-start gap-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                <input
                  type="radio"
                  name="trackingMode"
                  value="continuous"
                  checked={trackingSettings.trackingMode === 'continuous'}
                  onChange={(e) => setTrackingSettings(prev => ({
                    ...prev,
                    trackingMode: e.target.value as any
                  }))}
                  className="mt-1"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-orange-500" />
                    <span className="font-medium">Continuous GPS Tracking</span>
                  </div>
                  <div className="text-sm text-gray-600">
                    Traditional real-time location tracking during work hours.
                  </div>
                </div>
              </label>
            </div>
          </div>

          {/* Biometric Integration */}
          <div className="border-t pt-4">
            <label className="flex items-start gap-3">
              <input
                type="checkbox"
                checked={trackingSettings.enableBiometrics}
                onChange={(e) => setTrackingSettings(prev => ({
                  ...prev,
                  enableBiometrics: e.target.checked
                }))}
                className="mt-1"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <Watch className="w-4 h-4 text-purple-500" />
                  <span className="font-medium">Apple Watch Integration (Optional)</span>
                </div>
                <div className="text-sm text-gray-600 mb-2">
                  Connect your Apple Watch for personal fitness insights and productivity analytics.
                </div>
                
                {trackingSettings.enableBiometrics && (
                  <div className="ml-6 mt-3 space-y-2">
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={trackingSettings.biometricDataTypes.heartRate}
                        onChange={(e) => setTrackingSettings(prev => ({
                          ...prev,
                          biometricDataTypes: {
                            ...prev.biometricDataTypes,
                            heartRate: e.target.checked
                          }
                        }))}
                        className="w-3 h-3"
                      />
                      <Heart className="w-3 h-3 text-red-500" />
                      <span>Heart rate monitoring</span>
                    </label>
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={trackingSettings.biometricDataTypes.calories}
                        onChange={(e) => setTrackingSettings(prev => ({
                          ...prev,
                          biometricDataTypes: {
                            ...prev.biometricDataTypes,
                            calories: e.target.checked
                          }
                        }))}
                        className="w-3 h-3"
                      />
                      <Activity className="w-3 h-3 text-orange-500" />
                      <span>Calories burned</span>
                    </label>
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={trackingSettings.biometricDataTypes.steps}
                        onChange={(e) => setTrackingSettings(prev => ({
                          ...prev,
                          biometricDataTypes: {
                            ...prev.biometricDataTypes,
                            steps: e.target.checked
                          }
                        }))}
                        className="w-3 h-3"
                      />
                      <TrendingUp className="w-3 h-3 text-blue-500" />
                      <span>Step counting</span>
                    </label>
                  </div>
                )}
              </div>
            </label>
          </div>

          {/* Data Sharing Controls */}
          <div className="border-t pt-4 space-y-3">
            <h4 className="font-medium flex items-center gap-2">
              <Users2 className="w-4 h-4" />
              Data Sharing Preferences
            </h4>
            
            <label className="flex items-start gap-3">
              <input
                type="checkbox"
                checked={trackingSettings.shareAggregatedData}
                onChange={(e) => setTrackingSettings(prev => ({
                  ...prev,
                  shareAggregatedData: e.target.checked
                }))}
                className="mt-1"
              />
              <div>
                <div className="font-medium">Anonymous team analytics</div>
                <div className="text-sm text-gray-600">Help improve team productivity (your data is anonymized)</div>
              </div>
            </label>

            <label className="flex items-start gap-3">
              <input
                type="checkbox"
                checked={trackingSettings.shareWithSupervisors}
                onChange={(e) => setTrackingSettings(prev => ({
                  ...prev,
                  shareWithSupervisors: e.target.checked
                }))}
                className="mt-1"
              />
              <div>
                <div className="font-medium">Share with supervisors</div>
                <div className="text-sm text-gray-600">Allow supervisors to see your work zone activity</div>
              </div>
            </label>

            <label className="flex items-start gap-3">
              <input
                type="checkbox"
                checked={trackingSettings.shareWithPeers}
                onChange={(e) => setTrackingSettings(prev => ({
                  ...prev,
                  shareWithPeers: e.target.checked
                }))}
                className="mt-1"
              />
              <div>
                <div className="font-medium">Share with team members</div>
                <div className="text-sm text-gray-600">Allow team members to see your current work zone</div>
              </div>
            </label>
          </div>

          {/* Personal Benefits */}
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h4 className="font-medium text-blue-800 mb-2">What you get:</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Personal fitness and productivity insights</li>
              <li>• Break reminders and health alerts</li>
              <li>• Performance trends and improvement suggestions</li>
              <li>• Fair and accurate work time tracking</li>
            </ul>
          </div>

          <div>
            <label className="block font-medium mb-2">Data retention period</label>
            <select
              value={trackingSettings.locationRetentionDays}
              onChange={(e) => setTrackingSettings(prev => ({
                ...prev,
                locationRetentionDays: parseInt(e.target.value)
              }))}
              className="w-full p-2 border rounded-lg"
            >
              <option value={30}>30 days</option>
              <option value={90}>90 days (recommended)</option>
              <option value={180}>6 months</option>
              <option value={365}>1 year</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">
              How long to keep your work data
            </p>
          </div>
        </div>

          <div className="border-t pt-4">
            <label className="flex items-start gap-3">
              <input
                type="checkbox"
                checked={privacyConsent}
                onChange={(e) => setPrivacyConsent(e.target.checked)}
                className="mt-1"
                required
              />
              <div className="text-sm">
                <div className="font-medium">I agree to the privacy policy</div>
                <div className="text-gray-600">
                  I understand how my location data will be collected, used, and stored. 
                  I can change these settings or request data deletion at any time.
                </div>
              </div>
            </label>
          </div>
        </div>
      )
    },
    {
      id: 'permissions',
      title: 'Device Permissions',
      description: 'Grant necessary permissions for tracking to work',
      icon: <Smartphone className="w-8 h-8 text-purple-500" />,
      component: (
        <div className="space-y-6">
          <div className="bg-purple-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">Required Permissions</h3>
            <p className="text-sm text-gray-600">
              These permissions are needed for tracking to work properly on your device.
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <Navigation className="w-6 h-6 text-blue-500" />
                <div>
                  <div className="font-medium">Location Access</div>
                  <div className="text-sm text-gray-600">Required for GPS tracking</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {permissions.location ? (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                ) : (
                  <button
                    onClick={requestLocationPermission}
                    className="px-3 py-1 bg-blue-500 text-white text-sm rounded"
                  >
                    Grant
                  </button>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <Radio className="w-6 h-6 text-green-500" />
                <div>
                  <div className="font-medium">Notifications</div>
                  <div className="text-sm text-gray-600">For emergency alerts and messages</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {permissions.notifications ? (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                ) : (
                  <button
                    onClick={requestNotificationPermission}
                    className="px-3 py-1 bg-green-500 text-white text-sm rounded"
                  >
                    Grant
                  </button>
                )}
              </div>
            </div>
          </div>

          {!permissions.location && (
            <div className="bg-yellow-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 text-yellow-800">
                <AlertTriangle className="w-5 h-5" />
                <span className="font-medium">Location access required</span>
              </div>
              <p className="text-sm text-yellow-700 mt-1">
                Location permission is required for tracking to work. Please grant access and refresh the page if needed.
              </p>
            </div>
          )}
        </div>
      )
    },
    {
      id: 'ready',
      title: 'Ready to Start',
      description: 'Everything is set up and ready to go',
      icon: <CheckCircle className="w-8 h-8 text-green-500" />,
      component: (
        <div className="text-center space-y-6">
          <div className="bg-green-50 p-6 rounded-lg">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">You're All Set!</h3>
            <p className="text-gray-600 mb-4">
              Tracking is ready to start. You'll be able to:
            </p>
            <div className="grid grid-cols-1 gap-3 text-sm text-left">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-blue-500" />
                <span>Share your location with your team</span>
              </div>
              <div className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-blue-500" />
                <span>Send and receive instant messages</span>
              </div>
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-500" />
                <span>Send SOS alerts in emergencies</span>
              </div>
              <div className="flex items-center gap-2">
                <Settings className="w-4 h-4 text-gray-500" />
                <span>Adjust settings anytime in your profile</span>
              </div>
            </div>
          </div>
          
          {tracker && (
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-sm">
                <div className="font-medium">Tracking Status</div>
                <div className="text-blue-600">
                  Mode: {tracker.getBatteryStatus().currentMode.name}
                </div>
                <div className="text-blue-600">
                  Battery: {tracker.getBatteryStatus().estimatedTime} remaining
                </div>
              </div>
            </div>
          )}
        </div>
      )
    }
  ];

  const currentStepData = steps[currentStep];
  const canProceed = () => {
    switch (currentStep) {
      case 0: return true; // Welcome
      case 1: return privacyConsent; // Privacy
      case 2: return permissions.location; // Permissions (notifications optional)
      case 3: return true; // Ready
      default: return false;
    }
  };

  const nextStep = async () => {
    if (currentStep === 1) {
      await handlePrivacySubmit();
    }
    
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      await handleComplete();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-xl font-bold">Employee Tracking Setup</h2>
            <p className="text-gray-600">Step {currentStep + 1} of {steps.length}</p>
          </div>
          <button onClick={onCancel} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="px-6 py-4">
          <div className="flex items-center justify-between mb-2">
            {steps.map((step, index) => (
              <div
                key={step.id}
                className={`flex items-center ${index < steps.length - 1 ? 'flex-1' : ''}`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                    ${index <= currentStep 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-gray-200 text-gray-500'
                    }`}
                >
                  {index < currentStep ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    index + 1
                  )}
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`flex-1 h-1 mx-2 rounded
                      ${index < currentStep ? 'bg-blue-500' : 'bg-gray-200'}
                    `}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="px-6 py-4">
          <div className="flex items-center gap-3 mb-6">
            {currentStepData.icon}
            <div>
              <h3 className="text-lg font-semibold">{currentStepData.title}</h3>
              <p className="text-gray-600">{currentStepData.description}</p>
            </div>
          </div>

          {currentStepData.component}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t bg-gray-50">
          <button
            onClick={prevStep}
            disabled={currentStep === 0}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 disabled:opacity-50"
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </button>

          <button
            onClick={nextStep}
            disabled={!canProceed() || isProcessing}
            className="flex items-center gap-2 px-6 py-2 bg-blue-500 text-white rounded-lg disabled:opacity-50"
          >
            {isProcessing ? (
              <>
                <Clock className="w-4 h-4 animate-spin" />
                Processing...
              </>
            ) : currentStep === steps.length - 1 ? (
              <>
                Start Tracking
                <CheckCircle className="w-4 h-4" />
              </>
            ) : (
              <>
                Continue
                <ChevronRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}