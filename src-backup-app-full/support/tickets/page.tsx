'use client';

import React, { useState } from 'react';
import { useUser } from '@clerk/nextjs';
import {
  Ticket,
  Plus,
  Search,
  Filter,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  MessageSquare,
  Paperclip,
  Send,
  ChevronRight,
  User,
  Calendar,
  Tag,
  ArrowUp,
  ArrowRight,
  Star,
  ThumbsUp,
  ThumbsDown,
  Eye,
  RefreshCw,
  Download,
  MoreVertical
} from 'lucide-react';
import Link from 'next/link';

interface SupportTicket {
  id: string;
  subject: string;
  description: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: string;
  createdAt: Date;
  updatedAt: Date;
  assignee?: {
    name: string;
    avatar?: string;
  };
  messages: TicketMessage[];
  attachments: Attachment[];
  satisfaction?: number;
  tags: string[];
}

interface TicketMessage {
  id: string;
  author: string;
  authorType: 'customer' | 'agent' | 'system';
  content: string;
  timestamp: Date;
  attachments?: Attachment[];
}

interface Attachment {
  id: string;
  name: string;
  size: string;
  type: string;
  url: string;
}

export default function SupportTicketsPage() {
  const { user } = useUser();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [newMessage, setNewMessage] = useState('');

  // Mock tickets data
  const [tickets] = useState<SupportTicket[]>([
    {
      id: 'TKT-001',
      subject: 'LED spectrum configuration not saving',
      description: 'When I try to save my custom spectrum settings, the system shows an error.',
      status: 'in_progress',
      priority: 'high',
      category: 'Technical Issue',
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 3600000),
      assignee: {
        name: 'Alex Chen',
        avatar: '/avatars/alex.jpg'
      },
      messages: [
        {
          id: '1',
          author: user?.fullName || 'You',
          authorType: 'customer',
          content: 'When I try to save my custom spectrum settings, the system shows an error message saying "Failed to save configuration". This happens every time I adjust the blue spectrum above 450nm.',
          timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
        },
        {
          id: '2',
          author: 'Alex Chen',
          authorType: 'agent',
          content: 'Thank you for reporting this issue. I can see the problem in our logs. It appears to be related to the validation rules for spectrum ranges. Let me investigate this further.',
          timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000)
        },
        {
          id: '3',
          author: 'System',
          authorType: 'system',
          content: 'Ticket priority updated to High',
          timestamp: new Date(Date.now() - 20 * 60 * 60 * 1000)
        }
      ],
      attachments: [
        {
          id: '1',
          name: 'error-screenshot.png',
          size: '245 KB',
          type: 'image/png',
          url: '#'
        }
      ],
      tags: ['bug', 'spectrum-config']
    },
    {
      id: 'TKT-002',
      subject: 'Request for bulk export feature',
      description: 'Need ability to export multiple project data at once',
      status: 'open',
      priority: 'medium',
      category: 'Feature Request',
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      messages: [
        {
          id: '1',
          author: user?.fullName || 'You',
          authorType: 'customer',
          content: 'It would be very helpful to have a bulk export feature for project data. Currently, I have to export each project individually which is time-consuming when managing 50+ projects.',
          timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
        }
      ],
      attachments: [],
      tags: ['feature-request', 'export']
    },
    {
      id: 'TKT-003',
      subject: 'Billing question about team seats',
      description: 'How are team seats calculated in the Professional plan?',
      status: 'resolved',
      priority: 'low',
      category: 'Billing',
      createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      assignee: {
        name: 'Sarah Martinez'
      },
      messages: [
        {
          id: '1',
          author: user?.fullName || 'You',
          authorType: 'customer',
          content: 'Can you explain how team seats are calculated? We have 5 seats but I see 6 team members.',
          timestamp: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000)
        },
        {
          id: '2',
          author: 'Sarah Martinez',
          authorType: 'agent',
          content: 'Great question! Team seats are calculated based on active users who have logged in within the last 30 days. Invited users who haven\'t accepted their invitations don\'t count toward your seat limit.',
          timestamp: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000)
        }
      ],
      attachments: [],
      satisfaction: 5,
      tags: ['billing', 'team-management']
    }
  ]);

  const [newTicket, setNewTicket] = useState({
    subject: '',
    category: '',
    priority: 'medium',
    description: '',
    attachments: [] as File[]
  });

  const filteredTickets = tickets.filter(ticket => {
    if (filterStatus !== 'all' && ticket.status !== filterStatus) return false;
    if (searchQuery && !ticket.subject.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !ticket.description.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const handleCreateTicket = () => {
    setShowCreateModal(false);
    setNewTicket({
      subject: '',
      category: '',
      priority: 'medium',
      description: '',
      attachments: []
    });
  };

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedTicket) return;
    
    setNewMessage('');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'text-blue-400 bg-blue-600/20';
      case 'in_progress': return 'text-yellow-400 bg-yellow-600/20';
      case 'resolved': return 'text-green-400 bg-green-600/20';
      case 'closed': return 'text-gray-400 bg-gray-600/20';
      default: return 'text-gray-400 bg-gray-600/20';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-400';
      case 'high': return 'text-orange-400';
      case 'medium': return 'text-yellow-400';
      case 'low': return 'text-gray-400';
      default: return 'text-gray-400';
    }
  };

  const ticketStats = {
    open: tickets.filter(t => t.status === 'open').length,
    inProgress: tickets.filter(t => t.status === 'in_progress').length,
    resolved: tickets.filter(t => t.status === 'resolved').length,
    avgResponseTime: '2.4 hours',
    satisfaction: 4.8
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-sm text-gray-400 mb-4">
          <Link href="/support" className="hover:text-white">Support</Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-white">My Tickets</span>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Support Tickets</h1>
            <p className="text-gray-400">Track and manage your support requests</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            New Ticket
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-5 gap-4 mb-6">
        <div className="bg-gray-800 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Open</p>
              <p className="text-2xl font-bold text-white">{ticketStats.open}</p>
            </div>
            <Clock className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        <div className="bg-gray-800 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">In Progress</p>
              <p className="text-2xl font-bold text-white">{ticketStats.inProgress}</p>
            </div>
            <RefreshCw className="w-8 h-8 text-yellow-600" />
          </div>
        </div>
        <div className="bg-gray-800 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Resolved</p>
              <p className="text-2xl font-bold text-white">{ticketStats.resolved}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
        </div>
        <div className="bg-gray-800 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Avg Response</p>
              <p className="text-2xl font-bold text-white">{ticketStats.avgResponseTime}</p>
            </div>
            <Clock className="w-8 h-8 text-gray-600" />
          </div>
        </div>
        <div className="bg-gray-800 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Satisfaction</p>
              <p className="text-2xl font-bold text-white">{ticketStats.satisfaction}/5</p>
            </div>
            <Star className="w-8 h-8 text-yellow-600" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-gray-800 rounded-xl p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search tickets..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400"
              />
            </div>
          </div>
          
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
          >
            <option value="all">All Status</option>
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>
          
          <button className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg flex items-center gap-2">
            <Filter className="w-4 h-4" />
            More Filters
          </button>
        </div>
      </div>

      {/* Tickets List / Detail View */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Tickets List */}
        <div className="lg:col-span-1 space-y-3">
          {filteredTickets.map(ticket => (
            <div
              key={ticket.id}
              onClick={() => setSelectedTicket(ticket)}
              className={`bg-gray-800 rounded-lg p-4 cursor-pointer transition-all hover:bg-gray-700 ${
                selectedTicket?.id === ticket.id ? 'ring-2 ring-green-500' : ''
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <span className="text-xs text-gray-500">#{ticket.id}</span>
                <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(ticket.status)}`}>
                  {ticket.status.replace('_', ' ')}
                </span>
              </div>
              
              <h3 className="text-white font-medium mb-1 line-clamp-1">{ticket.subject}</h3>
              <p className="text-sm text-gray-400 line-clamp-2 mb-3">{ticket.description}</p>
              
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <span className={`flex items-center gap-1 ${getPriorityColor(ticket.priority)}`}>
                    {ticket.priority === 'urgent' && <ArrowUp className="w-3 h-3" />}
                    {ticket.priority === 'high' && <ArrowUp className="w-3 h-3" />}
                    {ticket.priority === 'medium' && <ArrowRight className="w-3 h-3" />}
                    {ticket.priority}
                  </span>
                  <span className="text-gray-500">{ticket.category}</span>
                </div>
                <span className="text-gray-500">
                  {ticket.updatedAt.toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Ticket Detail */}
        <div className="lg:col-span-2">
          {selectedTicket ? (
            <div className="bg-gray-800 rounded-xl">
              {/* Ticket Header */}
              <div className="p-6 border-b border-gray-700">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-xl font-semibold text-white mb-2">{selectedTicket.subject}</h2>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-gray-400">#{selectedTicket.id}</span>
                      <span className={`px-2 py-1 rounded-full ${getStatusColor(selectedTicket.status)}`}>
                        {selectedTicket.status.replace('_', ' ')}
                      </span>
                      <span className={`flex items-center gap-1 ${getPriorityColor(selectedTicket.priority)}`}>
                        {selectedTicket.priority}
                      </span>
                    </div>
                  </div>
                  <button className="p-2 hover:bg-gray-700 rounded-lg transition-colors">
                    <MoreVertical className="w-5 h-5 text-gray-400" />
                  </button>
                </div>

                <div className="grid md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-gray-400">Created</p>
                    <p className="text-white">{selectedTicket.createdAt.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Last Updated</p>
                    <p className="text-white">{selectedTicket.updatedAt.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Assigned To</p>
                    <p className="text-white">{selectedTicket.assignee?.name || 'Unassigned'}</p>
                  </div>
                </div>

                {selectedTicket.tags.length > 0 && (
                  <div className="flex items-center gap-2 mt-4">
                    <Tag className="w-4 h-4 text-gray-400" />
                    {selectedTicket.tags.map(tag => (
                      <span key={tag} className="px-2 py-1 bg-gray-700 text-xs text-gray-300 rounded">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Messages */}
              <div className="p-6 space-y-4 max-h-96 overflow-y-auto">
                {selectedTicket.messages.map(message => (
                  <div key={message.id} className={`flex gap-3 ${
                    message.authorType === 'customer' ? 'flex-row-reverse' : ''
                  }`}>
                    <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center flex-shrink-0">
                      <User className="w-4 h-4 text-gray-400" />
                    </div>
                    <div className={`flex-1 ${message.authorType === 'customer' ? 'text-right' : ''}`}>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-white">{message.author}</span>
                        <span className="text-xs text-gray-500">
                          {message.timestamp.toLocaleString()}
                        </span>
                      </div>
                      <div className={`inline-block p-3 rounded-lg ${
                        message.authorType === 'customer'
                          ? 'bg-green-600/20 text-gray-200'
                          : message.authorType === 'system'
                          ? 'bg-gray-700 text-gray-400 text-sm italic'
                          : 'bg-gray-700 text-gray-200'
                      }`}>
                        {message.content}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Reply Box */}
              {selectedTicket.status !== 'closed' && (
                <div className="p-6 border-t border-gray-700">
                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      placeholder="Type your message..."
                      className="flex-1 px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400"
                    />
                    <button className="p-2 hover:bg-gray-700 rounded-lg transition-colors">
                      <Paperclip className="w-5 h-5 text-gray-400" />
                    </button>
                    <button
                      onClick={handleSendMessage}
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center gap-2"
                    >
                      <Send className="w-4 h-4" />
                      Send
                    </button>
                  </div>
                </div>
              )}

              {/* Satisfaction Rating */}
              {selectedTicket.status === 'resolved' && !selectedTicket.satisfaction && (
                <div className="p-6 border-t border-gray-700 bg-gray-700/50">
                  <p className="text-white font-medium mb-3">How satisfied are you with the resolution?</p>
                  <div className="flex items-center gap-4">
                    <button className="flex items-center gap-2 px-4 py-2 bg-green-600/20 hover:bg-green-600/30 text-green-400 rounded-lg">
                      <ThumbsUp className="w-4 h-4" />
                      Satisfied
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg">
                      <ThumbsDown className="w-4 h-4" />
                      Not Satisfied
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-gray-800 rounded-xl p-12 text-center">
              <Ticket className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">Select a ticket to view details</p>
            </div>
          )}
        </div>
      </div>

      {/* Create Ticket Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl p-6 max-w-2xl w-full">
            <h3 className="text-xl font-semibold text-white mb-6">Create New Ticket</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Subject
                </label>
                <input
                  type="text"
                  value={newTicket.subject}
                  onChange={(e) => setNewTicket({...newTicket, subject: e.target.value})}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                  placeholder="Brief description of your issue"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Category
                  </label>
                  <select
                    value={newTicket.category}
                    onChange={(e) => setNewTicket({...newTicket, category: e.target.value})}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                  >
                    <option value="">Select category</option>
                    <option value="Technical Issue">Technical Issue</option>
                    <option value="Billing">Billing</option>
                    <option value="Feature Request">Feature Request</option>
                    <option value="Account">Account</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Priority
                  </label>
                  <select
                    value={newTicket.priority}
                    onChange={(e) => setNewTicket({...newTicket, priority: e.target.value})}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  value={newTicket.description}
                  onChange={(e) => setNewTicket({...newTicket, description: e.target.value})}
                  rows={6}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                  placeholder="Please provide detailed information about your issue..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Attachments
                </label>
                <div className="border-2 border-dashed border-gray-600 rounded-lg p-6 text-center">
                  <Paperclip className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-400">
                    Drop files here or click to upload
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Max file size: 10MB
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateTicket}
                className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg"
              >
                Create Ticket
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}