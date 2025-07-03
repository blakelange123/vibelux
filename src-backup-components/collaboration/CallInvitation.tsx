'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Phone, 
  PhoneOff, 
  Video, 
  VideoOff,
  Users, 
  Clock,
  Mic,
  MicOff,
  User
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { type User as CollabUser } from '@/lib/collaboration/collaboration-client'

interface CallInvitationProps {
  callId: string
  from: CollabUser
  participants: CollabUser[]
  onAccept: (withVideo?: boolean) => void
  onDecline: () => void
  onClose: () => void
  isVisible: boolean
}

interface IncomingCallNotificationProps {
  from: CollabUser
  onAccept: (withVideo?: boolean) => void
  onDecline: () => void
  duration: number
}

function IncomingCallNotification({ from, onAccept, onDecline, duration }: IncomingCallNotificationProps) {
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <motion.div
      initial={{ x: 400, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 400, opacity: 0 }}
      className="fixed top-4 right-4 z-50"
    >
      <Card className="w-80 bg-gradient-to-r from-blue-600 to-purple-600 border-0 text-white shadow-2xl">
        <CardContent className="p-4">
          <div className="flex items-center space-x-3 mb-4">
            <div className="relative">
              <Avatar className="w-12 h-12 border-2 border-white">
                <AvatarImage src={from.avatar} alt={from.name} />
                <AvatarFallback className="bg-white/20 text-white">
                  {from.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full animate-pulse" />
            </div>
            
            <div className="flex-1">
              <h3 className="font-semibold text-lg">{from.name}</h3>
              <p className="text-blue-100 text-sm">Incoming call...</p>
            </div>
            
            <div className="text-right">
              <div className="text-sm opacity-75">{formatDuration(duration)}</div>
              <div className="flex items-center text-xs opacity-75">
                <Video className="w-3 h-3 mr-1" />
                Video call
              </div>
            </div>
          </div>
          
          <div className="flex space-x-2">
            <Button
              onClick={() => onAccept(false)}
              variant="secondary"
              className="flex-1 bg-white/20 hover:bg-white/30 text-white border-white/30"
            >
              <Phone className="w-4 h-4 mr-2" />
              Audio
            </Button>
            
            <Button
              onClick={() => onAccept(true)}
              variant="secondary"
              className="flex-1 bg-green-500 hover:bg-green-600 text-white border-0"
            >
              <Video className="w-4 h-4 mr-2" />
              Video
            </Button>
            
            <Button
              onClick={onDecline}
              variant="secondary"
              className="bg-red-500 hover:bg-red-600 text-white border-0"
            >
              <PhoneOff className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

export function CallInvitation({ 
  callId, 
  from, 
  participants, 
  onAccept, 
  onDecline, 
  onClose,
  isVisible 
}: CallInvitationProps) {
  const [duration, setDuration] = useState(0)
  const [showFullInvitation, setShowFullInvitation] = useState(false)

  useEffect(() => {
    if (!isVisible) return

    const interval = setInterval(() => {
      setDuration(prev => prev + 1)
    }, 1000)

    // Auto-decline after 30 seconds
    const autoDeclineTimer = setTimeout(() => {
      onDecline()
    }, 30000)

    return () => {
      clearInterval(interval)
      clearTimeout(autoDeclineTimer)
    }
  }, [isVisible, onDecline])

  const handleAccept = (withVideo: boolean = false) => {
    onAccept(withVideo)
  }

  const handleDecline = () => {
    onDecline()
  }

  if (!isVisible) return null

  // Show minimal notification for single caller
  if (participants.length <= 2) {
    return (
      <IncomingCallNotification
        from={from}
        onAccept={handleAccept}
        onDecline={handleDecline}
        duration={duration}
      />
    )
  }

  // Show full invitation modal for group calls
  return (
    <AnimatePresence>
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
          className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 text-center">
            <div className="w-20 h-20 mx-auto mb-4 relative">
              <Avatar className="w-20 h-20 border-4 border-white">
                <AvatarImage src={from.avatar} alt={from.name} />
                <AvatarFallback className="bg-white/20 text-white text-2xl">
                  {from.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-2 -right-2 bg-green-500 rounded-full p-2 animate-pulse">
                <Video className="w-4 h-4 text-white" />
              </div>
            </div>
            
            <h2 className="text-2xl font-bold mb-1">{from.name}</h2>
            <p className="text-blue-100">is inviting you to join a video call</p>
            
            <div className="flex items-center justify-center mt-4 space-x-4 text-sm">
              <div className="flex items-center">
                <Users className="w-4 h-4 mr-1" />
                {participants.length} participants
              </div>
              <div className="flex items-center">
                <Clock className="w-4 h-4 mr-1" />
                {Math.floor(duration / 60)}:{(duration % 60).toString().padStart(2, '0')}
              </div>
            </div>
          </div>

          {/* Participants */}
          <div className="p-6">
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3 text-gray-900">Participants</h3>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {participants.map((participant) => (
                  <div key={participant.id} className="flex items-center space-x-3">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={participant.avatar} alt={participant.name} />
                      <AvatarFallback className="text-xs">
                        {participant.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{participant.name}</p>
                      <p className="text-xs text-gray-500">{participant.email}</p>
                    </div>
                    {participant.id === from.id && (
                      <Badge variant="outline" className="text-xs">
                        Host
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Call Actions */}
            <div className="space-y-3">
              <div className="flex space-x-3">
                <Button
                  onClick={() => handleAccept(false)}
                  variant="outline"
                  className="flex-1"
                >
                  <Mic className="w-4 h-4 mr-2" />
                  Join with Audio
                </Button>
                
                <Button
                  onClick={() => handleAccept(true)}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  <Video className="w-4 h-4 mr-2" />
                  Join with Video
                </Button>
              </div>
              
              <Button
                onClick={handleDecline}
                variant="outline"
                className="w-full text-red-600 border-red-200 hover:bg-red-50"
              >
                <PhoneOff className="w-4 h-4 mr-2" />
                Decline
              </Button>
            </div>

            <p className="text-center text-xs text-gray-500 mt-4">
              Call will automatically decline in {30 - duration} seconds
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

// Quick action component for starting calls
interface QuickCallActionsProps {
  participants: CollabUser[]
  onStartCall: (withVideo: boolean, participants: string[]) => void
  disabled?: boolean
}

export function QuickCallActions({ participants, onStartCall, disabled = false }: QuickCallActionsProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  if (participants.length === 0) return null

  return (
    <div className="relative">
      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onStartCall(false, participants.map(p => p.id))}
          disabled={disabled}
          className="flex items-center space-x-1"
        >
          <Phone className="w-4 h-4" />
          <span className="hidden sm:inline">Audio</span>
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => onStartCall(true, participants.map(p => p.id))}
          disabled={disabled}
          className="flex items-center space-x-1"
        >
          <Video className="w-4 h-4" />
          <span className="hidden sm:inline">Video</span>
        </Button>

        {participants.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-gray-500"
          >
            <Users className="w-4 h-4" />
            <span className="ml-1 text-xs">{participants.length}</span>
          </Button>
        )}
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 mt-2 bg-white rounded-lg shadow-lg border p-3 z-10 min-w-48"
          >
            <div className="text-sm font-medium text-gray-900 mb-2">
              Call with:
            </div>
            <div className="space-y-1">
              {participants.slice(0, 5).map((participant) => (
                <div key={participant.id} className="flex items-center space-x-2">
                  <Avatar className="w-6 h-6">
                    <AvatarImage src={participant.avatar} alt={participant.name} />
                    <AvatarFallback className="text-xs">
                      {participant.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm text-gray-700">{participant.name}</span>
                </div>
              ))}
              {participants.length > 5 && (
                <div className="text-xs text-gray-500 text-center pt-1">
                  +{participants.length - 5} more
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}