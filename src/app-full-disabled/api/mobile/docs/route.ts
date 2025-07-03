/**
 * Mobile API Documentation
 * Auto-generated documentation for mobile app integration
 */

import { NextResponse } from 'next/server'

export async function GET() {
  const documentation = {
    title: 'VibeLux Mobile API',
    version: '1.0.0',
    description: 'REST API for VibeLux mobile applications',
    baseUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    authentication: {
      methods: [
        {
          type: 'Bearer Token',
          description: 'Use Clerk JWT token from mobile authentication',
          header: 'Authorization: Bearer <jwt_token>',
          example: 'Authorization: Bearer eyJhbGciOiJSUzI1NiIs...'
        },
        {
          type: 'API Key',
          description: 'Use API key for server-to-server requests',
          header: 'X-API-Key: <api_key>',
          example: 'X-API-Key: vbl_1234567890abcdef'
        }
      ],
      permissions: [
        'view_dashboard - View dashboard data',
        'control_environment - Control lighting and environment',
        'manage_tasks - Create and manage cultivation tasks',
        'view_analytics - Access analytics and reports',
        'manage_recipes - Create and modify light recipes',
        'api_access - Access API endpoints'
      ]
    },
    endpoints: {
      authentication: {
        '/api/mobile/auth/login': {
          method: 'POST',
          description: 'Create mobile session after Clerk authentication',
          body: {
            clerkId: 'string (required) - Clerk user ID',
            deviceInfo: 'object (optional) - Device information'
          },
          response: {
            success: 'boolean',
            user: 'object - User profile information',
            message: 'string'
          },
          example: {
            request: {
              clerkId: 'user_2abc123def456',
              deviceInfo: {
                platform: 'ios',
                version: '1.0.0',
                deviceId: 'ABC123-DEF456'
              }
            },
            response: {
              success: true,
              user: {
                id: 'cuid123',
                email: 'user@example.com',
                role: 'USER',
                subscriptionTier: 'PROFESSIONAL'
              },
              message: 'Mobile session created successfully'
            }
          }
        }
      },
      dashboard: {
        '/api/mobile/dashboard': {
          method: 'GET',
          description: 'Get dashboard overview data',
          authentication: 'Required (Bearer token or API key)',
          permissions: ['view_dashboard'],
          query: {
            hours: 'number (optional) - Hours of historical data (default: 24)'
          },
          response: {
            user: 'object - Current user information',
            summary: 'object - Key metrics and statistics',
            recentProjects: 'array - Recent lighting projects',
            sensorData: 'object - Environmental and lighting sensor data',
            recentActivity: 'array - User activity log',
            timestamp: 'string - Response timestamp'
          },
          example: {
            request: 'GET /api/mobile/dashboard?hours=12',
            response: {
              user: {
                id: 'cuid123',
                email: 'grower@farm.com',
                role: 'USER',
                subscriptionTier: 'PROFESSIONAL',
                permissions: ['view_dashboard', 'control_environment']
              },
              summary: {
                totalProjects: 5,
                activeFixtures: 12,
                avgTemperature: 24.5,
                avgHumidity: 65.2,
                avgPPFD: 850,
                totalPowerConsumption: 9600
              },
              recentProjects: [
                {
                  id: 'proj_123',
                  name: 'Lettuce Grow Room A',
                  description: 'Hydroponic lettuce production',
                  updatedAt: '2025-06-22T12:00:00Z',
                  fixtureCount: 8
                }
              ],
              sensorData: {
                environmental: [
                  {
                    time: '2025-06-22T12:00:00Z',
                    measurement: 'environment',
                    field: 'temperature',
                    value: 24.5,
                    tags: { device_id: 'env_001', location: 'Zone A' }
                  }
                ],
                lighting: [
                  {
                    time: '2025-06-22T12:00:00Z',
                    measurement: 'lighting',
                    field: 'ppfd',
                    value: 850,
                    tags: { fixture_id: 'fix_001', zone: 'Zone A' }
                  }
                ]
              }
            }
          }
        }
      },
      controls: {
        '/api/mobile/controls': {
          methods: ['GET', 'POST'],
          description: 'Get lighting status and control fixtures',
          authentication: 'Required (Bearer token or API key)',
          permissions: ['control_environment'],
          get: {
            query: {
              projectId: 'string (optional) - Filter by project ID',
              zone: 'string (optional) - Filter by zone name'
            },
            response: {
              fixtures: 'array - Available fixtures with current status',
              zones: 'array - List of available zones',
              total: 'number - Total fixture count',
              timestamp: 'string'
            }
          },
          post: {
            body: {
              fixtureId: 'string (optional) - Target fixture ID',
              zone: 'string (optional) - Target zone name',
              action: 'string (required) - Control action: on|off|dim|spectrum',
              value: 'number (optional) - Value for dim action (0-100)'
            },
            response: {
              success: 'boolean',
              message: 'string',
              action: 'string',
              target: 'string',
              value: 'number',
              timestamp: 'string'
            }
          },
          examples: {
            get: {
              request: 'GET /api/mobile/controls?zone=Zone A',
              response: {
                fixtures: [
                  {
                    id: 'fix_123',
                    fixtureId: 'fixture_001',
                    projectId: 'proj_123',
                    projectName: 'Lettuce Grow Room A',
                    position: { x: 100, y: 200, zone: 'Zone A' },
                    quantity: 1,
                    currentStatus: {
                      ppfd: 850,
                      dimLevel: 80,
                      isOn: true,
                      lastUpdate: '2025-06-22T12:00:00Z'
                    }
                  }
                ],
                zones: ['Zone A', 'Zone B'],
                total: 1
              }
            },
            post: {
              request: {
                fixtureId: 'fixture_001',
                action: 'dim',
                value: 60
              },
              response: {
                success: true,
                message: 'Lighting dimmed to 60%',
                action: 'dim',
                target: 'fixture_001',
                value: 60,
                timestamp: '2025-06-22T12:00:00Z'
              }
            }
          }
        }
      },
      sensors: {
        '/api/sensors': {
          methods: ['GET', 'POST'],
          description: 'Access sensor data and submit readings',
          authentication: 'Required (Bearer token or API key)',
          permissions: ['view_analytics'],
          get: {
            query: {
              measurement: 'string (optional) - environment|lighting|spectrum',
              hours: 'number (optional) - Hours of data (default: 24)',
              deviceId: 'string (optional) - Filter by device ID',
              location: 'string (optional) - Filter by location'
            }
          },
          post: {
            body: {
              type: 'string (required) - environmental|lighting|generic',
              deviceId: 'string (optional) - Device identifier',
              location: 'string (optional) - Location/zone',
              // For environmental type:
              temperature: 'number (optional)',
              humidity: 'number (optional)',
              co2: 'number (optional)',
              ph: 'number (optional)',
              // For lighting type:
              fixtureId: 'string (optional)',
              zone: 'string (optional)',
              ppfd: 'number (optional)',
              dli: 'number (optional)',
              powerConsumption: 'number (optional)'
            }
          }
        }
      }
    },
    errorCodes: {
      400: 'Bad Request - Invalid request parameters',
      401: 'Unauthorized - Authentication required',
      403: 'Forbidden - Insufficient permissions',
      404: 'Not Found - Resource not found',
      402: 'Payment Required - Subscription upgrade needed',
      429: 'Too Many Requests - Rate limit exceeded',
      500: 'Internal Server Error - Server error'
    },
    rateLimits: {
      '/api/mobile/dashboard': '60 requests per minute',
      '/api/mobile/controls': '30 requests per minute', 
      '/api/sensors': '100 requests per 10 seconds',
      default: '100 requests per 15 minutes'
    },
    sdkExample: {
      javascript: {
        title: 'JavaScript/React Native Example',
        code: `
// Initialize VibeLux API client
const vibelux = new VibeLuxAPI({
  baseUrl: 'https://app.vibelux.com',
  token: 'your_clerk_jwt_token'
});

// Get dashboard data
const dashboard = await vibelux.dashboard.get({ hours: 24 });

// Control lighting
await vibelux.controls.dim('fixture_001', 75);

// Submit sensor reading
await vibelux.sensors.submit({
  type: 'environmental',
  deviceId: 'sensor_001',
  location: 'Zone A',
  temperature: 24.5,
  humidity: 65.2
});
        `
      },
      curl: {
        title: 'cURL Examples',
        code: `
# Get dashboard data
curl -X GET "https://app.vibelux.com/api/mobile/dashboard" \\
  -H "Authorization: Bearer your_jwt_token"

# Control lighting
curl -X POST "https://app.vibelux.com/api/mobile/controls" \\
  -H "Authorization: Bearer your_jwt_token" \\
  -H "Content-Type: application/json" \\
  -d '{"fixtureId": "fixture_001", "action": "dim", "value": 75}'

# Submit sensor data
curl -X POST "https://app.vibelux.com/api/sensors" \\
  -H "X-API-Key: your_api_key" \\
  -H "Content-Type: application/json" \\
  -d '{
    "type": "environmental",
    "deviceId": "sensor_001", 
    "temperature": 24.5,
    "humidity": 65.2
  }'
        `
      }
    }
  }

  return NextResponse.json(documentation, {
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    }
  })
}