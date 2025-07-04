import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const urn = searchParams.get('urn')
    const derivativeUrn = searchParams.get('derivativeUrn')

    if (!urn || !derivativeUrn) {
      return NextResponse.json({ error: 'URN and derivativeUrn required' }, { status: 400 })
    }

    // Get auth token
    const authResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/forge/auth`)
    const { access_token } = await authResponse.json()

    // Download the derivative
    const response = await fetch(
      `https://developer.api.autodesk.com/modelderivative/v2/designdata/${urn}/manifest/${derivativeUrn}`,
      {
        headers: {
          'Authorization': `Bearer ${access_token}`,
          'Accept-Encoding': 'gzip'
        }
      }
    )

    if (!response.ok) {
      const error = await response.text()
      console.error('Download error:', error)
      return NextResponse.json({ error: 'Failed to download file' }, { status: 500 })
    }

    // Get the file content
    const arrayBuffer = await response.arrayBuffer()
    
    // Determine content type based on derivative type
    let contentType = 'application/octet-stream'
    let filename = 'download'
    
    if (derivativeUrn.includes('.obj')) {
      contentType = 'text/plain'
      filename = 'model.obj'
    } else if (derivativeUrn.includes('.mtl')) {
      contentType = 'text/plain'
      filename = 'model.mtl'
    } else if (derivativeUrn.includes('.svf')) {
      contentType = 'application/octet-stream'
      filename = 'model.svf'
    }

    // Return the file
    return new NextResponse(arrayBuffer, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': arrayBuffer.byteLength.toString()
      }
    })

  } catch (error) {
    console.error('Download error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}