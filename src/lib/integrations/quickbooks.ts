import { NextResponse } from 'next/server'

interface QuickBooksConfig {
  companyId: string
  accessToken: string
  refreshToken: string
  sandbox?: boolean
}

interface QuickBooksCustomer {
  id: string
  name: string
  email?: string
  balance?: number
}

interface QuickBooksItem {
  id: string
  name: string
  type: 'Service' | 'Inventory' | 'NonInventory'
  unitPrice?: number
  quantityOnHand?: number
}

interface QuickBooksInvoice {
  id?: string
  customerId: string
  lineItems: {
    itemId: string
    quantity: number
    rate: number
    description?: string
  }[]
  dueDate?: Date
  memo?: string
}

interface QuickBooksExpense {
  id?: string
  vendorId?: string
  accountId: string
  amount: number
  description: string
  date: Date
  category?: string
}

export class QuickBooksIntegration {
  private config: QuickBooksConfig
  private baseUrl: string

  constructor(config: QuickBooksConfig) {
    this.config = config
    this.baseUrl = config.sandbox 
      ? 'https://sandbox-quickbooks.api.intuit.com'
      : 'https://quickbooks.api.intuit.com'
  }

  private async makeRequest(endpoint: string, options: RequestInit = {}) {
    const url = `${this.baseUrl}/v3/company/${this.config.companyId}/${endpoint}`
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.config.accessToken}`,
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
      throw new Error(`QuickBooks API error: ${response.statusText}`)
    }

    return response.json()
  }

  private async refreshAccessToken() {
    const response = await fetch('https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${Buffer.from(`${process.env.QB_CLIENT_ID}:${process.env.QB_CLIENT_SECRET}`).toString('base64')}`
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: this.config.refreshToken
      })
    })

    if (!response.ok) {
      throw new Error('Failed to refresh QuickBooks token')
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
            provider: 'quickbooks',
            companyId: this.config.companyId
          },
          data: {
            accessToken: tokens.access_token,
            refreshToken: tokens.refresh_token,
            tokenExpiresAt: new Date(Date.now() + tokens.expires_in * 1000),
            updatedAt: new Date()
          }
        })
      } catch (error) {
        console.error('Failed to save updated QuickBooks tokens:', error)
      }
    }
  }

  // Customer Management
  async getCustomers(): Promise<QuickBooksCustomer[]> {
    const response = await this.makeRequest("query?query=SELECT * FROM Customer")
    return response.QueryResponse?.Customer || []
  }

  async createCustomer(customerData: {
    name: string
    email?: string
    phone?: string
    address?: string
  }): Promise<QuickBooksCustomer> {
    const customer = {
      Name: customerData.name,
      CompanyName: customerData.name,
      PrimaryEmailAddr: customerData.email ? { Address: customerData.email } : undefined,
      PrimaryPhone: customerData.phone ? { FreeFormNumber: customerData.phone } : undefined,
      BillAddr: customerData.address ? { Line1: customerData.address } : undefined
    }

    const response = await this.makeRequest('customer', {
      method: 'POST',
      body: JSON.stringify(customer)
    })

    return response.QueryResponse.Customer[0]
  }

  // Item Management
  async getItems(): Promise<QuickBooksItem[]> {
    const response = await this.makeRequest("query?query=SELECT * FROM Item")
    return response.QueryResponse?.Item || []
  }

  async createItem(itemData: {
    name: string
    type: 'Service' | 'Inventory' | 'NonInventory'
    unitPrice?: number
    description?: string
    incomeAccountId?: string
  }): Promise<QuickBooksItem> {
    const item = {
      Name: itemData.name,
      Type: itemData.type,
      UnitPrice: itemData.unitPrice,
      Description: itemData.description,
      IncomeAccountRef: itemData.incomeAccountId ? { value: itemData.incomeAccountId } : undefined
    }

    const response = await this.makeRequest('item', {
      method: 'POST',
      body: JSON.stringify(item)
    })

    return response.QueryResponse.Item[0]
  }

  // Invoice Management
  async createInvoice(invoiceData: QuickBooksInvoice): Promise<string> {
    const invoice = {
      CustomerRef: { value: invoiceData.customerId },
      Line: invoiceData.lineItems.map(item => ({
        Amount: item.quantity * item.rate,
        DetailType: "SalesItemLineDetail",
        SalesItemLineDetail: {
          ItemRef: { value: item.itemId },
          Qty: item.quantity,
          UnitPrice: item.rate
        },
        Description: item.description
      })),
      DueDate: invoiceData.dueDate?.toISOString().split('T')[0],
      PrivateNote: invoiceData.memo
    }

    const response = await this.makeRequest('invoice', {
      method: 'POST',
      body: JSON.stringify(invoice)
    })

    return response.QueryResponse.Invoice[0].Id
  }

  async getInvoices(startDate?: Date, endDate?: Date) {
    let query = "SELECT * FROM Invoice"
    
    if (startDate && endDate) {
      query += ` WHERE TxnDate >= '${startDate.toISOString().split('T')[0]}' AND TxnDate <= '${endDate.toISOString().split('T')[0]}'`
    }
    
    const response = await this.makeRequest(`query?query=${encodeURIComponent(query)}`)
    return response.QueryResponse?.Invoice || []
  }

  // Expense Management
  async createExpense(expenseData: QuickBooksExpense): Promise<string> {
    const expense = {
      AccountRef: { value: expenseData.accountId },
      Amount: expenseData.amount,
      PrivateNote: expenseData.description,
      TxnDate: expenseData.date.toISOString().split('T')[0],
      VendorRef: expenseData.vendorId ? { value: expenseData.vendorId } : undefined,
      Line: [{
        Amount: expenseData.amount,
        DetailType: "AccountBasedExpenseLineDetail",
        AccountBasedExpenseLineDetail: {
          AccountRef: { value: expenseData.accountId }
        },
        Description: expenseData.description
      }]
    }

    const response = await this.makeRequest('purchase', {
      method: 'POST',
      body: JSON.stringify(expense)
    })

    return response.QueryResponse.Purchase[0].Id
  }

  async getExpenses(startDate?: Date, endDate?: Date) {
    let query = "SELECT * FROM Purchase"
    
    if (startDate && endDate) {
      query += ` WHERE TxnDate >= '${startDate.toISOString().split('T')[0]}' AND TxnDate <= '${endDate.toISOString().split('T')[0]}'`
    }
    
    const response = await this.makeRequest(`query?query=${encodeURIComponent(query)}`)
    return response.QueryResponse?.Purchase || []
  }

  // Financial Reports
  async getProfitAndLoss(startDate: Date, endDate: Date) {
    const response = await this.makeRequest(
      `reports/ProfitAndLoss?start_date=${startDate.toISOString().split('T')[0]}&end_date=${endDate.toISOString().split('T')[0]}`
    )
    return response.QueryResponse
  }

  async getBalanceSheet(asOfDate: Date) {
    const response = await this.makeRequest(
      `reports/BalanceSheet?as_of_date=${asOfDate.toISOString().split('T')[0]}`
    )
    return response.QueryResponse
  }

  async getCashFlow(startDate: Date, endDate: Date) {
    const response = await this.makeRequest(
      `reports/CashFlow?start_date=${startDate.toISOString().split('T')[0]}&end_date=${endDate.toISOString().split('T')[0]}`
    )
    return response.QueryResponse
  }

  // Sync Methods for Vibelux Integration
  async syncHarvestBatch(batch: {
    id: string
    batchNumber: string
    crop: string
    variety: string
    actualYield: number
    revenue: number
    customerId?: string
  }) {
    try {
      // Create or get customer
      let customerId = batch.customerId
      if (!customerId) {
        const customer = await this.createCustomer({
          name: `Harvest Customer - ${batch.batchNumber}`,
          email: `harvest+${batch.id}@vibelux.com`
        })
        customerId = customer.id
      }

      // Create or get product item
      const items = await this.getItems()
      let itemId = items.find(item => 
        item.name.includes(batch.crop) && item.name.includes(batch.variety)
      )?.id

      if (!itemId) {
        const item = await this.createItem({
          name: `${batch.crop} - ${batch.variety}`,
          type: 'Inventory',
          unitPrice: batch.revenue / batch.actualYield,
          description: `${batch.crop} ${batch.variety} from batch ${batch.batchNumber}`
        })
        itemId = item.id
      }

      // Create invoice
      const invoiceId = await this.createInvoice({
        customerId,
        lineItems: [{
          itemId,
          quantity: batch.actualYield,
          rate: batch.revenue / batch.actualYield,
          description: `Harvest from batch ${batch.batchNumber}`
        }],
        memo: `Automated invoice for harvest batch ${batch.batchNumber}`
      })

      return { success: true, invoiceId }
    } catch (error) {
      console.error('Failed to sync harvest batch to QuickBooks:', error)
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
  }[]) {
    const results = []
    
    for (const expense of expenses) {
      try {
        // Get or create expense account
        const accounts = await this.makeRequest("query?query=SELECT * FROM Account WHERE AccountType = 'Expense'")
        let accountId = accounts.QueryResponse?.Account?.find((acc: any) => 
          acc.Name.toLowerCase().includes(expense.category.toLowerCase())
        )?.Id
        
        if (!accountId) {
          accountId = '1' // Default expense account
        }

        const expenseId = await this.createExpense({
          accountId,
          amount: expense.amount,
          description: expense.description,
          date: expense.date,
          category: expense.category
        })

        results.push({ id: expense.id, success: true, expenseId })
      } catch (error) {
        results.push({ id: expense.id, success: false, error: error.message })
      }
    }

    return results
  }
}