import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { getClaudeResponse } from '@/lib/claude-config'

export async function POST(request: NextRequest) {
  try {
    const { userId } = auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { prompt, projectData, currentTemplate } = await request.json()

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 })
    }

    // Create a system prompt for Claude to understand report generation
    const systemPrompt = `You are an AI assistant helping to create professional horticultural lighting reports. 
    Based on the user's request, determine:
    1. Which template to use (executive, technical, compliance)
    2. Which sections to include and their order
    3. Any style customizations

    Available sections:
    - cover: Cover Page
    - toc: Table of Contents
    - executive: Executive Summary
    - project: Project Overview
    - room: Room Specifications
    - fixtures: Fixture Analysis
    - ppfd: PPFD Analysis
    - electrical: Electrical Analysis
    - roi: ROI Analysis
    - environmental: Environmental Settings
    - recommendations: Recommendations
    - compliance: Compliance Summary
    - standards: Standards Met
    - calculations: Calculations & Methodology
    - certification: Certification Data
    - appendix: Appendix

    Return a JSON object with:
    {
      "template": "executive" | "technical" | "compliance",
      "sections": [
        { "id": "section_id", "title": "Section Title", "enabled": true, "order": 1 }
      ],
      "style": {
        "primaryColor": "#hexcolor",
        "includeCharts": true | false,
        "includeImages": true | false
      },
      "explanation": "Brief explanation of why this structure was chosen"
    }`

    const userPrompt = `User request: "${prompt}"
    
    Project context:
    - Project name: ${projectData?.projectName || 'N/A'}
    - Room size: ${projectData?.roomDimensions ? `${projectData.roomDimensions.width}x${projectData.roomDimensions.length}ft` : 'N/A'}
    - Number of fixtures: ${projectData?.fixtures?.length || 0}
    - Has PPFD data: ${!!projectData?.ppfdAnalysis}
    - Has ROI data: ${!!projectData?.roi}
    - Has electrical data: ${!!projectData?.electricalAnalysis}
    
    Current template: ${currentTemplate?.name || 'None'}
    
    Based on this request and context, provide the optimal report structure.`

    const response = await getClaudeResponse(systemPrompt, userPrompt)
    
    // Parse the response to ensure it's valid JSON
    let reportStructure
    try {
      // Extract JSON from the response if it's wrapped in text
      const jsonMatch = response.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        reportStructure = JSON.parse(jsonMatch[0])
      } else {
        reportStructure = JSON.parse(response)
      }
    } catch (error) {
      console.error('Error parsing AI response:', error)
      // Fallback structure
      reportStructure = {
        template: 'technical',
        sections: [
          { id: 'cover', title: 'Cover Page', enabled: true, order: 1 },
          { id: 'executive', title: 'Executive Summary', enabled: true, order: 2 },
          { id: 'project', title: 'Project Overview', enabled: true, order: 3 },
          { id: 'fixtures', title: 'Fixture Analysis', enabled: true, order: 4 },
          { id: 'ppfd', title: 'PPFD Analysis', enabled: true, order: 5 },
          { id: 'roi', title: 'ROI Analysis', enabled: true, order: 6 },
          { id: 'recommendations', title: 'Recommendations', enabled: true, order: 7 },
        ],
        style: {
          primaryColor: '#8B5CF6',
          includeCharts: true,
          includeImages: true,
        },
      }
    }

    return NextResponse.json(reportStructure)
  } catch (error) {
    console.error('Error in report builder API:', error)
    return NextResponse.json(
      { error: 'Failed to generate report structure' },
      { status: 500 }
    )
  }
}