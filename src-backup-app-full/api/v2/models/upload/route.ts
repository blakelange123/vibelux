import { NextRequest, NextResponse } from 'next/server'
import { validateAPIKey, generateAPIResponse, generateErrorResponse } from '@/middleware/api-auth'
import PublicAPIService from '@/services/public-api-service'
import ModelRegistryService from '@/services/model-registry-service'
import { z } from 'zod'

const apiService = new PublicAPIService()
const modelService = new ModelRegistryService()

export async function POST(req: NextRequest) {
  try {
    // Validate API key
    const apiKey = req.headers.get('X-API-Key')
    if (!apiKey) {
      return generateErrorResponse('API key required', 401)
    }

    const validation = await apiService.validateRequest(apiKey, '/api/v2/models/upload')
    if (!validation.valid) {
      return generateErrorResponse(validation.error || 'Invalid API key', 401)
    }

    // Check ML upload permission
    if (!validation.keyData?.permissions.includes('ml:upload')) {
      return generateErrorResponse('Insufficient permissions for model upload', 403)
    }

    // Parse multipart form data
    const formData = await req.formData()
    const modelFile = formData.get('model') as File
    const metadataStr = formData.get('metadata') as string

    if (!modelFile || !metadataStr) {
      return generateErrorResponse('Model file and metadata required', 400)
    }

    // Parse and validate metadata
    let metadata
    try {
      metadata = JSON.parse(metadataStr)
    } catch {
      return generateErrorResponse('Invalid metadata JSON', 400)
    }

    // Convert file to buffer
    const buffer = Buffer.from(await modelFile.arrayBuffer())

    // Upload model
    const result = await modelService.uploadModel(
      validation.keyData.id, // Use API key ID as user ID
      buffer,
      metadata
    )

    return generateAPIResponse({
      modelId: result.modelId,
      version: result.version,
      status: 'uploaded',
      message: 'Model uploaded successfully and validation started'
    }, {
      endpoint: '/api/v2/models/upload',
      rateLimitRemaining: validation.remaining
    })

  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return generateErrorResponse(`Validation error: ${error.errors.map(e => e.message).join(', ')}`, 400)
    }
    console.error('Model upload error:', error)
    return generateErrorResponse(error.message || 'Internal server error', 500)
  }
}