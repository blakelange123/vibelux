/**
 * Claude-powered ML Model Advisor
 * Provides intelligent recommendations for model selection, interpretation, and optimization
 */

export interface ModelMetrics {
  accuracy: number;
  loss: number;
  rmse?: number;
  mae?: number;
  r2Score?: number;
  precision?: number;
  recall?: number;
  f1Score?: number;
  trainingTime: number;
  epochs: number;
}

export interface ModelConfiguration {
  modelType: 'linear' | 'random_forest' | 'neural_network' | 'lstm' | 'cnn';
  hyperparameters: Record<string, any>;
  featureCount: number;
  targetVariable: string;
  datasetSize: number;
  trainingMetrics: ModelMetrics;
}

export interface MLRecommendation {
  recommendation: string;
  reasoning: string;
  confidence: number;
  expectedImprovement: string;
  implementationSteps: string[];
  potentialRisks: string[];
  alternativeApproaches: string[];
}

export interface ModelInterpretation {
  overallPerformance: string;
  strengthsAndWeaknesses: {
    strengths: string[];
    weaknesses: string[];
  };
  featureImportanceInsights: string[];
  predictionReliability: string;
  useCaseRecommendations: string[];
  improvementSuggestions: string[];
}

export class ClaudeMLAdvisor {
  private apiEndpoint: string;

  constructor(apiEndpoint: string = '/api/ai-assistant/command') {
    this.apiEndpoint = apiEndpoint;
  }

  public async recommendModelArchitecture(
    dataCharacteristics: {
      dataType: 'time_series' | 'tabular' | 'image' | 'mixed';
      targetType: 'regression' | 'classification' | 'multiclass';
      datasetSize: number;
      featureCount: number;
      temporalPatterns: boolean;
      noiseLevel: 'low' | 'medium' | 'high';
      computeConstraints: string;
    },
    cultivationGoals: string[]
  ): Promise<MLRecommendation> {
    try {
      const prompt = this.buildArchitectureRecommendationPrompt(dataCharacteristics, cultivationGoals);
      
      const response = await fetch(this.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          context: 'ml_architecture_recommendation',
          maxTokens: 600
        }),
      });

      if (!response.ok) {
        throw new Error(`Claude API request failed: ${response.statusText}`);
      }

      const data = await response.json();
      return this.parseMLRecommendation(data.response);
      
    } catch (error) {
      console.error('Error getting architecture recommendation from Claude:', error);
      return this.getFallbackArchitectureRecommendation(dataCharacteristics);
    }
  }

  public async interpretModelPerformance(
    modelConfig: ModelConfiguration,
    validationResults: {
      crossValidationScores: number[];
      confusionMatrix?: number[][];
      learningCurves: Array<{ epoch: number; trainLoss: number; valLoss: number }>;
      featureImportance?: Array<{ feature: string; importance: number }>;
    }
  ): Promise<ModelInterpretation> {
    try {
      const prompt = this.buildPerformanceInterpretationPrompt(modelConfig, validationResults);
      
      const response = await fetch(this.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          context: 'ml_performance_interpretation',
          maxTokens: 800
        }),
      });

      if (!response.ok) {
        throw new Error(`Claude API request failed: ${response.statusText}`);
      }

      const data = await response.json();
      return this.parseModelInterpretation(data.response);
      
    } catch (error) {
      console.error('Error interpreting model performance with Claude:', error);
      return this.getFallbackModelInterpretation(modelConfig);
    }
  }

  public async optimizeHyperparameters(
    modelConfig: ModelConfiguration,
    performanceHistory: Array<{
      hyperparameters: Record<string, any>;
      metrics: ModelMetrics;
    }>,
    optimizationGoal: 'accuracy' | 'speed' | 'interpretability' | 'generalization'
  ): Promise<{
    recommendations: Array<{
      parameter: string;
      currentValue: any;
      suggestedValue: any;
      reasoning: string;
      priority: 'high' | 'medium' | 'low';
    }>;
    optimizationStrategy: string;
    expectedOutcome: string;
    experimentPlan: string[];
  }> {
    try {
      const prompt = this.buildHyperparameterOptimizationPrompt(
        modelConfig, 
        performanceHistory, 
        optimizationGoal
      );
      
      const response = await fetch(this.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          context: 'hyperparameter_optimization',
          maxTokens: 800
        }),
      });

      if (!response.ok) {
        throw new Error(`Claude API request failed: ${response.statusText}`);
      }

      const data = await response.json();
      return this.parseHyperparameterRecommendations(data.response);
      
    } catch (error) {
      console.error('Error optimizing hyperparameters with Claude:', error);
      return this.getFallbackHyperparameterRecommendations(modelConfig);
    }
  }

  public async diagnoseModelIssues(
    modelConfig: ModelConfiguration,
    symptoms: {
      overfitting?: boolean;
      underfitting?: boolean;
      slowConvergence?: boolean;
      unstableTraining?: boolean;
      poorGeneralization?: boolean;
      biasedPredictions?: boolean;
    },
    trainingLogs: string[]
  ): Promise<{
    diagnosis: string;
    rootCauses: string[];
    solutions: Array<{
      solution: string;
      difficulty: 'easy' | 'medium' | 'hard';
      expectedImpact: 'low' | 'medium' | 'high';
      implementation: string[];
    }>;
    preventionTips: string[];
  }> {
    try {
      const prompt = this.buildDiagnosisPrompt(modelConfig, symptoms, trainingLogs);
      
      const response = await fetch(this.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          context: 'model_diagnosis',
          maxTokens: 700
        }),
      });

      if (!response.ok) {
        throw new Error(`Claude API request failed: ${response.statusText}`);
      }

      const data = await response.json();
      return this.parseModelDiagnosis(data.response);
      
    } catch (error) {
      console.error('Error diagnosing model issues with Claude:', error);
      return this.getFallbackModelDiagnosis(symptoms);
    }
  }

  private buildArchitectureRecommendationPrompt(
    dataCharacteristics: any,
    cultivationGoals: string[]
  ): string {
    return `As a machine learning expert specializing in agricultural applications, recommend the optimal model architecture:

DATA CHARACTERISTICS:
- Data Type: ${dataCharacteristics.dataType}
- Target Type: ${dataCharacteristics.targetType}
- Dataset Size: ${dataCharacteristics.datasetSize} samples
- Feature Count: ${dataCharacteristics.featureCount}
- Temporal Patterns: ${dataCharacteristics.temporalPatterns ? 'Yes' : 'No'}
- Noise Level: ${dataCharacteristics.noiseLevel}
- Compute Constraints: ${dataCharacteristics.computeConstraints}

CULTIVATION GOALS:
${cultivationGoals.join('\n')}

Please provide:
1. RECOMMENDATION: Best model architecture for this use case
2. REASONING: Why this architecture is optimal
3. CONFIDENCE: How confident are you (0-100%)
4. IMPROVEMENT: Expected performance improvement
5. IMPLEMENTATION: Step-by-step implementation guide
6. RISKS: Potential risks and mitigation strategies
7. ALTERNATIVES: Alternative approaches to consider

Focus on practical cultivation applications and real-world constraints.`;
  }

  private buildPerformanceInterpretationPrompt(
    modelConfig: ModelConfiguration,
    validationResults: any
  ): string {
    const metricsString = Object.entries(modelConfig.trainingMetrics)
      .map(([key, value]) => `${key}: ${value}`)
      .join(', ');

    const cvScores = validationResults.crossValidationScores
      .map(score => score.toFixed(3))
      .join(', ');

    const featureImportanceString = validationResults.featureImportance
      ? validationResults.featureImportance
          .sort((a, b) => b.importance - a.importance)
          .slice(0, 10)
          .map(f => `${f.feature}: ${f.importance.toFixed(3)}`)
          .join(', ')
      : 'Not available';

    return `As a machine learning expert, interpret this model's performance:

MODEL CONFIGURATION:
- Type: ${modelConfig.modelType}
- Target: ${modelConfig.targetVariable}
- Features: ${modelConfig.featureCount}
- Dataset Size: ${modelConfig.datasetSize}

TRAINING METRICS:
${metricsString}

VALIDATION RESULTS:
- Cross-validation scores: ${cvScores}
- CV mean: ${(validationResults.crossValidationScores.reduce((a, b) => a + b) / validationResults.crossValidationScores.length).toFixed(3)}
- CV std: ${this.calculateStandardDeviation(validationResults.crossValidationScores).toFixed(3)}

TOP FEATURES:
${featureImportanceString}

Please provide:
1. PERFORMANCE: Overall performance assessment
2. STRENGTHS: Model strengths
3. WEAKNESSES: Model weaknesses and limitations
4. FEATURE_INSIGHTS: Key insights from feature importance
5. RELIABILITY: Prediction reliability assessment
6. USE_CASES: Recommended use cases for this model
7. IMPROVEMENTS: Specific improvement suggestions

Focus on practical implications for cultivation decisions.`;
  }

  private buildHyperparameterOptimizationPrompt(
    modelConfig: ModelConfiguration,
    performanceHistory: any[],
    optimizationGoal: string
  ): string {
    const historyString = performanceHistory
      .slice(-5) // Last 5 experiments
      .map((exp, i) => {
        const params = Object.entries(exp.hyperparameters)
          .map(([k, v]) => `${k}: ${v}`)
          .join(', ');
        return `Experiment ${i + 1}: ${params} → Accuracy: ${exp.metrics.accuracy?.toFixed(3) || 'N/A'}`;
      })
      .join('\n');

    const currentParams = Object.entries(modelConfig.hyperparameters)
      .map(([k, v]) => `${k}: ${v}`)
      .join(', ');

    return `As a machine learning optimization expert, recommend hyperparameter improvements:

CURRENT MODEL:
- Type: ${modelConfig.modelType}
- Current Parameters: ${currentParams}
- Current Performance: ${Object.entries(modelConfig.trainingMetrics).map(([k, v]) => `${k}: ${v}`).join(', ')}

OPTIMIZATION GOAL: ${optimizationGoal}

PERFORMANCE HISTORY:
${historyString}

Please provide:
1. RECOMMENDATIONS: Specific parameter changes with reasoning
2. STRATEGY: Overall optimization strategy
3. EXPECTED_OUTCOME: Expected performance improvement
4. EXPERIMENT_PLAN: Systematic approach to test changes

Format recommendations as: parameter_name: current_value → suggested_value (reasoning, priority)`;
  }

  private buildDiagnosisPrompt(
    modelConfig: ModelConfiguration,
    symptoms: any,
    trainingLogs: string[]
  ): string {
    const symptomsList = Object.entries(symptoms)
      .filter(([_, value]) => value)
      .map(([key, _]) => key)
      .join(', ');

    const recentLogs = trainingLogs.slice(-10).join('\n');

    return `As a machine learning diagnostician, analyze these model issues:

MODEL: ${modelConfig.modelType} (${modelConfig.featureCount} features, ${modelConfig.datasetSize} samples)

SYMPTOMS: ${symptomsList}

TRAINING METRICS: ${Object.entries(modelConfig.trainingMetrics).map(([k, v]) => `${k}: ${v}`).join(', ')}

RECENT TRAINING LOGS:
${recentLogs}

Please provide:
1. DIAGNOSIS: Primary diagnosis of the issue
2. ROOT_CAUSES: Likely root causes
3. SOLUTIONS: Specific solutions with difficulty and impact ratings
4. PREVENTION: Tips to prevent similar issues

Focus on actionable solutions that can be implemented quickly.`;
  }

  private parseMLRecommendation(response: string): MLRecommendation {
    try {
      const sections = this.extractSections(response);
      
      const confidenceMatch = (sections.CONFIDENCE || '75').match(/\d+/);
      const confidence = confidenceMatch ? parseInt(confidenceMatch[0]) / 100 : 0.75;

      return {
        recommendation: sections.RECOMMENDATION || 'Model architecture recommendation not available',
        reasoning: sections.REASONING || 'Reasoning not provided',
        confidence,
        expectedImprovement: sections.IMPROVEMENT || 'Performance improvement expected',
        implementationSteps: this.parseListSection(sections.IMPLEMENTATION || ''),
        potentialRisks: this.parseListSection(sections.RISKS || ''),
        alternativeApproaches: this.parseListSection(sections.ALTERNATIVES || '')
      };
    } catch (error) {
      console.error('Error parsing ML recommendation:', error);
      return this.getFallbackMLRecommendation();
    }
  }

  private parseModelInterpretation(response: string): ModelInterpretation {
    try {
      const sections = this.extractSections(response);
      
      return {
        overallPerformance: sections.PERFORMANCE || 'Performance assessment not available',
        strengthsAndWeaknesses: {
          strengths: this.parseListSection(sections.STRENGTHS || ''),
          weaknesses: this.parseListSection(sections.WEAKNESSES || '')
        },
        featureImportanceInsights: this.parseListSection(sections.FEATURE_INSIGHTS || ''),
        predictionReliability: sections.RELIABILITY || 'Reliability assessment not available',
        useCaseRecommendations: this.parseListSection(sections.USE_CASES || ''),
        improvementSuggestions: this.parseListSection(sections.IMPROVEMENTS || '')
      };
    } catch (error) {
      console.error('Error parsing model interpretation:', error);
      return this.getFallbackModelInterpretation();
    }
  }

  private parseHyperparameterRecommendations(response: string): {
    recommendations: Array<{
      parameter: string;
      currentValue: any;
      suggestedValue: any;
      reasoning: string;
      priority: 'high' | 'medium' | 'low';
    }>;
    optimizationStrategy: string;
    expectedOutcome: string;
    experimentPlan: string[];
  } {
    try {
      const sections = this.extractSections(response);
      
      // Parse recommendations from the recommendations section
      const recommendations = this.parseParameterRecommendations(sections.RECOMMENDATIONS || '');
      
      return {
        recommendations,
        optimizationStrategy: sections.STRATEGY || 'Systematic parameter optimization',
        expectedOutcome: sections.EXPECTED_OUTCOME || 'Improved model performance expected',
        experimentPlan: this.parseListSection(sections.EXPERIMENT_PLAN || '')
      };
    } catch (error) {
      console.error('Error parsing hyperparameter recommendations:', error);
      return this.getFallbackHyperparameterRecommendations();
    }
  }

  private parseModelDiagnosis(response: string): {
    diagnosis: string;
    rootCauses: string[];
    solutions: Array<{
      solution: string;
      difficulty: 'easy' | 'medium' | 'hard';
      expectedImpact: 'low' | 'medium' | 'high';
      implementation: string[];
    }>;
    preventionTips: string[];
  } {
    try {
      const sections = this.extractSections(response);
      
      return {
        diagnosis: sections.DIAGNOSIS || 'Model diagnosis not available',
        rootCauses: this.parseListSection(sections.ROOT_CAUSES || ''),
        solutions: this.parseSolutions(sections.SOLUTIONS || ''),
        preventionTips: this.parseListSection(sections.PREVENTION || '')
      };
    } catch (error) {
      console.error('Error parsing model diagnosis:', error);
      return this.getFallbackModelDiagnosis();
    }
  }

  private parseParameterRecommendations(text: string): Array<{
    parameter: string;
    currentValue: any;
    suggestedValue: any;
    reasoning: string;
    priority: 'high' | 'medium' | 'low';
  }> {
    const recommendations: any[] = [];
    const lines = text.split('\n');
    
    lines.forEach(line => {
      // Look for pattern: parameter: current → suggested (reasoning, priority)
      const match = line.match(/(\w+):\s*(.+?)\s*→\s*(.+?)\s*\((.+?),\s*(high|medium|low)\)/i);
      if (match) {
        recommendations.push({
          parameter: match[1],
          currentValue: match[2].trim(),
          suggestedValue: match[3].trim(),
          reasoning: match[4].trim(),
          priority: match[5].toLowerCase() as 'high' | 'medium' | 'low'
        });
      }
    });

    return recommendations.length > 0 ? recommendations : [{
      parameter: 'learning_rate',
      currentValue: 'current',
      suggestedValue: 'optimized',
      reasoning: 'Systematic optimization recommended',
      priority: 'medium' as const
    }];
  }

  private parseSolutions(text: string): Array<{
    solution: string;
    difficulty: 'easy' | 'medium' | 'hard';
    expectedImpact: 'low' | 'medium' | 'high';
    implementation: string[];
  }> {
    // Simplified solution parsing - in practice would be more sophisticated
    const solutions = this.parseListSection(text);
    
    return solutions.map(solution => ({
      solution,
      difficulty: 'medium' as const,
      expectedImpact: 'medium' as const,
      implementation: ['Review documentation', 'Implement changes', 'Test results']
    }));
  }

  private extractSections(text: string): Record<string, string> {
    const sections: Record<string, string> = {};
    const lines = text.split('\n');
    let currentSection = '';
    let currentContent = '';

    for (const line of lines) {
      const sectionMatch = line.match(/^\d*\.?\s*(RECOMMENDATION|REASONING|CONFIDENCE|IMPROVEMENT|IMPLEMENTATION|RISKS|ALTERNATIVES|PERFORMANCE|STRENGTHS|WEAKNESSES|FEATURE_INSIGHTS|RELIABILITY|USE_CASES|IMPROVEMENTS|RECOMMENDATIONS|STRATEGY|EXPECTED_OUTCOME|EXPERIMENT_PLAN|DIAGNOSIS|ROOT_CAUSES|SOLUTIONS|PREVENTION)[:.]?\s*(.*)/i);
      
      if (sectionMatch) {
        if (currentSection) {
          sections[currentSection] = currentContent.trim();
        }
        currentSection = sectionMatch[1].toUpperCase();
        currentContent = sectionMatch[2] || '';
      } else if (currentSection) {
        currentContent += ' ' + line;
      }
    }
    
    if (currentSection) {
      sections[currentSection] = currentContent.trim();
    }

    return sections;
  }

  private parseListSection(text: string): string[] {
    if (!text) return [];
    
    return text
      .split(/[\n\r]/)
      .map(line => line.replace(/^[-•*\d.]\s*/, '').trim())
      .filter(line => line.length > 0)
      .slice(0, 8);
  }

  private calculateStandardDeviation(values: number[]): number {
    const mean = values.reduce((a, b) => a + b) / values.length;
    const variance = values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length;
    return Math.sqrt(variance);
  }

  // Fallback methods for when Claude API is unavailable
  private getFallbackArchitectureRecommendation(dataCharacteristics: any): MLRecommendation {
    return {
      recommendation: `For ${dataCharacteristics.dataType} data with ${dataCharacteristics.targetType} target, consider a neural network architecture`,
      reasoning: 'Neural networks provide good flexibility for complex agricultural patterns',
      confidence: 0.6,
      expectedImprovement: 'Moderate improvement expected with proper tuning',
      implementationSteps: ['Set up neural network layers', 'Configure input/output dimensions', 'Train with validation'],
      potentialRisks: ['Overfitting with small datasets', 'Longer training times'],
      alternativeApproaches: ['Random Forest for interpretability', 'Linear models for simplicity']
    };
  }

  private getFallbackModelInterpretation(modelConfig?: ModelConfiguration): ModelInterpretation {
    return {
      overallPerformance: 'Model shows reasonable performance for the given task',
      strengthsAndWeaknesses: {
        strengths: ['Captures non-linear patterns', 'Good generalization capability'],
        weaknesses: ['May require more data', 'Limited interpretability']
      },
      featureImportanceInsights: ['Environmental features show high importance', 'Temporal patterns are significant'],
      predictionReliability: 'Predictions are moderately reliable within training domain',
      useCaseRecommendations: ['Production forecasting', 'Quality prediction', 'Optimization guidance'],
      improvementSuggestions: ['Collect more diverse data', 'Feature engineering', 'Hyperparameter tuning']
    };
  }

  private getFallbackHyperparameterRecommendations(modelConfig?: ModelConfiguration): {
    recommendations: Array<{
      parameter: string;
      currentValue: any;
      suggestedValue: any;
      reasoning: string;
      priority: 'high' | 'medium' | 'low';
    }>;
    optimizationStrategy: string;
    expectedOutcome: string;
    experimentPlan: string[];
  } {
    return {
      recommendations: [
        {
          parameter: 'learning_rate',
          currentValue: 'current',
          suggestedValue: 'lower',
          reasoning: 'More stable convergence',
          priority: 'high'
        }
      ],
      optimizationStrategy: 'Systematic grid search with cross-validation',
      expectedOutcome: 'Improved model performance and stability',
      experimentPlan: ['Test learning rate variations', 'Adjust batch size', 'Validate improvements']
    };
  }

  private getFallbackModelDiagnosis(symptoms?: any): {
    diagnosis: string;
    rootCauses: string[];
    solutions: Array<{
      solution: string;
      difficulty: 'easy' | 'medium' | 'hard';
      expectedImpact: 'low' | 'medium' | 'high';
      implementation: string[];
    }>;
    preventionTips: string[];
  } {
    return {
      diagnosis: 'Model shows training instability requiring optimization',
      rootCauses: ['Inappropriate hyperparameters', 'Insufficient regularization', 'Data quality issues'],
      solutions: [
        {
          solution: 'Adjust learning rate and regularization',
          difficulty: 'easy',
          expectedImpact: 'medium',
          implementation: ['Reduce learning rate', 'Add regularization', 'Monitor training']
        }
      ],
      preventionTips: ['Use cross-validation', 'Monitor training curves', 'Implement early stopping']
    };
  }

  private getFallbackMLRecommendation(): MLRecommendation {
    return {
      recommendation: 'Consider a neural network approach for complex pattern recognition',
      reasoning: 'Neural networks handle non-linear relationships well in agricultural data',
      confidence: 0.7,
      expectedImprovement: 'Moderate performance improvement expected',
      implementationSteps: ['Design network architecture', 'Prepare training data', 'Train and validate'],
      potentialRisks: ['Overfitting risk', 'Computational requirements'],
      alternativeApproaches: ['Ensemble methods', 'Linear models for interpretability']
    };
  }
}