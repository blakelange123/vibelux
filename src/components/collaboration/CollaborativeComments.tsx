'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  MessageCircle, 
  X, 
  Send, 
  Check, 
  Reply,
  MoreVertical,
  Edit2,
  Trash2 
} from 'lucide-react'
import { type Comment, type User } from '@/lib/collaboration/collaboration-client'
import { formatDistanceToNow } from 'date-fns'

interface CollaborativeCommentsProps {
  comments: Comment[]
  currentUser: User
  onAddComment: (comment: Partial<Comment>) => void
  onUpdateComment?: (commentId: string, updates: Partial<Comment>) => void
  onDeleteComment?: (commentId: string) => void
}

export function CollaborativeComments({
  comments,
  currentUser,
  onAddComment,
  onUpdateComment,
  onDeleteComment
}: CollaborativeCommentsProps) {
  const [showComments, setShowComments] = useState(true)
  const activeComments = comments.filter(c => !c.resolved)
  const resolvedComments = comments.filter(c => c.resolved)

  return (
    <div className="fixed right-4 top-20 w-80 max-h-[calc(100vh-6rem)] bg-gray-900 rounded-lg shadow-xl border border-gray-800 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-800">
        <div className="flex items-center gap-2">
          <MessageCircle className="w-5 h-5 text-purple-400" />
          <h3 className="font-medium text-white">Comments</h3>
          {activeComments.length > 0 && (
            <span className="px-2 py-0.5 bg-purple-600 text-white text-xs rounded-full">
              {activeComments.length}
            </span>
          )}
        </div>
        <button
          onClick={() => setShowComments(!showComments)}
          className="p-1 hover:bg-gray-800 rounded transition-colors"
        >
          <X className="w-4 h-4 text-gray-400" />
        </button>
      </div>

      {/* Comments List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        <AnimatePresence>
          {activeComments.map(comment => (
            <CommentThread
              key={comment.id}
              comment={comment}
              currentUser={currentUser}
              onUpdate={onUpdateComment}
              onDelete={onDeleteComment}
              onReply={(text) => onAddComment({
                text,
                elementId: comment.elementId,
                position: comment.position
              })}
            />
          ))}
        </AnimatePresence>

        {resolvedComments.length > 0 && (
          <>
            <div className="flex items-center gap-2 py-2">
              <div className="flex-1 h-px bg-gray-800" />
              <span className="text-xs text-gray-500">Resolved</span>
              <div className="flex-1 h-px bg-gray-800" />
            </div>
            
            {resolvedComments.map(comment => (
              <CommentThread
                key={comment.id}
                comment={comment}
                currentUser={currentUser}
                onUpdate={onUpdateComment}
                onDelete={onDeleteComment}
                isResolved
              />
            ))}
          </>
        )}

        {comments.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <MessageCircle className="w-12 h-12 mx-auto mb-2 opacity-20" />
            <p className="text-sm">No comments yet</p>
          </div>
        )}
      </div>
    </div>
  )
}

// Comment Thread Component
interface CommentThreadProps {
  comment: Comment
  currentUser: User
  onUpdate?: (commentId: string, updates: Partial<Comment>) => void
  onDelete?: (commentId: string) => void
  onReply?: (text: string) => void
  isResolved?: boolean
}

function CommentThread({
  comment,
  currentUser,
  onUpdate,
  onDelete,
  onReply,
  isResolved
}: CommentThreadProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editText, setEditText] = useState(comment.text)
  const [showReplyInput, setShowReplyInput] = useState(false)
  const [replyText, setReplyText] = useState('')
  const [showMenu, setShowMenu] = useState(false)

  const isOwner = comment.userId === currentUser.id

  const handleSaveEdit = () => {
    if (editText.trim() && editText !== comment.text) {
      onUpdate?.(comment.id, { text: editText.trim() })
    }
    setIsEditing(false)
  }

  const handleReply = () => {
    if (replyText.trim()) {
      onReply?.(replyText.trim())
      setReplyText('')
      setShowReplyInput(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={`${isResolved ? 'opacity-60' : ''}`}
    >
      <div className="bg-gray-800 rounded-lg p-3">
        {/* Comment Header */}
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2">
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium text-white"
              style={{ backgroundColor: currentUser.color }}
            >
              {currentUser.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-medium text-white">{currentUser.name}</p>
              <p className="text-xs text-gray-500">
                {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
              </p>
            </div>
          </div>

          {isOwner && (
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-1 hover:bg-gray-700 rounded transition-colors"
              >
                <MoreVertical className="w-4 h-4 text-gray-400" />
              </button>
              
              {showMenu && (
                <div className="absolute right-0 mt-1 bg-gray-700 rounded-lg shadow-lg py-1 z-10">
                  <button
                    onClick={() => {
                      setIsEditing(true)
                      setShowMenu(false)
                    }}
                    className="flex items-center gap-2 px-3 py-1.5 hover:bg-gray-600 w-full text-left text-sm text-gray-300"
                  >
                    <Edit2 className="w-3 h-3" />
                    Edit
                  </button>
                  <button
                    onClick={() => {
                      onDelete?.(comment.id)
                      setShowMenu(false)
                    }}
                    className="flex items-center gap-2 px-3 py-1.5 hover:bg-gray-600 w-full text-left text-sm text-red-400"
                  >
                    <Trash2 className="w-3 h-3" />
                    Delete
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Comment Body */}
        {isEditing ? (
          <div className="space-y-2">
            <textarea
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm resize-none"
              rows={3}
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setIsEditing(false)}
                className="px-3 py-1 text-sm text-gray-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded-lg transition-colors"
              >
                Save
              </button>
            </div>
          </div>
        ) : (
          <p className="text-sm text-gray-300">{comment.text}</p>
        )}

        {/* Actions */}
        {!isEditing && !isResolved && (
          <div className="flex items-center gap-3 mt-2">
            <button
              onClick={() => setShowReplyInput(!showReplyInput)}
              className="flex items-center gap-1 text-xs text-gray-400 hover:text-white transition-colors"
            >
              <Reply className="w-3 h-3" />
              Reply
            </button>
            <button
              onClick={() => onUpdate?.(comment.id, { resolved: true })}
              className="flex items-center gap-1 text-xs text-gray-400 hover:text-green-400 transition-colors"
            >
              <Check className="w-3 h-3" />
              Resolve
            </button>
          </div>
        )}

        {/* Reply Input */}
        {showReplyInput && (
          <div className="mt-3 space-y-2">
            <textarea
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Write a reply..."
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm resize-none"
              rows={2}
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setShowReplyInput(false)
                  setReplyText('')
                }}
                className="px-3 py-1 text-sm text-gray-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleReply}
                className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded-lg transition-colors flex items-center gap-1"
              >
                <Send className="w-3 h-3" />
                Reply
              </button>
            </div>
          </div>
        )}

        {/* Replies */}
        {comment.replies.length > 0 && (
          <div className="mt-3 pl-4 border-l-2 border-gray-700 space-y-2">
            {comment.replies.map((reply) => (
              <div key={reply.id} className="text-sm">
                <p className="text-gray-400">
                  <span className="font-medium text-gray-300">Reply:</span> {reply.text}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  )
}

// Floating Comment Button
interface CommentButtonProps {
  onClick: () => void
  position: { x: number; y: number }
}

export function CommentButton({ onClick, position }: CommentButtonProps) {
  return (
    <motion.button
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0 }}
      style={{ left: position.x, top: position.y }}
      className="absolute z-50 p-2 bg-purple-600 hover:bg-purple-700 rounded-full shadow-lg transition-colors"
      onClick={onClick}
    >
      <MessageCircle className="w-4 h-4 text-white" />
    </motion.button>
  )
}