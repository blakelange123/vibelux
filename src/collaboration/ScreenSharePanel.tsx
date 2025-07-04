'use client'

import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Monitor,
  MonitorOff,
  Maximize2,
  Minimize2,
  Volume2,
  VolumeX,
  Settings,
  Download,
  Copy,
  Share2,
  Users,
  Eye,
  MousePointer,
  Pause,
  Play,
  Square,
  Circle,
  MoreVertical,
  Pin,
  PinOff,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Hand,
  Mic,
  MicOff
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Slider } from '@/components/ui/slider'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { MediaCollaborationClient, type CallParticipant } from '@/lib/collaboration/media-collaboration-client'

interface ScreenSharePanelProps {
  mediaClient: MediaCollaborationClient
  participant?: CallParticipant
  isLocalShare?: boolean
  isVisible: boolean
  onClose: () => void
}

interface ScreenShareControlsProps {
  isSharing: boolean
  isPaused: boolean
  isAudioEnabled: boolean
  hasAnnotations: boolean
  onToggleShare: () => void
  onTogglePause: () => void
  onToggleAudio: () => void
  onToggleAnnotations: () => void
  onEndShare: () => void
}

interface AnnotationTool {
  id: string
  name: string
  icon: React.ComponentType<any>
  color: string
  cursor: string
}

function ScreenShareControls({
  isSharing,
  isPaused,
  isAudioEnabled,
  hasAnnotations,
  onToggleShare,
  onTogglePause,
  onToggleAudio,
  onToggleAnnotations,
  onEndShare
}: ScreenShareControlsProps) {
  const [showMore, setShowMore] = useState(false)

  const annotationTools: AnnotationTool[] = [
    { id: 'pointer', name: 'Pointer', icon: MousePointer, color: 'text-blue-500', cursor: 'pointer' },
    { id: 'pen', name: 'Pen', icon: Circle, color: 'text-red-500', cursor: 'crosshair' },
    { id: 'highlighter', name: 'Highlighter', icon: Square, color: 'text-yellow-500', cursor: 'crosshair' },
    { id: 'hand', name: 'Hand', icon: Hand, color: 'text-green-500', cursor: 'grab' }
  ]

  return (
    <TooltipProvider>
      <div className="flex items-center justify-center space-x-2 p-3 bg-gray-900/95 backdrop-blur-sm rounded-lg">
        {/* Primary Controls */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={isPaused ? "destructive" : "secondary"}
              size="sm"
              onClick={onTogglePause}
              className="rounded-full"
            >
              {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            {isPaused ? 'Resume sharing' : 'Pause sharing'}
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={isAudioEnabled ? "secondary" : "outline"}
              size="sm"
              onClick={onToggleAudio}
              className="rounded-full"
            >
              {isAudioEnabled ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            {isAudioEnabled ? 'Mute system audio' : 'Include system audio'}
          </TooltipContent>
        </Tooltip>

        <div className="w-px h-6 bg-gray-600" />

        {/* Annotation Tools */}
        {annotationTools.map((tool) => {
          const Icon = tool.icon
          return (
            <Tooltip key={tool.id}>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onToggleAnnotations}
                  className={`rounded-full ${tool.color}`}
                >
                  <Icon className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {tool.name}
              </TooltipContent>
            </Tooltip>
          )
        })}

        <div className="w-px h-6 bg-gray-600" />

        {/* More Options */}
        <div className="relative">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowMore(!showMore)}
            className="rounded-full"
          >
            <MoreVertical className="w-4 h-4" />
          </Button>

          <AnimatePresence>
            {showMore && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                className="absolute bottom-full right-0 mb-2 bg-white rounded-lg shadow-lg border p-2 min-w-40"
              >
                <div className="space-y-1">
                  <Button variant="ghost" size="sm" className="w-full justify-start">
                    <Download className="w-4 h-4 mr-2" />
                    Save recording
                  </Button>
                  <Button variant="ghost" size="sm" className="w-full justify-start">
                    <Copy className="w-4 h-4 mr-2" />
                    Copy share link
                  </Button>
                  <Button variant="ghost" size="sm" className="w-full justify-start">
                    <Settings className="w-4 h-4 mr-2" />
                    Settings
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="w-px h-6 bg-gray-600" />

        {/* End Share */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="destructive"
              size="sm"
              onClick={onEndShare}
              className="rounded-full"
            >
              <MonitorOff className="w-4 h-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            Stop sharing
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  )
}

export function ScreenSharePanel({ 
  mediaClient, 
  participant, 
  isLocalShare = false, 
  isVisible, 
  onClose 
}: ScreenSharePanelProps) {
  const [isMinimized, setIsMinimized] = useState(false)
  const [isPinned, setIsPinned] = useState(false)
  const [zoom, setZoom] = useState([100])
  const [volume, setVolume] = useState([50])
  const [isPaused, setIsPaused] = useState(false)
  const [hasAudio, setHasAudio] = useState(true)
  const [showAnnotations, setShowAnnotations] = useState(false)
  const [viewerCount, setViewerCount] = useState(1)
  const [quality, setQuality] = useState('high')
  const [isFullscreen, setIsFullscreen] = useState(false)

  const videoRef = useRef<HTMLVideoElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (videoRef.current && participant?.stream) {
      videoRef.current.srcObject = participant.stream
    }
  }, [participant?.stream])

  useEffect(() => {
    // Handle fullscreen events
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange)
  }, [])

  const handleToggleShare = async () => {
    if (isLocalShare) {
      try {
        if (mediaClient.getCallState()?.isScreenSharing) {
          await mediaClient.stopScreenShare()
        } else {
          await mediaClient.startScreenShare()
        }
      } catch (error) {
        console.error('Failed to toggle screen share:', error)
      }
    }
  }

  const handleTogglePause = () => {
    setIsPaused(!isPaused)
    if (videoRef.current) {
      if (isPaused) {
        videoRef.current.play()
      } else {
        videoRef.current.pause()
      }
    }
  }

  const handleToggleAudio = () => {
    setHasAudio(!hasAudio)
    if (videoRef.current) {
      videoRef.current.muted = hasAudio
    }
  }

  const handleToggleAnnotations = () => {
    setShowAnnotations(!showAnnotations)
  }

  const handleEndShare = () => {
    if (isLocalShare) {
      mediaClient.stopScreenShare()
    }
    onClose()
  }

  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement && containerRef.current) {
      containerRef.current.requestFullscreen()
    } else if (document.fullscreenElement) {
      document.exitFullscreen()
    }
  }

  const handleZoomChange = (newZoom: number[]) => {
    setZoom(newZoom)
    if (videoRef.current) {
      const scale = newZoom[0] / 100
      videoRef.current.style.transform = `scale(${scale})`
    }
  }

  if (!isVisible) return null

  return (
    <motion.div
      ref={containerRef}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={`fixed bg-black rounded-xl shadow-2xl z-50 flex flex-col overflow-hidden ${
        isMinimized 
          ? 'bottom-4 right-20 w-80 h-48' 
          : isFullscreen 
          ? 'inset-0 rounded-none'
          : isPinned 
          ? 'top-4 right-4 w-96 h-64'
          : 'inset-8'
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-gray-900/95 backdrop-blur-sm border-b border-gray-700">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <Monitor className="w-5 h-5 text-blue-500" />
            <span className="text-white font-medium">
              {isLocalShare ? 'Your Screen' : `${participant?.user.name}'s Screen`}
            </span>
          </div>
          
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="text-green-500 border-green-500">
              <Circle className="w-2 h-2 mr-1 fill-current animate-pulse" />
              Live
            </Badge>
            
            <Badge variant="outline" className="text-gray-400 border-gray-600">
              <Eye className="w-3 h-3 mr-1" />
              {viewerCount} viewing
            </Badge>

            <Badge variant="outline" className="text-blue-400 border-blue-600">
              {quality.toUpperCase()}
            </Badge>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {!isFullscreen && (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsPinned(!isPinned)}
                className="text-gray-400 hover:text-white"
              >
                {isPinned ? <PinOff className="w-4 h-4" /> : <Pin className="w-4 h-4" />}
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMinimized(!isMinimized)}
                className="text-gray-400 hover:text-white"
              >
                {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
              </Button>
            </>
          )}
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleToggleFullscreen}
            className="text-gray-400 hover:text-white"
          >
            <Maximize2 className="w-4 h-4" />
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
          {/* Video Content */}
          <div className="flex-1 relative bg-black overflow-hidden">
            {participant?.stream ? (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full h-full object-contain"
                style={{ 
                  transform: `scale(${zoom[0] / 100})`,
                  transformOrigin: 'center center'
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-800">
                <div className="text-center text-gray-400">
                  <Monitor className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-medium mb-2">No screen shared</h3>
                  <p className="text-sm">
                    {isLocalShare 
                      ? 'Click the screen share button to start sharing'
                      : 'Waiting for screen share to start...'
                    }
                  </p>
                </div>
              </div>
            )}

            {/* Annotation Canvas */}
            {showAnnotations && (
              <canvas
                ref={canvasRef}
                className="absolute inset-0 w-full h-full pointer-events-auto cursor-crosshair"
                style={{ zIndex: 10 }}
              />
            )}

            {/* Zoom Controls */}
            {!isFullscreen && (
              <div className="absolute top-4 right-4 bg-black/50 rounded-lg p-2 flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleZoomChange([Math.max(25, zoom[0] - 25)])}
                  disabled={zoom[0] <= 25}
                  className="text-white hover:bg-white/20"
                >
                  <ZoomOut className="w-4 h-4" />
                </Button>
                
                <span className="text-white text-sm min-w-12 text-center">
                  {zoom[0]}%
                </span>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleZoomChange([Math.min(200, zoom[0] + 25)])}
                  disabled={zoom[0] >= 200}
                  className="text-white hover:bg-white/20"
                >
                  <ZoomIn className="w-4 h-4" />
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleZoomChange([100])}
                  className="text-white hover:bg-white/20"
                >
                  <RotateCcw className="w-4 h-4" />
                </Button>
              </div>
            )}

            {/* Volume Control */}
            {hasAudio && !isFullscreen && (
              <div className="absolute bottom-4 right-4 bg-black/50 rounded-lg p-3 flex items-center space-x-2 min-w-32">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setVolume([volume[0] > 0 ? 0 : 50])}
                  className="text-white hover:bg-white/20 p-1"
                >
                  {volume[0] > 0 ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                </Button>
                
                <Slider
                  value={volume}
                  onValueChange={setVolume}
                  max={100}
                  step={1}
                  className="flex-1"
                />
              </div>
            )}
          </div>

          {/* Settings Panel */}
          {!isFullscreen && (
            <div className="p-4 bg-gray-900/95 backdrop-blur-sm border-t border-gray-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-400">Quality:</span>
                    <Select value={quality} onValueChange={setQuality}>
                      <SelectTrigger className="w-24 h-8 bg-gray-800 border-gray-600 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="ultra">Ultra</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-400">Zoom:</span>
                    <Slider
                      value={zoom}
                      onValueChange={handleZoomChange}
                      min={25}
                      max={200}
                      step={25}
                      className="w-24"
                    />
                    <span className="text-sm text-gray-400 min-w-12">{zoom[0]}%</span>
                  </div>
                </div>

                {/* Controls */}
                {isLocalShare && (
                  <ScreenShareControls
                    isSharing={mediaClient.getCallState()?.isScreenSharing || false}
                    isPaused={isPaused}
                    isAudioEnabled={hasAudio}
                    hasAnnotations={showAnnotations}
                    onToggleShare={handleToggleShare}
                    onTogglePause={handleTogglePause}
                    onToggleAudio={handleToggleAudio}
                    onToggleAnnotations={handleToggleAnnotations}
                    onEndShare={handleEndShare}
                  />
                )}
              </div>
            </div>
          )}
        </>
      )}

      {/* Minimized State */}
      {isMinimized && (
        <div className="flex-1 relative">
          {participant?.stream ? (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-800">
              <Monitor className="w-8 h-8 text-gray-400" />
            </div>
          )}
          
          <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
            <Button
              variant="ghost"
              onClick={() => setIsMinimized(false)}
              className="text-white hover:bg-white/20"
            >
              <Maximize2 className="w-6 h-6" />
            </Button>
          </div>
        </div>
      )}
    </motion.div>
  )
}