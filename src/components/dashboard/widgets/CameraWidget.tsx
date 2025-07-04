'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Camera, CameraOff, RefreshCw } from 'lucide-react';
import SimplePeer from 'simple-peer';

interface CameraWidgetProps {
  config: {
    title?: string;
    streamUrl?: string;
    refreshRate?: number;
    mode?: 'webrtc' | 'snapshot' | 'mjpeg';
    resolution?: 'low' | 'medium' | 'high';
  };
  data: any;
  loading: boolean;
}

export function CameraWidget({ config, data, loading }: CameraWidgetProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const peerRef = useRef<SimplePeer.Instance | null>(null);
  
  const { 
    streamUrl = '', 
    mode = 'snapshot',
    resolution = 'medium'
  } = config;
  
  // Get resolution settings
  const getConstraints = () => {
    switch (resolution) {
      case 'high':
        return { width: 1920, height: 1080 };
      case 'medium':
        return { width: 1280, height: 720 };
      case 'low':
        return { width: 640, height: 480 };
      default:
        return { width: 1280, height: 720 };
    }
  };
  
  useEffect(() => {
    if (mode === 'webrtc' && streamUrl) {
      // WebRTC connection
      const peer = new SimplePeer({
        initiator: true,
        trickle: false,
        config: {
          iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' }
          ]
        }
      });
      
      peer.on('signal', (data) => {
        // Send signal to server via websocket
      });
      
      peer.on('stream', (stream) => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setIsConnected(true);
        }
      });
      
      peer.on('error', (err) => {
        console.error('WebRTC error:', err);
        setError('Failed to connect to camera stream');
      });
      
      peerRef.current = peer;
      
      return () => {
        peer.destroy();
      };
    }
  }, [mode, streamUrl]);
  
  // Mock camera feed for demo
  const mockCameraFeed = () => {
    if (videoRef.current && !streamUrl) {
      // Use getUserMedia for demo
      navigator.mediaDevices.getUserMedia({ 
        video: getConstraints(),
        audio: false 
      })
      .then(stream => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setIsConnected(true);
        }
      })
      .catch(err => {
        console.error('Camera access error:', err);
        setError('Camera access denied');
      });
    }
  };
  
  useEffect(() => {
    if (!loading && mode === 'webrtc') {
      mockCameraFeed();
    }
    
    return () => {
      if (videoRef.current?.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [loading, mode]);
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-800">
        <Camera className="w-8 h-8 text-gray-600 animate-pulse" />
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-gray-800 text-gray-400">
        <CameraOff className="w-8 h-8 mb-2" />
        <p className="text-sm text-center">{error}</p>
      </div>
    );
  }
  
  if (mode === 'snapshot') {
    // Snapshot mode - show static image with refresh
    return (
      <div className="relative h-full">
        <img
          src={streamUrl || '/api/placeholder/640/480'}
          alt="Camera snapshot"
          className="w-full h-full object-cover"
        />
        <button
          className="absolute top-2 right-2 p-2 bg-gray-900/80 rounded-lg hover:bg-gray-900 transition-colors"
          onClick={() => {
            // Refresh snapshot
          }}
        >
          <RefreshCw className="w-4 h-4 text-white" />
        </button>
      </div>
    );
  }
  
  // WebRTC or MJPEG mode
  return (
    <div className="relative h-full bg-black">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="w-full h-full object-cover"
      />
      {!isConnected && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900/80">
          <div className="text-center">
            <Camera className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-400">Connecting...</p>
          </div>
        </div>
      )}
    </div>
  );
}