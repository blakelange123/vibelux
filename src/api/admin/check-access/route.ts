import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { isUserAdmin } from '@/lib/admin/impersonation';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ isAdmin: false }, { status: 401 });
    }
    
    const isAdmin = await isUserAdmin(userId);
    
    return NextResponse.json({ isAdmin });
  } catch (error) {
    console.error('Error checking admin access:', error);
    return NextResponse.json({ isAdmin: false }, { status: 500 });
  }
}