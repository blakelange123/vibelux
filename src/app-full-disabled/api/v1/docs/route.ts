import { NextRequest, NextResponse } from 'next/server';

const openApiSpec = {
  openapi: '3.0.0',
  info: {
    title: 'Vibelux API',
    version: '1.0.0',
    description: 'Comprehensive API for third-party integrations with Vibelux lighting and environmental control systems',
    contact: {
      name: 'Vibelux Support',
      email: 'api@vibelux.com'
    }
  },
  servers: [
    {
      url: 'https://app.vibelux.com/api/v1',
      description: 'Production server'
    },
    {
      url: 'http://localhost:3000/api/v1',
      description: 'Development server'
    }
  ],
  security: [
    {
      apiKey: []
    }
  ],
  components: {
    securitySchemes: {
      apiKey: {
        type: 'apiKey',
        in: 'header',
        name: 'x-api-key',
        description: 'API key for authentication'
      }
    },
    schemas: {
      Error: {
        type: 'object',
        properties: {
          error: { type: 'string' },
          message: { type: 'string' },
          details: { type: 'object' },
          timestamp: { type: 'string', format: 'date-time' }
        }
      },
      Success: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          data: { type: 'object' },
          meta: {
            type: 'object',
            properties: {
              page: { type: 'integer' },
              limit: { type: 'integer' },
              total: { type: 'integer' },
              hasMore: { type: 'boolean' }
            }
          },
          timestamp: { type: 'string', format: 'date-time' }
        }
      }
    },
    responses: {
      Unauthorized: {
        description: 'Missing or invalid API key',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/Error' }
          }
        }
      },
      RateLimited: {
        description: 'Rate limit exceeded',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/Error' }
          }
        },
        headers: {
          'X-RateLimit-Limit': {
            description: 'Request limit per hour',
            schema: { type: 'integer' }
          },
          'X-RateLimit-Remaining': {
            description: 'Remaining requests',
            schema: { type: 'integer' }
          },
          'X-RateLimit-Reset': {
            description: 'Rate limit reset time',
            schema: { type: 'string', format: 'date-time' }
          }
        }
      }
    }
  },
  paths: {
    '/lighting/status': {
      get: {
        tags: ['Lighting'],
        summary: 'Get lighting system status',
        description: 'Retrieve current status and metrics for all lighting fixtures',
        parameters: [
          {
            name: 'projectId',
            in: 'query',
            description: 'Filter by specific project',
            schema: { type: 'string' }
          },
          {
            name: 'includeMetrics',
            in: 'query',
            description: 'Include calculated metrics (PPFD, DLI)',
            schema: { type: 'boolean', default: true }
          }
        ],
        responses: {
          200: { description: 'Success', content: { 'application/json': { schema: { $ref: '#/components/schemas/Success' } } } },
          401: { $ref: '#/components/responses/Unauthorized' },
          429: { $ref: '#/components/responses/RateLimited' }
        }
      }
    },
    '/lighting/control': {
      post: {
        tags: ['Lighting'],
        summary: 'Control a single fixture',
        description: 'Control power, dimming, and spectrum of a lighting fixture',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  fixtureId: { type: 'string' },
                  power: { type: 'boolean' },
                  dimming: { type: 'number', minimum: 0, maximum: 100 },
                  spectrum: { type: 'object' }
                },
                required: ['fixtureId']
              }
            }
          }
        },
        responses: {
          200: { description: 'Success' },
          401: { $ref: '#/components/responses/Unauthorized' },
          429: { $ref: '#/components/responses/RateLimited' }
        }
      }
    },
    '/environmental/sensors': {
      get: {
        tags: ['Environmental'],
        summary: 'Retrieve sensor data',
        description: 'Get real-time and historical environmental sensor data',
        parameters: [
          {
            name: 'sensorTypes',
            in: 'query',
            description: 'Filter by sensor types',
            schema: {
              type: 'array',
              items: {
                type: 'string',
                enum: ['temperature', 'humidity', 'co2', 'light', 'ph', 'ec', 'vpd']
              }
            }
          }
        ],
        responses: {
          200: { description: 'Success' },
          401: { $ref: '#/components/responses/Unauthorized' },
          429: { $ref: '#/components/responses/RateLimited' }
        }
      },
      post: {
        tags: ['Environmental'],
        summary: 'Submit sensor data',
        description: 'Submit new environmental sensor reading',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  sensorId: { type: 'string' },
                  type: { type: 'string' },
                  value: { type: 'number' },
                  unit: { type: 'string' }
                },
                required: ['sensorId', 'type', 'value', 'unit']
              }
            }
          }
        },
        responses: {
          200: { description: 'Success' }
        }
      }
    },
    '/plant-biology/predictions': {
      post: {
        tags: ['Plant Biology'],
        summary: 'Generate growth predictions',
        description: 'Generate growth predictions and yield forecasts for crops',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  cropType: { type: 'string' },
                  cultivar: { type: 'string' },
                  plantingDate: { type: 'string', format: 'date-time' },
                  environmentalConditions: { type: 'object' }
                },
                required: ['cropType', 'plantingDate']
              }
            }
          }
        },
        responses: {
          200: { description: 'Success' }
        }
      }
    },
    '/globalgap/compliance': {
      get: {
        tags: ['GlobalGAP'],
        summary: 'Get compliance status',
        description: 'Retrieve overall GlobalGAP compliance status',
        responses: {
          200: { description: 'Success' }
        }
      },
      post: {
        tags: ['GlobalGAP'],
        summary: 'Perform compliance check',
        description: 'Check compliance status for specific requirements',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  checkType: {
                    type: 'string',
                    enum: ['water', 'pesticide', 'fertilizer', 'harvest', 'storage']
                  },
                  data: { type: 'object' }
                },
                required: ['checkType', 'data']
              }
            }
          }
        },
        responses: {
          200: { description: 'Success' }
        }
      }
    },
    '/webhooks/subscriptions': {
      get: {
        tags: ['Webhooks'],
        summary: 'List webhook subscriptions',
        responses: {
          200: { description: 'Success' }
        }
      },
      post: {
        tags: ['Webhooks'],
        summary: 'Create webhook subscription',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  url: { type: 'string', format: 'url' },
                  events: {
                    type: 'array',
                    items: {
                      type: 'string',
                      enum: [
                        'alert.stress_detected',
                        'alert.health_issue',
                        'alert.threshold_violation',
                        'status.stage_transition',
                        'status.harvest_ready',
                        'system.maintenance_required',
                        'compliance.audit_due'
                      ]
                    }
                  },
                  secret: { type: 'string' },
                  enabled: { type: 'boolean' }
                },
                required: ['url', 'events']
              }
            }
          }
        },
        responses: {
          200: { description: 'Success' }
        }
      }
    }
  },
  tags: [
    {
      name: 'Lighting',
      description: 'Control and monitor lighting systems'
    },
    {
      name: 'Environmental',
      description: 'Access environmental sensor data'
    },
    {
      name: 'Plant Biology',
      description: 'Plant health and growth predictions'
    },
    {
      name: 'GlobalGAP',
      description: 'Compliance tracking and certification'
    },
    {
      name: 'Webhooks',
      description: 'Event subscriptions and notifications'
    }
  ]
};

export async function GET(req: NextRequest) {
  // Return OpenAPI spec as JSON
  return NextResponse.json(openApiSpec);
}

// Also create an HTML documentation page
export async function POST(req: NextRequest) {
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Vibelux API Documentation</title>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui.css">
</head>
<body>
    <div id="swagger-ui"></div>
    <script src="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
    <script>
        window.onload = function() {
            window.ui = SwaggerUIBundle({
                url: '/api/v1/docs',
                dom_id: '#swagger-ui',
                deepLinking: true,
                presets: [
                    SwaggerUIBundle.presets.apis,
                    SwaggerUIBundle.SwaggerUIStandalonePreset
                ],
                layout: "BaseLayout"
            });
        };
    </script>
</body>
</html>
  `;

  return new NextResponse(html, {
    headers: {
      'Content-Type': 'text/html'
    }
  });
}