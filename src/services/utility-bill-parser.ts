/**
 * Utility Bill Parser Service
 * Extracts energy usage and cost data from utility bills (PDF/CSV/API)
 */

import { prisma } from '@/lib/prisma';
import * as pdfParse from 'pdf-parse';
import * as csv from 'csv-parse/sync';

interface UtilityBillData {
  accountNumber: string;
  serviceAddress: string;
  billingPeriod: {
    start: Date;
    end: Date;
    days: number;
  };
  usage: {
    kwh: number;
    peakKw?: number;
    offPeakKwh?: number;
    onPeakKwh?: number;
  };
  costs: {
    energyCharges: number;
    demandCharges?: number;
    deliveryCharges: number;
    taxes: number;
    total: number;
  };
  rates: {
    avgCostPerKwh: number;
    peakRate?: number;
    offPeakRate?: number;
  };
  provider: string;
  meterNumber?: string;
}

export class UtilityBillParser {
  private providers: Map<string, RegExp[]>;

  constructor() {
    // Define patterns for different utility providers
    this.providers = new Map([
      ['ConEd', [
        /Account Number:\s*(\d+)/i,
        /Service Address:\s*(.+?)(?=\n)/i,
        /Total kWh:\s*([\d,]+)/i,
        /Total Amount Due:\s*\$?([\d,]+\.?\d*)/i,
      ]],
      ['PG&E', [
        /Account:\s*(\d+-\d+)/i,
        /Service Address:\s*(.+?)(?=\n)/i,
        /Total Usage:\s*([\d,]+)\s*kWh/i,
        /Total Amount Due:\s*\$?([\d,]+\.?\d*)/i,
      ]],
      ['ComEd', [
        /Account Number:\s*(\d+)/i,
        /Service Location:\s*(.+?)(?=\n)/i,
        /kWh Used:\s*([\d,]+)/i,
        /Current Charges:\s*\$?([\d,]+\.?\d*)/i,
      ]],
    ]);
  }

  /**
   * Parse utility bill from various sources
   */
  async parseBill(
    source: Buffer | string,
    sourceType: 'pdf' | 'csv' | 'text',
    provider?: string
  ): Promise<UtilityBillData> {
    switch (sourceType) {
      case 'pdf':
        return this.parsePdfBill(source as Buffer, provider);
      case 'csv':
        return this.parseCsvBill(source as string, provider);
      case 'text':
        return this.parseTextBill(source as string, provider);
      default:
        throw new Error(`Unsupported source type: ${sourceType}`);
    }
  }

  /**
   * Parse PDF utility bill
   */
  private async parsePdfBill(pdfBuffer: Buffer, provider?: string): Promise<UtilityBillData> {
    try {
      const pdfData = await pdfParse(pdfBuffer);
      const text = pdfData.text;
      
      // Detect provider if not specified
      const detectedProvider = provider || this.detectProvider(text);
      
      return this.extractDataFromText(text, detectedProvider);
    } catch (error) {
      console.error('PDF parsing error:', error);
      throw new Error('Failed to parse PDF bill');
    }
  }

  /**
   * Parse CSV utility data (common for bulk exports)
   */
  private parseCsvBill(csvContent: string, provider?: string): UtilityBillData {
    try {
      const records = csv.parse(csvContent, {
        columns: true,
        skip_empty_lines: true,
      });

      if (records.length === 0) {
        throw new Error('No data found in CSV');
      }

      // Map common CSV column names
      const record = records[0];
      const billData: UtilityBillData = {
        accountNumber: record['Account Number'] || record['Account'] || '',
        serviceAddress: record['Service Address'] || record['Location'] || '',
        billingPeriod: {
          start: new Date(record['Start Date'] || record['From']),
          end: new Date(record['End Date'] || record['To']),
          days: parseInt(record['Days'] || '30'),
        },
        usage: {
          kwh: parseFloat(record['kWh'] || record['Usage'] || '0'),
          peakKw: record['Peak kW'] ? parseFloat(record['Peak kW']) : undefined,
          offPeakKwh: record['Off-Peak kWh'] ? parseFloat(record['Off-Peak kWh']) : undefined,
          onPeakKwh: record['On-Peak kWh'] ? parseFloat(record['On-Peak kWh']) : undefined,
        },
        costs: {
          energyCharges: parseFloat(record['Energy Charges'] || '0'),
          demandCharges: record['Demand Charges'] ? parseFloat(record['Demand Charges']) : undefined,
          deliveryCharges: parseFloat(record['Delivery Charges'] || '0'),
          taxes: parseFloat(record['Taxes'] || '0'),
          total: parseFloat(record['Total'] || record['Amount Due'] || '0'),
        },
        rates: {
          avgCostPerKwh: 0, // Calculate below
        },
        provider: provider || record['Provider'] || 'Unknown',
      };

      // Calculate average rate
      if (billData.usage.kwh > 0) {
        billData.rates.avgCostPerKwh = billData.costs.total / billData.usage.kwh;
      }

      return billData;
    } catch (error) {
      console.error('CSV parsing error:', error);
      throw new Error('Failed to parse CSV bill');
    }
  }

  /**
   * Parse text-based bill data
   */
  private parseTextBill(text: string, provider?: string): UtilityBillData {
    const detectedProvider = provider || this.detectProvider(text);
    return this.extractDataFromText(text, detectedProvider);
  }

  /**
   * Detect utility provider from bill text
   */
  private detectProvider(text: string): string {
    const providerKeywords = {
      'ConEd': ['Consolidated Edison', 'Con Edison', 'ConEd'],
      'PG&E': ['Pacific Gas and Electric', 'PG&E', 'PGE'],
      'ComEd': ['Commonwealth Edison', 'ComEd'],
      'Duke': ['Duke Energy'],
      'FPL': ['Florida Power & Light', 'FPL'],
      'SCE': ['Southern California Edison', 'SCE'],
    };

    for (const [provider, keywords] of Object.entries(providerKeywords)) {
      if (keywords.some(keyword => text.includes(keyword))) {
        return provider;
      }
    }

    return 'Generic';
  }

  /**
   * Extract bill data from text using regex patterns
   */
  private extractDataFromText(text: string, provider: string): UtilityBillData {
    // Generic patterns that work across providers
    const patterns = {
      accountNumber: /Account\s*(?:Number|#)?:?\s*([\d-]+)/i,
      serviceAddress: /Service\s*(?:Address|Location)?:?\s*(.+?)(?=\n|$)/i,
      billingStart: /(?:Billing|Service)\s*Period.*?From:?\s*(\d{1,2}\/\d{1,2}\/\d{2,4})/i,
      billingEnd: /(?:Billing|Service)\s*Period.*?To:?\s*(\d{1,2}\/\d{1,2}\/\d{2,4})/i,
      totalKwh: /Total\s*(?:Usage|kWh|KWH):?\s*([\d,]+)\s*(?:kWh|KWH)?/i,
      peakKw: /(?:Peak|Maximum)\s*(?:Demand|kW):?\s*([\d,]+\.?\d*)\s*kW/i,
      totalAmount: /(?:Total\s*Amount\s*Due|Current\s*Charges|Total\s*Due):?\s*\$?([\d,]+\.?\d*)/i,
      energyCharges: /Energy\s*Charges?:?\s*\$?([\d,]+\.?\d*)/i,
      demandCharges: /Demand\s*Charges?:?\s*\$?([\d,]+\.?\d*)/i,
      deliveryCharges: /(?:Delivery|Distribution)\s*Charges?:?\s*\$?([\d,]+\.?\d*)/i,
      taxes: /(?:Taxes?|Tax):?\s*\$?([\d,]+\.?\d*)/i,
    };

    // Extract data using patterns
    const extract = (pattern: RegExp): string => {
      const match = text.match(pattern);
      return match ? match[1].replace(/,/g, '') : '';
    };

    const accountNumber = extract(patterns.accountNumber);
    const serviceAddress = extract(patterns.serviceAddress);
    const billingStart = extract(patterns.billingStart);
    const billingEnd = extract(patterns.billingEnd);
    const totalKwh = parseFloat(extract(patterns.totalKwh)) || 0;
    const peakKw = parseFloat(extract(patterns.peakKw)) || undefined;
    const totalAmount = parseFloat(extract(patterns.totalAmount)) || 0;
    const energyCharges = parseFloat(extract(patterns.energyCharges)) || 0;
    const demandCharges = parseFloat(extract(patterns.demandCharges)) || undefined;
    const deliveryCharges = parseFloat(extract(patterns.deliveryCharges)) || 0;
    const taxes = parseFloat(extract(patterns.taxes)) || 0;

    // Calculate billing period
    const startDate = billingStart ? new Date(billingStart) : new Date();
    const endDate = billingEnd ? new Date(billingEnd) : new Date();
    const days = Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

    // Build bill data object
    const billData: UtilityBillData = {
      accountNumber,
      serviceAddress,
      billingPeriod: {
        start: startDate,
        end: endDate,
        days: days || 30,
      },
      usage: {
        kwh: totalKwh,
        peakKw,
      },
      costs: {
        energyCharges,
        demandCharges,
        deliveryCharges,
        taxes,
        total: totalAmount || (energyCharges + (demandCharges || 0) + deliveryCharges + taxes),
      },
      rates: {
        avgCostPerKwh: totalKwh > 0 ? totalAmount / totalKwh : 0,
      },
      provider,
    };

    return billData;
  }

  /**
   * Store parsed bill data in database
   */
  async storeBillData(
    facilityId: string,
    billData: UtilityBillData,
    sourceUrl?: string
  ): Promise<void> {
    try {
      // Store in sensor readings for energy monitoring
      await prisma.sensorReading.create({
        data: {
          facilityId,
          sensorId: `utility-bill-${billData.accountNumber}`,
          sensorType: 'utility_usage',
          value: billData.usage.kwh,
          unit: 'kWh',
          quality: 'good',
          timestamp: billData.billingPeriod.end,
        },
      });

      // Store cost data
      await prisma.expense.create({
        data: {
          facilityId,
          categoryId: 'utility-energy', // You'd need to ensure this category exists
          amount: billData.costs.total,
          description: `Utility bill for ${billData.billingPeriod.start.toISOString().split('T')[0]} to ${billData.billingPeriod.end.toISOString().split('T')[0]}`,
          vendorName: billData.provider,
          invoiceNumber: billData.accountNumber,
          expenseDate: billData.billingPeriod.end,
          recordedBy: 'system',
        },
      });

    } catch (error) {
      console.error('Error storing bill data:', error);
      throw error;
    }
  }

  /**
   * Connect to utility provider API (where available)
   */
  async connectToUtilityAPI(
    provider: string,
    credentials: {
      username?: string;
      password?: string;
      apiKey?: string;
      accountNumber?: string;
    }
  ): Promise<boolean> {
    // This would implement OAuth flows or API authentication for providers that support it
    // Examples: PG&E Share My Data, ConEd Green Button, etc.
    
    
    // Store connection info
    if (credentials.username) {
      await prisma.utilityConnection.create({
        data: {
          customerId: 'system', // Would be actual user ID
          utilityProvider: provider,
          apiProvider: `${provider} API`,
          status: 'CONNECTED',
          lastSyncAt: new Date(),
        },
      });
    }
    
    return true;
  }
}