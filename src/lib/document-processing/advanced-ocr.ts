import { createWorker, Worker } from 'tesseract.js';
import Anthropic from '@anthropic-ai/sdk';
import { PDFDocument } from 'pdf-lib';
import sharp from 'sharp';
import { prisma } from '@/lib/prisma';

interface ProcessedDocument {
  text: string;
  confidence: number;
  billData: BillData | null;
  processingTime: number;
  errors: string[];
}

interface BillData {
  accountNumber?: string;
  serviceAddress?: string;
  utility?: string;
  billDate?: Date;
  dueDate?: Date;
  billingPeriod?: {
    start: Date;
    end: Date;
  };
  usage?: {
    kwh: number;
    kw?: number;
    therms?: number;
  };
  charges?: {
    energy: number;
    demand?: number;
    delivery?: number;
    taxes: number;
    fees: number;
    total: number;
  };
  rateSchedule?: string;
  meterReadings?: {
    previous: number;
    current: number;
    multiplier?: number;
  };
}

export class AdvancedOCRProcessor {
  private tesseractWorker: Worker | null = null;
  private anthropic: Anthropic;
  private trainingPatterns: Map<string, RegExp[]>;

  constructor() {
    this.anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY!,
    });
    
    this.initializeTrainingPatterns();
  }

  /**
   * Initialize with utility-specific patterns
   */
  private initializeTrainingPatterns(): void {
    this.trainingPatterns = new Map([
      ['account_number', [
        /Account\s*(?:Number|#)?\s*:?\s*([0-9\-]{8,20})/i,
        /Acct\s*#?\s*:?\s*([0-9\-]{8,20})/i,
        /Customer\s*(?:Account|#)\s*:?\s*([0-9\-]{8,20})/i,
      ]],
      ['service_address', [
        /Service\s*Address\s*:?\s*([^\n]+)/i,
        /(?:Premise|Property)\s*Address\s*:?\s*([^\n]+)/i,
        /Meter\s*Location\s*:?\s*([^\n]+)/i,
      ]],
      ['utility_name', [
        /^([A-Z][A-Za-z\s&]{5,50})\s*(?:Electric|Gas|Utility|Power|Energy)/im,
        /(Pacific Gas|Southern California Edison|Con Edison|Duke Energy|ComEd)/i,
      ]],
      ['bill_date', [
        /(?:Bill|Statement)\s*Date\s*:?\s*(\d{1,2}\/\d{1,2}\/\d{2,4})/i,
        /Date\s*(?:of\s*)?(?:Bill|Statement)\s*:?\s*(\d{1,2}\/\d{1,2}\/\d{2,4})/i,
      ]],
      ['due_date', [
        /Due\s*Date\s*:?\s*(\d{1,2}\/\d{1,2}\/\d{2,4})/i,
        /Payment\s*Due\s*(?:Date)?\s*:?\s*(\d{1,2}\/\d{1,2}\/\d{2,4})/i,
      ]],
      ['billing_period', [
        /(?:Service|Billing)\s*Period\s*:?\s*(\d{1,2}\/\d{1,2}\/\d{2,4})\s*(?:to|-)\s*(\d{1,2}\/\d{1,2}\/\d{2,4})/i,
        /From\s*(\d{1,2}\/\d{1,2}\/\d{2,4})\s*(?:to|through)\s*(\d{1,2}\/\d{1,2}\/\d{2,4})/i,
      ]],
      ['kwh_usage', [
        /(?:Total\s*)?(?:Electric\s*)?(?:Energy\s*)?(?:Usage|Consumption)\s*:?\s*([\d,]+\.?\d*)\s*kWh/i,
        /([\d,]+\.?\d*)\s*kWh/i,
        /Electricity\s*Used\s*:?\s*([\d,]+\.?\d*)/i,
      ]],
      ['peak_demand', [
        /(?:Peak\s*)?Demand\s*:?\s*([\d,]+\.?\d*)\s*kW/i,
        /([\d,]+\.?\d*)\s*kW\s*(?:Peak|Max|Demand)/i,
      ]],
      ['total_amount', [
        /Total\s*(?:Amount\s*)?(?:Due|Owed)\s*:?\s*\$?([\d,]+\.?\d*)/i,
        /Amount\s*Due\s*:?\s*\$?([\d,]+\.?\d*)/i,
        /(?:Balance|Pay)\s*Amount\s*:?\s*\$?([\d,]+\.?\d*)/i,
      ]],
      ['rate_schedule', [
        /(?:Rate\s*)?Schedule\s*:?\s*([A-Z0-9\-]{2,10})/i,
        /Tariff\s*(?:Code|Schedule)\s*:?\s*([A-Z0-9\-]{2,10})/i,
      ]],
    ]);
  }

  /**
   * Process document with advanced OCR and AI extraction
   */
  async processDocument(
    fileBuffer: Buffer,
    fileName: string,
    customerId: string
  ): Promise<ProcessedDocument> {
    const startTime = Date.now();
    const errors: string[] = [];
    
    try {

      // Step 1: Preprocess image
      const preprocessedImage = await this.preprocessImage(fileBuffer, fileName);
      
      // Step 2: OCR extraction
      const ocrResult = await this.performOCR(preprocessedImage);
      
      // Step 3: Pattern-based extraction
      const patternData = this.extractWithPatterns(ocrResult.text);
      
      // Step 4: AI-enhanced extraction
      const aiData = await this.extractWithAI(ocrResult.text, fileName);
      
      // Step 5: Merge and validate results
      const billData = this.mergeAndValidateData(patternData, aiData);
      
      // Step 6: Store processing result
      await this.storeProcessingResult(customerId, fileName, billData, ocrResult);
      
      const processingTime = Date.now() - startTime;
      
      return {
        text: ocrResult.text,
        confidence: ocrResult.confidence,
        billData,
        processingTime,
        errors,
      };
      
    } catch (error) {
      console.error('Document processing failed:', error);
      errors.push((error as Error).message);
      
      return {
        text: '',
        confidence: 0,
        billData: null,
        processingTime: Date.now() - startTime,
        errors,
      };
    }
  }

  /**
   * Preprocess image for better OCR accuracy
   */
  private async preprocessImage(fileBuffer: Buffer, fileName: string): Promise<Buffer> {
    try {
      const fileExt = fileName.toLowerCase().split('.').pop();
      
      // Handle PDF files
      if (fileExt === 'pdf') {
        return await this.preprocessPDF(fileBuffer);
      }
      
      // Image preprocessing
      return await sharp(fileBuffer)
        .greyscale()
        .normalize()
        .sharpen()
        .resize(null, 2000, { 
          kernel: sharp.kernel.lanczos3,
          withoutEnlargement: true 
        })
        .png()
        .toBuffer();
        
    } catch (error) {
      console.error('Image preprocessing failed:', error);
      return fileBuffer; // Return original if preprocessing fails
    }
  }

  /**
   * Extract first page of PDF as high-quality image
   */
  private async preprocessPDF(pdfBuffer: Buffer): Promise<Buffer> {
    try {
      const pdfDoc = await PDFDocument.load(pdfBuffer);
      const pages = pdfDoc.getPages();
      
      if (pages.length === 0) {
        throw new Error('PDF has no pages');
      }
      
      // For now, return the original buffer
      // In production, you'd use pdf2pic or similar library
      // to convert PDF page to high-quality image
      return pdfBuffer;
      
    } catch (error) {
      console.error('PDF preprocessing failed:', error);
      return pdfBuffer;
    }
  }

  /**
   * Perform OCR with Tesseract
   */
  private async performOCR(imageBuffer: Buffer): Promise<{
    text: string;
    confidence: number;
  }> {
    if (!this.tesseractWorker) {
      this.tesseractWorker = await createWorker();
      await this.tesseractWorker.loadLanguage('eng');
      await this.tesseractWorker.initialize('eng');
      
      // Configure for better bill reading
      await this.tesseractWorker.setParameters({
        tessedit_char_whitelist: '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz.,$/:-() \n',
        tessedit_pageseg_mode: '1', // Automatic page segmentation with OSD
        preserve_interword_spaces: '1',
      });
    }

    const result = await this.tesseractWorker.recognize(imageBuffer);
    
    return {
      text: result.data.text,
      confidence: result.data.confidence / 100, // Convert to 0-1 scale
    };
  }

  /**
   * Extract data using predefined patterns
   */
  private extractWithPatterns(text: string): Partial<BillData> {
    const data: Partial<BillData> = {};
    
    // Account number
    const accountPatterns = this.trainingPatterns.get('account_number') || [];
    for (const pattern of accountPatterns) {
      const match = text.match(pattern);
      if (match) {
        data.accountNumber = match[1].replace(/\D/g, '');
        break;
      }
    }
    
    // Service address
    const addressPatterns = this.trainingPatterns.get('service_address') || [];
    for (const pattern of addressPatterns) {
      const match = text.match(pattern);
      if (match) {
        data.serviceAddress = match[1].trim();
        break;
      }
    }
    
    // Utility name
    const utilityPatterns = this.trainingPatterns.get('utility_name') || [];
    for (const pattern of utilityPatterns) {
      const match = text.match(pattern);
      if (match) {
        data.utility = match[1].trim();
        break;
      }
    }
    
    // Bill date
    const billDatePatterns = this.trainingPatterns.get('bill_date') || [];
    for (const pattern of billDatePatterns) {
      const match = text.match(pattern);
      if (match) {
        data.billDate = this.parseDate(match[1]);
        break;
      }
    }
    
    // Due date
    const dueDatePatterns = this.trainingPatterns.get('due_date') || [];
    for (const pattern of dueDatePatterns) {
      const match = text.match(pattern);
      if (match) {
        data.dueDate = this.parseDate(match[1]);
        break;
      }
    }
    
    // Billing period
    const periodPatterns = this.trainingPatterns.get('billing_period') || [];
    for (const pattern of periodPatterns) {
      const match = text.match(pattern);
      if (match && match[1] && match[2]) {
        data.billingPeriod = {
          start: this.parseDate(match[1]),
          end: this.parseDate(match[2]),
        };
        break;
      }
    }
    
    // kWh usage
    const kwhPatterns = this.trainingPatterns.get('kwh_usage') || [];
    for (const pattern of kwhPatterns) {
      const match = text.match(pattern);
      if (match) {
        const kwh = parseFloat(match[1].replace(/,/g, ''));
        if (!isNaN(kwh) && kwh > 0) {
          data.usage = { kwh, ...data.usage };
          break;
        }
      }
    }
    
    // Peak demand
    const demandPatterns = this.trainingPatterns.get('peak_demand') || [];
    for (const pattern of demandPatterns) {
      const match = text.match(pattern);
      if (match) {
        const kw = parseFloat(match[1].replace(/,/g, ''));
        if (!isNaN(kw) && kw > 0) {
          data.usage = { kw, ...data.usage };
          break;
        }
      }
    }
    
    // Total amount
    const totalPatterns = this.trainingPatterns.get('total_amount') || [];
    for (const pattern of totalPatterns) {
      const match = text.match(pattern);
      if (match) {
        const total = parseFloat(match[1].replace(/,/g, ''));
        if (!isNaN(total) && total > 0) {
          data.charges = { total, energy: 0, taxes: 0, fees: 0, ...data.charges };
          break;
        }
      }
    }
    
    // Rate schedule
    const ratePatterns = this.trainingPatterns.get('rate_schedule') || [];
    for (const pattern of ratePatterns) {
      const match = text.match(pattern);
      if (match) {
        data.rateSchedule = match[1].trim();
        break;
      }
    }
    
    return data;
  }

  /**
   * Extract data using AI
   */
  private async extractWithAI(text: string, fileName: string): Promise<Partial<BillData>> {
    try {
      const message = await this.anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 2000,
        messages: [
          {
            role: 'user',
            content: `Extract utility bill information from this OCR text. The file name is "${fileName}".

OCR TEXT:
${text}

Please extract ALL available information and return as JSON:
{
  "accountNumber": "string or null",
  "serviceAddress": "string or null", 
  "utility": "utility company name or null",
  "billDate": "YYYY-MM-DD or null",
  "dueDate": "YYYY-MM-DD or null",
  "billingPeriod": {
    "start": "YYYY-MM-DD or null",
    "end": "YYYY-MM-DD or null"
  },
  "usage": {
    "kwh": number or null,
    "kw": number or null,
    "therms": number or null
  },
  "charges": {
    "energy": number or null,
    "demand": number or null,
    "delivery": number or null,
    "taxes": number or null,
    "fees": number or null,
    "total": number or null
  },
  "rateSchedule": "string or null",
  "meterReadings": {
    "previous": number or null,
    "current": number or null,
    "multiplier": number or null
  }
}

Be precise with numbers. Look for energy usage in kWh, demand in kW, and all monetary amounts. Use null for missing data.`
          }
        ]
      });

      const responseText = message.content[0].type === 'text' ? message.content[0].text : '';
      return JSON.parse(responseText);
      
    } catch (error) {
      console.error('AI extraction failed:', error);
      return {};
    }
  }

  /**
   * Merge pattern and AI results with validation
   */
  private mergeAndValidateData(
    patternData: Partial<BillData>,
    aiData: Partial<BillData>
  ): BillData | null {
    // Merge data with AI taking precedence for missing pattern data
    const merged: BillData = {
      accountNumber: patternData.accountNumber || aiData.accountNumber,
      serviceAddress: patternData.serviceAddress || aiData.serviceAddress,
      utility: patternData.utility || aiData.utility,
      billDate: patternData.billDate || aiData.billDate,
      dueDate: patternData.dueDate || aiData.dueDate,
      billingPeriod: patternData.billingPeriod || aiData.billingPeriod,
      usage: {
        kwh: patternData.usage?.kwh || aiData.usage?.kwh || 0,
        kw: patternData.usage?.kw || aiData.usage?.kw,
        therms: patternData.usage?.therms || aiData.usage?.therms,
      },
      charges: {
        energy: patternData.charges?.energy || aiData.charges?.energy || 0,
        demand: patternData.charges?.demand || aiData.charges?.demand,
        delivery: patternData.charges?.delivery || aiData.charges?.delivery,
        taxes: patternData.charges?.taxes || aiData.charges?.taxes || 0,
        fees: patternData.charges?.fees || aiData.charges?.fees || 0,
        total: patternData.charges?.total || aiData.charges?.total || 0,
      },
      rateSchedule: patternData.rateSchedule || aiData.rateSchedule,
      meterReadings: patternData.meterReadings || aiData.meterReadings,
    };

    // Validation
    const isValid = this.validateBillData(merged);
    return isValid ? merged : null;
  }

  /**
   * Validate extracted bill data
   */
  private validateBillData(data: BillData): boolean {
    // Must have at least account number or service address
    if (!data.accountNumber && !data.serviceAddress) {
      return false;
    }
    
    // Must have some usage data
    if (!data.usage?.kwh || data.usage.kwh <= 0) {
      return false;
    }
    
    // Must have total charges
    if (!data.charges?.total || data.charges.total <= 0) {
      return false;
    }
    
    // Sanity checks
    if (data.usage.kwh > 1000000) { // 1M kWh seems unreasonable
      return false;
    }
    
    if (data.charges.total > 100000) { // $100k seems unreasonable
      return false;
    }
    
    // Rate check (rough)
    const rate = data.charges.total / data.usage.kwh;
    if (rate < 0.01 || rate > 2.00) { // $0.01 to $2.00 per kWh
      console.warn(`Unusual rate detected: $${rate.toFixed(4)}/kWh`);
    }
    
    return true;
  }

  /**
   * Parse date string to Date object
   */
  private parseDate(dateStr: string): Date {
    // Handle MM/DD/YYYY and MM/DD/YY formats
    const cleaned = dateStr.replace(/[^\d\/]/g, '');
    const parts = cleaned.split('/');
    
    if (parts.length !== 3) {
      throw new Error(`Invalid date format: ${dateStr}`);
    }
    
    let [month, day, year] = parts.map(p => parseInt(p));
    
    // Handle 2-digit years
    if (year < 100) {
      year += year < 50 ? 2000 : 1900;
    }
    
    return new Date(year, month - 1, day);
  }

  /**
   * Store processing result for training
   */
  private async storeProcessingResult(
    customerId: string,
    fileName: string,
    billData: BillData | null,
    ocrResult: any
  ): Promise<void> {
    await prisma.documentProcessingResult.create({
      data: {
        customerId,
        fileName,
        ocrText: ocrResult.text,
        ocrConfidence: ocrResult.confidence,
        extractedData: billData,
        processingMethod: 'ADVANCED_OCR',
        success: billData !== null,
        processedAt: new Date(),
      }
    });
  }

  /**
   * Train patterns from successful extractions
   */
  async trainFromSuccessfulExtractions(): Promise<void> {
    const successfulResults = await prisma.documentProcessingResult.findMany({
      where: {
        success: true,
        processingMethod: 'ADVANCED_OCR',
        createdAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
        }
      },
      take: 1000,
    });

    
    // Analyze patterns and improve regex patterns
    // This would implement machine learning pattern recognition
    // For now, just log for manual pattern improvement
    
    for (const result of successfulResults) {
      if (result.extractedData && result.ocrText) {
        this.analyzeSuccessfulExtraction(result.extractedData, result.ocrText);
      }
    }
  }

  /**
   * Analyze successful extraction for pattern improvement
   */
  private analyzeSuccessfulExtraction(extractedData: any, ocrText: string): void {
    // This would analyze successful extractions to improve patterns
    // Implementation would vary based on ML approach chosen
  }

  /**
   * Get processing statistics
   */
  async getProcessingStats(days: number = 30): Promise<any> {
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    
    const results = await prisma.documentProcessingResult.findMany({
      where: {
        processedAt: { gte: since }
      }
    });

    const total = results.length;
    const successful = results.filter(r => r.success).length;
    const avgConfidence = results.reduce((sum, r) => sum + r.ocrConfidence, 0) / total;
    
    return {
      total,
      successful,
      successRate: total > 0 ? (successful / total) * 100 : 0,
      avgConfidence: avgConfidence * 100,
      avgProcessingTime: 'N/A', // Would calculate from stored timing data
    };
  }

  /**
   * Cleanup worker on shutdown
   */
  async cleanup(): Promise<void> {
    if (this.tesseractWorker) {
      await this.tesseractWorker.terminate();
      this.tesseractWorker = null;
    }
  }
}