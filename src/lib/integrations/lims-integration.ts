/**
 * Laboratory Information Management System (LIMS) Integration Service
 * Supports major LIMS providers for cannabis and produce testing
 */

import { prisma } from '@/lib/prisma';

interface LIMSConfig {
  provider: 'CONFIDENT_CANNABIS' | 'STEEP_HILL' | 'SC_LABS' | 'LABWARE' | 'LABVANTAGE' | 'SAMPLE_MANAGER' | 'ELEMENT';
  apiKey: string;
  accountId?: string;
  environment?: 'sandbox' | 'production';
}

interface TestResult {
  id: string;
  sampleId: string;
  batchNumber?: string;
  testDate: Date;
  labName: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  category: 'potency' | 'pesticides' | 'microbials' | 'mycotoxins' | 'heavy_metals' | 'residual_solvents' | 'terpenes' | 'nutrients' | 'pathogens';
  results: Record<string, TestValue>;
  passedCompliance: boolean;
  certificateUrl?: string;
}

interface TestValue {
  value: number;
  unit: string;
  limit?: number;
  status: 'pass' | 'fail' | 'warning' | 'not_tested';
  method?: string;
}

interface CannabisTestResult extends TestResult {
  potency?: {
    thc: number;
    thca: number;
    cbd: number;
    cbda: number;
    cbg: number;
    cbn: number;
    totalCannabinoids: number;
  };
  terpeneProfile?: Record<string, number>;
  moistureContent?: number;
  foreignMatter?: boolean;
}

interface ProduceTestResult extends TestResult {
  nutrients?: {
    brix: number;
    nitrogen: number;
    phosphorus: number;
    potassium: number;
    calcium: number;
    magnesium: number;
  };
  shelfLife?: number;
  pH?: number;
  waterActivity?: number;
  texture?: {
    firmness: number;
    crispness: number;
  };
}

export class LIMSIntegrationService {
  private config: LIMSConfig;

  constructor(config: LIMSConfig) {
    this.config = config;
  }

  /**
   * Fetch test results from LIMS
   */
  async fetchTestResults(
    startDate: Date,
    endDate: Date,
    facilityType: 'cannabis' | 'produce'
  ): Promise<TestResult[]> {
    switch (this.config.provider) {
      case 'CONFIDENT_CANNABIS':
        return this.fetchConfidentCannabisResults(startDate, endDate);
      case 'STEEP_HILL':
        return this.fetchSteepHillResults(startDate, endDate);
      case 'SC_LABS':
        return this.fetchSCLabsResults(startDate, endDate);
      case 'LABWARE':
        return this.fetchLabwareResults(startDate, endDate, facilityType);
      case 'LABVANTAGE':
        return this.fetchLabvantageResults(startDate, endDate, facilityType);
      default:
        throw new Error(`Unsupported provider: ${this.config.provider}`);
    }
  }

  /**
   * Confident Cannabis Integration (Cannabis Testing Marketplace)
   */
  private async fetchConfidentCannabisResults(
    startDate: Date,
    endDate: Date
  ): Promise<CannabisTestResult[]> {
    const baseUrl = 'https://api.confidentcannabis.com/v1';

    try {
      const response = await fetch(
        `${baseUrl}/samples?start_date=${startDate.toISOString()}&end_date=${endDate.toISOString()}`,
        {
          headers: {
            'Authorization': `Bearer ${this.config.apiKey}`,
            'Accept': 'application/json'
          }
        }
      );

      const data = await response.json();
      const results: CannabisTestResult[] = [];

      for (const sample of data.samples || []) {
        const testResult: CannabisTestResult = {
          id: sample.id,
          sampleId: sample.sample_id,
          batchNumber: sample.batch_id,
          testDate: new Date(sample.test_date),
          labName: sample.lab_name,
          status: 'completed',
          category: 'potency',
          results: {},
          passedCompliance: sample.passed_compliance,
          certificateUrl: sample.coa_url,
          potency: {
            thc: sample.cannabinoids?.thc || 0,
            thca: sample.cannabinoids?.thca || 0,
            cbd: sample.cannabinoids?.cbd || 0,
            cbda: sample.cannabinoids?.cbda || 0,
            cbg: sample.cannabinoids?.cbg || 0,
            cbn: sample.cannabinoids?.cbn || 0,
            totalCannabinoids: sample.cannabinoids?.total || 0
          },
          terpeneProfile: sample.terpenes,
          moistureContent: sample.moisture
        };

        // Map cannabinoid results
        if (sample.cannabinoids) {
          Object.entries(sample.cannabinoids).forEach(([compound, value]) => {
            testResult.results[compound] = {
              value: value as number,
              unit: '%',
              status: 'pass'
            };
          });
        }

        // Map pesticide results
        if (sample.pesticides) {
          Object.entries(sample.pesticides).forEach(([pesticide, data]: [string, any]) => {
            testResult.results[`pesticide_${pesticide}`] = {
              value: data.value,
              unit: data.unit || 'ppb',
              limit: data.limit,
              status: data.value <= data.limit ? 'pass' : 'fail'
            };
          });
        }

        results.push(testResult);
      }

      return results;
    } catch (error) {
      console.error('Confident Cannabis API error:', error);
      throw new Error(`Failed to fetch Confident Cannabis data: ${error.message}`);
    }
  }

  /**
   * Steep Hill Labs Integration (Cannabis Testing)
   */
  private async fetchSteepHillResults(
    startDate: Date,
    endDate: Date
  ): Promise<CannabisTestResult[]> {
    const baseUrl = 'https://api.steephill.com/v2';

    try {
      const response = await fetch(
        `${baseUrl}/lab-results?from=${startDate.toISOString()}&to=${endDate.toISOString()}&account_id=${this.config.accountId}`,
        {
          headers: {
            'X-API-Key': this.config.apiKey,
            'Accept': 'application/json'
          }
        }
      );

      const data = await response.json();
      
      return data.results.map((result: any) => ({
        id: result.id,
        sampleId: result.sample_number,
        batchNumber: result.batch_number,
        testDate: new Date(result.test_date),
        labName: 'Steep Hill Labs',
        status: result.status,
        category: this.mapSteepHillCategory(result.test_type),
        results: this.transformSteepHillResults(result.test_data),
        passedCompliance: result.compliance_status === 'pass',
        certificateUrl: result.certificate_url,
        potency: result.cannabinoids ? {
          thc: result.cannabinoids.thc,
          thca: result.cannabinoids.thca,
          cbd: result.cannabinoids.cbd,
          cbda: result.cannabinoids.cbda,
          cbg: result.cannabinoids.cbg || 0,
          cbn: result.cannabinoids.cbn || 0,
          totalCannabinoids: result.cannabinoids.total
        } : undefined,
        terpeneProfile: result.terpenes,
        moistureContent: result.moisture_content
      }));
    } catch (error) {
      console.error('Steep Hill API error:', error);
      throw new Error(`Failed to fetch Steep Hill data: ${error.message}`);
    }
  }

  /**
   * SC Labs Integration (Cannabis Testing)
   */
  private async fetchSCLabsResults(
    startDate: Date,
    endDate: Date
  ): Promise<CannabisTestResult[]> {
    const baseUrl = 'https://client.sclabs.com/api/v2';

    try {
      const response = await fetch(
        `${baseUrl}/results?start_date=${startDate.toISOString().split('T')[0]}&end_date=${endDate.toISOString().split('T')[0]}`,
        {
          headers: {
            'Authorization': `Token ${this.config.apiKey}`,
            'Accept': 'application/json'
          }
        }
      );

      const data = await response.json();
      
      return data.data.map((result: any) => ({
        id: result.uuid,
        sampleId: result.sample_id,
        batchNumber: result.batch_code,
        testDate: new Date(result.completed_date),
        labName: 'SC Labs',
        status: 'completed',
        category: 'potency',
        results: this.transformSCLabsResults(result),
        passedCompliance: result.overall_pass,
        certificateUrl: result.coa_pdf_url,
        potency: {
          thc: result.delta9_thc || 0,
          thca: result.thca || 0,
          cbd: result.cbd || 0,
          cbda: result.cbda || 0,
          cbg: result.cbg || 0,
          cbn: result.cbn || 0,
          totalCannabinoids: result.total_cannabinoids || 0
        },
        terpeneProfile: result.terpenes,
        moistureContent: result.moisture
      }));
    } catch (error) {
      console.error('SC Labs API error:', error);
      throw new Error(`Failed to fetch SC Labs data: ${error.message}`);
    }
  }

  /**
   * LabWare LIMS Integration (General Purpose - Cannabis & Produce)
   */
  private async fetchLabwareResults(
    startDate: Date,
    endDate: Date,
    facilityType: 'cannabis' | 'produce'
  ): Promise<TestResult[]> {
    const baseUrl = this.config.environment === 'sandbox'
      ? 'https://sandbox.labware.com/api/v1'
      : 'https://api.labware.com/api/v1';

    try {
      const response = await fetch(
        `${baseUrl}/results?date_from=${startDate.toISOString()}&date_to=${endDate.toISOString()}&sample_type=${facilityType}`,
        {
          headers: {
            'X-API-Key': this.config.apiKey,
            'Accept': 'application/json'
          }
        }
      );

      const data = await response.json();
      
      if (facilityType === 'cannabis') {
        return this.transformLabwareCannabisResults(data.results);
      } else {
        return this.transformLabwareProduceResults(data.results);
      }
    } catch (error) {
      console.error('LabWare API error:', error);
      throw new Error(`Failed to fetch LabWare data: ${error.message}`);
    }
  }

  /**
   * LabVantage Integration (Enterprise LIMS)
   */
  private async fetchLabvantageResults(
    startDate: Date,
    endDate: Date,
    facilityType: 'cannabis' | 'produce'
  ): Promise<TestResult[]> {
    // LabVantage implementation
    throw new Error('LabVantage integration not yet implemented');
  }

  /**
   * Submit sample for testing
   */
  async submitSample(sampleData: {
    batchNumber: string;
    sampleType: string;
    quantity: number;
    requestedTests: string[];
    rushOrder?: boolean;
  }): Promise<string> {
    switch (this.config.provider) {
      case 'CONFIDENT_CANNABIS':
        return this.submitToConfidentCannabis(sampleData);
      case 'SC_LABS':
        return this.submitToSCLabs(sampleData);
      default:
        throw new Error(`Sample submission not supported for ${this.config.provider}`);
    }
  }

  /**
   * Submit to Confident Cannabis
   */
  private async submitToConfidentCannabis(sampleData: any): Promise<string> {
    const baseUrl = 'https://api.confidentcannabis.com/v1';

    const response = await fetch(`${baseUrl}/samples`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        batch_id: sampleData.batchNumber,
        sample_type: sampleData.sampleType,
        quantity: sampleData.quantity,
        requested_tests: sampleData.requestedTests,
        rush: sampleData.rushOrder
      })
    });

    const result = await response.json();
    return result.sample_id;
  }

  /**
   * Submit to SC Labs
   */
  private async submitToSCLabs(sampleData: any): Promise<string> {
    const baseUrl = 'https://client.sclabs.com/api/v2';

    const response = await fetch(`${baseUrl}/samples`, {
      method: 'POST',
      headers: {
        'Authorization': `Token ${this.config.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        batch_code: sampleData.batchNumber,
        product_type: sampleData.sampleType,
        sample_weight: sampleData.quantity,
        analyses_requested: sampleData.requestedTests
      })
    });

    const result = await response.json();
    return result.data.sample_id;
  }

  /**
   * Helper methods
   */
  private mapSteepHillCategory(testType: string): TestResult['category'] {
    const categoryMap: Record<string, TestResult['category']> = {
      'cannabinoids': 'potency',
      'pesticides': 'pesticides',
      'microbiology': 'microbials',
      'mycotoxins': 'mycotoxins',
      'heavy_metals': 'heavy_metals',
      'residual_solvents': 'residual_solvents',
      'terpenes': 'terpenes'
    };
    
    return categoryMap[testType] || 'potency';
  }

  private transformSteepHillResults(testData: any): Record<string, TestValue> {
    const results: Record<string, TestValue> = {};
    
    Object.entries(testData).forEach(([key, data]: [string, any]) => {
      results[key] = {
        value: data.value,
        unit: data.unit,
        limit: data.limit,
        status: data.status || 'pass',
        method: data.method
      };
    });
    
    return results;
  }

  private transformSCLabsResults(result: any): Record<string, TestValue> {
    const results: Record<string, TestValue> = {};
    
    // Cannabinoids
    const cannabinoids = [
      'delta9_thc', 'thca', 'cbd', 'cbda', 'cbg', 'cbga', 'cbn', 'cbc', 'thcv'
    ];
    
    cannabinoids.forEach(compound => {
      if (result[compound] !== undefined) {
        results[compound] = {
          value: result[compound],
          unit: '%',
          status: 'pass'
        };
      }
    });
    
    // Pesticides
    if (result.pesticides) {
      Object.entries(result.pesticides).forEach(([pesticide, data]: [string, any]) => {
        results[`pesticide_${pesticide}`] = {
          value: data.value,
          unit: 'ppb',
          limit: data.action_level,
          status: data.pass ? 'pass' : 'fail'
        };
      });
    }
    
    return results;
  }

  private transformLabwareCannabisResults(results: any[]): CannabisTestResult[] {
    return results.map(result => ({
      id: result.id,
      sampleId: result.sample_id,
      batchNumber: result.batch_number,
      testDate: new Date(result.test_date),
      labName: result.lab_name || 'LabWare',
      status: result.status,
      category: result.test_category,
      results: result.test_results,
      passedCompliance: result.passed,
      certificateUrl: result.report_url,
      potency: result.cannabinoid_profile,
      terpeneProfile: result.terpene_profile,
      moistureContent: result.moisture
    }));
  }

  private transformLabwareProduceResults(results: any[]): ProduceTestResult[] {
    return results.map(result => ({
      id: result.id,
      sampleId: result.sample_id,
      batchNumber: result.batch_number,
      testDate: new Date(result.test_date),
      labName: result.lab_name || 'LabWare',
      status: result.status,
      category: result.test_category,
      results: result.test_results,
      passedCompliance: result.passed,
      certificateUrl: result.report_url,
      nutrients: result.nutrient_analysis,
      shelfLife: result.shelf_life_days,
      pH: result.ph,
      waterActivity: result.water_activity,
      texture: result.texture_analysis
    }));
  }

  /**
   * Calculate quality metrics from test results
   */
  async calculateQualityMetrics(
    facilityId: string,
    startDate: Date,
    endDate: Date
  ) {
    const testResults = await prisma.labTest.findMany({
      where: {
        facilityId,
        testDate: {
          gte: startDate,
          lte: endDate
        }
      }
    });

    const totalTests = testResults.length;
    const passedTests = testResults.filter(t => t.passed).length;
    const failedTests = totalTests - passedTests;
    
    const testsByCategory = testResults.reduce((acc, test) => {
      acc[test.category] = (acc[test.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const avgTurnaroundTime = testResults.reduce((sum, test) => {
      if (test.submittedDate && test.completedDate) {
        const turnaround = test.completedDate.getTime() - test.submittedDate.getTime();
        return sum + turnaround;
      }
      return sum;
    }, 0) / testResults.filter(t => t.submittedDate && t.completedDate).length;

    return {
      totalTests,
      passedTests,
      failedTests,
      passRate: totalTests > 0 ? (passedTests / totalTests) * 100 : 0,
      testsByCategory,
      avgTurnaroundDays: avgTurnaroundTime / (1000 * 60 * 60 * 24),
      complianceScore: this.calculateComplianceScore(testResults)
    };
  }

  private calculateComplianceScore(testResults: any[]): number {
    // Calculate compliance score based on test results
    const weights = {
      potency: 0.2,
      pesticides: 0.25,
      microbials: 0.25,
      heavy_metals: 0.15,
      mycotoxins: 0.15
    };

    let score = 0;
    let totalWeight = 0;

    Object.entries(weights).forEach(([category, weight]) => {
      const categoryTests = testResults.filter(t => t.category === category);
      if (categoryTests.length > 0) {
        const passRate = categoryTests.filter(t => t.passed).length / categoryTests.length;
        score += passRate * weight;
        totalWeight += weight;
      }
    });

    return totalWeight > 0 ? (score / totalWeight) * 100 : 100;
  }
}

/**
 * LIMS provider configurations
 */
export const LIMS_PROVIDERS = {
  // Cannabis-specific LIMS
  CONFIDENT_CANNABIS: {
    name: 'Confident Cannabis',
    type: 'cannabis',
    features: ['marketplace', 'coa-generation', 'compliance-tracking', 'batch-tracking'],
    requiredFields: ['apiKey']
  },
  STEEP_HILL: {
    name: 'Steep Hill Labs',
    type: 'cannabis',
    features: ['testing', 'compliance', 'genetics', 'r&d'],
    requiredFields: ['apiKey', 'accountId']
  },
  SC_LABS: {
    name: 'SC Labs',
    type: 'cannabis',
    features: ['testing', 'terpene-profiling', 'compliance', 'analytics'],
    requiredFields: ['apiKey']
  },
  
  // General Purpose LIMS (Cannabis & Produce)
  LABWARE: {
    name: 'LabWare LIMS',
    type: 'general',
    features: ['sample-management', 'workflow-automation', 'compliance', 'reporting'],
    requiredFields: ['apiKey']
  },
  LABVANTAGE: {
    name: 'LabVantage',
    type: 'general',
    features: ['enterprise-lims', 'compliance', 'data-management', 'integration'],
    requiredFields: ['apiKey', 'accountId']
  },
  SAMPLE_MANAGER: {
    name: 'Sample Manager LIMS',
    type: 'general',
    features: ['sample-tracking', 'test-management', 'reporting', 'compliance'],
    requiredFields: ['apiKey']
  },
  ELEMENT: {
    name: 'Element LIMS',
    type: 'general',
    features: ['workflow-management', 'compliance', 'data-integrity', 'reporting'],
    requiredFields: ['apiKey', 'accountId']
  }
};

/**
 * Test panel configurations by facility type
 */
export const TEST_PANELS = {
  cannabis: {
    required: ['potency', 'pesticides', 'microbials', 'mycotoxins', 'heavy_metals'],
    optional: ['terpenes', 'residual_solvents', 'foreign_matter', 'moisture'],
    r1Testing: ['homogeneity', 'stability', 'water_activity']
  },
  produce: {
    required: ['pathogens', 'pesticides', 'heavy_metals'],
    optional: ['nutrients', 'shelf_life', 'texture', 'appearance'],
    organic: ['gmo', 'prohibited_substances'],
    valueAdded: ['vitamins', 'minerals', 'antioxidants']
  }
};