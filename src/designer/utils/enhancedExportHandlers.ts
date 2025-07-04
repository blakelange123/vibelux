import type { DesignerState } from '../context/types';
import { calculatePowerDensity, calculateEfficacy, calculatePPFDAtPoint } from './calculations';
import type { Fixture } from '../context/types';

export interface ExportOptions {
  includeProjectInfo?: boolean;
  includeRoomInfo?: boolean;
  includePerformanceMetrics?: boolean;
  includeFixtureSchedule?: boolean;
  includePPFDMap?: boolean;
  includeEnergyAnalysis?: boolean;
  includeCompliance?: boolean;
  includeImages?: boolean;
  projectName?: string;
  clientName?: string;
  designerName?: string;
  notes?: string;
}

export async function exportToPDFWithOptions(state: DesignerState, options: ExportOptions = {}) {
  const {
    includeProjectInfo = true,
    includeRoomInfo = true,
    includePerformanceMetrics = true,
    includeFixtureSchedule = true,
    includePPFDMap = true,
    includeEnergyAnalysis = true,
    includeCompliance = true,
    includeImages = true,
    projectName = 'Lighting Design Project',
    clientName = '',
    designerName = '',
    notes = ''
  } = options;

  const { room, objects, calculations } = state;
  const fixtures = objects.filter((obj): obj is Fixture => obj.type === 'fixture');
  
  // Calculate additional metrics
  const totalPower = fixtures.reduce((sum, f) => sum + (f.enabled && f.model ? f.model.wattage : 0), 0);
  const area = room.width * room.length;
  const powerDensity = calculatePowerDensity(fixtures, area);
  const efficacy = calculateEfficacy(fixtures);
  
  // Calculate energy costs
  const dailyHours = 16; // Typical photoperiod
  const kwhPerDay = (totalPower / 1000) * dailyHours;
  const kwhPerMonth = kwhPerDay * 30;
  const costPerKwh = 0.12; // Average US electricity cost
  const monthlyCost = kwhPerMonth * costPerKwh;
  
  // Generate PPFD grid data for visualization
  const ppfdGrid = [];
  const gridResolution = 2; // feet
  for (let x = 0; x < room.width; x += gridResolution) {
    for (let y = 0; y < room.length; y += gridResolution) {
      const ppfd = fixtures.reduce((total, fixture) => {
        return total + calculatePPFDAtPoint({ x, y, z: room.workingHeight || 3 }, fixture);
      }, 0);
      ppfdGrid.push({ x, y, ppfd });
    }
  }

  const reportData = {
    project: {
      name: projectName,
      client: clientName,
      designer: designerName,
      date: new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      time: new Date().toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      })
    },
    room: {
      dimensions: `${room.width} × ${room.length} × ${room.height} ft`,
      area: area,
      volume: area * room.height,
      workingHeight: room.workingHeight || room.height - 1,
      reflectances: {
        ceiling: 0.8,
        walls: 0.5,
        floor: 0.2
      }
    },
    fixtures: {
      count: fixtures.length,
      totalPower: totalPower,
      models: fixtures.map((f, index) => ({
        id: index + 1,
        model: f.model?.name || 'Unknown',
        manufacturer: f.model?.manufacturer || 'Unknown',
        wattage: f.model?.wattage || 0,
        ppf: f.model?.ppf || 0,
        efficacy: f.model?.efficacy || 0,
        spectrum: f.model?.spectrum || 'Full Spectrum',
        position: `(${f.x.toFixed(1)}, ${f.y.toFixed(1)})`,
        height: f.z.toFixed(1),
        enabled: f.enabled
      }))
    },
    metrics: {
      averagePPFD: calculations.averagePPFD,
      uniformity: calculations.uniformity,
      minPPFD: calculations.minPPFD,
      maxPPFD: calculations.maxPPFD,
      dli: calculations.dli,
      powerDensity: powerDensity,
      efficacy: efficacy,
      coverageArea: area,
      ppfdPerWatt: calculations.averagePPFD / (totalPower || 1)
    },
    energy: {
      totalPower: totalPower,
      dailyHours: dailyHours,
      kwhPerDay: kwhPerDay,
      kwhPerMonth: kwhPerMonth,
      kwhPerYear: kwhPerMonth * 12,
      monthlyCost: monthlyCost,
      annualCost: monthlyCost * 12,
      carbonFootprint: kwhPerMonth * 12 * 0.92 // lbs CO2/kWh average
    },
    compliance: {
      standards: [
        {
          name: 'Vegetative Growth',
          requirement: '200-600 μmol/m²/s',
          status: calculations.averagePPFD >= 200 && calculations.averagePPFD <= 600 ? 'Pass' : 'Review',
          actual: calculations.averagePPFD
        },
        {
          name: 'Uniformity',
          requirement: '> 60%',
          status: calculations.uniformity > 0.6 ? 'Pass' : 'Review',
          actual: (calculations.uniformity * 100).toFixed(0) + '%'
        },
        {
          name: 'Power Density',
          requirement: '< 50 W/ft²',
          status: powerDensity < 50 ? 'Pass' : 'Review',
          actual: powerDensity.toFixed(1) + ' W/ft²'
        }
      ]
    },
    ppfdGrid: ppfdGrid,
    notes: notes
  };

  try {
    const html = generateEnhancedPDFHTML(reportData, options);
    
    const printWindow = window.open('', '_blank', 'width=1000,height=800');
    if (printWindow) {
      printWindow.document.write(html);
      printWindow.document.close();
      
      printWindow.onload = () => {
        printWindow.focus();
        setTimeout(() => {
          printWindow.print();
        }, 500);
      };
    }
  } catch (error) {
    console.error('PDF Export Error:', error);
    throw new Error('Failed to generate PDF report');
  }
}

function generateEnhancedPDFHTML(data: any, options: ExportOptions): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <title>${data.project.name} - Vibelux Lighting Report</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
          
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
            line-height: 1.6;
            color: #1a1a1a;
            background: #ffffff;
          }
          
          .page {
            max-width: 8.5in;
            margin: 0 auto;
            padding: 0.5in;
            background: white;
          }
          
          @page {
            size: letter;
            margin: 0.5in;
          }
          
          @media print {
            body {
              print-color-adjust: exact;
              -webkit-print-color-adjust: exact;
            }
            .page-break {
              page-break-before: always;
            }
            .no-print {
              display: none;
            }
          }
          
          /* Header Styles */
          .header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 3px solid #8b5cf6;
          }
          
          .logo-section {
            display: flex;
            align-items: center;
            gap: 16px;
          }
          
          .logo-icon {
            width: 60px;
            height: 60px;
            background: linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%);
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: bold;
            font-size: 32px;
          }
          
          .logo-text {
            font-size: 36px;
            font-weight: 700;
            background: linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
          }
          
          .project-info {
            text-align: right;
          }
          
          .project-info h1 {
            font-size: 24px;
            font-weight: 700;
            color: #333;
            margin-bottom: 8px;
          }
          
          .project-info p {
            font-size: 14px;
            color: #666;
            margin: 2px 0;
          }
          
          /* Section Styles */
          .section {
            margin-bottom: 40px;
          }
          
          .section-title {
            font-size: 20px;
            font-weight: 700;
            color: #8b5cf6;
            margin-bottom: 16px;
            display: flex;
            align-items: center;
            gap: 8px;
          }
          
          .section-icon {
            width: 24px;
            height: 24px;
            background: #8b5cf6;
            border-radius: 4px;
          }
          
          /* Metrics Grid */
          .metrics-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 20px;
            margin-bottom: 30px;
          }
          
          .metric-card {
            background: #f8f9fa;
            border-radius: 12px;
            padding: 20px;
            text-align: center;
            border: 1px solid #e5e7eb;
          }
          
          .metric-card.highlight {
            background: linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%);
            color: white;
            border: none;
          }
          
          .metric-value {
            font-size: 28px;
            font-weight: 700;
            margin-bottom: 4px;
          }
          
          .metric-label {
            font-size: 12px;
            opacity: 0.8;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          
          /* Tables */
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 16px;
            font-size: 14px;
          }
          
          th {
            background: #f8f9fa;
            padding: 12px;
            text-align: left;
            font-weight: 600;
            color: #666;
            border-bottom: 2px solid #e5e7eb;
          }
          
          td {
            padding: 10px 12px;
            border-bottom: 1px solid #f0f0f0;
          }
          
          tr:last-child td {
            border-bottom: none;
          }
          
          .status-pass {
            color: #10b981;
            font-weight: 600;
          }
          
          .status-review {
            color: #f59e0b;
            font-weight: 600;
          }
          
          /* Info Boxes */
          .info-box {
            background: #f0f9ff;
            border: 1px solid #3b82f6;
            border-radius: 8px;
            padding: 16px;
            margin: 20px 0;
          }
          
          .info-box h3 {
            color: #3b82f6;
            font-size: 16px;
            margin-bottom: 8px;
          }
          
          /* Charts */
          .chart-container {
            background: #f8f9fa;
            border-radius: 12px;
            padding: 20px;
            margin: 20px 0;
            text-align: center;
          }
          
          .ppfd-map {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(20px, 1fr));
            gap: 2px;
            margin: 20px 0;
            padding: 20px;
            background: #333;
            border-radius: 8px;
          }
          
          .ppfd-cell {
            aspect-ratio: 1;
            border-radius: 2px;
            font-size: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: 600;
          }
          
          /* Footer */
          .footer {
            margin-top: 60px;
            padding-top: 20px;
            border-top: 2px solid #f0f0f0;
            text-align: center;
            color: #666;
            font-size: 12px;
          }
          
          .footer strong {
            color: #8b5cf6;
          }
          
          /* Notes Section */
          .notes {
            background: #fffbeb;
            border: 1px solid #fbbf24;
            border-radius: 8px;
            padding: 16px;
            margin: 20px 0;
          }
          
          .notes h3 {
            color: #f59e0b;
            margin-bottom: 8px;
          }
        </style>
      </head>
      <body>
        <div class="page">
          <!-- Header -->
          <div class="header">
            <div class="logo-section">
              <div class="logo-icon">V</div>
              <div>
                <div class="logo-text">Vibelux</div>
                <p style="font-size: 12px; color: #666;">Professional Lighting Design</p>
              </div>
            </div>
            ${options.includeProjectInfo ? `
            <div class="project-info">
              <h1>${data.project.name}</h1>
              ${data.project.client ? `<p><strong>Client:</strong> ${data.project.client}</p>` : ''}
              ${data.project.designer ? `<p><strong>Designer:</strong> ${data.project.designer}</p>` : ''}
              <p><strong>Date:</strong> ${data.project.date}</p>
              <p><strong>Time:</strong> ${data.project.time}</p>
            </div>
            ` : ''}
          </div>
          
          ${options.includePerformanceMetrics ? `
          <!-- Performance Metrics -->
          <div class="section">
            <h2 class="section-title">Performance Summary</h2>
            <div class="metrics-grid">
              <div class="metric-card highlight">
                <div class="metric-value">${data.metrics.averagePPFD.toFixed(0)}</div>
                <div class="metric-label">Avg PPFD (μmol/m²/s)</div>
              </div>
              <div class="metric-card">
                <div class="metric-value">${(data.metrics.uniformity * 100).toFixed(0)}%</div>
                <div class="metric-label">Uniformity</div>
              </div>
              <div class="metric-card">
                <div class="metric-value">${data.metrics.dli.toFixed(1)}</div>
                <div class="metric-label">Daily Light Integral</div>
              </div>
              <div class="metric-card">
                <div class="metric-value">${data.fixtures.count}</div>
                <div class="metric-label">Total Fixtures</div>
              </div>
              <div class="metric-card">
                <div class="metric-value">${data.energy.totalPower}W</div>
                <div class="metric-label">Total Power</div>
              </div>
              <div class="metric-card">
                <div class="metric-value">${data.metrics.efficacy.toFixed(2)}</div>
                <div class="metric-label">PPE (μmol/J)</div>
              </div>
            </div>
          </div>
          ` : ''}
          
          ${options.includeRoomInfo ? `
          <!-- Room Information -->
          <div class="section">
            <h2 class="section-title">Facility Information</h2>
            <table>
              <tr>
                <td width="50%"><strong>Room Dimensions</strong></td>
                <td>${data.room.dimensions}</td>
              </tr>
              <tr>
                <td><strong>Floor Area</strong></td>
                <td>${data.room.area.toFixed(1)} ft²</td>
              </tr>
              <tr>
                <td><strong>Volume</strong></td>
                <td>${data.room.volume.toFixed(0)} ft³</td>
              </tr>
              <tr>
                <td><strong>Canopy Height</strong></td>
                <td>${data.room.workingHeight} ft from floor</td>
              </tr>
              <tr>
                <td><strong>Ceiling Reflectance</strong></td>
                <td>${(data.room.reflectances.ceiling * 100)}%</td>
              </tr>
              <tr>
                <td><strong>Wall Reflectance</strong></td>
                <td>${(data.room.reflectances.walls * 100)}%</td>
              </tr>
            </table>
          </div>
          ` : ''}
          
          ${options.includeEnergyAnalysis ? `
          <!-- Energy Analysis -->
          <div class="section">
            <h2 class="section-title">Energy & Cost Analysis</h2>
            <div class="metrics-grid">
              <div class="metric-card">
                <div class="metric-value">${data.energy.kwhPerMonth.toFixed(0)}</div>
                <div class="metric-label">kWh/Month</div>
              </div>
              <div class="metric-card">
                <div class="metric-value">$${data.energy.monthlyCost.toFixed(0)}</div>
                <div class="metric-label">Monthly Cost</div>
              </div>
              <div class="metric-card">
                <div class="metric-value">$${data.energy.annualCost.toFixed(0)}</div>
                <div class="metric-label">Annual Cost</div>
              </div>
            </div>
            <table>
              <tr>
                <td width="50%"><strong>Daily Operating Hours</strong></td>
                <td>${data.energy.dailyHours} hours</td>
              </tr>
              <tr>
                <td><strong>Power Density</strong></td>
                <td>${data.metrics.powerDensity.toFixed(1)} W/ft²</td>
              </tr>
              <tr>
                <td><strong>Energy per Day</strong></td>
                <td>${data.energy.kwhPerDay.toFixed(1)} kWh</td>
              </tr>
              <tr>
                <td><strong>Annual Energy</strong></td>
                <td>${data.energy.kwhPerYear.toFixed(0)} kWh</td>
              </tr>
              <tr>
                <td><strong>Carbon Footprint</strong></td>
                <td>${data.energy.carbonFootprint.toFixed(0)} lbs CO₂/year</td>
              </tr>
              <tr>
                <td><strong>PPFD per Watt</strong></td>
                <td>${data.metrics.ppfdPerWatt.toFixed(2)} μmol/m²/s/W</td>
              </tr>
            </table>
          </div>
          ` : ''}
          
          ${options.includeCompliance ? `
          <!-- Compliance Status -->
          <div class="section">
            <h2 class="section-title">Standards Compliance</h2>
            <table>
              <thead>
                <tr>
                  <th>Standard</th>
                  <th>Requirement</th>
                  <th>Actual</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                ${data.compliance.standards.map((std: any) => `
                  <tr>
                    <td>${std.name}</td>
                    <td>${std.requirement}</td>
                    <td>${std.actual}</td>
                    <td class="status-${std.status.toLowerCase()}">${std.status}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
          ` : ''}
          
          ${options.includeFixtureSchedule ? `
          <div class="page-break"></div>
          
          <!-- Fixture Schedule -->
          <div class="section">
            <h2 class="section-title">Fixture Schedule</h2>
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Model</th>
                  <th>Manufacturer</th>
                  <th>Wattage</th>
                  <th>PPF</th>
                  <th>Efficacy</th>
                  <th>Position</th>
                  <th>Height</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                ${data.fixtures.models.map((f: any) => `
                  <tr>
                    <td>${f.id}</td>
                    <td>${f.model}</td>
                    <td>${f.manufacturer}</td>
                    <td>${f.wattage}W</td>
                    <td>${f.ppf} μmol/s</td>
                    <td>${f.efficacy} μmol/J</td>
                    <td>${f.position}</td>
                    <td>${f.height} ft</td>
                    <td>${f.enabled ? '✅ Active' : '❌ Disabled'}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
            
            <div class="info-box" style="margin-top: 20px;">
              <h3>Fixture Summary</h3>
              <p><strong>Total Fixtures:</strong> ${data.fixtures.count}</p>
              <p><strong>Active Fixtures:</strong> ${data.fixtures.models.filter((f: any) => f.enabled).length}</p>
              <p><strong>Total Connected Load:</strong> ${data.fixtures.totalPower} W</p>
              <p><strong>Average Fixture Spacing:</strong> ${Math.sqrt(data.room.area / data.fixtures.count).toFixed(1)} ft</p>
            </div>
          </div>
          ` : ''}
          
          ${options.notes && data.notes ? `
          <!-- Notes -->
          <div class="notes">
            <h3>Project Notes</h3>
            <p>${data.notes}</p>
          </div>
          ` : ''}
          
          <!-- Footer -->
          <div class="footer">
            <p>Generated by <strong>Vibelux</strong> Professional Lighting Design Platform</p>
            <p>© ${new Date().getFullYear()} Vibelux. All rights reserved.</p>
            <p style="margin-top: 8px; font-size: 10px;">This report is confidential and proprietary. Distribution is limited to authorized personnel only.</p>
          </div>
        </div>
        
        <script>
          // Auto-print after load
          window.onload = function() {
            setTimeout(() => {
              window.print();
            }, 500);
          };
        </script>
      </body>
    </html>
  `;
}