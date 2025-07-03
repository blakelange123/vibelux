'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Circle,
  Square,
  Pause,
  Play,
  Download,
  Upload,
  AlertCircle,
  Loader2,
  Check,
  X
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { CallRecorder, type RecordingState } from '@/lib/collaboration/call-recorder'
import { MediaCollaborationClient } from '@/lib/collaboration/media-collaboration-client'

interface CallRecordingControlsProps {
  mediaClient: MediaCollaborationClient
  localStream: MediaStream | null
  remoteStreams: MediaStream[]
  isVisible: boolean
  onClose?: () => void
}

export function CallRecordingControls({ 
  mediaClient, 
  localStream, 
  remoteStreams,
  isVisible,
  onClose 
}: CallRecordingControlsProps) {
  const [recorder] = useState(() => new CallRecorder())
  const [recordingState, setRecordingState] = useState<RecordingState>({
    isRecording: false,
    isPaused: false,
    duration: 0,
    size: 0,
    startTime: null
  })
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [lastRecording, setLastRecording] = useState<Blob | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    // Set up event listeners
    const handleRecordingStarted = () => {
      setError(null)
      setSuccess(null)
    }

    const handleRecordingStopped = ({ blob, duration, size, mimeType }: any) => {
      setLastRecording(blob)
      setSuccess('Recording saved successfully')
    }

    const handleDurationUpdate = ({ duration }: any) => {
      setRecordingState(prev => ({ ...prev, duration }))
    }

    const handleDataAvailable = ({ totalSize }: any) => {
      setRecordingState(prev => ({ ...prev, size: totalSize }))
    }

    const handleError = (error: any) => {
      setError(error.message || 'Recording error occurred')
      setRecordingState(recorder.getState())
    }

    recorder.on('recording-started', handleRecordingStarted)
    recorder.on('recording-stopped', handleRecordingStopped)
    recorder.on('duration-update', handleDurationUpdate)
    recorder.on('data-available', handleDataAvailable)
    recorder.on('error', handleError)

    return () => {
      recorder.removeAllListeners()
    }
  }, [recorder])

  const startRecording = async () => {
    if (!localStream && remoteStreams.length === 0) {
      setError('No streams available to record')
      return
    }

    try {
      setError(null)
      // Create mixed stream if we have multiple streams
      let streamToRecord: MediaStream
      
      if (remoteStreams.length > 0) {
        // Mix local and remote streams
        streamToRecord = CallRecorder.createMixedStream(
          localStream || new MediaStream(),
          remoteStreams
        )
      } else if (localStream) {
        // Only local stream
        streamToRecord = localStream
      } else {
        // Only remote streams
        streamToRecord = remoteStreams[0]
      }

      await recorder.startRecording(streamToRecord)
      setRecordingState(recorder.getState())
    } catch (error: any) {
      setError(error.message || 'Failed to start recording')
    }
  }

  const stopRecording = async () => {
    try {
      const blob = await recorder.stopRecording()
      setRecordingState(recorder.getState())
    } catch (error: any) {
      setError(error.message || 'Failed to stop recording')
    }
  }

  const pauseRecording = () => {
    recorder.pauseRecording()
    setRecordingState(recorder.getState())
  }

  const resumeRecording = () => {
    recorder.resumeRecording()
    setRecordingState(recorder.getState())
  }

  const downloadRecording = async () => {
    if (!lastRecording) return
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5)
    const filename = `vibelux_call_recording_${timestamp}.webm`
    await recorder.saveRecording(lastRecording, filename)
  }

  const uploadRecording = async () => {
    if (!lastRecording) return
    
    setIsUploading(true)
    setUploadProgress(0)
    setError(null)
    
    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90))
      }, 200)

      const response = await recorder.uploadRecording(lastRecording, '/api/recordings/upload')
      
      clearInterval(progressInterval)
      setUploadProgress(100)
      
      if (response.ok) {
        setSuccess('Recording uploaded successfully')
        setTimeout(() => {
          setIsUploading(false)
          setUploadProgress(0)
        }, 1000)
      } else {
        throw new Error('Upload failed')
      }
    } catch (error: any) {
      setError(error.message || 'Failed to upload recording')
      setIsUploading(false)
      setUploadProgress(0)
    }
  }

  useEffect(() => {
    // Auto-clear messages after 5 seconds
    if (error || success) {
      const timer = setTimeout(() => {
        setError(null)
        setSuccess(null)
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [error, success])

  if (!isVisible) return null

  return (
    <div className="fixed bottom-20 left-4 z-40">
      <Card className="bg-gray-900 border-gray-700 text-white w-80">
        <CardContent className="p-4">
          {/* Recording Status */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              {recordingState.isRecording && (
                <div className={`w-3 h-3 rounded-full animate-pulse ${
                  recordingState.isPaused ? 'bg-yellow-500' : 'bg-red-500'
                }`} />
              )}
              <span className="text-sm font-medium">
                {recordingState.isRecording 
                  ? (recordingState.isPaused ? 'Recording Paused' : 'Recording')
                  : 'Ready to Record'
                }
              </span>
            </div>
            {onClose && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="text-gray-400 hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>

          {/* Recording Info */}
          {recordingState.isRecording && (
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Duration:</span>
                <span>{CallRecorder.formatDuration(recordingState.duration)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Size:</span>
                <span>{CallRecorder.formatSize(recordingState.size)}</span>
              </div>
            </div>
          )}

          {/* Recording Controls */}
          <div className="flex gap-2 mb-4">
            {!recordingState.isRecording ? (
              <Button
                onClick={startRecording}
                variant="destructive"
                className="flex-1"
                disabled={!localStream && remoteStreams.length === 0}
              >
                <Circle className="w-4 h-4 mr-2" />
                Start Recording
              </Button>
            ) : (
              <>
                <Button
                  onClick={recordingState.isPaused ? resumeRecording : pauseRecording}
                  variant="secondary"
                  className="flex-1"
                >
                  {recordingState.isPaused ? (
                    <><Play className="w-4 h-4 mr-2" /> Resume</>
                  ) : (
                    <><Pause className="w-4 h-4 mr-2" /> Pause</>
                  )}
                </Button>
                <Button
                  onClick={stopRecording}
                  variant="destructive"
                  className="flex-1"
                >
                  <Square className="w-4 h-4 mr-2" />
                  Stop
                </Button>
              </>
            )}
          </div>

          {/* Last Recording Actions */}
          {lastRecording && !recordingState.isRecording && (
            <div className="space-y-2">
              <div className="text-sm text-gray-400 mb-2">Last Recording</div>
              <div className="flex gap-2">
                <Button
                  onClick={downloadRecording}
                  variant="outline"
                  size="sm"
                  className="flex-1 bg-gray-800 border-gray-600 hover:bg-gray-700"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
                <Button
                  onClick={uploadRecording}
                  variant="outline"
                  size="sm"
                  className="flex-1 bg-gray-800 border-gray-600 hover:bg-gray-700"
                  disabled={isUploading}
                >
                  {isUploading ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Uploading</>
                  ) : (
                    <><Upload className="w-4 h-4 mr-2" /> Upload</>
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* Upload Progress */}
          {isUploading && (
            <div className="mt-3">
              <Progress value={uploadProgress} className="h-2" />
              <p className="text-xs text-gray-400 mt-1 text-center">
                {uploadProgress}% uploaded
              </p>
            </div>
          )}

          {/* Status Messages */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mt-3 p-2 bg-red-500/20 border border-red-500/30 rounded flex items-center gap-2"
              >
                <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                <span className="text-xs text-red-400">{error}</span>
              </motion.div>
            )}
            
            {success && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mt-3 p-2 bg-green-500/20 border border-green-500/30 rounded flex items-center gap-2"
              >
                <Check className="w-4 h-4 text-green-400 flex-shrink-0" />
                <span className="text-xs text-green-400">{success}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Privacy Notice */}
          <div className="mt-4 pt-3 border-t border-gray-700">
            <p className="text-xs text-gray-500">
              Recording calls requires consent from all participants. Please ensure you have permission before recording.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}