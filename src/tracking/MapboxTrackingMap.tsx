'use client';

import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

// Set your Mapbox access token
if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN) {
  mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
}

interface MapboxTrackingMapProps {
  center?: [number, number]; // [lng, lat]
  zoom?: number;
  locations: Array<{
    userId: string;
    name: string;
    latitude: number;
    longitude: number;
    status: 'online' | 'offline' | 'inactive';
    timestamp: Date;
  }>;
  geofences?: Array<{
    id: string;
    name: string;
    type: 'circular' | 'polygon';
    boundaries: any;
    color?: string;
  }>;
  onLocationClick?: (userId: string) => void;
  selectedUserId?: string;
}

export function MapboxTrackingMap({
  center = [-74.006, 40.7128], // Default to NYC
  zoom = 15,
  locations,
  geofences = [],
  onLocationClick,
  selectedUserId
}: MapboxTrackingMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    if (!process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN) {
      console.error('Mapbox access token not found');
      return;
    }

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center,
      zoom,
      antialias: true
    });

    map.current.on('load', () => {
      setMapLoaded(true);
      
      // Add user locations source
      map.current!.addSource('user-locations', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: []
        }
      });

      // Add geofences source
      map.current!.addSource('geofences', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: []
        }
      });

      // Add geofence fill layer
      map.current!.addLayer({
        id: 'geofences-fill',
        type: 'fill',
        source: 'geofences',
        paint: {
          'fill-color': ['get', 'color'],
          'fill-opacity': 0.2
        }
      });

      // Add geofence border layer
      map.current!.addLayer({
        id: 'geofences-border',
        type: 'line',
        source: 'geofences',
        paint: {
          'line-color': ['get', 'color'],
          'line-width': 2,
          'line-opacity': 0.8
        }
      });

      // Add user location circles
      map.current!.addLayer({
        id: 'user-locations',
        type: 'circle',
        source: 'user-locations',
        paint: {
          'circle-radius': [
            'case',
            ['==', ['get', 'selected'], true], 12,
            8
          ],
          'circle-color': [
            'case',
            ['==', ['get', 'status'], 'online'], '#10b981',
            ['==', ['get', 'status'], 'inactive'], '#f59e0b',
            '#6b7280'
          ],
          'circle-stroke-color': '#ffffff',
          'circle-stroke-width': 2,
          'circle-opacity': 0.9
        }
      });

      // Add user labels
      map.current!.addLayer({
        id: 'user-labels',
        type: 'symbol',
        source: 'user-locations',
        layout: {
          'text-field': ['get', 'name'],
          'text-font': ['Open Sans Semibold', 'Arial Unicode MS Bold'],
          'text-offset': [0, 1.25],
          'text-anchor': 'top',
          'text-size': 12
        },
        paint: {
          'text-color': '#ffffff',
          'text-halo-color': '#000000',
          'text-halo-width': 1
        }
      });

      // Click handler for user locations
      map.current!.on('click', 'user-locations', (e) => {
        if (e.features?.[0] && onLocationClick) {
          const userId = e.features[0].properties?.userId;
          if (userId) {
            onLocationClick(userId);
          }
        }
      });

      // Change cursor on hover
      map.current!.on('mouseenter', 'user-locations', () => {
        map.current!.getCanvas().style.cursor = 'pointer';
      });

      map.current!.on('mouseleave', 'user-locations', () => {
        map.current!.getCanvas().style.cursor = '';
      });
    });

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  // Update user locations
  useEffect(() => {
    if (!map.current || !mapLoaded) return;

    const features = locations.map(location => ({
      type: 'Feature' as const,
      geometry: {
        type: 'Point' as const,
        coordinates: [location.longitude, location.latitude]
      },
      properties: {
        userId: location.userId,
        name: location.name,
        status: location.status,
        timestamp: location.timestamp.toISOString(),
        selected: location.userId === selectedUserId
      }
    }));

    const source = map.current.getSource('user-locations') as mapboxgl.GeoJSONSource;
    if (source) {
      source.setData({
        type: 'FeatureCollection',
        features
      });
    }
  }, [locations, mapLoaded, selectedUserId]);

  // Update geofences
  useEffect(() => {
    if (!map.current || !mapLoaded) return;

    const features = geofences.map(fence => {
      let geometry;
      
      if (fence.type === 'circular') {
        // Create circle polygon
        const center = [fence.boundaries.center.lng, fence.boundaries.center.lat];
        const radius = fence.boundaries.radius;
        const points = 64;
        const coordinates = [];
        
        for (let i = 0; i < points; i++) {
          const angle = (i / points) * 2 * Math.PI;
          const dx = radius * Math.cos(angle) / 111320; // Rough conversion to degrees
          const dy = radius * Math.sin(angle) / (111320 * Math.cos(center[1] * Math.PI / 180));
          coordinates.push([center[0] + dx, center[1] + dy]);
        }
        coordinates.push(coordinates[0]); // Close the polygon
        
        geometry = {
          type: 'Polygon' as const,
          coordinates: [coordinates]
        };
      } else {
        // Polygon geofence
        geometry = {
          type: 'Polygon' as const,
          coordinates: [fence.boundaries.polygon.map((p: any) => [p.lng, p.lat])]
        };
      }

      return {
        type: 'Feature' as const,
        geometry,
        properties: {
          id: fence.id,
          name: fence.name,
          color: fence.color || '#8b5cf6'
        }
      };
    });

    const source = map.current.getSource('geofences') as mapboxgl.GeoJSONSource;
    if (source) {
      source.setData({
        type: 'FeatureCollection',
        features
      });
    }
  }, [geofences, mapLoaded]);

  // Center map on selected user
  useEffect(() => {
    if (!map.current || !selectedUserId) return;

    const selectedLocation = locations.find(loc => loc.userId === selectedUserId);
    if (selectedLocation) {
      map.current.flyTo({
        center: [selectedLocation.longitude, selectedLocation.latitude],
        zoom: 17,
        duration: 1000
      });
    }
  }, [selectedUserId, locations]);

  // Fit map to show all locations
  const fitToLocations = () => {
    if (!map.current || locations.length === 0) return;

    const bounds = new mapboxgl.LngLatBounds();
    locations.forEach(location => {
      bounds.extend([location.longitude, location.latitude]);
    });

    map.current.fitBounds(bounds, {
      padding: 50,
      duration: 1000
    });
  };

  // Add geofence drawing functionality
  const startDrawingGeofence = () => {
    if (!map.current) return;
    
    // This would integrate with Mapbox Draw for creating new geofences
  };

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainer} className="w-full h-full rounded-lg overflow-hidden" />
      
      {/* Map Controls */}
      <div className="absolute top-4 right-4 flex flex-col gap-2">
        <button
          onClick={fitToLocations}
          className="px-3 py-2 bg-gray-800 text-white rounded-lg shadow-lg hover:bg-gray-700 transition-colors text-sm"
        >
          Fit All
        </button>
        
        <button
          onClick={startDrawingGeofence}
          className="px-3 py-2 bg-purple-600 text-white rounded-lg shadow-lg hover:bg-purple-700 transition-colors text-sm"
        >
          Draw Zone
        </button>
      </div>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-gray-800 rounded-lg p-4 shadow-lg">
        <h4 className="text-white font-medium mb-2">Status</h4>
        <div className="space-y-1 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-gray-300">Online</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <span className="text-gray-300">Inactive</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
            <span className="text-gray-300">Offline</span>
          </div>
        </div>
      </div>

      {!process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN && (
        <div className="absolute inset-0 bg-gray-800 flex items-center justify-center rounded-lg">
          <div className="text-center text-gray-400">
            <p className="mb-2">Mapbox token not configured</p>
            <p className="text-sm">Add NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN to .env</p>
          </div>
        </div>
      )}
    </div>
  );
}