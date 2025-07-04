import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { createAccountingAdapter, getSupportedProviders, validateProviderConfig } from '@/lib/integrations/accounting-adapter';

// GET /api/integrations/accounting - Get accounting data or list providers
export async function GET(request: NextRequest) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const facilityId = searchParams.get('facilityId');
    const provider = searchParams.get('provider');

    // List supported providers
    if (action === 'providers') {
      const providers = getSupportedProviders().map(p => ({
        name: p.name,
        displayName: p.displayName,
        authType: p.authType,
        capabilities: p.capabilities
      }));
      
      return NextResponse.json({ providers });
    }

    // List user's integrations
    if (action === 'integrations') {
      const integrations = await prisma.financialIntegration.findMany({
        where: {
          userId,
          ...(facilityId && { facilityId }),
          ...(provider && { provider })
        },
        select: {
          id: true,
          provider: true,
          facilityId: true,
          active: true,
          lastSyncAt: true,
          createdAt: true
        }
      });

      return NextResponse.json({ integrations });
    }

    // Get accounting data
    if (!facilityId || !provider) {
      return NextResponse.json(
        { error: 'facilityId and provider required for data retrieval' },
        { status: 400 }
      );
    }

    // Get integration
    const integration = await prisma.financialIntegration.findFirst({
      where: {
        userId,
        facilityId,
        provider,
        active: true
      }
    });

    if (!integration) {
      return NextResponse.json(
        { error: `${provider} integration not found for this facility` },
        { status: 404 }
      );
    }

    const adapter = createAccountingAdapter(integration.provider, {
      provider: integration.provider,
      companyId: integration.config.companyId,
      accessToken: integration.accessToken,
      refreshToken: integration.refreshToken,
      sandbox: integration.config.sandbox || false
    });

    switch (action) {
      case 'customers':
        const customers = await adapter.getCustomers();
        return NextResponse.json({ customers });

      case 'items':
        const items = await adapter.getItems();
        return NextResponse.json({ items });

      case 'invoices':
        const startDate = searchParams.get('startDate');
        const endDate = searchParams.get('endDate');
        const invoices = await adapter.getInvoices(
          startDate ? new Date(startDate) : undefined,
          endDate ? new Date(endDate) : undefined
        );
        return NextResponse.json({ invoices });

      case 'expenses':
        const expenseStartDate = searchParams.get('startDate');
        const expenseEndDate = searchParams.get('endDate');
        const expenses = await adapter.getExpenses(
          expenseStartDate ? new Date(expenseStartDate) : undefined,
          expenseEndDate ? new Date(expenseEndDate) : undefined
        );
        return NextResponse.json({ expenses });

      case 'profit-loss':
        const plStartDate = searchParams.get('startDate');
        const plEndDate = searchParams.get('endDate');
        if (!plStartDate || !plEndDate) {
          return NextResponse.json(
            { error: 'Start date and end date required for P&L report' },
            { status: 400 }
          );
        }
        const profitLoss = await adapter.getProfitAndLoss(
          new Date(plStartDate),
          new Date(plEndDate)
        );
        return NextResponse.json({ profitLoss });

      case 'balance-sheet':
        const asOfDate = searchParams.get('asOfDate');
        if (!asOfDate) {
          return NextResponse.json(
            { error: 'As of date required for balance sheet' },
            { status: 400 }
          );
        }
        const balanceSheet = await adapter.getBalanceSheet(new Date(asOfDate));
        return NextResponse.json({ balanceSheet });

      case 'cash-flow':
        const cfStartDate = searchParams.get('startDate');
        const cfEndDate = searchParams.get('endDate');
        if (!cfStartDate || !cfEndDate) {
          return NextResponse.json(
            { error: 'Start date and end date required for cash flow' },
            { status: 400 }
          );
        }
        const cashFlow = await adapter.getCashFlow(
          new Date(cfStartDate),
          new Date(cfEndDate)
        );
        return NextResponse.json({ cashFlow });

      case 'revenue':
        const revStartDate = searchParams.get('startDate');
        const revEndDate = searchParams.get('endDate');
        const revenue = await adapter.getRevenue(
          revStartDate ? new Date(revStartDate) : undefined,
          revEndDate ? new Date(revEndDate) : undefined
        );
        return NextResponse.json({ revenue });

      case 'assets':
        const assets = await adapter.getAssets();
        return NextResponse.json({ assets });

      case 'capabilities':
        const capabilities = adapter.getProviderInfo();
        return NextResponse.json({ capabilities });

      default:
        return NextResponse.json(
          { error: 'Invalid action specified' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Accounting API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch accounting data' },
      { status: 500 }
    );
  }
}

// POST /api/integrations/accounting - Setup new integration
export async function POST(request: NextRequest) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const {
      provider,
      facilityId,
      companyId,
      accessToken,
      refreshToken,
      apiKey,
      sandbox = false
    } = body;

    // Validate provider
    if (!getSupportedProviders().find(p => p.name === provider)) {
      return NextResponse.json(
        { error: `Unsupported provider: ${provider}` },
        { status: 400 }
      );
    }

    // Validate configuration
    const validation = validateProviderConfig(provider, {
      provider,
      companyId,
      accessToken,
      refreshToken,
      apiKey,
      sandbox
    });

    if (!validation.valid) {
      return NextResponse.json(
        { error: 'Invalid configuration', details: validation.errors },
        { status: 400 }
      );
    }

    // Test the connection
    try {
      const adapter = createAccountingAdapter(provider, {
        provider,
        companyId,
        accessToken,
        refreshToken,
        apiKey,
        sandbox
      });

      // Test by fetching customers (most basic operation)
      await adapter.getCustomers();
    } catch (error) {
      return NextResponse.json(
        { error: 'Failed to connect to accounting provider', details: error.message },
        { status: 400 }
      );
    }

    // Save integration
    const integration = await prisma.financialIntegration.upsert({
      where: {
        userId_facilityId_provider: {
          userId,
          facilityId: facilityId || '',
          provider
        }
      },
      update: {
        accessToken,
        refreshToken,
        config: {
          companyId,
          sandbox,
          ...(apiKey && { apiKey })
        },
        active: true,
        lastSyncAt: new Date()
      },
      create: {
        userId,
        facilityId: facilityId || '',
        provider,
        accessToken,
        refreshToken,
        config: {
          companyId,
          sandbox,
          ...(apiKey && { apiKey })
        },
        active: true
      }
    });

    return NextResponse.json({ 
      success: true, 
      integrationId: integration.id,
      provider: integration.provider
    });
  } catch (error) {
    console.error('Integration setup error:', error);
    return NextResponse.json(
      { error: 'Failed to setup integration' },
      { status: 500 }
    );
  }
}

// DELETE /api/integrations/accounting - Remove integration
export async function DELETE(request: NextRequest) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const integrationId = searchParams.get('integrationId');
    const facilityId = searchParams.get('facilityId');
    const provider = searchParams.get('provider');

    if (!integrationId && (!facilityId || !provider)) {
      return NextResponse.json(
        { error: 'integrationId or (facilityId + provider) required' },
        { status: 400 }
      );
    }

    const whereClause = integrationId 
      ? { id: integrationId, userId }
      : { userId, facilityId, provider };

    await prisma.financialIntegration.updateMany({
      where: whereClause,
      data: { active: false }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Integration deletion error:', error);
    return NextResponse.json(
      { error: 'Failed to remove integration' },
      { status: 500 }
    );
  }
}