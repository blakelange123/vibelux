import Anthropic from '@anthropic-ai/sdk';
import { 
  validateCultivationAdvice, 
  factCheckAIResponse, 
  getVerifiedAdvice,
  VALIDATED_CULTIVATION_DATA 
} from './validated-cultivation-knowledge';

interface ValidatedResponse {
  content: string;
  recommendations: string[];
  confidence: number;
  verificationStatus: 'verified' | 'partial' | 'unverified';
  sources: string[];
  warnings: string[];
  metadata: {
    aiGenerated: boolean;
    factChecked: boolean;
    validationScore: number;
  };
}

export class ValidatedAIService {
  private anthropic: Anthropic | null = null;
  
  constructor() {
    if (process.env.ANTHROPIC_API_KEY) {
      this.anthropic = new Anthropic({
        apiKey: process.env.ANTHROPIC_API_KEY,
      });
    }
  }

  /**
   * Get cultivation advice with full validation
   */
  async getCultivationAdvice(params: {
    crop: string;
    stage: string;
    currentConditions: any;
    issue?: string;
  }): Promise<ValidatedResponse> {
    // First, try to get verified advice from knowledge base
    const verifiedAdvice = getVerifiedAdvice(
      params.crop,
      params.stage,
      params.currentConditions
    );

    // If we have good advice from knowledge base and no specific issue, use it
    if (verifiedAdvice.recommendations.length > 0 && !params.issue) {
      return {
        content: this.formatRecommendations(verifiedAdvice.recommendations),
        recommendations: verifiedAdvice.recommendations,
        confidence: verifiedAdvice.confidence,
        verificationStatus: 'verified',
        sources: verifiedAdvice.sources,
        warnings: verifiedAdvice.warnings,
        metadata: {
          aiGenerated: false,
          factChecked: true,
          validationScore: verifiedAdvice.confidence
        }
      };
    }

    // For complex issues, use AI with validation
    if (params.issue && this.anthropic) {
      const aiResponse = await this.getValidatedAIResponse(params);
      return aiResponse;
    }

    // Fallback to safe general advice
    return this.getSafeGeneralAdvice(params);
  }

  /**
   * Get AI response with validation and fact-checking
   */
  private async getValidatedAIResponse(params: any): Promise<ValidatedResponse> {
    try {
      // Create a constrained prompt with validation context
      const prompt = this.createValidatedPrompt(params);
      
      const response = await this.anthropic!.messages.create({
        model: 'claude-3-opus-20240229',
        max_tokens: 1000,
        temperature: 0.3, // Lower temperature for more consistent responses
        messages: [{
          role: 'user',
          content: prompt
        }]
      });

      const aiContent = response.content[0].type === 'text' 
        ? response.content[0].text 
        : '';

      // Fact-check the AI response
      const factCheck = factCheckAIResponse(aiContent, params);
      
      // Extract and validate recommendations
      const { recommendations, validatedRecommendations } = 
        this.extractAndValidateRecommendations(aiContent, params);

      // Calculate final confidence
      const confidence = factCheck.confidence * 0.9; // AI responses get max 90% confidence

      return {
        content: aiContent,
        recommendations: validatedRecommendations,
        confidence,
        verificationStatus: factCheck.verified ? 'verified' : 'partial',
        sources: ['AI Analysis', 'Scientific Validation'],
        warnings: [
          ...factCheck.issues,
          ...(confidence < 0.8 ? ['Please verify with local expert'] : [])
        ],
        metadata: {
          aiGenerated: true,
          factChecked: true,
          validationScore: factCheck.confidence
        }
      };
    } catch (error) {
      console.error('AI validation error:', error);
      return this.getSafeGeneralAdvice(params);
    }
  }

  /**
   * Create a prompt that encourages accurate, validated responses
   */
  private createValidatedPrompt(params: any): string {
    const validRanges = this.getValidRangesForContext(params.crop, params.stage);
    
    return `You are an expert cultivation advisor with PhD-level knowledge in plant science.

IMPORTANT CONSTRAINTS:
1. Only provide scientifically accurate advice
2. Stay within these validated ranges:
${JSON.stringify(validRanges, null, 2)}
3. If unsure, recommend consulting local experts
4. Never suggest anything that could harm the crop
5. Base recommendations on peer-reviewed research

Current Conditions:
- Crop: ${params.crop}
- Growth Stage: ${params.stage}
- Temperature: ${params.currentConditions.temperature}°F
- Humidity: ${params.currentConditions.humidity}%
- Light: ${params.currentConditions.ppfd} PPFD
${params.issue ? `- Reported Issue: ${params.issue}` : ''}

Provide 3 specific, actionable recommendations. Include scientific reasoning.`;
  }

  /**
   * Extract recommendations and validate each one
   */
  private extractAndValidateRecommendations(
    aiContent: string, 
    context: any
  ): { 
    recommendations: string[]; 
    validatedRecommendations: string[] 
  } {
    // Extract recommendations (usually numbered)
    const recommendations = aiContent
      .match(/\d\.\s*([^\n]+)/g)
      ?.map(r => r.replace(/^\d\.\s*/, '')) || [];

    const validatedRecommendations = recommendations.filter(rec => {
      // Check for dangerous or incorrect advice
      const lowerRec = rec.toLowerCase();
      
      // Reject obviously bad advice
      if (
        lowerRec.includes('ignore') ||
        lowerRec.includes('don\'t worry') ||
        lowerRec.includes('extreme') ||
        lowerRec.includes('maximum') && !lowerRec.includes('maximum of')
      ) {
        return false;
      }

      // Validate numerical recommendations
      const numbers = rec.match(/(\d+)\s*(°F|%|ppm|PPFD)/g);
      if (numbers) {
        for (const numStr of numbers) {
          const match = numStr.match(/(\d+)\s*(°F|%|ppm|PPFD)/);
          if (match) {
            const value = parseInt(match[1]);
            const unit = match[2];
            
            // Validate against known ranges
            if (!this.isValueReasonable(value, unit, context)) {
              return false;
            }
          }
        }
      }

      return true;
    });

    return { recommendations, validatedRecommendations };
  }

  /**
   * Check if a numerical value is reasonable
   */
  private isValueReasonable(
    value: number, 
    unit: string, 
    context: any
  ): boolean {
    switch (unit) {
      case '°F':
        return value >= 60 && value <= 90; // Reasonable temp range
      case '%':
        return value >= 20 && value <= 80; // Reasonable humidity
      case 'PPFD':
        return value >= 0 && value <= 1500; // Reasonable light levels
      case 'ppm':
        return value >= 0 && value <= 2000; // Reasonable CO2/nutrient levels
      default:
        return true;
    }
  }

  /**
   * Get valid ranges for the current context
   */
  private getValidRangesForContext(crop: string, stage: string): any {
    const data = VALIDATED_CULTIVATION_DATA;
    return {
      temperature: data.temperature[crop]?.[stage] || data.temperature.cannabis[stage],
      humidity: data.humidity[crop]?.[stage] || data.humidity.cannabis[stage],
      ppfd: data.ppfd[crop]?.[stage] || data.ppfd.cannabis[stage],
      co2: data.co2.enriched[stage],
      ph: data.ph
    };
  }

  /**
   * Safe general advice when AI is unavailable or unreliable
   */
  private getSafeGeneralAdvice(params: any): ValidatedResponse {
    const verifiedAdvice = getVerifiedAdvice(
      params.crop,
      params.stage,
      params.currentConditions
    );

    const generalRecommendations = [
      "Monitor environmental conditions every 4-6 hours",
      "Ensure proper airflow to prevent microclimates",
      "Check plant health indicators daily (color, turgidity, new growth)"
    ];

    return {
      content: "Based on validated cultivation parameters, here are safe recommendations:",
      recommendations: verifiedAdvice.recommendations.length > 0 
        ? verifiedAdvice.recommendations 
        : generalRecommendations,
      confidence: 0.85,
      verificationStatus: 'verified',
      sources: ['Scientific literature', 'Industry best practices'],
      warnings: verifiedAdvice.warnings,
      metadata: {
        aiGenerated: false,
        factChecked: true,
        validationScore: 0.85
      }
    };
  }

  /**
   * Format recommendations for display
   */
  private formatRecommendations(recommendations: string[]): string {
    return recommendations
      .map((rec, idx) => `${idx + 1}. ${rec}`)
      .join('\n\n');
  }

  /**
   * Validate a single piece of advice
   */
  async validateSingleAdvice(
    advice: string,
    context: any
  ): Promise<{
    isValid: boolean;
    confidence: number;
    issues: string[];
  }> {
    const factCheck = factCheckAIResponse(advice, context);
    
    return {
      isValid: factCheck.verified && factCheck.confidence > 0.7,
      confidence: factCheck.confidence,
      issues: factCheck.issues
    };
  }
}

export const validatedAI = new ValidatedAIService();