/**
 * Tests for Professional Reporting System
 * Verifies report generation, calculations, and data accuracy
 */

import { 
  ProfessionalReportGenerator,
  ProjectMetrics,
  EnergyAnalytics,
  ROICalculation 
} from '../reporting/professional-report-generator';

describe('Professional Reporting System', () => {
  let reportGenerator: ProfessionalReportGenerator;
  let mockProjectMetrics: ProjectMetrics;
  let mockEnergyData: any;
  let mockCostData: any;
  let mockPerformanceData: any;

  beforeEach(() => {
    reportGenerator = new ProfessionalReportGenerator(0.08); // 8% discount rate

    mockProjectMetrics = {
      projectId: 'TEST-001',
      projectName: 'Test LED Retrofit',
      facilityType: 'greenhouse',
      area: 5000,
      installationDate: new Date('2024-01-01'),
      currentDate: new Date('2024-06-01')
    };

    mockEnergyData = {
      totalPower: 10, // kW
      hoursPerDay: 16,
      electricityCost: 0.12, // $/kWh
      peakDemandCharge: 15.00,
      touPremium: 1.3
    };

    mockCostData = {
      initialInvestment: 50000,
      laborSavings: 5000,
      yieldImprovement: 12500, // $2.5 per sq ft
      maintenanceReduction: 3000
    };

    mockPerformanceData = {
      averagePPFD: 350,
      uniformityRatio: 0.85,
      spectralQualityIndex: 0.92,
      dailyLightIntegral: 20.16,
      fixtureEfficiency: 2.8,
      degradationRate: 3.0,
      powerDensity: 20.0 // W/sq ft
    };
  });

  test('Report generator initializes correctly', () => {
    expect(reportGenerator).toBeDefined();
  });

  test('Generates comprehensive report successfully', () => {
    const report = reportGenerator.generateComprehensiveReport(
      mockProjectMetrics,
      mockEnergyData,
      mockCostData,
      mockPerformanceData
    );

    expect(report).toBeDefined();
    expect(report.metadata.reportType).toBe('Comprehensive');
    expect(report.projectMetrics.projectName).toBe('Test LED Retrofit');
  });

  test('Calculates energy analytics correctly', () => {
    const report = reportGenerator.generateComprehensiveReport(
      mockProjectMetrics,
      mockEnergyData,
      mockCostData,
      mockPerformanceData
    );

    const energy = report.energyAnalytics;
    
    // Verify energy calculations
    expect(energy.totalPowerConsumption).toBe(10);
    expect(energy.dailyEnergyUsage).toBe(160); // 10kW * 16h
    expect(energy.monthlyEnergyUsage).toBe(4800); // 160 * 30
    expect(energy.annualEnergyUsage).toBe(58400); // 160 * 365
    expect(energy.averageElectricityCost).toBe(0.12);
    
    // Verify efficiency rating based on power density (20 W/sq ft = A++)
    expect(energy.energyEfficiencyRating).toBe('A++');
  });

  test('Calculates ROI metrics correctly', () => {
    const report = reportGenerator.generateComprehensiveReport(
      mockProjectMetrics,
      mockEnergyData,
      mockCostData,
      mockPerformanceData
    );

    const roi = report.roiCalculation;
    
    // Verify basic ROI components
    expect(roi.initialInvestment).toBe(50000);
    expect(roi.operationalSavings.laborSavings).toBe(5000);
    expect(roi.operationalSavings.yieldImprovement).toBe(12500);
    expect(roi.operationalSavings.maintenanceReduction).toBe(3000);
    
    // Verify payback period is reasonable
    expect(roi.paybackPeriod).toBeGreaterThan(0);
    expect(roi.paybackPeriod).toBeLessThan(10); // Should be less than 10 years
    
    // Verify NPV is positive (good investment)
    expect(roi.netPresentValue).toBeGreaterThan(0);
    
    // Verify ROI percentage is reasonable
    expect(roi.returnOnInvestment).toBeGreaterThan(0);
  });

  test('Generates lighting performance metrics', () => {
    const report = reportGenerator.generateComprehensiveReport(
      mockProjectMetrics,
      mockEnergyData,
      mockCostData,
      mockPerformanceData
    );

    const performance = report.lightingPerformance;
    
    expect(performance.averagePPFD).toBe(350);
    expect(performance.uniformityRatio).toBe(0.85);
    expect(performance.spectralQualityIndex).toBe(0.92);
    expect(performance.fixtureEfficiency).toBe(2.8);
    expect(performance.complianceStatus.energyCode).toBe('ASHRAE90.1');
    expect(performance.complianceStatus.complianceLevel).toBe('Exceeds');
  });

  test('Calculates environmental impact', () => {
    const report = reportGenerator.generateComprehensiveReport(
      mockProjectMetrics,
      mockEnergyData,
      mockCostData,
      mockPerformanceData
    );

    const environmental = report.environmentalImpact;
    
    expect(environmental.carbonReduction).toBeGreaterThan(0);
    expect(environmental.equivalentTrees).toBeGreaterThan(0);
    expect(environmental.equivalentMiles).toBeGreaterThan(0);
    expect(environmental.waterSavings).toBeGreaterThan(0);
    expect(environmental.sustainabilityScore).toBeGreaterThanOrEqual(0);
    expect(environmental.sustainabilityScore).toBeLessThanOrEqual(100);
  });

  test('Generates executive summary', () => {
    const report = reportGenerator.generateComprehensiveReport(
      mockProjectMetrics,
      mockEnergyData,
      mockCostData,
      mockPerformanceData
    );

    const summary = report.executiveSummary;
    
    expect(summary.projectOverview).toBeDefined();
    expect(summary.keyFindings).toHaveLength(4);
    expect(summary.recommendations).toHaveLength(4);
    expect(summary.roi).toContain('%');
    expect(summary.paybackPeriod).toContain('years');
  });

  test('Generates visualizations', () => {
    const report = reportGenerator.generateComprehensiveReport(
      mockProjectMetrics,
      mockEnergyData,
      mockCostData,
      mockPerformanceData
    );

    const visualizations = report.visualizations;
    
    expect(visualizations).toHaveLength(3);
    expect(visualizations[0].type).toBe('chart');
    expect(visualizations[1].type).toBe('chart');
    expect(visualizations[2].type).toBe('table');
    
    // Verify visualization data structure
    expect(visualizations[0].data).toBeDefined();
    expect(visualizations[1].data).toBeDefined();
    expect(visualizations[2].data).toBeDefined();
  });

  test('Generates appendices', () => {
    const report = reportGenerator.generateComprehensiveReport(
      mockProjectMetrics,
      mockEnergyData,
      mockCostData,
      mockPerformanceData
    );

    const appendices = report.appendices;
    
    expect(appendices).toHaveLength(3);
    expect(appendices[0].type).toBe('calculations');
    expect(appendices[1].type).toBe('specifications');
    expect(appendices[2].type).toBe('certifications');
    
    // Verify appendix content
    expect(appendices[0].content).toContain('Initial Investment');
    expect(appendices[1].content).toContain('Total Power Consumption');
    expect(appendices[2].content).toContain('ASHRAE 90.1');
  });

  test('Energy efficiency rating calculation', () => {
    // Test different power densities
    const testCases = [
      { powerDensity: 10, expected: 'A++' },
      { powerDensity: 18, expected: 'A+' },
      { powerDensity: 23, expected: 'A' },
      { powerDensity: 30, expected: 'B' },
      { powerDensity: 40, expected: 'C' },
      { powerDensity: 50, expected: 'D' }
    ];

    testCases.forEach(testCase => {
      const customEnergyData = {
        ...mockEnergyData,
        totalPower: (testCase.powerDensity * mockProjectMetrics.area) / 1000 // Convert to kW
      };

      const report = reportGenerator.generateComprehensiveReport(
        mockProjectMetrics,
        customEnergyData,
        mockCostData,
        mockPerformanceData
      );

      expect(report.energyAnalytics.energyEfficiencyRating).toBe(testCase.expected);
    });
  });

  test('Report metadata is properly set', () => {
    const report = reportGenerator.generateComprehensiveReport(
      mockProjectMetrics,
      mockEnergyData,
      mockCostData,
      mockPerformanceData
    );

    const metadata = report.metadata;
    
    expect(metadata.reportId).toMatch(/^VLX-\d+$/);
    expect(metadata.generatedDate).toBeInstanceOf(Date);
    expect(metadata.reportType).toBe('Comprehensive');
    expect(metadata.version).toBe('2.0');
    expect(metadata.author).toBe('VibeLux Advanced Analytics Engine');
  });

  test('Financial calculations with different discount rates', () => {
    // Test with different discount rates
    const lowRateGenerator = new ProfessionalReportGenerator(0.05); // 5%
    const highRateGenerator = new ProfessionalReportGenerator(0.12); // 12%

    const lowRateReport = lowRateGenerator.generateComprehensiveReport(
      mockProjectMetrics,
      mockEnergyData,
      mockCostData,
      mockPerformanceData
    );

    const highRateReport = highRateGenerator.generateComprehensiveReport(
      mockProjectMetrics,
      mockEnergyData,
      mockCostData,
      mockPerformanceData
    );

    // Lower discount rate should result in higher NPV
    expect(lowRateReport.roiCalculation.netPresentValue)
      .toBeGreaterThan(highRateReport.roiCalculation.netPresentValue);
  });

  test('PDF export placeholder', async () => {
    const report = reportGenerator.generateComprehensiveReport(
      mockProjectMetrics,
      mockEnergyData,
      mockCostData,
      mockPerformanceData
    );

    const pdfBlob = await reportGenerator.exportToPDF(report);
    
    expect(pdfBlob).toBeInstanceOf(Blob);
    expect(pdfBlob.type).toBe('application/pdf');
  });

  test('Excel export placeholder', async () => {
    const report = reportGenerator.generateComprehensiveReport(
      mockProjectMetrics,
      mockEnergyData,
      mockCostData,
      mockPerformanceData
    );

    const excelBlob = await reportGenerator.exportToExcel(report);
    
    expect(excelBlob).toBeInstanceOf(Blob);
    expect(excelBlob.type).toBe('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  });
});

// Mock performance.now if not available
if (typeof global !== 'undefined' && !global.performance) {
  global.performance = {
    now: () => Date.now()
  } as any;
}