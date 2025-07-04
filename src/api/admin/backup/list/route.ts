import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    // In production, implement proper admin check

    const url = new URL(request.url)
    const limit = parseInt(url.searchParams.get('limit') || '50')
    const offset = parseInt(url.searchParams.get('offset') || '0')
    const status = url.searchParams.get('status')

    // In production, query from database
    // For now, return mock data
    const mockBackups = [
      {
        id: 'backup_1',
        filename: 'vibelux_backup_2025-06-26T10-30-00.sql.gz.enc',
        size: 157286400,
        compressed: true,
        encrypted: true,
        checksum: 'sha256:abc123...',
        tables: ['users', 'designs', 'fixtures', 'calculations'],
        rowCounts: { users: 12847, designs: 5634, fixtures: 892, calculations: 23456 },
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        location: 's3',
        s3Key: 'backups/2025/06/vibelux_backup_2025-06-26T10-30-00.sql.gz.enc',
        status: 'completed',
        duration: 340
      },
      {
        id: 'backup_2',
        filename: 'vibelux_backup_2025-06-25T10-30-00.sql.gz.enc',
        size: 152428800,
        compressed: true,
        encrypted: true,
        checksum: 'sha256:def456...',
        tables: ['users', 'designs', 'fixtures', 'calculations'],
        rowCounts: { users: 12756, designs: 5589, fixtures: 887, calculations: 23234 },
        createdAt: new Date(Date.now() - 26 * 60 * 60 * 1000).toISOString(),
        location: 's3',
        status: 'completed',
        duration: 325
      },
      {
        id: 'backup_3',
        filename: 'vibelux_backup_2025-06-24T10-30-00.sql.gz.enc',
        size: 148934656,
        compressed: true,
        encrypted: true,
        checksum: 'sha256:ghi789...',
        tables: ['users', 'designs', 'fixtures', 'calculations'],
        rowCounts: { users: 12689, designs: 5545, fixtures: 883, calculations: 23012 },
        createdAt: new Date(Date.now() - 50 * 60 * 60 * 1000).toISOString(),
        location: 'local',
        localPath: '/backups/vibelux_backup_2025-06-24T10-30-00.sql.gz.enc',
        status: 'completed',
        duration: 312
      }
    ]

    let filteredBackups = mockBackups
    if (status && status !== 'all') {
      filteredBackups = mockBackups.filter(backup => backup.status === status)
    }

    const paginatedBackups = filteredBackups.slice(offset, offset + limit)

    return NextResponse.json({
      backups: paginatedBackups,
      total: filteredBackups.length,
      limit,
      offset
    })

  } catch (error) {
    console.error('Backup list error:', error)
    return NextResponse.json(
      { error: 'Failed to load backups' },
      { status: 500 }
    )
  }
}