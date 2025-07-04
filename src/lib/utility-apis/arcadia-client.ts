import axios, { AxiosInstance } from 'axios';
import { prisma } from '@/lib/prisma';
import { encrypt, decrypt } from '../security/encryption';

interface ArcadiaConfig {
  baseUrl: string;
  clientId: string;
  clientSecret: string;
}

interface ArcadiaAccount {
  id: string;
  utility_name: string;
  account_number: string;
  service_address: {
    street: string;
    city: string;
    state: string;
    zip: string;
  };
  status: 'connected' | 'disconnected' | 'pending';
  rate_schedule?: string;
}

interface ArcadiaBill {
  id: string;
  account_id: string;
  statement_date: string;
  start_date: string;
  end_date: string;
  total_cost: number;
  total_usage_kwh: number;
  peak_demand_kw?: number;
  line_items: ArcadiaLineItem[];
  pdf_url?: string;
}

interface ArcadiaLineItem {
  description: string;
  amount: number;
  quantity?: number;
  rate?: number;
  unit?: string;
  category: 'energy' | 'demand' | 'delivery' | 'taxes' | 'fees';
}

export class ArcadiaClient {
  private client: AxiosInstance;
  private config: ArcadiaConfig;

  constructor() {
    this.config = {
      baseUrl: 'https://api.arcadia.com/v1',
      clientId: process.env.ARCADIA_CLIENT_ID!,
      clientSecret: process.env.ARCADIA_CLIENT_SECRET!,
    };

    this.client = axios.create({
      baseURL: this.config.baseUrl,
      timeout: 30000,
    });

    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        console.error('Arcadia API Error:', error.response?.data || error.message);
        throw error;
      }
    );
  }

  /**
   * Get OAuth access token
   */
  private async getAccessToken(): Promise<string> {
    const response = await this.client.post('/oauth/token', {
      grant_type: 'client_credentials',
      client_id: this.config.clientId,
      client_secret: this.config.clientSecret,
      scope: 'utility_data:read'
    });

    return response.data.access_token;
  }

  /**
   * Initialize customer connection flow
   */
  async initiateConnection(customerId: string, utilityName: string): Promise<{
    connectUrl: string;
    state: string;
  }> {
    const accessToken = await this.getAccessToken();
    const state = this.generateState(customerId, utilityName);

    const response = await this.client.post('/connections/initiate', {
      utility_name: utilityName,
      redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/utility/arcadia/callback`,
      state,
      customer_info: {
        external_id: customerId,
      }
    }, {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    });

    // Store pending connection
    await prisma.utilityAuthorization.create({
      data: {
        customerId,
        utility: utilityName,
        state,
        status: 'PENDING',
        authUrl: response.data.connect_url,
        provider: 'arcadia',
        expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
        createdAt: new Date(),
      }
    });

    return {
      connectUrl: response.data.connect_url,
      state,
    };
  }

  /**
   * Handle connection completion
   */
  async completeConnection(connectionId: string, state: string): Promise<{
    success: boolean;
    customerId: string;
  }> {
    const auth = await prisma.utilityAuthorization.findFirst({
      where: { state, status: 'PENDING', provider: 'arcadia' }
    });

    if (!auth || auth.expiresAt < new Date()) {
      throw new Error('Invalid or expired authorization');
    }

    const accessToken = await this.getAccessToken();

    try {
      // Get connection details
      const response = await this.client.get(`/connections/${connectionId}`, {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      });

      const connectionData = response.data;

      if (connectionData.status !== 'connected') {
        throw new Error(`Connection failed with status: ${connectionData.status}`);
      }

      // Store connection
      await prisma.utilityConnection.create({
        data: {
          customerId: auth.customerId,
          utilityProvider: auth.utility,
          apiProvider: 'arcadia',
          utilityAccountId: connectionData.account_id,
          status: 'ACTIVE',
          accessToken: encrypt(accessToken), // Store encrypted token
          externalConnectionId: connectionId,
          createdAt: new Date(),
        }
      });

      // Update authorization
      await prisma.utilityAuthorization.update({
        where: { id: auth.id },
        data: { status: 'COMPLETED' }
      });

      // Pull initial data
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
   * Sync customer data
   */
  async syncCustomerData(customerId: string): Promise<void> {
    const connections = await prisma.utilityConnection.findMany({
      where: {
        customerId,
        status: 'ACTIVE',
        apiProvider: 'arcadia'
      }
    });

    for (const connection of connections) {
      try {
        await this.syncConnectionData(connection);
      } catch (error) {
        console.error(`Failed to sync Arcadia connection ${connection.id}:`, error);
        await this.markConnectionError(connection.id, error);
      }
    }
  }

  /**
   * Sync data for specific connection
   */
  private async syncConnectionData(connection: any): Promise<void> {
    const accessToken = await this.getAccessToken();

    // Get account details
    const accountResponse = await this.client.get(`/accounts/${connection.utilityAccountId}`, {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    });

    const account: ArcadiaAccount = accountResponse.data;

    // Get bills
    const billsResponse = await this.client.get(`/accounts/${connection.utilityAccountId}/bills`, {
      headers: { 'Authorization': `Bearer ${accessToken}` },
      params: {
        limit: 24,
        sort: '-statement_date'
      }
    });

    const bills: ArcadiaBill[] = billsResponse.data.results;

    // Process bills
    for (const bill of bills) {
      await this.processBill(connection.customerId, bill, account);
    }

    // Update sync time
    await prisma.utilityConnection.update({
      where: { id: connection.id },
      data: { lastSyncAt: new Date() }
    });
  }

  /**
   * Process and store bill
   */
  private async processBill(customerId: string, bill: ArcadiaBill, account: ArcadiaAccount): Promise<void> {
    // Check if exists
    const existing = await prisma.utilityBillData.findFirst({
      where: {
        customerId,
        accountNumber: account.account_number,
        billDate: new Date(bill.statement_date),
        source: 'ARCADIA',
      }
    });

    if (existing) return;

    // Categorize charges
    const energyCharges = bill.line_items
      .filter(item => item.category === 'energy')
      .reduce((sum, item) => sum + item.amount, 0);

    const demandCharges = bill.line_items
      .filter(item => item.category === 'demand')
      .reduce((sum, item) => sum + item.amount, 0);

    const deliveryCharges = bill.line_items
      .filter(item => item.category === 'delivery')
      .reduce((sum, item) => sum + item.amount, 0);

    const taxes = bill.line_items
      .filter(item => item.category === 'taxes')
      .reduce((sum, item) => sum + item.amount, 0);

    const fees = bill.line_items
      .filter(item => item.category === 'fees')
      .reduce((sum, item) => sum + item.amount, 0);

    // Store bill
    await prisma.utilityBillData.create({
      data: {
        customerId,
        accountNumber: account.account_number,
        billDate: new Date(bill.statement_date),
        startDate: new Date(bill.start_date),
        endDate: new Date(bill.end_date),
        kwhUsed: bill.total_usage_kwh,
        peakDemandKw: bill.peak_demand_kw || 0,
        totalCost: bill.total_cost,
        energyCharges,
        demandCharges,
        deliveryCharges,
        taxes,
        fees,
        otherCharges: bill.total_cost - energyCharges - demandCharges - deliveryCharges - taxes - fees,
        rateSchedule: account.rate_schedule || 'UNKNOWN',
        utility: account.utility_name,
        serviceAddress: `${account.service_address.street}, ${account.service_address.city}, ${account.service_address.state} ${account.service_address.zip}`,
        verificationStatus: 'VERIFIED',
        source: 'ARCADIA',
        externalId: bill.id,
        lineItems: bill.line_items,
        pdfUrl: bill.pdf_url,
        createdAt: new Date(),
      }
    });

  }

  /**
   * Get available utilities by location
   */
  async getUtilitiesByLocation(zipCode: string): Promise<any[]> {
    const accessToken = await this.getAccessToken();

    try {
      const response = await this.client.get('/utilities/search', {
        headers: { 'Authorization': `Bearer ${accessToken}` },
        params: { zip_code: zipCode }
      });

      return response.data.utilities.map((utility: any) => ({
        name: utility.name,
        service_area: utility.service_area,
        supported: utility.supported,
        connection_type: utility.connection_type,
      }));
    } catch (error) {
      console.error('Failed to get utilities by location:', error);
      return [];
    }
  }

  /**
   * Check connection health
   */
  async checkConnectionHealth(connectionId: string): Promise<{
    healthy: boolean;
    lastUpdate: Date | null;
    issues: string[];
  }> {
    const connection = await prisma.utilityConnection.findUnique({
      where: { id: connectionId }
    });

    if (!connection) {
      return { healthy: false, lastUpdate: null, issues: ['Connection not found'] };
    }

    const accessToken = await this.getAccessToken();
    const issues: string[] = [];

    try {
      // Check account status
      const response = await this.client.get(`/accounts/${connection.utilityAccountId}`, {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      });

      const account = response.data;
      
      if (account.status !== 'connected') {
        issues.push(`Account status: ${account.status}`);
      }

      // Check for recent data
      const recentBills = await prisma.utilityBillData.findMany({
        where: {
          customerId: connection.customerId,
          source: 'ARCADIA',
          billDate: {
            gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) // 90 days
          }
        }
      });

      if (recentBills.length === 0) {
        issues.push('No recent bill data');
      }

      return {
        healthy: issues.length === 0,
        lastUpdate: connection.lastSyncAt,
        issues,
      };

    } catch (error) {
      issues.push(`API error: ${error.message}`);
      return { healthy: false, lastUpdate: connection.lastSyncAt, issues };
    }
  }

  /**
   * Disconnect utility account
   */
  async disconnectAccount(connectionId: string): Promise<boolean> {
    const connection = await prisma.utilityConnection.findUnique({
      where: { id: connectionId }
    });

    if (!connection) return false;

    const accessToken = await this.getAccessToken();

    try {
      // Disconnect from Arcadia
      await this.client.delete(`/connections/${connection.externalConnectionId}`, {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      });

      // Update local connection
      await prisma.utilityConnection.update({
        where: { id: connectionId },
        data: {
          status: 'DISCONNECTED',
          disconnectedAt: new Date(),
        }
      });

      return true;
    } catch (error) {
      console.error('Failed to disconnect Arcadia account:', error);
      return false;
    }
  }

  /**
   * Bulk sync all Arcadia connections
   */
  async bulkSync(): Promise<{ processed: number; successful: number; failed: number }> {
    const connections = await prisma.utilityConnection.findMany({
      where: {
        status: 'ACTIVE',
        apiProvider: 'arcadia',
        OR: [
          { lastSyncAt: null },
          { lastSyncAt: { lt: new Date(Date.now() - 24 * 60 * 60 * 1000) } }
        ]
      }
    });

    let successful = 0;
    let failed = 0;


    for (const connection of connections) {
      try {
        await this.syncConnectionData(connection);
        successful++;
      } catch (error) {
        failed++;
        await this.markConnectionError(connection.id, error);
      }

      // Rate limiting delay
      await new Promise(resolve => setTimeout(resolve, 200));
    }

    return {
      processed: connections.length,
      successful,
      failed,
    };
  }

  // Helper methods
  private generateState(customerId: string, utility: string): string {
    const data = { customerId, utility, timestamp: Date.now(), provider: 'arcadia' };
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
}