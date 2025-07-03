import { prisma } from '@/lib/prisma';

export class TestDataGenerator {
  /**
   * Create test customer
   */
  static async createTestCustomer(overrides: any = {}): Promise<any> {
    return await prisma.customer.create({
      data: {
        companyName: 'Test Farm Inc.',
        contactName: 'John Doe',
        contactEmail: `test-${Date.now()}@example.com`,
        phone: '555-0123',
        address: '123 Farm Road',
        city: 'Farmville',
        state: 'CA',
        zipCode: '90210',
        subscriptionTier: 'BASIC',
        status: 'ACTIVE',
        ...overrides,
      }
    });
  }

  /**
   * Create test utility connection
   */
  static async createTestUtilityConnection(customerId: string, overrides: any = {}): Promise<any> {
    return await prisma.utilityConnection.create({
      data: {
        customerId,
        utilityProvider: 'Pacific Gas & Electric',
        apiProvider: 'utilityapi',
        utilityAccountId: 'test-account-123',
        status: 'ACTIVE',
        accessToken: 'encrypted-token',
        lastSyncAt: new Date(),
        ...overrides,
      }
    });
  }

  /**
   * Create test utility bill data
   */
  static async createTestUtilityBill(customerId: string, overrides: any = {}): Promise<any> {
    const billDate = new Date();
    const startDate = new Date(billDate.getTime() - 30 * 24 * 60 * 60 * 1000);
    const endDate = new Date(billDate.getTime() - 1 * 24 * 60 * 60 * 1000);

    return await prisma.utilityBillData.create({
      data: {
        customerId,
        accountNumber: '123456789',
        billDate,
        startDate,
        endDate,
        kwhUsed: 1000,
        peakDemandKw: 50,
        totalCost: 150.00,
        energyCharges: 100.00,
        demandCharges: 30.00,
        taxes: 15.00,
        fees: 5.00,
        rateSchedule: 'E-19',
        utility: 'Pacific Gas & Electric',
        verificationStatus: 'VERIFIED',
        source: 'UTILITYAPI',
        ...overrides,
      }
    });
  }

  /**
   * Create test invoice
   */
  static async createTestInvoice(customerId: string, overrides: any = {}): Promise<any> {
    const billingPeriodStart = new Date();
    billingPeriodStart.setMonth(billingPeriodStart.getMonth() - 1);
    const billingPeriodEnd = new Date();

    return await prisma.invoice.create({
      data: {
        customerId,
        invoiceNumber: `INV-${Date.now()}`,
        type: 'REVENUE_SHARE',
        billingPeriodStart,
        billingPeriodEnd,
        baselineUsage: 1200,
        actualUsage: 1000,
        energySaved: 200,
        costSavings: 50.00,
        revenueSharingRate: 0.20,
        invoiceAmount: 10.00,
        totalAmount: 10.00,
        status: 'DRAFT',
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        verificationData: {},
        ...overrides,
      }
    });
  }

  /**
   * Create test API key
   */
  static async createTestApiKey(customerId: string, overrides: any = {}): Promise<any> {
    const crypto = require('crypto');
    const keyHash = crypto.createHash('sha256').update(`test-key-${Date.now()}`).digest('hex');

    return await prisma.apiKey.create({
      data: {
        customerId,
        keyHash,
        permissions: ['api:read', 'utility:read'],
        rateLimit: 1000,
        active: true,
        ...overrides,
      }
    });
  }

  /**
   * Create test IoT readings
   */
  static async createTestIoTReadings(facilityId: string, count: number = 10): Promise<any[]> {
    const readings = [];
    
    for (let i = 0; i < count; i++) {
      const timestamp = new Date(Date.now() - i * 15 * 60 * 1000); // 15-minute intervals
      
      readings.push({
        facilityId,
        timestamp,
        energyUsage: 45 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 10,
        powerDemand: 180 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 40,
        voltage: 480 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 10,
        current: 375 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 50,
        powerFactor: 0.85 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 0.1,
        temperature: 22 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 4,
        humidity: 55 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 10,
        co2Level: 800 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 200,
        lightLevel: 500 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 300,
        equipmentStatus: {
          lighting: { status: 'online', dimLevel: 80 },
          hvac: { status: 'online', setpoint: 72 },
        },
        alarms: [],
        baselineUsage: 50,
        optimizationSavings: 5,
        dataQuality: 0.95,
        sensorHealth: {
          energyMeter: { status: 'healthy', accuracy: 0.99 },
          temperatureSensor: { status: 'healthy', accuracy: 0.98 },
        },
      });
    }

    return await prisma.ioTReading.createMany({
      data: readings,
    });
  }

  /**
   * Clean up test data
   */
  static async cleanupTestData(): Promise<void> {
    // Delete in reverse dependency order
    await prisma.ioTReading.deleteMany({
      where: { facilityId: { startsWith: 'test-' } }
    });
    
    await prisma.apiKey.deleteMany({
      where: { customer: { contactEmail: { contains: 'test-' } } }
    });
    
    await prisma.invoice.deleteMany({
      where: { customer: { contactEmail: { contains: 'test-' } } }
    });
    
    await prisma.utilityBillData.deleteMany({
      where: { customer: { contactEmail: { contains: 'test-' } } }
    });
    
    await prisma.utilityConnection.deleteMany({
      where: { customer: { contactEmail: { contains: 'test-' } } }
    });
    
    await prisma.customer.deleteMany({
      where: { contactEmail: { contains: 'test-' } }
    });
  }
}

export class TestHelpers {
  /**
   * Generate test JWT token
   */
  static generateTestJWT(userId: string, role: string = 'USER'): string {
    const jwt = require('jsonwebtoken');
    return jwt.sign(
      { userId, role },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '1h' }
    );
  }

  /**
   * Generate test API key
   */
  static generateTestApiKey(): string {
    const crypto = require('crypto');
    return `vbl_${crypto.randomBytes(32).toString('hex')}`;
  }

  /**
   * Create authorization header for tests
   */
  static createAuthHeader(token: string, type: 'Bearer' | 'ApiKey' = 'Bearer'): string {
    return `${type} ${token}`;
  }

  /**
   * Wait for async operations
   */
  static async sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Assert response structure
   */
  static assertApiResponse(response: any, expectedStatus: number): void {
    if (response.status !== expectedStatus) {
      throw new Error(`Expected status ${expectedStatus}, got ${response.status}: ${JSON.stringify(response.data)}`);
    }

    if (!response.data || typeof response.data.success !== 'boolean') {
      throw new Error('Response missing success field');
    }
  }

  /**
   * Mock external API responses
   */
  static mockUtilityAPIResponse(): any {
    return {
      uid: 'test-utility-123',
      utility: 'pge',
      utilityName: 'Pacific Gas & Electric',
      accountNumber: '123456789',
      serviceAddress: '123 Test St, Test City, CA 90210',
      bills: [
        {
          uid: 'bill-123',
          statementDate: '2024-01-15',
          serviceStartDate: '2023-12-15',
          serviceEndDate: '2024-01-14',
          totalCost: 150.00,
          totalUsageKwh: 1000,
          peakDemandKw: 50,
          lineItems: [
            { name: 'Energy Charge', cost: 100.00, usage: 1000, rate: 0.10, unit: 'kWh' },
            { name: 'Demand Charge', cost: 30.00, usage: 50, rate: 0.60, unit: 'kW' },
            { name: 'Delivery Charge', cost: 15.00 },
            { name: 'Taxes', cost: 5.00 }
          ]
        }
      ]
    };
  }

  /**
   * Mock ML prediction response
   */
  static mockMLPredictionResponse(): any {
    return {
      predictedYield: 4.2,
      confidence: 0.89,
      limitingFactors: ['Light intensity could be optimized'],
      optimizationSuggestions: ['Increase PPFD to 600-800 μmol/m²/s'],
      potentialYield: 5.6,
      modelType: 'analytical'
    };
  }

  /**
   * Mock sensor reading
   */
  static mockSensorReading(): any {
    return {
      timestamp: new Date(),
      value: 45.5,
      unit: 'kWh',
      quality: 'good',
      stability: 'stable',
      raw: 101640
    };
  }
}