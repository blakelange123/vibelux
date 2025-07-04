export function exportToCSV(data: any[], filename: string = 'export.csv') {
  if (!data || data.length === 0) return

  // Get headers from the first object
  const headers = Object.keys(data[0])
  
  // Create CSV content
  const csvContent = [
    headers.join(','),
    ...data.map((row: any) => 
      headers.map((header: string) => {
        const value = row[header]
        // Escape commas and quotes
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`
        }
        return value
      }).join(',')
    )
  ].join('\n')

  // Create blob and download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = filename
  link.click()
  URL.revokeObjectURL(link.href)
}

export function exportToPDF(content: any, filename: string = 'export.pdf') {
  // For a full implementation, you would use a library like jsPDF
  // For now, we'll create a printable HTML version
  const printWindow = window.open('', '_blank')
  if (!printWindow) return

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>${filename}</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 20px;
          color: #333;
        }
        h1 { color: #6B46C1; }
        h2 { color: #4C1D95; margin-top: 20px; }
        table {
          width: 100%;
          border-collapse: collapse;
          margin: 20px 0;
        }
        th, td {
          border: 1px solid #ddd;
          padding: 8px;
          text-align: left;
        }
        th {
          background-color: #f2f2f2;
          font-weight: bold;
        }
        .metric {
          margin: 10px 0;
        }
        .metric-label {
          font-weight: bold;
          color: #666;
        }
        .metric-value {
          font-size: 1.2em;
          color: #333;
        }
        @media print {
          body { margin: 10px; }
        }
      </style>
    </head>
    <body>
      ${content}
    </body>
    </html>
  `

  printWindow.document.write(html)
  printWindow.document.close()
  
  // Trigger print after content loads
  printWindow.onload = () => {
    printWindow.print()
  }
}

export function generateLeasingReportHTML(data: {
  equipment: any
  leaseOptions: any[]
  selectedOption: number | null
  comparison: any
}): string {
  const selectedLease = data.selectedOption !== null ? data.leaseOptions[data.selectedOption] : data.leaseOptions[1]
  
  return `
    <h1>Equipment Leasing Analysis Report</h1>
    
    <h2>Equipment Details</h2>
    <div class="metric">
      <span class="metric-label">Equipment:</span>
      <span class="metric-value">${data.equipment.name}</span>
    </div>
    <div class="metric">
      <span class="metric-label">Cost:</span>
      <span class="metric-value">$${data.equipment.cost.toLocaleString()}</span>
    </div>
    <div class="metric">
      <span class="metric-label">Category:</span>
      <span class="metric-value">${data.equipment.category}</span>
    </div>
    <div class="metric">
      <span class="metric-label">Expected Lifespan:</span>
      <span class="metric-value">${data.equipment.lifespan} years</span>
    </div>
    
    <h2>Lease Options Comparison</h2>
    <table>
      <thead>
        <tr>
          <th>Term</th>
          <th>APR</th>
          <th>Monthly Payment</th>
          <th>Total Cost</th>
          <th>Tax Benefit</th>
          <th>Net Cost</th>
        </tr>
      </thead>
      <tbody>
        ${data.leaseOptions.map((option: any) => `
          <tr ${option.term === selectedLease.term ? 'style="background-color: #f0f0ff;"' : ''}>
            <td>${option.term} months</td>
            <td>${option.rate}%</td>
            <td>$${option.monthlyPayment.toLocaleString('en-US', { maximumFractionDigits: 0 })}</td>
            <td>$${option.totalCost.toLocaleString('en-US', { maximumFractionDigits: 0 })}</td>
            <td>$${option.taxBenefit.toLocaleString('en-US', { maximumFractionDigits: 0 })}</td>
            <td>$${(option.totalCost - option.taxBenefit).toLocaleString('en-US', { maximumFractionDigits: 0 })}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
    
    <h2>Buy vs Lease Analysis</h2>
    <div class="metric">
      <span class="metric-label">Cash Purchase Price:</span>
      <span class="metric-value">$${data.comparison.cashPrice.toLocaleString()}</span>
    </div>
    <div class="metric">
      <span class="metric-label">Selected Lease Total:</span>
      <span class="metric-value">$${data.comparison.leaseTotal.toLocaleString()}</span>
    </div>
    <div class="metric">
      <span class="metric-label">Tax Savings:</span>
      <span class="metric-value" style="color: green;">-$${data.comparison.taxSavings.toLocaleString()}</span>
    </div>
    <div class="metric">
      <span class="metric-label">Net Lease Cost:</span>
      <span class="metric-value">$${data.comparison.netLeaseCost.toLocaleString()}</span>
    </div>
    <div class="metric">
      <span class="metric-label">Cash Flow Preserved:</span>
      <span class="metric-value" style="color: #6B46C1; font-size: 1.5em;">$${data.comparison.cashFlowBenefit.toLocaleString()}</span>
    </div>
    
    <p style="margin-top: 30px; font-size: 0.9em; color: #666;">
      Report generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}
    </p>
  `
}

export function generateForumReportHTML(data: {
  posts: any[]
  category: string
  dateRange?: { start: Date, end: Date }
}): string {
  return `
    <h1>Community Forum Export</h1>
    
    <h2>Export Information</h2>
    <div class="metric">
      <span class="metric-label">Category:</span>
      <span class="metric-value">${data.category}</span>
    </div>
    <div class="metric">
      <span class="metric-label">Total Posts:</span>
      <span class="metric-value">${data.posts.length}</span>
    </div>
    <div class="metric">
      <span class="metric-label">Export Date:</span>
      <span class="metric-value">${new Date().toLocaleDateString()}</span>
    </div>
    
    <h2>Posts</h2>
    ${data.posts.map((post: any) => `
      <div style="margin-bottom: 30px; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
        <h3>${post.title}</h3>
        <p style="color: #666; font-size: 0.9em;">
          By ${post.author.name} (${post.author.role}) • ${new Date(post.createdAt).toLocaleDateString()}
        </p>
        <p style="margin: 15px 0;">${post.content}</p>
        <div style="display: flex; gap: 20px; font-size: 0.9em; color: #666;">
          <span>Category: ${post.category}</span>
          <span>Views: ${post.views}</span>
          <span>Replies: ${post.replies}</span>
          <span>Likes: ${post.likes}</span>
        </div>
        <div style="margin-top: 10px;">
          <span style="font-size: 0.9em; color: #666;">Tags: </span>
          ${post.tags.map((tag: string) => `<span style="background: #f0f0f0; padding: 2px 8px; margin: 0 4px; border-radius: 4px; font-size: 0.85em;">#${tag}</span>`).join('')}
        </div>
      </div>
    `).join('')}
    
    <p style="margin-top: 30px; font-size: 0.9em; color: #666;">
      Report generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}
    </p>
  `
}