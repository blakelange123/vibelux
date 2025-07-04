import { NextRequest } from 'next/server'
import { validateAPIKey, generateAPIResponse, generateErrorResponse, trackAPIUsage } from '@/middleware/api-auth'

export async function GET(req: NextRequest) {
  try {
    // Validate API key
    const apiContext = await validateAPIKey(req)
    if (!apiContext) {
      return generateErrorResponse('Invalid or missing API key', 401)
    }
    
    // Track usage
    await trackAPIUsage(apiContext.apiKey, '/api/v1/lighting/status', 'GET')
    
    // Mock lighting system status (in production, fetch from database)
    const lightingStatus = {
      system: {
        online: true,
        totalFixtures: 48,
        activeFixtures: 45,
        totalPower: 4800, // watts
        efficiency: 2.7 // μmol/J
      },
      zones: [
        {
          id: 'zone-1',
          name: 'Vegetative Area',
          fixtures: 24,
          active: 24,
          settings: {
            intensity: 85, // %
            spectrum: {
              red: 65,
              blue: 25,
              green: 5,
              farRed: 5
            },
            photoperiod: {
              on: '06:00',
              off: '22:00',
              duration: 16
            }
          },
          metrics: {
            avgPPFD: 450,
            uniformity: 0.85,
            dli: 25.9
          }
        },
        {
          id: 'zone-2',
          name: 'Flowering Area',
          fixtures: 24,
          active: 21,
          settings: {
            intensity: 100,
            spectrum: {
              red: 70,
              blue: 20,
              green: 3,
              farRed: 7
            },
            photoperiod: {
              on: '06:00',
              off: '18:00',
              duration: 12
            }
          },
          metrics: {
            avgPPFD: 650,
            uniformity: 0.88,
            dli: 28.1
          }
        }
      ],
      schedules: [
        {
          id: 'sunrise-sunset',
          name: 'Sunrise/Sunset Simulation',
          active: true,
          type: 'dimming',
          duration: 30 // minutes
        }
      ],
      alerts: [
        {
          id: 'fixture-offline',
          severity: 'warning',
          fixture: 'FX-023',
          message: 'Fixture offline for 2 hours',
          timestamp: new Date(Date.now() - 7200000).toISOString()
        }
      ]
    }
    
    return generateAPIResponse(lightingStatus, {
      version: '1.0',
      cached: false
    })
    
  } catch (error) {
    if (error instanceof Error && error.message === 'Rate limit exceeded') {
      return generateErrorResponse('Rate limit exceeded', 429)
    }
    return generateErrorResponse('Internal server error', 500)
  }
}