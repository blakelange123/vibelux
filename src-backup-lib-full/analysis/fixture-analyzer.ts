/**
 * Fixture Analysis Engine
 * Advanced algorithms for comparing and analyzing LED grow lights
 */

export interface AnalysisParams {
  growStage: 'seedling' | 'vegetative' | 'flowering' | 'all'
  spaceSize: number // sq ft
  budget: number
  priority: 'efficiency' | 'coverage' | 'value' | 'quality'
  experience: 'beginner' | 'intermediate' | 'expert'
}

export interface FixtureScore {
  overall: number
  efficiency: number
  value: number
  coverage: number
  spectrum: number
  features: number
  recommendation: string
  pros: string[]
  cons: string[]
}

export interface ComparisonResult {
  fixtures: Array<{
    id: string
    name: string
    score: FixtureScore
    rank: number
  }>
  winner: {
    id: string
    name: string
    reason: string
  }
  analysis: {
    efficiency: string
    value: string
    coverage: string
    spectrum: string
    overall: string
  }
}

export class FixtureAnalyzer {
  /**
   * Analyze a single fixture against specified parameters
   */
  static analyzeFixture(fixture: any, params: AnalysisParams): FixtureScore {
    const scores = {
      efficiency: this.calculateEfficiencyScore(fixture),
      value: this.calculateValueScore(fixture, params.budget),
      coverage: this.calculateCoverageScore(fixture, params.spaceSize),
      spectrum: this.calculateSpectrumScore(fixture, params.growStage),
      features: this.calculateFeatureScore(fixture, params.experience)
    }

    // Weight scores based on priority
    const weights = this.getPriorityWeights(params.priority)
    const overall = Object.entries(scores).reduce((total, [key, score]) => {
      return total + (score * weights[key as keyof typeof weights])
    }, 0)

    const pros = this.generatePros(fixture, scores)
    const cons = this.generateCons(fixture, scores)
    const recommendation = this.generateRecommendation(fixture, scores, params)

    return {
      overall,
      ...scores,
      recommendation,
      pros,
      cons
    }
  }

  /**
   * Compare multiple fixtures
   */
  static compareFixtures(fixtures: any[], params: AnalysisParams): ComparisonResult {
    // Analyze each fixture
    const analyzed = fixtures.map(fixture => ({
      id: fixture.id,
      name: fixture.name,
      score: this.analyzeFixture(fixture, params),
      fixture
    }))

    // Rank by overall score
    analyzed.sort((a, b) => b.score.overall - a.score.overall)
    const ranked = analyzed.map((item, index) => ({
      id: item.id,
      name: item.name,
      score: item.score,
      rank: index + 1
    }))

    const winner = analyzed[0]
    const analysis = this.generateComparisonAnalysis(analyzed, params)

    return {
      fixtures: ranked,
      winner: {
        id: winner.id,
        name: winner.name,
        reason: this.getWinnerReason(winner, params)
      },
      analysis
    }
  }

  /**
   * Calculate efficiency score (PPFD per watt)
   */
  private static calculateEfficiencyScore(fixture: any): number {
    const ppfdPerWatt = fixture.ppfd / fixture.wattage
    
    // Score based on efficiency ranges
    if (ppfdPerWatt >= 2.8) return 100
    if (ppfdPerWatt >= 2.5) return 90
    if (ppfdPerWatt >= 2.2) return 80
    if (ppfdPerWatt >= 2.0) return 70
    if (ppfdPerWatt >= 1.8) return 60
    if (ppfdPerWatt >= 1.5) return 50
    return 30
  }

  /**
   * Calculate value score (price vs performance)
   */
  private static calculateValueScore(fixture: any, budget: number): number {
    const costPerPPFD = fixture.price / fixture.ppfd
    const budgetRatio = fixture.price / budget
    
    let valueScore = 100
    
    // Penalize high cost per PPFD
    if (costPerPPFD > 0.5) valueScore -= 30
    else if (costPerPPFD > 0.3) valueScore -= 20
    else if (costPerPPFD > 0.2) valueScore -= 10
    
    // Penalize if over budget
    if (budgetRatio > 1.2) valueScore -= 40
    else if (budgetRatio > 1.0) valueScore -= 20
    
    // Bonus for being under budget with good performance
    if (budgetRatio < 0.8 && costPerPPFD < 0.3) valueScore += 10
    
    return Math.max(0, Math.min(100, valueScore))
  }

  /**
   * Calculate coverage score
   */
  private static calculateCoverageScore(fixture: any, spaceSize: number): number {
    const coverageRatio = fixture.coverageArea / spaceSize
    
    // Optimal coverage is 90-110% of space
    if (coverageRatio >= 0.9 && coverageRatio <= 1.1) return 100
    if (coverageRatio >= 0.8 && coverageRatio <= 1.3) return 90
    if (coverageRatio >= 0.7 && coverageRatio <= 1.5) return 80
    if (coverageRatio >= 0.6 && coverageRatio <= 2.0) return 70
    if (coverageRatio >= 0.5) return 60
    return 30
  }

  /**
   * Calculate spectrum score
   */
  private static calculateSpectrumScore(fixture: any, growStage: string): number {
    let score = 60 // Base score
    
    // Full spectrum bonus
    if (fixture.spectrum?.fullSpectrum) score += 20
    
    // Stage-specific bonuses
    if (growStage === 'flowering' && fixture.spectrum?.redBlueRatio > 1.0) score += 10
    if (growStage === 'vegetative' && fixture.spectrum?.redBlueRatio < 1.2) score += 10
    if (growStage === 'all' && fixture.spectrum?.fullSpectrum) score += 15
    
    // UV and IR bonus
    if (fixture.spectrum?.peakWavelengths?.includes(365)) score += 5 // UV
    if (fixture.spectrum?.peakWavelengths?.includes(730)) score += 5 // Far red
    
    return Math.min(100, score)
  }

  /**
   * Calculate feature score
   */
  private static calculateFeatureScore(fixture: any, experience: string): number {
    let score = 50
    
    // Dimmability
    if (fixture.dimmable) score += 15
    
    // Cooling system
    if (fixture.cooling === 'Active') score += 10
    else if (fixture.cooling === 'Fanless') score += 5
    
    // Warranty
    if (fixture.warranty >= 5) score += 10
    else if (fixture.warranty >= 3) score += 5
    
    // Experience-based adjustments
    if (experience === 'beginner') {
      // Beginners benefit from simpler, more reliable features
      if (fixture.features?.includes('Plug and Play')) score += 10
      if (fixture.features?.includes('Timer')) score += 5
    } else if (experience === 'expert') {
      // Experts appreciate advanced features
      if (fixture.features?.includes('App Control')) score += 10
      if (fixture.features?.includes('Spectrum Control')) score += 10
    }
    
    return Math.min(100, score)
  }

  /**
   * Get priority weights
   */
  private static getPriorityWeights(priority: string) {
    const weights = {
      efficiency: 0.2,
      value: 0.2,
      coverage: 0.2,
      spectrum: 0.2,
      features: 0.2
    }

    switch (priority) {
      case 'efficiency':
        weights.efficiency = 0.4
        weights.spectrum = 0.25
        break
      case 'value':
        weights.value = 0.4
        weights.efficiency = 0.25
        break
      case 'coverage':
        weights.coverage = 0.4
        weights.efficiency = 0.25
        break
      case 'quality':
        weights.features = 0.3
        weights.spectrum = 0.3
        break
    }

    return weights
  }

  /**
   * Generate pros for a fixture
   */
  private static generatePros(fixture: any, scores: any): string[] {
    const pros: string[] = []
    
    if (scores.efficiency >= 90) pros.push('Excellent energy efficiency')
    if (scores.value >= 90) pros.push('Outstanding value for money')
    if (scores.coverage >= 90) pros.push('Perfect coverage for your space')
    if (scores.spectrum >= 90) pros.push('Superior light spectrum')
    if (scores.features >= 90) pros.push('Feature-rich design')
    
    if (fixture.dimmable) pros.push('Adjustable intensity')
    if (fixture.warranty >= 5) pros.push('Extended warranty coverage')
    if (fixture.cooling === 'Fanless') pros.push('Silent operation')
    
    return pros.slice(0, 4) // Limit to top 4 pros
  }

  /**
   * Generate cons for a fixture
   */
  private static generateCons(fixture: any, scores: any): string[] {
    const cons: string[] = []
    
    if (scores.efficiency < 60) cons.push('Below average energy efficiency')
    if (scores.value < 60) cons.push('Higher cost relative to performance')
    if (scores.coverage < 70) cons.push('May not adequately cover your space')
    if (scores.spectrum < 70) cons.push('Limited spectrum options')
    
    if (!fixture.dimmable) cons.push('No dimming capability')
    if (fixture.warranty < 3) cons.push('Limited warranty period')
    if (fixture.weight > 25) cons.push('Heavy fixture')
    
    return cons.slice(0, 3) // Limit to top 3 cons
  }

  /**
   * Generate recommendation
   */
  private static generateRecommendation(fixture: any, scores: any, params: AnalysisParams): string {
    if (scores.overall >= 90) {
      return 'Highly recommended - excellent performance across all criteria'
    } else if (scores.overall >= 80) {
      return 'Recommended - strong performance with minor trade-offs'
    } else if (scores.overall >= 70) {
      return 'Good option - suitable for specific use cases'
    } else if (scores.overall >= 60) {
      return 'Consider alternatives - significant limitations'
    } else {
      return 'Not recommended - better options available'
    }
  }

  /**
   * Get winner reason
   */
  private static getWinnerReason(winner: any, params: AnalysisParams): string {
    const fixture = winner.fixture
    const scores = winner.score
    
    const topScore = Math.max(scores.efficiency, scores.value, scores.coverage, scores.spectrum, scores.features)
    
    if (scores.efficiency === topScore) {
      return `Most efficient option with ${(fixture.ppfd / fixture.wattage).toFixed(2)} PPFD per watt`
    } else if (scores.value === topScore) {
      return `Best value at $${(fixture.price / fixture.ppfd).toFixed(2)} per PPFD`
    } else if (scores.coverage === topScore) {
      return `Optimal coverage for ${params.spaceSize} sq ft grow space`
    } else if (scores.spectrum === topScore) {
      return 'Superior light spectrum for plant growth'
    } else {
      return 'Best overall combination of features and performance'
    }
  }

  /**
   * Generate comparison analysis
   */
  private static generateComparisonAnalysis(analyzed: any[], params: AnalysisParams) {
    const fixtures = analyzed.map(a => a.fixture)
    const scores = analyzed.map(a => a.score)
    
    return {
      efficiency: this.analyzeCategory(fixtures, scores, 'efficiency'),
      value: this.analyzeCategory(fixtures, scores, 'value'),
      coverage: this.analyzeCategory(fixtures, scores, 'coverage'),
      spectrum: this.analyzeCategory(fixtures, scores, 'spectrum'),
      overall: `Based on your ${params.priority} priority and ${params.spaceSize} sq ft space, ${analyzed[0].name} offers the best combination of performance and value.`
    }
  }

  /**
   * Analyze a specific category
   */
  private static analyzeCategory(fixtures: any[], scores: any[], category: string): string {
    const categoryScores = scores.map(s => s[category])
    const maxScore = Math.max(...categoryScores)
    const winner = fixtures[categoryScores.indexOf(maxScore)]
    
    switch (category) {
      case 'efficiency':
        return `${winner.name} leads in efficiency with ${(winner.ppfd / winner.wattage).toFixed(2)} PPFD per watt`
      case 'value':
        return `${winner.name} offers the best value at $${(winner.price / winner.ppfd).toFixed(2)} per PPFD`
      case 'coverage':
        return `${winner.name} provides the best coverage at ${winner.coverageArea} sq ft`
      case 'spectrum':
        return `${winner.name} has the most comprehensive light spectrum`
      default:
        return `${winner.name} excels in ${category}`
    }
  }
}