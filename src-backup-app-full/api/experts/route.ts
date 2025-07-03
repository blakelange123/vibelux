import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const specialty = searchParams.get('specialty');
    const sortBy = searchParams.get('sortBy') || 'rating';
    const search = searchParams.get('search');

    // Build where clause
    const where: any = {
      status: 'ACTIVE'
    };

    if (specialty && specialty !== 'all') {
      where.specialties = {
        has: specialty
      };
    }

    if (search) {
      where.OR = [
        { displayName: { contains: search, mode: 'insensitive' } },
        { bio: { contains: search, mode: 'insensitive' } },
        { specialties: { hasSome: [search] } }
      ];
    }

    // Build orderBy
    let orderBy: any = {};
    switch (sortBy) {
      case 'rating':
        orderBy = { averageRating: 'desc' };
        break;
      case 'experience':
        orderBy = { yearsExperience: 'desc' };
        break;
      case 'sessions':
        orderBy = { totalSessions: 'desc' };
        break;
      case 'price-low':
        orderBy = { hourlyRate: 'asc' };
        break;
      case 'price-high':
        orderBy = { hourlyRate: 'desc' };
        break;
      default:
        orderBy = { averageRating: 'desc' };
    }

    const experts = await prisma.expert.findMany({
      where,
      orderBy,
      include: {
        user: {
          select: { name: true }
        },
        reviews: {
          select: {
            rating: true,
            comment: true,
            createdAt: true,
            client: {
              select: { name: true }
            }
          },
          orderBy: { createdAt: 'desc' },
          take: 5
        }
      }
    });

    return NextResponse.json({
      success: true,
      experts: experts.map(expert => ({
        id: expert.id,
        displayName: expert.displayName,
        title: expert.title,
        photoUrl: expert.photoUrl || '/api/placeholder/150/150',
        bio: expert.bio,
        specialties: expert.specialties,
        certifications: expert.certifications,
        yearsExperience: expert.yearsExperience,
        hourlyRate: expert.hourlyRate,
        averageRating: expert.averageRating || 0,
        totalSessions: expert.totalSessions,
        responseTime: expert.responseTime || 24,
        status: expert.status,
        reviews: expert.reviews.map(review => ({
          rating: review.rating,
          comment: review.comment,
          clientName: review.client.name?.split(' ')[0] + ' ' + (review.client.name?.split(' ')[1]?.[0] || '') + '.',
          createdAt: review.createdAt.toISOString(),
          consultationType: 'General Consultation'
        }))
      }))
    });

  } catch (error) {
    console.error('Error fetching experts:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch experts' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      displayName,
      title,
      bio,
      specialties,
      certifications,
      yearsExperience,
      hourlyRate,
      linkedinUrl,
      websiteUrl,
      timezone,
      availableDays,
      availableHours
    } = body;

    // Check if user already has an expert profile
    const existingExpert = await prisma.expert.findUnique({
      where: { userId: session.user.id }
    });

    if (existingExpert) {
      return NextResponse.json(
        { success: false, error: 'Expert profile already exists' },
        { status: 400 }
      );
    }

    const expert = await prisma.expert.create({
      data: {
        userId: session.user.id,
        displayName,
        title,
        bio,
        specialties,
        certifications,
        yearsExperience: parseInt(yearsExperience),
        hourlyRate: parseFloat(hourlyRate),
        linkedinUrl,
        websiteUrl,
        timezone: timezone || 'America/Los_Angeles',
        availableDays: availableDays || [1, 2, 3, 4, 5], // Mon-Fri
        availableHours: availableHours || { start: '09:00', end: '17:00' },
        status: 'PENDING' // Requires admin approval
      }
    });

    return NextResponse.json({
      success: true,
      expert: {
        id: expert.id,
        status: expert.status
      }
    });

  } catch (error) {
    console.error('Error creating expert:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create expert profile' },
      { status: 500 }
    );
  }
}