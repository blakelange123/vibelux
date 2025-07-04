'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Camera, 
  Mic, 
  Speaker, 
  Settings, 
  X,
  RefreshCw,
  Volume2,
  VolumeX
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { MediaCollaborationClient, type MediaDevice } from '@/lib/collaboration/media-collaboration-client'

interface MediaDeviceSettingsProps {
  mediaClient: MediaCollaborationClient
  isVisible: boolean
  onClose: () => void
}

export function MediaDeviceSettings({ mediaClient, isVisible, onClose }: MediaDeviceSettingsProps) {
  const [devices, setDevices] = useState<MediaDevice[]>([])
  const [selectedDevices, setSelectedDevices] = useState({
    video: '',
    audio: '',
    audioOutput: ''
  })
  const [volume, setVolume] = useState([50])
  const [testAudio, setTestAudio] = useState(false)
  const [previewVideo, setPreviewVideo] = useState(false)
  const [testStream, setTestStream] = useState<MediaStream | null>(null)

  useEffect(() => {
    if (isVisible) {
      refreshDevices()
    }
    
    return () => {
      if (testStream) {
        testStream.getTracks().forEach(track => track.stop())
      }
    }
  }, [isVisible])

  const refreshDevices = async () => {
    await mediaClient.initializeDevices()
    const availableDevices = mediaClient.getAvailableDevices()
    setDevices(availableDevices)
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

  const startVideoPreview = async () => {
    try {
      if (testStream) {
        testStream.getTracks().forEach(track => track.stop())
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          deviceId: selectedDevices.video ? { exact: selectedDevices.video } : undefined,
          width: { ideal: 640 },
          height: { ideal: 480 }
        },
        audio: false
      })

      setTestStream(stream)
      setPreviewVideo(true)
    } catch (error) {
      console.error('Failed to start video preview:', error)
    }
  }

  const stopVideoPreview = () => {
    if (testStream) {
      testStream.getTracks().forEach(track => track.stop())
      setTestStream(null)
    }
    setPreviewVideo(false)
  }

  const playTestAudio = () => {
    // Create a test tone
    const audioContext = new AudioContext()
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()
    
    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)
    
    oscillator.frequency.setValueAtTime(440, audioContext.currentTime) // A4 note
    gainNode.gain.setValueAtTime(volume[0] / 100 * 0.1, audioContext.currentTime) // Low volume
    
    setTestAudio(true)
    oscillator.start()
    
    setTimeout(() => {
      oscillator.stop()
      setTestAudio(false)
      audioContext.close()
    }, 1000)
  }

  if (!isVisible) return null

  const videoDevices = devices.filter(d => d.kind === 'videoinput')
  const audioDevices = devices.filter(d => d.kind === 'audioinput')
  const audioOutputs = devices.filter(d => d.kind === 'audiooutput')

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-xl shadow-2xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden"
      >
        <Card className="border-0">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Settings className="w-6 h-6 text-gray-600" />
                <CardTitle className="text-xl">Media Device Settings</CardTitle>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={refreshDevices}
                  className="text-gray-600"
                >
                  <RefreshCw className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="text-gray-600"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Camera Settings */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Camera className="w-5 h-5 text-gray-600" />
                <h3 className="font-medium text-gray-900">Camera</h3>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Camera Device
                  </label>
                  <Select
                    value={selectedDevices.video}
                    onValueChange={(value) => handleDeviceChange('video', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select camera" />
                    </SelectTrigger>
                    <SelectContent>
                      {videoDevices.map(device => (
                        <SelectItem key={device.deviceId} value={device.deviceId}>
                          {device.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex flex-col justify-end">
                  <Button
                    variant={previewVideo ? "destructive" : "outline"}
                    onClick={previewVideo ? stopVideoPreview : startVideoPreview}
                    disabled={!selectedDevices.video}
                    className="w-full"
                  >
                    {previewVideo ? 'Stop Preview' : 'Test Camera'}
                  </Button>
                </div>
              </div>

              {/* Video Preview */}
              {previewVideo && testStream && (
                <div className="relative bg-black rounded-lg overflow-hidden">
                  <video
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-48 object-cover"
                    ref={(video) => {
                      if (video && testStream) {
                        video.srcObject = testStream
                      }
                    }}
                  />
                </div>
              )}
            </div>

            {/* Microphone Settings */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Mic className="w-5 h-5 text-gray-600" />
                <h3 className="font-medium text-gray-900">Microphone</h3>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Microphone Device
                  </label>
                  <Select
                    value={selectedDevices.audio}
                    onValueChange={(value) => handleDeviceChange('audio', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select microphone" />
                    </SelectTrigger>
                    <SelectContent>
                      {audioDevices.map(device => (
                        <SelectItem key={device.deviceId} value={device.deviceId}>
                          {device.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex flex-col justify-end">
                  <Button
                    variant={testAudio ? "destructive" : "outline"}
                    onClick={playTestAudio}
                    disabled={testAudio || !selectedDevices.audio}
                    className="w-full"
                  >
                    {testAudio ? 'Playing...' : 'Test Microphone'}
                  </Button>
                </div>
              </div>
            </div>

            {/* Speaker Settings */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Speaker className="w-5 h-5 text-gray-600" />
                <h3 className="font-medium text-gray-900">Speakers</h3>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Speaker Device
                  </label>
                  <Select
                    value={selectedDevices.audioOutput}
                    onValueChange={(value) => handleDeviceChange('audioOutput', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select speakers" />
                    </SelectTrigger>
                    <SelectContent>
                      {audioOutputs.map(device => (
                        <SelectItem key={device.deviceId} value={device.deviceId}>
                          {device.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex flex-col justify-end">
                  <Button
                    variant={testAudio ? "destructive" : "outline"}
                    onClick={playTestAudio}
                    disabled={testAudio}
                    className="w-full"
                  >
                    {testAudio ? 'Playing...' : 'Test Speakers'}
                  </Button>
                </div>
              </div>

              {/* Volume Control */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-gray-700">
                    Volume: {volume[0]}%
                  </label>
                  <div className="flex items-center gap-2">
                    {volume[0] === 0 ? (
                      <VolumeX className="w-4 h-4 text-gray-400" />
                    ) : (
                      <Volume2 className="w-4 h-4 text-gray-400" />
                    )}
                  </div>
                </div>
                <Slider
                  value={volume}
                  onValueChange={setVolume}
                  max={100}
                  step={1}
                  className="w-full"
                />
              </div>
            </div>

            {/* Device Info */}
            <div className="pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-600">
                Found {devices.length} media devices: {videoDevices.length} cameras, {audioDevices.length} microphones, {audioOutputs.length} speakers
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}