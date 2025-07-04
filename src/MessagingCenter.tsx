'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  MessageSquare, 
  Send, 
  Paperclip, 
  Phone, 
  Video, 
  Info,
  Search,
  Filter,
  CheckCheck,
  Check,
  Clock,
  AlertCircle,
  FileText,
  Image as ImageIcon,
  Download,
  X
} from 'lucide-react';

interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderRole: 'investor' | 'grower';
  content: string;
  timestamp: Date;
  read: boolean;
  attachments?: {
    name: string;
    type: string;
    size: number;
    url: string;
  }[];
}

interface Conversation {
  id: string;
  participantName: string;
  participantRole: 'investor' | 'grower';
  facilityName?: string;
  lastMessage: string;
  lastMessageTime: Date;
  unreadCount: number;
  status: 'active' | 'archived';
  investmentType?: 'GAAS' | 'YEP' | 'HYBRID';
  investmentAmount?: number;
}

interface MessagingCenterProps {
  userRole: 'investor' | 'grower';
  userId: string;
}

export function MessagingCenter({ userRole, userId }: MessagingCenterProps) {
  const [conversations, setConversations] = useState<Conversation[]>([
    {
      id: 'conv-1',
      participantName: userRole === 'investor' ? 'Sarah Chen' : 'John Anderson',
      participantRole: userRole === 'investor' ? 'grower' : 'investor',
      facilityName: 'GreenPeak Cultivation',
      lastMessage: 'Thanks for the financial documents. I have a few questions...',
      lastMessageTime: new Date(Date.now() - 1000 * 60 * 30), // 30 min ago
      unreadCount: 2,
      status: 'active',
      investmentType: 'HYBRID',
      investmentAmount: 2500000
    },
    {
      id: 'conv-2',
      participantName: userRole === 'investor' ? 'Marcus Johnson' : 'Emily Roberts',
      participantRole: userRole === 'investor' ? 'grower' : 'investor',
      facilityName: 'Sunrise Gardens',
      lastMessage: 'The site visit is confirmed for next Tuesday at 2 PM.',
      lastMessageTime: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
      unreadCount: 0,
      status: 'active',
      investmentType: 'GAAS',
      investmentAmount: 1500000
    }
  ]);

  const [selectedConversation, setSelectedConversation] = useState<string | null>(conversations[0]?.id);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<null | HTMLDivElement>(null);

  // Load messages for selected conversation
  useEffect(() => {
    if (selectedConversation) {
      // Mock messages - in production, fetch from API
      setMessages([
        {
          id: 'msg-1',
          conversationId: selectedConversation,
          senderId: userRole === 'investor' ? 'grower-1' : 'investor-1',
          senderName: conversations.find(c => c.id === selectedConversation)?.participantName || '',
          senderRole: userRole === 'investor' ? 'grower' : 'investor',
          content: 'Hi! I reviewed your investment opportunity and I\'m very interested in learning more.',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
          read: true
        },
        {
          id: 'msg-2',
          conversationId: selectedConversation,
          senderId: userId,
          senderName: 'You',
          senderRole: userRole,
          content: 'Great to hear! I\'d be happy to share more details. What specific aspects would you like to know about?',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 20),
          read: true
        },
        {
          id: 'msg-3',
          conversationId: selectedConversation,
          senderId: userRole === 'investor' ? 'grower-1' : 'investor-1',
          senderName: conversations.find(c => c.id === selectedConversation)?.participantName || '',
          senderRole: userRole === 'investor' ? 'grower' : 'investor',
          content: 'I\'m particularly interested in your energy efficiency improvements and the projected ROI. Could you share the detailed financial projections?',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 18),
          read: true,
          attachments: [
            {
              name: 'Financial_Projections_2024.xlsx',
              type: 'spreadsheet',
              size: 245000,
              url: '#'
            }
          ]
        },
        {
          id: 'msg-4',
          conversationId: selectedConversation,
          senderId: userId,
          senderName: 'You',
          senderRole: userRole,
          content: 'Thanks for the financial documents. I have a few questions about your current yield metrics and the assumptions in the model.',
          timestamp: new Date(Date.now() - 1000 * 60 * 30),
          read: false
        }
      ]);
    }
  }, [selectedConversation, userRole, userId]);

  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = () => {
    if (!newMessage.trim() || !selectedConversation) return;

    const message: Message = {
      id: `msg-${Date.now()}`,
      conversationId: selectedConversation,
      senderId: userId,
      senderName: 'You',
      senderRole: userRole,
      content: newMessage,
      timestamp: new Date(),
      read: false
    };

    setMessages([...messages, message]);
    setNewMessage('');

    // Update conversation
    setConversations(prev => prev.map(conv => 
      conv.id === selectedConversation 
        ? { ...conv, lastMessage: newMessage, lastMessageTime: new Date(), unreadCount: 0 }
        : conv
    ));
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days > 0) return `${days}d ago`;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours > 0) return `${hours}h ago`;
    const minutes = Math.floor(diff / (1000 * 60));
    return `${minutes}m ago`;
  };

  const getFileIcon = (type: string) => {
    if (type.includes('spreadsheet') || type.includes('excel')) return FileText;
    if (type.includes('image')) return ImageIcon;
    return FileText;
  };

  const currentConversation = conversations.find(c => c.id === selectedConversation);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[800px]">
      {/* Conversations List */}
      <Card className="lg:col-span-1 bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              Messages
            </span>
            <Badge variant="outline" className="bg-blue-900/50 text-blue-300">
              {conversations.reduce((acc, conv) => acc + conv.unreadCount, 0)} new
            </Badge>
          </CardTitle>
          <div className="relative mt-3">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search conversations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-gray-700 border-gray-600"
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[650px]">
            <div className="space-y-1 p-3">
              {conversations
                .filter(conv => 
                  conv.participantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  conv.facilityName?.toLowerCase().includes(searchTerm.toLowerCase())
                )
                .map(conversation => (
                  <div
                    key={conversation.id}
                    onClick={() => setSelectedConversation(conversation.id)}
                    className={`p-3 rounded-lg cursor-pointer transition-colors ${
                      selectedConversation === conversation.id
                        ? 'bg-gray-700 border border-gray-600'
                        : 'hover:bg-gray-700/50'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <Avatar className="w-8 h-8">
                          <AvatarFallback className="bg-gray-600 text-white text-sm">
                            {conversation.participantName.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="font-medium text-white text-sm">{conversation.participantName}</p>
                          {conversation.facilityName && (
                            <p className="text-xs text-gray-400">{conversation.facilityName}</p>
                          )}
                        </div>
                      </div>
                      {conversation.unreadCount > 0 && (
                        <Badge className="bg-blue-600 text-white text-xs">
                          {conversation.unreadCount}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-400 truncate">{conversation.lastMessage}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-gray-500">{formatTime(conversation.lastMessageTime)}</span>
                      {conversation.investmentType && (
                        <Badge variant="outline" className="text-xs">
                          {conversation.investmentType}
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Messages Area */}
      <Card className="lg:col-span-2 bg-gray-800 border-gray-700 flex flex-col">
        {selectedConversation && currentConversation ? (
          <>
            {/* Header */}
            <CardHeader className="border-b border-gray-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="w-10 h-10">
                    <AvatarFallback className="bg-gray-600 text-white">
                      {currentConversation.participantName.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold text-white">{currentConversation.participantName}</h3>
                    <p className="text-sm text-gray-400">
                      {currentConversation.facilityName} • ${(currentConversation.investmentAmount || 0).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon">
                    <Phone className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon">
                    <Video className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon">
                    <Info className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.map(message => {
                  const isOwn = message.senderId === userId;
                  return (
                    <div
                      key={message.id}
                      className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[70%] ${isOwn ? 'order-2' : 'order-1'}`}>
                        <div className={`rounded-lg p-3 ${
                          isOwn 
                            ? 'bg-blue-600 text-white' 
                            : 'bg-gray-700 text-white'
                        }`}>
                          {!isOwn && (
                            <p className="text-xs font-medium mb-1 opacity-80">
                              {message.senderName}
                            </p>
                          )}
                          <p className="text-sm">{message.content}</p>
                          
                          {message.attachments && message.attachments.length > 0 && (
                            <div className="mt-2 space-y-1">
                              {message.attachments.map((attachment, idx) => {
                                const FileIcon = getFileIcon(attachment.type);
                                return (
                                  <div
                                    key={idx}
                                    className={`flex items-center gap-2 p-2 rounded ${
                                      isOwn ? 'bg-blue-700' : 'bg-gray-600'
                                    }`}
                                  >
                                    <FileIcon className="w-4 h-4" />
                                    <span className="text-xs flex-1">{attachment.name}</span>
                                    <Button variant="ghost" size="icon" className="h-6 w-6">
                                      <Download className="w-3 h-3" />
                                    </Button>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                          
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs opacity-70">
                              {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            {isOwn && (
                              <span>
                                {message.read ? (
                                  <CheckCheck className="w-3 h-3 text-blue-300" />
                                ) : (
                                  <Check className="w-3 h-3 opacity-70" />
                                )}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
                {isTyping && (
                  <div className="flex items-center gap-2 text-gray-400">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100" />
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200" />
                    </div>
                    <span className="text-sm">{currentConversation.participantName} is typing...</span>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Input Area */}
            <div className="p-4 border-t border-gray-700">
              <div className="flex items-end gap-2">
                <Button variant="ghost" size="icon" className="mb-1">
                  <Paperclip className="w-4 h-4" />
                </Button>
                <Textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage();
                    }
                  }}
                  placeholder="Type a message..."
                  className="flex-1 min-h-[40px] max-h-[120px] bg-gray-700 border-gray-600"
                  rows={1}
                />
                <Button 
                  onClick={sendMessage}
                  disabled={!newMessage.trim()}
                  className="mb-1"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageSquare className="w-12 h-12 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400">Select a conversation to start messaging</p>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}