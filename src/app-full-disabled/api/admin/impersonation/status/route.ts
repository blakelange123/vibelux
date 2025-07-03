import { NextRequest, NextResponse } from 'next/server';
import { getCurrentImpersonation } from '@/lib/admin/impersonation';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const impersonation = await getCurrentImpersonation(request);
    
    if (!impersonation?.isImpersonating) {
      return NextResponse.json({ isImpersonating: false });
    }
    
    // Get target user email
    const targetUser = await prisma.user.findUnique({
      where: { clerkId: impersonation.targetUserId },
      select: { email: true }
    });
    
    return NextResponse.json({
      isImpersonating: true,
      targetEmail: targetUser?.email,
      sessionId: impersonation.sessionId
    });
  } catch (error) {
    console.error('Error checking impersonation status:', error);
    return NextResponse.json({ isImpersonating: false });
  }
}