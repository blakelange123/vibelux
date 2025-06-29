import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const { userId } = await auth()

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const batches = await prisma.harvestBatch.findMany({
      where: {
        facilityId: userId // TODO: Get actual facility ID from user context
      },
      include: {
        crew: true,
        yieldData: true
      },
      orderBy: {
        harvestDate: 'desc'
      }
    })

    return NextResponse.json(batches)
  } catch (error) {
    console.error('Error fetching harvest batches:', error)
    return NextResponse.json(
      { error: 'Failed to fetch harvest batches' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  const { userId } = await auth()

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const data = await request.json()
    
    const batch = await prisma.harvestBatch.create({
      data: {
        batchNumber: data.batchNumber,
        crop: data.crop,
        variety: data.variety,
        zone: data.zone,
        block: data.block,
        plantedDate: new Date(data.plantedDate),
        harvestDate: new Date(data.harvestDate),
        status: data.status || 'planned',
        estimatedYield: data.estimatedYield,
        qualityGrade: data.qualityGrade || 'A',
        equipment: data.equipment || [],
        notes: data.notes || '',
        facilityId: userId, // TODO: Get actual facility ID
        createdBy: userId,
        packaging: data.packaging || {},
        weight: data.weight || { gross: 0, net: 0, tare: 0 }
      }
    })

    // Create crew assignments if provided
    if (data.crew && data.crew.length > 0) {
      await Promise.all(
        data.crew.map((member: any) =>
          prisma.harvestCrew.create({
            data: {
              batchId: batch.id,
              name: member.name,
              role: member.role,
              hourlyRate: member.hourlyRate,
              hoursWorked: member.hoursWorked || 0,
              productivity: member.productivity || 0,
              qualityScore: member.qualityScore || 0
            }
          })
        )
      )
    }

    return NextResponse.json(batch, { status: 201 })
  } catch (error) {
    console.error('Error creating harvest batch:', error)
    return NextResponse.json(
      { error: 'Failed to create harvest batch' },
      { status: 500 }
    )
  }
}