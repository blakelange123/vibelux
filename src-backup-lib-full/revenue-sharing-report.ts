/**
 * Generate downloadable reports for revenue-sharing calculations
 */

import { CostScenario, RevenueSharingModel, calculateRevenueSharingCost } from './revenue-sharing-pricing';

export function generateCSVReport(
  model: RevenueSharingModel,
  scenario: CostScenario,
  calculation: ReturnType<typeof calculateRevenueSharingCost>
): string {
  const lines: string[] = [];
  
  // Header
  lines.push('VibeLux Revenue Sharing Report');
  lines.push(`Generated: ${new Date().toLocaleDateString()}`);
  lines.push('');
  
  // Facility Info
  lines.push('FACILITY INFORMATION');
  lines.push(`Facility Size,${scenario.facilitySize} sq ft`);
  lines.push(`Monthly Energy Bill,$${scenario.monthlyEnergyBill}`);
  lines.push(`Current Yield,${scenario.currentYield} lbs/sqft/year`);
  lines.push(`Crop Price,$${scenario.cropPrice}/lb`);
  lines.push(`Crop Type,${scenario.cropType || 'Not specified'}`);
  lines.push(`Contract Length,${scenario.contractYears || 1} year(s)`);
  lines.push('');
  
  // Model Info
  lines.push('SELECTED MODEL');
  lines.push(`Model Name,${model.name}`);
  lines.push(`Base Monthly Fee,$${model.basePrice}`);
  lines.push(`Performance Fee,${model.performanceFee}%`);
  lines.push(`Effective Rate,${calculation.effectivePercentage.toFixed(1)}%`);
  lines.push('');
  
  // Financial Summary
  lines.push('FINANCIAL SUMMARY');
  lines.push(`Total Monthly Savings,$${calculation.estimatedMonthlySavings.toFixed(2)}`);
  lines.push(`VibeLux Share,$${calculation.vibeluxShare.toFixed(2)}`);
  lines.push(`Your Net Savings,$${calculation.growerSavings.toFixed(2)}`);
  lines.push(`Total Monthly Cost,$${calculation.totalMonthlyCost.toFixed(2)}`);
  lines.push(`ROI,${calculation.roi.toFixed(1)}x`);
  lines.push('');
  
  // Projections
  lines.push('PROJECTIONS');
  lines.push('Period,Total Savings,VibeLux Cost,Your Net Savings');
  lines.push(`Monthly,$${calculation.estimatedMonthlySavings.toFixed(0)},$${calculation.totalMonthlyCost.toFixed(0)},$${calculation.growerSavings.toFixed(0)}`);
  lines.push(`Annual,$${(calculation.estimatedMonthlySavings * 12).toFixed(0)},$${(calculation.totalMonthlyCost * 12).toFixed(0)},$${(calculation.growerSavings * 12).toFixed(0)}`);
  lines.push(`5-Year,$${(calculation.estimatedMonthlySavings * 60).toFixed(0)},$${(calculation.totalMonthlyCost * 60).toFixed(0)},$${(calculation.growerSavings * 60).toFixed(0)}`);
  lines.push('');
  
  // Applied Discounts
  if (calculation.appliedDiscounts.length > 0) {
    lines.push('APPLIED DISCOUNTS');
    calculation.appliedDiscounts.forEach(discount => {
      lines.push(discount);
    });
  }
  
  return lines.join('\n');
}

export function generatePDFContent(
  model: RevenueSharingModel,
  scenario: CostScenario,
  calculation: ReturnType<typeof calculateRevenueSharingCost>
): string {
  // This returns HTML that can be converted to PDF
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; color: #333; line-height: 1.6; }
        .header { background: #1a1a1a; color: white; padding: 20px; text-align: center; }
        .section { margin: 20px 0; padding: 20px; background: #f5f5f5; border-radius: 8px; }
        .metric { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #ddd; }
        .metric:last-child { border-bottom: none; }
        .highlight { color: #10b981; font-weight: bold; font-size: 1.2em; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th, td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }
        th { background: #f0f0f0; font-weight: bold; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>VibeLux Revenue Sharing Report</h1>
        <p>Generated: ${new Date().toLocaleDateString()}</p>
      </div>
      
      <div class="section">
        <h2>Facility Information</h2>
        <div class="metric">
          <span>Facility Size:</span>
          <span>${scenario.facilitySize.toLocaleString()} sq ft</span>
        </div>
        <div class="metric">
          <span>Monthly Energy Bill:</span>
          <span>$${scenario.monthlyEnergyBill.toLocaleString()}</span>
        </div>
        <div class="metric">
          <span>Current Yield:</span>
          <span>${scenario.currentYield} lbs/sqft/year</span>
        </div>
        <div class="metric">
          <span>Crop Type:</span>
          <span>${scenario.cropType || 'Not specified'}</span>
        </div>
      </div>
      
      <div class="section">
        <h2>Selected Revenue Sharing Model</h2>
        <div class="metric">
          <span>Model:</span>
          <span>${model.name}</span>
        </div>
        <div class="metric">
          <span>Base Fee:</span>
          <span>$${model.basePrice}/month</span>
        </div>
        <div class="metric">
          <span>Effective Performance Fee:</span>
          <span>${calculation.effectivePercentage.toFixed(1)}%</span>
        </div>
      </div>
      
      <div class="section">
        <h2>Financial Summary</h2>
        <div class="metric">
          <span>Total Monthly Savings:</span>
          <span class="highlight">$${calculation.estimatedMonthlySavings.toLocaleString()}</span>
        </div>
        <div class="metric">
          <span>Your Net Savings:</span>
          <span class="highlight">$${calculation.growerSavings.toLocaleString()}</span>
        </div>
        <div class="metric">
          <span>VibeLux Total Cost:</span>
          <span>$${calculation.totalMonthlyCost.toLocaleString()}/month</span>
        </div>
        <div class="metric">
          <span>Return on Investment:</span>
          <span class="highlight">${calculation.roi.toFixed(1)}x</span>
        </div>
      </div>
      
      <div class="section">
        <h2>Long-Term Projections</h2>
        <table>
          <tr>
            <th>Period</th>
            <th>Total Savings</th>
            <th>VibeLux Cost</th>
            <th>Your Net Benefit</th>
          </tr>
          <tr>
            <td>Monthly</td>
            <td>$${calculation.estimatedMonthlySavings.toLocaleString()}</td>
            <td>$${calculation.totalMonthlyCost.toLocaleString()}</td>
            <td>$${calculation.growerSavings.toLocaleString()}</td>
          </tr>
          <tr>
            <td>Annual</td>
            <td>$${(calculation.estimatedMonthlySavings * 12).toLocaleString()}</td>
            <td>$${(calculation.totalMonthlyCost * 12).toLocaleString()}</td>
            <td>$${(calculation.growerSavings * 12).toLocaleString()}</td>
          </tr>
          <tr>
            <td>5-Year</td>
            <td>$${(calculation.estimatedMonthlySavings * 60).toLocaleString()}</td>
            <td>$${(calculation.totalMonthlyCost * 60).toLocaleString()}</td>
            <td>$${(calculation.growerSavings * 60).toLocaleString()}</td>
          </tr>
        </table>
      </div>
      
      ${calculation.appliedDiscounts.length > 0 ? `
        <div class="section">
          <h2>Applied Discounts & Benefits</h2>
          <ul>
            ${calculation.appliedDiscounts.map(d => `<li>${d}</li>`).join('')}
          </ul>
        </div>
      ` : ''}
    </body>
    </html>
  `;
}

export function downloadReport(
  filename: string,
  content: string,
  type: 'csv' | 'pdf' = 'csv'
): void {
  const blob = new Blob([content], { 
    type: type === 'csv' ? 'text/csv' : 'text/html' 
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}.${type}`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function shareReport(
  model: RevenueSharingModel,
  scenario: CostScenario,
  calculation: ReturnType<typeof calculateRevenueSharingCost>
): string {
  // Create a shareable URL with encoded parameters
  const params = new URLSearchParams({
    model: model.id,
    size: scenario.facilitySize.toString(),
    energy: scenario.monthlyEnergyBill.toString(),
    yield: scenario.currentYield.toString(),
    price: scenario.cropPrice.toString(),
    crop: scenario.cropType || '',
    years: (scenario.contractYears || 1).toString()
  });
  
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
  return `${baseUrl}/pricing/revenue-sharing/simulator?${params.toString()}`;
}