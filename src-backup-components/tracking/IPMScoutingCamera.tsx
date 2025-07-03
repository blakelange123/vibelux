'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import {
  Camera, AlertTriangle, CheckCircle, Clock, MapPin, Loader,
  Bug, Leaf, Droplets, Sun, Target, Send, X, Info
} from 'lucide-react';
import { IPMPhotoScout, IPMPhoto, IPMAlert } from '@/lib/ipm-photo-scouting';
import { RealtimeTracker } from '@/lib/realtime-tracker';

interface IPMScoutingCameraProps {
  tracker: RealtimeTracker;
  facilityId: string;
  onPhotoTaken?: (photo: IPMPhoto) => void;
  onAlertGenerated?: (alert: IPMAlert) => void;
}

export function IPMScoutingCamera({ 
  tracker, 
  facilityId, 
  onPhotoTaken, 
  onAlertGenerated 
}: IPMScoutingCameraProps) {
  const { user } = useUser();
  const [isOpen, setIsOpen] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentPhoto, setCurrentPhoto] = useState<IPMPhoto | null>(null);
  const [recentPhotos, setRecentPhotos] = useState<IPMPhoto[]>([]);
  const [activeAlerts, setActiveAlerts] = useState<IPMAlert[]>([]);
  
  // Form state
  const [plantStage, setPlantStage] = useState<'seedling' | 'vegetative' | 'flowering' | 'harvest'>('vegetative');
  const [roomZone, setRoomZone] = useState('');
  const [notes, setNotes] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const ipmScout = useRef<IPMPhotoScout | null>(null);

  useEffect(() => {
    if (user) {
      ipmScout.current = new IPMPhotoScout(user.id, facilityId, tracker);
      
      // Set up event listeners
      ipmScout.current.onPhotoAnalysis((photo) => {
        setCurrentPhoto(photo);
        setRecentPhotos(prev => [photo, ...prev.slice(0, 9)]); // Keep last 10
        setIsAnalyzing(false);
        onPhotoTaken?.(photo);
      });

      ipmScout.current.onAlert((alert) => {
        setActiveAlerts(prev => [alert, ...prev.slice(0, 4)]); // Keep last 5
        onAlertGenerated?.(alert);
      });
    }
  }, [user, facilityId, tracker]);

  const handleTakePhoto = async () => {
    if (!roomZone.trim()) {
      alert('Please enter the room/zone location');
      return;
    }

    try {
      setIsCapturing(true);
      setIsAnalyzing(true);
      
      if (ipmScout.current) {
        const photo = await ipmScout.current.captureIPMPhoto(
          plantStage,
          roomZone.trim(),
          notes.trim() || undefined
        );
        
        setCurrentPhoto(photo);
      }
    } catch (error) {
      console.error('Failed to capture photo:', error);
      alert('Failed to capture photo. Please try again.');
      setIsAnalyzing(false);
    } finally {
      setIsCapturing(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      // Process selected image file
      handleTakePhoto();
    }
  };

  const triggerCamera = () => {
    fileInputRef.current?.click();
  };

  const getStatusColor = (status: IPMPhoto['status']) => {
    switch (status) {
      case 'pending': return 'text-yellow-600';
      case 'analyzing': return 'text-blue-600';
      case 'reviewed': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const getPriorityColor = (priority: IPMPhoto['priority']) => {
    switch (priority) {
      case 'critical': return 'text-red-600 bg-red-50 border-red-200';
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-20 right-4 bg-green-500 text-white p-4 rounded-full shadow-lg hover:bg-green-600 transition-colors z-50"
      >
        <Bug className="w-6 h-6" />
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end justify-center z-50">
      <div className="bg-white rounded-t-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b p-4 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bug className="w-6 h-6 text-green-500" />
              <h2 className="text-lg font-semibold">IPM Scouting</h2>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Active Alerts */}
        {activeAlerts.length > 0 && (
          <div className="p-4 border-b">
            <h3 className="font-medium text-red-600 mb-2">⚠️ Active Alerts</h3>
            <div className="space-y-2">
              {activeAlerts.slice(0, 2).map((alert) => (
                <div key={alert.id} className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <div className="font-medium text-red-800">{alert.title}</div>
                  <div className="text-sm text-red-600">{alert.roomZone}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Photo Capture Form */}
        <div className="p-4 space-y-4">
          <div>
            <label className="block font-medium mb-2">Plant Stage</label>
            <select
              value={plantStage}
              onChange={(e) => setPlantStage(e.target.value as any)}
              className="w-full p-3 border rounded-lg"
            >
              <option value="seedling">🌱 Seedling</option>
              <option value="vegetative">🌿 Vegetative</option>
              <option value="flowering">🌺 Flowering</option>
              <option value="harvest">🌾 Harvest</option>
            </select>
          </div>

          <div>
            <label className="block font-medium mb-2">Room/Zone *</label>
            <input
              type="text"
              value={roomZone}
              onChange={(e) => setRoomZone(e.target.value)}
              placeholder="e.g., Veg Room A, Flower 3, Clone Bay"
              className="w-full p-3 border rounded-lg"
              required
            />
          </div>

          <div>
            <label className="block font-medium mb-2">Notes (Optional)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Observations, concerns, or additional context..."
              className="w-full p-3 border rounded-lg h-20 resize-none"
            />
          </div>

          {/* Camera Button */}
          <button
            onClick={triggerCamera}
            disabled={isCapturing || isAnalyzing || !roomZone.trim()}
            className="w-full bg-green-500 text-white py-4 rounded-lg font-medium hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isCapturing ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                Capturing...
              </>
            ) : isAnalyzing ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                Analyzing with AI...
              </>
            ) : (
              <>
                <Camera className="w-5 h-5" />
                Take IPM Photo
              </>
            )}
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>

        {/* Current Analysis */}
        {currentPhoto && (
          <div className="p-4 border-t">
            <h3 className="font-medium mb-3">Latest Analysis</h3>
            <div className={`border rounded-lg p-3 ${getPriorityColor(currentPhoto.priority)}`}>
              <div className="flex items-center justify-between mb-2">
                <div className="font-medium">{currentPhoto.roomZone}</div>
                <div className={`text-sm ${getStatusColor(currentPhoto.status)}`}>
                  {currentPhoto.status === 'analyzing' && <Loader className="w-4 h-4 animate-spin inline mr-1" />}
                  {currentPhoto.status}
                </div>
              </div>
              
              {currentPhoto.aiAnalysis && (
                <div className="space-y-2">
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <Bug className="w-4 h-4" />
                      <span>Pests: {currentPhoto.aiAnalysis.pestDetected ? '⚠️ Detected' : '✅ None'}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Leaf className="w-4 h-4" />
                      <span>Disease: {currentPhoto.aiAnalysis.diseaseDetected ? '⚠️ Detected' : '✅ None'}</span>
                    </div>
                  </div>
                  
                  {currentPhoto.aiAnalysis.detectedIssues.length > 0 && (
                    <div className="mt-2">
                      <div className="font-medium text-sm mb-1">Detected Issues:</div>
                      {currentPhoto.aiAnalysis.detectedIssues.map((issue, index) => (
                        <div key={index} className="text-sm bg-white bg-opacity-50 rounded p-2 mb-1">
                          <div className="font-medium">{issue.name}</div>
                          <div className="text-xs">
                            {issue.severity} severity • {Math.round(issue.confidence * 100)}% confidence
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {currentPhoto.aiAnalysis.recommendations.length > 0 && (
                    <div className="mt-2">
                      <div className="font-medium text-sm mb-1">Recommendations:</div>
                      <ul className="text-xs space-y-1">
                        {currentPhoto.aiAnalysis.recommendations.slice(0, 3).map((rec, index) => (
                          <li key={index} className="flex items-start gap-1">
                            <span>•</span>
                            <span>{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              <div className="mt-2 text-xs text-gray-600">
                {currentPhoto.timestamp.toLocaleString()}
              </div>
            </div>
          </div>
        )}

        {/* Recent Photos */}
        {recentPhotos.length > 0 && (
          <div className="p-4 border-t">
            <h3 className="font-medium mb-3">Recent Scouting</h3>
            <div className="space-y-2">
              {recentPhotos.slice(0, 3).map((photo) => (
                <div key={photo.id} className={`border rounded-lg p-3 ${getPriorityColor(photo.priority)}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{photo.roomZone}</div>
                      <div className="text-sm">
                        {photo.plantStage} • {photo.timestamp.toLocaleTimeString()}
                      </div>
                    </div>
                    <div className={`text-sm ${getStatusColor(photo.status)}`}>
                      {photo.status === 'analyzing' && <Loader className="w-4 h-4 animate-spin inline mr-1" />}
                      {photo.aiAnalysis?.detectedIssues.length || 0} issues
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick Tips */}
        <div className="p-4 border-t bg-gray-50">
          <h3 className="font-medium mb-2 flex items-center gap-2">
            <Info className="w-4 h-4" />
            IPM Scouting Tips
          </h3>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Take clear, well-lit photos of affected areas</li>
            <li>• Include whole leaves and close-up details</li>
            <li>• Note any environmental factors (humidity, temperature)</li>
            <li>• Check both sides of leaves for pests</li>
          </ul>
        </div>
      </div>
    </div>
  );
}