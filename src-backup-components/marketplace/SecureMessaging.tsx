'use client';

import React, { useState, useEffect } from 'react';
import {
  Send,
  AlertCircle,
  Shield,
  MessageSquare,
  Lock,
  Eye,
  EyeOff,
  Info
} from 'lucide-react';
import { PlatformProtection } from '@/lib/marketplace/platform-protection';

const platformProtection = new PlatformProtection();

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  recipientId: string;
  content: string;
  timestamp: Date;
  flagged?: boolean;
  violations?: string[];
}

interface SecureMessagingProps {
  currentUserId: string;
  recipientId: string;
  recipientName: string;
  productId?: string;
}

export function SecureMessaging({ 
  currentUserId, 
  recipientId, 
  recipientName,
  productId 
}: SecureMessagingProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [showWarning, setShowWarning] = useState(false);
  const [warningMessage, setWarningMessage] = useState('');
  const [showProtectionInfo, setShowProtectionInfo] = useState(false);

  useEffect(() => {
    // Load message history
    loadMessages();

    // Subscribe to platform protection events
    platformProtection.on('suspiciousActivity', (activity) => {
    });
  }, []);

  const loadMessages = () => {
    // In production, this would fetch from API
    setMessages([
      {
        id: '1',
        senderId: recipientId,
        senderName: recipientName,
        recipientId: currentUserId,
        content: 'Hi! I see you\'re interested in our LED grow lights. How can I help you?',
        timestamp: new Date(Date.now() - 3600000)
      },
      {
        id: '2',
        senderId: currentUserId,
        senderName: 'You',
        recipientId: recipientId,
        content: 'Yes, I need 50 units for my facility. What\'s the best price you can offer?',
        timestamp: new Date(Date.now() - 1800000)
      }
    ]);
  };

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    // Filter message for platform protection
    const filterResult = platformProtection.filterMessage(
      newMessage,
      currentUserId,
      recipientId
    );

    if (!filterResult.allowed) {
      setShowWarning(true);
      setWarningMessage(filterResult.warning || 'Message contains prohibited content');
      return;
    }

    if (filterResult.violations.length > 0) {
      setShowWarning(true);
      setWarningMessage(filterResult.warning || 'Message has been modified for policy compliance');
    }

    // Send the filtered message
    const message: Message = {
      id: Date.now().toString(),
      senderId: currentUserId,
      senderName: 'You',
      recipientId,
      content: filterResult.filteredMessage,
      timestamp: new Date(),
      flagged: filterResult.violations.length > 0,
      violations: filterResult.violations.map(v => v.type)
    };

    setMessages([...messages, message]);
    setNewMessage('');

    // Track activity
    if (productId) {
      platformProtection.trackUserActivity(currentUserId, 'message-sent', {
        recipientId,
        productId,
        messageLength: newMessage.length
      });
    }
  };

  return (
    <div className="bg-gray-900 rounded-xl h-[600px] flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <MessageSquare className="w-5 h-5 text-purple-400" />
            <div>
              <h3 className="font-semibold">{recipientName}</h3>
              <p className="text-sm text-gray-400">Secure Messaging</p>
            </div>
          </div>
          
          <button
            onClick={() => setShowProtectionInfo(!showProtectionInfo)}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <Shield className="w-5 h-5 text-green-400" />
          </button>
        </div>
      </div>

      {/* Protection Info */}
      {showProtectionInfo && (
        <div className="p-4 bg-blue-900/20 border-b border-blue-600/30">
          <div className="flex gap-3">
            <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-blue-300 mb-1">Platform Protection Active</p>
              <ul className="text-blue-200 space-y-1">
                <li>• Messages are encrypted and monitored for policy compliance</li>
                <li>• Contact information sharing is prohibited</li>
                <li>• All transactions must be completed through Vibelux</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map(message => (
          <div
            key={message.id}
            className={`flex ${message.senderId === currentUserId ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-[70%] ${
              message.senderId === currentUserId
                ? 'bg-purple-600 text-white'
                : 'bg-gray-800 text-gray-100'
            } rounded-lg p-3`}>
              <p className="text-sm">{message.content}</p>
              <div className="flex items-center gap-2 mt-2">
                <p className="text-xs opacity-70">
                  {new Date(message.timestamp).toLocaleTimeString()}
                </p>
                {message.flagged && (
                  <div className="flex items-center gap-1">
                    <AlertCircle className="w-3 h-3 text-yellow-300" />
                    <span className="text-xs text-yellow-300">Modified</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Warning */}
      {showWarning && (
        <div className="p-3 bg-yellow-900/20 border-t border-yellow-600/30">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-yellow-400" />
            <p className="text-sm text-yellow-300">{warningMessage}</p>
            <button
              onClick={() => setShowWarning(false)}
              className="ml-auto text-yellow-400 hover:text-yellow-300"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Input */}
      <div className="p-4 border-t border-gray-700">
        <div className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Type a message..."
            className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none"
          />
          <button
            onClick={handleSendMessage}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
          >
            <Lock className="w-4 h-4" />
            <Send className="w-4 h-4" />
          </button>
        </div>
        
        <div className="flex items-center gap-2 mt-2">
          <Lock className="w-3 h-3 text-gray-500" />
          <p className="text-xs text-gray-500">
            Messages are encrypted and monitored for platform protection
          </p>
        </div>
      </div>
    </div>
  );
}