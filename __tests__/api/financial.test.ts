import { createMocks } from 'node-mocks-http'
import invoiceHandler from '@/pages/api/financial/invoice/generate'
import verificationHandler from '@/pages/api/financial/verification/verify'
import { TestHelpers } from '@/lib/testing/test-helpers'

// Mock financial automation services
jest.mock('@/lib/financial-automation/invoice-generator')
jest.mock('@/lib/financial-automation/verification-engine')
jest.mock('@/lib/auth/api-auth')

describe('/api/financial/invoice/generate', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    
    // Mock the auth middleware
    const { withCustomerAuth } = require('@/lib/auth/api-auth')
    withCustomerAuth.mockImplementation((handler) => handler)
    
    const { withErrorHandler } = require('@/lib/monitoring/error-handler')
    withErrorHandler.mockImplementation((handler) => handler)
  })

  it('should generate invoice for specific billing period', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: {
        customerId: 'customer-123',
        billingPeriod: {
          start: '2024-01-01',
          end: '2024-01-31',
        },
      },
    })

    const { InvoiceGenerator } = require('@/lib/financial-automation/invoice-generator')
    const mockGenerator = {
      generateInvoiceForPeriod: jest.fn().mockResolvedValue({
        id: 'invoice-123',
        invoiceNumber: 'INV-2024-001',
        totalAmount: 150.00,
        status: 'DRAFT',
      }),
    }
    InvoiceGenerator.mockImplementation(() => mockGenerator)

    await invoiceHandler(req, res, {})

    expect(res._getStatusCode()).toBe(200)
    const data = JSON.parse(res._getData())
    expect(data.success).toBe(true)
    expect(data.invoice.id).toBe('invoice-123')
    expect(data.invoice.totalAmount).toBe(150.00)
  })

  it('should generate all pending invoices for customer', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: {
        customerId: 'customer-123',
      },
    })

    const { InvoiceGenerator } = require('@/lib/financial-automation/invoice-generator')
    const mockGenerator = {
      generateMonthlyInvoices: jest.fn().mockResolvedValue([
        {
          id: 'invoice-123',
          customerId: 'customer-123',
          totalAmount: 150.00,
        },
        {
          id: 'invoice-124',
          customerId: 'customer-456',
          totalAmount: 200.00,
        },
      ]),
    }
    InvoiceGenerator.mockImplementation(() => mockGenerator)

    await invoiceHandler(req, res, {})

    expect(res._getStatusCode()).toBe(200)
    const data = JSON.parse(res._getData())
    expect(data.success).toBe(true)
    expect(data.invoices).toHaveLength(1)
    expect(data.invoices[0].customerId).toBe('customer-123')
  })

  it('should return error for missing customerId', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: {},
    })

    await invoiceHandler(req, res, {})

    expect(res._getStatusCode()).toBe(400)
    const data = JSON.parse(res._getData())
    expect(data.error).toBe('Missing customerId')
  })

  it('should reject non-POST requests', async () => {
    const { req, res } = createMocks({
      method: 'GET',
    })

    await invoiceHandler(req, res, {})

    expect(res._getStatusCode()).toBe(405)
    const data = JSON.parse(res._getData())
    expect(data.error).toBe('Method not allowed')
  })
})

describe('/api/financial/verification/verify', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    
    // Mock the auth middleware
    const { withCustomerAuth } = require('@/lib/auth/api-auth')
    withCustomerAuth.mockImplementation((handler) => handler)
    
    const { withErrorHandler } = require('@/lib/monitoring/error-handler')
    withErrorHandler.mockImplementation((handler) => handler)
  })

  it('should verify financial data successfully', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: {
        customerId: 'customer-123',
        type: 'UTILITY_BILL',
        dataId: 'bill-123',
      },
    })

    const { VerificationEngine } = require('@/lib/financial-automation/verification-engine')
    const mockEngine = {
      verifyFinancialData: jest.fn().mockResolvedValue({
        verified: true,
        confidence: 0.95,
        discrepancies: [],
        verificationData: {
          source: 'UTILITYAPI',
          timestamp: new Date().toISOString(),
        },
      }),
    }
    VerificationEngine.mockImplementation(() => mockEngine)

    await verificationHandler(req, res, {})

    expect(res._getStatusCode()).toBe(200)
    const data = JSON.parse(res._getData())
    expect(data.success).toBe(true)
    expect(data.verified).toBe(true)
    expect(data.confidence).toBe(0.95)
    expect(data.discrepancies).toHaveLength(0)
  })

  it('should handle verification with discrepancies', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: {
        customerId: 'customer-123',
        type: 'INVOICE',
        dataId: 'invoice-123',
      },
    })

    const { VerificationEngine } = require('@/lib/financial-automation/verification-engine')
    const mockEngine = {
      verifyFinancialData: jest.fn().mockResolvedValue({
        verified: false,
        confidence: 0.75,
        discrepancies: [
          {
            field: 'totalAmount',
            expected: 150.00,
            actual: 155.00,
            severity: 'medium',
          },
        ],
        verificationData: {
          source: 'MANUAL_REVIEW',
          timestamp: new Date().toISOString(),
        },
      }),
    }
    VerificationEngine.mockImplementation(() => mockEngine)

    await verificationHandler(req, res, {})

    expect(res._getStatusCode()).toBe(200)
    const data = JSON.parse(res._getData())
    expect(data.success).toBe(true)
    expect(data.verified).toBe(false)
    expect(data.confidence).toBe(0.75)
    expect(data.discrepancies).toHaveLength(1)
    expect(data.discrepancies[0].field).toBe('totalAmount')
  })
})