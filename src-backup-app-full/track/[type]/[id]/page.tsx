'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { 
  Package, MapPin, Clock, Activity, AlertCircle, 
  CheckCircle, TrendingUp, Calendar, User
} from 'lucide-react';

interface TrackingData {
  id: string;
  type: string;
  metadata: {
    name: string;
    description?: string;
    category?: string;
  };
  tracking: {
    createdAt: string;
    lastScanned?: string;
    scanCount: number;
    currentLocation?: string;
    status: string;
  };
  history?: Array<{
    timestamp: string;
    location: string;
    scannedBy: string;
    action: string;
  }>;
}

export default function TrackingPage() {
  const params = useParams();
  const [trackingData, setTrackingData] = useState<TrackingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (params.type && params.id) {
      // Record the scan
      recordScan();
      // Fetch tracking data
      fetchTrackingData();
    }
  }, [params.type, params.id]);

  const recordScan = async () => {
    try {
      const response = await fetch('/api/tracking/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          qrCodeUrl: `${window.location.origin}/track/${params.type}/${params.id}`,
          location: 'Mobile Scanner',
          timestamp: new Date().toISOString()
        })
      });

      if (!response.ok) {
        console.error('Failed to record scan');
      }
    } catch (error) {
      console.error('Scan recording error:', error);
    }
  };

  const fetchTrackingData = async () => {
    setLoading(true);
    try {
      // In a real implementation, this would fetch from your API
      // For now, we'll use mock data
      const mockData: TrackingData = {
        id: params.id as string,
        type: params.type as string,
        metadata: {
          name: `${params.type} ${params.id}`,
          description: 'Tracked asset in VibeLux facility',
          category: 'Production'
        },
        tracking: {
          createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          lastScanned: new Date().toISOString(),
          scanCount: 12,
          currentLocation: 'Zone A - Production Floor',
          status: 'active'
        },
        history: [
          {
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            location: 'Loading Bay',
            scannedBy: 'John Smith',
            action: 'Moved'
          },
          {
            timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
            location: 'Storage Area',
            scannedBy: 'Sarah Johnson',
            action: 'Stored'
          },
          {
            timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
            location: 'Quality Control',
            scannedBy: 'Mike Chen',
            action: 'Inspected'
          }
        ]
      };

      setTrackingData(mockData);
    } catch (err) {
      setError('Failed to load tracking data');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-400 bg-green-400/10';
      case 'inactive': return 'text-gray-400 bg-gray-400/10';
      case 'maintenance': return 'text-yellow-400 bg-yellow-400/10';
      default: return 'text-gray-400 bg-gray-400/10';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'container': return Package;
      case 'inventory': return Package;
      case 'asset': return Activity;
      case 'location': return MapPin;
      default: return Package;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-400">Loading tracking data...</p>
        </div>
      </div>
    );
  }

  if (error || !trackingData) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Tracking Error</h1>
          <p className="text-gray-400">{error || 'Invalid tracking code'}</p>
        </div>
      </div>
    );
  }

  const TypeIcon = getTypeIcon(trackingData.type);

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/20 rounded-lg">
              <TypeIcon className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">{trackingData.metadata.name}</h1>
              <p className="text-white/80">{trackingData.type} • {trackingData.id}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6">
        {/* Status Card */}
        <div className="bg-gray-900/50 rounded-xl p-6 border border-white/10 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Current Status</h2>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(trackingData.tracking.status)}`}>
              {trackingData.tracking.status}
            </span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="flex items-center gap-2 text-gray-400 mb-1">
                <MapPin className="w-4 h-4" />
                <span className="text-sm">Current Location</span>
              </div>
              <p className="font-medium">{trackingData.tracking.currentLocation || 'Unknown'}</p>
            </div>
            
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="flex items-center gap-2 text-gray-400 mb-1">
                <Clock className="w-4 h-4" />
                <span className="text-sm">Last Scanned</span>
              </div>
              <p className="font-medium">
                {trackingData.tracking.lastScanned 
                  ? new Date(trackingData.tracking.lastScanned).toLocaleString()
                  : 'Never'}
              </p>
            </div>
          </div>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-gray-900/50 rounded-xl p-4 border border-white/10">
            <div className="flex items-center gap-2 text-gray-400 mb-1">
              <Activity className="w-4 h-4" />
              <span className="text-sm">Total Scans</span>
            </div>
            <p className="text-2xl font-bold">{trackingData.tracking.scanCount}</p>
          </div>
          
          <div className="bg-gray-900/50 rounded-xl p-4 border border-white/10">
            <div className="flex items-center gap-2 text-gray-400 mb-1">
              <Calendar className="w-4 h-4" />
              <span className="text-sm">Age</span>
            </div>
            <p className="text-2xl font-bold">
              {Math.floor((Date.now() - new Date(trackingData.tracking.createdAt).getTime()) / (1000 * 60 * 60 * 24))} days
            </p>
          </div>
          
          <div className="bg-gray-900/50 rounded-xl p-4 border border-white/10">
            <div className="flex items-center gap-2 text-gray-400 mb-1">
              <TrendingUp className="w-4 h-4" />
              <span className="text-sm">Activity Level</span>
            </div>
            <p className="text-2xl font-bold text-green-400">High</p>
          </div>
        </div>

        {/* Movement History */}
        <div className="bg-gray-900/50 rounded-xl p-6 border border-white/10">
          <h2 className="text-xl font-semibold mb-4">Movement History</h2>
          
          {trackingData.history && trackingData.history.length > 0 ? (
            <div className="space-y-3">
              {trackingData.history.map((event, index) => (
                <div key={index} className="flex items-start gap-4 p-4 bg-gray-800 rounded-lg">
                  <div className="p-2 bg-gray-700 rounded-lg">
                    <MapPin className="w-5 h-5 text-gray-400" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-medium">{event.location}</p>
                      <span className="text-sm text-gray-400">
                        {new Date(event.timestamp).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-400">
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {event.scannedBy}
                      </span>
                      <span className="text-purple-400">{event.action}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-center py-8">No movement history available</p>
          )}
        </div>

        {/* Actions */}
        <div className="mt-6 flex flex-col sm:flex-row gap-4">
          <button className="flex-1 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center gap-2">
            <Activity className="w-5 h-5" />
            Report Issue
          </button>
          <button className="flex-1 px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors flex items-center justify-center gap-2">
            <MapPin className="w-5 h-5" />
            Update Location
          </button>
        </div>
      </div>
    </div>
  );
}