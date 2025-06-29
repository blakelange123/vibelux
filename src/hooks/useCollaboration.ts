import { useState, useEffect, useCallback, useRef } from 'react'
import { useUser } from '@clerk/nextjs'
import { 
  CollaborationClient, 
  type User, 
  type Presence, 
  type Comment,
  type CollaborationEvent 
} from '@/lib/collaboration/collaboration-client'

interface UseCollaborationOptions {
  projectId: string
  onEdit?: (event: CollaborationEvent) => void
  onSync?: (data: any) => void
}

interface CollaborationState {
  isConnected: boolean
  activeUsers: Presence[]
  cursors: Map<string, { x: number; y: number }>
  selections: Map<string, { elementId: string; start: number; end: number }>
  comments: Comment[]
}

export function useCollaboration({ projectId, onEdit, onSync }: UseCollaborationOptions) {
  const { user } = useUser()
  const clientRef = useRef<CollaborationClient | null>(null)
  
  const [state, setState] = useState<CollaborationState>({
    isConnected: false,
    activeUsers: [],
    cursors: new Map(),
    selections: new Map(),
    comments: []
  })
  
  // Initialize collaboration client
  useEffect(() => {
    if (!user || !projectId) return
    
    const collaborationUser: User = {
      id: user.id,
      name: user.fullName || user.firstName || 'Anonymous',
      email: user.emailAddresses?.[0]?.emailAddress || '',
      avatar: user.imageUrl || undefined,
      color: generateUserColor(user.emailAddresses?.[0]?.emailAddress || user.id)
    }
    
    const client = new CollaborationClient({
      projectId,
      userId: collaborationUser.id,
      user: collaborationUser
    })
    
    // Set up event listeners
    client.on('connected', () => {
      setState(prev => ({ ...prev, isConnected: true }))
    })
    
    client.on('disconnected', () => {
      setState(prev => ({ 
        ...prev, 
        isConnected: false,
        activeUsers: [],
        cursors: new Map(),
        selections: new Map()
      }))
    })
    
    client.on('presence-update', (users: Presence[]) => {
      setState(prev => ({ ...prev, activeUsers: users }))
    })
    
    client.on('cursor', (event: CollaborationEvent) => {
      setState(prev => {
        const cursors = new Map(prev.cursors)
        cursors.set(event.userId, event.data)
        return { ...prev, cursors }
      })
    })
    
    client.on('selection', (event: CollaborationEvent) => {
      setState(prev => {
        const selections = new Map(prev.selections)
        selections.set(event.userId, event.data)
        return { ...prev, selections }
      })
    })
    
    client.on('comment', (event: CollaborationEvent) => {
      setState(prev => ({
        ...prev,
        comments: [...prev.comments, event.data]
      }))
    })
    
    client.on('edit', (event: CollaborationEvent) => {
      onEdit?.(event)
    })
    
    client.on('sync', (data: any) => {
      onSync?.(data)
    })
    
    client.on('user-joined', (user: User) => {
    })
    
    client.on('user-left', (user: User) => {
      
      // Clean up their cursor and selection
      setState(prev => {
        const cursors = new Map(prev.cursors)
        const selections = new Map(prev.selections)
        cursors.delete(user.id)
        selections.delete(user.id)
        return { ...prev, cursors, selections }
      })
    })
    
    // Connect to server
    client.connect()
    clientRef.current = client
    
    // Cleanup
    return () => {
      client.disconnect()
      clientRef.current = null
    }
  }, [user, projectId, onEdit, onSync])
  
  // Send cursor position
  const sendCursor = useCallback((x: number, y: number) => {
    clientRef.current?.sendCursor(x, y)
  }, [])
  
  // Send selection
  const sendSelection = useCallback((elementId: string, start: number, end: number) => {
    clientRef.current?.sendSelection(elementId, start, end)
  }, [])
  
  // Send edit operation
  const sendEdit = useCallback((operation: any, version?: number) => {
    clientRef.current?.sendEdit(operation, version)
  }, [])
  
  // Send comment
  const sendComment = useCallback((comment: Partial<Comment>) => {
    clientRef.current?.sendComment(comment)
  }, [])
  
  // Update presence
  const updatePresence = useCallback((data: Partial<Presence>) => {
    clientRef.current?.updatePresence(data)
  }, [])
  
  return {
    ...state,
    sendCursor,
    sendSelection,
    sendEdit,
    sendComment,
    updatePresence
  }
}

// Helper function to generate consistent user colors
function generateUserColor(email: string): string {
  const colors = [
    '#FF6B6B', // Red
    '#4ECDC4', // Teal
    '#45B7D1', // Blue
    '#F7DC6F', // Yellow
    '#BB8FCE', // Purple
    '#52BE80', // Green
    '#F8B500', // Orange
    '#5DADE2', // Light Blue
    '#EC7063', // Pink
    '#58D68D'  // Light Green
  ]
  
  let hash = 0
  for (let i = 0; i < email.length; i++) {
    hash = email.charCodeAt(i) + ((hash << 5) - hash)
  }
  
  return colors[Math.abs(hash) % colors.length]
}