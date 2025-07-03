import { NextRequest } from 'next/server'
import { generateAPIResponse } from '@/middleware/api-auth'

export async function GET(req: NextRequest) {
  return generateAPIResponse({
    name: 'Vibelux API',
    version: '2.0',
    status: 'operational',
    endpoints: {
      // Data endpoints
      yield: {
        get: '/api/v2/yield',
        description: 'Get yield data with advanced filtering'
      },
      performance: {
        get: '/api/v2/performance',
        description: 'Get system performance metrics'
      },
      equipment: {
        runtime: '/api/v2/equipment/{id}/runtime',
        description: 'Get equipment runtime statistics'
      },
      
      // Webhook endpoints
      webhooks: {
        subscribe: '/api/v2/webhooks/subscribe',
        unsubscribe: '/api/v2/webhooks/{id}/unsubscribe',
        list: '/api/v2/webhooks',
        test: '/api/v2/webhooks/{id}/test',
        deliveries: '/api/v2/webhooks/{id}/deliveries'
      },
      
      // Recipe sharing endpoints
      recipes: {
        create: '/api/v2/recipes',
        get: '/api/v2/recipes/{id}',
        update: '/api/v2/recipes/{id}',
        fork: '/api/v2/recipes/{id}/fork',
        merge: '/api/v2/recipes/merge-requests',
        search: '/api/v2/recipes/search',
        diff: '/api/v2/recipes/{id}/diff'
      },
      
      // ML model endpoints
      models: {
        upload: '/api/v2/models/upload',
        list: '/api/v2/models',
        get: '/api/v2/models/{id}',
        deploy: '/api/v2/models/{id}/deploy',
        predict: '/api/v2/models/{id}/predict',
        metrics: '/api/v2/models/{id}/metrics',
        docs: '/api/v2/models/{id}/docs'
      },
      
      // API management
      keys: {
        generate: '/api/v2/keys/generate',
        list: '/api/v2/keys',
        revoke: '/api/v2/keys/{id}/revoke'
      }
    },
    features: {
      versioning: 'API versioning with v1 and v2',
      authentication: 'API key based authentication',
      rateLimiting: 'Tier-based rate limiting',
      webhooks: 'Real-time event notifications',
      recipeSharingService: 'Git-style recipe version control',
      mlModels: 'Custom ML model upload and deployment',
      monitoring: 'Comprehensive API monitoring',
      documentation: 'Auto-generated API documentation'
    },
    documentation: 'https://docs.vibelux.com/api/v2',
    support: 'api-support@vibelux.com'
  }, {
    message: 'Welcome to Vibelux API v2.0'
  })
}