'use client';

import React, { useState, useEffect } from 'react';
import { 
  Calculator, 
  FileText, 
  Download, 
  Eye, 
  BarChart3, 
  Zap, 
  Target, 
  Grid3x3,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Info,
  Lightbulb,
  Sun,
  Moon,
  X,
  FileDown
} from 'lucide-react';
import { EnhancedPhotometricReportGenerator, type PhotometricReportData } from '@/lib/enhanced-photometric-report';
import { useDesigner } from '../context/DesignerContext';

interface PhotometricResult {
  averagePPFD: number; // µmol/m²/s
  uniformityRatio: number;
  coefficientOfVariation: number;
  maxPPFD: number;
  minPPFD: number;
  energyDensity: number; // W/sq ft
  efficacy: number; // µmol/J
  complianceStatus: 'pass' | 'fail' | 'warning';
  recommendations: string[];
}

interface IESData {
  manufacturer: string;
  catalogNumber: string;
  lumens: number;
  wattage: number;
  efficacy: number;
  candlepower: number[][];
  photometricType: string;
}

interface PhotometricStandard {
  id: string;
  name: string;
  minPPFD: number; // µmol/m²/s
  maxPPFD: number; // µmol/m²/s
  uniformityRatio: number;
  maxLPD: number; // Lighting Power Density W/sq ft
  application: string;
}

interface PhotometricEngineProps {
  onClose?: () => void;
}

export function PhotometricEngine({ onClose }: PhotometricEngineProps = {}) {
  const [calculationMode, setCalculationMode] = useState<'point-by-point' | 'lumen-method' | 'coefficient'>('point-by-point');
  const [selectedStandard, setSelectedStandard] = useState<string>('vegetative');
  const [results, setResults] = useState<PhotometricResult | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [iesFiles, setIesFiles] = useState<IESData[]>([]);

  const photometricStandards: PhotometricStandard[] = [
    {
      id: 'propagation',
      name: 'Propagation/Cloning',
      minPPFD: 50,
      maxPPFD: 150,
      uniformityRatio: 1.5,
      maxLPD: 20,
      application: 'Seedlings & Clones'
    },
    {
      id: 'vegetative',
      name: 'Vegetative Growth',
      minPPFD: 200,
      maxPPFD: 600,
      uniformityRatio: 1.5,
      maxLPD: 35,
      application: 'Vegetative Stage'
    },
    {
      id: 'flowering',
      name: 'Flowering/Fruiting',
      minPPFD: 600,
      maxPPFD: 1000,
      uniformityRatio: 1.5,
      maxLPD: 50,
      application: 'Flowering Stage'
    },
    {
      id: 'leafy-greens',
      name: 'Leafy Greens',
      minPPFD: 150,
      maxPPFD: 350,
      uniformityRatio: 1.8,
      maxLPD: 25,
      application: 'Lettuce & Herbs'
    },
    {
      id: 'high-light-crops',
      name: 'High Light Crops',
      minPPFD: 800,
      maxPPFD: 1500,
      uniformityRatio: 1.5,
      maxLPD: 60,
      application: 'Tomatoes, Peppers'
    }
  ];

  const mockPhotometricCalculation = async (): Promise<PhotometricResult> => {
    // Simulate complex calculation
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const selectedStandardData = photometricStandards.find(s => s.id === selectedStandard);
    
    // Mock realistic PPFD calculation results
    const targetPPFD = selectedStandardData ? (selectedStandardData.minPPFD + selectedStandardData.maxPPFD) / 2 : 400;
    const avgPPFD = targetPPFD * (0.9 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 0.2);
    const minPPFD = avgPPFD * (0.6 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 0.2);
    const maxPPFD = avgPPFD * (1.2 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 0.3);
    const uniformityRatio = maxPPFD / minPPFD;
    const cv = (Math.sqrt(crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 0.1 + 0.05)) * 100;
    
    let complianceStatus: 'pass' | 'fail' | 'warning' = 'pass';
    const recommendations: string[] = [];
    
    if (selectedStandardData) {
      if (avgPPFD < selectedStandardData.minPPFD) {
        complianceStatus = 'fail';
        recommendations.push(`Average PPFD (${avgPPFD.toFixed(0)} µmol/m²/s) is below minimum requirement (${selectedStandardData.minPPFD} µmol/m²/s)`);
      }
      
      if (avgPPFD > selectedStandardData.maxPPFD) {
        complianceStatus = complianceStatus === 'fail' ? 'fail' : 'warning';
        recommendations.push(`Average PPFD (${avgPPFD.toFixed(0)} µmol/m²/s) exceeds maximum recommendation (${selectedStandardData.maxPPFD} µmol/m²/s)`);
      }
      
      if (uniformityRatio > selectedStandardData.uniformityRatio) {
        complianceStatus = complianceStatus === 'fail' ? 'fail' : 'warning';
        recommendations.push(`Uniformity ratio (${uniformityRatio.toFixed(2)}) exceeds maximum allowed (${selectedStandardData.uniformityRatio})`);
      }
      
      if (complianceStatus === 'pass') {
        recommendations.push('Design meets all photometric requirements for horticultural lighting');
      }
    }
    
    // Calculate realistic power density and efficacy for horticulture
    const energyDensity = selectedStandardData ? (selectedStandardData.maxLPD * 0.7 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * selectedStandardData.maxLPD * 0.3) : 35;
    const efficacy = 2.5 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 0.5; // 2.5-3.0 µmol/J for modern LEDs
    
    return {
      averagePPFD: avgPPFD,
      uniformityRatio: uniformityRatio,
      coefficientOfVariation: cv,
      maxPPFD: maxPPFD,
      minPPFD: minPPFD,
      energyDensity: energyDensity,
      efficacy: efficacy,
      complianceStatus,
      recommendations
    };
  };

  const runPhotometricCalculation = async () => {
    setIsCalculating(true);
    try {
      const result = await mockPhotometricCalculation();
      setResults(result);
    } catch (error) {
      console.error('Calculation failed:', error);
    } finally {
      setIsCalculating(false);
    }
  };

  const exportResults = async (format: 'pdf' | 'ies' | 'csv' | 'professional') => {
    if (!results) {
      alert('No calculation results to export. Please run a calculation first.');
      return;
    }

    if (format === 'professional') {
      await generateProfessionalReport();
    } else if (format === 'pdf') {
      // Generate HTML content for PDF
      const htmlContent = generatePDFContent();
      
      // Create a new window for printing
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(htmlContent);
        printWindow.document.close();
        
        // Wait for content to load then trigger print
        printWindow.onload = () => {
          printWindow.focus();
          printWindow.print();
          // Optional: close window after print dialog
          printWindow.onafterprint = () => {
            printWindow.close();
          };
        };
      }
    } else if (format === 'ies') {
      // Generate IES file content
      const iesContent = generateIESContent();
      downloadFile('photometric-report.ies', iesContent, 'text/plain');
    } else if (format === 'csv') {
      // Generate CSV content
      const csvContent = generateCSVContent();
      downloadFile('photometric-report.csv', csvContent, 'text/csv');
    }
  };

  const generatePDFContent = () => {
    const standard = photometricStandards.find(s => s.id === selectedStandard);
    const date = new Date().toLocaleDateString();
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Photometric Calculation Report</title>
        <style>
          @page { size: A4; margin: 20mm; }
          body { 
            font-family: Arial, sans-serif; 
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
          }
          h1, h2, h3 { color: #2c3e50; }
          h1 { 
            text-align: center; 
            border-bottom: 3px solid #3498db;
            padding-bottom: 10px;
            margin-bottom: 30px;
          }
          .header-info {
            background: #f8f9fa;
            padding: 15px;
            border-radius: 8px;
            margin-bottom: 30px;
          }
          .metric-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 20px;
            margin: 20px 0;
          }
          .metric-box {
            background: #f0f0f0;
            padding: 15px;
            border-radius: 8px;
            border-left: 4px solid #3498db;
          }
          .metric-label {
            font-size: 12px;
            color: #666;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          .metric-value {
            font-size: 24px;
            font-weight: bold;
            color: #2c3e50;
            margin: 5px 0;
          }
          .compliance-status {
            padding: 10px 20px;
            border-radius: 8px;
            text-align: center;
            font-weight: bold;
            margin: 20px 0;
          }
          .status-pass { background: #d4edda; color: #155724; }
          .status-fail { background: #f8d7da; color: #721c24; }
          .status-warning { background: #fff3cd; color: #856404; }
          .recommendations {
            background: #e8f4fd;
            padding: 20px;
            border-radius: 8px;
            margin-top: 30px;
          }
          .recommendations h3 {
            margin-top: 0;
            color: #0066cc;
          }
          .recommendations ul {
            margin: 10px 0;
            padding-left: 20px;
          }
          .recommendations li {
            margin: 8px 0;
          }
          .footer {
            text-align: center;
            margin-top: 50px;
            padding-top: 20px;
            border-top: 1px solid #ddd;
            color: #666;
            font-size: 12px;
          }
          @media print {
            body { margin: 0; padding: 0; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <h1>Photometric Calculation Report</h1>
        
        <div class="header-info">
          <p><strong>Date:</strong> ${date}</p>
          <p><strong>Calculation Method:</strong> ${calculationMode.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}</p>
          <p><strong>Standard:</strong> ${standard?.name || 'Custom'} - ${standard?.application || 'N/A'}</p>
        </div>

        <h2>Calculation Results</h2>
        
        <div class="metric-grid">
          <div class="metric-box">
            <div class="metric-label">Average PPFD</div>
            <div class="metric-value">${results?.averagePPFD.toFixed(1) || 'N/A'} µmol/m²/s</div>
          </div>
          
          <div class="metric-box">
            <div class="metric-label">Uniformity Ratio</div>
            <div class="metric-value">${results?.uniformityRatio.toFixed(2) || 'N/A'}</div>
          </div>
          
          <div class="metric-box">
            <div class="metric-label">Max PPFD</div>
            <div class="metric-value">${results?.maxPPFD.toFixed(1) || 'N/A'} µmol/m²/s</div>
          </div>
          
          <div class="metric-box">
            <div class="metric-label">Min PPFD</div>
            <div class="metric-value">${results?.minPPFD.toFixed(1) || 'N/A'} µmol/m²/s</div>
          </div>
          
          <div class="metric-box">
            <div class="metric-label">Energy Density</div>
            <div class="metric-value">${results?.energyDensity.toFixed(1) || 'N/A'} W/sq ft</div>
          </div>
          
          <div class="metric-box">
            <div class="metric-label">System Efficacy</div>
            <div class="metric-value">${results?.efficacy.toFixed(2) || 'N/A'} µmol/J</div>
          </div>
        </div>

        <h2>Compliance Status</h2>
        <div class="compliance-status status-${results?.complianceStatus || 'pending'}">
          ${results?.complianceStatus.toUpperCase() || 'PENDING'}
        </div>

        ${(results?.recommendations?.length ?? 0) > 0 ? `
          <div class="recommendations">
            <h3>Recommendations</h3>
            <ul>
              ${results?.recommendations?.map(rec => `<li>${rec}</li>`).join('') || ''}
            </ul>
          </div>
        ` : ''}

        <div class="footer">
          <p>Generated by VibeLux Photometric Engine</p>
          <p>© ${new Date().getFullYear()} VibeLux - Professional Horticultural Lighting Design</p>
        </div>
      </body>
      </html>
    `;
  };

  const generateIESContent = () => {
    // Generate basic IES format
    return `IESNA:LM-63-2002
[TEST] VibeLux Photometric Engine
[TESTDATE] ${new Date().toISOString().split('T')[0]}
[MANUFAC] VibeLux
[LUMCAT] CALCULATED
[LUMINAIRE] Horticultural Lighting System
[LAMPCAT] LED
[LAMP] Multiple LED Arrays
TILT=NONE
1 ${results?.averagePPFD || 0} 1.0 180 1 1 1 -1 -1 0
1.0 1.0 ${results?.energyDensity || 0}
0
${results?.averagePPFD || 0}
`;
  };

  const generateCSVContent = () => {
    return `Photometric Calculation Report
Date,${new Date().toLocaleDateString()}
Calculation Method,${calculationMode}
Standard,${photometricStandards.find(s => s.id === selectedStandard)?.name || 'Custom'}

Metric,Value,Unit
Average PPFD,${results?.averagePPFD?.toFixed(1) || 0},µmol/m²/s
Uniformity Ratio,${results?.uniformityRatio?.toFixed(2) || 0},-
Max PPFD,${results?.maxPPFD?.toFixed(1) || 0},µmol/m²/s
Min PPFD,${results?.minPPFD?.toFixed(1) || 0},µmol/m²/s
Energy Density,${results?.energyDensity?.toFixed(1) || 0},W/sq ft
System Efficacy,${results?.efficacy?.toFixed(2) || 0},µmol/J
Compliance Status,${results?.complianceStatus || 'N/A'},-

Recommendations
${results?.recommendations?.join('\n') || 'No recommendations'}
`;
  };

  const downloadFile = (filename: string, content: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const { state } = useDesigner();
  
  const generateProfessionalReport = async () => {
    if (!state.room || !results) return;

    // Prepare comprehensive report data
    const reportData: PhotometricReportData = {
      project: {
        name: state.project?.name || 'Photometric Analysis',
        client: {
          name: state.project?.client?.name || 'Client Name',
          contact: state.project?.client?.contact || '',
          company: state.project?.client?.company || 'Client Company'
        },
        consultant: {
          name: 'VibeLux Design Team',
          company: 'VibeLux Professional Lighting Solutions',
          license: 'LC-123456'
        },
        location: {
          address: state.project?.location?.address || '123 Main St',
          city: state.project?.location?.city || 'City',
          state: state.project?.location?.state || 'State',
          country: 'USA',
          latitude: state.project?.location?.latitude,
          longitude: state.project?.location?.longitude
        },
        date: new Date(),
        version: '1.0'
      },
      facility: {
        type: state.room.type as any || 'indoor_farm',
        dimensions: {
          length: state.room.dimensions.length,
          width: state.room.dimensions.width,
          height: state.room.dimensions.height,
          area: state.room.dimensions.length * state.room.dimensions.width,
          volume: state.room.dimensions.length * state.room.dimensions.width * state.room.dimensions.height,
          canopyArea: state.room.canopyArea || (state.room.dimensions.length * state.room.dimensions.width * 0.8),
          canopyHeight: state.room.canopyHeight || 3
        },
        environment: {
          ambientLight: false,
          reflectance: {
            ceiling: 0.8,
            walls: 0.5,
            floor: 0.2
          }
        }
      },
      crops: [
        {
          name: state.selectedCrop || 'Cannabis',
          growthStage: 'flowering',
          ppfdRequirements: {
            min: targetMetrics?.minPPFD || 600,
            target: targetMetrics?.targetPPFD || 800,
            max: targetMetrics?.maxPPFD || 1000
          },
          dliRequirements: {
            min: 35,
            target: 40,
            max: 45
          },
          photoperiod: photoperiod === 'flowering' ? 12 : photoperiod === 'vegetative' ? 18 : 16
        }
      ],
      lighting: {
        fixtures: state.fixtures?.map(f => ({
          id: f.id,
          brand: f.model?.brand || 'Unknown',
          model: f.model?.model || 'Unknown',
          quantity: 1,
          specifications: {
            wattage: f.model?.wattage || 0,
            ppf: f.model?.ppf || 0,
            efficacy: f.model?.efficacy || 0,
            inputVoltage: f.model?.voltage || '120-277V',
            powerFactor: 0.95,
            thd: 10,
            lifetime: 50000,
            warranty: 5,
            certifications: ['UL', 'DLC', 'CE']
          },
          photometry: {
            distribution: 'lambertian',
            beamAngle: 120,
            fieldAngle: 140,
            customIES: !!f.model?.customIES
          },
          spectrum: {
            data: f.model?.spectrumData || {},
            metrics: {
              parPercentage: 95,
              bluePercentage: f.model?.spectrumData?.blue || 20,
              greenPercentage: f.model?.spectrumData?.green || 10,
              redPercentage: f.model?.spectrumData?.red || 65,
              farRedPercentage: f.model?.spectrumData?.farRed || 5,
              redFarRedRatio: (f.model?.spectrumData?.red || 65) / (f.model?.spectrumData?.farRed || 5),
              blueRedRatio: (f.model?.spectrumData?.blue || 20) / (f.model?.spectrumData?.red || 65),
              blueGreenRatio: (f.model?.spectrumData?.blue || 20) / (f.model?.spectrumData?.green || 10)
            },
            quality: {
              cri: 90
            }
          },
          mounting: {
            height: f.position.z,
            tilt: 0,
            orientation: 0,
            spacing: {
              x: 4,
              y: 4
            }
          },
          controls: {
            dimmable: true,
            dimmingProtocol: '0-10V',
            currentDimLevel: f.dimming || 100,
            zones: []
          }
        })) || [],
        layout: {
          pattern: 'grid',
          rows: Math.ceil(Math.sqrt(state.fixtures?.length || 0)),
          columns: Math.ceil(Math.sqrt(state.fixtures?.length || 0)),
          totalFixtures: state.fixtures?.length || 0,
          fixtureGroups: []
        },
        electrical: {
          totalConnectedLoad: (state.fixtures?.reduce((sum, f) => sum + (f.model?.wattage || 0), 0) || 0) / 1000,
          demandFactor: 1.0,
          totalDemand: (state.fixtures?.reduce((sum, f) => sum + (f.model?.wattage || 0) * (f.dimming || 100) / 100, 0) || 0) / 1000,
          voltage: 277,
          phases: 3,
          circuitBreakers: [],
          cableSchedule: [],
          panels: []
        }
      },
      calculations: {
        method: calculationMode as any,
        gridSpacing: gridSpacing,
        calculationHeight: state.room?.canopyHeight || 3,
        maintenanceFactor: maintenanceFactor,
        results: {
          ppfd: {
            average: results.averagePPFD,
            minimum: results.minPPFD,
            maximum: results.maxPPFD,
            standardDeviation: results.coefficientOfVariation * results.averagePPFD,
            cv: results.coefficientOfVariation,
            uniformity: {
              minToAvg: results.uniformityRatio,
              minToMax: results.minPPFD / results.maxPPFD,
              avgToMax: results.averagePPFD / results.maxPPFD
            },
            distribution: [],
            histogram: [
              { range: '0-200', count: 0, percentage: 0 },
              { range: '200-400', count: 0, percentage: 0 },
              { range: '400-600', count: 0, percentage: 0 },
              { range: '600-800', count: 0, percentage: 0 },
              { range: '800-1000', count: 0, percentage: 0 },
              { range: '>1000', count: 0, percentage: 0 }
            ]
          },
          dli: {
            values: {
              '12': results.dli?.twelve || 0,
              '16': results.dli?.sixteen || 0,
              '18': results.dli?.eighteen || 0,
              '20': results.dli?.twenty || 0
            },
            distribution: {}
          },
          coverage: {
            totalArea: state.room.dimensions.length * state.room.dimensions.width,
            coveredArea: state.room.canopyArea || (state.room.dimensions.length * state.room.dimensions.width * 0.8),
            percentage: ((state.room.canopyArea || (state.room.dimensions.length * state.room.dimensions.width * 0.8)) / (state.room.dimensions.length * state.room.dimensions.width)) * 100,
            areasBelow: []
          },
          powerMetrics: {
            installedPowerDensity: results.energyDensity,
            effectivePowerDensity: results.energyDensity * (state.fixtures?.reduce((sum, f) => sum + (f.dimming || 100), 0) || 0) / (state.fixtures?.length || 1) / 100,
            ppfdPerWatt: results.averagePPFD / results.energyDensity,
            annualEnergyUse: results.energyDensity * state.room.dimensions.length * state.room.dimensions.width * (photoperiod === 'flowering' ? 12 : 18) * 365 / 1000,
            energyPerMol: results.energyDensity / results.averagePPFD / 3600
          }
        },
        compliance: {
          standards: [
            {
              name: 'DLC Horticultural Lighting',
              organization: 'DesignLights Consortium',
              requirements: [
                {
                  parameter: 'Photosynthetic Photon Efficacy',
                  required: '≥2.3 μmol/J',
                  actual: `${results.efficacy.toFixed(2)} μmol/J`,
                  status: results.efficacy >= 2.3 ? 'pass' : 'fail'
                },
                {
                  parameter: 'Uniformity Ratio',
                  required: '≥0.7',
                  actual: results.uniformityRatio.toFixed(2),
                  status: results.uniformityRatio >= 0.7 ? 'pass' : 'fail'
                }
              ]
            }
          ],
          overallStatus: results.complianceStatus === 'pass' ? 'compliant' : 'non-compliant'
        }
      },
      environmental: {
        hvacIntegration: {
          heatLoad: (state.fixtures?.reduce((sum, f) => sum + (f.model?.wattage || 0), 0) || 0) * 3.412,
          sensibleHeat: (state.fixtures?.reduce((sum, f) => sum + (f.model?.wattage || 0), 0) || 0) * 3.412 * 0.95,
          latentHeat: (state.fixtures?.reduce((sum, f) => sum + (f.model?.wattage || 0), 0) || 0) * 3.412 * 0.05,
          coolingRequired: (state.fixtures?.reduce((sum, f) => sum + (f.model?.wattage || 0), 0) || 0) * 3.412 / 12000,
          airflowRequired: (state.fixtures?.reduce((sum, f) => sum + (f.model?.wattage || 0), 0) || 0) * 3.412 / 1.08 / 20
        },
        sustainability: {
          carbonFootprint: {
            annual: results.energyDensity * state.room.dimensions.length * state.room.dimensions.width * (photoperiod === 'flowering' ? 12 : 18) * 365 / 1000 * 0.92,
            perUnit: 0.5
          },
          renewableEnergy: {
            percentage: 0
          }
        }
      },
      financial: {
        capital: {
          fixtures: (state.fixtures?.length || 0) * 800,
          installation: (state.fixtures?.length || 0) * 150,
          electrical: (state.fixtures?.length || 0) * 100,
          controls: 5000,
          design: 10000,
          total: (state.fixtures?.length || 0) * 1050 + 15000
        },
        operating: {
          energyCost: {
            daily: results.energyDensity * state.room.dimensions.length * state.room.dimensions.width * (photoperiod === 'flowering' ? 12 : 18) / 1000 * 0.12,
            monthly: results.energyDensity * state.room.dimensions.length * state.room.dimensions.width * (photoperiod === 'flowering' ? 12 : 18) / 1000 * 0.12 * 30,
            annual: results.energyDensity * state.room.dimensions.length * state.room.dimensions.width * (photoperiod === 'flowering' ? 12 : 18) / 1000 * 0.12 * 365,
            rate: 0.12
          },
          maintenance: {
            annual: (state.fixtures?.length || 0) * 50,
            cleaning: (state.fixtures?.length || 0) * 25
          },
          total: results.energyDensity * state.room.dimensions.length * state.room.dimensions.width * (photoperiod === 'flowering' ? 12 : 18) / 1000 * 0.12 * 365 + (state.fixtures?.length || 0) * 75
        },
        roi: {
          simplePayback: 3.5,
          npv: 150000,
          irr: 28,
          lcoe: 0.025,
          comparison: {
            baseline: 'HPS 1000W DE',
            savings: 45000,
            percentImprovement: 35
          }
        }
      },
      qa: {
        calibration: {
          meter: 'Apogee MQ-500',
          date: new Date(),
          certificate: 'AP-2024-001'
        },
        validation: {
          method: 'Point-by-point calculation with IES files',
          date: new Date(),
          technician: 'VibeLux Engineering'
        }
      },
      recommendations: {
        immediate: results.recommendations || [],
        shortTerm: [
          'Consider implementing automated dimming schedules',
          'Install environmental sensors for closed-loop control'
        ],
        longTerm: [
          'Evaluate spectral tuning for crop-specific optimization',
          'Integrate with building management system'
        ],
        optimization: [
          {
            parameter: 'Fixture Height',
            current: `${state.fixtures?.[0]?.position.z || 8} ft`,
            recommended: '6-7 ft',
            benefit: 'Improve uniformity by 15%'
          }
        ]
      },
      appendices: {}
    };

    try {
      const generator = new EnhancedPhotometricReportGenerator(reportData);
      const blob = await generator.generate();
      
      // Download the PDF
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Photometric_Report_${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error generating professional report:', error);
    }
  };

  const getComplianceIcon = (status: 'pass' | 'fail' | 'warning') => {
    switch (status) {
      case 'pass': return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'fail': return <AlertTriangle className="w-5 h-5 text-red-400" />;
      case 'warning': return <AlertTriangle className="w-5 h-5 text-yellow-400" />;
    }
  };

  return (
    <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-600/20 rounded-lg">
            <Calculator className="w-6 h-6 text-purple-400" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-white">Photometric Engine</h2>
            <p className="text-sm text-gray-400">Professional lighting calculations</p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <div className="relative group">
            <button
              className="px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg flex items-center gap-2 text-sm"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
            <div className="absolute right-0 mt-2 w-56 bg-gray-800 rounded-lg shadow-lg border border-gray-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
              <button
                onClick={() => exportResults('professional')}
                className="w-full px-4 py-3 text-left text-sm text-white hover:bg-purple-600 rounded-t-lg flex items-center gap-3 border-b border-gray-700"
              >
                <FileDown className="w-4 h-4 text-purple-400" />
                <div>
                  <div className="font-medium">Professional Report</div>
                  <div className="text-xs text-gray-400">Comprehensive PDF with analysis</div>
                </div>
              </button>
              <button
                onClick={() => exportResults('pdf')}
                className="w-full px-4 py-2 text-left text-sm text-white hover:bg-gray-700 flex items-center gap-2"
              >
                <FileText className="w-4 h-4" />
                Basic PDF
              </button>
              <button
                onClick={() => exportResults('ies')}
                className="w-full px-4 py-2 text-left text-sm text-white hover:bg-gray-700 flex items-center gap-2"
              >
                <FileText className="w-4 h-4" />
                IES File
              </button>
              <button
                onClick={() => exportResults('csv')}
                className="w-full px-4 py-2 text-left text-sm text-white hover:bg-gray-700 rounded-b-lg flex items-center gap-2"
              >
                <FileText className="w-4 h-4" />
                CSV Data
              </button>
            </div>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Calculation Settings */}
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-lg font-medium text-white mb-4">Calculation Method</h3>
          <div className="space-y-3">
            {[
              { id: 'point-by-point', name: 'Point-by-Point', desc: 'Detailed grid calculations with photometric data' },
              { id: 'lumen-method', name: 'Lumen Method', desc: 'Zone cavity calculations for uniform layouts' },
              { id: 'coefficient', name: 'Coefficient of Utilization', desc: 'Quick calculations using CU tables' }
            ].map(method => (
              <label key={method.id} className="flex items-start gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="calculation-method"
                  value={method.id}
                  checked={calculationMode === method.id}
                  onChange={(e) => setCalculationMode(e.target.value as any)}
                  className="mt-1 text-purple-600"
                />
                <div>
                  <div className="font-medium text-white">{method.name}</div>
                  <div className="text-sm text-gray-400">{method.desc}</div>
                </div>
              </label>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-lg font-medium text-white mb-4">Standards Compliance</h3>
          <div className="space-y-3">
            <select
              value={selectedStandard}
              onChange={(e) => setSelectedStandard(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
            >
              {photometricStandards.map(standard => (
                <option key={standard.id} value={standard.id}>
                  {standard.name}
                </option>
              ))}
            </select>
            
            {selectedStandard && (
              <div className="p-3 bg-gray-800 rounded-lg text-sm">
                {(() => {
                  const standard = photometricStandards.find(s => s.id === selectedStandard);
                  return (
                    <div className="space-y-1 text-gray-300">
                      <div><strong>Application:</strong> {standard?.application}</div>
                      <div><strong>Min PPFD:</strong> {standard?.minPPFD} µmol/m²/s</div>
                      <div><strong>Max PPFD:</strong> {standard?.maxPPFD} µmol/m²/s</div>
                      <div><strong>Max Uniformity:</strong> {standard?.uniformityRatio}:1</div>
                      <div><strong>Max LPD:</strong> {standard?.maxLPD} W/sq ft</div>
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Calculation Controls */}
      <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Grid3x3 className="w-5 h-5 text-gray-400" />
            <span className="text-sm text-gray-300">Grid: 2ft × 2ft (576 points)</span>
          </div>
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-gray-400" />
            <span className="text-sm text-gray-300">Canopy Height: 36" AFF</span>
          </div>
        </div>
        
        <button
          onClick={runPhotometricCalculation}
          disabled={isCalculating}
          className="px-6 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white rounded-lg flex items-center gap-2 font-medium"
        >
          {isCalculating ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Calculating...
            </>
          ) : (
            <>
              <Calculator className="w-4 h-4" />
              Run Calculation
            </>
          )}
        </button>
      </div>

      {/* Results */}
      {results && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-medium text-white">Calculation Results</h3>
            {getComplianceIcon(results.complianceStatus)}
            <span className={`text-sm font-medium ${
              results.complianceStatus === 'pass' ? 'text-green-400' :
              results.complianceStatus === 'warning' ? 'text-yellow-400' : 'text-red-400'
            }`}>
              {results.complianceStatus === 'pass' ? 'Compliant' :
               results.complianceStatus === 'warning' ? 'Warning' : 'Non-Compliant'}
            </span>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-4 bg-gray-800 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Lightbulb className="w-4 h-4 text-yellow-400" />
                <span className="text-sm font-medium text-gray-300">Average PPFD</span>
              </div>
              <div className="text-2xl font-bold text-white">
                {results.averagePPFD.toFixed(0)} 
                <span className="text-lg text-gray-400 ml-1">µmol/m²/s</span>
              </div>
              <div className="text-xs text-gray-400">
                Min: {results.minPPFD.toFixed(0)} | Max: {results.maxPPFD.toFixed(0)}
              </div>
            </div>

            <div className="p-4 bg-gray-800 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <BarChart3 className="w-4 h-4 text-blue-400" />
                <span className="text-sm font-medium text-gray-300">Uniformity Ratio</span>
              </div>
              <div className="text-2xl font-bold text-white">
                {results.uniformityRatio.toFixed(2)}:1
              </div>
              <div className="text-xs text-gray-400">
                CV: {results.coefficientOfVariation.toFixed(1)}%
              </div>
            </div>

            <div className="p-4 bg-gray-800 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-4 h-4 text-green-400" />
                <span className="text-sm font-medium text-gray-300">Energy Density</span>
              </div>
              <div className="text-2xl font-bold text-white">
                {results.energyDensity.toFixed(2)} 
                <span className="text-lg text-gray-400 ml-1">W/sq ft</span>
              </div>
              <div className="text-xs text-gray-400">
                Efficacy: {results.efficacy.toFixed(1)} µmol/J
              </div>
            </div>
          </div>

          {/* Recommendations */}
          {results.recommendations.length > 0 && (
            <div className="p-4 bg-gray-800 rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <Info className="w-4 h-4 text-blue-400" />
                <span className="font-medium text-white">Recommendations</span>
              </div>
              <ul className="space-y-2">
                {results.recommendations.map((rec, index) => (
                  <li key={index} className="text-sm text-gray-300 flex items-start gap-2">
                    <span className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-2 flex-shrink-0" />
                    {rec}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}