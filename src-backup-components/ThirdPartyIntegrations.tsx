"use client"

import { useState } from 'react'
import { 
  Link2, 
  Check, 
  X, 
  Settings, 
  RefreshCw, 
  AlertCircle,
  Cloud,
  Database,
  FileText,
  BarChart3,
  Calendar,
  MessageSquare,
  Mail,
  Smartphone,
  Building,
  Package,
  Zap,
  Shield,
  ChevronRight,
  ExternalLink
} from 'lucide-react'

interface Integration {
  id: string
  name: string
  category: string
  description: string
  icon: React.FC<any>
  status: 'connected' | 'disconnected' | 'error'
  lastSync?: Date
  features: string[]
  popular?: boolean
}

interface IntegrationCategory {
  id: string
  label: string
  description: string
  icon: React.FC<any>
}

export function ThirdPartyIntegrations() {
  const [activeCategory, setActiveCategory] = useState('all')
  const [integrations, setIntegrations] = useState<Integration[]>([
    // Building Management
    {
      id: 'building-automation',
      name: 'Building Automation Systems',
      category: 'building',
      description: 'Connect with BACnet, Modbus, and KNX systems',
      icon: Building,
      status: 'connected',
      lastSync: new Date(Date.now() - 1000 * 60 * 15),
      features: ['Real-time control', 'Schedule sync', 'Energy monitoring', 'Alarm integration'],
      popular: true
    },
    {
      id: 'hvac-systems',
      name: 'HVAC Control Systems',
      category: 'building',
      description: 'Integrate with climate control systems',
      icon: Building,
      status: 'connected',
      lastSync: new Date(Date.now() - 1000 * 60 * 30),
      features: ['Temperature sync', 'Humidity control', 'VPD optimization', 'Energy saving']
    },
    // Data & Analytics
    {
      id: 'google-sheets',
      name: 'Google Sheets',
      category: 'analytics',
      description: 'Export data and reports to Google Sheets',
      icon: FileText,
      status: 'connected',
      lastSync: new Date(Date.now() - 1000 * 60 * 5),
      features: ['Auto export', 'Real-time sync', 'Custom templates', 'Share reports'],
      popular: true
    },
    {
      id: 'microsoft-excel',
      name: 'Microsoft Excel',
      category: 'analytics',
      description: 'Export to Excel and OneDrive',
      icon: FileText,
      status: 'disconnected',
      features: ['Scheduled exports', 'Custom formatting', 'Cloud sync', 'Templates']
    },
    {
      id: 'tableau',
      name: 'Tableau',
      category: 'analytics',
      description: 'Advanced data visualization and analytics',
      icon: BarChart3,
      status: 'disconnected',
      features: ['Live data connection', 'Custom dashboards', 'Predictive analytics', 'Sharing']
    },
    // IoT & Sensors
    {
      id: 'aws-iot',
      name: 'AWS IoT Core',
      category: 'iot',
      description: 'Connect IoT sensors and devices',
      icon: Cloud,
      status: 'connected',
      lastSync: new Date(Date.now() - 1000 * 60 * 2),
      features: ['Device management', 'Data ingestion', 'Rules engine', 'Security'],
      popular: true
    },
    {
      id: 'azure-iot',
      name: 'Azure IoT Hub',
      category: 'iot',
      description: 'Microsoft Azure IoT platform integration',
      icon: Cloud,
      status: 'disconnected',
      features: ['Device twins', 'Edge computing', 'Stream analytics', 'AI/ML']
    },
    {
      id: 'particle',
      name: 'Particle',
      category: 'iot',
      description: 'Particle IoT platform for sensors',
      icon: Zap,
      status: 'error',
      features: ['Device fleet', 'OTA updates', 'Webhooks', 'Functions']
    },
    // Communication
    {
      id: 'slack',
      name: 'Slack',
      category: 'communication',
      description: 'Get alerts and notifications in Slack',
      icon: MessageSquare,
      status: 'connected',
      lastSync: new Date(),
      features: ['Alert notifications', 'Daily summaries', 'Commands', 'Workflows'],
      popular: true
    },
    {
      id: 'microsoft-teams',
      name: 'Microsoft Teams',
      category: 'communication',
      description: 'Teams integration for collaboration',
      icon: MessageSquare,
      status: 'disconnected',
      features: ['Notifications', 'Bot commands', 'Reports sharing', 'Meetings']
    },
    {
      id: 'email',
      name: 'Email (SMTP)',
      category: 'communication',
      description: 'Email notifications and reports',
      icon: Mail,
      status: 'connected',
      features: ['Alert emails', 'Scheduled reports', 'Custom templates', 'Multiple recipients']
    },
    {
      id: 'twilio',
      name: 'Twilio SMS',
      category: 'communication',
      description: 'SMS alerts for critical events',
      icon: Smartphone,
      status: 'disconnected',
      features: ['SMS alerts', 'WhatsApp', 'Voice calls', 'Global coverage']
    },
    // ERP & Business
    {
      id: 'sap',
      name: 'SAP',
      category: 'erp',
      description: 'SAP ERP integration',
      icon: Package,
      status: 'disconnected',
      features: ['Inventory sync', 'Cost tracking', 'Production planning', 'Reporting']
    },
    {
      id: 'netsuite',
      name: 'NetSuite',
      category: 'erp',
      description: 'Oracle NetSuite ERP integration',
      icon: Package,
      status: 'disconnected',
      features: ['Financial data', 'Inventory', 'CRM sync', 'Custom fields']
    },
    {
      id: 'quickbooks',
      name: 'QuickBooks',
      category: 'erp',
      description: 'Accounting and financial integration',
      icon: Package,
      status: 'connected',
      lastSync: new Date(Date.now() - 1000 * 60 * 60),
      features: ['Invoice sync', 'Cost tracking', 'Tax reports', 'Budgeting']
    },
    // Calendar & Scheduling
    {
      id: 'google-calendar',
      name: 'Google Calendar',
      category: 'calendar',
      description: 'Sync schedules with Google Calendar',
      icon: Calendar,
      status: 'connected',
      lastSync: new Date(Date.now() - 1000 * 60 * 45),
      features: ['Schedule sync', 'Maintenance reminders', 'Team calendars', 'Notifications']
    },
    {
      id: 'outlook-calendar',
      name: 'Outlook Calendar',
      category: 'calendar',
      description: 'Microsoft Outlook calendar sync',
      icon: Calendar,
      status: 'disconnected',
      features: ['Event sync', 'Meeting rooms', 'Team schedules', 'Reminders']
    }
  ])

  const categories: IntegrationCategory[] = [
    { id: 'all', label: 'All Integrations', description: 'View all available integrations', icon: Link2 },
    { id: 'building', label: 'Building Management', description: 'BMS, HVAC, and facility systems', icon: Building },
    { id: 'analytics', label: 'Data & Analytics', description: 'Export and analyze your data', icon: BarChart3 },
    { id: 'iot', label: 'IoT & Sensors', description: 'Connect sensors and devices', icon: Cloud },
    { id: 'communication', label: 'Communication', description: 'Notifications and alerts', icon: MessageSquare },
    { id: 'erp', label: 'ERP & Business', description: 'Business system integrations', icon: Package },
    { id: 'calendar', label: 'Calendar & Scheduling', description: 'Schedule synchronization', icon: Calendar }
  ]

  const getFilteredIntegrations = () => {
    if (activeCategory === 'all') return integrations
    return integrations.filter(int => int.category === activeCategory)
  }

  const getStatusIcon = (status: Integration['status']) => {
    switch (status) {
      case 'connected':
        return <Check className="w-5 h-5 text-green-600" />
      case 'disconnected':
        return <X className="w-5 h-5 text-gray-400" />
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-600" />
    }
  }

  const getStatusText = (status: Integration['status']) => {
    switch (status) {
      case 'connected':
        return 'Connected'
      case 'disconnected':
        return 'Not Connected'
      case 'error':
        return 'Error'
    }
  }

  const handleConnect = (integrationId: string) => {
    setIntegrations(prev => prev.map(int =>
      int.id === integrationId
        ? { ...int, status: 'connected', lastSync: new Date() }
        : int
    ))
  }

  const handleDisconnect = (integrationId: string) => {
    setIntegrations(prev => prev.map(int =>
      int.id === integrationId
        ? { ...int, status: 'disconnected', lastSync: undefined }
        : int
    ))
  }

  const getConnectedCount = () => {
    return integrations.filter(int => int.status === 'connected').length
  }

  const getTimeAgo = (date: Date) => {
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000)
    if (seconds < 60) return 'just now'
    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) return `${minutes}m ago`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}h ago`
    return `${Math.floor(hours / 24)}d ago`
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Link2 className="w-6 h-6 text-indigo-600" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Integrations</h2>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {getConnectedCount()} of {integrations.length} connected
          </span>
          <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
            <Zap className="w-4 h-4" />
            Browse Marketplace
          </button>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {categories.map(category => (
          <button
            key={category.id}
            onClick={() => setActiveCategory(category.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
              activeCategory === category.id
                ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            <category.icon className="w-4 h-4" />
            {category.label}
          </button>
        ))}
      </div>

      {/* Integration Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {getFilteredIntegrations().map(integration => (
          <div
            key={integration.id}
            className="border rounded-lg p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                  <integration.icon className="w-6 h-6 text-gray-700 dark:text-gray-300" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{integration.name}</h3>
                    {integration.popular && (
                      <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 text-xs rounded-full">
                        Popular
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {integration.description}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {getStatusIcon(integration.status)}
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {getStatusText(integration.status)}
                </span>
              </div>
            </div>

            {/* Features */}
            <div className="mb-3">
              <div className="flex flex-wrap gap-2">
                {integration.features.slice(0, 3).map((feature, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-xs rounded"
                  >
                    {feature}
                  </span>
                ))}
                {integration.features.length > 3 && (
                  <span className="px-2 py-1 text-xs text-gray-500">
                    +{integration.features.length - 3} more
                  </span>
                )}
              </div>
            </div>

            {/* Status and Actions */}
            <div className="flex items-center justify-between pt-3 border-t">
              {integration.status === 'connected' && integration.lastSync && (
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <RefreshCw className="w-4 h-4" />
                  <span>Synced {getTimeAgo(integration.lastSync)}</span>
                </div>
              )}
              {integration.status === 'error' && (
                <div className="flex items-center gap-2 text-sm text-red-600">
                  <AlertCircle className="w-4 h-4" />
                  <span>Connection error</span>
                </div>
              )}
              {integration.status === 'disconnected' && (
                <div className="text-sm text-gray-500">Not connected</div>
              )}

              <div className="flex items-center gap-2">
                {integration.status === 'connected' ? (
                  <>
                    <button className="p-1 text-gray-600 hover:text-gray-900 dark:hover:text-white">
                      <Settings className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDisconnect(integration.id)}
                      className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      Disconnect
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => handleConnect(integration.id)}
                    className="px-3 py-1 text-sm bg-indigo-600 text-white rounded hover:bg-indigo-700"
                  >
                    Connect
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* API Access */}
      <div className="mt-8 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="w-5 h-5 text-gray-600" />
            <div>
              <h3 className="font-semibold">API Access</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Build custom integrations with our REST API
              </p>
            </div>
          </div>
          <button className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700">
            View API Docs
            <ExternalLink className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Webhook Configuration */}
      <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Zap className="w-5 h-5 text-blue-600" />
            <div>
              <h3 className="font-semibold">Webhooks</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Get real-time updates when events occur
              </p>
            </div>
          </div>
          <button className="flex items-center gap-2 text-blue-600 hover:text-blue-700">
            Configure
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}