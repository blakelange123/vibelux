interface GridPricingData {
  timestamp: Date
  region: string
  lmp: number // Locational Marginal Price ($/MWh)
  capacity: number // Capacity price ($/MW-day)
  ancillary: number // Ancillary services price ($/MWh)
  forecast: GridPriceForecast[]
  demandResponse: {
    active: boolean
    curtailmentLevel: number // 0-1 (percentage)
    compensationRate: number // $/MWh
    duration: number // minutes
  }
}

interface GridPriceForecast {
  timestamp: Date
  lmp: number
  confidence: number // 0-1
  priceCategory: 'low' | 'medium' | 'high' | 'peak'
}

interface UtilitySignal {
  signalType: 'demand_response' | 'load_shed' | 'frequency_regulation' | 'voltage_support'
  priority: 'low' | 'medium' | 'high' | 'emergency'
  startTime: Date
  endTime: Date
  targetReduction: number // MW
  compensationRate: number // $/MWh
  penalties: {
    nonCompliance: number // $/MWh
    maxPenalty: number // $
  }
}

interface EnergyMarketData {
  dayAhead: {
    hourlyPrices: number[]
    peakHours: number[]
    offPeakHours: number[]
  }
  realTime: {
    currentPrice: number
    fiveMinutePrices: number[]
    priceVolatility: number
  }
  ancillaryServices: {
    regulation: number
    reserves: number
    blackStart: number
  }
}

export class GridPricingAPI {
  private region: string
  private utilityId: string
  private apiKey: string
  private baseUrl: string
  private websocket: WebSocket | null = null
  private priceCache: Map<string, GridPricingData> = new Map()
  private listeners: Map<string, Function[]> = new Map()

  constructor(region: string, utilityId: string, apiKey: string) {
    this.region = region
    this.utilityId = utilityId
    this.apiKey = apiKey
    this.baseUrl = this.getRegionalAPIUrl(region)
  }

  private getRegionalAPIUrl(region: string): string {
    const urls = {
      'CAISO': 'https://oasis.caiso.com/oasisapi/SingleZip',
      'PJM': 'https://api.pjm.com/api/v1',
      'NYISO': 'https://webservices.nyiso.com/wsapi/v1.1',
      'ERCOT': 'https://api.ercot.com/api/1',
      'ISO-NE': 'https://webservices.iso-ne.com/api/v1.1',
      'MISO': 'https://api.misoenergy.org/MISORTWD',
      'SPP': 'https://marketplace.spp.org/web-services'
    }
    return urls[region] || 'https://api.eia.gov/v2'
  }

  async initializeRealTimeConnection(): Promise<void> {
    try {
      const wsUrl = this.getWebSocketUrl()
      this.websocket = new WebSocket(wsUrl)

      this.websocket.onopen = () => {
        this.subscribeToRealTimePrices()
      }

      this.websocket.onmessage = (event) => {
        const data = JSON.parse(event.data)
        this.handleRealTimePriceUpdate(data)
      }

      this.websocket.onclose = () => {
        setTimeout(() => this.initializeRealTimeConnection(), 5000)
      }

      this.websocket.onerror = (error) => {
        console.error('Grid pricing WebSocket error:', error)
      }
    } catch (error) {
      console.error('Failed to initialize grid pricing connection:', error)
      throw error
    }
  }

  private getWebSocketUrl(): string {
    const wsUrls = {
      'CAISO': `wss://oasis.caiso.com/oasisapi/websocket?token=${this.apiKey}`,
      'PJM': `wss://api.pjm.com/ws/v1/realtime?apikey=${this.apiKey}`,
      'NYISO': `wss://webservices.nyiso.com/ws/v1.1/realtime?apikey=${this.apiKey}`,
      'ERCOT': `wss://api.ercot.com/ws/1/realtime?apikey=${this.apiKey}`
    }
    return wsUrls[this.region] || `wss://api.eia.gov/ws/v2?api_key=${this.apiKey}`
  }

  private subscribeToRealTimePrices(): void {
    if (this.websocket?.readyState === WebSocket.OPEN) {
      const subscription = {
        action: 'subscribe',
        dataType: 'LMP',
        region: this.region,
        node: 'ALL',
        frequency: '5MIN'
      }
      this.websocket.send(JSON.stringify(subscription))
    }
  }

  private handleRealTimePriceUpdate(data: any): void {
    try {
      const pricingData = this.parseGridPricingData(data)
      const cacheKey = `${pricingData.region}-${pricingData.timestamp.getTime()}`
      
      this.priceCache.set(cacheKey, pricingData)
      this.notifyListeners('priceUpdate', pricingData)
      
      // Trigger optimization if price changes significantly
      if (this.isPriceVolatile(pricingData)) {
        this.notifyListeners('volatilityAlert', pricingData)
      }
    } catch (error) {
      console.error('Error processing real-time price update:', error)
    }
  }

  async getCurrentPricing(): Promise<GridPricingData> {
    try {
      const response = await fetch(`${this.baseUrl}/current-pricing`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error(`Grid pricing API error: ${response.statusText}`)
      }

      const data = await response.json()
      return this.parseGridPricingData(data)
    } catch (error) {
      console.error('Failed to fetch current pricing:', error)
      throw error
    }
  }

  async getDayAheadPricing(): Promise<EnergyMarketData> {
    try {
      const response = await fetch(`${this.baseUrl}/day-ahead-pricing`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      })

      const data = await response.json()
      return this.parseEnergyMarketData(data)
    } catch (error) {
      console.error('Failed to fetch day-ahead pricing:', error)
      throw error
    }
  }

  async getUtilitySignals(): Promise<UtilitySignal[]> {
    try {
      const response = await fetch(`${this.baseUrl}/utility-signals`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      })

      const data = await response.json()
      return data.signals.map(this.parseUtilitySignal)
    } catch (error) {
      console.error('Failed to fetch utility signals:', error)
      throw error
    }
  }

  async submitDemandResponseBid(
    eventId: string,
    bidPrice: number,
    capacity: number,
    startTime: Date,
    endTime: Date
  ): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/demand-response/bid`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          eventId,
          bidPrice,
          capacity,
          startTime: startTime.toISOString(),
          endTime: endTime.toISOString(),
          utilityId: this.utilityId
        })
      })

      return response.ok
    } catch (error) {
      console.error('Failed to submit demand response bid:', error)
      return false
    }
  }

  async calculateTimeOfUseCosts(
    consumptionProfile: { timestamp: Date; kwh: number }[]
  ): Promise<{
    totalCost: number
    peakCost: number
    offPeakCost: number
    demandCharges: number
    breakdown: Array<{ hour: number; rate: number; cost: number }>
  }> {
    const dayAheadData = await this.getDayAheadPricing()
    let totalCost = 0
    let peakCost = 0
    let offPeakCost = 0
    let maxDemand = 0
    const breakdown = []

    for (const consumption of consumptionProfile) {
      const hour = consumption.timestamp.getHours()
      const rate = dayAheadData.dayAhead.hourlyPrices[hour] / 1000 // Convert $/MWh to $/kWh
      const cost = consumption.kwh * rate

      totalCost += cost
      maxDemand = Math.max(maxDemand, consumption.kwh)

      if (dayAheadData.dayAhead.peakHours.includes(hour)) {
        peakCost += cost
      } else {
        offPeakCost += cost
      }

      breakdown.push({ hour, rate, cost })
    }

    const demandCharges = maxDemand * 15 // $15/kW demand charge

    return {
      totalCost: Math.round(totalCost * 100) / 100,
      peakCost: Math.round(peakCost * 100) / 100,
      offPeakCost: Math.round(offPeakCost * 100) / 100,
      demandCharges,
      breakdown
    }
  }

  private parseGridPricingData(data: any): GridPricingData {
    return {
      timestamp: new Date(data.timestamp),
      region: data.region || this.region,
      lmp: parseFloat(data.lmp),
      capacity: parseFloat(data.capacity_price),
      ancillary: parseFloat(data.ancillary_price),
      forecast: data.forecast?.map(f => ({
        timestamp: new Date(f.timestamp),
        lmp: parseFloat(f.lmp),
        confidence: parseFloat(f.confidence),
        priceCategory: this.categorizePriceLevel(parseFloat(f.lmp))
      })) || [],
      demandResponse: {
        active: data.demand_response?.active || false,
        curtailmentLevel: parseFloat(data.demand_response?.curtailment) || 0,
        compensationRate: parseFloat(data.demand_response?.rate) || 0,
        duration: parseInt(data.demand_response?.duration) || 0
      }
    }
  }

  private parseEnergyMarketData(data: any): EnergyMarketData {
    return {
      dayAhead: {
        hourlyPrices: data.day_ahead.hourly_prices.map(p => parseFloat(p)),
        peakHours: data.day_ahead.peak_hours || [7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20],
        offPeakHours: data.day_ahead.off_peak_hours || [21, 22, 23, 0, 1, 2, 3, 4, 5, 6]
      },
      realTime: {
        currentPrice: parseFloat(data.real_time.current_price),
        fiveMinutePrices: data.real_time.five_minute_prices.map(p => parseFloat(p)),
        priceVolatility: parseFloat(data.real_time.volatility)
      },
      ancillaryServices: {
        regulation: parseFloat(data.ancillary.regulation),
        reserves: parseFloat(data.ancillary.reserves),
        blackStart: parseFloat(data.ancillary.black_start)
      }
    }
  }

  private parseUtilitySignal(signal: any): UtilitySignal {
    return {
      signalType: signal.type,
      priority: signal.priority,
      startTime: new Date(signal.start_time),
      endTime: new Date(signal.end_time),
      targetReduction: parseFloat(signal.target_reduction),
      compensationRate: parseFloat(signal.compensation_rate),
      penalties: {
        nonCompliance: parseFloat(signal.penalties.non_compliance),
        maxPenalty: parseFloat(signal.penalties.max_penalty)
      }
    }
  }

  private categorizePriceLevel(price: number): 'low' | 'medium' | 'high' | 'peak' {
    if (price < 30) return 'low'
    if (price < 75) return 'medium'
    if (price < 150) return 'high'
    return 'peak'
  }

  private isPriceVolatile(pricingData: GridPricingData): boolean {
    if (this.priceCache.size < 5) return false
    
    const recentPrices = Array.from(this.priceCache.values())
      .slice(-5)
      .map(p => p.lmp)
    
    const avg = recentPrices.reduce((a, b) => a + b, 0) / recentPrices.length
    const volatility = Math.sqrt(recentPrices.reduce((sum, price) => sum + Math.pow(price - avg, 2), 0) / recentPrices.length)
    
    return volatility > avg * 0.3 // 30% volatility threshold
  }

  addEventListener(event: string, callback: Function): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, [])
    }
    this.listeners.get(event)!.push(callback)
  }

  removeEventListener(event: string, callback: Function): void {
    const eventListeners = this.listeners.get(event)
    if (eventListeners) {
      const index = eventListeners.indexOf(callback)
      if (index > -1) {
        eventListeners.splice(index, 1)
      }
    }
  }

  private notifyListeners(event: string, data: any): void {
    const eventListeners = this.listeners.get(event)
    if (eventListeners) {
      eventListeners.forEach(callback => callback(data))
    }
  }

  disconnect(): void {
    if (this.websocket) {
      this.websocket.close()
      this.websocket = null
    }
    this.priceCache.clear()
    this.listeners.clear()
  }
}