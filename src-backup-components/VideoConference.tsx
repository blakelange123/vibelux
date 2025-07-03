'use client';

import React, { useEffect, useRef, useState } from 'react';
import { 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  Phone, 
  Monitor, 
  MessageSquare,
  Settings,
  Users,
  Clock,
  DollarSign,
  CheckCircle,
  AlertTriangle,
  Volume2,
  VolumeX
} from 'lucide-react';

interface VideoConferenceProps {
  roomId: string;
  token: string;
  config: {
    participantName: string;
    isHost: boolean;
    maxDuration: number;
    recordingEnabled: boolean;
    features: {
      chat: boolean;
      screenShare: boolean;
      recording: boolean;
      fileSharing: boolean;
    };
  };
  consultationId: string;
  onSessionEnd?: (billing: any) => void;
}

interface MediaState {
  video: boolean;
  audio: boolean;
  screenShare: boolean;
}

interface ConferenceStats {
  duration: number;
  participants: number;
  recording: boolean;
  connectionQuality: 'excellent' | 'good' | 'poor';
}

export default function VideoConference({
  roomId,
  token,
  config,
  consultationId,
  onSessionEnd
}: VideoConferenceProps) {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const [mediaState, setMediaState] = useState<MediaState>({
    video: true,
    audio: true,
    screenShare: false
  });
  const [stats, setStats] = useState<ConferenceStats>({
    duration: 0,
    participants: 1,
    recording: false,
    connectionQuality: 'good'
  });
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(true);
  const [showChat, setShowChat] = useState(false);
  const [messages, setMessages] = useState<Array<{
    id: string;
    sender: string;
    content: string;
    timestamp: Date;
  }>>([]);
  const [newMessage, setNewMessage] = useState('');
  const [sessionEnding, setSessionEnding] = useState(false);

  const localStreamRef = useRef<MediaStream | null>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const durationIntervalRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    initializeVideoConference();
    
    return () => {
      cleanup();
    };
  }, [roomId, token]);

  useEffect(() => {
    // Start duration timer
    durationIntervalRef.current = setInterval(() => {
      setStats(prev => ({
        ...prev,
        duration: prev.duration + 1
      }));
    }, 1000);

    return () => {
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
      }
    };
  }, []);

  const initializeVideoConference = async () => {
    try {
      // Get user media
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });

      localStreamRef.current = stream;
      
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      // Initialize WebRTC peer connection
      const pc = new RTCPeerConnection({
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          // Add TURN servers for production
        ]
      });

      peerConnectionRef.current = pc;

      // Add local stream to peer connection
      stream.getTracks().forEach(track => {
        pc.addTrack(track, stream);
      });

      // Handle remote stream
      pc.ontrack = (event) => {
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = event.streams[0];
        }
        setStats(prev => ({ ...prev, participants: 2 }));
      };

      // Handle connection state changes
      pc.onconnectionstatechange = () => {
        const state = pc.connectionState;
        setIsConnected(state === 'connected');
        setIsConnecting(state === 'connecting');
        
        if (state === 'connected') {
          setStats(prev => ({ ...prev, connectionQuality: 'excellent' }));
        } else if (state === 'disconnected' || state === 'failed') {
          setStats(prev => ({ ...prev, connectionQuality: 'poor' }));
        }
      };

      // Simulate WebRTC signaling (in production, use WebSocket)
      // This is a simplified implementation
      setIsConnected(true);
      setIsConnecting(false);

    } catch (error) {
      console.error('Error initializing video conference:', error);
      setIsConnecting(false);
    }
  };

  const toggleVideo = () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !mediaState.video;
        setMediaState(prev => ({ ...prev, video: !prev.video }));
      }
    }
  };

  const toggleAudio = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !mediaState.audio;
        setMediaState(prev => ({ ...prev, audio: !prev.audio }));
      }
    }
  };

  const toggleScreenShare = async () => {
    try {
      if (!mediaState.screenShare) {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: true
        });
        
        // Replace video track with screen share
        const videoTrack = screenStream.getVideoTracks()[0];
        if (peerConnectionRef.current && localStreamRef.current) {
          const sender = peerConnectionRef.current.getSenders()
            .find(s => s.track?.kind === 'video');
          if (sender) {
            await sender.replaceTrack(videoTrack);
          }
        }

        setMediaState(prev => ({ ...prev, screenShare: true }));

        // Handle screen share end
        videoTrack.onended = () => {
          setMediaState(prev => ({ ...prev, screenShare: false }));
          // Switch back to camera
          if (localStreamRef.current) {
            const cameraTrack = localStreamRef.current.getVideoTracks()[0];
            if (peerConnectionRef.current && cameraTrack) {
              const sender = peerConnectionRef.current.getSenders()
                .find(s => s.track?.kind === 'video');
              if (sender) {
                sender.replaceTrack(cameraTrack);
              }
            }
          }
        };
      } else {
        // Stop screen share and return to camera
        if (localStreamRef.current) {
          const cameraTrack = localStreamRef.current.getVideoTracks()[0];
          if (peerConnectionRef.current && cameraTrack) {
            const sender = peerConnectionRef.current.getSenders()
              .find(s => s.track?.kind === 'video');
            if (sender) {
              await sender.replaceTrack(cameraTrack);
            }
          }
        }
        setMediaState(prev => ({ ...prev, screenShare: false }));
      }
    } catch (error) {
      console.error('Error toggling screen share:', error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    const message = {
      id: Date.now().toString(),
      sender: config.participantName,
      content: newMessage,
      timestamp: new Date()
    };

    // Send message through API
    try {
      const response = await fetch(`/api/consultations/${consultationId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newMessage })
      });

      if (response.ok) {
        setMessages(prev => [...prev, message]);
        setNewMessage('');
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const endSession = async () => {
    if (sessionEnding) return;
    setSessionEnding(true);

    try {
      const response = await fetch(`/api/consultations/${consultationId}/video`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'end' })
      });

      if (response.ok) {
        const result = await response.json();
        if (result.billing && onSessionEnd) {
          onSessionEnd(result.billing);
        }
      }
    } catch (error) {
      console.error('Error ending session:', error);
    } finally {
      cleanup();
    }
  };

  const cleanup = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
    }
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
    }
    if (durationIntervalRef.current) {
      clearInterval(durationIntervalRef.current);
    }
  };

  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const calculateCost = (): number => {
    const hourlyRate = 200; // Should come from consultation data
    const minutes = Math.floor(stats.duration / 60);
    return (minutes / 60) * hourlyRate;
  };

  if (isConnecting) {
    return (
      <div className="flex items-center justify-center h-96 bg-gray-900 rounded-lg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-white">Connecting to video conference...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 rounded-lg overflow-hidden">
      {/* Header with stats */}
      <div className="bg-gray-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-gray-400" />
            <span className="text-white font-mono">{formatDuration(stats.duration)}</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-gray-400" />
            <span className="text-white">{stats.participants} participants</span>
          </div>
          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-gray-400" />
            <span className="text-white">${calculateCost().toFixed(2)}</span>
          </div>
          {stats.recording && (
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-red-400">Recording</span>
            </div>
          )}
        </div>
        
        <div className={`px-3 py-1 rounded-full text-xs font-medium ${
          stats.connectionQuality === 'excellent' ? 'bg-green-900/30 text-green-400' :
          stats.connectionQuality === 'good' ? 'bg-yellow-900/30 text-yellow-400' :
          'bg-red-900/30 text-red-400'
        }`}>
          {stats.connectionQuality}
        </div>
      </div>

      {/* Video area */}
      <div className="relative h-96 bg-black">
        {/* Remote video (main) */}
        <video
          ref={remoteVideoRef}
          autoPlay
          playsInline
          className="w-full h-full object-cover"
        />
        
        {/* Local video (picture-in-picture) */}
        <div className="absolute top-4 right-4 w-48 h-36 bg-gray-800 rounded-lg overflow-hidden border-2 border-gray-600">
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />
          {!mediaState.video && (
            <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
              <VideoOff className="w-8 h-8 text-gray-400" />
            </div>
          )}
        </div>

        {/* Connection status overlay */}
        {!isConnected && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <div className="bg-gray-800 rounded-lg p-6 text-center">
              <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
              <p className="text-white">Connection lost. Attempting to reconnect...</p>
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="bg-gray-800 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Audio toggle */}
            <button
              onClick={toggleAudio}
              className={`p-3 rounded-full transition-colors ${
                mediaState.audio 
                  ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                  : 'bg-red-600 hover:bg-red-700 text-white'
              }`}
            >
              {mediaState.audio ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
            </button>

            {/* Video toggle */}
            <button
              onClick={toggleVideo}
              className={`p-3 rounded-full transition-colors ${
                mediaState.video 
                  ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                  : 'bg-red-600 hover:bg-red-700 text-white'
              }`}
            >
              {mediaState.video ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
            </button>

            {/* Screen share */}
            {config.features.screenShare && (
              <button
                onClick={toggleScreenShare}
                className={`p-3 rounded-full transition-colors ${
                  mediaState.screenShare 
                    ? 'bg-indigo-600 hover:bg-indigo-700 text-white' 
                    : 'bg-gray-700 hover:bg-gray-600 text-white'
                }`}
              >
                <Monitor className="w-5 h-5" />
              </button>
            )}

            {/* Chat toggle */}
            {config.features.chat && (
              <button
                onClick={() => setShowChat(!showChat)}
                className={`p-3 rounded-full transition-colors ${
                  showChat 
                    ? 'bg-indigo-600 hover:bg-indigo-700 text-white' 
                    : 'bg-gray-700 hover:bg-gray-600 text-white'
                }`}
              >
                <MessageSquare className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* End call */}
          {config.isHost && (
            <button
              onClick={endSession}
              disabled={sessionEnding}
              className="px-6 py-3 bg-red-600 hover:bg-red-700 disabled:bg-red-800 text-white rounded-lg flex items-center gap-2 transition-colors"
            >
              <Phone className="w-4 h-4 rotate-[135deg]" />
              {sessionEnding ? 'Ending...' : 'End Consultation'}
            </button>
          )}
        </div>
      </div>

      {/* Chat sidebar */}
      {showChat && (
        <div className="bg-gray-800 border-t border-gray-700 h-64 flex flex-col">
          <div className="px-4 py-2 border-b border-gray-700">
            <h3 className="text-white font-medium">Chat</h3>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((message) => (
              <div key={message.id} className="text-sm">
                <div className="text-gray-400 text-xs">{message.sender}</div>
                <div className="text-white">{message.content}</div>
              </div>
            ))}
          </div>
          
          <div className="p-4 border-t border-gray-700">
            <div className="flex gap-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="Type a message..."
                className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm focus:border-indigo-500 focus:outline-none"
              />
              <button
                onClick={sendMessage}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-sm"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}