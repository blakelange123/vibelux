import { NextRequest, NextResponse } from 'next/server'
import { pushToSalesforce } from '@/lib/salesforce'
import { auth } from '@clerk/nextjs/server'

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { opportunityId, data } = body

    if (!opportunityId) {
      return NextResponse.json(
        { error: 'Opportunity ID is required' },
        { status: 400 }
      )
    }

    // Add user and timestamp to data
    const enrichedData = {
      ...data,
      userId,
      timestamp: new Date().toISOString(),
      reportUrl: `${process.env.NEXT_PUBLIC_APP_URL}/reports/${data.reportId}`
    }

    const result = await pushToSalesforce(opportunityId, enrichedData)

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'Successfully updated Salesforce opportunity',
        result: result.result
      })
    } else {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const opportunityId = searchParams.get('id')

    if (!opportunityId) {
      return NextResponse.json(
        { error: 'Opportunity ID is required' },
        { status: 400 }
      )
    }

    // This would fetch opportunity data from Salesforce
    // For now, return mock data
    return NextResponse.json({
      success: true,
      opportunity: {
        id: opportunityId,
        name: 'Sample Opportunity',
        stage: 'Proposal',
        amount: 150000
      }
    })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}