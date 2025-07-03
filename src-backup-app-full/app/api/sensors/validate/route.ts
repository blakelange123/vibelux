import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { designData, sensorReadings } = body

    // Extract design predictions
    const designPPFD = designData.summary?.expectedPPFD || 600
    const designUniformity = parseFloat(designData.summary?.uniformityEstimate?.replace('>', '') || '0.8')
    
    // Calculate actual metrics from sensor readings
    const ppfdValues = sensorReadings.map((r: any) => r.ppfd)
    const avgPPFD = ppfdValues.reduce((sum: number, val: number) => sum + val, 0) / ppfdValues.length
    const minPPFD = Math.min(...ppfdValues)
    const maxPPFD = Math.max(...ppfdValues)
    const actualUniformity = minPPFD / avgPPFD

    // Calculate accuracy
    const ppfdDeviation = avgPPFD - designPPFD
    const accuracy = 100 - Math.abs(ppfdDeviation / designPPFD * 100)
    const uniformityMatch = 100 - Math.abs((actualUniformity - designUniformity) / designUniformity * 100)

    // Generate recommendations
    const recommendations = []
    
    if (accuracy < 90) {
      recommendations.push("Consider recalibrating fixture heights")
    }
    
    if (avgPPFD < designPPFD * 0.9) {
      recommendations.push("Check for fixture dimming or degradation")
      recommendations.push("Verify all fixtures are operating at full power")
    }
    
    if (actualUniformity < designUniformity * 0.9) {
      recommendations.push("Adjust fixture spacing for better uniformity")
    }
    
    if (maxPPFD > designPPFD * 1.3) {
      recommendations.push("Some areas may be receiving excessive light")
    }

    // Add spectrum-specific recommendations
    const hasSpectrum = sensorReadings.some((r: any) => r.spectrum)
    if (hasSpectrum) {
      const avgBlue = sensorReadings
        .filter((r: any) => r.spectrum?.blue)
        .reduce((sum: number, r: any) => sum + r.spectrum.blue, 0) / sensorReadings.length
      
      if (avgBlue < 15) {
        recommendations.push("Consider increasing blue spectrum for vegetative growth")
      } else if (avgBlue > 30) {
        recommendations.push("Blue spectrum may be excessive for flowering stage")
      }
    }

    const validation = {
      accuracy,
      uniformityMatch,
      ppfdDeviation,
      actualPPFD: avgPPFD,
      actualUniformity,
      minPPFD,
      maxPPFD,
      designPPFD,
      designUniformity,
      recommendations,
      timestamp: new Date().toISOString()
    }

    return NextResponse.json(validation)

  } catch (error) {
    console.error('Validation error:', error)
    return NextResponse.json(
      { error: 'Failed to validate sensor data' },
      { status: 500 }
    )
  }
}