// NREL API integration for enhanced energy data and rebate information
// Based on the Python NRELAPIIntegration class

export interface DSIREIncentive {
  programName: string
  incentiveType: string
  amount: number
  maxIncentive?: number
  eligibleEfficiency?: string
  jurisdiction: string
  website: string
  startDate?: string
  endDate?: string
  description: string
}

export interface DSIREResponse {
  incentives: DSIREIncentive[]
  totalPrograms: number
  dataSource: string
  lastUpdated: string
}

export interface UtilityRates {
  utilityName: string
  residentialRate: number
  commercialRate: number
  industrialRate: number
  demandCharge: number
  connectionFee: number
  rateStructure: string
  dataSource: string
}

export interface SolarPotential {
  annualEnergy: number
  monthlyEnergy: number[]
  capacityFactor: number
  solarResource: number
  firstYearSavings: number
  dataSource: string
}

export class NRELAPIIntegration {
  private apiKey: string
  private baseUrl: string
  private dsireUrl: string
  private utilityRatesUrl: string
  private pvwattsUrl: string

  constructor(apiKey: string = process.env.NEXT_PUBLIC_NREL_API_KEY || '') {
    this.apiKey = apiKey
    this.baseUrl = 'https://api.nrel.gov'
    this.dsireUrl = `${this.baseUrl}/api/incentives`
    this.utilityRatesUrl = `${this.baseUrl}/api/utility_rates`
    this.pvwattsUrl = `${this.baseUrl}/api/pvwatts`
  }

  async getDSIREIncentives(
    zipCode: string, 
    technologyType: string = 'lighting', 
    sector: string = 'commercial'
  ): Promise<DSIREResponse | { error: string }> {
    try {
      // Check if API key is configured - if not, return demo data
      if (!this.apiKey) {
        return this.getDemoIncentiveData(zipCode)
      }

      // Validate inputs
      if (!zipCode || zipCode.length !== 5) {
        return { error: 'Invalid zip code - must be 5 digits' }
      }

      const params = new URLSearchParams({
        api_key: this.apiKey,
        zip: zipCode.padStart(5, '0'), // Ensure 5 digits with leading zeros
        technology: technologyType,
        sector: sector,
        format: 'json'
      })

      const response = await fetch(`${this.dsireUrl}/incentives?${params}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        }
      })

      if (response.status === 200) {
        try {
          const data = await response.json()
          return this.processDSIREResponse(data)
        } catch (error) {
          return { error: `Invalid JSON response from NREL API: ${error}` }
        }
      } else if (response.status === 403) {
        return { error: 'Invalid API key or access denied' }
      } else if (response.status === 404) {
        return { error: 'No incentive data found for this location' }
      } else {
        return { error: `NREL API returned status ${response.status}` }
      }
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('fetch')) {
        return { error: 'Connection error - check internet connection' }
      }
      return { error: `Failed to fetch NREL data: ${error}` }
    }
  }

  async getUtilityRates(zipCode: string): Promise<UtilityRates | { error: string }> {
    try {
      // Check if API key is configured - if not, return demo data
      if (!this.apiKey) {
        return {
          utilityName: 'Demo Electric Company',
          residentialRate: 0.12,
          commercialRate: 0.10,
          industrialRate: 0.08,
          demandCharge: 15.00,
          connectionFee: 35.00,
          rateStructure: 'tiered',
          dataSource: 'Demo Data (API key required for real data)'
        }
      }

      const params = new URLSearchParams({
        api_key: this.apiKey,
        zip: zipCode,
        format: 'json'
      })

      const response = await fetch(`${this.utilityRatesUrl}/v3?${params}`)

      if (response.status === 200) {
        const data = await response.json()
        return this.processUtilityRates(data)
      } else {
        return { error: `Utility rates API returned status ${response.status}` }
      }
    } catch (error) {
      return { error: `Failed to fetch utility rates: ${error}` }
    }
  }

  async getSolarPotential(
    latitude: number, 
    longitude: number, 
    systemCapacity: number = 10
  ): Promise<SolarPotential | { error: string }> {
    try {
      const params = new URLSearchParams({
        api_key: this.apiKey,
        lat: latitude.toString(),
        lon: longitude.toString(),
        system_capacity: systemCapacity.toString(),
        module_type: '1', // Standard module
        losses: '14', // Standard losses
        array_type: '1', // Fixed - open rack
        tilt: '30',
        azimuth: '180',
        format: 'json'
      })

      const response = await fetch(`${this.pvwattsUrl}/v6?${params}`)

      if (response.status === 200) {
        const data = await response.json()
        return this.processSolarData(data)
      } else {
        return { error: `PVWatts API returned status ${response.status}` }
      }
    } catch (error) {
      return { error: `Failed to fetch solar data: ${error}` }
    }
  }

  private processDSIREResponse(data: any): DSIREResponse {
    const processedIncentives: DSIREIncentive[] = []

    if (data.result && Array.isArray(data.result)) {
      data.result.forEach((incentive: any) => {
        processedIncentives.push({
          programName: incentive.program_name || 'Unknown',
          incentiveType: incentive.incentive_type || 'Unknown',
          amount: incentive.amount || 0,
          maxIncentive: incentive.max_incentive,
          eligibleEfficiency: incentive.eligible_efficiency,
          jurisdiction: incentive.implementing_sector || 'Unknown',
          website: incentive.website_url || '',
          startDate: incentive.start_date,
          endDate: incentive.end_date,
          description: incentive.summary || ''
        })
      })
    }

    return {
      incentives: processedIncentives,
      totalPrograms: processedIncentives.length,
      dataSource: 'NREL DSIRE',
      lastUpdated: new Date().toISOString()
    }
  }

  private processUtilityRates(data: any): UtilityRates | { error: string } {
    if (data.outputs) {
      const outputs = data.outputs
      return {
        utilityName: outputs.utility_name || 'Unknown',
        residentialRate: outputs.residential_rate || 0,
        commercialRate: outputs.commercial_rate || 0,
        industrialRate: outputs.industrial_rate || 0,
        demandCharge: outputs.demand_charge || 0,
        connectionFee: outputs.connection_fee || 0,
        rateStructure: outputs.rate_structure || 'flat',
        dataSource: 'NREL Utility Rates'
      }
    }
    return { error: 'Invalid utility rates response format' }
  }

  private processSolarData(data: any): SolarPotential | { error: string } {
    if (data.outputs) {
      const outputs = data.outputs
      return {
        annualEnergy: outputs.ac_annual || 0,
        monthlyEnergy: outputs.ac_monthly || [],
        capacityFactor: outputs.capacity_factor || 0,
        solarResource: outputs.solrad_annual || 0,
        firstYearSavings: outputs.savings_year1 || 0,
        dataSource: 'NREL PVWatts'
      }
    }
    return { error: 'Invalid solar data response format' }
  }

  // Utility method to estimate lighting energy savings potential
  calculateLightingRebateEstimate(
    totalWattage: number,
    operatingHours: number,
    electricRate: number,
    incentives: DSIREIncentive[]
  ): {
    annualEnergySavings: number
    annualCostSavings: number
    estimatedRebateAmount: number
    paybackPeriod: number
  } {
    // Calculate annual energy consumption
    const annualKWh = (totalWattage / 1000) * operatingHours * 365

    // Calculate annual cost savings (assuming 50% efficiency improvement)
    const annualCostSavings = annualKWh * electricRate * 0.5

    // Estimate rebate amount based on available incentives
    let estimatedRebateAmount = 0
    incentives.forEach(incentive => {
      if (incentive.incentiveType.toLowerCase().includes('rebate')) {
        estimatedRebateAmount += incentive.amount * totalWattage / 1000 // Per kW
      }
    })

    // Calculate simple payback period (assuming upgrade cost of $2/W)
    const upgradeCost = totalWattage * 2 - estimatedRebateAmount
    const paybackPeriod = upgradeCost / annualCostSavings

    return {
      annualEnergySavings: annualKWh * 0.5,
      annualCostSavings,
      estimatedRebateAmount,
      paybackPeriod: Math.round(paybackPeriod * 10) / 10
    }
  }

  private getDemoIncentiveData(zipCode: string): DSIREResponse {
    // Return realistic demo incentive data
    return {
      incentives: [
        {
          programName: 'Commercial Lighting Efficiency Rebate',
          incentiveType: 'Rebate',
          amount: 0.50,
          maxIncentive: 5000,
          eligibleEfficiency: 'LED fixtures with DLC certification',
          jurisdiction: 'State',
          website: 'https://example.com/rebates',
          startDate: '2024-01-01',
          endDate: '2025-12-31',
          description: 'Rebate for upgrading to energy-efficient LED lighting in commercial facilities'
        },
        {
          programName: 'Agriculture Energy Efficiency Grant',
          incentiveType: 'Grant',
          amount: 0.75,
          maxIncentive: 10000,
          eligibleEfficiency: 'Horticultural LED fixtures',
          jurisdiction: 'Federal',
          website: 'https://example.com/grants',
          description: 'Federal grant program for agricultural lighting upgrades'
        },
        {
          programName: 'Utility Lighting Incentive Program',
          incentiveType: 'Rebate',
          amount: 0.40,
          maxIncentive: 3000,
          eligibleEfficiency: 'High-efficiency LED',
          jurisdiction: 'Utility',
          website: 'https://example.com/utility',
          description: 'Local utility rebate for LED lighting installations'
        }
      ],
      totalPrograms: 3,
      dataSource: 'Demo Data (API key required for real data)',
      lastUpdated: new Date().toISOString()
    }
  }
}