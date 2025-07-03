'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Code, 
  Send, 
  Key, 
  Webhook, 
  Database, 
  Brain, 
  GitBranch,
  Copy,
  Play,
  Download,
  ExternalLink,
  Activity,
  Settings,
  Shield,
  Zap
} from 'lucide-react'

interface APIEndpoint {
  method: string
  path: string
  description: string
  category: string
  parameters?: Parameter[]
  requestBody?: Schema
  responses?: Record<string, Schema>
  examples?: Example[]
  permissions?: string[]
}

interface Parameter {
  name: string
  type: string
  required: boolean
  description: string
  example?: any
}

interface Schema {
  type: string
  properties?: Record<string, any>
  example?: any
}

interface Example {
  name: string
  request: any
  response: any
}

export default function APIDocumentationPortal() {
  const [selectedEndpoint, setSelectedEndpoint] = useState<APIEndpoint | null>(null)
  const [apiKey, setApiKey] = useState('')
  const [requestBody, setRequestBody] = useState('')
  const [responseData, setResponseData] = useState('')
  const [loading, setLoading] = useState(false)
  const [selectedVersion, setSelectedVersion] = useState('v2')

  // Sample API endpoints
  const endpoints: APIEndpoint[] = [
    {
      method: 'GET',
      path: '/api/v2/yield',
      description: 'Get yield data with advanced filtering',
      category: 'Production Data',
      parameters: [
        { name: 'facilityId', type: 'string', required: true, description: 'Facility identifier' },
        { name: 'cultivar', type: 'string', required: false, description: 'Filter by cultivar name' },
        { name: 'startDate', type: 'string', required: false, description: 'Start date (ISO 8601)' },
        { name: 'endDate', type: 'string', required: false, description: 'End date (ISO 8601)' },
        { name: 'limit', type: 'number', required: false, description: 'Number of records to return (max 100)' }
      ],
      responses: {
        '200': {
          type: 'object',
          properties: {
            data: { type: 'array' },
            meta: { type: 'object' }
          },
          example: {
            data: [{
              facilityId: 'facility_123',
              cultivar: 'Purple Haze',
              totalYield: 1250.5,
              yieldPerSqFt: 62.5,
              harvestDate: '2024-01-15T10:00:00Z'
            }],
            meta: {
              total: 1,
              limit: 50,
              offset: 0
            }
          }
        }
      },
      permissions: ['read:yield']
    },
    {
      method: 'POST',
      path: '/api/v2/webhooks/subscribe',
      description: 'Subscribe to webhook events for real-time notifications',
      category: 'Webhooks',
      requestBody: {
        type: 'object',
        properties: {
          url: { type: 'string' },
          events: { type: 'array' },
          filters: { type: 'object' }
        },
        example: {
          url: 'https://your-app.com/webhook',
          events: ['yield.target.miss', 'energy.spike'],
          filters: {
            facilityIds: ['facility_123'],
            severity: ['high', 'critical']
          }
        }
      },
      permissions: ['webhook:subscribe']
    },
    {
      method: 'POST',
      path: '/api/v2/recipes',
      description: 'Create a new growing recipe with version control',
      category: 'Recipe Sharing',
      requestBody: {
        type: 'object',
        example: {
          name: 'High Yield Purple Haze',
          cultivar: 'Purple Haze',
          description: 'Optimized recipe for maximum yield',
          growthPhases: [{
            name: 'Vegetative',
            duration: 21,
            environmental: {
              temperature: { day: 24, night: 20 },
              humidity: { day: 60, night: 65 },
              co2: 1000,
              vpd: { day: 1.0, night: 0.8 }
            },
            lighting: {
              photoperiod: 18,
              intensity: 400,
              dli: 35,
              spectrum: {
                blue: 20,
                green: 10,
                red: 65,
                farRed: 5
              }
            }
          }]
        }
      },
      permissions: ['write:recipes']
    },
    {
      method: 'POST',
      path: '/api/v2/models/upload',
      description: 'Upload custom ML model for deployment',
      category: 'ML Models',
      requestBody: {
        type: 'multipart/form-data',
        example: {
          model: 'model.tar.gz (binary file)',
          metadata: JSON.stringify({
            name: 'Yield Predictor',
            framework: 'tensorflow',
            type: 'regression',
            inputSchema: {
              temperature: { type: 'float', range: { min: 15, max: 30 } },
              humidity: { type: 'float', range: { min: 40, max: 80 } }
            }
          })
        }
      },
      permissions: ['ml:upload']
    }
  ]

  const handleTestEndpoint = async () => {
    if (!selectedEndpoint || !apiKey) return

    setLoading(true)
    try {
      const url = `${window.location.origin}${selectedEndpoint.path}`
      const options: RequestInit = {
        method: selectedEndpoint.method,
        headers: {
          'X-API-Key': apiKey,
          'Content-Type': 'application/json'
        }
      }

      if (selectedEndpoint.method !== 'GET' && requestBody) {
        options.body = requestBody
      }

      const response = await fetch(url, options)
      const data = await response.json()
      
      setResponseData(JSON.stringify(data, null, 2))
    } catch (error) {
      setResponseData(JSON.stringify({ error: 'Request failed' }, null, 2))
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const generateCurlCommand = (endpoint: APIEndpoint) => {
    let curl = `curl -X ${endpoint.method} \\\n`
    curl += `  "${window.location.origin}${endpoint.path}" \\\n`
    curl += `  -H "X-API-Key: YOUR_API_KEY" \\\n`
    curl += `  -H "Content-Type: application/json"`
    
    if (endpoint.method !== 'GET' && endpoint.requestBody?.example) {
      curl += ` \\\n  -d '${JSON.stringify(endpoint.requestBody.example, null, 2)}'`
    }
    
    return curl
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-blue-600 p-3 rounded-lg">
              <Code className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">VibeLux Developer API</h1>
              <p className="text-gray-600">Comprehensive API portal for agricultural automation</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <Select value={selectedVersion} onValueChange={setSelectedVersion}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="v1">API v1</SelectItem>
                <SelectItem value="v2">API v2</SelectItem>
              </SelectContent>
            </Select>
            
            <Badge variant="secondary" className="gap-1">
              <Activity className="h-3 w-3" />
              Operational
            </Badge>
            
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Download SDKs
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sidebar - Endpoint List */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  API Endpoints
                </CardTitle>
                <CardDescription>
                  Browse and test available endpoints
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96">
                  {Object.entries(
                    endpoints.reduce((acc, endpoint) => {
                      if (!acc[endpoint.category]) acc[endpoint.category] = []
                      acc[endpoint.category].push(endpoint)
                      return acc
                    }, {} as Record<string, APIEndpoint[]>)
                  ).map(([category, categoryEndpoints]) => (
                    <div key={category} className="mb-4">
                      <h4 className="font-medium text-sm text-gray-500 mb-2">{category}</h4>
                      {categoryEndpoints.map((endpoint, index) => (
                        <div
                          key={index}
                          className={`p-3 rounded-lg border cursor-pointer mb-2 transition-colors ${
                            selectedEndpoint === endpoint
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          onClick={() => setSelectedEndpoint(endpoint)}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <Badge
                              variant={
                                endpoint.method === 'GET' ? 'secondary' :
                                endpoint.method === 'POST' ? 'default' :
                                'destructive'
                              }
                              className="text-xs"
                            >
                              {endpoint.method}
                            </Badge>
                            <span className="text-sm font-mono text-gray-600">
                              {endpoint.path}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 line-clamp-2">
                            {endpoint.description}
                          </p>
                        </div>
                      ))}
                    </div>
                  ))}
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2">
            {selectedEndpoint ? (
              <Tabs defaultValue="docs" className="space-y-4">
                <TabsList>
                  <TabsTrigger value="docs">Documentation</TabsTrigger>
                  <TabsTrigger value="test">Test Endpoint</TabsTrigger>
                  <TabsTrigger value="examples">Examples</TabsTrigger>
                </TabsList>

                <TabsContent value="docs">
                  <Card>
                    <CardHeader>
                      <div className="flex items-center gap-2 mb-2">
                        <Badge
                          variant={
                            selectedEndpoint.method === 'GET' ? 'secondary' :
                            selectedEndpoint.method === 'POST' ? 'default' :
                            'destructive'
                          }
                        >
                          {selectedEndpoint.method}
                        </Badge>
                        <code className="text-lg font-mono bg-gray-100 px-2 py-1 rounded">
                          {selectedEndpoint.path}
                        </code>
                      </div>
                      <CardDescription>
                        {selectedEndpoint.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Permissions */}
                      {selectedEndpoint.permissions && (
                        <div>
                          <h4 className="font-medium mb-2 flex items-center gap-2">
                            <Shield className="h-4 w-4" />
                            Required Permissions
                          </h4>
                          <div className="flex gap-2">
                            {selectedEndpoint.permissions.map(permission => (
                              <Badge key={permission} variant="outline">
                                {permission}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Parameters */}
                      {selectedEndpoint.parameters && (
                        <div>
                          <h4 className="font-medium mb-2">Parameters</h4>
                          <div className="border rounded-lg overflow-hidden">
                            <table className="w-full text-sm">
                              <thead className="bg-gray-50">
                                <tr>
                                  <th className="text-left p-3">Name</th>
                                  <th className="text-left p-3">Type</th>
                                  <th className="text-left p-3">Required</th>
                                  <th className="text-left p-3">Description</th>
                                </tr>
                              </thead>
                              <tbody>
                                {selectedEndpoint.parameters.map(param => (
                                  <tr key={param.name} className="border-t">
                                    <td className="p-3 font-mono">{param.name}</td>
                                    <td className="p-3">
                                      <Badge variant="outline">{param.type}</Badge>
                                    </td>
                                    <td className="p-3">
                                      {param.required ? (
                                        <Badge variant="destructive">Required</Badge>
                                      ) : (
                                        <Badge variant="secondary">Optional</Badge>
                                      )}
                                    </td>
                                    <td className="p-3 text-gray-600">{param.description}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}

                      {/* Request Body */}
                      {selectedEndpoint.requestBody && (
                        <div>
                          <h4 className="font-medium mb-2">Request Body</h4>
                          <div className="bg-gray-100 p-4 rounded-lg">
                            <pre className="text-sm overflow-x-auto">
                              {JSON.stringify(selectedEndpoint.requestBody.example, null, 2)}
                            </pre>
                          </div>
                        </div>
                      )}

                      {/* Response */}
                      {selectedEndpoint.responses && (
                        <div>
                          <h4 className="font-medium mb-2">Response</h4>
                          {Object.entries(selectedEndpoint.responses).map(([status, schema]) => (
                            <div key={status} className="mb-4">
                              <div className="flex items-center gap-2 mb-2">
                                <Badge
                                  variant={status.startsWith('2') ? 'default' : 'destructive'}
                                >
                                  {status}
                                </Badge>
                                <span className="text-sm text-gray-600">
                                  {status === '200' ? 'Success' : 'Error'}
                                </span>
                              </div>
                              <div className="bg-gray-100 p-4 rounded-lg">
                                <pre className="text-sm overflow-x-auto">
                                  {JSON.stringify(schema.example, null, 2)}
                                </pre>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="test">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Play className="h-5 w-5" />
                        Test Endpoint
                      </CardTitle>
                      <CardDescription>
                        Send a live request to this endpoint
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* API Key Input */}
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          API Key
                        </label>
                        <div className="flex gap-2">
                          <Input
                            type="password"
                            placeholder="Enter your API key"
                            value={apiKey}
                            onChange={(e) => setApiKey(e.target.value)}
                          />
                          <Button variant="outline" size="sm">
                            <Key className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      {/* Request Body */}
                      {selectedEndpoint.method !== 'GET' && (
                        <div>
                          <label className="block text-sm font-medium mb-2">
                            Request Body
                          </label>
                          <Textarea
                            placeholder="Enter JSON request body"
                            value={requestBody}
                            onChange={(e) => setRequestBody(e.target.value)}
                            rows={8}
                            className="font-mono text-sm"
                          />
                        </div>
                      )}

                      {/* Send Button */}
                      <Button
                        onClick={handleTestEndpoint}
                        disabled={loading || !apiKey}
                        className="w-full"
                      >
                        {loading ? (
                          <>
                            <div className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full" />
                            Sending...
                          </>
                        ) : (
                          <>
                            <Send className="h-4 w-4 mr-2" />
                            Send Request
                          </>
                        )}
                      </Button>

                      {/* Response */}
                      {responseData && (
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <label className="block text-sm font-medium">
                              Response
                            </label>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => copyToClipboard(responseData)}
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                          </div>
                          <div className="bg-gray-100 p-4 rounded-lg max-h-64 overflow-auto">
                            <pre className="text-sm">{responseData}</pre>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="examples">
                  <Card>
                    <CardHeader>
                      <CardTitle>Code Examples</CardTitle>
                      <CardDescription>
                        Ready-to-use code examples in different languages
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Tabs defaultValue="curl">
                        <TabsList>
                          <TabsTrigger value="curl">cURL</TabsTrigger>
                          <TabsTrigger value="javascript">JavaScript</TabsTrigger>
                          <TabsTrigger value="python">Python</TabsTrigger>
                        </TabsList>

                        <TabsContent value="curl">
                          <div className="relative">
                            <Button
                              variant="outline"
                              size="sm"
                              className="absolute top-2 right-2 z-10"
                              onClick={() => copyToClipboard(generateCurlCommand(selectedEndpoint))}
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                            <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
                              <pre className="text-sm">
                                {generateCurlCommand(selectedEndpoint)}
                              </pre>
                            </div>
                          </div>
                        </TabsContent>

                        <TabsContent value="javascript">
                          <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
                            <pre className="text-sm">
{`const response = await fetch('${selectedEndpoint.path}', {
  method: '${selectedEndpoint.method}',
  headers: {
    'X-API-Key': 'your-api-key',
    'Content-Type': 'application/json'
  }${selectedEndpoint.method !== 'GET' && selectedEndpoint.requestBody?.example ? `,
  body: JSON.stringify(${JSON.stringify(selectedEndpoint.requestBody.example, null, 2)})` : ''}
});

const data = await response.json();
// Handle API response data
};`}
                            </pre>
                          </div>
                        </TabsContent>

                        <TabsContent value="python">
                          <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
                            <pre className="text-sm">
{`import requests

url = "${selectedEndpoint.path}"
headers = {
    "X-API-Key": "your-api-key",
    "Content-Type": "application/json"
}

${selectedEndpoint.method !== 'GET' && selectedEndpoint.requestBody?.example ? 
`data = ${JSON.stringify(selectedEndpoint.requestBody.example, null, 4)}

response = requests.${selectedEndpoint.method.toLowerCase()}(url, headers=headers, json=data)` :
`response = requests.${selectedEndpoint.method.toLowerCase()}(url, headers=headers)`}
print(response.json())`}
                            </pre>
                          </div>
                        </TabsContent>
                      </Tabs>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            ) : (
              <Card>
                <CardContent className="flex items-center justify-center h-96">
                  <div className="text-center">
                    <Code className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Select an endpoint
                    </h3>
                    <p className="text-gray-600">
                      Choose an endpoint from the sidebar to view documentation and test it
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Quick Start Cards */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Key className="h-5 w-5" />
                API Keys
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                Generate and manage your API keys for authentication
              </p>
              <Button variant="outline" size="sm" className="w-full">
                Manage Keys
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Webhook className="h-5 w-5" />
                Webhooks
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                Set up real-time notifications for your applications
              </p>
              <Button variant="outline" size="sm" className="w-full">
                Configure Webhooks
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <GitBranch className="h-5 w-5" />
                Recipe Sharing
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                Share and collaborate on growing recipes with version control
              </p>
              <Button variant="outline" size="sm" className="w-full">
                Browse Recipes
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Brain className="h-5 w-5" />
                ML Models
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                Upload and deploy custom machine learning models
              </p>
              <Button variant="outline" size="sm" className="w-full">
                Model Registry
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}