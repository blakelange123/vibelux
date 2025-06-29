'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  MapPin, Navigation, Users, AlertTriangle, MessageSquare, 
  Send, Bell, Battery, Signal, Shield, Zap, UserPlus,
  Circle, Share2, Phone, Clock, Activity
} from 'lucide-react';
import { RealtimeTracker, LocationUpdate, TrackingAlert, Message, GeofenceZone } from '@/lib/realtime-tracker';
import { NotificationService } from '@/lib/notification-service';

interface RealtimeTrackingMapProps {
  userId: string;
  facilityId: string;
  isAdmin?: boolean;
}

interface TrackedUser {
  userId: string;
  name: string;
  role: string;
  lastLocation?: LocationUpdate;
  status: 'online' | 'offline' | 'inactive';
  battery?: number;
}

export function RealtimeTrackingMap({ userId, facilityId, isAdmin = false }: RealtimeTrackingMapProps) {
  const [tracker, setTracker] = useState<RealtimeTracker | null>(null);
  const [currentLocation, setCurrentLocation] = useState<LocationUpdate | null>(null);
  const [trackedUsers, setTrackedUsers] = useState<Map<string, TrackedUser>>(new Map());
  const [alerts, setAlerts] = useState<TrackingAlert[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTracking, setIsTracking] = useState(false);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [showMessaging, setShowMessaging] = useState(false);
  const [messageInput, setMessageInput] = useState('');
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const rt = new RealtimeTracker(userId, facilityId);
    
    // Set up event handlers
    rt.onLocation((location) => {
      setCurrentLocation(location);
      updateMapPosition(location);
    });

    rt.onAlertReceived((alert) => {
      setAlerts(prev => [alert, ...prev].slice(0, 50)); // Keep last 50 alerts
      showNotification(alert);
    });

    rt.onMessageReceived((message) => {
      setMessages(prev => [message, ...prev].slice(0, 100)); // Keep last 100 messages
      if (message.priority === 'urgent' || message.priority === 'high') {
        showNotification({
          id: message.id,
          type: 'custom',
          severity: message.priority === 'urgent' ? 'critical' : 'warning',
          title: `Message from ${message.from}`,
          message: message.content,
          timestamp: message.timestamp
        });
      }
    });

    rt.onUsersUpdated((users) => {
      const updatedUsers = new Map<string, TrackedUser>();
      users.forEach((location, uid) => {
        updatedUsers.set(uid, {
          userId: uid,
          name: `User ${uid}`, // In real app, fetch from user service
          role: 'Worker',
          lastLocation: location,
          status: 'online',
          battery: location.battery
        });
      });
      setTrackedUsers(updatedUsers);
    });

    setTracker(rt);

    return () => {
      rt.stopTracking();
    };
  }, [userId, facilityId]);

  const startTracking = async () => {
    if (!tracker) return;

    try {
      // Request notification permission
      const notificationService = NotificationService.getInstance();
      await notificationService.requestPermission();

      await tracker.startTracking({
        updateInterval: 5000, // 5 seconds
        enableHighAccuracy: true,
        trackingMode: 'active'
      });
      setIsTracking(true);
    } catch (error) {
      console.error('Failed to start tracking:', error);
      alert('Failed to start tracking. Please enable location services.');
    }
  };

  const stopTracking = () => {
    tracker?.stopTracking();
    setIsTracking(false);
  };

  const sendSOSAlert = async () => {
    await tracker?.sendSOSAlert('Emergency assistance needed!');
  };

  const sendMessage = async () => {
    if (!messageInput.trim() || !tracker) return;

    await tracker.sendMessage({
      to: selectedUser || 'broadcast',
      type: 'text',
      content: messageInput,
      priority: 'normal'
    });

    setMessageInput('');
  };

  const requestHelp = async () => {
    await tracker?.requestNearbyHelp('Assistance needed at my location', 200);
  };

  const createSafetyZone = async () => {
    if (!currentLocation || !tracker) return;

    const zone: GeofenceZone = {
      id: `zone-${Date.now()}`,
      name: 'Safety Zone',
      type: 'circular',
      boundaries: {
        center: {
          lat: currentLocation.location.latitude,
          lng: currentLocation.location.longitude
        },
        radius: 50 // 50 meters
      },
      alerts: {
        onEnter: false,
        onExit: true
      }
    };

    await tracker.createGeofence(zone);
  };

  const shareLiveLocation = async (duration: number = 3600000) => {
    if (!tracker || !selectedUser) return;
    await tracker.shareLiveLocation([selectedUser], duration);
  };

  const updateMapPosition = (location: LocationUpdate) => {
    // In a real implementation, this would update a map library like Mapbox or Google Maps
  };

  const showNotification = (alert: TrackingAlert) => {
    const notificationService = NotificationService.getInstance();
    
    switch (alert.type) {
      case 'sos':
        notificationService.showSOSAlert(userId, alert.message);
        break;
      case 'proximity':
        notificationService.showProximityAlert(alert.message);
        break;
      case 'geofence':
        const action = alert.metadata?.action as 'entered' | 'exited';
        notificationService.showGeofenceAlert(action, alert.metadata?.zoneName || 'Unknown Zone');
        break;
      case 'battery':
        notificationService.showBatteryAlert(userId, 0.15);
        break;
      default:
        notificationService.showNotification(alert.title, {
          body: alert.message,
          tag: alert.id
        });
    }
  };

  const getStatusColor = (status: TrackedUser['status']) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'offline': return 'bg-gray-500';
      case 'inactive': return 'bg-yellow-500';
    }
  };

  const getSeverityColor = (severity: TrackingAlert['severity']) => {
    switch (severity) {
      case 'info': return 'text-blue-400 bg-blue-400/10';
      case 'warning': return 'text-yellow-400 bg-yellow-400/10';
      case 'critical': return 'text-red-400 bg-red-400/10';
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Real-Time Tracking</h1>
            <p className="text-gray-400">Live location tracking and communication</p>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Quick Actions */}
            <button
              onClick={sendSOSAlert}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
            >
              <AlertTriangle className="w-4 h-4" />
              SOS
            </button>
            
            <button
              onClick={requestHelp}
              className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors flex items-center gap-2"
            >
              <UserPlus className="w-4 h-4" />
              Request Help
            </button>

            <button
              onClick={() => setShowMessaging(!showMessaging)}
              className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors flex items-center gap-2"
            >
              <MessageSquare className="w-4 h-4" />
              Messages
              {messages.filter(m => !m.read).length > 0 && (
                <span className="bg-red-500 text-white text-xs rounded-full px-2">
                  {messages.filter(m => !m.read).length}
                </span>
              )}
            </button>

            {!isTracking ? (
              <button
                onClick={startTracking}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
              >
                <Navigation className="w-4 h-4" />
                Start Tracking
              </button>
            ) : (
              <button
                onClick={stopTracking}
                className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2"
              >
                <Circle className="w-4 h-4" />
                Stop Tracking
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Map View */}
          <div className="lg:col-span-2">
            <div className="bg-gray-900/50 rounded-xl border border-white/10 overflow-hidden">
              {/* Map Header */}
              <div className="bg-gray-800 p-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Live Map
                </h2>
                
                {currentLocation && (
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-gray-400">
                      Accuracy: {Math.round(currentLocation.location.accuracy)}m
                    </span>
                    {currentLocation.location.speed && (
                      <span className="text-gray-400">
                        Speed: {Math.round(currentLocation.location.speed * 3.6)} km/h
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Map Container */}
              <div ref={mapRef} className="h-96 bg-gray-800 relative">
                {/* Placeholder map - in real app, integrate with map library */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <Navigation className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-500">Map view</p>
                    {currentLocation && (
                      <p className="text-sm text-gray-400 mt-2">
                        {currentLocation.location.latitude.toFixed(6)}, {currentLocation.location.longitude.toFixed(6)}
                      </p>
                    )}
                  </div>
                </div>

                {/* User markers */}
                {Array.from(trackedUsers.values()).map((user) => (
                  user.lastLocation && (
                    <div
                      key={user.userId}
                      className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
                      style={{
                        // In real app, calculate position based on lat/lng
                        top: `${50 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 40 - 20}%`,
                        left: `${50 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 40 - 20}%`
                      }}
                    >
                      <div className="relative">
                        <div className={`w-3 h-3 ${getStatusColor(user.status)} rounded-full animate-pulse`}></div>
                        <span className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs bg-gray-700 px-2 py-1 rounded whitespace-nowrap">
                          {user.name}
                        </span>
                      </div>
                    </div>
                  )
                ))}
              </div>

              {/* Map Controls */}
              <div className="p-4 bg-gray-800 flex items-center justify-between">
                <div className="flex gap-2">
                  <button
                    onClick={createSafetyZone}
                    className="px-3 py-1.5 bg-gray-700 text-white rounded text-sm hover:bg-gray-600 transition-colors flex items-center gap-1"
                  >
                    <Shield className="w-4 h-4" />
                    Create Safety Zone
                  </button>
                  
                  {selectedUser && (
                    <button
                      onClick={() => shareLiveLocation()}
                      className="px-3 py-1.5 bg-gray-700 text-white rounded text-sm hover:bg-gray-600 transition-colors flex items-center gap-1"
                    >
                      <Share2 className="w-4 h-4" />
                      Share Location
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <Signal className="w-4 h-4" />
                  <span>{trackedUsers.size} users online</span>
                </div>
              </div>
            </div>

            {/* Alerts Panel */}
            <div className="mt-8 bg-gray-900/50 rounded-xl p-6 border border-white/10">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Recent Alerts
              </h3>

              {alerts.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No active alerts</p>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {alerts.map((alert) => (
                    <div 
                      key={alert.id} 
                      className={`p-3 rounded-lg flex items-start gap-3 ${getSeverityColor(alert.severity)}`}
                    >
                      <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="font-medium">{alert.title}</p>
                        <p className="text-sm opacity-80">{alert.message}</p>
                        <p className="text-xs opacity-60 mt-1">
                          {new Date(alert.timestamp).toLocaleTimeString()}
                        </p>
                      </div>
                      {!alert.acknowledged && (
                        <button className="text-xs px-2 py-1 bg-white/10 rounded hover:bg-white/20 transition-colors">
                          Acknowledge
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Side Panel */}
          <div className="space-y-8">
            {/* User List */}
            <div className="bg-gray-900/50 rounded-xl p-6 border border-white/10">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Users className="w-5 h-5" />
                Active Users
              </h3>

              <div className="space-y-2">
                {Array.from(trackedUsers.values()).map((user) => (
                  <button
                    key={user.userId}
                    onClick={() => setSelectedUser(user.userId)}
                    className={`w-full p-3 rounded-lg text-left transition-all ${
                      selectedUser === user.userId 
                        ? 'bg-purple-500/20 border border-purple-500' 
                        : 'bg-gray-800 border border-gray-700 hover:border-gray-600'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 ${getStatusColor(user.status)} rounded-full`}></div>
                        <div>
                          <p className="font-medium">{user.name}</p>
                          <p className="text-xs text-gray-400">{user.role}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {user.battery && (
                          <div className="flex items-center gap-1">
                            <Battery className="w-3 h-3 text-gray-400" />
                            <span className="text-xs text-gray-400">{Math.round(user.battery * 100)}%</span>
                          </div>
                        )}
                        {user.lastLocation && (
                          <Activity className="w-4 h-4 text-green-400" />
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Current Status */}
            <div className="bg-gray-900/50 rounded-xl p-6 border border-white/10">
              <h3 className="text-lg font-semibold mb-4">Your Status</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Tracking</span>
                  <span className={`font-medium ${isTracking ? 'text-green-400' : 'text-gray-500'}`}>
                    {isTracking ? 'Active' : 'Inactive'}
                  </span>
                </div>

                {currentLocation && (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Last Update</span>
                      <span className="text-sm">
                        {new Date(currentLocation.timestamp).toLocaleTimeString()}
                      </span>
                    </div>

                    {currentLocation.location.speed && (
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">Speed</span>
                        <span className="text-sm">
                          {Math.round(currentLocation.location.speed * 3.6)} km/h
                        </span>
                      </div>
                    )}

                    {currentLocation.location.altitude && (
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">Altitude</span>
                        <span className="text-sm">
                          {Math.round(currentLocation.location.altitude)} m
                        </span>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Messaging Panel */}
        {showMessaging && (
          <div className="fixed bottom-6 right-6 w-96 bg-gray-900 rounded-xl shadow-2xl border border-gray-700">
            <div className="p-4 border-b border-gray-700 flex items-center justify-between">
              <h3 className="font-semibold flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                Messages
              </h3>
              <button
                onClick={() => setShowMessaging(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="h-64 overflow-y-auto p-4 space-y-2">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`p-3 rounded-lg ${
                    msg.from === userId ? 'bg-purple-500/20 ml-8' : 'bg-gray-800 mr-8'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-400">{msg.from}</span>
                    <span className="text-xs text-gray-400">
                      {new Date(msg.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="text-sm">{msg.content}</p>
                </div>
              ))}
            </div>

            <div className="p-4 border-t border-gray-700">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder={selectedUser ? `Message ${selectedUser}` : 'Broadcast message'}
                  className="flex-1 px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white text-sm"
                />
                <button
                  onClick={sendMessage}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}