import { NextResponse } from 'next/server';
import { aiRateLimiter } from '@/lib/ai-rate-limiter';
import { claudeQueue } from '@/lib/claude-queue';
import { checkProductionReadiness, CLAUDE_CONFIG } from '@/lib/claude-config';
import { auth } from '@clerk/nextjs/server';

export async function GET() {
  try {
    // Get user ID for rate limit check
    const { userId } = await auth();
    const rateLimitKey = userId || 'anonymous';
    
    // Get current rate limit status
    const rateLimitStatus = aiRateLimiter.getUsage(rateLimitKey);
    
    // Get queue status
    const queueStatus = claudeQueue.getStatus();
    
    // Check production readiness
    const readiness = checkProductionReadiness();
    
    return NextResponse.json({
      status: 'operational',
      configuration: {
        hasApiKey: !!process.env.CLAUDE_API_KEY,
        models: CLAUDE_CONFIG.models,
        rateLimits: {
          maxRetries: CLAUDE_CONFIG.rateLimits.maxRetries,
          retryDelay: CLAUDE_CONFIG.rateLimits.retryDelay,
          backoffFactor: CLAUDE_CONFIG.rateLimits.backoffFactor,
          timeout: CLAUDE_CONFIG.rateLimits.timeout
        }
      },
      usage: {
        internal: {
          ...rateLimitStatus,
          limit: 100, // per minute
          window: '1 minute'
        },
        queue: queueStatus
      },
      readiness,
      tips: [
        'We use Claude Haiku for simple requests to reduce costs',
        'Complex multi-zone designs use Claude Sonnet for better accuracy',
        'Requests are queued to prevent concurrent API calls',
        'Automatic retry with exponential backoff on rate limits',
        'Enhanced fallback designer handles calculations when AI is unavailable'
      ]
    });
  } catch (error) {
    console.error('AI Status Error:', error);
    return NextResponse.json({
      status: 'error',
      error: 'Failed to get AI status'
    }, { status: 500 });
  }
}