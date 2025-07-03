import { NextRequest } from 'next/server';
import { auth } from '@clerk/nextjs/server';

export async function authenticateRequest(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return { authenticated: false, error: 'Unauthorized' };
    }
    
    return { authenticated: true, userId };
  } catch (error) {
    console.error('Authentication error:', error);
    return { authenticated: false, error: 'Authentication failed' };
  }
}

export function requireAuth() {
  return async (request: NextRequest) => {
    const authResult = await authenticateRequest(request);
    
    if (!authResult.authenticated) {
      return new Response(JSON.stringify({ error: authResult.error }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    
    return authResult;
  };
}