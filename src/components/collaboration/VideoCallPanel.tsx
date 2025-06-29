'use client'

import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  Phone, 
  PhoneOff,
  Monitor,
  MonitorOff,
  Settings,
  Users,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  MoreVertical,
  Grid3X3,
  User,
  Camera,
  Speaker,
  ChevronDown,
  Copy,
  Share2,
  MessageSquare,
  Pin,
  PinOff,
  Circle,
  Square
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { MediaCollaborationClient, type CallState, type CallParticipant, type MediaDevice } from '@/lib/collaboration/media-collaboration-client'
import { CallRecordingControls } from './CallRecordingControls'

interface VideoCallPanelProps {
  mediaClient: MediaCollaborationClient
  isVisible: boolean
  onClose: () => void
}

interface ParticipantVideoProps {
  participant: CallParticipant
  isLocal?: boolean
  isPinned?: boolean
  onPin?: () => void
  onUnpin?: () => void
}

function ParticipantVideo({ participant, isLocal = false, isPinned = false, onPin, onUnpin }: ParticipantVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isHovered, setIsHovered] = useState(false)

  useEffect(() => {
    if (videoRef.current && participant.stream) {
      videoRef.current.srcObject = participant.stream
    }
  }, [participant.stream])

  return (
    <div 
      className={`relative bg-gray-900 rounded-lg overflow-hidden ${
        isPinned ? 'col-span-2 row-span-2' : ''
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {participant.stream && !participant.isVideoMuted ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={isLocal}
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
          <div className="text-center">
            <div 
              className="w-16 h-16 rounded-full mx-auto mb-3 flex items-center justify-center text-2xl font-bold text-white"
              style={{ backgroundColor: participant.user.color }}
            >
              {participant.user.avatar ? (
                <img 
                  src={participant.user.avatar} 
                  alt={participant.user.name}
                  className="w-full h-full object-cover rounded-full"
                />
              ) : (
                participant.user.name.charAt(0).toUpperCase()
              )}
            </div>
            <p className="text-white font-medium">{participant.user.name}</p>
            {participant.isVideoMuted && (
              <p className="text-gray-400 text-sm mt-1">Camera off</p>
            )}
          </div>
        </div>
      )}

      {/* Participant Info Overlay */}
      <AnimatePresence>
        {(isHovered || participant.isAudioMuted || participant.isScreenSharing) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/20"
          >
            {/* Top Bar */}
            <div className="absolute top-2 left-2 right-2 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Badge 
                  variant="outline" 
                  className="bg-black/50 text-white border-white/20"
                >
                  {participant.user.name}
                  {isLocal && ' (You)'}
                </Badge>
                
                {participant.isScreenSharing && (
                  <Badge className="bg-blue-500 text-white">
                    <Monitor className="w-3 h-3 mr-1" />
                    Sharing
                  </Badge>
                )}
              </div>

              {!isLocal && (
                <div className="flex items-center space-x-1">
                  {isPinned ? (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={onUnpin}
                      className="bg-black/50 border-white/20 text-white hover:bg-black/70"
                    >
                      <PinOff className="w-3 h-3" />
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={onPin}
                      className="bg-black/50 border-white/20 text-white hover:bg-black/70"
                    >
                      <Pin className="w-3 h-3" />
                    </Button>
                  )}
                </div>
              )}
            </div>

            {/* Bottom Bar */}
            <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {participant.isAudioMuted && (
                  <div className="bg-red-500 rounded-full p-1">
                    <MicOff className="w-3 h-3 text-white" />
                  </div>
                )}
                
                {participant.isVideoMuted && (
                  <div className="bg-red-500 rounded-full p-1">
                    <VideoOff className="w-3 h-3 text-white" />
                  </div>
                )}
              </div>

              <div className="flex items-center space-x-1">
                <div className={`w-2 h-2 rounded-full ${
                  participant.connectionState === 'connected' ? 'bg-green-500' :
                  participant.connectionState === 'connecting' ? 'bg-yellow-500' :
                  'bg-red-500'
                }`} />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export function VideoCallPanel({ mediaClient, isVisible, onClose }: VideoCallPanelProps) {
  const [callState, setCallState] = useState<CallState | null>(null)
  const [isMinimized, setIsMinimized] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [showRecording, setShowRecording] = useState(false)
  const [pinnedParticipant, setPinnedParticipant] = useState<string | null>(null)
  const [volume, setVolume] = useState([100])
  const [availableDevices, setAvailableDevices] = useState<MediaDevice[]>([])
  const [selectedDevices, setSelectedDevices] = useState({
    video: '',
    audio: '',
    audioOutput: ''
  })
  const [callDuration, setCallDuration] = useState(0)
  const [participantCount, setParticipantCount] = useState(0)
  const [remoteStreams, setRemoteStreams] = useState<MediaStream[]>([])

  const localVideoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const updateCallState = () => {
      setCallState(mediaClient.getCallState())
    }

    const updateDevices = (devices: MediaDevice[]) => {
      setAvailableDevices(devices)
    }

    const updateDeviceSelection = (selection: any) => {
      setSelectedDevices(selection)
    }

    // Set up event listeners
    mediaClient.on('call-started', updateCallState)
    mediaClient.on('call-joined', updateCallState)
    mediaClient.on('call-ended', () => {
      setCallState(null)
      onClose()
    })
    mediaClient.on('participant-joined', updateCallState)
    mediaClient.on('participant-left', updateCallState)
    mediaClient.on('devices-updated', updateDevices)
    mediaClient.on('device-selection-changed', updateDeviceSelection)
    mediaClient.on('local-stream-initialized', (stream: MediaStream) => {
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream
      }
    })
    mediaClient.on('participant-stream', ({ userId, stream }: { userId: string; stream: MediaStream }) => {
      setRemoteStreams(prev => [...prev.filter(s => s.id !== stream.id), stream])
    })

    // Initial state
    updateCallState()
    setAvailableDevices(mediaClient.getAvailableDevices())

    return () => {
      mediaClient.removeAllListeners()
    }
  }, [mediaClient, onClose])

  // Update call duration
  useEffect(() => {
    if (!callState || callState.status !== 'connected') return

    const interval = setInterval(() => {
      const duration = Math.floor((Date.now() - callState.startTime.getTime()) / 1000)
      setCallDuration(duration)
    }, 1000)

    return () => clearInterval(interval)
  }, [callState])

  // Update participant count
  useEffect(() => {
    setParticipantCount(callState ? callState.participants.size + 1 : 0) // +1 for local user
  }, [callState])

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const handleToggleAudio = () => {
    mediaClient.toggleAudio()
  }

  const handleToggleVideo = () => {
    mediaClient.toggleVideo()
  }

  const handleToggleScreenShare = () => {
    if (callState?.isScreenSharing) {
      mediaClient.stopScreenShare()
    } else {
      mediaClient.startScreenShare()
    }
  }

  const handleEndCall = () => {
    mediaClient.endCall()
  }

  const handleDeviceChange = (type: 'video' | 'audio' | 'audioOutput', deviceId: string) => {
    const newSelection = { ...selectedDevices, [type]: deviceId }
    setSelectedDevices(newSelection)
    mediaClient.setSelectedDevices(
      newSelection.video,
      newSelection.audio,
      newSelection.audioOutput
    )
  }

  const handleCopyCallId = () => {
    if (callState) {
      navigator.clipboard.writeText(callState.id)
      // Show toast notification
    }
  }

  if (!isVisible || !callState) {
    return null
  }

  const participants = Array.from(callState.participants.values())
  const pinnedParticipantData = pinnedParticipant 
    ? callState.participants.get(pinnedParticipant) 
    : null

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={`fixed inset-4 bg-gray-900 rounded-xl shadow-2xl z-50 flex flex-col ${
        isMinimized ? 'bottom-4 right-4 top-auto left-auto w-80 h-60' : ''
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <Users className="w-5 h-5 text-green-500" />
            <span className="text-white font-medium">
              Video Call ({participantCount} participant{participantCount !== 1 ? 's' : ''})
            </span>
          </div>
          
          {callState.status === 'connected' && (
            <Badge variant="outline" className="text-green-500 border-green-500">
              {formatDuration(callDuration)}
            </Badge>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopyCallId}
            className="text-gray-400 hover:text-white"
          >
            <Copy className="w-4 h-4" />
          </Button>
          
          <Button
            variant={showRecording ? "destructive" : "ghost"}
            size="sm"
            onClick={() => setShowRecording(!showRecording)}
            className={showRecording ? "" : "text-gray-400 hover:text-white"}
          >
            <Circle className="w-4 h-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowSettings(!showSettings)}
            className="text-gray-400 hover:text-white"
          >
            <Settings className="w-4 h-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsMinimized(!isMinimized)}
            className="text-gray-400 hover:text-white"
          >
            {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            ×
          </Button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Settings Panel */}
          <AnimatePresence>
            {showSettings && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="border-b border-gray-700 overflow-hidden"
              >
                <div className="p-4 space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Camera
                      </label>
                      <Select
                        value={selectedDevices.video}
                        onValueChange={(value) => handleDeviceChange('video', value)}
                      >
                        <SelectTrigger className="bg-gray-800 border-gray-600">
                          <SelectValue placeholder="Select camera" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableDevices
                            .filter(d => d.kind === 'videoinput')
                            .map(device => (
                              <SelectItem key={device.deviceId} value={device.deviceId}>
                                {device.label}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Microphone
                      </label>
                      <Select
                        value={selectedDevices.audio}
                        onValueChange={(value) => handleDeviceChange('audio', value)}
                      >
                        <SelectTrigger className="bg-gray-800 border-gray-600">
                          <SelectValue placeholder="Select microphone" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableDevices
                            .filter(d => d.kind === 'audioinput')
                            .map(device => (
                              <SelectItem key={device.deviceId} value={device.deviceId}>
                                {device.label}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Speaker
                      </label>
                      <Select
                        value={selectedDevices.audioOutput}
                        onValueChange={(value) => handleDeviceChange('audioOutput', value)}
                      >
                        <SelectTrigger className="bg-gray-800 border-gray-600">
                          <SelectValue placeholder="Select speaker" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableDevices
                            .filter(d => d.kind === 'audiooutput')
                            .map(device => (
                              <SelectItem key={device.deviceId} value={device.deviceId}>
                                {device.label}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Volume: {volume[0]}%
                    </label>
                    <Slider
                      value={volume}
                      onValueChange={setVolume}
                      max={100}
                      step={1}
                      className="w-full"
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Video Grid */}
          <div className="flex-1 p-4">
            {pinnedParticipantData ? (
              <div className="grid grid-cols-4 gap-4 h-full">
                {/* Pinned participant takes 3/4 of the space */}
                <div className="col-span-3">
                  <ParticipantVideo
                    participant={pinnedParticipantData}
                    isPinned={true}
                    onUnpin={() => setPinnedParticipant(null)}
                  />
                </div>
                
                {/* Sidebar with other participants */}
                <div className="space-y-4">
                  {/* Local video */}
                  <div className="aspect-video">
                    <ParticipantVideo
                      participant={{
                        userId: 'local',
                        user: { id: 'local', name: 'You', email: '', color: '#6366f1' },
                        peer: null as any,
                        isAudioMuted: callState.isAudioMuted,
                        isVideoMuted: callState.isVideoMuted,
                        isScreenSharing: callState.isScreenSharing,
                        connectionState: 'connected'
                      }}
                      isLocal={true}
                    />
                  </div>
                  
                  {/* Other participants */}
                  {participants
                    .filter(p => p.userId !== pinnedParticipant)
                    .slice(0, 3)
                    .map(participant => (
                      <div key={participant.userId} className="aspect-video">
                        <ParticipantVideo
                          participant={participant}
                          onPin={() => setPinnedParticipant(participant.userId)}
                        />
                      </div>
                    ))}
                </div>
              </div>
            ) : (
              <div className={`grid gap-4 h-full ${
                participantCount <= 2 ? 'grid-cols-2' :
                participantCount <= 4 ? 'grid-cols-2 grid-rows-2' :
                participantCount <= 6 ? 'grid-cols-3 grid-rows-2' :
                'grid-cols-4 grid-rows-2'
              }`}>
                {/* Local video */}
                <ParticipantVideo
                  participant={{
                    userId: 'local',
                    user: { id: 'local', name: 'You', email: '', color: '#6366f1' },
                    peer: null as any,
                    isAudioMuted: callState.isAudioMuted,
                    isVideoMuted: callState.isVideoMuted,
                    isScreenSharing: callState.isScreenSharing,
                    connectionState: 'connected'
                  }}
                  isLocal={true}
                />
                
                {/* Remote participants */}
                {participants.map(participant => (
                  <ParticipantVideo
                    key={participant.userId}
                    participant={participant}
                    onPin={() => setPinnedParticipant(participant.userId)}
                  />
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* Control Bar */}
      <div className="p-4 border-t border-gray-700">
        <div className="flex items-center justify-center space-x-4">
          <Button
            variant={callState.isAudioMuted ? "destructive" : "secondary"}
            size="lg"
            onClick={handleToggleAudio}
            className="rounded-full"
          >
            {callState.isAudioMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </Button>

          <Button
            variant={callState.isVideoMuted ? "destructive" : "secondary"}
            size="lg"
            onClick={handleToggleVideo}
            className="rounded-full"
          >
            {callState.isVideoMuted ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
          </Button>

          <Button
            variant={callState.isScreenSharing ? "default" : "secondary"}
            size="lg"
            onClick={handleToggleScreenShare}
            className="rounded-full"
          >
            {callState.isScreenSharing ? <MonitorOff className="w-5 h-5" /> : <Monitor className="w-5 h-5" />}
          </Button>

          <Button
            variant="destructive"
            size="lg"
            onClick={handleEndCall}
            className="rounded-full"
          >
            <PhoneOff className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Hidden local video element for getUserMedia */}
      <video
        ref={localVideoRef}
        autoPlay
        playsInline
        muted
        className="hidden"
      />

      {/* Recording Controls */}
      {showRecording && (
        <CallRecordingControls
          mediaClient={mediaClient}
          localStream={mediaClient.getLocalStream()}
          remoteStreams={remoteStreams}
          isVisible={showRecording}
          onClose={() => setShowRecording(false)}
        />
      )}
    </motion.div>
  )
}