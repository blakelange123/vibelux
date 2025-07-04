'use client'

import { useState, useEffect } from 'react'
import DOMPurify from 'dompurify'
import {
  Mail,
  Send,
  Users,
  Filter,
  Calendar,
  Clock,
  FileText as Template,
  Edit,
  Trash2,
  Copy,
  Eye,
  CheckCircle,
  XCircle,
  AlertTriangle,
  BarChart,
  TrendingUp,
  Search,
  Plus,
  RefreshCw,
  Target,
  Zap,
  FileText,
  Code,
  Image,
  Link2,
  Tag,
  TestTube,
  Settings
} from 'lucide-react'

interface EmailCampaign {
  id: string
  name: string
  subject: string
  status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'failed'
  type: 'broadcast' | 'triggered' | 'drip' | 'transactional'
  audience: {
    type: 'all' | 'segment' | 'tier' | 'custom'
    segments?: string[]
    tiers?: string[]
    filters?: any[]
    count: number
  }
  content: {
    html: string
    text: string
    preheader?: string
  }
  schedule?: {
    sendAt: string
    timezone: string
  }
  stats?: {
    sent: number
    delivered: number
    opened: number
    clicked: number
    bounced: number
    unsubscribed: number
  }
  createdAt: string
  updatedAt: string
  sentAt?: string
  createdBy: string
}

interface EmailTemplate {
  id: string
  name: string
  category: string
  subject: string
  content: {
    html: string
    text: string
  }
  variables: string[]
  thumbnail?: string
}

export default function EmailCampaignsPage() {
  const [campaigns, setCampaigns] = useState<EmailCampaign[]>([])
  const [templates, setTemplates] = useState<EmailTemplate[]>([])
  const [filteredCampaigns, setFilteredCampaigns] = useState<EmailCampaign[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'campaigns' | 'templates' | 'analytics'>('campaigns')
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterType, setFilterType] = useState<string>('all')
  const [selectedCampaign, setSelectedCampaign] = useState<EmailCampaign | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showPreviewModal, setShowPreviewModal] = useState(false)

  // Form state for creating campaigns
  const [formData, setFormData] = useState({
    name: '',
    subject: '',
    type: 'broadcast' as const,
    audienceType: 'all' as const,
    segments: [] as string[],
    tiers: [] as string[],
    templateId: '',
    content: {
      html: '',
      text: '',
      preheader: ''
    },
    schedule: {
      sendAt: '',
      timezone: 'UTC'
    }
  })

  useEffect(() => {
    loadCampaigns()
    loadTemplates()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [campaigns, searchQuery, filterStatus, filterType])

  async function loadCampaigns() {
    try {
      const response = await fetch('/api/admin/email/campaigns')
      const data = await response.json()
      setCampaigns(data.campaigns || mockCampaigns)
    } catch (error) {
      console.error('Error loading campaigns:', error)
      setCampaigns(mockCampaigns)
    } finally {
      setIsLoading(false)
    }
  }

  async function loadTemplates() {
    try {
      const response = await fetch('/api/admin/email/templates')
      const data = await response.json()
      setTemplates(data.templates || mockTemplates)
    } catch (error) {
      console.error('Error loading templates:', error)
      setTemplates(mockTemplates)
    }
  }

  function applyFilters() {
    let filtered = [...campaigns]

    if (searchQuery) {
      filtered = filtered.filter(campaign =>
        campaign.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        campaign.subject.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    if (filterStatus !== 'all') {
      filtered = filtered.filter(campaign => campaign.status === filterStatus)
    }

    if (filterType !== 'all') {
      filtered = filtered.filter(campaign => campaign.type === filterType)
    }

    setFilteredCampaigns(filtered)
  }

  async function createCampaign() {
    try {
      const response = await fetch('/api/admin/email/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        await loadCampaigns()
        setShowCreateModal(false)
        resetForm()
      }
    } catch (error) {
      console.error('Error creating campaign:', error)
    }
  }

  async function sendTestEmail(campaignId: string, testEmail: string) {
    try {
      const response = await fetch(`/api/admin/email/campaigns/${campaignId}/test`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: testEmail })
      })

      if (response.ok) {
        alert('Test email sent successfully!')
      }
    } catch (error) {
      console.error('Error sending test email:', error)
    }
  }

  async function sendCampaign(campaignId: string) {
    if (!confirm('Are you sure you want to send this campaign?')) return

    try {
      const response = await fetch(`/api/admin/email/campaigns/${campaignId}/send`, {
        method: 'POST'
      })

      if (response.ok) {
        await loadCampaigns()
      }
    } catch (error) {
      console.error('Error sending campaign:', error)
    }
  }

  async function deleteCampaign(campaignId: string) {
    if (!confirm('Are you sure you want to delete this campaign?')) return

    try {
      const response = await fetch(`/api/admin/email/campaigns/${campaignId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        await loadCampaigns()
      }
    } catch (error) {
      console.error('Error deleting campaign:', error)
    }
  }

  function resetForm() {
    setFormData({
      name: '',
      subject: '',
      type: 'broadcast',
      audienceType: 'all',
      segments: [],
      tiers: [],
      templateId: '',
      content: {
        html: '',
        text: '',
        preheader: ''
      },
      schedule: {
        sendAt: '',
        timezone: 'UTC'
      }
    })
  }

  function getStatusColor(status: string) {
    switch (status) {
      case 'sent': return 'text-green-400 bg-green-400/10'
      case 'scheduled': return 'text-blue-400 bg-blue-400/10'
      case 'sending': return 'text-yellow-400 bg-yellow-400/10'
      case 'draft': return 'text-gray-400 bg-gray-400/10'
      case 'failed': return 'text-red-400 bg-red-400/10'
      default: return 'text-gray-400 bg-gray-400/10'
    }
  }

  function getTypeIcon(type: string) {
    switch (type) {
      case 'broadcast': return Users
      case 'triggered': return Zap
      case 'drip': return Clock
      case 'transactional': return Mail
      default: return Mail
    }
  }

  // Mock data
  const mockCampaigns: EmailCampaign[] = [
    {
      id: 'c1',
      name: 'December Newsletter',
      subject: '🎄 Holiday Savings on VibeLux Pro Plans!',
      status: 'sent',
      type: 'broadcast',
      audience: {
        type: 'all',
        count: 12847
      },
      content: {
        html: '<h1>Holiday Newsletter</h1>',
        text: 'Holiday Newsletter',
        preheader: 'Save 20% on annual plans this December'
      },
      stats: {
        sent: 12847,
        delivered: 12634,
        opened: 4521,
        clicked: 892,
        bounced: 213,
        unsubscribed: 34
      },
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      sentAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      createdBy: 'admin@vibelux.com'
    },
    {
      id: 'c2',
      name: 'Welcome Series - Email 1',
      subject: 'Welcome to VibeLux! Here\'s how to get started',
      status: 'sending',
      type: 'drip',
      audience: {
        type: 'segment',
        segments: ['new-users'],
        count: 456
      },
      content: {
        html: '<h1>Welcome!</h1>',
        text: 'Welcome!',
        preheader: 'Your journey to better lighting starts here'
      },
      stats: {
        sent: 234,
        delivered: 230,
        opened: 187,
        clicked: 89,
        bounced: 4,
        unsubscribed: 2
      },
      createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
      createdBy: 'admin@vibelux.com'
    },
    {
      id: 'c3',
      name: 'Upgrade to Enterprise',
      subject: 'Unlock Enterprise Features for Your Team',
      status: 'scheduled',
      type: 'triggered',
      audience: {
        type: 'tier',
        tiers: ['professional'],
        count: 2341
      },
      content: {
        html: '<h1>Upgrade Today</h1>',
        text: 'Upgrade Today'
      },
      schedule: {
        sendAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
        timezone: 'America/New_York'
      },
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      createdBy: 'admin@vibelux.com'
    }
  ]

  const mockTemplates: EmailTemplate[] = [
    {
      id: 't1',
      name: 'Welcome Email',
      category: 'Onboarding',
      subject: 'Welcome to {{company_name}}!',
      content: {
        html: '<h1>Welcome {{user_name}}!</h1>',
        text: 'Welcome {{user_name}}!'
      },
      variables: ['user_name', 'company_name', 'activation_link']
    },
    {
      id: 't2',
      name: 'Feature Announcement',
      category: 'Product Updates',
      subject: 'Introducing: {{feature_name}}',
      content: {
        html: '<h1>New Feature Alert!</h1>',
        text: 'New Feature Alert!'
      },
      variables: ['feature_name', 'feature_description', 'cta_link']
    },
    {
      id: 't3',
      name: 'Subscription Renewal',
      category: 'Billing',
      subject: 'Your subscription renews in {{days}} days',
      content: {
        html: '<h1>Subscription Renewal Notice</h1>',
        text: 'Subscription Renewal Notice'
      },
      variables: ['days', 'plan_name', 'renewal_date', 'amount']
    }
  ]

  // Calculate overall stats
  const overallStats = campaigns.reduce((acc, campaign) => {
    if (campaign.stats) {
      acc.totalSent += campaign.stats.sent
      acc.totalOpened += campaign.stats.opened
      acc.totalClicked += campaign.stats.clicked
      acc.totalUnsubscribed += campaign.stats.unsubscribed
    }
    return acc
  }, { totalSent: 0, totalOpened: 0, totalClicked: 0, totalUnsubscribed: 0 })

  const openRate = overallStats.totalSent > 0 
    ? (overallStats.totalOpened / overallStats.totalSent * 100).toFixed(1)
    : '0'
  
  const clickRate = overallStats.totalOpened > 0
    ? (overallStats.totalClicked / overallStats.totalOpened * 100).toFixed(1)
    : '0'

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 to-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Email Campaigns</h1>
            <p className="text-gray-400">Create and manage email campaigns</p>
          </div>
          <button
            onClick={() => {
              resetForm()
              setShowCreateModal(true)
            }}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-white transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Create Campaign
          </button>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <Send className="w-8 h-8 text-blue-400" />
              <span className="text-2xl font-bold text-white">
                {overallStats.totalSent.toLocaleString()}
              </span>
            </div>
            <p className="text-gray-400 text-sm">Emails Sent</p>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <Eye className="w-8 h-8 text-green-400" />
              <span className="text-2xl font-bold text-white">{openRate}%</span>
            </div>
            <p className="text-gray-400 text-sm">Open Rate</p>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <Target className="w-8 h-8 text-purple-400" />
              <span className="text-2xl font-bold text-white">{clickRate}%</span>
            </div>
            <p className="text-gray-400 text-sm">Click Rate</p>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <XCircle className="w-8 h-8 text-red-400" />
              <span className="text-2xl font-bold text-white">
                {overallStats.totalUnsubscribed}
              </span>
            </div>
            <p className="text-gray-400 text-sm">Unsubscribes</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b border-gray-800">
          {['campaigns', 'templates', 'analytics'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`px-4 py-2 font-medium capitalize transition-colors ${
                activeTab === tab
                  ? 'text-white border-b-2 border-purple-500'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Campaigns Tab */}
        {activeTab === 'campaigns' && (
          <>
            {/* Filters */}
            <div className="bg-gray-800 rounded-lg p-6 mb-6">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search campaigns..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-400"
                    />
                  </div>
                </div>
                
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white"
                >
                  <option value="all">All Status</option>
                  <option value="draft">Draft</option>
                  <option value="scheduled">Scheduled</option>
                  <option value="sending">Sending</option>
                  <option value="sent">Sent</option>
                  <option value="failed">Failed</option>
                </select>
                
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white"
                >
                  <option value="all">All Types</option>
                  <option value="broadcast">Broadcast</option>
                  <option value="triggered">Triggered</option>
                  <option value="drip">Drip</option>
                  <option value="transactional">Transactional</option>
                </select>
                
                <button
                  onClick={loadCampaigns}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white transition-colors flex items-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Refresh
                </button>
              </div>
            </div>

            {/* Campaigns List */}
            <div className="space-y-4">
              {filteredCampaigns.map((campaign) => {
                const TypeIcon = getTypeIcon(campaign.type)
                return (
                  <div key={campaign.id} className="bg-gray-800 rounded-lg p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <TypeIcon className="w-5 h-5 text-gray-400" />
                          <h3 className="text-lg font-semibold text-white">{campaign.name}</h3>
                          <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(campaign.status)}`}>
                            {campaign.status}
                          </span>
                        </div>
                        <p className="text-gray-400 mb-1">{campaign.subject}</p>
                        <div className="flex flex-wrap gap-4 text-sm text-gray-400">
                          <span className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            {campaign.audience.count.toLocaleString()} recipients
                          </span>
                          {campaign.schedule && (
                            <span className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              Scheduled: {new Date(campaign.schedule.sendAt).toLocaleString()}
                            </span>
                          )}
                          {campaign.sentAt && (
                            <span className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              Sent: {new Date(campaign.sentAt).toLocaleString()}
                            </span>
                          )}
                        </div>
                        
                        {/* Campaign Stats */}
                        {campaign.stats && campaign.status === 'sent' && (
                          <div className="mt-4 pt-4 border-t border-gray-700">
                            <div className="grid grid-cols-6 gap-4 text-sm">
                              <div>
                                <p className="text-gray-400">Delivered</p>
                                <p className="text-white font-medium">{campaign.stats.delivered.toLocaleString()}</p>
                                <p className="text-xs text-gray-500">
                                  {((campaign.stats.delivered / campaign.stats.sent) * 100).toFixed(1)}%
                                </p>
                              </div>
                              <div>
                                <p className="text-gray-400">Opened</p>
                                <p className="text-white font-medium">{campaign.stats.opened.toLocaleString()}</p>
                                <p className="text-xs text-gray-500">
                                  {((campaign.stats.opened / campaign.stats.delivered) * 100).toFixed(1)}%
                                </p>
                              </div>
                              <div>
                                <p className="text-gray-400">Clicked</p>
                                <p className="text-white font-medium">{campaign.stats.clicked.toLocaleString()}</p>
                                <p className="text-xs text-gray-500">
                                  {((campaign.stats.clicked / campaign.stats.opened) * 100).toFixed(1)}%
                                </p>
                              </div>
                              <div>
                                <p className="text-gray-400">Bounced</p>
                                <p className="text-white font-medium">{campaign.stats.bounced.toLocaleString()}</p>
                                <p className="text-xs text-gray-500">
                                  {((campaign.stats.bounced / campaign.stats.sent) * 100).toFixed(1)}%
                                </p>
                              </div>
                              <div>
                                <p className="text-gray-400">Unsubscribed</p>
                                <p className="text-white font-medium">{campaign.stats.unsubscribed.toLocaleString()}</p>
                                <p className="text-xs text-gray-500">
                                  {((campaign.stats.unsubscribed / campaign.stats.delivered) * 100).toFixed(1)}%
                                </p>
                              </div>
                              <div>
                                <p className="text-gray-400">Engagement</p>
                                <p className="text-white font-medium">
                                  {(((campaign.stats.opened + campaign.stats.clicked) / (campaign.stats.delivered * 2)) * 100).toFixed(1)}%
                                </p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2 ml-4">
                        {campaign.status === 'draft' && (
                          <>
                            <button
                              onClick={() => setSelectedCampaign(campaign)}
                              className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                              title="Edit campaign"
                            >
                              <Edit className="w-4 h-4 text-gray-400" />
                            </button>
                            <button
                              onClick={() => sendTestEmail(campaign.id, 'test@vibelux.com')}
                              className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                              title="Send test email"
                            >
                              <TestTube className="w-4 h-4 text-gray-400" />
                            </button>
                            <button
                              onClick={() => sendCampaign(campaign.id)}
                              className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                              title="Send campaign"
                            >
                              <Send className="w-4 h-4 text-gray-400" />
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => {
                            setSelectedCampaign(campaign)
                            setShowPreviewModal(true)
                          }}
                          className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                          title="Preview"
                        >
                          <Eye className="w-4 h-4 text-gray-400" />
                        </button>
                        <button
                          onClick={() => navigator.clipboard.writeText(campaign.id)}
                          className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                          title="Copy ID"
                        >
                          <Copy className="w-4 h-4 text-gray-400" />
                        </button>
                        <button
                          onClick={() => deleteCampaign(campaign.id)}
                          className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4 text-gray-400" />
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        )}

        {/* Templates Tab */}
        {activeTab === 'templates' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map((template) => (
              <div key={template.id} className="bg-gray-800 rounded-lg p-6 hover:bg-gray-700 transition-colors cursor-pointer">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-white">{template.name}</h3>
                    <p className="text-sm text-gray-400">{template.category}</p>
                  </div>
                  <Template className="w-5 h-5 text-gray-400" />
                </div>
                <p className="text-gray-300 mb-4">{template.subject}</p>
                <div className="flex flex-wrap gap-2">
                  {template.variables.map((variable) => (
                    <span key={variable} className="px-2 py-1 bg-gray-700 rounded text-xs text-gray-300">
                      {`{{${variable}}}`}
                    </span>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t border-gray-700 flex justify-between">
                  <button className="text-sm text-blue-400 hover:text-blue-300">
                    Use Template
                  </button>
                  <button className="text-sm text-gray-400 hover:text-gray-300">
                    Edit
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Campaign Performance</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Average Open Rate</span>
                  <span className="text-white font-medium">{openRate}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Average Click Rate</span>
                  <span className="text-white font-medium">{clickRate}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Total Campaigns</span>
                  <span className="text-white font-medium">{campaigns.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Active Subscribers</span>
                  <span className="text-white font-medium">12,847</span>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Top Performing Campaigns</h2>
              <div className="space-y-3">
                {campaigns
                  .filter(c => c.stats)
                  .sort((a, b) => {
                    const aEngagement = (a.stats!.opened + a.stats!.clicked) / (a.stats!.delivered * 2)
                    const bEngagement = (b.stats!.opened + b.stats!.clicked) / (b.stats!.delivered * 2)
                    return bEngagement - aEngagement
                  })
                  .slice(0, 5)
                  .map((campaign) => {
                    const engagement = ((campaign.stats!.opened + campaign.stats!.clicked) / (campaign.stats!.delivered * 2) * 100).toFixed(1)
                    return (
                      <div key={campaign.id} className="flex items-center justify-between">
                        <div>
                          <p className="text-white">{campaign.name}</p>
                          <p className="text-sm text-gray-400">{new Date(campaign.sentAt!).toLocaleDateString()}</p>
                        </div>
                        <span className="text-green-400 font-medium">{engagement}%</span>
                      </div>
                    )
                  })}
              </div>
            </div>
          </div>
        )}

        {/* Create Campaign Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-gray-800 rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-semibold text-white mb-6">Create Email Campaign</h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Campaign Name
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g., December Newsletter"
                      className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Subject Line
                    </label>
                    <input
                      type="text"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      placeholder="e.g., Check out our latest features!"
                      className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Campaign Type
                    </label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                      className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white"
                    >
                      <option value="broadcast">Broadcast (One-time)</option>
                      <option value="triggered">Triggered (Event-based)</option>
                      <option value="drip">Drip (Series)</option>
                      <option value="transactional">Transactional</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Audience
                    </label>
                    <select
                      value={formData.audienceType}
                      onChange={(e) => setFormData({ ...formData, audienceType: e.target.value as any })}
                      className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white"
                    >
                      <option value="all">All Subscribers</option>
                      <option value="segment">Specific Segment</option>
                      <option value="tier">Subscription Tier</option>
                      <option value="custom">Custom Filter</option>
                    </select>
                  </div>
                  
                  {formData.audienceType === 'tier' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">
                        Select Tiers
                      </label>
                      <div className="space-y-2">
                        {['free', 'startup', 'professional', 'enterprise'].map((tier) => (
                          <label key={tier} className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={formData.tiers.includes(tier)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setFormData({ ...formData, tiers: [...formData.tiers, tier] })
                                } else {
                                  setFormData({ ...formData, tiers: formData.tiers.filter(t => t !== tier) })
                                }
                              }}
                              className="rounded border-gray-600"
                            />
                            <span className="text-sm text-gray-300 capitalize">{tier}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Template
                    </label>
                    <select
                      value={formData.templateId}
                      onChange={(e) => setFormData({ ...formData, templateId: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white"
                    >
                      <option value="">Custom Content</option>
                      {templates.map((template) => (
                        <option key={template.id} value={template.id}>
                          {template.name} ({template.category})
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Schedule
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="datetime-local"
                        value={formData.schedule.sendAt}
                        onChange={(e) => setFormData({
                          ...formData,
                          schedule: { ...formData.schedule, sendAt: e.target.value }
                        })}
                        className="px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white"
                      />
                      <select
                        value={formData.schedule.timezone}
                        onChange={(e) => setFormData({
                          ...formData,
                          schedule: { ...formData.schedule, timezone: e.target.value }
                        })}
                        className="px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white"
                      >
                        <option value="UTC">UTC</option>
                        <option value="America/New_York">Eastern</option>
                        <option value="America/Chicago">Central</option>
                        <option value="America/Denver">Mountain</option>
                        <option value="America/Los_Angeles">Pacific</option>
                      </select>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Preheader Text
                    </label>
                    <input
                      type="text"
                      value={formData.content.preheader}
                      onChange={(e) => setFormData({
                        ...formData,
                        content: { ...formData.content, preheader: e.target.value }
                      })}
                      placeholder="Preview text that appears after subject"
                      className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white"
                    />
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowCreateModal(false)
                    resetForm()
                  }}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={createCampaign}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-white transition-colors"
                >
                  Create Campaign
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Preview Modal */}
        {showPreviewModal && selectedCampaign && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-gray-800 rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-white">Email Preview</h2>
                <button
                  onClick={() => setShowPreviewModal(false)}
                  className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <XCircle className="w-5 h-5 text-gray-400" />
                </button>
              </div>
              
              <div className="bg-gray-900 rounded-lg p-4 mb-4">
                <p className="text-sm text-gray-400 mb-1">Subject:</p>
                <p className="text-white">{selectedCampaign.subject}</p>
                {selectedCampaign.content.preheader && (
                  <>
                    <p className="text-sm text-gray-400 mb-1 mt-2">Preheader:</p>
                    <p className="text-gray-300 text-sm">{selectedCampaign.content.preheader}</p>
                  </>
                )}
              </div>
              
              <div className="bg-white rounded-lg p-6">
                <div dangerouslySetInnerHTML={{ 
                  __html: DOMPurify.sanitize(selectedCampaign.content.html, {
                    ALLOWED_TAGS: ['p', 'div', 'span', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'a', 'img', 'table', 'tr', 'td', 'th', 'tbody', 'thead'],
                    ALLOWED_ATTR: ['href', 'src', 'alt', 'class', 'style', 'width', 'height', 'target', 'rel'],
                    FORBID_TAGS: ['script', 'object', 'embed', 'iframe', 'form', 'input', 'meta'],
                    FORBID_ATTR: ['onclick', 'onload', 'onerror', 'onmouseover', 'onfocus', 'onblur', 'onchange', 'onsubmit', 'javascript:']
                  })
                }} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}