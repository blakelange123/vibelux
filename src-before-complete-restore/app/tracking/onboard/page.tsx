'use client';

import React, { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { useSearchParams } from 'next/navigation';
import { EmployeeOnboarding } from '@/components/tracking/EmployeeOnboarding';
import { TrackingDashboard } from '@/components/tracking/TrackingDashboard';
import { RealtimeTracker } from '@/lib/realtime-tracker';
import { PrivacyControlsService } from '@/lib/privacy-controls';

export default function TrackingOnboardPage() {
  const { user } = useUser();
  const searchParams = useSearchParams();
  const facilityId = searchParams.get('facility') || 'default-facility';
  
  const [isOnboarding, setIsOnboarding] = useState(false);
  const [hasConsent, setHasConsent] = useState<boolean | null>(null);
  const [tracker, setTracker] = useState<RealtimeTracker | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkExistingConsent();
  }, [user, facilityId]);

  const checkExistingConsent = async () => {
    if (!user) return;

    try {
      const hasValidConsent = await PrivacyControlsService.hasValidConsent(user.id, facilityId);
      setHasConsent(hasValidConsent);
      
      if (hasValidConsent) {
        // Auto-start tracking if user has already consented
        const newTracker = new RealtimeTracker(user.id, facilityId);
        setTracker(newTracker);
      }
    } catch (error) {
      console.error('Failed to check consent:', error);
      setHasConsent(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartOnboarding = () => {
    setIsOnboarding(true);
  };

  const handleOnboardingComplete = (newTracker: RealtimeTracker) => {
    setTracker(newTracker);
    setIsOnboarding(false);
    setHasConsent(true);
  };

  const handleOnboardingCancel = () => {
    setIsOnboarding(false);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Authentication Required</h1>
          <p className="text-gray-600">Please sign in to access employee tracking.</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading tracking settings...</p>
        </div>
      </div>
    );
  }

  if (isOnboarding) {
    return (
      <EmployeeOnboarding
        facilityId={facilityId}
        onComplete={handleOnboardingComplete}
        onCancel={handleOnboardingCancel}
      />
    );
  }

  if (tracker && hasConsent) {
    return <TrackingDashboard tracker={tracker} facilityId={facilityId} />;
  }

  // Welcome/Start screen
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="mb-8">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                Welcome to Employee Tracking
              </h1>
              <p className="text-lg text-gray-600 mb-8">
                Set up real-time location tracking to stay connected with your team and enhance workplace safety.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">Quick Setup</h3>
                <p className="text-sm text-gray-600">5-minute setup process with clear instructions</p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">Privacy First</h3>
                <p className="text-sm text-gray-600">You control your data and privacy settings</p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">Battery Smart</h3>
                <p className="text-sm text-gray-600">Automatically optimizes for your device battery</p>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-6 mb-8">
              <h3 className="font-semibold text-gray-900 mb-3">What you'll get:</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-sm text-gray-700">Real-time location sharing</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-sm text-gray-700">Instant team messaging</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-sm text-gray-700">Emergency SOS alerts</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-sm text-gray-700">Geofence notifications</span>
                </div>
              </div>
            </div>

            <button
              onClick={handleStartOnboarding}
              className="w-full bg-blue-500 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-600 transition-colors"
            >
              Get Started
            </button>

            <p className="text-xs text-gray-500 mt-4">
              By continuing, you'll be asked to review and accept our privacy policy and grant necessary device permissions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}