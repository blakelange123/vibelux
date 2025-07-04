/**
 * WebRTC Media Collaboration Client
 * Handles voice, video, and screen sharing for real-time collaboration
 */

import { EventEmitter } from 'events'
import SimplePeer from 'simple-peer'
import { CollaborationClient, type User } from './collaboration-client'

export interface MediaConstraints {
  video: boolean | MediaTrackConstraints
  audio: boolean | MediaTrackConstraints
}

export interface MediaDevice {
  deviceId: string
  label: string
  kind: 'videoinput' | 'audioinput' | 'audiooutput'
}

export interface CallParticipant {
  userId: string
  user: User
  peer: SimplePeer.Instance
  stream?: MediaStream
  isAudioMuted: boolean
  isVideoMuted: boolean
  isScreenSharing: boolean
  connectionState: RTCPeerConnectionState
}

export interface CallState {
  id: string
  participants: Map<string, CallParticipant>
  localStream?: MediaStream
  localScreenStream?: MediaStream
  isAudioMuted: boolean
  isVideoMuted: boolean
  isScreenSharing: boolean
  startTime: Date
  status: 'connecting' | 'connected' | 'disconnected' | 'failed'
}

export interface MediaCollaborationConfig {
  iceServers?: RTCIceServer[]
  maxParticipants?: number
  autoStartVideo?: boolean
  autoStartAudio?: boolean
  enableScreenShare?: boolean
  videoConstraints?: MediaTrackConstraints
  audioConstraints?: MediaTrackConstraints
}

export class MediaCollaborationClient extends EventEmitter {
  private config: MediaCollaborationConfig
  private collaborationClient: CollaborationClient
  private callState: CallState | null = null
  private localStream: MediaStream | null = null
  private localScreenStream: MediaStream | null = null
  private availableDevices: MediaDevice[] = []
  private selectedVideoDevice: string | null = null
  private selectedAudioDevice: string | null = null
  private selectedAudioOutput: string | null = null

  constructor(
    collaborationClient: CollaborationClient,
    config: MediaCollaborationConfig = {}
  ) {
    super()
    this.collaborationClient = collaborationClient
    this.config = {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        { urls: 'stun:stun2.l.google.com:19302' }
      ],
      maxParticipants: 50,
      autoStartVideo: false,
      autoStartAudio: true,
      enableScreenShare: true,
      videoConstraints: {
        width: { ideal: 1280 },
        height: { ideal: 720 },
        frameRate: { ideal: 30 }
      },
      audioConstraints: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true
      },
      ...config
    }

    this.setupCollaborationListeners()
    this.initializeDevices()
  }

  /**
   * Initialize available media devices
   */
  async initializeDevices() {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices()
      this.availableDevices = devices.map(device => ({
        deviceId: device.deviceId,
        label: device.label || `${device.kind} ${device.deviceId.slice(0, 8)}`,
        kind: device.kind as MediaDevice['kind']
      }))

      // Set default devices
      const videoDevices = this.availableDevices.filter(d => d.kind === 'videoinput')
      const audioDevices = this.availableDevices.filter(d => d.kind === 'audioinput')
      const audioOutputs = this.availableDevices.filter(d => d.kind === 'audiooutput')

      if (videoDevices.length > 0 && !this.selectedVideoDevice) {
        this.selectedVideoDevice = videoDevices[0].deviceId
      }
      if (audioDevices.length > 0 && !this.selectedAudioDevice) {
        this.selectedAudioDevice = audioDevices[0].deviceId
      }
      if (audioOutputs.length > 0 && !this.selectedAudioOutput) {
        this.selectedAudioOutput = audioOutputs[0].deviceId
      }

      this.emit('devices-updated', this.availableDevices)
    } catch (error) {
      console.error('Failed to enumerate devices:', error)
    }
  }

  /**
   * Get available media devices
   */
  getAvailableDevices(): MediaDevice[] {
    return this.availableDevices
  }

  /**
   * Set selected devices
   */
  setSelectedDevices(video?: string, audio?: string, audioOutput?: string) {
    if (video !== undefined) this.selectedVideoDevice = video
    if (audio !== undefined) this.selectedAudioDevice = audio
    if (audioOutput !== undefined) this.selectedAudioOutput = audioOutput
    
    this.emit('device-selection-changed', {
      video: this.selectedVideoDevice,
      audio: this.selectedAudioDevice,
      audioOutput: this.selectedAudioOutput
    })
  }

  /**
   * Start a new call
   */
  async startCall(participants: string[] = []): Promise<string> {
    if (this.callState) {
      throw new Error('Call already in progress')
    }

    const callId = this.generateCallId()
    
    try {
      // Get local media stream
      await this.initializeLocalStream()

      // Create call state
      this.callState = {
        id: callId,
        participants: new Map(),
        localStream: this.localStream || undefined,
        isAudioMuted: !this.config.autoStartAudio,
        isVideoMuted: !this.config.autoStartVideo,
        isScreenSharing: false,
        startTime: new Date(),
        status: 'connecting'
      }

      // Notify other users about the call
      this.collaborationClient.send({
        type: 'call-started',
        userId: this.collaborationClient.config.userId,
        data: {
          callId,
          participants: [this.collaborationClient.config.userId, ...participants]
        },
        timestamp: new Date()
      })

      this.emit('call-started', { callId, participants })
      return callId

    } catch (error) {
      console.error('Failed to start call:', error)
      this.callState = null
      throw error
    }
  }

  /**
   * Join an existing call
   */
  async joinCall(callId: string): Promise<void> {
    if (this.callState) {
      throw new Error('Already in a call')
    }

    try {
      // Get local media stream
      await this.initializeLocalStream()

      // Create call state
      this.callState = {
        id: callId,
        participants: new Map(),
        localStream: this.localStream || undefined,
        isAudioMuted: !this.config.autoStartAudio,
        isVideoMuted: !this.config.autoStartVideo,
        isScreenSharing: false,
        startTime: new Date(),
        status: 'connecting'
      }

      // Notify server about joining
      this.collaborationClient.send({
        type: 'call-join',
        userId: this.collaborationClient.config.userId,
        data: { callId },
        timestamp: new Date()
      })

      this.emit('call-joined', { callId })

    } catch (error) {
      console.error('Failed to join call:', error)
      this.callState = null
      throw error
    }
  }

  /**
   * End the current call
   */
  async endCall(): Promise<void> {
    if (!this.callState) return

    const callId = this.callState.id

    // Close all peer connections
    this.callState.participants.forEach(participant => {
      participant.peer.destroy()
    })

    // Stop local streams
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop())
      this.localStream = null
    }

    if (this.localScreenStream) {
      this.localScreenStream.getTracks().forEach(track => track.stop())
      this.localScreenStream = null
    }

    // Notify other participants
    this.collaborationClient.send({
      type: 'call-ended',
      userId: this.collaborationClient.config.userId,
      data: { callId },
      timestamp: new Date()
    })

    this.callState = null
    this.emit('call-ended', { callId })
  }

  /**
   * Toggle audio mute
   */
  toggleAudio(): boolean {
    if (!this.callState || !this.localStream) return false

    const audioTrack = this.localStream.getAudioTracks()[0]
    if (audioTrack) {
      audioTrack.enabled = !audioTrack.enabled
      this.callState.isAudioMuted = !audioTrack.enabled

      // Notify other participants
      this.collaborationClient.send({
        type: 'media-state-changed',
        userId: this.collaborationClient.config.userId,
        data: {
          callId: this.callState.id,
          isAudioMuted: this.callState.isAudioMuted,
          isVideoMuted: this.callState.isVideoMuted
        },
        timestamp: new Date()
      })

      this.emit('audio-toggled', { muted: this.callState.isAudioMuted })
      return this.callState.isAudioMuted
    }

    return false
  }

  /**
   * Toggle video mute
   */
  toggleVideo(): boolean {
    if (!this.callState || !this.localStream) return false

    const videoTrack = this.localStream.getVideoTracks()[0]
    if (videoTrack) {
      videoTrack.enabled = !videoTrack.enabled
      this.callState.isVideoMuted = !videoTrack.enabled

      // Notify other participants
      this.collaborationClient.send({
        type: 'media-state-changed',
        userId: this.collaborationClient.config.userId,
        data: {
          callId: this.callState.id,
          isAudioMuted: this.callState.isAudioMuted,
          isVideoMuted: this.callState.isVideoMuted
        },
        timestamp: new Date()
      })

      this.emit('video-toggled', { muted: this.callState.isVideoMuted })
      return this.callState.isVideoMuted
    }

    return false
  }

  /**
   * Start screen sharing
   */
  async startScreenShare(): Promise<void> {
    if (!this.callState) {
      throw new Error('No active call')
    }

    if (this.callState.isScreenSharing) {
      throw new Error('Already screen sharing')
    }

    try {
      // Get screen stream
      this.localScreenStream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          cursor: 'always',
          displaySurface: 'monitor'
        },
        audio: true
      })

      // Handle screen share end event
      this.localScreenStream.getVideoTracks()[0].addEventListener('ended', () => {
        this.stopScreenShare()
      })

      this.callState.isScreenSharing = true
      this.callState.localScreenStream = this.localScreenStream

      // Replace video track in all peer connections
      this.callState.participants.forEach(async (participant) => {
        const sender = participant.peer._pc?.getSenders().find(s => 
          s.track && s.track.kind === 'video'
        )
        
        if (sender && this.localScreenStream) {
          await sender.replaceTrack(this.localScreenStream.getVideoTracks()[0])
        }
      })

      // Notify other participants
      this.collaborationClient.send({
        type: 'screen-share-started',
        userId: this.collaborationClient.config.userId,
        data: { callId: this.callState.id },
        timestamp: new Date()
      })

      this.emit('screen-share-started')

    } catch (error) {
      console.error('Failed to start screen sharing:', error)
      throw error
    }
  }

  /**
   * Stop screen sharing
   */
  async stopScreenShare(): Promise<void> {
    if (!this.callState || !this.callState.isScreenSharing) return

    try {
      // Stop screen stream
      if (this.localScreenStream) {
        this.localScreenStream.getTracks().forEach(track => track.stop())
        this.localScreenStream = null
      }

      this.callState.isScreenSharing = false
      this.callState.localScreenStream = undefined

      // Replace back to camera stream
      this.callState.participants.forEach(async (participant) => {
        const sender = participant.peer._pc?.getSenders().find(s => 
          s.track && s.track.kind === 'video'
        )
        
        if (sender && this.localStream) {
          const videoTrack = this.localStream.getVideoTracks()[0]
          if (videoTrack) {
            await sender.replaceTrack(videoTrack)
          }
        }
      })

      // Notify other participants
      this.collaborationClient.send({
        type: 'screen-share-stopped',
        userId: this.collaborationClient.config.userId,
        data: { callId: this.callState.id },
        timestamp: new Date()
      })

      this.emit('screen-share-stopped')

    } catch (error) {
      console.error('Failed to stop screen sharing:', error)
    }
  }

  /**
   * Get current call state
   */
  getCallState(): CallState | null {
    return this.callState
  }

  /**
   * Get local stream
   */
  getLocalStream(): MediaStream | null {
    return this.localStream
  }

  /**
   * Get local screen stream
   */
  getLocalScreenStream(): MediaStream | null {
    return this.localScreenStream
  }

  /**
   * Private methods
   */
  private async initializeLocalStream(): Promise<void> {
    try {
      const constraints: MediaStreamConstraints = {
        video: this.config.autoStartVideo ? {
          deviceId: this.selectedVideoDevice ? { exact: this.selectedVideoDevice } : undefined,
          ...this.config.videoConstraints
        } : false,
        audio: this.config.autoStartAudio ? {
          deviceId: this.selectedAudioDevice ? { exact: this.selectedAudioDevice } : undefined,
          ...this.config.audioConstraints
        } : false
      }

      this.localStream = await navigator.mediaDevices.getUserMedia(constraints)
      this.emit('local-stream-initialized', this.localStream)

    } catch (error) {
      console.error('Failed to get local stream:', error)
      throw error
    }
  }

  private createPeerConnection(userId: string, user: User, initiator: boolean): CallParticipant {
    const peer = new SimplePeer({
      initiator,
      trickle: false,
      stream: this.localStream || undefined,
      config: {
        iceServers: this.config.iceServers
      }
    })

    const participant: CallParticipant = {
      userId,
      user,
      peer,
      isAudioMuted: false,
      isVideoMuted: false,
      isScreenSharing: false,
      connectionState: 'new'
    }

    peer.on('signal', (data) => {
      this.collaborationClient.send({
        type: 'webrtc-signal',
        userId: this.collaborationClient.config.userId,
        data: {
          signal: data,
          targetUserId: userId,
          callId: this.callState?.id
        },
        timestamp: new Date()
      })
    })

    peer.on('stream', (stream) => {
      participant.stream = stream
      this.emit('participant-stream', { userId, stream })
    })

    peer.on('connect', () => {
      participant.connectionState = 'connected'
      this.emit('participant-connected', { userId })
    })

    peer.on('close', () => {
      participant.connectionState = 'disconnected'
      this.emit('participant-disconnected', { userId })
    })

    peer.on('error', (error) => {
      console.error(`Peer error for user ${userId}:`, error)
      participant.connectionState = 'failed'
      this.emit('participant-error', { userId, error })
    })

    return participant
  }

  private setupCollaborationListeners(): void {
    this.collaborationClient.on('call-started', (event) => {
      if (event.userId !== this.collaborationClient.config.userId) {
        this.emit('call-invitation', {
          callId: event.data.callId,
          from: event.userId,
          participants: event.data.participants
        })
      }
    })

    this.collaborationClient.on('call-join', (event) => {
      if (this.callState && event.data.callId === this.callState.id) {
        // Create peer connection for new participant
        const user = this.collaborationClient.getActiveUsers()
          .find(u => u.user.id === event.userId)?.user
        
        if (user) {
          const participant = this.createPeerConnection(event.userId, user, true)
          this.callState.participants.set(event.userId, participant)
          this.emit('participant-joined', { userId: event.userId, user })
        }
      }
    })

    this.collaborationClient.on('call-ended', (event) => {
      if (this.callState && event.data.callId === this.callState.id) {
        this.endCall()
      }
    })

    this.collaborationClient.on('webrtc-signal', (event) => {
      if (this.callState && event.data.targetUserId === this.collaborationClient.config.userId) {
        let participant = this.callState.participants.get(event.userId)
        
        if (!participant) {
          // Create new participant
          const user = this.collaborationClient.getActiveUsers()
            .find(u => u.user.id === event.userId)?.user
          
          if (user) {
            participant = this.createPeerConnection(event.userId, user, false)
            this.callState.participants.set(event.userId, participant)
          }
        }

        if (participant) {
          participant.peer.signal(event.data.signal)
        }
      }
    })

    this.collaborationClient.on('media-state-changed', (event) => {
      if (this.callState) {
        const participant = this.callState.participants.get(event.userId)
        if (participant) {
          participant.isAudioMuted = event.data.isAudioMuted
          participant.isVideoMuted = event.data.isVideoMuted
          this.emit('participant-media-changed', {
            userId: event.userId,
            isAudioMuted: event.data.isAudioMuted,
            isVideoMuted: event.data.isVideoMuted
          })
        }
      }
    })

    this.collaborationClient.on('screen-share-started', (event) => {
      if (this.callState) {
        const participant = this.callState.participants.get(event.userId)
        if (participant) {
          participant.isScreenSharing = true
          this.emit('participant-screen-share-started', { userId: event.userId })
        }
      }
    })

    this.collaborationClient.on('screen-share-stopped', (event) => {
      if (this.callState) {
        const participant = this.callState.participants.get(event.userId)
        if (participant) {
          participant.isScreenSharing = false
          this.emit('participant-screen-share-stopped', { userId: event.userId })
        }
      }
    })
  }

  private generateCallId(): string {
    return `call_${Date.now()}_${crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF.toString(36).substr(2, 9)}`
  }
}