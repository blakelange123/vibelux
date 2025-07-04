'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Bot, 
  User, 
  Send, 
  Lightbulb, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  MessageCircle,
  Sparkles,
  Mic,
  MicOff
} from 'lucide-react';
import { toast } from 'sonner';

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  confidence?: number;
  suggestedActions?: string[];
  relatedQuestions?: string[];
}

interface ClaudeChatAssistantProps {
  facilityId: string;
  className?: string;
  embedded?: boolean;
}

export function ClaudeChatAssistant({ facilityId, className = '', embedded = false }: ClaudeChatAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const recognition = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    // Initialize with welcome message
    setMessages([{
      id: '1',
      type: 'assistant',
      content: "Hi! I'm your VibeLux AI assistant. I can help you analyze your facility data, diagnose issues, optimize performance, and answer questions about your cultivation. What would you like to know?",
      timestamp: new Date(),
      relatedQuestions: [
        "How is my facility performing compared to industry benchmarks?",
        "What's causing the temperature variance in Zone 2?",
        "How can I improve my energy efficiency?",
        "When should I harvest my current batch?"
      ]
    }]);

    // Initialize speech recognition
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      recognition.current = new (window as any).webkitSpeechRecognition();
      recognition.current.continuous = false;
      recognition.current.interimResults = false;
      
      recognition.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        setIsListening(false);
      };
      
      recognition.current.onerror = () => {
        setIsListening(false);
        toast.error('Voice recognition failed');
      };
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: input,
          facilityId,
          context: { timeframe: '24h' }
        }),
      });

      if (response.ok) {
        const data = await response.json();
        
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          type: 'assistant',
          content: data.answer,
          timestamp: new Date(),
          confidence: data.confidence,
          suggestedActions: data.suggestedActions,
          relatedQuestions: data.relatedQuestions,
        };

        setMessages(prev => [...prev, assistantMessage]);
      } else {
        throw new Error('Failed to get response');
      }
    } catch (error) {
      toast.error('Failed to get AI response');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleVoiceInput = () => {
    if (recognition.current && !isListening) {
      setIsListening(true);
      recognition.current.start();
    } else if (isListening) {
      setIsListening(false);
      recognition.current?.stop();
    }
  };

  const handleSuggestedQuestion = (question: string) => {
    setInput(question);
  };

  const quickActions = [
    { text: "Show today's performance", icon: <TrendingUp className="h-4 w-4" /> },
    { text: "Any alerts or issues?", icon: <AlertTriangle className="h-4 w-4" /> },
    { text: "Optimization suggestions", icon: <Lightbulb className="h-4 w-4" /> },
    { text: "Compare to benchmarks", icon: <CheckCircle className="h-4 w-4" /> },
  ];

  if (embedded) {
    return (
      <Card className={`w-full h-96 ${className}`}>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Bot className="h-5 w-5 text-purple-600" />
            VibeLux AI Assistant
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 h-full flex flex-col">
          <ScrollArea className="flex-1 px-4">
            <div className="space-y-4 pb-4">
              {messages.map((message) => (
                <MessageBubble key={message.id} message={message} onQuestionClick={handleSuggestedQuestion} />
              ))}
              {loading && <TypingIndicator />}
              <div ref={scrollRef} />
            </div>
          </ScrollArea>
          
          <div className="p-4 border-t">
            <div className="flex space-x-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask about your facility..."
                className="flex-1"
              />
              {recognition.current && (
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleVoiceInput}
                  className={isListening ? 'bg-red-50 border-red-300' : ''}
                >
                  {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                </Button>
              )}
              <Button onClick={handleSend} disabled={loading || !input.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`max-w-4xl mx-auto space-y-6 ${className}`}>
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Sparkles className="h-6 w-6 text-purple-600" />
            </div>
            VibeLux AI Assistant
            <Badge variant="secondary" className="ml-auto">Powered by Claude</Badge>
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardContent className="p-4">
          <h3 className="text-sm font-medium mb-3">Quick Actions</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {quickActions.map((action, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => handleSuggestedQuestion(action.text)}
                className="justify-start h-auto p-3"
              >
                {action.icon}
                <span className="ml-2 text-left">{action.text}</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Chat Area */}
      <Card className="h-[600px]">
        <CardContent className="p-0 h-full flex flex-col">
          <ScrollArea className="flex-1 p-6">
            <div className="space-y-6">
              {messages.map((message) => (
                <MessageBubble key={message.id} message={message} onQuestionClick={handleSuggestedQuestion} />
              ))}
              {loading && <TypingIndicator />}
              <div ref={scrollRef} />
            </div>
          </ScrollArea>
          
          <div className="p-6 border-t bg-gray-50">
            <div className="flex space-x-3">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me anything about your facility, performance, or cultivation..."
                className="flex-1 bg-white"
              />
              {recognition.current && (
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleVoiceInput}
                  className={isListening ? 'bg-red-50 border-red-300' : ''}
                >
                  {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                </Button>
              )}
              <Button onClick={handleSend} disabled={loading || !input.trim()} size="lg">
                <Send className="h-4 w-4 mr-2" />
                Send
              </Button>
            </div>
            
            {isListening && (
              <div className="mt-2 text-sm text-red-600 flex items-center">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse mr-2"></div>
                Listening... Speak now
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function MessageBubble({ message, onQuestionClick }: { 
  message: Message; 
  onQuestionClick: (question: string) => void;
}) {
  return (
    <div className={`flex gap-3 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
      {message.type === 'assistant' && (
        <div className="flex-shrink-0">
          <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
            <Bot className="h-4 w-4 text-purple-600" />
          </div>
        </div>
      )}
      
      <div className={`max-w-[80%] space-y-3 ${message.type === 'user' ? 'order-2' : ''}`}>
        <div className={`p-4 rounded-lg ${
          message.type === 'user' 
            ? 'bg-purple-600 text-white' 
            : 'bg-gray-100 text-gray-900'
        }`}>
          <p className="whitespace-pre-wrap">{message.content}</p>
          
          {message.confidence && (
            <div className="mt-2 text-xs opacity-75">
              Confidence: {(message.confidence * 100).toFixed(0)}%
            </div>
          )}
        </div>

        {message.suggestedActions && message.suggestedActions.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700">Suggested Actions:</p>
            <div className="space-y-1">
              {message.suggestedActions.map((action, index) => (
                <div key={index} className="flex items-start space-x-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">{action}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {message.relatedQuestions && message.relatedQuestions.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700">You might also ask:</p>
            <div className="space-y-1">
              {message.relatedQuestions.map((question, index) => (
                <Button
                  key={index}
                  variant="ghost"
                  size="sm"
                  onClick={() => onQuestionClick(question)}
                  className="justify-start h-auto p-2 text-left text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                >
                  <MessageCircle className="h-3 w-3 mr-2 flex-shrink-0" />
                  {question}
                </Button>
              ))}
            </div>
          </div>
        )}
      </div>

      {message.type === 'user' && (
        <div className="flex-shrink-0 order-1">
          <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
            <User className="h-4 w-4 text-gray-600" />
          </div>
        </div>
      )}
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex gap-3 justify-start">
      <div className="flex-shrink-0">
        <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
          <Bot className="h-4 w-4 text-purple-600" />
        </div>
      </div>
      <div className="bg-gray-100 rounded-lg p-4">
        <div className="flex space-x-1">
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
      </div>
    </div>
  );
}