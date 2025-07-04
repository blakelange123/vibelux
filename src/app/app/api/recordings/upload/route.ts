import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { v4 as uuidv4 } from 'uuid'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { userId } = auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const recording = formData.get('recording') as File
    const duration = formData.get('duration') as string
    const size = formData.get('size') as string
    const timestamp = formData.get('timestamp') as string

    if (!recording) {
      return NextResponse.json({ error: 'No recording file provided' }, { status: 400 })
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), 'uploads', 'recordings', userId)
    await mkdir(uploadsDir, { recursive: true })

    // Generate unique filename
    const fileExtension = recording.name.split('.').pop() || 'webm'
    const filename = `${uuidv4()}.${fileExtension}`
    const filepath = join(uploadsDir, filename)

    // Convert File to Buffer and save
    const bytes = await recording.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(filepath, buffer)

    // In a production environment, you would:
    // 1. Upload to cloud storage (S3, GCS, etc.)
    // 2. Save metadata to database
    // 3. Process/transcode the video if needed
    // 4. Generate thumbnails
    // 5. Set up access controls

    // Save to database
    const recordingData = {
      userId,
      filename,
      originalName: recording.name,
      fileSize: parseInt(size) || recording.size,
      duration: parseFloat(duration) || 0,
      mimeType: recording.type,
      filePath: filepath,
      uploadedAt: new Date(timestamp) || new Date()
    };
    
    await prisma.recording.create({ data: recordingData });

    return NextResponse.json({
      success: true,
      recording: {
        id: uuidv4(),
        userId,
        filename,
        originalName: recording.name,
        size: parseInt(size),
        duration: parseFloat(duration),
        mimeType: recording.type,
        timestamp: new Date(timestamp),
        url: `/api/recordings/${filename}`,
        status: 'completed'
      }
    })

  } catch (error) {
    console.error('Recording upload error:', error)
    return NextResponse.json(
      { error: 'Failed to upload recording' },
      { status: 500 }
    )
  }
}

// Get user's recordings
export async function GET(request: NextRequest) {
  try {
    const { userId } = auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // TODO: Fetch from database
    // const recordings = await prisma.recording.findMany({
    //   where: { userId },
    //   orderBy: { timestamp: 'desc' }
    // })

    // Mock data for now
    const recordings = [
      {
        id: '1',
        filename: 'recording1.webm',
        originalName: 'Call with Team - 2024-01-15.webm',
        size: 15728640, // 15MB
        duration: 300000, // 5 minutes
        timestamp: new Date('2024-01-15T10:00:00'),
        url: '/api/recordings/recording1.webm',
        status: 'completed'
      }
    ]

    return NextResponse.json({ recordings })

  } catch (error) {
    console.error('Failed to fetch recordings:', error)
    return NextResponse.json(
      { error: 'Failed to fetch recordings' },
      { status: 500 }
    )
  }
}