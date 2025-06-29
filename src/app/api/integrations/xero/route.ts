import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { XeroIntegration } from '@/lib/integrations/xero'

export async function GET(request: NextRequest) {
  const { userId } = await auth()

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')
    const facilityId = searchParams.get('facilityId')

    // Get Xero configuration from database
    const integration = await prisma.financialIntegration.findFirst({
      where: {
        userId,
        facilityId: facilityId || undefined,
        provider: 'XERO',
        active: true
      }
    })

    if (!integration) {
      return NextResponse.json(
        { error: 'Xero integration not configured' },
        { status: 404 }
      )
    }

    const xero = new XeroIntegration({
      tenantId: integration.config.tenantId,
      accessToken: integration.accessToken,
      refreshToken: integration.refreshToken
    })

    switch (action) {
      case 'contacts':
        const contacts = await xero.getContacts()
        return NextResponse.json(contacts)

      case 'items':
        const items = await xero.getItems()
        return NextResponse.json(items)

      case 'invoices':
        const startDate = searchParams.get('startDate')
        const endDate = searchParams.get('endDate')
        const invoices = await xero.getInvoices(
          startDate ? new Date(startDate) : undefined,
          endDate ? new Date(endDate) : undefined
        )
        return NextResponse.json(invoices)

      case 'bank-transactions':
        const bankAccountID = searchParams.get('bankAccountID')
        if (!bankAccountID) {
          return NextResponse.json(
            { error: 'Bank account ID required' },
            { status: 400 }
          )
        }
        const txStartDate = searchParams.get('startDate')
        const txEndDate = searchParams.get('endDate')
        const transactions = await xero.getBankTransactions(
          bankAccountID,
          txStartDate ? new Date(txStartDate) : undefined,
          txEndDate ? new Date(txEndDate) : undefined
        )
        return NextResponse.json(transactions)

      case 'profit-loss':
        const plStartDate = searchParams.get('startDate')
        const plEndDate = searchParams.get('endDate')
        if (!plStartDate || !plEndDate) {
          return NextResponse.json(
            { error: 'Start date and end date required for P&L report' },
            { status: 400 }
          )
        }
        const profitLoss = await xero.getProfitAndLoss(
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
        const balanceSheet = await xero.getBalanceSheet(new Date(asOfDate))
        return NextResponse.json(balanceSheet)

      case 'cash-summary':
        const csStartDate = searchParams.get('startDate')
        const csEndDate = searchParams.get('endDate')
        if (!csStartDate || !csEndDate) {
          return NextResponse.json(
            { error: 'Start date and end date required for cash summary' },
            { status: 400 }
          )
        }
        const cashSummary = await xero.getCashSummary(
          new Date(csStartDate),
          new Date(csEndDate)
        )
        return NextResponse.json(cashSummary)

      default:
        return NextResponse.json(
          { error: 'Invalid action specified' },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('Xero API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch data from Xero' },
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

    // Get Xero configuration
    const integration = await prisma.financialIntegration.findFirst({
      where: {
        userId,
        facilityId: facilityId || undefined,
        provider: 'XERO',
        active: true
      }
    })

    if (!integration) {
      return NextResponse.json(
        { error: 'Xero integration not configured' },
        { status: 404 }
      )
    }

    const xero = new XeroIntegration({
      tenantId: integration.config.tenantId,
      accessToken: integration.accessToken,
      refreshToken: integration.refreshToken
    })

    switch (action) {
      case 'sync-harvest-batch':
        const batchResult = await xero.syncHarvestBatch(data)
        return NextResponse.json(batchResult)

      case 'sync-expenses':
        const expenseResults = await xero.syncExpenses(data)
        return NextResponse.json(expenseResults)

      case 'create-contact':
        const contact = await xero.createContact(data)
        return NextResponse.json(contact)

      case 'create-item':
        const item = await xero.createItem(data)
        return NextResponse.json(item)

      case 'create-invoice':
        const invoiceID = await xero.createInvoice(data)
        return NextResponse.json({ invoiceID })

      case 'create-bank-transaction':
        const transactionID = await xero.createBankTransaction(data)
        return NextResponse.json({ transactionID })

      default:
        return NextResponse.json(
          { error: 'Invalid action specified' },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('Xero operation error:', error)
    return NextResponse.json(
      { error: 'Failed to perform Xero operation' },
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
      tenantId,
      accessToken,
      refreshToken
    } = body

    // Upsert Xero integration configuration
    const integration = await prisma.financialIntegration.upsert({
      where: {
        userId_facilityId_provider: {
          userId,
          facilityId: facilityId || '',
          provider: 'XERO'
        }
      },
      update: {
        accessToken,
        refreshToken,
        config: {
          tenantId
        },
        active: true,
        lastSyncAt: new Date()
      },
      create: {
        userId,
        facilityId: facilityId || '',
        provider: 'XERO',
        accessToken,
        refreshToken,
        config: {
          tenantId
        },
        active: true
      }
    })

    return NextResponse.json({ success: true, integrationId: integration.id })
  } catch (error) {
    console.error('Xero configuration error:', error)
    return NextResponse.json(
      { error: 'Failed to configure Xero integration' },
      { status: 500 }
    )
  }
}