'use client'

import React, { useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { type Presence } from '@/lib/collaboration/collaboration-client'

interface CollaborativeCursorsProps {
  cursors: Map<string, { x: number; y: number }>
  users: Presence[]
  containerRef?: React.RefObject<HTMLElement>
}

export function CollaborativeCursors({ 
  cursors, 
  users, 
  containerRef 
}: CollaborativeCursorsProps) {
  const cursorRefs = useRef<Map<string, HTMLDivElement>>(new Map())

  // Clean up refs for disconnected users
  useEffect(() => {
    const activeUserIds = new Set(users.map(u => u.user.id))
    
    cursorRefs.current.forEach((_, userId) => {
      if (!activeUserIds.has(userId)) {
        cursorRefs.current.delete(userId)
      }
    })
  }, [users])

  return (
    <AnimatePresence>
      {Array.from(cursors.entries()).map(([userId, position]) => {
        const user = users.find(u => u.user.id === userId)
        if (!user) return null

        return (
          <motion.div
            key={userId}
            ref={(el) => {
              if (el) cursorRefs.current.set(userId, el)
            }}
            className="pointer-events-none fixed z-50"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ 
              opacity: 1, 
              scale: 1,
              x: position.x,
              y: position.y
            }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ 
              type: "spring", 
              damping: 30, 
              stiffness: 200 
            }}
          >
            {/* Cursor */}
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              className="relative"
            >
              <path
                d="M5.5 3.5L20.5 12L12 12L12 20.5L5.5 3.5Z"
                fill={user.user.color}
                stroke="white"
                strokeWidth="2"
                strokeLinejoin="round"
              />
            </svg>
            
            {/* User label */}
            <div
              className="absolute top-5 left-5 px-2 py-1 rounded-md text-xs font-medium text-white whitespace-nowrap"
              style={{ backgroundColor: user.user.color }}
            >
              {user.user.name}
            </div>
          </motion.div>
        )
      })}
    </AnimatePresence>
  )
}

// Collaborative Selection Highlights
interface CollaborativeSelectionsProps {
  selections: Map<string, { elementId: string; start: number; end: number }>
  users: Presence[]
}

export function CollaborativeSelections({ 
  selections, 
  users 
}: CollaborativeSelectionsProps) {
  useEffect(() => {
    // Apply selection styles to elements
    selections.forEach((selection, userId) => {
      const user = users.find(u => u.user.id === userId)
      if (!user) return

      const element = document.getElementById(selection.elementId)
      if (!element || !element.textContent) return

      const text = element.textContent
      const before = text.substring(0, selection.start)
      const selected = text.substring(selection.start, selection.end)
      const after = text.substring(selection.end)

      // Create highlighted version
      const highlightedHTML = `
        ${before}
        <span 
          class="collaborative-selection" 
          style="background-color: ${user.user.color}33; border-bottom: 2px solid ${user.user.color};"
          data-user="${user.user.name}"
        >
          ${selected}
        </span>
        ${after}
      `

      element.innerHTML = highlightedHTML
    })

    // Cleanup
    return () => {
      document.querySelectorAll('.collaborative-selection').forEach(el => {
        const parent = el.parentElement
        if (parent) {
          parent.innerHTML = parent.textContent || ''
        }
      })
    }
  }, [selections, users])

  return null
}

// Presence Avatars
interface PresenceAvatarsProps {
  users: Presence[]
  maxDisplay?: number
}

export function PresenceAvatars({ users, maxDisplay = 5 }: PresenceAvatarsProps) {
  const displayUsers = users.slice(0, maxDisplay)
  const remainingCount = Math.max(0, users.length - maxDisplay)

  return (
    <div className="flex items-center -space-x-2">
      <AnimatePresence mode="popLayout">
        {displayUsers.map((presence) => (
          <motion.div
            key={presence.user.id}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            className="relative"
            title={presence.user.name}
          >
            <div
              className="w-8 h-8 rounded-full border-2 border-gray-800 flex items-center justify-center text-xs font-medium text-white overflow-hidden"
              style={{ backgroundColor: presence.user.color }}
            >
              {presence.user.avatar ? (
                <img 
                  src={presence.user.avatar} 
                  alt={presence.user.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                presence.user.name.charAt(0).toUpperCase()
              )}
            </div>
            
            {/* Status indicator */}
            <div 
              className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-gray-800 ${
                presence.status === 'active' ? 'bg-green-500' :
                presence.status === 'idle' ? 'bg-yellow-500' :
                'bg-gray-500'
              }`}
            />
          </motion.div>
        ))}
      </AnimatePresence>
      
      {remainingCount > 0 && (
        <div className="w-8 h-8 rounded-full bg-gray-700 border-2 border-gray-800 flex items-center justify-center text-xs font-medium text-gray-300">
          +{remainingCount}
        </div>
      )}
    </div>
  )
}

// Activity Indicator
interface ActivityIndicatorProps {
  user: Presence
  activity: string
}

export function ActivityIndicator({ user, activity }: ActivityIndicatorProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="flex items-center gap-2 px-3 py-2 bg-gray-800 rounded-lg shadow-lg"
    >
      <div
        className="w-2 h-2 rounded-full animate-pulse"
        style={{ backgroundColor: user.user.color }}
      />
      <span className="text-sm text-gray-300">
        <span style={{ color: user.user.color }} className="font-medium">
          {user.user.name}
        </span>
        {' '}
        {activity}
      </span>
    </motion.div>
  )
}