// Intelligent AI request routing for cost optimization
import { claudeQueue } from './claude-queue'
import { createClaudeClient, selectModel, getTokenLimit } from './claude-config'

interface RequestMetrics {
  complexity: 'simple' | 'medium' | 'complex'
  estimatedTokens: number
  responseTime: number
  cost: number
  userTier: string
}

export class AIRouter {
  private metrics: Map<string, RequestMetrics[]> = new Map()
  
  async routeRequest(
    userQuery: string,
    userId: string,
    userTier: string,
    facilitySize?: number
  ) {
    // Analyze query complexity
    const complexity = this.analyzeComplexity(userQuery)
    const estimatedTokens = this.estimateTokens(userQuery)
    
    // Select optimal model based on complexity and user tier
    const model = this.selectOptimalModel(complexity, userTier)
    const tokenLimit = facilitySize ? getTokenLimit(facilitySize) : 100000
    
    // Route through queue system
    return claudeQueue.add(async () => {
      const startTime = Date.now()
      const claude = createClaudeClient()
      
      try {
        const response = await claude.messages.create({
          model,
          max_tokens: Math.min(tokenLimit, 8192),
          temperature: this.getTemperature(complexity),
          messages: [{ role: 'user', content: userQuery }],
          system: this.getSystemPrompt(complexity)
        })
        
        const responseTime = Date.now() - startTime
        const actualTokens = (response.usage?.input_tokens || 0) + (response.usage?.output_tokens || 0)
        const cost = this.calculateCost(response.usage?.input_tokens || 0, response.usage?.output_tokens || 0, model)
        
        // Track metrics for optimization
        this.trackMetrics(userId, {
          complexity,
          estimatedTokens: actualTokens,
          responseTime,
          cost,
          userTier
        })
        
        return {
          response: response.content[0].type === 'text' ? response.content[0].text : '',
          usage: response.usage,
          model,
          cost,
          responseTime
        }
        
      } catch (error) {
        console.error('AI Router error:', error)
        throw error
      }
    })
  }
  
  private analyzeComplexity(query: string): 'simple' | 'medium' | 'complex' {
    const lowerQuery = query.toLowerCase()
    
    // Simple queries - basic questions, single calculations
    const simplePatterns = [
      /what is|what's/,
      /calculate (ppfd|dli)/,
      /how much/,
      /^(yes|no|ok|thanks)/
    ]
    
    // Complex queries - multi-step design, optimization, analysis
    const complexPatterns = [
      /design.*and.*optimize/,
      /compare.*vs.*with/,
      /multi.*tier.*rack/,
      /spectrum.*adjustment.*with/,
      /comprehensive.*analysis/
    ]
    
    if (simplePatterns.some(pattern => pattern.test(lowerQuery))) {
      return 'simple'
    }
    
    if (complexPatterns.some(pattern => pattern.test(lowerQuery)) || 
        query.length > 500 || 
        (query.match(/\b(and|with|plus|also|additionally)\b/g) || []).length > 2) {
      return 'complex'
    }
    
    return 'medium'
  }
  
  private selectOptimalModel(complexity: 'simple' | 'medium' | 'complex', userTier: string): string {
    // Enterprise users always get best model
    if (userTier === 'enterprise') {
      return 'claude-3-5-sonnet-20241022'
    }
    
    // Cost optimization for lower tiers
    switch (complexity) {
      case 'simple':
        return userTier === 'free' ? 'claude-3-haiku-20240307' : 'claude-3-5-sonnet-20241022'
      case 'medium':
        return 'claude-3-5-sonnet-20241022'
      case 'complex':
        return 'claude-3-5-sonnet-20241022'
      default:
        return 'claude-3-5-sonnet-20241022'
    }
  }
  
  private getTemperature(complexity: 'simple' | 'medium' | 'complex'): number {
    switch (complexity) {
      case 'simple': return 0.3  // More deterministic for calculations
      case 'medium': return 0.7  // Balanced creativity
      case 'complex': return 0.8 // More creative for complex designs
      default: return 0.7
    }
  }
  
  private getSystemPrompt(complexity: 'simple' | 'medium' | 'complex'): string {
    const basePrompt = "You are a horticultural lighting expert assistant."
    
    switch (complexity) {
      case 'simple':
        return `${basePrompt} Provide concise, accurate answers to basic questions.`
      case 'medium':
        return `${basePrompt} Provide detailed technical guidance with practical examples.`
      case 'complex':
        return `${basePrompt} Provide comprehensive analysis with multiple options, trade-offs, and optimization strategies. Include cost-benefit analysis where relevant.`
      default:
        return basePrompt
    }
  }
  
  private estimateTokens(query: string): number {
    // Rough estimation: 1 token ≈ 4 characters for English
    return Math.ceil(query.length / 4) + 500 // Add expected response tokens
  }
  
  private calculateCost(inputTokens: number, outputTokens: number, model: string): number {
    // Claude 3.5 Sonnet: $3/1M input, $15/1M output
    // Claude 3 Haiku: $0.25/1M input, $1.25/1M output
    
    const costs = {
      'claude-3-5-sonnet-20241022': { input: 0.003, output: 0.015 },
      'claude-3-haiku-20240307': { input: 0.00025, output: 0.00125 }
    }
    
    const modelCosts = costs[model as keyof typeof costs] || costs['claude-3-5-sonnet-20241022']
    
    return (inputTokens * modelCosts.input + outputTokens * modelCosts.output) / 1000
  }
  
  private trackMetrics(userId: string, metrics: RequestMetrics): void {
    if (!this.metrics.has(userId)) {
      this.metrics.set(userId, [])
    }
    
    const userMetrics = this.metrics.get(userId)!
    userMetrics.push(metrics)
    
    // Keep only last 100 requests per user
    if (userMetrics.length > 100) {
      userMetrics.shift()
    }
  }
  
  // Analytics for optimization
  getAnalytics(userId?: string) {
    const allMetrics = userId 
      ? this.metrics.get(userId) || []
      : Array.from(this.metrics.values()).flat()
    
    if (allMetrics.length === 0) return null
    
    const avgCost = allMetrics.reduce((sum, m) => sum + m.cost, 0) / allMetrics.length
    const avgResponseTime = allMetrics.reduce((sum, m) => sum + m.responseTime, 0) / allMetrics.length
    
    const complexityBreakdown = {
      simple: allMetrics.filter(m => m.complexity === 'simple').length,
      medium: allMetrics.filter(m => m.complexity === 'medium').length,
      complex: allMetrics.filter(m => m.complexity === 'complex').length
    }
    
    return {
      totalRequests: allMetrics.length,
      avgCost,
      avgResponseTime,
      totalCost: allMetrics.reduce((sum, m) => sum + m.cost, 0),
      complexityBreakdown,
      costEfficiency: avgCost / avgResponseTime * 1000 // Cost per second
    }
  }
  
  // Optimization recommendations
  getOptimizationRecommendations(userId: string) {
    const analytics = this.getAnalytics(userId)
    if (!analytics) return []
    
    const recommendations: string[] = []
    
    if (analytics.avgCost > 0.10) {
      recommendations.push("Consider using more specific queries to reduce token usage")
    }
    
    if (analytics.avgResponseTime > 5000) {
      recommendations.push("Break complex queries into smaller parts for faster responses")
    }
    
    if (analytics.complexityBreakdown.simple > analytics.totalRequests * 0.7) {
      recommendations.push("Enable Haiku model for simple queries to reduce costs by 90%")
    }
    
    return recommendations
  }
}

export const aiRouter = new AIRouter()