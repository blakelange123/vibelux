import axios from 'axios';
import { prisma } from '@/lib/prisma';
import { addMonths, subMonths, startOfMonth, endOfMonth, format } from 'date-fns';
import crypto from 'crypto';

interface UtilityBillData {
  accountNumber: string;
  billDate: Date;
  startDate: Date;
  endDate: Date;
  kwhUsed: number;
  peakDemandKw: number;
  totalCost: number;
  rateSchedule: string;
  meterReadings: {
    previous: number;
    current: number;
    multiplier: number;
  };
}

interface UtilityApiConfig {
  apiKey: string;
  apiSecret: string;
  baseUrl: string;
  provider: 'utilityapi' | 'arcadia' | 'urjanet';
}

export class UtilityIntegrationClient {
  private configs: Map<string, UtilityApiConfig>;
  
  constructor() {
    this.configs = new Map([
      ['utilityapi', {
        apiKey: process.env.UTILITYAPI_KEY!,
        apiSecret: process.env.UTILITYAPI_SECRET!,
        baseUrl: 'https://utilityapi.com/api/v2',
        provider: 'utilityapi'
      }],
      ['arcadia', {
        apiKey: process.env.ARCADIA_API_KEY!,
        apiSecret: process.env.ARCADIA_API_SECRET!,
        baseUrl: 'https://api.arcadia.com/v2',
        provider: 'arcadia'
      }],
      ['urjanet', {
        apiKey: process.env.URJANET_API_KEY!,
        apiSecret: process.env.URJANET_API_SECRET!,
        baseUrl: 'https://api.urjanet.com/v1',
        provider: 'urjanet'
      }]
    ]);
  }

  /**
   * Connect customer utility account and pull historical data
   */
  async connectUtilityAccount(customerId: string, utilityProvider: string): Promise<void> {
    
    const customer = await prisma.user.findUnique({
      where: { id: customerId },
      include: { facilities: { include: { facility: true } } }
    });
    
    if (!customer) throw new Error('Customer not found');
    
    // Determine best API provider based on utility
    const apiProvider = this.selectApiProvider(utilityProvider);
    const config = this.configs.get(apiProvider);
    
    if (!config) throw new Error(`No API configuration for provider: ${apiProvider}`);
    
    // Create authorization request
    const authUrl = await this.createAuthorizationUrl(config, customer);
    
    // Store pending connection
    await prisma.utilityConnection.create({
      data: {
        customerId,
        utilityProvider,
        apiProvider,
        status: 'PENDING_AUTH',
        authorizationUrl: authUrl,
        createdAt: new Date(),
      }
    });
    
    // Send authorization email to customer
    await this.sendAuthorizationEmail(customer, authUrl);
  }

  /**
   * Handle OAuth callback from utility provider
   */
  async handleOAuthCallback(code: string, state: string): Promise<void> {
    // Decrypt state to get connection ID
    const connectionId = this.decryptState(state);
    
    const connection = await prisma.utilityConnection.findUnique({
      where: { id: connectionId },
      include: { customer: true }
    });
    
    if (!connection) throw new Error('Invalid connection state');
    
    const config = this.configs.get(connection.apiProvider);
    if (!config) throw new Error('Invalid API provider');
    
    // Exchange code for access token
    const tokens = await this.exchangeCodeForTokens(config, code);
    
    // Update connection with tokens
    await prisma.utilityConnection.update({
      where: { id: connectionId },
      data: {
        status: 'CONNECTED',
        accessToken: this.encrypt(tokens.accessToken),
        refreshToken: this.encrypt(tokens.refreshToken),
        tokenExpiresAt: new Date(Date.now() + tokens.expiresIn * 1000),
      }
    });
    
    // Start pulling historical data
    await this.pullHistoricalData(connectionId);
  }

  /**
   * Pull 12 months of historical utility data
   */
  async pullHistoricalData(connectionId: string): Promise<void> {
    const connection = await prisma.utilityConnection.findUnique({
      where: { id: connectionId },
      include: { 
        customer: { 
          include: { 
            facilities: { 
              include: { facility: true } 
            } 
          } 
        } 
      }
    });
    
    if (!connection) throw new Error('Connection not found');
    
    const config = this.configs.get(connection.apiProvider);
    if (!config) throw new Error('Invalid API provider');
    
    // Refresh token if needed
    if (connection.tokenExpiresAt < new Date()) {
      await this.refreshAccessToken(connection);
    }
    
    const accessToken = this.decrypt(connection.accessToken!);
    
    // Pull last 12 months of bills
    const endDate = new Date();
    const startDate = subMonths(endDate, 12);
    
    try {
      const bills = await this.fetchBillsFromApi(
        config,
        accessToken,
        connection.utilityAccountId!,
        startDate,
        endDate
      );
      
      // Store bills in database
      for (const bill of bills) {
        await this.storeBillData(connection.customerId, bill);
      }
      
      // Calculate and store baseline
      await this.calculateBaseline(connection.customerId);
      
      // Update connection status
      await prisma.utilityConnection.update({
        where: { id: connectionId },
        data: {
          status: 'ACTIVE',
          lastSyncAt: new Date(),
        }
      });
      
    } catch (error) {
      console.error('Failed to pull historical data:', error);
      await prisma.utilityConnection.update({
        where: { id: connectionId },
        data: {
          status: 'ERROR',
          lastError: (error as Error).message,
        }
      });
    }
  }

  /**
   * Fetch bills from utility API
   */
  private async fetchBillsFromApi(
    config: UtilityApiConfig,
    accessToken: string,
    accountId: string,
    startDate: Date,
    endDate: Date
  ): Promise<UtilityBillData[]> {
    switch (config.provider) {
      case 'utilityapi':
        return this.fetchFromUtilityAPI(config, accessToken, accountId, startDate, endDate);
      case 'arcadia':
        return this.fetchFromArcadia(config, accessToken, accountId, startDate, endDate);
      case 'urjanet':
        return this.fetchFromUrjanet(config, accessToken, accountId, startDate, endDate);
      default:
        throw new Error(`Unsupported provider: ${config.provider}`);
    }
  }

  /**
   * Fetch from UtilityAPI.com
   */
  private async fetchFromUtilityAPI(
    config: UtilityApiConfig,
    accessToken: string,
    accountId: string,
    startDate: Date,
    endDate: Date
  ): Promise<UtilityBillData[]> {
    const response = await axios.get(`${config.baseUrl}/accounts/${accountId}/bills`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/json',
      },
      params: {
        start_date: format(startDate, 'yyyy-MM-dd'),
        end_date: format(endDate, 'yyyy-MM-dd'),
      }
    });
    
    return response.data.bills.map((bill: any) => ({
      accountNumber: bill.account_number,
      billDate: new Date(bill.bill_date),
      startDate: new Date(bill.service_start),
      endDate: new Date(bill.service_end),
      kwhUsed: bill.total_kwh,
      peakDemandKw: bill.peak_demand_kw || 0,
      totalCost: bill.total_charges,
      rateSchedule: bill.rate_schedule,
      meterReadings: {
        previous: bill.meter_readings.previous,
        current: bill.meter_readings.current,
        multiplier: bill.meter_readings.multiplier || 1,
      }
    }));
  }

  /**
   * Store bill data in database
   */
  private async storeBillData(customerId: string, bill: UtilityBillData): Promise<void> {
    await prisma.utilityBillData.create({
      data: {
        customerId,
        accountNumber: bill.accountNumber,
        billDate: bill.billDate,
        startDate: bill.startDate,
        endDate: bill.endDate,
        kwhUsed: bill.kwhUsed,
        peakDemandKw: bill.peakDemandKw,
        totalCost: bill.totalCost,
        rateSchedule: bill.rateSchedule,
        meterData: bill.meterReadings,
        verificationStatus: 'VERIFIED',
        source: 'UTILITY_API',
      }
    });
  }

  /**
   * Calculate baseline from historical data
   */
  private async calculateBaseline(customerId: string): Promise<void> {
    const historicalBills = await prisma.utilityBillData.findMany({
      where: {
        customerId,
        billDate: {
          gte: subMonths(new Date(), 12),
        }
      },
      orderBy: { billDate: 'asc' }
    });
    
    if (historicalBills.length < 12) {
      throw new Error('Insufficient historical data for baseline');
    }
    
    // Calculate monthly averages
    const monthlyData = historicalBills.map(bill => ({
      month: bill.billDate.getMonth(),
      year: bill.billDate.getFullYear(),
      kwhUsed: bill.kwhUsed,
      peakDemand: bill.peakDemandKw,
      cost: bill.totalCost,
    }));
    
    // Calculate baseline metrics
    const baseline = {
      averageMonthlyKwh: monthlyData.reduce((sum, m) => sum + m.kwhUsed, 0) / monthlyData.length,
      averageMonthlyPeakKw: monthlyData.reduce((sum, m) => sum + m.peakDemand, 0) / monthlyData.length,
      averageMonthlyCost: monthlyData.reduce((sum, m) => sum + m.cost, 0) / monthlyData.length,
      totalAnnualKwh: monthlyData.reduce((sum, m) => sum + m.kwhUsed, 0),
      totalAnnualCost: monthlyData.reduce((sum, m) => sum + m.cost, 0),
      monthlyVariation: this.calculateVariation(monthlyData.map(m => m.kwhUsed)),
    };
    
    // Store baseline
    await prisma.clientBaseline.upsert({
      where: { customerId },
      create: {
        customerId,
        ...baseline,
        establishedAt: new Date(),
        verificationMethod: 'UTILITY_API',
        confidence: 0.95, // High confidence from utility data
      },
      update: {
        ...baseline,
        updatedAt: new Date(),
      }
    });
  }

  /**
   * Verify savings against utility bills
   */
  async verifySavingsWithUtilityBills(
    customerId: string,
    startDate: Date,
    endDate: Date
  ): Promise<{
    verified: boolean;
    actualSavings: number;
    baselineUsage: number;
    actualUsage: number;
    savingsPercentage: number;
  }> {
    // Get baseline
    const baseline = await prisma.clientBaseline.findUnique({
      where: { customerId }
    });
    
    if (!baseline) {
      throw new Error('No baseline established for customer');
    }
    
    // Get current period bills
    const currentBills = await prisma.utilityBillData.findMany({
      where: {
        customerId,
        billDate: {
          gte: startDate,
          lte: endDate,
        }
      }
    });
    
    if (currentBills.length === 0) {
      // Pull latest bills from API
      await this.syncLatestBills(customerId);
      
      // Retry
      const updatedBills = await prisma.utilityBillData.findMany({
        where: {
          customerId,
          billDate: {
            gte: startDate,
            lte: endDate,
          }
        }
      });
      
      if (updatedBills.length === 0) {
        throw new Error('No utility bills available for verification period');
      }
      
      currentBills.push(...updatedBills);
    }
    
    // Calculate actual usage
    const actualUsage = currentBills.reduce((sum, bill) => sum + bill.kwhUsed, 0);
    const actualCost = currentBills.reduce((sum, bill) => sum + bill.totalCost, 0);
    
    // Calculate expected baseline usage for same period
    const monthsInPeriod = currentBills.length;
    const baselineUsage = baseline.averageMonthlyKwh * monthsInPeriod;
    const baselineCost = baseline.averageMonthlyCost * monthsInPeriod;
    
    // Apply weather normalization
    const weatherAdjustment = await this.getWeatherAdjustment(customerId, startDate, endDate);
    const adjustedBaselineUsage = baselineUsage * weatherAdjustment;
    
    // Calculate savings
    const actualSavings = baselineCost - actualCost;
    const savingsPercentage = ((baselineUsage - actualUsage) / baselineUsage) * 100;
    
    return {
      verified: true,
      actualSavings,
      baselineUsage: adjustedBaselineUsage,
      actualUsage,
      savingsPercentage,
    };
  }

  /**
   * Sync latest bills from utility API
   */
  private async syncLatestBills(customerId: string): Promise<void> {
    const connection = await prisma.utilityConnection.findFirst({
      where: {
        customerId,
        status: 'ACTIVE',
      }
    });
    
    if (!connection) {
      throw new Error('No active utility connection');
    }
    
    const config = this.configs.get(connection.apiProvider);
    if (!config) throw new Error('Invalid API provider');
    
    // Get last synced bill date
    const lastBill = await prisma.utilityBillData.findFirst({
      where: { customerId },
      orderBy: { billDate: 'desc' },
    });
    
    const startDate = lastBill ? addMonths(lastBill.billDate, 1) : subMonths(new Date(), 3);
    const endDate = new Date();
    
    // Refresh token if needed
    if (connection.tokenExpiresAt < new Date()) {
      await this.refreshAccessToken(connection);
    }
    
    const accessToken = this.decrypt(connection.accessToken!);
    
    // Fetch new bills
    const bills = await this.fetchBillsFromApi(
      config,
      accessToken,
      connection.utilityAccountId!,
      startDate,
      endDate
    );
    
    // Store new bills
    for (const bill of bills) {
      await this.storeBillData(customerId, bill);
    }
    
    // Update last sync
    await prisma.utilityConnection.update({
      where: { id: connection.id },
      data: { lastSyncAt: new Date() }
    });
  }

  /**
   * Get weather adjustment factor
   */
  private async getWeatherAdjustment(
    customerId: string,
    startDate: Date,
    endDate: Date
  ): Promise<number> {
    // This would integrate with weather APIs to calculate heating/cooling degree days
    // For now, returning a simple seasonal adjustment
    const month = startDate.getMonth();
    const seasonalFactors = [
      1.15, 1.10, 1.05, 0.95, 0.90, 0.85, // Jan-Jun
      0.85, 0.90, 0.95, 1.05, 1.10, 1.15  // Jul-Dec
    ];
    
    return seasonalFactors[month];
  }

  /**
   * Select best API provider for utility
   */
  private selectApiProvider(utilityProvider: string): string {
    // Map utilities to best API provider
    const providerMap: Record<string, string> = {
      'PGE': 'utilityapi',
      'ConEd': 'arcadia',
      'ComEd': 'utilityapi',
      'SDGE': 'arcadia',
      'Duke': 'urjanet',
      // Add more mappings
    };
    
    return providerMap[utilityProvider] || 'utilityapi';
  }

  /**
   * Create OAuth authorization URL
   */
  private async createAuthorizationUrl(config: UtilityApiConfig, customer: any): Promise<string> {
    const state = this.encryptState({
      customerId: customer.id,
      timestamp: Date.now(),
    });
    
    const params = new URLSearchParams({
      client_id: config.apiKey,
      redirect_uri: `${process.env.APP_URL}/api/utility/callback`,
      response_type: 'code',
      scope: 'bills meters accounts',
      state,
    });
    
    return `${config.baseUrl}/authorize?${params.toString()}`;
  }

  /**
   * Encrypt sensitive data
   */
  private encrypt(text: string): string {
    const algorithm = 'aes-256-gcm';
    const key = Buffer.from(process.env.ENCRYPTION_KEY!, 'hex');
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(algorithm, key, iv);
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag();
    
    return iv.toString('hex') + ':' + authTag.toString('hex') + ':' + encrypted;
  }

  /**
   * Decrypt sensitive data
   */
  private decrypt(text: string): string {
    const algorithm = 'aes-256-gcm';
    const key = Buffer.from(process.env.ENCRYPTION_KEY!, 'hex');
    
    const parts = text.split(':');
    const iv = Buffer.from(parts[0], 'hex');
    const authTag = Buffer.from(parts[1], 'hex');
    const encrypted = parts[2];
    
    const decipher = crypto.createDecipheriv(algorithm, key, iv);
    decipher.setAuthTag(authTag);
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }

  /**
   * Calculate standard deviation
   */
  private calculateVariation(values: number[]): number {
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    return Math.sqrt(variance);
  }

  // Additional helper methods...
  private encryptState(data: any): string {
    return this.encrypt(JSON.stringify(data));
  }

  private decryptState(state: string): string {
    const decrypted = this.decrypt(state);
    return JSON.parse(decrypted).customerId;
  }

  private async exchangeCodeForTokens(config: UtilityApiConfig, code: string): Promise<any> {
    // Implementation would vary by provider
    return {
      accessToken: 'mock_access_token',
      refreshToken: 'mock_refresh_token',
      expiresIn: 3600,
    };
  }

  private async refreshAccessToken(connection: any): Promise<void> {
    // Implementation to refresh OAuth token
  }

  private async sendAuthorizationEmail(customer: any, authUrl: string): Promise<void> {
    // Send email with authorization link
  }
}