import type { DesignerState } from '../context/types';
import { calculatePowerDensity, calculateEfficacy } from './calculations';
import type { Fixture } from '../context/types';
import { IESExporter, LDTExporter } from '@/lib/photometric/ies-exporter';

export async function exportToPDF(state: DesignerState) {
  const { room, objects, calculations } = state;
  const fixtures = objects.filter((obj): obj is Fixture => obj.type === 'fixture');
  
  const reportData = {
    project: {
      name: 'Lighting Design Report',
      date: new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    },
    room: {
      dimensions: `${room.width} × ${room.length} × ${room.height} ft`,
      area: room.width * room.length,
      workingHeight: room.workingHeight || room.height - 1
    },
    fixtures: {
      count: fixtures.length,
      totalPower: fixtures.reduce((sum, f) => sum + (f.enabled && f.model ? f.model.wattage : 0), 0),
      models: fixtures.map(f => ({
        model: f.model?.name || 'Unknown',
        wattage: f.model?.wattage || 0,
        ppf: f.model?.ppf || 0,
        position: `(${f.x.toFixed(1)}, ${f.y.toFixed(1)})`,
        enabled: f.enabled
      }))
    },
    metrics: {
      averagePPFD: calculations.averagePPFD,
      uniformity: calculations.uniformity,
      minPPFD: calculations.minPPFD,
      maxPPFD: calculations.maxPPFD,
      dli: calculations.dli,
      powerDensity: calculatePowerDensity(fixtures, room.width * room.length),
      efficacy: calculateEfficacy(fixtures)
    }
  };

  try {
    // Generate HTML for PDF
    const html = generatePDFHTML(reportData);
    
    // Open print dialog
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    if (printWindow) {
      printWindow.document.write(html);
      printWindow.document.close();
      
      // Wait for content to load before printing
      printWindow.onload = () => {
        printWindow.focus();
        printWindow.print();
      };
    } else {
      // Fallback: Create a temporary iframe
      const iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      document.body.appendChild(iframe);
      
      const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
      if (iframeDoc) {
        iframeDoc.write(html);
        iframeDoc.close();
        
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
        
        // Remove iframe after printing
        setTimeout(() => {
          document.body.removeChild(iframe);
        }, 1000);
      }
    }
  } catch (error) {
    console.error('PDF Export Error:', error);
    throw new Error('Failed to generate PDF. Please check your popup blocker settings.');
  }
}

export function exportToExcel(state: DesignerState) {
  const { room, objects, calculations } = state;
  const fixtures = objects.filter((obj): obj is Fixture => obj.type === 'fixture');
  
  // Create CSV content
  const csv = [
    ['Vibelux Lighting Design Report'],
    ['Generated', new Date().toISOString()],
    [],
    ['Room Information'],
    ['Width (ft)', room.width],
    ['Length (ft)', room.length],
    ['Height (ft)', room.height],
    ['Area (ft²)', room.width * room.length],
    [],
    ['Performance Metrics'],
    ['Average PPFD', calculations.averagePPFD],
    ['Uniformity', calculations.uniformity],
    ['Min PPFD', calculations.minPPFD],
    ['Max PPFD', calculations.maxPPFD],
    ['DLI', calculations.dli],
    [],
    ['Fixture Schedule'],
    ['#', 'Model', 'Wattage', 'PPF', 'X Position', 'Y Position', 'Enabled'],
    ...fixtures.map((f, i) => [
      i + 1,
      f.model?.name || 'Unknown',
      f.model?.wattage || 0,
      f.model?.ppf || 0,
      f.x.toFixed(1),
      f.y.toFixed(1),
      f.enabled ? 'Yes' : 'No'
    ])
  ];
  
  // Convert to CSV string
  const csvContent = csv.map(row => row.join(',')).join('\n');
  
  // Download
  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `vibelux-design-${Date.now()}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function exportToCAD(state: DesignerState) {
  const { room, objects } = state;
  
  // Generate DXF content
  const dxf = generateDXF(room, objects);
  
  // Download
  const blob = new Blob([dxf], { type: 'application/dxf' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `vibelux-design-${Date.now()}.dxf`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function generatePDFHTML(data: any): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Vibelux Lighting Design Report</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700&display=swap');
          
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
            max-width: 800px;
            margin: 0 auto;
            padding: 40px;
          }
          
          .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 40px;
            padding-bottom: 20px;
            border-bottom: 2px solid #f0f0f0;
          }
          
          .logo {
            display: flex;
            align-items: center;
            gap: 12px;
          }
          
          .logo-icon {
            width: 48px;
            height: 48px;
            background: linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%);
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: bold;
            font-size: 24px;
          }
          
          .logo-text {
            font-size: 28px;
            font-weight: 700;
            background: linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
          }
          
          .metrics-section {
            background: linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%);
            color: white;
            border-radius: 16px;
            padding: 32px;
            margin-bottom: 40px;
          }
          
          .metrics-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 24px;
          }
          
          .metric {
            text-align: center;
          }
          
          .metric-value {
            font-size: 32px;
            font-weight: 700;
            margin-bottom: 4px;
          }
          
          .metric-label {
            font-size: 14px;
            opacity: 0.9;
          }
          
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
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
            padding: 12px;
            border-bottom: 1px solid #f0f0f0;
          }
          
          @media print {
            body {
              print-color-adjust: exact;
              -webkit-print-color-adjust: exact;
            }
          }
        </style>
      </head>
      <body>
        <div class="page">
          <div class="header">
            <div class="logo">
              <div class="logo-icon">V</div>
              <div class="logo-text">Vibelux</div>
            </div>
            <div>${data.project.date}</div>
          </div>
          
          <h1 style="text-align: center; margin-bottom: 40px;">Professional Lighting Design Report</h1>
          
          <div class="metrics-section">
            <h2 style="font-size: 20px; margin-bottom: 20px;">Performance Metrics</h2>
            <div class="metrics-grid">
              <div class="metric">
                <div class="metric-value">${data.metrics.averagePPFD.toFixed(0)}</div>
                <div class="metric-label">Avg PPFD (μmol/m²/s)</div>
              </div>
              <div class="metric">
                <div class="metric-value">${(data.metrics.uniformity * 100).toFixed(0)}%</div>
                <div class="metric-label">Uniformity</div>
              </div>
              <div class="metric">
                <div class="metric-value">${data.metrics.dli.toFixed(1)}</div>
                <div class="metric-label">DLI</div>
              </div>
              <div class="metric">
                <div class="metric-value">${data.fixtures.totalPower}</div>
                <div class="metric-label">Total Watts</div>
              </div>
              <div class="metric">
                <div class="metric-value">${data.metrics.powerDensity.toFixed(1)}</div>
                <div class="metric-label">W/ft²</div>
              </div>
              <div class="metric">
                <div class="metric-value">${data.metrics.efficacy.toFixed(2)}</div>
                <div class="metric-label">PPE (μmol/J)</div>
              </div>
            </div>
          </div>
          
          <h2 style="margin-bottom: 16px;">Room Information</h2>
          <table>
            <tr>
              <td><strong>Dimensions</strong></td>
              <td>${data.room.dimensions}</td>
            </tr>
            <tr>
              <td><strong>Area</strong></td>
              <td>${data.room.area} ft²</td>
            </tr>
            <tr>
              <td><strong>Working Height</strong></td>
              <td>${data.room.workingHeight} ft</td>
            </tr>
          </table>
          
          <h2 style="margin-top: 40px; margin-bottom: 16px;">Fixture Schedule (${data.fixtures.count} Fixtures)</h2>
          <table>
            <thead>
              <tr>
                <th>Model</th>
                <th>Wattage</th>
                <th>PPF</th>
                <th>Position</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${data.fixtures.models.map((f: any) => `
                <tr>
                  <td>${f.model}</td>
                  <td>${f.wattage}W</td>
                  <td>${f.ppf} μmol/s</td>
                  <td>${f.position}</td>
                  <td>${f.enabled ? '✅ Active' : '❌ Disabled'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          
          <div style="margin-top: 60px; padding-top: 20px; border-top: 2px solid #f0f0f0; text-align: center; color: #666;">
            <p>Generated by <strong style="color: #8b5cf6;">Vibelux</strong> Professional Lighting Design Platform</p>
          </div>
        </div>
        
        <script>
          window.print();
          setTimeout(() => window.close(), 1000);
        </script>
      </body>
    </html>
  `;
}

function generateDXF(room: any, objects: any[]): string {
  // Simple DXF generator
  const dxf = [
    '0',
    'SECTION',
    '2',
    'ENTITIES',
    
    // Room boundary
    '0',
    'POLYLINE',
    '8',
    '0',
    '66',
    '1',
    '70',
    '1',
    '0',
    'VERTEX',
    '8',
    '0',
    '10',
    '0.0',
    '20',
    '0.0',
    '0',
    'VERTEX',
    '8',
    '0',
    '10',
    room.width.toString(),
    '20',
    '0.0',
    '0',
    'VERTEX',
    '8',
    '0',
    '10',
    room.width.toString(),
    '20',
    room.length.toString(),
    '0',
    'VERTEX',
    '8',
    '0',
    '10',
    '0.0',
    '20',
    room.length.toString(),
    '0',
    'SEQEND',
    
    // Fixtures
    ...objects.flatMap(obj => {
      if (obj.type === 'fixture') {
        return [
          '0',
          'CIRCLE',
          '8',
          'FIXTURES',
          '10',
          obj.x.toString(),
          '20',
          obj.y.toString(),
          '40',
          '1.0'
        ];
      }
      return [];
    }),
    
    '0',
    'ENDSEC',
    '0',
    'EOF'
  ];
  
  return dxf.join('\n');
}

export async function exportToIES(state: DesignerState, format: 'ies' | 'ldt' = 'ies') {
  const { objects } = state;
  const fixtures = objects.filter((obj): obj is Fixture => obj.type === 'fixture' && obj.enabled);
  
  if (fixtures.length === 0) {
    throw new Error('No fixtures to export');
  }
  
  const iesExporter = new IESExporter();
  const ldtExporter = new LDTExporter();
  
  // Group fixtures by model
  const fixturesByModel = fixtures.reduce((acc, fixture) => {
    const key = `${fixture.model?.manufacturer || 'Unknown'}_${fixture.model?.name || 'Unknown'}`;
    if (!acc[key]) {
      acc[key] = {
        model: fixture.model,
        count: 0
      };
    }
    acc[key].count++;
    return acc;
  }, {} as Record<string, { model: any; count: number }>);
  
  // Export each unique fixture model
  for (const [key, data] of Object.entries(fixturesByModel)) {
    if (!data.model) continue;
    
    const fixtureData = {
      manufacturer: data.model.manufacturer || 'Unknown',
      model: data.model.name || 'Unknown',
      wattage: data.model.wattage || 600,
      ppf: data.model.ppf || 1000,
      efficacy: data.model.efficacy || (data.model.ppf / data.model.wattage),
      beamAngle: data.model.beamAngle || 120
    };
    
    const iesData = iesExporter.convertFixtureToIES(fixtureData);
    
    // Generate filename
    const safeModel = fixtureData.model.replace(/[^a-zA-Z0-9-_]/g, '_');
    const filename = `${fixtureData.manufacturer}_${safeModel}`;
    
    if (format === 'ies') {
      const iesContent = iesExporter.generateIES(iesData);
      iesExporter.downloadIES(iesContent, filename);
    } else {
      const ldtContent = ldtExporter.generateLDT(iesData);
      ldtExporter.downloadLDT(ldtContent, filename);
    }
    
    // Small delay between downloads
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  return Object.keys(fixturesByModel).length;
}

export async function exportPhotometricBatch(fixtures: any[], format: 'ies' | 'ldt' = 'ies') {
  const iesExporter = new IESExporter();
  const ldtExporter = new LDTExporter();
  
  let exportedCount = 0;
  
  for (const fixture of fixtures) {
    try {
      const iesData = iesExporter.convertFixtureToIES({
        manufacturer: fixture.manufacturer || fixture.brand,
        model: fixture.model,
        wattage: fixture.wattage,
        ppf: fixture.ppf,
        efficacy: fixture.efficacy,
        beamAngle: fixture.beamAngle
      });
      
      const safeModel = fixture.model.replace(/[^a-zA-Z0-9-_]/g, '_');
      const filename = `${fixture.manufacturer || fixture.brand}_${safeModel}`;
      
      if (format === 'ies') {
        const iesContent = iesExporter.generateIES(iesData);
        iesExporter.downloadIES(iesContent, filename);
      } else {
        const ldtContent = ldtExporter.generateLDT(iesData);
        ldtExporter.downloadLDT(ldtContent, filename);
      }
      
      exportedCount++;
      
      // Delay between downloads
      await new Promise(resolve => setTimeout(resolve, 100));
    } catch (error) {
      console.error(`Failed to export ${fixture.model}:`, error);
    }
  }
  
  return exportedCount;
}