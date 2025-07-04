/**
 * Dynamic Pricing Engine for Marketplace
 * Implements smart bid-ask spreads based on supply/demand
 */

export interface MarketConditions {
  supply: number;
  demand: number;
  averagePrice: number;
  volatility: number;
  seasonalFactor: number;
}

export interface PricingResult {
  growerPrice: number;    // What we pay the grower
  buyerPrice: number;     // What the buyer pays
  spread: number;         // Our margin
  spreadPercent: number;  // Margin as percentage
  confidence: number;     // Algorithm confidence (0-1)
  reasoning: string[];    // Explanation of pricing
}

export class DynamicPricingEngine {
  private readonly BASE_SPREAD = 0.08;  // 8% base spread
  private readonly MIN_SPREAD = 0.03;   // 3% minimum
  private readonly MAX_SPREAD = 0.15;   // 15% maximum
  
  /**
   * Calculate dynamic bid-ask spread based on market conditions
   */
  calculatePricing(
    basePrice: number,
    conditions: MarketConditions,
    productType: string,
    shelfLife: number,
    daysUntilExpiry: number
  ): PricingResult {
    const reasoning: string[] = [];
    
    // 1. Base spread starts at 8%
    let spread = this.BASE_SPREAD;
    reasoning.push(`Base spread: ${(spread * 100).toFixed(1)}%`);
    
    // 2. Adjust for supply/demand ratio
    const supplyDemandRatio = conditions.supply / Math.max(conditions.demand, 1);
    if (supplyDemandRatio > 1.5) {
      // Oversupply - increase spread to move inventory
      spread += 0.02;
      reasoning.push('Oversupply detected: +2% spread');
    } else if (supplyDemandRatio < 0.7) {
      // Undersupply - can reduce spread due to high demand
      spread -= 0.02;
      reasoning.push('High demand: -2% spread');
    }
    
    // 3. Adjust for price volatility
    if (conditions.volatility > 0.2) {
      spread += conditions.volatility * 0.1;
      reasoning.push(`High volatility: +${(conditions.volatility * 10).toFixed(1)}% spread`);
    }
    
    // 4. Freshness adjustment
    const freshnessRatio = daysUntilExpiry / shelfLife;
    if (freshnessRatio < 0.3) {
      // Product expiring soon - increase spread to move quickly
      spread += 0.03;
      reasoning.push('Near expiry: +3% spread');
    }
    
    // 5. Seasonal adjustment
    spread *= (1 + conditions.seasonalFactor * 0.2);
    if (conditions.seasonalFactor !== 0) {
      reasoning.push(`Seasonal adjustment: ${conditions.seasonalFactor > 0 ? '+' : ''}${(conditions.seasonalFactor * 20).toFixed(0)}%`);
    }
    
    // 6. Enforce min/max bounds
    spread = Math.max(this.MIN_SPREAD, Math.min(this.MAX_SPREAD, spread));
    
    // Calculate final prices
    const growerPrice = basePrice * (1 - spread / 2);
    const buyerPrice = basePrice * (1 + spread / 2);
    
    // Calculate confidence based on data quality
    const confidence = this.calculateConfidence(conditions);
    
    return {
      growerPrice: Math.round(growerPrice * 100) / 100,
      buyerPrice: Math.round(buyerPrice * 100) / 100,
      spread: buyerPrice - growerPrice,
      spreadPercent: spread,
      confidence,
      reasoning
    };
  }
  
  /**
   * Calculate confidence in pricing based on data availability
   */
  private calculateConfidence(conditions: MarketConditions): number {
    let confidence = 1.0;
    
    // Reduce confidence for extreme supply/demand ratios
    const ratio = conditions.supply / Math.max(conditions.demand, 1);
    if (ratio > 3 || ratio < 0.3) {
      confidence *= 0.7;
    }
    
    // Reduce confidence for high volatility
    if (conditions.volatility > 0.3) {
      confidence *= 0.8;
    }
    
    // Reduce confidence for extreme seasonal factors
    if (Math.abs(conditions.seasonalFactor) > 0.5) {
      confidence *= 0.9;
    }
    
    return Math.round(confidence * 100) / 100;
  }
  
  /**
   * Determine if market maker mode should be enabled for a product
   */
  shouldEnableMarketMaker(
    productType: string,
    volumeLast30Days: number,
    priceStability: number
  ): boolean {
    // Only enable for high-volume, stable products
    const eligibleProducts = ['lettuce', 'tomatoes', 'herbs', 'microgreens'];
    const minVolume = 10000; // $10k/month
    const maxVolatility = 0.15; // 15% price variation
    
    return (
      eligibleProducts.includes(productType) &&
      volumeLast30Days >= minVolume &&
      priceStability >= (1 - maxVolatility)
    );
  }
  
  /**
   * Calculate inventory purchase recommendation
   */
  recommendInventoryPurchase(
    currentInventory: number,
    dailyDemand: number,
    shelfLife: number,
    leadTime: number
  ): {
    quantity: number;
    reasoning: string;
  } {
    // Safety stock = (daily demand * lead time) + buffer
    const safetyStock = (dailyDemand * leadTime) * 1.2;
    
    // Maximum inventory based on shelf life
    const maxInventory = dailyDemand * (shelfLife * 0.7); // 70% of shelf life
    
    // Recommended purchase
    const recommendedQuantity = Math.max(
      0,
      Math.min(maxInventory - currentInventory, safetyStock - currentInventory)
    );
    
    const reasoning = recommendedQuantity > 0
      ? `Purchase ${recommendedQuantity} units to maintain ${leadTime}-day safety stock`
      : 'No purchase needed - sufficient inventory';
    
    return {
      quantity: Math.round(recommendedQuantity),
      reasoning
    };
  }
}

// Example usage
export function demonstratePricing() {
  const engine = new DynamicPricingEngine();
  
  // Scenario 1: Normal market conditions
  const normalConditions: MarketConditions = {
    supply: 1000,
    demand: 1000,
    averagePrice: 2.50,
    volatility: 0.1,
    seasonalFactor: 0
  };
  
  const normalPricing = engine.calculatePricing(
    2.50, // base price
    normalConditions,
    'lettuce',
    14, // shelf life
    10  // days until expiry
  );
  
  // Normal pricing scenario debug info would be logged here
  
  // Scenario 2: Oversupply with expiring product
  const oversupplyConditions: MarketConditions = {
    supply: 2000,
    demand: 800,
    averagePrice: 2.50,
    volatility: 0.25,
    seasonalFactor: -0.2 // off-season
  };
  
  const oversupplyPricing = engine.calculatePricing(
    2.50,
    oversupplyConditions,
    'lettuce',
    14,
    3 // expiring soon!
  );
  
  // Oversupply pricing scenario debug info would be logged here
}