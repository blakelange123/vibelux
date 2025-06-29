import { NextRequest, NextResponse } from 'next/server'

interface TroubleshootRequest {
  message: string
  context?: {
    category?: string
    previousMessages?: string[]
    userProfile?: {
      experience: 'beginner' | 'intermediate' | 'expert'
      cropType?: string
      systemType?: 'hydroponic' | 'soil' | 'aeroponic'
      facilitySize?: string
    }
    attachments?: {
      type: 'image' | 'data'
      description: string
    }[]
  }
}

interface TroubleshootResponse {
  response: string
  confidence: number
  suggestions: string[]
  diagnosticSteps?: DiagnosticStep[]
  relatedResources: Resource[]
  escalate?: boolean
  category?: string
}

interface DiagnosticStep {
  id: string
  title: string
  description: string
  type: 'visual' | 'measurement' | 'test' | 'adjustment'
  expectedOutcome: string
  troubleshootingPath: {
    positive: string
    negative: string
  }
}

interface Resource {
  title: string
  type: 'sop' | 'article' | 'video' | 'community'
  url?: string
  relevance: number
  summary: string
}

export async function POST(request: NextRequest) {
  try {
    const body: TroubleshootRequest = await request.json()
    const { message, context } = body

    // Use Claude API for real AI troubleshooting
    const response = await callClaudeForTroubleshooting(message, context)

    return NextResponse.json(response)

  } catch (error) {
    console.error('Error in troubleshoot API:', error)
    return NextResponse.json(
      { 
        error: 'Failed to process troubleshooting request',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

async function callClaudeForTroubleshooting(
  message: string,
  context?: TroubleshootRequest['context']
): Promise<TroubleshootResponse> {
  try {
    const systemPrompt = `You are VibeLux's expert growing troubleshooting assistant. You help commercial growers diagnose and solve problems with their crops, equipment, and growing environments.

Your expertise covers:
- LED lighting systems and PPFD optimization
- Hydroponic and soil growing systems
- Plant health and nutrient management
- Environmental controls (temperature, humidity, CO2)
- Pest and disease identification
- Equipment troubleshooting

Always provide:
1. Clear, actionable advice
2. Step-by-step diagnostic procedures when appropriate
3. Safety warnings for any potentially dangerous procedures
4. Confidence level in your assessment
5. When to escalate to human experts

Be concise but thorough. Focus on practical solutions growers can implement immediately.

${context?.userProfile ? `User profile: ${context.userProfile.experience} level grower, ${context.userProfile.systemType} system, ${context.userProfile.cropType} crops` : ''}`

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY!,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-sonnet-20240229',
        max_tokens: 1500,
        messages: [
          {
            role: 'user',
            content: message
          }
        ],
        system: systemPrompt
      })
    })

    if (!response.ok) {
      throw new Error(`Claude API error: ${response.statusText}`)
    }

    const data = await response.json()
    const claudeResponse = data.content[0].text

    // Parse Claude's response and structure it
    return parseClaudeResponse(claudeResponse, message)

  } catch (error) {
    console.error('Claude API error:', error)
    // Fallback to pattern matching if Claude fails
    return analyzeUserProblemFallback(message, context)
  }
}

function parseClaudeResponse(claudeText: string, originalMessage: string): TroubleshootResponse {
  // Extract confidence if Claude mentions it
  const confidenceMatch = claudeText.match(/confidence[:\s]*(\d+)%/i)
  const confidence = confidenceMatch ? parseInt(confidenceMatch[1]) / 100 : 0.8

  // Determine category based on keywords in response
  const category = detectCategory(claudeText, originalMessage)

  // Generate suggestions based on response content
  const suggestions = generateSuggestionsFromResponse(claudeText)

  // Check if escalation is recommended
  const escalate = claudeText.toLowerCase().includes('consult') || 
                   claudeText.toLowerCase().includes('expert') ||
                   claudeText.toLowerCase().includes('professional')

  return {
    response: claudeText,
    confidence,
    category,
    suggestions,
    escalate,
    relatedResources: getRelatedResources(category),
    diagnosticSteps: category ? getDiagnosticStepsForCategory(category) : undefined
  }
}

function detectCategory(response: string, message: string): string {
  const text = (response + ' ' + message).toLowerCase()
  
  if (text.includes('light') || text.includes('led') || text.includes('ppfd')) return 'lighting'
  if (text.includes('yellow') || text.includes('brown') || text.includes('leaf') || text.includes('plant health')) return 'plant_health'
  if (text.includes('ph') || text.includes('nutrient') || text.includes('ec') || text.includes('ppm')) return 'nutrients'
  if (text.includes('temperature') || text.includes('humidity') || text.includes('environment')) return 'environment'
  if (text.includes('pest') || text.includes('bug') || text.includes('disease') || text.includes('mold')) return 'pest_management'
  
  return 'general'
}

function generateSuggestionsFromResponse(response: string): string[] {
  const suggestions: string[] = []
  
  if (response.includes('measure') || response.includes('test')) {
    suggestions.push('Help me take measurements')
  }
  if (response.includes('check') || response.includes('inspect')) {
    suggestions.push('Guide me through inspection')
  }
  if (response.includes('adjust') || response.includes('change')) {
    suggestions.push('How do I make adjustments?')
  }
  if (response.includes('expert') || response.includes('professional')) {
    suggestions.push('Connect me with an expert')
  }
  
  // Always include these generic options
  suggestions.push('Start guided diagnosis', 'Ask follow-up question')
  
  return suggestions.slice(0, 4) // Limit to 4 suggestions
}

function getRelatedResources(category: string): Resource[] {
  const resourceMap: Record<string, Resource[]> = {
    lighting: [
      { title: 'LED Troubleshooting SOP', type: 'sop', relevance: 0.9, summary: 'Complete LED diagnostic procedures' },
      { title: 'PPFD Measurement Guide', type: 'article', relevance: 0.8, summary: 'Proper light measurement techniques' }
    ],
    plant_health: [
      { title: 'Nutrient Deficiency Guide', type: 'article', relevance: 0.9, summary: 'Visual plant health diagnostics' },
      { title: 'Plant Health SOP', type: 'sop', relevance: 0.8, summary: 'Daily health monitoring procedures' }
    ],
    nutrients: [
      { title: 'Nutrient Solution Preparation', type: 'sop', relevance: 0.9, summary: 'Mixing and management procedures' },
      { title: 'pH Control Strategies', type: 'article', relevance: 0.8, summary: 'Maintaining stable pH levels' }
    ],
    environment: [
      { title: 'Environmental Control SOP', type: 'sop', relevance: 0.9, summary: 'Climate monitoring and adjustment' },
      { title: 'VPD Optimization', type: 'article', relevance: 0.8, summary: 'Vapor pressure deficit management' }
    ],
    pest_management: [
      { title: 'IPM Strategy Guide', type: 'sop', relevance: 0.9, summary: 'Integrated pest management' },
      { title: 'Pest Identification', type: 'video', relevance: 0.8, summary: 'Visual pest identification guide' }
    ],
    general: [
      { title: 'Troubleshooting Basics', type: 'article', relevance: 0.7, summary: 'General diagnostic approach' }
    ]
  }
  
  return resourceMap[category] || resourceMap.general
}

function getDiagnosticStepsForCategory(category: string): DiagnosticStep[] | undefined {
  // Return category-specific diagnostic steps
  switch (category) {
    case 'lighting':
      return getLightingDiagnosticSteps()
    case 'plant_health':
      return getPlantHealthDiagnosticSteps()
    case 'environment':
      return getEnvironmentalDiagnosticSteps()
    case 'nutrients':
      return getNutrientDiagnosticSteps()
    case 'pest_management':
      return getPestDiagnosticSteps()
    default:
      return undefined
  }
}

// Fallback function for when Claude API fails
async function analyzeUserProblemFallback(
  message: string, 
  context?: TroubleshootRequest['context']
): Promise<TroubleshootResponse> {
  const input = message.toLowerCase()
  
  // Sophisticated pattern matching and decision tree
  // In production, this would use actual AI/ML models
  
  // Lighting Issues
  if (containsKeywords(input, ['led', 'light', 'lamp', 'fixture', 'dim', 'bright', 'burn'])) {
    return {
      response: generateLightingResponse(input),
      confidence: 0.85,
      category: 'lighting',
      suggestions: [
        "Check fixture connections",
        "Measure PPFD levels", 
        "Inspect for heat damage",
        "Run full lighting diagnostic"
      ],
      diagnosticSteps: getLightingDiagnosticSteps(),
      relatedResources: [
        {
          title: "LED Troubleshooting Guide",
          type: "sop",
          relevance: 0.9,
          summary: "Complete guide to diagnosing LED lighting problems"
        },
        {
          title: "PPFD Measurement Best Practices",
          type: "article", 
          relevance: 0.8,
          summary: "How to properly measure and optimize light intensity"
        }
      ]
    }
  }

  // Plant Health Issues
  if (containsKeywords(input, ['yellow', 'brown', 'wilting', 'drooping', 'spots', 'curl', 'burn', 'deficiency'])) {
    return {
      response: generatePlantHealthResponse(input),
      confidence: 0.78,
      category: 'plant_health',
      suggestions: [
        "Check nutrient levels",
        "Examine root system",
        "Test environmental conditions",
        "Start plant health diagnostic"
      ],
      diagnosticSteps: getPlantHealthDiagnosticSteps(),
      relatedResources: [
        {
          title: "Nutrient Deficiency Visual Guide",
          type: "article",
          relevance: 0.95,
          summary: "Visual identification of common nutrient deficiencies"
        },
        {
          title: "Plant Disease Recognition",
          type: "video",
          relevance: 0.8,
          summary: "Video guide to identifying common plant diseases"
        }
      ]
    }
  }

  // Environmental Issues
  if (containsKeywords(input, ['temperature', 'humidity', 'ventilation', 'co2', 'air', 'hot', 'cold', 'dry', 'humid'])) {
    return {
      response: generateEnvironmentalResponse(input),
      confidence: 0.82,
      category: 'environment',
      suggestions: [
        "Check HVAC system",
        "Calibrate sensors",
        "Inspect ventilation",
        "Monitor VPD levels"
      ],
      diagnosticSteps: getEnvironmentalDiagnosticSteps(),
      relatedResources: [
        {
          title: "Environmental Control SOP",
          type: "sop",
          relevance: 0.9,
          summary: "Standard procedures for environmental monitoring"
        },
        {
          title: "VPD Optimization Guide",
          type: "article",
          relevance: 0.85,
          summary: "Understanding and optimizing vapor pressure deficit"
        }
      ]
    }
  }

  // Nutrient/pH Issues
  if (containsKeywords(input, ['ph', 'nutrient', 'ec', 'ppm', 'tds', 'deficiency', 'toxicity', 'lockout'])) {
    return {
      response: generateNutrientResponse(input),
      confidence: 0.88,
      category: 'nutrients',
      suggestions: [
        "Test pH and EC levels",
        "Check nutrient ratios",
        "Flush growing medium",
        "Calibrate meters"
      ],
      diagnosticSteps: getNutrientDiagnosticSteps(),
      relatedResources: [
        {
          title: "Nutrient Solution Preparation",
          type: "sop",
          relevance: 0.9,
          summary: "Step-by-step nutrient mixing procedures"
        },
        {
          title: "pH Management Strategies",
          type: "article",
          relevance: 0.85,
          summary: "Advanced techniques for pH stability"
        }
      ]
    }
  }

  // Pest/Disease Issues
  if (containsKeywords(input, ['pest', 'bug', 'insect', 'mite', 'aphid', 'thrip', 'fungus', 'mold', 'disease'])) {
    return {
      response: generatePestResponse(input),
      confidence: 0.75,
      category: 'pest_management',
      suggestions: [
        "Identify specific pest",
        "Check environmental conditions",
        "Inspect other plants",
        "Consider IPM strategies"
      ],
      diagnosticSteps: getPestDiagnosticSteps(),
      relatedResources: [
        {
          title: "Integrated Pest Management Guide",
          type: "sop",
          relevance: 0.9,
          summary: "Comprehensive pest identification and management"
        },
        {
          title: "Common Cannabis Pests",
          type: "video",
          relevance: 0.8,
          summary: "Visual guide to identifying common growing pests"
        }
      ],
      escalate: true // Pest issues often need expert consultation
    }
  }

  // Growth/Performance Issues
  if (containsKeywords(input, ['slow', 'growth', 'small', 'stunted', 'performance', 'yield', 'harvest'])) {
    return {
      response: generateGrowthResponse(input),
      confidence: 0.70,
      category: 'general',
      suggestions: [
        "Evaluate environmental parameters",
        "Check nutrition program",
        "Assess lighting schedule",
        "Review genetic factors"
      ],
      diagnosticSteps: getGrowthDiagnosticSteps(),
      relatedResources: [
        {
          title: "Growth Optimization Strategies",
          type: "article",
          relevance: 0.8,
          summary: "Comprehensive approach to maximizing plant growth"
        },
        {
          title: "Yield Enhancement Techniques",
          type: "video",
          relevance: 0.75,
          summary: "Advanced techniques for improving crop yields"
        }
      ]
    }
  }

  // Default/General Response
  return {
    response: "I understand you're experiencing an issue. To provide the most accurate help, could you provide more specific details about what you're observing?\n\nSome helpful information would be:\n• What specific symptoms are you seeing?\n• When did you first notice this problem?\n• What type of growing system are you using?\n• Have you made any recent changes to your routine?\n\nOr feel free to select a category from the sidebar to get started with targeted troubleshooting.",
    confidence: 0.5,
    category: 'general',
    suggestions: [
      "I see yellowing leaves",
      "Equipment isn't working properly", 
      "Plants aren't growing well",
      "Environmental issues",
      "Need expert consultation"
    ],
    relatedResources: [
      {
        title: "Troubleshooting Basics",
        type: "article",
        relevance: 0.6,
        summary: "General approach to diagnosing growing problems"
      }
    ]
  }
}

function containsKeywords(text: string, keywords: string[]): boolean {
  return keywords.some(keyword => text.includes(keyword))
}

function generateLightingResponse(input: string): string {
  if (input.includes('dim') || input.includes('low')) {
    return "🔆 **Low light intensity** detected. This can cause stretching, weak growth, and poor yields.\n\n**Immediate checks:**\n1. Verify dimmer settings are correct\n2. Check for dirty or obstructed fixtures\n3. Measure PPFD at canopy level\n4. Inspect LED driver functionality\n\n**Target PPFD levels:**\n• Seedlings: 100-300 PPFD\n• Vegetative: 300-600 PPFD\n• Flowering: 600-1000 PPFD\n\nWould you like me to guide you through a systematic lighting diagnostic?"
  }
  
  if (input.includes('burn') || input.includes('bleach')) {
    return "⚠️ **Light burn** can damage your crop. Signs include bleaching, crispy leaves, and stunted growth.\n\n**Immediate actions:**\n1. Reduce light intensity by 20-30%\n2. Increase distance between lights and canopy\n3. Check for adequate ventilation and cooling\n4. Monitor plant response over 24-48 hours\n\n**Prevention:**\n• Use PAR meter for accurate measurements\n• Gradually increase intensity during growth\n• Maintain proper environmental conditions\n\nShall I help you calculate optimal light positioning?"
  }

  return "💡 **LED lighting issues** can affect your entire crop. Let me help you troubleshoot systematically.\n\n**Common problems:**\n• Uneven light distribution\n• Dimming/control issues\n• Individual LED failures\n• Heat-related problems\n\n**First steps:**\n1. Visual inspection of all fixtures\n2. Check controller settings and scheduling\n3. Measure light intensity at multiple points\n4. Verify electrical connections\n\nWhat specific lighting symptoms are you observing?"
}

function generatePlantHealthResponse(input: string): string {
  if (input.includes('yellow')) {
    return "🟡 **Yellowing leaves** - Let's diagnose the cause:\n\n**Pattern analysis:**\n• **Lower leaves first:** Usually nitrogen deficiency\n• **Upper leaves:** Often light burn or pH issues\n• **Random pattern:** Could be overwatering or root problems\n• **Whole plant:** Severe nutrient lockout or disease\n\n**Quick assessment questions:**\n1. Which leaves are affected first?\n2. Is yellowing gradual or sudden?\n3. Any other symptoms (spots, curling, etc.)?\n4. Recent changes to feeding or environment?\n\nBased on your answers, I can provide specific solutions and next steps."
  }

  return "🌱 **Plant health issues** require careful diagnosis. Let me help identify the problem.\n\n**Visual inspection checklist:**\n• Leaf color and pattern changes\n• Growth rate and structure\n• Root health (if accessible)\n• Overall plant vigor\n\n**Common causes:**\n1. Nutrient imbalances\n2. Environmental stress\n3. Root zone problems\n4. Pest or disease pressure\n\nDescribe what you're seeing in detail, and I'll guide you through the diagnostic process."
}

function generateEnvironmentalResponse(input: string): string {
  return "🌡️ **Environmental control** is critical for healthy crops. Let's optimize your conditions.\n\n**Key parameters to check:**\n• **Temperature:** 20-26°C (68-79°F) optimal range\n• **Humidity:** 40-60% RH (varies by growth stage)\n• **Air circulation:** Gentle, consistent airflow\n• **CO2:** 400-1200 ppm (sealed environments)\n\n**Common issues:**\n1. Temperature fluctuations stress plants\n2. High humidity promotes mold/mildew\n3. Poor air circulation creates hot spots\n4. Incorrect VPD affects nutrient uptake\n\nWhat environmental readings are you seeing? I can help you optimize your climate control strategy."
}

function generateNutrientResponse(input: string): string {
  return "⚗️ **Nutrient management** requires precision. Let's get your feeding program dialed in.\n\n**Critical measurements:**\n• **pH:** 5.5-6.5 (hydro) or 6.0-7.0 (soil)\n• **EC/PPM:** Varies by growth stage and strain\n• **Water quality:** Low starting EC (<0.3)\n• **Nutrient ratios:** Balanced NPK for growth stage\n\n**Troubleshooting steps:**\n1. Test and calibrate all meters\n2. Check source water quality\n3. Verify nutrient mixing procedures\n4. Monitor plant response to changes\n\nWhat are your current pH and EC readings? This will help me provide specific recommendations."
}

function generatePestResponse(input: string): string {
  return "🐛 **Pest management** requires quick identification and appropriate response.\n\n**Immediate actions:**\n1. Isolate affected plants if possible\n2. Take clear photos for identification\n3. Check environmental conditions\n4. Inspect all plants thoroughly\n\n**Common pests:**\n• Spider mites (fine webbing, stippling)\n• Aphids (small green/black insects)\n• Thrips (silver streaks on leaves)\n• Fungus gnats (flying around soil)\n\n**IPM approach:**\n1. Identify the specific pest\n2. Assess population level\n3. Choose appropriate treatment\n4. Monitor and prevent recurrence\n\nCan you describe what you're seeing? Photos would be extremely helpful for accurate identification."
}

function generateGrowthResponse(input: string): string {
  return "📈 **Growth optimization** involves multiple factors working together.\n\n**Growth factor assessment:**\n• **Genetics:** 30% of potential\n• **Environment:** 40% of potential\n• **Nutrition:** 20% of potential\n• **Management:** 10% of potential\n\n**Key areas to evaluate:**\n1. Light intensity and spectrum\n2. Temperature and humidity stability\n3. Nutrient program effectiveness\n4. Root zone health\n5. Plant training techniques\n\n**Benchmarks by stage:**\n• Seedling: 1-2\" growth per week\n• Vegetative: 2-4\" growth per week\n• Flowering: Focus on bud development\n\nHow does your growth rate compare to these benchmarks? Let's identify the limiting factors."
}

// Diagnostic step generators
function getLightingDiagnosticSteps(): DiagnosticStep[] {
  return [
    {
      id: 'visual_led_check',
      title: 'Visual LED Inspection',
      description: 'Examine all LED fixtures for obvious damage or non-functioning diodes',
      type: 'visual',
      expectedOutcome: 'All LEDs should be lit with consistent color and brightness',
      troubleshootingPath: {
        positive: 'LEDs appear normal - proceed to intensity measurements',
        negative: 'Found dark/damaged LEDs - check connections or replace fixture'
      }
    },
    {
      id: 'ppfd_measurement',
      title: 'PPFD Measurement',
      description: 'Measure light intensity at canopy level using calibrated PAR meter',
      type: 'measurement',
      expectedOutcome: 'PPFD should match target levels for current growth stage',
      troubleshootingPath: {
        positive: 'PPFD levels appropriate - check light distribution uniformity',
        negative: 'PPFD too low/high - adjust intensity or fixture height'
      }
    },
    {
      id: 'controller_check',
      title: 'Controller Function Test',
      description: 'Verify dimming controls and scheduling are working correctly',
      type: 'test',
      expectedOutcome: 'Controller responds to manual adjustments and follows schedule',
      troubleshootingPath: {
        positive: 'Controller working properly - issue may be fixture-related',
        negative: 'Controller malfunction - check programming or replace unit'
      }
    }
  ]
}

function getPlantHealthDiagnosticSteps(): DiagnosticStep[] {
  return [
    {
      id: 'leaf_pattern_analysis',
      title: 'Leaf Pattern Analysis',
      description: 'Document which leaves are affected and the pattern of symptoms',
      type: 'visual',
      expectedOutcome: 'Clear pattern indicating nutrient mobility or environmental stress',
      troubleshootingPath: {
        positive: 'Pattern suggests nutrient deficiency - proceed to nutrient testing',
        negative: 'Random pattern suggests environmental or root issues'
      }
    },
    {
      id: 'root_inspection',
      title: 'Root System Inspection',
      description: 'Check root color, smell, and overall health (if accessible)',
      type: 'visual',
      expectedOutcome: 'Roots should be white/cream colored with fresh smell',
      troubleshootingPath: {
        positive: 'Roots healthy - focus on nutrition and environment',
        negative: 'Root problems detected - address root zone conditions'
      }
    }
  ]
}

function getEnvironmentalDiagnosticSteps(): DiagnosticStep[] {
  return [
    {
      id: 'sensor_calibration',
      title: 'Sensor Calibration Check',
      description: 'Verify temperature and humidity sensors are reading accurately',
      type: 'test',
      expectedOutcome: 'Sensors match reference instruments within ±2% accuracy',
      troubleshootingPath: {
        positive: 'Sensors accurate - readings represent true conditions',
        negative: 'Sensors need calibration or replacement'
      }
    },
    {
      id: 'airflow_assessment',
      title: 'Airflow Pattern Assessment',
      description: 'Check air circulation patterns and ventilation effectiveness',
      type: 'visual',
      expectedOutcome: 'Gentle, uniform airflow throughout growing area',
      troubleshootingPath: {
        positive: 'Good airflow - check other environmental factors',
        negative: 'Poor circulation - adjust fans or ventilation system'
      }
    }
  ]
}

function getNutrientDiagnosticSteps(): DiagnosticStep[] {
  return [
    {
      id: 'meter_calibration',
      title: 'Meter Calibration',
      description: 'Calibrate pH and EC meters using standard solutions',
      type: 'test',
      expectedOutcome: 'Meters read calibration standards accurately',
      troubleshootingPath: {
        positive: 'Meters accurate - readings are reliable',
        negative: 'Recalibrate or replace meters before proceeding'
      }
    },
    {
      id: 'nutrient_testing',
      title: 'Nutrient Solution Testing',
      description: 'Test pH, EC, and individual nutrient levels in solution',
      type: 'measurement',
      expectedOutcome: 'pH 5.5-6.5, EC appropriate for growth stage',
      troubleshootingPath: {
        positive: 'Solution parameters correct - check plant uptake',
        negative: 'Adjust solution pH/EC to optimal ranges'
      }
    }
  ]
}

function getPestDiagnosticSteps(): DiagnosticStep[] {
  return [
    {
      id: 'pest_identification',
      title: 'Pest Identification',
      description: 'Use magnifying glass to identify specific pest species',
      type: 'visual',
      expectedOutcome: 'Clear identification of pest type and lifecycle stage',
      troubleshootingPath: {
        positive: 'Pest identified - select appropriate treatment method',
        negative: 'Unable to identify - submit photos for expert identification'
      }
    },
    {
      id: 'population_assessment',
      title: 'Population Level Assessment',
      description: 'Count pests per leaf to determine infestation severity',
      type: 'measurement',
      expectedOutcome: 'Population count indicates treatment urgency level',
      troubleshootingPath: {
        positive: 'Low population - monitor and use preventive measures',
        negative: 'High population - immediate treatment required'
      }
    }
  ]
}

function getGrowthDiagnosticSteps(): DiagnosticStep[] {
  return [
    {
      id: 'growth_rate_measurement',
      title: 'Growth Rate Measurement',
      description: 'Measure and document plant height/width over 7-day period',
      type: 'measurement',
      expectedOutcome: 'Growth rate meets benchmarks for current stage',
      troubleshootingPath: {
        positive: 'Growth rate normal - optimize other factors for maximum yield',
        negative: 'Growth rate below normal - identify limiting factors'
      }
    },
    {
      id: 'environmental_optimization',
      title: 'Environmental Factor Optimization',
      description: 'Review and optimize temperature, humidity, light, and CO2',
      type: 'adjustment',
      expectedOutcome: 'All environmental parameters within optimal ranges',
      troubleshootingPath: {
        positive: 'Environment optimized - focus on nutrition and genetics',
        negative: 'Environmental issues found - address before other factors'
      }
    }
  ]
}