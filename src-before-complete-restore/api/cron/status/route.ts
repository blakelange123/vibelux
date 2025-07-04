import { NextResponse } from 'next/server';
import { getCronRunner } from '@/services/cron-runner';

export async function GET() {
  try {
    const cronRunner = getCronRunner();
    const health = cronRunner.getHealth();
    const jobs = cronRunner.getJobStatuses();

    return NextResponse.json({
      success: true,
      health,
      jobs,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error getting cron status:', error);
    return NextResponse.json(
      { error: 'Failed to get cron status' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { action, jobName } = await request.json();
    const cronRunner = getCronRunner();

    switch (action) {
      case 'start':
        await cronRunner.start();
        break;
      
      case 'stop':
        await cronRunner.stop();
        break;
      
      case 'trigger':
        if (!jobName) {
          return NextResponse.json(
            { error: 'Job name required for trigger action' },
            { status: 400 }
          );
        }
        const success = await cronRunner.triggerJob(jobName);
        if (!success) {
          return NextResponse.json(
            { error: `Job not found: ${jobName}` },
            { status: 404 }
          );
        }
        break;
      
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      message: `Action ${action} completed successfully`,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error controlling cron runner:', error);
    return NextResponse.json(
      { error: 'Failed to control cron runner' },
      { status: 500 }
    );
  }
}