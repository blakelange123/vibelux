"use client"
import { useState, useEffect } from 'react'
import {
  Wifi,
  Cloud,
  Server,
  Settings,
  Activity,
  CheckCircle,
  AlertCircle,
  Link2,
  Zap,
  Thermometer,
  Droplets,
  Wind,
  Sun,
  Moon,
  Calendar,
  BarChart3,
  RefreshCw,
  Play,
  Pause,
  Plus,
  Edit,
  Trash2,
  Info,
  Shield,
  Clock
} from 'lucide-react'

interface IntegrationPlatform {
  id: string
  name: string
  logo: string
  description: string
  category: 'greenhouse' | 'automation' | 'iot' | 'analytics'
  status: 'connected' | 'disconnected' | 'error'
  capabilities: string[]
  apiType: 'rest' | 'mqtt' | 'modbus' | 'bacnet'
}

interface AutomationRule {
  id: string
  name: string
  description: string
  platform: string
  trigger: {
    type: 'time' | 'sensor' | 'weather' | 'manual'
    condition: string
    value: any
  }
  actions: {
    type: 'lighting' | 'climate' | 'irrigation' | 'notification'
    target: string
    value: any
  }[]
  enabled: boolean
  lastTriggered?: Date
  nextTrigger?: Date
}

interface SensorData {
  id: string
  name: string
  type: string
  value: number
  unit: string
  timestamp: Date
  status: 'normal' | 'warning' | 'critical'
}

export function SmartGreenhouseIntegration() {
  const [platforms, setPlatforms] = useState<IntegrationPlatform[]>([
    {
      id: 'argus',
      name: 'Argus Controls',
      logo: '🌱',
      description: 'Professional greenhouse automation system',
      category: 'greenhouse',
      status: 'connected',
      capabilities: ['climate', 'lighting', 'irrigation', 'fertigation', 'monitoring'],
      apiType: 'modbus'
    },
    {
      id: 'priva',
      name: 'Priva Connext',
      logo: '🏢',
      description: 'Integrated climate and energy management',
      category: 'greenhouse',
      status: 'disconnected',
      capabilities: ['climate', 'energy', 'water', 'labor', 'analytics'],
      apiType: 'rest'
    },
    {
      id: 'climate-manager',
      name: 'Climate Manager',
      logo: '🌡️',
      description: 'Advanced environmental control system',
      category: 'greenhouse',
      status: 'connected',
      capabilities: ['climate', 'co2', 'humidity', 'temperature', 'vpd'],
      apiType: 'bacnet'
    },
    {
      id: 'ifttt',
      name: 'IFTTT',
      logo: '⚡',
      description: 'If This Then That automation',
      category: 'automation',
      status: 'connected',
      capabilities: ['triggers', 'actions', 'webhooks', 'notifications'],
      apiType: 'rest'
    },
    {
      id: 'zapier',
      name: 'Zapier',
      logo: '⚙️',
      description: 'Workflow automation platform',
      category: 'automation',
      status: 'disconnected',
      capabilities: ['workflows', 'data-sync', 'notifications', 'reporting'],
      apiType: 'rest'
    },
    {
      id: 'home-assistant',
      name: 'Home Assistant',
      logo: '🏠',
      description: 'Open source home automation',
      category: 'iot',
      status: 'connected',
      capabilities: ['devices', 'automations', 'scenes', 'scripts'],
      apiType: 'mqtt'
    }
  ])

  const [automationRules, setAutomationRules] = useState<AutomationRule[]>([
    {
      id: '1',
      name: 'Sunrise Supplemental Lighting',
      description: 'Gradually increase lighting before natural sunrise',
      platform: 'argus',
      trigger: {
        type: 'time',
        condition: 'before_sunrise',
        value: 60 // minutes before sunrise
      },
      actions: [
        {
          type: 'lighting',
          target: 'zone_1_fixtures',
          value: { intensity: 100, duration: 3600 }
        }
      ],
      enabled: true,
      lastTriggered: new Date(Date.now() - 86400000),
      nextTrigger: new Date(Date.now() + 43200000)
    },
    {
      id: '2',
      name: 'High Temperature Response',
      description: 'Reduce lighting when temperature exceeds threshold',
      platform: 'climate-manager',
      trigger: {
        type: 'sensor',
        condition: 'greater_than',
        value: { sensor: 'temp_zone_1', threshold: 30 }
      },
      actions: [
        {
          type: 'lighting',
          target: 'all_fixtures',
          value: { dimming: 70 }
        },
        {
          type: 'notification',
          target: 'admin',
          value: { message: 'High temperature alert - lights dimmed to 70%' }
        }
      ],
      enabled: true
    },
    {
      id: '3',
      name: 'DLI Target Achievement',
      description: 'Adjust lighting to meet daily DLI targets',
      platform: 'home-assistant',
      trigger: {
        type: 'time',
        condition: 'every',
        value: { interval: 3600 } // Check every hour
      },
      actions: [
        {
          type: 'lighting',
          target: 'ml_optimizer',
          value: { mode: 'dli_tracking', target: 18 }
        }
      ],
      enabled: true
    }
  ])

  const [selectedPlatform, setSelectedPlatform] = useState<IntegrationPlatform | null>(null)
  const [sensorData, setSensorData] = useState<SensorData[]>([
    { id: '1', name: 'Zone 1 Temperature', type: 'temperature', value: 24.5, unit: '°C', timestamp: new Date(), status: 'normal' },
    { id: '2', name: 'Zone 1 Humidity', type: 'humidity', value: 65, unit: '%', timestamp: new Date(), status: 'normal' },
    { id: '3', name: 'CO2 Level', type: 'co2', value: 850, unit: 'ppm', timestamp: new Date(), status: 'warning' },
    { id: '4', name: 'Light Intensity', type: 'ppfd', value: 450, unit: 'μmol/m²/s', timestamp: new Date(), status: 'normal' }
  ])
  const [showAddRule, setShowAddRule] = useState(false)

  // Simulate real-time sensor updates
  useEffect(() => {
    const interval = setInterval(() => {
      setSensorData(prevData =>
        prevData.map(sensor => ({
          ...sensor,
          value: sensor.value + (crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF - 0.5) * 2,
          timestamp: new Date()
        }))
      )
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  const connectPlatform = async (platformId: string) => {
    setPlatforms(platforms.map(p =>
      p.id === platformId ? { ...p, status: 'connected' } : p
    ))
  }

  const disconnectPlatform = (platformId: string) => {
    setPlatforms(platforms.map(p =>
      p.id === platformId ? { ...p, status: 'disconnected' } : p
    ))
  }

  const toggleRule = (ruleId: string) => {
    setAutomationRules(rules =>
      rules.map(rule =>
        rule.id === ruleId ? { ...rule, enabled: !rule.enabled } : rule
      )
    )
  }

  const deleteRule = (ruleId: string) => {
    setAutomationRules(rules => rules.filter(rule => rule.id !== ruleId))
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'text-green-400 bg-green-400/10'
      case 'disconnected': return 'text-gray-400 bg-gray-400/10'
      case 'error': return 'text-red-400 bg-red-400/10'
      default: return 'text-gray-400 bg-gray-400/10'
    }
  }

  const getTriggerIcon = (type: string) => {
    switch (type) {
      case 'time': return Clock
      case 'sensor': return Activity
      case 'weather': return Cloud
      case 'manual': return Play
      default: return Zap
    }
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-100 mb-2">Smart Greenhouse Integration</h1>
          <p className="text-gray-400">Connect and automate with leading greenhouse control systems</p>
        </div>
        <button
          onClick={() => setShowAddRule(true)}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Automation
        </button>
      </div>

      {/* Connection Status Overview */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">Connected</span>
            <Link2 className="w-4 h-4 text-green-400" />
          </div>
          <p className="text-2xl font-semibold text-gray-100">
            {platforms.filter(p => p.status === 'connected').length}
          </p>
          <p className="text-xs text-gray-400 mt-1">Active integrations</p>
        </div>
        
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">Automations</span>
            <Zap className="w-4 h-4 text-purple-400" />
          </div>
          <p className="text-2xl font-semibold text-gray-100">
            {automationRules.filter(r => r.enabled).length}
          </p>
          <p className="text-xs text-gray-400 mt-1">Active rules</p>
        </div>
        
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">Sensors</span>
            <Activity className="w-4 h-4 text-blue-400" />
          </div>
          <p className="text-2xl font-semibold text-gray-100">{sensorData.length}</p>
          <p className="text-xs text-gray-400 mt-1">Live feeds</p>
        </div>
        
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">Last Sync</span>
            <RefreshCw className="w-4 h-4 text-gray-400" />
          </div>
          <p className="text-2xl font-semibold text-gray-100">2m</p>
          <p className="text-xs text-gray-400 mt-1">ago</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Platform Integrations */}
        <div className="lg:col-span-2 space-y-6">
          {/* Available Integrations */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-100 mb-4">Integration Platforms</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {platforms.map(platform => (
                <div
                  key={platform.id}
                  className="bg-gray-700 rounded-lg p-4 cursor-pointer hover:bg-gray-600 transition-colors"
                  onClick={() => setSelectedPlatform(platform)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="text-3xl">{platform.logo}</div>
                      <div>
                        <h3 className="font-medium text-gray-100">{platform.name}</h3>
                        <p className="text-sm text-gray-400">{platform.description}</p>
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(platform.status)}`}>
                      {platform.status}
                    </span>
                  </div>
                  
                  <div className="flex flex-wrap gap-1 mb-3">
                    {platform.capabilities.slice(0, 3).map(cap => (
                      <span key={cap} className="px-2 py-1 bg-gray-600 rounded text-xs text-gray-300">
                        {cap}
                      </span>
                    ))}
                    {platform.capabilities.length > 3 && (
                      <span className="px-2 py-1 text-xs text-gray-400">
                        +{platform.capabilities.length - 3} more
                      </span>
                    )}
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-400">API: {platform.apiType.toUpperCase()}</span>
                    {platform.status === 'connected' ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          disconnectPlatform(platform.id)
                        }}
                        className="px-3 py-1 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded text-sm transition-colors"
                      >
                        Disconnect
                      </button>
                    ) : (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          connectPlatform(platform.id)
                        }}
                        className="px-3 py-1 bg-green-600/20 hover:bg-green-600/30 text-green-400 rounded text-sm transition-colors"
                      >
                        Connect
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Automation Rules */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-100 mb-4">Automation Rules</h2>
            <div className="space-y-3">
              {automationRules.map(rule => {
                const TriggerIcon = getTriggerIcon(rule.trigger.type)
                return (
                  <div key={rule.id} className="bg-gray-700 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-start gap-3">
                        <TriggerIcon className="w-5 h-5 text-purple-400 mt-0.5" />
                        <div>
                          <h4 className="font-medium text-gray-100">{rule.name}</h4>
                          <p className="text-sm text-gray-400">{rule.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => toggleRule(rule.id)}
                          className={`px-3 py-1 rounded text-sm transition-colors ${
                            rule.enabled
                              ? 'bg-green-600/20 text-green-400'
                              : 'bg-gray-600 text-gray-400'
                          }`}
                        >
                          {rule.enabled ? 'Enabled' : 'Disabled'}
                        </button>
                        <button
                          onClick={() => deleteRule(rule.id)}
                          className="p-1 hover:bg-gray-600 rounded transition-colors"
                        >
                          <Trash2 className="w-4 h-4 text-gray-400" />
                        </button>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 text-xs text-gray-400">
                      <span className="flex items-center gap-1">
                        <Server className="w-3 h-3" />
                        {platforms.find(p => p.id === rule.platform)?.name}
                      </span>
                      {rule.lastTriggered && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Last: {new Date(rule.lastTriggered).toLocaleString()}
                        </span>
                      )}
                      {rule.nextTrigger && (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          Next: {new Date(rule.nextTrigger).toLocaleString()}
                        </span>
                      )}
                    </div>
                    
                    <div className="mt-3 flex flex-wrap gap-2">
                      {rule.actions.map((action, index) => (
                        <span key={index} className="px-2 py-1 bg-gray-600 rounded text-xs text-gray-300">
                          {action.type}: {action.target}
                        </span>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Real-time Data & Platform Details */}
        <div className="space-y-6">
          {/* Live Sensor Data */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-100 mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-400" />
              Live Sensor Data
            </h3>
            <div className="space-y-3">
              {sensorData.map(sensor => (
                <div key={sensor.id} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-100">{sensor.name}</p>
                    <p className="text-xs text-gray-400">
                      Updated {new Date(sensor.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={`text-lg font-medium ${
                      sensor.status === 'warning' ? 'text-yellow-400' :
                      sensor.status === 'critical' ? 'text-red-400' :
                      'text-gray-100'
                    }`}>
                      {sensor.value.toFixed(1)} {sensor.unit}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Selected Platform Details */}
          {selectedPlatform && (
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-100 mb-4">
                {selectedPlatform.name} Details
              </h3>
              
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-400 mb-2">Status</p>
                  <div className="flex items-center gap-2">
                    {selectedPlatform.status === 'connected' ? (
                      <CheckCircle className="w-5 h-5 text-green-400" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-red-400" />
                    )}
                    <span className={`capitalize ${
                      selectedPlatform.status === 'connected' ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {selectedPlatform.status}
                    </span>
                  </div>
                </div>
                
                <div>
                  <p className="text-sm text-gray-400 mb-2">Capabilities</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedPlatform.capabilities.map(cap => (
                      <span key={cap} className="px-2 py-1 bg-gray-700 rounded text-xs text-gray-300">
                        {cap}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div>
                  <p className="text-sm text-gray-400 mb-2">API Configuration</p>
                  <div className="bg-gray-700 rounded p-3 font-mono text-xs text-gray-300">
                    <p>Type: {selectedPlatform.apiType.toUpperCase()}</p>
                    <p>Endpoint: {selectedPlatform.apiType === 'rest' ? 'https://api.example.com/v1' : 'tcp://192.168.1.100:502'}</p>
                    <p>Auth: {selectedPlatform.apiType === 'rest' ? 'Bearer Token' : 'Device Certificate'}</p>
                  </div>
                </div>
                
                {selectedPlatform.status === 'disconnected' && (
                  <button
                    onClick={() => connectPlatform(selectedPlatform.id)}
                    className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    <Link2 className="w-4 h-4" />
                    Connect Platform
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Security Info */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-100 mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5 text-green-400" />
              Security & Compliance
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-gray-300">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span>End-to-end encryption</span>
              </div>
              <div className="flex items-center gap-2 text-gray-300">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span>OAuth 2.0 authentication</span>
              </div>
              <div className="flex items-center gap-2 text-gray-300">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span>GDPR compliant</span>
              </div>
              <div className="flex items-center gap-2 text-gray-300">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span>Regular security audits</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}