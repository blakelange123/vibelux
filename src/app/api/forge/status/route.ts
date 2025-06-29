import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const urn = searchParams.get('urn')

    if (!urn) {
      return NextResponse.json({ error: 'URN required' }, { status: 400 })
    }

    // Get auth token
    const authResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/forge/auth`)
    const { access_token } = await authResponse.json()

    // Check translation status
    const response = await fetch(
      `https://developer.api.autodesk.com/modelderivative/v2/designdata/${urn}/manifest`,
      {
        headers: {
          'Authorization': `Bearer ${access_token}`
        }
      }
    )

    if (!response.ok) {
      const error = await response.text()
      console.error('Status check error:', error)
      return NextResponse.json({ error: 'Failed to check status' }, { status: 500 })
    }

    const manifest = await response.json()
    
    // Extract download URLs if complete
    let downloadUrls = []
    if (manifest.status === 'success' && manifest.derivatives) {
      for (const derivative of manifest.derivatives) {
        if (derivative.children) {
          for (const child of derivative.children) {
            downloadUrls.push({
              type: child.type || derivative.outputType,
              name: child.name || 'output',
              urn: child.urn
            })
          }
        } else {
          downloadUrls.push({
            type: derivative.outputType,
            name: derivative.name || 'output',
            urn: derivative.urn
          })
        }
      }
    }

    return NextResponse.json({
      status: manifest.status,
      progress: manifest.progress || '0%',
      derivatives: manifest.derivatives || [],
      downloadUrls,
      urn
    })

  } catch (error) {
    console.error('Status check error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}