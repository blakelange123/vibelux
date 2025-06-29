import { InvoiceGenerator } from '@/lib/financial-automation/invoice-generator'
import { VerificationEngine } from '@/lib/financial-automation/verification-engine'
import { TestDataGenerator } from '@/lib/testing/test-helpers'

// Mock prisma
jest.mock('@/lib/prisma', () => ({
  prisma: {
    customer: {
      findUnique: jest.fn(),
    },
    utilityBillData: {
      findMany: jest.fn(),
    },
    invoice: {
      create: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
    },
    auditLog: {
      create: jest.fn(),
    },
  },
}))

describe('InvoiceGenerator', () => {
  let invoiceGenerator: InvoiceGenerator
  const { prisma } = require('@/lib/prisma')

  beforeEach(() => {
    jest.clearAllMocks()
    invoiceGenerator = new InvoiceGenerator()
  })

  describe('generateInvoiceForPeriod', () => {
    it('should generate invoice with correct calculations', async () => {
      const customerId = 'customer-123'
      const billingPeriod = {
        start: new Date('2024-01-01'),
        end: new Date('2024-01-31'),
      }

      const mockCustomer = {
        id: customerId,
        companyName: 'Test Farm Inc.',
        subscriptionTier: 'BASIC',
        revenueShareRate: 0.20,
      }

      const mockBillData = [
        {
          id: 'bill-1',
          kwhUsed: 1000,
          totalCost: 150.00,
          baselineUsage: 1200,
          startDate: new Date('2024-01-01'),
          endDate: new Date('2024-01-15'),
        },
        {
          id: 'bill-2',
          kwhUsed: 950,
          totalCost: 140.00,
          baselineUsage: 1200,
          startDate: new Date('2024-01-16'),
          endDate: new Date('2024-01-31'),
        },
      ]

      const mockInvoice = {
        id: 'invoice-123',
        invoiceNumber: 'INV-2024-001',
        customerId,
        baselineUsage: 2400,
        actualUsage: 1950,
        energySaved: 450,
        costSavings: 45.00,
        invoiceAmount: 9.00,
        totalAmount: 9.00,
        status: 'DRAFT',
      }

      prisma.customer.findUnique.mockResolvedValue(mockCustomer)
      prisma.utilityBillData.findMany.mockResolvedValue(mockBillData)
      prisma.invoice.create.mockResolvedValue(mockInvoice)

      const result = await invoiceGenerator.generateInvoiceForPeriod(customerId, billingPeriod)

      expect(result).toEqual(mockInvoice)
      expect(prisma.invoice.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          customerId,
          type: 'REVENUE_SHARE',
          baselineUsage: 2400,
          actualUsage: 1950,
          energySaved: 450,
          revenueSharingRate: 0.20,
        }),
      })
    })

    it('should handle zero energy savings', async () => {
      const customerId = 'customer-123'
      const billingPeriod = {
        start: new Date('2024-01-01'),
        end: new Date('2024-01-31'),
      }

      const mockCustomer = {
        id: customerId,
        companyName: 'Test Farm Inc.',
        subscriptionTier: 'BASIC',
        revenueShareRate: 0.20,
      }

      const mockBillData = [
        {
          id: 'bill-1',
          kwhUsed: 1200,
          totalCost: 180.00,
          baselineUsage: 1000,
          startDate: new Date('2024-01-01'),
          endDate: new Date('2024-01-31'),
        },
      ]

      const mockInvoice = {
        id: 'invoice-123',
        invoiceNumber: 'INV-2024-001',
        customerId,
        baselineUsage: 1000,
        actualUsage: 1200,
        energySaved: 0,
        costSavings: 0.00,
        invoiceAmount: 0.00,
        totalAmount: 0.00,
        status: 'DRAFT',
      }

      prisma.customer.findUnique.mockResolvedValue(mockCustomer)
      prisma.utilityBillData.findMany.mockResolvedValue(mockBillData)
      prisma.invoice.create.mockResolvedValue(mockInvoice)

      const result = await invoiceGenerator.generateInvoiceForPeriod(customerId, billingPeriod)

      expect(result.energySaved).toBe(0)
      expect(result.invoiceAmount).toBe(0.00)
    })

    it('should throw error for non-existent customer', async () => {
      const customerId = 'non-existent'
      const billingPeriod = {
        start: new Date('2024-01-01'),
        end: new Date('2024-01-31'),
      }

      prisma.customer.findUnique.mockResolvedValue(null)

      await expect(
        invoiceGenerator.generateInvoiceForPeriod(customerId, billingPeriod)
      ).rejects.toThrow('Customer not found')
    })
  })

  describe('generateMonthlyInvoices', () => {
    it('should generate invoices for all eligible customers', async () => {
      const mockCustomers = [
        { id: 'customer-1', companyName: 'Farm A' },
        { id: 'customer-2', companyName: 'Farm B' },
      ]

      const mockInvoices = [
        { id: 'invoice-1', customerId: 'customer-1' },
        { id: 'invoice-2', customerId: 'customer-2' },
      ]

      prisma.customer.findMany = jest.fn().mockResolvedValue(mockCustomers)
      
      // Mock the generateInvoiceForPeriod method
      jest.spyOn(invoiceGenerator, 'generateInvoiceForPeriod')
        .mockImplementation(async (customerId) => 
          mockInvoices.find(inv => inv.customerId === customerId)
        )

      const result = await invoiceGenerator.generateMonthlyInvoices()

      expect(result).toHaveLength(2)
      expect(invoiceGenerator.generateInvoiceForPeriod).toHaveBeenCalledTimes(2)
    })
  })
})

describe('VerificationEngine', () => {
  let verificationEngine: VerificationEngine
  const { prisma } = require('@/lib/prisma')

  beforeEach(() => {
    jest.clearAllMocks()
    verificationEngine = new VerificationEngine()
  })

  describe('verifyFinancialData', () => {
    it('should verify utility bill data successfully', async () => {
      const dataId = 'bill-123'
      const type = 'UTILITY_BILL'

      const mockBillData = {
        id: dataId,
        customerId: 'customer-123',
        kwhUsed: 1000,
        totalCost: 150.00,
        peakDemandKw: 50,
        source: 'UTILITYAPI',
        rawData: {
          utilityapi_response: {
            bills: [{
              totalCost: 150.00,
              totalUsageKwh: 1000,
              peakDemandKw: 50,
            }]
          }
        }
      }

      prisma.utilityBillData.findUnique = jest.fn().mockResolvedValue(mockBillData)
      prisma.auditLog.create.mockResolvedValue({})

      const result = await verificationEngine.verifyFinancialData(dataId, type)

      expect(result.verified).toBe(true)
      expect(result.confidence).toBeGreaterThan(0.8)
      expect(result.discrepancies).toHaveLength(0)
      expect(result.verificationData.source).toBe('UTILITYAPI')
    })

    it('should detect discrepancies in utility bill data', async () => {
      const dataId = 'bill-123'
      const type = 'UTILITY_BILL'

      const mockBillData = {
        id: dataId,
        customerId: 'customer-123',
        kwhUsed: 1000,
        totalCost: 150.00,
        peakDemandKw: 50,
        source: 'UTILITYAPI',
        rawData: {
          utilityapi_response: {
            bills: [{
              totalCost: 155.00, // Discrepancy
              totalUsageKwh: 1000,
              peakDemandKw: 50,
            }]
          }
        }
      }

      prisma.utilityBillData.findUnique = jest.fn().mockResolvedValue(mockBillData)
      prisma.auditLog.create.mockResolvedValue({})

      const result = await verificationEngine.verifyFinancialData(dataId, type)

      expect(result.verified).toBe(false)
      expect(result.discrepancies).toHaveLength(1)
      expect(result.discrepancies[0].field).toBe('totalCost')
      expect(result.discrepancies[0].expected).toBe(155.00)
      expect(result.discrepancies[0].actual).toBe(150.00)
    })

    it('should verify invoice data', async () => {
      const dataId = 'invoice-123'
      const type = 'INVOICE'

      const mockInvoice = {
        id: dataId,
        customerId: 'customer-123',
        baselineUsage: 1200,
        actualUsage: 1000,
        energySaved: 200,
        costSavings: 30.00,
        revenueSharingRate: 0.20,
        invoiceAmount: 6.00,
        totalAmount: 6.00,
      }

      const mockBillData = [
        {
          kwhUsed: 500,
          baselineUsage: 600,
          totalCost: 75.00,
        },
        {
          kwhUsed: 500,
          baselineUsage: 600,
          totalCost: 75.00,
        },
      ]

      prisma.invoice.findUnique = jest.fn().mockResolvedValue(mockInvoice)
      prisma.utilityBillData.findMany.mockResolvedValue(mockBillData)
      prisma.auditLog.create.mockResolvedValue({})

      const result = await verificationEngine.verifyFinancialData(dataId, type)

      expect(result.verified).toBe(true)
      expect(result.confidence).toBeGreaterThan(0.9)
    })

    it('should throw error for unsupported data type', async () => {
      const dataId = 'data-123'
      const type = 'UNKNOWN_TYPE'

      await expect(
        verificationEngine.verifyFinancialData(dataId, type)
      ).rejects.toThrow('Unsupported verification type: UNKNOWN_TYPE')
    })
  })
})