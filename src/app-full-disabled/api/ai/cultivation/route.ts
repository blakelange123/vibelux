import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { claudeAI } from '@/lib/ai/claude-service';

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
    if (!data.strain || !data.currentConditions) {
      return NextResponse.json(
        { error: 'Missing required cultivation data' },
        { status: 400 }
      );
    }

    // Get AI analysis
    const analysis = await claudeAI.analyzeCultivationData({
      strain: data.strain,
      currentConditions: data.currentConditions,
      environmentalData: data.environmentalData || {},
      yieldHistory: data.yieldHistory || []
    });

    // Log usage for analytics

    return NextResponse.json({
      success: true,
      analysis: analysis.analysis,
      recommendations: analysis.recommendations,
      confidence: analysis.confidence,
      insights: analysis.insights,
      nextSteps: analysis.nextSteps,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error in AI cultivation analysis:', error);
    
    // Handle rate limiting
    if (error instanceof Error && error.message.includes('rate limit')) {
      return NextResponse.json(
        { error: 'AI service rate limit reached. Please try again later.' },
        { status: 429 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to analyze cultivation data' },
      { status: 500 }
    );
  }
}