'use client';

import React, { useState } from 'react';
import { 
  Smartphone, 
  Lock, 
  Home, 
  Activity, 
  Bell, 
  CheckSquare, 
  Sliders, 
  BookOpen,
  Code,
  Copy,
  Check
} from 'lucide-react';

export function MobileAPIDoc() {
  const [copiedEndpoint, setCopiedEndpoint] = useState<string | null>(null);

  const copyToClipboard = (text: string, endpoint: string) => {
    navigator.clipboard.writeText(text);
    setCopiedEndpoint(endpoint);
    setTimeout(() => setCopiedEndpoint(null), 2000);
  };

  const endpoints = [
    {
      category: 'Authentication',
      icon: <Lock className="w-5 h-5" />,
      endpoints: [
        {
          method: 'POST',
          path: '/api/v1/mobile/auth',
          description: 'Login and get access token',
          body: {
            email: 'user@example.com',
            password: 'password123',
            deviceId: 'device-uuid',
            deviceName: 'iPhone 14 Pro',
            platform: 'ios'
          }
        },
        {
          method: 'PUT',
          path: '/api/v1/mobile/auth',
          description: 'Refresh access token',
          body: {
            refreshToken: 'refresh-token-here'
          }
        },
        {
          method: 'DELETE',
          path: '/api/v1/mobile/auth',
          description: 'Logout and invalidate token',
          headers: {
            Authorization: 'Bearer {access-token}'
          }
        }
      ]
    },
    {
      category: 'Dashboard',
      icon: <Home className="w-5 h-5" />,
      endpoints: [
        {
          method: 'GET',
          path: '/api/v1/mobile/dashboard',
          description: 'Get dashboard summary data',
          headers: {
            Authorization: 'Bearer {access-token}'
          }
        }
      ]
    },
    {
      category: 'Rooms',
      icon: <Activity className="w-5 h-5" />,
      endpoints: [
        {
          method: 'GET',
          path: '/api/v1/mobile/rooms',
          description: 'Get all rooms summary',
          headers: {
            Authorization: 'Bearer {access-token}'
          }
        },
        {
          method: 'GET',
          path: '/api/v1/mobile/rooms?id={roomId}',
          description: 'Get specific room details',
          headers: {
            Authorization: 'Bearer {access-token}'
          }
        }
      ]
    },
    {
      category: 'Sensors',
      icon: <Activity className="w-5 h-5" />,
      endpoints: [
        {
          method: 'GET',
          path: '/api/v1/mobile/sensors?roomId={roomId}&period=1h',
          description: 'Get sensor data for a room',
          headers: {
            Authorization: 'Bearer {access-token}'
          },
          queryParams: {
            roomId: 'Required - Room identifier',
            type: 'Optional - Filter by sensor type',
            period: 'Optional - Time period (1h, 24h, 7d, 30d)'
          }
        },
        {
          method: 'POST',
          path: '/api/v1/mobile/sensors',
          description: 'Subscribe to real-time sensor updates',
          headers: {
            Authorization: 'Bearer {access-token}'
          },
          body: {
            action: 'subscribe',
            roomIds: ['room_1', 'room_2'],
            sensorTypes: ['temperature', 'humidity']
          }
        }
      ]
    },
    {
      category: 'Controls',
      icon: <Sliders className="w-5 h-5" />,
      endpoints: [
        {
          method: 'GET',
          path: '/api/v1/mobile/controls?roomId={roomId}',
          description: 'Get available controls for a room',
          headers: {
            Authorization: 'Bearer {access-token}'
          }
        },
        {
          method: 'POST',
          path: '/api/v1/mobile/controls',
          description: 'Execute control command',
          headers: {
            Authorization: 'Bearer {access-token}'
          },
          body: {
            roomId: 'room_1',
            deviceType: 'temperature',
            command: 'setTarget',
            value: 75
          }
        }
      ]
    },
    {
      category: 'Alerts',
      icon: <Bell className="w-5 h-5" />,
      endpoints: [
        {
          method: 'GET',
          path: '/api/v1/mobile/alerts?filter=active',
          description: 'Get alerts',
          headers: {
            Authorization: 'Bearer {access-token}'
          },
          queryParams: {
            filter: 'Optional - active, resolved, unacknowledged',
            roomId: 'Optional - Filter by room',
            limit: 'Optional - Number of results (default: 20)',
            offset: 'Optional - Pagination offset'
          }
        },
        {
          method: 'PUT',
          path: '/api/v1/mobile/alerts',
          description: 'Acknowledge or resolve alert',
          headers: {
            Authorization: 'Bearer {access-token}'
          },
          body: {
            alertId: 'alert_123',
            action: 'acknowledge',
            notes: 'Checked and adjusted'
          }
        }
      ]
    },
    {
      category: 'Tasks',
      icon: <CheckSquare className="w-5 h-5" />,
      endpoints: [
        {
          method: 'GET',
          path: '/api/v1/mobile/tasks?filter=today',
          description: 'Get tasks',
          headers: {
            Authorization: 'Bearer {access-token}'
          },
          queryParams: {
            filter: 'Optional - today, upcoming, overdue',
            roomId: 'Optional - Filter by room',
            status: 'Optional - pending, in_progress, completed'
          }
        },
        {
          method: 'PUT',
          path: '/api/v1/mobile/tasks',
          description: 'Update task status or checklist',
          headers: {
            Authorization: 'Bearer {access-token}'
          },
          body: {
            taskId: 'task_123',
            updates: {
              status: 'completed',
              checklist: [
                { id: 'check_1', completed: true }
              ]
            }
          }
        }
      ]
    }
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex justify-center mb-4">
          <div className="p-4 bg-purple-100 dark:bg-purple-900/30 rounded-full">
            <Smartphone className="w-12 h-12 text-purple-600 dark:text-purple-400" />
          </div>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Vibelux Mobile API
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          RESTful API for iOS and Android applications
        </p>
      </div>

      {/* Base URL */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mb-6">
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Base URL</p>
        <code className="text-lg font-mono text-gray-900 dark:text-white">
          https://app.vibelux.com/api/v1/mobile
        </code>
      </div>

      {/* API Endpoints */}
      {endpoints.map((category) => (
        <div key={category.category} className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            {category.icon}
            {category.category}
          </h2>
          
          <div className="space-y-4">
            {category.endpoints.map((endpoint, index) => (
              <div
                key={index}
                className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 text-sm font-medium rounded ${
                      endpoint.method === 'GET' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                      endpoint.method === 'POST' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                      endpoint.method === 'PUT' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                      'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                    }`}>
                      {endpoint.method}
                    </span>
                    <code className="font-mono text-gray-900 dark:text-white">
                      {endpoint.path}
                    </code>
                  </div>
                  <button
                    onClick={() => copyToClipboard(
                      `${endpoint.method} ${endpoint.path}`,
                      `${endpoint.method}-${index}`
                    )}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    {copiedEndpoint === `${endpoint.method}-${index}` ? (
                      <Check className="w-4 h-4 text-green-500" />
                    ) : (
                      <Copy className="w-4 h-4 text-gray-400" />
                    )}
                  </button>
                </div>

                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  {endpoint.description}
                </p>

                {endpoint.headers && (
                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Headers
                    </p>
                    <pre className="bg-gray-50 dark:bg-gray-900 p-3 rounded text-sm overflow-x-auto">
                      <code>{JSON.stringify(endpoint.headers, null, 2)}</code>
                    </pre>
                  </div>
                )}

                {endpoint.queryParams && (
                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Query Parameters
                    </p>
                    <div className="space-y-1">
                      {Object.entries(endpoint.queryParams).map(([key, desc]) => (
                        <div key={key} className="text-sm">
                          <code className="font-mono bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                            {key}
                          </code>
                          <span className="text-gray-600 dark:text-gray-400 ml-2">
                            - {desc}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {endpoint.body && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Request Body
                    </p>
                    <pre className="bg-gray-50 dark:bg-gray-900 p-3 rounded text-sm overflow-x-auto">
                      <code>{JSON.stringify(endpoint.body, null, 2)}</code>
                    </pre>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* WebSocket Information */}
      <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-6 border border-purple-200 dark:border-purple-800">
        <h3 className="text-lg font-semibold text-purple-900 dark:text-purple-100 mb-3">
          Real-time Updates via WebSocket
        </h3>
        <p className="text-purple-700 dark:text-purple-300 mb-4">
          For real-time sensor data and notifications, connect to our WebSocket server:
        </p>
        <pre className="bg-white dark:bg-gray-800 p-3 rounded text-sm overflow-x-auto">
          <code>{`// 1. Get WebSocket credentials
POST /api/v1/mobile/sensors
{
  "action": "subscribe",
  "roomIds": ["room_1"],
  "sensorTypes": ["temperature", "humidity"]
}

// 2. Connect to WebSocket
const ws = new WebSocket('wss://ws.vibelux.com/mobile');
ws.send(JSON.stringify({
  type: 'auth',
  token: wsToken
}));

// 3. Receive real-time updates
ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  // Handle sensor updates
};`}</code>
        </pre>
      </div>

      {/* Rate Limiting */}
      <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-6 border border-yellow-200 dark:border-yellow-800">
        <h3 className="text-lg font-semibold text-yellow-900 dark:text-yellow-100 mb-3">
          Rate Limiting
        </h3>
        <ul className="list-disc list-inside text-yellow-700 dark:text-yellow-300 space-y-1">
          <li>Authentication endpoints: 5 requests per minute</li>
          <li>Data endpoints: 60 requests per minute</li>
          <li>Control endpoints: 30 requests per minute</li>
          <li>WebSocket connections: 1 per device</li>
        </ul>
      </div>
    </div>
  );
}