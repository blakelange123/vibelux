'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  Camera, X, Check, RotateCw, Zap, Circle, Square,
  Maximize2, Minimize2, Sun, Moon, Grid3x3, Type,
  Pencil, ArrowLeft, ArrowRight, Download, Upload,
  AlertCircle, Info, ChevronLeft, ChevronRight, ZoomIn,
  ZoomOut, Crosshair, Layers, Palette, Save, Trash2
} from 'lucide-react';

interface Annotation {
  id: string;
  type: 'arrow' | 'circle' | 'square' | 'text' | 'highlight';
  x: number;
  y: number;
  width?: number;
  height?: number;
  text?: string;
  color: string;
  timestamp: Date;
}

interface PhotoMetadata {
  location?: { lat: number; lng: number };
  deviceInfo: string;
  timestamp: Date;
  facilityId: string;
  roomZone: string;
  issueType: string;
  severity?: 'low' | 'medium' | 'high' | 'critical';
}

interface CameraSettings {
  flash: 'auto' | 'on' | 'off';
  grid: boolean;
  hdr: boolean;
  zoom: number;
  quality: 'low' | 'medium' | 'high';
}

interface EnhancedCameraCaptureProps {
  onCapture: (photo: Blob, annotations: Annotation[], metadata: PhotoMetadata) => void;
  onCancel: () => void;
  issueType: string;
  roomZone: string;
  facilityId: string;
  guidelines?: string[];
  enableAnnotations?: boolean;
  enableMultiPhoto?: boolean;
  maxPhotos?: number;
}

export default function EnhancedCameraCapture({
  onCapture,
  onCancel,
  issueType,
  roomZone,
  facilityId,
  guidelines = [],
  enableAnnotations = true,
  enableMultiPhoto = false,
  maxPhotos = 5
}: EnhancedCameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [capturedPhotos, setCapturedPhotos] = useState<string[]>([]);
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [isAnnotating, setIsAnnotating] = useState(false);
  const [selectedTool, setSelectedTool] = useState<'arrow' | 'circle' | 'square' | 'text' | 'highlight'>('arrow');
  const [selectedColor, setSelectedColor] = useState('#FF0000');
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawStart, setDrawStart] = useState<{ x: number; y: number } | null>(null);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [showGuidelines, setShowGuidelines] = useState(true);
  const [cameraSettings, setCameraSettings] = useState<CameraSettings>({
    flash: 'auto',
    grid: true,
    hdr: false,
    zoom: 1,
    quality: 'high'
  });
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');

  // Initialize camera
  useEffect(() => {
    startCamera();
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [facingMode]);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode,
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (error) {
      console.error('Failed to access camera:', error);
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0);
        const photoUrl = canvas.toDataURL('image/jpeg', cameraSettings.quality === 'high' ? 0.95 : cameraSettings.quality === 'medium' ? 0.8 : 0.6);
        
        if (enableMultiPhoto) {
          setCapturedPhotos([...capturedPhotos, photoUrl]);
          setCurrentPhotoIndex(capturedPhotos.length);
        } else {
          setCapturedPhoto(photoUrl);
        }
        setShowGuidelines(false);
      }
    }
  };

  const retakePhoto = () => {
    if (enableMultiPhoto) {
      const newPhotos = [...capturedPhotos];
      newPhotos.splice(currentPhotoIndex, 1);
      setCapturedPhotos(newPhotos);
      setCurrentPhotoIndex(Math.max(0, currentPhotoIndex - 1));
    } else {
      setCapturedPhoto(null);
    }
    setAnnotations([]);
    setShowGuidelines(true);
  };

  const switchCamera = () => {
    setFacingMode(facingMode === 'user' ? 'environment' : 'user');
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const photoUrl = e.target?.result as string;
        if (enableMultiPhoto) {
          setCapturedPhotos([...capturedPhotos, photoUrl]);
          setCurrentPhotoIndex(capturedPhotos.length);
        } else {
          setCapturedPhoto(photoUrl);
        }
        setShowGuidelines(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const startAnnotation = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isAnnotating) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width * 100;
    const y = (e.clientY - rect.top) / rect.height * 100;
    
    setIsDrawing(true);
    setDrawStart({ x, y });
  };

  const drawAnnotation = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDrawing || !drawStart) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width * 100;
    const y = (e.clientY - rect.top) / rect.height * 100;
    
    // Update preview of current annotation
    // This would be rendered in real-time
  };

  const endAnnotation = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDrawing || !drawStart) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width * 100;
    const y = (e.clientY - rect.top) / rect.height * 100;
    
    const newAnnotation: Annotation = {
      id: Date.now().toString(),
      type: selectedTool,
      x: Math.min(drawStart.x, x),
      y: Math.min(drawStart.y, y),
      width: Math.abs(x - drawStart.x),
      height: Math.abs(y - drawStart.y),
      color: selectedColor,
      timestamp: new Date()
    };
    
    if (selectedTool === 'text') {
      const text = prompt('Enter annotation text:');
      if (text) {
        newAnnotation.text = text;
        setAnnotations([...annotations, newAnnotation]);
      }
    } else {
      setAnnotations([...annotations, newAnnotation]);
    }
    
    setIsDrawing(false);
    setDrawStart(null);
  };

  const deleteAnnotation = (id: string) => {
    setAnnotations(annotations.filter(a => a.id !== id));
  };

  const saveAndProceed = async () => {
    const metadata: PhotoMetadata = {
      location: await getCurrentLocation(),
      deviceInfo: navigator.userAgent,
      timestamp: new Date(),
      facilityId,
      roomZone,
      issueType
    };

    if (enableMultiPhoto) {
      // Save all photos
      for (const photo of capturedPhotos) {
        const blob = await dataURLtoBlob(photo);
        onCapture(blob, annotations, metadata);
      }
    } else if (capturedPhoto) {
      const blob = await dataURLtoBlob(capturedPhoto);
      onCapture(blob, annotations, metadata);
    }
  };

  const getCurrentLocation = async (): Promise<{ lat: number; lng: number } | undefined> => {
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject);
      });
      return {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };
    } catch {
      return undefined;
    }
  };

  const dataURLtoBlob = async (dataURL: string): Promise<Blob> => {
    const response = await fetch(dataURL);
    return response.blob();
  };

  const renderAnnotation = (annotation: Annotation) => {
    const style: React.CSSProperties = {
      position: 'absolute',
      left: `${annotation.x}%`,
      top: `${annotation.y}%`,
      width: annotation.width ? `${annotation.width}%` : 'auto',
      height: annotation.height ? `${annotation.height}%` : 'auto',
      border: `2px solid ${annotation.color}`,
      pointerEvents: isAnnotating ? 'auto' : 'none'
    };

    switch (annotation.type) {
      case 'circle':
        return (
          <div
            key={annotation.id}
            style={{
              ...style,
              borderRadius: '50%',
              backgroundColor: `${annotation.color}20`
            }}
            onClick={() => isAnnotating && deleteAnnotation(annotation.id)}
          />
        );
      case 'square':
        return (
          <div
            key={annotation.id}
            style={{
              ...style,
              backgroundColor: `${annotation.color}20`
            }}
            onClick={() => isAnnotating && deleteAnnotation(annotation.id)}
          />
        );
      case 'text':
        return (
          <div
            key={annotation.id}
            style={{
              ...style,
              border: 'none',
              color: annotation.color,
              fontSize: '14px',
              fontWeight: 'bold',
              textShadow: '1px 1px 2px rgba(0,0,0,0.8)'
            }}
            onClick={() => isAnnotating && deleteAnnotation(annotation.id)}
          >
            {annotation.text}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black z-50">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/80 to-transparent p-4 z-10">
        <div className="flex items-center justify-between">
          <button
            onClick={onCancel}
            className="p-2 bg-white/10 backdrop-blur-sm rounded-full text-white"
          >
            <X className="w-6 h-6" />
          </button>
          
          <div className="flex items-center gap-3">
            {/* Camera Settings */}
            <button
              onClick={() => setCameraSettings({ ...cameraSettings, flash: cameraSettings.flash === 'off' ? 'auto' : cameraSettings.flash === 'auto' ? 'on' : 'off' })}
              className="p-2 bg-white/10 backdrop-blur-sm rounded-full text-white"
            >
              {cameraSettings.flash === 'on' ? <Zap className="w-5 h-5" /> : cameraSettings.flash === 'auto' ? <Zap className="w-5 h-5 opacity-50" /> : <Zap className="w-5 h-5 opacity-30" />}
            </button>
            
            <button
              onClick={() => setCameraSettings({ ...cameraSettings, grid: !cameraSettings.grid })}
              className={`p-2 bg-white/10 backdrop-blur-sm rounded-full ${cameraSettings.grid ? 'text-white' : 'text-white/50'}`}
            >
              <Grid3x3 className="w-5 h-5" />
            </button>
            
            <button
              onClick={switchCamera}
              className="p-2 bg-white/10 backdrop-blur-sm rounded-full text-white"
            >
              <RotateCw className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Camera/Photo View */}
      <div className="relative h-full flex items-center justify-center">
        {!capturedPhoto && capturedPhotos.length === 0 ? (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="max-h-full max-w-full"
            />
            {cameraSettings.grid && (
              <div className="absolute inset-0 pointer-events-none">
                <div className="grid grid-cols-3 grid-rows-3 h-full w-full">
                  {[...Array(9)].map((_, i) => (
                    <div key={i} className="border border-white/20" />
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="relative max-h-full max-w-full">
            <img
              src={enableMultiPhoto ? capturedPhotos[currentPhotoIndex] : capturedPhoto!}
              alt="Captured"
              className="max-h-full max-w-full"
            />
            
            {/* Annotations Layer */}
            {enableAnnotations && (
              <div
                className="absolute inset-0"
                onMouseDown={startAnnotation}
                onMouseMove={drawAnnotation}
                onMouseUp={endAnnotation}
                style={{ cursor: isAnnotating ? 'crosshair' : 'default' }}
              >
                {annotations.map(renderAnnotation)}
              </div>
            )}
            
            {/* Multi-photo navigation */}
            {enableMultiPhoto && capturedPhotos.length > 1 && (
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center gap-2">
                <button
                  onClick={() => setCurrentPhotoIndex(Math.max(0, currentPhotoIndex - 1))}
                  disabled={currentPhotoIndex === 0}
                  className="p-2 bg-white/10 backdrop-blur-sm rounded-full text-white disabled:opacity-50"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <span className="px-3 py-1 bg-white/10 backdrop-blur-sm rounded-full text-white text-sm">
                  {currentPhotoIndex + 1} / {capturedPhotos.length}
                </span>
                <button
                  onClick={() => setCurrentPhotoIndex(Math.min(capturedPhotos.length - 1, currentPhotoIndex + 1))}
                  disabled={currentPhotoIndex === capturedPhotos.length - 1}
                  className="p-2 bg-white/10 backdrop-blur-sm rounded-full text-white disabled:opacity-50"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        )}
        
        <canvas ref={canvasRef} className="hidden" />
      </div>

      {/* Guidelines Overlay */}
      {showGuidelines && guidelines.length > 0 && (
        <div className="absolute top-20 left-4 right-4 bg-black/60 backdrop-blur-sm rounded-lg p-4">
          <h3 className="text-white font-medium mb-2 flex items-center gap-2">
            <Info className="w-4 h-4" />
            Photo Guidelines
          </h3>
          <ul className="space-y-1">
            {guidelines.map((guideline, index) => (
              <li key={index} className="text-white/80 text-sm flex items-start gap-2">
                <span className="text-green-400">•</span>
                {guideline}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Annotation Toolbar */}
      {enableAnnotations && (capturedPhoto || capturedPhotos.length > 0) && (
        <div className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/60 backdrop-blur-sm rounded-lg p-2 space-y-2">
          <button
            onClick={() => setIsAnnotating(!isAnnotating)}
            className={`p-3 rounded-lg ${isAnnotating ? 'bg-purple-600 text-white' : 'bg-white/10 text-white'}`}
          >
            <Pencil className="w-5 h-5" />
          </button>
          
          {isAnnotating && (
            <>
              <div className="w-px h-4 bg-white/20 mx-auto" />
              
              <button
                onClick={() => setSelectedTool('arrow')}
                className={`p-2 rounded-lg ${selectedTool === 'arrow' ? 'bg-white/20' : 'bg-white/10'} text-white`}
              >
                <ArrowRight className="w-4 h-4" />
              </button>
              
              <button
                onClick={() => setSelectedTool('circle')}
                className={`p-2 rounded-lg ${selectedTool === 'circle' ? 'bg-white/20' : 'bg-white/10'} text-white`}
              >
                <Circle className="w-4 h-4" />
              </button>
              
              <button
                onClick={() => setSelectedTool('square')}
                className={`p-2 rounded-lg ${selectedTool === 'square' ? 'bg-white/20' : 'bg-white/10'} text-white`}
              >
                <Square className="w-4 h-4" />
              </button>
              
              <button
                onClick={() => setSelectedTool('text')}
                className={`p-2 rounded-lg ${selectedTool === 'text' ? 'bg-white/20' : 'bg-white/10'} text-white`}
              >
                <Type className="w-4 h-4" />
              </button>
              
              <div className="w-px h-4 bg-white/20 mx-auto" />
              
              <input
                type="color"
                value={selectedColor}
                onChange={(e) => setSelectedColor(e.target.value)}
                className="w-8 h-8 rounded cursor-pointer"
              />
            </>
          )}
        </div>
      )}

      {/* Bottom Controls */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
        <div className="flex items-center justify-center gap-6">
          {!capturedPhoto && capturedPhotos.length === 0 ? (
            <>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="p-4 bg-white/10 backdrop-blur-sm rounded-full text-white"
              >
                <Upload className="w-6 h-6" />
              </button>
              
              <button
                onClick={capturePhoto}
                className="p-6 bg-white rounded-full"
                disabled={!stream}
              >
                <Camera className="w-8 h-8 text-black" />
              </button>
              
              <div className="w-[56px]" /> {/* Spacer for symmetry */}
            </>
          ) : (
            <>
              <button
                onClick={retakePhoto}
                className="p-4 bg-white/10 backdrop-blur-sm rounded-full text-white"
              >
                <RotateCw className="w-6 h-6" />
              </button>
              
              {enableMultiPhoto && capturedPhotos.length < maxPhotos && (
                <button
                  onClick={() => {
                    setCapturedPhoto(null);
                    setShowGuidelines(true);
                  }}
                  className="p-4 bg-white/10 backdrop-blur-sm rounded-full text-white"
                >
                  <Camera className="w-6 h-6" />
                </button>
              )}
              
              <button
                onClick={saveAndProceed}
                className="p-4 bg-green-600 rounded-full text-white"
              >
                <Check className="w-6 h-6" />
              </button>
            </>
          )}
        </div>
        
        {enableMultiPhoto && (
          <p className="text-center text-white/60 text-sm mt-3">
            {capturedPhotos.length} / {maxPhotos} photos
          </p>
        )}
      </div>
    </div>
  );
}