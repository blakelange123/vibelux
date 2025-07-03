import { NextRequest } from 'next/server'
import { validateAPIKey, generateAPIResponse, generateErrorResponse, trackAPIUsage } from '@/middleware/api-auth'

interface LightingControlRequest {
  action: 'set_intensity' | 'set_spectrum' | 'set_schedule' | 'toggle'
  target: 'system' | 'zone' | 'fixture'
  targetId?: string
  parameters: {
    intensity?: number // 0-100
    spectrum?: {
      red?: number
      blue?: number
      green?: number
      farRed?: number
      uv?: number
      white?: number
    }
    schedule?: {
      on: string // HH:MM
      off: string // HH:MM
      rampTime?: number // minutes
    }
    enabled?: boolean
  }
}

export async function POST(req: NextRequest) {
  try {
    // Validate API key
    const apiContext = await validateAPIKey(req)
    if (!apiContext) {
      return generateErrorResponse('Invalid or missing API key', 401)
    }
    
    // Check write permission
    if (!apiContext.client.permissions.includes('write')) {
      return generateErrorResponse('Insufficient permissions', 403)
    }
    
    // Track usage
    await trackAPIUsage(apiContext.apiKey, '/api/v1/lighting/control', 'POST')
    
    // Parse request body
    const body: LightingControlRequest = await req.json()
    
    // Validate request
    if (!body.action || !body.target || !body.parameters) {
      return generateErrorResponse('Invalid request format')
    }
    
    // Validate parameters based on action
    switch (body.action) {
      case 'set_intensity':
        if (typeof body.parameters.intensity !== 'number' || 
            body.parameters.intensity < 0 || 
            body.parameters.intensity > 100) {
          return generateErrorResponse('Intensity must be between 0 and 100')
        }
        break
        
      case 'set_spectrum':
        if (!body.parameters.spectrum) {
          return generateErrorResponse('Spectrum parameters required')
        }
        const spectrumTotal = Object.values(body.parameters.spectrum).reduce((sum, val) => sum + (val || 0), 0)
        if (Math.abs(spectrumTotal - 100) > 0.1) {
          return generateErrorResponse('Spectrum values must sum to 100%')
        }
        break
        
      case 'set_schedule':
        if (!body.parameters.schedule) {
          return generateErrorResponse('Schedule parameters required')
        }
        break
        
      case 'toggle':
        if (typeof body.parameters.enabled !== 'boolean') {
          return generateErrorResponse('Enabled parameter must be boolean')
        }
        break
    }
    
    // Mock command execution (in production, send to hardware controller)
    const commandResult = {
      success: true,
      action: body.action,
      target: body.target,
      targetId: body.targetId,
      parameters: body.parameters,
      executedAt: new Date().toISOString(),
      affectedFixtures: body.target === 'system' ? 48 : body.target === 'zone' ? 24 : 1,
      estimatedCompletion: new Date(Date.now() + 5000).toISOString()
    }
    
    // Mock real-time update notification (in production, use WebSocket)
    setTimeout(() => {
    }, 5000)
    
    return generateAPIResponse(commandResult, {
      version: '1.0',
      command_id: `cmd_${Date.now()}`
    })
    
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'Rate limit exceeded') {
        return generateErrorResponse('Rate limit exceeded', 429)
      }
      return generateErrorResponse(error.message)
    }
    return generateErrorResponse('Internal server error', 500)
  }
}