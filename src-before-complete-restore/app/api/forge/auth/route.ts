import { NextRequest, NextResponse } from 'next/server'

// Get Forge access token (2-legged OAuth)
export async function GET(req: NextRequest) {
  try {
    const response = await fetch('https://developer.api.autodesk.com/authentication/v2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      },
      body: new URLSearchParams({
        client_id: process.env.FORGE_CLIENT_ID!,
        client_secret: process.env.FORGE_CLIENT_SECRET!,
        grant_type: 'client_credentials',
        scope: process.env.FORGE_SCOPE || 'data:read data:write bucket:create bucket:read'
      })
    })

    if (!response.ok) {
      const error = await response.text()
      console.error('Forge auth error:', error)
      return NextResponse.json(
        { error: 'Failed to authenticate with Forge' },
        { status: response.status }
      )
    }

    const data = await response.json()
    
    // Return token info (expires_in is in seconds)
    return NextResponse.json({
      access_token: data.access_token,
      token_type: data.token_type,
      expires_in: data.expires_in,
      expires_at: Date.now() + (data.expires_in * 1000)
    })
    
  } catch (error) {
    console.error('Forge auth error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}