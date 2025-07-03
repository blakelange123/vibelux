import { NextRequest, NextResponse } from 'next/server';
import { createClaudeClient } from '@/lib/claude-config';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

// Track usage for billing purposes
interface UsageTracking {
  userId: string;
  timestamp: Date;
  tokensUsed: number;
  cost: number;
}

export async function POST(request: NextRequest) {
  try {
    // Initialize Claude client
    const claude = createClaudeClient();

    // Get user info from session/auth (implement based on your auth system)
    // const session = await getServerSession(authOptions);
    // const userId = session?.user?.id;

    const { sampleData, headers, context } = await request.json();

    // Validate input
    if (!sampleData || !headers || !Array.isArray(sampleData) || !Array.isArray(headers)) {
      return NextResponse.json(
        { error: 'Invalid input data' },
        { status: 400 }
      );
    }

    // Limit sample size to prevent token overflow
    const limitedSample = sampleData.slice(0, 20);

    const systemPrompt = `You are an expert in cannabis cultivation data analysis. You understand various cultivation management systems, sensor data formats, and industry-specific terminology. Your task is to interpret messy, real-world cultivation data and map it to a standardized schema.

Common cultivation data includes:
- Environmental: temperature, humidity, CO2, VPD, light intensity (PPFD/PAR)
- Irrigation: pH, EC/PPM/TDS, water temperature, runoff measurements
- Nutrients: NPK values, calcium, magnesium, micronutrients
- Yield: wet/dry weight, trim weight, waste
- Quality: THC, CBD, terpenes, moisture content
- Genetics: strain names, phenotypes, plant IDs
- Dates: harvest date, transplant date, flip date

You should identify:
1. What each column represents
2. The units being used (and if conversion is needed)
3. Data quality issues
4. Missing but important data
5. Unusual patterns or anomalies`;

    const userPrompt = `Please analyze this cultivation data and provide a detailed interpretation:

Headers: ${headers.join(', ')}

Sample data (first ${limitedSample.length} rows):
${JSON.stringify(limitedSample, null, 2)}

${context ? `Additional context: ${context}` : ''}

Please respond with a JSON object containing:
1. "mappings": Array of field mappings with sourceField, interpretedMeaning, suggested vibeluxField, dataType, unit, confidence (0-100), and any transformationNeeded
2. "dataQuality": Overall score (0-100) and array of issues found
3. "suggestions": Array of suggestions for improving data quality or additional data to collect
4. "warnings": Array of warnings about potential problems
5. "interpretedSchema": Your understanding of what this dataset represents`;

    const message = await claude.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 8192, // Increased to handle complex data interpretations
      temperature: 0.3,
      system: systemPrompt,
      messages: [
        { 
          role: "user", 
          content: userPrompt + "\n\nPlease respond with a properly formatted JSON object."
        }
      ]
    });

    const result = JSON.parse(message.content[0].type === 'text' ? message.content[0].text : '{}');

    // Track usage for billing with Claude's usage data
    const usage = message.usage;
    if (usage) {
      // Claude pricing: ~$3/1M input tokens, $15/1M output tokens
      const estimatedCost = (usage.input_tokens * 0.003 + usage.output_tokens * 0.015) / 1000;
      
      // Log usage for billing - moved to database save above
      
      // Save to database for billing
      const { userId } = await auth();
      if (userId) {
        await prisma.aiUsage.create({
          data: {
            userId,
            service: 'data_interpretation',
            tokensUsed: usage.input_tokens + usage.output_tokens,
            inputTokens: usage.input_tokens,
            outputTokens: usage.output_tokens,
            cost: estimatedCost,
            requestData: {
              headers: headers.length,
              sampleSize: limitedSample.length,
              context: context || 'none'
            }
          }
        });
      }
    }

    return NextResponse.json({
      ...result,
      // Don't expose cost to client in production
      _usage: process.env.NODE_ENV === 'development' ? usage : undefined
    });
  } catch (error) {
    console.error('AI interpretation error:', error);
    
    // Don't expose internal errors to client
    return NextResponse.json(
      { error: 'Failed to interpret data', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// Rate limiting could be added here using middleware or a rate limiting service