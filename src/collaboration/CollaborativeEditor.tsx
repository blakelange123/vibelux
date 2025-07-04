'use client'

import React, { useRef, useEffect, useState, useCallback } from 'react'
import { useCollaboration } from '@/hooks/useCollaboration'
import { CollaborativeCursors, CollaborativeSelections, PresenceAvatars } from './CollaborativeCursors'
import { CollaborativeComments, CommentButton } from './CollaborativeComments'
import { type Comment } from '@/lib/collaboration/collaboration-client'
import { OperationalTransform } from '@/lib/collaboration/collaboration-client'
import { 
  Users, 
  MessageCircle, 
  MousePointer, 
  Edit3,
  Save,
  Undo,
  Redo
} from 'lucide-react'

interface CollaborativeEditorProps {
  projectId: string
  initialContent?: string
  onChange?: (content: string) => void
  readOnly?: boolean
  showPresence?: boolean
  showComments?: boolean
  className?: string
}

export function CollaborativeEditor({
  projectId,
  initialContent = '',
  onChange,
  readOnly = false,
  showPresence = true,
  showComments = true,
  className = ''
}: CollaborativeEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null)
  const [content, setContent] = useState(initialContent)
  const [showCommentButton, setShowCommentButton] = useState(false)
  const [commentButtonPos, setCommentButtonPos] = useState({ x: 0, y: 0 })
  const [history, setHistory] = useState<string[]>([initialContent])
  const [historyIndex, setHistoryIndex] = useState(0)
  const [isSaving, setIsSaving] = useState(false)
  
  const {
    isConnected,
    activeUsers,
    cursors,
    selections,
    comments,
    sendCursor,
    sendSelection,
    sendEdit,
    sendComment,
    updatePresence
  } = useCollaboration({
    projectId,
    onEdit: (event) => {
      // Apply remote edits using operational transform
      const transformedOp = OperationalTransform.apply(content, event.data)
      setContent(transformedOp)
      onChange?.(transformedOp)
    },
    onSync: (data) => {
      // Handle full document sync
      setContent(data.content)
      onChange?.(data.content)
    }
  })

  // Track cursor movements
  useEffect(() => {
    if (!editorRef.current || readOnly) return

    const handleMouseMove = (e: MouseEvent) => {
      const rect = editorRef.current!.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      sendCursor(x, y)
    }

    const handleMouseLeave = () => {
      sendCursor(-100, -100) // Hide cursor when leaving
    }

    editorRef.current.addEventListener('mousemove', handleMouseMove)
    editorRef.current.addEventListener('mouseleave', handleMouseLeave)

    return () => {
      if (editorRef.current) {
        editorRef.current.removeEventListener('mousemove', handleMouseMove)
        editorRef.current.removeEventListener('mouseleave', handleMouseLeave)
      }
    }
  }, [sendCursor, readOnly])

  // Track text selection
  useEffect(() => {
    if (!editorRef.current || readOnly) return

    const handleSelection = () => {
      const selection = window.getSelection()
      if (!selection || selection.rangeCount === 0) return

      const range = selection.getRangeAt(0)
      if (range.collapsed) {
        setShowCommentButton(false)
        return
      }

      // Calculate selection positions
      const elementId = editorRef.current!.id || 'editor'
      const start = range.startOffset
      const end = range.endOffset

      sendSelection(elementId, start, end)

      // Show comment button at selection
      const rect = range.getBoundingClientRect()
      setCommentButtonPos({
        x: rect.right + 10,
        y: rect.top
      })
      setShowCommentButton(true)
    }

    document.addEventListener('selectionchange', handleSelection)

    return () => {
      document.removeEventListener('selectionchange', handleSelection)
    }
  }, [sendSelection, readOnly])

  // Handle local edits
  const handleInput = useCallback((e: React.FormEvent<HTMLDivElement>) => {
    const newContent = e.currentTarget.textContent || ''
    
    // Create edit operation
    const operation = {
      type: 'replace',
      position: 0,
      oldText: content,
      newText: newContent
    }

    // Send edit to other users
    sendEdit(operation)

    // Update local state
    setContent(newContent)
    onChange?.(newContent)

    // Update history
    const newHistory = history.slice(0, historyIndex + 1)
    newHistory.push(newContent)
    setHistory(newHistory)
    setHistoryIndex(newHistory.length - 1)
  }, [content, sendEdit, onChange, history, historyIndex])

  // Handle undo/redo
  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1
      const newContent = history[newIndex]
      setContent(newContent)
      setHistoryIndex(newIndex)
      onChange?.(newContent)
      
      // Send edit to sync with others
      sendEdit({
        type: 'replace',
        position: 0,
        oldText: content,
        newText: newContent
      })
    }
  }, [historyIndex, history, content, onChange, sendEdit])

  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1
      const newContent = history[newIndex]
      setContent(newContent)
      setHistoryIndex(newIndex)
      onChange?.(newContent)
      
      // Send edit to sync with others
      sendEdit({
        type: 'replace',
        position: 0,
        oldText: content,
        newText: newContent
      })
    }
  }, [historyIndex, history, content, onChange, sendEdit])

  // Handle adding comments
  const handleAddComment = useCallback((text: string) => {
    const selection = window.getSelection()
    if (!selection || selection.rangeCount === 0) return

    const range = selection.getRangeAt(0)
    const rect = range.getBoundingClientRect()

    sendComment({
      text,
      position: { x: rect.x, y: rect.y },
      elementId: editorRef.current?.id || 'editor',
      resolved: false
    })

    setShowCommentButton(false)
  }, [sendComment])

  // Auto-save indicator
  useEffect(() => {
    if (!onChange) return

    const saveTimer = setTimeout(() => {
      setIsSaving(true)
      setTimeout(() => setIsSaving(false), 1000)
    }, 2000)

    return () => clearTimeout(saveTimer)
  }, [content, onChange])

  return (
    <div className={`relative ${className}`}>
      {/* Toolbar */}
      <div className="bg-gray-800 border-b border-gray-700 rounded-t-lg px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Connection Status */}
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className="text-xs text-gray-400">
              {isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>

          {/* Presence Avatars */}
          {showPresence && activeUsers.length > 0 && (
            <div className="flex items-center gap-2 pl-4 border-l border-gray-700">
              <Users className="w-4 h-4 text-gray-400" />
              <PresenceAvatars users={activeUsers} />
            </div>
          )}

          {/* Stats */}
          <div className="flex items-center gap-4 text-xs text-gray-400 pl-4 border-l border-gray-700">
            <span className="flex items-center gap-1">
              <MousePointer className="w-3 h-3" />
              {cursors.size} cursors
            </span>
            <span className="flex items-center gap-1">
              <MessageCircle className="w-3 h-3" />
              {comments.filter(c => !c.resolved).length} comments
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {!readOnly && (
            <>
              <button
                onClick={handleUndo}
                disabled={historyIndex === 0}
                className="p-1.5 text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title="Undo"
              >
                <Undo className="w-4 h-4" />
              </button>
              <button
                onClick={handleRedo}
                disabled={historyIndex === history.length - 1}
                className="p-1.5 text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title="Redo"
              >
                <Redo className="w-4 h-4" />
              </button>
            </>
          )}
          
          {isSaving && (
            <div className="flex items-center gap-1 text-xs text-green-400">
              <Save className="w-3 h-3" />
              Saved
            </div>
          )}
        </div>
      </div>

      {/* Editor */}
      <div className="relative bg-gray-900 rounded-b-lg">
        <div
          ref={editorRef}
          id={`editor-${projectId}`}
          contentEditable={!readOnly}
          onInput={handleInput}
          className="min-h-[400px] p-6 text-gray-300 focus:outline-none"
          suppressContentEditableWarning
        >
          {content}
        </div>

        {/* Collaborative Cursors */}
        <CollaborativeCursors 
          cursors={cursors} 
          users={activeUsers}
          containerRef={editorRef}
        />

        {/* Collaborative Selections */}
        <CollaborativeSelections
          selections={selections}
          users={activeUsers}
        />

        {/* Comment Button */}
        {showCommentButton && !readOnly && (
          <CommentButton
            position={commentButtonPos}
            onClick={() => {
              const text = window.prompt('Add a comment:')
              if (text) handleAddComment(text)
            }}
          />
        )}
      </div>

      {/* Comments Panel */}
      {showComments && (
        <CollaborativeComments
          comments={comments}
          currentUser={activeUsers.find(u => u.user.id === projectId)?.user || {
            id: 'default',
            name: 'You',
            email: '',
            color: '#6366f1'
          }}
          onAddComment={(comment) => sendComment(comment)}
          onUpdateComment={(id, updates) => {
            // Handle comment updates
            sendEdit({
              type: 'comment-update',
              commentId: id,
              updates
            })
          }}
          onDeleteComment={(id) => {
            // Handle comment deletion
            sendEdit({
              type: 'comment-delete',
              commentId: id
            })
          }}
        />
      )}
    </div>
  )
}