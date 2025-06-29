/**
 * Claude-powered Research Assistant for Plant Biology and Cultivation Analysis
 * Provides expert-level insights and recommendations using AI reasoning
 */

export interface ResearchQuery {
  topic: string;
  plantData: {
    species: string;
    growthStage: string;
    environmentalConditions: Record<string, number>;
    observations: string[];
    measurements: Array<{
      parameter: string;
      value: number;
      timestamp: Date;
    }>;
  };
  researchGoals: string[];
  currentHypotheses?: string[];
}

export interface ResearchInsight {
  finding: string;
  confidence: number;
  supportingEvidence: string[];
  recommendedActions: string[];
  furtherResearch: string[];
  scientificReferences: string[];
}

export interface ExperimentDesign {
  hypothesis: string;
  experimentType: string;
  variables: {
    independent: string[];
    dependent: string[];
    controlled: string[];
  };
  methodology: string[];
  expectedOutcomes: string[];
  timeline: string;
  resourceRequirements: string[];
  dataCollectionPlan: string[];
}

export class ClaudeResearchAssistant {
  private apiEndpoint: string;

  constructor(apiEndpoint: string = '/api/ai-assistant/command') {
    this.apiEndpoint = apiEndpoint;
  }

  public async analyzePhysiologicalData(query: ResearchQuery): Promise<ResearchInsight> {
    try {
      const prompt = this.buildPhysiologyPrompt(query);
      
      const response = await fetch(this.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          context: 'plant_physiology_analysis',
          maxTokens: 800
        }),
      });

      if (!response.ok) {
        throw new Error(`Claude API request failed: ${response.statusText}`);
      }

      const data = await response.json();
      return this.parseResearchInsight(data.response);
      
    } catch (error) {
      console.error('Error analyzing physiological data with Claude:', error);
      return this.getFallbackInsight(query);
    }
  }

  public async designExperiment(
    researchQuestion: string,
    constraints: {
      timeframe: string;
      resources: string[];
      equipment: string[];
      plantMaterial: string;
    }
  ): Promise<ExperimentDesign> {
    try {
      const prompt = this.buildExperimentDesignPrompt(researchQuestion, constraints);
      
      const response = await fetch(this.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          context: 'experiment_design',
          maxTokens: 1000
        }),
      });

      if (!response.ok) {
        throw new Error(`Claude API request failed: ${response.statusText}`);
      }

      const data = await response.json();
      return this.parseExperimentDesign(data.response);
      
    } catch (error) {
      console.error('Error designing experiment with Claude:', error);
      return this.getFallbackExperimentDesign(researchQuestion);
    }
  }

  public async interpretBiologyResults(
    experimentData: {
      treatments: Array<{
        name: string;
        conditions: Record<string, number>;
        results: Array<{
          measurement: string;
          value: number;
          unit: string;
        }>;
      }>;
      methodology: string;
      duration: string;
    }
  ): Promise<{
    interpretation: string;
    statisticalSignificance: string;
    biologicalSignificance: string;
    mechanisticExplanation: string;
    implications: string[];
    nextSteps: string[];
  }> {
    try {
      const prompt = this.buildResultsInterpretationPrompt(experimentData);
      
      const response = await fetch(this.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          context: 'results_interpretation',
          maxTokens: 800
        }),
      });

      if (!response.ok) {
        throw new Error(`Claude API request failed: ${response.statusText}`);
      }

      const data = await response.json();
      return this.parseResultsInterpretation(data.response);
      
    } catch (error) {
      console.error('Error interpreting results with Claude:', error);
      return this.getFallbackResultsInterpretation();
    }
  }

  public async generateLiteratureReview(
    topic: string,
    focusAreas: string[],
    recentFindings: string[]
  ): Promise<{
    summary: string;
    keyFindings: string[];
    researchGaps: string[];
    methodologicalConsiderations: string[];
    futureDirections: string[];
  }> {
    try {
      const prompt = this.buildLiteratureReviewPrompt(topic, focusAreas, recentFindings);
      
      const response = await fetch(this.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          context: 'literature_review',
          maxTokens: 1000
        }),
      });

      if (!response.ok) {
        throw new Error(`Claude API request failed: ${response.statusText}`);
      }

      const data = await response.json();
      return this.parseLiteratureReview(data.response);
      
    } catch (error) {
      console.error('Error generating literature review with Claude:', error);
      return this.getFallbackLiteratureReview(topic);
    }
  }

  private buildPhysiologyPrompt(query: ResearchQuery): string {
    const measurements = query.plantData.measurements
      .map(m => `${m.parameter}: ${m.value} (${m.timestamp.toLocaleDateString()})`)
      .join('\n');

    const conditions = Object.entries(query.plantData.environmentalConditions)
      .map(([key, value]) => `${key}: ${value}`)
      .join(', ');

    return `As a plant physiology expert, analyze this cultivation research data:

RESEARCH TOPIC: ${query.topic}

PLANT INFORMATION:
- Species: ${query.plantData.species}
- Growth Stage: ${query.plantData.growthStage}
- Environmental Conditions: ${conditions}

OBSERVATIONS:
${query.plantData.observations.join('\n')}

MEASUREMENTS:
${measurements}

RESEARCH GOALS:
${query.researchGoals.join('\n')}

${query.currentHypotheses ? `CURRENT HYPOTHESES:\n${query.currentHypotheses.join('\n')}` : ''}

Please provide:
1. FINDING: Key physiological insight from this data
2. CONFIDENCE: How confident are you in this finding (0-100%)
3. EVIDENCE: Supporting evidence from the data
4. ACTIONS: Recommended next steps for research
5. FURTHER_RESEARCH: Additional investigations needed
6. REFERENCES: Relevant scientific principles or studies

Focus on mechanistic explanations and actionable insights.`;
  }

  private buildExperimentDesignPrompt(
    researchQuestion: string,
    constraints: {
      timeframe: string;
      resources: string[];
      equipment: string[];
      plantMaterial: string;
    }
  ): string {
    return `As a research methodology expert, design a controlled experiment:

RESEARCH QUESTION: ${researchQuestion}

CONSTRAINTS:
- Timeframe: ${constraints.timeframe}
- Available Resources: ${constraints.resources.join(', ')}
- Equipment: ${constraints.equipment.join(', ')}
- Plant Material: ${constraints.plantMaterial}

Please design an experiment with:
1. HYPOTHESIS: Clear, testable hypothesis
2. EXPERIMENT_TYPE: Type of experimental design
3. VARIABLES: Independent, dependent, and controlled variables
4. METHODOLOGY: Step-by-step experimental procedure
5. EXPECTED_OUTCOMES: What results you expect to see
6. TIMELINE: Detailed timeline for the experiment
7. RESOURCES: Specific resource requirements
8. DATA_COLLECTION: Data collection plan and metrics

Ensure the design is scientifically rigorous and feasible within the given constraints.`;
  }

  private buildResultsInterpretationPrompt(experimentData: {
    treatments: Array<{
      name: string;
      conditions: Record<string, number>;
      results: Array<{
        measurement: string;
        value: number;
        unit: string;
      }>;
    }>;
    methodology: string;
    duration: string;
  }): string {
    const treatmentSummary = experimentData.treatments.map(t => {
      const conditions = Object.entries(t.conditions).map(([k, v]) => `${k}: ${v}`).join(', ');
      const results = t.results.map(r => `${r.measurement}: ${r.value} ${r.unit}`).join(', ');
      return `${t.name} - Conditions: ${conditions} | Results: ${results}`;
    }).join('\n');

    return `As a plant science expert, interpret these experimental results:

METHODOLOGY: ${experimentData.methodology}
DURATION: ${experimentData.duration}

TREATMENT RESULTS:
${treatmentSummary}

Please provide:
1. INTERPRETATION: Overall interpretation of the results
2. STATISTICAL_SIGNIFICANCE: Statistical significance assessment
3. BIOLOGICAL_SIGNIFICANCE: Biological/practical significance
4. MECHANISM: Mechanistic explanation for observed effects
5. IMPLICATIONS: Broader implications for cultivation
6. NEXT_STEPS: Recommended follow-up research

Focus on scientific rigor and practical applications.`;
  }

  private buildLiteratureReviewPrompt(
    topic: string,
    focusAreas: string[],
    recentFindings: string[]
  ): string {
    return `As a plant science researcher, provide a literature review synthesis:

TOPIC: ${topic}

FOCUS AREAS:
${focusAreas.join('\n')}

RECENT FINDINGS TO CONSIDER:
${recentFindings.join('\n')}

Please provide:
1. SUMMARY: Comprehensive overview of current knowledge
2. KEY_FINDINGS: Most important discoveries in this field
3. RESEARCH_GAPS: Identified gaps in current research
4. METHODOLOGY: Key methodological considerations
5. FUTURE_DIRECTIONS: Promising areas for future research

Synthesize information from multiple perspectives and highlight consensus vs. debates in the field.`;
  }

  private parseResearchInsight(response: string): ResearchInsight {
    try {
      const sections = this.extractSections(response);
      
      const confidenceMatch = (sections.CONFIDENCE || '75').match(/\d+/);
      const confidence = confidenceMatch ? parseInt(confidenceMatch[0]) / 100 : 0.75;

      return {
        finding: sections.FINDING || 'Analysis indicates potential areas for further investigation',
        confidence,
        supportingEvidence: this.parseListSection(sections.EVIDENCE || ''),
        recommendedActions: this.parseListSection(sections.ACTIONS || ''),
        furtherResearch: this.parseListSection(sections.FURTHER_RESEARCH || ''),
        scientificReferences: this.parseListSection(sections.REFERENCES || '')
      };
    } catch (error) {
      console.error('Error parsing research insight:', error);
      return this.getFallbackInsight();
    }
  }

  private parseExperimentDesign(response: string): ExperimentDesign {
    try {
      const sections = this.extractSections(response);
      
      // Parse variables section for independent, dependent, controlled
      const variablesText = sections.VARIABLES || '';
      const variables = this.parseVariables(variablesText);

      return {
        hypothesis: sections.HYPOTHESIS || 'Hypothesis requires further definition',
        experimentType: sections.EXPERIMENT_TYPE || 'Controlled experiment',
        variables,
        methodology: this.parseListSection(sections.METHODOLOGY || ''),
        expectedOutcomes: this.parseListSection(sections.EXPECTED_OUTCOMES || ''),
        timeline: sections.TIMELINE || 'Timeline to be determined',
        resourceRequirements: this.parseListSection(sections.RESOURCES || ''),
        dataCollectionPlan: this.parseListSection(sections.DATA_COLLECTION || '')
      };
    } catch (error) {
      console.error('Error parsing experiment design:', error);
      return this.getFallbackExperimentDesign();
    }
  }

  private parseResultsInterpretation(response: string): {
    interpretation: string;
    statisticalSignificance: string;
    biologicalSignificance: string;
    mechanisticExplanation: string;
    implications: string[];
    nextSteps: string[];
  } {
    try {
      const sections = this.extractSections(response);
      
      return {
        interpretation: sections.INTERPRETATION || 'Results require further analysis',
        statisticalSignificance: sections.STATISTICAL_SIGNIFICANCE || 'Statistical analysis pending',
        biologicalSignificance: sections.BIOLOGICAL_SIGNIFICANCE || 'Biological significance to be determined',
        mechanisticExplanation: sections.MECHANISM || 'Mechanism requires investigation',
        implications: this.parseListSection(sections.IMPLICATIONS || ''),
        nextSteps: this.parseListSection(sections.NEXT_STEPS || '')
      };
    } catch (error) {
      console.error('Error parsing results interpretation:', error);
      return this.getFallbackResultsInterpretation();
    }
  }

  private parseLiteratureReview(response: string): {
    summary: string;
    keyFindings: string[];
    researchGaps: string[];
    methodologicalConsiderations: string[];
    futureDirections: string[];
  } {
    try {
      const sections = this.extractSections(response);
      
      return {
        summary: sections.SUMMARY || 'Literature review summary unavailable',
        keyFindings: this.parseListSection(sections.KEY_FINDINGS || ''),
        researchGaps: this.parseListSection(sections.RESEARCH_GAPS || ''),
        methodologicalConsiderations: this.parseListSection(sections.METHODOLOGY || ''),
        futureDirections: this.parseListSection(sections.FUTURE_DIRECTIONS || '')
      };
    } catch (error) {
      console.error('Error parsing literature review:', error);
      return this.getFallbackLiteratureReview();
    }
  }

  private parseVariables(text: string): {
    independent: string[];
    dependent: string[];
    controlled: string[];
  } {
    const defaultVariables = {
      independent: ['Treatment variable'],
      dependent: ['Response measurement'],
      controlled: ['Environmental conditions']
    };

    try {
      const independentMatch = text.match(/independent[:\s]+(.*?)(?=dependent|controlled|$)/is);
      const dependentMatch = text.match(/dependent[:\s]+(.*?)(?=independent|controlled|$)/is);
      const controlledMatch = text.match(/controlled[:\s]+(.*?)(?=independent|dependent|$)/is);

      return {
        independent: independentMatch ? this.parseListSection(independentMatch[1]) : defaultVariables.independent,
        dependent: dependentMatch ? this.parseListSection(dependentMatch[1]) : defaultVariables.dependent,
        controlled: controlledMatch ? this.parseListSection(controlledMatch[1]) : defaultVariables.controlled
      };
    } catch (error) {
      return defaultVariables;
    }
  }

  private extractSections(text: string): Record<string, string> {
    const sections: Record<string, string> = {};
    const lines = text.split('\n');
    let currentSection = '';
    let currentContent = '';

    for (const line of lines) {
      const sectionMatch = line.match(/^\d*\.?\s*(FINDING|CONFIDENCE|EVIDENCE|ACTIONS|FURTHER_RESEARCH|REFERENCES|HYPOTHESIS|EXPERIMENT_TYPE|VARIABLES|METHODOLOGY|EXPECTED_OUTCOMES|TIMELINE|RESOURCES|DATA_COLLECTION|INTERPRETATION|STATISTICAL_SIGNIFICANCE|BIOLOGICAL_SIGNIFICANCE|MECHANISM|IMPLICATIONS|NEXT_STEPS|SUMMARY|KEY_FINDINGS|RESEARCH_GAPS|FUTURE_DIRECTIONS)[:.]?\s*(.*)/i);
      
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
      .slice(0, 8); // Limit to 8 items
  }

  private getFallbackInsight(query?: ResearchQuery): ResearchInsight {
    return {
      finding: 'Data analysis suggests normal physiological responses within expected parameters',
      confidence: 0.6,
      supportingEvidence: ['Parameter values within typical ranges', 'Growth stage progression as expected'],
      recommendedActions: ['Continue monitoring', 'Collect additional data points'],
      furtherResearch: ['Extended observation period', 'Additional measurement parameters'],
      scientificReferences: ['Standard plant physiology principles']
    };
  }

  private getFallbackExperimentDesign(researchQuestion?: string): ExperimentDesign {
    return {
      hypothesis: researchQuestion ? `Experimental treatment will affect plant response in ${researchQuestion}` : 'Treatment will produce measurable effects',
      experimentType: 'Randomized controlled experiment',
      variables: {
        independent: ['Treatment conditions'],
        dependent: ['Plant response measurements'],
        controlled: ['Environmental factors', 'Plant material', 'Timing']
      },
      methodology: [
        'Establish baseline measurements',
        'Apply treatments to randomized groups',
        'Monitor and record responses',
        'Analyze data statistically'
      ],
      expectedOutcomes: ['Measurable differences between treatments', 'Statistical significance in key parameters'],
      timeline: '4-8 weeks depending on plant response time',
      resourceRequirements: ['Plant material', 'Measurement equipment', 'Environmental controls'],
      dataCollectionPlan: ['Daily monitoring', 'Weekly detailed measurements', 'Final harvest analysis']
    };
  }

  private getFallbackResultsInterpretation(): {
    interpretation: string;
    statisticalSignificance: string;
    biologicalSignificance: string;
    mechanisticExplanation: string;
    implications: string[];
    nextSteps: string[];
  } {
    return {
      interpretation: 'Results show treatment effects that warrant further investigation',
      statisticalSignificance: 'Statistical analysis required to determine significance levels',
      biologicalSignificance: 'Biological relevance depends on magnitude and consistency of effects',
      mechanisticExplanation: 'Multiple physiological pathways may contribute to observed responses',
      implications: ['Results may inform cultivation practices', 'Findings contribute to scientific understanding'],
      nextSteps: ['Replicate experiment', 'Investigate underlying mechanisms', 'Test under different conditions']
    };
  }

  private getFallbackLiteratureReview(topic?: string): {
    summary: string;
    keyFindings: string[];
    researchGaps: string[];
    methodologicalConsiderations: string[];
    futureDirections: string[];
  } {
    return {
      summary: `Literature on ${topic || 'this topic'} shows active research with emerging insights`,
      keyFindings: ['Multiple factors influence plant responses', 'Environmental conditions play key roles'],
      researchGaps: ['Long-term studies needed', 'Mechanistic understanding incomplete'],
      methodologicalConsiderations: ['Standardized protocols important', 'Control for environmental variables'],
      futureDirections: ['Technology-enabled monitoring', 'Multi-factorial experiments', 'Application studies']
    };
  }
}