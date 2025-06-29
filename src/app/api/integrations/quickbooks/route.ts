import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { QuickBooksIntegration } from '@/lib/integrations/quickbooks'

export async function GET(request: NextRequest) {
  const { userId } = await auth()

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')
    const facilityId = searchParams.get('facilityId')

    // Get QuickBooks configuration from database
    const integration = await prisma.financialIntegration.findFirst({
      where: {
        userId,
        facilityId: facilityId || undefined,
        provider: 'QUICKBOOKS',
        active: true
      }
    })

    if (!integration) {
      return NextResponse.json(
        { error: 'QuickBooks integration not configured' },
        { status: 404 }
      )
    }

    const qb = new QuickBooksIntegration({
      companyId: integration.config.companyId,
      accessToken: integration.accessToken,
      refreshToken: integration.refreshToken,
      sandbox: integration.config.sandbox || false
    })

    switch (action) {
      case 'customers':
        const customers = await qb.getCustomers()
        return NextResponse.json(customers)

      case 'items':
        const items = await qb.getItems()
        return NextResponse.json(items)

      case 'invoices':
        const startDate = searchParams.get('startDate')
        const endDate = searchParams.get('endDate')
        const invoices = await qb.getInvoices(
          startDate ? new Date(startDate) : undefined,
          endDate ? new Date(endDate) : undefined
        )
        return NextResponse.json(invoices)

      case 'expenses':
        const expenseStartDate = searchParams.get('startDate')
        const expenseEndDate = searchParams.get('endDate')
        const expenses = await qb.getExpenses(
          expenseStartDate ? new Date(expenseStartDate) : undefined,
          expenseEndDate ? new Date(expenseEndDate) : undefined
        )
        return NextResponse.json(expenses)

      case 'profit-loss':
        const plStartDate = searchParams.get('startDate')
        const plEndDate = searchParams.get('endDate')
        if (!plStartDate || !plEndDate) {
          return NextResponse.json(
            { error: 'Start date and end date required for P&L report' },
            { status: 400 }
          )
        }
        const profitLoss = await qb.getProfitAndLoss(
          new Date(plStartDate),
          new Date(plEndDate)
        )
        return NextResponse.json(profitLoss)

      case 'balance-sheet':
        const asOfDate = searchParams.get('asOfDate')
        if (!asOfDate) {
          return NextResponse.json(
            { error: 'As of date required for balance sheet' },
            { status: 400 }
          )
        }
        const balanceSheet = await qb.getBalanceSheet(new Date(asOfDate))
        return NextResponse.json(balanceSheet)

      default:
        return NextResponse.json(
          { error: 'Invalid action specified' },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('QuickBooks API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch data from QuickBooks' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  const { userId } = await auth()

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { action, facilityId, data } = body

    // Get QuickBooks configuration
    const integration = await prisma.financialIntegration.findFirst({
      where: {
        userId,
        facilityId: facilityId || undefined,
        provider: 'QUICKBOOKS',
        active: true
      }
    })

    if (!integration) {
      return NextResponse.json(
        { error: 'QuickBooks integration not configured' },
        { status: 404 }
      )
    }

    const qb = new QuickBooksIntegration({
      companyId: integration.config.companyId,
      accessToken: integration.accessToken,
      refreshToken: integration.refreshToken,
      sandbox: integration.config.sandbox || false
    })

    switch (action) {
      case 'sync-harvest-batch':
        const batchResult = await qb.syncHarvestBatch(data)
        return NextResponse.json(batchResult)

      case 'sync-expenses':
        const expenseResults = await qb.syncExpenses(data)
        return NextResponse.json(expenseResults)

      case 'create-customer':
        const customer = await qb.createCustomer(data)
        return NextResponse.json(customer)

      case 'create-item':
        const item = await qb.createItem(data)
        return NextResponse.json(item)

      case 'create-invoice':
        const invoiceId = await qb.createInvoice(data)
        return NextResponse.json({ invoiceId })

      case 'create-expense':
        const expenseId = await qb.createExpense(data)
        return NextResponse.json({ expenseId })

      default:
        return NextResponse.json(
          { error: 'Invalid action specified' },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('QuickBooks operation error:', error)
    return NextResponse.json(
      { error: 'Failed to perform QuickBooks operation' },
      { status: 500 }
    )
  }
}

// Configuration endpoint
export async function PUT(request: NextRequest) {
  const { userId } = await auth()

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const {
      facilityId,
      companyId,
      accessToken,
      refreshToken,
      sandbox = false
    } = body

    // Upsert QuickBooks integration configuration
    const integration = await prisma.financialIntegration.upsert({
      where: {
        userId_facilityId_provider: {
          userId,
          facilityId: facilityId || '',
          provider: 'QUICKBOOKS'
        }
      },
      update: {
        accessToken,
        refreshToken,
        config: {
          companyId,
          sandbox
        },
        active: true,
        lastSyncAt: new Date()
      },
      create: {
        userId,
        facilityId: facilityId || '',
        provider: 'QUICKBOOKS',
        accessToken,
        refreshToken,
        config: {
          companyId,
          sandbox
        },
        active: true
      }
    })

    return NextResponse.json({ success: true, integrationId: integration.id })
  } catch (error) {
    console.error('QuickBooks configuration error:', error)
    return NextResponse.json(
      { error: 'Failed to configure QuickBooks integration' },
      { status: 500 }
    )
  }
}