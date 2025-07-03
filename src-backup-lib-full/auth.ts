// Authentication utilities
import { auth } from '@clerk/nextjs/server';
import { NextRequest } from 'next/server';

export async function authenticateRequest(req: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return { 
        isAuthenticated: false, 
        userId: null,
        error: 'Unauthorized' 
      };
    }

    return { 
      isAuthenticated: true, 
      userId,
      error: null 
    };
  } catch (error) {
    console.error('Authentication error:', error);
    return { 
      isAuthenticated: false, 
      userId: null,
      error: 'Authentication failed' 
    };
  }
}

export async function requireAuth() {
  const { userId } = await auth();
  
  if (!userId) {
    throw new Error('Unauthorized');
  }
  
  return userId;
}

export function isAuthorized(userId: string, resourceOwnerId: string): boolean {
  return userId === resourceOwnerId;
}