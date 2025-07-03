import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// GET /api/equipment-matches - List equipment matches
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role'); // 'requester' or 'investor'
    const status = searchParams.get('status');

    // Build where clause based on user role
    const where: any = {};
    
    if (role === 'requester') {
      where.request = {
        requesterId: session.user.id
      };
    } else if (role === 'investor') {
      where.offer = {
        investorId: session.user.id
      };
    } else {
      // Show all matches where user is either requester or investor
      where.OR = [
        {
          request: {
            requesterId: session.user.id
          }
        },
        {
          offer: {
            investorId: session.user.id
          }
        }
      ];
    }
    
    if (status) {
      where.status = status;
    }

    const matches = await prisma.equipmentMatch.findMany({
      where,
      include: {
        request: {
          include: {
            facility: {
              select: {
                id: true,
                name: true,
                type: true,
                city: true,
                state: true
              }
            },
            requester: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        },
        offer: {
          include: {
            investor: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        },
        escrow: {
          include: {
            transactions: {
              orderBy: {
                createdAt: 'desc'
              }
            }
          }
        },
        verification: true
      },
      orderBy: {
        matchedAt: 'desc'
      }
    });

    // Calculate summary statistics
    const stats = {
      total: matches.length,
      pendingEscrow: matches.filter(m => m.status === 'PENDING_ESCROW').length,
      inEscrow: matches.filter(m => m.status === 'IN_ESCROW').length,
      active: matches.filter(m => m.status === 'ACTIVE').length,
      totalValue: matches.reduce((sum, m) => sum + m.finalValue, 0),
      totalPlatformFees: matches.reduce((sum, m) => sum + m.platformFee, 0)
    };

    return NextResponse.json({
      matches,
      stats
    });
  } catch (error) {
    console.error('Error fetching equipment matches:', error);
    return NextResponse.json(
      { error: 'Failed to fetch equipment matches' },
      { status: 500 }
    );
  }
}