'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { collaborationService, CollaborationUser, ChatMessage } from '../services/collaborationService';
import { useDesigner } from './DesignerContext';
import { DesignerAction } from './types';

interface CollaborationContextValue {
  isConnected: boolean;
  isCollaborating: boolean;
  roomId: string | null;
  users: CollaborationUser[];
  currentUser: CollaborationUser | undefined;
  cursors: Map<string, { x: number; y: number }>;
  chatMessages: ChatMessage[];
  unreadMessages: number;
  
  // Actions
  startCollaboration: (roomId?: string, userName?: string) => Promise<void>;
  stopCollaboration: () => void;
  sendCursorPosition: (x: number, y: number) => void;
  sendChatMessage: (message: string) => void;
  markMessagesAsRead: () => void;
}

const CollaborationContext = createContext<CollaborationContextValue | undefined>(undefined);

export function CollaborationProvider({ children }: { children: ReactNode }) {
  const { dispatch } = useDesigner();
  const [isConnected, setIsConnected] = useState(false);
  const [isCollaborating, setIsCollaborating] = useState(false);
  const [roomId, setRoomId] = useState<string | null>(null);
  const [users, setUsers] = useState<CollaborationUser[]>([]);
  const [cursors, setCursors] = useState<Map<string, { x: number; y: number }>>(new Map());
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [unreadMessages, setUnreadMessages] = useState(0);

  // Set up collaboration event listeners
  useEffect(() => {
    const handleConnectionStatus = ({ connected }: { connected: boolean }) => {
      setIsConnected(connected);
      if (!connected) {
        setIsCollaborating(false);
      }
    };

    const handleUserJoined = (user: CollaborationUser) => {
      setUsers(collaborationService.getUsers());
    };

    const handleUserLeft = (userId: string) => {
      setUsers(collaborationService.getUsers());
      setCursors(prev => {
        const next = new Map(prev);
        next.delete(userId);
        return next;
      });
    };

    const handleCursorMoved = ({ userId, cursor }: { userId: string; cursor: { x: number; y: number } }) => {
      setCursors(prev => new Map(prev).set(userId, cursor));
    };

    const handleRemoteAction = ({ userId, action }: { userId: string; action: DesignerAction }) => {
      // Apply remote action to local state
      if (userId !== collaborationService.getCurrentUserId()) {
        dispatch(action);
      }
    };

    const handleChatMessage = (message: ChatMessage) => {
      setChatMessages(prev => [...prev, message]);
      if (message.userId !== collaborationService.getCurrentUserId()) {
        setUnreadMessages(prev => prev + 1);
      }
    };

    // Subscribe to events
    collaborationService.on('connection-status', handleConnectionStatus);
    collaborationService.on('user-joined', handleUserJoined);
    collaborationService.on('user-left', handleUserLeft);
    collaborationService.on('cursor-moved', handleCursorMoved);
    collaborationService.on('remote-action', handleRemoteAction);
    collaborationService.on('chat-message', handleChatMessage);

    // Cleanup
    return () => {
      collaborationService.off('connection-status', handleConnectionStatus);
      collaborationService.off('user-joined', handleUserJoined);
      collaborationService.off('user-left', handleUserLeft);
      collaborationService.off('cursor-moved', handleCursorMoved);
      collaborationService.off('remote-action', handleRemoteAction);
      collaborationService.off('chat-message', handleChatMessage);
    };
  }, [dispatch]);

  const startCollaboration = useCallback(async (roomId?: string, userName?: string) => {
    const collaborationRoomId = roomId || `room-${Date.now()}-${crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF.toString(36).substr(2, 9)}`;
    
    try {
      await collaborationService.connect(collaborationRoomId, userName);
      setRoomId(collaborationRoomId);
      setIsCollaborating(true);
      setUsers(collaborationService.getUsers());
    } catch (error) {
      console.error('Failed to start collaboration:', error);
    }
  }, []);

  const stopCollaboration = useCallback(() => {
    collaborationService.disconnect();
    setIsCollaborating(false);
    setRoomId(null);
    setUsers([]);
    setCursors(new Map());
  }, []);

  const sendCursorPosition = useCallback((x: number, y: number) => {
    collaborationService.sendCursorPosition(x, y);
  }, []);

  const sendChatMessage = useCallback((message: string) => {
    if (message.trim()) {
      collaborationService.sendChatMessage(message);
    }
  }, []);

  const markMessagesAsRead = useCallback(() => {
    setUnreadMessages(0);
  }, []);

  return (
    <CollaborationContext.Provider value={{
      isConnected,
      isCollaborating,
      roomId,
      users,
      currentUser: collaborationService.getCurrentUser(),
      cursors,
      chatMessages,
      unreadMessages,
      startCollaboration,
      stopCollaboration,
      sendCursorPosition,
      sendChatMessage,
      markMessagesAsRead
    }}>
      {children}
    </CollaborationContext.Provider>
  );
}

export function useCollaboration() {
  const context = useContext(CollaborationContext);
  if (!context) {
    throw new Error('useCollaboration must be used within a CollaborationProvider');
  }
  return context;
}