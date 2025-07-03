import { Connection } from 'jsforce'

interface SalesforceConfig {
  loginUrl: string
  username: string
  password: string
  securityToken: string
}

interface OpportunityUpdate {
  Id: string
  [key: string]: any
}

class SalesforceClient {
  private conn: Connection | null = null
  private config: SalesforceConfig

  constructor() {
    this.config = {
      loginUrl: process.env.SALESFORCE_LOGIN_URL || 'https://login.salesforce.com',
      username: process.env.SALESFORCE_USERNAME || '',
      password: process.env.SALESFORCE_PASSWORD || '',
      securityToken: process.env.SALESFORCE_SECURITY_TOKEN || ''
    }
  }

  async connect(): Promise<void> {
    if (this.conn) return

    this.conn = new Connection({
      loginUrl: this.config.loginUrl
    })

    await this.conn.login(
      this.config.username,
      this.config.password + this.config.securityToken
    )
  }

  async updateOpportunity(opportunityId: string, data: any): Promise<any> {
    await this.connect()
    
    if (!this.conn) throw new Error('Salesforce connection not established')

    // Map our data to Salesforce opportunity fields
    const opportunityUpdate: OpportunityUpdate = {
      Id: opportunityId,
      // Custom fields for Vibelux data
      Vibelux_Last_Analysis_Date__c: new Date().toISOString(),
      Vibelux_Project_Status__c: data.projectStatus,
      Vibelux_Energy_Savings__c: data.energySavings,
      Vibelux_ROI_Percentage__c: data.roiPercentage,
      Vibelux_Fixture_Count__c: data.fixtureCount,
      Vibelux_Total_PPFD__c: data.totalPPFD,
      Vibelux_Coverage_Area__c: data.coverageArea,
      Vibelux_Annual_Yield_Estimate__c: data.annualYieldEstimate,
      Vibelux_Implementation_Timeline__c: data.implementationTimeline,
      Vibelux_Report_URL__c: data.reportUrl,
      Description: this.buildOpportunityDescription(data)
    }

    const result = await this.conn.sobject('Opportunity').update(opportunityUpdate)
    
    // Also create an activity/task for the update
    await this.createActivityRecord(opportunityId, data)
    
    return result
  }

  async createActivityRecord(opportunityId: string, data: any): Promise<any> {
    if (!this.conn) throw new Error('Salesforce connection not established')

    const task = {
      WhatId: opportunityId,
      Subject: `Vibelux Analysis Update - ${new Date().toLocaleDateString()}`,
      Status: 'Completed',
      Priority: 'Normal',
      Description: `Updated Vibelux analysis data:
- Energy Savings: ${data.energySavings}%
- ROI: ${data.roiPercentage}%
- Fixture Count: ${data.fixtureCount}
- Coverage Area: ${data.coverageArea} sq ft
- Annual Yield Estimate: ${data.annualYieldEstimate} lbs`,
      ActivityDate: new Date().toISOString().split('T')[0]
    }

    return await this.conn.sobject('Task').create(task)
  }

  async getOpportunity(opportunityId: string): Promise<any> {
    await this.connect()
    
    if (!this.conn) throw new Error('Salesforce connection not established')

    return await this.conn.sobject('Opportunity').retrieve(opportunityId)
  }

  async searchOpportunities(query: string): Promise<any[]> {
    await this.connect()
    
    if (!this.conn) throw new Error('Salesforce connection not established')

    const result = await this.conn.search(
      `FIND {${query}} IN ALL FIELDS RETURNING Opportunity(Id, Name, AccountId, Amount, StageName, CloseDate)`
    )

    return result.searchRecords
  }

  private buildOpportunityDescription(data: any): string {
    return `Vibelux Analysis Summary (${new Date().toLocaleDateString()}):

Project Overview:
- Status: ${data.projectStatus}
- Implementation Timeline: ${data.implementationTimeline}

Technical Specifications:
- Fixture Count: ${data.fixtureCount}
- Coverage Area: ${data.coverageArea} sq ft
- Average PPFD: ${data.totalPPFD} μmol/m²/s
- Spectrum Optimization: ${data.spectrumOptimization || 'Standard'}

Financial Analysis:
- Energy Savings: ${data.energySavings}%
- ROI: ${data.roiPercentage}%
- Payback Period: ${data.paybackPeriod || 'TBD'} months
- Annual Operating Savings: $${data.annualSavings || 0}

Yield Projections:
- Annual Yield Estimate: ${data.annualYieldEstimate} lbs
- Yield Improvement: ${data.yieldImprovement || 0}%
- Quality Grade Improvement: ${data.qualityImprovement || 'TBD'}

View full report: ${data.reportUrl}`
  }

  disconnect(): void {
    if (this.conn) {
      this.conn.logout()
      this.conn = null
    }
  }
}

export const salesforce = new SalesforceClient()

// API route handler
export async function pushToSalesforce(opportunityId: string, data: any) {
  try {
    const result = await salesforce.updateOpportunity(opportunityId, data)
    return { success: true, result }
  } catch (error) {
    console.error('Salesforce update error:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}