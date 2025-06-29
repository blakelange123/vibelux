// Revenue Sharing Invoice Generator
// Generates PDF invoices for revenue sharing payments

import { SavingsCalculation } from './revenue-sharing-baseline';

export interface InvoiceData {
  invoiceNumber: string;
  date: Date;
  dueDate: Date;
  
  // Company info
  company: {
    name: string;
    address: string;
    city: string;
    state: string;
    zip: string;
    phone?: string;
    email?: string;
  };
  
  // Customer info
  customer: {
    name: string;
    address: string;
    city: string;
    state: string;
    zip: string;
    contactName?: string;
    contactEmail?: string;
    contactPhone?: string;
  };
  
  // Invoice details
  baselinePeriod: {
    startDate: Date;
    endDate: Date;
  };
  
  savingsPeriod: {
    startDate: Date;
    endDate: Date;
  };
  
  // Line items
  energySavings: {
    kwhSaved: number;
    costPerKwh: number;
    totalSaved: number;
  };
  
  yieldImprovement: {
    unitsIncreased: number;
    valuePerUnit: number;
    totalValue: number;
  };
  
  // Totals
  totalSavings: number;
  revenueSharePercentage: number;
  revenueShareAmount: number;
  
  // Payment info
  paymentTerms: string;
  paymentMethods: string[];
  bankDetails?: {
    bankName: string;
    accountName: string;
    accountNumber: string;
    routingNumber: string;
  };
  
  notes?: string;
}

export class InvoiceGenerator {
  
  generateInvoiceData(
    savingsCalc: SavingsCalculation,
    customerInfo: any,
    invoiceNumber?: string
  ): InvoiceData {
    const now = new Date();
    const dueDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // Net 30
    
    return {
      invoiceNumber: invoiceNumber || `INV-${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${Date.now().toString().slice(-6)}`,
      date: now,
      dueDate: dueDate,
      
      company: {
        name: 'VibeLux Technologies',
        address: '123 Innovation Drive',
        city: 'San Francisco',
        state: 'CA',
        zip: '94105',
        phone: '(555) 123-4567',
        email: 'billing@vibelux.com'
      },
      
      customer: customerInfo,
      
      baselinePeriod: {
        startDate: savingsCalc.period.startDate,
        endDate: savingsCalc.period.endDate
      },
      
      savingsPeriod: {
        startDate: savingsCalc.period.startDate,
        endDate: savingsCalc.period.endDate
      },
      
      energySavings: {
        kwhSaved: savingsCalc.savings.energySavingsKwh,
        costPerKwh: savingsCalc.savings.energyCostSavings / savingsCalc.savings.energySavingsKwh,
        totalSaved: savingsCalc.savings.energyCostSavings
      },
      
      yieldImprovement: {
        unitsIncreased: savingsCalc.savings.yieldImprovement,
        valuePerUnit: savingsCalc.savings.yieldValueImprovement / savingsCalc.savings.yieldImprovement,
        totalValue: savingsCalc.savings.yieldValueImprovement
      },
      
      totalSavings: savingsCalc.savings.totalSavings,
      revenueSharePercentage: savingsCalc.revenueShare.percentage,
      revenueShareAmount: savingsCalc.revenueShare.amount,
      
      paymentTerms: 'Net 30',
      paymentMethods: ['ACH Transfer', 'Check', 'Wire Transfer'],
      
      bankDetails: {
        bankName: 'Chase Bank',
        accountName: 'VibeLux Technologies Inc.',
        accountNumber: '****1234',
        routingNumber: '121000248'
      },
      
      notes: 'Thank you for choosing VibeLux. This invoice represents your share of the verified savings achieved through our optimization platform.'
    };
  }
  
  generateHTML(invoice: InvoiceData): string {
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Invoice ${invoice.invoiceNumber}</title>
    <style>
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 40px;
        }
        .header { 
            display: flex; 
            justify-content: space-between; 
            margin-bottom: 40px;
            border-bottom: 2px solid #8B5CF6;
            padding-bottom: 20px;
        }
        .logo { 
            font-size: 28px; 
            font-weight: bold; 
            color: #8B5CF6;
        }
        .invoice-details { 
            text-align: right;
        }
        .invoice-number {
            font-size: 20px;
            font-weight: bold;
            color: #8B5CF6;
        }
        .addresses {
            display: flex;
            justify-content: space-between;
            margin-bottom: 40px;
        }
        .address-block h3 {
            color: #8B5CF6;
            margin-bottom: 10px;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 30px;
        }
        th {
            background-color: #f5f3ff;
            color: #8B5CF6;
            padding: 12px;
            text-align: left;
            border-bottom: 2px solid #8B5CF6;
        }
        td {
            padding: 12px;
            border-bottom: 1px solid #e0e0e0;
        }
        .total-row {
            font-weight: bold;
            font-size: 18px;
            background-color: #f5f3ff;
        }
        .payment-info {
            background-color: #f9f9f9;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 30px;
        }
        .footer {
            text-align: center;
            color: #666;
            font-size: 14px;
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #e0e0e0;
        }
    </style>
</head>
<body>
    <div class="header">
        <div>
            <div class="logo">VibeLux</div>
            <div style="color: #666; font-size: 14px; margin-top: 5px;">Revenue Sharing Invoice</div>
        </div>
        <div class="invoice-details">
            <div class="invoice-number">${invoice.invoiceNumber}</div>
            <div>Date: ${invoice.date.toLocaleDateString()}</div>
            <div>Due Date: ${invoice.dueDate.toLocaleDateString()}</div>
        </div>
    </div>

    <div class="addresses">
        <div class="address-block">
            <h3>From</h3>
            <div><strong>${invoice.company.name}</strong></div>
            <div>${invoice.company.address}</div>
            <div>${invoice.company.city}, ${invoice.company.state} ${invoice.company.zip}</div>
            <div>${invoice.company.phone}</div>
            <div>${invoice.company.email}</div>
        </div>
        <div class="address-block">
            <h3>Bill To</h3>
            <div><strong>${invoice.customer.name}</strong></div>
            <div>${invoice.customer.address}</div>
            <div>${invoice.customer.city}, ${invoice.customer.state} ${invoice.customer.zip}</div>
            ${invoice.customer.contactName ? `<div>Attn: ${invoice.customer.contactName}</div>` : ''}
            ${invoice.customer.contactEmail ? `<div>${invoice.customer.contactEmail}</div>` : ''}
        </div>
    </div>

    <table>
        <thead>
            <tr>
                <th>Description</th>
                <th style="text-align: right;">Quantity</th>
                <th style="text-align: right;">Rate</th>
                <th style="text-align: right;">Amount</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>
                    <strong>Energy Cost Savings</strong><br>
                    <small>Period: ${invoice.savingsPeriod.startDate.toLocaleDateString()} - ${invoice.savingsPeriod.endDate.toLocaleDateString()}</small>
                </td>
                <td style="text-align: right;">${invoice.energySavings.kwhSaved.toLocaleString()} kWh</td>
                <td style="text-align: right;">$${invoice.energySavings.costPerKwh.toFixed(3)}/kWh</td>
                <td style="text-align: right;">$${invoice.energySavings.totalSaved.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
            </tr>
            <tr>
                <td>
                    <strong>Yield Improvement Value</strong><br>
                    <small>Additional units produced</small>
                </td>
                <td style="text-align: right;">${invoice.yieldImprovement.unitsIncreased.toLocaleString()} units</td>
                <td style="text-align: right;">$${invoice.yieldImprovement.valuePerUnit.toFixed(2)}/unit</td>
                <td style="text-align: right;">$${invoice.yieldImprovement.totalValue.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
            </tr>
            <tr>
                <td colspan="3" style="text-align: right; padding-top: 20px;"><strong>Total Verified Savings</strong></td>
                <td style="text-align: right; padding-top: 20px;"><strong>$${invoice.totalSavings.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</strong></td>
            </tr>
            <tr>
                <td colspan="3" style="text-align: right;"><strong>Revenue Share (${invoice.revenueSharePercentage}%)</strong></td>
                <td style="text-align: right;"><strong>$${invoice.revenueShareAmount.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</strong></td>
            </tr>
            <tr class="total-row">
                <td colspan="3" style="text-align: right;">Total Due</td>
                <td style="text-align: right;">$${invoice.revenueShareAmount.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
            </tr>
        </tbody>
    </table>

    <div class="payment-info">
        <h3 style="color: #8B5CF6; margin-top: 0;">Payment Information</h3>
        <p><strong>Payment Terms:</strong> ${invoice.paymentTerms}</p>
        <p><strong>Payment Methods:</strong> ${invoice.paymentMethods.join(', ')}</p>
        
        ${invoice.bankDetails ? `
        <div style="margin-top: 20px; padding: 15px; background-color: #fff; border-radius: 4px;">
            <strong>Wire/ACH Transfer Details:</strong><br>
            Bank: ${invoice.bankDetails.bankName}<br>
            Account Name: ${invoice.bankDetails.accountName}<br>
            Account Number: ${invoice.bankDetails.accountNumber}<br>
            Routing Number: ${invoice.bankDetails.routingNumber}
        </div>
        ` : ''}
    </div>

    ${invoice.notes ? `
    <div style="background-color: #f5f3ff; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
        <p style="margin: 0;"><em>${invoice.notes}</em></p>
    </div>
    ` : ''}

    <div class="footer">
        <p>Questions? Contact us at billing@vibelux.com or call (555) 123-4567</p>
        <p>© ${new Date().getFullYear()} VibeLux Technologies. All rights reserved.</p>
    </div>
</body>
</html>
    `;
  }
  
  // In a real implementation, this would use a PDF library like jsPDF or puppeteer
  async generatePDF(invoice: InvoiceData): Promise<Blob> {
    const html = this.generateHTML(invoice);
    
    // For now, we'll create an HTML blob that can be printed to PDF
    return new Blob([html], { type: 'text/html' });
  }
  
  // Helper to download the invoice
  async downloadInvoice(invoice: InvoiceData) {
    const blob = await this.generatePDF(invoice);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `VibeLux_Invoice_${invoice.invoiceNumber}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}

export const invoiceGenerator = new InvoiceGenerator();