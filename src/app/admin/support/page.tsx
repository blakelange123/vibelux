"use client"

import { useState, useEffect } from 'react'
import {
  MessageSquare,
  User,
  Clock,
  AlertCircle,
  CheckCircle,
  XCircle,
  Filter,
  Search,
  Tag,
  Paperclip,
  Send,
  ChevronDown,
  ChevronUp,
  Star,
  MoreVertical,
  Mail,
  Phone,
  Calendar,
  MessageCircle,
  ArrowRight,
  RefreshCw,
  Archive,
  Trash2,
  Eye
} from 'lucide-react'

interface Ticket {
  id: string
  subject: string
  description: string
  status: 'open' | 'in_progress' | 'waiting' | 'resolved' | 'closed'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  category: string
  user: {
    id: string
    name: string
    email: string
    tier: string
    avatar?: string
  }
  assignee?: {
    id: string
    name: string
    avatar?: string
  }
  messages: Message[]
  createdAt: string
  updatedAt: string
  resolvedAt?: string
  sla: {
    responseTime: number
    resolutionTime: number
    isBreached: boolean
  }
  tags: string[]
  attachments: number
}

interface Message {
  id: string
  author: {
    id: string
    name: string
    isStaff: boolean
  }
  content: string
  timestamp: string
  attachments?: string[]
}

export default function SupportCenterPage() {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null)
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterPriority, setFilterPriority] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [replyMessage, setReplyMessage] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadTickets()
  }, [filterStatus, filterPriority])

  const loadTickets = async () => {
    // Simulated data - replace with API call
    setTickets([
      {
        id: '1',
        subject: 'Cannot access 3D designer after upgrade',
        description: 'I just upgraded to Professional but the 3D designer is still locked.',
        status: 'open',
        priority: 'high',
        category: 'Technical Issue',
        user: {
          id: 'u1',
          name: 'John Smith',
          email: 'john@example.com',
          tier: 'Professional'
        },
        assignee: {
          id: 'a1',
          name: 'Sarah Chen',
        },
        messages: [
          {
            id: 'm1',
            author: { id: 'u1', name: 'John Smith', isStaff: false },
            content: 'I just upgraded to Professional but the 3D designer is still locked. I\'ve tried logging out and back in but no luck.',
            timestamp: '2 hours ago'
          }
        ],
        createdAt: '2024-02-20T10:30:00Z',
        updatedAt: '2024-02-20T10:30:00Z',
        sla: {
          responseTime: 2,
          resolutionTime: 24,
          isBreached: false
        },
        tags: ['billing', '3d-designer', 'upgrade'],
        attachments: 1
      },
      {
        id: '2',
        subject: 'Energy optimization not calculating correctly',
        description: 'The PPFD calculations seem off for my greenhouse setup.',
        status: 'in_progress',
        priority: 'medium',
        category: 'Bug Report',
        user: {
          id: 'u2',
          name: 'Maria Garcia',
          email: 'maria@greenhouse.com',
          tier: 'Enterprise'
        },
        messages: [
          {
            id: 'm2',
            author: { id: 'u2', name: 'Maria Garcia', isStaff: false },
            content: 'The PPFD calculations seem off for my greenhouse setup. Getting values that are 30% lower than expected.',
            timestamp: '5 hours ago'
          },
          {
            id: 'm3',
            author: { id: 'a1', name: 'Sarah Chen', isStaff: true },
            content: 'Hi Maria, thanks for reporting this. Can you share your fixture configuration and room dimensions?',
            timestamp: '3 hours ago'
          }
        ],
        createdAt: '2024-02-20T07:00:00Z',
        updatedAt: '2024-02-20T09:00:00Z',
        sla: {
          responseTime: 1,
          resolutionTime: 12,
          isBreached: false
        },
        tags: ['calculations', 'ppfd', 'bug'],
        attachments: 3
      },
      {
        id: '3',
        subject: 'Feature request: Export to AutoCAD',
        description: 'Would be great to export designs directly to DWG format.',
        status: 'waiting',
        priority: 'low',
        category: 'Feature Request',
        user: {
          id: 'u3',
          name: 'Robert Chen',
          email: 'robert@design.com',
          tier: 'Professional'
        },
        messages: [
          {
            id: 'm4',
            author: { id: 'u3', name: 'Robert Chen', isStaff: false },
            content: 'Would be great to export designs directly to DWG format for AutoCAD integration.',
            timestamp: '1 day ago'
          }
        ],
        createdAt: '2024-02-19T14:00:00Z',
        updatedAt: '2024-02-19T14:00:00Z',
        sla: {
          responseTime: 4,
          resolutionTime: 72,
          isBreached: false
        },
        tags: ['feature-request', 'export', 'autocad'],
        attachments: 0
      },
      {
        id: '4',
        subject: 'URGENT: Payment failed but account downgraded',
        description: 'My payment failed due to bank issue but account was immediately downgraded.',
        status: 'open',
        priority: 'urgent',
        category: 'Billing Issue',
        user: {
          id: 'u4',
          name: 'Lisa Wang',
          email: 'lisa@cultivation.com',
          tier: 'Free'
        },
        messages: [
          {
            id: 'm5',
            author: { id: 'u4', name: 'Lisa Wang', isStaff: false },
            content: 'My payment failed due to a temporary bank issue but my account was immediately downgraded. I need this resolved ASAP as we have a project deadline.',
            timestamp: '30 minutes ago'
          }
        ],
        createdAt: '2024-02-20T11:30:00Z',
        updatedAt: '2024-02-20T11:30:00Z',
        sla: {
          responseTime: 0.5,
          resolutionTime: 4,
          isBreached: false
        },
        tags: ['urgent', 'billing', 'downgrade'],
        attachments: 2
      }
    ])
    setIsLoading(false)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-blue-500'
      case 'in_progress': return 'bg-yellow-500'
      case 'waiting': return 'bg-purple-500'
      case 'resolved': return 'bg-green-500'
      case 'closed': return 'bg-gray-500'
      default: return 'bg-gray-500'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-500 bg-red-500/10'
      case 'high': return 'text-orange-500 bg-orange-500/10'
      case 'medium': return 'text-yellow-500 bg-yellow-500/10'
      case 'low': return 'text-green-500 bg-green-500/10'
      default: return 'text-gray-500 bg-gray-500/10'
    }
  }

  const filteredTickets = tickets.filter(ticket => {
    const matchesStatus = filterStatus === 'all' || ticket.status === filterStatus
    const matchesPriority = filterPriority === 'all' || ticket.priority === filterPriority
    const matchesSearch = searchQuery === '' || 
      ticket.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.user.email.toLowerCase().includes(searchQuery.toLowerCase())
    
    return matchesStatus && matchesPriority && matchesSearch
  })

  const sendReply = async () => {
    if (!selectedTicket || !replyMessage.trim()) return
    
    // Add reply to ticket
    const newMessage: Message = {
      id: `m${Date.now()}`,
      author: { id: 'admin', name: 'Support Agent', isStaff: true },
      content: replyMessage,
      timestamp: 'Just now'
    }
    
    setSelectedTicket({
      ...selectedTicket,
      messages: [...selectedTicket.messages, newMessage]
    })
    
    setReplyMessage('')
    // TODO: Send to API
  }

  const updateTicketStatus = async (ticketId: string, newStatus: Ticket['status']) => {
    setTickets(tickets.map(ticket => 
      ticket.id === ticketId ? { ...ticket, status: newStatus } : ticket
    ))
    
    if (selectedTicket?.id === ticketId) {
      setSelectedTicket({ ...selectedTicket, status: newStatus })
    }
    
    // TODO: Update in API
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 to-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Support Center</h1>
            <p className="text-gray-400">Manage customer support tickets</p>
          </div>
          <div className="flex items-center gap-4">
            <button className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-white transition-colors">
              Create Ticket
            </button>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-gray-800 rounded-lg p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search tickets..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white"
            >
              <option value="all">All Status</option>
              <option value="open">Open</option>
              <option value="in_progress">In Progress</option>
              <option value="waiting">Waiting</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white"
            >
              <option value="all">All Priority</option>
              <option value="urgent">Urgent</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Ticket List */}
          <div className="lg:col-span-1 bg-gray-800 rounded-lg p-4 max-h-[800px] overflow-y-auto">
            <div className="space-y-3">
              {filteredTickets.map(ticket => (
                <div
                  key={ticket.id}
                  onClick={() => setSelectedTicket(ticket)}
                  className={`p-4 rounded-lg cursor-pointer transition-colors ${
                    selectedTicket?.id === ticket.id 
                      ? 'bg-gray-700 border border-purple-500' 
                      : 'bg-gray-900 hover:bg-gray-700'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${getStatusColor(ticket.status)}`} />
                      <span className={`text-xs px-2 py-1 rounded-full ${getPriorityColor(ticket.priority)}`}>
                        {ticket.priority.toUpperCase()}
                      </span>
                    </div>
                    <span className="text-xs text-gray-500">#{ticket.id}</span>
                  </div>
                  
                  <h3 className="font-medium text-white mb-1 line-clamp-1">{ticket.subject}</h3>
                  <p className="text-sm text-gray-400 line-clamp-2 mb-2">{ticket.description}</p>
                  
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <User className="w-3 h-3 text-gray-500" />
                      <span className="text-gray-400">{ticket.user.name}</span>
                    </div>
                    <span className="text-gray-500">
                      {new Date(ticket.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  
                  {ticket.sla.isBreached && (
                    <div className="mt-2 flex items-center gap-1 text-xs text-red-400">
                      <AlertCircle className="w-3 h-3" />
                      SLA Breached
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Ticket Details */}
          {selectedTicket ? (
            <div className="lg:col-span-2 bg-gray-800 rounded-lg p-6">
              {/* Ticket Header */}
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-xl font-semibold text-white mb-2">{selectedTicket.subject}</h2>
                  <div className="flex items-center gap-4 text-sm">
                    <span className={`px-3 py-1 rounded-full ${getPriorityColor(selectedTicket.priority)}`}>
                      {selectedTicket.priority.toUpperCase()}
                    </span>
                    <select
                      value={selectedTicket.status}
                      onChange={(e) => updateTicketStatus(selectedTicket.id, e.target.value as Ticket['status'])}
                      className="px-3 py-1 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm"
                    >
                      <option value="open">Open</option>
                      <option value="in_progress">In Progress</option>
                      <option value="waiting">Waiting</option>
                      <option value="resolved">Resolved</option>
                      <option value="closed">Closed</option>
                    </select>
                  </div>
                </div>
                <button className="p-2 hover:bg-gray-700 rounded-lg transition-colors">
                  <MoreVertical className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              {/* User Info */}
              <div className="bg-gray-900 rounded-lg p-4 mb-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-white">{selectedTicket.user.name}</p>
                      <p className="text-sm text-gray-400">{selectedTicket.user.email}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-400">Subscription</p>
                    <p className="font-medium text-white">{selectedTicket.user.tier}</p>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
                {selectedTicket.messages.map(message => (
                  <div
                    key={message.id}
                    className={`p-4 rounded-lg ${
                      message.author.isStaff 
                        ? 'bg-purple-900/20 border border-purple-800' 
                        : 'bg-gray-900'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-white">{message.author.name}</span>
                        {message.author.isStaff && (
                          <span className="text-xs px-2 py-1 bg-purple-600 rounded-full text-white">
                            Staff
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-gray-500">{message.timestamp}</span>
                    </div>
                    <p className="text-gray-300">{message.content}</p>
                  </div>
                ))}
              </div>

              {/* Reply Box */}
              <div className="bg-gray-900 rounded-lg p-4">
                <textarea
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  placeholder="Type your reply..."
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500 resize-none"
                  rows={4}
                />
                <div className="mt-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button className="p-2 hover:bg-gray-700 rounded-lg transition-colors">
                      <Paperclip className="w-4 h-4 text-gray-400" />
                    </button>
                  </div>
                  <button
                    onClick={sendReply}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-white transition-colors flex items-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    Send Reply
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="lg:col-span-2 bg-gray-800 rounded-lg p-6 flex items-center justify-center">
              <p className="text-gray-500">Select a ticket to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}