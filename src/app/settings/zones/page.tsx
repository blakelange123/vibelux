'use client';

import { ZoneConfiguration } from '@/components/config/ZoneConfiguration';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ZoneSettingsPage() {
  const router = useRouter();

  const handleSaveZones = (zones: any[]) => {
    // In a real app, this would save to the backend
    
    // Store in localStorage for now
    localStorage.setItem('facility-zones', JSON.stringify(zones));
    
    // Show success message (you'd use a toast in production)
    alert('Zone configuration saved successfully!');
  };

  // Load existing zones from localStorage
  const existingZones = typeof window !== 'undefined' 
    ? JSON.parse(localStorage.getItem('facility-zones') || '[]')
    : [];

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-6">
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          
          <h1 className="text-3xl font-bold mb-2">Zone Configuration</h1>
          <p className="text-gray-400">
            Configure facility zones and assign control systems. Ensure each piece of equipment 
            is controlled by only one system to prevent conflicts.
          </p>
        </div>

        <ZoneConfiguration 
          onSave={handleSaveZones}
          existingZones={existingZones}
        />

        <div className="mt-8 p-6 bg-gray-900 rounded-lg border border-gray-800">
          <h3 className="text-lg font-semibold text-white mb-3">Control System Guidelines</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
            <div>
              <h4 className="font-medium text-purple-400 mb-2">BMS (Building Management System)</h4>
              <ul className="space-y-1 text-gray-400">
                <li>• Best for facility-wide climate control</li>
                <li>• Ideal for HVAC and environmental management</li>
                <li>• Supports complex control strategies</li>
                <li>• Integrates with building infrastructure</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-purple-400 mb-2">HMI (Human Machine Interface)</h4>
              <ul className="space-y-1 text-gray-400">
                <li>• Best for equipment-level control</li>
                <li>• Real-time monitoring and adjustments</li>
                <li>• Direct equipment operation</li>
                <li>• Maintenance and troubleshooting</li>
              </ul>
            </div>
          </div>
          <div className="mt-4 p-3 bg-yellow-900/20 border border-yellow-600/50 rounded">
            <p className="text-sm text-yellow-400">
              <strong>Important:</strong> Each piece of equipment should be controlled by only one system. 
              Dual control can cause conflicts and unpredictable behavior.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}