import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import Stripe from 'stripe';
import { ConsultationEmailService } from '@/lib/email/consultation-notifications';

// Initialize Stripe lazily to avoid build-time errors
let stripe: Stripe | null = null;

function getStripe(): Stripe {
  if (!stripe && process.env.STRIPE_SECRET_KEY) {
    stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-06-20',
    });
  }
  if (!stripe) {
    throw new Error('Stripe is not configured');
  }
  return stripe;
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
      expertId,
      scheduledDate,
      scheduledTime,
      duration, // in minutes
      objectives,
      preparationNotes,
      totalAmount,
      platformFee,
      expertEarnings
    } = body;

    // Verify expert exists and is active
    const expert = await prisma.expert.findFirst({
      where: {
        id: expertId,
        status: 'ACTIVE'
      }
    });

    if (!expert) {
      return NextResponse.json(
        { success: false, error: 'Expert not found or inactive' },
        { status: 404 }
      );
    }

    // Parse scheduled datetime
    const scheduledDateTime = new Date(`${scheduledDate}T${scheduledTime}:00`);
    const scheduledEnd = new Date(scheduledDateTime.getTime() + (duration * 60 * 1000));

    // Check for scheduling conflicts
    const conflictingBooking = await prisma.consultation.findFirst({
      where: {
        expertId,
        status: {
          in: ['REQUESTED', 'APPROVED', 'SCHEDULED', 'IN_PROGRESS']
        },
        OR: [
          {
            AND: [
              { scheduledStart: { lte: scheduledDateTime } },
              { scheduledEnd: { gt: scheduledDateTime } }
            ]
          },
          {
            AND: [
              { scheduledStart: { lt: scheduledEnd } },
              { scheduledEnd: { gte: scheduledEnd } }
            ]
          },
          {
            AND: [
              { scheduledStart: { gte: scheduledDateTime } },
              { scheduledEnd: { lte: scheduledEnd } }
            ]
          }
        ]
      }
    });

    if (conflictingBooking) {
      return NextResponse.json(
        { success: false, error: 'Time slot is no longer available' },
        { status: 409 }
      );
    }

    // Create consultation record
    const consultation = await prisma.consultation.create({
      data: {
        expertId,
        clientId: session.user.id,
        scheduledStart: scheduledDateTime,
        scheduledEnd,
        duration,
        timezone: expert.timezone,
        title: `Consultation with ${expert.displayName}`,
        objectives: Array.isArray(objectives) ? objectives : [objectives],
        preparationNotes: preparationNotes || null,
        hourlyRate: expert.hourlyRate,
        totalAmount,
        platformFee,
        expertEarnings,
        status: 'REQUESTED',
        paymentStatus: 'PENDING'
      },
      include: {
        expert: {
          include: {
            user: {
              select: {
                email: true
              }
            }
          }
        },
        client: {
          select: {
            name: true,
            email: true
          }
        }
      }
    });

    // Create Stripe Checkout Session
    const checkoutSession = await getStripe().checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `Expert Consultation - ${expert.displayName}`,
              description: `${duration / 60} hour consultation on ${scheduledDate} at ${scheduledTime}`,
              images: expert.photoUrl ? [expert.photoUrl] : undefined,
            },
            unit_amount: Math.round(totalAmount * 100), // Stripe expects cents
          },
          quantity: 1,
        },
      ],
      customer_email: session.user.email || undefined,
      metadata: {
        consultationId: consultation.id,
        expertId,
        clientId: session.user.id,
        type: 'consultation'
      },
      success_url: `${process.env.NEXTAUTH_URL}/consultations/${consultation.id}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXTAUTH_URL}/experts/${expertId}/book?cancelled=true`,
      expires_at: Math.floor(Date.now() / 1000) + (30 * 60), // 30 minutes
    });

    // Update consultation with payment intent
    await prisma.consultation.update({
      where: { id: consultation.id },
      data: {
        paymentIntentId: checkoutSession.id
      }
    });

    // Send email notification to expert about new consultation request
    try {
      await ConsultationEmailService.sendNewConsultationRequest({
        id: consultation.id,
        scheduledStart: consultation.scheduledStart,
        duration: consultation.duration,
        objectives: consultation.objectives,
        totalAmount: consultation.totalAmount,
        expert: {
          displayName: consultation.expert.displayName,
          email: consultation.expert.user.email
        },
        client: {
          name: consultation.client.name || 'Client',
          email: consultation.client.email || ''
        }
      });
    } catch (emailError) {
      console.error('Failed to send consultation request email:', emailError);
      // Don't fail the booking if email fails
    }

    return NextResponse.json({
      success: true,
      consultationId: consultation.id,
      checkoutUrl: checkoutSession.url
    });

  } catch (error) {
    console.error('Error creating consultation:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create consultation booking' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const isExpert = searchParams.get('isExpert') === 'true';

    // Build where clause based on user role
    const where: any = isExpert 
      ? { expertId: session.user.id }
      : { clientId: session.user.id };

    if (status) {
      where.status = status;
    }

    const consultations = await prisma.consultation.findMany({
      where,
      include: {
        expert: {
          select: {
            displayName: true,
            title: true,
            photoUrl: true
          }
        },
        client: {
          select: {
            name: true,
            email: true
          }
        }
      },
      orderBy: { scheduledStart: 'desc' }
    });

    return NextResponse.json({
      success: true,
      consultations: consultations.map(consultation => ({
        id: consultation.id,
        scheduledStart: consultation.scheduledStart.toISOString(),
        scheduledEnd: consultation.scheduledEnd.toISOString(),
        duration: consultation.duration,
        title: consultation.title,
        status: consultation.status,
        paymentStatus: consultation.paymentStatus,
        totalAmount: consultation.totalAmount,
        expert: consultation.expert,
        client: consultation.client,
        objectives: consultation.objectives,
        preparationNotes: consultation.preparationNotes
      }))
    });

  } catch (error) {
    console.error('Error fetching consultations:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch consultations' },
      { status: 500 }
    );
  }
}