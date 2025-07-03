'use client';

import React from 'react';
import ServiceHealthDashboard from '@/components/ServiceHealthDashboard';
import { useUser } from '@clerk/nextjs';
import { redirect } from 'next/navigation';

export default function SystemHealthPage() {
  const { user, isLoaded } = useUser();

  // Simple admin check - in production you'd have proper role-based access
  if (isLoaded && !user) {
    redirect('/sign-in');
  }

  if (isLoaded && user && !user.emailAddresses[0]?.emailAddress.includes('vibelux')) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-4">
            This page is restricted to Vibelux administrators.
          </p>
          <a
            href="/dashboard"
            className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Return to Dashboard
          </a>
        </div>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">System Health Dashboard</h1>
          <p className="mt-2 text-gray-600">
            Monitor the status of all Vibelux services and infrastructure.
          </p>
        </div>

        <ServiceHealthDashboard />

        {/* Admin Actions */}
        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Admin Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={async () => {
                try {
                  const response = await fetch('/api/cron/status', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ action: 'start' })
                  });
                  const result = await response.json();
                  alert(result.success ? 'Cron jobs started' : result.error);
                } catch (error) {
                  alert('Failed to start cron jobs');
                }
              }}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Start Cron Jobs
            </button>
            
            <button
              onClick={async () => {
                try {
                  const response = await fetch('/api/cron/status', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ action: 'stop' })
                  });
                  const result = await response.json();
                  alert(result.success ? 'Cron jobs stopped' : result.error);
                } catch (error) {
                  alert('Failed to stop cron jobs');
                }
              }}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Stop Cron Jobs
            </button>

            <button
              onClick={() => {
                window.open('/api/health', '_blank');
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              View API Health
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}