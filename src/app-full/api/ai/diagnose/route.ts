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
    const { symptoms, facilityId, images = [] } = body;

    if (!symptoms || symptoms.length === 0) {
      return NextResponse.json({ error: 'Symptoms are required' }, { status: 400 });
    }

    // Get facility data
    const facility = await prisma.facility.findFirst({
      where: {
        id: facilityId,
        users: {
          some: { userId }
        }
      },
      include: {
        sensorReadings: {
          take: 20,
          orderBy: { timestamp: 'desc' }
        }
      }
    });

    if (!facility) {
      return NextResponse.json({ error: 'Facility not found' }, { status: 403 });
    }

    // Get recent benchmark data
    const benchmarkData = await prisma.benchmarkReport.findFirst({
      where: { facilityId },
      orderBy: { createdAt: 'desc' }
    });

    // Build context
    const context = {
      facilityData: facility,
      sensorData: facility.sensorReadings,
      benchmarkData,
      userRole: 'USER',
      timeframe: '24h',
    };

    // Get AI diagnosis
    const diagnosis = await claudeAssistant.diagnoseIssue(symptoms, context);

    // Save diagnosis case
    const diagnosticCase = await prisma.diagnosticCase.create({
      data: {
        userId,
        facilityId,
        symptoms,
        diagnosis: diagnosis.diagnosis,
        likelihood: diagnosis.likelihood,
        causes: diagnosis.causes,
        solutions: diagnosis.solutions,
        prevention: diagnosis.prevention,
        images,
        status: 'open',
      }
    });

    return NextResponse.json({
      caseId: diagnosticCase.id,
      ...diagnosis,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Error in AI diagnosis:', error);
    return NextResponse.json(
      { error: 'Failed to diagnose issue' },
      { status: 500 }
    );
  }
}