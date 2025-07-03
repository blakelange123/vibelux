// Intelligent caching system for AI responses
import { createHash } from 'crypto'

interface CacheEntry {
  response: string
  timestamp: number
  hits: number
  cost: number
  tokens: number
  userTier: string
  expiresAt: number
}

interface CacheStats {
  hitRate: number
  totalSavings: number
  averageResponseTime: number
  entriesCount: number
}

export class AICache {
  private cache = new Map<string, CacheEntry>()
  private readonly maxEntries = 10000
  private readonly defaultTTL = 7 * 24 * 60 * 60 * 1000 // 7 days
  
  // Cache TTL by query type
  private readonly ttlByType = {
    'calculation': 24 * 60 * 60 * 1000,    // 1 day (calculations don't change)
    'comparison': 7 * 24 * 60 * 60 * 1000,  // 7 days (comparisons are stable)
    'design': 1 * 60 * 60 * 1000,           // 1 hour (designs can be personalized)
    'question': 7 * 24 * 60 * 60 * 1000,    // 7 days (general questions are stable)
    'optimization': 2 * 60 * 60 * 1000      // 2 hours (optimization can vary)
  }
  
  generateCacheKey(
    query: string, 
    userTier: string, 
    context?: Record<string, any>
  ): string {
    // Normalize query for better cache hits
    const normalizedQuery = this.normalizeQuery(query)
    
    // Include user tier and relevant context in key
    const keyData = {
      query: normalizedQuery,
      tier: userTier,
      context: context || {}
    }
    
    return createHash('sha256')
      .update(JSON.stringify(keyData))
      .digest('hex')
      .substring(0, 32)
  }
  
  get(cacheKey: string): string | null {
    const entry = this.cache.get(cacheKey)
    
    if (!entry) return null
    
    // Check if expired
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(cacheKey)
      return null
    }
    
    // Update hit count and return
    entry.hits++
    return entry.response
  }
  
  set(
    cacheKey: string,
    response: string,
    cost: number,
    tokens: number,
    userTier: string,
    queryType: string = 'design'
  ): void {
    // Don't cache error responses or very short responses
    if (response.length < 50 || response.includes('error') || response.includes('sorry')) {
      return
    }
    
    const ttl = this.ttlByType[queryType as keyof typeof this.ttlByType] || this.defaultTTL
    
    const entry: CacheEntry = {
      response,
      timestamp: Date.now(),
      hits: 0,
      cost,
      tokens,
      userTier,
      expiresAt: Date.now() + ttl
    }
    
    this.cache.set(cacheKey, entry)
    
    // Cleanup if cache is too large
    if (this.cache.size > this.maxEntries) {
      this.evictOldEntries()
    }
  }
  
  private normalizeQuery(query: string): string {
    return query
      .toLowerCase()
      .trim()
      // Remove user-specific details that don't affect the answer
      .replace(/\b(my|our|we|i|me)\b/g, '')
      // Normalize measurements  
      .replace(/(\d+)\s*(feet|ft|foot)/g, '$1ft')
      .replace(/(\d+)\s*(meters?|m)\b/g, '$1m')
      .replace(/(\d+)\s*x\s*(\d+)/g, '$1x$2')
      // Normalize common terms
      .replace(/\b(ppfd|par)\b/g, 'ppfd')
      .replace(/\b(led|light)\b/g, 'light')
      .replace(/\s+/g, ' ')
  }
  
  private evictOldEntries(): void {
    // Convert to array and sort by score (hits / age)
    const entries = Array.from(this.cache.entries()).map(([key, entry]) => {
      const age = Date.now() - entry.timestamp
      const score = entry.hits / (age / (1000 * 60 * 60)) // hits per hour
      return { key, entry, score }
    })
    
    // Sort by score (ascending, so lowest scores are first)
    entries.sort((a, b) => a.score - b.score)
    
    // Remove bottom 25%
    const toRemove = Math.floor(entries.length * 0.25)
    for (let i = 0; i < toRemove; i++) {
      this.cache.delete(entries[i].key)
    }
  }
  
  getStats(): CacheStats {
    const entries = Array.from(this.cache.values())
    const totalHits = entries.reduce((sum, entry) => sum + entry.hits, 0)
    const totalRequests = entries.length + totalHits
    const hitRate = totalRequests > 0 ? totalHits / totalRequests : 0
    
    const totalSavings = entries.reduce((sum, entry) => sum + (entry.cost * entry.hits), 0)
    
    return {
      hitRate,
      totalSavings,
      averageResponseTime: 50, // Cache responses are ~50ms
      entriesCount: entries.length
    }
  }
  
  // Get most popular cached queries for optimization insights
  getPopularQueries(limit = 10): Array<{ query: string; hits: number; savings: number }> {
    const entries = Array.from(this.cache.entries())
      .map(([key, entry]) => ({
        query: key.substring(0, 50) + '...', // Truncated for display
        hits: entry.hits,
        savings: entry.cost * entry.hits
      }))
      .sort((a, b) => b.hits - a.hits)
      .slice(0, limit)
    
    return entries
  }
  
  // Cache warming for common queries
  warmCache(commonQueries: Array<{ query: string; response: string; cost: number }>) {
    commonQueries.forEach(({ query, response, cost }) => {
      const cacheKey = this.generateCacheKey(query, 'professional')
      this.set(cacheKey, response, cost, 1000, 'professional', 'question')
    })
  }
  
  // Clear expired entries (run periodically)
  cleanup(): number {
    const before = this.cache.size
    const now = Date.now()
    
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key)
      }
    }
    
    return before - this.cache.size
  }
  
  // Export cache for analysis
  exportMetrics() {
    const entries = Array.from(this.cache.values())
    
    return {
      totalEntries: entries.length,
      totalHits: entries.reduce((sum, e) => sum + e.hits, 0),
      totalSavings: entries.reduce((sum, e) => sum + (e.cost * e.hits), 0),
      byUserTier: {
        free: entries.filter(e => e.userTier === 'free').length,
        professional: entries.filter(e => e.userTier === 'professional').length,
        enterprise: entries.filter(e => e.userTier === 'enterprise').length
      },
      averageAge: entries.reduce((sum, e) => sum + (Date.now() - e.timestamp), 0) / entries.length
    }
  }
}

export const aiCache = new AICache()

// Initialize cache with common responses
aiCache.warmCache([
  {
    query: "what is ppfd",
    response: "PPFD (Photosynthetic Photon Flux Density) is a measurement of the amount of photosynthetically active radiation (PAR) that reaches a surface per unit time. It's measured in micromoles per square meter per second (μmol/m²/s) and represents the number of photons between 400-700nm wavelength hitting a surface each second.",
    cost: 0.002
  },
  {
    query: "what is dli", 
    response: "DLI (Daily Light Integral) is the total amount of photosynthetically active radiation (PAR) received during a 24-hour period. It's calculated by multiplying PPFD by the number of hours and a conversion factor: DLI = PPFD × hours × 0.0036. DLI is measured in moles per square meter per day (mol/m²/day).",
    cost: 0.002
  },
  {
    query: "cannabis flowering ppfd requirements",
    response: "Cannabis flowering stage typically requires 600-1000 μmol/m²/s PPFD with a 12-hour photoperiod. This translates to a DLI of 26-43 mol/m²/day. Higher PPFD levels (800-1000) can increase yields but require proper environmental control including adequate CO₂ (1200-1500 ppm), temperature (75-80°F), and humidity management.",
    cost: 0.003
  }
])