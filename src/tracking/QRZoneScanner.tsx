'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import {
  Camera, QrCode, CheckCircle, X, AlertTriangle, 
  Clock, MapPin, Activity, Heart, Users, 
  Play, Square, RotateCcw, Settings
} from 'lucide-react';
import { ZoneBasedTracker, WorkType } from '@/lib/tracking/zone-based-tracker';

interface QRZoneScannerProps {
  onScanResult: (result: { success: boolean; message: string; session?: any }) => void;
  onClose: () => void;
}

export function QRZoneScanner({ onScanResult, onClose }: QRZoneScannerProps) {
  const { user } = useUser();
  const [isScanning, setIsScanning] = useState(false);
  const [selectedWorkType, setSelectedWorkType] = useState<WorkType>('general');
  const [notes, setNotes] = useState('');
  const [lastScanResult, setLastScanResult] = useState<any>(null);
  const [manualQRCode, setManualQRCode] = useState('');
  const [currentSession, setCurrentSession] = useState<any>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const zoneTracker = new ZoneBasedTracker();

  const workTypes: { value: WorkType; label: string; icon: React.ReactNode; color: string }[] = [
    { value: 'harvesting', label: 'Harvesting', icon: <Activity className="w-4 h-4" />, color: 'text-green-600' },
    { value: 'transplanting', label: 'Transplanting', icon: <MapPin className="w-4 h-4" />, color: 'text-blue-600' },
    { value: 'pruning', label: 'Pruning', icon: <Settings className="w-4 h-4" />, color: 'text-purple-600' },
    { value: 'scouting', label: 'Scouting', icon: <CheckCircle className="w-4 h-4" />, color: 'text-orange-600' },
    { value: 'cleaning', label: 'Cleaning', icon: <RotateCcw className="w-4 h-4" />, color: 'text-gray-600' },
    { value: 'general', label: 'General Work', icon: <Users className="w-4 h-4" />, color: 'text-gray-600' }
  ];

  useEffect(() => {
    // Check if user has active session on component mount
    checkActiveSession();
    return () => {
      stopCamera();
    };
  }, []);

  const checkActiveSession = () => {
    // In a real implementation, this would check for active sessions
    // For now, we'll simulate it
    setCurrentSession(null);
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsScanning(true);
        
        // Start QR code detection
        startQRDetection();
      }
    } catch (error) {
      console.error('Failed to start camera:', error);
      alert('Unable to access camera. Please check permissions and try again.');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsScanning(false);
  };

  const startQRDetection = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    const detectQR = () => {
      if (!isScanning || !context) return;

      // Draw video frame to canvas
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Get image data for QR detection
      const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
      
      // In a real implementation, you would use a QR code detection library here
      // For now, we'll simulate detection after a few seconds
      setTimeout(() => {
        if (isScanning) {
          // Simulate QR code detection
          const mockQRCode = 'VBX-ZONE-GHA'; // Greenhouse A
          handleQRDetection(mockQRCode);
        }
      }, 3000);
    };

    // Start detection loop
    const interval = setInterval(detectQR, 100);
    
    // Cleanup interval when scanning stops
    setTimeout(() => clearInterval(interval), 10000);
  };

  const handleQRDetection = async (qrCode: string) => {
    if (!user) return;

    try {
      const result = await zoneTracker.scanQRZoneEntry(
        qrCode,
        user.id,
        selectedWorkType,
        notes
      );

      setLastScanResult(result);
      onScanResult(result);

      if (result.success) {
        setCurrentSession(result.session);
        stopCamera();
      }
    } catch (error) {
      console.error('QR scan error:', error);
      const errorResult = {
        success: false,
        message: 'Failed to process QR code scan'
      };
      setLastScanResult(errorResult);
      onScanResult(errorResult);
    }
  };

  const handleManualEntry = async () => {
    if (!manualQRCode.trim() || !user) return;

    await handleQRDetection(manualQRCode.trim());
    setManualQRCode('');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2">
              <QrCode className="w-6 h-6 text-blue-500" />
              {currentSession ? 'Exit Work Zone' : 'Enter Work Zone'}
            </h2>
            <p className="text-gray-600">
              {currentSession 
                ? 'Scan any QR code to end your current work session'
                : 'Scan the QR code at your work station or greenhouse entrance'
              }
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Current Session Info */}
        {currentSession && (
          <div className="p-4 bg-green-50 border-b">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="font-medium text-green-800">
                Currently working in: {currentSession.zoneId}
              </span>
            </div>
            <div className="text-sm text-green-700">
              Started: {new Date(currentSession.entryTime).toLocaleTimeString()}
              <br />
              Work Type: {currentSession.workType}
            </div>
          </div>
        )}

        {/* Work Type Selection */}
        {!currentSession && (
          <div className="p-6 border-b">
            <h3 className="font-semibold mb-3">What type of work are you doing?</h3>
            <div className="grid grid-cols-2 gap-3">
              {workTypes.map(type => (
                <label
                  key={type.value}
                  className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedWorkType === type.value
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="workType"
                    value={type.value}
                    checked={selectedWorkType === type.value}
                    onChange={(e) => setSelectedWorkType(e.target.value as WorkType)}
                    className="sr-only"
                  />
                  <div className={type.color}>
                    {type.icon}
                  </div>
                  <span className="font-medium">{type.label}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Camera Scanner */}
        <div className="p-6">
          {!isScanning ? (
            <div className="text-center space-y-4">
              <div className="w-32 h-32 mx-auto bg-gray-100 rounded-lg flex items-center justify-center">
                <Camera className="w-16 h-16 text-gray-400" />
              </div>
              <button
                onClick={startCamera}
                className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2 mx-auto"
              >
                <Play className="w-4 h-4" />
                Start Camera Scanner
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="relative">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full h-64 bg-black rounded-lg object-cover"
                />
                <canvas ref={canvasRef} className="hidden" />
                
                {/* QR Code Overlay */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-48 h-48 border-2 border-white rounded-lg relative">
                    <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-blue-500"></div>
                    <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-blue-500"></div>
                    <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-blue-500"></div>
                    <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-blue-500"></div>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={stopCamera}
                  className="flex-1 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors flex items-center justify-center gap-2"
                >
                  <Square className="w-4 h-4" />
                  Stop Scanner
                </button>
              </div>
              
              <div className="text-center text-sm text-gray-600">
                Position the QR code within the frame to scan automatically
              </div>
            </div>
          )}
        </div>

        {/* Manual Entry */}
        <div className="p-6 border-t bg-gray-50">
          <h3 className="font-semibold mb-3">Manual QR Code Entry</h3>
          <div className="flex gap-2">
            <input
              type="text"
              value={manualQRCode}
              onChange={(e) => setManualQRCode(e.target.value)}
              placeholder="Enter QR code (e.g., VBX-ZONE-GHA)"
              className="flex-1 p-2 border rounded-lg"
            />
            <button
              onClick={handleManualEntry}
              disabled={!manualQRCode.trim()}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Enter
            </button>
          </div>
        </div>

        {/* Notes */}
        <div className="p-6 border-t">
          <h3 className="font-semibold mb-3">Notes (Optional)</h3>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add any notes about your work session..."
            className="w-full p-3 border rounded-lg resize-none h-20"
          />
        </div>

        {/* Last Scan Result */}
        {lastScanResult && (
          <div className={`p-4 border-t ${
            lastScanResult.success ? 'bg-green-50' : 'bg-red-50'
          }`}>
            <div className={`flex items-center gap-2 ${
              lastScanResult.success ? 'text-green-800' : 'text-red-800'
            }`}>
              {lastScanResult.success ? (
                <CheckCircle className="w-5 h-5" />
              ) : (
                <AlertTriangle className="w-5 h-5" />
              )}
              <span className="font-medium">{lastScanResult.message}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}