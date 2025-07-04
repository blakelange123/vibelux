import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

export async function apiAuthMiddleware(req: NextRequest) {
  // Check for API key in headers
  const apiKey = req.headers.get('x-api-key');
  
  if (apiKey) {
    // Validate API key
    if (apiKey === process.env.API_SECRET_KEY) {
      return NextResponse.next();
    }
    return NextResponse.json({ error: 'Invalid API key' }, { status: 401 });
  }
  
  // Fall back to user authentication
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    return NextResponse.next();
  } catch (error) {
    return NextResponse.json({ error: 'Authentication failed' }, { status: 401 });
  }
}