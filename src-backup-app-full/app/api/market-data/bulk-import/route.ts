import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import * as csv from 'csv-parse/sync';

// Schema for bulk import
const bulkDataSchema = z.object({
  cropType: z.string(),
  strain: z.string().optional(),
  productCategory: z.string(),
  quality: z.string(),
  pricePerUnit: z.number(),
  unitType: z.string(),
  quantity: z.number(),
  buyerType: z.string().optional(),
  buyerLocation: z.string().optional(),
  harvestDate: z.string().optional(),
  saleDate: z.string(),
});

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File;
    const facilityId = formData.get('facilityId') as string;
    const format = formData.get('format') as string || 'csv';

    if (!file || !facilityId) {
      return NextResponse.json(
        { error: 'Missing file or facility ID' },
        { status: 400 }
      );
    }

    // Check user has admin access to facility
    const userFacility = await prisma.facilityUser.findFirst({
      where: {
        userId,
        facilityId,
        role: { in: ['OWNER', 'ADMIN'] },
      },
    });

    if (!userFacility) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    // Parse file based on format
    const fileContent = await file.text();
    let records: any[] = [];

    if (format === 'csv') {
      records = csv.parse(fileContent, {
        columns: true,
        skip_empty_lines: true,
        cast: true,
        cast_date: true,
      });
    } else if (format === 'json') {
      records = JSON.parse(fileContent);
    } else {
      return NextResponse.json(
        { error: 'Unsupported file format' },
        { status: 400 }
      );
    }

    // Validate and process records
    const results = {
      success: 0,
      failed: 0,
      errors: [] as any[],
    };

    const batchSize = 100;
    for (let i = 0; i < records.length; i += batchSize) {
      const batch = records.slice(i, i + batchSize);
      const validRecords = [];

      for (let j = 0; j < batch.length; j++) {
        const record = batch[j];
        const rowNumber = i + j + 1;

        try {
          // Validate record
          const validated = bulkDataSchema.parse({
            ...record,
            pricePerUnit: parseFloat(record.pricePerUnit),
            quantity: parseFloat(record.quantity),
          });

          validRecords.push({
            facilityId,
            ...validated,
            totalRevenue: validated.pricePerUnit * validated.quantity,
            reportedBy: userId,
            harvestDate: validated.harvestDate ? new Date(validated.harvestDate) : null,
            saleDate: new Date(validated.saleDate),
            verified: false,
          });

          results.success++;
        } catch (error) {
          results.failed++;
          results.errors.push({
            row: rowNumber,
            error: error instanceof z.ZodError ? error.errors : 'Invalid data',
            data: record,
          });

          // Stop if too many errors
          if (results.errors.length > 100) {
            return NextResponse.json({
              error: 'Too many validation errors',
              results,
            }, { status: 400 });
          }
        }
      }

      // Bulk insert valid records
      if (validRecords.length > 0) {
        await prisma.marketData.createMany({
          data: validRecords,
          skipDuplicates: true,
        });
      }
    }

    // Update data contribution
    await prisma.dataContribution.create({
      data: {
        facilityId,
        dataType: 'market_price_bulk',
        recordCount: results.success,
        qualityScore: results.success / (results.success + results.failed),
        creditsEarned: Math.floor(results.success * 5), // 5 credits per record for bulk
      },
    });

    // Generate import summary
    const summary = {
      totalRecords: records.length,
      imported: results.success,
      failed: results.failed,
      errors: results.errors.slice(0, 10), // Return first 10 errors
      creditsEarned: Math.floor(results.success * 5),
    };

    return NextResponse.json({
      message: 'Bulk import completed',
      summary,
    });
  } catch (error) {
    console.error('Error in bulk import:', error);
    return NextResponse.json(
      { error: 'Failed to process bulk import' },
      { status: 500 }
    );
  }
}

// Template download endpoint
export async function GET(req: NextRequest) {
  const template = `cropType,strain,productCategory,quality,pricePerUnit,unitType,quantity,buyerType,buyerLocation,harvestDate,saleDate
Cannabis,Blue Dream,flower,A,2500,lb,10,dispensary,Denver CO,2024-01-15,2024-02-01
Cannabis,OG Kush,flower,B,2200,lb,15,wholesale,Los Angeles CA,2024-01-20,2024-02-05
Cannabis,,trim,C,800,lb,50,processor,Portland OR,2024-01-10,2024-01-25
Lettuce,Romaine,,A,3.50,lb,1000,wholesale,Chicago IL,2024-02-01,2024-02-03
Tomatoes,Beefsteak,,A,4.25,lb,500,retail,New York NY,2024-02-05,2024-02-07`;

  return new NextResponse(template, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': 'attachment; filename="market-data-template.csv"',
    },
  });
}