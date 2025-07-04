interface XeroConfig {
  tenantId: string
  accessToken: string
  refreshToken: string
}

interface XeroContact {
  contactID?: string
  name: string
  emailAddress?: string
  contactStatus?: 'ACTIVE' | 'ARCHIVED'
}

interface XeroItem {
  itemID?: string
  code: string
  name: string
  unitAmount?: number
  isSold?: boolean
  isPurchased?: boolean
}

interface XeroInvoice {
  invoiceID?: string
  contactID: string
  lineItems: {
    itemCode?: string
    description: string
    quantity: number
    unitAmount: number
    accountCode?: string
  }[]
  dueDate?: Date
  reference?: string
  type: 'ACCREC' | 'ACCPAY'
  status?: 'DRAFT' | 'SUBMITTED' | 'AUTHORISED'
}

interface XeroBankTransaction {
  bankTransactionID?: string
  contactID?: string
  type: 'SPEND' | 'RECEIVE'
  bankAccountID: string
  lineItems: {
    description: string
    unitAmount: number
    accountCode: string
    taxType?: string
  }[]
  date: Date
  reference?: string
}

export class XeroIntegration {
  private config: XeroConfig
  private baseUrl = 'https://api.xero.com/api.xro/2.0'

  constructor(config: XeroConfig) {
    this.config = config
  }

  private async makeRequest(endpoint: string, options: RequestInit = {}) {
    const url = `${this.baseUrl}/${endpoint}`
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.config.accessToken}`,
        'Xero-tenant-id': this.config.tenantId,
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        ...options.headers
      }
    })

    if (response.status === 401) {
      // Token expired, attempt refresh
      await this.refreshAccessToken()
      // Retry request with new token
      return this.makeRequest(endpoint, options)
    }

    if (!response.ok) {
      throw new Error(`Xero API error: ${response.statusText}`)
    }

    return response.json()
  }

  private async refreshAccessToken() {
    const response = await fetch('https://identity.xero.com/connect/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${Buffer.from(`${process.env.XERO_CLIENT_ID}:${process.env.XERO_CLIENT_SECRET}`).toString('base64')}`
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: this.config.refreshToken
      })
    })

    if (!response.ok) {
      throw new Error('Failed to refresh Xero token')
    }

    const tokens = await response.json()
    this.config.accessToken = tokens.access_token
    this.config.refreshToken = tokens.refresh_token
    
    // Save updated tokens to database
    if (process.env.NODE_ENV !== 'test') {
      try {
        const { prisma } = await import('@/lib/prisma')
        await prisma.accountingIntegration.updateMany({
          where: {
            provider: 'xero',
            tenantId: this.config.tenantId
          },
          data: {
            accessToken: tokens.access_token,
            refreshToken: tokens.refresh_token,
            tokenExpiresAt: new Date(Date.now() + tokens.expires_in * 1000),
            updatedAt: new Date()
          }
        })
      } catch (error) {
        console.error('Failed to save updated Xero tokens:', error)
      }
    }
  }

  // Contact Management
  async getContacts(): Promise<XeroContact[]> {
    const response = await this.makeRequest('Contacts')
    return response.Contacts || []
  }

  async createContact(contactData: {
    name: string
    email?: string
    phone?: string
    address?: string
  }): Promise<XeroContact> {
    const contact = {
      Name: contactData.name,
      EmailAddress: contactData.email,
      Phones: contactData.phone ? [{ PhoneType: 'DEFAULT', PhoneNumber: contactData.phone }] : undefined,
      Addresses: contactData.address ? [{ AddressType: 'STREET', AddressLine1: contactData.address }] : undefined
    }

    const response = await this.makeRequest('Contacts', {
      method: 'POST',
      body: JSON.stringify({ Contacts: [contact] })
    })

    return response.Contacts[0]
  }

  // Item Management
  async getItems(): Promise<XeroItem[]> {
    const response = await this.makeRequest('Items')
    return response.Items || []
  }

  async createItem(itemData: {
    code: string
    name: string
    unitAmount?: number
    description?: string
    salesAccountCode?: string
  }): Promise<XeroItem> {
    const item = {
      Code: itemData.code,
      Name: itemData.name,
      UnitAmount: itemData.unitAmount,
      Description: itemData.description,
      IsSold: true,
      SalesDetails: itemData.salesAccountCode ? {
        AccountCode: itemData.salesAccountCode
      } : undefined
    }

    const response = await this.makeRequest('Items', {
      method: 'POST',
      body: JSON.stringify({ Items: [item] })
    })

    return response.Items[0]
  }

  // Invoice Management
  async createInvoice(invoiceData: XeroInvoice): Promise<string> {
    const invoice = {
      Type: invoiceData.type,
      Contact: { ContactID: invoiceData.contactID },
      LineItems: invoiceData.lineItems.map(item => ({
        Description: item.description,
        Quantity: item.quantity,
        UnitAmount: item.unitAmount,
        ItemCode: item.itemCode,
        AccountCode: item.accountCode || '200' // Default sales account
      })),
      DueDate: invoiceData.dueDate?.toISOString(),
      Reference: invoiceData.reference,
      Status: invoiceData.status || 'DRAFT'
    }

    const response = await this.makeRequest('Invoices', {
      method: 'POST',
      body: JSON.stringify({ Invoices: [invoice] })
    })

    return response.Invoices[0].InvoiceID
  }

  async getInvoices(startDate?: Date, endDate?: Date) {
    let endpoint = 'Invoices'
    
    if (startDate && endDate) {
      const where = `Date >= DateTime(${startDate.getFullYear()},${startDate.getMonth() + 1},${startDate.getDate()}) AND Date <= DateTime(${endDate.getFullYear()},${endDate.getMonth() + 1},${endDate.getDate()})`
      endpoint += `?where=${encodeURIComponent(where)}`
    }
    
    const response = await this.makeRequest(endpoint)
    return response.Invoices || []
  }

  // Bank Transaction Management (for expenses)
  async createBankTransaction(transactionData: XeroBankTransaction): Promise<string> {
    const transaction = {
      Type: transactionData.type,
      Contact: transactionData.contactID ? { ContactID: transactionData.contactID } : undefined,
      BankAccount: { AccountID: transactionData.bankAccountID },
      LineItems: transactionData.lineItems.map(item => ({
        Description: item.description,
        UnitAmount: item.unitAmount,
        AccountCode: item.accountCode,
        TaxType: item.taxType || 'NONE'
      })),
      Date: transactionData.date.toISOString(),
      Reference: transactionData.reference
    }

    const response = await this.makeRequest('BankTransactions', {
      method: 'POST',
      body: JSON.stringify({ BankTransactions: [transaction] })
    })

    return response.BankTransactions[0].BankTransactionID
  }

  async getBankTransactions(bankAccountID: string, startDate?: Date, endDate?: Date) {
    let endpoint = `BankTransactions?where=BankAccount.AccountID="${bankAccountID}"`
    
    if (startDate && endDate) {
      const dateWhere = ` AND Date >= DateTime(${startDate.getFullYear()},${startDate.getMonth() + 1},${startDate.getDate()}) AND Date <= DateTime(${endDate.getFullYear()},${endDate.getMonth() + 1},${endDate.getDate()})`
      endpoint += dateWhere
    }
    
    const response = await this.makeRequest(endpoint)
    return response.BankTransactions || []
  }

  // Financial Reports
  async getProfitAndLoss(startDate: Date, endDate: Date) {
    const fromDate = startDate.toISOString().split('T')[0]
    const toDate = endDate.toISOString().split('T')[0]
    
    const response = await this.makeRequest(
      `Reports/ProfitAndLoss?fromDate=${fromDate}&toDate=${toDate}`
    )
    return response.Reports[0]
  }

  async getBalanceSheet(asOfDate: Date) {
    const date = asOfDate.toISOString().split('T')[0]
    
    const response = await this.makeRequest(
      `Reports/BalanceSheet?date=${date}`
    )
    return response.Reports[0]
  }

  async getCashSummary(startDate: Date, endDate: Date) {
    const fromDate = startDate.toISOString().split('T')[0]
    const toDate = endDate.toISOString().split('T')[0]
    
    const response = await this.makeRequest(
      `Reports/CashSummary?fromDate=${fromDate}&toDate=${toDate}`
    )
    return response.Reports[0]
  }

  // Additional methods for due diligence compatibility
  async getCustomers() {
    const contacts = await this.getContacts();
    return contacts.filter(contact => contact.contactStatus === 'ACTIVE').map(contact => ({
      id: contact.contactID,
      name: contact.name,
      email: contact.emailAddress,
      active: contact.contactStatus === 'ACTIVE'
    }));
  }

  async getExpenses(startDate?: Date, endDate?: Date) {
    let endpoint = 'BankTransactions?where=Type=="SPEND"';
    
    if (startDate && endDate) {
      const dateWhere = ` AND Date >= DateTime(${startDate.getFullYear()},${startDate.getMonth() + 1},${startDate.getDate()}) AND Date <= DateTime(${endDate.getFullYear()},${endDate.getMonth() + 1},${endDate.getDate()})`;
      endpoint += dateWhere;
    }
    
    const response = await this.makeRequest(endpoint);
    return (response.BankTransactions || []).map((transaction: any) => ({
      id: transaction.BankTransactionID,
      date: transaction.Date,
      amount: transaction.Total,
      description: transaction.Reference,
      vendor: transaction.Contact?.Name
    }));
  }

  async getCashFlow(startDate: Date, endDate: Date) {
    const cashSummary = await this.getCashSummary(startDate, endDate);
    
    // Parse Xero cash summary structure
    const parseSection = (sectionName: string) => {
      const section = cashSummary.Rows?.find((row: any) => row.Title?.includes(sectionName));
      if (!section) return 0;
      
      const total = section.Cells?.[1]?.Value;
      return parseFloat(total || '0') || 0;
    };

    return {
      operatingCashFlow: parseSection('Operating Activities'),
      investingCashFlow: parseSection('Investing Activities'),
      financingCashFlow: parseSection('Financing Activities'),
      freeCashFlow: parseSection('Operating Activities') - parseSection('Investing Activities'),
      netCashFlow: parseSection('Net Cash Increase')
    };
  }

  async getRevenue(startDate?: Date, endDate?: Date) {
    const invoices = await this.getInvoices(startDate, endDate);
    
    // Group by month
    const monthlyRevenue = invoices.reduce((acc: any, invoice: any) => {
      const month = new Date(invoice.Date).toISOString().substring(0, 7);
      acc[month] = (acc[month] || 0) + invoice.Total;
      return acc;
    }, {});

    return Object.entries(monthlyRevenue).map(([month, amount]) => ({
      date: month + '-01',
      amount: amount as number
    }));
  }

  async getAssets() {
    const response = await this.makeRequest('Assets');
    return (response.Assets || []).map((asset: any) => ({
      id: asset.AssetId,
      name: asset.AssetName,
      assetNumber: asset.AssetNumber,
      purchaseDate: asset.PurchaseDate,
      purchasePrice: asset.PurchasePrice,
      bookValue: asset.BookValue,
      status: asset.AssetStatus
    }));
  }

  // Sync Methods for Vibelux Integration
  async syncHarvestBatch(batch: {
    id: string
    batchNumber: string
    crop: string
    variety: string
    actualYield: number
    revenue: number
    contactID?: string
  }) {
    try {
      // Create or get contact
      let contactID = batch.contactID
      if (!contactID) {
        const contact = await this.createContact({
          name: `Harvest Customer - ${batch.batchNumber}`,
          email: `harvest+${batch.id}@vibelux.com`
        })
        contactID = contact.contactID!
      }

      // Create or get product item
      const items = await this.getItems()
      let itemCode = items.find(item => 
        item.name.includes(batch.crop) && item.name.includes(batch.variety)
      )?.code

      if (!itemCode) {
        const item = await this.createItem({
          code: `${batch.crop.toUpperCase()}-${batch.variety.toUpperCase()}`,
          name: `${batch.crop} - ${batch.variety}`,
          unitAmount: batch.revenue / batch.actualYield,
          description: `${batch.crop} ${batch.variety} from batch ${batch.batchNumber}`
        })
        itemCode = item.code
      }

      // Create invoice
      const invoiceID = await this.createInvoice({
        type: 'ACCREC',
        contactID,
        lineItems: [{
          itemCode,
          description: `Harvest from batch ${batch.batchNumber}`,
          quantity: batch.actualYield,
          unitAmount: batch.revenue / batch.actualYield
        }],
        reference: `Batch-${batch.batchNumber}`,
        status: 'AUTHORISED'
      })

      return { success: true, invoiceID }
    } catch (error) {
      console.error('Failed to sync harvest batch to Xero:', error)
      return { success: false, error: error.message }
    }
  }

  async syncExpenses(expenses: {
    id: string
    category: string
    amount: number
    description: string
    date: Date
    vendor?: string
    bankAccountID: string
  }[]) {
    const results = []
    
    for (const expense of expenses) {
      try {
        // Get expense account code based on category
        const accountCode = this.getExpenseAccountCode(expense.category)
        
        const transactionID = await this.createBankTransaction({
          type: 'SPEND',
          bankAccountID: expense.bankAccountID,
          lineItems: [{
            description: expense.description,
            unitAmount: expense.amount,
            accountCode
          }],
          date: expense.date,
          reference: `Vibelux-${expense.id}`
        })

        results.push({ id: expense.id, success: true, transactionID })
      } catch (error) {
        results.push({ id: expense.id, success: false, error: error.message })
      }
    }

    return results
  }

  private getExpenseAccountCode(category: string): string {
    // Map expense categories to Xero account codes
    const categoryMap: Record<string, string> = {
      'utilities': '445', // Electricity
      'labor': '477', // Wages and Salaries
      'supplies': '461', // General Expenses
      'equipment': '630', // Equipment Expenses
      'maintenance': '463', // Repairs and Maintenance
      'rent': '469', // Rent
      'insurance': '465', // Insurance
      'fertilizer': '461', // General Expenses
      'seeds': '461', // General Expenses
      'packaging': '461', // General Expenses
      'transport': '449', // Motor Vehicle Expenses
      'marketing': '467', // Advertising
      'default': '461' // General Expenses
    }

    return categoryMap[category.toLowerCase()] || categoryMap.default
  }
}