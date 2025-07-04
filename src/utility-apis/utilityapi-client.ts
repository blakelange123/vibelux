import axios, { AxiosInstance } from 'axios';
import { prisma } from '@/lib/prisma';
import { encrypt, decrypt } from '../security/encryption';

interface UtilityAPIConfig {
  baseUrl: string;
  apiKey: string;
  apiSecret: string;
}

interface UtilityAccount {
  uid: string;
  utility: string;
  utilityName: string;
  accountNumber: string;
  serviceAddress: string;
  status: 'active' | 'inactive' | 'pending';
  bills: UtilityBill[];
}

interface UtilityBill {
  uid: string;
  updated: string;
  created: string;
  sourceUrls: string[];
  utility: string;
  utilityName: string;
  accountNumber: string;
  serviceAddress: string;
  serviceClass: string;
  statementDate: string;
  serviceStartDate: string;
  serviceEndDate: string;
  totalCost: number;
  totalUsageKwh: number;
  peakDemandKw?: number;
  lineItems: BillLineItem[];
}

interface BillLineItem {
  name: string;
  cost: number;
  usage?: number;
  rate?: number;
  unit?: string;
}

export class UtilityAPIClient {
  private client: AxiosInstance;
  private config: UtilityAPIConfig;

  constructor() {
    this.config = {
      baseUrl: 'https://utilityapi.com/api/v2',
      apiKey: process.env.UTILITYAPI_KEY!,
      apiSecret: process.env.UTILITYAPI_SECRET!,
    };

    this.client = axios.create({
      baseURL: this.config.baseUrl,
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
        'Content-Type': 'application/json',
      },
      timeout: 30000,
    });

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        console.error('UtilityAPI Error:', error.response?.data || error.message);
        throw error;
      }
    );
  }

  /**
   * Initialize OAuth flow for utility connection
   */
  async initiateConnection(customerId: string, utility: string): Promise<{
    authorizationUrl: string;
    state: string;
  }> {
    const state = this.generateState(customerId, utility);
    const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/utility/callback`;

    const authUrl = `${this.config.baseUrl}/authorizations/request?` +
      `utility=${encodeURIComponent(utility)}&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `state=${encodeURIComponent(state)}`;

    // Store pending authorization
    await prisma.utilityAuthorization.create({
      data: {
        customerId,
        utility,
        state,
        status: 'PENDING',
        authUrl,
        expiresAt: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes
        createdAt: new Date(),
      }
    });

    return { authorizationUrl: authUrl, state };
  }

  /**
   * Complete OAuth flow and get access token
   */
  async completeAuthorization(
    code: string,
    state: string
  ): Promise<{ success: boolean; customerId: string }> {
    // Verify state and get authorization record
    const auth = await prisma.utilityAuthorization.findFirst({
      where: { state, status: 'PENDING' }
    });

    if (!auth || auth.expiresAt < new Date()) {
      throw new Error('Invalid or expired authorization state');
    }

    try {
      // Exchange code for access token
      const response = await this.client.post('/authorizations', {
        code,
        utility: auth.utility,
      });

      const authData = response.data;

      // Store encrypted access token
      const encryptedToken = encrypt(authData.token);

      await prisma.utilityConnection.create({
        data: {
          customerId: auth.customerId,
          utilityProvider: auth.utility,
          apiProvider: 'utilityapi',
          utilityAccountId: authData.uid,
          status: 'ACTIVE',
          accessToken: encryptedToken,
          tokenExpiresAt: authData.expires_at ? new Date(authData.expires_at) : null,
          createdAt: new Date(),
        }
      });

      // Update authorization status
      await prisma.utilityAuthorization.update({
        where: { id: auth.id },
        data: { status: 'COMPLETED' }
      });

      // Immediately pull initial data
      await this.syncCustomerData(auth.customerId);

      return { success: true, customerId: auth.customerId };

    } catch (error) {
      await prisma.utilityAuthorization.update({
        where: { id: auth.id },
        data: { status: 'FAILED' }
      });
      throw error;
    }
  }

  /**
   * Sync all data for a customer
   */
  async syncCustomerData(customerId: string): Promise<void> {
    const connections = await prisma.utilityConnection.findMany({
      where: {
        customerId,
        status: 'ACTIVE',
        apiProvider: 'utilityapi'
      }
    });

    for (const connection of connections) {
      try {
        await this.syncConnectionData(connection);
      } catch (error) {
        console.error(`Failed to sync connection ${connection.id}:`, error);
        await this.markConnectionError(connection.id, error);
      }
    }
  }

  /**
   * Sync data for specific connection
   */
  private async syncConnectionData(connection: any): Promise<void> {
    const accessToken = decrypt(connection.accessToken);
    
    // Get account details
    const accountResponse = await this.client.get(`/accounts/${connection.utilityAccountId}`, {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    });

    const account: UtilityAccount = accountResponse.data;

    // Get bills for the account
    const billsResponse = await this.client.get(`/accounts/${connection.utilityAccountId}/bills`, {
      headers: { 'Authorization': `Bearer ${accessToken}` },
      params: {
        limit: 24, // Last 24 months
        order: '-statement_date'
      }
    });

    const bills: UtilityBill[] = billsResponse.data.results;

    // Process and store bills
    for (const bill of bills) {
      await this.processBill(connection.customerId, bill);
    }

    // Update connection sync time
    await prisma.utilityConnection.update({
      where: { id: connection.id },
      data: { lastSyncAt: new Date() }
    });
  }

  /**
   * Process and store utility bill
   */
  private async processBill(customerId: string, bill: UtilityBill): Promise<void> {
    // Check if bill already exists
    const existing = await prisma.utilityBillData.findFirst({
      where: {
        customerId,
        accountNumber: bill.accountNumber,
        billDate: new Date(bill.statementDate),
      }
    });

    if (existing) {
      return;
    }

    // Calculate demand charges
    const demandCharges = bill.lineItems
      .filter(item => item.name.toLowerCase().includes('demand'))
      .reduce((sum, item) => sum + item.cost, 0);

    // Calculate energy charges
    const energyCharges = bill.lineItems
      .filter(item => item.usage && item.usage > 0)
      .reduce((sum, item) => sum + item.cost, 0);

    // Create bill record
    await prisma.utilityBillData.create({
      data: {
        customerId,
        accountNumber: bill.accountNumber,
        billDate: new Date(bill.statementDate),
        startDate: new Date(bill.serviceStartDate),
        endDate: new Date(bill.serviceEndDate),
        kwhUsed: bill.totalUsageKwh,
        peakDemandKw: bill.peakDemandKw || 0,
        totalCost: bill.totalCost,
        energyCharges,
        demandCharges,
        otherCharges: bill.totalCost - energyCharges - demandCharges,
        rateSchedule: bill.serviceClass,
        utility: bill.utilityName,
        verificationStatus: 'VERIFIED',
        source: 'UTILITYAPI',
        externalId: bill.uid,
        lineItems: bill.lineItems,
        createdAt: new Date(),
      }
    });

  }

  /**
   * Get available utilities for a service address
   */
  async getUtilitiesForAddress(address: string): Promise<any[]> {
    try {
      const response = await this.client.get('/utilities', {
        params: { address }
      });
      return response.data.results;
    } catch (error) {
      console.error('Failed to get utilities for address:', error);
      return [];
    }
  }

  /**
   * Validate utility connection
   */
  async validateConnection(connectionId: string): Promise<boolean> {
    const connection = await prisma.utilityConnection.findUnique({
      where: { id: connectionId }
    });

    if (!connection) return false;

    try {
      const accessToken = decrypt(connection.accessToken!);
      
      const response = await this.client.get(`/accounts/${connection.utilityAccountId}`, {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      });

      return response.status === 200;
    } catch (error) {
      await this.markConnectionError(connectionId, error);
      return false;
    }
  }

  /**
   * Refresh expired token
   */
  async refreshToken(connectionId: string): Promise<boolean> {
    const connection = await prisma.utilityConnection.findUnique({
      where: { id: connectionId }
    });

    if (!connection) return false;

    try {
      const response = await this.client.post('/auth/refresh', {
        refresh_token: decrypt(connection.refreshToken || ''),
      });

      const newToken = encrypt(response.data.access_token);
      
      await prisma.utilityConnection.update({
        where: { id: connectionId },
        data: {
          accessToken: newToken,
          tokenExpiresAt: new Date(response.data.expires_at),
          status: 'ACTIVE',
        }
      });

      return true;
    } catch (error) {
      await this.markConnectionError(connectionId, error);
      return false;
    }
  }

  /**
   * Get connection status for customer
   */
  async getConnectionStatus(customerId: string): Promise<any[]> {
    const connections = await prisma.utilityConnection.findMany({
      where: { customerId },
      include: {
        bills: {
          orderBy: { billDate: 'desc' },
          take: 1,
        }
      }
    });

    return connections.map(conn => ({
      id: conn.id,
      utility: conn.utilityProvider,
      status: conn.status,
      lastSync: conn.lastSyncAt,
      lastBill: conn.bills[0]?.billDate,
      billCount: conn.bills.length,
    }));
  }

  /**
   * Manual sync trigger
   */
  async triggerSync(customerId: string): Promise<{ success: boolean; synced: number; errors: number }> {
    const connections = await prisma.utilityConnection.findMany({
      where: { customerId, status: 'ACTIVE' }
    });

    let synced = 0;
    let errors = 0;

    for (const connection of connections) {
      try {
        await this.syncConnectionData(connection);
        synced++;
      } catch (error) {
        errors++;
        console.error(`Sync failed for connection ${connection.id}:`, error);
      }
    }

    return { success: errors === 0, synced, errors };
  }

  /**
   * Get bill data for analysis
   */
  async getBillDataForAnalysis(
    customerId: string,
    startDate: Date,
    endDate: Date
  ): Promise<any[]> {
    return await prisma.utilityBillData.findMany({
      where: {
        customerId,
        billDate: {
          gte: startDate,
          lte: endDate,
        },
        source: 'UTILITYAPI',
      },
      orderBy: { billDate: 'asc' }
    });
  }

  // Helper methods
  private generateState(customerId: string, utility: string): string {
    const data = { customerId, utility, timestamp: Date.now() };
    return encrypt(JSON.stringify(data));
  }

  private async markConnectionError(connectionId: string, error: any): Promise<void> {
    await prisma.utilityConnection.update({
      where: { id: connectionId },
      data: {
        status: 'ERROR',
        lastError: error.message,
        lastErrorAt: new Date(),
      }
    });
  }

  /**
   * Bulk sync all active connections
   */
  async bulkSync(): Promise<{ processed: number; successful: number; failed: number }> {
    const activeConnections = await prisma.utilityConnection.findMany({
      where: {
        status: 'ACTIVE',
        apiProvider: 'utilityapi',
        OR: [
          { lastSyncAt: null },
          { lastSyncAt: { lt: new Date(Date.now() - 24 * 60 * 60 * 1000) } }
        ]
      }
    });

    let successful = 0;
    let failed = 0;


    for (const connection of activeConnections) {
      try {
        await this.syncConnectionData(connection);
        successful++;
      } catch (error) {
        failed++;
        console.error(`Bulk sync failed for ${connection.id}:`, error);
        await this.markConnectionError(connection.id, error);
      }

      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    }


    return {
      processed: activeConnections.length,
      successful,
      failed,
    };
  }
}