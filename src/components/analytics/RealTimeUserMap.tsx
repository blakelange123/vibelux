'use client';

import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Users, TrendingUp, Globe, Activity, Zap, Eye, Clock } from 'lucide-react';

interface UserLocation {
  id: string;
  country: string;
  countryCode: string;
  city: string;
  latitude: number;
  longitude: number;
  activeUsers: number;
  sessions: number;
  avgSessionDuration: number;
  conversionRate: number;
}

interface RealTimeUserMapProps {
  userLocations?: UserLocation[];
  className?: string;
  updateInterval?: number;
  showHeatmap?: boolean;
  showTraffic?: boolean;
  showConversions?: boolean;
}

export default function RealTimeUserMap({
  userLocations: propUserLocations,
  className = '',
  updateInterval = 5000,
  showHeatmap = true,
  showTraffic = true,
  showConversions = true
}: RealTimeUserMapProps) {
  const [userLocations, setUserLocations] = useState<UserLocation[]>([]);
  const [totalActiveUsers, setTotalActiveUsers] = useState(0);
  const [selectedLocation, setSelectedLocation] = useState<UserLocation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [mapLoaded, setMapLoaded] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);

  // Mock data for demonstration
  const generateMockData = (): UserLocation[] => {
    const locations = [
      { country: 'United States', countryCode: 'US', city: 'New York', lat: 40.7128, lng: -74.0060 },
      { country: 'United States', countryCode: 'US', city: 'Los Angeles', lat: 34.0522, lng: -118.2437 },
      { country: 'United States', countryCode: 'US', city: 'Chicago', lat: 41.8781, lng: -87.6298 },
      { country: 'United Kingdom', countryCode: 'GB', city: 'London', lat: 51.5074, lng: -0.1278 },
      { country: 'Germany', countryCode: 'DE', city: 'Berlin', lat: 52.5200, lng: 13.4050 },
      { country: 'France', countryCode: 'FR', city: 'Paris', lat: 48.8566, lng: 2.3522 },
      { country: 'Japan', countryCode: 'JP', city: 'Tokyo', lat: 35.6762, lng: 139.6503 },
      { country: 'Australia', countryCode: 'AU', city: 'Sydney', lat: -33.8688, lng: 151.2093 },
      { country: 'Canada', countryCode: 'CA', city: 'Toronto', lat: 43.6532, lng: -79.3832 },
      { country: 'Brazil', countryCode: 'BR', city: 'São Paulo', lat: -23.5505, lng: -46.6333 },
      { country: 'India', countryCode: 'IN', city: 'Mumbai', lat: 19.0760, lng: 72.8777 },
      { country: 'Singapore', countryCode: 'SG', city: 'Singapore', lat: 1.3521, lng: 103.8198 },
      { country: 'Netherlands', countryCode: 'NL', city: 'Amsterdam', lat: 52.3676, lng: 4.9041 },
      { country: 'Spain', countryCode: 'ES', city: 'Madrid', lat: 40.4168, lng: -3.7038 }
    ];

    return locations.map((loc, index) => ({
      id: `loc-${index}`,
      country: loc.country,
      countryCode: loc.countryCode,
      city: loc.city,
      latitude: loc.lat,
      longitude: loc.lng,
      activeUsers: Math.floor(Math.random() * 50) + 1,
      sessions: Math.floor(Math.random() * 200) + 10,
      avgSessionDuration: Math.floor(Math.random() * 300) + 60,
      conversionRate: Math.random() * 15 + 1
    }));
  };

  // Load Leaflet dynamically
  useEffect(() => {
    const loadLeaflet = async () => {
      if (typeof window === 'undefined') return;

      // Load Leaflet CSS
      if (!document.querySelector('link[href*="leaflet"]')) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);
      }

      // Load Leaflet JS
      if (!(window as any).L) {
        return new Promise((resolve) => {
          const script = document.createElement('script');
          script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
          script.onload = resolve;
          document.head.appendChild(script);
        });
      }
    };

    loadLeaflet().then(() => {
      setMapLoaded(true);
    });
  }, []);

  // Initialize map
  useEffect(() => {
    if (!mapLoaded || !mapRef.current || mapInstanceRef.current) return;

    const L = (window as any).L;
    
    // Create map
    const map = L.map(mapRef.current, {
      center: [20, 0],
      zoom: 2,
      zoomControl: true,
      scrollWheelZoom: true,
      doubleClickZoom: true,
      boxZoom: true,
      keyboard: true,
      dragging: true,
      touchZoom: true
    });

    // Add tile layer (using OpenStreetMap)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 18,
    }).addTo(map);

    // Alternative: Use a dark theme tile layer
    // L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    //   attribution: '© OpenStreetMap contributors © CARTO',
    //   maxZoom: 18,
    // }).addTo(map);

    mapInstanceRef.current = map;

    // Cleanup
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [mapLoaded]);

  // Update markers when data changes
  useEffect(() => {
    if (!mapInstanceRef.current || !mapLoaded) return;

    const L = (window as any).L;
    const map = mapInstanceRef.current;

    // Clear existing markers
    markersRef.current.forEach(marker => map.removeLayer(marker));
    markersRef.current = [];

    // Add new markers
    const data = propUserLocations || userLocations;
    data.forEach((location) => {
      const markerSize = getMarkerSize(location.activeUsers);
      const color = getMarkerColor(location.conversionRate);

      // Create custom icon
      const icon = L.divIcon({
        className: 'custom-marker',
        html: `
          <div class="relative">
            <div class="w-${markerSize} h-${markerSize} ${color} rounded-full border-2 border-white shadow-lg flex items-center justify-center text-white text-xs font-bold animate-pulse">
              ${location.activeUsers}
            </div>
            <div class="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-3 h-3 ${color} rotate-45 border-r border-b border-white"></div>
          </div>
        `,
        iconSize: [40, 40],
        iconAnchor: [20, 35]
      });

      const marker = L.marker([location.latitude, location.longitude], { icon })
        .addTo(map)
        .bindPopup(`
          <div class="p-3 min-w-[250px]">
            <div class="flex items-center gap-2 mb-2">
              <div class="w-3 h-3 ${color} rounded-full"></div>
              <h3 class="font-bold text-gray-900">${location.city}, ${location.country}</h3>
            </div>
            <div class="space-y-2 text-sm">
              <div class="flex justify-between">
                <span class="text-gray-600">Active Users:</span>
                <span class="font-semibold">${location.activeUsers}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">Sessions:</span>
                <span class="font-semibold">${location.sessions}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">Avg Duration:</span>
                <span class="font-semibold">${Math.floor(location.avgSessionDuration / 60)}m ${location.avgSessionDuration % 60}s</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">Conversion Rate:</span>
                <span class="font-semibold">${location.conversionRate.toFixed(1)}%</span>
              </div>
            </div>
          </div>
        `, {
          closeButton: true,
          autoClose: false
        });

      // Add click event
      marker.on('click', () => {
        setSelectedLocation(location);
      });

      markersRef.current.push(marker);
    });

  }, [userLocations, propUserLocations, mapLoaded]);

  // Fetch real-time data
  useEffect(() => {
    if (propUserLocations) {
      setUserLocations(propUserLocations);
      setTotalActiveUsers(propUserLocations.reduce((sum, loc) => sum + loc.activeUsers, 0));
      setIsLoading(false);
      return;
    }

    const fetchRealTimeData = () => {
      const data = generateMockData();
      setUserLocations(data);
      setTotalActiveUsers(data.reduce((sum, loc) => sum + loc.activeUsers, 0));
      setIsLoading(false);
    };

    fetchRealTimeData();
    const interval = setInterval(fetchRealTimeData, updateInterval);

    return () => clearInterval(interval);
  }, [propUserLocations, updateInterval]);

  const getMarkerSize = (activeUsers: number): string => {
    if (activeUsers >= 30) return '8';
    if (activeUsers >= 15) return '6';
    return '4';
  };

  const getMarkerColor = (conversionRate: number): string => {
    if (conversionRate >= 10) return 'bg-green-500';
    if (conversionRate >= 5) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  if (isLoading) {
    return (
      <div className={`bg-gray-900 rounded-xl border border-gray-800 p-6 ${className}`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <Globe className="w-5 h-5 text-blue-400" />
            Real-Time Global Activity
          </h3>
          <div className="flex items-center gap-2 text-green-400">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-sm">Loading...</span>
          </div>
        </div>
        <div className="h-96 bg-gray-800 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <Globe className="w-12 h-12 text-gray-600 mx-auto mb-4 animate-spin" />
            <p className="text-gray-400">Loading real-time data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-gray-900 rounded-xl border border-gray-800 p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <Globe className="w-5 h-5 text-blue-400" />
          Real-Time Global Activity
        </h3>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-green-400">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-sm">Live</span>
            <span className="font-bold">{totalActiveUsers} Active Users</span>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-6 mb-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          <span className="text-gray-400">High Conversion</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
          <span className="text-gray-400">Medium Conversion</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
          <span className="text-gray-400">Low Conversion</span>
        </div>
        <div className="text-gray-500">• Size = Active Users</div>
      </div>

      {/* Map Container */}
      <div className="relative">
        <div 
          ref={mapRef} 
          className="h-96 w-full rounded-lg overflow-hidden border border-gray-700"
          style={{ background: '#1f2937' }}
        />
        
        {!mapLoaded && (
          <div className="absolute inset-0 bg-gray-800 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <MapPin className="w-8 h-8 text-gray-600 mx-auto mb-2" />
              <p className="text-gray-400 text-sm">Loading map...</p>
            </div>
          </div>
        )}
      </div>

      {/* Real-time Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
        <div className="bg-gray-800 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <Users className="w-4 h-4 text-blue-400" />
            <span className="text-xs text-gray-400">Active Now</span>
          </div>
          <p className="text-lg font-bold text-white">{totalActiveUsers}</p>
        </div>
        
        <div className="bg-gray-800 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <Activity className="w-4 h-4 text-green-400" />
            <span className="text-xs text-gray-400">Sessions</span>
          </div>
          <p className="text-lg font-bold text-white">
            {userLocations.reduce((sum, loc) => sum + loc.sessions, 0)}
          </p>
        </div>
        
        <div className="bg-gray-800 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <Clock className="w-4 h-4 text-purple-400" />
            <span className="text-xs text-gray-400">Avg Duration</span>
          </div>
          <p className="text-lg font-bold text-white">
            {Math.floor(userLocations.reduce((sum, loc) => sum + loc.avgSessionDuration, 0) / userLocations.length / 60)}m
          </p>
        </div>
        
        <div className="bg-gray-800 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-4 h-4 text-yellow-400" />
            <span className="text-xs text-gray-400">Avg Conversion</span>
          </div>
          <p className="text-lg font-bold text-white">
            {(userLocations.reduce((sum, loc) => sum + loc.conversionRate, 0) / userLocations.length).toFixed(1)}%
          </p>
        </div>
      </div>

      {/* Selected Location Details */}
      {selectedLocation && (
        <div className="mt-4 bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold text-white flex items-center gap-2">
              <MapPin className="w-4 h-4 text-blue-400" />
              {selectedLocation.city}, {selectedLocation.country}
            </h4>
            <button
              onClick={() => setSelectedLocation(null)}
              className="text-gray-400 hover:text-white"
            >
              ×
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-xs text-gray-400">Active Users</p>
              <p className="text-lg font-bold text-white">{selectedLocation.activeUsers}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Sessions</p>
              <p className="text-lg font-bold text-white">{selectedLocation.sessions}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Duration</p>
              <p className="text-lg font-bold text-white">
                {Math.floor(selectedLocation.avgSessionDuration / 60)}m {selectedLocation.avgSessionDuration % 60}s
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Conversion</p>
              <p className="text-lg font-bold text-white">{selectedLocation.conversionRate.toFixed(1)}%</p>
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        .custom-marker {
          background: transparent !important;
          border: none !important;
        }
        .leaflet-popup-content-wrapper {
          background: white;
          border-radius: 8px;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
        }
        .leaflet-popup-tip {
          background: white;
        }
      `}</style>
    </div>
  );
}