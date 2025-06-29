import { prisma } from '@/lib/prisma';
import Anthropic from '@anthropic-ai/sdk';
import { createWorker } from 'tesseract.js';
import puppeteer from 'puppeteer';
import axios from 'axios';

interface UtilityProvider {
  name: string;
  coverage: string[];
  apiAvailable: boolean;
  scrapingMethod?: 'LOGIN_SCRAPE' | 'EMAIL_PARSE' | 'DOCUMENT_UPLOAD';
  loginUrl?: string;
  billFormat?: string;
}

interface BillData {
  accountNumber: string;
  serviceAddress: string;
  billDate: Date;
  dueDate: Date;
  billingPeriod: {
    start: Date;
    end: Date;
  };
  usage: {
    kwh: number;
    kw?: number;
  };
  charges: {
    energy: number;
    demand?: number;
    fees: number;
    taxes: number;
    total: number;
  };
  rateSchedule?: string;
  meterReadings?: {
    previous: number;
    current: number;
  };
}

export class UniversalUtilityConnector {
  private anthropic: Anthropic;
  private tesseractWorker: any;
  
  // Comprehensive utility provider database
  private utilityProviders: Map<string, UtilityProvider> = new Map([
    // Major API-Enabled Utilities
    ['PGE', {
      name: 'Pacific Gas & Electric',
      coverage: ['CA-Northern'],
      apiAvailable: true,
    }],
    ['SDGE', {
      name: 'San Diego Gas & Electric',
      coverage: ['CA-San Diego'],
      apiAvailable: true,
    }],
    ['SCE', {
      name: 'Southern California Edison',
      coverage: ['CA-Southern'],
      apiAvailable: true,
    }],
    ['ConEd', {
      name: 'Consolidated Edison',
      coverage: ['NY-NYC'],
      apiAvailable: true,
    }],
    ['ComEd', {
      name: 'Commonwealth Edison',
      coverage: ['IL-Chicago'],
      apiAvailable: true,
    }],
    
    // Scraping-Required Utilities
    ['PSE', {
      name: 'Puget Sound Energy',
      coverage: ['WA'],
      apiAvailable: false,
      scrapingMethod: 'LOGIN_SCRAPE',
      loginUrl: 'https://pse.com/account',
    }],
    ['Xcel', {
      name: 'Xcel Energy',
      coverage: ['CO', 'MN', 'TX', 'ND', 'SD', 'WI', 'MI', 'NM'],
      apiAvailable: false,
      scrapingMethod: 'LOGIN_SCRAPE',
      loginUrl: 'https://my.xcelenergy.com',
    }],
    ['Duke', {
      name: 'Duke Energy',
      coverage: ['NC', 'SC', 'FL', 'IN', 'OH', 'KY'],
      apiAvailable: false,
      scrapingMethod: 'LOGIN_SCRAPE',
      loginUrl: 'https://www.duke-energy.com/account',
    }],
    ['Dominion', {
      name: 'Dominion Energy',
      coverage: ['VA', 'NC', 'SC', 'OH', 'WV', 'UT'],
      apiAvailable: false,
      scrapingMethod: 'LOGIN_SCRAPE',
      loginUrl: 'https://www.dominionenergy.com/account',
    }],
    
    // Small/Rural Utilities (Document Upload Only)
    ['GENERIC_COOP', {
      name: 'Generic Rural Cooperative',
      coverage: ['RURAL'],
      apiAvailable: false,
      scrapingMethod: 'DOCUMENT_UPLOAD',
    }],
  ]);

  constructor() {
    this.anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY!,
    });
    this.initializeTesseract();
  }

  private async initializeTesseract(): Promise<void> {
    this.tesseractWorker = await createWorker();
    await this.tesseractWorker.loadLanguage('eng');
    await this.tesseractWorker.initialize('eng');
  }

  /**
   * Universal connection method that automatically determines best approach
   */
  async connectUtilityUniversal(
    customerId: string,
    zipCode: string,
    utilityName?: string
  ): Promise<{
    success: boolean;
    method: string;
    connectionId?: string;
    requiresCustomerAction?: boolean;
    instructions?: string;
  }> {

    // Step 1: Identify utility provider
    const provider = await this.identifyUtilityProvider(zipCode, utilityName);
    
    if (!provider) {
      return {
        success: false,
        method: 'MANUAL_FALLBACK',
        requiresCustomerAction: true,
        instructions: 'Please upload your utility bills manually for processing.',
      };
    }

    // Step 2: Attempt connection based on capability
    if (provider.apiAvailable) {
      return await this.connectViaAPI(customerId, provider);
    } else if (provider.scrapingMethod === 'LOGIN_SCRAPE') {
      return await this.connectViaScraping(customerId, provider);
    } else {
      return await this.setupDocumentUpload(customerId, provider);
    }
  }

  /**
   * Identify utility provider using AI and database matching
   */
  private async identifyUtilityProvider(
    zipCode: string,
    utilityName?: string
  ): Promise<UtilityProvider | null> {
    // First, try direct name matching
    if (utilityName) {
      for (const [key, provider] of this.utilityProviders) {
        if (provider.name.toLowerCase().includes(utilityName.toLowerCase()) ||
            key.toLowerCase() === utilityName.toLowerCase()) {
          return provider;
        }
      }
    }

    // Use AI to identify utility from zip code
    const message = await this.anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 500,
      messages: [
        {
          role: 'user',
          content: `What is the primary electric utility provider for zip code ${zipCode}? 
          Please respond with just the utility company name, or "UNKNOWN" if uncertain.
          Examples: "Pacific Gas & Electric", "Southern California Edison", "ConEd", etc.`
        }
      ]
    });

    const utilityIdentified = message.content[0].type === 'text' ? message.content[0].text.trim() : '';
    
    if (utilityIdentified === 'UNKNOWN') {
      return null;
    }

    // Try to match AI response to our provider database
    for (const [key, provider] of this.utilityProviders) {
      if (provider.name.toLowerCase().includes(utilityIdentified.toLowerCase())) {
        return provider;
      }
    }

    // Fallback to generic cooperative for rural areas
    return this.utilityProviders.get('GENERIC_COOP') || null;
  }

  /**
   * Connect via official API
   */
  private async connectViaAPI(
    customerId: string,
    provider: UtilityProvider
  ): Promise<any> {
    try {
      // Use existing utility integration client
      const utilityClient = new (await import('../utility-integration/utility-api-client')).UtilityIntegrationClient();
      await utilityClient.connectUtilityAccount(customerId, provider.name);
      
      return {
        success: true,
        method: 'API_CONNECTION',
        requiresCustomerAction: true,
        instructions: `Click the link in your email to authorize connection to ${provider.name}.`,
      };
    } catch (error) {
      console.error('API connection failed:', error);
      return {
        success: false,
        method: 'API_FAILED',
        requiresCustomerAction: true,
        instructions: 'API connection failed. Please try document upload instead.',
      };
    }
  }

  /**
   * Connect via web scraping (with customer credentials)
   */
  private async connectViaScraping(
    customerId: string,
    provider: UtilityProvider
  ): Promise<any> {
    // Create scraping connection record
    const connection = await prisma.scrapingConnection.create({
      data: {
        customerId,
        utilityProvider: provider.name,
        loginUrl: provider.loginUrl!,
        status: 'AWAITING_CREDENTIALS',
        createdAt: new Date(),
      }
    });

    return {
      success: true,
      method: 'SCRAPING_SETUP',
      connectionId: connection.id,
      requiresCustomerAction: true,
      instructions: `Please provide your ${provider.name} login credentials for automated bill retrieval.`,
    };
  }

  /**
   * Set up secure web scraping with customer credentials
   */
  async setupScrapingWithCredentials(
    connectionId: string,
    encryptedCredentials: string
  ): Promise<void> {
    const connection = await prisma.scrapingConnection.findUnique({
      where: { id: connectionId }
    });

    if (!connection) throw new Error('Connection not found');

    // Update with encrypted credentials
    await prisma.scrapingConnection.update({
      where: { id: connectionId },
      data: {
        encryptedCredentials,
        status: 'CREDENTIALS_PROVIDED',
      }
    });

    // Schedule first scraping attempt
    await this.scheduleScrapingJob(connectionId);
  }

  /**
   * Execute web scraping to retrieve bills
   */
  async executeWebScraping(connectionId: string): Promise<BillData[]> {
    const connection = await prisma.scrapingConnection.findUnique({
      where: { id: connectionId }
    });

    if (!connection) throw new Error('Connection not found');

    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    try {
      const page = await browser.newPage();
      
      // Navigate to utility login page
      await page.goto(connection.loginUrl);
      
      // Decrypt and use credentials
      const credentials = this.decryptCredentials(connection.encryptedCredentials!);
      
      // Fill login form (utility-specific selectors)
      await this.performLogin(page, credentials, connection.utilityProvider);
      
      // Navigate to billing section
      await this.navigateToBilling(page, connection.utilityProvider);
      
      // Extract bill data
      const billData = await this.extractBillData(page, connection.utilityProvider);
      
      // Update connection status
      await prisma.scrapingConnection.update({
        where: { id: connectionId },
        data: {
          status: 'ACTIVE',
          lastScrapedAt: new Date(),
          billsRetrieved: billData.length,
        }
      });

      return billData;
      
    } catch (error) {
      console.error('Scraping failed:', error);
      
      await prisma.scrapingConnection.update({
        where: { id: connectionId },
        data: {
          status: 'ERROR',
          lastError: (error as Error).message,
        }
      });
      
      throw error;
    } finally {
      await browser.close();
    }
  }

  /**
   * Process uploaded utility bill documents
   */
  async processUploadedBill(
    customerId: string,
    fileBuffer: Buffer,
    fileName: string
  ): Promise<BillData> {

    // Step 1: OCR extraction
    const ocrText = await this.extractTextFromBill(fileBuffer);
    
    // Step 2: AI analysis and structured data extraction
    const billData = await this.extractBillDataWithAI(ocrText, fileName);
    
    // Step 3: Validate and store
    const validatedData = await this.validateBillData(billData);
    
    // Step 4: Store in database
    await this.storeBillData(customerId, validatedData, fileName);
    
    return validatedData;
  }

  /**
   * Extract text from bill using OCR
   */
  private async extractTextFromBill(fileBuffer: Buffer): Promise<string> {
    const { data: { text } } = await this.tesseractWorker.recognize(fileBuffer);
    return text;
  }

  /**
   * Extract structured data from OCR text using AI
   */
  private async extractBillDataWithAI(ocrText: string, fileName: string): Promise<BillData> {
    const message = await this.anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 2000,
      messages: [
        {
          role: 'user',
          content: `Extract utility bill data from this OCR text. Please provide a JSON response with all available information:

          OCR TEXT:
          ${ocrText}

          Required JSON format:
          {
            "accountNumber": "string",
            "serviceAddress": "string", 
            "billDate": "YYYY-MM-DD",
            "dueDate": "YYYY-MM-DD",
            "billingPeriod": {
              "start": "YYYY-MM-DD",
              "end": "YYYY-MM-DD"
            },
            "usage": {
              "kwh": number,
              "kw": number
            },
            "charges": {
              "energy": number,
              "demand": number,
              "fees": number,
              "taxes": number,
              "total": number
            },
            "rateSchedule": "string",
            "meterReadings": {
              "previous": number,
              "current": number
            }
          }

          Extract what you can find. Use null for missing values. Be precise with numbers.`
        }
      ]
    });

    const responseText = message.content[0].type === 'text' ? message.content[0].text : '';
    
    try {
      return JSON.parse(responseText) as BillData;
    } catch (error) {
      throw new Error('Failed to parse bill data from AI response');
    }
  }

  /**
   * Validate extracted bill data
   */
  private async validateBillData(billData: BillData): Promise<BillData> {
    // Basic validation
    if (!billData.accountNumber) {
      throw new Error('Account number is required');
    }
    
    if (!billData.usage?.kwh || billData.usage.kwh <= 0) {
      throw new Error('Valid kWh usage is required');
    }
    
    if (!billData.charges?.total || billData.charges.total <= 0) {
      throw new Error('Valid total charges required');
    }

    // Sanity checks
    if (billData.usage.kwh > 100000) {
      console.warn('Unusually high kWh usage detected:', billData.usage.kwh);
    }
    
    if (billData.charges.total / billData.usage.kwh > 1.0) {
      console.warn('Unusually high rate detected:', billData.charges.total / billData.usage.kwh);
    }

    return billData;
  }

  /**
   * Store processed bill data
   */
  private async storeBillData(
    customerId: string,
    billData: BillData,
    fileName: string
  ): Promise<void> {
    await prisma.utilityBillData.create({
      data: {
        customerId,
        accountNumber: billData.accountNumber,
        billDate: billData.billDate,
        startDate: billData.billingPeriod.start,
        endDate: billData.billingPeriod.end,
        kwhUsed: billData.usage.kwh,
        peakDemandKw: billData.usage.kw || 0,
        totalCost: billData.charges.total,
        rateSchedule: billData.rateSchedule || 'UNKNOWN',
        meterData: billData.meterReadings || {},
        verificationStatus: 'PROCESSED',
        source: 'DOCUMENT_UPLOAD',
        originalFileName: fileName,
        createdAt: new Date(),
      }
    });
  }

  /**
   * Set up document upload process
   */
  private async setupDocumentUpload(
    customerId: string,
    provider: UtilityProvider
  ): Promise<any> {
    // Create upload session
    const uploadSession = await prisma.documentUploadSession.create({
      data: {
        customerId,
        utilityProvider: provider.name,
        status: 'ACTIVE',
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
        maxFiles: 12, // 12 months of bills
        createdAt: new Date(),
      }
    });

    return {
      success: true,
      method: 'DOCUMENT_UPLOAD',
      connectionId: uploadSession.id,
      requiresCustomerAction: true,
      instructions: `Please upload your last 12 months of ${provider.name} bills. We accept PDF, JPG, or PNG files.`,
    };
  }

  /**
   * Monitor all scraping connections and update bills
   */
  async monitorScrapingConnections(): Promise<void> {
    const activeConnections = await prisma.scrapingConnection.findMany({
      where: {
        status: 'ACTIVE',
        OR: [
          { lastScrapedAt: null },
          { lastScrapedAt: { lt: new Date(Date.now() - 24 * 60 * 60 * 1000) } }
        ]
      }
    });


    for (const connection of activeConnections) {
      try {
        await this.executeWebScraping(connection.id);
      } catch (error) {
        console.error(`Scraping failed for connection ${connection.id}:`, error);
      }
    }
  }

  // Helper methods for web scraping
  private async performLogin(page: any, credentials: any, utilityProvider: string): Promise<void> {
    // Utility-specific login logic
    const loginSelectors: Record<string, any> = {
      'Puget Sound Energy': {
        username: '#username',
        password: '#password',
        submit: '#login-button'
      },
      'Xcel Energy': {
        username: '#Email',
        password: '#Password',
        submit: '#btnLogin'
      },
      // Add more utilities as needed
    };

    const selectors = loginSelectors[utilityProvider];
    if (!selectors) throw new Error(`No login selectors for ${utilityProvider}`);

    await page.type(selectors.username, credentials.username);
    await page.type(selectors.password, credentials.password);
    await page.click(selectors.submit);
    await page.waitForNavigation();
  }

  private async navigateToBilling(page: any, utilityProvider: string): Promise<void> {
    // Navigate to billing section (utility-specific)
  }

  private async extractBillData(page: any, utilityProvider: string): Promise<BillData[]> {
    // Extract bill data from page (utility-specific)
    return [];
  }

  private decryptCredentials(encryptedCredentials: string): any {
    // Decrypt stored credentials
    return JSON.parse(encryptedCredentials); // Simplified for demo
  }

  private async scheduleScrapingJob(connectionId: string): Promise<void> {
    // Schedule recurring scraping job
  }
}