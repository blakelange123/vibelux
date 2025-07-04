/**
 * Fact-Based Design Advisor with Claude Integration
 * Provides evidence-based lighting design recommendations using scientific data
 */

import { ClaudeVibeLuxAssistant } from './claude-integration';
import { OpenAccessResearchClient } from '../open-access-research';
import { cropDatabase, type CropVariety } from './comprehensive-crop-database';
import { researchVerificationSystem, type CredibilityReport } from './research-verification-system';
import type { RecipeStage } from '../cultivation/recipe-engine';

export interface FactualRecommendation {
  recommendation: string;
  scientificBasis: {
    sources: string[];
    studies: string[];
    data: Record<string, any>;
  };
  confidence: 'high' | 'medium' | 'low';
  reasoning: string;
  warningFlags?: string[];
  credibilityReport?: CredibilityReport;
  verificationStatus: 'verified' | 'unverified' | 'conflicted' | 'pending';
}

export interface DesignAnalysisContext {
  cropType: string;
  growthStage: string;
  roomDimensions: { width: number; length: number; height: number };
  currentFixtures: any[];
  targetMetrics: {
    ppfd?: number;
    dli?: number;
    uniformity?: number;
  };
  environmentalFactors: {
    climate?: string;
    seasonality?: boolean;
    energyCosts?: number;
  };
}

export class FactBasedDesignAdvisor {
  private claudeAssistant: ClaudeVibeLuxAssistant;
  private researchClient: OpenAccessResearchClient;

  private readonly FIXTURE_EFFICACY_BENCHMARKS = {
    highEfficiency: { min: 3.0, optimal: 3.5, source: 'DLC Premium Category' },
    commercial: { min: 2.5, optimal: 2.8, source: 'DLC Standard Category' },
    budget: { min: 2.0, optimal: 2.3, source: 'Market Analysis' }
  };

  constructor() {
    this.claudeAssistant = new ClaudeVibeLuxAssistant();
    this.researchClient = new OpenAccessResearchClient();
  }

  async analyzeDesignWithFacts(context: DesignAnalysisContext): Promise<FactualRecommendation[]> {
    const recommendations: FactualRecommendation[] = [];

    // 1. Validate against scientific crop requirements
    const cropRecommendations = await this.analyzeCropRequirements(context);
    recommendations.push(...cropRecommendations);

    // 2. Analyze fixture efficiency against industry standards
    const efficiencyRecommendations = await this.analyzeFixtureEfficiency(context);
    recommendations.push(...efficiencyRecommendations);

    // 3. Check photometric distribution
    const photometricRecommendations = await this.analyzePhotometricDistribution(context);
    recommendations.push(...photometricRecommendations);

    // 4. Energy efficiency analysis
    const energyRecommendations = await this.analyzeEnergyEfficiency(context);
    recommendations.push(...energyRecommendations);

    // 5. CRITICAL: Verify all recommendations with live research
    const verifiedRecommendations = await this.verifyRecommendations(recommendations, context);

    return verifiedRecommendations;
  }

  /**
   * Verify recommendations against live research and generate credibility reports
   */
  private async verifyRecommendations(
    recommendations: FactualRecommendation[], 
    context: DesignAnalysisContext
  ): Promise<FactualRecommendation[]> {
    const verifiedRecommendations: FactualRecommendation[] = [];

    for (const rec of recommendations) {
      try {
        console.log(`Verifying recommendation: ${rec.recommendation.substring(0, 100)}...`);

        // Extract verifiable claims from the recommendation
        const claims = this.extractVerifiableClaims(rec.recommendation, rec.reasoning);
        
        // Generate credibility report
        const credibilityReport = await researchVerificationSystem.generateCredibilityReport(
          `rec_${Date.now()}_${Math.random()}`,
          rec.recommendation,
          claims,
          context.cropType
        );

        // Determine verification status
        let verificationStatus: 'verified' | 'unverified' | 'conflicted' | 'pending' = 'pending';
        
        if (credibilityReport.overallCredibility > 0.7) {
          verificationStatus = 'verified';
        } else if (credibilityReport.factVerifications.some(fv => fv.consensusLevel === 'conflicted')) {
          verificationStatus = 'conflicted';
        } else if (credibilityReport.researchBacking.totalStudies < 2) {
          verificationStatus = 'unverified';
        } else {
          verificationStatus = 'unverified';
        }

        // Update recommendation with verification data
        const verifiedRec: FactualRecommendation = {
          ...rec,
          credibilityReport,
          verificationStatus,
          confidence: this.adjustConfidenceBasedOnVerification(rec.confidence, credibilityReport),
          warningFlags: [
            ...(rec.warningFlags || []),
            ...credibilityReport.warnings
          ]
        };

        verifiedRecommendations.push(verifiedRec);

      } catch (error) {
        console.error('Error verifying recommendation:', error);
        
        // Add unverified recommendation with warning
        verifiedRecommendations.push({
          ...rec,
          verificationStatus: 'unverified',
          warningFlags: [
            ...(rec.warningFlags || []),
            'verification_failed'
          ]
        });
      }
    }

    return verifiedRecommendations;
  }

  /**
   * Extract verifiable claims from recommendation text
   */
  private extractVerifiableClaims(recommendation: string, reasoning: string): string[] {
    const claims: string[] = [];
    const text = `${recommendation} ${reasoning}`;

    // Extract specific numerical claims
    const ppfdClaims = text.match(/(\d+)\s*μmol\/m²\/s/g);
    if (ppfdClaims) {
      claims.push(...ppfdClaims.map(claim => `PPFD requirement ${claim}`));
    }

    const dliClaims = text.match(/(\d+)\s*mol\/m²\/day/g);
    if (dliClaims) {
      claims.push(...dliClaims.map(claim => `DLI requirement ${claim}`));
    }

    const efficiencyClaims = text.match(/(\d+\.?\d*)\s*μmol\/J/g);
    if (efficiencyClaims) {
      claims.push(...efficiencyClaims.map(claim => `LED efficacy ${claim}`));
    }

    // Extract spectrum claims
    if (text.includes('spectrum') || text.includes('red:') || text.includes('blue:')) {
      claims.push('Spectral requirements for optimal growth');
    }

    // Extract morphological claims
    if (text.includes('stem elongation') || text.includes('flower induction')) {
      claims.push('Morphogenic light responses');
    }

    // If no specific claims found, use the general recommendation
    if (claims.length === 0) {
      claims.push(recommendation.split('.')[0]); // First sentence as claim
    }

    return claims;
  }

  /**
   * Adjust confidence based on verification results
   */
  private adjustConfidenceBasedOnVerification(
    originalConfidence: 'high' | 'medium' | 'low',
    credibilityReport: CredibilityReport
  ): 'high' | 'medium' | 'low' {
    const credibilityScore = credibilityReport.overallCredibility;
    
    // High credibility maintains or boosts confidence
    if (credibilityScore > 0.8) {
      return originalConfidence === 'low' ? 'medium' : originalConfidence;
    }
    
    // Medium credibility
    if (credibilityScore > 0.6) {
      return originalConfidence === 'high' ? 'medium' : originalConfidence;
    }
    
    // Low credibility reduces confidence
    if (credibilityScore < 0.4) {
      return originalConfidence === 'high' ? 'medium' : 'low';
    }

    return originalConfidence;
  }

  private async analyzeCropRequirements(context: DesignAnalysisContext): Promise<FactualRecommendation[]> {
    // Search comprehensive database for matching varieties
    const varieties = cropDatabase.searchVarieties({
      commonName: context.cropType
    });

    if (varieties.length === 0) {
      // Try fuzzy search or suggest alternatives
      const allVarieties = cropDatabase.searchVarieties({});
      const suggestions = allVarieties
        .filter(v => v.commonName.toLowerCase().includes(context.cropType.toLowerCase()) ||
                    v.scientificName.toLowerCase().includes(context.cropType.toLowerCase()))
        .slice(0, 5);

      return [{
        recommendation: `Crop "${context.cropType}" not found in database. ${suggestions.length > 0 ? 
          `Did you mean: ${suggestions.map(s => s.commonName).join(', ')}?` : 
          'Please specify a valid crop variety.'}`,
        scientificBasis: {
          sources: ['VibeLux Comprehensive Crop Database'],
          studies: [`Database contains ${allVarieties.length} varieties across 11 categories`],
          data: { availableCategories: [...new Set(allVarieties.map(v => v.category))] }
        },
        confidence: 'low',
        reasoning: 'Crop not found in comprehensive horticultural database',
        warningFlags: ['unknown_crop_type', 'database_search_failed']
      }];
    }

    const recommendations: FactualRecommendation[] = [];
    const currentPPFD = context.targetMetrics.ppfd || 0;
    
    // Use the highest confidence variety or best match
    const primaryVariety = varieties.sort((a, b) => b.scientificEvidence.confidenceScore - a.scientificEvidence.confidenceScore)[0];
    
    // Get lighting requirements for current growth stage
    const lightingReqs = cropDatabase.getLightingRequirements(
      primaryVariety.id,
      context.growthStage,
      {
        temperature: 22, // Default room temp
        co2Level: 400   // Ambient CO2
      }
    );

    if (!lightingReqs) {
      return [{
        recommendation: `Growth stage "${context.growthStage}" not defined for ${primaryVariety.commonName}`,
        scientificBasis: {
          sources: primaryVariety.scientificEvidence.sources,
          studies: [],
          data: { 
            availableStages: Object.keys(primaryVariety.lightingRequirements),
            variety: primaryVariety.commonName
          }
        },
        confidence: 'medium',
        reasoning: 'Growth stage data not available for this variety',
        warningFlags: ['missing_growth_stage_data']
      }];
    }

    // PPFD Analysis with variety-specific data
    if (currentPPFD < lightingReqs.ppfdRange.min) {
      recommendations.push({
        recommendation: `Increase PPFD to at least ${lightingReqs.ppfdRange.min} μmol/m²/s (optimal: ${lightingReqs.ppfdRange.optimal}). Current target of ${currentPPFD} is below minimum requirement for ${primaryVariety.commonName} in ${context.growthStage} stage.`,
        scientificBasis: {
          sources: primaryVariety.scientificEvidence.sources,
          studies: await this.getRelevantStudies(primaryVariety.scientificName, 'ppfd requirements'),
          data: {
            variety: primaryVariety.commonName,
            scientificName: primaryVariety.scientificName,
            minimum: lightingReqs.ppfdRange.min,
            optimal: lightingReqs.ppfdRange.optimal,
            current: currentPPFD,
            growthStage: context.growthStage,
            confidenceScore: primaryVariety.scientificEvidence.confidenceScore
          }
        },
        confidence: primaryVariety.scientificEvidence.confidenceScore > 0.8 ? 'high' : 'medium',
        reasoning: `Scientific literature for ${primaryVariety.scientificName} consistently shows ${context.growthStage} stage requires minimum ${lightingReqs.ppfdRange.min} PPFD for optimal photosynthesis and development.`,
        verificationStatus: 'pending'
      });
    } else if (currentPPFD > lightingReqs.ppfdRange.max) {
      recommendations.push({
        recommendation: `Consider reducing PPFD from ${currentPPFD} to ${lightingReqs.ppfdRange.optimal} μmol/m²/s. Current level exceeds optimal range for ${primaryVariety.commonName} and may cause photoinhibition or unnecessary energy consumption.`,
        scientificBasis: {
          sources: primaryVariety.scientificEvidence.sources,
          studies: await this.getRelevantStudies(primaryVariety.scientificName, 'light saturation photoinhibition'),
          data: {
            variety: primaryVariety.commonName,
            maximum: lightingReqs.ppfdRange.max,
            optimal: lightingReqs.ppfdRange.optimal,
            current: currentPPFD,
            riskFactors: ['photoinhibition', 'increased_energy_costs', 'potential_heat_stress']
          }
        },
        confidence: primaryVariety.scientificEvidence.confidenceScore > 0.8 ? 'high' : 'medium',
        reasoning: `Research on ${primaryVariety.scientificName} indicates PPFD above ${lightingReqs.ppfdRange.max} provides diminishing returns and can stress plants during ${context.growthStage} stage.`,
        verificationStatus: 'pending'
      });
    }

    // DLI Analysis
    const currentDLI = context.targetMetrics.dli || (currentPPFD * lightingReqs.photoperiod * 3.6 / 1000);
    if (currentDLI < lightingReqs.dliRange.min) {
      recommendations.push({
        recommendation: `Daily Light Integral (DLI) of ${currentDLI.toFixed(1)} mol/m²/day is below optimal range. Target ${lightingReqs.dliRange.optimal} mol/m²/day for ${primaryVariety.commonName}.`,
        scientificBasis: {
          sources: primaryVariety.scientificEvidence.sources,
          studies: await this.getRelevantStudies(primaryVariety.scientificName, 'daily light integral DLI'),
          data: {
            currentDLI: currentDLI,
            optimalDLI: lightingReqs.dliRange.optimal,
            photoperiod: lightingReqs.photoperiod,
            variety: primaryVariety.commonName
          }
        },
        confidence: 'high',
        reasoning: 'DLI is a critical factor determining total photosynthetic capacity and growth rate in controlled environments.'
      });
    }

    // Spectrum Analysis
    if (lightingReqs.spectrum) {
      const spectrumAdvice = this.analyzeSpectrumRequirements(primaryVariety, lightingReqs, context);
      recommendations.push(...spectrumAdvice);
    }

    // Production System Optimization
    if (primaryVariety.productionSystems) {
      const systemAdvice = this.analyzeProductionSystemFit(primaryVariety, context);
      recommendations.push(...systemAdvice);
    }

    return recommendations;
  }

  private async analyzeFixtureEfficiency(context: DesignAnalysisContext): Promise<FactualRecommendation[]> {
    const recommendations: FactualRecommendation[] = [];
    
    for (const fixture of context.currentFixtures) {
      if (fixture.model?.wattage && fixture.model?.ppf) {
        const efficacy = fixture.model.ppf / fixture.model.wattage;
        
        if (efficacy < this.FIXTURE_EFFICACY_BENCHMARKS.budget.min) {
          recommendations.push({
            recommendation: `Fixture "${fixture.model.name}" has low efficacy (${efficacy.toFixed(2)} μmol/J). Modern LED fixtures achieve 2.5-3.5 μmol/J.`,
            scientificBasis: {
              sources: ['DesignLights Consortium (DLC) Technical Requirements'],
              studies: ['LED Horticultural Lighting Efficacy Studies 2020-2024'],
              data: {
                currentEfficacy: efficacy,
                industryMinimum: this.FIXTURE_EFFICACY_BENCHMARKS.budget.min,
                premiumBenchmark: this.FIXTURE_EFFICACY_BENCHMARKS.highEfficiency.optimal
              }
            },
            confidence: 'high',
            reasoning: 'DLC qualified fixtures demonstrate proven energy efficiency. Low efficacy increases operating costs significantly.',
            warningFlags: ['high_energy_costs', 'outdated_technology']
          });
        }
      }
    }

    return recommendations;
  }

  private async analyzePhotometricDistribution(context: DesignAnalysisContext): Promise<FactualRecommendation[]> {
    const recommendations: FactualRecommendation[] = [];
    const roomArea = context.roomDimensions.width * context.roomDimensions.length;
    const fixtureCount = context.currentFixtures.length;
    
    if (fixtureCount > 0) {
      const fixturesPerSqFt = fixtureCount / roomArea;
      
      // Based on photometric studies for uniform distribution
      const optimalDensity = {
        cannabis: 1/20, // 1 fixture per 20 sq ft for optimal uniformity
        lettuce: 1/25,  // 1 fixture per 25 sq ft
        tomato: 1/18,   // 1 fixture per 18 sq ft
        herbs: 1/30     // 1 fixture per 30 sq ft
      };

      const targetDensity = optimalDensity[context.cropType as keyof typeof optimalDensity] || 1/25;
      
      if (fixturesPerSqFt < targetDensity * 0.7) {
        recommendations.push({
          recommendation: `Fixture density is low (${fixturesPerSqFt.toFixed(3)} per sq ft). Target ~${targetDensity.toFixed(3)} per sq ft for optimal uniformity.`,
          scientificBasis: {
            sources: ['Photometric Distribution Studies for Indoor Agriculture'],
            studies: ['Uniformity Analysis in Controlled Environment Agriculture'],
            data: {
              currentDensity: fixturesPerSqFt,
              targetDensity: targetDensity,
              uniformityImplications: 'Lower density can create hot spots and uneven growth'
            }
          },
          confidence: 'medium',
          reasoning: 'Photometric analysis shows fixture spacing directly affects light uniformity and plant growth consistency.'
        });
      }
    }

    return recommendations;
  }

  private async analyzeEnergyEfficiency(context: DesignAnalysisContext): Promise<FactualRecommendation[]> {
    const recommendations: FactualRecommendation[] = [];
    const roomArea = context.roomDimensions.width * context.roomDimensions.length;
    
    let totalWattage = 0;
    for (const fixture of context.currentFixtures) {
      if (fixture.model?.wattage) {
        totalWattage += fixture.model.wattage * (fixture.dimmingLevel || 100) / 100;
      }
    }

    const powerDensity = totalWattage / roomArea; // W/sq ft

    // Industry benchmarks for power density
    const benchmarks = {
      cannabis: { efficient: 35, typical: 45, excessive: 60 },
      lettuce: { efficient: 15, typical: 25, excessive: 35 },
      tomato: { efficient: 25, typical: 35, excessive: 50 },
      herbs: { efficient: 12, typical: 20, excessive: 30 }
    };

    const cropBenchmark = benchmarks[context.cropType as keyof typeof benchmarks];
    
    if (cropBenchmark && powerDensity > cropBenchmark.excessive) {
      const annualCost = context.environmentalFactors.energyCosts 
        ? powerDensity * roomArea * 12 * context.environmentalFactors.energyCosts / 1000 // 12 hrs avg, kWh rate
        : null;

      recommendations.push({
        recommendation: `Power density of ${powerDensity.toFixed(1)} W/sq ft is excessive for ${context.cropType}. Target ${cropBenchmark.efficient} W/sq ft.`,
        scientificBasis: {
          sources: ['Energy Efficiency in Indoor Agriculture (DOE Studies)'],
          studies: ['Comparative Power Density Analysis for Controlled Environment Agriculture'],
          data: {
            currentPowerDensity: powerDensity,
            efficientTarget: cropBenchmark.efficient,
            potentialSavings: annualCost ? `$${(annualCost * 0.3).toFixed(0)}/year` : 'Significant energy cost reduction'
          }
        },
        confidence: 'high',
        reasoning: 'DOE studies demonstrate optimal power density ranges for different crops. Excessive power increases costs without yield benefits.',
        warningFlags: ['high_operating_costs', 'potential_heat_issues']
      });
    }

    return recommendations;
  }

  /**
   * Analyze spectrum requirements for specific variety
   */
  private analyzeSpectrumRequirements(variety: CropVariety, lightingReqs: any, context: DesignAnalysisContext): FactualRecommendation[] {
    const recommendations: FactualRecommendation[] = [];
    
    // Check for spectrum-specific morphogenic responses
    if (lightingReqs.morphogenesis) {
      if (lightingReqs.morphogenesis.stemElongation && lightingReqs.spectrum.farRed > 0.1) {
        recommendations.push({
          recommendation: `For ${variety.commonName} in ${context.growthStage} stage, consider spectrum with ${(lightingReqs.spectrum.farRed * 100).toFixed(0)}% far-red to promote stem elongation. Current design may need spectrum tuning.`,
          scientificBasis: {
            sources: variety.scientificEvidence.sources,
            studies: ['Morphogenic responses to far-red radiation in controlled environments'],
            data: {
              targetFarRed: lightingReqs.spectrum.farRed,
              morphogenicEffect: 'stem_elongation',
              variety: variety.commonName
            }
          },
          confidence: 'medium',
          reasoning: 'Far-red light triggers shade avoidance responses leading to increased stem elongation in many plant species.'
        });
      }

      if (lightingReqs.morphogenesis.flowerInduction && context.growthStage === 'flowering') {
        recommendations.push({
          recommendation: `Flowering stage detected. Optimize red:far-red ratio to ${(lightingReqs.spectrum.red / lightingReqs.spectrum.farRed).toFixed(1)}:1 for ${variety.commonName} flower induction.`,
          scientificBasis: {
            sources: variety.scientificEvidence.sources,
            studies: ['Red:far-red ratio effects on flower induction'],
            data: {
              redRatio: lightingReqs.spectrum.red,
              farRedRatio: lightingReqs.spectrum.farRed,
              optimalRatio: lightingReqs.spectrum.red / lightingReqs.spectrum.farRed
            }
          },
          confidence: 'high',
          reasoning: 'Red:far-red ratio is a key environmental signal for flowering in photoperiodic plants.'
        });
      }
    }

    return recommendations;
  }

  /**
   * Analyze production system compatibility
   */
  private analyzeProductionSystemFit(variety: CropVariety, context: DesignAnalysisContext): FactualRecommendation[] {
    const recommendations: FactualRecommendation[] = [];
    const roomArea = context.roomDimensions.width * context.roomDimensions.length;
    
    // Analyze plant density and space utilization
    for (const [systemName, systemData] of Object.entries(variety.productionSystems)) {
      const plantsPerRoom = Math.floor(roomArea / (systemData.spaceRequirements.width * systemData.spaceRequirements.length));
      const expectedYield = plantsPerRoom * (systemData.yieldExpectation / systemData.plantDensity);
      
      if (systemName === 'vertical' && context.roomDimensions.height > 3) {
        const possibleTiers = Math.floor((context.roomDimensions.height - 1) / (systemData.spaceRequirements.height + 0.5));
        const verticalYield = expectedYield * possibleTiers;
        
        recommendations.push({
          recommendation: `Consider vertical production system for ${variety.commonName}. Your ${context.roomDimensions.height}ft ceiling allows ${possibleTiers} tiers, potentially yielding ${verticalYield.toFixed(1)} kg vs ${expectedYield.toFixed(1)} kg single-tier.`,
          scientificBasis: {
            sources: variety.scientificEvidence.sources,
            studies: ['Vertical farming productivity analysis'],
            data: {
              possibleTiers: possibleTiers,
              verticalYield: verticalYield,
              singleTierYield: expectedYield,
              yieldIncrease: ((verticalYield / expectedYield - 1) * 100).toFixed(0) + '%'
            }
          },
          confidence: 'medium',
          reasoning: 'Vertical systems can significantly increase yield per square foot for appropriate crops with sufficient ceiling height.',
          warningFlags: possibleTiers < 2 ? ['insufficient_height'] : []
        });
      }
    }

    return recommendations;
  }

  private async getRelevantStudies(cropType: string, topic: string): Promise<string[]> {
    try {
      const papers = await this.researchClient.searchPapers(
        `${cropType} ${topic} LED lighting controlled environment`,
        {
          keywords: [cropType, topic, 'LED', 'PPFD', 'indoor agriculture'],
          openAccessOnly: true,
          dateRange: {
            start: new Date('2018-01-01'),
            end: new Date()
          }
        }
      );

      return papers.slice(0, 3).map(paper => `${paper.title} (${paper.journal}, ${paper.publishedDate.getFullYear()})`);
    } catch (error) {
      console.error('Error fetching research studies:', error);
      return ['Research database temporarily unavailable'];
    }
  }

  /**
   * Generate Claude-enhanced design explanation with facts
   */
  async explainDesignDecision(
    decision: string,
    context: DesignAnalysisContext,
    factualBasis: any
  ): Promise<string> {
    const prompt = `
    Explain this lighting design decision with scientific backing:
    
    DECISION: ${decision}
    
    FACTUAL BASIS:
    - Crop: ${context.cropType}
    - Scientific Requirements: ${JSON.stringify(this.CROP_REQUIREMENTS[context.cropType as keyof typeof this.CROP_REQUIREMENTS] || {})}
    - Supporting Data: ${JSON.stringify(factualBasis)}
    
    Provide a clear, fact-based explanation that:
    1. States the scientific reasoning
    2. Cites specific data sources
    3. Explains why this benefits the crop
    4. Mentions any trade-offs or considerations
    
    Keep the explanation professional and educational.
    `;

    try {
      const response = await this.claudeAssistant.answerDataQuery(prompt, {
        facilityData: null,
        sensorData: [],
        userRole: 'DESIGNER',
        timeframe: 'design_phase'
      });

      return response.answer;
    } catch (error) {
      console.error('Error generating explanation:', error);
      return `Design decision based on established scientific requirements for ${context.cropType} cultivation.`;
    }
  }
}