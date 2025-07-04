'use client'

import { useState, useEffect } from 'react'
import {
  Settings,
  Shield,
  Database,
  Mail,
  Bell,
  Key,
  Server,
  Globe,
  Lock,
  Eye,
  EyeOff,
  Save,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Code,
  Palette,
  Users,
  CreditCard,
  Zap,
  Cloud,
  HardDrive,
  Network,
  Cpu,
  BarChart,
  FileText,
  Camera,
  Video,
  Microphone,
  Clock,
  Calendar,
  MapPin,
  Phone,
  ExternalLink,
  Download,
  Upload,
  Trash2,
  Edit,
  Plus,
  Filter
} from 'lucide-react'

interface SystemSettings {
  general: {
    siteName: string
    siteDescription: string
    primaryDomain: string
    supportEmail: string
    noreplyEmail: string
    timezone: string
    dateFormat: string
    currency: string
    language: string
  }
  security: {
    passwordPolicy: {
      minLength: number
      requireUppercase: boolean
      requireLowercase: boolean
      requireNumbers: boolean
      requireSymbols: boolean
      maxAge: number
    }
    sessionTimeout: number
    maxFailedLogins: number
    lockoutDuration: number
    requireMFA: boolean
    allowedDomains: string[]
    ipWhitelist: string[]
  }
  api: {
    rateLimit: {
      enabled: boolean
      requestsPerMinute: number
      requestsPerHour: number
      burstLimit: number
    }
    cors: {
      enabled: boolean
      allowedOrigins: string[]
      allowedMethods: string[]
      allowCredentials: boolean
    }
    webhooks: {
      enabled: boolean
      retryAttempts: number
      timeoutSeconds: number
    }
  }
  email: {
    provider: 'smtp' | 'sendgrid' | 'ses' | 'postmark'
    smtp: {
      host: string
      port: number
      secure: boolean
      username: string
      password: string
    }
    fromName: string
    fromEmail: string
    replyTo: string
    bounceEmail: string
  }
  integrations: {
    stripe: {
      enabled: boolean
      publicKey: string
      secretKey: string
      webhookSecret: string
      webhookEndpoint: string
    }
    sentry: {
      enabled: boolean
      dsn: string
      environment: string
      sampleRate: number
    }
    analytics: {
      enabled: boolean
      provider: 'google' | 'mixpanel' | 'amplitude'
      trackingId: string
    }
  }
  storage: {
    provider: 's3' | 'cloudflare' | 'local'
    s3: {
      bucket: string
      region: string
      accessKey: string
      secretKey: string
      endpoint?: string
    }
    maxFileSize: number
    allowedFileTypes: string[]
    retention: {
      enabled: boolean
      days: number
    }
  }
  backup: {
    enabled: boolean
    frequency: 'daily' | 'weekly' | 'monthly'
    retentionDays: number
    destination: 's3' | 'local'
    encryption: boolean
    notifications: boolean
  }
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<SystemSettings | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeSection, setActiveSection] = useState('general')
  const [isSaving, setSaving] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({})
  const [testResults, setTestResults] = useState<Record<string, any>>({})

  const sections = [
    { id: 'general', name: 'General', icon: Settings },
    { id: 'security', name: 'Security', icon: Shield },
    { id: 'api', name: 'API Settings', icon: Code },
    { id: 'email', name: 'Email', icon: Mail },
    { id: 'integrations', name: 'Integrations', icon: Zap },
    { id: 'storage', name: 'Storage', icon: HardDrive },
    { id: 'backup', name: 'Backup', icon: Database }
  ]

  useEffect(() => {
    loadSettings()
  }, [])

  async function loadSettings() {
    try {
      const response = await fetch('/api/admin/settings')
      const data = await response.json()
      setSettings(data.settings || mockSettings)
    } catch (error) {
      console.error('Error loading settings:', error)
      setSettings(mockSettings)
    } finally {
      setIsLoading(false)
    }
  }

  async function saveSettings() {
    if (!settings) return
    
    setSaving(true)
    try {
      const response = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      })

      if (response.ok) {
        setSaveStatus('success')
        setTimeout(() => setSaveStatus('idle'), 3000)
      } else {
        setSaveStatus('error')
      }
    } catch (error) {
      console.error('Error saving settings:', error)
      setSaveStatus('error')
    } finally {
      setSaving(false)
    }
  }

  async function testIntegration(integration: string) {
    try {
      const response = await fetch(`/api/admin/settings/test/${integration}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      })

      const result = await response.json()
      setTestResults(prev => ({ ...prev, [integration]: result }))
    } catch (error) {
      setTestResults(prev => ({ 
        ...prev, 
        [integration]: { success: false, error: 'Test failed' }
      }))
    }
  }

  function updateSettings(section: keyof SystemSettings, key: string, value: any) {
    if (!settings) return
    
    setSettings({
      ...settings,
      [section]: {
        ...settings[section],
        [key]: value
      }
    })
  }

  function updateNestedSettings(section: keyof SystemSettings, nestedKey: string, key: string, value: any) {
    if (!settings) return
    
    setSettings({
      ...settings,
      [section]: {
        ...settings[section],
        [nestedKey]: {
          ...(settings[section] as any)[nestedKey],
          [key]: value
        }
      }
    })
  }

  function togglePasswordVisibility(field: string) {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }))
  }

  // Mock settings data
  const mockSettings: SystemSettings = {
    general: {
      siteName: 'VibeLux',
      siteDescription: 'Professional Horticultural Lighting Platform',
      primaryDomain: 'vibelux.com',
      supportEmail: 'support@vibelux.com',
      noreplyEmail: 'noreply@vibelux.com',
      timezone: 'America/New_York',
      dateFormat: 'MM/DD/YYYY',
      currency: 'USD',
      language: 'en'
    },
    security: {
      passwordPolicy: {
        minLength: 8,
        requireUppercase: true,
        requireLowercase: true,
        requireNumbers: true,
        requireSymbols: false,
        maxAge: 90
      },
      sessionTimeout: 1440,
      maxFailedLogins: 5,
      lockoutDuration: 30,
      requireMFA: false,
      allowedDomains: ['vibelux.com', 'contractor.vibelux.com'],
      ipWhitelist: []
    },
    api: {
      rateLimit: {
        enabled: true,
        requestsPerMinute: 100,
        requestsPerHour: 1000,
        burstLimit: 150
      },
      cors: {
        enabled: true,
        allowedOrigins: ['https://vibelux.com', 'https://app.vibelux.com'],
        allowedMethods: ['GET', 'POST', 'PUT', 'DELETE'],
        allowCredentials: true
      },
      webhooks: {
        enabled: true,
        retryAttempts: 3,
        timeoutSeconds: 30
      }
    },
    email: {
      provider: 'sendgrid',
      smtp: {
        host: '',
        port: 587,
        secure: false,
        username: '',
        password: ''
      },
      fromName: 'VibeLux',
      fromEmail: 'noreply@vibelux.com',
      replyTo: 'support@vibelux.com',
      bounceEmail: 'bounce@vibelux.com'
    },
    integrations: {
      stripe: {
        enabled: true,
        publicKey: 'pk_live_...',
        secretKey: 'sk_live_...',
        webhookSecret: 'whsec_...',
        webhookEndpoint: 'https://api.vibelux.com/webhooks/stripe'
      },
      sentry: {
        enabled: true,
        dsn: 'https://...@sentry.io/...',
        environment: 'production',
        sampleRate: 0.1
      },
      analytics: {
        enabled: true,
        provider: 'google',
        trackingId: 'GA-...'
      }
    },
    storage: {
      provider: 's3',
      s3: {
        bucket: 'vibelux-storage',
        region: 'us-east-1',
        accessKey: 'AKIA...',
        secretKey: '...',
        endpoint: ''
      },
      maxFileSize: 50,
      allowedFileTypes: ['.jpg', '.jpeg', '.png', '.pdf', '.ies', '.ldt'],
      retention: {
        enabled: true,
        days: 365
      }
    },
    backup: {
      enabled: true,
      frequency: 'daily',
      retentionDays: 30,
      destination: 's3',
      encryption: true,
      notifications: true
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-white">Loading settings...</div>
      </div>
    )
  }

  if (!settings) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-white">Failed to load settings</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 to-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">System Settings</h1>
            <p className="text-gray-400">Configure global system settings and integrations</p>
          </div>
          <div className="flex items-center gap-3">
            {saveStatus === 'success' && (
              <div className="flex items-center gap-2 text-green-400">
                <CheckCircle className="w-4 h-4" />
                <span className="text-sm">Settings saved</span>
              </div>
            )}
            {saveStatus === 'error' && (
              <div className="flex items-center gap-2 text-red-400">
                <XCircle className="w-4 h-4" />
                <span className="text-sm">Save failed</span>
              </div>
            )}
            <button
              onClick={saveSettings}
              disabled={isSaving}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 rounded-lg text-white transition-colors flex items-center gap-2"
            >
              {isSaving ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-gray-800 rounded-lg p-4">
              <nav className="space-y-2">
                {sections.map((section) => {
                  const Icon = section.icon
                  return (
                    <button
                      key={section.id}
                      onClick={() => setActiveSection(section.id)}
                      className={`w-full text-left px-3 py-2 rounded-lg transition-colors flex items-center gap-3 ${
                        activeSection === section.id
                          ? 'bg-purple-600 text-white'
                          : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {section.name}
                    </button>
                  )
                })}
              </nav>
            </div>
          </div>

          {/* Content */}
          <div className="lg:col-span-3">
            <div className="bg-gray-800 rounded-lg p-6">
              {/* General Settings */}
              {activeSection === 'general' && (
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold text-white">General Settings</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Site Name
                      </label>
                      <input
                        type="text"
                        value={settings.general.siteName}
                        onChange={(e) => updateSettings('general', 'siteName', e.target.value)}
                        className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Primary Domain
                      </label>
                      <input
                        type="text"
                        value={settings.general.primaryDomain}
                        onChange={(e) => updateSettings('general', 'primaryDomain', e.target.value)}
                        className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white"
                      />
                    </div>
                    
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Site Description
                      </label>
                      <textarea
                        value={settings.general.siteDescription}
                        onChange={(e) => updateSettings('general', 'siteDescription', e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Support Email
                      </label>
                      <input
                        type="email"
                        value={settings.general.supportEmail}
                        onChange={(e) => updateSettings('general', 'supportEmail', e.target.value)}
                        className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        No-Reply Email
                      </label>
                      <input
                        type="email"
                        value={settings.general.noreplyEmail}
                        onChange={(e) => updateSettings('general', 'noreplyEmail', e.target.value)}
                        className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Timezone
                      </label>
                      <select
                        value={settings.general.timezone}
                        onChange={(e) => updateSettings('general', 'timezone', e.target.value)}
                        className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white"
                      >
                        <option value="America/New_York">Eastern Time</option>
                        <option value="America/Chicago">Central Time</option>
                        <option value="America/Denver">Mountain Time</option>
                        <option value="America/Los_Angeles">Pacific Time</option>
                        <option value="UTC">UTC</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Currency
                      </label>
                      <select
                        value={settings.general.currency}
                        onChange={(e) => updateSettings('general', 'currency', e.target.value)}
                        className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white"
                      >
                        <option value="USD">USD - US Dollar</option>
                        <option value="EUR">EUR - Euro</option>
                        <option value="GBP">GBP - British Pound</option>
                        <option value="CAD">CAD - Canadian Dollar</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Security Settings */}
              {activeSection === 'security' && (
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold text-white">Security Settings</h2>
                  
                  <div>
                    <h3 className="text-lg font-medium text-white mb-4">Password Policy</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Minimum Length
                        </label>
                        <input
                          type="number"
                          min="6"
                          max="32"
                          value={settings.security.passwordPolicy.minLength}
                          onChange={(e) => updateNestedSettings('security', 'passwordPolicy', 'minLength', parseInt(e.target.value))}
                          className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Password Max Age (days)
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={settings.security.passwordPolicy.maxAge}
                          onChange={(e) => updateNestedSettings('security', 'passwordPolicy', 'maxAge', parseInt(e.target.value))}
                          className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white"
                        />
                      </div>
                    </div>
                    
                    <div className="mt-4 space-y-3">
                      {[
                        { key: 'requireUppercase', label: 'Require Uppercase Letters' },
                        { key: 'requireLowercase', label: 'Require Lowercase Letters' },
                        { key: 'requireNumbers', label: 'Require Numbers' },
                        { key: 'requireSymbols', label: 'Require Symbols' }
                      ].map((rule) => (
                        <label key={rule.key} className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={(settings.security.passwordPolicy as any)[rule.key]}
                            onChange={(e) => updateNestedSettings('security', 'passwordPolicy', rule.key, e.target.checked)}
                            className="rounded border-gray-600"
                          />
                          <span className="text-gray-300">{rule.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium text-white mb-4">Session & Access</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Session Timeout (minutes)
                        </label>
                        <input
                          type="number"
                          min="30"
                          value={settings.security.sessionTimeout}
                          onChange={(e) => updateSettings('security', 'sessionTimeout', parseInt(e.target.value))}
                          className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Max Failed Logins
                        </label>
                        <input
                          type="number"
                          min="3"
                          max="10"
                          value={settings.security.maxFailedLogins}
                          onChange={(e) => updateSettings('security', 'maxFailedLogins', parseInt(e.target.value))}
                          className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Lockout Duration (minutes)
                        </label>
                        <input
                          type="number"
                          min="5"
                          value={settings.security.lockoutDuration}
                          onChange={(e) => updateSettings('security', 'lockoutDuration', parseInt(e.target.value))}
                          className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white"
                        />
                      </div>
                      
                      <div className="flex items-center">
                        <label className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={settings.security.requireMFA}
                            onChange={(e) => updateSettings('security', 'requireMFA', e.target.checked)}
                            className="rounded border-gray-600"
                          />
                          <span className="text-gray-300">Require Multi-Factor Authentication</span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* API Settings */}
              {activeSection === 'api' && (
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold text-white">API Settings</h2>
                  
                  <div>
                    <h3 className="text-lg font-medium text-white mb-4">Rate Limiting</h3>
                    <div className="space-y-4">
                      <label className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={settings.api.rateLimit.enabled}
                          onChange={(e) => updateNestedSettings('api', 'rateLimit', 'enabled', e.target.checked)}
                          className="rounded border-gray-600"
                        />
                        <span className="text-gray-300">Enable Rate Limiting</span>
                      </label>
                      
                      {settings.api.rateLimit.enabled && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                              Requests per Minute
                            </label>
                            <input
                              type="number"
                              value={settings.api.rateLimit.requestsPerMinute}
                              onChange={(e) => updateNestedSettings('api', 'rateLimit', 'requestsPerMinute', parseInt(e.target.value))}
                              className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                              Requests per Hour
                            </label>
                            <input
                              type="number"
                              value={settings.api.rateLimit.requestsPerHour}
                              onChange={(e) => updateNestedSettings('api', 'rateLimit', 'requestsPerHour', parseInt(e.target.value))}
                              className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                              Burst Limit
                            </label>
                            <input
                              type="number"
                              value={settings.api.rateLimit.burstLimit}
                              onChange={(e) => updateNestedSettings('api', 'rateLimit', 'burstLimit', parseInt(e.target.value))}
                              className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium text-white mb-4">CORS Settings</h3>
                    <div className="space-y-4">
                      <label className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={settings.api.cors.enabled}
                          onChange={(e) => updateNestedSettings('api', 'cors', 'enabled', e.target.checked)}
                          className="rounded border-gray-600"
                        />
                        <span className="text-gray-300">Enable CORS</span>
                      </label>
                      
                      {settings.api.cors.enabled && (
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                              Allowed Origins (one per line)
                            </label>
                            <textarea
                              value={settings.api.cors.allowedOrigins.join('\n')}
                              onChange={(e) => updateNestedSettings('api', 'cors', 'allowedOrigins', e.target.value.split('\n').filter(Boolean))}
                              rows={4}
                              className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white"
                            />
                          </div>
                          
                          <label className="flex items-center gap-3">
                            <input
                              type="checkbox"
                              checked={settings.api.cors.allowCredentials}
                              onChange={(e) => updateNestedSettings('api', 'cors', 'allowCredentials', e.target.checked)}
                              className="rounded border-gray-600"
                            />
                            <span className="text-gray-300">Allow Credentials</span>
                          </label>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Email Settings */}
              {activeSection === 'email' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-white">Email Settings</h2>
                    <button
                      onClick={() => testIntegration('email')}
                      className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-white text-sm"
                    >
                      Test Email
                    </button>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Email Provider
                    </label>
                    <select
                      value={settings.email.provider}
                      onChange={(e) => updateSettings('email', 'provider', e.target.value)}
                      className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white"
                    >
                      <option value="smtp">SMTP</option>
                      <option value="sendgrid">SendGrid</option>
                      <option value="ses">Amazon SES</option>
                      <option value="postmark">Postmark</option>
                    </select>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        From Name
                      </label>
                      <input
                        type="text"
                        value={settings.email.fromName}
                        onChange={(e) => updateSettings('email', 'fromName', e.target.value)}
                        className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        From Email
                      </label>
                      <input
                        type="email"
                        value={settings.email.fromEmail}
                        onChange={(e) => updateSettings('email', 'fromEmail', e.target.value)}
                        className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Reply-To Email
                      </label>
                      <input
                        type="email"
                        value={settings.email.replyTo}
                        onChange={(e) => updateSettings('email', 'replyTo', e.target.value)}
                        className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Bounce Email
                      </label>
                      <input
                        type="email"
                        value={settings.email.bounceEmail}
                        onChange={(e) => updateSettings('email', 'bounceEmail', e.target.value)}
                        className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white"
                      />
                    </div>
                  </div>
                  
                  {testResults.email && (
                    <div className={`p-3 rounded-lg ${testResults.email.success ? 'bg-green-600/20 border border-green-600/30' : 'bg-red-600/20 border border-red-600/30'}`}>
                      <p className={`text-sm ${testResults.email.success ? 'text-green-400' : 'text-red-400'}`}>
                        {testResults.email.success ? 'Email test successful!' : `Email test failed: ${testResults.email.error}`}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Integrations */}
              {activeSection === 'integrations' && (
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold text-white">Integrations</h2>
                  
                  {/* Stripe */}
                  <div className="border border-gray-700 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <CreditCard className="w-6 h-6 text-purple-400" />
                        <h3 className="text-lg font-medium text-white">Stripe</h3>
                        <span className={`px-2 py-1 rounded-full text-xs ${settings.integrations.stripe.enabled ? 'bg-green-600/20 text-green-400' : 'bg-gray-600/20 text-gray-400'}`}>
                          {settings.integrations.stripe.enabled ? 'Enabled' : 'Disabled'}
                        </span>
                      </div>
                      <button
                        onClick={() => testIntegration('stripe')}
                        className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-white text-sm"
                      >
                        Test Connection
                      </button>
                    </div>
                    
                    <div className="space-y-4">
                      <label className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={settings.integrations.stripe.enabled}
                          onChange={(e) => updateNestedSettings('integrations', 'stripe', 'enabled', e.target.checked)}
                          className="rounded border-gray-600"
                        />
                        <span className="text-gray-300">Enable Stripe Integration</span>
                      </label>
                      
                      {settings.integrations.stripe.enabled && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                              Public Key
                            </label>
                            <input
                              type="text"
                              value={settings.integrations.stripe.publicKey}
                              onChange={(e) => updateNestedSettings('integrations', 'stripe', 'publicKey', e.target.value)}
                              className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                              Secret Key
                            </label>
                            <div className="relative">
                              <input
                                type={showPasswords.stripeSecret ? 'text' : 'password'}
                                value={settings.integrations.stripe.secretKey}
                                onChange={(e) => updateNestedSettings('integrations', 'stripe', 'secretKey', e.target.value)}
                                className="w-full px-3 py-2 pr-10 bg-gray-900 border border-gray-700 rounded-lg text-white"
                              />
                              <button
                                type="button"
                                onClick={() => togglePasswordVisibility('stripeSecret')}
                                className="absolute right-2 top-2 p-1 text-gray-400 hover:text-white"
                              >
                                {showPasswords.stripeSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {testResults.stripe && (
                      <div className={`mt-4 p-3 rounded-lg ${testResults.stripe.success ? 'bg-green-600/20 border border-green-600/30' : 'bg-red-600/20 border border-red-600/30'}`}>
                        <p className={`text-sm ${testResults.stripe.success ? 'text-green-400' : 'text-red-400'}`}>
                          {testResults.stripe.success ? 'Stripe connection successful!' : `Stripe test failed: ${testResults.stripe.error}`}
                        </p>
                      </div>
                    )}
                  </div>
                  
                  {/* Sentry */}
                  <div className="border border-gray-700 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <AlertTriangle className="w-6 h-6 text-orange-400" />
                        <h3 className="text-lg font-medium text-white">Sentry</h3>
                        <span className={`px-2 py-1 rounded-full text-xs ${settings.integrations.sentry.enabled ? 'bg-green-600/20 text-green-400' : 'bg-gray-600/20 text-gray-400'}`}>
                          {settings.integrations.sentry.enabled ? 'Enabled' : 'Disabled'}
                        </span>
                      </div>
                      <button
                        onClick={() => testIntegration('sentry')}
                        className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-white text-sm"
                      >
                        Test Connection
                      </button>
                    </div>
                    
                    <div className="space-y-4">
                      <label className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={settings.integrations.sentry.enabled}
                          onChange={(e) => updateNestedSettings('integrations', 'sentry', 'enabled', e.target.checked)}
                          className="rounded border-gray-600"
                        />
                        <span className="text-gray-300">Enable Sentry Error Tracking</span>
                      </label>
                      
                      {settings.integrations.sentry.enabled && (
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                              DSN
                            </label>
                            <div className="relative">
                              <input
                                type={showPasswords.sentryDsn ? 'text' : 'password'}
                                value={settings.integrations.sentry.dsn}
                                onChange={(e) => updateNestedSettings('integrations', 'sentry', 'dsn', e.target.value)}
                                className="w-full px-3 py-2 pr-10 bg-gray-900 border border-gray-700 rounded-lg text-white"
                              />
                              <button
                                type="button"
                                onClick={() => togglePasswordVisibility('sentryDsn')}
                                className="absolute right-2 top-2 p-1 text-gray-400 hover:text-white"
                              >
                                {showPasswords.sentryDsn ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                              </button>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-300 mb-2">
                                Environment
                              </label>
                              <input
                                type="text"
                                value={settings.integrations.sentry.environment}
                                onChange={(e) => updateNestedSettings('integrations', 'sentry', 'environment', e.target.value)}
                                className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white"
                              />
                            </div>
                            
                            <div>
                              <label className="block text-sm font-medium text-gray-300 mb-2">
                                Sample Rate (0.0 - 1.0)
                              </label>
                              <input
                                type="number"
                                min="0"
                                max="1"
                                step="0.1"
                                value={settings.integrations.sentry.sampleRate}
                                onChange={(e) => updateNestedSettings('integrations', 'sentry', 'sampleRate', parseFloat(e.target.value))}
                                className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white"
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {testResults.sentry && (
                      <div className={`mt-4 p-3 rounded-lg ${testResults.sentry.success ? 'bg-green-600/20 border border-green-600/30' : 'bg-red-600/20 border border-red-600/30'}`}>
                        <p className={`text-sm ${testResults.sentry.success ? 'text-green-400' : 'text-red-400'}`}>
                          {testResults.sentry.success ? 'Sentry connection successful!' : `Sentry test failed: ${testResults.sentry.error}`}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Storage Settings */}
              {activeSection === 'storage' && (
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold text-white">Storage Settings</h2>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Storage Provider
                    </label>
                    <select
                      value={settings.storage.provider}
                      onChange={(e) => updateSettings('storage', 'provider', e.target.value)}
                      className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white"
                    >
                      <option value="s3">Amazon S3</option>
                      <option value="cloudflare">Cloudflare R2</option>
                      <option value="local">Local Storage</option>
                    </select>
                  </div>
                  
                  {settings.storage.provider === 's3' && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium text-white">S3 Configuration</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            Bucket Name
                          </label>
                          <input
                            type="text"
                            value={settings.storage.s3.bucket}
                            onChange={(e) => updateNestedSettings('storage', 's3', 'bucket', e.target.value)}
                            className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            Region
                          </label>
                          <input
                            type="text"
                            value={settings.storage.s3.region}
                            onChange={(e) => updateNestedSettings('storage', 's3', 'region', e.target.value)}
                            className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            Access Key
                          </label>
                          <input
                            type="text"
                            value={settings.storage.s3.accessKey}
                            onChange={(e) => updateNestedSettings('storage', 's3', 'accessKey', e.target.value)}
                            className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            Secret Key
                          </label>
                          <div className="relative">
                            <input
                              type={showPasswords.s3Secret ? 'text' : 'password'}
                              value={settings.storage.s3.secretKey}
                              onChange={(e) => updateNestedSettings('storage', 's3', 'secretKey', e.target.value)}
                              className="w-full px-3 py-2 pr-10 bg-gray-900 border border-gray-700 rounded-lg text-white"
                            />
                            <button
                              type="button"
                              onClick={() => togglePasswordVisibility('s3Secret')}
                              className="absolute right-2 top-2 p-1 text-gray-400 hover:text-white"
                            >
                              {showPasswords.s3Secret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div>
                    <h3 className="text-lg font-medium text-white mb-4">File Upload Settings</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Max File Size (MB)
                        </label>
                        <input
                          type="number"
                          min="1"
                          value={settings.storage.maxFileSize}
                          onChange={(e) => updateSettings('storage', 'maxFileSize', parseInt(e.target.value))}
                          className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Allowed File Types
                        </label>
                        <input
                          type="text"
                          value={settings.storage.allowedFileTypes.join(', ')}
                          onChange={(e) => updateSettings('storage', 'allowedFileTypes', e.target.value.split(',').map(t => t.trim()))}
                          placeholder=".jpg, .png, .pdf"
                          className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Backup Settings */}
              {activeSection === 'backup' && (
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold text-white">Backup Settings</h2>
                  
                  <div className="space-y-4">
                    <label className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={settings.backup.enabled}
                        onChange={(e) => updateSettings('backup', 'enabled', e.target.checked)}
                        className="rounded border-gray-600"
                      />
                      <span className="text-gray-300">Enable Automated Backups</span>
                    </label>
                    
                    {settings.backup.enabled && (
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                              Backup Frequency
                            </label>
                            <select
                              value={settings.backup.frequency}
                              onChange={(e) => updateSettings('backup', 'frequency', e.target.value)}
                              className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white"
                            >
                              <option value="daily">Daily</option>
                              <option value="weekly">Weekly</option>
                              <option value="monthly">Monthly</option>
                            </select>
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                              Retention Period (days)
                            </label>
                            <input
                              type="number"
                              min="1"
                              value={settings.backup.retentionDays}
                              onChange={(e) => updateSettings('backup', 'retentionDays', parseInt(e.target.value))}
                              className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                              Backup Destination
                            </label>
                            <select
                              value={settings.backup.destination}
                              onChange={(e) => updateSettings('backup', 'destination', e.target.value)}
                              className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white"
                            >
                              <option value="s3">Amazon S3</option>
                              <option value="local">Local Storage</option>
                            </select>
                          </div>
                        </div>
                        
                        <div className="space-y-3">
                          <label className="flex items-center gap-3">
                            <input
                              type="checkbox"
                              checked={settings.backup.encryption}
                              onChange={(e) => updateSettings('backup', 'encryption', e.target.checked)}
                              className="rounded border-gray-600"
                            />
                            <span className="text-gray-300">Encrypt Backups</span>
                          </label>
                          
                          <label className="flex items-center gap-3">
                            <input
                              type="checkbox"
                              checked={settings.backup.notifications}
                              onChange={(e) => updateSettings('backup', 'notifications', e.target.checked)}
                              className="rounded border-gray-600"
                            />
                            <span className="text-gray-300">Send Backup Notifications</span>
                          </label>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}