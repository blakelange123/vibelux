import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

interface OpenAIVisionResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

export async function POST(request: NextRequest) {
  try {
    const { isAuthenticated, userId } = await authenticateRequest(request);
    if (!isAuthenticated || !userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { photoId, photoUrl, facilityId, plantStage, roomZone, location } = body;

    if (!photoUrl || !facilityId) {
      return NextResponse.json(
        { error: 'photoUrl and facilityId are required' },
        { status: 400 }
      );
    }

    // Analyze photo using OpenAI Vision API
    const analysis = await analyzePhotoWithAI(photoUrl, plantStage, roomZone);

    // Save analysis to database
    await prisma.ipmPhotoAnalysis.create({
      data: {
        photoId,
        userId,
        facilityId,
        pestDetected: analysis.pestDetected,
        diseaseDetected: analysis.diseaseDetected,
        deficiencyDetected: analysis.deficiencyDetected,
        confidence: analysis.confidence,
        detectedIssues: analysis.detectedIssues,
        recommendations: analysis.recommendations,
        urgencyLevel: analysis.urgencyLevel,
        rawAnalysis: JSON.stringify(analysis),
        location: JSON.stringify(location),
        roomZone,
        plantStage
      }
    });

    return NextResponse.json(analysis);
  } catch (error) {
    console.error('Photo analysis error:', error);
    return NextResponse.json(
      { error: 'Failed to analyze photo' },
      { status: 500 }
    );
  }
}

async function analyzePhotoWithAI(photoUrl: string, plantStage: string, roomZone: string) {
  const openaiApiKey = process.env.OPENAI_API_KEY;
  
  if (!openaiApiKey) {
    throw new Error('OpenAI API key not configured');
  }

  const prompt = `You are an expert cannabis IPM (Integrated Pest Management) specialist. Analyze this photo of a cannabis plant in ${plantStage} stage located in ${roomZone}.

Look for:
1. PESTS: Spider mites, aphids, thrips, whiteflies, fungus gnats, caterpillars, leaf miners, scale insects, mealybugs
2. DISEASES: Powdery mildew, botrytis (bud rot), fusarium wilt, root rot, downy mildew, septoria leaf spot, anthracnose
3. DEFICIENCIES: Nitrogen, phosphorus, potassium, calcium, magnesium, iron deficiencies
4. ENVIRONMENTAL: Light burn, heat stress, nutrient burn, pH issues

For each issue found, provide:
- Type (pest/disease/deficiency/environmental)
- Name of the specific issue
- Confidence level (0.0-1.0)
- Severity (minor/moderate/severe/critical)
- Location on plant (leaves/stems/buds/roots/soil)
- Description of what you see
- Treatment options (2-3 specific recommendations)
- Spread risk (low/medium/high/critical)

Respond in JSON format:
{
  "pestDetected": boolean,
  "diseaseDetected": boolean,
  "deficiencyDetected": boolean,
  "confidence": number (0.0-1.0 overall confidence),
  "detectedIssues": [
    {
      "type": "pest|disease|deficiency|environmental",
      "name": "specific name",
      "confidence": number,
      "severity": "minor|moderate|severe|critical",
      "location": "leaves|stems|buds|roots|soil",
      "description": "detailed description",
      "treatmentOptions": ["option1", "option2", "option3"],
      "spreadRisk": "low|medium|high|critical"
    }
  ],
  "recommendations": ["general recommendation 1", "general recommendation 2"],
  "urgencyLevel": "low|medium|high|critical"
}

If no issues are detected, return empty arrays but still provide general plant health recommendations.`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4-vision-preview',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: prompt
              },
              {
                type: 'image_url',
                image_url: {
                  url: photoUrl,
                  detail: 'high'
                }
              }
            ]
          }
        ],
        max_tokens: 1500,
        temperature: 0.1 // Low temperature for consistent analysis
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data: OpenAIVisionResponse = await response.json();
    const analysisText = data.choices[0]?.message?.content;

    if (!analysisText) {
      throw new Error('No analysis content received from OpenAI');
    }

    // Parse JSON response from OpenAI
    let analysis;
    try {
      // Sometimes OpenAI returns JSON wrapped in markdown code blocks
      const jsonMatch = analysisText.match(/```json\n([\s\S]*?)\n```/) || analysisText.match(/```\n([\s\S]*?)\n```/);
      const jsonText = jsonMatch ? jsonMatch[1] : analysisText;
      analysis = JSON.parse(jsonText);
    } catch (parseError) {
      console.error('Failed to parse OpenAI JSON response:', analysisText);
      throw new Error('Invalid JSON response from AI analysis');
    }

    // Add timestamp
    analysis.analysisTimestamp = new Date();

    // Validate and clean the response
    analysis.confidence = Math.max(0, Math.min(1, analysis.confidence || 0));
    analysis.detectedIssues = analysis.detectedIssues || [];
    analysis.recommendations = analysis.recommendations || [];

    // Ensure urgency level is valid
    if (!['low', 'medium', 'high', 'critical'].includes(analysis.urgencyLevel)) {
      analysis.urgencyLevel = 'low';
    }

    return analysis;

  } catch (error) {
    console.error('OpenAI Vision API error:', error);
    
    // Fallback analysis if AI fails
    return {
      pestDetected: false,
      diseaseDetected: false,
      deficiencyDetected: false,
      confidence: 0.0,
      detectedIssues: [],
      recommendations: [
        'AI analysis temporarily unavailable - manual review recommended',
        'Continue monitoring plant health',
        'Consult with facility manager if concerns persist'
      ],
      urgencyLevel: 'low',
      analysisTimestamp: new Date(),
      error: 'AI analysis failed - manual review needed'
    };
  }
}