import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { SUBSCRIPTION_TIERS_15 } from '@/lib/subscription-tiers-15';

// Validation schemas
const inviteUserSchema = z.object({
  email: z.string().email(),
  role: z.enum(['ADMIN', 'MANAGER', 'OPERATOR', 'VIEWER']),
  sendEmail: z.boolean().optional().default(true)
});

const updateUserRoleSchema = z.object({
  userId: z.string(),
  role: z.enum(['ADMIN', 'MANAGER', 'OPERATOR', 'VIEWER'])
});

// GET /api/facility/users - Get facility users
export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get facility
    const facility = await db.facilities.findByUserId(userId);
    if (!facility) {
      return NextResponse.json({ error: 'No facility found' }, { status: 404 });
    }
    
    // Get all facility users
    const facilityUsers = await db.prisma.facilityUser.findMany({
      where: { facilityId: facility.id },
      include: {
        user: true
      },
      orderBy: { joinedAt: 'asc' }
    });
    
    const users = facilityUsers.map(fu => ({
      id: fu.userId,
      name: fu.user.name,
      email: fu.user.email,
      role: fu.role,
      permissions: fu.permissions,
      joinedAt: fu.joinedAt,
      lastActive: fu.updatedAt,
      status: 'active' // Could add status tracking
    }));
    
    // Get pending invitations
    const pendingInvites = await db.prisma.facilityInvite.findMany({
      where: {
        facilityId: facility.id,
        status: 'PENDING'
      },
      orderBy: { createdAt: 'desc' }
    });
    
    return NextResponse.json({
      users,
      pendingInvites: pendingInvites.map(invite => ({
        id: invite.id,
        email: invite.email,
        role: invite.role,
        invitedBy: invite.invitedBy,
        invitedAt: invite.createdAt,
        expiresAt: invite.expiresAt
      }))
    });
  } catch (error) {
    console.error('Error fetching facility users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

// POST /api/facility/users - Invite user to facility
export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const body = await req.json();
    
    // Validate request
    const validationResult = inviteUserSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: validationResult.error.errors },
        { status: 400 }
      );
    }
    
    const { email, role, sendEmail } = validationResult.data;
    
    // Get facility and verify permissions
    const facility = await db.facilities.findByUserId(userId);
    if (!facility) {
      return NextResponse.json({ error: 'No facility found' }, { status: 404 });
    }
    
    // Check user can invite (owner or admin)
    const facilityUser = await db.prisma.facilityUser.findFirst({
      where: {
        userId,
        facilityId: facility.id,
        role: { in: ['OWNER', 'ADMIN'] }
      }
    });
    
    if (!facilityUser) {
      return NextResponse.json(
        { error: 'Insufficient permissions to invite users' },
        { status: 403 }
      );
    }
    
    // Get the facility owner to check their subscription tier
    const facilityOwner = await db.prisma.facilityUser.findFirst({
      where: {
        facilityId: facility.id,
        role: 'OWNER'
      },
      include: {
        user: true
      }
    });

    if (!facilityOwner) {
      return NextResponse.json(
        { error: 'Facility owner not found' },
        { status: 500 }
      );
    }

    // Get the owner's subscription tier
    const ownerSubscriptionTier = facilityOwner.user.subscriptionTier || 'free';
    const tierConfig = SUBSCRIPTION_TIERS_15.find(tier => tier.id === ownerSubscriptionTier);
    
    if (!tierConfig) {
      return NextResponse.json(
        { error: 'Invalid subscription tier' },
        { status: 500 }
      );
    }

    // Count current team members
    const currentTeamMemberCount = await db.prisma.facilityUser.count({
      where: { facilityId: facility.id }
    });

    // Count pending invitations
    const pendingInviteCount = await db.prisma.facilityInvite.count({
      where: {
        facilityId: facility.id,
        status: 'PENDING'
      }
    });

    // Check if adding a new member would exceed the limit
    const totalMembers = currentTeamMemberCount + pendingInviteCount;
    const teamMemberLimit = tierConfig.limits.teamMembers;

    if (totalMembers >= teamMemberLimit) {
      return NextResponse.json(
        { 
          error: `Team member limit reached. Your ${tierConfig.name} plan allows ${teamMemberLimit} team member${teamMemberLimit > 1 ? 's' : ''}. You currently have ${currentTeamMemberCount} member${currentTeamMemberCount > 1 ? 's' : ''} and ${pendingInviteCount} pending invitation${pendingInviteCount !== 1 ? 's' : ''}. Please upgrade your plan to add more team members.`,
          currentMembers: currentTeamMemberCount,
          pendingInvites: pendingInviteCount,
          limit: teamMemberLimit,
          tier: tierConfig.name
        },
        { status: 403 }
      );
    }

    // Check if user already exists in facility
    const existingUser = await db.prisma.user.findUnique({
      where: { email }
    });
    
    if (existingUser) {
      const existingFacilityUser = await db.prisma.facilityUser.findFirst({
        where: {
          userId: existingUser.id,
          facilityId: facility.id
        }
      });
      
      if (existingFacilityUser) {
        return NextResponse.json(
          { error: 'User already belongs to this facility' },
          { status: 400 }
        );
      }
    }
    
    // Create invitation
    const invite = await db.prisma.facilityInvite.create({
      data: {
        facilityId: facility.id,
        email,
        role,
        invitedBy: userId,
        token: generateInviteToken(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        status: 'PENDING'
      }
    });
    
    // TODO: Send invitation email if sendEmail is true
    if (sendEmail) {
      // await sendFacilityInviteEmail(email, facility.name, invite.token);
    }
    
    return NextResponse.json({
      invite: {
        id: invite.id,
        email: invite.email,
        role: invite.role,
        expiresAt: invite.expiresAt
      }
    });
  } catch (error) {
    console.error('Error inviting user:', error);
    return NextResponse.json(
      { error: 'Failed to invite user' },
      { status: 500 }
    );
  }
}

// PUT /api/facility/users - Update user role
export async function PUT(req: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const body = await req.json();
    
    // Validate request
    const validationResult = updateUserRoleSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: validationResult.error.errors },
        { status: 400 }
      );
    }
    
    const { userId: targetUserId, role: newRole } = validationResult.data;
    
    // Get facility and verify permissions
    const facility = await db.facilities.findByUserId(userId);
    if (!facility) {
      return NextResponse.json({ error: 'No facility found' }, { status: 404 });
    }
    
    // Check user can update roles (owner or admin)
    const facilityUser = await db.prisma.facilityUser.findFirst({
      where: {
        userId,
        facilityId: facility.id,
        role: { in: ['OWNER', 'ADMIN'] }
      }
    });
    
    if (!facilityUser) {
      return NextResponse.json(
        { error: 'Insufficient permissions to update user roles' },
        { status: 403 }
      );
    }
    
    // Get target user
    const targetFacilityUser = await db.prisma.facilityUser.findFirst({
      where: {
        userId: targetUserId,
        facilityId: facility.id
      }
    });
    
    if (!targetFacilityUser) {
      return NextResponse.json(
        { error: 'User not found in facility' },
        { status: 404 }
      );
    }
    
    // Cannot change owner role
    if (targetFacilityUser.role === 'OWNER') {
      return NextResponse.json(
        { error: 'Cannot change owner role' },
        { status: 400 }
      );
    }
    
    // Only owner can promote to admin
    if (newRole === 'ADMIN' && facilityUser.role !== 'OWNER') {
      return NextResponse.json(
        { error: 'Only owner can promote users to admin' },
        { status: 403 }
      );
    }
    
    // Update role
    const updated = await db.prisma.facilityUser.update({
      where: { id: targetFacilityUser.id },
      data: { role: newRole },
      include: { user: true }
    });
    
    return NextResponse.json({
      user: {
        id: updated.userId,
        name: updated.user.name,
        email: updated.user.email,
        role: updated.role,
        updatedAt: updated.updatedAt
      }
    });
  } catch (error) {
    console.error('Error updating user role:', error);
    return NextResponse.json(
      { error: 'Failed to update user role' },
      { status: 500 }
    );
  }
}

// DELETE /api/facility/users/[userId] - Remove user from facility
export async function DELETE(req: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const url = new URL(req.url);
    const targetUserId = url.pathname.split('/').pop();
    
    if (!targetUserId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }
    
    // Get facility and verify permissions
    const facility = await db.facilities.findByUserId(userId);
    if (!facility) {
      return NextResponse.json({ error: 'No facility found' }, { status: 404 });
    }
    
    // Check user can remove users (owner or admin)
    const facilityUser = await db.prisma.facilityUser.findFirst({
      where: {
        userId,
        facilityId: facility.id,
        role: { in: ['OWNER', 'ADMIN'] }
      }
    });
    
    if (!facilityUser) {
      return NextResponse.json(
        { error: 'Insufficient permissions to remove users' },
        { status: 403 }
      );
    }
    
    // Get target user
    const targetFacilityUser = await db.prisma.facilityUser.findFirst({
      where: {
        userId: targetUserId,
        facilityId: facility.id
      }
    });
    
    if (!targetFacilityUser) {
      return NextResponse.json(
        { error: 'User not found in facility' },
        { status: 404 }
      );
    }
    
    // Cannot remove owner
    if (targetFacilityUser.role === 'OWNER') {
      return NextResponse.json(
        { error: 'Cannot remove facility owner' },
        { status: 400 }
      );
    }
    
    // Cannot remove self
    if (targetUserId === userId) {
      return NextResponse.json(
        { error: 'Cannot remove yourself from facility' },
        { status: 400 }
      );
    }
    
    // Remove user
    await db.prisma.facilityUser.delete({
      where: { id: targetFacilityUser.id }
    });
    
    return NextResponse.json({ message: 'User removed from facility' });
  } catch (error) {
    console.error('Error removing user:', error);
    return NextResponse.json(
      { error: 'Failed to remove user' },
      { status: 500 }
    );
  }
}

// Helper function to generate invite token
function generateInviteToken(): string {
  return crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF.toString(36).substring(2) + Date.now().toString(36);
}