// Authentication utilities
import { auth } from '@clerk/nextjs/server';
import { NextRequest } from 'next/server';

// Re-export auth from Clerk for convenience
export { auth } from '@clerk/nextjs/server';

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

// NextAuth compatibility layer for routes expecting authOptions
// This is a placeholder since we're using Clerk instead of NextAuth
export const authOptions = {
  providers: [],
  callbacks: {
    async session({ session, token }: any) {
      return session;
    },
    async jwt({ token, user }: any) {
      return token;
    }
  },
  pages: {
    signIn: '/sign-in',
    signOut: '/sign-out',
    error: '/auth/error',
  }
};