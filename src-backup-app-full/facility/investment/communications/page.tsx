'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import {
  MessageSquare,
  Send,
  Paperclip,
  Bell,
  Users,
  Mail,
  Phone,
  Video,
  Calendar,
  FileText,
  Download,
  AlertCircle,
  CheckCircle2,
  Clock,
  Star,
  Filter,
  Search,
  ChevronRight
} from 'lucide-react';
import { format } from 'date-fns';

interface Message {
  id: string;
  sender: {
    name: string;
    role: 'investor' | 'facility';
    avatar?: string;
  };
  content: string;
  timestamp: Date;
  read: boolean;
  attachments?: string[];
}

interface Thread {
  id: string;
  investor: {
    name: string;
    company?: string;
    avatar?: string;
  };
  subject: string;
  lastMessage: string;
  lastMessageTime: Date;
  unreadCount: number;
  priority: 'high' | 'medium' | 'low';
  investment: {
    type: 'GAAS' | 'YEP' | 'HYBRID';
    amount: number;
  };
}

export default function CommunicationsPage() {
  const [selectedThread, setSelectedThread] = useState<string | null>(null);
  const [messageContent, setMessageContent] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPriority, setFilterPriority] = useState<string>('all');

  // Mock data for communication threads
  const threads: Thread[] = [
    {
      id: '1',
      investor: {
        name: 'Sarah Chen',
        company: 'Green Growth Capital',
        avatar: '/avatars/sarah.jpg'
      },
      subject: 'Q2 Performance Metrics',
      lastMessage: 'Thanks for the detailed report. Can we schedule a call to discuss the energy efficiency improvements?',
      lastMessageTime: new Date('2024-06-22T14:30:00'),
      unreadCount: 2,
      priority: 'high',
      investment: {
        type: 'GAAS',
        amount: 500000
      }
    },
    {
      id: '2',
      investor: {
        name: 'Michael Rodriguez',
        company: 'Sustainable Ventures LLC',
        avatar: '/avatars/michael.jpg'
      },
      subject: 'Monthly Update Request',
      lastMessage: 'Looking forward to the June performance report.',
      lastMessageTime: new Date('2024-06-20T09:15:00'),
      unreadCount: 0,
      priority: 'medium',
      investment: {
        type: 'YEP',
        amount: 250000
      }
    },
    {
      id: '3',
      investor: {
        name: 'Emily Johnson',
        avatar: '/avatars/emily.jpg'
      },
      subject: 'Site Visit Planning',
      lastMessage: 'I can visit anytime next week. What days work best for you?',
      lastMessageTime: new Date('2024-06-19T16:45:00'),
      unreadCount: 1,
      priority: 'medium',
      investment: {
        type: 'HYBRID',
        amount: 750000
      }
    }
  ];

  // Mock messages for selected thread
  const messages: Message[] = selectedThread === '1' ? [
    {
      id: '1',
      sender: {
        name: 'Sarah Chen',
        role: 'investor',
        avatar: '/avatars/sarah.jpg'
      },
      content: 'Hi team, I just reviewed the Q2 performance report. Great job on exceeding the yield targets!',
      timestamp: new Date('2024-06-22T10:00:00'),
      read: true
    },
    {
      id: '2',
      sender: {
        name: 'You',
        role: 'facility'
      },
      content: 'Thank you Sarah! We\'re really proud of the team\'s performance this quarter. The new LED configuration has made a significant difference.',
      timestamp: new Date('2024-06-22T10:30:00'),
      read: true
    },
    {
      id: '3',
      sender: {
        name: 'Sarah Chen',
        role: 'investor',
        avatar: '/avatars/sarah.jpg'
      },
      content: 'I noticed the energy efficiency metrics are improving but still slightly below target. What\'s the plan to address this?',
      timestamp: new Date('2024-06-22T14:00:00'),
      read: true
    },
    {
      id: '4',
      sender: {
        name: 'Sarah Chen',
        role: 'investor',
        avatar: '/avatars/sarah.jpg'
      },
      content: 'Thanks for the detailed report. Can we schedule a call to discuss the energy efficiency improvements?',
      timestamp: new Date('2024-06-22T14:30:00'),
      read: false,
      attachments: ['Energy_Efficiency_Analysis.pdf']
    }
  ] : [];

  const filteredThreads = threads.filter(thread => {
    const matchesSearch = thread.investor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         thread.subject.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPriority = filterPriority === 'all' || thread.priority === filterPriority;
    return matchesSearch && matchesPriority;
  });

  const selectedThreadData = threads.find(t => t.id === selectedThread);

  const sendMessage = () => {
    if (!messageContent.trim()) return;
    // Here you would send the message to your backend
    setMessageContent('');
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'low': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="h-[calc(100vh-200px)] flex flex-col space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Investor Communications</h2>
          <p className="text-muted-foreground">
            Manage conversations with your investors
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline">
            <Bell className="mr-2 h-4 w-4" />
            Notifications
          </Button>
          <Button>
            <Mail className="mr-2 h-4 w-4" />
            New Announcement
          </Button>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-12 gap-6 min-h-0">
        {/* Thread List */}
        <div className="col-span-4 flex flex-col space-y-4">
          <Card className="flex-1 flex flex-col">
            <CardHeader>
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search conversations..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Filter className="h-4 w-4 text-muted-foreground" />
                  <div className="flex space-x-1">
                    <Button
                      variant={filterPriority === 'all' ? 'secondary' : 'ghost'}
                      size="sm"
                      onClick={() => setFilterPriority('all')}
                    >
                      All
                    </Button>
                    <Button
                      variant={filterPriority === 'high' ? 'secondary' : 'ghost'}
                      size="sm"
                      onClick={() => setFilterPriority('high')}
                    >
                      High
                    </Button>
                    <Button
                      variant={filterPriority === 'medium' ? 'secondary' : 'ghost'}
                      size="sm"
                      onClick={() => setFilterPriority('medium')}
                    >
                      Medium
                    </Button>
                    <Button
                      variant={filterPriority === 'low' ? 'secondary' : 'ghost'}
                      size="sm"
                      onClick={() => setFilterPriority('low')}
                    >
                      Low
                    </Button>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex-1 p-0">
              <ScrollArea className="h-full">
                {filteredThreads.map(thread => (
                  <div
                    key={thread.id}
                    className={cn(
                      "p-4 border-b cursor-pointer hover:bg-accent transition-colors",
                      selectedThread === thread.id && "bg-accent"
                    )}
                    onClick={() => setSelectedThread(thread.id)}
                  >
                    <div className="flex items-start space-x-3">
                      <Avatar>
                        <AvatarImage src={thread.investor.avatar} />
                        <AvatarFallback>
                          {thread.investor.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium truncate">
                            {thread.investor.name}
                          </p>
                          <div className="flex items-center space-x-2">
                            <Badge className={getPriorityColor(thread.priority)} variant="secondary">
                              {thread.priority}
                            </Badge>
                            {thread.unreadCount > 0 && (
                              <Badge variant="default" className="h-5 w-5 p-0 flex items-center justify-center">
                                {thread.unreadCount}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground truncate">
                          {thread.investor.company}
                        </p>
                        <p className="text-sm font-medium mt-1 truncate">
                          {thread.subject}
                        </p>
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                          {thread.lastMessage}
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <Badge variant="outline" className="text-xs">
                            {thread.investment.type} - ${(thread.investment.amount / 1000).toFixed(0)}k
                          </Badge>
                          <p className="text-xs text-muted-foreground">
                            {format(thread.lastMessageTime, 'MMM d, h:mm a')}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Message Thread */}
        <div className="col-span-8">
          <Card className="h-full flex flex-col">
            {selectedThread ? (
              <>
                <CardHeader className="border-b">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Avatar>
                        <AvatarImage src={selectedThreadData?.investor.avatar} />
                        <AvatarFallback>
                          {selectedThreadData?.investor.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="text-lg font-semibold">
                          {selectedThreadData?.investor.name}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {selectedThreadData?.investor.company} • {selectedThreadData?.subject}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="icon">
                        <Phone className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Video className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Calendar className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 p-0 flex flex-col">
                  <ScrollArea className="flex-1 p-4">
                    <div className="space-y-4">
                      {messages.map(message => (
                        <div
                          key={message.id}
                          className={cn(
                            "flex space-x-3",
                            message.sender.role === 'facility' && "flex-row-reverse space-x-reverse"
                          )}
                        >
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={message.sender.avatar} />
                            <AvatarFallback>
                              {message.sender.name === 'You' ? 'ME' : message.sender.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div className={cn(
                            "flex-1 space-y-1",
                            message.sender.role === 'facility' && "items-end"
                          )}>
                            <div className={cn(
                              "rounded-lg px-4 py-2 max-w-[80%]",
                              message.sender.role === 'investor' 
                                ? "bg-muted" 
                                : "bg-primary text-primary-foreground ml-auto"
                            )}>
                              <p className="text-sm">{message.content}</p>
                              {message.attachments && message.attachments.length > 0 && (
                                <div className="mt-2 space-y-1">
                                  {message.attachments.map((file, idx) => (
                                    <div key={idx} className="flex items-center space-x-2 text-xs">
                                      <FileText className="h-3 w-3" />
                                      <span className="underline cursor-pointer">{file}</span>
                                      <Download className="h-3 w-3 cursor-pointer" />
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                            <p className={cn(
                              "text-xs text-muted-foreground",
                              message.sender.role === 'facility' && "text-right"
                            )}>
                              {format(message.timestamp, 'h:mm a')}
                              {message.sender.role === 'facility' && !message.read && (
                                <span className="ml-1">• Delivered</span>
                              )}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                  <div className="p-4 border-t">
                    <div className="flex space-x-2">
                      <Button variant="ghost" size="icon">
                        <Paperclip className="h-4 w-4" />
                      </Button>
                      <Input
                        placeholder="Type your message..."
                        value={messageContent}
                        onChange={(e) => setMessageContent(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                        className="flex-1"
                      />
                      <Button onClick={sendMessage}>
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Select a conversation</h3>
                  <p className="text-muted-foreground">
                    Choose a conversation from the list to start messaging
                  </p>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Investors</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+2</span> this month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Response Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2.4h</div>
            <p className="text-xs text-muted-foreground">
              Average response time
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Satisfaction</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4.8/5</div>
            <p className="text-xs text-muted-foreground">
              Based on investor feedback
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Threads</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-yellow-600">3</span> need response
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}