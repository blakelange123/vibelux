import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { createTrackTraceService } from '@/lib/integrations/cannabis-track-trace';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { facilityId, config } = body;

    if (!facilityId || !config || !config.state || !config.apiKey || !config.licenseNumber) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Verify user has access to this facility
    const facilityUser = await prisma.facilityUser.findFirst({
      where: {
        facilityId,
        userId,
        role: { in: ['OWNER', 'ADMIN', 'MANAGER'] }
      },
    });

    if (!facilityUser) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    try {
      // Create track & trace service instance
      const trackTraceService = createTrackTraceService(
        config.state,
        config.apiKey,
        config.licenseNumber
      );

      // Fetch harvest data from the last 30 days by default
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 30);

      const harvestData = await trackTraceService.fetchHarvestData(startDate, endDate);

      // Import harvest data into our database
      let importedCount = 0;
      const errors: string[] = [];

      for (const harvest of harvestData) {
        try {
          // Check if harvest already exists
          const existing = await prisma.harvestBatch.findFirst({
            where: {
              facilityId,
              batchNumber: harvest.batchId,
            },
          });

          if (!existing) {
            // Get zone mapping (you might want to improve this logic)
            const zone = await prisma.zone.findFirst({
              where: {
                facilityId,
                name: harvest.roomName || 'Default',
              },
            });

            // Transform and create harvest record
            const harvestRecord = trackTraceService.transformToHarvestBatch(
              harvest,
              facilityId,
              zone?.id
            );

            await prisma.harvestBatch.create({
              data: harvestRecord,
            });

            importedCount++;
          }
        } catch (error) {
          errors.push(`Failed to import batch ${harvest.batchId}: ${error.message}`);
        }
      }

      // Save integration config for auto-sync if enabled
      if (config.autoSync) {
        await prisma.integrationConfig.upsert({
          where: {
            facilityId_type: {
              facilityId,
              type: 'TRACK_TRACE',
            },
          },
          update: {
            config: {
              state: config.state,
              provider: config.state.includes('METRC') ? 'METRC' : 'BIOTRACK',
              syncFrequency: config.syncFrequency || 'daily',
              lastSync: new Date(),
            },
            enabled: true,
            metadata: {
              encryptedApiKey: encrypt(config.apiKey), // You should implement proper encryption
              licenseNumber: config.licenseNumber,
            },
          },
          create: {
            facilityId,
            type: 'TRACK_TRACE',
            config: {
              state: config.state,
              provider: config.state.includes('METRC') ? 'METRC' : 'BIOTRACK',
              syncFrequency: config.syncFrequency || 'daily',
              lastSync: new Date(),
            },
            enabled: true,
            metadata: {
              encryptedApiKey: encrypt(config.apiKey), // You should implement proper encryption
              licenseNumber: config.licenseNumber,
            },
          },
        });
      }

      return NextResponse.json({
        success: true,
        harvestCount: importedCount,
        totalFound: harvestData.length,
        errors: errors.length > 0 ? errors : undefined,
      });
    } catch (error) {
      console.error('Track & trace sync error:', error);
      return NextResponse.json(
        { error: `Failed to sync with ${config.state} track & trace: ${error.message}` },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error in track & trace sync:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}

// Production encryption using Node.js crypto
function encrypt(text: string): string {
  const crypto = require('crypto');
  const algorithm = 'aes-256-gcm';
  const secretKey = process.env.ENCRYPTION_SECRET || 'default-secret-key-change-in-production';
  const key = crypto.scryptSync(secretKey, 'salt', 32);
  const iv = crypto.randomBytes(16);
  
  const cipher = crypto.createCipher(algorithm, key);
  cipher.setAAD(Buffer.from('track-trace-data'));
  
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const authTag = cipher.getAuthTag();
  
  return iv.toString('hex') + ':' + authTag.toString('hex') + ':' + encrypted;
}