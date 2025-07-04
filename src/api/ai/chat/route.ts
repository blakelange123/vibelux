import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { claudeAssistant } from '@/lib/ai/claude-integration';

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { query, facilityId, context = {} } = body;

    if (!query) {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 });
    }

    // Get facility data and user access
    const facility = await prisma.facility.findFirst({
      where: {
        id: facilityId,
        users: {
          some: { userId }
        }
      },
      include: {
        sensorReadings: {
          take: 50,
          orderBy: { timestamp: 'desc' }
        }
      }
    });

    if (!facility) {
      return NextResponse.json({ error: 'Facility not found or access denied' }, { status: 403 });
    }

    // Get recent benchmark data
    const benchmarkData = await prisma.benchmarkReport.findFirst({
      where: { facilityId },
      orderBy: { createdAt: 'desc' }
    });

    // Get user info
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true }
    });

    // Build context for Claude
    const queryContext = {
      facilityData: facility,
      sensorData: facility.sensorReadings,
      benchmarkData,
      userRole: user?.role || 'USER',
      timeframe: context.timeframe || '24h',
    };

    // Get AI response
    const aiResponse = await claudeAssistant.answerDataQuery(query, queryContext);

    // Save conversation for context/training
    await prisma.aiConversation.create({
      data: {
        userId,
        facilityId,
        query,
        response: aiResponse.answer,
        confidence: aiResponse.confidence,
        context: queryContext,
      }
    });

    return NextResponse.json({
      ...aiResponse,
      timestamp: new Date().toISOString(),
      facilityName: facility.name,
    });

  } catch (error) {
    console.error('Error in AI chat:', error);
    return NextResponse.json(
      { error: 'Failed to process query' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = req.nextUrl.searchParams;
    const facilityId = searchParams.get('facilityId');

    // Get recent conversations
    const conversations = await prisma.aiConversation.findMany({
      where: {
        userId,
        ...(facilityId && { facilityId }),
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
      select: {
        id: true,
        query: true,
        response: true,
        confidence: true,
        createdAt: true,
        facility: {
          select: { name: true }
        }
      }
    });

    return NextResponse.json({ conversations });

  } catch (error) {
    console.error('Error fetching conversations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch conversations' },
      { status: 500 }
    );
  }
}