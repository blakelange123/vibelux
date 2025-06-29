"use client"

import { useState } from 'react'
import { Code2, Copy, CheckCircle, Terminal, Zap, Shield, Cpu } from 'lucide-react'

interface APIEndpoint {
  method: string
  path: string
  description: string
  parameters?: { name: string; type: string; required: boolean; description: string }[]
  example: {
    request: string
    response: string
  }
}

export function SensorAPIDocumentation() {
  const [copiedCode, setCopiedCode] = useState<string | null>(null)
  const [selectedLanguage, setSelectedLanguage] = useState<'curl' | 'javascript' | 'python'>('curl')

  const copyToClipboard = (code: string, id: string) => {
    navigator.clipboard.writeText(code)
    setCopiedCode(id)
    setTimeout(() => setCopiedCode(null), 2000)
  }

  const endpoints: APIEndpoint[] = [
    {
      method: 'POST',
      path: '/api/sensors/validate',
      description: 'Validate sensor readings against Vibelux design predictions',
      parameters: [
        { name: 'designData', type: 'object', required: true, description: 'Current design configuration from Vibelux' },
        { name: 'sensorReadings', type: 'array', required: true, description: 'Array of sensor reading objects' }
      ],
      example: {
        request: `{
  "designData": {
    "summary": {
      "expectedPPFD": 600,
      "uniformityEstimate": ">0.8"
    }
  },
  "sensorReadings": [
    {
      "x": 5,
      "y": 5,
      "ppfd": 612,
      "spectrum": {
        "blue": 20,
        "red": 65,
        "farRed": 10
      }
    }
  ]
}`,
        response: `{
  "accuracy": 97.8,
  "uniformityMatch": 95.2,
  "ppfdDeviation": 12,
  "actualPPFD": 612,
  "recommendations": [
    "Consider increasing blue spectrum for vegetative growth"
  ]
}`
      }
    },
    {
      method: 'GET',
      path: '/api/sensors/predictions',
      description: 'Get AI-powered predictions based on historical sensor data',
      parameters: [
        { name: 'timeframe', type: 'string', required: false, description: '24h, 7d, or 30d (default: 24h)' },
        { name: 'metrics', type: 'array', required: false, description: 'Specific metrics to predict' }
      ],
      example: {
        request: `/api/sensors/predictions?timeframe=7d&metrics=ppfd,efficiency`,
        response: `{
  "predictions": [
    {
      "metric": "ppfd",
      "current": 625,
      "predicted": 598,
      "confidence": 92,
      "timeframe": "7d"
    }
  ],
  "anomalies": [
    {
      "type": "Fixture Degradation",
      "probability": 45,
      "timeToEvent": "4-6 weeks"
    }
  ]
}`
      }
    },
    {
      method: 'POST',
      path: '/api/sensors/virtual-grid',
      description: 'Generate virtual sensor grid for any room configuration',
      parameters: [
        { name: 'room', type: 'object', required: true, description: 'Room dimensions (width, length, height)' },
        { name: 'fixtures', type: 'array', required: true, description: 'Array of fixture positions and specs' },
        { name: 'gridResolution', type: 'number', required: false, description: 'Points per foot (default: 1)' }
      ],
      example: {
        request: `{
  "room": {
    "width": 20,
    "length": 20,
    "height": 10
  },
  "fixtures": [
    {
      "x": 10,
      "y": 10,
      "z": 8,
      "ppf": 1800,
      "beamAngle": 120
    }
  ],
  "gridResolution": 2
}`,
        response: `{
  "gridPoints": 1600,
  "averagePPFD": 625,
  "uniformity": 0.82,
  "coverage": {
    "optimal": 85,
    "acceptable": 95,
    "low": 5
  },
  "heatmap": "base64_encoded_image"
}`
      }
    }
  ]

  const getCodeExample = (endpoint: APIEndpoint) => {
    switch (selectedLanguage) {
      case 'javascript':
        return `// ${endpoint.description}
const response = await fetch('https://vibelux.com${endpoint.path}', {
  method: '${endpoint.method}',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(${endpoint.example.request})
});

const data = await response.json();
// Process sensor data
};`

      case 'python':
        return `# ${endpoint.description}
import requests

response = requests.${endpoint.method.toLowerCase()}(
    'https://vibelux.com${endpoint.path}',
    headers={
        'Authorization': 'Bearer YOUR_API_KEY',
        'Content-Type': 'application/json'
    },
    json=${endpoint.example.request.replace(/"/g, "'")}
)

data = response.json()
print(data)`

      default: // curl
        return `# ${endpoint.description}
curl -X ${endpoint.method} https://vibelux.com${endpoint.path} \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '${endpoint.example.request}'`
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gray-900 rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-white flex items-center gap-2">
            <Code2 className="w-6 h-6 text-purple-400" />
            Sensor API Documentation
          </h3>
          
          {/* Language Selector */}
          <div className="flex gap-2">
            {(['curl', 'javascript', 'python'] as const).map(lang => (
              <button
                key={lang}
                onClick={() => setSelectedLanguage(lang)}
                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                  selectedLanguage === lang
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                {lang === 'javascript' ? 'JavaScript' : lang.charAt(0).toUpperCase() + lang.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* API Features */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="flex items-center gap-3 mb-2">
              <Zap className="w-5 h-5 text-yellow-400" />
              <h4 className="font-medium text-white">Real-time Processing</h4>
            </div>
            <p className="text-sm text-gray-400">
              Sub-second response times for all sensor operations
            </p>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="flex items-center gap-3 mb-2">
              <Shield className="w-5 h-5 text-green-400" />
              <h4 className="font-medium text-white">Secure & Reliable</h4>
            </div>
            <p className="text-sm text-gray-400">
              Industry-standard authentication and 99.9% uptime
            </p>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="flex items-center gap-3 mb-2">
              <Cpu className="w-5 h-5 text-blue-400" />
              <h4 className="font-medium text-white">AI-Powered</h4>
            </div>
            <p className="text-sm text-gray-400">
              Machine learning models trained on millions of data points
            </p>
          </div>
        </div>

        {/* Endpoints */}
        <div className="space-y-6">
          {endpoints.map((endpoint, idx) => (
            <div key={idx} className="border border-gray-700 rounded-lg overflow-hidden">
              {/* Endpoint Header */}
              <div className="bg-gray-800 p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    endpoint.method === 'GET' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-green-600 text-white'
                  }`}>
                    {endpoint.method}
                  </span>
                  <code className="text-purple-400 font-mono">{endpoint.path}</code>
                </div>
                <Terminal className="w-4 h-4 text-gray-400" />
              </div>

              {/* Description */}
              <div className="p-4">
                <p className="text-gray-300 mb-4">{endpoint.description}</p>

                {/* Parameters */}
                {endpoint.parameters && (
                  <div className="mb-4">
                    <h5 className="text-sm font-medium text-gray-400 mb-2">Parameters:</h5>
                    <div className="space-y-2">
                      {endpoint.parameters.map((param, paramIdx) => (
                        <div key={paramIdx} className="flex items-start gap-2 text-sm">
                          <code className="text-purple-400 font-mono">{param.name}</code>
                          <span className="text-gray-500">({param.type})</span>
                          {param.required && <span className="text-red-400 text-xs">required</span>}
                          <span className="text-gray-400">- {param.description}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Code Example */}
                <div className="bg-black rounded-lg p-4 relative">
                  <button
                    onClick={() => copyToClipboard(getCodeExample(endpoint), `code-${idx}`)}
                    className="absolute top-2 right-2 p-2 bg-gray-800 hover:bg-gray-700 rounded transition-colors"
                  >
                    {copiedCode === `code-${idx}` ? (
                      <CheckCircle className="w-4 h-4 text-green-400" />
                    ) : (
                      <Copy className="w-4 h-4 text-gray-400" />
                    )}
                  </button>
                  <pre className="text-sm text-gray-300 overflow-x-auto">
                    <code>{getCodeExample(endpoint)}</code>
                  </pre>
                </div>

                {/* Response Example */}
                <div className="mt-4">
                  <h5 className="text-sm font-medium text-gray-400 mb-2">Example Response:</h5>
                  <div className="bg-gray-950 rounded-lg p-4">
                    <pre className="text-sm text-gray-300 overflow-x-auto">
                      <code>{endpoint.example.response}</code>
                    </pre>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Integration Guide */}
      <div className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 rounded-xl p-6 border border-purple-600/30">
        <h3 className="text-lg font-semibold text-white mb-4">
          Quick Integration Guide
        </h3>
        
        <ol className="space-y-3">
          <li className="flex items-start gap-3">
            <span className="flex-shrink-0 w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center text-sm font-bold text-white">
              1
            </span>
            <div>
              <p className="font-medium text-white">Get Your API Key</p>
              <p className="text-sm text-gray-400">Sign up for a Vibelux account and generate an API key from your dashboard</p>
            </div>
          </li>
          
          <li className="flex items-start gap-3">
            <span className="flex-shrink-0 w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center text-sm font-bold text-white">
              2
            </span>
            <div>
              <p className="font-medium text-white">Install SDK (Optional)</p>
              <p className="text-sm text-gray-400">npm install @vibelux/sensors or pip install vibelux-sensors</p>
            </div>
          </li>
          
          <li className="flex items-start gap-3">
            <span className="flex-shrink-0 w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center text-sm font-bold text-white">
              3
            </span>
            <div>
              <p className="font-medium text-white">Make Your First Request</p>
              <p className="text-sm text-gray-400">Use the examples above to validate sensor data or generate virtual grids</p>
            </div>
          </li>
        </ol>
        
        <div className="mt-4 p-3 bg-purple-600/10 rounded-lg">
          <p className="text-sm text-purple-300">
            💡 Need help? Check our full API documentation at docs.vibelux.com/api
          </p>
        </div>
      </div>
    </div>
  )
}