import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { aiRateLimiter } from '@/lib/ai-rate-limiter';
import { createClaudeClient, getTokenLimit, CLAUDE_CONFIG } from '@/lib/claude-config';
import { generateFallbackDesign, isRateLimitError } from '@/lib/ai-fallback-designer';
import Anthropic from '@anthropic-ai/sdk';

// Initialize Claude client lazily
let claude: any = null;

function getClaude() {
  if (!claude) {
    try {
      claude = createClaudeClient();
    } catch (error) {
      console.error('Failed to initialize Claude client:', error);
      return null;
    }
  }
  return claude;
}

const systemPrompt = `You are an expert horticultural lighting design assistant for Vibelux, with deep knowledge of photobiology, lighting science, and facility design. You can understand complex, natural language requests and provide intelligent design solutions.

You can handle ANY type of design request including:
- Complex multi-zone facilities
- Phased buildouts
- Retrofits and upgrades
- Budget-constrained designs
- Specific manufacturer preferences
- Custom rack configurations
- Integration with HVAC and environmental controls
- Compliance with building codes and standards

IMPORTANT: You MUST respond with ONLY valid JSON. Do not include any text before or after the JSON. Your entire response must be a valid JSON object that can be parsed.

When responding, analyze the user's intent and provide appropriate designs. Return JSON in this format:

{
  "intent": "new_design" | "modify" | "optimize" | "question" | "clear" | "compare" | "validate",
  "response": "Your conversational response explaining what you're doing",
  "design": {
    "zones": [
      {
        "name": "Zone name (e.g., Flower Room 1)",
        "dimensions": { "width": number, "length": number, "height": number },
        "purpose": "flowering" | "vegetative" | "propagation" | "drying" | "processing",
        "targetPPFD": number,
        "fixtures": [
          {
            "id": "unique_id",
            "model": "Exact model from DLC database",
            "manufacturer": "Manufacturer name",
            "quantity": number,
            "x": number,
            "y": number,
            "z": number,
            "rotation": number,
            "wattage": number,
            "ppf": number,
            "spectrum": "Full spectrum" | "Vegetative" | "Flowering",
            "dimmingLevel": number (0-100)
          }
        ],
        "racks": [
          {
            "id": "unique_id",
            "x": number,
            "y": number,
            "width": number,
            "length": number,
            "tiers": number,
            "tierHeight": number,
            "orientation": "north-south" | "east-west"
          }
        ],
        "environmental": {
          "hvacFans": [
            {
              "type": "HAF" | "VAF" | "Exhaust" | "Intake",
              "cfm": number,
              "placement": { "x": number, "y": number, "z": number }
            }
          ],
          "temperature": { "day": number, "night": number },
          "humidity": { "day": number, "night": number },
          "co2": number
        }
      }
    ],
    "phases": [
      {
        "phase": number,
        "description": "Phase description",
        "zones": ["zone names"],
        "cost": number,
        "timeline": "timeframe"
      }
    ],
    "electrical": {
      "totalLoad": number,
      "circuits": [
        {
          "id": "circuit_id",
          "amperage": number,
          "voltage": number,
          "fixtures": ["fixture_ids"]
        }
      ],
      "panelRequirements": "Description of electrical requirements"
    },
    "metrics": {
      "totalWattage": number,
      "avgPPFD": number,
      "uniformity": number,
      "dli": number,
      "coverage": number,
      "efficacy": number,
      "annualEnergyUse": number,
      "estimatedYield": number
    },
    "costs": {
      "equipment": number,
      "installation": number,
      "electrical": number,
      "total": number,
      "annualOperating": number,
      "paybackPeriod": number,
      "fiveYearTCO": number
    },
    "validation": {
      "meetsTargets": boolean,
      "uniformityPass": boolean,
      "electricalPass": boolean,
      "codeCompliant": boolean,
      "issues": ["any issues found"],
      "recommendations": ["improvement suggestions"]
    }
  },
  "alternatives": [
    {
      "description": "Alternative approach description",
      "changes": ["list of changes"],
      "prosAndCons": { "pros": ["list"], "cons": ["list"] }
    }
  ]
}

SCIENTIFIC LIGHTING REQUIREMENTS (based on peer-reviewed research):

Shipping Containers:
- Standard dimensions: 40'x8'x8.5' or 20'x8'x8.5' (ISO 668)
- Usable interior: subtract 4" from each dimension for insulation

PPFD Requirements by Crop (μmol·m⁻²·s⁻¹):
- Microgreens: 100-200 (Gerovac et al., 2016)
- Lettuce: 150-250 optimal, 300+ causes tipburn (Sago, 2016)
- Basil/Herbs: 250-300 (Dou et al., 2018)
- Strawberries: 300-400 (Hidaka et al., 2013)
- Tomatoes: 400-600 (Dorais, 2003)
- Cannabis vegetative: 400-600 (Chandra et al., 2008)
- Cannabis flowering: 700-1000, optimal 800-900 (Chandra et al., 2015)
- Peppers: 300-500 (Joshi et al., 2019)
- Cucumbers: 400-600 (Paucek et al., 2020)

DLI Requirements (mol·m⁻²·d⁻¹):
- Microgreens: 6-12 DLI
- Lettuce: 12-17 DLI (17+ causes bolting)
- Herbs: 15-20 DLI
- Cannabis: 25-40 DLI flowering, 18-25 DLI veg
- Tomatoes: 15-30 DLI
- Peppers: 15-25 DLI

Vertical Farming Considerations:
- Rack spacing: minimum 12" for microgreens, 16-18" for lettuce, 24-36" for cannabis
- Close mounting fixtures (5-6" from canopy) require:
  * Lower wattage (100-200W) to prevent heat stress
  * Wide beam angles (120°) for uniformity
  * PPF output adjusted for proximity (inverse square law)
- Heat dissipation: ~3.41 BTU/hr per watt of LED

Fixture Selection Criteria:
- Efficacy: >2.7 μmol/J is considered efficient (2023 DLC standards)
- Premium efficacy: >3.0 μmol/J
- Spectrum: 
  * Red (660nm): 25-35% for flowering/fruiting
  * Blue (450nm): 15-25% for vegetative growth
  * Green (500-600nm): 5-15% for canopy penetration
  * Far-red (730nm): 2-5% for photomorphogenesis
  * UV (280-400nm): 0-3% for stress responses
- Uniformity: min/avg PPFD ratio >0.7 (commercial), >0.8 (research)

Air Circulation Requirements:
- Minimum 0.3 m/s air velocity at canopy level
- Cannabis: 40-60 air changes per hour
- Leafy greens: 20-30 air changes per hour
- HAF fans: one per 1000-1500 sq ft
- VAF fans: for facilities >5000 sq ft or >12' ceiling

Electrical Standards:
- NEC Article 410 for luminaire installation
- 80% circuit loading maximum
- GFCI protection in wet locations
- Emergency egress lighting required

Building Codes:
- Minimum 7.5' ceiling height for occupied spaces
- Fire-rated assemblies for grow rooms >2500 sq ft
- Adequate ventilation per ASHRAE 62.1
- ADA compliance for commercial facilities

When analyzing 8' fixtures:
- Check the Length field in DLC data (94-98 inches)
- Consider weight and mounting requirements
- Verify electrical capacity for high-wattage units
- Account for maintenance access

Budget Guidelines:
- Economy: $0.50-0.75/sq ft/month operating cost
- Standard: $0.75-1.25/sq ft/month
- Premium: $1.25-2.00/sq ft/month
- Include 15-20% contingency in estimates

For phased installations:
- Prioritize high-value crop areas first
- Plan electrical infrastructure for full buildout
- Consider modular rack systems for flexibility
- Document expansion pathways

Remember to:
1. Parse natural language carefully - users may use colloquialisms, typos, or incomplete sentences
2. Infer missing information from context when possible
3. Provide specific fixture models from the DLC database when available
4. Calculate accurate photometric values
5. Consider practical installation constraints
6. Offer alternatives when requests are ambiguous
7. Validate designs against standards and best practices

REMEMBER: Your entire response must be valid JSON only. No explanatory text before or after the JSON object.`;

interface DesignRequest {
  message: string;
  context: {
    roomDimensions: {
      width: number;
      length: number;
      height: number;
    };
    currentDesign?: any[];
    dlcFixtures?: any[];
    preferences?: {
      targetPPFD?: number;
      budget?: number;
      cropType?: string;
      growthStage?: string;
    };
  };
  conversationHistory?: Array<{
    role: 'user' | 'assistant';
    content: string;
  }>;
}

export async function POST(request: NextRequest) {
  let message = '';
  let context: any;
  
  try {
    // Check if Claude client is initialized
    if (!claude) {
      console.error('Claude client not initialized');
      console.error('API Key exists:', !!process.env.CLAUDE_API_KEY);
      console.error('API Key length:', process.env.CLAUDE_API_KEY?.length);
      return NextResponse.json({
        success: false,
        error: 'AI service not configured. Please check environment variables.',
        intent: 'error',
        response: 'The AI assistant is not properly configured. Please contact support.'
      }, { status: 500 });
    }
    

    // Get user ID for rate limiting
    const { userId } = await auth();
    const rateLimitKey = userId || request.headers.get('x-forwarded-for') || 'anonymous';
    
    // Check rate limit
    const { allowed, retryAfter } = await aiRateLimiter.checkLimit(rateLimitKey);
    
    if (!allowed) {
      return NextResponse.json({
        success: false,
        error: 'Rate limit exceeded',
        intent: 'error',
        response: `You've reached the AI request limit. Please try again in ${retryAfter} seconds.`,
        retryAfter
      }, { status: 429 });
    }

    const body: DesignRequest = await request.json();
    const { message: requestMessage, context: requestContext, conversationHistory = [] } = body;
    message = requestMessage;
    context = requestContext;

    // Build comprehensive context for the AI
    const roomWidth = context.roomDimensions?.width || 40;
    const roomLength = context.roomDimensions?.length || 40;
    const roomHeight = context.roomDimensions?.height || 10;
    
    const contextMessage = `
Current Facility Configuration:
- Room Dimensions: ${roomWidth}' x ${roomLength}' x ${roomHeight}' height
- Canopy Area: ${roomWidth * roomLength} sq ft
- Cubic Volume: ${roomWidth * roomLength * roomHeight} cu ft
- Current Design: ${context.currentDesign?.length || 0} objects placed
${context.currentDesign?.length ? `- Existing fixtures: ${context.currentDesign.filter((obj: any) => obj.type === 'fixture').length}` : ''}
${context.currentDesign?.length ? `- Existing racks: ${context.currentDesign.filter((obj: any) => obj.type === 'rack').length}` : ''}

User Preferences:
- Target PPFD: ${context.preferences?.targetPPFD || 'Not specified - infer from crop type'}
- Budget: ${context.preferences?.budget ? `$${context.preferences.budget.toLocaleString()}` : 'Not specified'}
- Crop Type: ${context.preferences?.cropType || 'Not specified'}
- Growth Stage: ${context.preferences?.growthStage || 'Not specified'}

Available DLC Fixtures: ${context.dlcFixtures?.length || 0} models in database

${context.dlcFixtures?.length ? `
Top 10 Most Efficient Fixtures (by μmol/J):
${context.dlcFixtures
  .filter((f: any) => f.ppf && f.wattage && f.ppf > 0 && f.wattage > 0)
  .sort((a: any, b: any) => (b.ppf / b.wattage) - (a.ppf / a.wattage))
  .slice(0, 10)
  .map((f: any, i: number) => 
    `${i + 1}. ${f.manufacturer} ${f.model} - ${f.wattage}W, ${f.ppf} PPF, ${(f.ppf / f.wattage).toFixed(2)} μmol/J${f.Length ? `, ${f.Length}` : ''}`
  )
  .join('\n')}` : ''}

${context.dlcFixtures?.filter((f: any) => {
  const lengthStr = f.Length || f.length || '';
  const lengthMatch = lengthStr.match(/(\d+\.?\d*)\s*in/);
  if (lengthMatch) {
    const lengthInches = parseFloat(lengthMatch[1]);
    return lengthInches >= 94 && lengthInches <= 98;
  }
  return false;
}).length ? `
8-foot Fixtures Available (94-98 inches):
${context.dlcFixtures
  .filter((f: any) => {
    const lengthStr = f.Length || f.length || '';
    const lengthMatch = lengthStr.match(/(\d+\.?\d*)\s*in/);
    if (lengthMatch) {
      const lengthInches = parseFloat(lengthMatch[1]);
      return lengthInches >= 94 && lengthInches <= 98;
    }
    return false;
  })
  .slice(0, 5)
  .map((f: any) => `- ${f.manufacturer} ${f.model} - ${f.wattage}W, ${f.ppf} PPF, ${f.Length}`)
  .join('\n')}` : ''}

User's Natural Language Request: "${message}"

IMPORTANT INSTRUCTIONS:
1. Understand the user's intent even with typos, abbreviations, or colloquialisms
2. If user mentions "8 foot" or "8'" fixtures, filter for fixtures with Length 94-98 inches
3. If user says "ayers" they likely mean "layers" or "tiers"
4. Parse quantities like "build me 2 racks" or "I need 5 zones"
5. Generate specific x,y,z coordinates for all fixtures and objects
6. Use actual models from the DLC database when possible
7. Calculate realistic PPFD values based on fixture PPF and mounting height
8. Provide comprehensive cost breakdowns
9. Validate electrical requirements
10. Suggest alternatives if the exact request isn't feasible
`;

    // Build messages array for Claude
    // Combine system prompts into a single system message
    const systemContent = `${systemPrompt}\n\n${contextMessage}`;
    
    // Convert conversation history to Claude format
    const claudeMessages = [
      ...conversationHistory.map(msg => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content
      })),
      { role: 'user' as const, content: message }
    ];

    // Claude 3.5 has a 200k context window - no need to restrict based on facility size
    // Use a generous token limit for output to allow detailed responses
    const maxTokens = 50000; // Allow up to 50k tokens for complex multi-zone designs
    
    const facilityArea = context.roomDimensions.width * context.roomDimensions.length;

    // Call Claude API with retry logic
    let completion;
    let retries = 0;
    const maxRetries = CLAUDE_CONFIG.rateLimits.maxRetries;
    
    // Determine model based on complexity
    const isComplexDesign = message.toLowerCase().includes('zone') || 
                           message.toLowerCase().includes('phase') || 
                           facilityArea > 5000;
    
    const model = isComplexDesign ? 
      CLAUDE_CONFIG.models.design : 
      CLAUDE_CONFIG.models.simple;
    
    while (retries < maxRetries) {
      try {
        
        
        // Make Claude API call
        // Prepend instruction to ensure JSON response
        const jsonInstruction = "Respond with ONLY valid JSON. No text before or after the JSON object.";
        
        const claudeClient = getClaude();
        if (!claudeClient) {
          throw new Error('Claude client not available');
        }
        completion = await claudeClient.messages.create({
          model,
          messages: [
            ...claudeMessages.slice(0, -1),
            {
              role: 'user' as const,
              content: `${jsonInstruction}\n\n${claudeMessages[claudeMessages.length - 1].content}`
            }
          ],
          system: systemContent,
          temperature: 0.7,
          max_tokens: maxTokens,
        });
        break; // Success, exit loop
      } catch (apiError: any) {
        retries++;
        
        // Check if it's a rate limit error from Claude
        if (apiError?.status === 429 || apiError?.error?.type === 'rate_limit_error') {
          if (retries < maxRetries) {
            // Exponential backoff with jitter
            const baseDelay = CLAUDE_CONFIG.rateLimits.retryDelay;
            const backoff = Math.pow(CLAUDE_CONFIG.rateLimits.backoffFactor, retries - 1);
            let delay = baseDelay * backoff;
            
            // Add jitter to prevent thundering herd
            if (CLAUDE_CONFIG.rateLimits.jitter) {
              const jitterRange = delay * 0.3; // 30% jitter
              const jitter = crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * jitterRange - (jitterRange / 2);
              delay = Math.round(delay + jitter);
            }
            
            await new Promise(resolve => setTimeout(resolve, delay));
            continue;
          } else {
            // Max retries reached, use fallback
            console.warn('Max retries reached after rate limiting, using enhanced fallback designer');
            const fallbackDesign = generateFallbackDesign(message, context.roomDimensions);
            
            return NextResponse.json({
              success: true,
              ...fallbackDesign,
              usage: { total_tokens: 0, prompt_tokens: 0, completion_tokens: 0 },
              modelUsed: 'fallback-designer',
              notice: 'Currently using our intelligent template system. The AI service will be available again shortly.'
            });
          }
        }
        
        // If not rate limit or max retries reached, throw the error
        throw apiError;
      }
    }

    // Extract content from Claude's response format
    const responseContent = completion.content[0]?.text;
    if (!responseContent) {
      throw new Error('No response from AI');
    }

    // Parse and validate the response
    let aiResponse;
    try {
      aiResponse = JSON.parse(responseContent);
    } catch (parseError) {
      console.error('Failed to parse AI response:', responseContent);
      throw new Error('Invalid response format from AI');
    }

    // Process the design to ensure all fixtures have proper coordinates
    if (aiResponse.design?.zones) {
      aiResponse.design.zones = aiResponse.design.zones.map((zone: any) => {
        // Generate IDs if not provided
        if (zone.fixtures) {
          zone.fixtures = zone.fixtures.map((fixture: any, index: number) => ({
            ...fixture,
            id: fixture.id || `fixture_${Date.now()}_${index}_${crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF.toString(36).substr(2, 9)}`,
            // Ensure coordinates are present
            x: fixture.x ?? (zone.dimensions.width / 2),
            y: fixture.y ?? (zone.dimensions.length / 2),
            z: fixture.z ?? (zone.dimensions.height - 3),
            rotation: fixture.rotation ?? 0,
            dimmingLevel: fixture.dimmingLevel ?? 100
          }));
        }

        if (zone.racks) {
          zone.racks = zone.racks.map((rack: any, index: number) => ({
            ...rack,
            id: rack.id || `rack_${Date.now()}_${index}_${crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF.toString(36).substr(2, 9)}`,
            orientation: rack.orientation || 'north-south'
          }));
        }

        return zone;
      });
    }

    // Ensure we have a valid response structure
    const response = {
      success: true,
      ...aiResponse,
      usage: {
        total_tokens: (completion.usage?.input_tokens || 0) + (completion.usage?.output_tokens || 0),
        prompt_tokens: completion.usage?.input_tokens || 0,
        completion_tokens: completion.usage?.output_tokens || 0
      },
      modelUsed: model
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('AI Design Chat Error:', error);
    
    // Determine specific error type
    let errorMessage = 'Unknown error occurred';
    let userMessage = "I encountered an error processing your request. However, I can still help you with a basic design. Could you please tell me more about your specific needs?";
    
    if (error instanceof Error) {
      errorMessage = error.message;
      
      // Provide specific error messages
      if (error.message.includes('401') || error.message.includes('authentication')) {
        errorMessage = 'Claude API authentication failed';
        userMessage = "The AI service authentication failed. Please check your API configuration.";
      } else if (error.message.includes('429') || error.message.includes('rate_limit') || isRateLimitError(error)) {
        // Use fallback designer when rate limited
        console.warn('Claude rate limit hit, using fallback designer');
        
        try {
          const fallbackDesign = generateFallbackDesign(message, context.roomDimensions);
          
          return NextResponse.json({
            success: true,
            ...fallbackDesign,
            usage: { total_tokens: 0, prompt_tokens: 0, completion_tokens: 0 },
            modelUsed: 'fallback-designer',
            notice: 'Due to high demand, this design was generated using our template system. For more complex designs, please try again in a few minutes.'
          });
        } catch (fallbackError) {
          console.error('Fallback designer error:', fallbackError);
          errorMessage = 'Claude API rate limit exceeded';
          userMessage = "We've hit the AI service rate limit. Please try again in a few minutes.";
        }
      } else if (error.message.includes('timeout')) {
        errorMessage = 'Request timeout - facility may be too large';
        userMessage = "The design request timed out. For very large facilities (>10,000 sq ft), try breaking it into zones or sections.";
      } else if (error.message.includes('context_length_exceeded')) {
        errorMessage = 'Design too complex for single request';
        userMessage = "This design is too large for a single request. Try designing one zone at a time, or reduce the facility size.";
      }
    }
    
    // Provide a helpful fallback response
    const fallbackResponse = {
      success: false,
      error: errorMessage,
      intent: 'error',
      response: userMessage,
      design: {
        zones: [{
          name: "Main Growing Area",
          dimensions: { width: 20, length: 40, height: 10 },
          purpose: "flowering",
          targetPPFD: 800,
          fixtures: [],
          racks: [],
          environmental: {
            hvacFans: [],
            temperature: { day: 75, night: 65 },
            humidity: { day: 50, night: 45 },
            co2: 1200
          }
        }],
        metrics: {
          totalWattage: 0,
          avgPPFD: 0,
          uniformity: 0,
          dli: 0,
          coverage: 0,
          efficacy: 0
        }
      }
    };

    return NextResponse.json(fallbackResponse, { status: 200 });
  }
}

// GET endpoint to check API status and capabilities  
export async function GET() {
  const hasApiKey = !!process.env.CLAUDE_API_KEY || !!CLAUDE_CONFIG.apiKey;
  
  return NextResponse.json({
    status: hasApiKey ? 'ready' : 'missing_api_key',
    model: 'claude-3-5-sonnet-20241022',
    capabilities: [
      'Natural language understanding',
      'Complex multi-zone facility design',
      'Phased buildout planning',
      'DLC fixture recommendations',
      'Photometric calculations',
      'Electrical load planning',
      'Cost estimation and ROI',
      'Code compliance checking',
      'HVAC integration',
      'Custom rack configurations',
      'Budget optimization',
      'Typo and colloquialism handling',
      '8-foot fixture detection',
      'Real-time design modifications'
    ],
    instructions: hasApiKey ? 
      'Claude API key configured. Ready for intelligent design assistance.' : 
      'Please set CLAUDE_API_KEY environment variable to enable AI features.'
  });
}