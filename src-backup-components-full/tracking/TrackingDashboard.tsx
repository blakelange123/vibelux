'use client';

import React, { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import {
  MapPin, MessageCircle, AlertTriangle, Battery, Settings,
  Users, Clock, Navigation, Radio, Shield, LogOut, Zap
} from 'lucide-react';
import { RealtimeTracker, LocationUpdate, TrackingAlert, Message } from '@/lib/realtime-tracker';
import { MapboxTrackingMap } from './MapboxTrackingMap';

interface TrackingDashboardProps {
  tracker: RealtimeTracker;
  facilityId: string;
}

export function TrackingDashboard({ tracker, facilityId }: TrackingDashboardProps) {
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState<'map' | 'messages' | 'alerts' | 'settings'>('map');
  const [currentLocation, setCurrentLocation] = useState<LocationUpdate | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [alerts, setAlerts] = useState<TrackingAlert[]>([]);
  const [userLocations, setUserLocations] = useState<Array<{
    userId: string;
    name: string;
    latitude: number;
    longitude: number;
    status: 'online' | 'offline' | 'inactive';
    timestamp: Date;
  }>>([]);
  const [batteryStatus, setBatteryStatus] = useState(tracker.getBatteryStatus());
  const [isTracking, setIsTracking] = useState(true);

  useEffect(() => {
    // Set up event listeners
    tracker.onLocation((location) => {
      setCurrentLocation(location);
    });

    tracker.onMessageReceived((message) => {
      setMessages(prev => [message, ...prev].slice(0, 50)); // Keep last 50 messages
    });

    tracker.onAlertReceived((alert) => {
      setAlerts(prev => [alert, ...prev].slice(0, 20)); // Keep last 20 alerts
      
      // Show browser notification for high-priority alerts
      if (alert.severity === 'critical' && 'Notification' in window && Notification.permission === 'granted') {
        new Notification(alert.title, {
          body: alert.message,
          icon: '/favicon.ico'
        });
      }
    });

    // Update battery status periodically
    const batteryInterval = setInterval(() => {
      setBatteryStatus(tracker.getBatteryStatus());
    }, 30000); // Every 30 seconds

    return () => {
      clearInterval(batteryInterval);
    };
  }, [tracker]);

  const handleSendMessage = async (content: string, priority: 'normal' | 'high' | 'urgent' = 'normal') => {
    try {
      await tracker.sendMessage({
        to: 'broadcast',
        type: 'text',
        content,
        priority,
        location: currentLocation?.location
      });
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleSendSOS = async () => {
    try {
      await tracker.sendSOSAlert('Emergency assistance needed');
      alert('SOS alert sent to your team!');
    } catch (error) {
      console.error('Failed to send SOS:', error);
      alert('Failed to send SOS alert. Please try again.');
    }
  };

  const handleStopTracking = () => {
    tracker.stopTracking();
    setIsTracking(false);
    setCurrentLocation(null);
  };

  const mapCenter: [number, number] = currentLocation 
    ? [currentLocation.location.longitude, currentLocation.location.latitude]
    : [-74.006, 40.7128]; // Default to NYC

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900">Employee Tracking</h1>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <div className={`w-2 h-2 rounded-full ${isTracking ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <span>{isTracking ? 'Active' : 'Stopped'}</span>
                </div>
                {batteryStatus.batteryInfo && (
                  <div className="flex items-center gap-1">
                    <Battery className="w-4 h-4" />
                    <span>{Math.round(batteryStatus.batteryInfo.level * 100)}%</span>
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <Zap className="w-4 h-4" />
                  <span>{batteryStatus.currentMode.name}</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={handleSendSOS}
                className="bg-red-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-600 transition-colors"
              >
                <AlertTriangle className="w-4 h-4 inline mr-1" />
                SOS
              </button>
              <button
                onClick={handleStopTracking}
                className="bg-gray-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-gray-600 transition-colors"
              >
                <LogOut className="w-4 h-4 inline mr-1" />
                Stop
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4">
          <div className="flex space-x-8">
            {[
              { id: 'map', label: 'Live Map', icon: MapPin },
              { id: 'messages', label: 'Messages', icon: MessageCircle },
              { id: 'alerts', label: 'Alerts', icon: AlertTriangle },
              { id: 'settings', label: 'Settings', icon: Settings }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
                {tab.id === 'messages' && messages.length > 0 && (
                  <span className="bg-blue-500 text-white text-xs rounded-full px-2 py-0.5">
                    {messages.length}
                  </span>
                )}
                {tab.id === 'alerts' && alerts.length > 0 && (
                  <span className="bg-red-500 text-white text-xs rounded-full px-2 py-0.5">
                    {alerts.length}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-6">
        {activeTab === 'map' && (
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="h-96">
              {currentLocation ? (
                <MapboxTrackingMap
                  center={mapCenter}
                  zoom={15}
                  locations={[
                    {
                      userId: user?.id || 'current',
                      name: user?.fullName || 'You',
                      latitude: currentLocation.location.latitude,
                      longitude: currentLocation.location.longitude,
                      status: 'online',
                      timestamp: currentLocation.timestamp
                    },
                    ...userLocations
                  ]}
                  selectedUserId={user?.id}
                />
              ) : (
                <div className="h-full flex items-center justify-center bg-gray-100">
                  <div className="text-center">
                    <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Location Data</h3>
                    <p className="text-gray-600">Waiting for GPS location...</p>
                  </div>
                </div>
              )}
            </div>
            
            {currentLocation && (
              <div className="p-4 border-t bg-gray-50">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Latitude:</span>
                    <br />
                    <span className="text-gray-600">{currentLocation.location.latitude.toFixed(6)}</span>
                  </div>
                  <div>
                    <span className="font-medium">Longitude:</span>
                    <br />
                    <span className="text-gray-600">{currentLocation.location.longitude.toFixed(6)}</span>
                  </div>
                  <div>
                    <span className="font-medium">Accuracy:</span>
                    <br />
                    <span className="text-gray-600">{Math.round(currentLocation.location.accuracy)}m</span>
                  </div>
                  <div>
                    <span className="font-medium">Last Update:</span>
                    <br />
                    <span className="text-gray-600">{currentLocation.timestamp.toLocaleTimeString()}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'messages' && (
          <div className="bg-white rounded-lg shadow-lg">
            <div className="p-4 border-b">
              <h2 className="text-lg font-semibold">Team Messages</h2>
            </div>
            <div className="h-96 overflow-y-auto p-4">
              {messages.length === 0 ? (
                <div className="text-center text-gray-500 mt-12">
                  <MessageCircle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>No messages yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((message, index) => (
                    <div key={index} className="border rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">{message.from}</span>
                        <span className="text-xs text-gray-500">
                          {message.timestamp.toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-gray-700">{message.content}</p>
                      {message.priority !== 'normal' && (
                        <span className={`inline-block px-2 py-1 text-xs rounded mt-2 ${
                          message.priority === 'urgent' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {message.priority.toUpperCase()}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="p-4 border-t">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Type your message..."
                  className="flex-1 px-3 py-2 border rounded-lg"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      const input = e.target as HTMLInputElement;
                      if (input.value.trim()) {
                        handleSendMessage(input.value.trim());
                        input.value = '';
                      }
                    }
                  }}
                />
                <button
                  onClick={() => {
                    const input = document.querySelector('input[type="text"]') as HTMLInputElement;
                    if (input?.value.trim()) {
                      handleSendMessage(input.value.trim());
                      input.value = '';
                    }
                  }}
                  className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'alerts' && (
          <div className="bg-white rounded-lg shadow-lg">
            <div className="p-4 border-b">
              <h2 className="text-lg font-semibold">Recent Alerts</h2>
            </div>
            <div className="h-96 overflow-y-auto p-4">
              {alerts.length === 0 ? (
                <div className="text-center text-gray-500 mt-12">
                  <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>No alerts</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {alerts.map((alert, index) => (
                    <div key={index} className={`border rounded-lg p-4 ${
                      alert.severity === 'critical' ? 'border-red-200 bg-red-50' :
                      alert.severity === 'warning' ? 'border-yellow-200 bg-yellow-50' :
                      'border-blue-200 bg-blue-50'
                    }`}>
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium">{alert.title}</h3>
                        <span className="text-xs text-gray-500">
                          {alert.timestamp.toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-gray-700 mb-2">{alert.message}</p>
                      <span className={`inline-block px-2 py-1 text-xs rounded ${
                        alert.severity === 'critical' ? 'bg-red-100 text-red-800' :
                        alert.severity === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {alert.severity.toUpperCase()}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-lg font-semibold mb-6">Tracking Settings</h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="font-medium mb-3">Battery Optimization</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="border rounded-lg p-4">
                    <h4 className="font-medium mb-2">Current Mode</h4>
                    <p className="text-lg text-blue-600 font-semibold">{batteryStatus.currentMode.name}</p>
                    <p className="text-sm text-gray-600">{batteryStatus.currentMode.description}</p>
                  </div>
                  <div className="border rounded-lg p-4">
                    <h4 className="font-medium mb-2">Estimated Time</h4>
                    <p className="text-lg text-green-600 font-semibold">{batteryStatus.estimatedTime}</p>
                    <p className="text-sm text-gray-600">Remaining tracking time</p>
                  </div>
                </div>
                
                <div className="mt-4">
                  <h4 className="font-medium mb-2">Available Modes</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
                    {batteryStatus.availableModes.map((mode) => (
                      <button
                        key={mode.name}
                        onClick={() => tracker.setTrackingMode(mode.name.toLowerCase().split(' ')[0] as any)}
                        className={`p-3 border rounded-lg text-left ${
                          mode.name === batteryStatus.currentMode.name
                            ? 'border-blue-500 bg-blue-50'
                            : 'hover:border-gray-300'
                        }`}
                      >
                        <div className="font-medium text-sm">{mode.name}</div>
                        <div className="text-xs text-gray-500">{mode.description}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {batteryStatus.recommendations.length > 0 && (
                <div>
                  <h3 className="font-medium mb-3">Recommendations</h3>
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <ul className="space-y-1">
                      {batteryStatus.recommendations.map((rec, index) => (
                        <li key={index} className="text-sm text-yellow-800">• {rec}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}