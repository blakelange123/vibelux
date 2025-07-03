import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { writeFile } from 'fs/promises'
import { join } from 'path'
import { v4 as uuidv4 } from 'uuid'

export async function POST(request: NextRequest) {
  const { userId } = await auth()

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const formData = await request.formData()
    const dataString = formData.get('data') as string
    const scoutingData = JSON.parse(dataString)

    // Process uploaded photos
    const photoUrls: string[] = []
    let photoIndex = 0
    
    while (formData.has(`photo_${photoIndex}`)) {
      const photo = formData.get(`photo_${photoIndex}`) as File
      if (photo) {
        const bytes = await photo.arrayBuffer()
        const buffer = Buffer.from(bytes)
        
        // Generate unique filename
        const fileName = `${uuidv4()}_${photo.name}`
        const uploadPath = join(process.cwd(), 'public', 'uploads', 'scouting', fileName)
        
        // Save file
        await writeFile(uploadPath, buffer)
        photoUrls.push(`/uploads/scouting/${fileName}`)
      }
      photoIndex++
    }

    // Save to database
    const scoutingRecord = await prisma.scoutingRecord.create({
      data: {
        userId,
        timestamp: new Date(scoutingData.timestamp),
        latitude: scoutingData.location.latitude,
        longitude: scoutingData.location.longitude,
        zone: scoutingData.location.zone,
        block: scoutingData.location.block,
        issueType: scoutingData.type,
        severity: scoutingData.severity,
        issue: scoutingData.issue,
        notes: scoutingData.notes,
        photos: photoUrls,
        environmental: scoutingData.environmental,
        actionRequired: scoutingData.actionRequired,
        assignedTo: scoutingData.assignedTo
      }
    })

    // Create task if action required
    if (scoutingData.actionRequired) {
      await prisma.task.create({
        data: {
          title: `Address ${scoutingData.type}: ${scoutingData.issue}`,
          description: scoutingData.notes,
          priority: scoutingData.severity === 'critical' ? 'high' : 'medium',
          status: 'pending',
          taskType: 'ipm',
          assignedTo: scoutingData.assignedTo || userId,
          dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
          facilityId: 'default', // TODO: Get from user context
          createdBy: userId,
          metadata: {
            scoutingRecordId: scoutingRecord.id,
            location: scoutingData.location,
            severity: scoutingData.severity
          }
        }
      })
    }

    return NextResponse.json({
      success: true,
      recordId: scoutingRecord.id,
      taskCreated: scoutingData.actionRequired
    })
  } catch (error) {
    console.error('Scouting upload error:', error)
    return NextResponse.json(
      { error: 'Failed to upload scouting record' },
      { status: 500 }
    )
  }
}