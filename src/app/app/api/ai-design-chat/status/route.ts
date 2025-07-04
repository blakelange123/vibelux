import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { aiRateLimiter } from '@/lib/ai-rate-limiter';

export async function GET() {
  try {
    const { userId } = await auth();
    const rateLimitKey = userId || 'anonymous';
    
    // Get current usage
    const usage = aiRateLimiter.getUsage(rateLimitKey);
    
    // Check Claude API key
    const hasApiKey = !!process.env.CLAUDE_API_KEY;
    
    return NextResponse.json({
      status: hasApiKey ? 'operational' : 'no_api_key',
      ai: {
        provider: 'Anthropic',
        model: 'claude-3-5-sonnet-20241022',
        available: hasApiKey
      },
      rateLimit: {
        used: usage.used,
        remaining: usage.remaining,
        resetIn: usage.resetIn,
        limit: 50 // per minute
      },
      tips: [
        'For large facilities (>10,000 sq ft), break into zones',
        'Be specific about fixture preferences',
        'Include budget constraints for better recommendations',
        'Retry after a few seconds if rate limited'
      ]
    });
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      message: 'Failed to get AI status'
    }, { status: 500 });
  }
}