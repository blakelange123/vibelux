'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Brain,
  Sparkles,
  Send,
  Loader2,
  AlertCircle,
  CheckCircle,
  TrendingUp,
  Zap,
  FileText,
  HelpCircle,
  X,
  Minimize2,
  Maximize2,
  MessageSquare,
  Lightbulb,
  Target,
  Shield,
  DollarSign
} from 'lucide-react';

interface AIAssistantProps {
  context?: 'cultivation' | 'energy' | 'business' | 'compliance' | 'general';
  initialData?: any;
  embedded?: boolean;
  onInsightGenerated?: (insight: any) => void;
}

interface AIMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  type?: 'question' | 'analysis' | 'recommendation' | 'alert';
  data?: any;
}

export function AIAssistant({ 
  context = 'general', 
  initialData,
  embedded = false,
  onInsightGenerated 
}: AIAssistantProps) {
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [activeTab, setActiveTab] = useState('chat');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Context-specific quick actions
  const quickActions = {
    cultivation: [
      { label: 'Optimize Environment', icon: Sparkles, query: 'How can I optimize my current growing environment?' },
      { label: 'Diagnose Issues', icon: AlertCircle, query: 'Help me diagnose plant health issues' },
      { label: 'Yield Prediction', icon: TrendingUp, query: 'Predict my yield based on current conditions' }
    ],
    energy: [
      { label: 'Reduce Costs', icon: DollarSign, query: 'How can I reduce my energy costs?' },
      { label: 'Peak Demand', icon: Zap, query: 'Optimize my peak demand charges' },
      { label: 'Equipment Schedule', icon: Target, query: 'Create optimal equipment schedule' }
    ],
    business: [
      { label: 'ROI Analysis', icon: TrendingUp, query: 'Analyze my ROI and profitability' },
      { label: 'Market Insights', icon: Lightbulb, query: 'What are current market trends?' },
      { label: 'Growth Strategy', icon: Target, query: 'Recommend growth strategies' }
    ],
    compliance: [
      { label: 'Audit Prep', icon: Shield, query: 'Prepare for upcoming compliance audit' },
      { label: 'Regulations', icon: FileText, query: 'Latest regulatory requirements' },
      { label: 'Best Practices', icon: CheckCircle, query: 'Compliance best practices' }
    ],
    general: [
      { label: 'Get Started', icon: HelpCircle, query: 'What can you help me with?' },
      { label: 'Platform Tour', icon: MessageSquare, query: 'Give me a tour of Vibelux features' },
      { label: 'Best Practices', icon: Lightbulb, query: 'Share cultivation best practices' }
    ]
  };

  const handleSendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage: AIMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: input,
      timestamp: new Date(),
      type: 'question'
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      // Determine which AI endpoint to use based on context
      const endpoint = context === 'cultivation' ? '/api/ai/cultivation'
        : context === 'energy' ? '/api/ai/energy'
        : context === 'business' ? '/api/ai/business'
        : context === 'compliance' ? '/api/ai/compliance'
        : '/api/ai/general';

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: input,
          context: initialData || {},
          messageHistory: messages.slice(-5) // Last 5 messages for context
        })
      });

      if (!response.ok) throw new Error('Failed to get AI response');

      const data = await response.json();

      const assistantMessage: AIMessage = {
        id: `msg-${Date.now()}-ai`,
        role: 'assistant',
        content: data.analysis || data.response || 'I apologize, but I couldn\'t generate a response. Please try again.',
        timestamp: new Date(),
        type: 'analysis',
        data: {
          recommendations: data.recommendations,
          confidence: data.confidence,
          insights: data.insights,
          nextSteps: data.nextSteps
        }
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Notify parent component if insights were generated
      if (onInsightGenerated && data.insights) {
        onInsightGenerated(data.insights);
      }
    } catch (error) {
      console.error('Error getting AI response:', error);
      
      const errorMessage: AIMessage = {
        id: `msg-${Date.now()}-error`,
        role: 'assistant',
        content: 'I apologize, but I encountered an error. Please try again or contact support if the issue persists.',
        timestamp: new Date(),
        type: 'alert'
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAction = (query: string) => {
    setInput(query);
    handleSendMessage();
  };

  if (embedded && isMinimized) {
    return (
      <Button
        onClick={() => setIsMinimized(false)}
        className="fixed bottom-4 right-4 rounded-full w-14 h-14 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg"
      >
        <Brain className="w-6 h-6" />
      </Button>
    );
  }

  const assistantContent = (
    <div className="flex flex-col h-full">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <TabsList className="bg-gray-800 border-b border-gray-700">
          <TabsTrigger value="chat">Chat</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="chat" className="flex-1 flex flex-col p-0">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 ? (
              <div className="text-center py-8">
                <Brain className="w-12 h-12 text-purple-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">AI Assistant Ready</h3>
                <p className="text-gray-400 text-sm mb-6">
                  Ask me anything about {context === 'general' ? 'your cultivation facility' : context}
                </p>
                
                {/* Quick Actions */}
                <div className="grid grid-cols-1 gap-2 max-w-sm mx-auto">
                  {quickActions[context].map((action, index) => (
                    <button
                      key={index}
                      onClick={() => handleQuickAction(action.query)}
                      className="flex items-center gap-3 p-3 bg-gray-800 hover:bg-gray-700 rounded-lg text-left transition-colors"
                    >
                      <action.icon className="w-5 h-5 text-purple-400" />
                      <span className="text-sm">{action.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-3 ${
                      message.role === 'user'
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-800 text-gray-200'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    
                    {message.data?.recommendations && (
                      <div className="mt-3 pt-3 border-t border-gray-700">
                        <h4 className="text-xs font-semibold mb-2 flex items-center gap-1">
                          <Lightbulb className="w-3 h-3" />
                          Recommendations
                        </h4>
                        <ul className="space-y-1">
                          {message.data.recommendations.slice(0, 3).map((rec: string, idx: number) => (
                            <li key={idx} className="text-xs flex items-start gap-1">
                              <span className="text-green-400 mt-0.5">•</span>
                              <span>{rec}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {message.data?.confidence && (
                      <div className="mt-2">
                        <Badge variant="outline" className="text-xs">
                          Confidence: {Math.round(message.data.confidence * 100)}%
                        </Badge>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-gray-700">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder={`Ask about ${context === 'general' ? 'anything' : context}...`}
                className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
                disabled={loading}
              />
              <Button
                onClick={handleSendMessage}
                disabled={loading || !input.trim()}
                className="bg-purple-600 hover:bg-purple-700"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="insights" className="p-4">
          <div className="space-y-4">
            <div className="text-center py-8">
              <Sparkles className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">AI-Generated Insights</h3>
              <p className="text-gray-400 text-sm">
                Insights from your conversations will appear here
              </p>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="history" className="p-4">
          <div className="space-y-2">
            {messages.filter(m => m.role === 'user').map((message) => (
              <div
                key={message.id}
                className="p-3 bg-gray-800 rounded-lg cursor-pointer hover:bg-gray-700"
                onClick={() => setInput(message.content)}
              >
                <p className="text-sm">{message.content}</p>
                <p className="text-xs text-gray-400 mt-1">
                  {new Date(message.timestamp).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );

  if (embedded) {
    return (
      <Card className="fixed bottom-4 right-4 w-96 h-[600px] bg-gray-900 border-gray-800 shadow-xl">
        <CardHeader className="flex flex-row items-center justify-between p-4 border-b border-gray-700">
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-purple-400" />
            AI Assistant
          </CardTitle>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMinimized(true)}
            >
              <Minimize2 className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {/* Handle close */}}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0 h-[calc(100%-73px)]">
          {assistantContent}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {assistantContent}
    </div>
  );
}