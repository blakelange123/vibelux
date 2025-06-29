# Real-Time Market Data Integration Architecture

## Overview
This document outlines the technical implementation for integrating real-time energy market data into the Vibelux platform to enhance CHP economic decision-making and energy optimization.

## Market Data Sources

### Primary Grid Operators
1. **CAISO (California ISO)**
   - Real-time pricing (5-minute intervals)
   - Day-ahead pricing
   - Demand response events
   - Grid frequency and voltage

2. **PJM Interconnection**
   - Real-time LMP (Locational Marginal Pricing)
   - Capacity market data
   - Ancillary services pricing

3. **ERCOT (Texas)**
   - Real-time settlement point prices
   - Load forecasts
   - Wind/solar generation data

4. **NYISO (New York)**
   - Real-time pricing zones
   - Transmission congestion data
   - Reserve market pricing

### Commodity Markets
1. **Natural Gas**
   - Henry Hub spot prices
   - Regional basis differentials
   - Futures curves

2. **Carbon Markets**
   - California Cap-and-Trade
   - Regional Greenhouse Gas Initiative (RGGI)
   - Voluntary carbon offset prices

### Weather & Environmental
1. **Temperature Forecasts**
   - Cooling/heating degree days
   - Impact on energy demand

2. **Renewable Generation Forecasts**
   - Solar irradiance predictions
   - Wind speed forecasts

## Technical Architecture

### 1. Data Ingestion Layer

```typescript
interface MarketDataProvider {
  name: string
  region: string
  dataTypes: string[]
  updateFrequency: number // seconds
  authenticate(): Promise<AuthToken>
  fetchLatestData(dataType: string): Promise<MarketData>
  subscribeToUpdates(dataType: string, callback: DataCallback): Subscription
}

class CAISODataProvider implements MarketDataProvider {
  name = 'CAISO'
  region = 'California'
  dataTypes = ['real-time-pricing', 'day-ahead-pricing', 'demand-response']
  updateFrequency = 300 // 5 minutes
  
  private apiKey: string
  private baseUrl = 'https://api.caiso.com/oasis/v1'
  
  async authenticate(): Promise<AuthToken> {
    // CAISO OASIS API authentication
    return fetch(`${this.baseUrl}/auth`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': this.apiKey
      }
    }).then(r => r.json())
  }
  
  async fetchLatestData(dataType: string): Promise<MarketData> {
    switch(dataType) {
      case 'real-time-pricing':
        return this.fetchRealTimePricing()
      case 'day-ahead-pricing':
        return this.fetchDayAheadPricing()
      default:
        throw new Error(`Unsupported data type: ${dataType}`)
    }
  }
  
  private async fetchRealTimePricing(): Promise<MarketData> {
    const response = await fetch(`${this.baseUrl}/SingleZip`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/xml',
        'Authorization': `Bearer ${await this.getToken()}`
      },
      body: this.buildOASISRequest('PRC_RTPD', 'DLAP', 'ALL')
    })
    
    return this.parseOASISResponse(await response.text())
  }
}

class PJMDataProvider implements MarketDataProvider {
  name = 'PJM'
  region = 'PJM Interconnection'
  dataTypes = ['real-time-lmp', 'day-ahead-lmp', 'capacity-prices']
  updateFrequency = 300
  
  private username: string
  private password: string
  private baseUrl = 'https://api.pjm.com/api/v1'
  
  async fetchLatestData(dataType: string): Promise<MarketData> {
    const auth = Buffer.from(`${this.username}:${this.password}`).toString('base64')
    
    const response = await fetch(`${this.baseUrl}/${this.getEndpoint(dataType)}`, {
      headers: {
        'Authorization': `Basic ${auth}`,
        'Accept': 'application/json'
      }
    })
    
    return this.transformPJMData(await response.json(), dataType)
  }
}
```

### 2. Data Aggregation Service

```typescript
class MarketDataAggregator {
  private providers: Map<string, MarketDataProvider> = new Map()
  private cache: Map<string, CachedMarketData> = new Map()
  private eventEmitter: EventEmitter = new EventEmitter()
  
  constructor(private database: Database) {
    this.setupProviders()
    this.startDataCollection()
  }
  
  private setupProviders(): void {
    this.providers.set('CAISO', new CAISODataProvider(process.env.CAISO_API_KEY))
    this.providers.set('PJM', new PJMDataProvider(process.env.PJM_USERNAME, process.env.PJM_PASSWORD))
    this.providers.set('ERCOT', new ERCOTDataProvider(process.env.ERCOT_API_KEY))
    this.providers.set('NYISO', new NYISODataProvider(process.env.NYISO_API_KEY))
  }
  
  private async startDataCollection(): void {
    // Collect data from all providers on their respective schedules
    for (const [name, provider] of this.providers) {
      setInterval(async () => {
        try {
          await this.collectProviderData(name, provider)
        } catch (error) {
          console.error(`Error collecting data from ${name}:`, error)
          this.eventEmitter.emit('provider-error', { provider: name, error })
        }
      }, provider.updateFrequency * 1000)
    }
  }
  
  private async collectProviderData(name: string, provider: MarketDataProvider): Promise<void> {
    for (const dataType of provider.dataTypes) {
      const data = await provider.fetchLatestData(dataType)
      
      // Cache the data
      const cacheKey = `${name}:${dataType}`
      this.cache.set(cacheKey, {
        data,
        timestamp: new Date(),
        ttl: provider.updateFrequency * 1000
      })
      
      // Store in database
      await this.database.insertMarketData({
        provider: name,
        dataType,
        data,
        timestamp: new Date()
      })
      
      // Emit event for real-time processing
      this.eventEmitter.emit('market-data-updated', {
        provider: name,
        dataType,
        data
      })
    }
  }
  
  async getLatestPrice(region: string, priceType: string = 'real-time'): Promise<MarketPrice> {
    const provider = this.getProviderForRegion(region)
    const cacheKey = `${provider}:${priceType}-pricing`
    
    let cached = this.cache.get(cacheKey)
    if (cached && !this.isExpired(cached)) {
      return this.extractPrice(cached.data)
    }
    
    // Fetch fresh data if cache miss or expired
    const providerInstance = this.providers.get(provider)
    const data = await providerInstance.fetchLatestData(`${priceType}-pricing`)
    
    return this.extractPrice(data)
  }
}
```

### 3. Natural Gas Price Integration

```typescript
class NaturalGasPriceService {
  private eia: EIADataProvider
  private nymex: NYMEXDataProvider
  
  constructor() {
    this.eia = new EIADataProvider(process.env.EIA_API_KEY)
    this.nymex = new NYMEXDataProvider(process.env.NYMEX_API_KEY)
  }
  
  async getCurrentHenryHubPrice(): Promise<GasPrice> {
    // Get spot price from EIA
    const spotPrice = await this.eia.getSpotPrice('NG.RNGWHHD.D')
    
    // Get futures price from NYMEX for validation
    const futuresPrice = await this.nymex.getFuturesPrice('NG', 'front-month')
    
    return {
      spotPrice: spotPrice.value,
      futuresPrice: futuresPrice.value,
      timestamp: new Date(),
      unit: 'USD/MMBtu',
      source: 'EIA/NYMEX'
    }
  }
  
  async getRegionalBasisDifferential(region: string): Promise<number> {
    const regionMap = {
      'california': 'NG.RNGC1CD.D',
      'texas': 'NG.RNGWHHD.D',
      'northeast': 'NG.RNGAIGD.D'
    }
    
    const henryHub = await this.getCurrentHenryHubPrice()
    const regionalPrice = await this.eia.getSpotPrice(regionMap[region.toLowerCase()])
    
    return regionalPrice.value - henryHub.spotPrice
  }
}
```

### 4. Carbon Market Integration

```typescript
class CarbonMarketService {
  async getCaliforniaCarbonPrice(): Promise<CarbonPrice> {
    // California Cap-and-Trade quarterly auction results
    const response = await fetch('https://www.arb.ca.gov/cc/capandtrade/auction/auction_results.json')
    const data = await response.json()
    
    const latestAuction = data.auctions[0]
    
    return {
      price: latestAuction.current_vintage_price,
      currency: 'USD',
      unit: 'per_metric_ton',
      vintage: latestAuction.vintage,
      timestamp: new Date(latestAuction.date),
      source: 'CARB'
    }
  }
  
  async getRGGIPrice(): Promise<CarbonPrice> {
    // Regional Greenhouse Gas Initiative auction data
    const response = await fetch('https://www.rggi.org/api/auction-results/latest')
    const data = await response.json()
    
    return {
      price: data.clearing_price,
      currency: 'USD',
      unit: 'per_short_ton',
      vintage: data.compliance_period,
      timestamp: new Date(data.auction_date),
      source: 'RGGI'
    }
  }
  
  async getVoluntaryCarbonOffsetPrice(): Promise<CarbonPrice> {
    // Voluntary carbon market prices (various sources)
    // Could integrate with Verra, Gold Standard, etc.
    const response = await fetch('https://api.carbonoffsets.com/v1/prices/latest')
    const data = await response.json()
    
    return {
      price: data.average_price,
      currency: 'USD',
      unit: 'per_metric_ton',
      vintage: new Date().getFullYear(),
      timestamp: new Date(),
      source: 'Voluntary Market'
    }
  }
}
```

### 5. Real-Time Data Processing Pipeline

```typescript
class MarketDataProcessor {
  private priceHistory: PriceHistory = new PriceHistory()
  private chpOptimizer: CHPOptimizer = new CHPOptimizer()
  
  constructor(private aggregator: MarketDataAggregator) {
    this.setupEventHandlers()
  }
  
  private setupEventHandlers(): void {
    this.aggregator.on('market-data-updated', (event) => {
      this.processMarketUpdate(event)
    })
  }
  
  private async processMarketUpdate(event: MarketDataEvent): Promise<void> {
    const { provider, dataType, data } = event
    
    switch (dataType) {
      case 'real-time-pricing':
        await this.processElectricityPricing(data)
        break
      case 'natural-gas-pricing':
        await this.processNaturalGasPricing(data)
        break
      case 'carbon-pricing':
        await this.processCarbonPricing(data)
        break
    }
    
    // Trigger CHP decision re-evaluation for all facilities
    await this.reevaluateCHPDecisions()
  }
  
  private async processElectricityPricing(data: ElectricityPriceData): Promise<void> {
    // Store historical data
    await this.priceHistory.addElectricityPrice(data)
    
    // Check for significant price changes
    const priceChange = await this.calculatePriceChange(data)
    if (Math.abs(priceChange) > 0.05) { // 5% change threshold
      await this.notifySignificantPriceChange('electricity', priceChange)
    }
    
    // Update demand response opportunities
    await this.updateDemandResponseOpportunities(data)
  }
  
  private async reevaluateCHPDecisions(): Promise<void> {
    const facilities = await this.database.getActiveFacilitiesWithCHP()
    
    for (const facility of facilities) {
      const marketConditions = await this.aggregator.getMarketConditionsForFacility(facility.id)
      const decision = await this.chpOptimizer.calculateOptimalDecision(marketConditions)
      
      // Store new decision
      await this.database.insertCHPDecision({
        facilityId: facility.id,
        decision,
        marketConditions,
        timestamp: new Date()
      })
      
      // Send real-time update to dashboard
      await this.notifyFacilityDashboard(facility.id, decision)
    }
  }
}
```

### 6. API Implementation

```typescript
// Update the existing CHP decision API to use real-time data
export async function GET(request: Request) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const url = new URL(request.url)
    const facilityId = url.searchParams.get('facilityId')
    
    // Get real-time market data
    const marketDataService = new MarketDataService()
    const facility = await database.getFacility(facilityId)
    
    const marketConditions = await marketDataService.getRealTimeConditions(facility.region)
    const chpDecision = calculateCHPDecision(marketConditions)
    const chpOperations = await database.getCurrentCHPOperations(facilityId)

    return NextResponse.json({
      decision: chpDecision,
      marketConditions,
      operations: chpOperations,
      dataFreshness: {
        electricity: marketConditions.electricityDataAge,
        gas: marketConditions.gasDataAge,
        carbon: marketConditions.carbonDataAge
      },
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error fetching real-time CHP decision:', error)
    return NextResponse.json(
      { error: 'Failed to fetch real-time decision data' },
      { status: 500 }
    )
  }
}

class MarketDataService {
  async getRealTimeConditions(region: string): Promise<MarketConditions> {
    const [electricityPrice, gasPrice, carbonPrice] = await Promise.all([
      this.getElectricityPrice(region),
      this.getNaturalGasPrice(region),
      this.getCarbonPrice(region)
    ])
    
    return {
      gridPrice: electricityPrice.price,
      gasPrice: gasPrice.price,
      co2Price: carbonPrice.price,
      timestamp: new Date().toISOString(),
      region,
      dataQuality: {
        electricity: electricityPrice.quality,
        gas: gasPrice.quality,
        carbon: carbonPrice.quality
      }
    }
  }
  
  private async getElectricityPrice(region: string): Promise<RealTimePrice> {
    const aggregator = MarketDataAggregator.getInstance()
    return aggregator.getLatestPrice(region, 'real-time')
  }
}
```

### 7. WebSocket Implementation for Real-Time Updates

```typescript
class MarketDataWebSocketServer {
  private wss: WebSocketServer
  private clients: Map<string, Set<WebSocket>> = new Map()
  
  constructor(private processor: MarketDataProcessor) {
    this.wss = new WebSocketServer({ port: 8080 })
    this.setupWebSocketServer()
    this.setupMarketDataListeners()
  }
  
  private setupWebSocketServer(): void {
    this.wss.on('connection', (ws, req) => {
      const facilityId = this.extractFacilityId(req.url)
      
      // Add client to facility group
      if (!this.clients.has(facilityId)) {
        this.clients.set(facilityId, new Set())
      }
      this.clients.get(facilityId).add(ws)
      
      // Send current market data
      this.sendCurrentMarketData(ws, facilityId)
      
      // Handle client disconnect
      ws.on('close', () => {
        this.clients.get(facilityId)?.delete(ws)
      })
    })
  }
  
  private setupMarketDataListeners(): void {
    this.processor.on('price-update', (data) => {
      this.broadcastToAffectedFacilities(data)
    })
    
    this.processor.on('chp-decision-update', (data) => {
      this.sendToFacility(data.facilityId, {
        type: 'chp-decision-update',
        decision: data.decision,
        timestamp: new Date()
      })
    })
  }
  
  private broadcastToAffectedFacilities(priceData: PriceUpdate): void {
    const affectedFacilities = this.getFacilitiesInRegion(priceData.region)
    
    for (const facilityId of affectedFacilities) {
      this.sendToFacility(facilityId, {
        type: 'market-price-update',
        data: priceData,
        timestamp: new Date()
      })
    }
  }
}
```

### 8. Database Schema Updates

```sql
-- Market data storage
CREATE TABLE market_data_feeds (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider VARCHAR(100) NOT NULL, -- 'CAISO', 'PJM', 'EIA', etc.
    data_type VARCHAR(100) NOT NULL, -- 'real-time-pricing', 'natural-gas', etc.
    region VARCHAR(100) NOT NULL,
    
    -- Data payload
    raw_data JSONB NOT NULL,
    processed_data JSONB,
    
    -- Metadata
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    data_quality VARCHAR(50) DEFAULT 'good', -- 'good', 'estimated', 'stale'
    latency_ms INTEGER, -- Time from market to our system
    
    -- Indexing
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Real-time pricing table
CREATE TABLE real_time_electricity_prices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    region VARCHAR(100) NOT NULL,
    iso_region VARCHAR(50) NOT NULL, -- 'CAISO', 'PJM', etc.
    pricing_node VARCHAR(255),
    
    -- Pricing data
    price_per_kwh DECIMAL(10,6) NOT NULL,
    price_type VARCHAR(50) NOT NULL, -- 'LMP', 'zonal', 'nodal'
    currency VARCHAR(3) DEFAULT 'USD',
    
    -- Market context
    congestion_component DECIMAL(10,6),
    loss_component DECIMAL(10,6),
    energy_component DECIMAL(10,6),
    
    -- Time data
    market_interval_start TIMESTAMP WITH TIME ZONE NOT NULL,
    market_interval_end TIMESTAMP WITH TIME ZONE NOT NULL,
    
    -- Data quality
    data_source VARCHAR(100) NOT NULL,
    confidence_level DECIMAL(5,2),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Natural gas prices
CREATE TABLE real_time_gas_prices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hub_name VARCHAR(255) NOT NULL, -- 'Henry Hub', 'SoCal Citygate', etc.
    region VARCHAR(100) NOT NULL,
    
    -- Pricing
    price_per_mmbtu DECIMAL(10,4) NOT NULL,
    basis_differential DECIMAL(8,4), -- vs Henry Hub
    currency VARCHAR(3) DEFAULT 'USD',
    
    -- Market data
    trading_date DATE NOT NULL,
    delivery_date DATE,
    contract_type VARCHAR(50), -- 'spot', 'next-day', 'balance-of-month'
    
    data_source VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Carbon prices
CREATE TABLE real_time_carbon_prices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    market_name VARCHAR(255) NOT NULL, -- 'California Cap-and-Trade', 'RGGI'
    region VARCHAR(100) NOT NULL,
    
    -- Pricing
    price_per_metric_ton DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    
    -- Market details
    vintage_year INTEGER,
    market_type VARCHAR(50), -- 'compliance', 'voluntary'
    trading_date DATE NOT NULL,
    
    data_source VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_market_data_feeds_provider_type_timestamp ON market_data_feeds(provider, data_type, timestamp);
CREATE INDEX idx_real_time_electricity_prices_region_timestamp ON real_time_electricity_prices(region, market_interval_start);
CREATE INDEX idx_real_time_gas_prices_hub_date ON real_time_gas_prices(hub_name, trading_date);
CREATE INDEX idx_real_time_carbon_prices_market_date ON real_time_carbon_prices(market_name, trading_date);
```

### 9. Configuration and Environment Setup

```typescript
// config/market-data.ts
export const marketDataConfig = {
  providers: {
    caiso: {
      enabled: process.env.CAISO_ENABLED === 'true',
      apiKey: process.env.CAISO_API_KEY,
      region: 'California',
      updateInterval: 300, // 5 minutes
      endpoints: {
        realTime: 'https://api.caiso.com/oasis/v1/SingleZip',
        dayAhead: 'https://api.caiso.com/oasis/v1/SingleZip'
      }
    },
    pjm: {
      enabled: process.env.PJM_ENABLED === 'true',
      username: process.env.PJM_USERNAME,
      password: process.env.PJM_PASSWORD,
      region: 'PJM',
      updateInterval: 300,
      endpoints: {
        realTime: 'https://api.pjm.com/api/v1/rt_fivemin_lmps',
        dayAhead: 'https://api.pjm.com/api/v1/da_hrl_lmps'
      }
    },
    eia: {
      enabled: process.env.EIA_ENABLED === 'true',
      apiKey: process.env.EIA_API_KEY,
      updateInterval: 3600, // 1 hour for gas prices
      endpoints: {
        naturalGas: 'https://api.eia.gov/v2/natural-gas/pri/spot/data'
      }
    }
  },
  caching: {
    redis: {
      url: process.env.REDIS_URL,
      ttl: 300 // 5 minutes
    }
  },
  alerts: {
    priceChangeThreshold: 0.05, // 5%
    staleDataThreshold: 900, // 15 minutes
    webhookUrl: process.env.ALERT_WEBHOOK_URL
  }
}
```

### 10. Monitoring and Alerting

```typescript
class MarketDataMonitor {
  private prometheus: PrometheusMetrics
  
  constructor() {
    this.prometheus = new PrometheusMetrics()
    this.setupMetrics()
  }
  
  private setupMetrics(): void {
    // Data freshness metrics
    this.prometheus.createGauge('market_data_age_seconds', 'Age of market data in seconds')
    
    // API health metrics
    this.prometheus.createCounter('api_requests_total', 'Total API requests')
    this.prometheus.createCounter('api_errors_total', 'Total API errors')
    this.prometheus.createHistogram('api_response_time_seconds', 'API response time')
    
    // Price volatility metrics
    this.prometheus.createGauge('electricity_price_change_percent', 'Electricity price change percentage')
    this.prometheus.createGauge('gas_price_change_percent', 'Gas price change percentage')
  }
  
  async checkDataFreshness(): Promise<void> {
    const providers = ['CAISO', 'PJM', 'EIA']
    
    for (const provider of providers) {
      const latestData = await this.database.getLatestMarketData(provider)
      const ageSeconds = (Date.now() - latestData.timestamp.getTime()) / 1000
      
      this.prometheus.setGauge('market_data_age_seconds', ageSeconds, { provider })
      
      if (ageSeconds > 900) { // 15 minutes
        await this.sendAlert(`Stale data from ${provider}: ${ageSeconds}s old`)
      }
    }
  }
}
```

## Implementation Timeline

### Phase 1: Core Infrastructure (2 weeks)
- [ ] Market data aggregation service
- [ ] Database schema implementation
- [ ] Basic CAISO integration
- [ ] Caching layer setup

### Phase 2: Additional Providers (2 weeks)
- [ ] PJM integration
- [ ] EIA natural gas data
- [ ] Carbon market data sources
- [ ] Error handling and retry logic

### Phase 3: Real-Time Processing (1 week)
- [ ] WebSocket server implementation
- [ ] Real-time CHP decision updates
- [ ] Dashboard integration
- [ ] Performance optimization

### Phase 4: Monitoring & Alerts (1 week)
- [ ] Metrics collection
- [ ] Alerting system
- [ ] Data quality monitoring
- [ ] Performance dashboards

## Cost Considerations

### API Costs
- **CAISO OASIS**: Free but rate-limited
- **PJM**: $500-1000/month for real-time data
- **EIA**: Free for basic data
- **Commercial Data Providers**: $2000-5000/month

### Infrastructure Costs
- **Real-time processing**: $500-1000/month
- **Database storage**: $200-500/month
- **Caching (Redis)**: $100-300/month
- **Monitoring**: $100-200/month

### ROI Impact
- **Enhanced CHP Decisions**: 5-15% improvement in economic optimization
- **Better Peak Shaving**: 10-20% additional energy cost savings
- **Demand Response Participation**: $5000-50000/year additional revenue