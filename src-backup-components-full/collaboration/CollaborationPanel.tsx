'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  Users, 
  MessageSquare, 
  Send, 
  X, 
  Circle,
  MousePointer,
  ChevronRight,
  ChevronLeft,
  Wifi,
  WifiOff,
  Eye,
  EyeOff,
  Video,
  Phone,
  Monitor
} from 'lucide-react';
import { useCollaboration } from '@/hooks/useCollaboration';
import { useMediaCollaboration } from '@/hooks/useMediaCollaboration';
import { VideoCallPanel } from './VideoCallPanel';
import { ScreenSharePanel } from './ScreenSharePanel';
import { CallInvitation, QuickCallActions } from './CallInvitation';

interface CollaborationPanelProps {
  roomId: string;
  userId: string;
  userName: string;
  wsUrl?: string;
  onObjectAdded?: (data: { userId: string; object: any }) => void;
  onObjectUpdated?: (data: { userId: string; objectId: string; updates: any }) => void;
  onObjectDeleted?: (data: { userId: string; objectId: string }) => void;
}

export function CollaborationPanel({
  roomId,
  userId,
  userName,
  wsUrl,
  onObjectAdded,
  onObjectUpdated,
  onObjectDeleted
}: CollaborationPanelProps) {
  const [isPanelOpen, setIsPanelOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<'users' | 'chat' | 'media'>('users');
  const [message, setMessage] = useState('');
  const [showCursors, setShowCursors] = useState(true);
  const [showSelections, setShowSelections] = useState(true);
  const [showVideoCall, setShowVideoCall] = useState(false);
  const [showScreenShare, setShowScreenShare] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const collaboration = useCollaboration({
    roomId,
    userId,
    userName,
    wsUrl,
    onObjectAdded,
    onObjectUpdated,
    onObjectDeleted
  });

  const {
    isConnected,
    error,
    users,
    cursors,
    selections,
    messages,
    sendMessage,
    sendCursor,
    sendSelection,
    sendObjectAdd,
    sendObjectUpdate,
    sendObjectDelete
  } = collaboration;

  const mediaCollaboration = useMediaCollaboration(collaboration.client, {
    autoStartVideo: false,
    autoStartAudio: true,
    enableScreenShare: true
  });

  const {
    isInCall,
    incomingCall,
    participants,
    isScreenSharing,
    startCall,
    acceptIncomingCall,
    declineIncomingCall,
    endCall,
    mediaClient
  } = mediaCollaboration;

  // Auto-scroll chat to bottom when new messages arrive
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      sendMessage(message.trim());
      setMessage('');
    }
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <>
      {/* Collaboration Panel */}
      <div className={`fixed right-0 top-20 bottom-0 bg-gray-900 border-l border-gray-800 transition-all duration-300 z-40 ${
        isPanelOpen ? 'w-80' : 'w-0'
      }`}>
        {isPanelOpen && (
          <div className="h-full flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-gray-800">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold text-white">Collaboration</h3>
                <div className="flex items-center gap-2">
                  {isConnected ? (
                    <Wifi className="w-4 h-4 text-green-400" />
                  ) : (
                    <WifiOff className="w-4 h-4 text-red-400" />
                  )}
                  <button
                    onClick={() => setIsPanelOpen(false)}
                    className="p-1 hover:bg-gray-800 rounded transition-colors"
                  >
                    <X className="w-4 h-4 text-gray-400" />
                  </button>
                </div>
              </div>
              
              {/* Connection Status */}
              {error && (
                <div className="text-xs text-red-400 bg-red-500/10 rounded p-2">
                  {error}
                </div>
              )}
              
              {/* Tabs */}
              <div className="flex gap-1 mt-3">
                <button
                  onClick={() => setActiveTab('users')}
                  className={`flex-1 py-1.5 px-2 rounded text-xs font-medium transition-colors ${
                    activeTab === 'users'
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-800 text-gray-400 hover:text-white'
                  }`}
                >
                  <div className="flex items-center justify-center gap-1">
                    <Users className="w-3 h-3" />
                    <span>Users ({users.length})</span>
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab('chat')}
                  className={`flex-1 py-1.5 px-2 rounded text-xs font-medium transition-colors relative ${
                    activeTab === 'chat'
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-800 text-gray-400 hover:text-white'
                  }`}
                >
                  <div className="flex items-center justify-center gap-1">
                    <MessageSquare className="w-3 h-3" />
                    <span>Chat</span>
                  </div>
                  {messages.length > 0 && activeTab !== 'chat' && (
                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-purple-500 rounded-full" />
                  )}
                </button>
                <button
                  onClick={() => setActiveTab('media')}
                  className={`flex-1 py-1.5 px-2 rounded text-xs font-medium transition-colors relative ${
                    activeTab === 'media'
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-800 text-gray-400 hover:text-white'
                  }`}
                >
                  <div className="flex items-center justify-center gap-1">
                    <Video className="w-3 h-3" />
                    <span>Media</span>
                  </div>
                  {(isInCall || incomingCall) && activeTab !== 'media' && (
                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  )}
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-hidden">
              {activeTab === 'media' ? (
                <div className="h-full flex flex-col p-4">
                  {/* Call Status */}
                  {isInCall && (
                    <div className="mb-4 p-3 bg-green-500/20 border border-green-500/30 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                          <span className="text-sm text-green-400">In call with {participants.length} participants</span>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setShowVideoCall(!showVideoCall)}
                            className="p-1.5 bg-green-600 hover:bg-green-700 rounded transition-colors"
                          >
                            <Video className="w-3 h-3 text-white" />
                          </button>
                          <button
                            onClick={endCall}
                            className="p-1.5 bg-red-600 hover:bg-red-700 rounded transition-colors"
                          >
                            <Phone className="w-3 h-3 text-white" />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Screen Share Status */}
                  {isScreenSharing && (
                    <div className="mb-4 p-3 bg-blue-500/20 border border-blue-500/30 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Monitor className="w-4 h-4 text-blue-400" />
                          <span className="text-sm text-blue-400">Screen sharing active</span>
                        </div>
                        <button
                          onClick={() => setShowScreenShare(!showScreenShare)}
                          className="p-1.5 bg-blue-600 hover:bg-blue-700 rounded transition-colors"
                        >
                          <Monitor className="w-3 h-3 text-white" />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Quick Actions */}
                  {!isInCall && users.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-300 mb-2">Start Call</h4>
                      <QuickCallActions
                        participants={users.filter(u => u.id !== userId)}
                        onStartCall={async (withVideo, participantIds) => {
                          try {
                            await startCall(participantIds)
                            if (withVideo) {
                              setShowVideoCall(true)
                            }
                          } catch (error) {
                            console.error('Failed to start call:', error)
                          }
                        }}
                        disabled={!isConnected}
                      />
                    </div>
                  )}

                  {/* Participants List */}
                  {isInCall && (
                    <div className="flex-1 overflow-y-auto">
                      <h4 className="text-sm font-medium text-gray-300 mb-2">Call Participants</h4>
                      <div className="space-y-2">
                        {participants.map(participant => (
                          <div key={participant.userId} className="flex items-center gap-3 p-2 bg-gray-800 rounded">
                            <div
                              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-medium"
                              style={{ backgroundColor: participant.user.color }}
                            >
                              {participant.user.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1">
                              <p className="text-sm text-white">{participant.user.name}</p>
                              <div className="flex gap-1 mt-1">
                                {participant.isAudioMuted && (
                                  <div className="w-1.5 h-1.5 bg-red-500 rounded-full" />
                                )}
                                {participant.isVideoMuted && (
                                  <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full" />
                                )}
                                {participant.isScreenSharing && (
                                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                                )}
                              </div>
                            </div>
                            <div className={`w-2 h-2 rounded-full ${
                              participant.connectionState === 'connected' ? 'bg-green-500' :
                              participant.connectionState === 'connecting' ? 'bg-yellow-500' :
                              'bg-red-500'
                            }`} />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {!isInCall && users.length === 0 && (
                    <div className="flex-1 flex items-center justify-center text-center text-gray-500 text-sm">
                      <div>
                        <Video className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p>No other users to call</p>
                      </div>
                    </div>
                  )}
                </div>
              ) : activeTab === 'users' ? (
                <div className="h-full flex flex-col">
                  {/* View Options */}
                  <div className="p-3 border-b border-gray-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-400">Show cursors</span>
                      <button
                        onClick={() => setShowCursors(!showCursors)}
                        className={`p-1 rounded transition-colors ${
                          showCursors ? 'text-purple-400' : 'text-gray-500'
                        }`}
                      >
                        {showCursors ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-400">Show selections</span>
                      <button
                        onClick={() => setShowSelections(!showSelections)}
                        className={`p-1 rounded transition-colors ${
                          showSelections ? 'text-purple-400' : 'text-gray-500'
                        }`}
                      >
                        {showSelections ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  
                  {/* Users List */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {users.map(user => {
                      const userCursor = cursors.find(c => c.userId === user.id);
                      const userSelection = selections.find(s => s.userId === user.id);
                      const isInCallWithUser = participants.some(p => p.userId === user.id);
                      
                      return (
                        <div
                          key={user.id}
                          className="flex items-start gap-3 p-3 bg-gray-800 rounded-lg"
                        >
                          <div className="relative">
                            <div
                              className="w-10 h-10 rounded-full flex items-center justify-center text-white font-medium"
                              style={{ backgroundColor: user.color }}
                            >
                              {user.name.charAt(0).toUpperCase()}
                            </div>
                            {isInCallWithUser && (
                              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border border-gray-800" />
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-medium text-white">
                                {user.name}
                                {user.id === userId && ' (You)'}
                              </p>
                              {user.id !== userId && !isInCall && (
                                <div className="flex gap-1">
                                  <button
                                    onClick={() => startCall([user.id])}
                                    className="p-1 hover:bg-gray-700 rounded transition-colors"
                                    title="Start audio call"
                                  >
                                    <Phone className="w-3 h-3 text-gray-400 hover:text-white" />
                                  </button>
                                  <button
                                    onClick={() => {
                                      startCall([user.id])
                                      setShowVideoCall(true)
                                    }}
                                    className="p-1 hover:bg-gray-700 rounded transition-colors"
                                    title="Start video call"
                                  >
                                    <Video className="w-3 h-3 text-gray-400 hover:text-white" />
                                  </button>
                                </div>
                              )}
                            </div>
                            <div className="mt-1 space-y-1">
                              {userCursor && showCursors && (
                                <div className="flex items-center gap-2 text-xs text-gray-400">
                                  <MousePointer className="w-3 h-3" />
                                  <span>x: {userCursor.x}, y: {userCursor.y}</span>
                                </div>
                              )}
                              {userSelection && showSelections && (
                                <div className="flex items-center gap-2 text-xs text-gray-400">
                                  <Circle className="w-3 h-3" />
                                  <span>{userSelection.type}: {userSelection.objectId}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    
                    {users.length === 0 && (
                      <div className="text-center text-gray-500 text-sm py-8">
                        No other users connected
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="h-full flex flex-col">
                  {/* Chat Messages */}
                  <div
                    ref={chatContainerRef}
                    className="flex-1 overflow-y-auto p-4 space-y-3"
                  >
                    {messages.map((msg) => {
                      const isOwnMessage = msg.userId === userId;
                      const messageUser = users.find(u => u.id === msg.userId);
                      
                      return (
                        <div
                          key={msg.id}
                          className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                        >
                          <div className={`max-w-[80%] ${isOwnMessage ? 'order-2' : 'order-1'}`}>
                            {!isOwnMessage && (
                              <p className="text-xs text-gray-400 mb-1">
                                {msg.userName}
                              </p>
                            )}
                            <div
                              className={`rounded-lg px-3 py-2 ${
                                isOwnMessage
                                  ? 'bg-purple-600 text-white'
                                  : 'bg-gray-800 text-gray-100'
                              }`}
                              style={!isOwnMessage && messageUser ? {
                                borderLeft: `3px solid ${messageUser.color}`
                              } : undefined}
                            >
                              <p className="text-sm">{msg.message}</p>
                              <p className={`text-xs mt-1 ${
                                isOwnMessage ? 'text-purple-200' : 'text-gray-500'
                              }`}>
                                {formatTime(msg.timestamp)}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    
                    {messages.length === 0 && (
                      <div className="text-center text-gray-500 text-sm py-8">
                        No messages yet. Start a conversation!
                      </div>
                    )}
                  </div>
                  
                  {/* Chat Input */}
                  <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-800">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg
                          text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none text-sm"
                        disabled={!isConnected}
                      />
                      <button
                        type="submit"
                        disabled={!isConnected || !message.trim()}
                        className="p-2 bg-purple-600 hover:bg-purple-700 rounded-lg
                          transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Send className="w-4 h-4 text-white" />
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Toggle Button */}
      {!isPanelOpen && (
        <button
          onClick={() => setIsPanelOpen(true)}
          className="fixed right-0 top-32 bg-purple-600 hover:bg-purple-700 text-white
            p-3 rounded-l-lg shadow-lg transition-colors z-40"
        >
          <div className="flex items-center gap-2">
            <ChevronLeft className="w-4 h-4" />
            <Users className="w-4 h-4" />
            {users.length > 0 && (
              <span className="text-xs bg-white text-purple-600 rounded-full w-5 h-5 
                flex items-center justify-center font-medium">
                {users.length}
              </span>
            )}
          </div>
        </button>
      )}

      {/* Cursor Overlays */}
      {showCursors && cursors.map(cursor => {
        const user = cursor.user;
        if (!user || cursor.userId === userId) return null;

        return (
          <div
            key={cursor.userId}
            className="fixed pointer-events-none z-50 transition-all duration-100"
            style={{
              left: cursor.x - 8,
              top: cursor.y - 8
            }}
          >
            <MousePointer
              className="w-4 h-4"
              style={{ color: user.color }}
            />
            <div
              className="absolute top-4 left-4 px-2 py-1 rounded text-xs text-white whitespace-nowrap"
              style={{ backgroundColor: user.color }}
            >
              {user.name}
            </div>
          </div>
        );
      })}

      {/* Video Call Panel */}
      {showVideoCall && isInCall && (
        <VideoCallPanel
          mediaClient={mediaClient}
          isVisible={showVideoCall}
          onClose={() => setShowVideoCall(false)}
        />
      )}

      {/* Screen Share Panel */}
      {showScreenShare && isScreenSharing && (
        <ScreenSharePanel
          mediaClient={mediaClient}
          isLocalShare={true}
          isVisible={showScreenShare}
          onClose={() => setShowScreenShare(false)}
        />
      )}

      {/* Incoming Call Invitation */}
      {incomingCall && (
        <CallInvitation
          callId={incomingCall.callId}
          from={users.find(u => u.id === incomingCall.from) || {
            id: incomingCall.from,
            name: 'Unknown User',
            email: '',
            color: '#6366f1',
            avatar: undefined
          }}
          participants={incomingCall.participants.map(id => 
            users.find(u => u.id === id) || {
              id,
              name: 'Unknown User',
              email: '',
              color: '#6366f1',
              avatar: undefined
            }
          )}
          onAccept={acceptIncomingCall}
          onDecline={declineIncomingCall}
          onClose={declineIncomingCall}
          isVisible={true}
        />
      )}
    </>
  );
}