import { NextRequest, NextResponse } from 'next/server'
import { createClaudeClient } from '@/lib/claude-config'
import { auth } from '@clerk/nextjs/server'
import { AIUsageTracker } from '@/lib/ai-usage-tracker'

// GlobalGAP knowledge base context
const GLOBALGAP_CONTEXT = `You are an expert GlobalGAP certification consultant with deep knowledge of the GlobalGAP IFA (Integrated Farm Assurance) standard version 5.4. You help farmers and agricultural operations achieve and maintain GlobalGAP certification.

Key areas of expertise:
1. Food Safety - Risk assessments, hygiene procedures, water quality testing
2. Traceability - Product identification, record keeping, recall procedures
3. Environment - Waste management, energy efficiency, biodiversity
4. Worker Health & Safety - Training records, PPE, first aid provisions
5. Plant Protection - IPM documentation, pesticide records, application procedures
6. Record Keeping - Documentation requirements, retention periods, audit trails

Important GlobalGAP requirements:
- Water testing: E. coli <100 CFU/100ml for leafy greens
- Record retention: Minimum 2 years (5 years for some records)
- Training: Annual refreshers required, documented competency
- Risk assessments: Annual updates required
- Traceability: One-step forward, one-step backward capability

Common non-conformities:
1. Incomplete spray records (35% of audits)
2. Expired training certificates (28% of audits) 
3. Missing traceability data (22% of audits)
4. Inadequate risk assessments (18% of audits)

When answering questions:
- Cite specific GlobalGAP control points (e.g., AF 1.1.1, CB 7.6.1)
- Provide practical, actionable advice
- Mention common audit findings related to the topic
- Suggest preventive measures and best practices
- Be specific about documentation requirements`

export async function POST(request: NextRequest) {
  try {
    // Get authenticated user
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { message, context, mode = 'chat' } = await request.json()

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      )
    }

    // Map mode to feature
    const featureMap = {
      'chat': 'basicChat',
      'gap-analysis': 'gapAnalysis',
      'recommendations': 'recommendations',
      'audit-prep': 'predictions'
    } as const
    
    const feature = featureMap[mode as keyof typeof featureMap] || 'basicChat'
    
    // Check usage limits (in production, get tier from user profile)
    const userTier: string = 'professional' // This would come from database
    const canRequest = await AIUsageTracker.canMakeRequest(userId, userTier, feature)
    
    if (!canRequest.allowed) {
      return NextResponse.json(
        { 
          error: canRequest.reason,
          remainingTokens: canRequest.remainingTokens || 0,
          upgradeRequired: !userTier || userTier === 'free'
        },
        { status: 429 }
      )
    }

    // Different system prompts based on mode
    let systemPrompt = GLOBALGAP_CONTEXT
    
    if (mode === 'gap-analysis') {
      systemPrompt += '\n\nAnalyze the user\'s current practices and identify specific GlobalGAP compliance gaps. Format your response with clear sections: Current Status, Compliance Gaps, Required Actions, Timeline, and Priority Level.'
    } else if (mode === 'recommendations') {
      systemPrompt += '\n\nProvide strategic recommendations to improve GlobalGAP compliance. Include ROI estimates, implementation timeframes, and expected compliance score improvements. Prioritize based on audit risk and implementation effort.'
    } else if (mode === 'audit-prep') {
      systemPrompt += '\n\nFocus on audit preparation. Identify high-risk areas, predict likely non-conformities, and provide a checklist of actions to take before the audit. Include percentage likelihood of findings based on industry data.'
    }

    // Estimate tokens
    const estimatedTokens = AIUsageTracker.estimateTokens(message + systemPrompt)

    // Initialize Claude client
    const claude = createClaudeClient()
    
    // Call Claude API
    const completion = await claude.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: message
        }
      ],
      temperature: 0.7,
      max_tokens: 4096, // Increased for detailed compliance guidance
    })

    const aiResponse = completion.content[0].type === 'text' ? completion.content[0].text : ''
    
    // Track actual token usage
    const actualTokens = (completion.usage?.input_tokens || 0) + (completion.usage?.output_tokens || 0) || estimatedTokens
    await AIUsageTracker.trackUsage(userId, feature, actualTokens, '/api/ai-assistant/globalgap')

    // Extract recommendations if present
    const recommendations = extractRecommendations(aiResponse)
    
    // Calculate confidence based on response specificity
    const confidence = calculateConfidence(aiResponse)

    // Identify relevant GlobalGAP sections
    const relevantSections = identifyRelevantSections(message, aiResponse)
    
    // Get updated usage stats
    const usageStats = await AIUsageTracker.getUsageStats(userId)

    return NextResponse.json({
      response: aiResponse,
      recommendations,
      confidence,
      sources: relevantSections,
      mode,
      timestamp: new Date().toISOString(),
      usage: {
        tokensUsed: actualTokens,
        remainingTokens: usageStats.remainingTokens,
        monthlyUsage: usageStats.monthlyTokensUsed
      }
    })

  } catch (error) {
    console.error('AI Assistant error:', error)
    
    // Fallback response if Claude fails
    return NextResponse.json({
      response: generateFallbackResponse(request),
      recommendations: ['Review GlobalGAP IFA standard', 'Consult with certification body'],
      confidence: 0.6,
      sources: ['GlobalGAP IFA v5.4'],
      error: 'Using fallback response due to API error'
    })
  }
}

function extractRecommendations(response: string): string[] {
  const recommendations: string[] = []
  
  // Look for numbered lists or bullet points
  const lines = response.split('\n')
  lines.forEach(line => {
    if (line.match(/^\d+\.|^-|^•|^\*/) && line.length > 10) {
      const cleaned = line.replace(/^\d+\.|^-|^•|^\*/, '').trim()
      if (cleaned.length > 0) {
        recommendations.push(cleaned)
      }
    }
  })
  
  // If no structured recommendations found, extract key action items
  if (recommendations.length === 0) {
    const actionWords = ['implement', 'create', 'develop', 'establish', 'review', 'update', 'schedule', 'document']
    lines.forEach(line => {
      const lowerLine = line.toLowerCase()
      if (actionWords.some(word => lowerLine.includes(word))) {
        recommendations.push(line.trim())
      }
    })
  }
  
  return recommendations.slice(0, 5) // Return top 5 recommendations
}

function calculateConfidence(response: string): number {
  let confidence = 0.7 // Base confidence
  
  // Increase confidence for specific references
  if (response.includes('AF ') || response.includes('CB ') || response.includes('FV ')) {
    confidence += 0.1
  }
  
  // Increase for detailed responses
  if (response.length > 500) {
    confidence += 0.1
  }
  
  // Increase for structured responses
  if (response.includes('1.') || response.includes('•')) {
    confidence += 0.05
  }
  
  return Math.min(confidence, 0.95)
}

function identifyRelevantSections(query: string, response: string): string[] {
  const sections: string[] = ['GlobalGAP IFA v5.4']
  
  // Map keywords to GlobalGAP sections
  const sectionMap: Record<string, string> = {
    'water': 'AF 1.2 - Water Management',
    'training': 'AF 3 - Worker Health, Safety and Welfare',
    'pesticide': 'CB 7 - Plant Protection Product Handling',
    'spray': 'CB 7.6 - Application Records',
    'traceability': 'AF 8 - Traceability and Segregation',
    'hygiene': 'FV 5 - Hygiene',
    'harvest': 'FV 5.1 - Hygiene Principles',
    'risk': 'AF 1.1 - Risk Assessment',
    'document': 'AF 2 - Record Keeping',
    'waste': 'AF 5 - Waste and Pollution Management'
  }
  
  const combinedText = (query + ' ' + response).toLowerCase()
  
  Object.entries(sectionMap).forEach(([keyword, section]) => {
    if (combinedText.includes(keyword)) {
      sections.push(section)
    }
  })
  
  // Extract any explicit control point references
  const controlPoints = response.match(/[A-Z]{2}\s+\d+\.\d+(\.\d+)?/g)
  if (controlPoints) {
    sections.push(...controlPoints)
  }
  
  return [...new Set(sections)] // Remove duplicates
}

function generateFallbackResponse(request: any): string {
  return `I understand you're asking about GlobalGAP certification requirements. 

While I'm experiencing technical difficulties accessing my full knowledge base, here are key points to consider:

1. **Documentation**: Ensure all activities are properly documented with dates, signatures, and relevant details.

2. **Training**: Verify that all workers have current training certificates for their assigned tasks.

3. **Risk Assessment**: Annual risk assessments are required for food safety, with documented mitigation measures.

4. **Record Keeping**: Most records must be kept for a minimum of 2 years (5 years for some categories).

5. **Traceability**: You must be able to trace products one step forward and one step backward.

For specific guidance, I recommend:
- Reviewing the GlobalGAP IFA standard document
- Consulting with your certification body
- Using the GlobalGAP self-assessment checklist

Please try again in a moment for more detailed assistance.`
}