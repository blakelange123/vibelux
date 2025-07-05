import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import OpenAI from 'openai';
import { trackAIUsage, checkAIUsageLimit } from '@/lib/ai-usage-tracker';
import { FactBasedDesignAdvisor } from '@/lib/ai/fact-based-design-advisor';

// Initialize OpenAI lazily
let openai: OpenAI | null = null;

function getOpenAI(): OpenAI | null {
  if (!openai && process.env.OPENAI_API_KEY) {
    try {
      openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });
    } catch (error) {
      console.error('Failed to initialize OpenAI:', error);
      return null;
    }
  }
  return openai;
}

// Designer action types
export type DesignerAction = 
  | { type: 'CREATE_ROOM'; params: CreateRoomParams }
  | { type: 'ADD_FIXTURE'; params: AddFixtureParams }
  | { type: 'ADD_FIXTURES_ARRAY'; params: AddFixturesArrayParams }
  | { type: 'REMOVE_FIXTURE'; params: RemoveFixtureParams }
  | { type: 'UPDATE_FIXTURE'; params: UpdateFixtureParams }
  | { type: 'ADD_EQUIPMENT'; params: AddEquipmentParams }
  | { type: 'ADD_BENCHING'; params: AddBenchingParams }
  | { type: 'UPDATE_ROOM'; params: UpdateRoomParams }
  | { type: 'OPTIMIZE_LAYOUT'; params: OptimizeLayoutParams }
  | { type: 'CALCULATE_METRICS'; params: {} }
  | { type: 'GENERATE_REPORT'; params: GenerateReportParams }
  | { type: 'SAVE_DESIGN'; params: SaveDesignParams }
  | { type: 'LOAD_DESIGN'; params: LoadDesignParams }
  | { type: 'CLEAR_CANVAS'; params: {} }
  | { type: 'SET_SPECTRUM'; params: SetSpectrumParams }
  | { type: 'SET_TARGET_PPFD'; params: SetTargetPPFDParams }
  | { type: 'ADD_WALLS'; params: AddWallsParams }
  | { type: 'ADD_OBSTACLE'; params: AddObstacleParams }
  | { type: 'CALCULATE_SURFACE'; params: CalculateSurfaceParams }
  | { type: 'OPTIMIZE_DLC_FIXTURES'; params: OptimizeDLCParams }
  | { type: 'ADD_PLANT'; params: AddPlantParams }
  | { type: 'ADD_PLANTS_ARRAY'; params: AddPlantsArrayParams };

// Parameter types
interface CreateRoomParams {
  width: number;
  length: number;
  height: number;
  shape?: 'rectangle' | 'polygon';
  ceilingHeight?: number;
  workingHeight?: number;
  roomType?: string;
}

interface AddFixtureParams {
  x: number;
  y: number;
  z?: number;
  modelId?: string;
  modelName?: string;
  wattage?: number;
  ppf?: number;
  dimmingLevel?: number;
}

interface AddFixturesArrayParams {
  rows: number;
  columns: number;
  spacing?: number;
  centerX?: number;
  centerY?: number;
  modelId?: string;
  targetPPFD?: number;
}

interface RemoveFixtureParams {
  fixtureId: string;
}

interface UpdateFixtureParams {
  fixtureId: string;
  updates: {
    x?: number;
    y?: number;
    z?: number;
    rotation?: number;
    dimmingLevel?: number;
    enabled?: boolean;
  };
}

interface AddEquipmentParams {
  type: 'hvac' | 'fan' | 'dehumidifier' | 'co2' | 'irrigation';
  x: number;
  y: number;
  specs?: any;
}

interface AddBenchingParams {
  type: 'rolling' | 'fixed' | 'rack';
  rows: number;
  width: number;
  length: number;
  height?: number;
  tiers?: number;
}

interface UpdateRoomParams {
  width?: number;
  length?: number;
  height?: number;
  reflectances?: {
    ceiling?: number;
    walls?: number;
    floor?: number;
  };
}

interface OptimizeLayoutParams {
  targetPPFD: number;
  optimizeFor: 'uniformity' | 'efficiency' | 'coverage';
  constraints?: {
    maxPower?: number;
    minUniformity?: number;
    budgetLimit?: number;
  };
}

interface GenerateReportParams {
  reportType: 'pdf' | 'excel' | 'bom';
  includeCalculations?: boolean;
  includeVisualizations?: boolean;
}

interface SaveDesignParams {
  name: string;
  description?: string;
}

interface LoadDesignParams {
  designId: string;
}

interface SetSpectrumParams {
  spectrum: {
    red?: number;
    blue?: number;
    green?: number;
    farRed?: number;
    uv?: number;
  };
}

interface SetTargetPPFDParams {
  targetPPFD: number;
  dli?: number;
  photoperiod?: number;
}

interface AddWallsParams {
  walls: Array<{
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    height?: number;
  }>;
}

interface AddObstacleParams {
  type: 'column' | 'beam' | 'equipment';
  x: number;
  y: number;
  width: number;
  length: number;
  height?: number;
}

interface CalculateSurfaceParams {
  x: number;
  y: number;
  width: number;
  length: number;
  height: number;
  targetPPFD: number;
  mountingHeight: number;
}

interface OptimizeDLCParams {
  surfaceWidth: number;
  surfaceLength: number;
  targetPPFD: number;
  mountingHeight: number;
  x?: number;
  y?: number;
  z?: number;
  preferredFormFactor?: 'bar' | 'panel' | 'compact';
  maxWattage?: number;
  minEfficacy?: number;
}

interface AddPlantParams {
  x: number;
  y: number;
  variety: 'lettuce' | 'hemp' | 'high-wire' | 'tomato' | 'cannabis' | 'herbs' | 'microgreens';
  growthStage?: 'seedling' | 'vegetative' | 'flowering' | 'harvest';
  width?: number;
  length?: number;
  targetDLI?: number;
}

interface AddPlantsArrayParams {
  rows: number;
  columns: number;
  spacing?: number;
  variety: 'lettuce' | 'hemp' | 'high-wire' | 'tomato' | 'cannabis' | 'herbs' | 'microgreens';
  growthStage?: 'seedling' | 'vegetative' | 'flowering' | 'harvest';
  centerX?: number;
  centerY?: number;
}

// Helper function to parse natural language into designer actions
async function parseNaturalLanguageToActions(input: string, currentState: any): Promise<DesignerAction[]> {
  const systemPrompt = `You are an AI assistant for a professional lighting design application. 
Convert natural language requests into specific designer actions.

Current state:
- Room: ${currentState.room ? `${currentState.room.width}x${currentState.room.length}x${currentState.room.height} ft` : 'None'}
- Fixtures: ${currentState.objects?.filter((o: any) => o.type === 'fixture').length || 0}
- Current PPFD: ${currentState.calculations?.averagePPFD || 0}
- Uniformity: ${currentState.calculations?.uniformity || 0}

Available actions:
- CREATE_ROOM: Create a new room with dimensions
- ADD_FIXTURE: Add a single fixture at specific coordinates
- ADD_FIXTURES_ARRAY: Add multiple fixtures in a grid pattern
- REMOVE_FIXTURE: Remove a specific fixture
- UPDATE_FIXTURE: Update fixture properties
- ADD_EQUIPMENT: Add HVAC, fans, dehumidifiers, etc.
- ADD_BENCHING: Add benching or racking systems
- UPDATE_ROOM: Update room properties
- OPTIMIZE_LAYOUT: Optimize fixture placement
- CALCULATE_METRICS: Recalculate PPFD and other metrics
- SET_TARGET_PPFD: Set target PPFD and DLI
- ADD_WALLS: Add interior walls
- ADD_OBSTACLE: Add obstacles like columns
- CLEAR_CANVAS: Clear all objects from the canvas
- CALCULATE_SURFACE: Define a calculation surface for PPFD analysis
- OPTIMIZE_DLC_FIXTURES: Find and place the most efficient DLC fixtures for a specific surface
- ADD_PLANT: Add a single plant (lettuce, hemp, high-wire tomatoes, cannabis, herbs, microgreens)
- ADD_PLANTS_ARRAY: Add multiple plants in a grid pattern

Parse the user's natural language input and return appropriate actions.

Examples:
"Create a 40x60 flowering room with 10 foot ceilings" -> CREATE_ROOM with width:40, length:60, height:10
"Build me a 20x20 room" -> CREATE_ROOM with width:20, length:20, height:10
"Add 4x8 rolling benches in 3 rows" -> ADD_BENCHING with type:'rolling', rows:3, width:4, length:8
"Fill it with fixtures for 800 PPFD" -> ADD_FIXTURES_ARRAY with targetPPFD:800
"Build me a 20x 20' room with 400 ppfd from siify fixture" -> [CREATE_ROOM with width:20, length:20, height:10] + [ADD_FIXTURES_ARRAY with targetPPFD:400]
"Add a 2 ton AC" -> ADD_EQUIPMENT with type:'hvac', specs:{tonnage:2}
"Optimize the layout" -> OPTIMIZE_LAYOUT with optimizeFor:'uniformity'
"I want a calculation surface of 2' x 30' and the lights are 2.5' away" -> CALCULATE_SURFACE with width:2, length:30, mountingHeight:2.5
"Find the best DLC fixture for a 2x30 surface with 400 PPFD" -> OPTIMIZE_DLC_FIXTURES with surfaceWidth:2, surfaceLength:30, targetPPFD:400
"Add lettuce plants in 4 rows" -> ADD_PLANTS_ARRAY with variety:'lettuce', rows:4
"Place a high wire tomato plant at 10,20" -> ADD_PLANT with variety:'high-wire', x:10, y:20
"Add hemp plants in flowering stage" -> ADD_PLANTS_ARRAY with variety:'hemp', growthStage:'flowering'

When users mention room dimensions like "20x20", "40x60", parse as width x length.
When users mention PPFD targets like "400 PPFD", "800 PPFD", use ADD_FIXTURES_ARRAY with targetPPFD.
When users say "build me" or "create", they typically want both room and fixtures.
Brand names like "siify", "signify", "philips" should be ignored for fixture selection - focus on the PPFD target.

Return a JSON object with an "actions" array containing the parsed actions.`;

  try {
    const openaiClient = getOpenAI();
    if (!openaiClient) {
      throw new Error('OpenAI client not available');
    }
    const response = await openaiClient.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: input }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.3,
    });

    const result = JSON.parse(response.choices[0].message.content || '{"actions": []}');
    return result.actions || [];
  } catch (error) {
    console.error('Error parsing natural language:', error);
    console.error('Full error:', error);
    return [];
  }
}

// Helper function to generate suggestions based on current state
function generateSuggestions(state: any): string[] {
  const suggestions: string[] = [];
  const fixtures = state.objects?.filter((o: any) => o.type === 'fixture') || [];
  const avgPPFD = state.calculations?.averagePPFD || 0;
  const uniformity = state.calculations?.uniformity || 0;

  // No room created yet
  if (!state.room) {
    suggestions.push("Start by creating a room. Try: 'Create a 20x40 room with 12 foot ceilings'");
    return suggestions;
  }

  // No fixtures yet
  if (fixtures.length === 0) {
    suggestions.push("Add fixtures to your room. Try: 'Add 4x8 grid of fixtures for 600 PPFD'");
    return suggestions;
  }

  // Low PPFD
  if (avgPPFD < state.room.targetPPFD * 0.8) {
    suggestions.push(`Current PPFD (${avgPPFD.toFixed(0)}) is below target. Try: 'Add more fixtures' or 'Increase dimming levels'`);
  }

  // Poor uniformity
  if (uniformity < 0.7) {
    suggestions.push("Uniformity is low. Try: 'Optimize layout for better uniformity'");
  }

  // No environmental equipment
  const hasHVAC = state.objects?.some((o: any) => o.type === 'equipment' && o.equipmentType === 'hvac');
  if (!hasHVAC && state.room.width * state.room.length > 200) {
    suggestions.push("Consider adding HVAC. Try: 'Add 2 ton AC unit'");
  }

  // Suggest benching for larger rooms
  const hasBenching = state.objects?.some((o: any) => o.type === 'bench' || o.type === 'rack');
  if (!hasBenching && state.room.width * state.room.length > 100) {
    suggestions.push("Add benching to organize your grow space. Try: 'Add 3 rows of rolling benches'");
  }

  return suggestions;
}

export async function POST(req: NextRequest) {
  try {
    // Check authentication
    const { userId } = getAuth(req);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check AI usage limits before processing
    const usageCheck = await checkAIUsageLimit(userId, 'ai_designer');
    if (!usageCheck.allowed) {
      return NextResponse.json({
        error: 'AI usage limit reached',
        message: `You've reached your ${usageCheck.limitType} limit of ${usageCheck.limit} AI designer requests.`,
        used: usageCheck.used,
        limit: usageCheck.limit,
        resetDate: usageCheck.resetDate,
        upgradeRequired: true
      }, { status: 429 });
    }

    const body = await req.json();
    const { message, currentState, mode = 'parse' } = body;

    // Mode: parse - Convert natural language to actions
    if (mode === 'parse') {
      const actions = await parseNaturalLanguageToActions(message, currentState);
      const suggestions = generateSuggestions(currentState);
      
      
      // Track AI usage for this request
      await trackAIUsage(userId, 'ai_designer', {
        feature: 'parse',
        message: message,
        actionsGenerated: actions.length,
        inputTokens: Math.ceil(message.length / 4), // Rough token estimate
        outputTokens: Math.ceil(JSON.stringify(actions).length / 4)
      });
      
      return NextResponse.json({
        success: true,
        actions,
        suggestions,
        message: `Found ${actions.length} action(s) to execute`
      });
    }

    // Mode: suggest - Generate contextual suggestions
    if (mode === 'suggest') {
      const suggestions = generateSuggestions(currentState);
      
      // Track usage for suggestion requests (lighter usage)
      await trackAIUsage(userId, 'ai_designer', {
        feature: 'suggest',
        suggestionsGenerated: suggestions.length,
        inputTokens: Math.ceil(JSON.stringify(currentState).length / 4),
        outputTokens: Math.ceil(JSON.stringify(suggestions).length / 4)
      });
      
      return NextResponse.json({
        success: true,
        suggestions
      });
    }

    // Mode: analyze - Analyze current design and provide feedback
    if (mode === 'analyze') {
      const analysis = await analyzeDesign(currentState);
      
      // Track usage for analysis requests (heavier usage)
      await trackAIUsage(userId, 'ai_designer', {
        feature: 'analyze',
        metricsAnalyzed: Object.keys(analysis.metrics || {}).length,
        recommendationsGenerated: analysis.recommendations?.length || 0,
        inputTokens: Math.ceil(JSON.stringify(currentState).length / 4),
        outputTokens: Math.ceil(JSON.stringify(analysis).length / 4)
      });
      
      return NextResponse.json({
        success: true,
        analysis
      });
    }

    // Mode: fact-check - Provide fact-based design recommendations
    if (mode === 'fact-check') {
      const { cropType, growthStage, targetMetrics, environmentalFactors } = body;
      
      const advisor = new FactBasedDesignAdvisor();
      const context = {
        cropType,
        growthStage,
        roomDimensions: {
          width: currentState.room?.width || 0,
          length: currentState.room?.length || 0,
          height: currentState.room?.height || 0
        },
        currentFixtures: currentState.objects?.filter((o: any) => o.type === 'fixture') || [],
        targetMetrics,
        environmentalFactors
      };

      const recommendations = await advisor.analyzeDesignWithFacts(context);
      
      // Track usage for fact-checking requests
      await trackAIUsage(userId, 'ai_designer', {
        feature: 'fact-check',
        cropType,
        recommendationsGenerated: recommendations.length,
        inputTokens: Math.ceil(JSON.stringify(context).length / 4),
        outputTokens: Math.ceil(JSON.stringify(recommendations).length / 4)
      });
      
      return NextResponse.json({
        success: true,
        recommendations,
        factBased: true
      });
    }

    return NextResponse.json({ 
      error: 'Invalid mode. Use parse, suggest, analyze, or fact-check' 
    }, { status: 400 });

  } catch (error) {
    console.error('AI Designer API error:', error);
    return NextResponse.json(
      { error: 'Failed to process AI request' },
      { status: 500 }
    );
  }
}

// Analyze current design and provide insights
async function analyzeDesign(state: any): Promise<any> {
  const fixtures = state.objects?.filter((o: any) => o.type === 'fixture') || [];
  const roomArea = state.room ? state.room.width * state.room.length : 0;
  const totalPower = fixtures.reduce((sum: number, f: any) => sum + (f.model?.wattage || 0) * (f.dimmingLevel || 100) / 100, 0);
  
  return {
    metrics: {
      fixtureCount: fixtures.length,
      totalPower,
      powerDensity: roomArea > 0 ? totalPower / roomArea : 0,
      averagePPFD: state.calculations?.averagePPFD || 0,
      uniformity: state.calculations?.uniformity || 0,
      coverage: calculateCoverage(state),
    },
    recommendations: [
      {
        category: 'efficiency',
        message: totalPower / roomArea > 30 ? 'Consider using more efficient fixtures' : 'Good power efficiency',
        priority: totalPower / roomArea > 30 ? 'high' : 'low'
      },
      {
        category: 'uniformity',
        message: state.calculations?.uniformity < 0.7 ? 'Improve light uniformity by adjusting fixture spacing' : 'Excellent uniformity',
        priority: state.calculations?.uniformity < 0.7 ? 'high' : 'low'
      }
    ],
    status: determineDesignStatus(state)
  };
}

function calculateCoverage(state: any): number {
  // Simple coverage calculation based on fixture footprint
  if (!state.room || !state.objects) return 0;
  
  const fixtures = state.objects.filter((o: any) => o.type === 'fixture');
  const roomArea = state.room.width * state.room.length;
  const fixtureArea = fixtures.length * 16; // Assume 4x4 ft coverage per fixture
  
  return Math.min(100, (fixtureArea / roomArea) * 100);
}

function determineDesignStatus(state: any): string {
  if (!state.room) return 'no-room';
  if (!state.objects || state.objects.length === 0) return 'empty';
  
  const fixtures = state.objects.filter((o: any) => o.type === 'fixture');
  if (fixtures.length === 0) return 'no-fixtures';
  
  const avgPPFD = state.calculations?.averagePPFD || 0;
  const targetPPFD = state.room.targetPPFD || 500;
  
  if (avgPPFD < targetPPFD * 0.8) return 'under-lit';
  if (avgPPFD > targetPPFD * 1.2) return 'over-lit';
  
  return 'optimal';
}