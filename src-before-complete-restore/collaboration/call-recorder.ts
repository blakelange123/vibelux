/**
 * Call Recording functionality for WebRTC calls
 * Records audio/video streams and saves them locally or uploads to server
 */

import { EventEmitter } from 'events'

export interface RecordingOptions {
  mimeType?: string
  videoBitsPerSecond?: number
  audioBitsPerSecond?: number
  timeslice?: number
}

export interface RecordingState {
  isRecording: boolean
  isPaused: boolean
  duration: number
  size: number
  startTime: Date | null
}

export class CallRecorder extends EventEmitter {
  private mediaRecorder: MediaRecorder | null = null
  private recordedChunks: Blob[] = []
  private recordingState: RecordingState = {
    isRecording: false,
    isPaused: false,
    duration: 0,
    size: 0,
    startTime: null
  }
  private durationTimer: NodeJS.Timeout | null = null
  private stream: MediaStream | null = null

  constructor() {
    super()
  }

  /**
   * Start recording a stream
   */
  async startRecording(stream: MediaStream, options: RecordingOptions = {}): Promise<void> {
    if (this.recordingState.isRecording) {
      throw new Error('Recording already in progress')
    }

    // Check if recording is supported
    if (!MediaRecorder.isTypeSupported) {
      throw new Error('MediaRecorder is not supported in this browser')
    }

    // Determine the best mime type
    const mimeType = options.mimeType || this.getPreferredMimeType()
    if (!MediaRecorder.isTypeSupported(mimeType)) {
      throw new Error(`Mime type ${mimeType} is not supported`)
    }

    this.stream = stream
    this.recordedChunks = []

    // Create MediaRecorder with options
    const recorderOptions: MediaRecorderOptions = {
      mimeType,
      videoBitsPerSecond: options.videoBitsPerSecond || 2500000, // 2.5 Mbps
      audioBitsPerSecond: options.audioBitsPerSecond || 128000   // 128 Kbps
    }

    try {
      this.mediaRecorder = new MediaRecorder(stream, recorderOptions)
    } catch (error) {
      console.error('Failed to create MediaRecorder:', error)
      throw new Error('Failed to initialize recording')
    }

    // Set up event handlers
    this.mediaRecorder.ondataavailable = (event) => {
      if (event.data && event.data.size > 0) {
        this.recordedChunks.push(event.data)
        this.recordingState.size += event.data.size
        this.emit('data-available', { size: event.data.size, totalSize: this.recordingState.size })
      }
    }

    this.mediaRecorder.onstart = () => {
      this.recordingState = {
        isRecording: true,
        isPaused: false,
        duration: 0,
        size: 0,
        startTime: new Date()
      }

      // Start duration timer
      this.durationTimer = setInterval(() => {
        if (!this.recordingState.isPaused && this.recordingState.startTime) {
          this.recordingState.duration = Date.now() - this.recordingState.startTime.getTime()
          this.emit('duration-update', { duration: this.recordingState.duration })
        }
      }, 100)

      this.emit('recording-started')
    }

    this.mediaRecorder.onstop = () => {
      if (this.durationTimer) {
        clearInterval(this.durationTimer)
        this.durationTimer = null
      }

      this.recordingState.isRecording = false
      this.recordingState.isPaused = false
      
      // Create the final blob
      const blob = new Blob(this.recordedChunks, { type: mimeType })
      
      this.emit('recording-stopped', { 
        blob, 
        duration: this.recordingState.duration, 
        size: this.recordingState.size,
        mimeType 
      })
    }

    this.mediaRecorder.onerror = (event: any) => {
      console.error('MediaRecorder error:', event.error)
      this.emit('error', event.error)
    }

    // Start recording
    const timeslice = options.timeslice || 1000 // Request data every second
    this.mediaRecorder.start(timeslice)
  }

  /**
   * Stop recording
   */
  async stopRecording(): Promise<Blob> {
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder || !this.recordingState.isRecording) {
        reject(new Error('No recording in progress'))
        return
      }

      this.once('recording-stopped', ({ blob }) => {
        resolve(blob)
      })

      this.mediaRecorder.stop()
    })
  }

  /**
   * Pause recording
   */
  pauseRecording(): void {
    if (!this.mediaRecorder || !this.recordingState.isRecording || this.recordingState.isPaused) {
      return
    }

    if (this.mediaRecorder.state === 'recording') {
      this.mediaRecorder.pause()
      this.recordingState.isPaused = true
      this.emit('recording-paused')
    }
  }

  /**
   * Resume recording
   */
  resumeRecording(): void {
    if (!this.mediaRecorder || !this.recordingState.isRecording || !this.recordingState.isPaused) {
      return
    }

    if (this.mediaRecorder.state === 'paused') {
      this.mediaRecorder.resume()
      this.recordingState.isPaused = false
      this.emit('recording-resumed')
    }
  }

  /**
   * Get recording state
   */
  getState(): RecordingState {
    return { ...this.recordingState }
  }

  /**
   * Save recording to file
   */
  async saveRecording(blob: Blob, filename?: string): Promise<void> {
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.style.display = 'none'
    a.href = url
    a.download = filename || `recording_${Date.now()}.webm`
    document.body.appendChild(a)
    a.click()
    
    // Cleanup
    setTimeout(() => {
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    }, 100)
  }

  /**
   * Upload recording to server
   */
  async uploadRecording(blob: Blob, uploadUrl: string): Promise<Response> {
    const formData = new FormData()
    formData.append('recording', blob, `recording_${Date.now()}.webm`)
    formData.append('duration', String(this.recordingState.duration))
    formData.append('size', String(this.recordingState.size))
    formData.append('timestamp', new Date().toISOString())

    return fetch(uploadUrl, {
      method: 'POST',
      body: formData
    })
  }

  /**
   * Create a mixed stream from multiple streams
   */
  static createMixedStream(localStream: MediaStream, remoteStreams: MediaStream[]): MediaStream {
    const audioContext = new AudioContext()
    const audioDestination = audioContext.createMediaStreamDestination()
    
    // Mix audio tracks
    const audioTracks: MediaStreamAudioSourceNode[] = []
    
    // Add local audio
    if (localStream.getAudioTracks().length > 0) {
      const localAudio = audioContext.createMediaStreamSource(localStream)
      localAudio.connect(audioDestination)
      audioTracks.push(localAudio)
    }
    
    // Add remote audio tracks
    remoteStreams.forEach(remoteStream => {
      if (remoteStream.getAudioTracks().length > 0) {
        const remoteAudio = audioContext.createMediaStreamSource(remoteStream)
        remoteAudio.connect(audioDestination)
        audioTracks.push(remoteAudio)
      }
    })

    // Create a canvas for video mixing
    const canvas = document.createElement('canvas')
    canvas.width = 1280
    canvas.height = 720
    const ctx = canvas.getContext('2d')!
    
    const videos: HTMLVideoElement[] = []
    
    // Create video elements for each stream
    const allStreams = [localStream, ...remoteStreams]
    allStreams.forEach((stream, index) => {
      if (stream.getVideoTracks().length > 0) {
        const video = document.createElement('video')
        video.srcObject = stream
        video.autoplay = true
        video.playsInline = true
        video.muted = true
        videos.push(video)
      }
    })

    // Draw videos on canvas in grid layout
    const drawFrame = () => {
      ctx.fillStyle = '#000000'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      
      const videoCount = videos.length
      if (videoCount > 0) {
        const cols = Math.ceil(Math.sqrt(videoCount))
        const rows = Math.ceil(videoCount / cols)
        const cellWidth = canvas.width / cols
        const cellHeight = canvas.height / rows
        
        videos.forEach((video, index) => {
          const col = index % cols
          const row = Math.floor(index / cols)
          const x = col * cellWidth
          const y = row * cellHeight
          
          // Draw video maintaining aspect ratio
          const videoAspect = video.videoWidth / video.videoHeight
          const cellAspect = cellWidth / cellHeight
          
          let drawWidth = cellWidth
          let drawHeight = cellHeight
          let offsetX = 0
          let offsetY = 0
          
          if (videoAspect > cellAspect) {
            drawHeight = cellWidth / videoAspect
            offsetY = (cellHeight - drawHeight) / 2
          } else {
            drawWidth = cellHeight * videoAspect
            offsetX = (cellWidth - drawWidth) / 2
          }
          
          ctx.drawImage(video, x + offsetX, y + offsetY, drawWidth, drawHeight)
        })
      }
      
      requestAnimationFrame(drawFrame)
    }
    
    drawFrame()

    // Get the mixed video stream from canvas
    const videoStream = canvas.captureStream(30) // 30 fps
    
    // Combine audio and video
    const mixedStream = new MediaStream([
      ...audioDestination.stream.getAudioTracks(),
      ...videoStream.getVideoTracks()
    ])
    
    return mixedStream
  }

  /**
   * Get preferred mime type based on browser support
   */
  private getPreferredMimeType(): string {
    const types = [
      'video/webm;codecs=vp9,opus',
      'video/webm;codecs=vp8,opus',
      'video/webm',
      'video/mp4',
      'video/x-matroska;codecs=avc1,opus'
    ]

    for (const type of types) {
      if (MediaRecorder.isTypeSupported(type)) {
        return type
      }
    }

    return 'video/webm' // Default fallback
  }

  /**
   * Format duration to human readable string
   */
  static formatDuration(ms: number): string {
    const seconds = Math.floor(ms / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    
    const s = seconds % 60
    const m = minutes % 60
    const h = hours
    
    if (h > 0) {
      return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
    } else {
      return `${m}:${s.toString().padStart(2, '0')}`
    }
  }

  /**
   * Format file size to human readable string
   */
  static formatSize(bytes: number): string {
    if (bytes === 0) return '0 B'
    
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }
}