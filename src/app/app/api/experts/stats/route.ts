import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get expert profile
    const expert = await prisma.expert.findUnique({
      where: { userId: session.user.id }
    });

    if (!expert) {
      return NextResponse.json(
        { success: false, error: 'Expert profile not found' },
        { status: 404 }
      );
    }

    // Calculate date ranges
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    // Get consultation stats
    const [
      totalConsultations,
      monthlyConsultations,
      completedConsultations,
      totalEarningsSum,
      monthlyEarningsSum,
      averageRatingData,
      pendingPayouts
    ] = await Promise.all([
      // Total consultations
      prisma.consultation.count({
        where: {
          expertId: expert.id,
          status: 'COMPLETED'
        }
      }),

      // Monthly consultations
      prisma.consultation.count({
        where: {
          expertId: expert.id,
          status: 'COMPLETED',
          actualEnd: {
            gte: startOfMonth
          }
        }
      }),

      // Completed consultations for completion rate
      prisma.consultation.count({
        where: {
          expertId: expert.id,
          status: {
            in: ['COMPLETED', 'CANCELLED', 'NO_SHOW']
          }
        }
      }),

      // Total earnings
      prisma.consultation.aggregate({
        where: {
          expertId: expert.id,
          status: 'COMPLETED',
          paymentStatus: 'CAPTURED'
        },
        _sum: {
          expertEarnings: true
        }
      }),

      // Monthly earnings
      prisma.consultation.aggregate({
        where: {
          expertId: expert.id,
          status: 'COMPLETED',
          paymentStatus: 'CAPTURED',
          actualEnd: {
            gte: startOfMonth
          }
        },
        _sum: {
          expertEarnings: true
        }
      }),

      // Average rating
      prisma.expertReview.aggregate({
        where: {
          expertId: expert.id
        },
        _avg: {
          rating: true
        },
        _count: {
          rating: true
        }
      }),

      // Pending payouts (completed but not yet paid out)
      prisma.consultation.aggregate({
        where: {
          expertId: expert.id,
          status: 'COMPLETED',
          paymentStatus: 'CAPTURED',
          // Add condition for unpaid consultations
        },
        _sum: {
          expertEarnings: true
        }
      })
    ]);

    // Calculate completion rate
    const totalScheduled = await prisma.consultation.count({
      where: {
        expertId: expert.id,
        status: {
          in: ['COMPLETED', 'CANCELLED', 'NO_SHOW']
        }
      }
    });

    const completionRate = totalScheduled > 0 
      ? Math.round((totalConsultations / totalScheduled) * 100) 
      : 100;

    // Calculate average response time (simplified - in production, track actual response times)
    const responseTime = expert.responseTime || 24;

    // Calculate next payout date (weekly payouts)
    const nextFriday = new Date();
    nextFriday.setDate(nextFriday.getDate() + (5 - nextFriday.getDay() + 7) % 7);
    const nextPayoutDate = nextFriday.toLocaleDateString();

    const stats = {
      totalEarnings: totalEarningsSum._sum.expertEarnings || 0,
      monthlyEarnings: monthlyEarningsSum._sum.expertEarnings || 0,
      totalSessions: totalConsultations,
      averageRating: averageRatingData._avg.rating || null,
      responseTime,
      completionRate,
      pendingPayouts: pendingPayouts._sum.expertEarnings || 0,
      nextPayoutDate,
      reviewCount: averageRatingData._count.rating
    };

    return NextResponse.json({
      success: true,
      stats
    });

  } catch (error) {
    console.error('Error fetching expert stats:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch expert statistics' },
      { status: 500 }
    );
  }
}