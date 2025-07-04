'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { MediaCollaborationClient, type CallState, type CallParticipant } from '@/lib/collaboration/media-collaboration-client'
import { CollaborationClient } from '@/lib/collaboration/collaboration-client'

export interface UseMediaCollaborationOptions {
  autoStartVideo?: boolean
  autoStartAudio?: boolean
  enableScreenShare?: boolean
}

export interface MediaCollaborationState {
  callState: CallState | null
  isInCall: boolean
  isVideoEnabled: boolean
  isAudioEnabled: boolean
  isScreenSharing: boolean
  participants: CallParticipant[]
  localStream: MediaStream | null
  screenStream: MediaStream | null
}

export function useMediaCollaboration(
  collaborationClient: CollaborationClient,
  options: UseMediaCollaborationOptions = {}
) {
  const [mediaClient] = useState(() => 
    new MediaCollaborationClient(collaborationClient, options)
  )
  
  const [state, setState] = useState<MediaCollaborationState>({
    callState: null,
    isInCall: false,
    isVideoEnabled: options.autoStartVideo || false,
    isAudioEnabled: options.autoStartAudio || true,
    isScreenSharing: false,
    participants: [],
    localStream: null,
    screenStream: null
  })

  const [incomingCall, setIncomingCall] = useState<{
    callId: string
    from: string
    participants: string[]
  } | null>(null)

  const updateState = useCallback(() => {
    const callState = mediaClient.getCallState()
    const participants = callState ? Array.from(callState.participants.values()) : []
    
    setState({
      callState,
      isInCall: !!callState,
      isVideoEnabled: callState ? !callState.isVideoMuted : options.autoStartVideo || false,
      isAudioEnabled: callState ? !callState.isAudioMuted : options.autoStartAudio || true,
      isScreenSharing: callState?.isScreenSharing || false,
      participants,
      localStream: mediaClient.getLocalStream(),
      screenStream: mediaClient.getLocalScreenStream()
    })
  }, [mediaClient, options])

  useEffect(() => {
    // Set up event listeners
    const handleCallStarted = () => updateState()
    const handleCallJoined = () => updateState()
    const handleCallEnded = () => {
      updateState()
      setIncomingCall(null)
    }
    const handleParticipantJoined = () => updateState()
    const handleParticipantLeft = () => updateState()
    const handleAudioToggled = () => updateState()
    const handleVideoToggled = () => updateState()
    const handleScreenShareStarted = () => updateState()
    const handleScreenShareStopped = () => updateState()
    
    const handleCallInvitation = (event: any) => {
      setIncomingCall({
        callId: event.callId,
        from: event.from,
        participants: event.participants
      })
    }

    mediaClient.on('call-started', handleCallStarted)
    mediaClient.on('call-joined', handleCallJoined)
    mediaClient.on('call-ended', handleCallEnded)
    mediaClient.on('participant-joined', handleParticipantJoined)
    mediaClient.on('participant-left', handleParticipantLeft)
    mediaClient.on('audio-toggled', handleAudioToggled)
    mediaClient.on('video-toggled', handleVideoToggled)
    mediaClient.on('screen-share-started', handleScreenShareStarted)
    mediaClient.on('screen-share-stopped', handleScreenShareStopped)
    mediaClient.on('call-invitation', handleCallInvitation)

    // Initial state update
    updateState()

    return () => {
      mediaClient.removeAllListeners()
    }
  }, [mediaClient, updateState])

  // Call management functions
  const startCall = useCallback(async (participants: string[] = []) => {
    try {
      const callId = await mediaClient.startCall(participants)
      return callId
    } catch (error) {
      console.error('Failed to start call:', error)
      throw error
    }
  }, [mediaClient])

  const joinCall = useCallback(async (callId: string) => {
    try {
      await mediaClient.joinCall(callId)
    } catch (error) {
      console.error('Failed to join call:', error)
      throw error
    }
  }, [mediaClient])

  const endCall = useCallback(async () => {
    try {
      await mediaClient.endCall()
    } catch (error) {
      console.error('Failed to end call:', error)
    }
  }, [mediaClient])

  const acceptIncomingCall = useCallback(async (withVideo: boolean = false) => {
    if (!incomingCall) return
    
    try {
      // Update media client config before joining
      if (withVideo !== state.isVideoEnabled) {
        await mediaClient.toggleVideo()
      }
      
      await joinCall(incomingCall.callId)
      setIncomingCall(null)
    } catch (error) {
      console.error('Failed to accept call:', error)
    }
  }, [incomingCall, joinCall, state.isVideoEnabled, mediaClient])

  const declineIncomingCall = useCallback(() => {
    setIncomingCall(null)
  }, [])

  // Media control functions
  const toggleAudio = useCallback(() => {
    return mediaClient.toggleAudio()
  }, [mediaClient])

  const toggleVideo = useCallback(() => {
    return mediaClient.toggleVideo()
  }, [mediaClient])

  const startScreenShare = useCallback(async () => {
    try {
      await mediaClient.startScreenShare()
    } catch (error) {
      console.error('Failed to start screen share:', error)
      throw error
    }
  }, [mediaClient])

  const stopScreenShare = useCallback(async () => {
    try {
      await mediaClient.stopScreenShare()
    } catch (error) {
      console.error('Failed to stop screen share:', error)
    }
  }, [mediaClient])

  // Device management
  const getAvailableDevices = useCallback(() => {
    return mediaClient.getAvailableDevices()
  }, [mediaClient])

  const setSelectedDevices = useCallback((video?: string, audio?: string, audioOutput?: string) => {
    mediaClient.setSelectedDevices(video, audio, audioOutput)
  }, [mediaClient])

  return {
    // State
    ...state,
    incomingCall,
    mediaClient,
    
    // Call management
    startCall,
    joinCall,
    endCall,
    acceptIncomingCall,
    declineIncomingCall,
    
    // Media controls
    toggleAudio,
    toggleVideo,
    startScreenShare,
    stopScreenShare,
    
    // Device management
    getAvailableDevices,
    setSelectedDevices
  }
}