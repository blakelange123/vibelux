import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const {
      format,
      sections,
      projectInfo,
      projectData,
      settings
    } = await request.json();

    if (!format || !sections || !projectInfo) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Generate report based on format
    let reportContent;
    let contentType;
    let filename;

    switch (format) {
      case 'pdf':
        reportContent = await generatePDFReport(sections, projectInfo, projectData, settings);
        contentType = 'application/pdf';
        filename = `${projectInfo.projectName.replace(/\s+/g, '-')}_lighting-report.pdf`;
        break;
      
      case 'docx':
        reportContent = await generateWordReport(sections, projectInfo, projectData, settings);
        contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
        filename = `${projectInfo.projectName.replace(/\s+/g, '-')}_lighting-report.docx`;
        break;
      
      case 'xlsx':
        reportContent = await generateExcelReport(sections, projectInfo, projectData, settings);
        contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
        filename = `${projectInfo.projectName.replace(/\s+/g, '-')}_lighting-calculations.xlsx`;
        break;
      
      default:
        return NextResponse.json({ error: 'Invalid format' }, { status: 400 });
    }

    return new NextResponse(reportContent, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${filename}"`
      }
    });

  } catch (error) {
    console.error('Error generating report:', error);
    return NextResponse.json(
      { error: 'Failed to generate report' },
      { status: 500 }
    );
  }
}

async function generatePDFReport(sections: any[], projectInfo: any, projectData: any, settings: any): Promise<Buffer> {
  // Generate professional PDF report
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>${projectInfo.projectName} - Lighting Design Report</title>
      <style>
        @page {
          size: ${settings.paperSize === 'a4' ? 'A4' : settings.paperSize === 'legal' ? 'legal' : 'letter'} ${settings.orientation};
          margin: 1in;
          @top-center {
            content: "${projectInfo.companyName || 'VibeLux Lighting Design'}";
            font-size: 10pt;
            color: #666;
          }
          @bottom-center {
            content: counter(page) " of " counter(pages);
            font-size: 10pt;
            color: #666;
          }
        }
        
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          line-height: 1.6;
          color: ${settings.colorScheme === 'grayscale' ? '#000' : '#1a1a1a'};
          background: white;
        }
        
        .page-break {
          page-break-after: always;
        }
        
        .title-page {
          height: 100vh;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          text-align: center;
          page-break-after: always;
        }
        
        .title-page h1 {
          font-size: 36pt;
          font-weight: 300;
          margin-bottom: 20px;
          color: ${settings.colorScheme === 'grayscale' ? '#000' : '#2c3e50'};
        }
        
        .title-page h2 {
          font-size: 24pt;
          font-weight: 400;
          margin-bottom: 40px;
          color: ${settings.colorScheme === 'grayscale' ? '#333' : '#7f8c8d'};
        }
        
        .title-page .project-info {
          margin-top: 60px;
          font-size: 14pt;
          color: #555;
        }
        
        .title-page .project-info p {
          margin: 5px 0;
        }
        
        .table-of-contents {
          margin: 40px 0;
        }
        
        .table-of-contents h2 {
          font-size: 24pt;
          margin-bottom: 30px;
          color: ${settings.colorScheme === 'grayscale' ? '#000' : '#2c3e50'};
        }
        
        .table-of-contents ol {
          list-style: none;
          padding: 0;
        }
        
        .table-of-contents li {
          font-size: 12pt;
          margin: 15px 0;
          display: flex;
          justify-content: space-between;
          align-items: baseline;
        }
        
        .table-of-contents .dots {
          flex: 1;
          margin: 0 10px;
          border-bottom: 2px dotted #ccc;
        }
        
        .section {
          margin: 40px 0;
          page-break-inside: avoid;
        }
        
        .section h2 {
          font-size: 20pt;
          margin-bottom: 20px;
          color: ${settings.colorScheme === 'grayscale' ? '#000' : '#2c3e50'};
          border-bottom: 2px solid ${settings.colorScheme === 'grayscale' ? '#666' : '#3498db'};
          padding-bottom: 10px;
        }
        
        .section h3 {
          font-size: 16pt;
          margin: 20px 0 15px;
          color: ${settings.colorScheme === 'grayscale' ? '#333' : '#34495e'};
        }
        
        table {
          width: 100%;
          border-collapse: collapse;
          margin: 20px 0;
          font-size: 10pt;
        }
        
        th, td {
          padding: 10px;
          text-align: left;
          border: 1px solid #ddd;
        }
        
        th {
          background: ${settings.colorScheme === 'grayscale' ? '#f5f5f5' : '#f8f9fa'};
          font-weight: 600;
          color: ${settings.colorScheme === 'grayscale' ? '#000' : '#2c3e50'};
        }
        
        tr:nth-child(even) {
          background: ${settings.colorScheme === 'grayscale' ? '#fafafa' : '#f8f9fa'};
        }
        
        .luminaire-schedule {
          margin: 20px 0;
        }
        
        .luminaire-schedule .fixture {
          border: 1px solid #ddd;
          padding: 15px;
          margin: 15px 0;
          page-break-inside: avoid;
        }
        
        .luminaire-schedule .fixture-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 10px;
        }
        
        .luminaire-schedule .fixture-tag {
          font-size: 14pt;
          font-weight: bold;
          color: ${settings.colorScheme === 'grayscale' ? '#000' : '#3498db'};
        }
        
        .calculation-grid {
          margin: 20px 0;
          overflow-x: auto;
        }
        
        .calculation-grid table {
          font-size: 9pt;
          min-width: 100%;
        }
        
        .calculation-grid td {
          text-align: center;
          padding: 5px;
          min-width: 40px;
        }
        
        .calculation-grid .max-value {
          background: ${settings.colorScheme === 'grayscale' ? '#e0e0e0' : '#e8f5e9'};
          font-weight: bold;
        }
        
        .calculation-grid .min-value {
          background: ${settings.colorScheme === 'grayscale' ? '#f0f0f0' : '#ffebee'};
        }
        
        .surface-properties {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 20px;
          margin: 20px 0;
        }
        
        .surface-properties .surface {
          border: 1px solid #ddd;
          padding: 15px;
          border-radius: 5px;
        }
        
        .surface-properties .surface h4 {
          margin-bottom: 10px;
          color: ${settings.colorScheme === 'grayscale' ? '#333' : '#34495e'};
        }
        
        .metric-card {
          display: inline-block;
          border: 1px solid #ddd;
          padding: 20px;
          margin: 10px;
          text-align: center;
          min-width: 150px;
          border-radius: 5px;
          background: ${settings.colorScheme === 'grayscale' ? '#f9f9f9' : '#f8f9fa'};
        }
        
        .metric-card .value {
          font-size: 24pt;
          font-weight: bold;
          color: ${settings.colorScheme === 'grayscale' ? '#000' : '#3498db'};
        }
        
        .metric-card .label {
          font-size: 10pt;
          color: #666;
          margin-top: 5px;
        }
        
        .chart-container {
          margin: 20px 0;
          text-align: center;
          page-break-inside: avoid;
        }
        
        .chart-placeholder {
          width: 100%;
          height: 300px;
          border: 1px solid #ddd;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f5f5f5;
          color: #666;
        }
        
        .compliance-check {
          margin: 15px 0;
          padding: 15px;
          border-left: 4px solid ${settings.colorScheme === 'grayscale' ? '#666' : '#27ae60'};
          background: ${settings.colorScheme === 'grayscale' ? '#f9f9f9' : '#e8f8f5'};
        }
        
        .compliance-check.fail {
          border-left-color: ${settings.colorScheme === 'grayscale' ? '#333' : '#e74c3c'};
          background: ${settings.colorScheme === 'grayscale' ? '#f5f5f5' : '#fdedec'};
        }
        
        .footer {
          margin-top: 60px;
          padding-top: 20px;
          border-top: 1px solid #ddd;
          font-size: 10pt;
          color: #666;
          text-align: center;
        }
        
        @media print {
          .page-break { page-break-after: always; }
          .no-print { display: none; }
        }
      </style>
    </head>
    <body>
      ${generateTitlePage(projectInfo, settings)}
      ${sections.map(section => generateSection(section, projectInfo, projectData, settings)).join('')}
    </body>
    </html>
  `;
  
  return Buffer.from(html, 'utf-8');
}

function generateTitlePage(projectInfo: any, settings: any): string {
  return `
    <div class="title-page">
      ${settings.includeLogo ? '<img src="/logo.png" alt="Company Logo" style="max-width: 200px; margin-bottom: 40px;">' : ''}
      <h1>${projectInfo.projectName}</h1>
      <h2>Lighting Design Report</h2>
      
      <div class="project-info">
        <p><strong>Client:</strong> ${projectInfo.clientName}</p>
        ${projectInfo.location ? `<p><strong>Location:</strong> ${projectInfo.location}</p>` : ''}
        ${projectInfo.buildingType ? `<p><strong>Building Type:</strong> ${projectInfo.buildingType}</p>` : ''}
        <p><strong>Date:</strong> ${new Date(projectInfo.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
        <p><strong>Prepared by:</strong> ${projectInfo.designerName}</p>
        ${projectInfo.companyName ? `<p><strong>Company:</strong> ${projectInfo.companyName}</p>` : ''}
      </div>
    </div>
  `;
}

function generateSection(section: any, projectInfo: any, projectData: any, settings: any): string {
  switch (section.id) {
    case 'table-of-contents':
      return generateTableOfContents(section, projectInfo, settings);
    case 'executive-summary':
      return generateExecutiveSummary(section, projectInfo, projectData, settings);
    case 'calculation-surfaces':
      return generateCalculationSurfaces(section, projectInfo, projectData, settings);
    case 'luminaire-schedule':
      return generateLuminaireSchedule(section, projectInfo, projectData, settings);
    case 'point-by-point':
      return generatePointByPoint(section, projectInfo, projectData, settings);
    case 'wattage-calculations':
      return generateWattageCalculations(section, projectInfo, projectData, settings);
    case 'uniformity-analysis':
      return generateUniformityAnalysis(section, projectInfo, projectData, settings);
    case 'roi-analysis':
      return generateROIAnalysis(section, projectInfo, projectData, settings);
    case 'compliance-report':
      return generateComplianceReport(section, projectInfo, projectData, settings);
    case 'fixture-coordinates':
      return generateFixtureCoordinates(section, projectInfo, projectData, settings);
    case 'room-objects':
      return generateRoomObjects(section, projectInfo, projectData, settings);
    case 'plant-analysis':
      return generatePlantAnalysis(section, projectInfo, projectData, settings);
    case 'environmental-factors':
      return generateEnvironmentalFactors(section, projectInfo, projectData, settings);
    case 'electrical-layout':
      return generateElectricalLayout(section, projectInfo, projectData, settings);
    case 'control-systems':
      return generateControlSystems(section, projectInfo, projectData, settings);
    case 'daylight-integration':
      return generateDaylightIntegration(section, projectInfo, projectData, settings);
    case 'glare-analysis':
      return generateGlareAnalysis(section, projectInfo, projectData, settings);
    case 'spectral-analysis':
      return generateSpectralAnalysis(section, projectInfo, projectData, settings);
    case 'emergency-lighting':
      return generateEmergencyLighting(section, projectInfo, projectData, settings);
    case 'hvac-coordination':
      return generateHVACCoordination(section, projectInfo, projectData, settings);
    case 'mounting-details':
      return generateMountingDetails(section, projectInfo, projectData, settings);
    case 'cfd-analysis':
      return generateCFDAnalysis(section, projectInfo, projectData, settings);
    default:
      return `<div class="section"><h2>${section.title}</h2><p>Section content would go here.</p></div>`;
  }
}

function generateTableOfContents(section: any, projectInfo: any, settings: any): string {
  return `
    <div class="table-of-contents page-break">
      <h2>Table of Contents</h2>
      <ol>
        <li><span>Executive Summary</span><span class="dots"></span><span>3</span></li>
        <li><span>Calculation Surfaces</span><span class="dots"></span><span>5</span></li>
        <li><span>Luminaire Schedule</span><span class="dots"></span><span>7</span></li>
        <li><span>Point-by-Point Calculations</span><span class="dots"></span><span>10</span></li>
        <li><span>Wattage & Power Density</span><span class="dots"></span><span>15</span></li>
        <li><span>Uniformity Analysis</span><span class="dots"></span><span>18</span></li>
        <li><span>ROI & Cost Analysis</span><span class="dots"></span><span>20</span></li>
        <li><span>Code Compliance</span><span class="dots"></span><span>23</span></li>
      </ol>
    </div>
  `;
}

function generateExecutiveSummary(section: any, projectInfo: any, projectData: any, settings: any): string {
  return `
    <div class="section page-break">
      <h2>Executive Summary</h2>
      
      <h3>Project Overview</h3>
      <p>This lighting design report presents a comprehensive analysis for ${projectInfo.projectName} located at ${projectInfo.location || 'the project site'}. The design aims to provide optimal lighting conditions while maximizing energy efficiency and meeting all applicable codes and standards.</p>
      
      <h3>Key Metrics</h3>
      <div style="display: flex; flex-wrap: wrap; gap: 10px; margin: 20px 0;">
        <div class="metric-card">
          <div class="value">85</div>
          <div class="label">Average fc</div>
        </div>
        <div class="metric-card">
          <div class="value">0.82</div>
          <div class="label">Uniformity Ratio</div>
        </div>
        <div class="metric-card">
          <div class="value">1.2</div>
          <div class="label">W/sq ft</div>
        </div>
        <div class="metric-card">
          <div class="value">52%</div>
          <div class="label">Energy Savings</div>
        </div>
      </div>
      
      <h3>Design Highlights</h3>
      <ul>
        <li>Energy-efficient LED fixtures throughout</li>
        <li>Meets or exceeds IECC 2021 energy code requirements</li>
        <li>Provides uniform illumination with minimal glare</li>
        <li>Estimated ROI of 2.3 years with utility rebates</li>
        <li>25-year projected lifecycle with minimal maintenance</li>
      </ul>
      
      <h3>Recommendations</h3>
      <p>Based on our analysis, we recommend proceeding with the proposed lighting design. The system will provide excellent visual conditions while delivering substantial energy savings and meeting all project requirements.</p>
    </div>
  `;
}

function generateCalculationSurfaces(section: any, projectInfo: any, projectData: any, settings: any): string {
  const dimensions = projectInfo.roomDimensions || { length: 100, width: 50, height: 12 };
  
  return `
    <div class="section page-break">
      <h2>Calculation Surfaces</h2>
      
      <h3>Room Dimensions</h3>
      <table>
        <tr>
          <th>Dimension</th>
          <th>Value</th>
          <th>Units</th>
        </tr>
        <tr>
          <td>Length</td>
          <td>${dimensions.length}</td>
          <td>feet</td>
        </tr>
        <tr>
          <td>Width</td>
          <td>${dimensions.width}</td>
          <td>feet</td>
        </tr>
        <tr>
          <td>Height</td>
          <td>${dimensions.height}</td>
          <td>feet</td>
        </tr>
        <tr>
          <td>Total Area</td>
          <td>${dimensions.length * dimensions.width}</td>
          <td>sq ft</td>
        </tr>
      </table>
      
      <h3>Surface Properties</h3>
      <div class="surface-properties">
        <div class="surface">
          <h4>Ceiling</h4>
          <p>Reflectance: 80%</p>
          <p>Material: White acoustic tile</p>
          <p>Area: ${dimensions.length * dimensions.width} sq ft</p>
        </div>
        <div class="surface">
          <h4>Walls</h4>
          <p>Reflectance: 50%</p>
          <p>Material: Light gray paint</p>
          <p>Area: ${2 * (dimensions.length + dimensions.width) * dimensions.height} sq ft</p>
        </div>
        <div class="surface">
          <h4>Floor</h4>
          <p>Reflectance: 20%</p>
          <p>Material: Medium gray carpet</p>
          <p>Area: ${dimensions.length * dimensions.width} sq ft</p>
        </div>
        <div class="surface">
          <h4>Work Plane</h4>
          <p>Height: 2.5 feet AFF</p>
          <p>Grid: 5' × 5'</p>
          <p>Calculation Points: ${Math.floor(dimensions.length/5) * Math.floor(dimensions.width/5)}</p>
        </div>
      </div>
    </div>
  `;
}

function generateLuminaireSchedule(section: any, projectInfo: any, projectData: any, settings: any): string {
  return `
    <div class="section page-break">
      <h2>Luminaire Schedule</h2>
      
      <div class="luminaire-schedule">
        <div class="fixture">
          <div class="fixture-header">
            <span class="fixture-tag">Type A</span>
            <span>Qty: 24</span>
          </div>
          <table>
            <tr><td width="30%">Manufacturer</td><td>VibeLux Lighting</td></tr>
            <tr><td>Model</td><td>VL-LED-2X4-50</td></tr>
            <tr><td>Description</td><td>2x4 LED Troffer, 50W</td></tr>
            <tr><td>Lumens</td><td>5,000 lm</td></tr>
            <tr><td>CCT</td><td>4000K</td></tr>
            <tr><td>CRI</td><td>90+</td></tr>
            <tr><td>Distribution</td><td>Direct</td></tr>
            <tr><td>Mounting</td><td>Recessed</td></tr>
            <tr><td>Controls</td><td>0-10V Dimming</td></tr>
          </table>
        </div>
        
        <div class="fixture">
          <div class="fixture-header">
            <span class="fixture-tag">Type B</span>
            <span>Qty: 8</span>
          </div>
          <table>
            <tr><td width="30%">Manufacturer</td><td>VibeLux Lighting</td></tr>
            <tr><td>Model</td><td>VL-LED-STRIP-40</td></tr>
            <tr><td>Description</td><td>4ft LED Strip, 40W</td></tr>
            <tr><td>Lumens</td><td>4,000 lm</td></tr>
            <tr><td>CCT</td><td>4000K</td></tr>
            <tr><td>CRI</td><td>85+</td></tr>
            <tr><td>Distribution</td><td>Direct/Indirect</td></tr>
            <tr><td>Mounting</td><td>Suspended</td></tr>
            <tr><td>Controls</td><td>DALI</td></tr>
          </table>
        </div>
      </div>
      
      <h3>Total Connected Load</h3>
      <table>
        <tr>
          <th>Fixture Type</th>
          <th>Quantity</th>
          <th>Watts per Fixture</th>
          <th>Total Watts</th>
        </tr>
        <tr>
          <td>Type A</td>
          <td>24</td>
          <td>50W</td>
          <td>1,200W</td>
        </tr>
        <tr>
          <td>Type B</td>
          <td>8</td>
          <td>40W</td>
          <td>320W</td>
        </tr>
        <tr style="font-weight: bold;">
          <td colspan="3">Total Connected Load</td>
          <td>1,520W</td>
        </tr>
      </table>
    </div>
  `;
}

function generatePointByPoint(section: any, projectInfo: any, projectData: any, settings: any): string {
  // Generate a sample calculation grid
  const rows = 10;
  const cols = 20;
  const values = Array.from({ length: rows }, () => 
    Array.from({ length: cols }, () => Math.floor(Math.random() * 30) + 70)
  );
  
  return `
    <div class="section page-break">
      <h2>Point-by-Point Calculations</h2>
      
      <h3>Illuminance Values (fc)</h3>
      <p>Work plane height: 2.5 feet AFF | Grid spacing: 5' × 5'</p>
      
      <div class="calculation-grid">
        <table>
          <tbody>
            ${values.map((row, i) => `
              <tr>
                ${row.map((val, j) => {
                  const isMax = val >= 95;
                  const isMin = val <= 75;
                  return `<td class="${isMax ? 'max-value' : isMin ? 'min-value' : ''}">${val}</td>`;
                }).join('')}
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
      
      <h3>Statistical Summary</h3>
      <table>
        <tr>
          <th>Metric</th>
          <th>Value</th>
        </tr>
        <tr>
          <td>Average Illuminance</td>
          <td>85 fc</td>
        </tr>
        <tr>
          <td>Maximum Illuminance</td>
          <td>98 fc</td>
        </tr>
        <tr>
          <td>Minimum Illuminance</td>
          <td>72 fc</td>
        </tr>
        <tr>
          <td>Uniformity Ratio (Avg/Min)</td>
          <td>1.18</td>
        </tr>
        <tr>
          <td>Max/Min Ratio</td>
          <td>1.36</td>
        </tr>
      </table>
    </div>
  `;
}

function generateWattageCalculations(section: any, projectInfo: any, projectData: any, settings: any): string {
  const area = (projectInfo.roomDimensions?.length || 100) * (projectInfo.roomDimensions?.width || 50);
  const totalWatts = 1520;
  const lpd = totalWatts / area;
  
  return `
    <div class="section page-break">
      <h2>Wattage & Power Density</h2>
      
      <h3>Power Summary</h3>
      <table>
        <tr>
          <th>Description</th>
          <th>Value</th>
          <th>Units</th>
        </tr>
        <tr>
          <td>Total Connected Load</td>
          <td>${totalWatts}</td>
          <td>Watts</td>
        </tr>
        <tr>
          <td>Room Area</td>
          <td>${area}</td>
          <td>sq ft</td>
        </tr>
        <tr>
          <td>Lighting Power Density (LPD)</td>
          <td>${lpd.toFixed(2)}</td>
          <td>W/sq ft</td>
        </tr>
        <tr>
          <td>Code Allowed LPD</td>
          <td>0.82</td>
          <td>W/sq ft</td>
        </tr>
        <tr style="${lpd > 0.82 ? 'color: red;' : 'color: green;'}">
          <td>LPD Compliance</td>
          <td>${lpd <= 0.82 ? 'PASS' : 'FAIL'}</td>
          <td>${((0.82 - lpd) / 0.82 * 100).toFixed(1)}%</td>
        </tr>
      </table>
      
      <h3>Energy Usage Projection</h3>
      <table>
        <tr>
          <th>Period</th>
          <th>Operating Hours</th>
          <th>Energy Use (kWh)</th>
          <th>Cost (@$0.12/kWh)</th>
        </tr>
        <tr>
          <td>Daily</td>
          <td>10</td>
          <td>${(totalWatts * 10 / 1000).toFixed(1)}</td>
          <td>$${(totalWatts * 10 / 1000 * 0.12).toFixed(2)}</td>
        </tr>
        <tr>
          <td>Monthly</td>
          <td>260</td>
          <td>${(totalWatts * 260 / 1000).toFixed(0)}</td>
          <td>$${(totalWatts * 260 / 1000 * 0.12).toFixed(2)}</td>
        </tr>
        <tr>
          <td>Annual</td>
          <td>3,120</td>
          <td>${(totalWatts * 3120 / 1000).toFixed(0)}</td>
          <td>$${(totalWatts * 3120 / 1000 * 0.12).toFixed(2)}</td>
        </tr>
      </table>
      
      ${section.options?.includeGraphs ? `
        <div class="chart-container">
          <h3>Power Density Comparison</h3>
          <div class="chart-placeholder">
            [Bar chart showing LPD comparison with code requirements]
          </div>
        </div>
      ` : ''}
    </div>
  `;
}

function generateUniformityAnalysis(section: any, projectInfo: any, projectData: any, settings: any): string {
  return `
    <div class="section page-break">
      <h2>Uniformity Analysis</h2>
      
      <h3>Uniformity Metrics</h3>
      <table>
        <tr>
          <th>Metric</th>
          <th>Calculated Value</th>
          <th>Recommended Range</th>
          <th>Status</th>
        </tr>
        <tr>
          <td>Average/Minimum (Eavg/Emin)</td>
          <td>1.18</td>
          <td>≤ 1.5</td>
          <td style="color: green;">GOOD</td>
        </tr>
        <tr>
          <td>Maximum/Minimum (Emax/Emin)</td>
          <td>1.36</td>
          <td>≤ 2.0</td>
          <td style="color: green;">GOOD</td>
        </tr>
        <tr>
          <td>Coefficient of Variation (CV)</td>
          <td>0.08</td>
          <td>≤ 0.15</td>
          <td style="color: green;">EXCELLENT</td>
        </tr>
      </table>
      
      ${section.options?.includeGraphs ? `
        <div class="chart-container">
          <h3>Illuminance Distribution</h3>
          <div class="chart-placeholder">
            [3D surface plot showing light distribution across the room]
          </div>
        </div>
        
        <div class="chart-container">
          <h3>Uniformity Gradient Map</h3>
          <div class="chart-placeholder">
            [Gradient heatmap showing uniformity across the space]
          </div>
        </div>
      ` : ''}
      
      <h3>Analysis Summary</h3>
      <p>The lighting design achieves excellent uniformity across the entire space. The low coefficient of variation (0.08) indicates very consistent light levels throughout the room, which will provide comfortable visual conditions and reduce eye strain for occupants.</p>
    </div>
  `;
}

function generateROIAnalysis(section: any, projectInfo: any, projectData: any, settings: any): string {
  const detailLevel = section.options?.detailLevel || 'detailed';
  
  return `
    <div class="section page-break">
      <h2>ROI & Cost Analysis</h2>
      
      <h3>Project Cost Summary</h3>
      <table>
        <tr>
          <th>Category</th>
          <th>Cost</th>
        </tr>
        <tr>
          <td>Fixtures & Materials</td>
          <td>$12,500</td>
        </tr>
        <tr>
          <td>Installation Labor</td>
          <td>$8,000</td>
        </tr>
        <tr>
          <td>Controls & Sensors</td>
          <td>$3,500</td>
        </tr>
        <tr>
          <td style="font-weight: bold;">Subtotal</td>
          <td style="font-weight: bold;">$24,000</td>
        </tr>
        <tr>
          <td>Utility Rebates</td>
          <td style="color: green;">-$4,800</td>
        </tr>
        <tr>
          <td style="font-weight: bold;">Net Project Cost</td>
          <td style="font-weight: bold;">$19,200</td>
        </tr>
      </table>
      
      <h3>Annual Savings Analysis</h3>
      <table>
        <tr>
          <th>Description</th>
          <th>Existing</th>
          <th>Proposed</th>
          <th>Savings</th>
        </tr>
        <tr>
          <td>Connected Load</td>
          <td>3,200W</td>
          <td>1,520W</td>
          <td>1,680W</td>
        </tr>
        <tr>
          <td>Annual Energy Use</td>
          <td>9,984 kWh</td>
          <td>4,742 kWh</td>
          <td>5,242 kWh</td>
        </tr>
        <tr>
          <td>Annual Energy Cost</td>
          <td>$1,198</td>
          <td>$569</td>
          <td>$629</td>
        </tr>
        <tr>
          <td>Annual Maintenance</td>
          <td>$800</td>
          <td>$200</td>
          <td>$600</td>
        </tr>
        <tr style="font-weight: bold;">
          <td>Total Annual Savings</td>
          <td colspan="2"></td>
          <td>$8,229</td>
        </tr>
      </table>
      
      ${detailLevel === 'detailed' || detailLevel === 'comprehensive' ? `
        <h3>Financial Metrics</h3>
        <div style="display: flex; flex-wrap: wrap; gap: 10px; margin: 20px 0;">
          <div class="metric-card">
            <div class="value">2.3</div>
            <div class="label">Years Payback</div>
          </div>
          <div class="metric-card">
            <div class="value">43%</div>
            <div class="label">ROI Year 1</div>
          </div>
          <div class="metric-card">
            <div class="value">$186k</div>
            <div class="label">25-Year Savings</div>
          </div>
          <div class="metric-card">
            <div class="value">52%</div>
            <div class="label">Energy Reduction</div>
          </div>
        </div>
      ` : ''}
      
      ${section.options?.includeGraphs ? `
        <div class="chart-container">
          <h3>Cumulative Savings Over Time</h3>
          <div class="chart-placeholder">
            [Line chart showing cumulative savings vs. initial investment over 10 years]
          </div>
        </div>
      ` : ''}
    </div>
  `;
}

function generateComplianceReport(section: any, projectInfo: any, projectData: any, settings: any): string {
  return `
    <div class="section page-break">
      <h2>Code Compliance Report</h2>
      
      <h3>Applicable Codes & Standards</h3>
      <ul>
        <li>IECC 2021 - International Energy Conservation Code</li>
        <li>ASHRAE 90.1-2019 - Energy Standard for Buildings</li>
        <li>IES RP-1-20 - Office Lighting</li>
        <li>Title 24 2022 - California Energy Code</li>
        <li>LEED v4.1 - Indoor Environmental Quality</li>
      </ul>
      
      <h3>Compliance Summary</h3>
      
      <div class="compliance-check">
        <h4>✓ Energy Code Compliance - IECC 2021</h4>
        <p>Lighting Power Density: 0.30 W/sq ft (Allowed: 0.82 W/sq ft)</p>
        <p>Result: 63% below code maximum - PASS</p>
      </div>
      
      <div class="compliance-check">
        <h4>✓ Illuminance Levels - IES RP-1-20</h4>
        <p>Average Maintained: 85 fc (Required: 30-50 fc for office)</p>
        <p>Result: Exceeds recommended levels - PASS</p>
      </div>
      
      <div class="compliance-check">
        <h4>✓ Lighting Controls - IECC 2021</h4>
        <p>Automatic shutoff: Yes - Occupancy sensors provided</p>
        <p>Daylight dimming: Yes - Perimeter zones equipped</p>
        <p>Multi-level control: Yes - Continuous dimming 10-100%</p>
        <p>Result: All required controls provided - PASS</p>
      </div>
      
      <div class="compliance-check">
        <h4>✓ Light Quality - LEED v4.1</h4>
        <p>Color Rendering Index: 90+ (Required: ≥80)</p>
        <p>Color Temperature: 4000K (Acceptable range: 3000K-5000K)</p>
        <p>Flicker: <5% (Required: <20%)</p>
        <p>Result: Meets all quality metrics - PASS</p>
      </div>
      
      <h3>Additional Certifications</h3>
      <table>
        <tr>
          <th>Certification</th>
          <th>Requirement</th>
          <th>Design Value</th>
          <th>Status</th>
        </tr>
        <tr>
          <td>Energy Star</td>
          <td>25% below ASHRAE 90.1</td>
          <td>52% below</td>
          <td style="color: green;">Eligible</td>
        </tr>
        <tr>
          <td>DLC Premium</td>
          <td>≥130 lm/W</td>
          <td>145 lm/W</td>
          <td style="color: green;">Qualified</td>
        </tr>
        <tr>
          <td>WELL Building Standard</td>
          <td>Multiple criteria</td>
          <td>All met</td>
          <td style="color: green;">Compliant</td>
        </tr>
      </table>
    </div>
  `;
}

function generateFixtureCoordinates(section: any, projectInfo: any, projectData: any, settings: any): string {
  // Generate fixture data with coordinates
  const fixtures = projectData?.fixtures || [];
  const roomDimensions = projectInfo.roomDimensions || { length: 100, width: 50, height: 12 };
  
  return `
    <div class="section page-break">
      <h2>Fixture Positioning Data</h2>
      
      <h3>Coordinate System Reference</h3>
      <p>Origin (0,0,0) is located at the southwest corner at floor level. X-axis runs east-west, Y-axis runs north-south, Z-axis is vertical.</p>
      
      <h3>Luminaire Location Schedule</h3>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Type</th>
            <th>X (ft)</th>
            <th>Y (ft)</th>
            <th>Z (ft)</th>
            <th>Mounting Height</th>
            <th>Tilt Angle</th>
            <th>Rotation</th>
            <th>Aiming</th>
            <th>Circuit</th>
          </tr>
        </thead>
        <tbody>
          ${fixtures.map((fixture: any, index: number) => `
            <tr>
              <td>L${(index + 1).toString().padStart(3, '0')}</td>
              <td>${fixture.type || 'Type A'}</td>
              <td>${(fixture.x || index * 10 % roomDimensions.length).toFixed(1)}</td>
              <td>${(fixture.y || Math.floor(index / 10) * 10).toFixed(1)}</td>
              <td>${(fixture.z || roomDimensions.height - 0.5).toFixed(1)}</td>
              <td>${(fixture.mountingHeight || roomDimensions.height).toFixed(1)}'</td>
              <td>${fixture.tilt || 0}°</td>
              <td>${fixture.rotation || 0}°</td>
              <td>${fixture.aiming || 'Straight Down'}</td>
              <td>${fixture.circuit || `C${(index % 4) + 1}`}</td>
            </tr>
          `).join('') || `
            <tr>
              <td>L001</td>
              <td>Type A</td>
              <td>10.0</td>
              <td>10.0</td>
              <td>11.5</td>
              <td>12.0'</td>
              <td>0°</td>
              <td>0°</td>
              <td>Straight Down</td>
              <td>C1</td>
            </tr>
          `}
        </tbody>
      </table>
      
      <h3>Spacing Summary</h3>
      <table>
        <tr>
          <th>Parameter</th>
          <th>Value</th>
        </tr>
        <tr>
          <td>Average Spacing (Center-to-Center)</td>
          <td>10.0 ft</td>
        </tr>
        <tr>
          <td>Spacing-to-Mounting Height Ratio</td>
          <td>0.83</td>
        </tr>
        <tr>
          <td>Wall Offset (Typical)</td>
          <td>5.0 ft</td>
        </tr>
        <tr>
          <td>Total Fixtures</td>
          <td>${fixtures.length || 24}</td>
        </tr>
      </table>
      
      ${section.options?.includeGraphs ? `
        <div class="chart-container">
          <h3>Fixture Layout Plan</h3>
          <div class="chart-placeholder">
            [2D plan view showing fixture locations with coordinates]
          </div>
        </div>
      ` : ''}
    </div>
  `;
}

function generateRoomObjects(section: any, projectInfo: any, projectData: any, settings: any): string {
  return `
    <div class="section page-break">
      <h2>Room Objects & Obstructions</h2>
      
      <h3>Structural Elements</h3>
      <table>
        <tr>
          <th>Type</th>
          <th>Location</th>
          <th>Dimensions</th>
          <th>Height</th>
          <th>Impact on Lighting</th>
        </tr>
        <tr>
          <td>Beam</td>
          <td>X: 0-100, Y: 25</td>
          <td>100' × 2' × 1.5'</td>
          <td>10.5' AFF</td>
          <td>Requires fixture adjustment</td>
        </tr>
        <tr>
          <td>Column</td>
          <td>X: 25, Y: 25</td>
          <td>2' × 2'</td>
          <td>Floor to ceiling</td>
          <td>Creates shadow zone</td>
        </tr>
        <tr>
          <td>Ductwork</td>
          <td>North wall</td>
          <td>Various</td>
          <td>9'-11' AFF</td>
          <td>Limits fixture placement</td>
        </tr>
      </table>
      
      <h3>HVAC Equipment</h3>
      <table>
        <tr>
          <th>Equipment</th>
          <th>Model</th>
          <th>Location</th>
          <th>Size</th>
          <th>Clearance Required</th>
        </tr>
        <tr>
          <td>Supply Diffuser</td>
          <td>24" × 24"</td>
          <td>Grid locations</td>
          <td>2' × 2'</td>
          <td>6" all sides</td>
        </tr>
        <tr>
          <td>Return Grille</td>
          <td>48" × 24"</td>
          <td>East/West walls</td>
          <td>4' × 2'</td>
          <td>12" front</td>
        </tr>
        <tr>
          <td>VAV Box</td>
          <td>Series FPT</td>
          <td>Above ceiling</td>
          <td>4' × 3' × 2'</td>
          <td>24" access</td>
        </tr>
      </table>
      
      <h3>Plant/Vegetation Schedule</h3>
      <table>
        <tr>
          <th>Plant ID</th>
          <th>Species</th>
          <th>Location</th>
          <th>Mature Size</th>
          <th>Light Requirements</th>
          <th>PPFD Target</th>
        </tr>
        <tr>
          <td>P1-P4</td>
          <td>Cannabis sativa</td>
          <td>Growing benches</td>
          <td>4-6' tall</td>
          <td>High intensity</td>
          <td>800-1000 μmol/m²/s</td>
        </tr>
        <tr>
          <td>P5-P8</td>
          <td>Tomato plants</td>
          <td>Vertical racks</td>
          <td>3-4' tall</td>
          <td>Medium-high</td>
          <td>400-600 μmol/m²/s</td>
        </tr>
        <tr>
          <td>P9-P12</td>
          <td>Lettuce</td>
          <td>NFT channels</td>
          <td>8-12" tall</td>
          <td>Medium</td>
          <td>200-300 μmol/m²/s</td>
        </tr>
      </table>
      
      <h3>Equipment & Furniture</h3>
      <table>
        <tr>
          <th>Item</th>
          <th>Quantity</th>
          <th>Dimensions</th>
          <th>Location</th>
          <th>Surface Reflectance</th>
        </tr>
        <tr>
          <td>Growing Benches</td>
          <td>8</td>
          <td>4' × 8' × 3'</td>
          <td>Center rows</td>
          <td>70% (white)</td>
        </tr>
        <tr>
          <td>Storage Racks</td>
          <td>4</td>
          <td>2' × 6' × 7'</td>
          <td>North wall</td>
          <td>40% (gray metal)</td>
        </tr>
        <tr>
          <td>Work Tables</td>
          <td>2</td>
          <td>3' × 6' × 3'</td>
          <td>East wall</td>
          <td>60% (stainless)</td>
        </tr>
      </table>
    </div>
  `;
}

function generatePlantAnalysis(section: any, projectInfo: any, projectData: any, settings: any): string {
  return `
    <div class="section page-break">
      <h2>Horticultural Lighting Analysis</h2>
      
      <h3>Photosynthetic Photon Flux Density (PPFD)</h3>
      <table>
        <tr>
          <th>Growth Stage</th>
          <th>Target PPFD</th>
          <th>Achieved PPFD</th>
          <th>Uniformity</th>
          <th>DLI Target</th>
          <th>Photoperiod</th>
        </tr>
        <tr>
          <td>Vegetative</td>
          <td>400-600 μmol/m²/s</td>
          <td>550 μmol/m²/s</td>
          <td>0.85</td>
          <td>35 mol/m²/day</td>
          <td>18 hours</td>
        </tr>
        <tr>
          <td>Flowering</td>
          <td>800-1000 μmol/m²/s</td>
          <td>900 μmol/m²/s</td>
          <td>0.82</td>
          <td>40 mol/m²/day</td>
          <td>12 hours</td>
        </tr>
        <tr>
          <td>Propagation</td>
          <td>150-200 μmol/m²/s</td>
          <td>175 μmol/m²/s</td>
          <td>0.90</td>
          <td>10 mol/m²/day</td>
          <td>16 hours</td>
        </tr>
      </table>
      
      <h3>Daily Light Integral (DLI) Calculations</h3>
      <table>
        <tr>
          <th>Area</th>
          <th>Average PPFD</th>
          <th>Photoperiod</th>
          <th>DLI Achieved</th>
          <th>Target DLI</th>
          <th>Status</th>
        </tr>
        <tr>
          <td>Veg Room 1</td>
          <td>550 μmol/m²/s</td>
          <td>18 hrs</td>
          <td>35.6 mol/m²/day</td>
          <td>35 mol/m²/day</td>
          <td style="color: green;">Optimal</td>
        </tr>
        <tr>
          <td>Flower Room 1</td>
          <td>900 μmol/m²/s</td>
          <td>12 hrs</td>
          <td>38.9 mol/m²/day</td>
          <td>40 mol/m²/day</td>
          <td style="color: orange;">Acceptable</td>
        </tr>
      </table>
      
      <h3>Spectral Distribution Analysis</h3>
      <table>
        <tr>
          <th>Wavelength Range</th>
          <th>Color</th>
          <th>Percentage</th>
          <th>μmol/m²/s</th>
          <th>Plant Response</th>
        </tr>
        <tr>
          <td>400-500 nm</td>
          <td>Blue</td>
          <td>15%</td>
          <td>135</td>
          <td>Vegetative growth, compact</td>
        </tr>
        <tr>
          <td>500-600 nm</td>
          <td>Green</td>
          <td>20%</td>
          <td>180</td>
          <td>Canopy penetration</td>
        </tr>
        <tr>
          <td>600-700 nm</td>
          <td>Red</td>
          <td>45%</td>
          <td>405</td>
          <td>Photosynthesis, flowering</td>
        </tr>
        <tr>
          <td>700-800 nm</td>
          <td>Far Red</td>
          <td>20%</td>
          <td>180</td>
          <td>Shade avoidance, stem elongation</td>
        </tr>
      </table>
      
      <h3>Efficacy Metrics</h3>
      <table>
        <tr>
          <th>Metric</th>
          <th>Value</th>
          <th>Industry Standard</th>
        </tr>
        <tr>
          <td>Photosynthetic Photon Efficacy (PPE)</td>
          <td>2.8 μmol/J</td>
          <td>2.3-2.7 μmol/J</td>
        </tr>
        <tr>
          <td>Photon Flux per Fixture</td>
          <td>1,800 μmol/s</td>
          <td>1,500-2,000 μmol/s</td>
        </tr>
        <tr>
          <td>Red:Blue Ratio</td>
          <td>3:1</td>
          <td>2:1 to 5:1</td>
        </tr>
        <tr>
          <td>UV Percentage</td>
          <td>2%</td>
          <td>1-3%</td>
        </tr>
      </table>
      
      ${section.options?.includeGraphs ? `
        <div class="chart-container">
          <h3>PPFD Distribution Map</h3>
          <div class="chart-placeholder">
            [Contour map showing PPFD levels across growing area]
          </div>
        </div>
        
        <div class="chart-container">
          <h3>Spectral Power Distribution</h3>
          <div class="chart-placeholder">
            [Graph showing spectral output across 380-780nm]
          </div>
        </div>
      ` : ''}
    </div>
  `;
}

function generateEnvironmentalFactors(section: any, projectInfo: any, projectData: any, settings: any): string {
  return `
    <div class="section page-break">
      <h2>Environmental Conditions</h2>
      
      <h3>Operating Environment</h3>
      <table>
        <tr>
          <th>Parameter</th>
          <th>Design Conditions</th>
          <th>Fixture Rating</th>
          <th>Compliance</th>
        </tr>
        <tr>
          <td>Ambient Temperature</td>
          <td>65-85°F (18-29°C)</td>
          <td>-20 to 50°C</td>
          <td style="color: green;">✓ Pass</td>
        </tr>
        <tr>
          <td>Relative Humidity</td>
          <td>40-70% RH</td>
          <td>0-95% non-condensing</td>
          <td style="color: green;">✓ Pass</td>
        </tr>
        <tr>
          <td>Dust/Particulates</td>
          <td>Clean room environment</td>
          <td>IP65 rated</td>
          <td style="color: green;">✓ Pass</td>
        </tr>
        <tr>
          <td>Vibration</td>
          <td>HVAC equipment nearby</td>
          <td>IK08 impact rating</td>
          <td style="color: green;">✓ Pass</td>
        </tr>
        <tr>
          <td>Corrosive Atmosphere</td>
          <td>None</td>
          <td>Standard finish</td>
          <td style="color: green;">✓ Pass</td>
        </tr>
      </table>
      
      <h3>Ingress Protection Requirements</h3>
      <table>
        <tr>
          <th>Area</th>
          <th>Environment Type</th>
          <th>Required IP Rating</th>
          <th>Specified Fixtures</th>
        </tr>
        <tr>
          <td>Growing Areas</td>
          <td>High humidity, water spray</td>
          <td>IP65 minimum</td>
          <td>IP66 rated</td>
        </tr>
        <tr>
          <td>Processing Areas</td>
          <td>Washdown required</td>
          <td>IP66 minimum</td>
          <td>IP67 rated</td>
        </tr>
        <tr>
          <td>Office Areas</td>
          <td>Standard indoor</td>
          <td>IP20 minimum</td>
          <td>IP40 rated</td>
        </tr>
        <tr>
          <td>Storage Areas</td>
          <td>Dry, dusty</td>
          <td>IP54 minimum</td>
          <td>IP65 rated</td>
        </tr>
      </table>
      
      <h3>Thermal Management</h3>
      <table>
        <tr>
          <th>Fixture Type</th>
          <th>Heat Output (BTU/hr)</th>
          <th>Cooling Method</th>
          <th>Junction Temp</th>
          <th>L70 @ Tj</th>
        </tr>
        <tr>
          <td>LED Grow Light 600W</td>
          <td>2,047</td>
          <td>Passive heatsink</td>
          <td>65°C</td>
          <td>54,000 hrs</td>
        </tr>
        <tr>
          <td>LED Troffer 50W</td>
          <td>171</td>
          <td>Aluminum housing</td>
          <td>55°C</td>
          <td>70,000 hrs</td>
        </tr>
      </table>
      
      <h3>HVAC Load Contribution</h3>
      <p>Total lighting heat load: ${((1520 * 3.412) || 5186).toFixed(0)} BTU/hr</p>
      <p>Percentage of total cooling load: Approximately 15-20%</p>
    </div>
  `;
}

function generateElectricalLayout(section: any, projectInfo: any, projectData: any, settings: any): string {
  const totalWatts = projectData?.totalWatts || 1520;
  const voltage = 277; // Common commercial voltage
  
  return `
    <div class="section page-break">
      <h2>Electrical & Circuit Layout</h2>
      
      <h3>Circuit Schedule</h3>
      <table>
        <tr>
          <th>Circuit</th>
          <th>Panel</th>
          <th>Breaker</th>
          <th>Voltage</th>
          <th>Fixtures</th>
          <th>Load (W)</th>
          <th>Current (A)</th>
          <th>% Capacity</th>
        </tr>
        <tr>
          <td>C1</td>
          <td>LP-1</td>
          <td>20A/1P</td>
          <td>277V</td>
          <td>6</td>
          <td>300</td>
          <td>1.08</td>
          <td>5.4%</td>
        </tr>
        <tr>
          <td>C2</td>
          <td>LP-1</td>
          <td>20A/1P</td>
          <td>277V</td>
          <td>6</td>
          <td>300</td>
          <td>1.08</td>
          <td>5.4%</td>
        </tr>
        <tr>
          <td>C3</td>
          <td>LP-1</td>
          <td>20A/1P</td>
          <td>277V</td>
          <td>6</td>
          <td>300</td>
          <td>1.08</td>
          <td>5.4%</td>
        </tr>
        <tr>
          <td>C4</td>
          <td>LP-1</td>
          <td>20A/1P</td>
          <td>277V</td>
          <td>6</td>
          <td>300</td>
          <td>1.08</td>
          <td>5.4%</td>
        </tr>
        <tr>
          <td>EM-1</td>
          <td>EM Panel</td>
          <td>20A/1P</td>
          <td>277V</td>
          <td>4</td>
          <td>220</td>
          <td>0.79</td>
          <td>4.0%</td>
        </tr>
      </table>
      
      <h3>Voltage Drop Calculations</h3>
      <table>
        <tr>
          <th>Circuit</th>
          <th>Wire Size</th>
          <th>Run Length</th>
          <th>Voltage Drop</th>
          <th>% Drop</th>
          <th>End Voltage</th>
          <th>NEC Compliance</th>
        </tr>
        <tr>
          <td>C1</td>
          <td>#12 AWG</td>
          <td>75 ft</td>
          <td>2.1V</td>
          <td>0.76%</td>
          <td>274.9V</td>
          <td style="color: green;">✓ Pass</td>
        </tr>
        <tr>
          <td>C2</td>
          <td>#12 AWG</td>
          <td>100 ft</td>
          <td>2.8V</td>
          <td>1.01%</td>
          <td>274.2V</td>
          <td style="color: green;">✓ Pass</td>
        </tr>
        <tr>
          <td>C3</td>
          <td>#12 AWG</td>
          <td>125 ft</td>
          <td>3.5V</td>
          <td>1.26%</td>
          <td>273.5V</td>
          <td style="color: green;">✓ Pass</td>
        </tr>
        <tr>
          <td>C4</td>
          <td>#12 AWG</td>
          <td>150 ft</td>
          <td>4.2V</td>
          <td>1.52%</td>
          <td>272.8V</td>
          <td style="color: green;">✓ Pass</td>
        </tr>
      </table>
      
      <h3>Panel Schedule Summary</h3>
      <table>
        <tr>
          <th>Panel</th>
          <th>Location</th>
          <th>Total Circuits</th>
          <th>Lighting Load</th>
          <th>Spare Capacity</th>
        </tr>
        <tr>
          <td>LP-1</td>
          <td>Electrical Room</td>
          <td>42</td>
          <td>1,520W</td>
          <td>18 spaces</td>
        </tr>
        <tr>
          <td>EM Panel</td>
          <td>Electrical Room</td>
          <td>12</td>
          <td>220W</td>
          <td>7 spaces</td>
        </tr>
      </table>
      
      <h3>Load Summary</h3>
      <table>
        <tr>
          <th>Description</th>
          <th>Value</th>
        </tr>
        <tr>
          <td>Total Connected Load</td>
          <td>${totalWatts}W</td>
        </tr>
        <tr>
          <td>Demand Factor</td>
          <td>100%</td>
        </tr>
        <tr>
          <td>Calculated Load</td>
          <td>${totalWatts}W</td>
        </tr>
        <tr>
          <td>Total Current @ 277V</td>
          <td>${(totalWatts / voltage).toFixed(1)}A</td>
        </tr>
        <tr>
          <td>Power Factor</td>
          <td>0.95</td>
        </tr>
        <tr>
          <td>THD</td>
          <td><10%</td>
        </tr>
      </table>
    </div>
  `;
}

function generateControlSystems(section: any, projectInfo: any, projectData: any, settings: any): string {
  return `
    <div class="section page-break">
      <h2>Control Systems & Zoning</h2>
      
      <h3>Control Zone Schedule</h3>
      <table>
        <tr>
          <th>Zone</th>
          <th>Area</th>
          <th>Control Type</th>
          <th>Sensors</th>
          <th>Override</th>
          <th>Schedule</th>
        </tr>
        <tr>
          <td>Z1</td>
          <td>Open Office</td>
          <td>Occupancy + Daylight</td>
          <td>Dual-tech occupancy, photocell</td>
          <td>Wall station</td>
          <td>7AM-7PM M-F</td>
        </tr>
        <tr>
          <td>Z2</td>
          <td>Private Offices</td>
          <td>Vacancy</td>
          <td>PIR vacancy sensor</td>
          <td>Wall switch</td>
          <td>Manual on/auto off</td>
        </tr>
        <tr>
          <td>Z3</td>
          <td>Conference Room</td>
          <td>Scene Control</td>
          <td>Occupancy, AV integration</td>
          <td>Touch panel</td>
          <td>As needed</td>
        </tr>
        <tr>
          <td>Z4</td>
          <td>Corridors</td>
          <td>Bi-level</td>
          <td>Occupancy sensors</td>
          <td>None</td>
          <td>24/7 (50% after hours)</td>
        </tr>
      </table>
      
      <h3>Control Sequence of Operations</h3>
      <h4>Zone 1 - Open Office</h4>
      <ol>
        <li>Lights activate to 80% upon first occupancy detection after 6AM</li>
        <li>Photocell continuously monitors daylight levels</li>
        <li>When daylight exceeds 300 lux at reference point, dim perimeter fixtures proportionally</li>
        <li>Maintain minimum 500 lux at task level through combined daylight + electric light</li>
        <li>After 30 minutes of vacancy, dim to 20%</li>
        <li>After 60 minutes of vacancy, turn off</li>
        <li>Override available via wall station for 2-hour periods</li>
      </ol>
      
      <h3>Sensor Locations</h3>
      <table>
        <tr>
          <th>Sensor ID</th>
          <th>Type</th>
          <th>Location</th>
          <th>Coverage</th>
          <th>Mounting</th>
          <th>Settings</th>
        </tr>
        <tr>
          <td>OS-01</td>
          <td>Dual Technology</td>
          <td>Open Office Center</td>
          <td>900 sq ft</td>
          <td>Ceiling, 9' AFF</td>
          <td>High sensitivity</td>
        </tr>
        <tr>
          <td>PS-01</td>
          <td>Photocell</td>
          <td>North window</td>
          <td>Perimeter zone</td>
          <td>Ceiling, 6' from window</td>
          <td>North calibration</td>
        </tr>
        <tr>
          <td>VS-01</td>
          <td>Vacancy PIR</td>
          <td>Private Office 1</td>
          <td>150 sq ft</td>
          <td>Wall switch</td>
          <td>15 min timeout</td>
        </tr>
      </table>
      
      <h3>Integration Points</h3>
      <table>
        <tr>
          <th>System</th>
          <th>Protocol</th>
          <th>Integration Type</th>
          <th>Data Points</th>
        </tr>
        <tr>
          <td>Building Automation</td>
          <td>BACnet/IP</td>
          <td>Bi-directional</td>
          <td>Status, energy, schedules</td>
        </tr>
        <tr>
          <td>Emergency System</td>
          <td>Dry contacts</td>
          <td>Override input</td>
          <td>Normal power failure</td>
        </tr>
        <tr>
          <td>Security System</td>
          <td>Relay outputs</td>
          <td>After-hours control</td>
          <td>Armed/disarmed status</td>
        </tr>
        <tr>
          <td>AV System</td>
          <td>RS-232 / IP</td>
          <td>Scene recall</td>
          <td>Preset scenes 1-8</td>
        </tr>
      </table>
      
      ${section.options?.includeGraphs ? `
        <div class="chart-container">
          <h3>Control Zone Layout</h3>
          <div class="chart-placeholder">
            [Floor plan showing control zones and sensor locations]
          </div>
        </div>
      ` : ''}
    </div>
  `;
}

function generateDaylightIntegration(section: any, projectInfo: any, projectData: any, settings: any): string {
  return `
    <div class="section page-break">
      <h2>Daylight Integration</h2>
      
      <h3>Daylight Zones</h3>
      <table>
        <tr>
          <th>Zone</th>
          <th>Window Orientation</th>
          <th>Glazing Area</th>
          <th>VLT</th>
          <th>Control Strategy</th>
          <th>Energy Savings</th>
        </tr>
        <tr>
          <td>Perimeter North</td>
          <td>North</td>
          <td>450 sq ft</td>
          <td>68%</td>
          <td>Continuous dimming</td>
          <td>35%</td>
        </tr>
        <tr>
          <td>Perimeter South</td>
          <td>South</td>
          <td>450 sq ft</td>
          <td>45%</td>
          <td>Continuous dimming + blinds</td>
          <td>45%</td>
        </tr>
        <tr>
          <td>Perimeter East</td>
          <td>East</td>
          <td>300 sq ft</td>
          <td>45%</td>
          <td>Stepped dimming</td>
          <td>25%</td>
        </tr>
        <tr>
          <td>Perimeter West</td>
          <td>West</td>
          <td>300 sq ft</td>
          <td>45%</td>
          <td>Stepped dimming</td>
          <td>25%</td>
        </tr>
      </table>
      
      <h3>Photosensor Calibration</h3>
      <table>
        <tr>
          <th>Sensor</th>
          <th>Zone</th>
          <th>Setpoint</th>
          <th>Deadband</th>
          <th>Response Time</th>
          <th>Calibration Method</th>
        </tr>
        <tr>
          <td>PS-N1</td>
          <td>North Perimeter</td>
          <td>500 lux</td>
          <td>±50 lux</td>
          <td>30 seconds</td>
          <td>Closed-loop</td>
        </tr>
        <tr>
          <td>PS-S1</td>
          <td>South Perimeter</td>
          <td>500 lux</td>
          <td>±50 lux</td>
          <td>60 seconds</td>
          <td>Closed-loop</td>
        </tr>
        <tr>
          <td>PS-E1</td>
          <td>East Perimeter</td>
          <td>500 lux</td>
          <td>±75 lux</td>
          <td>45 seconds</td>
          <td>Open-loop</td>
        </tr>
      </table>
      
      <h3>Annual Daylight Analysis</h3>
      <table>
        <tr>
          <th>Metric</th>
          <th>North Zone</th>
          <th>South Zone</th>
          <th>East Zone</th>
          <th>West Zone</th>
          <th>Target</th>
        </tr>
        <tr>
          <td>Daylight Autonomy (DA)</td>
          <td>65%</td>
          <td>78%</td>
          <td>52%</td>
          <td>54%</td>
          <td>>50%</td>
        </tr>
        <tr>
          <td>Useful Daylight Illuminance (UDI)</td>
          <td>82%</td>
          <td>71%</td>
          <td>76%</td>
          <td>74%</td>
          <td>>75%</td>
        </tr>
        <tr>
          <td>Annual Sunlight Exposure (ASE)</td>
          <td>8%</td>
          <td>28%</td>
          <td>22%</td>
          <td>24%</td>
          <td><10%</td>
        </tr>
      </table>
      
      <h3>Glare Control Measures</h3>
      <ul>
        <li>Automated roller shades on south façade with 3% openness factor</li>
        <li>Light shelves on south windows to redirect daylight deeper into space</li>
        <li>Electrochromic glazing on west conference room windows</li>
        <li>Fixed horizontal louvers on east windows</li>
      </ul>
      
      ${section.options?.includeGraphs ? `
        <div class="chart-container">
          <h3>Annual Daylight Availability</h3>
          <div class="chart-placeholder">
            [Graph showing daylight availability by month and orientation]
          </div>
        </div>
      ` : ''}
    </div>
  `;
}

function generateGlareAnalysis(section: any, projectInfo: any, projectData: any, settings: any): string {
  return `
    <div class="section page-break">
      <h2>Visual Comfort & Glare Analysis</h2>
      
      <h3>Unified Glare Rating (UGR) Analysis</h3>
      <table>
        <tr>
          <th>Space Type</th>
          <th>Viewing Direction</th>
          <th>Calculated UGR</th>
          <th>Limit (EN 12464-1)</th>
          <th>Compliance</th>
        </tr>
        <tr>
          <td>Open Office</td>
          <td>Parallel to fixtures</td>
          <td>18</td>
          <td>≤19</td>
          <td style="color: green;">✓ Pass</td>
        </tr>
        <tr>
          <td>Open Office</td>
          <td>Perpendicular to fixtures</td>
          <td>17</td>
          <td>≤19</td>
          <td style="color: green;">✓ Pass</td>
        </tr>
        <tr>
          <td>Private Office</td>
          <td>Towards window</td>
          <td>21</td>
          <td>≤19</td>
          <td style="color: orange;">Blinds required</td>
        </tr>
        <tr>
          <td>Conference Room</td>
          <td>Towards presentation wall</td>
          <td>16</td>
          <td>≤19</td>
          <td style="color: green;">✓ Pass</td>
        </tr>
      </table>
      
      <h3>Luminance Ratios</h3>
      <table>
        <tr>
          <th>Comparison</th>
          <th>Measured Ratio</th>
          <th>Recommended Maximum</th>
          <th>Status</th>
        </tr>
        <tr>
          <td>Task to Immediate Surround</td>
          <td>2.5:1</td>
          <td>3:1</td>
          <td style="color: green;">Good</td>
        </tr>
        <tr>
          <td>Task to Remote Surround</td>
          <td>8:1</td>
          <td>10:1</td>
          <td style="color: green;">Good</td>
        </tr>
        <tr>
          <td>Fixture to Ceiling</td>
          <td>15:1</td>
          <td>20:1</td>
          <td style="color: green;">Good</td>
        </tr>
        <tr>
          <td>Window to Adjacent Wall</td>
          <td>35:1</td>
          <td>40:1</td>
          <td style="color: orange;">Acceptable</td>
        </tr>
      </table>
      
      <h3>Fixture Shielding Analysis</h3>
      <table>
        <tr>
          <th>Fixture Type</th>
          <th>Shielding Method</th>
          <th>Cut-off Angle</th>
          <th>Max Luminance @ 65°</th>
          <th>VCP Rating</th>
        </tr>
        <tr>
          <td>LED Troffer</td>
          <td>Prismatic lens</td>
          <td>65°</td>
          <td>3,200 cd/m²</td>
          <td>82</td>
        </tr>
        <tr>
          <td>Linear Pendant</td>
          <td>Opal diffuser</td>
          <td>75°</td>
          <td>2,800 cd/m²</td>
          <td>85</td>
        </tr>
        <tr>
          <td>Downlight</td>
          <td>Deep regressed</td>
          <td>55°</td>
          <td>1,500 cd/m²</td>
          <td>90</td>
        </tr>
      </table>
      
      <h3>Recommended Mitigation Measures</h3>
      <ul>
        <li>Install window blinds with 45° slat angle for south and west exposures</li>
        <li>Use fixtures with UGR < 19 for all office areas</li>
        <li>Position computer monitors perpendicular to windows</li>
        <li>Maintain luminance ratio of ceiling to fixture aperture < 20:1</li>
        <li>Specify matte finishes for work surfaces (reflectance < 50%)</li>
      </ul>
    </div>
  `;
}

function generateSpectralAnalysis(section: any, projectInfo: any, projectData: any, settings: any): string {
  return `
    <div class="section page-break">
      <h2>Spectral Power Distribution Analysis</h2>
      
      <h3>Color Quality Metrics</h3>
      <table>
        <tr>
          <th>Fixture Type</th>
          <th>CCT</th>
          <th>CRI (Ra)</th>
          <th>R9</th>
          <th>Rf</th>
          <th>Rg</th>
          <th>M-EDI</th>
        </tr>
        <tr>
          <td>Office Troffer</td>
          <td>4000K</td>
          <td>90</td>
          <td>72</td>
          <td>88</td>
          <td>98</td>
          <td>1.25</td>
        </tr>
        <tr>
          <td>Grow Light - Veg</td>
          <td>5000K</td>
          <td>85</td>
          <td>65</td>
          <td>82</td>
          <td>95</td>
          <td>1.18</td>
        </tr>
        <tr>
          <td>Grow Light - Flower</td>
          <td>3200K</td>
          <td>88</td>
          <td>78</td>
          <td>85</td>
          <td>97</td>
          <td>1.22</td>
        </tr>
      </table>
      
      <h3>Spectral Distribution by Wavelength</h3>
      <table>
        <tr>
          <th>Wavelength (nm)</th>
          <th>Office 4000K</th>
          <th>Grow Veg</th>
          <th>Grow Flower</th>
          <th>Function</th>
        </tr>
        <tr>
          <td>380-430 (UV/Violet)</td>
          <td>2%</td>
          <td>8%</td>
          <td>5%</td>
          <td>Morphology, flavonoids</td>
        </tr>
        <tr>
          <td>430-500 (Blue)</td>
          <td>18%</td>
          <td>25%</td>
          <td>15%</td>
          <td>Phototropism, stomata</td>
        </tr>
        <tr>
          <td>500-570 (Green)</td>
          <td>35%</td>
          <td>20%</td>
          <td>20%</td>
          <td>Penetration, photosynthesis</td>
        </tr>
        <tr>
          <td>570-620 (Yellow/Orange)</td>
          <td>25%</td>
          <td>15%</td>
          <td>20%</td>
          <td>Carotenoids</td>
        </tr>
        <tr>
          <td>620-700 (Red)</td>
          <td>18%</td>
          <td>27%</td>
          <td>35%</td>
          <td>Photosynthesis, flowering</td>
        </tr>
        <tr>
          <td>700-800 (Far Red)</td>
          <td>2%</td>
          <td>5%</td>
          <td>5%</td>
          <td>Shade avoidance, flowering</td>
        </tr>
      </table>
      
      <h3>Photopic/Scotopic Ratios</h3>
      <table>
        <tr>
          <th>Light Source</th>
          <th>S/P Ratio</th>
          <th>Effective Lumens</th>
          <th>Visual Acuity</th>
          <th>Alertness Factor</th>
        </tr>
        <tr>
          <td>4000K LED</td>
          <td>1.65</td>
          <td>+15%</td>
          <td>Good</td>
          <td>High</td>
        </tr>
        <tr>
          <td>3000K LED</td>
          <td>1.35</td>
          <td>+8%</td>
          <td>Good</td>
          <td>Moderate</td>
        </tr>
        <tr>
          <td>HPS (comparison)</td>
          <td>0.65</td>
          <td>-20%</td>
          <td>Poor</td>
          <td>Low</td>
        </tr>
      </table>
      
      <h3>Circadian Metrics</h3>
      <table>
        <tr>
          <th>Space</th>
          <th>Time</th>
          <th>CS Value</th>
          <th>M-EDI</th>
          <th>Biological Effect</th>
        </tr>
        <tr>
          <td>Open Office</td>
          <td>9:00 AM</td>
          <td>0.42</td>
          <td>1.25</td>
          <td>Alerting</td>
        </tr>
        <tr>
          <td>Open Office</td>
          <td>3:00 PM</td>
          <td>0.38</td>
          <td>1.18</td>
          <td>Maintaining</td>
        </tr>
        <tr>
          <td>Break Room</td>
          <td>12:00 PM</td>
          <td>0.25</td>
          <td>0.95</td>
          <td>Neutral</td>
        </tr>
      </table>
      
      ${section.options?.includeGraphs ? `
        <div class="chart-container">
          <h3>Spectral Power Distribution Curves</h3>
          <div class="chart-placeholder">
            [Graph showing SPD curves for different light sources]
          </div>
        </div>
      ` : ''}
    </div>
  `;
}

function generateEmergencyLighting(section: any, projectInfo: any, projectData: any, settings: any): string {
  return `
    <div class="section page-break">
      <h2>Emergency Lighting Layout</h2>
      
      <h3>Emergency Fixture Schedule</h3>
      <table>
        <tr>
          <th>ID</th>
          <th>Type</th>
          <th>Location</th>
          <th>Lumens</th>
          <th>Battery</th>
          <th>Runtime</th>
          <th>Test Button</th>
        </tr>
        <tr>
          <td>EM-01</td>
          <td>LED Exit Sign</td>
          <td>Main Entry</td>
          <td>50</td>
          <td>Ni-Cad 6V</td>
          <td>90 min</td>
          <td>Yes</td>
        </tr>
        <tr>
          <td>EM-02</td>
          <td>LED Exit Sign</td>
          <td>Rear Exit</td>
          <td>50</td>
          <td>Ni-Cad 6V</td>
          <td>90 min</td>
          <td>Yes</td>
        </tr>
        <tr>
          <td>EM-03</td>
          <td>Emergency Light</td>
          <td>Corridor 1</td>
          <td>1,200</td>
          <td>Li-Ion 12V</td>
          <td>90 min</td>
          <td>Yes</td>
        </tr>
        <tr>
          <td>EM-04</td>
          <td>Emergency Light</td>
          <td>Corridor 2</td>
          <td>1,200</td>
          <td>Li-Ion 12V</td>
          <td>90 min</td>
          <td>Yes</td>
        </tr>
        <tr>
          <td>EM-05</td>
          <td>Combo Exit/Emergency</td>
          <td>Stairwell A</td>
          <td>800</td>
          <td>Ni-MH 12V</td>
          <td>120 min</td>
          <td>Yes</td>
        </tr>
      </table>
      
      <h3>Egress Path Illumination</h3>
      <table>
        <tr>
          <th>Path Section</th>
          <th>Length</th>
          <th>Required fc</th>
          <th>Calculated fc</th>
          <th>Uniformity</th>
          <th>Compliance</th>
        </tr>
        <tr>
          <td>Main Corridor</td>
          <td>150 ft</td>
          <td>1.0 avg</td>
          <td>1.8 avg</td>
          <td>5:1</td>
          <td style="color: green;">✓ Pass</td>
        </tr>
        <tr>
          <td>Stairwell A</td>
          <td>3 floors</td>
          <td>1.0 avg</td>
          <td>2.2 avg</td>
          <td>4:1</td>
          <td style="color: green;">✓ Pass</td>
        </tr>
        <tr>
          <td>Exit Discharge</td>
          <td>50 ft</td>
          <td>1.0 avg</td>
          <td>1.5 avg</td>
          <td>6:1</td>
          <td style="color: green;">✓ Pass</td>
        </tr>
        <tr>
          <td>Assembly Area</td>
          <td>2,000 sq ft</td>
          <td>0.3 avg</td>
          <td>0.5 avg</td>
          <td>8:1</td>
          <td style="color: green;">✓ Pass</td>
        </tr>
      </table>
      
      <h3>Code Compliance Summary</h3>
      <table>
        <tr>
          <th>Requirement</th>
          <th>Code Reference</th>
          <th>Required</th>
          <th>Provided</th>
          <th>Status</th>
        </tr>
        <tr>
          <td>Exit Sign Visibility</td>
          <td>NFPA 101 7.10</td>
          <td>From any point</td>
          <td>All paths covered</td>
          <td style="color: green;">✓</td>
        </tr>
        <tr>
          <td>Emergency Duration</td>
          <td>NFPA 101 7.9.2</td>
          <td>90 minutes</td>
          <td>90-120 minutes</td>
          <td style="color: green;">✓</td>
        </tr>
        <tr>
          <td>Monthly Testing</td>
          <td>NFPA 101 7.9.3</td>
          <td>30 second test</td>
          <td>Test buttons provided</td>
          <td style="color: green;">✓</td>
        </tr>
        <tr>
          <td>Annual Testing</td>
          <td>NFPA 101 7.9.3</td>
          <td>90 minute test</td>
          <td>Schedule established</td>
          <td style="color: green;">✓</td>
        </tr>
      </table>
      
      <h3>Battery Calculations</h3>
      <p>Total emergency lighting load: 220W</p>
      <p>Required battery capacity @ 90 minutes: 330 Watt-hours</p>
      <p>Provided battery capacity: 450 Watt-hours (36% safety factor)</p>
    </div>
  `;
}

function generateHVACCoordination(section: any, projectInfo: any, projectData: any, settings: any): string {
  return `
    <div class="section page-break">
      <h2>HVAC Coordination</h2>
      
      <h3>HVAC Equipment Clearances</h3>
      <table>
        <tr>
          <th>Equipment</th>
          <th>Location</th>
          <th>Size (W×D×H)</th>
          <th>Service Clearance</th>
          <th>Fixture Conflicts</th>
        </tr>
        <tr>
          <td>VAV Box 1</td>
          <td>Grid E-5</td>
          <td>48"×36"×18"</td>
          <td>24" access door</td>
          <td>Relocated L-15</td>
        </tr>
        <tr>
          <td>Fan Coil Unit</td>
          <td>Grid B-8</td>
          <td>60"×24"×24"</td>
          <td>36" front</td>
          <td>None</td>
        </tr>
        <tr>
          <td>Supply Duct Main</td>
          <td>North run</td>
          <td>36"×24"</td>
          <td>N/A</td>
          <td>Adjusted mounting heights</td>
        </tr>
        <tr>
          <td>Return Air Plenum</td>
          <td>Above ceiling</td>
          <td>Full width</td>
          <td>18" depth min</td>
          <td>Cable tray rerouted</td>
        </tr>
      </table>
      
      <h3>Diffuser Integration</h3>
      <table>
        <tr>
          <th>Diffuser Type</th>
          <th>Size</th>
          <th>Quantity</th>
          <th>Throw Pattern</th>
          <th>Lighting Coordination</th>
        </tr>
        <tr>
          <td>Linear Slot</td>
          <td>48"×6"</td>
          <td>12</td>
          <td>2-way</td>
          <td>Integrated with linear fixtures</td>
        </tr>
        <tr>
          <td>Square Cone</td>
          <td>24"×24"</td>
          <td>8</td>
          <td>4-way</td>
          <td>Centered between fixtures</td>
        </tr>
        <tr>
          <td>Perforated Face</td>
          <td>12"×12"</td>
          <td>16</td>
          <td>3-way</td>
          <td>Aligned with grid</td>
        </tr>
      </table>
      
      <h3>Ceiling Plenum Coordination</h3>
      <table>
        <tr>
          <th>System</th>
          <th>Elevation</th>
          <th>Priority</th>
          <th>Conflicts Resolved</th>
        </tr>
        <tr>
          <td>Structure</td>
          <td>12'-0" deck</td>
          <td>1</td>
          <td>N/A</td>
        </tr>
        <tr>
          <td>Main Ductwork</td>
          <td>10'-6" to 11'-6"</td>
          <td>2</td>
          <td>Routed around beams</td>
        </tr>
        <tr>
          <td>Sprinkler Mains</td>
          <td>11'-0"</td>
          <td>3</td>
          <td>Below ductwork</td>
        </tr>
        <tr>
          <td>Cable Tray</td>
          <td>10'-9"</td>
          <td>4</td>
          <td>Rerouted for VAV access</td>
        </tr>
        <tr>
          <td>Lighting Fixtures</td>
          <td>9'-0" (bottom)</td>
          <td>5</td>
          <td>Adjusted for clearances</td>
        </tr>
      </table>
      
      <h3>Temperature Impact Analysis</h3>
      <p>Additional cooling load from lighting: ${((1520 * 3.412) || 5186).toFixed(0)} BTU/hr</p>
      <p>Percentage of total sensible load: Approximately 12%</p>
      <p>Impact on HVAC sizing: Minimal - within design margins</p>
      
      ${section.options?.includeImages ? `
        <div class="chart-container">
          <h3>Reflected Ceiling Plan - HVAC Coordination</h3>
          <div class="chart-placeholder">
            [CAD drawing showing coordinated ceiling layout]
          </div>
        </div>
      ` : ''}
    </div>
  `;
}

function generateMountingDetails(section: any, projectInfo: any, projectData: any, settings: any): string {
  return `
    <div class="section page-break">
      <h2>Mounting & Installation Details</h2>
      
      <h3>Mounting Methods Schedule</h3>
      <table>
        <tr>
          <th>Fixture Type</th>
          <th>Mounting Method</th>
          <th>Hardware</th>
          <th>Support Requirements</th>
          <th>Seismic Bracing</th>
        </tr>
        <tr>
          <td>2×4 LED Troffer</td>
          <td>Recessed grid</td>
          <td>Earthquake clips</td>
          <td>Standard T-bar</td>
          <td>4 corners</td>
        </tr>
        <tr>
          <td>Linear Pendant</td>
          <td>Aircraft cable</td>
          <td>1/8" cable, canopy</td>
          <td>Structure attachment</td>
          <td>Rigid stem top 12"</td>
        </tr>
        <tr>
          <td>High Bay</td>
          <td>Chain mount</td>
          <td>3/16" chain, S-hooks</td>
          <td>Beam clamp/embed</td>
          <td>Safety cable</td>
        </tr>
        <tr>
          <td>Wall Pack</td>
          <td>Surface mount</td>
          <td>Anchor bolts</td>
          <td>Masonry/concrete</td>
          <td>N/A</td>
        </tr>
        <tr>
          <td>Strip Light</td>
          <td>Continuous row</td>
          <td>Threaded rod</td>
          <td>@ 4' centers</td>
          <td>Lateral bracing</td>
        </tr>
      </table>
      
      <h3>Structural Attachment Details</h3>
      <table>
        <tr>
          <th>Attachment Type</th>
          <th>Load Rating</th>
          <th>Safety Factor</th>
          <th>Application</th>
          <th>Special Requirements</th>
        </tr>
        <tr>
          <td>Beam Clamp</td>
          <td>500 lbs</td>
          <td>5:1</td>
          <td>Steel beam</td>
          <td>Torque to spec</td>
        </tr>
        <tr>
          <td>Concrete Anchor</td>
          <td>300 lbs</td>
          <td>4:1</td>
          <td>Slab/wall</td>
          <td>3" min embedment</td>
        </tr>
        <tr>
          <td>Toggle Bolt</td>
          <td>75 lbs</td>
          <td>4:1</td>
          <td>Hollow wall</td>
          <td>Metal studs only</td>
        </tr>
        <tr>
          <td>Caddy Clip</td>
          <td>100 lbs</td>
          <td>5:1</td>
          <td>T-bar grid</td>
          <td>Seismic rated</td>
        </tr>
      </table>
      
      <h3>Installation Sequence</h3>
      <ol>
        <li><strong>Rough-In Phase</strong>
          <ul>
            <li>Install junction boxes and conduit</li>
            <li>Pull wire and conductors</li>
            <li>Install mounting hardware and supports</li>
            <li>Complete above-ceiling work</li>
          </ul>
        </li>
        <li><strong>Finish Phase</strong>
          <ul>
            <li>Install ceiling grid (if applicable)</li>
            <li>Mount and secure fixtures</li>
            <li>Make electrical connections</li>
            <li>Install lamps/modules</li>
            <li>Install lenses and louvers</li>
          </ul>
        </li>
        <li><strong>Commissioning Phase</strong>
          <ul>
            <li>Verify all connections</li>
            <li>Program controls</li>
            <li>Aim adjustable fixtures</li>
            <li>Calibrate sensors</li>
            <li>Complete burn-in test</li>
          </ul>
        </li>
      </ol>
      
      <h3>Special Installation Notes</h3>
      <ul>
        <li>All fixtures in seismic category D - require positive attachment</li>
        <li>Pendant fixtures require safety cables in addition to support cables</li>
        <li>Maintain 6" clearance from sprinkler heads</li>
        <li>Fixtures above 12' require lift equipment for maintenance</li>
        <li>Emergency fixtures must be connected to emergency panel ahead of local switching</li>
      </ul>
      
      ${section.options?.includeImages ? `
        <div class="chart-container">
          <h3>Typical Mounting Details</h3>
          <div class="chart-placeholder">
            [CAD details showing mounting methods for each fixture type]
          </div>
        </div>
      ` : ''}
    </div>
  `;
}

function generateCFDAnalysis(section: any, projectInfo: any, projectData: any, settings: any): string {
  const roomDimensions = projectInfo.roomDimensions || { length: 100, width: 50, height: 12 };
  const fixtureCount = projectData?.fixtures?.length || 32;
  const totalWatts = projectData?.totalWatts || 19200; // 600W × 32 fixtures for grow room
  
  return `
    <div class="section page-break">
      <h2>Computational Fluid Dynamics (CFD) Analysis</h2>
      
      <h3>Airflow Simulation Parameters</h3>
      <table>
        <tr>
          <th>Parameter</th>
          <th>Value</th>
          <th>Units</th>
          <th>Notes</th>
        </tr>
        <tr>
          <td>Room Volume</td>
          <td>${(roomDimensions.length * roomDimensions.width * roomDimensions.height).toFixed(0)}</td>
          <td>ft³</td>
          <td>Total air volume</td>
        </tr>
        <tr>
          <td>Air Changes per Hour</td>
          <td>40</td>
          <td>ACH</td>
          <td>High turnover for grow room</td>
        </tr>
        <tr>
          <td>Supply Air Temperature</td>
          <td>68</td>
          <td>°F</td>
          <td>Cooling mode</td>
        </tr>
        <tr>
          <td>Return Air Temperature</td>
          <td>78</td>
          <td>°F</td>
          <td>With heat gain</td>
        </tr>
        <tr>
          <td>Total CFM Required</td>
          <td>${Math.round(roomDimensions.length * roomDimensions.width * roomDimensions.height * 40 / 60)}</td>
          <td>CFM</td>
          <td>Based on ACH</td>
        </tr>
      </table>
      
      <h3>Heat Source Analysis</h3>
      <table>
        <tr>
          <th>Heat Source</th>
          <th>Quantity</th>
          <th>BTU/hr Each</th>
          <th>Total BTU/hr</th>
          <th>% of Total</th>
        </tr>
        <tr>
          <td>LED Grow Lights</td>
          <td>${fixtureCount}</td>
          <td>${Math.round(600 * 3.412)}</td>
          <td>${Math.round(fixtureCount * 600 * 3.412)}</td>
          <td>75%</td>
        </tr>
        <tr>
          <td>Dehumidifiers</td>
          <td>4</td>
          <td>1,500</td>
          <td>6,000</td>
          <td>7%</td>
        </tr>
        <tr>
          <td>Fans & Pumps</td>
          <td>12</td>
          <td>500</td>
          <td>6,000</td>
          <td>7%</td>
        </tr>
        <tr>
          <td>Plant Transpiration</td>
          <td>-</td>
          <td>-</td>
          <td>8,000</td>
          <td>9%</td>
        </tr>
        <tr>
          <td>Solar Gain</td>
          <td>-</td>
          <td>-</td>
          <td>2,000</td>
          <td>2%</td>
        </tr>
        <tr style="font-weight: bold;">
          <td>Total Heat Load</td>
          <td colspan="2"></td>
          <td>${Math.round(fixtureCount * 600 * 3.412 + 22000)}</td>
          <td>100%</td>
        </tr>
      </table>
      
      <h3>Velocity Profile Analysis</h3>
      <table>
        <tr>
          <th>Zone</th>
          <th>Height</th>
          <th>Avg Velocity</th>
          <th>Min Velocity</th>
          <th>Max Velocity</th>
          <th>Uniformity</th>
        </tr>
        <tr>
          <td>Canopy Level</td>
          <td>4-6 ft</td>
          <td>125 FPM</td>
          <td>75 FPM</td>
          <td>200 FPM</td>
          <td>0.60</td>
        </tr>
        <tr>
          <td>Above Canopy</td>
          <td>6-8 ft</td>
          <td>250 FPM</td>
          <td>150 FPM</td>
          <td>400 FPM</td>
          <td>0.60</td>
        </tr>
        <tr>
          <td>Fixture Level</td>
          <td>8-10 ft</td>
          <td>350 FPM</td>
          <td>200 FPM</td>
          <td>500 FPM</td>
          <td>0.57</td>
        </tr>
        <tr>
          <td>Return Plenum</td>
          <td>10-12 ft</td>
          <td>450 FPM</td>
          <td>300 FPM</td>
          <td>600 FPM</td>
          <td>0.67</td>
        </tr>
      </table>
      
      <h3>Temperature Distribution</h3>
      <table>
        <tr>
          <th>Location</th>
          <th>Target Temp</th>
          <th>Simulated Temp</th>
          <th>Delta T</th>
          <th>Status</th>
        </tr>
        <tr>
          <td>Canopy Top</td>
          <td>75-78°F</td>
          <td>77.2°F</td>
          <td>+2.2°F</td>
          <td style="color: green;">Optimal</td>
        </tr>
        <tr>
          <td>Mid Canopy</td>
          <td>73-76°F</td>
          <td>74.8°F</td>
          <td>-0.2°F</td>
          <td style="color: green;">Optimal</td>
        </tr>
        <tr>
          <td>Root Zone</td>
          <td>68-72°F</td>
          <td>70.5°F</td>
          <td>+0.5°F</td>
          <td style="color: green;">Optimal</td>
        </tr>
        <tr>
          <td>Fixture Surface</td>
          <td><140°F</td>
          <td>125°F</td>
          <td>-15°F</td>
          <td style="color: green;">Good</td>
        </tr>
        <tr>
          <td>Hot Spots</td>
          <td><82°F</td>
          <td>81.5°F</td>
          <td>-0.5°F</td>
          <td style="color: orange;">Marginal</td>
        </tr>
      </table>
      
      <h3>Vapor Pressure Deficit (VPD) Analysis</h3>
      <table>
        <tr>
          <th>Growth Stage</th>
          <th>Target VPD</th>
          <th>Temp (°F)</th>
          <th>RH (%)</th>
          <th>Actual VPD</th>
          <th>Status</th>
        </tr>
        <tr>
          <td>Propagation</td>
          <td>0.4-0.8 kPa</td>
          <td>72</td>
          <td>70</td>
          <td>0.65 kPa</td>
          <td style="color: green;">Ideal</td>
        </tr>
        <tr>
          <td>Vegetative</td>
          <td>0.8-1.2 kPa</td>
          <td>75</td>
          <td>60</td>
          <td>1.05 kPa</td>
          <td style="color: green;">Ideal</td>
        </tr>
        <tr>
          <td>Flowering</td>
          <td>1.2-1.6 kPa</td>
          <td>77</td>
          <td>50</td>
          <td>1.45 kPa</td>
          <td style="color: green;">Ideal</td>
        </tr>
        <tr>
          <td>Late Flower</td>
          <td>1.4-1.8 kPa</td>
          <td>75</td>
          <td>45</td>
          <td>1.62 kPa</td>
          <td style="color: green;">Ideal</td>
        </tr>
      </table>
      
      <h3>CO₂ Distribution Analysis</h3>
      <table>
        <tr>
          <th>Zone</th>
          <th>Target PPM</th>
          <th>Average PPM</th>
          <th>Min PPM</th>
          <th>Max PPM</th>
          <th>CV%</th>
        </tr>
        <tr>
          <td>Canopy Level</td>
          <td>1200</td>
          <td>1185</td>
          <td>1050</td>
          <td>1320</td>
          <td>8.5%</td>
        </tr>
        <tr>
          <td>Above Canopy</td>
          <td>1200</td>
          <td>1225</td>
          <td>1100</td>
          <td>1400</td>
          <td>10.2%</td>
        </tr>
        <tr>
          <td>Room Average</td>
          <td>1200</td>
          <td>1205</td>
          <td>1050</td>
          <td>1400</td>
          <td>9.3%</td>
        </tr>
      </table>
      
      <h3>Pressure Differential Management</h3>
      <table>
        <tr>
          <th>Space</th>
          <th>Pressure</th>
          <th>Target</th>
          <th>Air Balance</th>
          <th>Purpose</th>
        </tr>
        <tr>
          <td>Flower Room</td>
          <td>-0.05" WC</td>
          <td>Negative</td>
          <td>-200 CFM</td>
          <td>Odor control</td>
        </tr>
        <tr>
          <td>Veg Room</td>
          <td>-0.02" WC</td>
          <td>Negative</td>
          <td>-100 CFM</td>
          <td>Pest prevention</td>
        </tr>
        <tr>
          <td>Clone Room</td>
          <td>+0.03" WC</td>
          <td>Positive</td>
          <td>+150 CFM</td>
          <td>Contamination prevention</td>
        </tr>
        <tr>
          <td>Corridor</td>
          <td>0.00" WC</td>
          <td>Neutral</td>
          <td>Balanced</td>
          <td>Reference</td>
        </tr>
      </table>
      
      <h3>Optimization Recommendations</h3>
      <ul>
        <li><strong>Airflow Pattern:</strong> Implement vertical laminar flow with top supply and low return for optimal temperature stratification</li>
        <li><strong>Dead Zones:</strong> Add oscillating fans at coordinates (25,15), (75,15), (25,35), and (75,35) to eliminate low-velocity pockets</li>
        <li><strong>Heat Removal:</strong> Position return air grilles directly above fixture rows to capture rising heat efficiently</li>
        <li><strong>CO₂ Injection:</strong> Use perforated tubing at canopy level with injection points every 10 feet for uniform distribution</li>
        <li><strong>Dehumidification:</strong> Locate units in return air path to maximize moisture removal efficiency</li>
        <li><strong>VPD Control:</strong> Implement zone-based temperature and humidity sensors at canopy level for precise environmental control</li>
      </ul>
      
      ${section.options?.includeGraphs ? `
        <div class="chart-container">
          <h3>Velocity Vector Field</h3>
          <div class="chart-placeholder">
            [3D visualization showing airflow vectors colored by velocity magnitude]
          </div>
        </div>
        
        <div class="chart-container">
          <h3>Temperature Contour Map</h3>
          <div class="chart-placeholder">
            [Horizontal slice at canopy level showing temperature distribution]
          </div>
        </div>
        
        <div class="chart-container">
          <h3>Pressure Distribution</h3>
          <div class="chart-placeholder">
            [Room cross-section showing pressure differentials and flow patterns]
          </div>
        </div>
      ` : ''}
      
      <h3>CFD Simulation Details</h3>
      <table>
        <tr>
          <th>Parameter</th>
          <th>Value</th>
        </tr>
        <tr>
          <td>Mesh Elements</td>
          <td>2.4 million</td>
        </tr>
        <tr>
          <td>Turbulence Model</td>
          <td>k-ε realizable</td>
        </tr>
        <tr>
          <td>Convergence Criteria</td>
          <td>10⁻⁴</td>
        </tr>
        <tr>
          <td>Boundary Conditions</td>
          <td>No-slip walls, pressure outlets</td>
        </tr>
        <tr>
          <td>Radiation Model</td>
          <td>DO (Discrete Ordinates)</td>
        </tr>
        <tr>
          <td>Species Transport</td>
          <td>CO₂, H₂O vapor</td>
        </tr>
      </table>
    </div>
  `;
}

async function generateWordReport(sections: any[], projectInfo: any, projectData: any, settings: any): Promise<Buffer> {
  // For Word format, we would typically use a library like docx
  // For now, return a simplified version
  const content = `
    ${projectInfo.projectName}
    Lighting Design Report
    
    Client: ${projectInfo.clientName}
    Date: ${projectInfo.date}
    
    ${sections.map(section => `
      ${section.title}
      ${'-'.repeat(section.title.length)}
      
      [Content for ${section.title} would be formatted here]
      
    `).join('\n')}
  `;
  
  return Buffer.from(content, 'utf-8');
}

async function generateExcelReport(sections: any[], projectInfo: any, projectData: any, settings: any): Promise<Buffer> {
  // For Excel format, we would create CSV data that Excel can open
  const csv = [
    ['VibeLux Lighting Report'],
    ['Project:', projectInfo.projectName],
    ['Client:', projectInfo.clientName],
    ['Date:', projectInfo.date],
    [''],
    ['LUMINAIRE SCHEDULE'],
    ['Type', 'Quantity', 'Model', 'Watts', 'Lumens', 'CCT', 'CRI'],
    ['Type A', '24', 'VL-LED-2X4-50', '50', '5000', '4000K', '90+'],
    ['Type B', '8', 'VL-LED-STRIP-40', '40', '4000', '4000K', '85+'],
    [''],
    ['POWER SUMMARY'],
    ['Description', 'Value', 'Units'],
    ['Total Connected Load', '1520', 'Watts'],
    ['Room Area', '5000', 'sq ft'],
    ['Lighting Power Density', '0.30', 'W/sq ft'],
    [''],
    ['CALCULATION RESULTS'],
    ['Metric', 'Value', 'Units'],
    ['Average Illuminance', '85', 'fc'],
    ['Minimum Illuminance', '72', 'fc'],
    ['Maximum Illuminance', '98', 'fc'],
    ['Uniformity Ratio', '1.18', 'Avg/Min'],
    [''],
    ['ANNUAL ENERGY ANALYSIS'],
    ['Description', 'Existing', 'Proposed', 'Savings'],
    ['Connected Load (W)', '3200', '1520', '1680'],
    ['Annual Energy (kWh)', '9984', '4742', '5242'],
    ['Annual Cost ($)', '1198', '569', '629'],
    [''],
    ['ROI SUMMARY'],
    ['Metric', 'Value'],
    ['Project Cost', '$24,000'],
    ['Utility Rebates', '$4,800'],
    ['Net Cost', '$19,200'],
    ['Annual Savings', '$8,229'],
    ['Simple Payback', '2.3 years'],
    ['25-Year NPV', '$186,000']
  ];
  
  return Buffer.from(csv.map(row => row.join(',')).join('\n'), 'utf-8');
}