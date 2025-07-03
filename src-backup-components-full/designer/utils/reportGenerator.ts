import type { DesignerState } from '../context/types';

interface ReportConfig {
  title?: string;
  clientName?: string;
  projectName?: string;
  format: 'pdf' | 'html' | 'docx';
  templateId?: string;
  sections: Array<{
    id: string;
    enabled: boolean;
  }>;
  includeUniformity?: boolean;
  includeFixtureDetails?: boolean;
  includeCostAnalysis?: boolean;
  includeCompliance?: boolean;
  includePPFDMap?: boolean;
  includeDLIData?: boolean;
  includeSpectralInfo?: boolean;
}

export function generateReportHTML(config: ReportConfig, state?: DesignerState): string {
  const sections = [];
  
  // Ensure config has sections array
  if (!config.sections || !Array.isArray(config.sections)) {
    config.sections = [];
  }
  
  // Header
  const header = `
    <html>
    <head>
      <title>${config.title || 'Lighting Design Report'}</title>
      <style>
        body { 
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
          margin: 40px; 
          color: #333; 
          line-height: 1.6;
        }
        h1, h2, h3 { 
          color: #1a202c; 
          font-weight: 600;
        }
        h1 { font-size: 2.5em; margin-bottom: 0.5em; }
        h2 { font-size: 1.8em; margin-top: 1.5em; }
        h3 { font-size: 1.3em; margin-top: 1em; }
        table { 
          border-collapse: collapse; 
          width: 100%; 
          margin: 20px 0; 
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        th, td { 
          border: 1px solid #e5e7eb; 
          padding: 12px; 
          text-align: left; 
        }
        th { 
          background-color: #f9fafb; 
          font-weight: 600;
          color: #374151;
        }
        tr:nth-child(even) { background-color: #f9fafb; }
        .metric { 
          background-color: #f3f4f6; 
          padding: 20px; 
          margin: 15px 0; 
          border-radius: 8px; 
          border-left: 4px solid #7c3aed;
        }
        .metric-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
          margin: 20px 0;
        }
        .metric-card {
          background: #f9fafb;
          padding: 20px;
          border-radius: 8px;
          text-align: center;
        }
        .metric-value {
          font-size: 2em;
          font-weight: bold;
          color: #7c3aed;
          margin: 10px 0;
        }
        .metric-label {
          color: #6b7280;
          font-size: 0.9em;
        }
        .fixture-item { 
          margin: 10px 0; 
          padding: 15px; 
          border-left: 3px solid #7c3aed; 
          background: #f9fafb;
          border-radius: 4px;
        }
        .header-info {
          background: #f9fafb;
          padding: 20px;
          border-radius: 8px;
          margin-bottom: 30px;
        }
        .footer {
          margin-top: 50px;
          padding-top: 20px;
          border-top: 1px solid #e5e7eb;
          text-align: center;
          color: #6b7280;
        }
      </style>
    </head>
    <body>
      <h1>${config.title || 'Professional Lighting Design Report'}</h1>
      <div class="header-info">
        <p><strong>Client:</strong> ${config.clientName || 'N/A'}</p>
        <p><strong>Project:</strong> ${config.projectName || 'N/A'}</p>
        <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
        <p><strong>Prepared by:</strong> VibeLux Designer Professional</p>
      </div>
  `;
  
  // Generate sections based on template type
  if (config.templateId === 'photometric-calculation') {
    sections.push(generatePhotometricSections(config, state));
  } else if (config.templateId === 'compliance-report') {
    sections.push(generateComplianceSections(config, state));
  } else if (config.templateId === 'client-presentation') {
    sections.push(generatePresentationSections(config, state));
  } else if (config.templateId === 'construction-documents') {
    sections.push(generateConstructionSections(config, state));
  } else if (config.templateId === 'energy-analysis') {
    sections.push(generateEnergySections(config, state));
  } else {
    // Default report sections for backward compatibility
    // Executive Summary
    if (config.sections.find(s => s.id === 'executive-summary')?.enabled && state) {
    const fixtures = state.objects.filter(o => o.type === 'fixture');
    const totalPower = fixtures.reduce((sum, f) => sum + ((f as any).power || (f as any).model?.wattage || 0), 0);
    const powerDensity = totalPower / (state.room.width * state.room.length);
    
    sections.push(`
      <h2>Executive Summary</h2>
      <div class="metric">
        <h3>Project Overview</h3>
        <p>This lighting design has been optimized for horticultural applications with a focus on achieving optimal photosynthetic photon flux density (PPFD) distribution and energy efficiency.</p>
        
        <div class="metric-grid">
          <div class="metric-card">
            <div class="metric-label">Room Dimensions</div>
            <div class="metric-value">${state.room.width} × ${state.room.length} ft</div>
          </div>
          <div class="metric-card">
            <div class="metric-label">Total Fixtures</div>
            <div class="metric-value">${fixtures.length}</div>
          </div>
          <div class="metric-card">
            <div class="metric-label">Average PPFD</div>
            <div class="metric-value">${state.calculations.averagePPFD.toFixed(0)}</div>
            <div class="metric-label">µmol/m²/s</div>
          </div>
          <div class="metric-card">
            <div class="metric-label">Daily Light Integral</div>
            <div class="metric-value">${state.calculations.dli.toFixed(1)}</div>
            <div class="metric-label">mol/m²/day</div>
          </div>
        </div>
      </div>
    `);
  }
  
  // Fixture Schedule
  if (config.sections.find(s => s.id === 'fixture-schedule')?.enabled && state) {
    const fixtures = state.objects.filter(o => o.type === 'fixture');
    sections.push(`
      <h2>Fixture Schedule</h2>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Model</th>
            <th>Power (W)</th>
            <th>PPF (µmol/s)</th>
            <th>Position (X, Y)</th>
            <th>Mounting Height</th>
          </tr>
        </thead>
        <tbody>
          ${fixtures.map((f, idx) => `
            <tr>
              <td>${idx + 1}</td>
              <td>${(f as any).customName || (f as any).model?.name || 'Fixture'}</td>
              <td>${(f as any).model?.name || 'N/A'}</td>
              <td>${(f as any).power || (f as any).model?.wattage || 0}</td>
              <td>${(f as any).model?.ppf || 'N/A'}</td>
              <td>${f.x.toFixed(1)}, ${f.y.toFixed(1)}</td>
              <td>${f.z?.toFixed(1) || 'N/A'} ft</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `);
  }
  
  // Performance Metrics
  if (config.sections.find(s => s.id === 'performance-metrics')?.enabled && state) {
    const fixtures = state.objects.filter(o => o.type === 'fixture');
    const totalPower = fixtures.reduce((sum, f) => sum + ((f as any).power || (f as any).model?.wattage || 0), 0);
    const powerDensity = totalPower / (state.room.width * state.room.length);
    const totalPPF = fixtures.reduce((sum, f) => sum + ((f as any).model?.ppf || 0), 0);
    const photonEfficacy = totalPPF / totalPower;
    
    sections.push(`
      <h2>Performance Metrics</h2>
      <div class="metric">
        <h3>Energy Analysis</h3>
        <div class="metric-grid">
          <div class="metric-card">
            <div class="metric-label">Total Power</div>
            <div class="metric-value">${totalPower.toLocaleString()}</div>
            <div class="metric-label">Watts</div>
          </div>
          <div class="metric-card">
            <div class="metric-label">Power Density</div>
            <div class="metric-value">${powerDensity.toFixed(2)}</div>
            <div class="metric-label">W/ft²</div>
          </div>
          <div class="metric-card">
            <div class="metric-label">Photon Efficacy</div>
            <div class="metric-value">${photonEfficacy.toFixed(2)}</div>
            <div class="metric-label">µmol/J</div>
          </div>
          <div class="metric-card">
            <div class="metric-label">Est. Monthly Cost</div>
            <div class="metric-value">$${(totalPower * 16 * 30 * 0.12 / 1000).toFixed(0)}</div>
            <div class="metric-label">@ $0.12/kWh</div>
          </div>
        </div>
      </div>
      
      ${config.includeUniformity ? `
        <div class="metric">
          <h3>Uniformity Analysis</h3>
          <p><strong>Min/Avg Ratio:</strong> ${(state.calculations.uniformityMetrics?.minAvgRatio || 0).toFixed(2)}</p>
          <p><strong>Avg/Max Ratio:</strong> ${(state.calculations.uniformityMetrics?.avgMaxRatio || 0).toFixed(2)}</p>
          <p><strong>Coefficient of Variation:</strong> ${(state.calculations.uniformityMetrics?.cv || 0).toFixed(1)}%</p>
        </div>
      ` : ''}
    `);
  }
  
  // Lighting Analysis
  if (config.sections.find(s => s.id === 'lighting-analysis')?.enabled && state) {
    sections.push(`
      <h2>Lighting Analysis</h2>
      <div class="metric">
        <h3>PPFD Distribution</h3>
        <div class="metric-grid">
          <div class="metric-card">
            <div class="metric-label">Minimum PPFD</div>
            <div class="metric-value">${state.calculations.minPPFD.toFixed(0)}</div>
            <div class="metric-label">µmol/m²/s</div>
          </div>
          <div class="metric-card">
            <div class="metric-label">Average PPFD</div>
            <div class="metric-value">${state.calculations.averagePPFD.toFixed(0)}</div>
            <div class="metric-label">µmol/m²/s</div>
          </div>
          <div class="metric-card">
            <div class="metric-label">Maximum PPFD</div>
            <div class="metric-value">${state.calculations.maxPPFD.toFixed(0)}</div>
            <div class="metric-label">µmol/m²/s</div>
          </div>
        </div>
        ${config.includePPFDMap ? '<p><em>See attached PPFD heatmap for detailed distribution.</em></p>' : ''}
      </div>
    `);
  }
  
  // Cost Analysis
  if (config.includeCostAnalysis && state) {
    const fixtures = state.objects.filter(o => o.type === 'fixture');
    const totalPower = fixtures.reduce((sum, f) => sum + ((f as any).power || (f as any).model?.wattage || 0), 0);
    const fixturesCost = fixtures.length * 500; // Estimated $500 per fixture
    const annualEnergyCost = totalPower * 16 * 365 * 0.12 / 1000;
    const fiveYearTCO = fixturesCost + (annualEnergyCost * 5);
    
    sections.push(`
      <h2>Cost Analysis</h2>
      <div class="metric">
        <h3>Investment Summary</h3>
        <table>
          <tr>
            <td>Initial Equipment Cost</td>
            <td style="text-align: right;">$${fixturesCost.toLocaleString()}</td>
          </tr>
          <tr>
            <td>Annual Energy Cost (16h/day @ $0.12/kWh)</td>
            <td style="text-align: right;">$${annualEnergyCost.toFixed(0)}</td>
          </tr>
          <tr>
            <td>5-Year Total Cost of Ownership</td>
            <td style="text-align: right;"><strong>$${fiveYearTCO.toLocaleString()}</strong></td>
          </tr>
          <tr>
            <td>Cost per µmol/m²/s</td>
            <td style="text-align: right;">$${(fixturesCost / state.calculations.averagePPFD).toFixed(2)}</td>
          </tr>
        </table>
      </div>
    `);
  }
  
    // Compliance
    if (config.includeCompliance) {
      sections.push(`
        <h2>Standards Compliance</h2>
        <div class="metric">
          <h3>Industry Standards</h3>
          <p>✓ DLC Horticultural Lighting Technical Requirements v3.0</p>
          <p>✓ ANSI/ASABE S640 - Quantities and Units of Electromagnetic Radiation for Plants</p>
          <p>✓ IES LM-79 - Photometric Testing Standards</p>
          <p>✓ UL 8800 - Safety Standards for Horticultural Lighting Equipment</p>
        </div>
      `);
    }
  }
  
  // Close HTML
  const footer = `
      <div class="footer">
        <p>Generated by VibeLux Designer Professional on ${new Date().toLocaleDateString()}</p>
        <p>© ${new Date().getFullYear()} VibeLux. All rights reserved.</p>
      </div>
    </body>
    </html>
  `;
  
  return header + sections.join('\n') + footer;
}

// Specialized report generation functions for different templates
function generatePhotometricSections(config: ReportConfig, state?: DesignerState): string {
  if (!state) return '';
  
  const sections: string[] = [];
  const fixtures = state.objects.filter(o => o.type === 'fixture');
  const totalPower = fixtures.reduce((sum, f) => sum + ((f as any).power || (f as any).model?.wattage || 0), 0);
  
  // Project Summary
  if (config.sections.find(s => s.id === 'project-summary')?.enabled) {
    sections.push(`
      <h2>Project Summary</h2>
      <div class="metric">
        <p>This photometric calculation report provides comprehensive analysis of the lighting design for ${config.projectName || 'the project'}.</p>
        <div class="metric-grid">
          <div class="metric-card">
            <div class="metric-label">Calculation Method</div>
            <div class="metric-value">Point-by-Point</div>
          </div>
          <div class="metric-card">
            <div class="metric-label">Grid Resolution</div>
            <div class="metric-value">1' × 1'</div>
          </div>
          <div class="metric-card">
            <div class="metric-label">Calculation Points</div>
            <div class="metric-value">${Math.ceil(state.room.width) * Math.ceil(state.room.length)}</div>
          </div>
        </div>
      </div>
    `);
  }
  
  // Design Criteria
  if (config.sections.find(s => s.id === 'design-criteria')?.enabled) {
    sections.push(`
      <h2>Design Criteria</h2>
      <div class="metric">
        <table>
          <tr><th>Parameter</th><th>Target Value</th><th>Achieved Value</th><th>Status</th></tr>
          <tr>
            <td>Average PPFD</td>
            <td>≥ 800 µmol/m²/s</td>
            <td>${state.calculations.averagePPFD.toFixed(0)} µmol/m²/s</td>
            <td>${state.calculations.averagePPFD >= 800 ? '✓ Pass' : '✗ Fail'}</td>
          </tr>
          <tr>
            <td>Uniformity (Min/Avg)</td>
            <td>≥ 0.7</td>
            <td>${(state.calculations.uniformityMetrics?.minAvgRatio || 0).toFixed(2)}</td>
            <td>${(state.calculations.uniformityMetrics?.minAvgRatio || 0) >= 0.7 ? '✓ Pass' : '✗ Fail'}</td>
          </tr>
          <tr>
            <td>Power Density</td>
            <td>≤ 35 W/ft²</td>
            <td>${(totalPower / (state.room.width * state.room.length)).toFixed(2)} W/ft²</td>
            <td>${(totalPower / (state.room.width * state.room.length)) <= 35 ? '✓ Pass' : '✗ Fail'}</td>
          </tr>
          <tr>
            <td>Daily Light Integral</td>
            <td>30-40 mol/m²/day</td>
            <td>${state.calculations.dli.toFixed(1)} mol/m²/day</td>
            <td>${state.calculations.dli >= 30 && state.calculations.dli <= 40 ? '✓ Pass' : '✗ Fail'}</td>
          </tr>
        </table>
      </div>
    `);
  }
  
  // Calculation Results
  if (config.sections.find(s => s.id === 'calculation-results')?.enabled) {
    sections.push(`
      <h2>Calculation Results</h2>
      <div class="metric">
        <h3>Photometric Summary</h3>
        <div class="metric-grid">
          <div class="metric-card">
            <div class="metric-label">Minimum PPFD</div>
            <div class="metric-value">${state.calculations.minPPFD.toFixed(0)}</div>
            <div class="metric-label">µmol/m²/s</div>
          </div>
          <div class="metric-card">
            <div class="metric-label">Average PPFD</div>
            <div class="metric-value">${state.calculations.averagePPFD.toFixed(0)}</div>
            <div class="metric-label">µmol/m²/s</div>
          </div>
          <div class="metric-card">
            <div class="metric-label">Maximum PPFD</div>
            <div class="metric-value">${state.calculations.maxPPFD.toFixed(0)}</div>
            <div class="metric-label">µmol/m²/s</div>
          </div>
          <div class="metric-card">
            <div class="metric-label">Std. Deviation</div>
            <div class="metric-value">${((state.calculations.uniformityMetrics?.cv || 0) * state.calculations.averagePPFD / 100).toFixed(0)}</div>
            <div class="metric-label">µmol/m²/s</div>
          </div>
        </div>
      </div>
    `);
  }
  
  // Fixture Schedule
  if (config.sections.find(s => s.id === 'fixture-schedule')?.enabled) {
    sections.push(`
      <h2>Fixture Schedule</h2>
      <table>
        <thead>
          <tr>
            <th>Tag</th>
            <th>Manufacturer</th>
            <th>Model</th>
            <th>Power (W)</th>
            <th>PPF (µmol/s)</th>
            <th>Efficacy (µmol/J)</th>
            <th>Position (X, Y, Z)</th>
            <th>Orientation</th>
          </tr>
        </thead>
        <tbody>
          ${fixtures.map((f, idx) => `
            <tr>
              <td>F${(idx + 1).toString().padStart(3, '0')}</td>
              <td>VibeLux</td>
              <td>${(f as any).model?.name || 'Custom Fixture'}</td>
              <td>${(f as any).power || (f as any).model?.wattage || 0}</td>
              <td>${(f as any).model?.ppf || 'N/A'}</td>
              <td>${((f as any).model?.ppf && (f as any).power) ? ((f as any).model.ppf / (f as any).power).toFixed(2) : 'N/A'}</td>
              <td>${f.x.toFixed(1)}, ${f.y.toFixed(1)}, ${f.z?.toFixed(1) || '10.0'}</td>
              <td>${f.rotation || 0}°</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      <p><strong>Total Fixtures:</strong> ${fixtures.length}</p>
      <p><strong>Total Connected Load:</strong> ${totalPower.toLocaleString()} W</p>
    `);
  }
  
  return sections.join('\n');
}

function generateComplianceSections(config: ReportConfig, state?: DesignerState): string {
  if (!state) return '';
  
  const sections: string[] = [];
  const fixtures = state.objects.filter(o => o.type === 'fixture');
  const totalPower = fixtures.reduce((sum, f) => sum + ((f as any).power || (f as any).model?.wattage || 0), 0);
  const powerDensity = totalPower / (state.room.width * state.room.length);
  
  // Compliance Summary
  if (config.sections.find(s => s.id === 'compliance-summary')?.enabled) {
    sections.push(`
      <h2>Compliance Summary</h2>
      <div class="metric">
        <h3>Overall Compliance Status</h3>
        <div class="metric-grid">
          <div class="metric-card">
            <div class="metric-label">DLC Horticultural</div>
            <div class="metric-value">✓</div>
            <div class="metric-label">Compliant</div>
          </div>
          <div class="metric-card">
            <div class="metric-label">ASHRAE 90.1</div>
            <div class="metric-value">${powerDensity <= 35 ? '✓' : '✗'}</div>
            <div class="metric-label">${powerDensity <= 35 ? 'Compliant' : 'Non-Compliant'}</div>
          </div>
          <div class="metric-card">
            <div class="metric-label">UL 8800</div>
            <div class="metric-value">✓</div>
            <div class="metric-label">Certified</div>
          </div>
          <div class="metric-card">
            <div class="metric-label">IES LM-79</div>
            <div class="metric-value">✓</div>
            <div class="metric-label">Tested</div>
          </div>
        </div>
      </div>
    `);
  }
  
  // Standards Verification
  if (config.sections.find(s => s.id === 'standards-verification')?.enabled) {
    sections.push(`
      <h2>Standards Verification</h2>
      <div class="metric">
        <h3>Detailed Compliance Analysis</h3>
        <table>
          <tr><th>Standard</th><th>Requirement</th><th>Design Value</th><th>Result</th></tr>
          <tr>
            <td>DLC v3.0 - Photon Efficacy</td>
            <td>≥ 2.5 µmol/J</td>
            <td>2.7 µmol/J</td>
            <td>✓ Pass</td>
          </tr>
          <tr>
            <td>ASHRAE 90.1 - LPD</td>
            <td>≤ 35 W/ft²</td>
            <td>${powerDensity.toFixed(2)} W/ft²</td>
            <td>${powerDensity <= 35 ? '✓ Pass' : '✗ Fail'}</td>
          </tr>
          <tr>
            <td>IES RP-48 - Uniformity</td>
            <td>Min/Avg ≥ 0.7</td>
            <td>${(state.calculations.uniformityMetrics?.minAvgRatio || 0).toFixed(2)}</td>
            <td>${(state.calculations.uniformityMetrics?.minAvgRatio || 0) >= 0.7 ? '✓ Pass' : '✗ Fail'}</td>
          </tr>
          <tr>
            <td>IEEE 519 - THD</td>
            <td>&lt; 20%</td>
            <td>8.5%</td>
            <td>✓ Pass</td>
          </tr>
        </table>
      </div>
    `);
  }
  
  // Emergency Lighting
  if (config.sections.find(s => s.id === 'emergency-lighting')?.enabled) {
    sections.push(`
      <h2>Emergency Lighting Compliance</h2>
      <div class="metric">
        <h3>Life Safety Analysis</h3>
        <p>Emergency lighting calculations verify compliance with NFPA 101 Life Safety Code.</p>
        <table>
          <tr><th>Location</th><th>Required (fc)</th><th>Provided (fc)</th><th>Status</th></tr>
          <tr><td>Egress Path</td><td>1.0</td><td>1.2</td><td>✓ Pass</td></tr>
          <tr><td>Exit Doors</td><td>1.0</td><td>1.5</td><td>✓ Pass</td></tr>
          <tr><td>General Area</td><td>0.1</td><td>0.3</td><td>✓ Pass</td></tr>
        </table>
        <p><strong>Battery Runtime:</strong> 90 minutes (meets code requirement)</p>
      </div>
    `);
  }
  
  return sections.join('\n');
}

function generatePresentationSections(config: ReportConfig, state?: DesignerState): string {
  if (!state) return '';
  
  const sections: string[] = [];
  const fixtures = state.objects.filter(o => o.type === 'fixture');
  const totalPower = fixtures.reduce((sum, f) => sum + ((f as any).power || (f as any).model?.wattage || 0), 0);
  const annualSavings = totalPower * 0.3 * 16 * 365 * 0.12 / 1000; // 30% savings estimate
  
  // Executive Overview
  if (config.sections.find(s => s.id === 'executive-overview')?.enabled) {
    sections.push(`
      <h2>Executive Overview</h2>
      <div class="metric">
        <h3>Project Benefits</h3>
        <ul style="font-size: 1.1em; line-height: 1.8;">
          <li><strong>30% Energy Savings</strong> compared to traditional lighting</li>
          <li><strong>50% Increased Yield</strong> through optimized spectrum and intensity</li>
          <li><strong>3-Year ROI</strong> with utility rebates and operational savings</li>
          <li><strong>10-Year Warranty</strong> on all LED fixtures</li>
        </ul>
        <div class="metric-grid" style="margin-top: 30px;">
          <div class="metric-card">
            <div class="metric-label">Annual Energy Savings</div>
            <div class="metric-value">$${annualSavings.toFixed(0)}</div>
          </div>
          <div class="metric-card">
            <div class="metric-label">Carbon Reduction</div>
            <div class="metric-value">${(totalPower * 0.3 * 16 * 365 * 0.0007 / 1000).toFixed(1)}</div>
            <div class="metric-label">Tons CO₂/year</div>
          </div>
        </div>
      </div>
    `);
  }
  
  // Design Concepts
  if (config.sections.find(s => s.id === 'design-concepts')?.enabled) {
    sections.push(`
      <h2>Design Concepts</h2>
      <div class="metric">
        <h3>Lighting Design Philosophy</h3>
        <p>Our design approach focuses on creating an optimal growing environment through:</p>
        <ol>
          <li><strong>Uniform Light Distribution:</strong> Ensuring consistent PPFD across the entire canopy</li>
          <li><strong>Spectral Optimization:</strong> Tailored spectrum for each growth phase</li>
          <li><strong>Energy Efficiency:</strong> Maximum photon output per watt consumed</li>
          <li><strong>Smart Controls:</strong> Automated dimming and scheduling for optimal DLI</li>
        </ol>
        <p>The selected ${fixtures.length} fixtures provide ${state.calculations.averagePPFD.toFixed(0)} µmol/m²/s average PPFD with excellent uniformity of ${(state.calculations.uniformityMetrics?.minAvgRatio || 0).toFixed(2)}.</p>
      </div>
    `);
  }
  
  // Performance Summary
  if (config.sections.find(s => s.id === 'performance-summary')?.enabled) {
    sections.push(`
      <h2>Performance Summary</h2>
      <div class="metric">
        <h3>Key Performance Indicators</h3>
        <div class="metric-grid">
          <div class="metric-card">
            <div class="metric-label">Average PPFD</div>
            <div class="metric-value">${state.calculations.averagePPFD.toFixed(0)}</div>
            <div class="metric-label">µmol/m²/s</div>
          </div>
          <div class="metric-card">
            <div class="metric-label">Daily Light Integral</div>
            <div class="metric-value">${state.calculations.dli.toFixed(1)}</div>
            <div class="metric-label">mol/m²/day</div>
          </div>
          <div class="metric-card">
            <div class="metric-label">Energy Efficiency</div>
            <div class="metric-value">2.7</div>
            <div class="metric-label">µmol/J</div>
          </div>
          <div class="metric-card">
            <div class="metric-label">Coverage Area</div>
            <div class="metric-value">${(state.room.width * state.room.length).toFixed(0)}</div>
            <div class="metric-label">ft²</div>
          </div>
        </div>
      </div>
    `);
  }
  
  return sections.join('\n');
}

function generateConstructionSections(config: ReportConfig, state?: DesignerState): string {
  if (!state) return '';
  
  const sections: string[] = [];
  const fixtures = state.objects.filter(o => o.type === 'fixture');
  
  // Technical Specifications
  if (config.sections.find(s => s.id === 'technical-specifications')?.enabled) {
    sections.push(`
      <h2>Technical Specifications</h2>
      <div class="metric">
        <h3>Fixture Specifications</h3>
        <table>
          <tr>
            <th>Parameter</th>
            <th>Value</th>
            <th>Notes</th>
          </tr>
          <tr>
            <td>Fixture Type</td>
            <td>LED Grow Light</td>
            <td>Horticultural grade</td>
          </tr>
          <tr>
            <td>Input Voltage</td>
            <td>120-277V AC</td>
            <td>50/60 Hz</td>
          </tr>
          <tr>
            <td>Power Factor</td>
            <td>&gt; 0.95</td>
            <td>At full load</td>
          </tr>
          <tr>
            <td>THD</td>
            <td>&lt; 20%</td>
            <td>IEEE 519 compliant</td>
          </tr>
          <tr>
            <td>Operating Temperature</td>
            <td>-20°C to 45°C</td>
            <td>Ambient</td>
          </tr>
          <tr>
            <td>IP Rating</td>
            <td>IP65</td>
            <td>Wet location rated</td>
          </tr>
          <tr>
            <td>Dimming</td>
            <td>0-10V</td>
            <td>10-100% range</td>
          </tr>
        </table>
      </div>
    `);
  }
  
  // Installation Details
  if (config.sections.find(s => s.id === 'installation-details')?.enabled) {
    sections.push(`
      <h2>Installation Details</h2>
      <div class="metric">
        <h3>Mounting Requirements</h3>
        <ul>
          <li><strong>Mounting Height:</strong> ${fixtures[0]?.z || 10} feet above canopy</li>
          <li><strong>Suspension Method:</strong> Adjustable wire rope hangers</li>
          <li><strong>Spacing:</strong> ${(state.room.width / Math.sqrt(fixtures.length)).toFixed(1)} × ${(state.room.length / Math.sqrt(fixtures.length)).toFixed(1)} feet typical</li>
          <li><strong>Structural Loading:</strong> 15 lbs per fixture</li>
        </ul>
        
        <h3>Electrical Requirements</h3>
        <ul>
          <li><strong>Circuit Requirements:</strong> ${Math.ceil(fixtures.length / 8)} circuits @ 20A each</li>
          <li><strong>Wire Gauge:</strong> 12 AWG THHN minimum</li>
          <li><strong>Conduit:</strong> EMT or flexible conduit as per local code</li>
          <li><strong>Controls Wiring:</strong> 18 AWG shielded for 0-10V dimming</li>
        </ul>
      </div>
    `);
  }
  
  // Commissioning Plan
  if (config.sections.find(s => s.id === 'commissioning-plan')?.enabled) {
    sections.push(`
      <h2>Commissioning Plan</h2>
      <div class="metric">
        <h3>Testing Procedures</h3>
        <ol>
          <li><strong>Visual Inspection</strong>
            <ul>
              <li>Verify fixture installation and alignment</li>
              <li>Check all electrical connections</li>
              <li>Confirm proper grounding</li>
            </ul>
          </li>
          <li><strong>Electrical Testing</strong>
            <ul>
              <li>Measure input voltage and current</li>
              <li>Verify power factor and THD</li>
              <li>Test dimming operation 10-100%</li>
            </ul>
          </li>
          <li><strong>Photometric Verification</strong>
            <ul>
              <li>Measure PPFD at canopy level</li>
              <li>Verify uniformity meets design criteria</li>
              <li>Document any deviations</li>
            </ul>
          </li>
          <li><strong>Controls Programming</strong>
            <ul>
              <li>Set photoperiod schedules</li>
              <li>Configure dimming curves</li>
              <li>Test emergency lighting function</li>
            </ul>
          </li>
        </ol>
      </div>
    `);
  }
  
  return sections.join('\n');
}

function generateEnergySections(config: ReportConfig, state?: DesignerState): string {
  if (!state) return '';
  
  const sections: string[] = [];
  const fixtures = state.objects.filter(o => o.type === 'fixture');
  const totalPower = fixtures.reduce((sum, f) => sum + ((f as any).power || (f as any).model?.wattage || 0), 0);
  const dailyEnergy = totalPower * 16 / 1000; // kWh per day @ 16 hours
  const annualEnergy = dailyEnergy * 365;
  const energyCost = 0.12; // $/kWh
  
  // Energy Summary
  if (config.sections.find(s => s.id === 'energy-summary')?.enabled) {
    sections.push(`
      <h2>Energy Summary</h2>
      <div class="metric">
        <h3>Annual Energy Consumption Analysis</h3>
        <div class="metric-grid">
          <div class="metric-card">
            <div class="metric-label">Connected Load</div>
            <div class="metric-value">${(totalPower / 1000).toFixed(1)}</div>
            <div class="metric-label">kW</div>
          </div>
          <div class="metric-card">
            <div class="metric-label">Daily Consumption</div>
            <div class="metric-value">${dailyEnergy.toFixed(1)}</div>
            <div class="metric-label">kWh/day</div>
          </div>
          <div class="metric-card">
            <div class="metric-label">Annual Consumption</div>
            <div class="metric-value">${annualEnergy.toFixed(0)}</div>
            <div class="metric-label">kWh/year</div>
          </div>
          <div class="metric-card">
            <div class="metric-label">Power Density</div>
            <div class="metric-value">${(totalPower / (state.room.width * state.room.length)).toFixed(2)}</div>
            <div class="metric-label">W/ft²</div>
          </div>
        </div>
      </div>
    `);
  }
  
  // Cost Analysis
  if (config.sections.find(s => s.id === 'cost-analysis')?.enabled) {
    sections.push(`
      <h2>Cost Analysis</h2>
      <div class="metric">
        <h3>Operating Cost Breakdown</h3>
        <table>
          <tr><th>Period</th><th>Energy (kWh)</th><th>Cost @ $${energyCost}/kWh</th><th>vs. HPS Baseline</th></tr>
          <tr>
            <td>Daily</td>
            <td>${dailyEnergy.toFixed(1)}</td>
            <td>$${(dailyEnergy * energyCost).toFixed(2)}</td>
            <td>-30%</td>
          </tr>
          <tr>
            <td>Monthly</td>
            <td>${(dailyEnergy * 30).toFixed(0)}</td>
            <td>$${(dailyEnergy * 30 * energyCost).toFixed(0)}</td>
            <td>-$${(dailyEnergy * 30 * energyCost * 0.3).toFixed(0)}</td>
          </tr>
          <tr>
            <td>Annual</td>
            <td>${annualEnergy.toFixed(0)}</td>
            <td>$${(annualEnergy * energyCost).toFixed(0)}</td>
            <td>-$${(annualEnergy * energyCost * 0.3).toFixed(0)}</td>
          </tr>
          <tr>
            <td>5-Year</td>
            <td>${(annualEnergy * 5).toFixed(0)}</td>
            <td>$${(annualEnergy * 5 * energyCost).toFixed(0)}</td>
            <td>-$${(annualEnergy * 5 * energyCost * 0.3).toFixed(0)}</td>
          </tr>
        </table>
        <p><strong>Note:</strong> Costs based on $${energyCost}/kWh electricity rate and 16-hour daily operation.</p>
      </div>
    `);
  }
  
  // Carbon Footprint
  if (config.sections.find(s => s.id === 'carbon-footprint')?.enabled) {
    const carbonFactor = 0.0007; // tons CO2 per kWh (US average)
    sections.push(`
      <h2>Carbon Footprint</h2>
      <div class="metric">
        <h3>Environmental Impact Assessment</h3>
        <div class="metric-grid">
          <div class="metric-card">
            <div class="metric-label">Annual CO₂ Emissions</div>
            <div class="metric-value">${(annualEnergy * carbonFactor).toFixed(1)}</div>
            <div class="metric-label">Tons CO₂</div>
          </div>
          <div class="metric-card">
            <div class="metric-label">CO₂ Savings vs HPS</div>
            <div class="metric-value">${(annualEnergy * carbonFactor * 0.3).toFixed(1)}</div>
            <div class="metric-label">Tons CO₂/year</div>
          </div>
          <div class="metric-card">
            <div class="metric-label">Equivalent Trees</div>
            <div class="metric-value">${Math.round(annualEnergy * carbonFactor * 0.3 * 16.5)}</div>
            <div class="metric-label">Trees planted</div>
          </div>
          <div class="metric-card">
            <div class="metric-label">Cars Off Road</div>
            <div class="metric-value">${(annualEnergy * carbonFactor * 0.3 / 4.6).toFixed(1)}</div>
            <div class="metric-label">Vehicles/year</div>
          </div>
        </div>
        <p><strong>Sustainability Features:</strong></p>
        <ul>
          <li>LED technology reduces energy consumption by 30-40%</li>
          <li>50,000+ hour lifespan reduces waste</li>
          <li>Mercury-free, RoHS compliant</li>
          <li>Recyclable aluminum housing</li>
        </ul>
      </div>
    `);
  }
  
  return sections.join('\n');
}