import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File
    const outputFormat = formData.get('outputFormat') as string

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Step 1: Get auth token
    const authResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/forge/auth`)
    const { access_token } = await authResponse.json()

    // Step 2: Create bucket
    const bucketKey = `vibelux-${Date.now()}`
    const bucketResponse = await fetch('https://developer.api.autodesk.com/oss/v2/buckets', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${access_token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        bucketKey,
        policyKey: 'transient' // Auto-delete after 24h
      })
    })

    if (!bucketResponse.ok && bucketResponse.status !== 409) { // 409 means bucket exists
      const error = await bucketResponse.text()
      console.error('Bucket creation error:', error)
      return NextResponse.json({ error: 'Failed to create bucket' }, { status: 500 })
    }

    // Step 3: Upload file
    const objectKey = encodeURIComponent(file.name)
    const arrayBuffer = await file.arrayBuffer()
    
    const uploadResponse = await fetch(
      `https://developer.api.autodesk.com/oss/v2/buckets/${bucketKey}/objects/${objectKey}`,
      {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${access_token}`,
          'Content-Type': 'application/octet-stream',
          'Content-Length': arrayBuffer.byteLength.toString()
        },
        body: arrayBuffer
      }
    )

    if (!uploadResponse.ok) {
      const error = await uploadResponse.text()
      console.error('Upload error:', error)
      return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 })
    }

    const uploadResult = await uploadResponse.json()
    const urn = Buffer.from(uploadResult.objectId).toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '')

    // Step 4: Start translation
    const translationBody = {
      input: {
        urn,
        compressedUrn: false,
        rootFilename: file.name
      },
      output: {
        formats: [] as any[]
      }
    }

    // Configure output based on format
    switch (outputFormat) {
      case 'svf2':
        translationBody.output.formats.push({
          type: 'svf2',
          views: ['2d', '3d']
        })
        break
      case 'obj':
        translationBody.output.formats.push({
          type: 'obj',
          advanced: {
            modelGuid: uploadResult.objectId,
            objectIds: [-1] // All objects
          }
        })
        break
      case 'ifc':
        translationBody.output.formats.push({
          type: 'ifc'
        })
        break
      case 'step':
        translationBody.output.formats.push({
          type: 'step'
        })
        break
      default:
        return NextResponse.json({ error: 'Unsupported output format' }, { status: 400 })
    }

    const translationResponse = await fetch(
      'https://developer.api.autodesk.com/modelderivative/v2/designdata/job',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${access_token}`,
          'Content-Type': 'application/json',
          'x-ads-force': 'true' // Force re-translation
        },
        body: JSON.stringify(translationBody)
      }
    )

    if (!translationResponse.ok) {
      const error = await translationResponse.text()
      console.error('Translation error:', error)
      return NextResponse.json({ error: 'Failed to start translation' }, { status: 500 })
    }

    const translationResult = await translationResponse.json()

    // Return job info for polling
    return NextResponse.json({
      success: true,
      urn,
      bucketKey,
      objectKey,
      jobId: translationResult.urn,
      status: 'inprogress',
      message: 'Translation started. Poll /api/forge/status to check progress.'
    })

  } catch (error) {
    console.error('Conversion error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}