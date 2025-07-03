import { NextRequest, NextResponse } from 'next/server'
import { validateAPIKey, generateAPIResponse, generateErrorResponse } from '@/middleware/api-auth'
import PublicAPIService from '@/services/public-api-service'

const apiService = new PublicAPIService()

export async function GET(req: NextRequest) {
  try {
    // Validate API key
    const apiKey = req.headers.get('X-API-Key')
    if (!apiKey) {
      return generateErrorResponse('API key required', 401)
    }

    const validation = await apiService.validateRequest(apiKey, '/api/v2/yield')
    if (!validation.valid) {
      return generateErrorResponse(validation.error || 'Invalid API key', 401)
    }

    // Parse query parameters
    const searchParams = req.nextUrl.searchParams
    const facilityId = searchParams.get('facilityId')
    
    if (!facilityId) {
      return generateErrorResponse('facilityId parameter required', 400)
    }

    const filters = {
      cultivar: searchParams.get('cultivar') || undefined,
      startDate: searchParams.get('startDate') ? new Date(searchParams.get('startDate')!) : undefined,
      endDate: searchParams.get('endDate') ? new Date(searchParams.get('endDate')!) : undefined,
      minYield: searchParams.get('minYield') ? parseFloat(searchParams.get('minYield')!) : undefined,
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 50,
      offset: searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : 0
    }

    // Get yield data
    const data = await apiService.getYieldData(facilityId, filters)

    return generateAPIResponse(data, {
      endpoint: '/api/v2/yield',
      rateLimitRemaining: validation.remaining
    })

  } catch (error: any) {
    console.error('Yield API error:', error)
    return generateErrorResponse(error.message || 'Internal server error', 500)
  }
}