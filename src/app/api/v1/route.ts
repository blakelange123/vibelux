import { NextRequest } from 'next/server'
import { generateAPIResponse } from '@/middleware/api-auth'

export async function GET(req: NextRequest) {
  return generateAPIResponse({
    name: 'Vibelux API',
    version: '1.0',
    status: 'operational',
    endpoints: {
      lighting: {
        status: '/api/v1/lighting/status',
        control: '/api/v1/lighting/control'
      },
      environmental: {
        data: '/api/v1/environmental/data'
      },
      biology: {
        predictions: '/api/v1/biology/predictions'
      },
      compliance: {
        globalgap: '/api/v1/compliance/globalgap'
      },
      webhooks: {
        subscribe: '/api/v1/webhooks/subscribe'
      }
    },
    documentation: 'https://docs.vibelux.com/api',
    support: 'api-support@vibelux.com'
  }, {
    message: 'Welcome to Vibelux API v1.0'
  })
}