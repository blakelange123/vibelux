"use client"

import { useState, useEffect } from 'react'
import { 
  Terminal, 
  Code, 
  Bug, 
  Activity,
  Database,
  Zap,
  Download,
  Upload,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Clock,
  Copy,
  Check,
  Play,
  Pause,
  BarChart3,
  Settings,
  Shield,
  Menu,
  X
} from 'lucide-react'
import { DeveloperToolsSidebar } from './DeveloperToolsSidebar'

interface LogEntry {
  id: string
  timestamp: Date
  level: 'info' | 'warning' | 'error' | 'debug'
  message: string
  details?: any
}

interface APICall {
  id: string
  timestamp: Date
  method: string
  endpoint: string
  status: number
  duration: number
  size: number
}

interface WebhookEvent {
  id: string
  timestamp: Date
  event: string
  payload: any
  status: 'pending' | 'delivered' | 'failed'
  attempts: number
}

export function DeveloperTools() {
  const [activeTab, setActiveTab] = useState<'console' | 'api' | 'webhooks' | 'database' | 'performance'>('console')
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [apiCalls, setApiCalls] = useState<APICall[]>([])
  const [webhookEvents, setWebhookEvents] = useState<WebhookEvent[]>([])
  const [isRecording, setIsRecording] = useState(true)
  const [logFilter, setLogFilter] = useState<'all' | 'info' | 'warning' | 'error' | 'debug'>('all')
  const [copiedId, setCopiedId] = useState('')
  const [showSidebar, setShowSidebar] = useState(true)

  // Simulate real-time logs
  useEffect(() => {
    if (!isRecording) return

    const interval = setInterval(() => {
      const types: LogEntry['level'][] = ['info', 'warning', 'error', 'debug']
      const messages = [
        'Fixture data loaded successfully',
        'PPFD calculation completed',
        'Warning: High memory usage detected',
        'Error: Failed to connect to sensor',
        'Debug: Cache hit for design_123',
        'WebSocket connection established',
        'Schedule updated for room A',
        'API rate limit: 850/1000 requests'
      ]

      const newLog: LogEntry = {
        id: Date.now().toString(),
        timestamp: new Date(),
        level: types[Math.floor(crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * types.length)],
        message: messages[Math.floor(crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * messages.length)],
        details: crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF > 0.7 ? { requestId: 'req_' + Date.now(), userId: 'user_123' } : undefined
      }

      setLogs(prev => [newLog, ...prev].slice(0, 100))
    }, 2000)

    return () => clearInterval(interval)
  }, [isRecording])

  // Simulate API calls
  useEffect(() => {
    if (!isRecording) return

    const interval = setInterval(() => {
      const methods = ['GET', 'POST', 'PUT', 'DELETE']
      const endpoints = [
        '/api/v1/designs',
        '/api/v1/fixtures/search',
        '/api/v1/calculate/ppfd',
        '/api/v1/sensors/data',
        '/api/v1/auth/refresh'
      ]
      const statuses = [200, 201, 204, 400, 401, 404, 500]

      const newCall: APICall = {
        id: Date.now().toString(),
        timestamp: new Date(),
        method: methods[Math.floor(crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * methods.length)],
        endpoint: endpoints[Math.floor(crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * endpoints.length)],
        status: statuses[Math.floor(crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * statuses.length)],
        duration: Math.floor(crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 500) + 50,
        size: Math.floor(crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 10000) + 500
      }

      setApiCalls(prev => [newCall, ...prev].slice(0, 50))
    }, 3000)

    return () => clearInterval(interval)
  }, [isRecording])

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(''), 2000)
  }

  const getLogIcon = (level: LogEntry['level']) => {
    switch (level) {
      case 'info': return <CheckCircle className="w-4 h-4 text-blue-400" />
      case 'warning': return <AlertCircle className="w-4 h-4 text-yellow-400" />
      case 'error': return <AlertCircle className="w-4 h-4 text-red-400" />
      case 'debug': return <Bug className="w-4 h-4 text-gray-400" />
    }
  }

  const getStatusColor = (status: number) => {
    if (status >= 200 && status < 300) return 'text-green-400'
    if (status >= 400 && status < 500) return 'text-yellow-400'
    return 'text-red-400'
  }

  const filteredLogs = logs.filter(log => logFilter === 'all' || log.level === logFilter)

  const tabs = [
    { id: 'console', label: 'Console', icon: Terminal },
    { id: 'api', label: 'API Monitor', icon: Activity },
    { id: 'webhooks', label: 'Webhooks', icon: Zap },
    { id: 'database', label: 'Database', icon: Database },
    { id: 'performance', label: 'Performance', icon: BarChart3 }
  ]

  return (
    <div className="flex h-full w-full">
      {/* Sidebar */}
      {showSidebar && <DeveloperToolsSidebar />}
      
      {/* Main Content */}
      <div className="flex-1 bg-gray-950 p-6 overflow-auto">
        <div className="bg-gray-800 rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowSidebar(!showSidebar)}
              className="p-2 hover:bg-gray-700 rounded-lg mr-2 text-white"
            >
              {showSidebar ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <Code className="w-6 h-6 text-indigo-400" />
            <h2 className="text-2xl font-bold text-white">Developer Tools</h2>
          </div>
          <div className="flex items-center gap-4">
          <button
            onClick={() => setIsRecording(!isRecording)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
              isRecording
                ? 'bg-red-900 text-red-200 hover:bg-red-800'
                : 'bg-green-900 text-green-200 hover:bg-green-800'
            }`}
          >
            {isRecording ? (
              <>
                <Pause className="w-4 h-4" />
                Pause
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                Resume
              </>
            )}
          </button>
          <button className="p-2 hover:bg-gray-700 rounded-lg text-white">
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-4 mb-6 border-b border-gray-700">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`pb-2 px-1 ${
              activeTab === tab.id
                ? 'border-b-2 border-indigo-400 text-indigo-400'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-2">
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </div>
          </button>
        ))}
      </div>

      {/* Console Tab */}
      {activeTab === 'console' && (
        <div>
          {/* Log Filters */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex gap-2">
              {(['all', 'info', 'warning', 'error', 'debug'] as const).map(filter => (
                <button
                  key={filter}
                  onClick={() => setLogFilter(filter)}
                  className={`px-3 py-1 rounded-lg capitalize text-sm ${
                    logFilter === filter
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
            <button
              onClick={() => setLogs([])}
              className="text-sm text-gray-400 hover:text-white"
            >
              Clear
            </button>
          </div>

          {/* Logs */}
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {filteredLogs.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                No logs to display
              </div>
            ) : (
              filteredLogs.map(log => (
                <div
                  key={log.id}
                  className="p-3 bg-gray-700 rounded-lg hover:bg-gray-600"
                >
                  <div className="flex items-start gap-3">
                    {getLogIcon(log.level)}
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-sm text-white">
                          {log.message}
                        </span>
                        <span className="text-xs text-gray-400">
                          {log.timestamp.toLocaleTimeString()}
                        </span>
                      </div>
                      {log.details && (
                        <pre className="mt-2 p-2 bg-gray-800 rounded text-xs overflow-x-auto text-gray-300">
                          {JSON.stringify(log.details, null, 2)}
                        </pre>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* API Monitor Tab */}
      {activeTab === 'api' && (
        <div>
          {/* API Stats */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="p-3 bg-gray-800 rounded-lg border border-gray-700">
              <p className="text-sm text-gray-400">Total Calls</p>
              <p className="text-2xl font-bold text-gray-100">{apiCalls.length}</p>
            </div>
            <div className="p-3 bg-gray-800 rounded-lg border border-gray-700">
              <p className="text-sm text-gray-400">Success Rate</p>
              <p className="text-2xl font-bold text-gray-100">
                {apiCalls.length > 0
                  ? Math.round(
                      (apiCalls.filter(c => c.status >= 200 && c.status < 300).length / apiCalls.length) * 100
                    )
                  : 0}%
              </p>
            </div>
            <div className="p-3 bg-gray-800 rounded-lg border border-gray-700">
              <p className="text-sm text-gray-400">Avg Response</p>
              <p className="text-2xl font-bold text-gray-100">
                {apiCalls.length > 0
                  ? Math.round(apiCalls.reduce((acc, c) => acc + c.duration, 0) / apiCalls.length)
                  : 0}ms
              </p>
            </div>
            <div className="p-3 bg-gray-800 rounded-lg border border-gray-700">
              <p className="text-sm text-gray-400">Data Transfer</p>
              <p className="text-2xl font-bold text-gray-100">
                {(apiCalls.reduce((acc, c) => acc + c.size, 0) / 1024).toFixed(1)}KB
              </p>
            </div>
          </div>

          {/* API Calls List */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left py-2 text-gray-300">Method</th>
                  <th className="text-left py-2 text-gray-300">Endpoint</th>
                  <th className="text-left py-2 text-gray-300">Status</th>
                  <th className="text-left py-2 text-gray-300">Duration</th>
                  <th className="text-left py-2 text-gray-300">Size</th>
                  <th className="text-left py-2 text-gray-300">Time</th>
                </tr>
              </thead>
              <tbody>
                {apiCalls.map(call => (
                  <tr key={call.id} className="border-b border-gray-700 hover:bg-gray-700">
                    <td className="py-2 text-white">
                      <span className={`font-mono text-sm font-semibold ${
                        call.method === 'GET' ? 'text-green-600' :
                        call.method === 'POST' ? 'text-blue-600' :
                        call.method === 'PUT' ? 'text-yellow-600' :
                        'text-red-600'
                      }`}>
                        {call.method}
                      </span>
                    </td>
                    <td className="py-2 font-mono text-sm text-white">{call.endpoint}</td>
                    <td className="py-2">
                      <span className={`font-mono text-sm ${getStatusColor(call.status)}`}>
                        {call.status}
                      </span>
                    </td>
                    <td className="py-2 text-sm text-white">{call.duration}ms</td>
                    <td className="py-2 text-sm text-white">{(call.size / 1024).toFixed(1)}KB</td>
                    <td className="py-2 text-sm text-gray-400">
                      {call.timestamp.toLocaleTimeString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Webhooks Tab */}
      {activeTab === 'webhooks' && (
        <div>
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Webhook Endpoints</h3>
              <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                Add Endpoint
              </button>
            </div>
            <div className="space-y-3">
              <div className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="font-mono text-sm">https://api.example.com/webhooks/vibelux</span>
                  </div>
                  <button className="text-gray-500 hover:text-gray-700">
                    <Settings className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                  <span>Events: All</span>
                  <span>Last delivery: 2 min ago</span>
                  <span>Success rate: 98%</span>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Recent Events</h3>
            <div className="space-y-2">
              {[
                { event: 'design.created', status: 'delivered', time: '2 min ago' },
                { event: 'sensor.data_received', status: 'delivered', time: '5 min ago' },
                { event: 'fixture.updated', status: 'failed', time: '10 min ago' },
                { event: 'schedule.changed', status: 'delivered', time: '15 min ago' }
              ].map((event, idx) => (
                <div key={idx} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {event.status === 'delivered' ? (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-red-600" />
                      )}
                      <span className="font-mono text-sm">{event.event}</span>
                    </div>
                    <span className="text-sm text-gray-500">{event.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Database Tab */}
      {activeTab === 'database' && (
        <div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <Database className="w-5 h-5 text-indigo-600 mb-2" />
              <p className="text-2xl font-bold text-gray-100">1.2GB</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Size</p>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <Activity className="w-5 h-5 text-green-600 mb-2" />
              <p className="text-2xl font-bold text-gray-100">342</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Queries/min</p>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <Clock className="w-5 h-5 text-yellow-600 mb-2" />
              <p className="text-2xl font-bold text-gray-100">12ms</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Avg Latency</p>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <Shield className="w-5 h-5 text-purple-600 mb-2" />
              <p className="text-2xl font-bold text-gray-100">99.9%</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Uptime</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-3">Recent Queries</h4>
              <div className="space-y-2">
                {[
                  { query: 'SELECT * FROM fixtures WHERE manufacturer = ?', time: '2ms', rows: 156 },
                  { query: 'INSERT INTO sensor_data (device_id, timestamp, ...)', time: '5ms', rows: 1 },
                  { query: 'UPDATE designs SET updated_at = NOW() WHERE id = ?', time: '3ms', rows: 1 },
                  { query: 'SELECT AVG(ppfd) FROM measurements WHERE ...', time: '18ms', rows: 1 }
                ].map((query, idx) => (
                  <div key={idx} className="p-3 bg-gray-50 dark:bg-gray-700 rounded font-mono text-sm">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-gray-600 dark:text-gray-300 truncate flex-1">
                        {query.query}
                      </span>
                      <button
                        onClick={() => copyToClipboard(query.query, `query-${idx}`)}
                        className="ml-2 p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                      >
                        {copiedId === `query-${idx}` ? (
                          <Check className="w-4 h-4 text-green-600" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>{query.time}</span>
                      <span>{query.rows} rows</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-3">Database Actions</h4>
              <div className="grid grid-cols-2 gap-3">
                <button className="flex items-center justify-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
                  <Download className="w-4 h-4" />
                  Export Data
                </button>
                <button className="flex items-center justify-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
                  <Upload className="w-4 h-4" />
                  Import Data
                </button>
                <button className="flex items-center justify-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
                  <RefreshCw className="w-4 h-4" />
                  Run Migration
                </button>
                <button className="flex items-center justify-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
                  <Database className="w-4 h-4" />
                  Backup Now
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Performance Tab */}
      {activeTab === 'performance' && (
        <div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Page Load</p>
              <p className="text-2xl font-bold text-gray-100">1.2s</p>
              <p className="text-xs text-green-600">-15% from last week</p>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">API Response</p>
              <p className="text-2xl font-bold text-gray-100">85ms</p>
              <p className="text-xs text-green-600">-5% from last week</p>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Error Rate</p>
              <p className="text-2xl font-bold text-gray-100">0.2%</p>
              <p className="text-xs text-red-600">+0.1% from last week</p>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Cache Hit</p>
              <p className="text-2xl font-bold text-gray-100">87%</p>
              <p className="text-xs text-green-600">+3% from last week</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-3">Performance Metrics</h4>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm">CPU Usage</span>
                    <span className="text-sm font-medium">45%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-indigo-600 h-2 rounded-full" style={{ width: '45%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm">Memory Usage</span>
                    <span className="text-sm font-medium">62%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-indigo-600 h-2 rounded-full" style={{ width: '62%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm">Disk I/O</span>
                    <span className="text-sm font-medium">23%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-indigo-600 h-2 rounded-full" style={{ width: '23%' }}></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold mb-1">Performance Optimization Suggestions</h4>
                  <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                    <li>• Enable lazy loading for fixture images to reduce initial load time</li>
                    <li>• Implement pagination for large data sets in the API</li>
                    <li>• Consider upgrading Redis cache tier for better performance</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
        </div>
      </div>
    </div>
  )
}