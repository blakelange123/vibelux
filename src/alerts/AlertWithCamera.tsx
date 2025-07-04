'use client';

import React, { useState, useEffect } from 'react';
import {
  AlertTriangle,
  Camera,
  Video,
  Maximize2,
  X,
  RefreshCw,
  Wifi,
  WifiOff,
  Play,
  Pause,
  SkipBack,
  Download,
  Share2,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Clock
} from 'lucide-react';

interface Alert {
  id: string;
  title: string;
  message: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  timestamp: Date;
  zone?: string;
  cameraId?: string;
  metadata?: {
    sensorReadings?: Record<string, number>;
    imageCapture?: string;
    videoClip?: string;
  };
}

interface Camera {
  id: string;
  name: string;
  type: 'ip' | 'nest' | 'ring' | 'wyze' | 'generic';
  zone: string;
  streamUrl?: string;
  snapshotUrl?: string;
  status: 'online' | 'offline';
}

interface AlertWithCameraProps {
  alert: Alert;
  camera?: Camera;
  onClose?: () => void;
  onAcknowledge?: () => void;
}

export function AlertWithCamera({ alert, camera, onClose, onAcknowledge }: AlertWithCameraProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const [showTimeline, setShowTimeline] = useState(false);
  const [selectedTime, setSelectedTime] = useState(new Date());
  const [cameraError, setCameraError] = useState(false);
  const [isRecording, setIsRecording] = useState(false);

  // Get stream URL based on camera type
  const getStreamUrl = () => {
    if (!camera) return null;

    switch (camera.type) {
      case 'nest':
        return `/api/cameras/nest/${camera.id}/stream`;
      case 'ring':
        return `/api/cameras/ring/${camera.id}/stream`;
      case 'wyze':
        return `/api/cameras/wyze/${camera.id}/stream`;
      case 'ip':
      case 'generic':
        return camera.streamUrl || `/api/cameras/proxy/${camera.id}`;
      default:
        return null;
    }
  };

  const handleSnapshot = async () => {
    try {
      const response = await fetch(`/api/cameras/${camera?.id}/snapshot`, {
        method: 'POST',
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `alert-${alert.id}-${Date.now()}.jpg`;
        a.click();
      }
    } catch (error) {
      console.error('Failed to capture snapshot:', error);
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: `VibeLux Alert: ${alert.title}`,
      text: alert.message,
      url: `${window.location.origin}/alerts/${alert.id}`,
    };

    if (navigator.share) {
      await navigator.share(shareData);
    } else {
      await navigator.clipboard.writeText(shareData.url);
      alert('Link copied to clipboard!');
    }
  };

  return (
    <div className={`bg-gray-900 rounded-lg overflow-hidden ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}>
      {/* Alert Header */}
      <div className={`p-4 border-b border-gray-800 ${
        alert.severity === 'critical' ? 'bg-red-900/20' :
        alert.severity === 'high' ? 'bg-orange-900/20' :
        alert.severity === 'medium' ? 'bg-yellow-900/20' :
        'bg-green-900/20'
      }`}>
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <AlertTriangle className={`w-5 h-5 mt-0.5 ${
              alert.severity === 'critical' ? 'text-red-500' :
              alert.severity === 'high' ? 'text-orange-500' :
              alert.severity === 'medium' ? 'text-yellow-500' :
              'text-green-500'
            }`} />
            <div>
              <h3 className="font-semibold text-white">{alert.title}</h3>
              <p className="text-sm text-gray-300 mt-1">{alert.message}</p>
              <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {new Date(alert.timestamp).toLocaleTimeString()}
                </span>
                {alert.zone && (
                  <span className="flex items-center gap-1">
                    <Camera className="w-3 h-3" />
                    {alert.zone}
                  </span>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {camera && (
              <button
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="p-2 hover:bg-gray-800 rounded transition-colors"
              >
                <Maximize2 className="w-4 h-4 text-gray-400" />
              </button>
            )}
            {onClose && (
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-800 rounded transition-colors"
              >
                <X className="w-4 h-4 text-gray-400" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Camera View */}
      {camera && (
        <div className="relative bg-black aspect-video">
          {camera.status === 'online' && !cameraError ? (
            <>
              <video
                src={getStreamUrl() || ''}
                autoPlay={isPlaying}
                muted
                className="w-full h-full object-contain"
                onError={() => setCameraError(true)}
              />
              
              {/* Recording Indicator */}
              {isRecording && (
                <div className="absolute top-4 left-4 flex items-center gap-2 bg-red-600 text-white px-3 py-1 rounded-lg">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                  <span className="text-sm font-medium">Recording</span>
                </div>
              )}
              
              {/* Camera Info Overlay */}
              <div className="absolute top-4 right-4 bg-black/70 text-white px-3 py-1 rounded text-sm">
                {camera.name}
              </div>
              
              {/* Controls */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setIsPlaying(!isPlaying)}
                      className="p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors"
                    >
                      {isPlaying ? <Pause className="w-4 h-4 text-white" /> : <Play className="w-4 h-4 text-white" />}
                    </button>
                    
                    <button
                      onClick={() => setShowTimeline(!showTimeline)}
                      className="p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors"
                    >
                      <Clock className="w-4 h-4 text-white" />
                    </button>
                    
                    <button
                      onClick={handleSnapshot}
                      className="p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors"
                    >
                      <Camera className="w-4 h-4 text-white" />
                    </button>
                    
                    <button
                      onClick={() => setIsRecording(!isRecording)}
                      className="p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors"
                    >
                      <Video className="w-4 h-4 text-white" />
                    </button>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleShare}
                      className="p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors"
                    >
                      <Share2 className="w-4 h-4 text-white" />
                    </button>
                    
                    <button
                      onClick={handleSnapshot}
                      className="p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors"
                    >
                      <Download className="w-4 h-4 text-white" />
                    </button>
                  </div>
                </div>
                
                {/* Timeline */}
                {showTimeline && (
                  <div className="mt-4 bg-black/50 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <button className="p-1 hover:bg-white/20 rounded">
                        <ChevronLeft className="w-4 h-4 text-white" />
                      </button>
                      <span className="text-sm text-white">
                        {selectedTime.toLocaleTimeString()} - {selectedTime.toLocaleDateString()}
                      </span>
                      <button className="p-1 hover:bg-white/20 rounded">
                        <ChevronRight className="w-4 h-4 text-white" />
                      </button>
                    </div>
                    <div className="relative h-2 bg-white/20 rounded-full">
                      <div className="absolute top-0 left-0 h-full w-1/3 bg-purple-500 rounded-full" />
                      <div className="absolute top-1/2 left-1/3 w-3 h-3 bg-white rounded-full -translate-y-1/2 -translate-x-1/2" />
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              {camera.status === 'offline' || cameraError ? (
                <>
                  <WifiOff className="w-12 h-12 mb-2" />
                  <p>Camera Offline</p>
                  <button
                    onClick={() => setCameraError(false)}
                    className="mt-2 text-sm text-purple-400 hover:text-purple-300 flex items-center gap-1"
                  >
                    <RefreshCw className="w-3 h-3" />
                    Retry
                  </button>
                </>
              ) : (
                <>
                  <Camera className="w-12 h-12 mb-2" />
                  <p>Loading Camera Feed...</p>
                </>
              )}
            </div>
          )}
        </div>
      )}

      {/* Alert Metadata */}
      {alert.metadata?.sensorReadings && (
        <div className="p-4 border-t border-gray-800">
          <h4 className="text-sm font-medium text-gray-400 mb-2">Sensor Readings at Alert Time</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {Object.entries(alert.metadata.sensorReadings).map(([key, value]) => (
              <div key={key} className="bg-gray-800 rounded-lg p-3">
                <p className="text-xs text-gray-400 capitalize">{key.replace(/_/g, ' ')}</p>
                <p className="text-lg font-semibold text-white">{value}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="p-4 border-t border-gray-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {camera && (
            <button
              onClick={() => window.open(`/cameras/${camera.id}`, '_blank')}
              className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg text-sm transition-colors flex items-center gap-2"
            >
              <Video className="w-4 h-4" />
              Open Camera View
            </button>
          )}
        </div>
        
        {onAcknowledge && (
          <button
            onClick={onAcknowledge}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm transition-colors"
          >
            Acknowledge Alert
          </button>
        )}
      </div>
    </div>
  );
}

// Alert List with Camera Integration
export function AlertListWithCameras() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [cameras, setCameras] = useState<Camera[]>([]);
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);

  useEffect(() => {
    loadAlerts();
    loadCameras();
  }, []);

  const loadAlerts = async () => {
    try {
      const response = await fetch('/api/alerts/active');
      const data = await response.json();
      setAlerts(data.alerts || []);
    } catch (error) {
      console.error('Failed to load alerts:', error);
    }
  };

  const loadCameras = async () => {
    try {
      const response = await fetch('/api/facility/cameras');
      const data = await response.json();
      setCameras(data.cameras || []);
    } catch (error) {
      console.error('Failed to load cameras:', error);
    }
  };

  const getCamera = (alert: Alert) => {
    if (alert.cameraId) {
      return cameras.find(c => c.id === alert.cameraId);
    }
    if (alert.zone) {
      return cameras.find(c => c.zone === alert.zone);
    }
    return undefined;
  };

  return (
    <div className="space-y-4">
      {alerts.map(alert => (
        <AlertWithCamera
          key={alert.id}
          alert={alert}
          camera={getCamera(alert)}
          onAcknowledge={() => {
            setAlerts(prev => prev.filter(a => a.id !== alert.id));
          }}
        />
      ))}
    </div>
  );
}