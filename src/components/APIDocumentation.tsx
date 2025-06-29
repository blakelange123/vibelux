"use client"

import { useState } from 'react'
import { 
  Code, 
  Copy, 
  Check, 
  ChevronRight, 
  ChevronDown,
  Lock,
  Globe,
  Zap,
  Database,
  Shield,
  Terminal,
  Book,
  Play,
  ExternalLink,
  Sun,
  BarChart3,
  Activity,
  DollarSign
} from 'lucide-react'

interface APIEndpoint {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  path: string
  description: string
  auth: boolean
  params?: {
    name: string
    type: string
    required: boolean
    description: string
  }[]
  response?: {
    code: number
    example: string
  }
}

interface APISection {
  title: string
  description: string
  icon: React.FC<any>
  endpoints: APIEndpoint[]
}

export function APIDocumentation() {
  const [expandedSection, setExpandedSection] = useState<string>('authentication')
  const [selectedEndpoint, setSelectedEndpoint] = useState<APIEndpoint | null>(null)
  const [copiedCode, setCopiedCode] = useState<string>('')
  const [apiKey] = useState('vblx_test_1234567890abcdef')
  const [selectedLanguage, setSelectedLanguage] = useState<'curl' | 'javascript' | 'python'>('curl')

  const apiSections: APISection[] = [
    {
      title: 'Authentication',
      description: 'Authenticate and manage API access',
      icon: Lock,
      endpoints: [
        {
          method: 'POST',
          path: '/api/v1/auth/token',
          description: 'Generate API access token',
          auth: false,
          params: [
            { name: 'api_key', type: 'string', required: true, description: 'Your API key' },
            { name: 'api_secret', type: 'string', required: true, description: 'Your API secret' }
          ],
          response: {
            code: 200,
            example: JSON.stringify({
              token: 'eyJhbGciOiJIUzI1NiIs...',
              expires_at: '2024-12-31T23:59:59Z'
            }, null, 2)
          }
        },
        {
          method: 'POST',
          path: '/api/v1/auth/refresh',
          description: 'Refresh access token',
          auth: true,
          response: {
            code: 200,
            example: JSON.stringify({
              token: 'eyJhbGciOiJIUzI1NiIs...',
              expires_at: '2024-12-31T23:59:59Z'
            }, null, 2)
          }
        }
      ]
    },
    {
      title: 'Lighting Design',
      description: 'Create and manage lighting designs',
      icon: Sun,
      endpoints: [
        {
          method: 'GET',
          path: '/api/v1/designs',
          description: 'List all lighting designs',
          auth: true,
          params: [
            { name: 'page', type: 'integer', required: false, description: 'Page number (default: 1)' },
            { name: 'limit', type: 'integer', required: false, description: 'Items per page (default: 20)' }
          ],
          response: {
            code: 200,
            example: JSON.stringify({
              data: [
                {
                  id: 'des_123',
                  name: 'Greenhouse A - Veg',
                  created_at: '2024-01-15T10:00:00Z',
                  room_dimensions: { width: 10, length: 20, height: 3 },
                  fixtures_count: 24
                }
              ],
              pagination: { page: 1, limit: 20, total: 45 }
            }, null, 2)
          }
        },
        {
          method: 'POST',
          path: '/api/v1/designs',
          description: 'Create new lighting design',
          auth: true,
          params: [
            { name: 'name', type: 'string', required: true, description: 'Design name' },
            { name: 'room', type: 'object', required: true, description: 'Room configuration' },
            { name: 'target_ppfd', type: 'number', required: true, description: 'Target PPFD (µmol/m²/s)' }
          ],
          response: {
            code: 201,
            example: JSON.stringify({
              id: 'des_124',
              name: 'New Design',
              status: 'created'
            }, null, 2)
          }
        },
        {
          method: 'GET',
          path: '/api/v1/designs/{id}/heatmap',
          description: 'Generate PPFD heatmap for design',
          auth: true,
          response: {
            code: 200,
            example: JSON.stringify({
              grid: [[400, 420, 415], [410, 425, 420], [405, 415, 410]],
              metrics: {
                average: 413.3,
                min: 400,
                max: 425,
                uniformity: 0.94
              }
            }, null, 2)
          }
        }
      ]
    },
    {
      title: 'Fixtures',
      description: 'Access DLC fixture database',
      icon: Database,
      endpoints: [
        {
          method: 'GET',
          path: '/api/v1/fixtures',
          description: 'Search DLC certified fixtures',
          auth: true,
          params: [
            { name: 'manufacturer', type: 'string', required: false, description: 'Filter by manufacturer' },
            { name: 'min_ppe', type: 'number', required: false, description: 'Minimum PPE (µmol/J)' },
            { name: 'max_wattage', type: 'number', required: false, description: 'Maximum wattage' },
            { name: 'category', type: 'string', required: false, description: 'Fixture category' }
          ],
          response: {
            code: 200,
            example: JSON.stringify({
              data: [
                {
                  id: 'fix_789',
                  manufacturer: 'Fluence',
                  model: 'SPYDR 2p',
                  wattage: 645,
                  ppe: 2.7,
                  ppf: 1742
                }
              ],
              total: 1234
            }, null, 2)
          }
        },
        {
          method: 'GET',
          path: '/api/v1/fixtures/{id}',
          description: 'Get fixture details',
          auth: true,
          response: {
            code: 200,
            example: JSON.stringify({
              id: 'fix_789',
              manufacturer: 'Fluence',
              model: 'SPYDR 2p',
              specs: {
                wattage: 645,
                ppe: 2.7,
                ppf: 1742,
                dimensions: { length: 1.2, width: 1.2, height: 0.1 }
              },
              photometric: {
                distribution: 'lambertian',
                beam_angle: 120
              }
            }, null, 2)
          }
        }
      ]
    },
    {
      title: 'Calculations',
      description: 'Perform lighting calculations',
      icon: Zap,
      endpoints: [
        {
          method: 'POST',
          path: '/api/v1/calculate/ppfd',
          description: 'Calculate PPFD at a point',
          auth: true,
          params: [
            { name: 'fixture_ppf', type: 'number', required: true, description: 'Fixture PPF (µmol/s)' },
            { name: 'height', type: 'number', required: true, description: 'Mounting height (m)' },
            { name: 'position', type: 'object', required: true, description: 'Target position {x, y}' }
          ],
          response: {
            code: 200,
            example: JSON.stringify({
              ppfd: 425.5,
              dli: 18.3,
              uniformity_estimate: 0.92
            }, null, 2)
          }
        },
        {
          method: 'POST',
          path: '/api/v1/calculate/energy',
          description: 'Calculate energy costs',
          auth: true,
          params: [
            { name: 'fixtures', type: 'array', required: true, description: 'Array of fixture configs' },
            { name: 'photoperiod', type: 'number', required: true, description: 'Hours of operation' },
            { name: 'cost_per_kwh', type: 'number', required: true, description: 'Energy cost ($/kWh)' }
          ],
          response: {
            code: 200,
            example: JSON.stringify({
              daily_kwh: 154.8,
              daily_cost: 18.58,
              monthly_cost: 557.40,
              annual_cost: 6688.80
            }, null, 2)
          }
        }
      ]
    },
    {
      title: 'Sensors & IoT',
      description: 'Manage sensor data and IoT devices',
      icon: Activity,
      endpoints: [
        {
          method: 'POST',
          path: '/api/v1/sensors/data',
          description: 'Submit sensor readings',
          auth: true,
          params: [
            { name: 'device_id', type: 'string', required: true, description: 'Device identifier' },
            { name: 'timestamp', type: 'string', required: true, description: 'ISO 8601 timestamp' },
            { name: 'readings', type: 'object', required: true, description: 'Sensor readings' }
          ],
          response: {
            code: 201,
            example: JSON.stringify({
              status: 'accepted',
              id: 'reading_456'
            }, null, 2)
          }
        },
        {
          method: 'GET',
          path: '/api/v1/sensors/{device_id}/history',
          description: 'Get historical sensor data',
          auth: true,
          params: [
            { name: 'start_date', type: 'string', required: true, description: 'Start date (ISO 8601)' },
            { name: 'end_date', type: 'string', required: true, description: 'End date (ISO 8601)' },
            { name: 'interval', type: 'string', required: false, description: 'Data interval (1h, 1d)' }
          ],
          response: {
            code: 200,
            example: JSON.stringify({
              device_id: 'sensor_123',
              data: [
                {
                  timestamp: '2024-01-15T10:00:00Z',
                  ppfd: 425,
                  temperature: 24.5,
                  humidity: 65
                }
              ]
            }, null, 2)
          }
        }
      ]
    }
  ]

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopiedCode(id)
    setTimeout(() => setCopiedCode(''), 2000)
  }

  const generateCodeExample = (endpoint: APIEndpoint) => {
    const baseUrl = 'https://api.vibelux.com'
    const fullPath = `${baseUrl}${endpoint.path}`

    switch (selectedLanguage) {
      case 'curl':
        return `curl -X ${endpoint.method} "${fullPath}" \\
  -H "Authorization: Bearer YOUR_TOKEN" \\
  -H "Content-Type: application/json"${endpoint.method !== 'GET' ? ` \\
  -d '{
    "key": "value"
  }'` : ''}`

      case 'javascript':
        return `const response = await fetch("${fullPath}", {
  method: "${endpoint.method}",
  headers: {
    "Authorization": "Bearer YOUR_TOKEN",
    "Content-Type": "application/json"
  }${endpoint.method !== 'GET' ? `,
  body: JSON.stringify({
    key: "value"
  })` : ''}
});

const data = await response.json();
// Process API response data
};`

      case 'python':
        return `import requests

headers = {
    "Authorization": "Bearer YOUR_TOKEN",
    "Content-Type": "application/json"
}

response = requests.${endpoint.method.toLowerCase()}(
    "${fullPath}",
    headers=headers${endpoint.method !== 'GET' ? `,
    json={"key": "value"}` : ''}
)

data = response.json()
print(data)`
    }
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Code className="w-6 h-6 text-indigo-600" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">API Documentation</h2>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600 dark:text-gray-400">API Version: v1</span>
          <a
            href="https://api.vibelux.com/swagger"
            className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700"
          >
            <Book className="w-4 h-4" />
            OpenAPI Spec
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>

      {/* API Key Display */}
      <div className="mb-8 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold">Your API Key</h3>
          <Shield className="w-5 h-5 text-gray-600" />
        </div>
        <div className="flex items-center gap-2">
          <code className="flex-1 px-3 py-2 bg-gray-900 text-green-400 rounded font-mono text-sm">
            {apiKey}
          </code>
          <button
            onClick={() => copyToClipboard(apiKey, 'apikey')}
            className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
          >
            {copiedCode === 'apikey' ? (
              <Check className="w-5 h-5 text-green-600" />
            ) : (
              <Copy className="w-5 h-5" />
            )}
          </button>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
          Keep your API key secure. Regenerate if compromised.
        </p>
      </div>

      {/* Base URL */}
      <div className="mb-8">
        <h3 className="font-semibold mb-2">Base URL</h3>
        <div className="flex items-center gap-2 p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
          <Globe className="w-5 h-5 text-gray-600" />
          <code className="font-mono">https://api.vibelux.com</code>
        </div>
      </div>

      {/* Rate Limits */}
      <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 border rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-5 h-5 text-yellow-600" />
            <h4 className="font-semibold">Rate Limits</h4>
          </div>
          <p className="text-2xl font-bold">1000</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">requests/hour</p>
        </div>
        <div className="p-4 border rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Database className="w-5 h-5 text-blue-600" />
            <h4 className="font-semibold">Data Retention</h4>
          </div>
          <p className="text-2xl font-bold">90</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">days</p>
        </div>
        <div className="p-4 border rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="w-5 h-5 text-green-600" />
            <h4 className="font-semibold">SSL/TLS</h4>
          </div>
          <p className="text-2xl font-bold">TLS 1.3</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">required</p>
        </div>
      </div>

      {/* API Sections */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Endpoints List */}
        <div className="md:col-span-1">
          <h3 className="font-semibold mb-4">Endpoints</h3>
          <div className="space-y-2">
            {apiSections.map(section => (
              <div key={section.title} className="border rounded-lg overflow-hidden">
                <button
                  onClick={() => setExpandedSection(
                    expandedSection === section.title.toLowerCase() ? '' : section.title.toLowerCase()
                  )}
                  className="w-full p-3 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <div className="flex items-center gap-2">
                    <section.icon className="w-4 h-4 text-gray-600" />
                    <span className="font-medium">{section.title}</span>
                  </div>
                  {expandedSection === section.title.toLowerCase() ? (
                    <ChevronDown className="w-4 h-4" />
                  ) : (
                    <ChevronRight className="w-4 h-4" />
                  )}
                </button>
                {expandedSection === section.title.toLowerCase() && (
                  <div className="border-t">
                    {section.endpoints.map((endpoint, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedEndpoint(endpoint)}
                        className={`w-full p-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 border-b last:border-b-0 ${
                          selectedEndpoint === endpoint ? 'bg-indigo-50 dark:bg-indigo-900/20' : ''
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className={`text-xs font-mono font-semibold ${
                            endpoint.method === 'GET' ? 'text-green-600' :
                            endpoint.method === 'POST' ? 'text-blue-600' :
                            endpoint.method === 'PUT' ? 'text-yellow-600' :
                            endpoint.method === 'DELETE' ? 'text-red-600' :
                            'text-purple-600'
                          }`}>
                            {endpoint.method}
                          </span>
                          <span className="text-sm truncate">{endpoint.path}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Endpoint Details */}
        <div className="md:col-span-2">
          {selectedEndpoint ? (
            <div className="border rounded-lg p-6">
              <div className="mb-6">
                <div className="flex items-center gap-3 mb-2">
                  <span className={`px-3 py-1 rounded text-white font-mono text-sm ${
                    selectedEndpoint.method === 'GET' ? 'bg-green-600' :
                    selectedEndpoint.method === 'POST' ? 'bg-blue-600' :
                    selectedEndpoint.method === 'PUT' ? 'bg-yellow-600' :
                    selectedEndpoint.method === 'DELETE' ? 'bg-red-600' :
                    'bg-purple-600'
                  }`}>
                    {selectedEndpoint.method}
                  </span>
                  <code className="text-lg font-mono">{selectedEndpoint.path}</code>
                  {selectedEndpoint.auth && (
                    <Lock className="w-4 h-4 text-gray-400" />
                  )}
                </div>
                <p className="text-gray-600 dark:text-gray-400">
                  {selectedEndpoint.description}
                </p>
              </div>

              {/* Parameters */}
              {selectedEndpoint.params && selectedEndpoint.params.length > 0 && (
                <div className="mb-6">
                  <h4 className="font-semibold mb-3">Parameters</h4>
                  <div className="space-y-2">
                    {selectedEndpoint.params.map((param, idx) => (
                      <div key={idx} className="p-3 bg-gray-50 dark:bg-gray-700 rounded">
                        <div className="flex items-center justify-between mb-1">
                          <code className="font-mono text-sm">
                            {param.name}
                            {param.required && <span className="text-red-600">*</span>}
                          </code>
                          <span className="text-xs text-gray-600 dark:text-gray-400">
                            {param.type}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {param.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Code Example */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold">Example Request</h4>
                  <div className="flex gap-2">
                    {(['curl', 'javascript', 'python'] as const).map(lang => (
                      <button
                        key={lang}
                        onClick={() => setSelectedLanguage(lang)}
                        className={`px-3 py-1 text-sm rounded ${
                          selectedLanguage === lang
                            ? 'bg-indigo-600 text-white'
                            : 'bg-gray-200 dark:bg-gray-700'
                        }`}
                      >
                        {lang === 'javascript' ? 'JS' : lang}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="relative">
                  <pre className="p-4 bg-gray-900 text-gray-100 rounded-lg overflow-x-auto">
                    <code>{generateCodeExample(selectedEndpoint)}</code>
                  </pre>
                  <button
                    onClick={() => copyToClipboard(
                      generateCodeExample(selectedEndpoint),
                      `code-${selectedEndpoint.path}`
                    )}
                    className="absolute top-2 right-2 p-2 hover:bg-gray-800 rounded"
                  >
                    {copiedCode === `code-${selectedEndpoint.path}` ? (
                      <Check className="w-4 h-4 text-green-400" />
                    ) : (
                      <Copy className="w-4 h-4 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>

              {/* Response Example */}
              {selectedEndpoint.response && (
                <div>
                  <h4 className="font-semibold mb-3">Example Response</h4>
                  <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded">
                        {selectedEndpoint.response.code} OK
                      </span>
                    </div>
                    <pre className="overflow-x-auto">
                      <code className="text-sm">
                        {selectedEndpoint.response.example}
                      </code>
                    </pre>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="border rounded-lg p-12 text-center text-gray-500">
              <Terminal className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>Select an endpoint to view details</p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Start Guide */}
      <div className="mt-8 p-6 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
        <div className="flex items-start gap-3">
          <Play className="w-5 h-5 text-indigo-600 mt-0.5" />
          <div>
            <h3 className="font-semibold mb-2">Quick Start</h3>
            <ol className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
              <li>1. Get your API credentials from the settings page</li>
              <li>2. Generate an access token using the /auth/token endpoint</li>
              <li>3. Include the token in the Authorization header for all requests</li>
              <li>4. Start making API calls to integrate Vibelux into your application</li>
            </ol>
            <div className="mt-4">
              <a
                href="https://github.com/vibelux/api-examples"
                className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-700"
              >
                View example projects
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}