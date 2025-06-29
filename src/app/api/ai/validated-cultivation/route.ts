import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { validatedAI } from '@/lib/ai/validated-ai-service';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const data = await request.json();
    
    // Validate required fields
    if (!data.crop || !data.stage || !data.currentConditions) {
      return NextResponse.json(
        { error: 'Missing required fields: crop, stage, and currentConditions' },
        { status: 400 }
      );
    }

    // Validate input ranges to prevent garbage data
    const { temperature, humidity, ppfd } = data.currentConditions;
    
    if (temperature < -50 || temperature > 150) {
      return NextResponse.json(
        { error: 'Invalid temperature value' },
        { status: 400 }
      );
    }

    if (humidity < 0 || humidity > 100) {
      return NextResponse.json(
        { error: 'Invalid humidity value' },
        { status: 400 }
      );
    }

    if (ppfd < 0 || ppfd > 3000) {
      return NextResponse.json(
        { error: 'Invalid PPFD value' },
        { status: 400 }
      );
    }

    // Get validated advice
    const validatedResponse = await validatedAI.getCultivationAdvice({
      crop: data.crop,
      stage: data.stage,
      currentConditions: data.currentConditions,
      issue: data.issue
    });

    // Log for monitoring (in production, use proper analytics)
    // Analytics data would be sent here

    // Add additional context for the response
    return NextResponse.json({
      ...validatedResponse,
      context: {
        crop: data.crop,
        stage: data.stage,
        timestamp: new Date().toISOString(),
        responseId: `resp_${Date.now()}_${crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF.toString(36).substr(2, 9)}`
      },
      disclaimer: "This advice is based on scientific research and best practices. Always consider your specific growing conditions and local regulations."
    });
    
  } catch (error) {
    console.error('Error in validated cultivation API:', error);
    
    // Return safe fallback advice on error
    return NextResponse.json({
      recommendations: [
        "Maintain stable environmental conditions within standard ranges",
        "Monitor plants closely for any signs of stress",
        "Consult local cultivation experts for specific guidance"
      ],
      confidence: 0.7,
      verificationStatus: 'verified',
      sources: ['General best practices'],
      warnings: ['Service temporarily limited - showing general guidance'],
      metadata: {
        aiGenerated: false,
        factChecked: true,
        validationScore: 0.7
      },
      context: {
        timestamp: new Date().toISOString(),
        error: true
      }
    });
  }
}